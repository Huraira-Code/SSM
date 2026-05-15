import express from "express";
import { createLog, getLogsByBank, getLogsByCashier } from "../controllers/LogController.js";
import upload from "../middlewares/upload.js";
const router = express.Router();

// POST /api/logs
router.post("/",upload.single('signatureImage'), createLog);

// GET /api/logs/bank/:bankId
router.get("/bank/:bankId", getLogsByBank);
router.get("/cashier/:cashierId", getLogsByCashier);

export default router;