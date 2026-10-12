import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '../components/ui/alert-dialog';
import { UButton } from '../components/uem';
import { plural, profile } from '../data';

/* The one interrupt that stays a modal: leaving the page would lose unsaved work.
   Every other confirm is inline, in the row or card that owns the action (see DESIGN.md). */
const content = 'max-w-[560px] gap-0 rounded-[10px] border-0 bg-white p-6 font-sans text-ink shadow-[0_12px_32px_rgba(0,0,0,0.2)] sm:max-w-[560px]';
const title = 'text-[20px] font-semibold text-heading';
const desc = 'mt-3.5 text-[14px] leading-[1.55] text-ink';
const actions = 'mt-6 flex justify-end gap-3';

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
