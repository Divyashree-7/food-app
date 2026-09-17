import React from 'react';
import { Home, FileText, MessageCircle, Wallet, User } from 'lucide-react';

export type CustomerTabType = 'home' | 'orders' | 'message' | 'wallet' | 'profile';

interface CustomerBottomNavProps {
  activeTab: CustomerTabType;
  onTabChange: (tab: CustomerTabType) => void;
  language: 'en' | 'hi';
  unreadMessagesCount?: number;
  activeOrdersCount?: number;
}

export const CustomerBottomNav: React.FC<CustomerBottomNavProps> = ({
  activeTab,
  onTabChange,
  language,
  unreadMessagesCount = 1,
  activeOrdersCount = 0,
}) => {
  const tabs: { id: CustomerTabType; labelEn: string; labelHi: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', labelEn: 'Home', labelHi: 'होम', icon: Home },
    { id: 'orders', labelEn: 'Orders', labelHi: 'आर्डर', icon: FileText },
    { id: 'message', labelEn: 'Message', labelHi: 'संदेश', icon: MessageCircle },
    { id: 'wallet', labelEn: 'E-Wallet', labelHi: 'ई-वॉलेट', icon: Wallet },
    { id: 'profile', labelEn: 'Profile', labelHi: 'प्रोफ़ाइल', icon: User },
  ];

  return (
    <nav aria-label="Customer mobile navigation" className="sticky bottom-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-3 pt-2 pb-1.5 transition-all">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const label = language === 'hi' ? tab.labelHi : tab.labelEn;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer select-none group ${
                isActive
                  ? 'text-[#f9531e] font-semibold scale-105'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <div className="relative mb-1">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'stroke-[2.5] scale-110 drop-shadow-sm' : 'stroke-[1.75] group-hover:scale-105'
                  }`}
                />
                {/* Badges */}
                {tab.id === 'message' && unreadMessagesCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#f9531e] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-neutral-900 animate-pulse">
                    {unreadMessagesCount}
                  </span>
                )}
                {tab.id === 'orders' && activeOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-emerald-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-neutral-900">
                    {activeOrdersCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] tracking-tight transition-all duration-150 whitespace-nowrap ${
                  isActive ? 'font-bold text-[#f9531e]' : 'font-medium'
                }`}
              >
                {label}
              </span>
              {isActive && (
                <span className="absolute -bottom-0.5 w-1.5 h-1.5 bg-[#f9531e] rounded-full shadow-sm"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Modern iOS notch home indicator line */}
      <div className="w-28 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mt-1.5 opacity-60"></div>
    </nav>
  );
};
