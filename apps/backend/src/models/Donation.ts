import mongoose, { Schema, Document } from 'mongoose';
import { IDonation } from '../types/index.js';

const donationSchema = new Schema<IDonation>({
  donor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  campaign: {
    type: Schema.Types.ObjectId,
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
    enum: ['ETH', 'MATIC', 'USDC', 'DAI', 'WETH'],
    default: 'MATIC' // Default to MATIC for Polygon network
  },
  network: {
    type: String,
    enum: ['ethereum', 'polygon', 'mumbai'],
    default: 'polygon',
    required: true,
    index: true
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

// Enhanced indexes for performance and Polygon optimization
donationSchema.index({ donor: 1, createdAt: -1 });
donationSchema.index({ campaign: 1, createdAt: -1 });
donationSchema.index({ transactionHash: 1 });
donationSchema.index({ status: 1, network: 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ network: 1, currency: 1 }); // For Polygon analytics
donationSchema.index({ campaign: 1, status: 1, network: 1 }); // Compound index for campaign analytics
donationSchema.index({ donor: 1, network: 1, status: 1 }); // For user donation history

// Virtual for USD equivalent with network-aware calculation
donationSchema.virtual('usdAmount').get(function(this: IDonation) {
  // Network-specific exchange rates (would be fetched from API in production)
  const exchangeRates = {
    'ETH': 2000,
    'MATIC': 0.8,
    'USDC': 1,
    'DAI': 1,
    'WETH': 2000
  };
  return this.amount * (exchangeRates[this.currency as keyof typeof exchangeRates] || 1);
});

// Pre-save middleware to generate tax receipt ID
donationSchema.pre('save', function(this: IDonation, next) {
  if (this.isNew && this.amount >= 0.01) { // Generate receipt for donations >= 0.01 crypto
    this.taxReceiptId = `TR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Static method to get donation analytics
donationSchema.statics.getAnalytics = function(campaignId?: string) {
  const match = campaignId ? { campaign: new mongoose.Types.ObjectId(campaignId) } : {};
  
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
donationSchema.methods.generateTaxReceipt = function() {
  if (this.amount >= 0.01 && !this.taxReceiptGenerated) {
    this.taxReceiptGenerated = true;
    this.taxReceiptId = `TR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return this.save();
  }
  return Promise.resolve(this);
};

export const Donation = mongoose.model<IDonation>('Donation', donationSchema);
