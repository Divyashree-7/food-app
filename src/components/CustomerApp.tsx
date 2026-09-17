import React, { useState } from 'react';
import {
  Utensils,
  ShoppingBag,
  MapPin,
  Search,
  Star,
  Clock,
  ChevronRight,
  Plus,
  Minus,
  ArrowLeft,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Smartphone,
  Tag,
  AlertCircle,
  CreditCard,
  Banknote,
  Sparkles,
  RotateCcw,
  Languages,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Store, Product, ProductVariant } from '../types';
import { LiveMap } from './LiveMap';
import { CustomerBottomNav, CustomerTabType } from './CustomerBottomNav';
import { CustomerWallet } from './CustomerWallet';
import { CustomerChat } from './CustomerChat';
import { CustomerOrdersView } from './CustomerOrdersView';
import { CustomerProfileView } from './CustomerProfileView';

export const CustomerApp: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
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
    currentUser,
    setCurrentUser,
    sessionToken,
    setSessionToken,
    showToast,
  } = useApp();

  // Navigation State inside Customer App
  const [customerTab, setCustomerTab] = useState<CustomerTabType>('home');
  const [activeVertical, setActiveVertical] = useState<'food' | 'grocery'>('food');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Auth / OTP Form State
  const [phoneInput, setPhoneInput] = useState('9876543210');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Address Selector
  const [selectedAddress, setSelectedAddress] = useState({
    full: 'Plot 18, Anand Nagar, Sedam Road, Gulbarga',
    landmark: 'Near Sharanabasaveshwara Temple Arch',
    tag: 'Home',
  });

  // Variant Modal
  const [variantModalProduct, setVariantModalProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Coupon & Payment
  const [couponCode, setCouponCode] = useState('GULBARGA50');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('GULBARGA50');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Filtered stores
  const currentStores = stores.filter((s) => {
    if (s.type !== (activeVertical === 'food' ? 'restaurant' : 'grocery')) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName =
        s.name_en.toLowerCase().includes(q) ||
        s.name_hi.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q);
      if (!matchName) return false;
    }
    return true;
  });

  // Filtered products when viewing a store
  const storeProducts = selectedStore
    ? products.filter((p) => {
        if (p.store_id !== selectedStore.id) return false;
        if (isVegOnly && !p.is_veg) return false;
        if (selectedCategory && p.category_name_en !== selectedCategory) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const match =
            p.name_en.toLowerCase().includes(q) ||
            p.name_hi.toLowerCase().includes(q) ||
            p.description_en.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      })
    : [];

  // Group products by category
  const categoriesInStore = Array.from(
    new Set(storeProducts.map((p) => (language === 'hi' ? p.category_name_hi : p.category_name_en)))
  );

  // Cart calculations
  const itemsTotal = cart.reduce((sum, item) => {
    const price = item.product.discounted_price || item.product.price;
    const delta = item.selectedVariant ? item.selectedVariant.price_delta : 0;
    return sum + (price + delta) * item.quantity;
  }, 0);

  // Intra-city Gulbarga distance-based delivery fee
  const deliveryFee = itemsTotal > 0 ? (activeVertical === 'grocery' ? 25 : 35) : 0;
  const taxes = Math.round(itemsTotal * 0.05 * 100) / 100;
  let discount = 0;
  if (appliedCoupon === 'GULBARGA50' && itemsTotal > 0) {
    discount = Math.min(50, Math.round(itemsTotal * 0.2));
  } else if (appliedCoupon === 'WELCOMEGUR') {
    discount = 75;
  }
  const grandTotal = Math.max(0, itemsTotal + deliveryFee + taxes - discount);

  // Send OTP
  const handleSendOtp = async () => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput, lang: language }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setDevOtpHint(data.devOtp);
        setOtpInput(data.devOtp || '');
        showToast(data.message);
      } else {
        showToast(data.error || 'Failed to send OTP');
      }
    } catch (e) {
      showToast('Network error while sending OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput, otp: otpInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setSessionToken(data.token);
        setIsAuthModalOpen(false);
        setOtpSent(false);
        showToast(language === 'hi' ? 'लॉगिन सफल!' : 'Login Successful!');
      } else {
        showToast(data.error || 'OTP verification failed');
      }
    } catch (e) {
      showToast('Network error verifying OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  // Place Order
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsPlacingOrder(true);

    try {
      const targetStoreId = cart[0].product.store_id;
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          storeId: targetStoreId,
          items: cart.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            selectedVariant: i.selectedVariant?.id,
          })),
          deliveryAddress: {
            full_address: selectedAddress.full,
            landmark: selectedAddress.landmark,
            latitude: 17.336,
            longitude: 76.845,
            city: 'Gulbarga',
          },
          paymentMethod,
          couponCode: appliedCoupon,
        }),
      });

      if (res.ok) {
        const newOrder = await res.json();
        setActiveOrder(newOrder);
        clearCart();
        setIsCartOpen(false);
        setIsTrackingOpen(true);
        showToast(
          language === 'hi'
            ? 'आर्डर सफलतापूर्वक दर्ज हुआ! लाइव ट्रैकिंग शुरू।'
            : 'Order Placed! Live delivery tracking active.'
        );
        refreshData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to place order');
      }
    } catch (err) {
      showToast('Error placing order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Advance simulated rider GPS position
  const handleSimulateRiderStep = async () => {
    if (!activeOrder) return;
    // Step forward along Sedam Road to Anand Nagar
    const newLat = (activeOrder.driver_lat || 17.334) - 0.0012;
    const newLng = (activeOrder.driver_lng || 76.84) + 0.0015;

    try {
      await fetch('/api/driver/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeOrder.id,
          lat: newLat,
          lng: newLng,
        }),
      });
      setActiveOrder({
        ...activeOrder,
        driver_lat: newLat,
        driver_lng: newLng,
      });
      showToast('Rider GPS location broadcasted live to Gulbarga Hub!');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[720px]">
      {/* 1. TOP HEADER / APP BAR */}
      <header className="bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
        {selectedStore ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedStore(null)}
              className="p-2 -ml-1 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                {language === 'hi' ? selectedStore.name_hi : selectedStore.name_en}
              </h1>
              <p className="text-xs text-neutral-400 line-clamp-1">{selectedStore.address}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  {selectedAddress.tag}
                </span>
                <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">
                  Gulbarga
                </span>
              </div>
              <p className="text-xs font-semibold text-neutral-200 line-clamp-1 max-w-[200px] sm:max-w-[340px]">
                {selectedAddress.full}
              </p>
            </div>
          </div>
        )}

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          {/* Active order quick banner button if tracking */}
          {activeOrder && activeOrder.order_status !== 'delivered' && (
            <button
              onClick={() => setCustomerTab('orders')}
              className="hidden sm:flex items-center gap-1.5 bg-[#f9531e]/20 border border-[#f9531e]/40 text-[#f9531e] text-xs font-semibold px-2.5 py-1.5 rounded-full hover:bg-[#f9531e]/30 transition cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#f9531e] animate-ping" />
              <span>{language === 'hi' ? 'लाइव आर्डर' : 'Live Order'}</span>
            </button>
          )}

          {/* Language Switch */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 bg-neutral-800/80 hover:bg-neutral-700 text-xs text-neutral-200 px-2.5 py-1.5 rounded-lg border border-neutral-700 transition cursor-pointer"
            title="Toggle Language / भाषा बदलें"
          >
            <Languages className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-bold">{language === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Cart Icon Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-200 border border-neutral-700 transition cursor-pointer"
            title="Cart"
          >
            <ShoppingBag className="w-5 h-5 text-rose-400" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#f9531e] text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-neutral-900">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>

          {/* User Profile / Login */}
          <button
            onClick={() => {
              if (!currentUser) setIsAuthModalOpen(true);
              else setCustomerTab('profile');
            }}
            className="w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 flex items-center justify-center text-neutral-200 font-bold text-xs transition cursor-pointer"
          >
            {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : '👤'}
          </button>
        </div>
      </header>

      {/* 2. MAIN APP CONTENT */}
      <main className="flex-1 overflow-y-auto pb-4">
        {customerTab === 'home' && (
          !selectedStore ? (
          /* HOME SCREEN VIEW */
          <div className="p-4 sm:p-6 space-y-6">
            {/* TWO VERTICALS: FOOD vs GROCERY TABS */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-neutral-950 rounded-2xl border border-neutral-800">
              <button
                onClick={() => {
                  setActiveVertical('food');
                  setSelectedCategory(null);
                }}
                className={`flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-sm sm:text-base transition-all cursor-pointer ${
                  activeVertical === 'food'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Utensils className="w-5 h-5" />
                <span>{t('customer.foodTab')}</span>
              </button>

              <button
                onClick={() => {
                  setActiveVertical('grocery');
                  setSelectedCategory(null);
                }}
                className={`flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-sm sm:text-base transition-all cursor-pointer ${
                  activeVertical === 'grocery'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{t('customer.groceryTab')}</span>
              </button>
            </div>

            {/* SEARCH BAR */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeVertical === 'food'
                    ? language === 'hi'
                      ? 'गुलबर्गा मटन तहरी, दम बिरयानी, जोलद रोट्टी खोजें...'
                      : 'Search Gulbarga Mutton Tahari, Dum Biryani, Jolada Rotti...'
                    : language === 'hi'
                    ? 'गुलबर्गा जीआई तूर दाल, आटा, नंदिनी दूध, मसाले खोजें...'
                    : 'Search Gulbarga GI Toor Dal, Atta, Nandini Milk, Spices...'
                }
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition"
              />
            </div>

            {/* PROMO HERO BANNER */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-rose-950 via-neutral-900 to-amber-950/70 border border-rose-900/40 p-4 sm:p-5 shadow-lg flex items-center justify-between">
              <div className="space-y-1.5 max-w-md">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-500 text-white uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  {language === 'hi' ? 'विशेष गुलबर्गा ऑफर' : 'Special Gulbarga Offer'}
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  {language === 'hi'
                    ? 'गुलबर्गा की प्रसिद्ध तहरी और मंडी किराना पर ₹50 की छूट'
                    : 'Flat ₹50 OFF on Famous Tahari & GI Toor Dal'}
                </h2>
                <p className="text-xs text-neutral-300">
                  {language === 'hi'
                    ? 'चेकआउट पर कोड GULBARGA50 का उपयोग करें। कोई न्यूनतम आर्डर नहीं।'
                    : 'Use code GULBARGA50 at checkout. Fast 20-minute intra-city delivery.'}
                </p>
              </div>
              <div className="hidden sm:block text-right">
                <span className="font-mono text-2xl font-black text-rose-400">20% OFF</span>
              </div>
            </div>

            {/* CATEGORY CHIPS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-300">
                  {activeVertical === 'food'
                    ? t('customer.exploreGulbargaSpecials')
                    : t('customer.instantKirana')}
                </h3>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition cursor-pointer ${
                    selectedCategory === null
                      ? 'bg-neutral-100 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {language === 'hi' ? 'सभी श्रेणियां' : 'All Categories'}
                </button>
                {(activeVertical === 'food'
                  ? [
                      { en: 'Gulbarga Specials', hi: 'गुलबर्गा स्पेशल' },
                      { en: 'North Karnataka Veg', hi: 'उत्तर कर्नाटक शाकाहारी' },
                      { en: 'Biryani & Kebabs', hi: 'बिरयानी और कबाब' },
                    ]
                  : [
                      { en: 'Atta, Rice & Dal', hi: 'आटा, चावल और दाल' },
                      { en: 'Edible Oils & Ghee', hi: 'खाने का तेल और घी' },
                      { en: 'Dairy, Milk & Bread', hi: 'डेयरी, दूध और ब्रेड' },
                      { en: 'Fresh Farm Vegetables', hi: 'ताजी सब्जियां' },
                      { en: 'Spices & Masalas', hi: 'मसाले और तड़का' },
                    ]
                ).map((cat) => (
                  <button
                    key={cat.en}
                    onClick={() =>
                      setSelectedCategory(selectedCategory === cat.en ? null : cat.en)
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition cursor-pointer ${
                      selectedCategory === cat.en
                        ? 'bg-rose-500 text-white'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {language === 'hi' ? cat.hi : cat.en}
                  </button>
                ))}
              </div>
            </div>

            {/* STORES LIST */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">
                  {activeVertical === 'food'
                    ? t('customer.popularRestaurants')
                    : language === 'hi'
                    ? 'गुलबर्गा के सत्यापित किराना और सुपरमार्ट्स'
                    : 'Verified Kirana & Supermarkets in Gulbarga'}
                </h3>
                <span className="text-xs text-neutral-500 font-medium">
                  {currentStores.length} {language === 'hi' ? 'दुकानें खुली हैं' : 'stores open'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentStores.map((store) => (
                  <div
                    key={store.id}
                    onClick={() => setSelectedStore(store)}
                    className="group bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex flex-col"
                  >
                    {/* Store Cover Photo */}
                    <div className="relative h-40 w-full overflow-hidden bg-neutral-800">
                      <img
                        src={store.cover_image_url}
                        alt={store.name_en}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30" />

                      {/* Store Rating & Prep Badge */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                        <span className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {store.avg_rating} ({store.total_ratings})
                        </span>
                        <span className="flex items-center gap-1 bg-neutral-900/90 text-neutral-200 text-xs font-semibold px-2 py-0.5 rounded-md backdrop-blur-md">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {store.avg_prep_time_minutes} {t('common.mins')}
                        </span>
                      </div>
                    </div>

                    {/* Store Info */}
                    <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-base font-bold text-white group-hover:text-rose-400 transition">
                          {language === 'hi' ? store.name_hi : store.name_en}
                        </h4>
                        <p className="text-xs text-neutral-400 line-clamp-1">
                          {language === 'hi' ? store.description_hi : store.description_en}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-xs text-neutral-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                          {store.address.split(',')[0]}
                        </span>
                        <span className="font-semibold text-neutral-300">
                          {t('customer.minOrder')} ₹{store.min_order_value}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* STORE DETAIL VIEW */
          <div className="p-4 sm:p-6 space-y-6">
            {/* Store Banner Card */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-rose-500/20 text-rose-300 text-[11px] font-bold px-2 py-0.5 rounded border border-rose-500/30">
                    {selectedStore.category}
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    {language === 'hi' ? 'ऑर्डर स्वीकार किए जा रहे हैं' : 'Accepting Orders'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {language === 'hi' ? selectedStore.name_hi : selectedStore.name_en}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400">
                  {language === 'hi' ? selectedStore.description_hi : selectedStore.description_en}
                </p>
                <p className="text-xs text-neutral-500 flex items-center gap-1 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {selectedStore.address}
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                <div className="flex items-center gap-1 bg-emerald-600/90 text-white font-bold text-sm px-3 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{selectedStore.avg_rating}</span>
                </div>
                <span className="text-xs text-neutral-400">
                  {selectedStore.avg_prep_time_minutes} {t('common.mins')} • 3.2 {t('common.km')}
                </span>
              </div>
            </div>

            {/* Veg / Non-Veg Toggle Filter */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsVegOnly(!isVegOnly)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                  isVegOnly
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="w-3.5 h-3.5 border-2 border-emerald-500 rounded-sm flex items-center justify-center p-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
                <span>{t('customer.pureVeg')}</span>
              </button>
            </div>

            {/* Menu Items Grouped by Category */}
            <div className="space-y-6">
              {categoriesInStore.map((catName) => {
                const itemsInCat = storeProducts.filter((p) =>
                  language === 'hi' ? p.category_name_hi === catName : p.category_name_en === catName
                );

                if (itemsInCat.length === 0) return null;

                return (
                  <div key={catName} className="space-y-3">
                    <h3 className="text-base font-bold text-neutral-200 flex items-center gap-2">
                      <span>{catName}</span>
                      <span className="text-xs text-neutral-500 font-normal">
                        ({itemsInCat.length})
                      </span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {itemsInCat.map((product) => {
                        const cartItem = cart.find((i) => i.product.id === product.id);
                        const quantity = cartItem?.quantity || 0;

                        return (
                          <div
                            key={product.id}
                            className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 flex gap-3 justify-between hover:border-neutral-700 transition"
                          >
                            <div className="space-y-1.5 flex-1">
                              {/* Veg / Non-Veg Symbol */}
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-3.5 h-3.5 border-2 rounded-sm flex items-center justify-center p-0.5 ${
                                    product.is_veg
                                      ? 'border-emerald-500 text-emerald-500'
                                      : 'border-rose-500 text-rose-500'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      product.is_veg ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`}
                                  />
                                </span>
                                {product.variants && product.variants.length > 0 && (
                                  <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                                    {t('customer.customisable')}
                                  </span>
                                )}
                                {selectedStore.type === 'grocery' && (
                                  <span className="text-[10px] text-neutral-400 font-medium bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                                    {product.unit} • {language === 'hi' ? 'स्टॉक:' : 'Stock:'}{' '}
                                    {product.stock_quantity}
                                  </span>
                                )}
                              </div>

                              <h4 className="text-sm font-bold text-white">
                                {language === 'hi' ? product.name_hi : product.name_en}
                              </h4>

                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-rose-400">
                                  ₹{product.discounted_price || product.price}
                                </span>
                                {product.discounted_price && (
                                  <span className="text-xs line-through text-neutral-500">
                                    ₹{product.price}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-neutral-400 line-clamp-2">
                                {language === 'hi'
                                  ? product.description_hi
                                  : product.description_en}
                              </p>
                            </div>

                            {/* Image & Add Button */}
                            <div className="flex flex-col items-center justify-between shrink-0 w-24">
                              <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-800">
                                <img
                                  src={product.image_url}
                                  alt={product.name_en}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>

                              {/* Add / Stepper Button */}
                              {quantity === 0 ? (
                                <button
                                  onClick={() => {
                                    if (product.variants && product.variants.length > 0) {
                                      setVariantModalProduct(product);
                                      setSelectedVariant(product.variants[0]);
                                    } else {
                                      addToCart(product, 1);
                                    }
                                  }}
                                  disabled={!product.is_available || product.stock_quantity <= 0}
                                  className="w-20 -mt-3 bg-neutral-900 border border-rose-500 text-rose-400 hover:bg-rose-600 hover:text-white text-xs font-black py-1 rounded-lg shadow-md transition disabled:opacity-50 cursor-pointer"
                                >
                                  {product.is_available && product.stock_quantity > 0
                                    ? t('customer.addToCart')
                                    : t('common.outOfStock')}
                                </button>
                              ) : (
                                <div className="w-20 -mt-3 bg-rose-600 text-white flex items-center justify-between px-1.5 py-1 rounded-lg text-xs font-bold shadow-md">
                                  <button
                                    onClick={() => addToCart(product, -1)}
                                    className="p-0.5 hover:bg-rose-700 rounded cursor-pointer"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span>{quantity}</span>
                                  <button
                                    onClick={() => addToCart(product, 1)}
                                    className="p-0.5 hover:bg-rose-700 rounded cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* 2B. ORDERS SCREEN */}
        {customerTab === 'orders' && (
          <CustomerOrdersView
            onOpenTrackingModal={() => setIsTrackingOpen(true)}
            onSelectStore={(storeId) => {
              const s = stores.find((st) => st.id === storeId);
              if (s) {
                setSelectedStore(s);
                setCustomerTab('home');
              }
            }}
            onSwitchToHome={() => setCustomerTab('home')}
          />
        )}

        {/* 2C. MESSAGES / IN-APP CHAT SCREEN */}
        {customerTab === 'message' && <CustomerChat />}

        {/* 2D. E-WALLET SCREEN */}
        {customerTab === 'wallet' && <CustomerWallet />}

        {/* 2E. USER PROFILE SCREEN */}
        {customerTab === 'profile' && <CustomerProfileView />}
      </main>

      {/* FLOATING CART BAR (IF ITEMS IN BASKET & ON HOME VIEW) */}
      {cart.length > 0 && !isCartOpen && customerTab === 'home' && (
        <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto z-35">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#f9531e] hover:bg-[#e04513] text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between font-bold text-sm transition active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="bg-rose-800 px-2.5 py-1 rounded-lg text-xs">
                {cart.reduce((s, i) => s + i.quantity, 0)} {t('common.items')}
              </span>
              <span>₹{grandTotal}</span>
            </div>
            <div className="flex items-center gap-1 text-xs uppercase tracking-wider">
              <span>{t('common.viewCart')}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* 3. MOBILE BOTTOM NAVIGATION BAR (Home, Orders, Message, E-Wallet, Profile) */}
      <CustomerBottomNav
        activeTab={customerTab}
        onTabChange={(tab) => {
          setCustomerTab(tab);
          if (tab === 'profile' && !currentUser) {
            setIsAuthModalOpen(true);
          }
        }}
        language={language}
        activeOrdersCount={activeOrder && activeOrder.order_status !== 'delivered' ? 1 : 0}
        unreadMessagesCount={1}
      />

      {/* 3. CART & CHECKOUT DRAWER / MODAL */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-neutral-950 border-l border-neutral-800 h-full flex flex-col shadow-2xl overflow-y-auto">
            {/* Cart Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-base text-white">{t('customer.cartTitle')}</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-neutral-400 hover:text-white text-xs font-bold px-2 py-1 bg-neutral-900 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-12 space-y-3 text-neutral-400">
                  <ShoppingBag className="w-12 h-12 mx-auto text-neutral-600" />
                  <p className="text-sm">
                    {language === 'hi' ? 'आपकी टोकरी खाली है' : 'Your basket is empty'}
                  </p>
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="bg-neutral-900/70 border border-neutral-800/80 rounded-xl p-3 flex items-center justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-semibold text-white">
                          {language === 'hi' ? item.product.name_hi : item.product.name_en}
                        </h4>
                        <span className="text-xs text-rose-400 font-bold">
                          ₹{item.product.discounted_price || item.product.price}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 bg-neutral-800 px-2 py-1 rounded-lg">
                        <button
                          onClick={() => addToCart(item.product, -1)}
                          className="text-neutral-300 hover:text-white cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-white px-1">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item.product, 1)}
                          className="text-neutral-300 hover:text-white cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Coupon Box */}
                  <div className="pt-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Coupon Code"
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs uppercase font-mono font-bold text-white"
                      />
                      <button
                        onClick={() => {
                          if (couponCode.toUpperCase() === 'GULBARGA50') {
                            setAppliedCoupon('GULBARGA50');
                            showToast('GULBARGA50 applied! ₹50 Saved.');
                          } else {
                            showToast('Invalid promo code');
                          }
                        }}
                        className="bg-neutral-800 hover:bg-neutral-700 text-rose-400 text-xs font-bold px-3 py-2 rounded-xl border border-neutral-700 cursor-pointer"
                      >
                        {t('customer.applyCoupon')}
                      </button>
                    </div>
                    {appliedCoupon && (
                      <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {appliedCoupon} {language === 'hi' ? 'लागू है' : 'applied successfully'}
                      </p>
                    )}
                  </div>

                  {/* Payment Method Selector */}
                  <div className="pt-2 space-y-2">
                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      {t('customer.paymentMethod')}
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          paymentMethod === 'upi'
                            ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        <Smartphone className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                        <span className="text-[11px] block">UPI</span>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          paymentMethod === 'card'
                            ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 mx-auto mb-1 text-sky-400" />
                        <span className="text-[11px] block">Card</span>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          paymentMethod === 'cod'
                            ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        <Banknote className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                        <span className="text-[11px] block">COD</span>
                      </button>
                    </div>
                  </div>

                  {/* Bill Breakdown */}
                  <div className="pt-3 border-t border-neutral-800 space-y-1.5 text-xs text-neutral-400">
                    <div className="flex justify-between">
                      <span>{t('customer.itemTotal')}</span>
                      <span className="text-neutral-200">₹{itemsTotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('customer.deliveryFee')} (Gulbarga Hub)</span>
                      <span className="text-neutral-200">₹{deliveryFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('customer.taxesAndGst')}</span>
                      <span className="text-neutral-200">₹{taxes}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>{t('customer.discount')}</span>
                        <span>-₹{discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-neutral-800">
                      <span>{t('customer.toPay')}</span>
                      <span className="text-rose-400">₹{grandTotal}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-neutral-800 bg-neutral-950">
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-black text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isPlacingOrder
                      ? t('common.loading')
                      : `${t('customer.checkout')} (₹${grandTotal})`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. LIVE ORDER TRACKING MODAL */}
      {isTrackingOpen && activeOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Tracking Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{t('customer.liveTracking')}</span>
                    <span className="text-xs font-mono text-rose-400 font-bold">
                      #{activeOrder.order_number}
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400">{activeOrder.store_name}</p>
                </div>
              </div>

              <button
                onClick={() => setIsTrackingOpen(false)}
                className="text-neutral-400 hover:text-white p-2 rounded-xl bg-neutral-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tracking Body */}
            <div className="p-4 overflow-y-auto space-y-4">
              {/* Gulbarga SVG Animated Map */}
              <LiveMap
                storeName={activeOrder.store_name}
                customerAddress={activeOrder.delivery_address.full_address}
                driverLat={activeOrder.driver_lat}
                driverLng={activeOrder.driver_lng}
                orderStatus={activeOrder.order_status}
                onSimulateStep={handleSimulateRiderStep}
                language={language}
              />

              {/* Delivery OTP Handover Pill */}
              <div className="bg-rose-950/40 border border-rose-800/50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-rose-300 font-semibold">
                    {t('customer.deliveryOtpText')}
                  </p>
                  <p className="text-2xl font-mono font-black tracking-widest text-white">
                    {activeOrder.delivery_otp}
                  </p>
                </div>
                <span className="text-xs text-neutral-400 text-right">
                  {language === 'hi'
                    ? 'सुरक्षित डिलीवरी के लिए'
                    : 'Required for contactless verification'}
                </span>
              </div>

              {/* Status Stepper */}
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  {language === 'hi' ? 'आर्डर प्रगति' : 'Order Progress'}
                </h4>

                <div className="space-y-2.5">
                  {[
                    { key: 'placed', label: t('customer.orderStatus.placed') },
                    { key: 'accepted', label: t('customer.orderStatus.accepted') },
                    { key: 'preparing', label: t('customer.orderStatus.preparing') },
                    { key: 'picked_up', label: t('customer.orderStatus.picked_up') },
                    { key: 'out_for_delivery', label: t('customer.orderStatus.out_for_delivery') },
                    { key: 'delivered', label: t('customer.orderStatus.delivered') },
                  ].map((step, idx) => {
                    const statusOrder = [
                      'placed',
                      'accepted',
                      'preparing',
                      'ready',
                      'picked_up',
                      'out_for_delivery',
                      'delivered',
                    ];
                    const currentIdx = statusOrder.indexOf(activeOrder.order_status);
                    const stepIdx = statusOrder.indexOf(step.key);
                    const isDone = currentIdx >= stepIdx;
                    const isCurrent = currentIdx === stepIdx;

                    return (
                      <div key={step.key} className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isDone
                              ? 'bg-emerald-500 text-white'
                              : 'bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span
                          className={`text-xs ${
                            isCurrent
                              ? 'text-white font-bold'
                              : isDone
                              ? 'text-neutral-300'
                              : 'text-neutral-600'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Partner Details */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center">
                    VK
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">Vijay Kumar</h5>
                    <p className="text-xs text-neutral-400">
                      Hero Splendor • KA-32-EA-4521 • ★ 4.88
                    </p>
                  </div>
                </div>

                <a
                  href="tel:+919876543212"
                  className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-rose-400 text-xs font-bold px-3 py-2 rounded-xl border border-neutral-700 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t('customer.callPartner')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. PHONE OTP LOGIN MODAL */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-neutral-950 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {language === 'hi' ? 'फोन नंबर से लॉगिन करें' : 'Login with Mobile OTP'}
              </h3>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              {language === 'hi'
                ? 'गुलबर्गा डिलीवरी में आपका स्वागत है। त्वरित 6-अंकीय ओटीपी दर्ज करें।'
                : 'Welcome to Gulbarga Delivery. Instant 60-90s verified OTP flow.'}
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  {t('common.phone')}
                </label>
                <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white">
                  <span className="text-neutral-500 font-bold mr-2">+91</span>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full bg-transparent focus:outline-none"
                    placeholder="98765 43210"
                  />
                </div>
              </div>

              {otpSent && (
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    {t('common.otp')}
                  </label>
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="6-digit OTP"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white font-mono tracking-widest text-center"
                  />
                  {devOtpHint && (
                    <p className="text-[11px] text-amber-400 mt-1">
                      {language === 'hi' ? 'टेस्ट ओटीपी:' : 'Test OTP (Live Redis):'}{' '}
                      <span className="font-mono font-bold">{devOtpHint}</span>
                    </p>
                  )}
                </div>
              )}

              {!otpSent ? (
                <button
                  onClick={handleSendOtp}
                  disabled={authLoading}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer"
                >
                  {authLoading ? t('common.loading') : t('common.sendOtp')}
                </button>
              ) : (
                <button
                  onClick={handleVerifyOtp}
                  disabled={authLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer"
                >
                  {authLoading ? t('common.loading') : t('common.verifyOtp')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. USER PROFILE & LOGGED-IN SESSIONS DRAWER */}
      {isProfileOpen && currentUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-neutral-950 border-l border-neutral-800 h-full p-5 flex flex-col space-y-5 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-base text-white">
                {language === 'hi' ? 'खाता और सत्र प्रबंधन' : 'Profile & Active Sessions'}
              </h3>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="text-neutral-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-1">
              <h4 className="font-bold text-white text-base">{currentUser.name}</h4>
              <p className="text-xs text-neutral-400">+91 {currentUser.phone}</p>
              <span className="inline-block text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded uppercase mt-1">
                {currentUser.role}
              </span>
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                {t('common.selectLanguage')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    language === 'en'
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    language === 'hi'
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>

            {/* Logged in devices management */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                {language === 'hi' ? 'सक्रिय डिवाइस सत्र (लाइव रेडिस)' : 'Logged-in Devices (Live Redis)'}
              </h4>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Chrome on Android (Gulbarga Hub)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                    This Device
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  {language === 'hi'
                    ? 'अंतिम सक्रिय: अभी-अभी • सुरक्षा: JWT + लाइव रेडिस टोकन सत्यापन'
                    : 'Last active: Just now • Secured by live Redis session check'}
                </p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => {
                setCurrentUser(null);
                setSessionToken(null);
                setIsProfileOpen(false);
                showToast(language === 'hi' ? 'सत्र समाप्त' : 'Logged out');
              }}
              className="mt-auto bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-rose-400 py-3 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {t('common.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
