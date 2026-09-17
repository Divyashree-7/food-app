import React, { useState } from 'react';
import {
  Store as StoreIcon,
  Bell,
  Clock,
  CheckCircle2,
  DollarSign,
  Edit3,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  ChefHat,
  Save,
  Languages,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

export const VendorApp: React.FC = () => {
  const {
    language,
    t,
    stores,
    products,
    orders,
    updateOrderStatus,
    refreshData,
    showToast,
  } = useApp();

  const [selectedStoreId, setSelectedStoreId] = useState<string>('s01');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number>(20);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editNameHi, setEditNameHi] = useState<string>('');
  const [editDescHi, setEditDescHi] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const activeStore = stores.find((s) => s.id === selectedStoreId) || stores[0];
  const storeProducts = products.filter((p) => p.store_id === activeStore?.id);

  // Orders for this store
  const storeOrders = orders.filter((o) => o.store_id === activeStore?.id);
  const incomingOrders = storeOrders.filter((o) => o.order_status === 'placed');
  const preparingOrders = storeOrders.filter(
    (o) => o.order_status === 'accepted' || o.order_status === 'preparing'
  );

  const totalSales = storeOrders.reduce((sum, o) => sum + o.items_total, 0);

  // Toggle stock availability
  const handleToggleStock = async (product: Product) => {
    try {
      const res = await fetch('/api/external-sync/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'stock_toggle',
          productLegacyId: product.legacy_id,
          inStock: !product.is_available,
        }),
      });
      if (res.ok) {
        showToast(
          product.is_available
            ? `${product.name_en} marked OUT OF STOCK`
            : `${product.name_en} marked IN STOCK`
        );
        refreshData();
      }
    } catch (e) {
      showToast('Error toggling availability');
    }
  };

  // Save price & Hindi translation
  const handleSaveProductEdit = async () => {
    if (!editingProduct) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/translations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'product',
          id: editingProduct.id,
          name_hi: editNameHi,
          description_hi: editDescHi,
        }),
      });
      // Also update price via webhook if changed
      if (editPrice !== editingProduct.price) {
        await fetch('/api/external-sync/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'price_override',
            productLegacyId: editingProduct.legacy_id,
            price: editPrice,
          }),
        });
      }

      if (res.ok) {
        showToast('Menu item & Hindi translations updated live!');
        setEditingProduct(null);
        refreshData();
      }
    } catch (e) {
      showToast('Error saving changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
      {/* 1. VENDOR TOP HEADER */}
      <header className="bg-neutral-950 px-4 sm:px-6 py-4 border-b border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {language === 'hi' ? activeStore?.name_hi : activeStore?.name_en}
            </h2>
            <p className="text-xs text-neutral-400">{activeStore?.address}</p>
          </div>
        </div>

        {/* Store Switcher for Demo Purposes */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-neutral-400 font-semibold">
            {language === 'hi' ? 'विक्रेता चुनें:' : 'Select Merchant:'}
          </label>
          <select
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="bg-neutral-900 border border-neutral-700 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name_en} ({s.type === 'restaurant' ? 'Food' : 'Grocery'})
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* 2. STATS BAR */}
      <div className="grid grid-cols-3 gap-2 p-3 sm:p-4 bg-neutral-950/60 border-b border-neutral-800 text-center">
        <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
          <p className="text-[11px] text-neutral-400">{t('vendor.todaySales')}</p>
          <p className="text-base sm:text-lg font-black text-emerald-400">₹{totalSales}</p>
        </div>
        <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
          <p className="text-[11px] text-neutral-400">{t('vendor.ordersCount')}</p>
          <p className="text-base sm:text-lg font-black text-white">{storeOrders.length}</p>
        </div>
        <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
          <p className="text-[11px] text-neutral-400">
            {language === 'hi' ? 'कैटलॉग सिंक' : 'Catalog Sync'}
          </p>
          <p className="text-xs font-bold text-rose-400 mt-1">Live Webhook Synced</p>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: ORDERS QUEUE & MENU MANAGER */}
      <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
        {/* INCOMING & ACTIVE ORDERS SECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-rose-500" />
              <span>{t('vendor.incomingOrders')}</span>
              <span className="text-xs bg-rose-600 text-white px-2 py-0.5 rounded-full font-black">
                {incomingOrders.length + preparingOrders.length}
              </span>
            </h3>
          </div>

          {incomingOrders.length === 0 && preparingOrders.length === 0 ? (
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 text-center text-xs text-neutral-400">
              {language === 'hi'
                ? 'इस समय कोई नया आर्डर नहीं है। ग्राहक ऐप से आर्डर दर्ज करें।'
                : 'No pending orders for this store. Place an order in the Customer App to test live queue!'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Incoming Orders */}
              {incomingOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-neutral-950 border-2 border-rose-600/70 rounded-2xl p-4 space-y-3 shadow-xl animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded uppercase">
                        NEW INCOMING
                      </span>
                      <h4 className="font-bold text-white text-base mt-1">#{ord.order_number}</h4>
                    </div>
                    <span className="text-rose-400 font-mono font-bold text-sm">
                      ₹{ord.grand_total}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="bg-neutral-900/90 rounded-xl p-2.5 space-y-1 text-xs text-neutral-300">
                    {ord.items.map((i) => (
                      <div key={i.product_id} className="flex justify-between">
                        <span>
                          {i.quantity}x {language === 'hi' ? i.name_hi : i.name_en}
                        </span>
                        <span>₹{i.subtotal}</span>
                      </div>
                    ))}
                  </div>

                  {/* Accept & Set Prep Time */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span>{language === 'hi' ? 'तैयारी का समय:' : 'Prep Time:'}</span>
                      <span className="font-bold text-white">{prepTimeMinutes} mins</span>
                    </div>
                    <div className="flex gap-2">
                      {[15, 20, 30].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => setPrepTimeMinutes(mins)}
                          className={`flex-1 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                            prepTimeMinutes === mins
                              ? 'bg-neutral-800 border-rose-500 text-rose-400'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => updateOrderStatus(ord.id, 'accepted')}
                      className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow cursor-pointer"
                    >
                      {t('vendor.acceptAndSetPrep')}
                    </button>
                  </div>
                </div>
              ))}

              {/* Preparing Orders */}
              {preparingOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded uppercase">
                        {ord.order_status === 'accepted' ? 'PREPARING' : 'COOKING'}
                      </span>
                      <h4 className="font-bold text-white text-base mt-1">#{ord.order_number}</h4>
                    </div>
                    <span className="text-neutral-300 font-mono text-xs">
                      {ord.items.length} items
                    </span>
                  </div>

                  <div className="bg-neutral-900/60 rounded-xl p-2.5 space-y-1 text-xs text-neutral-300">
                    {ord.items.map((i) => (
                      <div key={i.product_id} className="flex justify-between">
                        <span>
                          {i.quantity}x {language === 'hi' ? i.name_hi : i.name_en}
                        </span>
                        <span>₹{i.subtotal}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => updateOrderStatus(ord.id, 'ready')}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow cursor-pointer"
                  >
                    {t('vendor.markReady')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MENU & INVENTORY MANAGEMENT */}
        <div className="space-y-3 pt-4 border-t border-neutral-800">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <StoreIcon className="w-4 h-4 text-rose-500" />
              <span>{t('vendor.menuInventory')}</span>
              <span className="text-xs text-neutral-500 font-normal">
                ({storeProducts.length} items)
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {storeProducts.map((p) => (
              <div
                key={p.id}
                className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-neutral-700 transition"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white">{p.name_en}</h4>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        p.is_available
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {p.is_available ? t('common.inStock') : t('common.outOfStock')}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 font-serif">{p.name_hi}</p>
                  <p className="text-xs font-mono font-bold text-rose-400">
                    ₹{p.discounted_price || p.price}{' '}
                    <span className="text-neutral-500 font-sans font-normal">/ {p.unit}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Edit Hindi / Price Button */}
                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setEditPrice(p.price);
                      setEditNameHi(p.name_hi);
                      setEditDescHi(p.description_hi);
                    }}
                    className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl border border-neutral-800 cursor-pointer"
                    title={t('vendor.editHindiTranslation')}
                  >
                    <Edit3 className="w-4 h-4 text-amber-400" />
                  </button>

                  {/* In Stock Toggle */}
                  <button
                    onClick={() => handleToggleStock(p)}
                    className="p-2 bg-neutral-900 hover:bg-neutral-800 rounded-xl border border-neutral-800 cursor-pointer"
                    title={t('vendor.stockToggle')}
                  >
                    {p.is_available ? (
                      <ToggleRight className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-rose-500" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EDIT MODAL FOR HINDI TRANSLATION & PRICE */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Languages className="w-4 h-4 text-rose-500" />
                <span>{editingProduct.name_en}</span>
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 font-bold block mb-1">
                  Price in Gulbarga Catalog (₹)
                </label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1">
                  Hindi Product Name (हिंदी नाम)
                </label>
                <input
                  type="text"
                  value={editNameHi}
                  onChange={(e) => setEditNameHi(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1">
                  Hindi Description (हिंदी विवरण)
                </label>
                <textarea
                  value={editDescHi}
                  onChange={(e) => setEditDescHi(e.target.value)}
                  rows={3}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white resize-none"
                />
              </div>

              <button
                onClick={handleSaveProductEdit}
                disabled={isSaving}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? t('common.loading') : t('common.save')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
