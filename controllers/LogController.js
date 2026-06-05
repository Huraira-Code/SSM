import Log from "../models/LogModel.js";
import Customer from "../models/CustomerModel.js";

import axios from "axios";
import FormData from "form-data";

/**
 * Compare signatures using Flask API
 */
const compareSignatures = async (originalSignature, uploadedSignature) => {
  try {
    // 1. Download images as buffers
    const [img1Res, img2Res] = await Promise.all([
      axios.get(originalSignature, { responseType: "arraybuffer" }),
      axios.get(uploadedSignature, { responseType: "arraybuffer" }),
    ]);

    // 2. Create FormData
    const formData = new FormData();

    formData.append("image1", Buffer.from(img1Res.data), {
      filename: "image1.png",
      contentType: "image/png",
    });

    formData.append("image2", Buffer.from(img2Res.data), {
      filename: "image2.png",
      contentType: "image/png",
    });

    // 3. Send to Flask API
    const response = await axios.post(
      "https://hurairashahid-signature-api.hf.space/compare-signatures",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    const data = response.data;

    // 4. Convert to your format
    return {
      matchPercentage: Math.round(data.similarity * 100),
      bulletResponse: [
        data.result === "same"
          ? "Signatures are highly similar"
          : "Signatures show noticeable differences",
        "AI structural similarity analysis completed",
        `Confidence score: ${Math.round(data.similarity * 100)}%`,
      ],
    };
  } catch (error) {
    console.error("Signature compare error:", error.message);

    return {
      matchPercentage: 0,
      bulletResponse: ["Error comparing signatures", error.message],
    };
  }
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