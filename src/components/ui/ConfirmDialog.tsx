"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2.5rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-[13px] border border-line bg-surface-2 p-6 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.7)] motion-safe:animate-rise">
          <AlertDialog.Title className="font-serif text-[19px] font-semibold tracking-[-0.01em] text-ink">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-[13.5px] leading-relaxed text-ink-dim">
            {description}
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-2.5">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                className="rounded-[9px] border border-line-2 bg-surface-3 px-4 py-2 text-[13px] font-semibold text-ink-dim transition-colors duration-150 hover:text-ink"
              >
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={onConfirm}
                className="rounded-[9px] bg-loss px-4 py-2 text-[13px] font-bold text-[#2a0f0d] transition-all duration-150 hover:brightness-105 active:scale-[0.99]"
              >
                {confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
