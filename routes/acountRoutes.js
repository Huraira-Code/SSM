import express from "express";
import {
    createAccount,
    getAllManagers,
    getCashiersByBank,
    signIn,
    updateProfile,       
    toggleAccountStatus
} from "../controllers/AccountController.js";
import { getAllCustomers } from "../controllers/CustomerController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// --- Auth Routes ---
router.post("/register", upload.single('signatureImage'), createAccount);
router.post("/login", signIn);

// --- Profile & Account Management Routes ---
router.patch("/deactivate/:id", toggleAccountStatus); // Using PATCH for partial updates
router.put("/update-profile/:id", upload.single('signatureImage'), updateProfile);

// --- Fetching Routes ---
router.get("/cashiers/:bankId", getCashiersByBank);
router.get("/managers", getAllManagers);

export default router;