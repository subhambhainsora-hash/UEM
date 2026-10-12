/**
 * Design-system primitives from the mO WEB Design System (Figma: UEM Dashboard design,
 * frame "Extensible SSO"). Each one wraps a shared kit component where one exists.
 */
import * as React from 'react';
import { Input } from './ui/input';
import { cn } from './ui/utils';
import { UButton } from './uem';
import infoIcon from '../assets/ds/info.svg';
import plusIcon from '../assets/ds/plus.svg';
import infoFill from '../assets/ds/information-fill.svg';
import radioOn from '../assets/ds/radio-on.svg';
import radioOff from '../assets/ds/radio-off.svg';

/* Text ----------------------------------------------------------------- */
export function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="m-0 text-[24px] leading-[32px] font-bold text-heading">{children}</h1>;
}
export function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[5px] pb-2.5">
      <h2 className="m-0 text-[20px] leading-[27px] font-semibold text-heading">{children}</h2>
      {sub && <p className="m-0 text-[15px] leading-5 text-muted">{sub}</p>}
    </div>
  );
}

/* Badge [1.1] · Required --------------------------------------------- */
export function RequiredBadge({ children = 'Required' }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[8px] bg-chip px-2.5 py-[2.5px] font-['Inter'] text-[13px] leading-[15px] font-medium tracking-[0.02em] text-[#262626]">
      {children}
    </span>
  );
}

export function InfoDot({ title }: { title?: string }) {
  return <img src={infoIcon} alt="" title={title} width={16} height={16} className="size-4 shrink-0" />;
}

/* Field label row: label · Required · info ---------------------------- */
export function FieldLabel({ children, required, info, size = 'sm', htmlFor }: {
  children: React.ReactNode; required?: boolean; info?: string; size?: 'sm' | 'md'; htmlFor?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={htmlFor} className={cn('font-semibold text-heading', size === 'md' ? 'text-[18px] leading-6' : 'text-[14px] leading-[19px]')}>
        {children}
      </label>
      {required && <RequiredBadge />}
      {info && <InfoDot title={info} />}
    </div>
  );
}

/* Input field ---------------------------------------------------------- */
export const fieldClass =
  'h-11 w-full rounded-[6px] border border-line bg-white px-2.5 text-[14px] leading-5 text-ink shadow-none placeholder:text-placeholder focus-visible:border-uem focus-visible:ring-0 aria-invalid:border-bad';

export function Field({ label, required, info, id, className, trailing, error, ...props }: React.ComponentProps<typeof Input> & {
  label: React.ReactNode; required?: boolean; info?: string; trailing?: React.ReactNode; error?: string;
}) {
  const inputId = id ?? React.useId();
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <FieldLabel htmlFor={inputId} required={required} info={info}>{label}</FieldLabel>
      <div className="relative">
        <Input id={inputId} {...props} aria-invalid={error ? true : undefined} className={cn(fieldClass, trailing && 'pr-9')} />
        {trailing && <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[#5c5c5c]">{trailing}</span>}
      </div>
      {error && <p className="m-0 text-[12px] text-bad">{error}</p>}
    </div>
  );
}

/* Input + trailing "Add" button (Identity Provider URLs pattern) ------- */
export function AddRow({ label, required, info, placeholder, buttonLabel, onAdd, value, onChange }: {
  label: string; required?: boolean; info?: string; placeholder: string; buttonLabel: string;
  onAdd: (v: string) => void; value: string; onChange: (v: string) => void;
}) {
  const id = React.useId();
  const add = () => { if (value.trim()) { onAdd(value.trim()); onChange(''); } };
  return (
    <div className="flex flex-col gap-[11px]">
      <FieldLabel htmlFor={id} required={required} info={info}>{label}</FieldLabel>
      <div className="flex items-start gap-2">
        <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder={placeholder} className={fieldClass} />
        <UButton onClick={add} className="h-11 shrink-0 rounded-[9px] px-4 text-[13px] font-normal">
          <img src={plusIcon} alt="" width={15} height={15} className="size-[15px]" />
          {buttonLabel}
        </UButton>
      </div>
    </div>
  );
}

/* Alert & Notification & Toast [1.1] ---------------------------------- */
export function InfoCard({ title, sub }: { title: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-[12px] border border-[#f3f3f3] bg-gradient-to-r from-white to-[#ebf1ff] px-5 py-3.5">
      <p className="m-0 font-['Inter'] text-[16px] leading-5 font-medium tracking-[-0.006em] text-[#171717]">{title}</p>
      {sub && <p className="m-0 font-['Inter'] text-[12px] leading-5 text-[#171717]/72">{sub}</p>}
    </div>
  );
}
export function InfoAlert({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'warn' | 'error' }) {
  const tones = { info: 'bg-info-bg text-[#171717]', warn: 'bg-[#fff3e0] text-[#7b341e]', error: 'bg-[#fdecea] text-bad' };
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex items-start gap-2.5 rounded-[8px] px-5 py-3 text-[14px] leading-[22px]', tones[tone])}>
      <span className="flex h-[22px] shrink-0 items-center"><img src={infoFill} alt="" width={20} height={20} className="size-5 shrink-0" /></span>
      <p className="m-0 min-w-0 grow">{children}</p>
    </div>
  );
}

/* Section header with icon tile ---------------------------------------- */
export function SectionHeader({ icon, children, action }: { icon: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-[15px]">
        <img src={icon} alt="" width={33} height={33} className="size-[33px]" />
        <h3 className="m-0 text-[18px] leading-6 font-semibold text-heading">{children}</h3>
      </div>
      {action && <span className="ml-auto">{action}</span>}
    </div>
  );
}

/* Empty state ---------------------------------------------------------- */
export function EmptyState({ icon, title, sub, action, className }: { icon: string; title: string; sub?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex min-h-[200px] w-full flex-col items-center justify-center gap-2.5 rounded-[12px] border-[1.5px] border-dashed border-dash px-6 py-[30px] text-center', className)}>
      <img src={icon} alt="" width={51} height={51} className="size-[51px]" />
      <div className="flex flex-col items-center gap-[5px]">
        <p className="m-0 text-[18px] leading-6 font-semibold text-heading">{title}</p>
        {sub && <p className="m-0 text-[12px] leading-5 text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* Checkbox Card [1.1] (radio variant) ---------------------------------- */
export function RadioCard({ checked, onSelect, title, sub, name }: { checked: boolean; onSelect: () => void; title: string; sub: string; name: string }) {
  return (
    <label className={cn('flex grow cursor-pointer items-start gap-[18px] rounded-[6px] border-[1.26px] bg-white px-5 py-[15px]', checked ? 'border-uem' : 'border-line')}>
      <input type="radio" name={name} checked={checked} onChange={onSelect} className="sr-only" />
      <img src={checked ? radioOn : radioOff} alt="" width={20} height={20} className="mt-2.5 size-5" />
      <span className="flex flex-col">
        <span className="text-[14px] leading-[19px] font-semibold text-heading">{title}</span>
        <span className="text-[12px] leading-5 text-heading">{sub}</span>
      </span>
    </label>
  );
}

/* Page footer actions -------------------------------------------------- */
export function FooterActions({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-end gap-2.5">{children}</div>;
}

/* Profile Name + Description · top of every section in the Figma frame ---- */
export function ProfileFields({ onChange }: { onChange?: () => void }) {
  return (
    <div className="flex gap-[15px]">
      <Field className="w-[308px] shrink-0" label="Profile Name" info="Shown in the profile list and on devices" placeholder="e.g., Company SSO Profile" defaultValue="Sales Baseline" onChange={onChange} />
      <Field className="grow" label={<>Description <span className="font-bold text-[red]">*</span></>} info="Why this profile exists" placeholder="Brief description of this profile" defaultValue="iOS baseline for the field sales team" onChange={onChange} />
    </div>
  );
}

/* Tabs · kit Tabs draws the single 2px indicator; these only size the trigger -- */
export const tabListClass = 'h-auto w-full justify-start gap-0 rounded-none bg-transparent p-0';
export const tabTriggerClass =
  'h-11 flex-none gap-2 rounded-none px-4 text-[14px] font-normal text-ink after:inset-x-0 data-[state=active]:font-semibold data-[state=active]:text-uem';
