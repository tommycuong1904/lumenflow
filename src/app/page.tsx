"use client";

import { useEffect, useMemo, useState } from "react";
import { BalanceCard } from "@/components/BalanceCard";
import { SendPaymentForm } from "@/components/SendPaymentForm";
import { TxResultCard } from "@/components/TxResultCard";
import { WalletCard } from "@/components/WalletCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLumenFlowWallet } from "@/components/LumenFlowShell";
import { getXlmBalance } from "@/lib/stellar/horizon";
import { getPaymentIntentRecord, getSorobanTransaction, submitSignedContractTransaction, createPaymentIntentTransactionXdr } from "@/lib/stellar/contract-rpc";
import { submitSignedTransaction } from "@/lib/stellar/submit";
import type { BalanceState, SendFormState, TxState } from "@/lib/stellar/types";
import { createPaymentTransaction } from "@/lib/stellar/transactions";
import { isValidAmount, isValidPublicKey } from "@/lib/stellar/validation";
import { signWalletTransaction } from "@/lib/stellar/wallet";

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
  mode: "native_transfer",
  paymentIntentId: null,
};

const initialFormState: SendFormState = {
  recipient: "",
  amount: "",
  memo: "",
  mode: "native_transfer",
};

const readinessPoints = [
  "Connect a supported wallet on Testnet",
  "Check your live XLM balance",
  "Send XLM with the native payment flow",
  "Create payment intents with contract mode",
];

export default function Home() {
  const { wallet, connectWallet, disconnectWallet, clearWalletError } = useLumenFlowWallet();
  const [balance, setBalance] = useState<BalanceState>(initialBalanceState);
  const [tx, setTx] = useState<TxState>(initialTxState);
  const [form, setForm] = useState<SendFormState>(initialFormState);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

  const canRefreshBalance = useMemo(() => Boolean(wallet.publicKey), [wallet.publicKey]);

  useEffect(() => {
    if (!wallet.publicKey) {
      setBalance(initialBalanceState);
      return;
    }
    void refreshBalance(wallet.publicKey);
  }, [wallet.publicKey]);

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
    clearWalletError();
    await connectWallet();
  }

  function handleDisconnect() {
    disconnectWallet();
    setBalance(initialBalanceState);
    setTx(initialTxState);
    setForm(initialFormState);
    setIsConfirmingPayment(false);
  }

  function handleSubmit() {
    if (!wallet.connected || !wallet.publicKey) {
      setTx({ status: "error", hash: null, message: "Connect a Stellar wallet before sending a payment." });
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
      message:
        form.mode === "contract"
          ? "Contract payment details look valid. Review them below, then confirm to create the payment intent on Stellar Testnet."
          : "Payment details look valid. Review them below, then confirm to open your wallet.",
      mode: form.mode ?? "native_transfer",
      paymentIntentId: null,
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
      setTx({ status: "error", hash: null, message: "Connect a Stellar wallet before sending a payment." });
      setIsConfirmingPayment(false);
      return;
    }

    try {
      const isContractMode = form.mode === "contract";

      setTx({
        status: "validating",
        hash: null,
        message: isContractMode
          ? "Preparing the payment intent transaction for wallet signing..."
          : "Preparing the Stellar Testnet payment for signing...",
        mode: isContractMode ? "contract" : "native_transfer",
        paymentIntentId: null,
      });

      const transactionXdr = isContractMode
        ? await createPaymentIntentTransactionXdr(wallet.publicKey, {
            recipient: form.recipient.trim(),
            amount: form.amount.trim(),
          })
        : await createPaymentTransaction({
            sourcePublicKey: wallet.publicKey,
            destinationPublicKey: form.recipient.trim(),
            amount: form.amount.trim(),
            memo: form.memo,
          });

      setTx({
        status: "signing",
        hash: null,
        message: isContractMode
          ? "Review the contract invocation in your wallet and approve the signature to continue."
          : "Review the request in your wallet and approve the signature to continue.",
        mode: isContractMode ? "contract" : "native_transfer",
        paymentIntentId: null,
      });

      const signedResult = await signWalletTransaction(transactionXdr, wallet.publicKey);
      if ("error" in signedResult) {
        setTx({
          status: "error",
          hash: null,
          message: signedResult.error ?? "Transaction signing failed.",
          mode: isContractMode ? "contract" : "native_transfer",
          paymentIntentId: null,
        });
        setIsConfirmingPayment(false);
        return;
      }

      setTx({
        status: "submitting",
        hash: null,
        message: isContractMode
          ? "Submitting the signed contract invocation to Stellar Testnet..."
          : "Submitting the signed payment to Stellar Testnet...",
        mode: isContractMode ? "contract" : "native_transfer",
        paymentIntentId: null,
      });

      const submission = isContractMode
        ? await submitSignedContractTransaction(signedResult.signedTxXdr)
        : await submitSignedTransaction(signedResult.signedTxXdr);

      if (isContractMode) {
        const txDetails = await getSorobanTransaction(submission.hash);
        const paymentIntentId = txDetails.status === "SUCCESS" && txDetails.returnValue
          ? String(txDetails.returnValue.value())
          : null;

        const paymentRecord = paymentIntentId ? await getPaymentIntentRecord(paymentIntentId) : null;

        setTx({
          status: "success",
          hash: submission.hash,
          message: paymentIntentId
            ? `Payment intent created on Stellar Testnet with onchain id #${paymentIntentId}.`
            : "Contract invocation submitted to Stellar Testnet successfully.",
          amount: paymentRecord?.amount ?? form.amount.trim(),
          recipient: paymentRecord?.recipient ?? form.recipient.trim(),
          memo: form.memo.trim() || null,
          mode: "contract",
          paymentIntentId,
        });
      } else {
        setTx({
          status: "success",
          hash: submission.hash,
          message: "Payment submitted to Stellar Testnet successfully.",
          amount: form.amount.trim(),
          recipient: form.recipient.trim(),
          memo: form.memo.trim() || null,
          mode: "native_transfer",
          paymentIntentId: null,
        });
      }
      setIsConfirmingPayment(false);

      await refreshBalance(wallet.publicKey);
    } catch (error) {
      const message = error instanceof Error ? error.message : "The payment could not be completed on Stellar Testnet.";
      setTx({ status: "error", hash: null, message, mode: form.mode ?? "native_transfer", paymentIntentId: null });
      setIsConfirmingPayment(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8 lg:px-10">
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
                A simple Stellar Testnet payment app where you can connect a wallet, send XLM, and create contract-based payment intents in one flow.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="border-border bg-secondary/45 px-3 py-1 text-sm text-secondary-foreground">
                Multi-wallet ready
              </Badge>
              <Badge variant="outline" className="border-border bg-secondary/45 px-3 py-1 text-sm text-secondary-foreground">
                Testnet only
              </Badge>
              <Badge variant="outline" className="border-border bg-secondary/45 px-3 py-1 text-sm text-secondary-foreground">
                Native XLM live
              </Badge>
              <Badge variant="outline" className="border-border bg-secondary/45 px-3 py-1 text-sm text-secondary-foreground">
                Contract mode live
              </Badge>
            </div>
          </div>

          <Card className="rounded-[28px] border border-border/80 bg-background/45 shadow-none">
            <CardContent className="space-y-4 px-6 py-6">
              <p className="text-sm font-medium text-foreground">What you can do here</p>
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
                Both payment paths are ready on Testnet: use Native transfer for direct XLM sends, or Contract mode to create a payment intent onchain.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="wallet-section" className="mt-8 grid gap-8 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:100ms]">
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

      <section id="payment-section" className="mt-8 grid gap-8 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:200ms]">
        <SendPaymentForm
          wallet={wallet}
          form={form}
          tx={tx}
          isConfirming={isConfirmingPayment}
          onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
          onSubmit={handleSubmit}
          onConfirm={handleConfirmSubmit}
          onCancelConfirmation={handleCancelConfirmation}
          lastSuccessfulRecipient={tx.status === "success" ? tx.recipient : null}
        />
        <TxResultCard tx={tx} />
      </section>
    </main>
  );
}
