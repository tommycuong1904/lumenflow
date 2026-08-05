import type { TxState } from "@/lib/stellar/types";
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

export function TxResultCard({ tx }: TxResultCardProps) {
  const isSuccess = tx.status === "success";
  const isError = tx.status === "error";
  const statusLabel = statusLabels[tx.status];

  return (
    <section className="rounded-[28px] border border-white/10 bg-[var(--color-panel)] p-6 shadow-[0_20px_60px_rgba(5,9,20,0.28)]">
      <div>
        <p className="text-sm font-medium text-slate-200">Transaction result</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">Network feedback</h2>
      </div>

      <div
        className={`mt-5 rounded-3xl border px-5 py-4 text-sm leading-7 ${
          isSuccess
            ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
            : isError
              ? "border-rose-400/25 bg-rose-400/10 text-rose-100"
              : "border-white/8 bg-white/5 text-slate-300"
        }`}
      >
        <p>
          <span className="font-semibold">Status:</span> {statusLabel}
        </p>
        <p className="mt-2">{tx.message ?? "No transaction submitted yet."}</p>
        {tx.hash ? (
          <div className="mt-3 space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-inherit/80">Transaction hash</p>
            <p className="break-all font-mono text-xs text-inherit">{tx.hash}</p>
            <p className="text-xs text-inherit/80">Short hash: {shortHash(tx.hash)}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
