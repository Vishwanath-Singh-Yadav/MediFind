import React, { useEffect, useMemo, useState } from "react";
import {
  Search, ShoppingCart, MapPin, Star, Plus, Minus, X, Filter,
  Clock, Pill, ChevronRight, Heart, SlidersHorizontal, CreditCard,
  CheckCircle2, ShieldCheck, Upload, LogOut, Truck, Tag, Home,
  Phone, User, Building2, ExternalLink, ArrowUpDown, Navigation, Store
} from "lucide-react";
import { apiClient } from "../lib/api-client";
import { formatDateDDMMYYYY } from "../lib/date-format";

const money = (n) => `₹${Number(n).toFixed(2)}`;

function StockBadge({ stock }) {
  if (stock > 20) return <span className="badge-emerald">In Stock ({stock})</span>;
  if (stock > 0) return <span className="badge-amber">Low Stock ({stock})</span>;
  return <span className="badge-rose">Out of Stock</span>;
}

function MedicineCard({ item, store, onAdd, onView, inCart }) {
  const pct = Number(item.discountPct ?? (item.mrp ? ((item.mrp - item.price) / item.mrp) * 100 : 0));
  const image = item.images?.[0]?.imageUrl;
  const ownerName = store?.ownerName || store?.owner?.name || localStorage.getItem(`shopOwnerName_${store?.id}`) || "Registered Pharmacist";
  const ownerPhone = store?.ownerPhone || store?.owner?.phone || localStorage.getItem(`shopOwnerPhone_${store?.id}`);
  const address = [store?.addressLine1, store?.addressLine2, store?.city, store?.state, store?.postalCode]
    .filter(Boolean).join(", ");
  const coordinates = store?.latitude != null && store?.longitude != null
    ? `${store.latitude},${store.longitude}`
    : "";
  const directionsUrl = coordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coordinates)}`
    : address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || store?.name || "pharmacy")}`
    : null;

  return (
    <div className="med-card animate-fade-up cursor-pointer" role="button" tabIndex={0}
      onClick={() => onView?.(item)}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onView?.(item); }}>
      {/* Color accent strip */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: item.rx ? "linear-gradient(90deg,#F59E0B,#EF4444)" : "linear-gradient(90deg,#14B8A6,#6366F1)" }} />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Medicine image */}
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-900 border border-slate-800 flex items-center justify-center">
          {image ? <img src={image} alt={item.name} className="w-full h-full object-cover" /> : <Pill className={`w-8 h-8 ${item.rx ? "text-amber-400" : "text-teal-400"}`} />}
          {item.images?.length > 1 && <span className="absolute bottom-1 right-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] text-white">+{item.images.length - 1}</span>}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-white text-base">{item.name}</h3>
            {item.rx && <span className="badge-amber">Rx Required</span>}
            {pct > 0 && <span className="badge-teal text-[10px]">{pct.toFixed(0)}% off</span>}
          </div>
          <p className="text-slate-400 text-xs mb-1.5">{item.generic} · {item.category} · {item.medicine?.dosageForm || "Medicine"}</p>
          {(item.medicine?.manufacturer || item.medicine?.strength) && (
            <p className="text-slate-500 text-xs mb-2">
              {item.medicine.manufacturer}{item.medicine.strength ? ` · ${item.medicine.strength}` : ""}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
            <span className="text-white font-black text-sm">{money(item.price)}</span>
            {item.mrp > item.price && <span className="text-slate-500 line-through">MRP {money(item.mrp)}</span>}
            {item.batchNumber && <span className="text-slate-400 font-mono text-[11px]">Batch: {item.batchNumber}</span>}
            {item.expiryDate && <span className="text-amber-300 text-[11px]">Expiry: {formatDateDDMMYYYY(item.expiryDate)}</span>}
          </div>

          {/* Dedicated Shop & Owner Section */}
          <div className="rounded-xl border border-teal-400/20 bg-teal-400/5 p-3 text-xs space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-teal-300">
                <Building2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                <span>Shop: {store?.name || "Verified Pharmacy"}</span>
                {store?.licenseNumber && <span className="text-[10px] font-mono text-slate-400 font-normal">({store.licenseNumber})</span>}
              </div>
              {item.distanceKm != null ? (
                <span className="badge-teal text-[11px] flex items-center gap-1 font-bold">
                  <MapPin className="w-3 h-3" /> {Number(item.distanceKm).toFixed(1)} km away
                </span>
              ) : (
                <span className="text-slate-400 text-[11px]">Nearby</span>
              )}
            </div>

            {/* Owner Name & Phone */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300 pt-0.5">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-violet-400" />
                <span>Owner: <strong className="text-white">{ownerName}</strong></span>
              </span>
              {ownerPhone && (
                <a
                  href={`tel:${ownerPhone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-0.5 rounded-md bg-teal-500/15 border border-teal-500/30 text-teal-300 hover:text-white transition-colors flex items-center gap-1 font-bold"
                  title="Click to call shop owner"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call: {ownerPhone}</span>
                </a>
              )}
              {store?.rating && (
                <span className="text-amber-400 flex items-center gap-1 font-semibold">
                  <Star className="w-3 h-3 fill-amber-400" /> {Number(store.rating).toFixed(1)}
                </span>
              )}
            </div>

            {/* Address & Hours */}
            {address && (
              <div className="text-slate-400 flex items-start justify-between gap-2 pt-0.5">
                <div className="flex items-start gap-1 flex-1">
                  <MapPin className="w-3 h-3 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{address}</span>
                </div>
                {directionsUrl && (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-teal-400 hover:text-teal-200 underline font-semibold flex items-center gap-1 whitespace-nowrap ml-2 flex-shrink-0"
                  >
                    <ExternalLink className="w-3 h-3" /> Directions
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Price & action */}
        <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none">
            <div className="text-2xl font-black text-white">{money(item.price)}</div>
            <div className="text-slate-500 text-xs line-through">MRP {money(item.mrp)}</div>
            <div className="mt-1"><StockBadge stock={item.stock} /></div>
          </div>
          <button onClick={(event) => { event.stopPropagation(); onAdd(item); }} disabled={item.stock === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 flex-shrink-0 ${inCart ? "text-teal-400" : "text-white"}`}
            style={{
              background: item.stock === 0 ? "rgba(255,255,255,0.05)" : inCart ? "rgba(20,184,166,0.12)" : "linear-gradient(135deg,#0D9488,#0891B2)",
              border: inCart ? "1px solid rgba(20,184,166,0.4)" : "none",
              boxShadow: item.stock === 0 ? "none" : inCart ? "none" : "0 4px 12px rgba(13,148,136,0.35)"
            }}>
            {inCart ? <><CheckCircle2 className="w-4 h-4" /> Added</> : <><Plus className="w-4 h-4" /> Add</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function ShopCard({ shop, onSelectShop }) {
  const ownerName = shop?.ownerName || shop?.owner?.name || localStorage.getItem(`shopOwnerName_${shop.id}`) || "Registered Pharmacist";
  const ownerPhone = shop?.ownerPhone || shop?.owner?.phone || localStorage.getItem(`shopOwnerPhone_${shop.id}`);
  const address = [shop?.addressLine1, shop?.addressLine2, shop?.city, shop?.state, shop?.postalCode].filter(Boolean).join(", ");
  const coordinates = shop?.latitude != null && shop?.longitude != null ? `${shop.latitude},${shop.longitude}` : "";
  const directionsUrl = coordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coordinates)}`
    : address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || shop.name || "pharmacy")}`
    : null;
  const shopImage = localStorage.getItem(`shopImage_${shop.id}`) || shop.imageUrl;

  return (
    <div className="dark-card p-5 rounded-2xl border border-slate-800 hover:border-teal-500/40 transition-all space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Shop storefront image */}
        <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
          {shopImage ? (
            <img src={shopImage} alt={shop.name} className="w-full h-full object-cover" />
          ) : (
            <Building2 className="w-8 h-8 text-violet-400" />
          )}
        </div>

        {/* Shop Information */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black text-white text-lg">{shop.name}</h3>
            {shop.licenseNumber && <span className="badge-indigo text-[10px]">Reg: {shop.licenseNumber}</span>}
            {shop.rating && (
              <span className="text-amber-400 text-xs flex items-center gap-1 font-bold">
                <Star className="w-3 h-3 fill-amber-400" /> {Number(shop.rating).toFixed(1)}
              </span>
            )}
            {shop.distanceKm != null && (
              <span className="badge-teal text-[11px] flex items-center gap-1 font-bold">
                <MapPin className="w-3 h-3" /> {Number(shop.distanceKm).toFixed(1)} km away
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-violet-400" />
              <span>Owner: <strong className="text-white">{ownerName}</strong></span>
            </div>
            {ownerPhone && (
              <a
                href={`tel:${ownerPhone}`}
                className="px-2 py-0.5 rounded-md bg-teal-500/15 border border-teal-500/30 text-teal-300 hover:text-white flex items-center gap-1 font-bold transition-colors"
                title="Call shop owner"
              >
                <Phone className="w-3 h-3" />
                <span>Call: {ownerPhone}</span>
              </a>
            )}
            {(shop.openingTime || shop.closingTime) && (
              <div className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Open {shop.openingTime || "—"}–{shop.closingTime || "—"}</span>
              </div>
            )}
          </div>

          {address && (
            <p className="text-xs text-slate-400 flex items-start gap-1 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
              <span>{address}</span>
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-teal-300 hover:text-white flex items-center gap-1.5"
              style={{ background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.3)" }}
            >
              <MapPin className="w-3.5 h-3.5" /> Directions
            </a>
          )}
          <button
            onClick={() => onSelectShop(shop.id)}
            className="btn-glow px-4 py-2 text-xs flex items-center gap-1.5"
          >
            <span>View Medicines ({shop.items?.length || 0})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MedicineDetailsModal({ item, onClose, onAdd, inCart }) {
  const images = item.images?.map((image) => image.imageUrl).filter(Boolean) || [];
  const store = item.store || {};
  const ownerName = store?.ownerName || store?.owner?.name || localStorage.getItem(`shopOwnerName_${store?.id}`) || "Registered Pharmacist";
  const ownerPhone = store?.ownerPhone || store?.owner?.phone || localStorage.getItem(`shopOwnerPhone_${store?.id}`);
  const address = [store.addressLine1, store.addressLine2, store.city, store.state, store.postalCode]
    .filter(Boolean).join(", ");
  const coordinates = store.latitude != null && store.longitude != null
    ? `${store.latitude},${store.longitude}`
    : "";
  const directionsUrl = coordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coordinates)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || store.name || "pharmacy")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-400">Medicine details</p>
            <h2 className="text-2xl font-black text-white mt-1">{item.name}</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full text-slate-400 hover:text-white hover:bg-white/10"> <X className="w-5 h-5 mx-auto" /> </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 p-6">
          <div className="space-y-3">
            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              {images[0] ? <img src={images[0]} alt={item.name} className="w-full h-full object-contain" /> : <Pill className="w-14 h-14 text-teal-400" />}
            </div>
            {images.length > 1 && <div className="grid grid-cols-4 gap-2">{images.slice(1).map((image, index) => <img key={`${image}-${index}`} src={image} alt={`${item.name} ${index + 2}`} className="w-full aspect-square object-cover rounded-lg border border-slate-800" />)}</div>}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[["Generic name", item.generic], ["Category", item.category], ["Manufacturer", item.medicine?.manufacturer], ["Dosage form", item.medicine?.dosageForm], ["Strength", item.medicine?.strength], ["Batch number", item.batchNumber], ["Expiry date", item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "—"], ["Stock", `${item.stock} units`]].map(([label, value]) => value && <div key={label} className="rounded-xl bg-slate-950/60 p-3"><p className="text-xs text-slate-500">{label}</p><p className="text-slate-200 font-semibold mt-1">{value}</p></div>)}
            </div>
            {item.medicine?.description && <p className="text-sm text-slate-400">{item.medicine.description}</p>}

            {/* Shop & Owner Info in Modal */}
            <div className="rounded-2xl border border-teal-400/20 bg-teal-400/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-teal-400 font-bold">Dispensing Pharmacy</p>
                  <h3 className="text-lg text-white font-black mt-0.5">{store.name || "Pharmacy"}</h3>
                </div>
                {item.distanceKm != null && (
                  <span className="badge-teal text-xs flex items-center gap-1 font-bold">
                    <MapPin className="w-3.5 h-3.5" /> {Number(item.distanceKm).toFixed(1)} km away
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div className="text-slate-300">
                  <span className="text-slate-500">Owner:</span> <strong className="text-white">{ownerName}</strong>
                </div>
                {ownerPhone && (
                  <div>
                    <span className="text-slate-500">Contact:</span>{" "}
                    <a href={`tel:${ownerPhone}`} className="text-teal-300 hover:text-white font-bold inline-flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {ownerPhone}
                    </a>
                  </div>
                )}
                {store.licenseNumber && (
                  <div className="text-slate-300">
                    <span className="text-slate-500">Reg No:</span> <span className="font-mono">{store.licenseNumber}</span>
                  </div>
                )}
                {(store.openingTime || store.closingTime) && (
                  <div className="text-slate-300">
                    <span className="text-slate-500">Hours:</span> Open {store.openingTime || "—"}–{store.closingTime || "—"}
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-400 pt-1">{address || "Address not provided"}</p>
              {coordinates && <p className="text-[11px] text-slate-500">GPS: {store.latitude}, {store.longitude}</p>}
              
              <div className="pt-2">
                <a href={directionsUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="btn-glow inline-flex text-xs py-2 px-3">
                  <MapPin className="w-3.5 h-3.5 mr-1" /> Get Google Maps Directions
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <div><p className="text-2xl font-black text-white">{money(item.price)}</p><p className="text-xs text-slate-500 line-through">MRP {money(item.mrp)}</p></div>
              <button onClick={() => onAdd(item)} disabled={item.stock === 0} className="btn-glow"><Plus className="w-4 h-4" /> {inCart ? "Added" : "Add to cart"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartSidebar({ cart, onClose, onChangeQty, onRemove, onCheckout }) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal >= 500 ? 0 : cart.length ? 39 : 0;
  const total = subtotal + delivery;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md h-full flex flex-col animate-slide-right"
        style={{ background: "linear-gradient(180deg, #0F172A 0%, #080E1A 100%)", borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-teal-400" /> Your Cart
            {cart.length > 0 && <span className="badge-teal">{cart.reduce((s, i) => s + i.qty, 0)} items</span>}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.05)" }}>
              <ShoppingCart className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 font-semibold">Your cart is empty</p>
            <p className="text-slate-600 text-sm mt-1">Add medicines to continue</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map(item => (
                <div key={item.id} className="dark-card p-4 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(20,184,166,0.1)" }}>
                      <Pill className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">{item.name}</p>
                      <p className="text-slate-500 text-xs">{money(item.price)} each</p>
                    </div>
                    <button onClick={() => onRemove(item.id)} className="text-slate-600 hover:text-rose-400 transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <button onClick={() => onChangeQty(item.id, -1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-teal-400 hover:bg-teal-400/10 transition-all">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-white font-black text-sm">{item.qty}</span>
                      <button onClick={() => onChangeQty(item.id, 1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-teal-400 hover:bg-teal-400/10 transition-all">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-black text-white">{money(item.price * item.qty)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-slate-400"><span>Subtotal</span><span className="text-white">{money(subtotal)}</span></div>
                <div className="flex justify-between text-slate-400"><span>Delivery</span><span className={delivery ? "text-white" : "text-emerald-400"}>{delivery ? money(delivery) : "FREE"}</span></div>
                {subtotal < 500 && cart.length > 0 && (
                  <p className="text-xs text-amber-400">Add {money(500 - subtotal)} more for free delivery</p>
                )}
                <div className="flex justify-between text-lg font-black text-white pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                  <span>Total</span><span className="gradient-text">{money(total)}</span>
                </div>
              </div>
              <button onClick={onCheckout} className="btn-glow w-full">
                <CreditCard className="w-4 h-4" /> Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CheckoutModal({ cart, onClose, onConfirm, isLoading }) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal >= 500 ? 0 : cart.length ? 39 : 0;
  const total = subtotal + delivery;

  const [deliveryAddress, setDeliveryAddress] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("COD");
  const [couponCode, setCouponCode] = React.useState("");
  const [addrError, setAddrError] = React.useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (deliveryAddress.trim().length < 10) {
      setAddrError("Please enter a full delivery address (at least 10 characters).");
      return;
    }
    setAddrError("");
    onConfirm({ deliveryAddress: deliveryAddress.trim(), paymentMethod, couponCode: couponCode.trim() || undefined });
  }

  const paymentOptions = [
    { value: "COD", label: "Cash on Delivery", icon: "💵", desc: "Pay when you receive" },
    { value: "RAZORPAY", label: "Razorpay", icon: "💳", desc: "UPI, Cards, Net Banking" },
    { value: "STRIPE", label: "Stripe", icon: "🌐", desc: "International cards" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "linear-gradient(180deg,#0F172A 0%,#080E1A 100%)", border: "1px solid rgba(255,255,255,0.08)" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-400">Almost there</p>
            <h2 className="text-xl font-black text-white mt-0.5">Complete your order</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Delivery address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              <MapPin className="w-3 h-3 inline mr-1 text-teal-400" />Delivery Address
            </label>
            <textarea
              value={deliveryAddress}
              onChange={(e) => { setDeliveryAddress(e.target.value); setAddrError(""); }}
              placeholder="Enter your full delivery address (house no., street, city, pin)…"
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              required
            />
            {addrError && <p className="text-rose-400 text-xs mt-1">{addrError}</p>}
          </div>

          {/* Payment method */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              <CreditCard className="w-3 h-3 inline mr-1 text-teal-400" />Payment Method
            </label>
            <div className="space-y-2">
              {paymentOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: paymentMethod === opt.value ? "rgba(20,184,166,0.12)" : "rgba(255,255,255,0.03)",
                    border: paymentMethod === opt.value ? "1px solid rgba(20,184,166,0.5)" : "1px solid rgba(255,255,255,0.07)"
                  }}>
                  <input type="radio" name="paymentMethod" value={opt.value}
                    checked={paymentMethod === opt.value}
                    onChange={() => setPaymentMethod(opt.value)}
                    className="accent-teal-400 w-4 h-4 flex-shrink-0" />
                  <span className="text-lg">{opt.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{opt.label}</p>
                    <p className="text-xs text-slate-500">{opt.desc}</p>
                  </div>
                  {paymentMethod === opt.value && <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />}
                </label>
              ))}
            </div>
          </div>

          {/* Coupon */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              <Tag className="w-3 h-3 inline mr-1 text-teal-400" />Coupon Code (optional)
            </label>
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="e.g. HEALTH10"
              className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <p className="text-xs text-slate-600 mt-1">Try HEALTH10 for 10% off (up to ₹150)</p>
          </div>

          {/* Order summary */}
          <div className="rounded-xl p-4 space-y-2 text-sm" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Order Summary</p>
            <div className="flex justify-between text-slate-400"><span>Subtotal</span><span className="text-white">{money(subtotal)}</span></div>
            <div className="flex justify-between text-slate-400"><span>Delivery</span><span className={delivery ? "text-white" : "text-emerald-400"}>{delivery ? money(delivery) : "FREE"}</span></div>
            <div className="flex justify-between text-lg font-black text-white pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <span>Total</span><span className="gradient-text">{money(total)}</span>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={isLoading}
            className="btn-glow w-full disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ opacity: isLoading ? 0.6 : 1 }}>
            {isLoading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Placing order…</>
              : <><ShieldCheck className="w-4 h-4" /> Place Order · {money(total)}</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function OrderSuccess({ orderId, total, store, onBack }) {
  // Build a Google Maps link from the store's coordinates or address
  const hasCoords = store?.latitude != null && store?.longitude != null;
  const address = [store?.addressLine1, store?.addressLine2, store?.city, store?.state, store?.postalCode]
    .filter(Boolean).join(", ");
  const mapsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`
    : address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-scale-in">
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
        style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(20,184,166,0.2))", border: "2px solid rgba(16,185,129,0.4)" }}>
        <CheckCircle2 className="w-12 h-12 text-emerald-400" />
      </div>
      <div className="badge-emerald mb-4">ORDER CONFIRMED</div>
      <h2 className="text-3xl font-black text-white mb-2">{orderId}</h2>
      <p className="text-slate-400 mb-1">Order placed · {money(total)}</p>
      <div className="flex items-center gap-2 text-sm text-teal-400 mb-6"><Truck className="w-4 h-4" /> Estimated: 25–35 min</div>

      {/* Pharmacy location card — shown only when the shop has location data */}
      {store && (store.name || address || mapsUrl) && (
        <div className="w-full max-w-sm mb-6 rounded-2xl text-left overflow-hidden"
          style={{ border: "1px solid rgba(20,184,166,0.25)", background: "rgba(20,184,166,0.05)" }}>
          <div className="px-4 pt-4 pb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Dispatching from
            </p>
            {store.name && (
              <p className="text-white font-black text-base">{store.name}</p>
            )}
            {address && (
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">{address}</p>
            )}
            {(store.openingTime || store.closingTime) && (
              <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {store.openingTime || "—"} – {store.closingTime || "—"}
              </p>
            )}
            {hasCoords && (
              <p className="text-slate-600 text-[11px] mt-1">
                📍 {Number(store.latitude).toFixed(5)}, {Number(store.longitude).toFixed(5)}
              </p>
            )}
          </div>
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-teal-300 transition-colors hover:text-white"
              style={{ borderTop: "1px solid rgba(20,184,166,0.15)", background: "rgba(20,184,166,0.08)" }}>
              <MapPin className="w-4 h-4" /> Get Directions
            </a>
          )}
        </div>
      )}

      {/* Order progress steps */}
      <div className="w-full max-w-sm space-y-3 text-sm">
        {["Order placed", "Confirmed", "Packed", "Out for delivery"].map((step, i) => (
          <div key={step} className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? "text-white" : "text-slate-600"}`}
              style={{ background: i === 0 ? "linear-gradient(135deg,#0D9488,#0891B2)" : "rgba(255,255,255,0.05)" }}>
              {i + 1}
            </div>
            <span className={i === 0 ? "text-white font-semibold" : "text-slate-500"}>{step}</span>
            {i === 0 && <span className="badge-emerald ml-auto text-[10px]">Live</span>}
          </div>
        ))}
      </div>
      <button onClick={onBack} className="btn-glow mt-8">Back to Medicines</button>
    </div>
  );
}

export default function CustomerMarketplace({ customer, onSignOut, onHome }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(500);
  const [rxOnly, setRxOnly] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessAnim, setPaymentSuccessAnim] = useState(false);
  const [stage, setStage] = useState("browse"); // browse | payment | tracking
  const [prescription, setPrescription] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderPaymentMethod, setOrderPaymentMethod] = useState("COD");
  const [orderStore, setOrderStore] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [wishlist, setWishlist] = useState(new Set());
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [sortBy, setSortBy] = useState("nearest"); // "nearest" | "lowestPrice"
  const [viewMode, setViewMode] = useState("medicines"); // "medicines" | "shops"
  const [selectedShopFilter, setSelectedShopFilter] = useState(null); // specific store id or null

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setCustomerLocation({ lat: coords.latitude, lng: coords.longitude }),
      () => setCustomerLocation(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  // Attempt real API search
  useEffect(() => {
    const term = query.trim().toLowerCase();
    setIsSearching(true);
    apiClient.commerce.search({ q: term, maxPrice, ...(customerLocation || {}) })
      .then(res => {
        const mapped = Array.isArray(res?.results) && res.results.length > 0
          ? res.results.map((r, i) => ({
              id: r.id || `api-${i}`, name: r.medicine?.brandName, medicine: r.medicine,
              generic: r.medicine?.genericName, category: r.medicine?.category,
              price: Number(r.price ?? 0), mrp: Number(r.mrp ?? r.price ?? 0), discountPct: Number(r.discountPct ?? 0),
              expiryDate: r.expiryDate, images: r.images || [], rx: Boolean(r.medicine?.requiresPrescription), storeId: r.storeId,
              store: r.store ? {
                ...r.store,
                rating: r.rating,
                ownerName: r.store.ownerName || r.store.owner?.name,
                ownerPhone: r.store.ownerPhone || r.store.owner?.phone,
              } : null,
              stock: r.stock, distanceKm: r.distanceKm, offer: r.discountPct ? `${r.discountPct}% off` : "", published: true,
            }))
          : [];
        setCatalog(mapped);
      })
      .catch(() => setCatalog([]))
      .finally(() => setIsSearching(false));
  }, [query, maxPrice, customerLocation]);

  const matches = useMemo(() => {
    let list = catalog.filter(m => {
      const hay = `${m.name} ${m.generic} ${m.category} ${m.store?.name || ""}`.toLowerCase();
      const term = query.toLowerCase();
      const matchesCategory = category === "All" || m.category === category;
      const matchesShop = !selectedShopFilter || m.storeId === selectedShopFilter;
      return hay.includes(term) && m.price <= maxPrice && (!rxOnly || m.rx) && matchesCategory && matchesShop;
    });

    if (sortBy === "lowestPrice") {
      list.sort((a, b) => a.price - b.price);
    } else {
      // Nearest first (null distances placed at end)
      list.sort((a, b) => {
        if (a.distanceKm == null && b.distanceKm == null) return 0;
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }
    return list;
  }, [catalog, query, maxPrice, rxOnly, category, sortBy, selectedShopFilter]);

  const shopsList = useMemo(() => {
    const map = new Map();
    catalog.forEach(item => {
      if (!item.store?.id) return;
      if (!map.has(item.store.id)) {
        map.set(item.store.id, {
          ...item.store,
          distanceKm: item.distanceKm,
          items: []
        });
      }
      map.get(item.store.id).items.push(item);
    });

    let list = Array.from(map.values()).filter(shop => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      const matchShopName = shop.name?.toLowerCase().includes(q);
      const matchOwner = (shop.ownerName || "").toLowerCase().includes(q);
      const matchAddress = [shop.addressLine1, shop.city, shop.state].filter(Boolean).join(" ").toLowerCase().includes(q);
      const matchMedicines = shop.items.some(m => m.name?.toLowerCase().includes(q) || m.generic?.toLowerCase().includes(q));
      return matchShopName || matchOwner || matchAddress || matchMedicines;
    });

    if (sortBy === "lowestPrice") {
      list.sort((a, b) => {
        const minA = a.items.length ? Math.min(...a.items.map(i => i.price)) : 0;
        const minB = b.items.length ? Math.min(...b.items.map(i => i.price)) : 0;
        return minA - minB;
      });
    } else {
      list.sort((a, b) => {
        if (a.distanceKm == null && b.distanceKm == null) return 0;
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }
    return list;
  }, [catalog, query, sortBy]);

  const selectedShopName = useMemo(() => {
    if (!selectedShopFilter) return null;
    const found = catalog.find(m => m.storeId === selectedShopFilter);
    return found?.store?.name || "Selected Pharmacy";
  }, [catalog, selectedShopFilter]);

  const categories = useMemo(() => ["All", ...new Set(catalog.map((item) => item.category).filter(Boolean))], [catalog]);
  const pharmacies = useMemo(() => [...new Map(catalog.filter((item) => item.store?.id).map((item) => [item.store.id, { ...item.store, rating: item.rating }])).values()], [catalog]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const needsRx = cart.some(i => i.rx);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0) + (cart.length && cart.reduce((s, i) => s + i.price * i.qty, 0) < 500 ? 39 : 0);

  function addToCart(item) {
    if (cart.length && cart[0].storeId !== item.storeId) {
      alert("For safe delivery, please checkout one pharmacy at a time.");
      return;
    }
    setCart(prev => prev.some(r => r.id === item.id)
      ? prev.map(r => r.id === item.id ? { ...r, qty: r.qty + 1 } : r)
      : [...prev, { ...item, qty: 1 }]);
  }

  function changeQty(id, delta) {
    setCart(prev => prev.map(r => r.id === id ? { ...r, qty: r.qty + delta } : r).filter(r => r.qty > 0));
  }

  async function placeOrder({ deliveryAddress, paymentMethod, couponCode }) {
    if (needsRx && !prescription) {
      alert("Please upload a prescription for Rx medicines.");
      return;
    }
    setIsCheckingOut(true);
    try {
      // ── Step 1: Fetch whatever the backend DB cart currently holds ──────────
      // There may be stale items from a previous session / different store.
      const backendCart = await apiClient.commerce.getCart();
      const existingItems = backendCart?.items ?? [];

      // ── Step 2: Remove every stale backend cart item ──────────────────────
      // We clear first so the backend cart exactly mirrors the local UI cart.
      await Promise.all(
        existingItems.map((item) =>
          apiClient.commerce.removeFromCart(item.inventoryId)
        )
      );

      // ── Step 3: Push every local UI cart item to the backend DB cart ──────
      // addToCart upserts (safe to call multiple times).
      await Promise.all(
        cart.map((item) =>
          apiClient.commerce.addToCart({ inventoryId: item.id, quantity: item.qty })
        )
      );

      // ── Step 4: Call checkout – backend cart now matches local cart ────────
      const res = await apiClient.commerce.checkout({
        deliveryAddress,
        paymentMethod,
        couponCode: couponCode || undefined,
        prescriptionId: prescription?.id,
      });

      // Save order info BEFORE clearing cart (cartTotal becomes 0 after clear)
      setOrderId(res.order.orderNumber);
      setOrderTotal(Number(res.order.totalAmount));
      setOrderPaymentMethod(paymentMethod);
      setOrderStore(res.order.store ?? null);
      setCart([]);
      setShowCheckout(false);

      // COD → go straight to confirmation.
      // Online payments → go to payment gateway step first.
      if (paymentMethod === "COD") {
        setStage("tracking");
      } else {
        setStage("payment");
      }
    } catch (err) {
      alert(err.message || "Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  if (stage === "payment") {
    const isRazorpay = orderPaymentMethod === "RAZORPAY";
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    const isLiveKeyConfigured = Boolean(razorpayKey && !razorpayKey.includes("your_key_here"));

    const handleExecutePayment = async () => {
      if (isRazorpay && isLiveKeyConfigured) {
        setIsProcessingPayment(true);
        const loadScript = () =>
          new Promise((resolve) => {
            if (window.Razorpay) return resolve(true);
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });

        const loaded = await loadScript();
        setIsProcessingPayment(false);

        if (loaded && window.Razorpay) {
          const options = {
            key: razorpayKey,
            amount: Math.round(orderTotal * 100),
            currency: "INR",
            name: "MediFind Pharmacy",
            description: `Payment for Order ${orderId}`,
            handler: function () {
              setStage("tracking");
            },
            prefill: {
              name: customer?.name || "",
              email: customer?.email || "",
              contact: customer?.phone || "",
            },
            theme: {
              color: "#0D9488",
            },
          };
          const rzp = new window.Razorpay(options);
          rzp.on("payment.failed", function (response) {
            alert(`Payment cancelled or failed: ${response.error?.description || "Transaction declined"}`);
          });
          rzp.open();
          return;
        }
      }

      // Smooth in-app simulation (no blocking browser popup alert)
      setIsProcessingPayment(true);
      setTimeout(() => {
        setIsProcessingPayment(false);
        setStage("tracking");
      }, 1500);
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "#080E1A" }}>
        <div className="w-full max-w-md rounded-3xl p-8 text-center space-y-6 shadow-2xl"
          style={{ background: "linear-gradient(180deg,#0F172A,#080E1A)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: isRazorpay ? "rgba(0,112,240,0.15)" : "rgba(99,91,255,0.15)", border: `1px solid ${isRazorpay ? "rgba(0,112,240,0.4)" : "rgba(99,91,255,0.4)"}` }}>
            <CreditCard className={`w-8 h-8 ${isRazorpay ? "text-blue-400" : "text-indigo-400"}`} />
          </div>

          <div>
            <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-2"
              style={{
                background: isLiveKeyConfigured ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                color: isLiveKeyConfigured ? "#34D399" : "#FBBF24",
                border: `1px solid ${isLiveKeyConfigured ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`
              }}>
              {isLiveKeyConfigured ? "Live Gateway Active" : "Test Simulation Mode"}
            </div>
            <h2 className="text-2xl font-black text-white">{isRazorpay ? "Razorpay Checkout" : "Stripe Checkout"}</h2>
            <p className="text-slate-400 text-sm mt-1">Order <span className="text-white font-bold">{orderId}</span></p>
            <p className="text-3xl font-black text-white mt-3">{money(orderTotal)}</p>
          </div>

          <div className="rounded-2xl p-4 text-left space-y-2 text-xs"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-slate-400 font-semibold uppercase tracking-wide">Payment Details</p>
            <div className="flex justify-between text-slate-300">
              <span>Method:</span>
              <span className="font-bold text-white">{isRazorpay ? "Razorpay (UPI / Card / NetBanking)" : "Stripe"}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Amount Payable:</span>
              <span className="font-bold text-teal-400">{money(orderTotal)}</span>
            </div>
            {!isLiveKeyConfigured && (
              <p className="text-amber-400/90 text-[11px] pt-1 border-t border-white/5">
                💡 Sandbox mode: Click <b>Pay Now</b> to simulate instant payment verification. To use real Razorpay credentials, configure <code className="text-teal-300">VITE_RAZORPAY_KEY_ID</code> in <code className="text-teal-300">frontend/.env</code>.
              </p>
            )}
          </div>

          <button
            className="btn-glow w-full flex items-center justify-center gap-2"
            disabled={isProcessingPayment}
            onClick={handleExecutePayment}
          >
            {isProcessingPayment ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay Now · {money(orderTotal)}</span>
              </>
            )}
          </button>

          <button
            onClick={() => setStage("browse")}
            disabled={isProcessingPayment}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Cancel and return to marketplace
          </button>
        </div>
      </div>
    );
  }

  if (stage === "tracking") {
    return (
      <div className="min-h-screen" style={{ background: "#080E1A" }}>
        <nav className="top-nav px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#0D9488,#0891B2)" }}>
            <Pill className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-white">MediFind</span>
        </nav>
        <div className="max-w-2xl mx-auto px-4">
          <OrderSuccess orderId={orderId} total={orderTotal} store={orderStore} onBack={() => { setStage("browse"); }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#080E1A" }}>
      {/* Navbar */}
      <nav className="top-nav px-4 sm:px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#0D9488,#0891B2)", boxShadow: "0 4px 12px rgba(13,148,136,0.3)" }}>
          <Pill className="w-5 h-5 text-white" />
        </div>
        <div className="hidden sm:flex items-center gap-1 text-slate-400 text-sm">
          <MapPin className="w-4 h-4 text-teal-400" />
          <span>Indiranagar, Bengaluru</span>
        </div>
        <div className="flex-1" />
        <span className="hidden sm:block text-slate-300 text-sm font-semibold">Hi, {customer?.name?.split(" ")[0]} 👋</span>
        <button onClick={() => setShowCart(true)} className="relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-bold text-slate-300 hover:text-white"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden sm:inline">Cart</span>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
        <button onClick={onHome} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm px-2" title="Return to home">
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </button>
        <button onClick={onSignOut} className="flex items-center gap-1.5 text-slate-500 hover:text-rose-400 transition-colors text-sm px-2">
          <LogOut className="w-4 h-4" />
        </button>
      </nav>

      {/* Hero search bar */}
      <div className="relative overflow-hidden px-4 py-10"
        style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(20,184,166,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(99,102,241,0.1) 0%, transparent 60%)" }}>
        <div className="max-w-3xl mx-auto text-center animate-fade-up">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Find the right medicine <span className="gradient-text">near you</span>
          </h1>
          <p className="text-slate-400 mb-6 text-sm">Compare prices from verified pharmacies in real time</p>
          <div className="search-bar max-w-xl mx-auto">
            <Search className="w-5 h-5 text-slate-500 flex-shrink-0" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search medicines added by pharmacies..." />
            {isSearching && <div className="w-4 h-4 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin flex-shrink-0" />}
            {query && <button onClick={() => setQuery("")} className="text-slate-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Navigation & Section View Toggle */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Section Option of Shop / Medicine */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => { setViewMode("medicines"); setSelectedShopFilter(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "medicines"
                  ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Browse Medicines ({matches.length})</span>
            </button>
            <button
              onClick={() => setViewMode("shops")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "shops"
                  ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Browse by Shops ({shopsList.length})</span>
            </button>
          </div>

          {/* Finding Categories: Nearest vs Lowest Price */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">Sort & Find:</span>
            <button
              onClick={() => setSortBy("nearest")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                sortBy === "nearest"
                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20 border border-teal-400/30"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>📍 Nearest First</span>
            </button>
            <button
              onClick={() => setSortBy("lowestPrice")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                sortBy === "lowestPrice"
                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20 border border-teal-400/30"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>💰 Lowest Price</span>
            </button>

            {/* GPS refresh button */}
            {!customerLocation && (
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      ({ coords }) => setCustomerLocation({ lat: coords.latitude, lng: coords.longitude }),
                      () => alert("Location permission needed for distance calculation.")
                    );
                  }
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-500/10 border border-cyan-500/20 transition-all flex items-center gap-1"
                title="Enable GPS to calculate distances"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>GPS</span>
              </button>
            )}
          </div>
        </div>

        {/* Filtered by specific shop banner */}
        {selectedShopFilter && (
          <div className="mb-6 rounded-2xl p-4 bg-teal-500/10 border border-teal-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-teal-300 font-bold">
              <Building2 className="w-4 h-4 text-teal-400" />
              <span>Showing medicines exclusively from <u>{selectedShopName}</u></span>
            </div>
            <button
              onClick={() => setSelectedShopFilter(null)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 border border-white/10 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Store Filter
            </button>
          </div>
        )}

        {/* Category pills (visible in medicines mode) */}
        {viewMode === "medicines" && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-6">
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={{
                  background: category === cat ? "linear-gradient(135deg,#0D9488,#0891B2)" : "rgba(255,255,255,0.05)",
                  color: category === cat ? "white" : "#94A3B8",
                  border: category === cat ? "none" : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: category === cat ? "0 4px 12px rgba(13,148,136,0.3)" : "none"
                }}>
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar filters */}
          <aside className="h-fit">
            <div className="glass rounded-2xl p-5 space-y-5 sticky top-20">
              <div className="flex items-center gap-2 font-bold text-white">
                <SlidersHorizontal className="w-4 h-4 text-teal-400" /> Filters
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Max Price</span>
                  <span className="text-teal-400 font-black text-sm">{money(maxPrice)}</span>
                </div>
                <input type="range" min="20" max="500" value={maxPrice} onChange={e => setMaxPrice(+e.target.value)}
                  className="w-full" style={{ accentColor: "#14B8A6" }} />
                <div className="flex justify-between text-xs text-slate-600 mt-1"><span>₹20</span><span>₹500</span></div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={rxOnly} onChange={e => setRxOnly(e.target.checked)} className="toggle" />
                <div>
                  <div className="text-sm font-semibold text-white">Prescription Only</div>
                  <div className="text-xs text-slate-500">Show Rx medicines</div>
                </div>
              </label>
              <div className="pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Registered Pharmacies</p>
                {pharmacies.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedShopFilter(s.id === selectedShopFilter ? null : s.id); setViewMode("medicines"); }}
                    className={`w-full text-left flex items-center justify-between py-1.5 px-2 rounded-lg text-xs transition-colors ${
                      selectedShopFilter === s.id ? "bg-teal-500/20 text-teal-300 font-bold" : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <span className="truncate">{s.name}</span>
                    <span className="flex items-center gap-1 text-amber-400 shrink-0 ml-2">
                      <Star className="w-3 h-3 fill-amber-400" />{s.rating || "5.0"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content area */}
          <main>
            {/* Header with results count and active sort mode indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <p className="text-slate-300 font-semibold">
                  <span className="text-white font-black text-lg">
                    {viewMode === "medicines" ? matches.length : shopsList.length}
                  </span>{" "}
                  {viewMode === "medicines" ? "medicines found" : "verified shops found"}
                </p>
                <p className="text-xs text-slate-500">
                  Categorized by: <strong className="text-teal-400">{sortBy === "nearest" ? "📍 Nearest Location First" : "💰 Lowest Price First"}</strong>
                  {customerLocation && " · GPS distance active"}
                </p>
              </div>

              {viewMode === "medicines" && (
                <button
                  onClick={() => setViewMode("shops")}
                  className="text-xs font-bold text-teal-300 hover:text-white flex items-center gap-1 self-start sm:self-auto"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Switch to Shop view</span>
                </button>
              )}
            </div>

            {/* View Mode: Browse by Medicines */}
            {viewMode === "medicines" && (
              matches.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <Pill className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 font-semibold">No medicines match these filters</p>
                  <p className="text-slate-600 text-sm mt-1">Try adjusting your search query, price limit, or clear the store filter</p>
                  {selectedShopFilter && (
                    <button onClick={() => setSelectedShopFilter(null)} className="btn-glow mt-4 text-xs">
                      Clear Store Filter
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((item, idx) => (
                    <div key={item.id} style={{ animationDelay: `${idx * 40}ms` }}>
                      <MedicineCard
                        item={item}
                        store={item.store}
                        onAdd={addToCart}
                        onView={setSelectedMedicine}
                        inCart={cart.some(c => c.id === item.id)}
                      />
                    </div>
                  ))}
                </div>
              )
            )}

            {/* View Mode: Browse by Shops (Section option of shop) */}
            {viewMode === "shops" && (
              shopsList.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 font-semibold">No pharmacies found matching your search</p>
                  <p className="text-slate-600 text-sm mt-1">Try searching by pharmacy name, area, or city</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {shopsList.map((shop) => (
                    <ShopCard
                      key={shop.id}
                      shop={shop}
                      onSelectShop={(id) => {
                        setSelectedShopFilter(id);
                        setViewMode("medicines");
                      }}
                    />
                  ))}
                </div>
              )
            )}
          </main>
        </div>
      </div>

      {selectedMedicine && <MedicineDetailsModal item={selectedMedicine} onClose={() => setSelectedMedicine(null)} onAdd={addToCart} inCart={cart.some(c => c.id === selectedMedicine.id)} />}

      {/* Cart Sidebar */}
      {showCart && (
        <CartSidebar
          cart={cart}
          onClose={() => setShowCart(false)}
          onChangeQty={changeQty}
          onRemove={id => setCart(prev => prev.filter(r => r.id !== id))}
          onCheckout={() => { setShowCart(false); setShowCheckout(true); }}
        />
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          onClose={() => setShowCheckout(false)}
          onConfirm={placeOrder}
          isLoading={isCheckingOut}
        />
      )}

      {/* Floating cart button on mobile */}
      {cartCount > 0 && !showCart && (
        <button onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-white shadow-2xl animate-scale-in"
          style={{ background: "linear-gradient(135deg,#0D9488,#0891B2)", boxShadow: "0 8px 32px rgba(13,148,136,0.5)" }}>
          <ShoppingCart className="w-5 h-5" />
          {cartCount} item{cartCount > 1 ? "s" : ""} · {money(cartTotal)}
        </button>
      )}
    </div>
  );
}
