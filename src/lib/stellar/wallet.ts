import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import { KitEventType, type ISupportedWallet, Networks, type SwkAppTheme } from "@creit.tech/stellar-wallets-kit/types";
import { NETWORK_PASSPHRASE, TESTNET_NETWORK_NAME } from "./constants";
import type { FreighterDebugEvent } from "./types";

type ConnectWalletSuccess = {
  address: string;
  network: string;
  networkPassphrase: string;
  walletId: string | null;
  walletName: string;
  isTestnet: boolean;
  debug: FreighterDebugEvent[];
};

type ConnectWalletFailure = {
  error: string;
  debug: FreighterDebugEvent[];
};

type SignWalletSuccess = {
  signedTxXdr: string;
  signerAddress?: string;
};

type SignWalletFailure = {
  error: string;
};

let kitInitialized = false;
let selectedWalletId: string | null = null;
let selectedWalletName: string | null = null;
let supportedWalletsCache: ISupportedWallet[] = [];

const swkLightTheme: SwkAppTheme = {
  background: "rgba(255,255,255,0.98)",
  "background-secondary": "#f8fafc",
  "foreground-strong": "#020617",
  foreground: "#0f172a",
  "foreground-secondary": "#475569",
  primary: "#7c3aed",
  "primary-foreground": "#ffffff",
  transparent: "rgba(0, 0, 0, 0)",
  lighter: "#ffffff",
  light: "#f8fafc",
  "light-gray": "#e2e8f0",
  gray: "#94a3b8",
  danger: "#ef4444",
  border: "rgba(15, 23, 42, 0.12)",
  shadow: "0 28px 80px rgba(15, 23, 42, 0.18)",
  "border-radius": "1.25rem",
  "font-family": "Inter, ui-sans-serif, system-ui, sans-serif",
};

const swkDarkTheme: SwkAppTheme = {
  background: "rgba(2, 6, 23, 0.98)",
  "background-secondary": "#0f172a",
  "foreground-strong": "#f8fafc",
  foreground: "#e2e8f0",
  "foreground-secondary": "#94a3b8",
  primary: "#8b5cf6",
  "primary-foreground": "#ffffff",
  transparent: "rgba(0, 0, 0, 0)",
  lighter: "#ffffff",
  light: "#1e293b",
  "light-gray": "#334155",
  gray: "#64748b",
  danger: "#f87171",
  border: "rgba(148, 163, 184, 0.22)",
  shadow: "0 36px 110px rgba(2, 6, 23, 0.62)",
  "border-radius": "1.25rem",
  "font-family": "Inter, ui-sans-serif, system-ui, sans-serif",
};

function event(step: string, detail: string): FreighterDebugEvent {
  return { step, detail };
}

function getWalletKitTheme(): SwkAppTheme {
  if (typeof document === "undefined") {
    return swkDarkTheme;
  }

  return document.documentElement.classList.contains("dark") ? swkDarkTheme : swkLightTheme;
}

function initKit() {
  if (kitInitialized || typeof window === "undefined") return;

  StellarWalletsKit.init({
    modules: defaultModules(),
    network: Networks.TESTNET,
    theme: getWalletKitTheme(),
    authModal: {
      showInstallLabel: true,
      hideUnsupportedWallets: false,
    },
  });

  StellarWalletsKit.on(KitEventType.WALLET_SELECTED, (wallet) => {
    selectedWalletId = wallet.payload.id ?? null;
    selectedWalletName = supportedWalletsCache.find((item) => item.id === wallet.payload.id)?.name ?? null;
  });

  StellarWalletsKit.on(KitEventType.DISCONNECT, () => {
    selectedWalletId = null;
    selectedWalletName = null;
  });

  kitInitialized = true;
}

function mapConnectionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "Unknown wallet error.");
  const normalized = message.toLowerCase();

  if (normalized.includes("reject") || normalized.includes("declin") || normalized.includes("cancel")) {
    return "Wallet connection was rejected.";
  }

  if (
    normalized.includes("not found") ||
    normalized.includes("not installed") ||
    normalized.includes("unsupported") ||
    normalized.includes("no wallet")
  ) {
    return "No supported Stellar wallet was found.";
  }

  return message || "Could not connect to a Stellar wallet.";
}

function mapSigningError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "Transaction signing failed.");
  const normalized = message.toLowerCase();

  if (normalized.includes("reject") || normalized.includes("declin") || normalized.includes("cancel")) {
    return "Transaction signing was rejected.";
  }

  return message || "Transaction signing failed.";
}

export async function connectWallet(): Promise<ConnectWalletSuccess | ConnectWalletFailure> {
  initKit();
  StellarWalletsKit.setTheme(getWalletKitTheme());
  const debug: FreighterDebugEvent[] = [];
  debug.push(event("environment", typeof window === "undefined" ? "window is undefined" : `window available on ${window.location.origin}`));

  try {
    supportedWalletsCache = await StellarWalletsKit.refreshSupportedWallets();
    debug.push(event("refreshSupportedWallets", JSON.stringify(supportedWalletsCache.map((wallet) => ({
      id: wallet.id,
      name: wallet.name,
      isAvailable: wallet.isAvailable,
    })))));

    const hasSupportedWallet = supportedWalletsCache.some((wallet) => wallet.isAvailable);
    if (!hasSupportedWallet) {
      return {
        error: "No supported Stellar wallet was found.",
        debug,
      };
    }

    const accessResult = await StellarWalletsKit.authModal();
    debug.push(event("authModal", JSON.stringify(accessResult)));

    const networkResult = await StellarWalletsKit.getNetwork();
    debug.push(event("getNetwork", JSON.stringify(networkResult)));

    const walletName = selectedWalletName ?? supportedWalletsCache.find((wallet) => wallet.id === selectedWalletId)?.name ?? "Connected wallet";

    return {
      address: accessResult.address,
      network: networkResult.network,
      networkPassphrase: networkResult.networkPassphrase,
      walletId: selectedWalletId,
      walletName,
      isTestnet:
        networkResult.networkPassphrase === NETWORK_PASSPHRASE ||
        networkResult.network.toUpperCase() === TESTNET_NETWORK_NAME,
      debug,
    };
  } catch (error) {
    return {
      error: mapConnectionError(error),
      debug: [...debug, event("exception", error instanceof Error ? error.message : String(error))],
    };
  }
}

export async function disconnectWallet() {
  initKit();
  try {
    await StellarWalletsKit.disconnect();
  } catch {
    // Best effort only; UI state reset happens in the caller.
  }
}

export async function signWalletTransaction(
  transactionXdr: string,
  address: string,
): Promise<SignWalletSuccess | SignWalletFailure> {
  initKit();

  try {
    const result = await StellarWalletsKit.signTransaction(transactionXdr, {
      address,
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    return {
      signedTxXdr: result.signedTxXdr,
      signerAddress: result.signerAddress,
    };
  } catch (error) {
    return { error: mapSigningError(error) };
  }
}

export function getSelectedWalletName() {
  return selectedWalletName;
}

export function getSelectedWalletId() {
  return selectedWalletId;
}
