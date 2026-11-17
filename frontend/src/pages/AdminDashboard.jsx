import React, { useState, useEffect } from "react";
import {
  ShieldCheck, Users, Pill, Store, BarChart3, TrendingUp, AlertTriangle,
  Search, Trash2, UserX, Ban, CheckCircle, XCircle, LogOut, Activity,
  Eye, Crown, RefreshCw
} from "lucide-react";
import { apiClient } from "../lib/api-client";

function StatCard({ label, value, change, icon: Icon, color, bg }) {
  return (
    <div className="stat-card animate-fade-up">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> {change}
        </span>
      </div>
      <div className="text-3xl font-black text-white mb-1">{value}</div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  );
}

export default function AdminDashboard({ admin, onSignOut }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [stores, setStores] = useState([]);
  const [stats, setStats] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const customers = users.filter(user => user.role === "CUSTOMER");
  const [medSearch, setMedSearch] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [u, m, s, st] = await Promise.all([
          apiClient.admin.getUsers(),
          apiClient.admin.getMedicines(),
          apiClient.admin.getStores(),
          apiClient.admin.getStats(),
        ]);
        setUsers(u || []);
        setMedicines(m || []);
        setStores(s || []);
        setStats(st || []);
      } catch (error) {
        console.error("Error loading admin data:", error);
      }
    }
    loadDashboardData();
  }, []);

  const filteredCustomers = customers.filter(u =>
    `${u.name} ${u.email} ${u.phone || ""}`.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredMeds = medicines.filter(m =>
    `${m.name} ${m.generic} ${m.pharmacy}`.toLowerCase().includes(medSearch.toLowerCase())
  );

  async function suspendUser(id) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
    const user = users.find(item => item.id === id);
    try { await apiClient.admin.updateUserStatus(id, !user?.isActive); } catch {}
  }

  async function removeMedicine(id) {
    setMedicines(prev => prev.filter(m => m.id !== id));
    try { await apiClient.admin.deactivateMedicine(id); } catch {}
  }

  function flagMedicine(id) {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, flagged: !m.flagged } : m));
  }

  async function updateStoreStatus(id, status) {
    setStores(prev => prev.map(s => s.id === id ? { ...s, verificationStatus: status } : s));
    try { await apiClient.admin.verifyStore(id, status); } catch {}
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "customers", label: "Customers", icon: Users },
    { id: "medicines", label: "Medicines", icon: Pill },
    { id: "pharmacies", label: "Pharmacies", icon: Store },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "#080E1A" }}>
      {/* Sidebar */}
      <aside className="sidebar w-64 flex-shrink-0 hidden lg:flex flex-col py-6 px-4">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#D97706,#B45309)", boxShadow: "0 4px 12px rgba(245,158,11,0.3)" }}>
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-black text-base">MediFind</div>
            <div className="badge-amber text-[10px]">ADMIN</div>
          </div>
        </div>

        <div className="space-y-1 flex-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`sidebar-item w-full ${activeTab === id ? "active" : ""}`}>
              <Icon className="w-4 h-4" />
              {label}
              {id === "medicines" && medicines.filter(m => m.flagged).length > 0 && (
                <span className="ml-auto badge-rose text-[10px]">{medicines.filter(m => m.flagged).length}</span>
              )}
              {id === "pharmacies" && stores.filter(s => s.verificationStatus === "PENDING").length > 0 && (
                <span className="ml-auto badge-amber text-[10px]">{stores.filter(s => s.verificationStatus === "PENDING").length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Admin profile */}
        <div className="glass rounded-2xl p-3 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#D97706,#B45309)" }}>
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-bold truncate">{admin?.name || "Admin"}</div>
              <div className="text-slate-500 text-[10px] truncate">{admin?.email}</div>
            </div>
          </div>
          <button onClick={onSignOut}
            className="flex items-center gap-2 text-slate-500 hover:text-rose-400 transition-colors text-xs w-full font-medium">
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden top-nav px-4 py-3 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#D97706,#B45309)" }}>
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-white">Admin Panel</span>
          <div className="flex-1" />
          <div className="flex gap-1">
            {tabs.map(({ id, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${activeTab === id ? "text-amber-400" : "text-slate-500"}`}
                style={activeTab === id ? { background: "rgba(245,158,11,0.12)" } : {}}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <button onClick={onSignOut} className="text-slate-500 hover:text-rose-400 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div className="animate-fade-in">
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-black text-white">Platform Overview</h1>
                <p className="text-slate-400 mt-1 text-sm">Real-time health of the MediFind platform</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((s, i) => <StatCard key={s.label} {...s} style={{ animationDelay: `${i * 80}ms` }} />)}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 glass rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-teal-400" /> Orders (Last 7 Days)
                  </h3>
                  <div className="flex items-end gap-2 h-32">
                    {[42, 68, 55, 89, 73, 94, 85].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full rounded-t-lg transition-all duration-500"
                          style={{ height: `${h}%`, background: `linear-gradient(to top, #0D9488, #0891B2)`, opacity: i === 6 ? 1 : 0.6 }} />
                        <span className="text-slate-600 text-[10px]">{["M","T","W","T","F","S","S"][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-5">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" /> Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {/* Activity is usually managed by the backend; for now we show a placeholder or empty state */}
                    <div className="text-center py-4 text-slate-500 text-xs italic">
                      Fetch activity logs from backend...
                    </div>
                  </div>
                </div>
              </div>

              {/* Flagged items alert */}
              {medicines.filter(m => m.flagged).length > 0 && (
                <div className="rounded-2xl p-5 flex items-center gap-4 animate-pulse-glow"
                  style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(244,63,94,0.15)" }}>
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-rose-300 font-bold">{medicines.filter(m => m.flagged).length} medicines flagged for review</p>
                    <p className="text-slate-400 text-sm">Potentially illegal or unverified items need your attention.</p>
                  </div>
                  <button onClick={() => setActiveTab("medicines")} className="btn-rose flex-shrink-0">Review Now</button>
                </div>
              )}
            </div>
          )}

          {/* ── USERS ── */}
          {activeTab === "customers" && (
            <div className="animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-black text-white">Customer Management</h1>
                  <p className="text-slate-400 text-sm">{customers.length} registered customers</p>
                </div>
                <div className="search-bar w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users..." />
                </div>
              </div>

              <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="dark-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map(user => (
                        <tr key={user.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                                style={{ background: user.role === "PHARMACY_OWNER" ? "linear-gradient(135deg,#7C3AED,#6D28D9)" : "linear-gradient(135deg,#0D9488,#0891B2)" }}>
                                {user.name[0]}
                              </div>
                              <div>
                                <div className="text-white font-semibold text-sm">{user.name}</div>
                                <div className="text-slate-500 text-xs">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge-teal"><Users className="w-2.5 h-2.5 mr-1" />Customer</span>
                          </td>
                          <td><span className="text-slate-400">{user.createdAt}</span></td>
                          <td>
                            {user.isActive
                              ? <span className="badge-emerald"><CheckCircle className="w-2.5 h-2.5 mr-1" />Active</span>
                              : <span className="badge-rose"><XCircle className="w-2.5 h-2.5 mr-1" />Suspended</span>}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <button onClick={() => suspendUser(user.id)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${user.isActive ? "hover:bg-rose-500/10 text-rose-400 border border-rose-500/20" : "hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                                {user.isActive ? <><Ban className="w-3 h-3" /> Suspend</> : <><CheckCircle className="w-3 h-3" /> Restore</>}
                              </button>
                              <button onClick={() => setUsers(prev => prev.filter(u => u.id !== user.id))}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 transition-all">
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── MEDICINES ── */}
          {activeTab === "medicines" && (
            <div className="animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-black text-white">Medicine Control</h1>
                  <p className="text-slate-400 text-sm">{medicines.length} medicines · {medicines.filter(m => m.flagged).length} flagged</p>
                </div>
                <div className="search-bar w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input value={medSearch} onChange={e => setMedSearch(e.target.value)} placeholder="Search medicines..." />
                </div>
              </div>

              <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="dark-table">
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Category</th>
                        <th>Pharmacy</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMeds.map(med => (
                        <tr key={med.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${med.flagged ? "bg-rose-500/15" : "bg-teal-500/10"}`}>
                                <Pill className={`w-4 h-4 ${med.flagged ? "text-rose-400" : "text-teal-400"}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-white font-semibold text-sm">{med.name}</span>
                                  {med.flagged && <span className="badge-rose text-[9px]">FLAGGED</span>}
                                  {med.rx && <span className="badge-amber text-[9px]">Rx</span>}
                                </div>
                                <div className="text-slate-500 text-xs">{med.generic}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="text-slate-300 text-sm">{med.category}</span></td>
                          <td><span className="text-slate-400 text-sm">{med.pharmacy}</span></td>
                          <td><span className="text-white font-bold">₹{med.price}</span></td>
                          <td>
                            {med.isActive
                              ? <span className="badge-emerald">Active</span>
                              : <span className="badge-rose">Removed</span>}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <button onClick={() => flagMedicine(med.id)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${med.flagged ? "text-amber-400 border border-amber-500/20 hover:bg-amber-500/10" : "text-slate-400 border border-slate-700 hover:text-amber-400 hover:border-amber-500/20"}`}>
                                <AlertTriangle className="w-3 h-3" /> {med.flagged ? "Unflag" : "Flag"}
                              </button>
                              <button onClick={() => removeMedicine(med.id)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 transition-all">
                                <Trash2 className="w-3 h-3" /> Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── STORES ── */}
          {activeTab === "pharmacies" && (
            <div className="animate-fade-in">
              <div className="mb-6">
                <h1 className="text-2xl font-black text-white">Pharmacy Management</h1>
                <p className="text-slate-400 text-sm">{stores.length} pharmacies · {stores.filter(s => s.verificationStatus === "PENDING").length} pending verification</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
                {stores.map(store => (
                  <div key={store.id} className={`glass rounded-2xl p-5 transition-all duration-300 ${store.verificationStatus === "SUSPENDED" ? "opacity-60" : ""}`}
                    style={store.verificationStatus === "PENDING" ? { border: "1px solid rgba(245,158,11,0.3)" } : {}}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{
                            background: store.verificationStatus === "VERIFIED" ? "rgba(16,185,129,0.12)" : store.verificationStatus === "PENDING" ? "rgba(245,158,11,0.12)" : "rgba(244,63,94,0.12)"
                          }}>
                          <Store className={`w-5 h-5 ${store.verificationStatus === "VERIFIED" ? "text-emerald-400" : store.verificationStatus === "PENDING" ? "text-amber-400" : "text-rose-400"}`} />
                        </div>
                        <div>
                          <div className="text-white font-bold">{store.name}</div>
                          <div className="text-slate-500 text-xs">{store.city} · {store._count?.inventory || 0} medicines</div>
                        </div>
                      </div>
                      {store.verificationStatus === "VERIFIED" && <span className="badge-emerald">Verified</span>}
                      {store.verificationStatus === "PENDING" && <span className="badge-amber">Pending</span>}
                      {store.verificationStatus === "SUSPENDED" && <span className="badge-rose">Suspended</span>}
                    </div>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-slate-400">Owner: <span className="text-slate-200">{store.owner?.name || "—"}</span></span>
                      {store._count?.reviews > 0 && (
                        <span className="flex items-center gap-1 text-slate-400 text-xs">
                          {store._count.reviews} reviews
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {store.verificationStatus === "PENDING" && (
                        <button onClick={() => updateStoreStatus(store.id, "VERIFIED")}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold text-emerald-400 transition-all"
                          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
                          <CheckCircle className="w-3.5 h-3.5" /> Verify
                        </button>
                      )}
                      {store.verificationStatus === "VERIFIED" && (
                        <button onClick={() => updateStoreStatus(store.id, "SUSPENDED")}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold text-rose-400 transition-all"
                          style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}>
                          <Ban className="w-3.5 h-3.5" /> Suspend
                        </button>
                      )}
                      {store.verificationStatus === "SUSPENDED" && (
                        <button onClick={() => updateStoreStatus(store.id, "VERIFIED")}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold text-emerald-400 transition-all"
                          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                          <RefreshCw className="w-3.5 h-3.5" /> Restore
                        </button>
                      )}
                      <button onClick={() => setStores(prev => prev.filter(s => s.id !== store.id))}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-rose-400 transition-all"
                        style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
