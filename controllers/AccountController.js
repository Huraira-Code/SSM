import Account from "../models/AccountModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// --- Register / Create Account ---
export const createAccount = async (req, res) => {
    try {
        const { name, email, password, role, address, bankId } = req.body;

        console.log("account", req.body);
        console.log("file", req.file);

        // 1. Check existing user
        const existingUser = await Account.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Image URL / path
        let signatureImage = null;

        if (req.file) {
            signatureImage = req.file.path; // Cloudinary URL
        }

        // 4. Create account
        const newAccount = new Account({
            name,
            email,
            password: hashedPassword,
            role,
            address,
            bankId,
            image: signatureImage, // ✅ save image here
        });

        await newAccount.save();

        res.status(201).json({
            message: "Account created successfully",
            user: {
                id: newAccount._id,
                name,
                email,
                role,
                signatureImage,
            }
        });

    } catch (error) {
        console.log("error", error)
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// --- Sign In ---
export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const user = await Account.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 3. Generate JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role, bankId: user.bankId },
            process.env.JWT_SECRET || "your_fallback_secret",
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                bankId: user.bankId
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// --- Get all Cashiers of a specific Bank ---
export const getCashiersByBank = async (req, res) => {
    try {
        const { bankId } = req.params;

        // Filter by both role and the specific bank ID
        const cashiers = await Account.find({
            role: "Cashier",
            bankId: bankId
        }).select("-password"); // Exclude passwords for security

        res.status(200).json({
            count: cashiers.length,
            cashiers
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching cashiers", error: error.message });
    }
};

// --- Get all Managers of all Banks ---
export const getAllManagers = async (req, res) => {
    try {
        // Filter only by role, but populate bank details to see which bank they belong to
        const managers = await Account.find({ role: "Manager" })
            .select("-password")
            .populate("bankId", "name address");

        res.status(200).json({
            count: managers.length,
            managers
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching managers", error: error.message });
    }
};

// --- Update Profile (Name, Email, Password, Address, and Image) ---
export const updateProfile = async (req, res) => {
    try {
        const { id } = req.params; 
        const { name, email, password, address } = req.body;

        // 1. Find the account
        const account = await Account.findById(id);
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        // 2. Check email uniqueness if it's being changed
        if (email && email !== account.email) {
            const emailExists = await Account.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: "Email already in use" });
            }
            account.email = email;
        }

        // 3. Update text fields if provided
        if (name) account.name = name;
        if (address) account.address = address;

        // 4. Handle Image Update if a new file is uploaded
        if (req.file) {
            account.image = req.file.path; // Updates to the new Cloudinary URL or file path
        }

        // 5. If password is provided, hash it
        if (password) {
            const salt = await bcrypt.genSalt(10);
            account.password = await bcrypt.hash(password, salt);
        }

        // 6. Save the updated document
        await account.save();

        // Exclude password from the response
        const updatedUser = account.toObject();
        delete updatedUser.password;

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// --- Toggle Account Status (True <-> False) ---
export const toggleAccountStatus = async (req, res) => {
    try {
        const { id } = req.params; // Or req.user.id depending on your architecture

        // Using an aggregation pipeline to toggle the boolean value atomically
        const account = await Account.findByIdAndUpdate(
            id,
            [
                { 
                    $set: { active: { $not: "$active" } } 
                }
            ],
            { new: true } // Returns the updated document
        ).select("-password");

        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        // Determine message based on the new state
        const statusMessage = account.active ? "activated" : "deactivated";

        res.status(200).json({
            message: `Account ${statusMessage} successfully`,
            account
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};