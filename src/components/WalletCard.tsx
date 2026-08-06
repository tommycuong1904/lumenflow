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
import { Separator } from "@/components/ui/separator";
import { truncateAddress } from "@/lib/utils/format";
import type { FreighterDebugEvent, WalletState } from "@/lib/stellar/types";

type WalletCardProps = {
  wallet: WalletState;
  debugEvents: FreighterDebugEvent[];
  diagnostics: {
    mounted: boolean;
    reactClickCount: number;
    nativeClickCount: number;
    lastNativeClickAt: string | null;
  };
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

export function WalletCard({ wallet, debugEvents, diagnostics, onConnect, onDisconnect }: WalletCardProps) {
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

    try {
      await navigator.clipboard.writeText(wallet.publicKey);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  return (
    <Card className="rounded-3xl border border-border/80 bg-card/90 shadow-[0_24px_80px_rgba(4,8,20,0.35)] backdrop-blur-sm">
      <CardHeader className="flex flex-col gap-4 px-5 pt-6 pb-0 sm:flex-row sm:items-start sm:justify-between sm:px-7">
        <div className="space-y-2">
          <Badge variant="outline" className="w-fit border-primary/20 bg-primary/8 px-3 py-1 text-[11px] tracking-[0.24em] text-primary uppercase">
            Wallet
          </Badge>
          <CardTitle className="text-2xl font-semibold text-foreground">Freighter connection</CardTitle>
          <CardDescription className="max-w-xl text-sm leading-6 text-muted-foreground">
            Connect your Stellar wallet, confirm you are on Testnet, and keep diagnostics visible while validating the White Belt flow.
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
              disabled={wallet.loading}
              className="w-full rounded-full bg-primary px-5 text-primary-foreground hover:bg-[#7c3aed] sm:w-auto"
            >
              {wallet.loading ? "Connecting..." : "Connect Freighter"}
            </Button>
          )}
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-5 px-6 pt-6 pb-6 sm:px-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-muted/35 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">Connection</p>
                <p className="mt-2 break-all text-sm font-medium text-foreground">
                  {wallet.connected && wallet.publicKey ? truncateAddress(wallet.publicKey) : "Not connected"}
                </p>
              </div>
              {wallet.connected && wallet.publicKey ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAddress}
                  disabled={wallet.loading}
                  className="shrink-0 rounded-full border-border bg-background/60 px-3 text-xs text-foreground hover:bg-background"
                >
                  {copyState === "copied" ? "Copied" : copyState === "error" ? "Retry copy" : "Copy address"}
                </Button>
              ) : null}
            </div>
          </div>
          <StatusPill label="Network" value={wallet.network ?? "Unknown"} />
        </div>

        <Alert className="rounded-2xl border-border/80 bg-secondary/35">
          <AlertTitle className="text-sm font-medium text-foreground">Connection checklist</AlertTitle>
          <AlertDescription className="text-sm leading-6 text-muted-foreground">
            Install Freighter, switch it to Stellar Testnet, then connect here to unlock balance refresh and payment review.
          </AlertDescription>
        </Alert>

        <Alert className="rounded-2xl border-primary/15 bg-primary/6">
          <AlertTitle className="text-sm font-medium text-foreground">Client diagnostics</AlertTitle>
          <AlertDescription className="mt-2 font-mono text-xs leading-6 text-muted-foreground">
            <div>mounted: {diagnostics.mounted ? "yes" : "no"}</div>
            <div>reactClickCount: {diagnostics.reactClickCount}</div>
            <div>nativeClickCount: {diagnostics.nativeClickCount}</div>
            <div>lastNativeClickAt: {diagnostics.lastNativeClickAt ?? "none"}</div>
          </AlertDescription>
        </Alert>

        {wallet.error ? (
          <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/8">
            <AlertTitle className="text-sm font-medium">Wallet error</AlertTitle>
            <AlertDescription className="text-sm leading-6">{wallet.error}</AlertDescription>
          </Alert>
        ) : null}

        {debugEvents.length ? (
          <div className="rounded-2xl border border-border/80 bg-secondary/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">Freighter debug trace</p>
              <Badge variant="outline" className="border-primary/20 bg-primary/8 text-primary">
                {debugEvents.length} events
              </Badge>
            </div>
            <Separator className="my-4 bg-border/70" />
            <ul className="space-y-3">
              {debugEvents.map((debugEvent, index) => (
                <li key={`${debugEvent.step}-${index}`} className="rounded-2xl border border-border/70 bg-background/40 px-3 py-3 font-mono text-xs leading-6 text-muted-foreground">
                  <span className="font-semibold text-primary">{debugEvent.step}:</span> {debugEvent.detail}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
