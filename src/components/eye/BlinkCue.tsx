import { Eye, X } from "lucide-react";

export function BlinkCue({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-6 z-40 mx-auto flex max-w-sm items-center gap-3 rounded-full border bg-card px-4 py-3 shadow-soft animate-rise"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
        <Eye className="h-5 w-5 animate-blink" />
      </span>
      <div className="flex-1 text-sm">
        <p className="font-semibold">Blink check</p>
        <p className="text-muted-foreground">Close your eyes fully, 3 slow blinks.</p>
      </div>
      <button
        onClick={onClose}
        aria-label="Dismiss blink reminder"
        className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
