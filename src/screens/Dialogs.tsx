import { AlertTriangle, CheckCircle2, LockOpen, Smartphone } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '../components/ui/alert-dialog';
import { AppIcon, UButton } from '../components/uem';
import { plural, profile } from '../data';

const content = 'max-w-[560px] gap-0 rounded-[10px] border-0 bg-white p-6 font-sans text-ink shadow-[0_12px_32px_rgba(0,0,0,0.2)] sm:max-w-[560px]';
const title = 'text-[20px] font-semibold text-heading';
const desc = 'mt-3.5 text-[14px] leading-[1.55] text-ink';
const actions = 'mt-6 flex justify-end gap-3';

/* D9 · Change App Store country (checked before save) */
export function CountryDialog({ to, from, open, onKeep, onSwitch }: { to: string; from: string; open: boolean; onKeep: () => void; onSwitch: () => void }) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className={content}>
        <AlertDialogTitle className={title}>Switch App Store country to {to}?</AlertDialogTitle>
        <AlertDialogDescription className={desc}>
          We checked the 4 App Store apps in {profile.name} against the {to} App Store. Devices keep apps sold in both stores, and nothing is
          reinstalled. In-house apps aren't affected.
        </AlertDialogDescription>
        <div className="mt-3.5 rounded-[4px] bg-[#fff3e0] px-3.5 py-3">
          <p className="m-0 text-[14px] font-semibold text-[#7b341e]">1 app isn't sold in {to} and will be removed from {plural(profile.deviceCount, 'device')}</p>
          <div className="mt-2.5 flex items-center gap-2.5 text-[14px]">
            <AppIcon color="#455a64" size={26} />
            Contoso Payroll <span className="text-[12px] text-muted">devices uninstall it at next check-in</span>
          </div>
        </div>
        <p className="mt-3 mb-0 text-[12px] text-muted">The switch and the removed app are recorded in the profile's audit log.</p>
        <div className={actions}>
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
        <AlertDialogTitle className={title}>Remove {name} from this profile?</AlertDialogTitle>
        <AlertDialogDescription className={desc}>
          {plural(profile.deviceCount, 'device')} in {profile.name} will uninstall it at next check-in.{used ? ' Other sections of this profile also use it:' : ''}
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
        <p className="mt-3 mb-0 text-[12px] text-muted">Nothing reaches devices until you submit the profile. Cancel discards this change.</p>
        <div className={actions}>
          <UButton tone="outline" onClick={onKeep}>Keep app</UButton>
          <UButton tone="danger" onClick={onRemove}>Remove from profile</UButton>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* Cancel with unsaved changes */
export function DiscardDialog({ open, count, onKeep, onDiscard }: { open: boolean; count: number; onKeep: () => void; onDiscard: () => void }) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className={content}>
        <AlertDialogTitle className={title}>Discard unsaved changes?</AlertDialogTitle>
        <AlertDialogDescription className={desc}>
          You made {plural(count, 'change')} to {profile.name} that haven't been submitted. Discarding them leaves the profile, and its {plural(profile.deviceCount, 'device')}, exactly as they are today.
        </AlertDialogDescription>
        <div className={actions}>
          <UButton tone="outline" onClick={onKeep}>Keep editing</UButton>
          <UButton tone="danger" onClick={onDiscard}>Discard changes</UButton>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export interface Issue { section: string; message: string }

/* Submit blocked by validation */
export function SubmitBlockedDialog({ open, issues, onClose, onGo }: { open: boolean; issues: Issue[]; onClose: () => void; onGo: (section: string) => void }) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className={content}>
        <AlertDialogTitle className={title}>Fix {plural(issues.length, 'issue')} before you submit</AlertDialogTitle>
        <AlertDialogDescription className={desc}>Nothing has been sent to devices. Each item below links to the section that needs a change.</AlertDialogDescription>
        <div className="mt-3.5 overflow-hidden rounded-[8px] border border-line">
          {issues.map((i) => (
            <div key={i.section + i.message} className="flex items-center gap-3 border-b border-row px-3.5 py-3 text-[14px] last:border-0">
              <AlertTriangle className="size-[18px] shrink-0 text-bad" strokeWidth={1.7} />
              <span className="grow"><b className="font-semibold">{i.section}</b> · {i.message}</span>
              <button type="button" onClick={() => onGo(i.section)} className="border-0 bg-transparent p-0 text-[13px] font-medium text-uem hover:underline">Go to {i.section}</button>
            </div>
          ))}
        </div>
        <div className={actions}>
          <UButton onClick={onClose}>OK</UButton>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* Submitted */
export function SavedDialog({ open, count, onClose }: { open: boolean; count: number; onClose: () => void }) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className={content}>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="size-7 fill-ok text-white" strokeWidth={2} />
          <AlertDialogTitle className={title}>Profile submitted</AlertDialogTitle>
        </div>
        <AlertDialogDescription className={desc}>
          {count === 0
            ? `Nothing was pending. ${profile.name} already matches what its ${plural(profile.deviceCount, 'device')} have.`
            : `${plural(count, 'change')} to ${profile.name} will reach ${plural(profile.deviceCount, 'device')} at their next check-in, usually within 15 minutes. The changes are recorded in the audit log with your name and the time.`}
        </AlertDialogDescription>
        <div className={actions}>
          <UButton onClick={onClose}>Done</UButton>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* SSO · Allow every app */
export function AllowAllSsoDialog({ open, appCount, onCancel, onConfirm }: { open: boolean; appCount: number; onCancel: () => void; onConfirm: () => void }) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className={content}>
        <AlertDialogTitle className={title}>Allow every app to use SSO?</AlertDialogTitle>
        <AlertDialogDescription className={desc}>
          This replaces the allow list. All {plural(appCount, 'app')} in this profile's App Catalog can use SSO now, and so can any app added to the catalog later, without another review.
        </AlertDialogDescription>
        <div className="mt-3.5 flex gap-2.5 rounded-[4px] bg-[#fff3e0] px-3.5 py-3 text-[13px] text-[#7b341e]">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={1.7} />
          Keep the allow list if any catalog app handles data that shouldn't be reachable with the corporate identity.
        </div>
        <div className={actions}>
          <UButton tone="outline" onClick={onCancel}>Keep the allow list</UButton>
          <UButton onClick={onConfirm}>Allow every app</UButton>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* Retiring the only available build */
export function LastBuildDialog({ open, appName, version, onClose }: { open: boolean; appName: string; version: string; onClose: () => void }) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className={content}>
        <AlertDialogTitle className={title}>Can't retire the only available build</AlertDialogTitle>
        <AlertDialogDescription className={desc}>
          {version} is the only build of {appName} that devices can install. Retiring it would leave every profile that uses this app with nothing to deliver. Restore an older build or upload a new one first.
        </AlertDialogDescription>
        <div className={actions}>
          <UButton onClick={onClose}>OK</UButton>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* Retire with impact */
export function RetireDialog({ open, appName, version, fallback, profiles, devices, onKeep, onRetire }: {
  open: boolean; appName: string; version: string; fallback: string; profiles: number; devices: number; onKeep: () => void; onRetire: () => void;
}) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className={content}>
        <AlertDialogTitle className={title}>Retire build {version} of {appName}?</AlertDialogTitle>
        <AlertDialogDescription className={desc}>
          {profiles === 0
            ? `No profile uses this app yet, so no device is affected.`
            : `${plural(profiles, 'profile')} and ${plural(devices, 'device')} currently get ${version}. They roll back to ${fallback} at next check-in.`}
          {' '}You can restore {version} at any time.
        </AlertDialogDescription>
        <div className={actions}>
          <UButton tone="outline" onClick={onKeep}>Keep {version}</UButton>
          <UButton tone="danger" onClick={onRetire}>Retire build</UButton>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
