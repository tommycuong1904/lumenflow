"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4.25" />
      <path d="M12 2.75v2.1M12 19.15v2.1M4.93 4.93l1.48 1.48M17.59 17.59l1.48 1.48M2.75 12h2.1M19.15 12h2.1M4.93 19.07l1.48-1.48M17.59 6.41l1.48-1.48" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.2 3.4a8.9 8.9 0 1 0 5.4 14.5A9.6 9.6 0 0 1 15.2 3.4Z" />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border-border bg-secondary/45 text-muted-foreground shadow-none"
        disabled
        aria-label="Theme loading"
      >
        <span className="h-3 w-3 rounded-full border border-current opacity-50" />
      </Button>
    );
  }

  const isLight = theme === "light";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setTheme(isLight ? "dark" : "light")}
      className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border-border bg-secondary/45 text-secondary-foreground shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary/80 hover:text-foreground active:translate-y-0 active:scale-95"
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Dark mode" : "Light mode"}
    >
      {isLight ? <MoonIcon /> : <SunIcon />}
    </Button>
  );
}
