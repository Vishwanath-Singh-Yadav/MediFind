import React, { useState } from "react";
import { Package, Eye, EyeOff, ArrowLeft, ShieldCheck, TrendingUp, BarChart2, Star } from "lucide-react";
import { apiClient, session } from "../lib/api-client";

export default function OwnerAuth({ onSignedIn, onRegistered, onBack }) {
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
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
      const result = mode === "signup"
        ? await apiClient.auth.register({ 
            name: name.trim(), 
            email: email.trim().toLowerCase(), 
            password, 
            accountType: "PHARMACY_OWNER" 
          })
        : await apiClient.auth.login({ 
            email: email.trim().toLowerCase(), 
            password 
          });
      if (result.user?.role !== "PHARMACY_OWNER") throw new Error("This portal is only for pharmacy owners.");
      session.save(result);
      if (mode === "signup") onRegistered(result);
      else onSignedIn(result.user);
    } catch (err) {
      // Enhanced error messages for the user
      const msg = err.message || "Unable to sign in. Please try again.";
      if (msg.includes("unique constraint") || msg.includes("already exists")) {
        setError("This email is already registered. Please use another email or sign in.");
      } else if (msg.includes("min(8)")) {
        setError("Password is too short. It must be at least 8 characters.");
      } else if (msg.includes("invalid_email")) {
        setError("Please enter a valid email address.");
      } else {
        setError(msg);
      }
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="auth-bg" style={{ background: "radial-gradient(ellipse at 30% 40%, rgba(109,40,217,0.18) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(20,184,166,0.1) 0%, transparent 55%), #080E1A" }}>
      <div className="w-full max-w-5xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left panel */}
          <div className="rounded-3xl p-8 relative overflow-hidden animate-fade-up"
            style={{ background: "linear-gradient(145deg, rgba(109,40,217,0.3) 0%, rgba(139,92,246,0.12) 50%, rgba(8,14,26,0.95) 100%)", border: "1px solid rgba(139,92,246,0.3)" }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-15 animate-blob"
              style={{ background: "radial-gradient(circle, #7C3AED, transparent)", filter: "blur(50px)" }} />
            
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 animate-float"
              style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)", boxShadow: "0 8px 24px rgba(124,58,237,0.4)" }}>
              <Package className="w-7 h-7 text-white" />
            </div>
            <div className="badge-indigo mb-4">PHARMACY OWNER PORTAL</div>
            <h1 className="text-3xl font-black text-white mt-3 mb-4 leading-tight">
              Sell More.<br />Grow Faster.
            </h1>
            <p className="text-purple-100 text-sm mb-8 leading-relaxed opacity-80">
              Join 1,200+ pharmacies on MediFind. Publish your medicines transparently and attract more customers every day.
            </p>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: TrendingUp, label: "Avg. Growth", value: "+38%" },
                { icon: BarChart2, label: "Daily Orders", value: "42" },
                { icon: Star, label: "Store Rating", value: "4.8★" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl p-3 text-center" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <Icon className="w-4 h-4 text-violet-400 mx-auto mb-1" />
                  <div className="text-white font-black text-sm">{value}</div>
                  <div className="text-slate-500 text-[10px]">{label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {[
                "List medicines with full transparency",
                "Set your own prices and discounts",
                "Manage stock levels in real time",
                "Attract customers from 3km radius",
                "Analytics to grow your business",
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right panel — form */}
          <div className="glass-strong rounded-3xl p-8 animate-fade-up delay-100">
            <div className="pill-tabs mb-6">
              <button className={`pill-tab ${mode === "signin" ? "active" : ""}`}
                style={mode === "signin" ? { background: "linear-gradient(135deg,#7C3AED,#6D28D9)" } : {}}
                onClick={() => setMode("signin")}>Sign In</button>
              <button className={`pill-tab ${mode === "signup" ? "active" : ""}`}
                style={mode === "signup" ? { background: "linear-gradient(135deg,#7C3AED,#6D28D9)" } : {}}
                onClick={() => setMode("signup")}>Register Pharmacy</button>
            </div>

            <h2 className="text-2xl font-black text-white mb-1">
              {mode === "signin" ? "Owner sign in" : "Register your pharmacy"}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {mode === "signin" ? "Access your pharmacy dashboard." : "Create your owner account and start listing medicines."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Owner Name</label>
                  <input className="dark-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Email Address</label>
                <input className="dark-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="owner@pharmacy.com" required />
              </div>
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

              <button type="submit" disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-250 flex items-center justify-center gap-2 mt-2"
                style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)", boxShadow: "0 4px 15px rgba(124,58,237,0.4)" }}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Please wait...
                  </span>
                ) : (
                  <><ShieldCheck className="w-4 h-4" /> {mode === "signin" ? "Sign in to dashboard" : "Create owner account"}</>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 rounded-2xl" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <p className="text-xs text-slate-400 text-center">
                <ShieldCheck className="inline w-3.5 h-3.5 text-violet-400 mr-1" />
                All pharmacies are verified by our team within 24 hours of registration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
