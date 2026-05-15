import express from "express";
import { createVerification, verifyOtp } from "../controllers/VerificationController.js";

const router = express.Router();

router.post("/create", createVerification);
router.post("/verify", verifyOtp);

export default router;