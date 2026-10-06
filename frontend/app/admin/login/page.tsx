"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Lock, Mail, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { apiService } from "@/services/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@pavilionrealty.com");
  const [password, setPassword] = useState("Admin@Pavilion2025!");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await apiService.auth.login(email, password, rememberMe);
      if (res.success) {
        router.push("/admin/dashboard");
      } else {
        setErrorMessage(res.message || "Invalid credentials.");
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || "Authentication failed. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 relative overflow-hidden">
      {/* Background Subtle Gradient & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.06)_0,transparent_60%)]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo Card */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Building2 className="w-6 h-6 text-slate-950" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-bold tracking-wider text-white font-serif block">
                PAVILION
              </span>
              <span className="text-xs text-amber-400 tracking-widest uppercase font-mono block -mt-1">
                ENTERPRISE CMS
              </span>
            </div>
          </Link>
          <p className="text-xs text-slate-400 mt-3 font-light">
            Secure administrative control & real-estate portfolio management
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="text-xl font-bold text-white font-serif mb-6 text-center">
            Sign In to Admin Portal
          </h2>

          {errorMessage && (
            <div className="bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs p-3.5 rounded-xl mb-5 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pavilionrealty.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
                />
                <span>Remember this terminal</span>
              </label>
              <span className="text-slate-500 text-[11px]">Argon2 / JWT Secured</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:brightness-110 text-slate-950 font-bold py-3 px-6 rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Access Admin Console</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-amber-400 transition-colors">
              ← Return to Pavilion Public Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
