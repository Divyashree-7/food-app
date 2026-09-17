import React from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  Phone,
  RotateCcw,
  Star,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Bike,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LiveMap } from './LiveMap';

interface CustomerOrdersViewProps {
  onOpenTrackingModal: () => void;
  onSelectStore: (storeId: string) => void;
  onSwitchToHome: () => void;
}

export const CustomerOrdersView: React.FC<CustomerOrdersViewProps> = ({
  onOpenTrackingModal,
  onSelectStore,
  onSwitchToHome,
}) => {
  const { language, activeOrder, orders, stores, products, addToCart, showToast } = useApp();

  const handleReorder = (order: typeof orders[0]) => {
    let addedCount = 0;
    order.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.product_id);
      if (prod) {
        addToCart(prod, item.variant_id);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      showToast(
        language === 'hi'
          ? `${addedCount} वस्तुएं फिर से कार्ट में जोड़ दी गईं!`
          : `${addedCount} items re-added to your basket!`
      );
      onSwitchToHome();
    } else {
      showToast(
        language === 'hi'
          ? 'यह वस्तु वर्तमान में उपलब्ध नहीं है'
          : 'Items from this order are currently updating'
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#f9531e]" />
            {language === 'hi' ? 'आपके आर्डर और ट्रैकिंग' : 'Your Orders & Tracking'}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {language === 'hi'
              ? 'सक्रिय डिलीवरी ट्रैक करें और पिछले आर्डर का इतिहास देखें'
              : 'Track active deliveries in Gulbarga & view past order history'}
          </p>
        </div>
      </div>

      {/* Active Order Card */}
      {activeOrder ? (
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-850 border border-neutral-800 rounded-3xl p-5 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {language === 'hi' ? 'सक्रिय लाइव आर्डर' : 'Live Active Delivery'}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-400">
              #{activeOrder.id.slice(-6).toUpperCase()}
            </span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-base text-white">{activeOrder.store_name}</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {activeOrder.items.length} {language === 'hi' ? 'सामान' : 'items'} • ₹{activeOrder.total_amount}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-[#f9531e]/20 text-[#f9531e] text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#f9531e]/30 capitalize">
                {activeOrder.status.replace('_', ' ')}
              </span>
              <p className="text-[10px] text-neutral-400 mt-1 flex items-center justify-end gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>ETA: ~12-18 mins</span>
              </p>
            </div>
          </div>

          {/* Delivery OTP Badge */}
          {activeOrder.delivery_otp && (
            <div className="bg-neutral-800/80 border border-neutral-700/60 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-[11px] text-neutral-300 font-medium">
                    {language === 'hi'
                      ? 'डिलीवरी मिलने पर राइडर को यह कोड बताएं'
                      : 'Share this Handover OTP with rider'}
                  </p>
                  <p className="text-[10px] text-neutral-400">Zero-contact verified delivery</p>
                </div>
              </div>
              <div className="bg-neutral-900 px-3.5 py-1.5 rounded-xl border border-neutral-700">
                <span className="text-base font-mono font-black text-white tracking-widest">
                  {activeOrder.delivery_otp}
                </span>
              </div>
            </div>
          )}

          {/* Map Preview Snippet */}
          <div className="rounded-2xl overflow-hidden border border-neutral-800 h-44 relative shadow-inner">
            <LiveMap
              pickupCoords={activeOrder.pickup_coordinates}
              dropoffCoords={activeOrder.dropoff_coordinates}
              driverCoords={activeOrder.driver_coordinates}
              pickupName={activeOrder.store_name}
              dropoffAddress={activeOrder.delivery_address}
            />
          </div>

          <button
            onClick={onOpenTrackingModal}
            className="w-full bg-[#f9531e] hover:bg-[#e04513] text-white py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-[#f9531e]/25 cursor-pointer"
          >
            <Bike className="w-4 h-4" />
            {language === 'hi' ? 'फुल स्क्रीन मैप ट्रैकर खोलें' : 'Open Full Live Route Map'}
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#f9531e]/10 text-[#f9531e] mx-auto flex items-center justify-center">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              {language === 'hi' ? 'वर्तमान में कोई सक्रिय आर्डर नहीं' : 'No Active Delivery in Transit'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
              {language === 'hi'
                ? 'गुलबर्गा के प्रसिद्ध होटलों और किराना स्टोर्स से आर्डर करें'
                : 'Hungry? Order from top Gulbarga restaurants or quick daily kirana stores.'}
            </p>
          </div>
          <button
            onClick={onSwitchToHome}
            className="bg-[#f9531e] hover:bg-[#e04513] text-white py-2.5 px-6 rounded-xl text-xs font-bold transition shadow-md shadow-[#f9531e]/20 cursor-pointer inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {language === 'hi' ? 'होटल और किराना देखें' : 'Explore Gulbarga Stores'}
          </button>
        </div>
      )}

      {/* Past Orders History List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          {language === 'hi' ? 'पिछले आर्डर का इतिहास' : 'Past Order History'}
        </h3>

        <div className="space-y-3">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-3 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    {ord.store_name}
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {new Date(ord.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    ord.status === 'delivered'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {ord.status.replace('_', ' ')}
                </span>
              </div>

              {/* Items summary */}
              <div className="text-xs text-neutral-700 dark:text-neutral-300 divide-y divide-neutral-100 dark:divide-neutral-800">
                {ord.items.map((it, idx) => (
                  <div key={idx} className="py-1 flex justify-between">
                    <span>
                      {it.quantity}x {it.name_en}
                    </span>
                    <span className="font-mono text-neutral-500">₹{it.subtotal}</span>
                  </div>
                ))}
              </div>

              {/* Total & Action Buttons */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase">Total Paid</span>
                  <p className="text-sm font-black text-neutral-900 dark:text-white">
                    ₹{ord.total_amount}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReorder(ord)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f9531e]/10 hover:bg-[#f9531e]/20 text-[#f9531e] rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'फिर से आर्डर करें' : 'Reorder'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
