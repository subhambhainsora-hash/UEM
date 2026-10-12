/**
 * Status toasts. Short, non-blocking confirmation of something that just happened
 * (a build retired, an app added). Never used for errors that need a decision.
 */
import * as React from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';
import { cn } from './ui/utils';

export interface Toast { id: number; title: string; sub?: string; tone?: 'ok' | 'info'; action?: { label: string; onClick: () => void } }
type Push = (t: Omit<Toast, 'id'>) => void;

const ToastContext = React.createContext<Push>(() => {});
export const useToast = () => React.useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<Toast[]>([]);
  const dismiss = React.useCallback((id: number) => setItems((x) => x.filter((t) => t.id !== id)), []);
  const push = React.useCallback<Push>((t) => {
    const id = Date.now() + Math.random();
    setItems((x) => [...x.slice(-2), { id, tone: 'ok', ...t }]);
    window.setTimeout(() => dismiss(id), t.action ? 7000 : 4500);
  }, [dismiss]);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed top-[68px] right-6 z-[60] flex w-[360px] flex-col gap-2 font-sans">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-[8px] border border-line bg-white px-4 py-3 text-[14px] text-ink shadow-[0_8px_24px_rgba(0,0,0,0.14)]',
              'animate-in slide-in-from-top-2 fade-in duration-200 ease-out',
            )}
          >
            {t.tone === 'info' ? <Info className="mt-0.5 size-[18px] shrink-0 text-uem" strokeWidth={1.7} /> : <CheckCircle2 className="mt-0.5 size-[18px] shrink-0 text-ok" strokeWidth={1.7} />}
            <span className="flex min-w-0 grow flex-col gap-0.5">
              <span className="font-semibold text-heading">{t.title}</span>
              {t.sub && <span className="text-[13px] leading-[18px] text-muted">{t.sub}</span>}
              {t.action && (
                <button type="button" onClick={() => { t.action!.onClick(); dismiss(t.id); }} className="mt-1 self-start border-0 bg-transparent p-0 text-[13px] font-semibold text-uem hover:underline">
                  {t.action.label}
                </button>
              )}
            </span>
            <button type="button" aria-label="Dismiss" onClick={() => dismiss(t.id)} className="flex shrink-0 border-0 bg-transparent p-0 text-muted hover:text-ink">
              <X className="size-4" strokeWidth={1.7} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
