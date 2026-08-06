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
    <Card className="rounded-3xl border border-border/80 bg-card/90 shadow-[0_24px_80px_rgba(4,8,20,0.35)] backdrop-blur-sm">
      <CardHeader className="space-y-2 px-6 pt-6 pb-0 sm:px-7">
        <Badge variant="outline" className="w-fit border-primary/20 bg-primary/8 px-3 py-1 text-[11px] tracking-[0.24em] text-primary uppercase">
          Result
        </Badge>
        <CardTitle className="text-2xl font-semibold text-foreground">Network feedback</CardTitle>
        <CardDescription className="text-sm leading-6 text-muted-foreground">
          Follow the transaction lifecycle from validation to submission, then capture the resulting hash for demo evidence.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pt-6 pb-6 sm:px-7">
        <Alert
          variant={isError ? "destructive" : "default"}
          className={
            isSuccess
              ? "rounded-[28px] border-emerald-500/25 bg-emerald-500/10"
              : isError
                ? "rounded-[28px] border-destructive/30 bg-destructive/8"
                : "rounded-[28px] border-border/80 bg-secondary/30"
          }
        >
          <AlertTitle className={isSuccess ? "text-emerald-200" : "text-foreground"}>Status: {statusLabel}</AlertTitle>
          <AlertDescription className={isSuccess ? "text-emerald-50/90" : isError ? "text-rose-100/90" : "text-muted-foreground"}>
            <p>{tx.message ?? "No transaction submitted yet."}</p>
            {tx.hash ? (
              <div className="mt-4 space-y-4 rounded-2xl border border-border/70 bg-background/40 px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Transaction hash</p>
                  <Badge variant="outline" className="border-primary/20 bg-primary/8 font-mono text-primary">
                    {shortHash(tx.hash)}
                  </Badge>
                </div>
                <p className="break-all font-mono text-xs text-foreground">{tx.hash}</p>
                <div className="flex flex-col gap-4 border-t border-border/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs text-muted-foreground">Captured for White Belt submission evidence.</span>
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
