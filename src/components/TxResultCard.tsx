import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TxState } from "@/lib/stellar/types";
import { cn } from "@/lib/utils";
import { shortHash } from "@/lib/utils/format";

type TxResultCardProps = {
  tx: TxState;
};

const statusLabels: Record<TxState["status"], string> = {
  idle: "Idle",
  validating: "Validating",
  signing: "Awaiting wallet signature",
  submitting: "Submitting to Stellar",
  success: "Success",
  error: "Error",
};

function getExplorerLink(hash: string) {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}

export function TxResultCard({ tx }: TxResultCardProps) {
  const isSuccess = tx.status === "success";
  const isError = tx.status === "error";
  const statusLabel = statusLabels[tx.status];

  return (
    <Card className="rounded-3xl border border-border/80 bg-card/90 shadow-[var(--surface-shadow-card)] backdrop-blur-sm">
      <CardHeader className="space-y-2 px-6 pt-6 pb-0 sm:px-7">
        <Badge variant="outline" className="w-fit border-primary/20 bg-primary/8 px-3 py-1 text-[11px] tracking-[0.24em] text-primary uppercase">
          Result
        </Badge>
        <CardTitle className="text-2xl font-semibold text-foreground">Payment status</CardTitle>
        <CardDescription className="text-sm leading-6 text-muted-foreground">
          Track each payment from review to submission, then open the final transaction on Stellar Expert if you want the full onchain details.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pt-6 pb-6 sm:px-7">
        <Alert
          variant={isError ? "destructive" : "default"}
          className={cn(
            "min-w-0 overflow-hidden",
            isSuccess
              ? "rounded-[28px] border-emerald-500/25 bg-emerald-500/10"
              : isError
                ? "rounded-[28px] border-destructive/30 bg-destructive/8"
                : "rounded-[28px] border-border/80 bg-secondary/30",
          )}
        >
          <AlertTitle className={cn("min-w-0 break-words", isSuccess ? "text-emerald-200" : "text-foreground")}>
            Status: {statusLabel}
          </AlertTitle>
          <AlertDescription
            className={cn(
              "min-w-0",
              isSuccess ? "text-emerald-50/90" : isError ? "text-rose-100/90" : "text-muted-foreground",
            )}
          >
            <p className="break-all">{tx.message ?? "No transaction submitted yet."}</p>
            {tx.hash ? (
              <div className="mt-4 space-y-4 rounded-2xl border border-border/70 bg-background/40 px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Transaction hash</p>
                </div>

                <div className="grid gap-3 grid-cols-1">
                  {tx.hash ? (
                    <div className="rounded-2xl border border-border/60 bg-secondary/25 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Tx hash</p>
                      <p className="mt-2 break-all text-sm font-medium text-foreground">{tx.hash}</p>
                    </div>
                  ) : null}
                  {tx.amount ? (
                    <div className="rounded-2xl border border-border/60 bg-secondary/25 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Amount</p>
                      <p className="mt-2 text-sm font-medium text-foreground">{tx.amount} XLM</p>
                    </div>
                  ) : null}
                  {tx.recipient ? (
                    <div className="rounded-2xl border border-border/60 bg-secondary/25 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Recipient</p>
                      <p className="mt-2 break-all text-sm font-medium text-foreground">{tx.recipient}</p>
                    </div>
                  ) : null}
                  {tx.memo ? (
                    <div className="rounded-2xl border border-border/60 bg-secondary/25 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Memo</p>
                      <p className="mt-2 break-words text-sm font-medium text-foreground">{tx.memo}</p>
                    </div>
                  ) : null}
                  {tx.mode ? (
                    <div className="rounded-2xl border border-border/60 bg-secondary/25 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Mode</p>
                      <p className="mt-2 text-sm font-medium text-foreground">{tx.mode === "contract" ? "Contract" : "Native transfer"}</p>
                    </div>
                  ) : null}
                  {tx.paymentIntentId ? (
                    <div className="rounded-2xl border border-border/60 bg-secondary/25 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Payment intent</p>
                      <p className="mt-2 break-all text-sm font-medium text-foreground">{tx.paymentIntentId}</p>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-4 border-t border-border/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs text-muted-foreground">Open the transaction on Stellar Expert for the full onchain record.</span>
                  <a
                    href={getExplorerLink(tx.hash)}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "w-full rounded-full border-border bg-background/60 px-4 text-xs text-foreground hover:bg-background sm:w-auto",
                    )}
                  >
                    View on Stellar Expert
                  </a>
                </div>
              </div>
            ) : null}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
