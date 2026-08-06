"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";

type WalletQrCodeProps = {
  address: string;
};

export function WalletQrCode({ address }: WalletQrCodeProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-muted/35 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
          Address QR
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setExpanded((current) => !current)}
          className="shrink-0 rounded-full border-border bg-background/60 px-3 text-xs text-foreground transition-transform duration-200 hover:bg-background active:scale-95"
        >
          {expanded ? "Hide" : "Show"}
        </Button>
      </div>
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-out ${
          expanded ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="flex justify-center overflow-hidden">
          <div className="rounded-2xl border border-border/70 bg-white p-3 shadow-sm">
            <QRCodeSVG value={address} size={144} level="M" />
          </div>
        </div>
      </div>
    </div>
  );
}
