import React, { useEffect, useState } from "react";
import { Pill, ShieldCheck, Star, Zap, TrendingUp, Users, Package, Globe, ChevronRight, Heart, Clock, CheckCircle, Crown } from "lucide-react";

const stats = [
  { label: "Medicines Available", value: "50,000+", icon: Pill },
  { label: "Verified Pharmacies", value: "1,200+", icon: ShieldCheck },
  { label: "Happy Customers", value: "4,80,000+", icon: Users },
  { label: "Cities Covered", value: "340+", icon: Globe },
];

const features = [
  { icon: Zap, title: "Instant Search", desc: "Find any medicine in milliseconds across all verified pharmacies.", color: "text-teal-400" },
  { icon: ShieldCheck, title: "Verified & Safe", desc: "Every pharmacy is license-verified. Your safety is our priority.", color: "text-indigo-400" },
  { icon: TrendingUp, title: "Best Prices", desc: "Compare prices across stores. Always get the best deal.", color: "text-amber-400" },
  { icon: Clock, title: "Fast Delivery", desc: "Same-day delivery from your nearest pharmacy.", color: "text-rose-400" },
];

function FloatingOrb({ className }) {
  return <div className={`absolute rounded-full pointer-events-none ${className}`} />;
}

function FeatureCard({ icon: Icon, title, desc, color, delay }) {
  return (
    <div className={`glass rounded-2xl p-5 animate-fade-up ${delay} transition-all duration-300 hover:-translate-y-1`}
      style={{ animationDelay: delay }}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3`}
        style={{ background: "rgba(255,255,255,0.07)" }}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <h3 className="font-bold text-white text-sm mb-1">{title}</h3>
      <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
    </div>
  );
}

export default function LandingPage({ onCustomer, onOwner, onAdmin }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  return (
    <div className="hero-bg min-h-screen relative overflow-hidden">
      {/* Decorative blobs */}
      <FloatingOrb className="blob-1 top-[-100px] left-[-100px] animate-blob" />
      <FloatingOrb className="blob-2 bottom-[-80px] right-[-80px] animate-blob" style={{ animationDelay: "4s" }} />
      <FloatingOrb className="blob-3 top-1/2 left-1/3 animate-blob" style={{ animationDelay: "2s" }} />

      {/* Navbar */}
      <nav className="top-nav px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg animate-pulse-glow">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-white font-black text-xl tracking-tight">MediFind</span>
            <div className="text-teal-400 text-[10px] font-bold tracking-widest uppercase leading-none">Medicine Platform</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onAdmin} className="btn-outline-glow text-sm py-2 px-4 hidden sm:flex items-center gap-2 text-amber-400 border-amber-500/30 hover:bg-amber-500/10">
            <Crown className="w-4 h-4" /> Admin
          </button>
          <button onClick={onCustomer} className="btn-outline-glow text-sm py-2 px-4 hidden sm:flex">
            Sign In
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        {/* Hero */}
        <div className={`text-center mb-16 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-bold tracking-wide">LIVE — 1,200+ PHARMACIES ONLINE</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-tight mb-6">
            Find Any Medicine.{" "}
            <span className="gradient-text block sm:inline">Anytime.</span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            India's most transparent medicine marketplace. Customers shop smart. Pharmacy owners grow faster. Admins keep it safe.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mb-16">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="glass rounded-2xl p-4 animate-fade-up">
                <Icon className="w-5 h-5 text-teal-400 mx-auto mb-2" />
                <div className="text-white font-black text-xl">{value}</div>
                <div className="text-slate-500 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer and pharmacy-owner portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Customer Card */}
          <div className="animate-fade-up delay-100 group cursor-pointer" onClick={onCustomer}>
            <div className="relative rounded-3xl overflow-hidden h-full transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl"
              style={{ background: "linear-gradient(145deg, rgba(13,148,136,0.2) 0%, rgba(8,14,26,0.95) 100%)", border: "1px solid rgba(20,184,166,0.25)" }}>
              {/* Top gradient bar */}
              <div className="h-1 bg-gradient-to-r from-teal-400 to-cyan-500" />
              <div className="p-7">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.25), rgba(6,182,212,0.25))", border: "1px solid rgba(20,184,166,0.3)" }}>
                  <Heart className="w-7 h-7 text-teal-400" />
                </div>
                <div className="badge-teal mb-3">FOR CUSTOMERS</div>
                <h2 className="text-2xl font-black text-white mt-3 mb-3">Find Medicines Near You</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Search by medicine name or symptom. Compare prices across verified pharmacies. Order with fast local delivery.
                </p>
                <ul className="space-y-2 mb-7">
                  {["Compare prices across all stores", "Real-time stock availability", "Secure prescription uploads", "Order tracking & notifications"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="btn-glow w-full group-hover:shadow-[0_8px_30px_rgba(20,184,166,0.5)]">
                  Start Shopping <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Owner Card */}
          <div className="animate-fade-up delay-200 group cursor-pointer" onClick={onOwner}>
            <div className="relative rounded-3xl overflow-hidden h-full transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl"
              style={{ background: "linear-gradient(145deg, rgba(109,40,217,0.2) 0%, rgba(8,14,26,0.95) 100%)", border: "1px solid rgba(139,92,246,0.25)" }}>
              <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
              <div className="p-7">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(168,85,247,0.25))", border: "1px solid rgba(139,92,246,0.3)" }}>
                  <Package className="w-7 h-7 text-violet-400" />
                </div>
                <div className="badge-indigo mb-3">FOR PHARMACY OWNERS</div>
                <h2 className="text-2xl font-black text-white mt-3 mb-3">Grow Your Pharmacy</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  List medicines transparently. Attract more customers. Manage inventory, prices, and orders — all in one dashboard.
                </p>
                <ul className="space-y-2 mb-7">
                  {["Publish medicines to marketplace", "Transparent pricing builds trust", "Real-time inventory management", "Analytics & sales insights"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-violet-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-3 px-6 rounded-xl font-bold text-sm transition-all duration-250 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)", color: "white", boxShadow: "0 4px 15px rgba(124,58,237,0.4)" }}>
                  Owner Dashboard <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Feature strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={`${(i + 1) * 100}ms`} />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-slate-600 text-xs">
            © 2026 MediFind · Trusted by 4,80,000+ customers ·{" "}
            <span className="text-teal-600">All pharmacies are license-verified</span>
          </p>
        </div>
      </div>
    </div>
  );
}
