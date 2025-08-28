"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button, cn } from "@workspace/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      await signup(formData.full_name, formData.email, formData.password);
      // Redirect to trading dashboard
      router.push("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary-foreground"
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
            <h1 className="text-2xl font-bold text-foreground">
              Create Account
            </h1>
            <p className="text-muted-foreground mt-2">
              Start your trading journey today
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                value={formData.full_name}
                onChange={handleInputChange}
                className={cn(
                  "w-full px-3 py-2 border border-input rounded-md",
                  "bg-background text-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                  "placeholder:text-muted-foreground",
                  "transition-colors duration-200"
                )}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={cn(
                  "w-full px-3 py-2 border border-input rounded-md",
                  "bg-background text-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                  "placeholder:text-muted-foreground",
                  "transition-colors duration-200"
                )}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className={cn(
                  "w-full px-3 py-2 border border-input rounded-md",
                  "bg-background text-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                  "placeholder:text-muted-foreground",
                  "transition-colors duration-200"
                )}
                placeholder="Create a password"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be at least 6 characters long
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={cn(
                  "w-full px-3 py-2 border border-input rounded-md",
                  "bg-background text-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                  "placeholder:text-muted-foreground",
                  "transition-colors duration-200"
                )}
                placeholder="Confirm your password"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-primary hover:text-primary/90 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-xs text-muted-foreground text-center space-y-2">
              <p className="font-medium text-foreground">What you get:</p>
              <ul className="space-y-1">
                <li>💰 $100,000 demo balance</li>
                <li>📊 Real-time market data</li>
                <li>🚀 Professional trading tools</li>
                <li>🔒 Bank-level security</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
