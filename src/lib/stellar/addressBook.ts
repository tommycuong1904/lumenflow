export type AddressBookEntry = {
  address: string;
  label: string;
};

const STORAGE_KEY = "lumenflow_address_book";

export function loadAddressBook(): AddressBookEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is AddressBookEntry =>
        typeof entry?.address === "string" && typeof entry?.label === "string",
    );
  } catch {
    return [];
  }
}

export function saveAddressBook(entries: AddressBookEntry[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function upsertAddressBookEntry(
  entries: AddressBookEntry[],
  entry: AddressBookEntry,
): AddressBookEntry[] {
  const existingIndex = entries.findIndex((item) => item.address === entry.address);
  if (existingIndex === -1) {
    return [...entries, entry];
  }
  const next = [...entries];
  next[existingIndex] = entry;
  return next;
}

export function removeAddressBookEntry(
  entries: AddressBookEntry[],
  address: string,
): AddressBookEntry[] {
  return entries.filter((item) => item.address !== address);
}
