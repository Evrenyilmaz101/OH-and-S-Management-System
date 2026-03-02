"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/");
        router.refresh();
      } else {
        setCheckingAuth(false);
      }
    };
    checkUser();
  }, [router, supabase.auth]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setConfirmPassword("");
    setError("");
    setMessage("");
  };

  const switchMode = (newMode: Mode) => {
    resetForm();
    setMode(newMode);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setMessage("Check your email for a confirmation link.");
  };

  // Show nothing while checking auth status
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1117] px-4">
      <Card className="w-full max-w-md border-zinc-800/60 bg-[#1a1d27] shadow-2xl">
        {/* ── BRANDING ── */}
        <CardHeader className="pb-0">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 rounded-lg bg-amber-500/10">
              <Shield className="w-8 h-8 text-amber-500" />
            </div>
            <CardTitle className="text-lg font-semibold tracking-[0.15em] uppercase text-zinc-100">
              Thornton Engineering
            </CardTitle>
            <p className="text-xs text-zinc-500 uppercase tracking-[0.1em]">
              OH&S Management System
            </p>
            <div className="w-full h-px bg-zinc-800 mt-2" />
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* ── MODE TABS ── */}
          <div className="flex mb-6 rounded-md overflow-hidden border border-zinc-800">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === "login"
                  ? "bg-amber-500 text-zinc-900"
                  : "bg-zinc-800/50 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === "signup"
                  ? "bg-amber-500 text-zinc-900"
                  : "bg-zinc-800/50 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* ── ERROR MESSAGE ── */}
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* ── SUCCESS MESSAGE ── */}
          {message && (
            <div className="mb-4 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              {message}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-zinc-300 text-xs uppercase tracking-wider">
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-amber-500 focus-visible:ring-amber-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-zinc-300 text-xs uppercase tracking-wider">
                  Password
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-amber-500 focus-visible:ring-amber-500/20"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 text-zinc-900 font-semibold hover:bg-amber-400 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Log In"
                )}
              </Button>
            </form>
          )}

          {/* ── SIGNUP FORM ── */}
          {mode === "signup" && !message && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-zinc-300 text-xs uppercase tracking-wider">
                  Full Name
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-amber-500 focus-visible:ring-amber-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-zinc-300 text-xs uppercase tracking-wider">
                  Email
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-amber-500 focus-visible:ring-amber-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-zinc-300 text-xs uppercase tracking-wider">
                  Password
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-amber-500 focus-visible:ring-amber-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm" className="text-zinc-300 text-xs uppercase tracking-wider">
                  Confirm Password
                </Label>
                <Input
                  id="signup-confirm"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-amber-500 focus-visible:ring-amber-500/20"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 text-zinc-900 font-semibold hover:bg-amber-400 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          )}

          {/* ── MODE TOGGLE LINK ── */}
          <div className="mt-6 text-center text-sm text-zinc-500">
            {mode === "login" ? (
              <p>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="text-amber-500 hover:text-amber-400 font-medium transition-colors"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-amber-500 hover:text-amber-400 font-medium transition-colors"
                >
                  Log In
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
