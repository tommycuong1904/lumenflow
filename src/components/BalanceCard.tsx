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

  return (
    <section className="rounded-[28px] border border-white/10 bg-[var(--color-panel)] p-6 shadow-[0_20px_60px_rgba(5,9,20,0.28)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-200">Balance</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Testnet XLM</h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={balance.loading || !publicKey}
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/25 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {balance.loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="mt-5 rounded-3xl border border-white/8 bg-white/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Available balance</p>
            <p className="mt-3 text-4xl font-semibold text-white">{formatBalance(balance.xlm)} XLM</p>
          </div>
          <div className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
            {publicKey ? (balance.funded ? "Funded" : "Unfunded") : "No wallet"}
          </div>
        </div>
      </div>

      {!balance.funded && publicKey ? (
        <div className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-4 text-sm leading-7 text-amber-100">
          Wallet connected, but this Testnet account is not funded yet.
          {friendbotHref ? (
            <>
              {" "}
              <a className="font-semibold underline" href={friendbotHref} target="_blank" rel="noreferrer">
                Fund it with Friendbot
              </a>
              .
            </>
          ) : null}
        </div>
      ) : null}

      {balance.error ? (
        <p className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {balance.error}
        </p>
      ) : null}
    </section>
  );
}
