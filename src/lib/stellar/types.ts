export type WalletState = {
  connected: boolean;
  publicKey: string | null;
  network: string | null;
  networkPassphrase: string | null;
  loading: boolean;
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
};

export type SendFormState = {
  recipient: string;
  amount: string;
  memo: string;
};

export type FreighterDebugEvent = {
  step: string;
  detail: string;
};
