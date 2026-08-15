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
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-8 sm:py-4 lg:px-10">
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <span className="text-base font-bold tracking-tight text-foreground sm:text-[1.35rem]">
            LumenFlow
          </span>
          <Badge
            variant="outline"
            className="border-primary/20 bg-primary/8 px-1.5 py-0.25 text-[7.5px] font-semibold tracking-[0.1em] text-primary uppercase sm:px-2 sm:py-0.5 sm:text-[8.5px] sm:tracking-[0.14em]"
          >
            <span className="hidden sm:inline">Stellar </span>Testnet
          </Badge>
        </div>

        <nav aria-label="Section navigation" className="hidden md:flex items-center gap-1 rounded-full border border-border/70 bg-secondary/30 px-2 py-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary/80 hover:text-foreground active:scale-95"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <HeaderWalletButton />
        </div>
      </div>
    </header>
  );
}
