import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const customerSchema = new mongoose.Schema({
  // Customer Detail
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  // Allows for "+ Add Email" functionality
  emails: [{
    type: String,
    required: true,
    lowercase: true,
    trim: true
  }],
  // Password for customer login/access
  password: {
    type: String,
    required: true,
    select: false // Prevents password from being returned in standard queries
  },
  accountType: {
    type: String,
    required: true,
    enum: ["Savings Account", "Current Account", "Business Account", "Student Account"]
  },
  dateOfBirth: {
    type: Date,
    required: true
  },

  // Customer Images (Storing URLs to Cloudinary/S3)
  signatureImage: {
    type: String, 
    required: true
  },
  profilePicture: {
    type: String, 
    required: true
  },

  // CNIC Detail
  cnicNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  cnicImages: {
    front: { type: String, required: true },
    back: { type: String, required: true }
  },

  // Customer Family Detail
  familyDetail: {
    fatherName: { type: String, required: true },
    fatherCnic: { type: String, required: true },
    motherName: { type: String, required: true },
    motherCnic: { type: String, required: true }
  },

  // Bank Association
  bankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bank",
    required: true
  }
}, {
  timestamps: true
});

/**
 * Middleware: Hash password before saving to database
 */
customerSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Method: Compare entered password with hashed password in DB
 */
customerSchema.methods.comparePassword = async function (candidatePassword) {
  // Since select: false is used, you must ensure password was selected in the query 
  // to use this method during login.
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("Customer", customerSchema);