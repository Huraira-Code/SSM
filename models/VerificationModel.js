import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema(
    {
        // Customer
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },

        // Document Type
        documentTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DocumentType",
            required: true,
        },

        // Bank
        bankId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bank",
            required: true,
        },

        // Cashier
        cashierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cashier",
            required: true,
        },



        // Verification Code / OTP
        verificationCode: {
            type: String,
            required: true,
        },

        // Verification Status
        status: {
            type: String,
            enum: [
                "pending",
                "verified",
                "expired",
            ],
            default: "pending",
        },

        // Optional Expiry Time
        codeExpiresAt: {
            type: Date,
        },

        // Verification Time
        verifiedAt: {
            type: Date,
        },

    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Verification", verificationSchema);