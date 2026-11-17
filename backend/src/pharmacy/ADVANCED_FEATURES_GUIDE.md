# Shop Owner Advanced Management Guide

## 🌟 New Features Overview

### 1. **Pharmacy Location & Tracking** 📍
Owners can now set their exact pharmacy location using an interactive Google Maps interface. This ensures the pharmacy is trackable and correctly positioned for customers.

- **Interactive Map**: Drag a marker to pin the exact location.
- **Google Search Integration**: Search for addresses using the built-in search bar.
- **Current Location**: One-click button to get the current GPS coordinates.
- **Reverse Geocoding**: Automatically converts coordinates into a readable address.
- **Persistence**: Saves location, coordinates, and address to the account.

### 2. **Medicine Image Upload** 🖼️
Medicines can now be visually identified, making it easier for owners to manage and for customers to recognize products.

- **Gallery Upload**: Upload images directly from the device gallery.
- **Real-time Preview**: Immediate visual confirmation of the uploaded image.
- **Image Management**: Ability to change or remove images during editing.
- **Visual Inventory**: The inventory table now displays small thumbnails of each medicine.

### 3. **Pharmacy Branding** 🏢
A dedicated "Pharmacy Details" section allows owners to manage their professional identity.
- **Name Management**: Set and update the public-facing pharmacy name.
- **Integrated Setup**: Combined location and naming setup in a single modal.

---

## 🛠️ How to Use

### **Setting Up Your Pharmacy Location**
1. Click the **"Pharmacy Details"** button in the dashboard header.
2. Enter your **Pharmacy Name**.
3. Click **"Pick Location"**.
4. Use the map to:
   - Search for your area.
   - Drag the marker to your exact front door.
   - Or use the "current location" button.
5. Click **"Confirm Location"** $\rightarrow$ **"Save Details"**.

### **Adding Medicine with Images**
1. Go to the **Inventory** tab.
2. Search for a medicine and select it.
3. Click the **"Upload Image"** button to select a photo from your gallery.
4. Fill in the batch, expiry, and pricing details.
5. Save the medicine.

---

## ⚙️ Technical Implementation

### **Location Services**
- **API**: Google Maps JavaScript API with `places` library.
- **Components**: `LocationPicker.jsx` manages map state, marker dragging, and geocoding.
- **Storage**: Coordinates (lat/lng) and formatted addresses are stored in `localStorage` for persistence.

### **Image Handling**
- **Component**: `ImageUpload.jsx` handles file selection and validation.
- **Validation**: Restricts uploads to image types only and limits size to 5MB.
- **Preview**: Uses `FileReader` to generate base64 previews for instant UI feedback.
- **Storage**: Images are mapped to inventory IDs in `localStorage` for fast retrieval and display in the table.

### **User Interface Improvements**
- **Header Actions**: New "Pharmacy Details" trigger for quick setup.
- **Enriched Table**: Added an "Image" column to the inventory table.
- **Responsive Forms**: Integrated a a seamless flow between searching, uploading, and pricing.

---

## 📋 Quick Reference Table

| Action | Where to find it | Result |
|---|---|---|
| **Set Location** | Header $\rightarrow$ Pharmacy Details | Map coordinate & address saved |
| **Add Image** | Inventory $\rightarrow$ Add Medicine form | Visual thumbnail added to item |
| **Update Name** | Header $\rightarrow$ Pharmacy Details | Public pharmacy name updated |
| **Verify Map** | LocationPicker $\rightarrow$ Confirm | Exact GPS pinpoint on map |

---
**Last Updated**: July 2026
**Version**: 2.1 (Advanced Features Edition)
