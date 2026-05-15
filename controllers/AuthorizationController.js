const Authorization = require("../models/AuthorizationModel");

// @desc    Create a new authorization slip
// @route   POST /api/authorizations
const createAuthorization = async (req, res) => {
  try {
    console.log("body", req.body);

    const {
      customerId,
      documentId,
      bankId,
      purpose,
      recipientCnic,
      recipientPhoneNumber,
      recipientName,
      validUntil,
      summary
    } = req.body;

    // Normalize incoming mismatched fields (VERY IMPORTANT FIX)
    const normalizedData = {
      customerId,
      documentId,
      bankId,
      purpose,
      recipientCnic: recipientCnic || req.body.cnicNumber,
      recipientPhoneNumber: recipientPhoneNumber || req.body.phone,
      recipientName,
      validUntil,
      summary
    };

    // Validation
    if (
      !normalizedData.customerId ||
      !normalizedData.documentId ||
      !normalizedData.bankId ||
      !normalizedData.recipientCnic ||
      !normalizedData.recipientPhoneNumber ||
      !normalizedData.recipientName
    ) {
      return res.status(400).json({
        message: "Please provide all required fields."
      });
    }

    const newAuth = new Authorization(normalizedData);

    const savedAuth = await newAuth.save();

    res.status(201).json({
      success: true,
      data: savedAuth
    });

  } catch (error) {
    console.error("Create Auth Error:", error);
    res.status(500).json({
      message: "Server error while creating authorization."
    });
  }
};


// @desc    Get all authorizations for a specific customer
// @route   GET /api/authorizations/customer/:customerId
const getCustomerAuthorizations = async (req, res) => {
  try {
    console.log("Abcd")
    const { customerId } = req.params;

    // Fetch and populate related document data
    const authorizations = await Authorization.find({ customerId })
      .populate('documentId', 'documentName') // Adjust fields based on your Document model
      .sort({ createdAt: -1 }); // Newest first

    if (!authorizations || authorizations.length === 0) {
      return res.status(404).json({ message: "No authorizations found for this customer." });
    }

    console.log(authorizations)

    res.status(200).json({
      success: true,
      count: authorizations.length,
      data: authorizations
    });
  } catch (error) {
    console.error("Get Auth Error:", error);
    res.status(500).json({ message: "Server error while fetching authorizations." });
  }
};


// @desc    Verify authorization slip before proceeding
// @route   POST /api/authorizations/verify
const verifyAuthorization = async (req, res) => {
  try {
    const {
      slipId,
      recipientCnic,
      customerId,
      documentId,
      bankId
    } = req.body;

    console.log(req.body)

    // Validation
    if (!slipId || !recipientCnic || !customerId || !documentId || !bankId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Find authorization
    const auth = await Authorization.findOne({
      slipId,
      recipientCnic,
      customerId,
      documentId,
      bankId,
      status: "active"
    }).populate('documentId', 'documentName');

    if (!auth) {
      console.log("auth problem")
      return res.status(404).json({
        success: false,
        message: "Invalid or expired authorization"
      });
    }

    // Optional: expiry check safety (extra protection)
    if (auth.validUntil && new Date(auth.validUntil) < new Date()) {
      auth.status = "expired";
      await auth.save();

      return res.status(400).json({
        success: false,
        message: "Authorization has expired"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Authorization verified successfully",
      data: auth
    });

  } catch (error) {
    console.error("Verify Auth Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authorization verification"
    });
  }
};

module.exports = {
  createAuthorization,
  getCustomerAuthorizations,
  verifyAuthorization
};

