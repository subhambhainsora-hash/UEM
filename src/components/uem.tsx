/**
 * UEM building blocks. Each one wraps a shared miniOrange kit component
 * (src/components/ui, from Secure Share / AI Agent Governance) and applies
 * the UEM product styling from the design file.
 */
import * as React from 'react';
import { Package } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from './ui/sheet';
import { cn } from './ui/utils';
import type { Source } from '../data';

/* Buttons ---------------------------------------------------------------- */
type Tone = 'primary' | 'outline' | 'neutral' | 'link' | 'danger' | 'disabled';
/* mO WEB Design System buttons: 40px, 5px radius, 15px semibold. */
const tones: Record<Tone, string> = {
  primary: 'bg-uem text-white hover:bg-uem-hover active:bg-[#0747a6] border-0',
  outline: 'bg-white text-uem border-[1.5px] border-uem hover:bg-uem-soft',
  neutral: 'bg-white text-ink border border-line hover:bg-[#f3f3f5]',
  link: 'bg-transparent text-uem border-0 hover:bg-uem-soft hover:text-uem px-2',
  danger: 'bg-bad text-white hover:bg-[#ff5630] border-0',
  disabled: 'bg-[rgba(9,30,66,0.04)] text-[#adadad] border-0',
};

export function UButton({
  tone = 'primary',
  size = 'md',
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'size'> & { tone?: Tone; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <Button
      {...props}
      className={cn(
        'rounded-[5px] font-semibold active:scale-100 gap-1.5 [&_svg:not([class*=size-])]:size-4',
        size === 'sm' && 'h-8 px-3 text-[13px]',
        size === 'md' && 'h-9 px-3.5 text-[14px]',
        size === 'lg' && 'h-10 px-4 text-[15px]',
        tones[tone],
        className,
      )}
    />
  );
}

/* App icon, chips and badges -------------------------------------------- */
export function AppIcon({ logo, color, size = 42, name }: { logo?: string; color: string; size?: number; name?: string; initials?: string }) {
  const radius = Math.round(size * 0.225);
  if (logo)
    return (
      <img
        src={logo}
        alt={name ? `${name} icon` : ''}
        width={size}
        height={size}
        className="shrink-0 border border-black/10 object-cover"
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  /* In-house app: no public artwork, so a generic app tile in the app's colour. */
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center text-white"
      style={{ width: size, height: size, borderRadius: radius, background: color }}
    >
      <Package style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={1.7} />
    </span>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <Badge className="rounded-[8px] border-0 bg-chip px-2.5 py-[3px] font-['Inter'] text-[12px] font-medium whitespace-nowrap text-[#262626]">
      {children}
    </Badge>
  );
}

export function SourceBadge({ source, size = 'sm' }: { source: Source; size?: 'sm' | 'md' }) {
  const store = source === 'App Store';
  return (
    <Badge
      className={cn(
        'rounded-[8px] border-0 font-medium whitespace-nowrap',
        size === 'sm' ? 'px-2 py-[1px] text-[11px]' : 'px-2.5 py-[3px] text-[13px]',
        store ? 'bg-uem-soft text-[#1565c0]' : 'bg-[#fff3e0] text-[#7b341e]',
      )}
    >
      {source}
    </Badge>
  );
}

export function CountBadge({ n, active }: { n: number; active?: boolean }) {
  return (
    <span
      className={cn(
        'min-w-[22px] rounded-[8px] px-[7px] py-px text-center text-[12px] font-semibold',
        active ? 'bg-uem-soft text-uem' : 'bg-[#f5f5f5] text-muted',
      )}
    >
      {n}
    </span>
  );
}

export function LaterBadge() {
  return (
    <span className="rounded-[8px] bg-chip px-2 py-px font-['Inter'] text-[11px] font-medium text-[#262626]">Later</span>
  );
}

/* Form controls ---------------------------------------------------------- */
export function USwitch(props: React.ComponentProps<typeof Switch>) {
  return (
    <Switch
      {...props}
      className={cn(
        '[&>svg]:hidden',
        props.className,
      )}
    />
  );
}

export function UCheckbox(props: React.ComponentProps<typeof Checkbox>) {
  return (
    <Checkbox
      {...props}
      className={cn(
        'size-[18px] rounded-[4px] border border-[#8a8a8a] bg-white',
        'data-[state=checked]:border-uem data-[state=checked]:bg-uem data-[state=checked]:text-white',
        'disabled:border-line disabled:data-[state=checked]:border-line disabled:data-[state=checked]:bg-[#c1c7d0]',
        props.className,
      )}
    />
  );
}

export function ToggleRow({
  title,
  hint,
  checked,
  onChange,
}: {
  title: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-row py-[11px]">
      <div className="flex grow flex-col gap-0.5">
        <span className="text-[14px] font-medium text-heading">{title}</span>
        <span className="text-[12px] text-muted">{hint}</span>
      </div>
      <USwitch checked={checked} onCheckedChange={onChange} aria-label={title} />
    </div>
  );
}

/* Drawer: kit Sheet with the UEM header/footer layout -------------------- */
export function Drawer({
  open,
  onOpenChange,
  title,
  subtitle,
  width = 520,
  footer,
  children,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  subtitle?: string;
  width?: number;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        onOpenAutoFocus={(e) => e.preventDefault()}
        style={{ width, maxWidth: '100vw' }}
        className="gap-0 border-l border-soft bg-white p-0 font-sans text-ink sm:max-w-none [&>button:last-child]:top-[28px] [&>button:last-child]:right-[24px] [&>button:last-child]:opacity-100 [&>button:last-child>svg]:size-5"
      >
        <div className="shrink-0 px-6 pt-[22px] pb-4">
          <SheetTitle className="text-[20px] font-semibold text-heading">{title}</SheetTitle>
          {subtitle ? (
            <SheetDescription className="mt-1 text-[14px] text-muted">{subtitle}</SheetDescription>
          ) : (
            <SheetDescription className="sr-only">{title}</SheetDescription>
          )}
        </div>
        <div className="min-h-0 grow overflow-y-auto">{children}</div>
        <div className="flex shrink-0 items-center gap-3 border-t border-soft px-6 py-4">{footer}</div>
      </SheetContent>
    </Sheet>
  );
}

/* Signing state: icon + text, never colour alone ------------------------- */
import { AlertTriangle, Clock, ShieldCheck } from 'lucide-react';
import { signingState } from '../data';

export function SigningBadge({ expires, short }: { expires?: string; short?: boolean }) {
  const s = signingState(expires);
  if (s.kind === 'none') return <span className="text-[13px] text-muted">{s.label}</span>;
  if (s.kind === 'ok')
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] text-ink">
        <ShieldCheck className="size-4 text-ok" strokeWidth={1.7} />
        {s.label}
      </span>
    );
  if (s.kind === 'expiring')
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#fff3e0] px-2 py-0.5 text-[12px] font-medium text-[#7b341e]">
        <Clock className="size-3.5" strokeWidth={1.7} />
        {short ? `Expires in ${s.days} days` : `${s.label} · expires in ${s.days} days`}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#fdecea] px-2 py-0.5 text-[12px] font-medium text-bad">
      <AlertTriangle className="size-3.5" strokeWidth={1.7} />
      {short ? 'Signing expired' : `Expired ${s.label} · ${s.days} days ago`}
    </span>
  );
}
