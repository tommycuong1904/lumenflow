"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type AddressBookEntry,
  loadAddressBook,
  removeAddressBookEntry,
  saveAddressBook,
  upsertAddressBookEntry,
} from "@/lib/stellar/addressBook";
import { truncateAddress } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

type AddressBookProps = {
  onUseAddress: (address: string) => void;
  /** Address to auto-save (e.g. after a successful send). Optional. */
  autoSaveAddress?: string | null;
};

export function AddressBook({ onUseAddress, autoSaveAddress }: AddressBookProps) {
  const [entries, setEntries] = useState<AddressBookEntry[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setEntries(loadAddressBook());
  }, []);

  useEffect(() => {
    if (!autoSaveAddress) return;
    setEntries((current) => {
      if (current.some((entry) => entry.address === autoSaveAddress)) {
        return current;
      }
      const next = upsertAddressBookEntry(current, {
        address: autoSaveAddress,
        label: `Saved ${truncateAddress(autoSaveAddress, 4, 4)}`,
      });
      saveAddressBook(next);
      return next;
    });
  }, [autoSaveAddress]);

  function handleAdd() {
    const address = newAddress.trim();
    const label = newLabel.trim() || truncateAddress(address, 4, 4);
    if (!address) return;

    const next = upsertAddressBookEntry(entries, { address, label });
    setEntries(next);
    saveAddressBook(next);
    setNewAddress("");
    setNewLabel("");
  }

  function handleRemove(address: string) {
    const next = removeAddressBookEntry(entries, address);
    setEntries(next);
    saveAddressBook(next);
  }

  return (
    <div className="space-y-3 rounded-[24px] border border-border/80 bg-background/35 px-4 py-4 sm:px-5">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-primary/20 bg-primary/8 px-3 py-1 text-[11px] tracking-[0.24em] text-primary uppercase">
            Address book
          </Badge>
          <span className="text-sm text-muted-foreground">{entries.length} saved</span>
        </div>
        <span className="text-sm font-medium text-foreground">{isOpen ? "Hide" : "Show"}</span>
      </button>

      {isOpen ? (
        <div className="animate-in fade-in slide-in-from-top-1 space-y-4 duration-200">
          <div className="grid gap-3 grid-cols-1">
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No saved addresses yet. Send a payment or add one below.
              </p>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.address}
                  className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-medium text-foreground">{entry.label}</p>
                    <p className="break-all text-xs text-muted-foreground">{entry.address}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onUseAddress(entry.address)}
                      className="rounded-full border-border bg-background/60 px-4 text-xs text-foreground hover:bg-background"
                    >
                      Use
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(entry.address)}
                      className="rounded-full px-4 text-xs text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="grid gap-3 grid-cols-1 border-t border-border/40 pt-4">
            <Input
              value={newLabel}
              onChange={(event) => setNewLabel(event.target.value)}
              placeholder="Label (optional)"
              className={cn(
                "h-11 rounded-2xl border-border bg-background/50 px-4 text-sm text-foreground placeholder:text-muted-foreground",
              )}
            />
            <Input
              value={newAddress}
              onChange={(event) => setNewAddress(event.target.value)}
              placeholder="G... address to save"
              className="h-11 rounded-2xl border-border bg-background/50 px-4 text-sm text-foreground placeholder:text-muted-foreground"
            />
            <Button
              type="button"
              onClick={handleAdd}
              disabled={!newAddress.trim()}
              variant="outline"
              className="w-full rounded-full border-border bg-background/60 px-5 text-foreground hover:bg-background sm:w-auto"
            >
              Save address
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
