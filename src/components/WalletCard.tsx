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

export function WalletCard({ wallet, debugEvents, diagnostics, onConnect, onDisconnect }: WalletCardProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[var(--color-panel)] p-6 shadow-[0_20px_60px_rgba(5,9,20,0.28)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-200">Wallet</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Freighter connection</h2>
        </div>
        {wallet.connected ? (
          <button
            type="button"
            onClick={onDisconnect}
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/25 hover:bg-white/5"
          >
            Disconnect
          </button>
        ) : (
          <button
            id="freighter-connect-button"
            type="button"
            onClick={onConnect}
            disabled={wallet.loading}
            className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {wallet.loading ? "Connecting..." : "Connect Freighter"}
          </button>
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <article className="rounded-3xl border border-white/8 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Connection</p>
          <p className="mt-3 text-sm text-slate-200">
            {wallet.connected && wallet.publicKey ? truncateAddress(wallet.publicKey) : "Not connected"}
          </p>
        </article>
        <article className="rounded-3xl border border-white/8 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Network</p>
          <p className="mt-3 text-sm text-slate-200">{wallet.network ?? "Unknown"}</p>
        </article>
      </div>

      <div className="mt-4 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-300">
        Freighter must be installed and switched to Stellar Testnet before you connect.
      </div>

      <div className="mt-4 rounded-2xl border border-violet-400/15 bg-violet-400/5 px-4 py-4 text-sm text-slate-200">
        <p className="font-semibold text-violet-200">Client diagnostics</p>
        <ul className="mt-3 space-y-2 font-mono text-xs leading-6 text-slate-300">
          <li>mounted: {diagnostics.mounted ? "yes" : "no"}</li>
          <li>reactClickCount: {diagnostics.reactClickCount}</li>
          <li>nativeClickCount: {diagnostics.nativeClickCount}</li>
          <li>lastNativeClickAt: {diagnostics.lastNativeClickAt ?? "none"}</li>
        </ul>
      </div>

      {wallet.error ? (
        <p className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {wallet.error}
        </p>
      ) : null}

      {debugEvents.length ? (
        <div className="mt-4 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 px-4 py-4 text-sm text-slate-200">
          <p className="font-semibold text-cyan-200">Freighter debug trace</p>
          <ul className="mt-3 space-y-2">
            {debugEvents.map((debugEvent, index) => (
              <li key={`${debugEvent.step}-${index}`} className="break-words rounded-xl bg-slate-950/30 px-3 py-2 font-mono text-xs leading-6 text-slate-300">
                <span className="font-semibold text-cyan-200">{debugEvent.step}:</span> {debugEvent.detail}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
