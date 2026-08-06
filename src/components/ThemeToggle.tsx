"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button type="button" variant="outline" size="sm" className="rounded-full border-border bg-secondary/45 px-4" disabled>
        Theme
      </Button>
    );
  }

  const isLight = theme === "light";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setTheme(isLight ? "dark" : "light")}
      className="rounded-full border-border bg-secondary/45 px-4 text-secondary-foreground transition-all duration-300 hover:bg-secondary/80"
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
    >
      {isLight ? "🌙 Dark" : "☀️ Light"}
    </Button>
  );
}
