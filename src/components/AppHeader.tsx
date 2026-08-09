"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeaderWalletButton } from "@/components/HeaderWalletButton";

const navItems = [
  { href: "#wallet-section", label: "Wallet" },
  { href: "#payment-section", label: "Payments" },
] as const;

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-[color:color-mix(in_srgb,var(--color-surface)_82%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[1.65rem] font-semibold tracking-tight text-foreground sm:text-[1.85rem]">LumenFlow</span>
            <Badge variant="outline" className="border-primary/20 bg-primary/8 px-2.5 py-0.75 text-[10px] tracking-[0.18em] text-primary uppercase">
              Stellar Testnet
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">
          <nav aria-label="Section navigation" className="flex items-center gap-2 rounded-full border border-border/70 bg-secondary/30 px-2 py-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-secondary/80 hover:text-foreground hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-3">
            <ThemeToggle />
            <HeaderWalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}
