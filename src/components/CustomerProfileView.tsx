import React, { useState } from 'react';
import {
  User,
  MapPin,
  Smartphone,
  CreditCard,
  Languages,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Plus,
  Building,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CustomerProfileView: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    setSessionToken,
    language,
    setLanguage,
    t,
    showToast,
  } = useApp();

  const [addresses, setAddresses] = useState([
    {
      id: 'addr_1',
      title: 'Home',
      titleHi: 'घर',
      address: 'Plot 18, Anand Nagar, Sedam Road, Gulbarga',
      landmark: 'Near Sharanabasaveshwara Temple Arch',
      isDefault: true,
    },
    {
      id: 'addr_2',
      title: 'Office / College',
      titleHi: 'कार्यालय / कॉलेज',
      address: 'Sharanabasava University Campus, Sedam Road, Gulbarga',
      landmark: 'Gate No. 2',
      isDefault: false,
    },
  ]);

  const [isAddAddressModal, setIsAddAddressModal] = useState(false);
  const [newAddrTitle, setNewAddrTitle] = useState('');
  const [newAddrText, setNewAddrText] = useState('');

  const handleAddAddress = () => {
    if (!newAddrTitle || !newAddrText) return;
    const newAddr = {
      id: `addr_${Date.now()}`,
      title: newAddrTitle,
      titleHi: newAddrTitle,
      address: newAddrText,
      landmark: 'Gulbarga City',
      isDefault: false,
    };
    setAddresses([...addresses, newAddr]);
    setIsAddAddressModal(false);
    setNewAddrTitle('');
    setNewAddrText('');
    showToast(
      language === 'hi' ? 'नया पता सफलतापूर्वक जोड़ा गया' : 'New address saved successfully'
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 space-y-5 animate-in fade-in duration-300">
      {/* Header Profile Card */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-850 to-neutral-900 border border-neutral-800 rounded-3xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#f9531e] to-amber-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-[#f9531e]/25">
            {currentUser?.name?.charAt(0) || 'R'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white truncate">
                {currentUser?.name || 'Rahul Patil'}
              </h3>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              +91 {currentUser?.phone || '9876543210'} • Gulbarga
            </p>
            <span className="inline-block mt-1 text-[10px] bg-[#f9531e]/20 text-[#f9531e] font-bold px-2 py-0.5 rounded uppercase">
              {currentUser?.role || 'Customer'}
            </span>
          </div>
        </div>
      </div>

      {/* Language Switcher */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-[#f9531e]" />
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              {t('common.selectLanguage')}
            </span>
          </div>
          <span className="text-[10px] text-neutral-400">English / हिन्दी</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setLanguage('en')}
            className={`py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
              language === 'en'
                ? 'bg-[#f9531e] text-white border-[#f9531e] shadow-sm'
                : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
            }`}
          >
            {language === 'en' && <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>English</span>
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
              language === 'hi'
                ? 'bg-[#f9531e] text-white border-[#f9531e] shadow-sm'
                : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
            }`}
          >
            {language === 'hi' && <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>हिन्दी</span>
          </button>
        </div>
      </div>

      {/* Saved Delivery Addresses */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#f9531e]" />
            {language === 'hi' ? 'सहेजे गए पते' : 'Saved Delivery Addresses'}
          </h4>
          <button
            onClick={() => setIsAddAddressModal(true)}
            className="text-xs text-[#f9531e] font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {language === 'hi' ? 'नया पता' : 'Add New'}
          </button>
        </div>

        <div className="space-y-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-850/60 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#f9531e]/10 text-[#f9531e] flex items-center justify-center mt-0.5 flex-shrink-0">
                  {addr.title === 'Home' ? <Home className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      {language === 'hi' ? addr.titleHi : addr.title}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded font-bold">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                    {addr.address}
                  </p>
                  <p className="text-[10px] text-neutral-400">Landmark: {addr.landmark}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Redis Sessions */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-emerald-500" />
          {language === 'hi' ? 'सक्रिय डिवाइस सत्र (रेडिस)' : 'Active Devices (Redis Managed)'}
        </h4>
        <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-emerald-500" />
            <div>
              <span className="font-bold text-neutral-800 dark:text-neutral-200">
                Mobile Web Client (Gulbarga Hub)
              </span>
              <p className="text-[10px] text-neutral-500">Active session • Authenticated via OTP</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full font-bold">
            Current
          </span>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => {
          setCurrentUser(null);
          setSessionToken(null);
          showToast(language === 'hi' ? 'सत्र समाप्त हुआ' : 'Logged out from Gulbarga account');
        }}
        className="w-full bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-500/10 text-rose-500 border border-neutral-200 dark:border-neutral-700 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>{t('common.logout')}</span>
      </button>

      {/* Add Address Modal */}
      {isAddAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#f9531e]" />
                {language === 'hi' ? 'नया पता जोड़ें' : 'Add New Address'}
              </h4>
              <button
                onClick={() => setIsAddAddressModal(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-neutral-500 font-bold block mb-1">Tag / Label</label>
                <input
                  type="text"
                  placeholder="e.g. Home, Office, Gym"
                  value={newAddrTitle}
                  onChange={(e) => setNewAddrTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-neutral-500 font-bold block mb-1">
                  Full Address (Gulbarga)
                </label>
                <textarea
                  rows={3}
                  placeholder="Street, Area, Near Landmark..."
                  value={newAddrText}
                  onChange={(e) => setNewAddrText(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={handleAddAddress}
              disabled={!newAddrTitle || !newAddrText}
              className="w-full bg-[#f9531e] hover:bg-[#e04513] disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {language === 'hi' ? 'पता सहेजें' : 'Save Address'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
