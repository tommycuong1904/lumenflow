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
import { AddressBook } from "@/components/AddressBook";
import { getEscrowVaultConfig, getPaymentIntentConfig } from "@/lib/stellar/contract";
import type { SendFormState, TxState, WalletState } from "@/lib/stellar/types";
import { cn } from "@/lib/utils";

type SendPaymentFormProps = {
  wallet: WalletState;
  form: SendFormState;
  tx: TxState;
  isConfirming: boolean;
  onChange: (patch: Partial<SendFormState>) => void;
  onSubmit: () => void;
  onConfirm: () => Promise<void>;
  onCancelConfirmation: () => void;
  lastSuccessfulRecipient?: string | null;
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
  lastSuccessfulRecipient,
}: SendPaymentFormProps) {
  const isBusy = tx.status === "validating" || tx.status === "signing" || tx.status === "submitting";
  const contractConfig = getPaymentIntentConfig();
  const escrowConfig = getEscrowVaultConfig();
  const contractReady = contractConfig.ready;
  const escrowReady = escrowConfig.ready;
  const isContractMode = form.mode === "contract";
  const isEscrowMode = form.mode === "escrow";
  const paymentNotes = wallet.connected
    ? isConfirming
      ? isEscrowMode
        ? "Review the escrow details below. Your wallet will open after you confirm to create the escrow onchain."
        : isContractMode
          ? "Review the payment details below. Your wallet will open after you confirm to create the payment intent onchain."
          : "Review the payment details below. Your wallet will open only after you confirm."
      : isEscrowMode
        ? "Escrow mode creates a live onchain escrow on Testnet with recipient, amount, and memo."
        : isContractMode
          ? "Contract mode creates an onchain payment intent that you can sign and track on Testnet."
          : "Fill in the payment details, then choose Review payment before opening your wallet."
    : "Connect your Stellar wallet on Testnet before reviewing or sending a payment.";

  return (
    <Card className="rounded-3xl border border-border/80 bg-card/90 shadow-[var(--surface-shadow-card)] backdrop-blur-sm">
      <CardHeader className="space-y-2 px-6 pt-6 pb-0 sm:px-7">
        <Badge variant="outline" className="w-fit border-primary/20 bg-primary/8 px-3 py-1 text-[11px] tracking-[0.24em] text-primary uppercase">
          Payment
        </Badge>
        <CardTitle className="text-2xl font-semibold text-foreground">Send XLM on Testnet</CardTitle>
        <CardDescription className="max-w-xl text-sm leading-6 text-muted-foreground">
          Choose how you want to send on Testnet: use Native transfer for a direct XLM payment, Contract mode for an onchain payment intent, or Escrow mode for a live Level 3 escrow flow.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 px-6 pt-6 pb-6 sm:px-7">
        <AddressBook
          onUseAddress={(address) => onChange({ recipient: address })}
          autoSaveAddress={lastSuccessfulRecipient}
        />

        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label className="text-sm font-medium text-foreground">Transfer mode</Label>
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => onChange({ mode: "native_transfer" })}
                disabled={isBusy || isConfirming}
                aria-pressed={form.mode === "native_transfer"}
                className={cn(
                  "flex min-h-[92px] w-full flex-col items-start justify-center gap-1 rounded-2xl border px-4 py-5 text-left transition-colors",
                  form.mode === "native_transfer"
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background/80 text-foreground hover:bg-muted/60",
                  (isBusy || isConfirming) && "cursor-not-allowed opacity-50"
                )}
              >
                <span className="font-medium">Native transfer</span>
                <span className={cn("text-xs", form.mode === "native_transfer" ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  Send XLM directly on Testnet
                </span>
              </button>
              <button
                type="button"
                onClick={() => onChange({ mode: "contract" })}
                disabled={!contractReady || isBusy || isConfirming}
                aria-pressed={form.mode === "contract"}
                className={cn(
                  "flex min-h-[92px] w-full flex-col items-start justify-center gap-1 rounded-2xl border px-4 py-5 text-left transition-colors",
                  form.mode === "contract"
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background/80 text-foreground hover:bg-muted/60",
                  (!contractReady || isBusy || isConfirming) && "cursor-not-allowed opacity-50"
                )}
              >
                <span className="font-medium">Contract mode</span>
                <span className={cn("text-xs", form.mode === "contract" ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  Create a payment intent onchain
                </span>
              </button>
              <button
                type="button"
                onClick={() => onChange({ mode: "escrow" })}
                disabled={!escrowReady || isBusy || isConfirming}
                aria-pressed={form.mode === "escrow"}
                className={cn(
                  "flex min-h-[92px] w-full flex-col items-start justify-center gap-1 rounded-2xl border px-4 py-5 text-left transition-colors",
                  form.mode === "escrow"
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background/80 text-foreground hover:bg-muted/60",
                  (!escrowReady || isBusy || isConfirming) && "cursor-not-allowed opacity-50"
                )}
              >
                <span className="font-medium">Escrow mode</span>
                <span className={cn("text-xs", form.mode === "escrow" ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  Create a live escrow onchain
                </span>
              </button>
            </div>
          </div>
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
              <p className="text-sm font-medium text-foreground">{isConfirming ? (isEscrowMode ? "Review escrow" : isContractMode ? "Review contract payment" : "Review payment") : isEscrowMode ? "Escrow ready" : isContractMode ? "Contract payment ready" : "Ready to sign"}</p>
              <p className="text-sm leading-6 text-muted-foreground">
                {isConfirming
                  ? isEscrowMode
                    ? "Check the destination, amount, and memo before creating the live escrow in your wallet."
                    : isContractMode
                      ? "Check the destination and amount before creating the payment intent in your wallet."
                      : "Check the destination, amount, and memo before opening your wallet."
                  : wallet.connected
                    ? isEscrowMode
                      ? "After you confirm, your wallet will create a live escrow on Stellar Testnet."
                      : isContractMode
                        ? "After you confirm, your wallet will create a payment intent on Stellar Testnet."
                        : "After you confirm, your wallet will open a signature request for the payment."
                    : "Connect your wallet first to start sending."}
              </p>
              <p className="text-xs leading-5 text-muted-foreground/90">
                {isEscrowMode
                  ? escrowReady
                    ? `Escrow contract is connected (${escrowConfig.contractId.slice(0, 10)}...).`
                    : `Escrow setup is missing. RPC target: ${escrowConfig.rpcUrl}`
                  : isContractMode
                    ? contractReady
                      ? `Payment intent contract is connected (${contractConfig.contractId.slice(0, 10)}...).`
                      : `Payment intent setup is missing. RPC target: ${contractConfig.rpcUrl}`
                    : "Native transfer uses Horizon Testnet directly; no contract is required."}
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
                {form.mode === "escrow" ? "Review escrow" : form.mode === "contract" ? "Review contract payment" : "Review payment"}
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
                <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Mode</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{form.mode === "escrow" ? "Escrow" : form.mode === "contract" ? "Contract" : "Native transfer"}</p>
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
