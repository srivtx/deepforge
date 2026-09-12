"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Client wrapper around next-themes' ThemeProvider so we can use it from
 * a server-component layout. Picks the theme class on <html> and persists
 * the choice in localStorage under the `deepforge-theme` key.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="deepforge-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
