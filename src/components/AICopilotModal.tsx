import React, { useState } from 'react';
import { ChefHat, Sparkles, Send, X, Bot } from 'lucide-react';
import { askKitchenCopilot } from '../services/geminiService';

interface AICopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayOfWeek: string;
  weather: string;
  totalOrders: number;
  revenue: number;
  shortagesCount: number;
}

export const AICopilotModal: React.FC<AICopilotModalProps> = ({
  isOpen,
  onClose,
  dayOfWeek,
  weather,
  totalOrders,
  revenue,
  shortagesCount
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: `Namaste! I am your AI Head Ustad & Cloud Kitchen Operations Advisor. I track Swiggy & Zomato order volume surges, monsoon downpours, Mandi wholesale prices, and Indian BOM recipes to keep your kitchen operating smoothly. What would you like to review for today's shift?`
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const quickQuestions = [
    'How will monsoon downpour affect tonight’s Swiggy & Zomato orders?',
    'What should the tandoor section prep before the IPL cricket match?',
    'How do we prevent fresh Malai Paneer spoilage before Friday?',
    'Which wholesale Mandi & dairy orders should we place immediately?'
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isProcessing) return;

    const userMsg = { sender: 'user' as const, text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);

    try {
      const reply = await askKitchenCopilot(textToSend, {
        dayOfWeek,
        weather,
        totalOrders,
        revenue,
        shortagesCount
      });

      setMessages(prev => [...prev, { sender: 'assistant', text: reply }]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: `Based on today's shift parameters (${dayOfWeek}, ${weather}, ${totalOrders} orders, ₹${revenue.toLocaleString('en-IN')}), fire the tandoor clay oven by 11:00 AM and seal your first batch of Dum Biryani handis by 11:30 AM to ensure sub-10 minute delivery rider dispatch.`
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full h-[620px] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                AI Head Ustad &amp; Operations Advisor
              </h3>
              <div className="text-[11px] text-slate-400">
                Context: {dayOfWeek} · {weather} · {totalOrders} orders · ₹{revenue.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium'
                    : 'bg-slate-950 border border-slate-800 text-slate-200'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-slate-400 italic">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Analyzing Indian kitchen sales history and Mandi commodities...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isProcessing}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-[11px] whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about Biryani prep, tandoori marinades, monsoon demand, or Mandi rates..."
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500/50"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isProcessing}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
