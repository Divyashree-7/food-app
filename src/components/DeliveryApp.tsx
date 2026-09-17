import React, { useState, useEffect } from 'react';
import {
  Bike,
  Navigation,
  CheckCircle2,
  Phone,
  Power,
  Clock,
  Compass,
  DollarSign,
  AlertTriangle,
  KeyRound,
  Radio,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LiveMap } from './LiveMap';

export const DeliveryApp: React.FC = () => {
  const { language, t, orders, refreshData, showToast } = useApp();

  const [isOnline, setIsOnline] = useState(true);
  const [activeDriverOrder, setActiveDriverOrder] = useState<any>(null);
  const [customerOtpInput, setCustomerOtpInput] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [gpsIntervalActive, setGpsIntervalActive] = useState(true);
  const [currentLat, setCurrentLat] = useState(17.334);
  const [currentLng, setCurrentLng] = useState(76.840);
  const [earnings, setEarnings] = useState(795);
  const [deliveriesCount, setDeliveriesCount] = useState(15);

  // Sync active order assigned to driver
  useEffect(() => {
    const ongoing = orders.find(
      (o) => o.order_status !== 'delivered' && o.order_status !== 'cancelled'
    );
    setActiveDriverOrder(ongoing || null);
  }, [orders]);

  // Simulated GPS ping broadcaster to backend every 4 seconds
  useEffect(() => {
    if (!isOnline || !activeDriverOrder || !gpsIntervalActive) return;

    const interval = setInterval(async () => {
      // Small simulated coordinate progression towards customer
      setCurrentLat((lat) => lat - 0.0003);
      setCurrentLng((lng) => lng + 0.0004);

      try {
        await fetch('/api/driver/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: activeDriverOrder.id,
            lat: currentLat,
            lng: currentLng,
          }),
        });
      } catch (err) {
        // silent
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isOnline, activeDriverOrder?.id, gpsIntervalActive, currentLat, currentLng]);

  // Update order status
  const handleUpdateStatus = async (status: string) => {
    if (!activeDriverOrder) return;
    try {
      const res = await fetch(`/api/orders/${activeDriverOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(
          language === 'hi'
            ? `आर्डर स्थिति अपडेट: ${status}`
            : `Order status updated to ${status}`
        );
        refreshData();
      }
    } catch (e) {
      showToast('Status update failed');
    }
  };

  // Complete delivery with Customer Handover OTP verification
  const handleVerifyDelivery = async () => {
    if (!activeDriverOrder) return;
    setIsVerifyingOtp(true);
    try {
      const res = await fetch(`/api/orders/${activeDriverOrder.id}/verify-delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: customerOtpInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setEarnings((e) => e + 55);
        setDeliveriesCount((c) => c + 1);
        setCustomerOtpInput('');
        showToast(
          language === 'hi'
            ? 'डिलीवरी सफलतापूर्वक पूर्ण हुई! ₹55 वॉलेट में जोड़े गए।'
            : 'Delivery completed successfully! ₹55 added to wallet.'
        );
        refreshData();
      } else {
        showToast(data.error || 'Invalid Customer Handover OTP');
      }
    } catch (e) {
      showToast('Delivery verification error');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
      {/* 1. DRIVER HEADER */}
      <header className="bg-neutral-950 px-4 sm:px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Vijay Kumar</span>
              <span className="text-xs font-normal text-neutral-400">KA-32-EA-4521</span>
            </h2>
            <p className="text-xs text-neutral-400">
              {language === 'hi' ? 'गुलबर्ga सेंट्रल हब' : 'Gulbarga Central Fleet Hub'}
            </p>
          </div>
        </div>

        {/* Online / Offline Switch */}
        <button
          onClick={() => {
            setIsOnline(!isOnline);
            showToast(isOnline ? 'You are now OFFLINE' : 'You are now ONLINE');
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
            isOnline
              ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
              : 'bg-neutral-950 border-neutral-700 text-neutral-400'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{isOnline ? t('delivery.online') : t('delivery.offline')}</span>
        </button>
      </header>

      {/* 2. DRIVER METRICS BAR */}
      <div className="grid grid-cols-3 gap-2 p-3 sm:p-4 bg-neutral-950/60 border-b border-neutral-800 text-center">
        <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
          <p className="text-[11px] text-neutral-400">{t('delivery.todayEarnings')}</p>
          <p className="text-base sm:text-lg font-black text-emerald-400">₹{earnings}</p>
        </div>
        <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
          <p className="text-[11px] text-neutral-400">{t('delivery.deliveriesCompleted')}</p>
          <p className="text-base sm:text-lg font-black text-white">{deliveriesCount}</p>
        </div>
        <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
          <p className="text-[11px] text-neutral-400">
            {language === 'hi' ? 'लाइव जीपीएस स्थिति' : 'Live GPS Broadcast'}
          </p>
          <p className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1 mt-1">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>{gpsIntervalActive ? '3s Sync' : 'Paused'}</span>
          </p>
        </div>
      </div>

      {/* 3. MAIN DELIVERY CONTENT */}
      <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
        {activeDriverOrder ? (
          /* ACTIVE TASK CARD */
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
              <div>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded uppercase">
                  {language === 'hi' ? 'सक्रिय डिलीवरी कार्य' : 'Active Delivery Task'}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  #{activeDriverOrder.order_number} • ₹55 Payout
                </h3>
              </div>
              <span className="text-xs font-mono bg-neutral-900 text-amber-400 px-2.5 py-1 rounded-lg border border-neutral-800">
                {activeDriverOrder.order_status.toUpperCase()}
              </span>
            </div>

            {/* Pickup & Drop Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 space-y-1">
                <span className="text-neutral-400 font-bold uppercase tracking-wider block text-[10px]">
                  {t('delivery.pickupFrom')}
                </span>
                <p className="font-bold text-white text-sm">{activeDriverOrder.store_name}</p>
                <p className="text-neutral-400">Sedam Road, Central Bus Stand, Gulbarga</p>
              </div>

              <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 space-y-1">
                <span className="text-neutral-400 font-bold uppercase tracking-wider block text-[10px]">
                  {t('delivery.deliverTo')}
                </span>
                <p className="font-bold text-white text-sm">
                  {activeDriverOrder.delivery_address.full_address}
                </p>
                <p className="text-neutral-400">{activeDriverOrder.delivery_address.landmark}</p>
              </div>
            </div>

            {/* Live Navigation Map */}
            <LiveMap
              storeName={activeDriverOrder.store_name}
              customerAddress={activeDriverOrder.delivery_address.full_address}
              driverLat={currentLat}
              driverLng={currentLng}
              orderStatus={activeDriverOrder.order_status}
              onSimulateStep={() => {
                setCurrentLat((l) => l - 0.001);
                setCurrentLng((lg) => lg + 0.001);
                showToast('Rider position updated!');
              }}
              language={language}
            />

            {/* ACTION BUTTONS BASED ON STATUS */}
            <div className="pt-2 space-y-3">
              {activeDriverOrder.order_status !== 'picked_up' &&
                activeDriverOrder.order_status !== 'out_for_delivery' && (
                  <button
                    onClick={() => handleUpdateStatus('picked_up')}
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-xl cursor-pointer"
                  >
                    {t('delivery.markPickedUp')}
                  </button>
                )}

              {activeDriverOrder.order_status === 'picked_up' && (
                <button
                  onClick={() => handleUpdateStatus('out_for_delivery')}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-xl cursor-pointer"
                >
                  {language === 'hi'
                    ? 'ग्राहक की ओर प्रस्थान करें (Out for Delivery)'
                    : 'Dispatch towards Customer (Out for Delivery)'}
                </button>
              )}

              {activeDriverOrder.order_status === 'out_for_delivery' && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                    <KeyRound className="w-4 h-4" />
                    <span>{t('delivery.enterCustomerOtp')}</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customerOtpInput}
                      onChange={(e) => setCustomerOtpInput(e.target.value)}
                      placeholder={
                        language === 'hi'
                          ? 'ग्राहक से 4-अंकीय ओटीपी पूछें'
                          : 'Ask customer for 4-digit OTP (e.g. 5421)'
                      }
                      className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                    />
                    <button
                      onClick={handleVerifyDelivery}
                      disabled={isVerifyingOtp || !customerOtpInput}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      {isVerifyingOtp ? t('common.loading') : t('delivery.confirmDelivered')}
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {language === 'hi'
                      ? 'डेमो के लिए ग्राहक ऐप से ओटीपी देखें या सीधा सत्यापित करें।'
                      : 'Tip: Check Customer App for the handover OTP badge.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* NO ACTIVE ORDER IDLE STATE */
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 mx-auto">
              <Bike className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'hi' ? 'नए आर्डर की प्रतीक्षा जारी' : 'Waiting for Next Delivery Order'}
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
                {language === 'hi'
                  ? 'आप सेडम रोड और सेंट्रल बस स्टैंड के निकट सक्रिय हैं। नया आर्डर आते ही ध्वनि के साथ अलर्ट मिलेगा।'
                  : 'You are stationed near Sedam Road & Central Bus Stand. Orders will trigger instant audio & notification alerts.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
