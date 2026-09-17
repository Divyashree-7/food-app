import React, { useState } from 'react';
import {
  MessageCircle,
  Send,
  Phone,
  Store,
  HelpCircle,
  CheckCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Message {
  id: string;
  sender: 'user' | 'other';
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  titleEn: string;
  titleHi: string;
  subtitleEn: string;
  subtitleHi: string;
  type: 'driver' | 'merchant' | 'support';
  avatarBg: string;
  badge: string;
  phone?: string;
  messages: Message[];
}

export const CustomerChat: React.FC = () => {
  const { language } = useApp();

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'c_driver',
      titleEn: 'Vijay Kumar (Delivery Partner)',
      titleHi: 'विजय कुमार (डिलीवरी पार्टनर)',
      subtitleEn: 'Hero Splendor (KA-32-EA-4521) • Near Sedam Road',
      subtitleHi: 'हीरो स्प्लेंडर (KA-32-EA-4521) • सेडम रोड के पास',
      type: 'driver',
      avatarBg: 'bg-emerald-500',
      badge: 'Order #GB-8921',
      phone: '+91 94480 12345',
      messages: [
        {
          id: 'm1',
          sender: 'other',
          text:
            language === 'hi'
              ? 'नमस्ते! मैंने होटल से आपका गरम खाना पिकअप कर लिया है। 10-12 मिनट में पहुँच रहा हूँ।'
              : "Namaste! I have picked up your hot order from the restaurant. Reaching your location in 10-12 mins.",
          time: '1:42 PM',
        },
        {
          id: 'm2',
          sender: 'user',
          text:
            language === 'hi'
              ? 'धन्यवाद भैया, गेट पर आकर कॉल कर देना।'
              : 'Thanks! Please call once you reach the main gate.',
          time: '1:44 PM',
        },
        {
          id: 'm3',
          sender: 'other',
          text:
            language === 'hi'
              ? 'हाँ जी बिल्कुल। सेडम रोड क्रॉस कर रहा हूँ।'
              : 'Sure, will call you. Crossing Sedam Road junction right now.',
          time: '1:45 PM',
        },
      ],
    },
    {
      id: 'c_merchant',
      titleEn: 'Hotel Heritage Gulbarga',
      titleHi: 'होटल हेरिटेज गुलबर्गा',
      subtitleEn: 'Kitchen Desk • Sedam Road',
      subtitleHi: 'किचन डेस्क • सेडम रोड',
      type: 'merchant',
      avatarBg: 'bg-[#f9531e]',
      badge: 'Merchant',
      phone: '+91 8472 251010',
      messages: [
        {
          id: 'mm1',
          sender: 'user',
          text:
            language === 'hi'
              ? 'कृपया मटन तहरी में ज्यादा तीखा मत डालिए।'
              : 'Please make the Mutton Tahari medium spicy, thank you.',
          time: '1:28 PM',
        },
        {
          id: 'mm2',
          sender: 'other',
          text:
            language === 'hi'
              ? 'जी ज़रूर! हमने निर्देश शेफ को दे दिए हैं और साथ में अतिरिक्त रायता भी पैक कर दिया है।'
              : 'Noted with care! Chef has customized the spice level and added extra mint raita for you.',
          time: '1:30 PM',
        },
      ],
    },
    {
      id: 'c_support',
      titleEn: 'QuickBite 24x7 Gulbarga Helpdesk',
      titleHi: 'क्विकबाइट 24x7 गुलबर्गा हेल्पडेस्क',
      subtitleEn: 'Pooja (Support Executive) • Instant Resolution',
      subtitleHi: 'पूजा (सहायता अधिकारी) • तत्काल समाधान',
      type: 'support',
      avatarBg: 'bg-indigo-500',
      badge: 'Live Help',
      messages: [
        {
          id: 'ms1',
          sender: 'other',
          text:
            language === 'hi'
              ? 'नमस्ते! गुलबर्गा क्विकबाइट सहायता में आपका स्वागत है। हम आपकी क्या मदद कर सकते हैं?'
              : 'Hello! Welcome to Gulbarga QuickBite Customer Support. How can we help you today?',
          time: '12:00 PM',
        },
      ],
    },
  ]);

  const [activeConvId, setActiveConvId] = useState<string>('c_driver');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  const quickReplies = [
    language === 'hi' ? 'आप कहाँ पहुंचे?' : 'Where are you now?',
    language === 'hi' ? 'गेट पर आकर कॉल करें' : 'Please call at the gate',
    language === 'hi' ? 'धन्यवाद भैया!' : 'Thank you!',
    language === 'hi' ? 'कम तीखा रखियेगा' : 'Make it less spicy please',
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const newMsg: Message = {
      id: `m_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === activeConvId ? { ...c, messages: [...c.messages, newMsg] } : c))
    );
    setInputText('');

    // Simulate auto-reply from driver/support after 1.2 seconds
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let replyText = '';
      if (activeConvId === 'c_driver') {
        replyText =
          language === 'hi'
            ? 'जी ठीक है, मैं 2 मिनट में बिल्डिंग के नीचे पहुँच रहा हूँ।'
            : 'Got it! Reaching your building downstairs in 2 minutes.';
      } else if (activeConvId === 'c_merchant') {
        replyText =
          language === 'hi'
            ? 'धन्यवाद! आपका आर्डर पूरी स्वच्छता के साथ तैयार है।'
            : 'Thank you! Your food is freshly prepared with utmost hygiene.';
      } else {
        replyText =
          language === 'hi'
            ? 'आपकी समस्या नोट कर ली गई है। हमारी टीम तुरंत जांच कर रही है।'
            : 'We have noted your query. Gulbarga support is verifying this right away.';
      }

      const replyMsg: Message = {
        id: `m_rep_${Date.now()}`,
        sender: 'other',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setConversations((prev) =>
        prev.map((c) => (c.id === activeConvId ? { ...c, messages: [...c.messages, replyMsg] } : c))
      );
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto px-3 pt-3 pb-20 space-y-3 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-[#f9531e]" />
            {language === 'hi' ? 'संदेश और लाइव चैट' : 'In-App Messages & Chat'}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {language === 'hi'
              ? 'डिलीवरी पार्टनर, स्टोर और ग्राहक सहायता से सीधा संपर्क'
              : 'Direct communication with delivery partner, merchant & support'}
          </p>
        </div>
        <span className="text-[11px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Socket
        </span>
      </div>

      {/* Conversation Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {conversations.map((c) => {
          const isSelected = c.id === activeConvId;
          return (
            <button
              key={c.id}
              onClick={() => setActiveConvId(c.id)}
              className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-neutral-900 text-white border-neutral-800 dark:bg-white dark:text-neutral-900 shadow-md scale-102'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-[#f9531e]'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl ${c.avatarBg} text-white flex items-center justify-center text-xs font-bold`}
              >
                {c.type === 'driver' ? '🛵' : c.type === 'merchant' ? '🏪' : '💬'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold truncate max-w-[130px]">
                  {language === 'hi' ? c.titleHi.split(' ')[0] : c.titleEn.split(' ')[0]}
                </p>
                <p className="text-[10px] opacity-75 truncate max-w-[130px]">{c.badge}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Conversation Box */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm flex flex-col h-[460px] overflow-hidden">
        {/* Chat Header */}
        <div className="p-3.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-850/70">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl ${activeConv.avatarBg} text-white flex items-center justify-center font-bold text-base shadow-sm`}
            >
              {activeConv.type === 'driver' ? (
                '🛵'
              ) : activeConv.type === 'merchant' ? (
                <Store className="w-5 h-5" />
              ) : (
                <HelpCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black text-neutral-900 dark:text-white">
                  {language === 'hi' ? activeConv.titleHi : activeConv.titleEn}
                </h4>
                <span className="text-[9px] bg-[#f9531e]/15 text-[#f9531e] font-bold px-1.5 py-0.2 rounded">
                  {activeConv.badge}
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                {language === 'hi' ? activeConv.subtitleHi : activeConv.subtitleEn}
              </p>
            </div>
          </div>

          {activeConv.phone && (
            <a
              href={`tel:${activeConv.phone}`}
              className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition"
              title="Call"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50/40 dark:bg-neutral-950/40">
          {activeConv.messages.map((m) => {
            const isMe = m.sender === 'user';
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs shadow-xs ${
                    isMe
                      ? 'bg-[#f9531e] text-white rounded-br-xs'
                      : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700/80 rounded-bl-xs'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                      isMe ? 'text-white/80' : 'text-neutral-400'
                    }`}
                  >
                    <span>{m.time}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-800 text-neutral-500 px-3 py-2 rounded-2xl w-fit text-xs border border-neutral-200 dark:border-neutral-700 animate-pulse">
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 pt-2 pb-1 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickReplies.map((qr, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(qr)}
              className="flex-shrink-0 text-[11px] bg-neutral-100 dark:bg-neutral-800 hover:bg-[#f9531e]/10 hover:text-[#f9531e] text-neutral-600 dark:text-neutral-300 px-2.5 py-1 rounded-full transition cursor-pointer border border-neutral-200 dark:border-neutral-700"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={
              language === 'hi'
                ? `${activeConv.titleHi.split(' ')[0]} को संदेश लिखें...`
                : `Type a message to ${activeConv.titleEn.split(' ')[0]}...`
            }
            className="flex-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#f9531e]"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="p-2.5 bg-[#f9531e] hover:bg-[#e04513] disabled:opacity-40 text-white rounded-2xl transition cursor-pointer shadow-md shadow-[#f9531e]/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
