import express from "express";
import { 
  createDocumentType, 
  getDocumentsByBank, 
  updateDocumentType, 
  deleteDocumentType 
} from "../controllers/DocumentController.js";

const router = express.Router();

router.post("/", createDocumentType);
router.get("/bank/:bankId", getDocumentsByBank);
router.put("/:id", updateDocumentType);
router.delete("/:id", deleteDocumentType);

export default router;