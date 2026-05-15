import express from "express";
import { createAccount, getAllManagers, getCashiersByBank, signIn } from "../controllers/AccountController.js";
import { getAllCustomers } from "../controllers/CustomerController.js";
import upload from "../middlewares/upload.js";
const router = express.Router();

router.post("/register",upload.single('signatureImage'), createAccount);
router.post("/login", signIn);
router.get("/cashiers/:bankId", getCashiersByBank);
router.get("/managers", getAllManagers);
export default router;