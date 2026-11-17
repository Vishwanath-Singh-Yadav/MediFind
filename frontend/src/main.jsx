import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

import LandingPage from "./pages/LandingPage";
import CustomerAuth from "./pages/CustomerAuth";
import OwnerAuth from "./pages/OwnerAuth";
import PharmacyOnboarding from "./pages/PharmacyOnboarding";
import AdminAuth from "./pages/AdminAuth";
import CustomerMarketplace from "./pages/CustomerMarketplace";
import AdminDashboard from "./pages/AdminDashboard";
import ShopOwnerDashboard from "./components/ShopOwnerDashboard";
import { Building2 } from "lucide-react";

import { apiClient, session } from "./lib/api-client";
import "./index.css";

// ── Helper: restore persisted user ────────────────────────────────────────────
function getStoredUser(role) {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    return u?.role === role ? u : null;
  } catch {
    return null;
  }
}

// ── Owner Portal Shell ─────────────────────────────────────────────────────────
function OwnerPortal({ owner, onSignOut, onHome, onAuthExpired }) {
  const [shopInfo, setShopInfo] = useState(null);
  const [showPharmacyDetails, setShowPharmacyDetails] = useState(false);

  useEffect(() => {
    let active = true;
    apiClient.pharmacies.mine()
      .then((stores) => {
        const store = stores?.[0];
        if (!active || !store) return;
        localStorage.setItem("shopId", store.id);
        localStorage.setItem("shopName", store.name);
        setShopInfo(store);
        setShowPharmacyDetails(
          store.name?.includes("'s Pharmacy") ||
          store.licenseNumber?.startsWith("PENDING-") ||
          store.addressLine1 === "Address to be updated"
        );
      })
      .catch((error) => {
        console.error("Unable to load owner store:", error);
        if (error.status === 401) onAuthExpired();
      });
    return () => { active = false; };
  }, []);

  if (!shopInfo) {
    return <div className="min-h-screen bg-[#080E1A] flex items-center justify-center text-slate-400">Loading your pharmacy...</div>;
  }

  if (showPharmacyDetails) {
    return <PharmacyOnboarding
      owner={owner}
      store={shopInfo}
      onComplete={(updatedStore) => {
        setShopInfo(updatedStore);
        setShowPharmacyDetails(false);
      }}
      onBack={() => setShowPharmacyDetails(false)}
    />;
  }

  return (
    <div className="min-h-screen" style={{ background: "#080E1A" }}>
      {/* Owner nav */}
      <nav className="top-nav px-4 sm:px-6 py-4 flex items-center gap-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#7C3AED,#6D28D9)", boxShadow: "0 4px 12px rgba(124,58,237,0.35)" }}>
          <span className="text-white font-black text-lg">+</span>
        </div>
        <div>
          <div className="text-white font-black">MediFind</div>
          <div className="text-[10px] font-bold tracking-wider" style={{ color: "#A78BFA" }}>PHARMACY OWNER PORTAL</div>
        </div>
        <div className="flex-1" />
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <div className="w-2 h-2 rounded-full bg-violet-400" />
          <span className="text-violet-300 text-sm font-semibold">{owner.name}</span>
        </div>
        <button onClick={onHome}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
          Home
        </button>
        <button onClick={() => setShowPharmacyDetails(true)}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-violet-200 hover:text-white transition-colors flex items-center gap-2"
          style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)" }}>
          <Building2 className="w-4 h-4" /> Pharmacy details
        </button>
        <button onClick={onSignOut}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-rose-400 transition-colors"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
          Sign out
        </button>
      </nav>
      <ShopOwnerDashboard
        shopId={shopInfo.id}
        shopName={shopInfo.name}
        ownerName={owner.name}
        store={shopInfo}
        onEditStore={() => setShowPharmacyDetails(true)}
      />
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
function App() {
  // portal: 'landing' | 'customer' | 'owner' | 'admin'
  const isAdminPath = window.location.pathname === "/admin";
  const [portal, setPortal] = useState(isAdminPath ? "admin" : "landing");

  // User states (persisted)
  const [customer, setCustomer] = useState(() => getStoredUser("CUSTOMER"));
  const [owner, setOwner] = useState(() => getStoredUser("PHARMACY_OWNER"));
  const [ownerSetup, setOwnerSetup] = useState(null);
  const [admin, setAdmin] = useState(() => getStoredUser("ADMIN"));

    // Auto-redirect if user is already logged in
    useEffect(() => {
      if (window.location.pathname === "/admin") setPortal("admin");
      else if (customer) setPortal("customer");
      else if (owner) setPortal("owner");
    }, [customer, owner]);

    if (portal === "landing") {
      return (
        <LandingPage
          onCustomer={() => setPortal("customer")}
          onOwner={() => setPortal("owner")}
          onAdmin={() => setPortal("admin")}
        />
      );
    }

    // ── Customer flow ─────────────────────────────────────────────────────────
  if (portal === "customer") {
    if (!customer) {
      return (
        <CustomerAuth
          onSignedIn={(u) => { setCustomer(u); }}
          onBack={() => setPortal("landing")}
        />
      );
    }
    return <CustomerMarketplace customer={customer} onHome={() => setPortal("landing")} onSignOut={() => { localStorage.removeItem("user"); setCustomer(null); setPortal("landing"); }} />;
  }

  // ── Owner flow ────────────────────────────────────────────────────────────
  if (portal === "owner") {
    if (!owner) {
      return (
        <OwnerAuth
          onSignedIn={(u) => { setOwner(u); }}
          onRegistered={(result) => { setOwner(result.user); setOwnerSetup(result); }}
          onBack={() => setPortal("landing")}
        />
      );
    }
    if (ownerSetup) {
      return <PharmacyOnboarding
        owner={owner}
        store={ownerSetup.shop}
        onComplete={() => setOwnerSetup(null)}
        onBack={() => { session.clear(); setOwner(null); setOwnerSetup(null); setPortal("landing"); }}
      />;
    }
    return <OwnerPortal owner={owner} onHome={() => setPortal("landing")} onSignOut={() => { session.clear(); setOwner(null); setPortal("landing"); }} onAuthExpired={() => { setOwner(null); setPortal("owner"); }} />;
  }

  // ── Admin flow ────────────────────────────────────────────────────────────
  if (portal === "admin") {
    if (!admin) {
      return (
        <AdminAuth
          onSignedIn={(u) => { setAdmin(u); }}
          onBack={() => { window.history.replaceState({}, "", "/"); setPortal("landing"); }}
        />
      );
    }
    return <AdminDashboard admin={admin} onSignOut={() => { session.clear(); window.history.replaceState({}, "", "/"); setAdmin(null); setPortal("landing"); }} />;
  }

  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
