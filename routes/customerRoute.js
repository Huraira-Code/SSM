import express from "express";
import {
  createCustomer,
  getCustomersByBank,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getAllCustomers,
  customerLogin,
  getCustomerDashboardData
} from "../controllers/CustomerController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Define image upload fields configuration to keep code DRY
const customerUploadFields = upload.fields([
  { name: "signature", maxCount: 1 },
  { name: "profilePicture", maxCount: 1 },
  { name: "cnicFront", maxCount: 1 },
  { name: "cnicBack", maxCount: 1 }
]);

// ─── CREATE CUSTOMER ──────────────────────────────────────────────────────────
router.post("/", customerUploadFields, createCustomer); 

// ─── READ OPERATIONS ──────────────────────────────────────────────────────────
router.get("/customers", getAllCustomers);
router.get("/branch/:bankId", getCustomersByBank); // Get all for a branch
router.get("/:id", getCustomerById);               // Get one specific

// ─── UPDATE CUSTOMER (WITH FILE UPLOADS) ──────────────────────────────────────
router.put("/:id", customerUploadFields, updateCustomer);

// ─── DELETE & AUTH OPERATIONS ─────────────────────────────────────────────────
router.delete("/:id", deleteCustomer);
router.post("/login", customerLogin);
router.get("/dashboard/:id", getCustomerDashboardData);

export default router;