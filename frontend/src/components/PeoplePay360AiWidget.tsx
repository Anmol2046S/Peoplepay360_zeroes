import { useState } from 'react';
import { Bot, Send, Sparkles, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const suggestionMap: Record<string, string[]> = {
  ADMIN: ['Show organization overview', 'Show recent audit activity', 'Show workforce summary'],
  HR_MANAGER: ['Who is absent today?', 'Show contracts expiring this month', 'Summarize leave usage'],
  HR_PAYROLL_MANAGER: ['Summarize the current payrun', 'Find payroll anomalies', 'Explain this employee\'s payslip'],
  HR_PAYROLL_USER: ['Show current payrun status', 'Find payroll calculation errors', 'Validate the current payrun'],
  EMPLOYEE: ['Show my leave balance', 'Explain my latest payslip', 'How many days did I work this month?'],
};

export function PeoplePay360AiWidget() {
  const { isLoggedIn, role } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([
    { role: 'ai', text: 'Hi! I can help with your payroll, attendance, leave, and HR questions.' },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isLoggedIn) return null;

  const suggestions = suggestionMap[role] || suggestionMap.EMPLOYEE;

  const sendMessage = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: value }]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: value }),
      });

      const payload = await response.json();
      const answer = payload?.data?.message || 'I could not answer that with the current verified data.';
      setMessages((prev) => [...prev, { role: 'ai', text: answer }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'ai', text: 'I could not retrieve the current HR or payroll data. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between bg-[var(--color-sidebar)] text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-300" />
              <span className="font-semibold">PEOPLEPAY360 AI</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="text-slate-300 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <div className="bg-[var(--color-surface-secondary)] px-3 py-2 border-b border-[var(--color-border)]">
            <div className="text-[11px] uppercase tracking-wide text-[var(--color-text-secondary)]">Role-aware HR Copilot · Live app data</div>
          </div>

          <div className="h-[340px] overflow-y-auto p-3 space-y-3 bg-[var(--color-surface)]">
            {messages.map((msg, index) => (
              <div key={index} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={msg.role === 'user' ? 'inline-block max-w-[85%] rounded-2xl bg-[var(--color-primary)] text-white px-3 py-2 text-sm' : 'inline-block max-w-[85%] rounded-2xl bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)] px-3 py-2 text-sm'}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-left text-xs text-slate-500">Analyzing your HR and payroll data...</div>}
          </div>

          <div className="border-t border-[var(--color-border)] p-3 bg-[var(--color-surface-secondary)]">
            <div className="flex flex-wrap gap-2 mb-2">
              {suggestions.map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => sendMessage(suggestion)} className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-[10px] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]">
                  {suggestion}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask anything..."
                className="flex-1 rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-background)] text-[var(--color-text-primary)] px-3 py-2 text-sm outline-none theme-focus"
              />
              <button type="button" onClick={() => sendMessage()} disabled={loading} className="rounded-xl bg-[var(--color-primary)] text-white p-2.5 disabled:opacity-60">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-full bg-[var(--color-sidebar)] px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-[var(--color-primary)]">
          <Bot size={16} className="text-cyan-300" />
          PEOPLEPAY360 AI
        </button>
      )}
    </div>
  );
}
