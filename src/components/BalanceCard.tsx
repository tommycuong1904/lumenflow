import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FRIEND_BOT_URL } from "@/lib/stellar/constants";
import type { BalanceState } from "@/lib/stellar/types";
import { formatBalance } from "@/lib/utils/format";

type BalanceCardProps = {
  balance: BalanceState;
  publicKey: string | null;
  onRefresh: () => Promise<void>;
};

export function BalanceCard({ balance, publicKey, onRefresh }: BalanceCardProps) {
  const friendbotHref = publicKey ? `${FRIEND_BOT_URL}/?addr=${encodeURIComponent(publicKey)}` : null;
  const refreshLabel = balance.loading ? "Refreshing balance..." : publicKey ? "Refresh balance" : "Connect wallet first";

  return (
    <Card className="rounded-3xl border border-border/80 bg-card/90 shadow-[var(--surface-shadow-card)] backdrop-blur-sm">
      <CardHeader className="flex flex-col gap-4 px-5 pt-6 pb-0 sm:flex-row sm:items-start sm:justify-between sm:px-7">
        <div className="space-y-2">
          <Badge variant="outline" className="w-fit border-primary/20 bg-primary/8 px-3 py-1 text-[11px] tracking-[0.24em] text-primary uppercase">
            Balance
          </Badge>
          <CardTitle className="text-2xl font-semibold text-foreground">Testnet XLM</CardTitle>
          <CardDescription className="max-w-xl text-sm leading-6 text-muted-foreground">
            Refresh the currently available XLM balance for your connected Stellar Testnet account.
          </CardDescription>
        </div>
        <CardAction className="w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onRefresh}
            disabled={balance.loading || !publicKey}
            className="w-full rounded-full border-border bg-secondary/50 px-5 text-secondary-foreground hover:bg-secondary/80 sm:w-auto"
          >
            {refreshLabel}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-5 px-6 pt-6 pb-6 sm:px-7">
        <div className="rounded-[28px] border border-border/80 bg-background/40 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">Available balance</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-foreground">{formatBalance(balance.xlm)} XLM</p>
            </div>
            <Badge
              variant="outline"
              className={balance.funded ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-border bg-secondary/50 text-muted-foreground"}
            >
              {publicKey ? (balance.funded ? "Funded" : "Unfunded") : "No wallet"}
            </Badge>
          </div>
        </div>

        {!balance.funded && publicKey ? (
          <Alert className="rounded-2xl border-amber-400/20 bg-amber-400/8">
            <AlertTitle className="text-sm font-medium text-amber-100">Funding required</AlertTitle>
            <AlertDescription className="text-sm leading-6 text-amber-50/90">
              Wallet connected, but this Testnet account is not funded yet.
              {friendbotHref ? (
                <>
                  {" "}
                  <a className="font-semibold underline underline-offset-4" href={friendbotHref} target="_blank" rel="noreferrer">
                    Fund it with Friendbot
                  </a>
                  .
                </>
              ) : null}
            </AlertDescription>
          </Alert>
        ) : null}

        {balance.error ? (
          <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/8">
            <AlertTitle className="text-sm font-medium">Balance error</AlertTitle>
            <AlertDescription className="text-sm leading-6">{balance.error}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
