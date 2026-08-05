import { Horizon, Networks, TransactionBuilder } from "@stellar/stellar-sdk";
import { HORIZON_URL } from "./constants";

const server = new Horizon.Server(HORIZON_URL);

export async function getAccount(publicKey: string) {
  return server.loadAccount(publicKey);
}

export async function checkAccountFunded(publicKey: string): Promise<boolean> {
  try {
    await getAccount(publicKey);
    return true;
  } catch {
    return false;
  }
}

export async function getXlmBalance(publicKey: string): Promise<{ funded: boolean; xlm: string | null }> {
  try {
    const account = await getAccount(publicKey);
    const nativeBalance = account.balances.find((balance) => balance.asset_type === "native");

    return {
      funded: true,
      xlm: nativeBalance?.balance ?? null,
    };
  } catch {
    return {
      funded: false,
      xlm: null,
    };
  }
}

export async function submitTransactionXdr(signedTxXdr: string) {
  const transaction = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);
  return server.submitTransaction(transaction);
}
