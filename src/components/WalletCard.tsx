import { useEffect, useState } from "react";
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
import { toTitleCase, truncateAddress } from "@/lib/utils/format";
import type { WalletState } from "@/lib/stellar/types";
import { WalletQrCode } from "@/components/WalletQrCode";

type WalletCardProps = {
  wallet: WalletState;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
};

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/35 px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <p className="mt-2 break-all text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function WalletCard({ wallet, onConnect, onDisconnect }: WalletCardProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    if (copyState === "idle") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setCopyState("idle");
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [copyState]);

  async function handleCopyAddress() {
    if (!wallet.publicKey) return;

    const address = wallet.publicKey;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(address);
      } else {
        copyWithFallback(address);
      }
      setCopyState("copied");
    } catch {
      try {
        copyWithFallback(address);
        setCopyState("copied");
      } catch {
        setCopyState("error");
      }
    }
  }

  function copyWithFallback(text: string) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const succeeded = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (!succeeded) {
      throw new Error("execCommand copy failed");
    }
  }

  return (
    <Card className="rounded-3xl border border-border/80 bg-card/90 shadow-[var(--surface-shadow-card)] backdrop-blur-sm">
      <CardHeader className="flex flex-col gap-4 px-5 pt-6 pb-0 sm:flex-row sm:items-start sm:justify-between sm:px-7">
        <div className="space-y-2">
          <Badge variant="outline" className="w-fit border-primary/20 bg-primary/8 px-3 py-1 text-[11px] tracking-[0.24em] text-primary uppercase">
            Wallet
          </Badge>
          <CardTitle className="text-2xl font-semibold text-foreground">Wallet connection</CardTitle>
          <CardDescription className="max-w-xl text-sm leading-6 text-muted-foreground">
            Connect your Stellar wallet on Testnet to check your balance and start a payment.
          </CardDescription>
        </div>
        <CardAction className="w-full sm:w-auto">
          {wallet.connected ? (
            <Button type="button" variant="outline" size="lg" onClick={onDisconnect} className="w-full rounded-full border-border bg-secondary/50 px-5 text-secondary-foreground hover:bg-secondary/80 sm:w-auto">
              Disconnect
            </Button>
          ) : (
            <Button
              id="freighter-connect-button"
              type="button"
              size="lg"
              onClick={onConnect}
              disabled={wallet.loading || wallet.restoring}
              className="w-full rounded-full bg-primary px-5 text-primary-foreground hover:bg-[#7c3aed] sm:w-auto"
            >
              {wallet.restoring ? "Restoring wallet..." : wallet.loading ? "Connecting..." : "Connect wallet"}
            </Button>
          )}
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-5 px-6 pt-6 pb-6 sm:px-7">
        <div className="grid gap-4 grid-cols-1">
          <div className="rounded-2xl border border-border bg-muted/35 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">Connection</p>
                <p className="mt-2 break-all text-sm font-medium text-foreground">
                  {wallet.connected && wallet.publicKey ? truncateAddress(wallet.publicKey) : wallet.restoring ? "Restoring previous wallet session..." : "Not connected"}
                </p>
              </div>
              {wallet.connected && wallet.publicKey ? (
                <div className="relative shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAddress}
                    disabled={wallet.loading}
                    className="rounded-full border-border bg-background/60 px-3 text-xs text-foreground transition-transform duration-150 hover:bg-background active:scale-95"
                  >
                    Copy address
                  </Button>
                  <span
                    role="status"
                    aria-live="polite"
                    className={`pointer-events-none absolute -top-9 right-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium shadow-sm transition-all duration-300 ${
                      copyState === "idle"
                        ? "translate-y-1 opacity-0"
                        : "translate-y-0 opacity-100"
                    } ${
                      copyState === "error"
                        ? "border-destructive/30 bg-destructive/10 text-destructive"
                        : "border-primary/25 bg-primary/10 text-primary"
                    }`}
                  >
                    {copyState === "error" ? "Copy failed" : "Copied!"}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
          <StatusPill label="Network" value={wallet.network ? toTitleCase(wallet.network) : "Unknown"} />
          <StatusPill label="Wallet" value={wallet.walletName ?? "Not selected"} />
        </div>

        {wallet.connected && wallet.publicKey ? (
          <WalletQrCode address={wallet.publicKey} />
        ) : null}

        <Alert className="rounded-2xl border-border/80 bg-secondary/35">
          <AlertTitle className="text-sm font-medium text-foreground">Connection checklist</AlertTitle>
          <AlertDescription className="text-sm leading-6 text-muted-foreground">
            Make sure your wallet is installed and set to Stellar Testnet before you connect.
          </AlertDescription>
        </Alert>

        {wallet.error ? (
          <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/8">
            <AlertTitle className="text-sm font-medium">Wallet error</AlertTitle>
            <AlertDescription className="text-sm leading-6">{wallet.error}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
