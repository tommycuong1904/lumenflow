import { BASE_FEE, Contract, Networks, Operation, TransactionBuilder, rpc, scValToNative } from "@stellar/stellar-sdk";

import type { CreatePaymentIntentInput, PaymentIntentRecord } from "./contract";
import { getEscrowVaultConfig, getPaymentIntentConfig } from "./contract";
import { buildCreatePaymentIntentArgs, buildGetPaymentIntentArgs } from "./contract-payload";

export type ContractSubmitStatus = "missing_contract" | "pending" | "success" | "error";

export function createSorobanRpcServer() {
  const { rpcUrl } = getPaymentIntentConfig();
  return new rpc.Server(rpcUrl);
}

export async function getSorobanLatestLedger() {
  return createSorobanRpcServer().getLatestLedger();
}

export async function getSorobanTransaction(hash: string) {
  return createSorobanRpcServer().getTransaction(hash);
}

export async function getContractSubmitStatus(hash: string): Promise<ContractSubmitStatus> {
  if (!hash.trim()) {
    return "error";
  }

  const result = await getSorobanTransaction(hash);
  const status = String(result.status ?? "").toUpperCase();

  if (status === "SUCCESS") {
    return "success";
  }

  if (status === "NOT_FOUND") {
    return "pending";
  }

  return "error";
}

export async function createPaymentIntentTransactionXdr(sourcePublicKey: string, input: CreatePaymentIntentInput) {
  const { contractId, ready } = getPaymentIntentConfig();

  if (!ready) {
    throw new Error("Contract mode is not configured.");
  }

  const server = createSorobanRpcServer();
  const sourceAccount = await server.getAccount(sourcePublicKey);
  const contract = new Contract(contractId);

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call("create_payment", ...buildCreatePaymentIntentArgs(sourcePublicKey, input)))
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(tx);
  return prepared.toXDR();
}

export async function submitSignedContractTransaction(signedTxXdr: string) {
  const server = createSorobanRpcServer();
  const transaction = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);
  return server.sendTransaction(transaction);
}

function normalizePaymentRecord(value: unknown): PaymentIntentRecord {
  const raw = value as {
    id: bigint | number | string;
    creator: string;
    recipient: string;
    amount: bigint | number | string;
    status: string;
  };

  const stroops = BigInt(raw.amount);
  const scale = BigInt(10_000_000);
  const whole = stroops / scale;
  const fraction = stroops % scale;
  const fractionText = fraction.toString().padStart(7, "0").replace(/0+$/, "");

  return {
    id: String(raw.id),
    creator: String(raw.creator),
    recipient: String(raw.recipient),
    amount: fractionText ? `${whole.toString()}.${fractionText}` : whole.toString(),
    status: String(raw.status).toLowerCase() as PaymentIntentRecord["status"],
  };
}

export async function getPaymentIntentRecord(id: string) {
  const { contractId, ready } = getPaymentIntentConfig();

  if (!ready) {
    throw new Error("Contract mode is not configured.");
  }

  const server = createSorobanRpcServer();
  const response = await server.queryContract(contractId, "get_payment", { id: Number(id) }, Networks.TESTNET);
  return normalizePaymentRecord(response.result);
}

export async function getEscrowVaultCount() {
  const { contractId, ready } = getEscrowVaultConfig();

  if (!ready) {
    return null;
  }

  const server = createSorobanRpcServer();
  const response = await server.queryContract(contractId, "get_escrow_count", {}, Networks.TESTNET);
  const result = response.result;

  if (typeof result === "number") {
    return result;
  }

  if (typeof result === "bigint") {
    return Number(result);
  }

  return Number(scValToNative(result));
}
