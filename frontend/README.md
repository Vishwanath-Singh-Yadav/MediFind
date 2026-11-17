# MediFind Frontend — Client Application

The MediFind frontend is built with React, styled using Tailwind CSS, and bundled with Vite. It connects to the backend API exclusively through a centralized API client layer.

> [!CAUTION]
> **Security Policy**: This folder must never contain raw API endpoint strings outside the `api-client` layer, for security reasons.

---

## App Structure & Views

The application is structured as a React Single Page Application (SPA). The UI elements are located as follows:
* `src/main.jsx`: The primary entrypoint. It manages workspace views (Browse shop, Customer portal, Pharmacy view, Admin overview) and handles layout rendering.
* `src/components/ui.jsx`: Reusable, atomic design system components (buttons, input fields, cards, select dropdowns, custom badges, and empty states).
* `src/lib/api-client.js`: The centralized API Client Module containing all endpoint routes and method actions.
* `src/lib/utils.js`: Core helpers such as currency formatting and style joining helpers.

---

## State Management Approach

MediFind handles UI state locally using React hooks:
1. **Local State (`useState`)**: Used for managing query keywords, price limits, cart items, selected options, prescription files, active view stages, and tracking details.
2. **Derived State (`useMemo`)**: Computes matches from search parameters dynamically.
3. **Session Cache (`localStorage`)**: Persists authentication tokens (`accessToken`, `refreshToken`) and active medical store configurations (`shopId`) so sessions persist across refreshes.

---

## API Client Layer & Adding a New Endpoint

The frontend is insulated from route pathways via `src/lib/api-client.js`. 

### How to invoke an API:
Import the client and call the nested methods:
```javascript
import { apiClient } from "./lib/api-client";

// Example call:
apiClient.commerce.getCart()
  .then(cart => console.log("Loaded Cart:", cart))
  .catch(err => alert("Error: " + err.message));
```

### Adding a new API call:
To add a new endpoint, open [client/src/lib/api-client.js](file:///c:/Users/vishwanath_cse/Documents/New%20project/client/src/lib/api-client.js) and register your method under the relevant controller namespace:
```javascript
export const apiClient = {
  // ... existing definitions
  commerce: {
    // ...
    newAction: (payload) => request("/commerce/new-endpoint-path", { method: "POST", body: JSON.stringify(payload) })
  }
};
```
*Never reference `/api/v1/...` strings directly in any React component.*

---

## Environment Variables

The client should not rely on browser-exposed secrets.
* API requests use the same origin via `/api/v1`.
* Local development can proxy `/api` to the backend through the Vite dev server.

No private API secrets or client secrets are allowed in this package.

---

## Development Commands

Run these commands inside the `client/` folder:
* **Install dependencies**: `pnpm install`
* **Run development server**: `pnpm dev`
* **Build production package**: `pnpm build`
* **Preview build package**: `pnpm preview`
