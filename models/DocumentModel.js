import mongoose from "mongoose";

const documentTypeSchema = new mongoose.Schema({
  // The specific name (e.g., "Withdrawal Slip", "Account Opening Form")
  documentName: {
    type: String,
    required: true,
    trim: true
  },

  // The grouping (e.g., "Transactional", "Legal", "KYC")
  documentCategory: {
    type: String,
    required: true,
    enum: ["Transactional", "Legal", "Identity", "Loan", "Other"],
    default: "Other"
  },

  // Association with the specific bank branch
  bankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bank",
    required: true
  }
}, {
  timestamps: true
});

// Ensures a bank doesn't have duplicate document names within the same category
documentTypeSchema.index({ documentName: 1, bankId: 1 }, { unique: true });

export default mongoose.model("DocumentType", documentTypeSchema);