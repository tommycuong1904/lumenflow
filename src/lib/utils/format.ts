export function truncateAddress(address: string, prefix = 6, suffix = 4): string {
  if (!address) return "";
  if (address.length <= prefix + suffix) return address;
  return `${address.slice(0, prefix)}...${address.slice(-suffix)}`;
}

export function formatBalance(balance: string | null): string {
  if (!balance) return "--";
  const value = Number(balance);
  if (!Number.isFinite(value)) return balance;
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 7 });
}

export function shortHash(hash: string | null): string {
  if (!hash) return "";
  return truncateAddress(hash, 10, 8);
}
