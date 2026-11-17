import React, { useState } from "react";
import { Heart, ShieldCheck, Eye, EyeOff, ArrowLeft, Pill, Zap, Clock, CheckCircle } from "lucide-react";
import { apiClient, session } from "../lib/api-client";

export default function CustomerAuth({ onSignedIn, onBack }) {
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const result = mode === "signup"
        ? await apiClient.auth.register({ name, email, phone: phone || undefined, password, accountType: "CUSTOMER" })
        : await apiClient.auth.login({ email, password });
      if (result.user?.role !== "CUSTOMER") throw new Error("Please use a customer account.");
      session.save(result);
      onSignedIn(result.user);
    } catch (err) {
      session.clear();
      setError(err.message || "Unable to continue. Please try again.");
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="auth-bg">
      <div className="w-full max-w-5xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left panel */}
          <div className="rounded-3xl p-8 relative overflow-hidden animate-fade-up"
            style={{ background: "linear-gradient(145deg, rgba(13,148,136,0.3) 0%, rgba(6,182,212,0.15) 50%, rgba(8,14,26,0.9) 100%)", border: "1px solid rgba(20,184,166,0.25)" }}>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 animate-blob"
              style={{ background: "radial-gradient(circle, #14B8A6, transparent)", filter: "blur(40px)" }} />
            
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 animate-float"
              style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)", boxShadow: "0 8px 24px rgba(13,148,136,0.4)" }}>
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div className="badge-teal mb-4">CUSTOMER PORTAL</div>
            <h1 className="text-3xl font-black text-white mt-3 mb-4 leading-tight">
              Your Health,<br />Our Priority
            </h1>
            <p className="text-teal-100 text-sm mb-8 leading-relaxed opacity-80">
              Join 4,80,000+ customers who trust MediFind for their medicine needs. Compare prices, order safely, track deliveries.
            </p>

            <div className="space-y-3">
              {[
                { icon: Zap, text: "Search 50,000+ medicines instantly", color: "text-teal-300" },
                { icon: ShieldCheck, text: "Prescription verified by licensed pharmacist", color: "text-emerald-300" },
                { icon: Clock, text: "Same-day delivery in 340+ cities", color: "text-cyan-300" },
                { icon: CheckCircle, text: "Transparent prices — no hidden charges", color: "text-teal-300" },
              ].map(({ icon: Icon, text, color }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.08)" }}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <span className="text-slate-200 text-sm">{text}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["T", "P", "R", "A"].map((l, i) => (
                    <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-slate-900"
                      style={{ background: `hsl(${i * 60 + 160}, 60%, 45%)` }}>{l}</div>
                  ))}
                </div>
                <div>
                  <div className="text-white text-sm font-bold">4,80,000+ happy customers</div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => <span key={s} className="text-amber-400 text-xs">★</span>)}
                    <span className="text-slate-400 text-xs ml-1">4.9 avg. rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel — form */}
          <div className="glass-strong rounded-3xl p-8 animate-fade-up delay-100">
            <div className="pill-tabs mb-6">
              <button className={`pill-tab ${mode === "signin" ? "active" : ""}`} onClick={() => setMode("signin")}>Sign In</button>
              <button className={`pill-tab ${mode === "signup" ? "active" : ""}`} onClick={() => setMode("signup")}>Create Account</button>
            </div>

            <h2 className="text-2xl font-black text-white mb-1">
              {mode === "signin" ? "Welcome back" : "Join MediFind"}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {mode === "signin" ? "Sign in to browse medicines and track orders." : "Create your free account and start shopping."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Full Name</label>
                  <input className="dark-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Email Address</label>
                <input className="dark-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Phone (Optional)</label>
                  <input className="dark-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="98765 43210" />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Password</label>
                <div className="relative">
                  <input className="dark-input pr-10" type={showPassword ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="Minimum 8 characters" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl p-3 text-sm flex items-center gap-2"
                  style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", color: "#FDA4AF" }}>
                  <span className="text-rose-400">⚠</span> {error}
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="btn-glow w-full mt-2">
                {isSubmitting ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Please wait...</span>
                ) : (
                  <><ShieldCheck className="w-4 h-4" /> {mode === "signin" ? "Sign in to shop" : "Create customer account"}</>
                )}
              </button>
            </form>

            {mode === "signin" && (
              <p className="text-center text-slate-500 text-xs mt-4">
                Don't have an account?{" "}
                <button onClick={() => setMode("signup")} className="text-teal-400 font-semibold hover:text-teal-300 transition-colors">Create one free</button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
