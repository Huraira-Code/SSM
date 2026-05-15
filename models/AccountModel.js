import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["Admin", "Manager", "Cashier"],
    default: "Cashier"
  },
  image: {
    type: String
  },
  // New conditional Address field
  address: {
    type: String,
    required: function () {
      return this.role === "Manager" || this.role === "Cashier";
    }
  },
  bankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bank",
  }
}, {
  timestamps: true
});

export default mongoose.model("Account", accountSchema);