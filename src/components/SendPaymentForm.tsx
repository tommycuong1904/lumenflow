import type { SendFormState, TxState, WalletState } from "@/lib/stellar/types";

type SendPaymentFormProps = {
  wallet: WalletState;
  form: SendFormState;
  tx: TxState;
  onChange: (patch: Partial<SendFormState>) => void;
  onSubmit: () => Promise<void>;
};

export function SendPaymentForm({ wallet, form, tx, onChange, onSubmit }: SendPaymentFormProps) {
  const isBusy = tx.status === "validating" || tx.status === "signing" || tx.status === "submitting";

  return (
    <section className="rounded-[28px] border border-white/10 bg-[var(--color-panel)] p-6 shadow-[0_20px_60px_rgba(5,9,20,0.28)]">
      <div>
        <p className="text-sm font-medium text-slate-200">Payment</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">Send XLM on Testnet</h2>
      </div>

      <div className="mt-4 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm leading-7 text-slate-300">
        Use an existing Stellar Testnet destination account for the first MVP verification. The flow currently targets native XLM transfers only.
      </div>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm text-slate-300">
          <span>Recipient address</span>
          <input
            value={form.recipient}
            onChange={(event) => onChange({ recipient: event.target.value })}
            placeholder="G..."
            className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm text-slate-300">
            <span>Amount</span>
            <input
              value={form.amount}
              onChange={(event) => onChange({ amount: event.target.value })}
              placeholder="10"
              inputMode="decimal"
              className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
            />
          </label>

          <label className="grid gap-2 text-sm text-slate-300">
            <span>Memo (optional)</span>
            <input
              value={form.memo}
              onChange={(event) => onChange({ memo: event.target.value })}
              placeholder="Thanks"
              className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
            />
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-400">
          {wallet.connected ? "Sign the transaction in Freighter when prompted." : "Connect Freighter before sending a payment."}
        </p>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!wallet.connected || isBusy}
          className="rounded-full bg-violet-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {tx.status === "signing"
            ? "Awaiting signature..."
            : tx.status === "submitting"
              ? "Submitting..."
              : "Send XLM"}
        </button>
      </div>
    </section>
  );
}
