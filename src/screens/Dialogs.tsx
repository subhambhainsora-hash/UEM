import { LockOpen, Smartphone } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '../components/ui/alert-dialog';
import { AppIcon, UButton } from '../components/uem';

const content = 'max-w-[560px] gap-0 rounded-[10px] border-0 bg-white p-6 font-sans text-ink shadow-[0_12px_32px_rgba(0,0,0,0.2)] sm:max-w-[560px]';

/* D9 · Change App Store country (checked before save) */
export function CountryDialog({ to, from, open, onKeep, onSwitch }: { to: string; from: string; open: boolean; onKeep: () => void; onSwitch: () => void }) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className={content}>
        <AlertDialogTitle className="text-[20px] font-semibold text-heading">Switch App Store country to {to}?</AlertDialogTitle>
        <AlertDialogDescription className="mt-3.5 text-[14px] leading-[1.55] text-ink">
          We checked the 4 App Store apps in Sales Baseline against the {to} App Store. Devices keep apps sold in both stores, and nothing is
          reinstalled. In-house apps aren't affected.
        </AlertDialogDescription>
        <div className="mt-3.5 rounded-[4px] bg-[#fff3e0] px-3.5 py-3">
          <p className="m-0 text-[14px] font-semibold text-[#7b341e]">1 app isn't sold in {to} and will be removed</p>
          <div className="mt-2.5 flex items-center gap-2.5 text-[14px]">
            <AppIcon initials="CP" color="#455a64" size={26} />
            Contoso Payroll <span className="text-[12px] text-muted">devices uninstall it</span>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <UButton tone="outline" onClick={onKeep}>Keep {from}</UButton>
          <UButton onClick={onSwitch}>Remove 1 app and switch</UButton>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* K4 · Removing an app that Kiosk or SSO uses */
export function RemoveDialog({ name, open, usedByKiosk, usedBySso, onKeep, onRemove }: {
  name: string; open: boolean; usedByKiosk: boolean; usedBySso: boolean; onKeep: () => void; onRemove: () => void;
}) {
  const used = usedByKiosk || usedBySso;
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className={content}>
        <AlertDialogTitle className="text-[20px] font-semibold text-heading">Remove {name} from this profile?</AlertDialogTitle>
        <AlertDialogDescription className="mt-3.5 text-[14px] text-ink">
          Devices will uninstall it.{used ? ' Other sections of this profile also use it:' : ''}
        </AlertDialogDescription>
        {used && (
          <div className="mt-3.5 overflow-hidden rounded-[8px] border border-line">
            {usedByKiosk && (
              <div className="flex items-center gap-3 border-b border-row px-3.5 py-3 text-[14px] last:border-0">
                <Smartphone className="size-[18px]" strokeWidth={1.7} />
                <span className="grow"><b className="font-semibold">Kiosk</b> · devices are locked to this app</span>
                <span className="text-[12px] text-bad">Pick a new app before you submit</span>
              </div>
            )}
            {usedBySso && (
              <div className="flex items-center gap-3 px-3.5 py-3 text-[14px]">
                <LockOpen className="size-[18px]" strokeWidth={1.7} />
                <span className="grow"><b className="font-semibold">Extensible SSO</b> · allowed to use SSO</span>
                <span className="text-[12px] text-muted">Removed from the list</span>
              </div>
            )}
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <UButton tone="outline" onClick={onKeep}>Keep app</UButton>
          <UButton tone="danger" onClick={onRemove}>Remove from profile</UButton>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
