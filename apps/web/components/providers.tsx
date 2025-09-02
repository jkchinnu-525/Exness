"use client";

import { AuthProvider } from "@/contexts/auth-context";
import { BalanceProvider } from "@/contexts/balance-context";
import { OrdersProvider } from "@/contexts/orders-context";
import { PriceProvider } from "@/contexts/price-context";
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
      <AuthProvider>
        <PriceProvider>
          <OrdersProvider>
            <BalanceProvider>{children}</BalanceProvider>
          </OrdersProvider>
        </PriceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
