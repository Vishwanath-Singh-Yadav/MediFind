import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import pharmacyRoutes from "./routes/pharmacy.routes.js";
import medicineRoutes from "./routes/medicine.routes.js";
import inventoryRoutes from "./routes/inventory.v2.routes.js";
import commerceRoutes from "./routes/commerce.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { rateLimit, requestContext } from "./middleware/security.js";
import { errorHandler } from "./utils/errors.js";

const app = express();
const port = Number(process.env.PORT || 4000);
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: "http://localhost:5173", // Allow your frontend to connect
  credentials: true
}));
app.use(requestContext);
app.use(rateLimit({ max: Number(process.env.RATE_LIMIT_MAX || 180) }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.get("/health", (_req, res) => res.json({ ok: true, service: "medicine-platform-api" }));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/pharmacies", pharmacyRoutes);
app.use("/api/v1/medicines", medicineRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/commerce", commerceRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use(errorHandler);
app.listen(port, () => console.log(`Medicine Platform API listening on port ${port}`));
