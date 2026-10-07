/**
 * UEM building blocks. Each one wraps a shared miniOrange kit component
 * (src/components/ui, from Secure Share / AI Agent Governance) and applies
 * the UEM product styling from the design file.
 */
import * as React from 'react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from './ui/sheet';
import { cn } from './ui/utils';
import type { Source } from '../data';

/* Buttons ---------------------------------------------------------------- */
type Tone = 'primary' | 'outline' | 'neutral' | 'danger' | 'disabled';
const tones: Record<Tone, string> = {
  primary: 'bg-uem text-white hover:bg-[#1565c0] active:bg-[#0d47a1] border-0',
  outline: 'bg-white text-uem border border-uem hover:bg-uem-soft',
  neutral: 'bg-white text-ink border border-[#bdbdbd] hover:bg-[#f5f5f5]',
  danger: 'bg-bad text-white hover:bg-[#c62828] border-0',
  disabled: 'bg-[#e0e0e0] text-[#757575] border-0',
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
        'rounded-[4px] font-medium active:scale-100 gap-2 [&_svg:not([class*=size-])]:size-[18px]',
        size === 'sm' && 'h-[34px] px-3 text-[14px]',
        size === 'md' && 'h-[38px] px-3.5 text-[15px]',
        size === 'lg' && 'h-[40px] px-4 text-[15px]',
        tones[tone],
        className,
      )}
    />
  );
}

/* App icon, chips and badges -------------------------------------------- */
export function AppIcon({ initials, color, size = 42 }: { initials: string; color: string; size?: number }) {
  const small = size < 32;
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center font-bold text-white"
      style={{
        width: size,
        height: size,
        borderRadius: small ? 6 : 10,
        background: color,
        fontSize: small ? 10 : size > 44 ? 17 : 15,
      }}
    >
      {initials}
    </span>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <Badge className="rounded-[12px] border-0 bg-chip px-2.5 py-[3px] text-[12px] font-normal whitespace-nowrap text-ink">
      {children}
    </Badge>
  );
}

export function SourceBadge({ source, size = 'sm' }: { source: Source; size?: 'sm' | 'md' }) {
  const store = source === 'App Store';
  return (
    <Badge
      className={cn(
        'rounded-[10px] border-0 font-medium whitespace-nowrap',
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
        'min-w-[22px] rounded-[11px] px-[7px] py-px text-center text-[12px] font-semibold',
        active ? 'bg-uem-soft text-uem' : 'bg-[#f5f5f5] text-muted',
      )}
    >
      {n}
    </span>
  );
}

export function LaterBadge() {
  return (
    <span className="rounded-[3px] border border-later px-1.5 py-px text-[10px] font-semibold text-later">LATER</span>
  );
}

/* Form controls ---------------------------------------------------------- */
export function USwitch(props: React.ComponentProps<typeof Switch>) {
  return (
    <Switch
      {...props}
      className={cn(
        'h-[14px] w-[34px] overflow-visible border-0 [&>svg]:hidden',
        'data-[state=checked]:bg-[#90caf9] data-[state=checked]:hover:bg-[#90caf9]',
        'data-[state=unchecked]:bg-[#9e9e9e] data-[state=unchecked]:hover:bg-[#9e9e9e]',
        '[&>span]:size-5 [&>span]:shadow-[0_1px_3px_rgba(0,0,0,0.35)]',
        'data-[state=checked]:[&>span]:translate-x-[16px] data-[state=checked]:[&>span]:bg-uem',
        'data-[state=unchecked]:[&>span]:-translate-x-[2px] data-[state=unchecked]:[&>span]:bg-[#fafafa]',
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
        'size-[18px] rounded-[2px] border-2 border-[#757575] bg-white',
        'data-[state=checked]:border-uem data-[state=checked]:bg-uem data-[state=checked]:text-white',
        'disabled:border-[#bdbdbd] disabled:data-[state=checked]:border-[#bdbdbd] disabled:data-[state=checked]:bg-[#bdbdbd]',
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
          <SheetTitle className="text-[22px] font-medium text-heading">{title}</SheetTitle>
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
