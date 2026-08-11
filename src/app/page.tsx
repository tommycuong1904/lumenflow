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
import { getEscrowVaultCount, getEscrowVaultRecord, getPaymentIntentRecord, getSorobanTransaction, submitSignedContractTransaction, createEscrowVaultTransactionXdr, createPaymentIntentTransactionXdr } from "@/lib/stellar/contract-rpc";
import { submitSignedTransaction } from "@/lib/stellar/submit";
import type { BalanceState, SendFormState, TxState } from "@/lib/stellar/types";
import type { EscrowVaultRecord } from "@/lib/stellar/contract";
import { createPaymentTransaction } from "@/lib/stellar/transactions";
import { isValidAmount, isValidPublicKey } from "@/lib/stellar/validation";
import { signWalletTransaction } from "@/lib/stellar/wallet";
import { getEscrowVaultConfig, getPaymentIntentConfig } from "@/lib/stellar/contract";
import { truncateAddress } from "@/lib/utils/format";

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

const initialEscrowVaultReadState: EscrowVaultReadState = {
  loading: false,
  error: null,
  count: null,
  latest: null,
  configured: getEscrowVaultConfig().ready,
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
  "Create escrow records with Level 3 mode",
];

type EscrowVaultReadState = {
  loading: boolean;
  error: string | null;
  count: number | null;
  latest: EscrowVaultRecord | null;
  configured: boolean;
};

export default function Home() {
  const { wallet, connectWallet, disconnectWallet, clearWalletError } = useLumenFlowWallet();
  const [balance, setBalance] = useState<BalanceState>(initialBalanceState);
  const [tx, setTx] = useState<TxState>(initialTxState);
  const [form, setForm] = useState<SendFormState>(initialFormState);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [escrowVaultRead, setEscrowVaultRead] = useState<EscrowVaultReadState>(initialEscrowVaultReadState);

  const canRefreshBalance = useMemo(() => Boolean(wallet.publicKey), [wallet.publicKey]);

  useEffect(() => {
    if (!wallet.publicKey) {
      setBalance(initialBalanceState);
      return;
    }
    void refreshBalance(wallet.publicKey);
  }, [wallet.publicKey]);

  useEffect(() => {
    void refreshEscrowVaultRead();
  }, []);

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

  async function refreshEscrowVaultRead() {
    const config = getEscrowVaultConfig();

    if (!config.ready) {
      setEscrowVaultRead({
        loading: false,
        error: null,
        count: null,
        latest: null,
        configured: false,
      });
      return;
    }

    setEscrowVaultRead({
      loading: true,
      error: null,
      count: null,
      latest: null,
      configured: true,
    });

    try {
      const count = await getEscrowVaultCount();
      const latest = count && count > 0 ? await getEscrowVaultRecord(String(count)) : null;
      setEscrowVaultRead({
        loading: false,
        error: null,
        count,
        latest,
        configured: true,
      });
    } catch {
      setEscrowVaultRead({
        loading: false,
        error: "Could not read the escrow vault contract right now.",
        count: null,
        latest: null,
        configured: true,
      });
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

    if (form.mode === "contract" && !getPaymentIntentConfig().ready) {
      setTx({ status: "error", hash: null, message: "Payment intent contract setup is missing. Check the public contract ID and RPC env vars." });
      setIsConfirmingPayment(false);
      return;
    }

    if (form.mode === "escrow" && !getEscrowVaultConfig().ready) {
      setTx({ status: "error", hash: null, message: "Escrow contract setup is missing. Check the public escrow contract ID and RPC env vars." });
      setIsConfirmingPayment(false);
      return;
    }

    setTx({
      status: "idle",
      hash: null,
      message:
        form.mode === "escrow"
          ? "Escrow details look valid. Review them below, then confirm to create the escrow on Stellar Testnet."
          : form.mode === "contract"
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
      const isEscrowMode = form.mode === "escrow";

      setTx({
        status: "validating",
        hash: null,
        message: isEscrowMode
          ? "Preparing the escrow transaction for wallet signing..."
          : isContractMode
            ? "Preparing the payment intent transaction for wallet signing..."
            : "Preparing the Stellar Testnet payment for signing...",
        mode: isEscrowMode ? "escrow" : isContractMode ? "contract" : "native_transfer",
        paymentIntentId: null,
      });

      const transactionXdr = isEscrowMode
        ? await createEscrowVaultTransactionXdr(wallet.publicKey, {
            payee: form.recipient.trim(),
            amount: form.amount.trim(),
            memo: form.memo.trim(),
          })
        : isContractMode
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
        message: isEscrowMode
          ? "Review the escrow contract invocation in your wallet and approve the signature to continue."
          : isContractMode
            ? "Review the contract invocation in your wallet and approve the signature to continue."
            : "Review the request in your wallet and approve the signature to continue.",
        mode: isEscrowMode ? "escrow" : isContractMode ? "contract" : "native_transfer",
        paymentIntentId: null,
      });

      const signedResult = await signWalletTransaction(transactionXdr, wallet.publicKey);
      if ("error" in signedResult) {
        setTx({
          status: "error",
          hash: null,
          message: signedResult.error ?? "Transaction signing failed.",
          mode: isEscrowMode ? "escrow" : isContractMode ? "contract" : "native_transfer",
          paymentIntentId: null,
        });
        setIsConfirmingPayment(false);
        return;
      }

      setTx({
        status: "submitting",
        hash: null,
        message: isEscrowMode
          ? "Submitting the signed escrow invocation to Stellar Testnet..."
          : isContractMode
            ? "Submitting the signed contract invocation to Stellar Testnet..."
            : "Submitting the signed payment to Stellar Testnet...",
        mode: isEscrowMode ? "escrow" : isContractMode ? "contract" : "native_transfer",
        paymentIntentId: null,
      });

      const submission = isContractMode || isEscrowMode
        ? await submitSignedContractTransaction(signedResult.signedTxXdr)
        : await submitSignedTransaction(signedResult.signedTxXdr);

      if (isEscrowMode) {
        const txDetails = await getSorobanTransaction(submission.hash);
        const escrowId = txDetails.status === "SUCCESS" && txDetails.returnValue
          ? String(txDetails.returnValue.value())
          : null;

        setTx({
          status: "success",
          hash: submission.hash,
          message: escrowId
            ? `Escrow created on Stellar Testnet with onchain id #${escrowId}.`
            : "Escrow invocation submitted to Stellar Testnet successfully.",
          amount: form.amount.trim(),
          recipient: form.recipient.trim(),
          memo: form.memo.trim() || null,
          mode: "escrow",
          paymentIntentId: escrowId,
        });
        await refreshEscrowVaultRead();
      } else if (isContractMode) {
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
      <section className="relative overflow-hidden rounded-[32px] border border-border/80 bg-card/90 shadow-[var(--surface-shadow-hero)] backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
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
                A simple Stellar Testnet payment app where you can connect a wallet, send XLM, create payment intents, and create live escrow records in one flow.
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
              <Badge variant="outline" className="border-border bg-secondary/45 px-3 py-1 text-sm text-secondary-foreground">
                Escrow mode live
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
                All three payment paths are ready on Testnet: use Native transfer for direct XLM sends, Contract mode to create a payment intent onchain, or Escrow mode to create a live Level 3 escrow.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="wallet-section" className="mt-8 scroll-mt-32 grid gap-8 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:100ms]">
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

      <section className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:150ms]">
        <Card className="rounded-3xl border border-border/80 bg-card/90 shadow-[var(--surface-shadow-card)] backdrop-blur-sm">
          <CardContent className="space-y-4 px-6 py-6 sm:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Escrow vault read path</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Live read path for the Level 3 escrow contract on Stellar Testnet.
                </p>
              </div>
              <Badge variant="outline" className="w-fit border-border bg-secondary/45 px-3 py-1 text-sm text-secondary-foreground">
                {escrowVaultRead.configured ? "Configured" : "Not configured"}
              </Badge>
            </div>
            <Separator className="bg-border/70" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/80 bg-secondary/35 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Onchain escrows</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {escrowVaultRead.loading ? "..." : escrowVaultRead.count ?? "--"}
                </p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-secondary/35 px-4 py-4 text-sm leading-6 text-muted-foreground">
                {escrowVaultRead.error
                  ? escrowVaultRead.error
                  : escrowVaultRead.configured
                    ? escrowVaultRead.loading
                      ? "Reading the live escrow contract on Stellar Testnet..."
                      : escrowVaultRead.latest
                        ? "Latest escrow record is being read live from the deployed contract and shown below."
                        : "Escrow contract is live. Create a new escrow to populate the detail panel."
                    : "Add NEXT_PUBLIC_ESCROW_VAULT_CONTRACT_ID to enable the live escrow contract read path."}
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-secondary/35 px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Latest escrow</p>
                  <p className="mt-1 text-sm text-muted-foreground">Most recent readable escrow from the contract.</p>
                </div>
                {escrowVaultRead.latest ? (
                  <Badge variant="outline" className="w-fit border-border bg-background/60 px-3 py-1 text-sm text-foreground capitalize">
                    {escrowVaultRead.latest.status}
                  </Badge>
                ) : null}
              </div>

              {escrowVaultRead.latest ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Escrow ID</p>
                    <p className="mt-1 font-medium text-foreground">#{escrowVaultRead.latest.id}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Amount</p>
                    <p className="mt-1 font-medium text-foreground">{escrowVaultRead.latest.amount} XLM</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Payer</p>
                    <p className="mt-1 font-medium text-foreground">{truncateAddress(escrowVaultRead.latest.payer)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Payee</p>
                    <p className="mt-1 font-medium text-foreground">{truncateAddress(escrowVaultRead.latest.payee)}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Memo</p>
                    <p className="mt-1 font-medium text-foreground">{escrowVaultRead.latest.memo || "No memo"}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {escrowVaultRead.configured
                    ? escrowVaultRead.loading
                      ? "Loading the most recent escrow record..."
                      : "No readable escrow record yet."
                    : "Escrow detail view will appear automatically after contract config is set."}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="payment-section" className="mt-8 scroll-mt-32 grid gap-8 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:200ms]">
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
