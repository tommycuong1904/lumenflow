export type WalletState = {
  connected: boolean;
  publicKey: string | null;
  network: string | null;
  networkPassphrase: string | null;
  walletId?: string | null;
  walletName?: string | null;
  loading: boolean;
  restoring?: boolean;
  error: string | null;
};
export type BalanceState = {
  xlm: string | null;
  funded: boolean;
  loading: boolean;
  error: string | null;
};

export type TxState = {
  status: "idle" | "validating" | "signing" | "submitting" | "success" | "error";
  hash: string | null;
  message: string | null;
  amount?: string | null;
  recipient?: string | null;
  memo?: string | null;
  mode?: "native_transfer" | "contract" | "escrow" | null;
  paymentIntentId?: string | null;
};

export type SendFormState = {
  recipient: string;
  amount: string;
  memo: string;
  mode?: "native_transfer" | "contract" | "escrow";
};

export type FreighterDebugEvent = {
  step: string;
  detail: string;
};
