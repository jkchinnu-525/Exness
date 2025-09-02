"use client";

import { useAuth } from "@/contexts/auth-context";
import { useBalance } from "@/contexts/balance-context";
import { Button } from "@workspace/ui";
import { useRouter } from "next/navigation";

export function AuthHeader() {
  const { user, signout, isAuthenticated } = useAuth();
  const { totalBalance, isLoading } = useBalance();
  const router = useRouter();

  const handleSignOut = () => {
    signout();
    router.push("/signin");
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  // Add safety check for totalBalance
  const safeTotalBalance = totalBalance ?? 0;

  return (
    <div className="bg-[#1a1d23] border-b border-[#2a2d35] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Exness Trading</h1>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm text-gray-300">Welcome, {user.full_name}</p>
          <p className="text-xs text-green-400">
            {isLoading
              ? "Loading balance..."
              : `Demo Balance: $${safeTotalBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
          </p>
        </div>

        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-primary">
            {user.email.charAt(0).toUpperCase()}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="text-gray-300 border-gray-600 hover:bg-gray-700"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
