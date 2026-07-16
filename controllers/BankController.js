import Bank from "../models/BankModel.js";
import User from "../models/AccountModel.js";
import Customer from "../models/CustomerModel.js";

export const createBank = async (req, res) => {
  try {
    const { name, address, managerId } = req.body;

    // 1. Create bank
    const newBank = new Bank({
      name,
      address,
      managerId
    });

    const savedBank = await newBank.save();

    // 2. Update manager (Account collection)
    const updatedManager = await User.findByIdAndUpdate(
      managerId,
      {
        bankId: savedBank._id,
        role: "Manager" // optional safety
      },
      { new: true }
    );

    if (!updatedManager) {
      console.log("updatedManager",updatedManager)
      return res.status(404).json({
        message: "Manager not found"
      });
    }

    // 3. Response
    res.status(201).json({
      message: "Bank created and manager linked successfully",
      bank: savedBank,
      manager: updatedManager
    });

  } catch (error) {
    res.status(500).json({
      message: "Error creating bank",
      error: error.message
    });
  }
};
// --- Retrieve All Banks (with Manager details) ---
export const getAllBanks = async (req, res) => {
  try {
    // .populate('managerId') pulls the Manager's name/email instead of just showing the ID
    const banks = await Bank.find().populate("managerId", "name email active");
    res.status(200).json(banks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching banks", error: error.message });
  }
};

// --- Get a Single Bank by ID ---
export const getBankById = async (req, res) => {
  try {
    const bank = await Bank.findById(req.params.id).populate("managerId", "name email");
    if (!bank) return res.status(404).json({ message: "Bank not found" });

    res.status(200).json(bank);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bank", error: error.message });
  }
};

// --- Edit/Update Bank Details ---
export const updateBank = async (req, res) => {
  try {
    const { name, address, managerId } = req.body;

    const updatedBank = await Bank.findByIdAndUpdate(
      req.params.id,
      { name, address, managerId },
      { new: true, runValidators: true } // new: true returns the modified document
    );

    if (!updatedBank) return res.status(404).json({ message: "Bank not found" });

    res.status(200).json({ message: "Bank updated successfully", bank: updatedBank });
  } catch (error) {
    res.status(500).json({ message: "Error updating bank", error: error.message });
  }
};

// --- Delete a Bank ---
export const deleteBank = async (req, res) => {
  try {
    const bank = await Bank.findByIdAndDelete(req.params.id);
    if (!bank) return res.status(404).json({ message: "Bank not found" });

    res.status(200).json({ message: "Bank deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting bank", error: error.message });
  }
};



export const getSystemStats = async (req, res) => {
  try {
    console.log("📊 System stats API hit");

    const totalBanks = await Bank.countDocuments();
    const totalCashiers = await User.countDocuments({ role: "Cashier" });
    const totalCustomers = await Customer.countDocuments();

    console.log({ totalBanks, totalCashiers, totalCustomers });

    res.status(200).json({
      success: true,
      data: {
        banks: totalBanks,
        cashiers: totalCashiers,
        customers: totalCustomers,
      },
    });

  } catch (error) {
    console.error("❌ Error in system stats:", error); // VERY IMPORTANT
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};