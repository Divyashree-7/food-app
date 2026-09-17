import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Gift,
  History,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Transaction {
  id: string;
  titleEn: string;
  titleHi: string;
  subEn: string;
  subHi: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  status: 'completed' | 'pending';
}

export const CustomerWallet: React.FC = () => {
  const { language, showToast } = useApp();
  const [walletBalance, setWalletBalance] = useState(650);
  const [addAmount, setAddAmount] = useState<number | ''>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx_01',
      titleEn: 'Order #GB-8921 (Hotel Heritage)',
      titleHi: 'आर्डर #GB-8921 (होटल हेरिटेज)',
      subEn: 'Mutton Tahari & Biryani',
      subHi: 'मटन तहरी और बिरयानी',
      amount: 320,
      type: 'debit',
      date: 'Today, 1:45 PM',
      status: 'completed',
    },
    {
      id: 'tx_02',
      titleEn: 'Cashback: GULBARGA50 Promo',
      titleHi: 'कैशबैक: गुलबर्गा50 प्रोमो',
      subEn: 'Promotional Welcome Bonus',
      subHi: 'प्रमोशनल स्वागत बोनस',
      amount: 50,
      type: 'credit',
      date: 'Today, 1:46 PM',
      status: 'completed',
    },
    {
      id: 'tx_03',
      titleEn: 'UPI Top-Up (GPay)',
      titleHi: 'यूपीआई वॉलेट टॉप-अप (GPay)',
      subEn: 'Bank of Baroda •••• 4012',
      subHi: 'बैंक ऑफ बड़ौदा •••• 4012',
      amount: 500,
      type: 'credit',
      date: 'Yesterday, 6:30 PM',
      status: 'completed',
    },
    {
      id: 'tx_04',
      titleEn: 'Order #GB-8104 (Annapurna Veg)',
      titleHi: 'आर्डर #GB-8104 (अन्नपूर्णा शाकाहारी)',
      subEn: 'Jolada Rotti Oota & Shenga Holige',
      subHi: 'जोलद रोट्टी भोजन और शेंगा होलिगे',
      amount: 180,
      type: 'debit',
      date: '15 Sep, 8:15 PM',
      status: 'completed',
    },
  ]);

  const handleAddMoney = (amount: number) => {
    if (amount <= 0) return;
    setWalletBalance((prev) => prev + amount);
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      titleEn: 'UPI Quick Wallet Top-up',
      titleHi: 'यूपीआई त्वरित वॉलेट टॉप-अप',
      subEn: 'Instant recharge via PhonePe/GPay',
      subHi: 'फोनपे/जीपे द्वारा तत्काल रिचार्ज',
      amount: amount,
      type: 'credit',
      date: 'Just now',
      status: 'completed',
    };
    setTransactions([newTx, ...transactions]);
    setIsAddModalOpen(false);
    setAddAmount('');
    showToast(
      language === 'hi'
        ? `₹${amount} आपके गुलबर्गा ई-वॉलेट में जोड़े गए!`
        : `₹${amount} added successfully to QuickPay Wallet!`
    );
  };

  return (
    <div className="space-y-4 pb-20 max-w-2xl mx-auto px-4 pt-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#f9531e]" />
            {language === 'hi' ? 'गुलबर्गा क्विकपे ई-वॉलेट' : 'Gulbarga QuickPay E-Wallet'}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {language === 'hi'
              ? 'खाद्य और किराना डिलीवरी के लिए 1-क्लिक सुरक्षित भुगतान'
              : 'Zero-fee instant 1-tap checkout for food & kirana orders'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-full font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'सुरक्षित वॉलेट' : 'RBI-Grade'}</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-850 to-neutral-950 text-white rounded-3xl p-6 shadow-xl border border-neutral-800">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-[#f9531e]/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col justify-between space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-neutral-400 font-medium tracking-wide uppercase">
                {language === 'hi' ? 'कुल उपलब्ध शेष राशि' : 'Available Balance'}
              </span>
              <div className="text-4xl font-black text-white mt-1 tracking-tight flex items-baseline">
                <span>₹{walletBalance.toLocaleString('en-IN')}</span>
                <span className="text-xs text-emerald-400 font-bold ml-2 flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" />
                  {language === 'hi' ? 'सक्रिय' : 'Active'}
                </span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f9531e] animate-ping"></div>
              <span className="text-[11px] font-bold tracking-wider">QUICKPAY</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-800/80">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 min-w-[130px] bg-[#f9531e] hover:bg-[#e04513] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-[#f9531e]/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {language === 'hi' ? 'पैसे जोड़ें' : 'Add Money'}
            </button>
            <button
              onClick={() => {
                showToast(
                  language === 'hi'
                    ? 'त्वरित भुगतान मोड सक्रिय है'
                    : '1-Tap Fast Checkout is enabled for upcoming orders'
                );
              }}
              className="flex-1 min-w-[130px] bg-neutral-800 hover:bg-neutral-700 text-neutral-200 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-neutral-700 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-neutral-400" />
              {language === 'hi' ? 'फास्ट चेकआउट' : '1-Tap Pay'}
            </button>
          </div>
        </div>
      </div>

      {/* Cashback & Offers Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
              {language === 'hi' ? 'गुलबर्ga कैशबैक क्लब' : 'Gulbarga Cashback Club'}
            </h4>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {language === 'hi'
                ? 'वॉलेट से भुगतान पर हर आर्डर पर 5% तक सीधा कैशबैक पाएं'
                : 'Get up to 5% instant cashback when paying via QuickPay Wallet'}
            </p>
          </div>
        </div>
        <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-1 rounded-lg">
          5% OFF
        </span>
      </div>

      {/* Quick Add Money Presets */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
            {language === 'hi' ? 'त्वरित टॉप-अप चुनें' : 'Quick Recharge (UPI / GPay)'}
          </span>
          <span className="text-[10px] text-neutral-400">Zero Gateway Charges</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[100, 250, 500, 1000].map((val) => (
            <button
              key={val}
              onClick={() => handleAddMoney(val)}
              className="py-2.5 px-1 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-[#f9531e] dark:hover:border-[#f9531e] bg-neutral-50 dark:bg-neutral-850 hover:bg-[#f9531e]/5 text-neutral-800 dark:text-neutral-200 text-xs font-black transition flex flex-col items-center justify-center gap-0.5 cursor-pointer"
            >
              <span>+₹{val}</span>
              <span className="text-[9px] text-[#f9531e] font-semibold">+₹{Math.round(val * 0.05)} cb</span>
            </button>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-[#f9531e]" />
            {language === 'hi' ? 'हालिया लेनदेन इतिहास' : 'Recent Transactions'}
          </h3>
          <span className="text-[10px] text-neutral-400">Last 30 days</span>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {transactions.map((tx) => (
            <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'credit'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-rose-500/10 text-rose-500'
                  }`}
                >
                  {tx.type === 'credit' ? (
                    <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  )}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    {language === 'hi' ? tx.titleHi : tx.titleEn}
                  </h5>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {language === 'hi' ? tx.subHi : tx.subEn} • {tx.date}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-xs font-black ${
                    tx.type === 'credit' ? 'text-emerald-500' : 'text-neutral-900 dark:text-white'
                  }`}
                >
                  {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                </span>
                <div className="flex items-center justify-end gap-1 text-[9px] text-emerald-500 font-medium">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Success</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Money Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#f9531e]" />
                {language === 'hi' ? 'वॉलेट में राशि जोड़ें' : 'Add Money to Wallet'}
              </h4>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-500">
                {language === 'hi' ? 'राशि दर्ज करें (₹)' : 'Enter Amount (₹)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-base font-bold text-neutral-400">₹</span>
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(Number(e.target.value) || '')}
                  placeholder="500"
                  className="w-full pl-8 pr-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-base font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-[#f9531e]"
                />
              </div>
            </div>

            <div className="flex gap-2">
              {[200, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAddAmount(amt)}
                  className="flex-1 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-[#f9531e]/10 text-xs font-bold text-neutral-700 dark:text-neutral-300 rounded-lg border border-neutral-200 dark:border-neutral-700 cursor-pointer"
                >
                  +₹{amt}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                const val = typeof addAmount === 'number' ? addAmount : 0;
                if (val > 0) handleAddMoney(val);
              }}
              disabled={!addAmount || addAmount <= 0}
              className="w-full bg-[#f9531e] hover:bg-[#e04513] disabled:opacity-50 text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-[#f9531e]/25 transition cursor-pointer"
            >
              {language === 'hi'
                ? `₹${addAmount || 0} यूपीआई से जोड़ें`
                : `Pay & Add ₹${addAmount || 0} via UPI`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
