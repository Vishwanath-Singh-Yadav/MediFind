import React, { useState } from "react";
import { ArrowLeft, Building2, ShieldCheck, MapPin, Camera, User, Phone, CheckCircle2, Clock } from "lucide-react";
import { apiClient } from "../lib/api-client";

const initialDetails = (store, owner) => ({
  name: store?.name?.includes("'s Pharmacy") ? "" : store?.name || "",
  licenseNumber: store?.licenseNumber?.startsWith("PENDING-") ? "" : store?.licenseNumber || "",
  gstNumber: store?.gstNumber || "",
  ownerName: store?.owner?.name || owner?.name || localStorage.getItem("shopOwnerName") || "",
  ownerPhone: store?.owner?.phone || owner?.phone || localStorage.getItem("shopOwnerPhone") || "",
  addressLine1: store?.addressLine1 === "Address to be updated" ? "" : store?.addressLine1 || "",
  addressLine2: store?.addressLine2 || "",
  city: store?.city === "Not set" ? "" : store?.city || "",
  state: store?.state === "Not set" ? "" : store?.state || "",
  postalCode: store?.postalCode === "000000" ? "" : store?.postalCode || "",
  latitude: store?.latitude || "",
  longitude: store?.longitude || "",
  deliveryRadiusKm: store?.deliveryRadiusKm || "5",
  openingTime: store?.openingTime || "09:00",
  closingTime: store?.closingTime || "21:00",
  shopImage: localStorage.getItem(`shopImage_${store?.id}`) || store?.imageUrl || "",
});

export default function PharmacyOnboarding({ owner, store, onComplete, onBack }) {
  const [details, setDetails] = useState(() => initialDetails(store, owner));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [gpsMessage, setGpsMessage] = useState("");

  const update = (event) => setDetails((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setDetails((prev) => ({ ...prev, shopImage: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsDetectingLocation(true);
    setGpsMessage("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingLocation(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setDetails((prev) => ({ ...prev, latitude: lat, longitude: lng }));
        setGpsMessage(`Location captured! Lat: ${lat}, Lng: ${lng}`);
      },
      (err) => {
        setIsDetectingLocation(false);
        alert("Could not detect location: " + err.message + ". Please enter coordinates or address manually.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const updatedStore = await apiClient.pharmacies.updateStore(store.id, {
        name: details.name.trim(),
        licenseNumber: details.licenseNumber.trim(),
        gstNumber: details.gstNumber.trim() || undefined,
        addressLine1: details.addressLine1.trim(),
        addressLine2: details.addressLine2.trim() || undefined,
        city: details.city.trim(),
        state: details.state.trim(),
        postalCode: details.postalCode.trim(),
        latitude: Number(details.latitude),
        longitude: Number(details.longitude),
        deliveryRadiusKm: Number(details.deliveryRadiusKm) || 5,
        openingTime: details.openingTime || "09:00",
        closingTime: details.closingTime || "21:00",
        ownerName: details.ownerName.trim(),
        ownerPhone: details.ownerPhone.trim(),
        imageUrl: details.shopImage || undefined,
      });

      localStorage.setItem("shopId", updatedStore.id);
      localStorage.setItem("shopName", updatedStore.name);
      localStorage.setItem("shopOwnerName", details.ownerName.trim());
      localStorage.setItem("shopOwnerPhone", details.ownerPhone.trim());
      if (details.shopImage) {
        localStorage.setItem(`shopImage_${updatedStore.id}`, details.shopImage);
      }
      onComplete({
        ...updatedStore,
        imageUrl: details.shopImage || updatedStore.imageUrl,
        owner: {
          name: details.ownerName.trim(),
          phone: details.ownerPhone.trim(),
        }
      });
    } catch (err) {
      setError(err.message || "Unable to save pharmacy details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-bg py-8 px-4" style={{ background: "radial-gradient(ellipse at 30% 40%, rgba(109,40,217,0.18) 0%, transparent 55%), #080E1A" }}>
      <div className="w-full max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </button>
        <div className="glass-strong rounded-3xl p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#7C3AED,#6D28D9)" }}>
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="badge-indigo mb-2">PHARMACY PROFILE & LOCATION SETUP</div>
              <h1 className="text-2xl font-black text-white">Shop & Owner Details</h1>
              <p className="text-slate-400 text-sm mt-1">
                Provide your shop name, exact location, register number, and contact info so nearby customers can find your medicines.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-6">
            {/* Section 1: Shop & Owner Identity */}
            <div className="rounded-2xl p-5 border border-slate-800 bg-slate-900/40 space-y-4">
              <h3 className="text-sm font-black text-violet-300 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-violet-400" /> 1. Shop & Owner Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Shop Name *</label>
                  <input className="dark-input" name="name" value={details.name} onChange={update} placeholder="e.g. Apollo / Carewell Pharmacy" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Drug License / Registration No. *</label>
                  <input className="dark-input" name="licenseNumber" value={details.licenseNumber} onChange={update} placeholder="e.g. KA-BNG-2026-4491" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-violet-400" /> Owner Name *
                  </label>
                  <input className="dark-input" name="ownerName" value={details.ownerName} onChange={update} placeholder="e.g. Ramesh Sharma" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-teal-400" /> Owner Contact Phone No. *
                  </label>
                  <input className="dark-input" name="ownerPhone" type="tel" value={details.ownerPhone} onChange={update} placeholder="e.g. +91 9876543210" required />
                  <p className="text-[11px] text-slate-500 mt-1">Visible to customers so they can call your shop directly</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">GST Number (Optional)</label>
                  <input className="dark-input" name="gstNumber" value={details.gstNumber} onChange={update} placeholder="e.g. 29ABCDE1234F1Z5" />
                </div>
              </div>
            </div>

            {/* Section 2: Storefront Photo */}
            <div className="rounded-2xl p-5 border border-slate-800 bg-slate-900/40 space-y-4">
              <h3 className="text-sm font-black text-violet-300 uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-violet-400" /> 2. Shop Photo / Storefront Image
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                  {details.shopImage ? (
                    <img src={details.shopImage} alt="Shop" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2">
                      <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-500">No Image</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2 flex-1 w-full">
                  <label className="btn-glow inline-flex cursor-pointer text-xs py-2 px-4">
                    <Camera className="w-4 h-4 mr-2" />
                    <span>Upload Shop Photo</span>
                    <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
                  </label>
                  <p className="text-xs text-slate-500">
                    Upload a clean photo of your shop storefront, signboard, or interior to build customer trust.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Full Address & Map Location */}
            <div className="rounded-2xl p-5 border border-slate-800 bg-slate-900/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-sm font-black text-violet-300 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-400" /> 3. Full Address & Precise GPS Location
                </h3>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-teal-300 hover:text-white transition-all flex items-center gap-1.5 self-start sm:self-auto"
                  style={{ background: "rgba(20,184,166,0.15)", border: "1px solid rgba(20,184,166,0.35)" }}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {isDetectingLocation ? "Detecting GPS..." : "📍 Auto-Detect My Current GPS Location"}
                </button>
              </div>

              {gpsMessage && (
                <div className="rounded-xl px-3 py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {gpsMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Shop Address Line 1 *</label>
                  <input className="dark-input" name="addressLine1" value={details.addressLine1} onChange={update} placeholder="Building name, shop number, road name" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Address Line 2 / Landmark</label>
                  <input className="dark-input" name="addressLine2" value={details.addressLine2} onChange={update} placeholder="Near Metro station, Opposite Hospital, etc." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">City *</label>
                  <input className="dark-input" name="city" value={details.city} onChange={update} placeholder="e.g. Bengaluru" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">State *</label>
                  <input className="dark-input" name="state" value={details.state} onChange={update} placeholder="e.g. Karnataka" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Postal / PIN Code *</label>
                  <input className="dark-input" name="postalCode" value={details.postalCode} onChange={update} placeholder="e.g. 560038" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Delivery Radius (km) *</label>
                  <input className="dark-input" name="deliveryRadiusKm" type="number" min="0.5" max="50" step="0.5" value={details.deliveryRadiusKm} onChange={update} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">GPS Latitude *</label>
                  <input className="dark-input" name="latitude" type="number" step="0.000001" value={details.latitude} onChange={update} placeholder="e.g. 12.9716" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">GPS Longitude *</label>
                  <input className="dark-input" name="longitude" type="number" step="0.000001" value={details.longitude} onChange={update} placeholder="e.g. 77.5946" required />
                </div>
              </div>
            </div>

            {/* Section 4: Operating Hours */}
            <div className="rounded-2xl p-5 border border-slate-800 bg-slate-900/40 space-y-4">
              <h3 className="text-sm font-black text-violet-300 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-400" /> 4. Operating Hours
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Opening Time *</label>
                  <input className="dark-input" name="openingTime" type="time" value={details.openingTime} onChange={update} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Closing Time *</label>
                  <input className="dark-input" name="closingTime" type="time" value={details.closingTime} onChange={update} required />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl p-3 text-sm text-rose-300" style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-violet-500/20"
              style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}
            >
              {isSubmitting ? "Saving details..." : <><ShieldCheck className="w-5 h-5" /> Save Pharmacy Details & Publish</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
