import React, { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Edit2, Search, Loader, Image as ImageIcon, Check, Building2, MapPin, Phone, User, ShieldCheck, Clock, ExternalLink } from "lucide-react";
import { Input, Button, Card, Select, Badge } from "./ui";
import { ImageUpload } from "./ImageUpload";
import { apiClient } from "../lib/api-client";
import { formatDateDDMMYYYY, formatDateInput, toISODate } from "../lib/date-format";

export default function ShopOwnerDashboard({ shopId, shopName, ownerName = "", store = null, onEditStore }) {
  const [inventory, setInventory] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const medicineImagePickerRef = useRef(null);

  // Form state for adding/editing medicine
  const [formData, setFormData] = useState({
    medicineId: "",
    medicineName: "",
    genericName: "",
    manufacturer: "",
    strength: "",
    requiresPrescription: false,
    category: "",
    dosageForm: "",
    batchNumber: "",
    expiryDate: "",
    price: "",
    mrp: "",
    stock: "",
    discountPct: ""
  });

  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [lowStockThreshold, setLowStockThreshold] = useState(20);
  
  // Pharmacy details state
  const [showPharmacyDetails, setShowPharmacyDetails] = useState(false);
  const [pharmacyDetails, setPharmacyDetails] = useState({
    name: localStorage.getItem("shopName") || "My Pharmacy",
    ownerName: localStorage.getItem("shopOwnerName") || ownerName,
    location: JSON.parse(localStorage.getItem("shopLocation") || "null") || null,
    address: localStorage.getItem("shopAddress") || "",
  });

  // Medicine image state
  const [medicineImages, setMedicineImages] = useState([]);

  // Load inventory
  useEffect(() => {
    loadInventory();
  }, [shopId]);

  const loadInventory = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.inventory.getStoreInventory(shopId);
      setInventory(data || []);
    } catch (error) {
      console.error("Error loading inventory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchMedicine = async (event) => {
    event?.preventDefault();
    const query = searchQuery.trim();
    if (query.length < 2) return;
    try {
      setIsSearching(true);
      setHasSearched(true);
      setSearchResults((await apiClient.medicines.list({ q: query, limit: 10 })) || []);
    } catch (error) {
      setSearchResults([]);
      console.error("Error searching medicines:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Get alerts
  const getLowStockItems = () => {
    return inventory.filter(item => item.stock <= lowStockThreshold).sort((a, b) => a.stock - b.stock);
  };

  const getExpiryWarnings = () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return inventory.filter(item => {
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= thirtyDaysFromNow && expiryDate > now;
    }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  };

  const getExpiredItems = () => {
    const now = new Date();
    return inventory.filter(item => new Date(item.expiryDate) <= now);
  };

  const handleAddMedicine = (medicine) => {
    const existingItem = inventory.find((item) => item.medicineId === medicine.id);
    if (existingItem) {
      handleEditMedicine(existingItem);
      setSearchQuery("");
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setSelectedMedicine(medicine);
    setFormData({
      medicineId: medicine.id,
      medicineName: medicine.brandName,
      genericName: medicine.genericName || "",
      manufacturer: medicine.manufacturer || "",
      strength: medicine.strength || "",
      requiresPrescription: medicine.requiresPrescription || false,
      category: medicine.category || "",
      dosageForm: medicine.dosageForm || "",
      batchNumber: "",
      expiryDate: "",
      price: "",
      mrp: "",
      stock: "",
      discountPct: ""
    });
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setShowMedicineForm(true);
  };

  const handleCreateMedicine = () => {
    const name = searchQuery.trim();
    if (name.length < 2) return;
    setFormData((current) => ({ ...current, medicineId: "", medicineName: name, genericName: name, manufacturer: "", strength: "", category: "", dosageForm: "" }));
    setSelectedMedicine(null);
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setShowMedicineForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: name === "expiryDate" ? formatDateInput(value) : value };
      if (name === "mrp" || name === "price") {
        const mrp = Number(name === "mrp" ? value : prev.mrp);
        const price = Number(name === "price" ? value : prev.price);
        next.discountPct = mrp > 0 && price >= 0
          ? Math.min(100, Math.max(0, (((mrp - price) / mrp) * 100))).toFixed(2)
          : "";
      }
      return next;
    });
  };

  const handlePharmacyDetailsChange = (e) => {
    const { name, value } = e.target;
    setPharmacyDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (location) => {
    setPharmacyDetails(prev => ({
      ...prev,
      location: { lat: location.lat, lng: location.lng },
      address: location.address,
    }));
    // Save to localStorage
    localStorage.setItem("shopLocation", JSON.stringify({ lat: location.lat, lng: location.lng }));
    localStorage.setItem("shopAddress", location.address);
  };

  const handleImageSelect = async (imageData) => {
    if (imageData?.removeIndex !== undefined) {
      const removed = medicineImages[imageData.removeIndex];
      if (removed?.id && editingId) await apiClient.inventory.removeImage(editingId, removed.id);
      setMedicineImages((current) => current.filter((_, index) => index !== imageData.removeIndex));
      return;
    }
    if (Array.isArray(imageData)) setMedicineImages((current) => [...current, ...imageData]);
  };

  const savePharmacyDetails = async () => {
    if (!pharmacyDetails.name.trim()) {
      alert("Please enter pharmacy name");
      return;
    }
    if (!pharmacyDetails.ownerName.trim()) {
      alert("Please enter owner name");
      return;
    }
    if (!pharmacyDetails.location) {
      alert("Please select location from map");
      return;
    }
    
    try {
      setIsLoading(true);
      await apiClient.pharmacies.updateStore(shopId, {
        name: pharmacyDetails.name,
        ownerName: pharmacyDetails.ownerName,
        address: pharmacyDetails.address,
        location: pharmacyDetails.location
      });
      
      localStorage.setItem("shopName", pharmacyDetails.name);
      localStorage.setItem("shopOwnerName", pharmacyDetails.ownerName);
      localStorage.setItem("shopLocation", JSON.stringify(pharmacyDetails.location));
      localStorage.setItem("shopAddress", pharmacyDetails.address);
      alert("Pharmacy details saved to database!");
    } catch (error) {
      console.error("Error saving pharmacy details:", error);
      alert("Failed to save details: " + error.message);
    } finally {
      setIsLoading(false);
      setShowPharmacyDetails(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    const expiryDate = toISODate(formData.expiryDate);
    if (!formData.medicineName.trim() || !formData.genericName.trim() || !formData.manufacturer.trim() || !formData.category.trim() || !formData.dosageForm.trim() || !formData.batchNumber || !expiryDate || !formData.price || formData.stock === "") {
      alert("Please fill all required fields");
      return;
    }
    if (!medicineImages.length) {
      alert("Please upload an image of the medicine");
      return;
    }

    try {
      setIsAdding(true);
      let medicineId = formData.medicineId;
      if (!medicineId) {
        const medicine = await apiClient.medicines.create({
          brandName: formData.medicineName.trim(),
          genericName: formData.genericName.trim(),
          manufacturer: formData.manufacturer.trim(),
          category: formData.category.trim(),
          dosageForm: formData.dosageForm.trim(),
          strength: formData.strength.trim() || undefined,
          requiresPrescription: formData.requiresPrescription
        });
        medicineId = medicine.id;
      } else {
        await apiClient.medicines.update(medicineId, {
          brandName: formData.medicineName.trim(),
          genericName: formData.genericName.trim(),
          manufacturer: formData.manufacturer.trim(),
          category: formData.category.trim(),
          dosageForm: formData.dosageForm.trim(),
          strength: formData.strength.trim() || undefined,
          requiresPrescription: formData.requiresPrescription
        });
      }
      const inventoryData = { ...formData, medicineId, expiryDate };
      delete inventoryData.medicineName;
      delete inventoryData.category;
      delete inventoryData.dosageForm;
      
      if (editingId) {
        await apiClient.inventory.updateInventoryItem(editingId, inventoryData);
        const newImages = medicineImages.filter((image) => image.file).map((image) => image.file);
        if (newImages.length) await apiClient.inventory.uploadImages(editingId, newImages);
        alert("Medicine updated successfully!");
        setEditingId(null);
      } else {
        const response = await apiClient.inventory.addMedicineToStore(shopId, inventoryData);
        const newImages = medicineImages.filter((image) => image.file).map((image) => image.file);
        if (newImages.length && response?.id) await apiClient.inventory.uploadImages(response.id, newImages);
        alert("Medicine added successfully!");
      }

      setFormData({
        medicineId: "",
        medicineName: "",
        genericName: "",
        manufacturer: "",
        strength: "",
        requiresPrescription: false,
        category: "",
        dosageForm: "",
        batchNumber: "",
        expiryDate: "",
        price: "",
        mrp: "",
        stock: "",
        discountPct: ""
      });
      setSelectedMedicine(null);
      setMedicineImages([]);
      setShowMedicineForm(false);
      loadInventory();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditMedicine = (item) => {
    setFormData({
      medicineId: item.medicineId,
      medicineName: item.medicine?.brandName || "",
      genericName: item.medicine?.genericName || "",
      manufacturer: item.medicine?.manufacturer || "",
      strength: item.medicine?.strength || "",
      requiresPrescription: item.medicine?.requiresPrescription || false,
      category: item.medicine?.category || "",
      dosageForm: item.medicine?.dosageForm || "",
      batchNumber: item.batchNumber,
      expiryDate: formatDateDDMMYYYY(item.expiryDate),
      price: item.price,
      mrp: item.mrp || "",
      stock: item.stock,
      discountPct: item.discountPct || ""
    });
    setMedicineImages((item.images || []).map((image) => ({ id: image.id, url: image.imageUrl })));
    setEditingId(item.id);
    setSelectedMedicine(item.medicine);
    setShowMedicineForm(true);
  };

  const handleDeleteMedicine = async (id) => {
    if (!window.confirm("Are you sure you want to remove this medicine from your store?")) return;

    try {
      await apiClient.inventory.removeFromStore(id);
      alert("Medicine removed successfully!");
      loadInventory();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleCancelForm = () => {
    setFormData({
      medicineId: "",
      medicineName: "",
      genericName: "",
      manufacturer: "",
      strength: "",
      requiresPrescription: false,
      category: "",
      dosageForm: "",
      batchNumber: "",
      expiryDate: "",
      price: "",
      mrp: "",
      stock: "",
      discountPct: ""
    });
    setSelectedMedicine(null);
    setEditingId(null);
    setMedicineImages([]);
    setShowMedicineForm(false);
  };

  const startAddingMedicine = () => {
    if (selectedMedicine || editingId) {
      handleCancelForm();
    }
    setShowMedicineForm(true);
  };

  // Analytics data
  const getAnalyticsData = () => {
    const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.stock), 0);
    const avgPrice = inventory.length ? (inventory.reduce((sum, item) => sum + item.price, 0) / inventory.length) : 0;
    const totalSavings = inventory.reduce((sum, item) => {
      const discount = item.mrp ? (item.mrp - item.price) * item.stock : 0;
      return sum + discount;
    }, 0);

    const categories = {};
    inventory.forEach(item => {
      const cat = item.medicine?.category || "Other";
      if (!categories[cat]) categories[cat] = { count: 0, value: 0, stock: 0 };
      categories[cat].count += 1;
      categories[cat].value += item.price * item.stock;
      categories[cat].stock += item.stock;
    });

    return { totalValue, avgPrice, totalSavings, categories };
  };

  return (
    <div className="min-h-screen bg-[#080E1A] p-4 md:p-8 text-slate-100 animate-fade-up">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-2">
              <span className="gradient-text">{shopName}</span>
              <span className="text-slate-500 text-lg font-medium">· Dashboard</span>
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Manage medicines, prices, expiry dates, stock, and customer availability</p>
          </div>
          {onEditStore && (
            <button
              onClick={onEditStore}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-violet-200 hover:text-white transition-all flex items-center gap-2"
              style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)" }}
            >
              <Building2 className="w-4 h-4 text-violet-400" />
              <span>Update Shop Details & Location</span>
            </button>
          )}
        </div>

        {/* Shop Profile & Location Card */}
        {store && (
          <div className="mb-8 rounded-3xl p-6 border border-slate-800 bg-slate-900/40 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Storefront Image */}
              <div className="w-24 h-24 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                {localStorage.getItem(`shopImage_${shopId}`) || store.imageUrl ? (
                  <img src={localStorage.getItem(`shopImage_${shopId}`) || store.imageUrl} alt={shopName} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-10 h-10 text-violet-400/60" />
                )}
              </div>

              {/* Shop & Owner Details */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-black text-white">{store.name || shopName}</h2>
                  <span className="badge-indigo text-xs">Reg: {store.licenseNumber || "N/A"}</span>
                  {store.gstNumber && <span className="badge-teal text-xs">GST: {store.gstNumber}</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="flex items-center gap-2 text-slate-300">
                    <User className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                    <span><b>Owner:</b> {store.owner?.name || ownerName || localStorage.getItem("shopOwnerName") || "Owner"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    <span><b>Contact:</b> {store.owner?.phone || localStorage.getItem("shopOwnerPhone") || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span><b>Hours:</b> {store.openingTime || "09:00"} – {store.closingTime || "21:00"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    <span>{[store.addressLine1, store.addressLine2, store.city, store.state, store.postalCode].filter(Boolean).join(", ") || "Address not configured"}</span>
                  </div>
                  {store.latitude != null && store.longitude != null && (
                    <span className="text-cyan-400 text-[11px] font-mono">
                      (GPS: {Number(store.latitude).toFixed(4)}, {Number(store.longitude).toFixed(4)})
                    </span>
                  )}
                </div>
              </div>

              {/* Edit button */}
              {onEditStore && (
                <button
                  onClick={onEditStore}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Details & Location
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Add/Edit Form */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20 border-slate-800 bg-slate-900/30">
                <div>
                  <h2 className="text-lg font-black text-white mb-4">
                    {editingId ? "Edit Medicine" : "Add Medicine"}
                  </h2>

                  {/* Search for Medicine */}
                  {!selectedMedicine && !editingId && (
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Search Medicine
                      </label>
                      <form onSubmit={handleSearchMedicine} className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type="text"
                            placeholder="Search medicine database..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-full"
                          />
                          <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-600" />
                        </div>
                        <Button type="submit" disabled={isSearching || searchQuery.trim().length < 2} className="shrink-0 px-4">
                          {isSearching ? <Loader className="h-4 w-4 animate-spin" /> : "Search"}
                        </Button>
                      </form>

                      {isSearching && (
                        <div className="mt-2 flex items-center text-xs text-slate-500">
                          <Loader className="w-4 h-4 animate-spin mr-2 text-teal-400" />
                          Searching catalog...
                        </div>
                      )}

                      {searchResults.length > 0 && (
                        <div className="mt-3 space-y-2 max-h-64 overflow-y-auto border border-slate-800 rounded-xl p-2 bg-slate-950/60">
                          {searchResults.map((medicine) => (
                            <button
                              key={medicine.id}
                              onClick={() => handleAddMedicine(medicine)}
                              className="w-full text-left p-2.5 hover:bg-slate-900 rounded-lg transition"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="font-bold text-white text-sm">{medicine.brandName}</div>
                                {inventory.some((item) => item.medicineId === medicine.id) && <span className="text-[10px] text-teal-400">Already added · Edit</span>}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">{medicine.genericName}</div>
                              <div className="text-[10px] text-slate-500 mt-1">{medicine.manufacturer}{medicine.strength ? ` · ${medicine.strength}` : ""}</div>
                            </button>
                          ))}
                        </div>
                      )}
                      {!isSearching && hasSearched && searchResults.length === 0 && (
                        <button type="button" onClick={handleCreateMedicine} className="mt-3 w-full rounded-xl border border-teal-500/40 bg-teal-500/10 p-3 text-left text-sm text-teal-300 hover:bg-teal-500/20">
                          <Plus className="mr-2 inline h-4 w-4" /> No medicine found. Add “{searchQuery.trim()}”
                        </button>
                      )}
                      {!isSearching && hasSearched && searchResults.length > 0 && (
                        <p className="mt-2 text-[11px] text-slate-500">Select a medicine to use it, then review or change its details below.</p>
                      )}
                    </div>
                  )}

                  {(showMedicineForm || selectedMedicine || editingId) && (
                    <>
                      {/* Selected Medicine Display */}
                      {selectedMedicine && <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 mb-4 animate-scale-in">
                        <div className="font-bold text-teal-400 text-sm">{selectedMedicine.brandName}</div>
                        <div className="text-xs text-slate-300 mt-0.5">{selectedMedicine.genericName}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{selectedMedicine.manufacturer}</div>
                      </div>}

                      <form onSubmit={handleSubmitForm} className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Brand name *
                          </label>
                          <Input
                            type="text"
                            name="medicineName"
                            value={formData.medicineName}
                            onChange={handleFormChange}
                            placeholder="e.g., Paracetamol"
                            required
                          />
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Generic name *
                          </label>
                          <Input type="text" name="genericName" value={formData.genericName} onChange={handleFormChange} placeholder="e.g., Acetaminophen" required />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Manufacturer *</label>
                            <Input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleFormChange} placeholder="Company name" required />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Strength</label>
                            <Input type="text" name="strength" value={formData.strength} onChange={handleFormChange} placeholder="e.g., 500 mg" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category *</label>
                            <Input type="text" name="category" value={formData.category} onChange={handleFormChange} placeholder="e.g., Pain relief" required />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Dosage form *</label>
                            <Input type="text" name="dosageForm" value={formData.dosageForm} onChange={handleFormChange} placeholder="e.g., Tablet, Syrup" required />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 text-xs text-slate-400">
                          <input type="checkbox" name="requiresPrescription" checked={formData.requiresPrescription} onChange={(e) => setFormData((current) => ({ ...current, requiresPrescription: e.target.checked }))} />
                          Prescription required
                        </label>
                        {/* Batch Number */}
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Batch Number *
                          </label>
                          <Input
                            type="text"
                            name="batchNumber"
                            value={formData.batchNumber}
                            onChange={handleFormChange}
                            placeholder="e.g., BATCH001"
                            required
                          />
                        </div>

                        {/* Expiry Date */}
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Expiry Date *
                          </label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            maxLength={10}
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleFormChange}
                            placeholder="dd/mm/yyyy"
                            required
                          />
                        </div>

                        {/* MRP */}
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            MRP (₹) *
                          </label>
                          <Input
                            type="number"
                            name="mrp"
                            value={formData.mrp}
                            onChange={handleFormChange}
                            placeholder="0.00"
                            step="0.01"
                            required
                          />
                        </div>

                        {/* Selling Price */}
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Selling Price (₹) *
                          </label>
                          <Input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleFormChange}
                            placeholder="0.00"
                            step="0.01"
                            required
                          />
                        </div>

                        {/* Discount % */}
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Discount (%)
                          </label>
                          <Input
                            type="number"
                            name="discountPct"
                            value={formData.discountPct}
                            placeholder="Calculated automatically"
                            readOnly
                            tabIndex={-1}
                            className="bg-slate-950/60 text-teal-300"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">Calculated from MRP and selling price.</p>
                        </div>

                        {/* Stock */}
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Stock Quantity *
                          </label>
                          <Input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleFormChange}
                            placeholder="0"
                            min="0"
                            required
                          />
                        </div>

                        {/* Medicine Image */}
                        <div className="pt-2">
                          <ImageUpload
                            ref={medicineImagePickerRef}
                            onImageSelect={handleImageSelect}
                            currentImages={medicineImages.map((image) => image.url || image.preview)}
                            label="Medicine Image"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4">
                          <Button
                            type="submit"
                            disabled={isAdding}
                            className="flex-1 btn-glow"
                          >
                            {isAdding ? "Uploading..." : <><Check className="w-4 h-4" /> Done</>}
                          </Button>
                          <Button
                            type="button"
                            onClick={handleCancelForm}
                            variant="secondary"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </Card>
            </div>

            {/* Inventory List */}
            <div className="lg:col-span-2">
              <Card className="border-slate-800 bg-slate-900/30">
                <div>
                  <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-white">Medicines Listed under "{shopName}"</h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        These medicines are visible to nearby customers searching your pharmacy ({inventory.length} items)
                      </p>
                    </div>
                    {!selectedMedicine && !editingId && (
                      <button
                        type="button"
                        onClick={startAddingMedicine}
                        className="btn-glow px-4 py-2 text-sm self-start sm:self-auto"
                      >
                        <Plus className="h-4 w-4" /> Add medicine
                      </button>
                    )}
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-6 h-6 animate-spin text-teal-400" />
                    </div>
                  ) : inventory.length === 0 ? (
                    <div className="text-center py-12">
                      <ImageIcon className="mx-auto mb-4 h-12 w-12 text-slate-700 animate-pulse" />
                      <p className="mb-4 text-slate-400">No medicines added yet.</p>
                      <button
                        type="button"
                        onClick={startAddingMedicine}
                        className="btn-glow px-5 py-2.5 text-sm"
                      >
                        <Plus className="h-4 w-4" /> Add medicine
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="dark-table w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-800">
                            <th className="text-left py-3 px-4 font-bold text-slate-400 text-xs tracking-wider uppercase">Image</th>
                            <th className="text-left py-3 px-4 font-bold text-slate-400 text-xs tracking-wider uppercase">Medicine</th>
                            <th className="text-left py-3 px-4 font-bold text-slate-400 text-xs tracking-wider uppercase">Batch</th>
                            <th className="text-left py-3 px-4 font-bold text-slate-400 text-xs tracking-wider uppercase">Price</th>
                            <th className="text-left py-3 px-4 font-bold text-slate-400 text-xs tracking-wider uppercase">Stock</th>
                            <th className="text-left py-3 px-4 font-bold text-slate-400 text-xs tracking-wider uppercase">Expiry</th>
                            <th className="text-right py-3 px-4 font-bold text-slate-400 text-xs tracking-wider uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventory.map((item) => (
                            <tr key={item.id} className="border-b border-slate-900 hover:bg-slate-900/20 transition-colors">
                              <td className="py-3 px-4">
                                {item.images?.length ? (
                                  <div className="flex items-center gap-1">
                                    <img src={item.images[0].imageUrl} alt={item.medicine?.brandName || "Medicine"} className="w-12 h-12 rounded-xl object-cover border border-slate-800" />
                                    {item.images.length > 1 && <span className="text-[10px] text-teal-400">+{item.images.length - 1}</span>}
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-900">
                                    <ImageIcon className="w-5 h-5 text-slate-600" />
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div>
                                  <div className="font-bold text-white">
                                    {item.medicine?.brandName}
                                  </div>
                                  <div className="text-xs text-slate-400 mt-0.5">
                                    {item.medicine?.genericName}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-slate-300 font-mono text-xs">{item.batchNumber}</td>
                              <td className="py-3 px-4">
                                <div>
                                  <div className="font-bold text-white">
                                    ₹{Number(item.price).toFixed(2)}
                                  </div>
                                  {item.discountPct > 0 && (
                                    <span className="badge-emerald text-[10px] mt-1 inline-block">{item.discountPct}% off</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Badge
                                  tone={item.stock > lowStockThreshold ? "good" : item.stock > 0 ? "warn" : "bad"}
                                >
                                  {item.stock} units
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-slate-400 text-xs">
                                {formatDateDDMMYYYY(item.expiryDate)}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-3">
                                  <button
                                    onClick={() => handleEditMedicine(item)}
                                    className="text-teal-400 hover:text-teal-300 transition-colors p-1"
                                    title={`Edit ${item.medicine?.brandName || "medicine"}`}
                                    aria-label={`Edit ${item.medicine?.brandName || "medicine"}`}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMedicine(item.id)}
                                    className="text-rose-400 hover:text-rose-300 transition-colors p-1"
                                    title={`Delete ${item.medicine?.brandName || "medicine"}`}
                                    aria-label={`Delete ${item.medicine?.brandName || "medicine"}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Stats Summary */}
                  {inventory.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
                      <div className="text-center">
                        <div className="text-2xl font-black text-white">{inventory.length}</div>
                        <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide">Total Brands</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-white">
                          {inventory.reduce((sum, item) => sum + item.stock, 0)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide">Total Units</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-white">
                          ₹{(inventory.reduce((sum, item) => sum + (item.price * item.stock), 0)).toFixed(0)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide">Stock Value</div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
      </div>
    </div>
  );
}
