# Shop Owner Inventory Management - Technical Implementation Guide

## System Architecture

```
Frontend (React/Vite)
├── ShopOwnerDashboard Component
├── Medicine Search Integration
└── Real-time Inventory Updates
    ↓
API Layer (Express)
├── GET /inventory/store/:storeId - Fetch inventory
├── POST /inventory/store/:storeId - Add medicine
├── PATCH /inventory/:id - Update medicine
└── DELETE /inventory/:id - Remove medicine
    ↓
Database (PostgreSQL + Prisma)
├── MedicalStore (Shop info)
├── Inventory (Store-Medicine mapping)
├── Medicine (Medicine database)
└── User (Shop owner info)
```

## Component Structure

### Frontend
- **ShopOwnerDashboard.jsx**: Main dashboard component
  - Medicine search functionality
  - Add/edit medicine form
  - Inventory table with actions
  - Statistics dashboard

### API Client Updates
- Enhanced `apiClient.inventory` with full CRUD operations
- Support for all inventory management actions

## Required Setup

### 1. Database (Already in Prisma Schema)

**Key Models:**
```prisma
model MedicalStore {
  id String @id @default(cuid())
  ownerId String
  name String
  // ... other fields
  inventory Inventory[]
}

model Inventory {
  id String @id @default(cuid())
  storeId String
  medicineId String
  batchNumber String
  expiryDate DateTime
  price Decimal
  mrp Decimal
  stock Int
  discountPct Decimal
}

model Medicine {
  id String @id @default(cuid())
  brandName String
  genericName String
  manufacturer String
  category String
  dosageForm String
  // ... other fields
}
```

### 2. Backend Routes (`inventory.v2.routes.js`)

Routes already configured with:
- Role-based access control (PHARMACY_OWNER, PHARMACY_MANAGER, PHARMACIST, ADMIN)
- Store ownership verification
- Proper error handling
- Input validation

### 3. Frontend Components

**ShopOwnerDashboard.jsx Features:**
- Real-time medicine search with debouncing
- Form validation
- Inventory listing with sorting
- Edit/delete functionality
- Statistics dashboard

## Authentication & Authorization

### Required Roles
- `PHARMACY_OWNER`: Can manage their own stores
- `PHARMACY_MANAGER`: Can manage assigned stores
- `PHARMACIST`: Can view and manage inventory
- `ADMIN`: Full access

### Access Control
```javascript
// Store ownership check
if (req.user.role !== "ADMIN" && store.ownerId !== req.user.id) {
  throw new HttpError(403, "You do not have access to this inventory.");
}
```

## Workflow

### Adding a Medicine

1. **Frontend**: User searches for medicine
   ```javascript
   const results = await apiClient.medicines.list({ q: "dolo", limit: 10 });
   ```

2. **Backend**: Search medicine database
   ```javascript
   GET /api/v1/medicines?q=dolo&limit=10
   ```

3. **Frontend**: User fills form and submits
   ```javascript
   const formData = {
     medicineId: "med-123",
     batchNumber: "BATCH001",
     expiryDate: "2025-12-31",
     price: 28,
     mrp: 34,
     stock: 100,
     discountPct: 17.65
   };
   ```

4. **Backend**: Create inventory entry
   ```javascript
   POST /api/v1/inventory/store/:storeId
   
   // Validation
   - Medicine exists
   - Expiry date > now
   - Price > 0
   - Stock >= 0
   - Unique batch per store
   
   // Create
   const inventory = await prisma.inventory.create({
     data: { ...formData, storeId }
   });
   ```

5. **Frontend**: Update inventory list
   ```javascript
   await loadInventory(); // Refresh list
   ```

### Updating a Medicine

Similar flow but with:
- Existing inventory item validation
- Partial updates allowed
- Ownership verification

### Deleting a Medicine

1. User clicks delete
2. Confirmation dialog
3. DELETE request to API
4. Item removed from database
5. Inventory list refreshed

## Error Handling

### Frontend
```javascript
try {
  // API call
  await apiClient.inventory.addMedicineToStore(shopId, formData);
  alert("Medicine added successfully!");
  loadInventory();
} catch (error) {
  alert(`Error: ${error.message}`);
}
```

### Backend
```javascript
// Validation error
if (!medicine) throw new HttpError(404, "Medicine not found.");

// Authorization error
if (req.user.role !== "ADMIN" && store.ownerId !== req.user.id)
  throw new HttpError(403, "You do not have access to this inventory.");

// Business logic error
if (nextStock < 0) throw new HttpError(400, "Stock cannot go below zero.");
```

## Testing the Implementation

### 1. Manual Testing

**Setup:**
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Login as pharmacy owner
4. Navigate to "pharmacy" workspace

**Test Cases:**
- Search and add medicine ✓
- Edit medicine details ✓
- Update price and stock ✓
- Delete medicine ✓
- View inventory stats ✓

### 2. API Testing (curl)

```bash
# Get inventory
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/v1/inventory/store/store-123

# Add medicine
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "medicineId": "med-123",
    "batchNumber": "BATCH001",
    "expiryDate": "2025-12-31",
    "price": 28,
    "mrp": 34,
    "stock": 100,
    "discountPct": 17.65
  }' \
  http://localhost:3000/api/v1/inventory/store/store-123

# Update medicine
curl -X PATCH \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"price": 26, "stock": 95}' \
  http://localhost:3000/api/v1/inventory/inv-123

# Delete medicine
curl -X DELETE \
  -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/v1/inventory/inv-123
```

## Performance Considerations

### Database Optimization
- Index on `storeId` for fast queries
- Index on `medicineId` for lookups
- Unique constraint on `(storeId, medicineId, batchNumber)`

### Frontend Optimization
- Debounced search (300ms)
- Lazy loading inventory list
- Cached medicine search results

### API Optimization
- Proper pagination
- Efficient database queries
- Caching headers set correctly

## Future Enhancements

1. **Batch Operations**
   - Import/export inventory as CSV
   - Bulk price updates

2. **Analytics**
   - Sales trends by medicine
   - Popular medicines in store
   - Stock turnover analysis

3. **Notifications**
   - Low stock alerts
   - Expiry date warnings
   - Price change notifications

4. **Advanced Features**
   - AI-powered inventory forecasting
   - Automated reorder suggestions
   - Integration with suppliers

## Deployment Checklist

- [ ] Backend routes configured in index.js
- [ ] Prisma migrations run
- [ ] Frontend component integrated
- [ ] API client updated
- [ ] Authentication middleware verified
- [ ] Error handling tested
- [ ] Database indexes created
- [ ] Environment variables set
- [ ] CORS configured
- [ ] Rate limiting applied

## Support & Debugging

### Common Issues

1. **"Store not found" error**
   - Verify shopId in localStorage
   - Check user is store owner
   - Verify store exists in database

2. **"Unauthorized" error**
   - Check authentication token
   - Verify user role is PHARMACY_OWNER
   - Check token expiration

3. **"Medicine not found" error**
   - Verify medicineId is correct
   - Search for medicine first
   - Check medicine is active (isActive=true)

### Debug Tips
- Check browser console for frontend errors
- Check backend server logs
- Use API testing tools (Postman, Insomnia)
- Verify database connection
- Check CORS headers

---

**Last Updated**: January 2025
**Author**: Development Team
