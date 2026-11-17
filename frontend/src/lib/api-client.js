// Centralized API client layer for MediFind.
// This is the single module authorized to make HTTP requests and hold internal route paths.
// Frontend components should import and use functions from this client rather than invoking fetch directly.
import { Users, Store, ShoppingBag, TrendingUp } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const session = {
  get accessToken() {
    return localStorage.getItem("accessToken");
  },
  get shopId() {
    return localStorage.getItem("shopId");
  },
  get refreshToken() {
    return localStorage.getItem("refreshToken");
  },
  get sessionId() {
    return localStorage.getItem("sessionId");
  },
  save(data) {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    if (data.sessionId) localStorage.setItem("sessionId", data.sessionId);
    if (data.shop?.id) localStorage.setItem("shopId", data.shop.id);
    localStorage.setItem("user", JSON.stringify(data.user));
  },
  clear() {
    localStorage.clear();
  }
};

async function refreshAccessToken() {
  const refreshToken = session.refreshToken;
  if (!refreshToken) return false;

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });
  if (!response.ok) return false;

  const data = await response.json();
  localStorage.setItem("accessToken", data.accessToken);
  return true;
}

async function request(path, options = {}, hasRetried = false) {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (session.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }
  if (session.shopId) {
    headers.set("x-shop-id", session.shopId);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    console.error("API Error Response:", error);
    if (response.status === 401 && !hasRetried && !path.startsWith("/auth/")) {
      if (await refreshAccessToken()) return request(path, options, true);
      session.clear();
    }
    const requestError = new Error(error.message || "Request failed");
    requestError.status = response.status;
    throw requestError;
  }
  if (response.status === 204) return null;
  return response.json();
}

export const apiClient = {
  auth: {
    register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    requestOtp: (data) => request("/auth/otp/request", { method: "POST", body: JSON.stringify(data) }),
    verifyOtp: (data) => request("/auth/otp/verify", { method: "POST", body: JSON.stringify(data) }),
    googleLogin: (data) => request("/auth/google", { method: "POST", body: JSON.stringify(data) }),
    refreshToken: (refreshToken) => request("/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken }) }),
    logout: (sessionId) => request("/auth/logout", { method: "POST", body: JSON.stringify({ sessionId }) }),
    getSessions: () => request("/auth/sessions", { method: "GET" })
  },
  pharmacies: {
    onboard: (data) => request("/pharmacies", { method: "POST", body: JSON.stringify(data) }),
    mine: () => request("/pharmacies/mine", { method: "GET" }),
    getAdminPending: () => request("/pharmacies/admin/pending", { method: "GET" }),
    getDetail: (storeId) => request(`/pharmacies/${storeId}`, { method: "GET" }),
    updateStore: (storeId, data) => request(`/pharmacies/${storeId}`, { method: "PATCH", body: JSON.stringify(data) }),
    verifyStore: (storeId, status) => request(`/pharmacies/${storeId}/verification`, { method: "PATCH", body: JSON.stringify({ status }) })
  },
  medicines: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/medicines?${query}`, { method: "GET" });
    },
    getDetail: (id) => request(`/medicines/${id}`, { method: "GET" }),
    create: (data) => request("/medicines", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/medicines/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id) => request(`/medicines/${id}`, { method: "DELETE" })
  },
  inventory: {
    getStoreInventory: (storeId) => request(`/inventory/store/${storeId}`, { method: "GET" }),
    addMedicineToStore: (storeId, data) => request(`/inventory/store/${storeId}`, { method: "POST", body: JSON.stringify(data) }),
    updateInventoryItem: (id, data) => request(`/inventory/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    removeFromStore: (id) => request(`/inventory/${id}`, { method: "DELETE" }),
    uploadImages: (id, files) => {
      const body = new FormData();
      files.forEach((file) => body.append("images", file));
      return request(`/inventory/${id}/images`, { method: "POST", body });
    },
    removeImage: (inventoryId, imageId) => request(`/inventory/${inventoryId}/images/${imageId}`, { method: "DELETE" })
  },
  commerce: {
    search: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/commerce/search?${query}`, { method: "GET" });
    },
    searchNearby: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/commerce/nearby?${query}`, { method: "GET" });
    },
    getCart: () => request("/commerce/cart", { method: "GET" }),
    addToCart: (data) => request("/commerce/cart/items", { method: "POST", body: JSON.stringify(data) }),
    removeFromCart: (inventoryId) => request(`/commerce/cart/items/${inventoryId}`, { method: "DELETE" }),
    uploadPrescription: (data) => request("/commerce/prescriptions", { method: "POST", body: JSON.stringify(data) }),
    checkout: (data) => request("/commerce/checkout", { method: "POST", body: JSON.stringify(data) }),
    getOrders: () => request("/commerce/orders", { method: "GET" }),
  },
  admin: {
    overview: () => request("/dashboard/admin/overview", { method: "GET" }),
    getStats: async () => {
      const data = await request("/dashboard/admin/overview", { method: "GET" });
      return [
        { label: "Total Users", value: data.metrics.users, change: "Live", icon: Users, color: "#2DD4BF", bg: "rgba(45,212,191,.12)" },
        { label: "Pharmacies", value: data.metrics.stores, change: "Live", icon: Store, color: "#A78BFA", bg: "rgba(167,139,250,.12)" },
        { label: "Orders", value: data.metrics.orders, change: "Live", icon: ShoppingBag, color: "#60A5FA", bg: "rgba(96,165,250,.12)" },
        { label: "Revenue", value: `₹${data.metrics.revenue}`, change: "Live", icon: TrendingUp, color: "#FBBF24", bg: "rgba(251,191,36,.12)" },
      ];
    },
    getUsers: () => request("/dashboard/admin/users", { method: "GET" }),
    getStores: () => request("/dashboard/admin/pharmacies", { method: "GET" }),
    updateUserStatus: (id, isActive) => request(`/dashboard/admin/users/${id}/status`, { method: "PATCH", body: JSON.stringify({ isActive }) }),
    verifyStore: (id, status) => request(`/dashboard/admin/pharmacies/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    getMedicines: () => request("/medicines", { method: "GET" }),
    deactivateMedicine: (id) => request(`/medicines/${id}`, { method: "DELETE" })
  }
};
