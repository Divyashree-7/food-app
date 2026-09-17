import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  AppLanguage,
  ActiveInterface,
  Store,
  Product,
  CartItem,
  Order,
  AppUser,
} from '../types';
import enLocale from '../locales/en.json';
import hiLocale from '../locales/hi.json';

interface AppContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (keyPath: string) => string;
  activeInterface: ActiveInterface;
  setActiveInterface: (ui: ActiveInterface) => void;
  socketConnected: boolean;
  currentUser: AppUser | null;
  setCurrentUser: (user: AppUser | null) => void;
  sessionToken: string | null;
  setSessionToken: (token: string | null) => void;
  stores: Store[];
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product, quantityDelta?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  orders: Order[];
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  refreshData: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['order_status']) => Promise<void>;
  simulateExternalWebhook: (payload: any) => Promise<void>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    return (localStorage.getItem('gulbarga_lang') as AppLanguage) || 'en';
  });

  const [activeInterface, setActiveInterface] = useState<ActiveInterface>('customer');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  // Default demo customer user
  const [currentUser, setCurrentUser] = useState<AppUser | null>({
    id: 'u_cust_1',
    name: 'Rahul Patil',
    phone: '9876543210',
    role: 'customer',
    preferred_language: 'en',
    is_blocked: false,
  });

  const [sessionToken, setSessionToken] = useState<string | null>('sess_token_demo_customer');
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('gulbarga_lang', lang);
  };

  // Translation resolver helper (e.g. "customer.foodTab" or "common.save")
  const t = (keyPath: string): string => {
    const localeObj = language === 'hi' ? hiLocale : enLocale;
    const parts = keyPath.split('.');
    let cur: any = localeObj;
    for (const p of parts) {
      if (cur && typeof cur === 'object' && p in cur) {
        cur = cur[p];
      } else {
        return keyPath; // fallback
      }
    }
    return typeof cur === 'string' ? cur : keyPath;
  };

  // Fetch data from backend
  const refreshData = async () => {
    try {
      const [resStores, resProducts, resOrders] = await Promise.all([
        fetch('/api/stores'),
        fetch('/api/products'),
        fetch('/api/orders'),
      ]);

      if (resStores.ok) {
        const data = await resStores.json();
        setStores(data);
      }
      if (resProducts.ok) {
        const data = await resProducts.json();
        setProducts(data);
      }
      if (resOrders.ok) {
        const data: Order[] = await resOrders.json();
        setOrders(data);
        if (data.length > 0 && !activeOrder) {
          // Default to latest active or out_for_delivery order
          const active = data.find((o) => o.order_status !== 'delivered') || data[0];
          setActiveOrder(active);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // Setup Socket.io client
  useEffect(() => {
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setSocketConnected(true);
      newSocket.emit('join_driver');
      newSocket.emit('join_admin');
    });

    newSocket.on('disconnect', () => {
      setSocketConnected(false);
    });

    // Real-time catalog updates from external webhooks
    newSocket.on('catalog_update', (data: any) => {
      if (data.type === 'product') {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === data.productId || p.legacy_id === data.legacyId
              ? { ...p, price: data.price, is_available: data.isAvailable, stock_quantity: data.stockQuantity }
              : p
          )
        );
        showToast(
          language === 'hi'
            ? 'लाइव कैटलॉग अपडेट: मूल्य या उपलब्धता में परिवर्तन हुआ।'
            : 'Live Catalog Update: Prices or stock updated via external source.'
        );
      }
    });

    // Real-time order status updates
    newSocket.on('order_status_update', (data: any) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === data.orderId ? { ...o, order_status: data.status } : o))
      );
      setActiveOrder((prev) => (prev && prev.id === data.orderId ? { ...prev, order_status: data.status } : prev));
      showToast(`Order status updated to: ${data.status}`);
    });

    // Real-time driver location updates
    newSocket.on('driver_location_update', (data: any) => {
      setActiveOrder((prev) => {
        if (prev && prev.id === data.orderId) {
          return {
            ...prev,
            driver_lat: data.lat,
            driver_lng: data.lng,
          };
        }
        return prev;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [language]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, []);

  // Join order room when active order changes
  useEffect(() => {
    if (socket && activeOrder) {
      socket.emit('join_order', activeOrder.id);
    }
  }, [socket, activeOrder?.id]);

  const addToCart = (product: Product, quantityDelta: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantityDelta;
        if (newQty <= 0) {
          return prev.filter((item) => item.product.id !== product.id);
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else if (quantityDelta > 0) {
        return [...prev, { product, quantity: quantityDelta }];
      }
      return prev;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateOrderStatus = async (orderId: string, status: Order['order_status']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, order_status: status } : o))
        );
        if (activeOrder?.id === orderId) {
          setActiveOrder((prev) => (prev ? { ...prev, order_status: status } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const simulateExternalWebhook = async (payload: any) => {
    try {
      const res = await fetch('/api/external-sync/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast('Webhook sent! Real-time catalog broadcast triggered.');
        await refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        activeInterface,
        setActiveInterface,
        socketConnected,
        currentUser,
        setCurrentUser,
        sessionToken,
        setSessionToken,
        stores,
        products,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        orders,
        activeOrder,
        setActiveOrder,
        refreshData,
        updateOrderStatus,
        simulateExternalWebhook,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
