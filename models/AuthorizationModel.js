const mongoose = require('mongoose');

const generateNumericCode = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
};

const authorizationSchema = new mongoose.Schema({
    slipId: {
        type: String,
        unique: true,
        index: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DocumentType',
        required: true
    },
    bankId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bank',
        required: true
    },
    purpose: {
        type: String,
        required: true,
        trim: true
    },
    recipientCnic: {
        type: String,
        required: true,
        trim: true
    },
    recipientName: {
        type: String,
        required: true,
        trim: true
    },
    recipientPhoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    validUntil: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'revoked'],
        default: 'active'
    },
    summary: {
        type: String,
        trim: true
    }
}, { timestamps: true });

authorizationSchema.pre('save', async function (next) {
    if (!this.slipId) {
        let isUnique = false;
        let newCode;

        while (!isUnique) {
            newCode = generateNumericCode();
            const existing = await mongoose.models.Authorization.findOne({ slipId: newCode });
            if (!existing) {
                isUnique = true;
            }
        }
        this.slipId = newCode;
    }

    if (this.validUntil < new Date()) {
        this.status = 'expired';
    }

    next();
});

const Authorization = mongoose.model('Authorization', authorizationSchema);

module.exports = Authorization;