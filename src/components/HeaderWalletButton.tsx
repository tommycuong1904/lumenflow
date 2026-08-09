"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLumenFlowWallet } from "@/components/LumenFlowShell";
import { truncateAddress } from "@/lib/utils/format";

export function HeaderWalletButton() {
  const { wallet, connectWallet, disconnectWallet } = useLumenFlowWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copyLabel, setCopyLabel] = useState<"Copy address" | "Copied!" | "Copy failed">("Copy address");
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  useEffect(() => {
    if (copyLabel === "Copy address") return;
    const timeout = window.setTimeout(() => setCopyLabel("Copy address"), 1200);
    return () => window.clearTimeout(timeout);
  }, [copyLabel]);

  async function handleCopy() {
    if (!wallet.publicKey) return;
    try {
      await navigator.clipboard.writeText(wallet.publicKey);
      setCopyLabel("Copied!");
    } catch {
      setCopyLabel("Copy failed");
    }
  }

  if (!wallet.connected) {
    return (
      <Button
        type="button"
        onClick={() => void connectWallet()}
        disabled={wallet.loading}
        className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-[#7c3aed]"
      >
        {wallet.loading ? "Connecting..." : "Connect wallet"}
      </Button>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setMenuOpen((open) => !open)}
        className="rounded-full border-border bg-secondary/50 px-4 text-secondary-foreground hover:bg-secondary/80"
      >
        {truncateAddress(wallet.publicKey ?? "")}
        <span className="ml-2 text-xs">▼</span>
      </Button>
      {menuOpen ? (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-border bg-card/95 p-2 shadow-[var(--surface-shadow-card)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-secondary/65"
          >
            {copyLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              disconnectWallet();
            }}
            className="mt-1 flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-rose-400 transition-colors hover:bg-rose-500/10"
          >
            Disconnect
          </button>
        </div>
      ) : null}
    </div>
  );
}
