"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { NETWORK_PASSPHRASE } from "@/lib/stellar/constants";
import { connectWallet, disconnectWallet } from "@/lib/stellar/wallet";
import type { WalletState } from "@/lib/stellar/types";

const WALLET_SESSION_KEY = "lumenflow_wallet_session";

const initialWalletState: WalletState = {
  connected: false,
  publicKey: null,
  network: null,
  networkPassphrase: null,
  loading: false,
  error: null,
};

type WalletContextValue = {
  wallet: WalletState;
  connectWallet: (options?: { silent?: boolean }) => Promise<void>;
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
    const hadSession = window.localStorage.getItem(WALLET_SESSION_KEY) === "connected";
    if (!hadSession) return;
    void handleConnect({ silent: true });
  }, []);

  async function handleConnect(options?: { silent?: boolean }) {
    const silent = options?.silent ?? false;
    setWallet((current) => ({ ...current, loading: !silent, error: null }));

    try {
      const result = await connectWallet();

      if ("error" in result) {
        if (silent) {
          window.localStorage.removeItem(WALLET_SESSION_KEY);
          setWallet(initialWalletState);
          return;
        }

        setWallet((current) => ({
          ...current,
          connected: false,
          loading: false,
          error: result.error ?? "Could not connect to a Stellar wallet.",
        }));
        return;
      }

      if (!result.isTestnet || result.networkPassphrase !== NETWORK_PASSPHRASE) {
        if (silent) {
          window.localStorage.removeItem(WALLET_SESSION_KEY);
        }

        setWallet({
          connected: false,
          publicKey: null,
          network: result.network,
          networkPassphrase: result.networkPassphrase,
          loading: false,
          error: silent ? null : "Please switch Freighter to Stellar Testnet before using LumenFlow.",
        });
        return;
      }

      window.localStorage.setItem(WALLET_SESSION_KEY, "connected");
      setWallet({
        connected: true,
        publicKey: result.address,
        network: result.network,
        networkPassphrase: result.networkPassphrase,
        walletId: result.walletId ?? null,
        walletName: result.walletName ?? null,
        loading: false,
        error: null,
      });
    } catch (error) {
      if (silent) {
        window.localStorage.removeItem(WALLET_SESSION_KEY);
        setWallet(initialWalletState);
        return;
      }

      const message = error instanceof Error ? error.message : "Could not connect to Freighter right now. Please try again.";
      setWallet((current) => ({
        ...current,
        connected: false,
        loading: false,
        error: message,
      }));
    }
  }

  function handleDisconnect() {
    window.localStorage.removeItem(WALLET_SESSION_KEY);
    void disconnectWallet();
    setWallet(initialWalletState);
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
