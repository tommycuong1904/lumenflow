import { Horizon, Networks, TransactionBuilder } from "@stellar/stellar-sdk";
import { HORIZON_URL } from "./constants";

const server = new Horizon.Server(HORIZON_URL);

export async function submitSignedTransaction(signedTxXdr: string) {
  const transaction = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);
  return server.submitTransaction(transaction);
}
