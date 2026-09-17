import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { CustomerApp } from './components/CustomerApp';
import { DeliveryApp } from './components/DeliveryApp';
import { VendorApp } from './components/VendorApp';
import { AdminDashboard } from './components/AdminDashboard';
import { ActiveInterface } from './types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeInterface, toastMessage } = useApp();
  const [isSplitView, setIsSplitView] = useState(false);
  const [splitRightInterface, setSplitRightInterface] = useState<ActiveInterface>('delivery');

  const renderInterface = (ui: ActiveInterface) => {
    switch (ui) {
      case 'customer':
        return <CustomerApp />;
      case 'delivery':
        return <DeliveryApp />;
      case 'vendor':
        return <VendorApp />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <CustomerApp />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Navigation Top Bar */}
      <Navbar
        isSplitView={isSplitView}
        setIsSplitView={setIsSplitView}
        splitRightInterface={splitRightInterface}
        setSplitRightInterface={setSplitRightInterface}
      />

      {/* Main App Content Viewport */}
      <div className="flex-1 p-3 sm:p-6 flex items-start justify-center">
        {!isSplitView ? (
          /* Single Main Interface View */
          <div className="w-full transition-all duration-300">
            {renderInterface(activeInterface)}
          </div>
        ) : (
          /* Side-by-Side Dual App Split View for Live Testing */
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Screen: Primary Interface */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 text-xs font-bold text-neutral-400">
                <span className="uppercase tracking-wider">Screen 1 (Active)</span>
                <span className="text-rose-400 font-mono">{activeInterface.toUpperCase()}</span>
              </div>
              {renderInterface(activeInterface)}
            </div>

            {/* Right Screen: Paired Real-Time Interface */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 text-xs font-bold text-neutral-400">
                <span className="uppercase tracking-wider">Screen 2 (Real-time Watcher)</span>
                <div className="flex items-center gap-1.5 bg-neutral-900 px-2 py-0.5 rounded-lg border border-neutral-800">
                  <select
                    value={splitRightInterface}
                    onChange={(e) => setSplitRightInterface(e.target.value as ActiveInterface)}
                    className="bg-transparent text-amber-400 font-mono font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="delivery" className="bg-neutral-900 text-white">
                      DELIVERY APP
                    </option>
                    <option value="vendor" className="bg-neutral-900 text-white">
                      VENDOR APP
                    </option>
                    <option value="admin" className="bg-neutral-900 text-white">
                      ADMIN DASHBOARD
                    </option>
                    <option value="customer" className="bg-neutral-900 text-white">
                      CUSTOMER APP
                    </option>
                  </select>
                </div>
              </div>
              {renderInterface(splitRightInterface)}
            </div>
          </div>
        )}
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-neutral-900/95 border border-neutral-700/80 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2.5 max-w-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
