import {
  getAddress,
  getNetwork,
  isConnected,
  isAllowed,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";
import { NETWORK_PASSPHRASE, TESTNET_NETWORK_NAME } from "./constants";
import type { FreighterDebugEvent } from "./types";

function event(step: string, detail: string): FreighterDebugEvent {
  return { step, detail };
}

export function isFreighterAvailable(): boolean {
  return typeof window !== "undefined";
}

export async function connectWallet() {
  const debug: FreighterDebugEvent[] = [];
  debug.push(event("environment", typeof window === "undefined" ? "window is undefined" : `window available on ${window.location.origin}`));

  const connectionState = await isConnected();
  debug.push(event("isConnected", JSON.stringify(connectionState)));
  if (connectionState.error) {
    return {
      error: connectionState.error.message ?? "Unable to detect Freighter.",
      debug,
    };
  }

  const accessState = await isAllowed();
  debug.push(event("isAllowed", JSON.stringify(accessState)));
  if (accessState.error) {
    return {
      error: accessState.error.message ?? "Unable to verify Freighter permissions.",
      debug,
    };
  }

  const accessResult = connectionState.isConnected && accessState.isAllowed ? await getAddress() : await requestAccess();
  debug.push(
    event(
      connectionState.isConnected && accessState.isAllowed ? "getAddress" : "requestAccess",
      JSON.stringify(accessResult),
    ),
  );

  if (accessResult.error) {
    return {
      error: accessResult.error.message ?? "Wallet connection was rejected.",
      debug,
    };
  }

  const networkResult = await getNetwork();
  debug.push(event("getNetwork", JSON.stringify(networkResult)));
  if (networkResult.error) {
    return {
      error: networkResult.error.message ?? "Unable to read Freighter network.",
      debug,
    };
  }

  return {
    address: accessResult.address,
    network: networkResult.network,
    networkPassphrase: networkResult.networkPassphrase,
    isTestnet:
      networkResult.networkPassphrase === NETWORK_PASSPHRASE ||
      networkResult.network.toUpperCase() === TESTNET_NETWORK_NAME,
    debug,
  };
}

export async function signFreighterTransaction(transactionXdr: string, address: string) {
  const result = await signTransaction(transactionXdr, {
    address,
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  if (result.error) {
    return { error: result.error.message ?? "Transaction signing failed." };
  }

  return {
    signedTxXdr: result.signedTxXdr,
    signerAddress: result.signerAddress,
  };
}
