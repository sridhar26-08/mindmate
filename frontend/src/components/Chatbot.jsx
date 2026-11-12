import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Send, Bot, User, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

const SUGGESTIONS = [
  "I'm stressed about exams",
  "I have too many assignments and can't focus",
  "I'm having trouble sleeping",
  "I feel overwhelmed and anxious",
  "I'm feeling down and unmotivated"
];

function FormattedMessage({ text }) {
  // Convert markdown-style bold and bullet points into styled elements
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 leading-relaxed text-sm">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
          const bulletContent = trimmed.replace(/^([•\-]\s|\d+\.\s)/, '');
          const parts = bulletContent.split(/(\*\*.*?\*\*)/g);
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-indigo-500 font-bold select-none">•</span>
              <div>
                {parts.map((p, pIdx) =>
                  p.startsWith('**') && p.endsWith('**') ? (
                    <strong key={pIdx} className="font-semibold text-slate-900 dark:text-slate-100">
                      {p.slice(2, -2)}
                    </strong>
                  ) : (
                    <span key={pIdx}>{p}</span>
                  )
                )}
              </div>
            </div>
          );
        }
        const parts = trimmed.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={idx}>
            {parts.map((p, pIdx) =>
              p.startsWith('**') && p.endsWith('**') ? (
                <strong key={pIdx} className="font-semibold text-slate-900 dark:text-slate-100">
                  {p.slice(2, -2)}
                </strong>
              ) : (
                <span key={pIdx}>{p}</span>
              )
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function Chatbot() {
  const [items, setItems] = useState([
    {
      mine: false,
      text: "Hello! 👋 I'm **MindMate**, your AI student wellness assistant. How can I support you today? You can share anything you're dealing with, from exam anxiety and study pressure to sleep problems or loneliness."
    }
  ]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [items, loading]);

  const send = async (textToSend) => {
    const prompt = (textToSend || message).trim();
    if (!prompt || loading) return;

    const userEntry = { mine: true, text: prompt };
    setItems((prev) => [...prev, userEntry]);
    setMessage('');
    setLoading(true);

    try {
      // Build lightweight conversation history
      const history = items.slice(-6).map((item) => ({
        role: item.mine ? 'user' : 'assistant',
        content: item.text
      }));

      const res = await api.post('/chat', { message: prompt, history });
      setItems((prev) => [
        ...prev,
        {
          mine: false,
          text: res.data.message || "I'm here to listen. Could you tell me a little more?",
          urgent: Boolean(res.data.urgent)
        }
      ]);
    } catch (err) {
      setItems((prev) => [
        ...prev,
        {
          mine: false,
          text: "I'm having a brief connection hitch, but I'm here. Try stepping back for a 5-minute break and let's check in again shortly."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setItems([
      {
        mine: false,
        text: "Conversation refreshed. What would you like to talk through right now?"
      }
    ]);
  };

  const [activeModel, setActiveModel] = useState('Ollama (llama3.2:3b)');

  return (
    <div className="card shadow-lg border border-slate-200/80 dark:border-slate-800 flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-semibold text-base text-slate-900 dark:text-slate-100">MindMate AI Companion</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {activeModel}
              </span>
            </div>
            <p className="text-xs text-slate-500">Confidential, supportive wellness guidance for students</p>
          </div>
        </div>

        <button
          onClick={handleReset}
          title="Clear conversation"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1">
        {items.map((x, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 ${x.mine ? 'justify-end' : 'justify-start'}`}
          >
            {!x.mine && (
              <div
                className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-white ${
                  x.urgent ? 'bg-red-600' : 'bg-indigo-600'
                }`}
              >
                {x.urgent ? <AlertCircle className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                x.mine
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : x.urgent
                  ? 'bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-900/50 rounded-tl-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
              }`}
            >
              {x.mine ? (
                <p className="text-sm whitespace-pre-wrap">{x.text}</p>
              ) : (
                <FormattedMessage text={x.text} />
              )}
            </div>

            {x.mine && (
              <div className="h-7 w-7 rounded-lg bg-slate-300 dark:bg-slate-700 flex items-center justify-center shrink-0 text-slate-700 dark:text-slate-200">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 text-slate-500 text-sm flex items-center gap-1.5 shadow-sm">
              <Sparkles className="h-4 w-4 text-indigo-500 animate-spin" />
              <span>MindMate is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      {items.length <= 3 && (
        <div className="py-2 border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-indigo-500" />
            Quick questions:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => send(s)}
                className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/50 dark:border-indigo-800/50 transition text-left"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <form
        className="pt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type what you're dealing with (e.g., exams, sleep, burnout)..."
          disabled={loading}
          className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!message.trim() || loading}
          className="btn flex items-center gap-1.5 px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
