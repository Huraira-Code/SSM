import Log from "../models/LogModel.js";
import Customer from "../models/CustomerModel.js";

const compareSignatures = async (
  originalSignature,
  uploadedSignature
) => {

  /*
    Here you will call:
    - AI API
    - Python ML model
    - OpenCV
    - Gemini Vision
    - DeepSeek
    - Custom CNN model
  */

  // Temporary dummy response
  return {
    matchPercentage: 82,
    bulletResponse: [
      "Signature shape is mostly similar",
      "Pressure pattern slightly differs",
      "Possible genuine signature with variation",
    ],
  };
};

export const createLog = async (req, res) => {
  try {
    console.log(req.file)
    // Uploaded Signature
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Signature image is required",
      });
    }

    const {
      cashierId,
      bankId,
      customerId,
      documentId,
    } = req.body;
    console.log(req.body)
    // Validate required fields
    if (
      !cashierId ||
      !bankId ||
      !customerId ||
      !documentId
    ) {
      console.log("fields")

      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Find Customer
    const customer = await Customer.findById(customerId);
    console.log(customer)
    if (!customer) {
      console.log("customer")
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Original signature stored in DB
    // Example field: customer.signatureImage
    if (!customer.signatureImage) {
      console.log("signature Image")

      return res.status(400).json({
        success: false,
        message: "Customer original signature not found",
      });
    }

    // Uploaded signature path
    const uploadedSignature = req.file.path;

    // Original signature path
    const originalSignature = customer.signatureImage;

    /*
      compareSignatures() should return:
      {
        matchPercentage: 87,
        bulletResponse: [
          "Stroke pattern is similar",
          "Minor variation in angle detected",
          "Signature likely authentic"
        ]
      }
    */

    const comparisonResult = await compareSignatures(
      originalSignature,
      uploadedSignature
    );

    const matchPercentage = comparisonResult.matchPercentage;
    const bulletResponse = comparisonResult.bulletResponse;

    // Decide Status
    let status = "Rejected";

    if (matchPercentage >= 85) {
      status = "Verified";
    } else if (matchPercentage >= 60) {
      status = "Flagged";
    } else {
      status = "Rejected";
    }

    // Save Log
    const newLog = new Log({
      cashierId,
      bankId,
      customerId,
      documentId,
      signatureImage: uploadedSignature,
      matchPercentage,
      bulletResponse,
      status,
    });

    await newLog.save();

    return res.status(201).json({
      success: true,
      message: "Signature verification completed",
      data: newLog,
    });

  } catch (error) {
    console.error("Create Log Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// --- Get Logs by Bank ID ---
export const getLogsByBank = async (req, res) => {
  try {
    const { bankId } = req.params;

    // Fetch logs and populate references for a detailed audit view
    const logs = await Log.find({ bankId })
      .populate("cashierId", "name")
      .populate("customerId")
      .populate("documentId", "documentName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: logs.length,
      logs
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching logs", error: error.message });
  }
};


export const getLogsByCashier = async (req, res) => {
  try {
    const { cashierId } = req.params;
    console.log("cashier log", cashierId)
    // Fetch logs and populate references for a detailed audit view
    const logs = await Log.find({ cashierId })
      .populate("cashierId", "name")
      .populate("customerId")
      .populate("documentId", "documentName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: logs.length,
      logs
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching logs", error: error.message });
  }
};