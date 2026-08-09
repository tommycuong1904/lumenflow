import { Badge } from "@/components/ui/badge";

const quickLinks = [
  {
    label: "Contract explorer",
    href: "https://lab.stellar.org/r/testnet/contract/CBAEFZC6GIYE5H7ZDN3JVHH3TDAWBP5VGZCWWH4TDANWUIE2GXQWAGHO",
  },
  {
    label: "GitHub repo",
    href: "https://github.com/tommycuong1904/lumenflow",
  },
  {
    label: "Screenshots guide",
    href: "https://github.com/tommycuong1904/lumenflow/blob/main/docs/screenshots/README.md",
  },
] as const;

const capabilities = ["Multi-wallet connection", "Native XLM transfer", "Contract payment intents"] as const;

export function AppFooter() {
  return (
    <footer className="mt-14 border-t border-border/70 bg-[color:color-mix(in_srgb,var(--color-surface)_88%,transparent)]">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1.2fr_0.9fr_0.9fr] lg:px-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold tracking-tight text-foreground">LumenFlow</span>
            <Badge variant="outline" className="border-primary/20 bg-primary/8 text-primary">Level 2</Badge>
          </div>
          <p className="max-w-md text-sm leading-7 text-muted-foreground">
            A Stellar Testnet payment app designed to show the full journey from wallet connection to native transfer and contract-backed payment intent creation.
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/85">Capabilities</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {capabilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/85">Links</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <a className="transition-colors duration-200 hover:text-foreground/95" href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <span>Stellar Testnet only.</span>
          <span>Built for the Level 2 challenge submission flow.</span>
        </div>
      </div>
    </footer>
  );
}
