import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  // The person who performed the verification
  cashierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true
  },
  bankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bank",
    required: true
  },
  // The customer whose signature is being checked
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },

  // The type of document being verified
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DocumentType",
    required: true
  },

  // The actual signature image captured during this specific transaction
  signatureImage: {
    type: String,
    required: true
  },

  // The AI/System result (e.g., 0.95 for 95%)
  matchPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },

  // The full response or raw data from the verification engine
  bulletResponse: {
    type: mongoose.Schema.Types.Mixed, // Allows for flexible JSON/Object data
    required: true
  },

  // Optional: Quick status based on the match
  status: {
    type: String,
    enum: ["Verified", "Flagged", "Rejected"],
    default: "Flagged"
  }
}, {
  // This automatically handles the "Date and Time" (createdAt)
  timestamps: true
});

export default mongoose.model("Log", logSchema);