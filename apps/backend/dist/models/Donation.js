"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Donation = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const donationSchema = new mongoose_1.Schema({
    donor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    campaign: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0.001, 'Donation amount must be at least 0.001 ETH']
    },
    currency: {
        type: String,
        required: true,
        enum: ['ETH', 'MATIC', 'USDC', 'DAI'],
        default: 'ETH'
    },
    transactionHash: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    blockNumber: {
        type: Number,
        required: true
    },
    gasUsed: {
        type: Number,
        required: true
    },
    gasFee: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'failed'],
        default: 'pending'
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    message: {
        type: String,
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    ipfsHash: {
        type: String,
        sparse: true
    },
    taxReceiptGenerated: {
        type: Boolean,
        default: false
    },
    taxReceiptId: {
        type: String,
        sparse: true
    },
    metadata: {
        donorLocation: String,
        deviceInfo: String,
        networkId: Number
    }
}, {
    timestamps: true
});
// Indexes for performance
donationSchema.index({ donor: 1, createdAt: -1 });
donationSchema.index({ campaign: 1, createdAt: -1 });
donationSchema.index({ transactionHash: 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ createdAt: -1 });
// Virtual for USD equivalent (calculated based on current exchange rate)
donationSchema.virtual('usdAmount').get(function () {
    // This would be calculated using real-time exchange rates
    return this.amount * 2000; // Placeholder ETH to USD rate
});
// Pre-save middleware to generate tax receipt ID
donationSchema.pre('save', function (next) {
    if (this.isNew && this.amount >= 0.01) { // Generate receipt for donations >= 0.01 ETH
        this.taxReceiptId = `TR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});
// Static method to get donation analytics
donationSchema.statics.getAnalytics = function (campaignId) {
    const match = campaignId ? { campaign: new mongoose_1.default.Types.ObjectId(campaignId) } : {};
    return this.aggregate([
        { $match: { ...match, status: 'confirmed' } },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: '$amount' },
                totalDonations: { $sum: 1 },
                averageDonation: { $avg: '$amount' },
                uniqueDonors: { $addToSet: '$donor' }
            }
        },
        {
            $addFields: {
                uniqueDonorCount: { $size: '$uniqueDonors' }
            }
        },
        {
            $project: {
                uniqueDonors: 0
            }
        }
    ]);
};
// Instance method to generate tax receipt
donationSchema.methods.generateTaxReceipt = function () {
    if (this.amount >= 0.01 && !this.taxReceiptGenerated) {
        this.taxReceiptGenerated = true;
        this.taxReceiptId = `TR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return this.save();
    }
    return Promise.resolve(this);
};
exports.Donation = mongoose_1.default.model('Donation', donationSchema);
//# sourceMappingURL=Donation.js.map