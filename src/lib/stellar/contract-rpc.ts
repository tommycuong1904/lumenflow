import { BASE_FEE, Contract, Networks, Operation, TransactionBuilder, rpc, scValToNative } from "@stellar/stellar-sdk";

import type { CreateEscrowVaultInput, CreatePaymentIntentInput, EscrowVaultRecord, PaymentIntentRecord } from "./contract";
import { getEscrowVaultConfig, getPaymentIntentConfig } from "./contract";
import { buildCreateEscrowVaultArgs, buildCreatePaymentIntentArgs, buildGetPaymentIntentArgs } from "./contract-payload";

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

export async function createEscrowVaultTransactionXdr(sourcePublicKey: string, input: CreateEscrowVaultInput) {
  const { contractId, ready } = getEscrowVaultConfig();

  if (!ready) {
    throw new Error("Escrow vault contract is not configured.");
  }

  const server = createSorobanRpcServer();
  const sourceAccount = await server.getAccount(sourcePublicKey);
  const contract = new Contract(contractId);

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call("create_escrow", ...buildCreateEscrowVaultArgs(sourcePublicKey, input)))
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(tx);
  return prepared.toXDR();
}

const TRANSACTION_POLL_INTERVAL_MS = 1500;
const TRANSACTION_POLL_MAX_ATTEMPTS = 10;

/**
 * Soroban RPC does not index a submitted transaction instantly. Right after
 * `sendTransaction`, `getTransaction` legitimately returns NOT_FOUND for a
 * few seconds while the ledger ingests it. Treat NOT_FOUND as "still
 * pending" and poll until we see a terminal status (SUCCESS/FAILED) or run
 * out of attempts, instead of surfacing NOT_FOUND as an error on the first check.
 */
export async function waitForSorobanTransaction(hash: string) {
  let lastResult = await getSorobanTransaction(hash);

  for (let attempt = 1; attempt < TRANSACTION_POLL_MAX_ATTEMPTS; attempt += 1) {
    const status = String(lastResult.status ?? "").toUpperCase();

    if (status !== "NOT_FOUND") {
      return lastResult;
    }

    await new Promise((resolve) => setTimeout(resolve, TRANSACTION_POLL_INTERVAL_MS));
    lastResult = await getSorobanTransaction(hash);
  }

  return lastResult;
}

export async function submitSignedContractTransaction(signedTxXdr: string) {
  const server = createSorobanRpcServer();
  const transaction = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);
  return server.sendTransaction(transaction);
}

function formatTokenAmount(value: bigint | number | string) {
  const stroops = BigInt(value);
  const scale = BigInt(10_000_000);
  const whole = stroops / scale;
  const fraction = stroops % scale;
  const fractionText = fraction.toString().padStart(7, "0").replace(/0+$/, "");

  return fractionText ? `${whole.toString()}.${fractionText}` : whole.toString();
}

function normalizePaymentRecord(value: unknown): PaymentIntentRecord {
  const raw = value as {
    id: bigint | number | string;
    creator: string;
    recipient: string;
    amount: bigint | number | string;
    status: string;
  };

  return {
    id: String(raw.id),
    creator: String(raw.creator),
    recipient: String(raw.recipient),
    amount: formatTokenAmount(raw.amount),
    status: String(raw.status).toLowerCase() as PaymentIntentRecord["status"],
  };
}

function normalizeEscrowVaultRecord(value: unknown): EscrowVaultRecord {
  const raw = value as {
    id: bigint | number | string;
    payer: string;
    payee: string;
    amount: bigint | number | string;
    memo?: string;
    status: string;
    created_at: bigint | number | string;
    updated_at: bigint | number | string;
  };

  return {
    id: String(raw.id),
    payer: String(raw.payer),
    payee: String(raw.payee),
    amount: formatTokenAmount(raw.amount),
    memo: String(raw.memo ?? ""),
    status: String(raw.status).toLowerCase() as EscrowVaultRecord["status"],
    createdAt: Number(raw.created_at),
    updatedAt: Number(raw.updated_at),
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

export async function getEscrowVaultRecord(id: string) {
  const { contractId, ready } = getEscrowVaultConfig();

  if (!ready) {
    return null;
  }

  const server = createSorobanRpcServer();
  const response = await server.queryContract(contractId, "get_escrow", { id: Number(id) }, Networks.TESTNET);
  return normalizeEscrowVaultRecord(response.result);
}
