"use client";

import { useEffect, useState, useTransition } from "react";
import { Activity, ArrowUpRight, Check, Copy, Radio, RefreshCw, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEscrowContractEvents, getSorobanLatestLedger } from "@/lib/stellar/contract-rpc";
import { getEscrowVaultConfig } from "@/lib/stellar/contract";
import type { EscrowContractEvent } from "@/lib/stellar/contract";
import { cn } from "@/lib/utils";
import { truncateAddress } from "@/lib/utils/format";

type FilterType = "all" | "created" | "released" | "refunded";

type ContractEventFeedProps = {
  refreshTrigger?: number;
};

export function ContractEventFeed({ refreshTrigger }: ContractEventFeedProps) {
  const [events, setEvents] = useState<EscrowContractEvent[]>([]);
  const [latestLedger, setLatestLedger] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isConfigured = getEscrowVaultConfig().ready;

  async function fetchFeed() {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    try {
      const [eventsResult, ledgerResult] = await Promise.allSettled([
        getEscrowContractEvents({ limit: 30 }),
        getSorobanLatestLedger(),
      ]);

      if (eventsResult.status === "fulfilled") {
        setEvents(eventsResult.value);
        setError(null);
      } else {
        setError("Could not stream contract events right now.");
      }

      if (ledgerResult.status === "fulfilled" && ledgerResult.value) {
        setLatestLedger(ledgerResult.value.sequence);
      }
    } catch {
      setError("Failed to fetch live contract events.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchFeed();
  }, [refreshTrigger]);

  useEffect(() => {
    if (!autoRefresh || !isConfigured) return;

    const interval = setInterval(() => {
      startTransition(() => {
        void fetchFeed();
      });
    }, 7000);

    return () => clearInterval(interval);
  }, [autoRefresh, isConfigured]);

  async function handleCopy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignore
    }
  }

  const filteredEvents = events.filter((ev) => {
    if (filter === "all") return true;
    return ev.type === filter;
  });

  return (
    <Card className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-[var(--surface-shadow-card)] backdrop-blur-sm">
      <CardHeader className="space-y-3 px-6 pt-6 pb-4 sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-primary uppercase">
              Live Stream
            </Badge>
            {isConfigured ? (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Active Polling
              </span>
            ) : (
              <Badge variant="outline" className="border-muted bg-muted/20 text-xs text-muted-foreground">
                Disabled
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {latestLedger ? (
              <span className="text-xs text-muted-foreground sm:inline">
                Ledger <span className="font-mono text-foreground">#{latestLedger}</span>
              </span>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLoading(true);
                void fetchFeed();
              }}
              disabled={loading || isPending}
              className="h-8 rounded-full border-border bg-secondary/40 px-3 text-xs text-foreground hover:bg-secondary"
            >
              <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", (loading || isPending) && "animate-spin")} />
              Sync
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRefresh((prev) => !prev)}
              className={cn(
                "h-8 rounded-full px-3 text-xs transition-colors",
                autoRefresh ? "bg-primary/15 text-primary hover:bg-primary/25" : "text-muted-foreground hover:bg-secondary",
              )}
            >
              <Radio className={cn("mr-1.5 h-3.5 w-3.5", autoRefresh && "animate-pulse")} />
              {autoRefresh ? "Auto-Live ON" : "Auto-Live OFF"}
            </Button>
          </div>
        </div>

        <div>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-foreground">
            <Activity className="h-5 w-5 text-primary" />
            Contract Event Streaming
          </CardTitle>
          <CardDescription className="mt-1 text-sm leading-6 text-muted-foreground">
            Real-time event stream ingested directly from Soroban RPC for all onchain escrow state changes and interactions.
          </CardDescription>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {(
            [
              { key: "all", label: "All Events" },
              { key: "created", label: "Created" },
              { key: "released", label: "Released" },
              { key: "refunded", label: "Refunded" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
                filter === item.key
                  ? "bg-foreground text-background shadow-xs"
                  : "border border-border/80 bg-secondary/30 text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {item.label}
              {item.key === "all" ? ` (${events.length})` : ` (${events.filter((e) => e.type === item.key).length})`}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 sm:px-7">
        {loading && events.length === 0 ? (
          <div className="space-y-3 py-6">
            <div className="h-16 animate-pulse rounded-2xl border border-border/60 bg-secondary/20" />
            <div className="h-16 animate-pulse rounded-2xl border border-border/60 bg-secondary/20" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/8 p-4 text-center text-sm text-destructive">
            {error}
          </div>
        ) : !isConfigured ? (
          <div className="rounded-2xl border border-border/70 bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
            Add <code className="rounded bg-background/80 px-1.5 py-0.5 font-mono text-xs text-foreground">NEXT_PUBLIC_ESCROW_VAULT_CONTRACT_ID</code> to stream live events.
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-secondary/15 py-10 px-4 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-foreground">No contract events in current ledger window</p>
            <p className="mt-1 max-w-md text-xs text-muted-foreground leading-5">
              Submit a new escrow transaction in Escrow Mode to see real-time onchain events stream here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="group relative flex flex-col justify-between gap-3 rounded-2xl border border-border/70 bg-secondary/25 p-4 transition-all duration-200 hover:border-primary/40 hover:bg-secondary/40 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/80 shadow-xs">
                    {ev.type === "created" ? (
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                    ) : ev.type === "released" ? (
                      <ShieldCheck className="h-4 w-4 text-sky-400" />
                    ) : (
                      <RotateCcw className="h-4 w-4 text-amber-400" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground text-sm">
                        Escrow #{ev.escrowId}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-2 py-0 text-[10px] uppercase font-semibold tracking-wider",
                          ev.type === "created"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : ev.type === "released"
                              ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-300",
                        )}
                      >
                        {ev.type}
                      </Badge>
                      <span className="font-semibold text-primary text-sm">
                        {ev.amount} XLM
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        Payer:{" "}
                        <button
                          type="button"
                          onClick={() => handleCopy(ev.payer, `${ev.id}-payer`)}
                          className="inline-flex items-center gap-1 font-mono text-foreground hover:underline cursor-pointer"
                          title="Click to copy"
                        >
                          {truncateAddress(ev.payer)}
                          {copiedId === `${ev.id}-payer` ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-2.5 w-2.5 opacity-60" />
                          )}
                        </button>
                      </span>

                      <span>
                        Payee:{" "}
                        <button
                          type="button"
                          onClick={() => handleCopy(ev.payee, `${ev.id}-payee`)}
                          className="inline-flex items-center gap-1 font-mono text-foreground hover:underline cursor-pointer"
                          title="Click to copy"
                        >
                          {truncateAddress(ev.payee)}
                          {copiedId === `${ev.id}-payee` ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-2.5 w-2.5 opacity-60" />
                          )}
                        </button>
                      </span>

                      {ev.memo ? (
                        <span className="rounded bg-background/60 px-1.5 py-0.5 text-[11px] text-muted-foreground border border-border/50">
                          memo: {ev.memo}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t border-border/40 sm:border-0">
                  <div className="text-right">
                    <p className="text-[11px] font-mono text-muted-foreground">
                      Ledger #{ev.ledger}
                    </p>
                  </div>
                  {ev.txHash ? (
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${ev.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/60 px-2.5 py-1 text-[11px] text-foreground hover:bg-background transition-colors"
                      title="View transaction on Stellar Expert"
                    >
                      <span>Tx</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
