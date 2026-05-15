import Customer from "../models/CustomerModel.js";
import Authorization from "../models/AuthorizationModel.js";
import Log from "../models/LogModel.js";
import jwt from "jsonwebtoken";


export const createCustomer = async (req, res) => {
  try {
    const {
      name,
      address,
      accountType,
      dob,
      cnicNumber,
      password, // 🔥 Destructure password from body
      fatherName,
      fatherCnic,
      motherName,
      motherCnic,
      bankId
    } = req.body;

    // Validate password existence
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    let emails = [];
    if (Array.isArray(req.body.emails)) {
      emails = req.body.emails;
    } else if (typeof req.body.emails === "string") {
      try {
        emails = JSON.parse(req.body.emails);
      } catch {
        emails = [req.body.emails];
      }
    }

    const accountTypeMap = {
      "Savings": "Savings Account",
      "Current": "Current Account",
      "Business": "Business Account",
      "Student": "Student Account"
    };

    const signatureImage = req.files?.signature?.[0]?.path;
    const profilePicture = req.files?.profilePicture?.[0]?.path;
    const cnicFront = req.files?.cnicFront?.[0]?.path;
    const cnicBack = req.files?.cnicBack?.[0]?.path;

    if (!signatureImage || !profilePicture || !cnicFront || !cnicBack) {
      return res.status(400).json({ message: "All images are required" });
    }

    const newCustomer = new Customer({
      name,
      address,
      emails,
      password, // 🔥 Added password (middleware in model will hash it)
      accountType: accountTypeMap[accountType],
      dateOfBirth: dob,
      cnicNumber,
      signatureImage,
      profilePicture,
      cnicImages: {
        front: cnicFront,
        back: cnicBack
      },
      familyDetail: {
        fatherName,
        fatherCnic,
        motherName,
        motherCnic
      },
      bankId
    });

    const savedCustomer = await newCustomer.save();

    res.status(201).json({
      message: "Customer created successfully",
      customer: {
        id: savedCustomer._id,
        name: savedCustomer.name,
        cnicNumber: savedCustomer.cnicNumber
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Customer with this CNIC already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({})
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: customers.length,
      customers,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching customers",
      error: error.message,
    });
  }
};
// --- Get All Customers of a Particular Branch ---
export const getCustomersByBank = async (req, res) => {
  try {
    const { bankId } = req.params;

    // Find customers belonging to the specific bank ID
    const customers = await Customer.find({ bankId }).sort({ createdAt: -1 });

    res.status(200).json({
      count: customers.length,
      customers
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching branch customers", error: error.message });
  }
};

// --- Get Single Customer Detail ---
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate("bankId", "name");
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer", error: error.message });
  }
};

// --- Edit Customer Details ---
export const updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, // Using $set allows updating nested fields properly
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) return res.status(404).json({ message: "Customer not found" });

    res.status(200).json({ message: "Customer updated successfully", customer: updatedCustomer });
  } catch (error) {
    res.status(500).json({ message: "Error updating customer", error: error.message });
  }
};

// --- Delete Customer ---
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    res.status(200).json({ message: "Customer record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting customer", error: error.message });
  }
};



export const customerLogin = async (req, res) => {
  try {
    const { cnicNumber, password } = req.body;

    // 1. Check if customer exists and explicitly select password (because of select: false)
    const customer = await Customer.findOne({ cnicNumber }).select("+password");

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // 2. Compare password using the method we created in the model
    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { id: customer._id, role: "customer", bankId: customer.bankId },
      process.env.JWT_SECRET || "your_fallback_secret",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: customer._id,
        name: customer.name,
        cnicNumber: customer.cnicNumber,
        profilePicture: customer.profilePicture,
        role: "customer",
        bankId : customer.bankId,
        

      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const getCustomerDashboardData = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Verify customer exists
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // 2. Fetch data in parallel for performance
    const [logsCount, authorizations, authStats] = await Promise.all([
      // Count total logs for this customer
      Log.countDocuments({ customerId: id }),

      // Get all authorization records for the list
      Authorization.find({ customerId: id }).sort({ createdAt: -1 }),

      // Aggregate counts of different document types within authorizations
      Authorization.aggregate([
        { $match: { customerId: customer._id } },
        { $unwind: "$documents" }, // Assuming 'documents' is an array in Authorization
        {
          $group: {
            _id: "$documents.type", // Group by the document type (e.g., 'CNIC', 'Passport')
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // 3. Format the document statistics into a cleaner object
    const documentTypeCounts = authStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.status(200).json({
      summary: {
        totalLogs: logsCount,
        totalAuthorizations: authorizations.length,
        documentBreakdown: documentTypeCounts
      },
      authorizations: authorizations, // The array of authorizations
      customerName: customer.name
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ 
      message: "Error fetching dashboard data", 
      error: error.message 
    });
  }
};