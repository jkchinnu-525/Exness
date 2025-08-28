"use client";

import { AuthProvider } from "@/contexts/auth-context";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";
import * as React from "react";

interface ExtendedThemeProviderProps extends ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ExtendedThemeProviderProps> = ({
  children,
  ...props
}) => {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
