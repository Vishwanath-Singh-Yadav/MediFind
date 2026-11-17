# Shop Owner Inventory Management Guide

## Overview
This document explains how pharmacy owners can manage their shop's medicines and prices through the Shop Owner Dashboard.

## Features

### 1. **Add Medicines to Your Store**
- Search for medicines from the platform's medicine database
- Set custom prices and discounts for each medicine in your store
- Manage batch numbers and expiry dates
- Track stock quantities

### 2. **Manage Inventory**
- View all medicines in your store with details
- Edit prices, stock quantities, and discounts
- Remove medicines from your store
- Monitor inventory value and total stock

### 3. **Pricing Control**
- Set custom selling prices for each medicine
- Define MRP (Maximum Retail Price)
- Apply batch-specific discounts
- Track profit margins

## Accessing the Shop Owner Dashboard

1. **Login as Pharmacy Owner**
   - Use your pharmacy owner credentials
   - Navigate to the "pharmacy" workspace from the top navigation

2. **Dashboard Location**
   - Frontend: Click "pharmacy" button in the header
   - Direct access: `/pharmacy-dashboard` (when authenticated as PHARMACY_OWNER)

## How to Use

### Adding a New Medicine

1. **Search for Medicine**
   - Use the search box in the "Add Medicine" form
   - Type medicine brand name, generic name, or category
   - Select the medicine from search results

2. **Fill Medicine Details**
   - **Batch Number**: Unique identifier for the medicine batch (e.g., BATCH001)
   - **Expiry Date**: Must be a future date
   - **MRP (₹)**: Maximum Retail Price
   - **Selling Price (₹)**: Your store's selling price
   - **Discount (%)**: Optional discount percentage
   - **Stock Quantity**: Number of units available

3. **Submit**
   - Click "Add Medicine" button
   - Confirmation message will appear
   - Medicine will be added to your inventory

### Editing Medicine Details

1. Click the **Edit** (pencil) icon next to any medicine
2. Modify any field:
   - Batch Number
   - Expiry Date
   - Prices
   - Stock Quantity
3. Click **"Update"** to save changes

### Removing a Medicine

1. Click the **Delete** (trash) icon next to any medicine
2. Confirm the deletion
3. Medicine will be removed from your inventory

### Monitoring Your Inventory

The dashboard displays:
- **Total Medicines**: Number of unique medicines in your store
- **Total Stock**: Combined quantity of all medicines
- **Inventory Value**: Total worth of all medicines in stock

## API Endpoints

### Get Store Inventory
```
GET /api/v1/inventory/store/:storeId
Response: Array of inventory items
```

### Add Medicine to Store
```
POST /api/v1/inventory/store/:storeId
Body:
{
  "medicineId": "med-id",
  "batchNumber": "BATCH001",
  "expiryDate": "2025-12-31",
  "price": 299.99,
  "mrp": 350.00,
  "stock": 50,
  "discountPct": 14.3
}
```

### Update Inventory Item
```
PATCH /api/v1/inventory/:inventoryId
Body: (any field to update)
{
  "price": 299.99,
  "stock": 45,
  "discountPct": 15
}
```

### Delete Inventory Item
```
DELETE /api/v1/inventory/:inventoryId
```

## Data Structure

### Inventory Item
```javascript
{
  id: "inv-id",
  storeId: "store-id",
  medicineId: "medicine-id",
  medicine: {
    id: "medicine-id",
    brandName: "Dolo",
    genericName: "Paracetamol",
    manufacturer: "Micro Labs",
    category: "Fever & Pain",
    dosageForm: "Tablet",
    strength: "650mg",
    requiresPrescription: false
  },
  batchNumber: "BATCH2024",
  expiryDate: "2025-12-31T00:00:00Z",
  price: 28.00,
  mrp: 34.00,
  stock: 150,
  discountPct: 17.65,
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z"
}
```

## Best Practices

### Pricing Strategy
- **Set Competitive Prices**: Check competitor prices to stay competitive
- **Volume Discounts**: Consider offering discounts on bulk purchases
- **Seasonal Variations**: Adjust prices based on demand patterns

### Stock Management
- **Monitor Low Stock**: Regular check medicines with low quantities
- **Batch Management**: Keep track of different batches separately
- **Expiry Date Tracking**: Remove expired medicines promptly

### Store Optimization
- **Popular Medicines**: Stock best-selling medicines with adequate quantity
- **Prescription Medicines**: Ensure required verification for prescription-only medicines
- **Regular Updates**: Keep prices and stock information current

## Troubleshooting

### Medicine Not Found in Search
- Try searching with different keywords (brand name, generic name, symptom)
- Check medicine spelling
- Search results are limited to active medicines in the platform

### Cannot Add Medicine
- Ensure all required fields are filled
- Expiry date must be in the future
- Price must be a positive number
- Stock quantity must be zero or positive

### Inventory Changes Not Saving
- Check internet connection
- Try refreshing the page
- Verify you're logged in as the store owner
- Check browser console for error messages

## Contact & Support

For issues or feature requests:
- Contact the platform support team
- Email: support@medora.com
- In-app chat support available during business hours

---

**Last Updated**: January 2025
