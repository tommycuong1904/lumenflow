import {
  Asset,
  BASE_FEE,
  Horizon,
  Memo,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { HORIZON_URL } from "./constants";

const server = new Horizon.Server(HORIZON_URL);

export async function createPaymentTransaction(params: {
  sourcePublicKey: string;
  destinationPublicKey: string;
  amount: string;
  memo?: string;
}) {
  const sourceAccount = await server.loadAccount(params.sourcePublicKey);
  const trimmedMemo = params.memo?.trim();

  const builder = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  }).addOperation(
    Operation.payment({
      destination: params.destinationPublicKey,
      amount: params.amount,
      asset: Asset.native(),
    }),
  );

  if (trimmedMemo) {
    builder.addMemo(Memo.text(trimmedMemo));
  }

  const transaction = builder.setTimeout(30).build();
  return transaction.toXDR();
}
