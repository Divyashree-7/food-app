import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Zap,
  Activity,
  ShieldAlert,
  Languages,
  CheckCircle2,
  AlertOctagon,
  Users,
  Store as StoreIcon,
  TrendingUp,
  FileCode,
  Radio,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Store, Product } from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    language,
    t,
    stores,
    products,
    orders,
    refreshData,
    updateOrderStatus,
    simulateExternalWebhook,
    showToast,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'sync' | 'dispatch' | 'translations' | 'users'
  >('sync');

  const [syncStatus, setSyncStatus] = useState<any>({
    lastSyncTime: new Date().toLocaleTimeString(),
    recordsCount: 40,
    status: 'healthy',
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync audit logs
  const [syncLogs, setSyncLogs] = useState<
    { id: string; time: string; type: string; event: string; status: string }[]
  >([
    {
      id: 'log-1',
      time: '12:04:12',
      type: 'CATALOG_SYNC',
      event: 'Bulk catalog fetch from Gulbarga external provider API',
      status: 'SUCCESS (40 items)',
    },
    {
      id: 'log-2',
      time: '12:15:30',
      type: 'WEBHOOK',
      event: 'Price update GI Toor Dal (legacy_id: ext_p12)',
      status: 'BROADCASTED',
    },
    {
      id: 'log-3',
      time: '12:28:44',
      type: 'REDIS_AUDIT',
      event: 'Session verification heartbeat healthy (3 active users)',
      status: 'OK',
    },
  ]);

  // Translation editor state
  const [editingTranslationItem, setEditingTranslationItem] = useState<{
    id: string;
    type: 'store' | 'product';
    name_en: string;
    name_hi: string;
    desc_hi: string;
  } | null>(null);

  // Users governance
  const [governedUsers, setGovernedUsers] = useState([
    {
      id: 'u_cust_1',
      name: 'Rahul Patil',
      phone: '9876543210',
      role: 'Customer',
      sessions: 1,
      isBlocked: false,
    },
    {
      id: 'u_drv_1',
      name: 'Vijay Kumar',
      phone: '9876543212',
      role: 'Delivery Partner',
      sessions: 1,
      isBlocked: false,
    },
    {
      id: 'u_vnd_1',
      name: 'Anand Kulkarni (Hotel Heritage)',
      phone: '9876543211',
      role: 'Merchant',
      sessions: 1,
      isBlocked: false,
    },
  ]);

  // Trigger immediate catalog re-sync
  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/external-sync/force-sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSyncStatus({
          lastSyncTime: new Date().toLocaleTimeString(),
          recordsCount: (data.storesCount || 4) + (data.productsCount || 36),
          status: 'healthy',
        });
        setSyncLogs((prev) => [
          {
            id: `log-${Date.now()}`,
            time: new Date().toLocaleTimeString(),
            type: 'FORCE_SYNC',
            event: 'Manual admin-initiated full catalog sync and normalization',
            status: 'SUCCESS',
          },
          ...prev,
        ]);
        showToast('Full Catalog Synchronization Completed!');
        refreshData();
      }
    } catch (e) {
      showToast('Error syncing catalog');
    } finally {
      setIsSyncing(false);
    }
  };

  // Simulate external webhook trigger
  const handleSimulateWebhook = async (action: 'price_drop' | 'stock_out' | 'new_special') => {
    let payload: any = {};
    if (action === 'price_drop') {
      payload = {
        event: 'price_update',
        productLegacyId: 'ext_p12', // GI Toor Dal
        price: 175,
        timestamp: new Date().toISOString(),
      };
    } else if (action === 'stock_out') {
      payload = {
        event: 'stock_toggle',
        productLegacyId: 'ext_p01', // Mutton Tahari
        inStock: false,
        timestamp: new Date().toISOString(),
      };
    } else {
      payload = {
        event: 'inventory_refresh',
        storeLegacyId: 'ext_s01',
        timestamp: new Date().toISOString(),
      };
    }

    await simulateExternalWebhook(payload);
    setSyncLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        type: 'WEBHOOK_EMIT',
        event: `Simulated external system event: ${payload.event}`,
        status: 'BROADCAST_DONE',
      },
      ...prev,
    ]);
  };

  // Block User & Revoke Redis Sessions
  const handleBlockUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/block`, { method: 'POST' });
      if (res.ok) {
        setGovernedUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isBlocked: !u.isBlocked, sessions: 0 } : u))
        );
        showToast('User blocked & all active Redis sessions revoked instantly!');
      }
    } catch (e) {
      showToast('Error modifying user status');
    }
  };

  // Save edited translation
  const handleSaveTranslation = async () => {
    if (!editingTranslationItem) return;
    try {
      const res = await fetch('/api/admin/translations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editingTranslationItem.type,
          id: editingTranslationItem.id,
          name_hi: editingTranslationItem.name_hi,
          description_hi: editingTranslationItem.desc_hi,
        }),
      });
      if (res.ok) {
        showToast('Hindi localization updated and saved to DB!');
        setEditingTranslationItem(null);
        refreshData();
      }
    } catch (e) {
      showToast('Error saving translation');
    }
  };

  // Stats calculation
  const totalRevenue = orders.reduce((sum, o) => sum + o.grand_total, 0);
  const foodOrders = orders.filter((o) => o.order_type === 'food').length;
  const groceryOrders = orders.filter((o) => o.order_type === 'grocery').length;

  return (
    <div className="w-full max-w-6xl mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
      {/* ADMIN TOP BAR */}
      <header className="bg-neutral-950 px-4 sm:px-6 py-4 border-b border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{t('admin.title')}</span>
              <span className="text-[10px] bg-rose-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                GULBARGA HQ
              </span>
            </h2>
            <p className="text-xs text-neutral-400">
              Karnataka Central Multi-Vendor Dispatch & Catalog Engine
            </p>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
          <button
            onClick={() => setActiveAdminTab('sync')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeAdminTab === 'sync'
                ? 'bg-rose-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('admin.catalogSync')}
          </button>
          <button
            onClick={() => setActiveAdminTab('dispatch')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeAdminTab === 'dispatch'
                ? 'bg-rose-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('admin.liveDispatch')}
          </button>
          <button
            onClick={() => setActiveAdminTab('translations')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeAdminTab === 'translations'
                ? 'bg-rose-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('admin.translations')}
          </button>
          <button
            onClick={() => setActiveAdminTab('users')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeAdminTab === 'users'
                ? 'bg-rose-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('admin.usersSessions')}
          </button>
        </div>
      </header>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 sm:p-4 bg-neutral-950/60 border-b border-neutral-800 text-center">
        <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
          <p className="text-[11px] text-neutral-400">Total Platform GMV</p>
          <p className="text-base sm:text-lg font-black text-emerald-400">₹{totalRevenue}</p>
        </div>
        <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
          <p className="text-[11px] text-neutral-400">Food vs Grocery Orders</p>
          <p className="text-sm sm:text-base font-black text-white">
            {foodOrders} Food • {groceryOrders} Grocery
          </p>
        </div>
        <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
          <p className="text-[11px] text-neutral-400">Gulbarga Stores Online</p>
          <p className="text-sm sm:text-base font-black text-amber-400">
            {stores.length} Verified Vendors
          </p>
        </div>
        <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
          <p className="text-[11px] text-neutral-400">Active Live Sessions</p>
          <p className="text-sm sm:text-base font-black text-rose-400">Redis JWT Enforced</p>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
        {/* 1. CATALOG SYNC & WEBHOOK HEALTH */}
        {activeAdminTab === 'sync' && (
          <div className="space-y-6">
            {/* Sync Control Card */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <h3 className="text-base font-bold text-white">
                      External Catalog Live Ingestion Service
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Sourced from external Gulbarga supplier systems. Idempotently mapped via
                    <code className="text-rose-400 mx-1">legacy_id</code>.
                  </p>
                </div>

                <button
                  onClick={handleForceSync}
                  disabled={isSyncing}
                  className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Force Immediate Re-Sync'}</span>
                </button>
              </div>

              {/* Webhook Simulator Controls */}
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3.5 space-y-2">
                <h4 className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>External System Webhook Simulator</span>
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Simulate external website payload webhooks. These broadcast real-time Socket.io
                  updates to all connected Customer, Merchant, and Delivery apps without full page
                  refresh.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => handleSimulateWebhook('price_drop')}
                    className="bg-neutral-800 hover:bg-neutral-700 text-xs text-white px-3 py-1.5 rounded-lg border border-neutral-700 transition cursor-pointer"
                  >
                    📉 Drop GI Toor Dal to ₹175
                  </button>
                  <button
                    onClick={() => handleSimulateWebhook('stock_out')}
                    className="bg-neutral-800 hover:bg-neutral-700 text-xs text-white px-3 py-1.5 rounded-lg border border-neutral-700 transition cursor-pointer"
                  >
                    ⚠️ Mark Mutton Tahari Out of Stock
                  </button>
                  <button
                    onClick={() => handleSimulateWebhook('new_special')}
                    className="bg-neutral-800 hover:bg-neutral-700 text-xs text-white px-3 py-1.5 rounded-lg border border-neutral-700 transition cursor-pointer"
                  >
                    🔄 Broadcast Inventory Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Sync Audit Logs */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-neutral-400" />
                <span>Synchronization Audit Trail</span>
              </h3>

              <div className="divide-y divide-neutral-900 font-mono text-xs">
                {syncLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-neutral-500 text-[11px]">{log.time}</span>
                      <span className="text-rose-400 font-bold">{log.type}</span>
                      <span className="text-neutral-300 font-sans text-xs">{log.event}</span>
                    </div>
                    <span className="text-emerald-400 text-[11px] font-bold shrink-0">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. LIVE DISPATCH KANBAN */}
        {activeAdminTab === 'dispatch' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white">Central Gulbarga Fleet Dispatch Board</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                { key: 'placed', label: '1. Placed Orders', color: 'border-rose-500/40' },
                { key: 'accepted', label: '2. In Preparation', color: 'border-amber-500/40' },
                { key: 'out_for_delivery', label: '3. Out on Bike', color: 'border-sky-500/40' },
                { key: 'delivered', label: '4. Completed', color: 'border-emerald-500/40' },
              ].map((col) => {
                const colOrders = orders.filter((o) => {
                  if (col.key === 'accepted') {
                    return o.order_status === 'accepted' || o.order_status === 'preparing';
                  }
                  if (col.key === 'out_for_delivery') {
                    return (
                      o.order_status === 'ready' ||
                      o.order_status === 'picked_up' ||
                      o.order_status === 'out_for_delivery'
                    );
                  }
                  return o.order_status === col.key;
                });

                return (
                  <div
                    key={col.key}
                    className={`bg-neutral-950 border ${col.color} rounded-2xl p-3 space-y-3 min-h-[320px] flex flex-col`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                      <span className="text-xs font-bold text-neutral-200">{col.label}</span>
                      <span className="text-xs bg-neutral-800 px-2 py-0.5 rounded text-neutral-400 font-mono">
                        {colOrders.length}
                      </span>
                    </div>

                    <div className="space-y-2 flex-1 overflow-y-auto">
                      {colOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 space-y-2 text-xs"
                        >
                          <div className="flex justify-between font-bold text-white">
                            <span>#{ord.order_number}</span>
                            <span className="text-rose-400">₹{ord.grand_total}</span>
                          </div>
                          <p className="text-neutral-400 line-clamp-1">{ord.store_name}</p>
                          <p className="text-[11px] text-neutral-500">
                            Drop: {ord.delivery_address.landmark}
                          </p>

                          {/* Action override */}
                          <div className="pt-1 flex justify-end gap-1">
                            {ord.order_status === 'placed' && (
                              <button
                                onClick={() => updateOrderStatus(ord.id, 'accepted')}
                                className="bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] px-2 py-1 rounded cursor-pointer"
                              >
                                Accept
                              </button>
                            )}
                            {ord.order_status === 'accepted' && (
                              <button
                                onClick={() => updateOrderStatus(ord.id, 'out_for_delivery')}
                                className="bg-amber-600 hover:bg-amber-500 text-white text-[10px] px-2 py-1 rounded cursor-pointer"
                              >
                                Dispatch
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. TRANSLATIONS STUDIO */}
        {activeAdminTab === 'translations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Languages className="w-4 h-4 text-rose-500" />
                  <span>Gulbarga Bilingual Translation Studio (English & Hindi)</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Manage external store and catalog translations. All strings update instantly in
                  the app.
                </p>
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="p-3">Entity</th>
                    <th className="p-3">English Name</th>
                    <th className="p-3">Hindi Translation (हिंदी)</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-neutral-300">
                  {/* Stores */}
                  {stores.map((s) => (
                    <tr key={s.id} className="hover:bg-neutral-900/40">
                      <td className="p-3 font-mono text-[11px] text-neutral-500">Store</td>
                      <td className="p-3 font-semibold text-white">{s.name_en}</td>
                      <td className="p-3 font-serif text-rose-300">{s.name_hi}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() =>
                            setEditingTranslationItem({
                              id: s.id,
                              type: 'store',
                              name_en: s.name_en,
                              name_hi: s.name_hi,
                              desc_hi: s.description_hi,
                            })
                          }
                          className="text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Sample Products */}
                  {products.slice(0, 8).map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-900/40">
                      <td className="p-3 font-mono text-[11px] text-neutral-500">Item</td>
                      <td className="p-3 font-semibold text-white">{p.name_en}</td>
                      <td className="p-3 font-serif text-rose-300">{p.name_hi}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() =>
                            setEditingTranslationItem({
                              id: p.id,
                              type: 'product',
                              name_en: p.name_en,
                              name_hi: p.name_hi,
                              desc_hi: p.description_hi,
                            })
                          }
                          className="text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. USERS & REDIS SESSIONS GOVERNANCE */}
        {activeAdminTab === 'users' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-500" />
                <span>Active Device Sessions & Account Access</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Backed by Redis session cache. Invalidate tokens remotely to enforce immediate logouts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {governedUsers.map((u) => (
                <div
                  key={u.id}
                  className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{u.name}</h4>
                      <p className="text-xs text-neutral-400">+91 {u.phone}</p>
                    </div>
                    <span className="text-[10px] bg-neutral-900 text-neutral-300 px-2 py-0.5 rounded border border-neutral-800">
                      {u.role}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-400 space-y-1">
                    <p className="flex justify-between">
                      <span>Active Sessions:</span>
                      <span className="font-bold text-white">{u.sessions}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Access Status:</span>
                      <span
                        className={`font-bold ${
                          u.isBlocked ? 'text-rose-500' : 'text-emerald-400'
                        }`}
                      >
                        {u.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleBlockUser(u.id)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      u.isBlocked
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/40'
                    }`}
                  >
                    {u.isBlocked ? 'Unblock User' : 'Block & Invalidate Sessions'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* EDIT TRANSLATION MODAL */}
      {editingTranslationItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">
                Edit Hindi Localization: {editingTranslationItem.name_en}
              </h3>
              <button
                onClick={() => setEditingTranslationItem(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 font-bold block mb-1">
                  Hindi Name (हिंदी नाम)
                </label>
                <input
                  type="text"
                  value={editingTranslationItem.name_hi}
                  onChange={(e) =>
                    setEditingTranslationItem({
                      ...editingTranslationItem,
                      name_hi: e.target.value,
                    })
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-serif text-sm"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1">
                  Hindi Description (हिंदी विवरण)
                </label>
                <textarea
                  value={editingTranslationItem.desc_hi}
                  onChange={(e) =>
                    setEditingTranslationItem({
                      ...editingTranslationItem,
                      desc_hi: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-serif text-sm resize-none"
                />
              </div>

              <button
                onClick={handleSaveTranslation}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition cursor-pointer"
              >
                Save & Broadcast Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
