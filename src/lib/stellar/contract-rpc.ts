import { BASE_FEE, Contract, Networks, TransactionBuilder, rpc, scValToNative, xdr } from "@stellar/stellar-sdk";

import type { CreateEscrowVaultInput, CreatePaymentIntentInput, EscrowContractEvent, EscrowVaultRecord, PaymentIntentRecord } from "./contract";
import { getEscrowVaultConfig, getPaymentIntentConfig } from "./contract";
import { buildCreateEscrowVaultArgs, buildCreatePaymentIntentArgs, buildRefundEscrowVaultArgs, buildReleaseEscrowVaultArgs } from "./contract-payload";

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

export async function createReleaseEscrowVaultTransactionXdr(sourcePublicKey: string, escrowId: string | number) {
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
    .addOperation(contract.call("release_escrow", ...buildReleaseEscrowVaultArgs(escrowId, sourcePublicKey)))
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(tx);
  return prepared.toXDR();
}

export async function createRefundEscrowVaultTransactionXdr(sourcePublicKey: string, escrowId: string | number) {
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
    .addOperation(contract.call("refund_escrow", ...buildRefundEscrowVaultArgs(escrowId, sourcePublicKey)))
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

/**
 * Soroban SDK serializes fieldless Rust enums (e.g. `PaymentStatus::Pending`)
 * as `{ tag: "Pending", values: [] }` over RPC, not as a plain string.
 * `String(raw.status)` on that object always yields the useless
 * "[object Object]" — pull the `tag` out explicitly instead.
 */
function normalizeContractStatus(status: unknown): string {
  if (status && typeof status === "object" && "tag" in status) {
    return String((status as { tag: unknown }).tag);
  }
  return String(status ?? "");
}

function normalizePaymentRecord(value: unknown): PaymentIntentRecord {
  const raw = value as {
    id: bigint | number | string;
    creator: string;
    recipient: string;
    amount: bigint | number | string;
    status: unknown;
  };

  return {
    id: String(raw.id),
    creator: String(raw.creator),
    recipient: String(raw.recipient),
    amount: formatTokenAmount(raw.amount),
    status: normalizeContractStatus(raw.status).toLowerCase() as PaymentIntentRecord["status"],
  };
}

function normalizeEscrowVaultRecord(value: unknown): EscrowVaultRecord {
  const raw = value as {
    id: bigint | number | string;
    payer: string;
    payee: string;
    amount: bigint | number | string;
    memo?: string;
    status: unknown;
    created_at: bigint | number | string;
    updated_at: bigint | number | string;
  };

  return {
    id: String(raw.id),
    payer: String(raw.payer),
    payee: String(raw.payee),
    amount: formatTokenAmount(raw.amount),
    memo: String(raw.memo ?? ""),
    status: normalizeContractStatus(raw.status).toLowerCase() as EscrowVaultRecord["status"],
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

function parseScValSafely(val: unknown): unknown {
  if (!val) return null;
  if (typeof val === "string") {
    try {
      return scValToNative(xdr.ScVal.fromXDR(val, "base64"));
    } catch {
      return val;
    }
  }
  try {
    return scValToNative(val as xdr.ScVal);
  } catch {
    return val;
  }
}

function parseRawEscrowEvent(rawEvent: rpc.Api.EventResponse, idx: number): EscrowContractEvent {
  let topicName = "unknown";
  let eventEscrowId = "";

  try {
    if (Array.isArray(rawEvent.topic)) {
      const parsedTopics = rawEvent.topic.map((t) => parseScValSafely(t));
      if (parsedTopics[0]) {
        topicName = String(parsedTopics[0]).toLowerCase();
      }
      if (parsedTopics[1] !== undefined) {
        eventEscrowId = String(parsedTopics[1]);
      }
    }
  } catch {
    // fallback
  }

  let parsedVal: Record<string, unknown> = {};
  try {
    if (rawEvent.value) {
      parsedVal = (parseScValSafely(rawEvent.value) as Record<string, unknown>) ?? {};
    }
  } catch {
    // fallback
  }

  const escrowId = eventEscrowId || (parsedVal.escrow_id ? String(parsedVal.escrow_id) : String(idx + 1));
  const amount = parsedVal.amount ? formatTokenAmount(parsedVal.amount as bigint | number | string) : "0";
  const payer = String(parsedVal.payer ?? "");
  const payee = String(parsedVal.payee ?? "");
  const memo = String(parsedVal.memo ?? "");
  const rawStatus = parsedVal.status;
  const status = normalizeContractStatus(Array.isArray(rawStatus) ? rawStatus[0] : rawStatus);
  const timestamp = parsedVal.timestamp ? Number(parsedVal.timestamp) : Date.now() / 1000;

  return {
    id: `${rawEvent.txHash}-${idx}`,
    type: (["created", "released", "refunded"].includes(topicName) ? topicName : "unknown") as EscrowContractEvent["type"],
    escrowId,
    payer,
    payee,
    amount,
    memo,
    status,
    timestamp,
    ledger: rawEvent.ledger,
    txHash: rawEvent.txHash,
  };
}

export async function getEscrowContractEvents(options?: {
  limit?: number;
  lookbackLedgers?: number;
}): Promise<EscrowContractEvent[]> {
  const { contractId, ready } = getEscrowVaultConfig();
  if (!ready) return [];

  const server = createSorobanRpcServer();
  const latest = await server.getLatestLedger();
  const lookback = options?.lookbackLedgers ?? 90000;
  const startLedger = Math.max(1, latest.sequence - lookback);

  try {
    const response = await server.getEvents({
      startLedger,
      filters: [
        {
          type: "contract",
          contractIds: [contractId],
        },
      ],
      limit: options?.limit ?? 20,
    });

    if (!response.events || response.events.length === 0) {
      return [];
    }

    return response.events.map((rawEvent, idx) => parseRawEscrowEvent(rawEvent, idx)).reverse();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const match = message.match(/range:\s*(\d+)\s*-\s*(\d+)/i);
    if (match && match[1]) {
      try {
        const minLedger = parseInt(match[1], 10);
        const retryResponse = await server.getEvents({
          startLedger: minLedger,
          filters: [
            {
              type: "contract",
              contractIds: [contractId],
            },
          ],
          limit: options?.limit ?? 20,
        });
        if (!retryResponse.events) return [];
        return retryResponse.events.map((rawEvent, idx) => parseRawEscrowEvent(rawEvent, idx)).reverse();
      } catch {
        return [];
      }
    }
    return [];
  }
}
