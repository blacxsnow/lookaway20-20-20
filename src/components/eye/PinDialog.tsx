import { useState } from "react";
import { Lock } from "lucide-react";

import { PanelDialog } from "@/components/eye/PanelDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkPin } from "@/lib/kids-mode";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  pinHash: string | null;
  reason: string;
  onSuccess: () => void;
}

/** Asks a parent for the Kids-mode PIN before a protected action. */
export function PinDialog({ open, onOpenChange, pinHash, reason, onSuccess }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await checkPin(pin, pinHash)) {
      setPin("");
      setError(false);
      onOpenChange(false);
      onSuccess();
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <PanelDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setPin("");
          setError(false);
        }
        onOpenChange(o);
      }}
      title="Parent PIN"
      description={reason}
    >
      <form onSubmit={submit} className="space-y-3">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            inputMode="numeric"
            type="password"
            maxLength={4}
            aria-label="4-digit PIN"
            placeholder="• • • •"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="h-12 rounded-2xl pl-9 text-center text-xl tracking-[0.5em]"
          />
        </div>
        {error && <p className="text-sm text-destructive">That PIN didn't match. Try again.</p>}
        <Button type="submit" variant="hero" className="w-full" disabled={pin.length !== 4}>
          Unlock
        </Button>
      </form>
    </PanelDialog>
  );
}
