"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { NETWORK_PASSPHRASE } from "@/lib/stellar/constants";
import { connectWallet, disconnectWallet } from "@/lib/stellar/wallet";
import type { WalletState } from "@/lib/stellar/types";

const WALLET_SESSION_KEY = "lumenflow_wallet_session";

type PersistedWalletSession = {
  publicKey: string;
  network: string | null;
  networkPassphrase: string | null;
  walletId?: string | null;
  walletName?: string | null;
};

const initialWalletState: WalletState = {
  connected: false,
  publicKey: null,
  network: null,
  networkPassphrase: null,
  loading: false,
  restoring: true,
  error: null,
};

type WalletContextValue = {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  clearWalletError: () => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function useLumenFlowWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useLumenFlowWallet must be used within LumenFlowShell");
  }
  return context;
}

export function LumenFlowShell({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>(initialWalletState);

  useEffect(() => {
    const rawSession = window.localStorage.getItem(WALLET_SESSION_KEY);

    if (!rawSession) {
      setWallet((current) => ({ ...current, restoring: false }));
      return;
    }

    try {
      const session = JSON.parse(rawSession) as PersistedWalletSession;
      if (!session.publicKey) {
        throw new Error("Missing publicKey in wallet session.");
      }

      setWallet({
        connected: true,
        publicKey: session.publicKey,
        network: session.network,
        networkPassphrase: session.networkPassphrase,
        walletId: session.walletId ?? null,
        walletName: session.walletName ?? null,
        loading: false,
        restoring: false,
        error: null,
      });
    } catch {
      window.localStorage.removeItem(WALLET_SESSION_KEY);
      setWallet({ ...initialWalletState, restoring: false });
    }
  }, []);

  async function handleConnect() {
    setWallet((current) => ({ ...current, loading: true, restoring: false, error: null }));

    try {
      const result = await connectWallet();

      if ("error" in result) {
        setWallet((current) => ({
          ...current,
          connected: false,
          loading: false,
          restoring: false,
          error: result.error ?? "Could not connect to a Stellar wallet.",
        }));
        return;
      }

      if (!result.isTestnet || result.networkPassphrase !== NETWORK_PASSPHRASE) {
        setWallet({
          connected: false,
          publicKey: null,
          network: result.network,
          networkPassphrase: result.networkPassphrase,
          walletId: result.walletId ?? null,
          walletName: result.walletName ?? null,
          loading: false,
          restoring: false,
          error: "Please switch Freighter to Stellar Testnet before using LumenFlow.",
        });
        return;
      }

      window.localStorage.setItem(
        WALLET_SESSION_KEY,
        JSON.stringify({
          publicKey: result.address,
          network: result.network,
          networkPassphrase: result.networkPassphrase,
          walletId: result.walletId ?? null,
          walletName: result.walletName ?? null,
        } satisfies PersistedWalletSession),
      );

      setWallet({
        connected: true,
        publicKey: result.address,
        network: result.network,
        networkPassphrase: result.networkPassphrase,
        walletId: result.walletId ?? null,
        walletName: result.walletName ?? null,
        loading: false,
        restoring: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not connect to Freighter right now. Please try again.";
      setWallet((current) => ({
        ...current,
        connected: false,
        loading: false,
        restoring: false,
        error: message,
      }));
    }
  }

  function handleDisconnect() {
    window.localStorage.removeItem(WALLET_SESSION_KEY);
    void disconnectWallet();
    setWallet({ ...initialWalletState, restoring: false });
  }

  function clearWalletError() {
    setWallet((current) => ({ ...current, error: null }));
  }

  const value = useMemo<WalletContextValue>(
    () => ({
      wallet,
      connectWallet: handleConnect,
      disconnectWallet: handleDisconnect,
      clearWalletError,
    }),
    [wallet],
  );

  return (
    <WalletContext.Provider value={value}>
      <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-foreground)]">
        <AppHeader />
        {children}
        <AppFooter />
      </div>
    </WalletContext.Provider>
  );
}
