import mongoose from "mongoose";

const bankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account", // Points back to the Account model
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model("Bank", bankSchema);