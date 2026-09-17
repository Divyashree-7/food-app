import React from 'react';
import {
  Smartphone,
  Bike,
  Store as StoreIcon,
  ShieldCheck,
  Columns,
  Radio,
  Languages,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveInterface } from '../types';

interface NavbarProps {
  isSplitView: boolean;
  setIsSplitView: (split: boolean) => void;
  splitRightInterface: ActiveInterface;
  setSplitRightInterface: (ui: ActiveInterface) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isSplitView,
  setIsSplitView,
  splitRightInterface,
  setSplitRightInterface,
}) => {
  const {
    language,
    setLanguage,
    activeInterface,
    setActiveInterface,
    socketConnected,
    t,
  } = useApp();

  return (
    <nav className="w-full bg-neutral-950 border-b border-neutral-800/80 px-4 sm:px-6 py-3 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & City Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-md">
            GK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white">
                Gulbarga QuickBite & Kirana
              </h1>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 font-extrabold px-2 py-0.5 rounded-full border border-rose-500/30 uppercase">
                Dual Vertical
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              {language === 'hi'
                ? 'गुलबर्गा, कर्नाटक • रेस्टोरेंट भोजन और मंडी किराना लाइव प्लेटफॉर्म'
                : 'Gulbarga, Karnataka • Food Delivery & Household Kirana Platform'}
            </p>
          </div>
        </div>

        {/* 4 App Interfaces Switcher */}
        <div className="flex items-center gap-1.5 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveInterface('customer')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeInterface === 'customer'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>1. Customer App</span>
          </button>

          <button
            onClick={() => setActiveInterface('delivery')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeInterface === 'delivery'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>2. Delivery App</span>
          </button>

          <button
            onClick={() => setActiveInterface('vendor')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeInterface === 'vendor'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <StoreIcon className="w-4 h-4" />
            <span>3. Vendor Portal</span>
          </button>

          <button
            onClick={() => setActiveInterface('admin')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeInterface === 'admin'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>4. Admin Dashboard</span>
          </button>
        </div>

        {/* Right Tools: Split View & Socket Status */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Split Mode Toggle */}
          <button
            onClick={() => setIsSplitView(!isSplitView)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
              isSplitView
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Toggle Side-by-Side Multi-App View"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isSplitView ? 'Side-by-Side: ON' : 'Split View'}
            </span>
          </button>

          {/* Socket Connection Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              socketConnected
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
            }`}
          >
            <Radio className="w-3 h-3 animate-pulse" />
            <span>{socketConnected ? 'Live Socket' : 'Connecting'}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
