"use client";

import { useEffect, useMemo, useState } from "react";
import { BalanceCard } from "@/components/BalanceCard";
import { SendPaymentForm } from "@/components/SendPaymentForm";
import { TxResultCard } from "@/components/TxResultCard";
import { WalletCard } from "@/components/WalletCard";
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

export default function Home() {
  const [wallet, setWallet] = useState<WalletState>(initialWalletState);
  const [balance, setBalance] = useState<BalanceState>(initialBalanceState);
  const [tx, setTx] = useState<TxState>(initialTxState);
  const [form, setForm] = useState<SendFormState>(initialFormState);
  const [walletDebug, setWalletDebug] = useState<FreighterDebugEvent[]>([]);
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
        error: "Failed to fetch account balance from Horizon.",
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
      const message = error instanceof Error ? error.message : "Unexpected Freighter connection error.";
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
    setReactClickCount(0);
    setNativeClickCount(0);
    setLastNativeClickAt(null);
  }

  async function handleSubmit() {
    if (!wallet.connected || !wallet.publicKey) {
      setTx({ status: "error", hash: null, message: "Connect Freighter before sending a payment." });
      return;
    }

    if (!balance.funded) {
      setTx({
        status: "error",
        hash: null,
        message: "Fund your Testnet account with Friendbot before sending XLM.",
      });
      return;
    }

    if (!isValidPublicKey(form.recipient)) {
      setTx({ status: "error", hash: null, message: "Recipient address is invalid." });
      return;
    }

    if (!isValidAmount(form.amount)) {
      setTx({ status: "error", hash: null, message: "Enter a valid positive XLM amount." });
      return;
    }

    try {
      setTx({ status: "validating", hash: null, message: "Preparing Stellar payment transaction..." });

      const transactionXdr = await createPaymentTransaction({
        sourcePublicKey: wallet.publicKey,
        destinationPublicKey: form.recipient.trim(),
        amount: form.amount.trim(),
        memo: form.memo,
      });

      setTx({ status: "signing", hash: null, message: "Confirm the transaction in Freighter." });

      const signedResult = await signFreighterTransaction(transactionXdr, wallet.publicKey);
      if ("error" in signedResult) {
        setTx({ status: "error", hash: null, message: signedResult.error });
        return;
      }

      setTx({ status: "submitting", hash: null, message: "Submitting transaction to Stellar Testnet..." });

      const submission = await submitSignedTransaction(signedResult.signedTxXdr);

      setTx({
        status: "success",
        hash: submission.hash ?? null,
        message: submission.hash
          ? `Transaction submitted successfully. Hash: ${submission.hash}`
          : "Transaction submitted successfully.",
      });

      await refreshBalance(wallet.publicKey);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Transaction failed.";
      setTx({ status: "error", hash: null, message });
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:px-12">
      <section className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6 rounded-[32px] border border-white/10 bg-[var(--color-panel)] p-8 shadow-[0_24px_80px_rgba(7,10,22,0.45)]">
          <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Stellar White Belt MVP
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">LumenFlow</h1>
            <p className="max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Connect Freighter, inspect your Stellar Testnet XLM balance, and send a native XLM payment with clear transaction feedback.
            </p>
          </div>
        </div>

        <aside className="space-y-4 rounded-[32px] border border-white/10 bg-[var(--color-panel-alt)] p-8 shadow-[0_16px_50px_rgba(5,9,20,0.35)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200/80">Network rules</p>
          <div className="space-y-3 text-sm leading-7 text-slate-300">
            <p>
              Wallet target: <span className="font-semibold text-white">Freighter</span>
            </p>
            <p>
              Network: <span className="font-semibold text-white">Stellar Testnet</span>
            </p>
            <p>
              Asset: <span className="font-semibold text-white">Native XLM only</span>
            </p>
            <p>
              Funding helper: <span className="font-semibold text-white">Friendbot</span>
            </p>
          </div>
        </aside>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-2">
        <WalletCard
          wallet={wallet}
          debugEvents={walletDebug}
          diagnostics={{ mounted, reactClickCount, nativeClickCount, lastNativeClickAt }}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
        <BalanceCard
          balance={balance}
          publicKey={wallet.publicKey}
          onRefresh={canRefreshBalance ? () => refreshBalance() : async () => undefined}
        />
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-2">
        <SendPaymentForm
          wallet={wallet}
          form={form}
          tx={tx}
          onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
          onSubmit={handleSubmit}
        />
        <TxResultCard tx={tx} />
      </section>
    </main>
  );
}
