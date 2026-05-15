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

router.post(
  "/",
  upload.fields([
    { name: "signature", maxCount: 1 },
    { name: "profilePicture", maxCount: 1 },
    { name: "cnicFront", maxCount: 1 },
    { name: "cnicBack", maxCount: 1 }
  ]),
  createCustomer
); 
router.get("/customers", getAllCustomers);
router.get("/branch/:bankId", getCustomersByBank); // Get all for a branch
router.get("/:id", getCustomerById);               // Get one specific
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);
router.post("/login", customerLogin);
router.get("/dashboard/:id", getCustomerDashboardData);


export default router;