import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SendFormState, TxState, WalletState } from "@/lib/stellar/types";

type SendPaymentFormProps = {
  wallet: WalletState;
  form: SendFormState;
  tx: TxState;
  isConfirming: boolean;
  onChange: (patch: Partial<SendFormState>) => void;
  onSubmit: () => void;
  onConfirm: () => Promise<void>;
  onCancelConfirmation: () => void;
};

export function SendPaymentForm({
  wallet,
  form,
  tx,
  isConfirming,
  onChange,
  onSubmit,
  onConfirm,
  onCancelConfirmation,
}: SendPaymentFormProps) {
  const isBusy = tx.status === "validating" || tx.status === "signing" || tx.status === "submitting";
  const paymentNotes = wallet.connected
    ? isConfirming
      ? "Review the payment summary below. Freighter will open only after you confirm the details."
      : "Fill in the payment details, then choose Review payment before opening Freighter."
    : "Connect Freighter on Stellar Testnet before reviewing or sending a payment.";

  return (
    <Card className="rounded-3xl border border-border/80 bg-card/90 shadow-[0_24px_80px_rgba(4,8,20,0.35)] backdrop-blur-sm">
      <CardHeader className="space-y-2 px-6 pt-6 pb-0 sm:px-7">
        <Badge variant="outline" className="w-fit border-primary/20 bg-primary/8 px-3 py-1 text-[11px] tracking-[0.24em] text-primary uppercase">
          Payment
        </Badge>
        <CardTitle className="text-2xl font-semibold text-foreground">Send XLM on Testnet</CardTitle>
        <CardDescription className="max-w-xl text-sm leading-6 text-muted-foreground">
          Use an existing Stellar Testnet destination account for the MVP verification. This flow is intentionally limited to native XLM transfers.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 px-6 pt-6 pb-6 sm:px-7">
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="recipient-address" className="text-sm font-medium text-foreground">
              Recipient address
            </Label>
            <Input
              id="recipient-address"
              value={form.recipient}
              onChange={(event) => onChange({ recipient: event.target.value })}
              placeholder="G..."
              className="h-12 rounded-2xl border-border bg-background/50 px-4 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="send-amount" className="text-sm font-medium text-foreground">
                Amount
              </Label>
              <Input
                id="send-amount"
                value={form.amount}
                onChange={(event) => onChange({ amount: event.target.value })}
                placeholder="1"
                inputMode="decimal"
                className="h-12 rounded-2xl border-border bg-background/50 px-4 text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="memo" className="text-sm font-medium text-foreground">
                Memo (optional)
              </Label>
              <Input
                id="memo"
                value={form.memo}
                onChange={(event) => onChange({ memo: event.target.value })}
                placeholder="Thanks"
                className="h-12 rounded-2xl border-border bg-background/50 px-4 text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="payment-notes" className="text-sm font-medium text-foreground">
              Payment notes
            </Label>
            <Textarea
              id="payment-notes"
              value={paymentNotes}
              readOnly
              className="min-h-24 resize-none rounded-2xl border-border bg-secondary/35 text-sm leading-6 text-muted-foreground"
            />
          </div>
        </div>

        <div className="space-y-4 rounded-[24px] border border-border/80 bg-background/35 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{isConfirming ? "Review before signing" : "Ready to sign"}</p>
              <p className="text-sm leading-6 text-muted-foreground">
                {isConfirming
                  ? "Check the destination, amount, and memo before opening Freighter for signature."
                  : wallet.connected
                    ? "Freighter will open a signature request after you confirm the payment details."
                    : "Connect your wallet first to unlock sending."}
              </p>
            </div>
            {!isConfirming ? (
              <Button
                type="button"
                onClick={onSubmit}
                disabled={!wallet.connected || isBusy || isConfirming}
                size="lg"
                className="w-full shrink-0 rounded-full bg-primary px-5 text-primary-foreground hover:bg-[#7c3aed] sm:w-auto"
              >
                Review payment
              </Button>
            ) : null}
          </div>

          {isConfirming ? (
            <div className="space-y-4 rounded-2xl border border-primary/15 bg-primary/6 px-4 py-4 sm:px-5">
              <div className="grid gap-3 grid-cols-1">
                <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Recipient</p>
                  <p className="mt-2 break-all text-sm font-medium text-foreground">{form.recipient.trim()}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Amount</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{form.amount.trim()} XLM</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Memo</p>
                  <p className="mt-2 break-words text-sm font-medium text-foreground">{form.memo.trim() || "No memo"}</p>
                </div>
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancelConfirmation}
                  disabled={isBusy}
                  size="lg"
                  className="w-full rounded-full border-border bg-background/60 px-5 text-foreground hover:bg-background sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={onConfirm}
                  disabled={isBusy}
                  size="lg"
                  className="w-full rounded-full bg-primary px-5 text-primary-foreground hover:bg-[#7c3aed] sm:w-auto"
                >
                  {tx.status === "signing"
                    ? "Awaiting signature..."
                    : tx.status === "submitting"
                      ? "Submitting..."
                      : "Confirm & sign"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
