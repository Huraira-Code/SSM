import Verification from "../models/VerificationModel.js";
import { sendOtpSMS } from "../services/smsService.js";

export const createVerification = async (req, res) => {
    try {
        const {
            customerId,
            documentTypeId,
            bankId,
            cashierId,
            phone
        } = req.body;

        // Validation
        if (
            !customerId ||
            !documentTypeId ||
            !bankId ||
            !cashierId
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Generate 6 digit OTP
        const verificationCode = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // Expiry time = current time + 5 minutes
        const codeExpiresAt = new Date(
            Date.now() + 5 * 60 * 1000
        );
        console.log(phone)

        // const smsResult = await sendOtpSMS(phone, verificationCode);

        // if (!smsResult.success) {
        //     return res.status(500).json({
        //         success: false,
        //         message: "Failed to send OTP SMS",
        //     });
        // }
        // Create verification
        const verification = await Verification.create({
            customerId,
            documentTypeId,
            bankId,
            cashierId,
            verificationCode,
            codeExpiresAt,
            status: "pending",
        });

        return res.status(201).json({
            success: true,
            message: "Verification created successfully",
            data: verification,
        });

    } catch (error) {
        console.error("Create Verification Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



export const verifyOtp = async (req, res) => {
    try {
        const { verificationId, verificationCode } = req.body;
        console.log(req.body)
        // Validation
        if (!verificationId || !verificationCode) {
            return res.status(400).json({
                success: false,
                message: "Verification ID and OTP are required",
            });
        }

        // Find verification
        const verification = await Verification.findById(verificationId);

        if (!verification) {
            return res.status(404).json({
                success: false,
                message: "Verification not found",
            });
        }

        // Check status
        if (verification.status === "verified") {
            return res.status(400).json({
                success: false,
                message: "Verification already completed",
            });
        }

        // Check expiry
        if (new Date() > verification.codeExpiresAt) {
            verification.status = "expired";
            await verification.save();

            return res.status(400).json({
                success: false,
                message: "OTP has expired",
            });
        }

        // Check OTP
        if (verification.verificationCode !== verificationCode) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // Success
        verification.status = "verified";
        verification.verifiedAt = new Date();

        await verification.save();

        return res.status(200).json({
            success: true,
            message: "Verification successful",
            data: verification,
        });

    } catch (error) {
        console.error("Verify OTP Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



