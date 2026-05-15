import express from "express";
import { 
  createBank, 
  getAllBanks, 
  getBankById, 
  updateBank, 
  deleteBank, 
  getSystemStats
} from "../controllers/BankController.js";

const router = express.Router();

router.post("/", createBank);
router.get("/", getAllBanks);
router.get("/system-stats/", getSystemStats);

router.get("/:id", getBankById);
router.put("/:id", updateBank);
router.delete("/:id", deleteBank);

export default router;