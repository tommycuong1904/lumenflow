"use client";

import { useEffect, useMemo, useState } from "react";
import { BalanceCard } from "@/components/BalanceCard";
import { SendPaymentForm } from "@/components/SendPaymentForm";
import { TxResultCard } from "@/components/TxResultCard";
import { WalletCard } from "@/components/WalletCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NETWORK_PASSPHRASE } from "@/lib/stellar/constants";
import { getXlmBalance } from "@/lib/stellar/horizon";
import { submitSignedTransaction } from "@/lib/stellar/submit";
import type {
  BalanceState,
  FreighterDebugEvent,
  SendFormState,
  TxState,
  WalletState,
} from "@/lib/stellar/types";
import { createPaymentTransaction } from "@/lib/stellar/transactions";
import { isValidAmount, isValidPublicKey } from "@/lib/stellar/validation";
import { connectWallet, signFreighterTransaction } from "@/lib/stellar/wallet";

const initialWalletState: WalletState = {
  connected: false,
  publicKey: null,
  network: null,
  networkPassphrase: null,
  loading: false,
  error: null,
};

const initialBalanceState: BalanceState = {
  xlm: null,
  funded: false,
  loading: false,
  error: null,
};

const initialTxState: TxState = {
  status: "idle",
  hash: null,
  message: null,
};

const initialFormState: SendFormState = {
  recipient: "",
  amount: "",
  memo: "",
};

const readinessPoints = [
  "Freighter connect and disconnect",
  "XLM balance visibility on Testnet",
  "Signed Stellar payment submission",
];

export default function Home() {
  const [wallet, setWallet] = useState<WalletState>(initialWalletState);
  const [balance, setBalance] = useState<BalanceState>(initialBalanceState);
  const [tx, setTx] = useState<TxState>(initialTxState);
  const [form, setForm] = useState<SendFormState>(initialFormState);
  const [walletDebug, setWalletDebug] = useState<FreighterDebugEvent[]>([]);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [reactClickCount, setReactClickCount] = useState(0);
  const [nativeClickCount, setNativeClickCount] = useState(0);
  const [lastNativeClickAt, setLastNativeClickAt] = useState<string | null>(null);

  const canRefreshBalance = useMemo(() => Boolean(wallet.publicKey), [wallet.publicKey]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const button = document.getElementById("freighter-connect-button");
    if (!button) return;

    const handleNativeClick = () => {
      const timestamp = new Date().toISOString();
      setNativeClickCount((count) => count + 1);
      setLastNativeClickAt(timestamp);
      console.log("[LumenFlow][NativeButtonClick]", timestamp);
    };

    button.addEventListener("click", handleNativeClick);
    return () => {
      button.removeEventListener("click", handleNativeClick);
    };
  }, [wallet.connected, wallet.loading]);

  async function refreshBalance(publicKey = wallet.publicKey) {
    if (!publicKey) return;

    setBalance((current) => ({ ...current, loading: true, error: null }));

    try {
      const result = await getXlmBalance(publicKey);
      setBalance({
        xlm: result.xlm,
        funded: result.funded,
        loading: false,
        error: null,
      });
    } catch {
      setBalance((current) => ({
        ...current,
        loading: false,
        error: "Could not refresh the Testnet balance right now. Please try again in a moment.",
      }));
    }
  }

  async function handleConnect() {
    const clickedAt = new Date().toISOString();
    setReactClickCount((count) => count + 1);
    setWalletDebug([{ step: "click", detail: `Connect clicked at ${clickedAt}` }]);
    setWallet((current) => ({ ...current, loading: true, error: null }));
    console.log("[LumenFlow][ReactHandleConnect]", clickedAt);

    try {
      const result = await connectWallet();
      if (result.debug) {
        setWalletDebug((current) => [...current, ...result.debug]);
        console.log("[LumenFlow][FreighterDebug]", result.debug);
      }

      if ("error" in result) {
        setWallet((current) => ({
          ...current,
          loading: false,
          connected: false,
          error: result.error,
        }));
        return;
      }

      if (!result.isTestnet || result.networkPassphrase !== NETWORK_PASSPHRASE) {
        setWallet({
          connected: false,
          publicKey: null,
          network: result.network,
          networkPassphrase: result.networkPassphrase,
          loading: false,
          error: "Please switch Freighter to Stellar Testnet before using LumenFlow.",
        });
        return;
      }

      setWallet({
        connected: true,
        publicKey: result.address,
        network: result.network,
        networkPassphrase: result.networkPassphrase,
        loading: false,
        error: null,
      });

      await refreshBalance(result.address);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not connect to Freighter right now. Please try again.";
      setWallet((current) => ({
        ...current,
        loading: false,
        connected: false,
        error: message,
      }));
      setWalletDebug((current) => [...current, { step: "exception", detail: message }]);
      console.error("[LumenFlow][FreighterDebug][Exception]", error);
    }
  }

  function handleDisconnect() {
    setWallet(initialWalletState);
    setBalance(initialBalanceState);
    setTx(initialTxState);
    setForm(initialFormState);
    setWalletDebug([]);
    setIsConfirmingPayment(false);
    setReactClickCount(0);
    setNativeClickCount(0);
    setLastNativeClickAt(null);
  }

  function handleSubmit() {
    if (!wallet.connected || !wallet.publicKey) {
      setTx({ status: "error", hash: null, message: "Connect Freighter before sending a payment." });
      setIsConfirmingPayment(false);
      return;
    }

    if (!balance.funded) {
      setTx({
        status: "error",
        hash: null,
        message: "Fund your Testnet account with Friendbot before sending XLM.",
      });
      setIsConfirmingPayment(false);
      return;
    }

    if (!isValidPublicKey(form.recipient)) {
      setTx({ status: "error", hash: null, message: "Recipient address is invalid." });
      setIsConfirmingPayment(false);
      return;
    }

    if (!isValidAmount(form.amount)) {
      setTx({ status: "error", hash: null, message: "Enter a valid positive XLM amount." });
      setIsConfirmingPayment(false);
      return;
    }

    setTx({
      status: "idle",
      hash: null,
      message: "Payment details look valid. Review them below, then confirm to open Freighter.",
    });
    setIsConfirmingPayment(true);
  }

  function handleCancelConfirmation() {
    setIsConfirmingPayment(false);
    setTx((current) => ({
      ...current,
      status: current.status === "error" ? "error" : "idle",
      message: current.status === "error" ? current.message : "Confirmation cancelled. You can update the payment details and review again.",
    }));
  }

  async function handleConfirmSubmit() {
    if (!wallet.connected || !wallet.publicKey) {
      setTx({ status: "error", hash: null, message: "Connect Freighter before sending a payment." });
      setIsConfirmingPayment(false);
      return;
    }

    try {
      setTx({ status: "validating", hash: null, message: "Preparing the Stellar Testnet payment for signing..." });

      const transactionXdr = await createPaymentTransaction({
        sourcePublicKey: wallet.publicKey,
        destinationPublicKey: form.recipient.trim(),
        amount: form.amount.trim(),
        memo: form.memo,
      });

      setTx({ status: "signing", hash: null, message: "Review the request in Freighter and approve the signature to continue." });

      const signedResult = await signFreighterTransaction(transactionXdr, wallet.publicKey);
      if ("error" in signedResult) {
        setTx({ status: "error", hash: null, message: signedResult.error });
        setIsConfirmingPayment(false);
        return;
      }

      setTx({ status: "submitting", hash: null, message: "Submitting the signed payment to Stellar Testnet..." });

      const submission = await submitSignedTransaction(signedResult.signedTxXdr);

      setTx({
        status: "success",
        hash: submission.hash ?? null,
        message: "Transaction submitted successfully.",
        amount: form.amount.trim(),
        recipient: form.recipient.trim(),
        memo: form.memo.trim() || null,
      });
      setIsConfirmingPayment(false);

      await refreshBalance(wallet.publicKey);
    } catch (error) {
      const message = error instanceof Error ? error.message : "The payment could not be completed on Stellar Testnet.";
      setTx({ status: "error", hash: null, message });
      setIsConfirmingPayment(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-4 flex justify-end">
        <ThemeToggle />
      </div>
      <section className="relative overflow-hidden rounded-[32px] border border-border/80 bg-card/90 shadow-[0_32px_120px_rgba(4,8,20,0.4)] backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="relative grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.4fr_0.8fr] lg:px-10 lg:py-10">
          <div className="space-y-5">
            <Badge variant="outline" className="border-primary/20 bg-primary/8 px-3 py-1 text-[11px] tracking-[0.24em] text-primary uppercase">
              Stellar White Belt
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                LumenFlow
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                A focused Stellar Testnet payment utility for connecting Freighter, checking XLM balance, and validating a signed transfer flow without the noise of a full crypto dashboard.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="border-border bg-secondary/45 px-3 py-1 text-sm text-secondary-foreground">
                Freighter wallet
              </Badge>
              <Badge variant="outline" className="border-border bg-secondary/45 px-3 py-1 text-sm text-secondary-foreground">
                Testnet only
              </Badge>
              <Badge variant="outline" className="border-border bg-secondary/45 px-3 py-1 text-sm text-secondary-foreground">
                Native XLM
              </Badge>
            </div>
          </div>

          <Card className="rounded-[28px] border border-border/80 bg-background/45 shadow-none">
            <CardContent className="space-y-4 px-6 py-6">
              <p className="text-sm font-medium text-foreground">Readiness checklist</p>
              <Separator className="bg-border/70" />
              <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                {readinessPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-2xl border border-border/80 bg-secondary/35 px-4 py-4 text-sm leading-6 text-muted-foreground">
                Current runtime is production-style so wallet hydration and browser extension behavior match real demo conditions more reliably.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:100ms]">
        <WalletCard
          wallet={wallet}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
        <BalanceCard
          balance={balance}
          publicKey={wallet.publicKey}
          onRefresh={canRefreshBalance ? () => refreshBalance() : async () => undefined}
        />
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:200ms]">
        <SendPaymentForm
          wallet={wallet}
          form={form}
          tx={tx}
          isConfirming={isConfirmingPayment}
          onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
          onSubmit={handleSubmit}
          onConfirm={handleConfirmSubmit}
          onCancelConfirmation={handleCancelConfirmation}
        />
        <TxResultCard tx={tx} />
      </section>
    </main>
  );
}
