import React, { useState } from "react";
import { ShieldCheck, Eye, EyeOff, ArrowLeft, Lock, AlertTriangle } from "lucide-react";
import { apiClient, session } from "../lib/api-client";

export default function AdminAuth({ onSignedIn, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      // Demo admin credentials for standalone mode
      if (email === "admin@medifind.com" && password === "admin123") {
        const mockAdmin = { id: "admin-1", name: "Platform Admin", email, role: "ADMIN" };
        localStorage.setItem("user", JSON.stringify(mockAdmin));
        localStorage.setItem("accessToken", "mock-admin-token");
        onSignedIn(mockAdmin);
        return;
      }
      const result = await apiClient.auth.login({ email, password });
      if (result.user?.role !== "ADMIN") throw new Error("This portal is restricted to administrators.");
      session.save(result);
      onSignedIn(result.user);
    } catch (err) {
      setError(err.message || "Invalid admin credentials.");
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="auth-bg" style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(245,158,11,0.12) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(244,63,94,0.08) 0%, transparent 55%), #080E1A" }}>
      <div className="w-full max-w-md mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        {/* Admin icon */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-float"
            style={{ background: "linear-gradient(135deg, #D97706, #B45309)", boxShadow: "0 12px 32px rgba(245,158,11,0.35)" }}>
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <div className="badge-amber mx-auto inline-flex mb-3">ADMIN ACCESS ONLY</div>
          <h1 className="text-3xl font-black text-white mt-2">Platform Control</h1>
          <p className="text-slate-400 text-sm mt-2">Restricted area. Authorized personnel only.</p>
        </div>

        {/* Form */}
        <div className="glass-strong rounded-3xl p-8 animate-fade-up delay-100">
          <div className="flex items-center gap-3 p-3 rounded-2xl mb-6"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-200 leading-relaxed">
              <strong>Demo:</strong> Use <code className="bg-amber-900/30 px-1 rounded text-amber-300">admin@medifind.com</code> / <code className="bg-amber-900/30 px-1 rounded text-amber-300">admin123</code>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Admin Email</label>
              <input className="dark-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@medifind.com" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <input className="dark-input pr-10" type={showPassword ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl p-3 text-sm flex items-center gap-2"
                style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", color: "#FDA4AF" }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-amber w-full mt-2">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Authenticating...
                </span>
              ) : (
                <><Lock className="w-4 h-4" /> Access Admin Panel</>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-2 justify-center text-slate-600 text-xs">
            <Lock className="w-3 h-3" />
            All admin actions are audit-logged
          </div>
        </div>
      </div>
    </div>
  );
}
