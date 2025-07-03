import mongoose, { Schema } from 'mongoose'
import { ICampaign, CampaignCategory, CampaignStatus, IMilestone, MilestoneStatus } from '@/types'

const milestoneSchema = new Schema<IMilestone>({
  campaignId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Milestone title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Milestone description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1, 'Target amount must be at least 1']
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'submitted', 'verified', 'rejected', 'funds_released'] as MilestoneStatus[],
      message: 'Invalid milestone status'
    },
    default: 'pending'
  },
  proofDocuments: [{
    type: String,
    match: [/^Qm[a-zA-Z0-9]{44}$/, 'Invalid IPFS hash format']
  }],
  submittedAt: Date,
  verifiedAt: Date,
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String,
  transactionHash: {
    type: String,
    match: [/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash']
  },
  order: {
    type: Number,
    required: true,
    min: 1
  }
}, {
  timestamps: true
})

const campaignUpdateSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Update title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: true,
    maxlength: [2000, 'Update content cannot exceed 2000 characters']
  },
  images: [{
    type: String,
    match: [/^https?:\/\/.+/, 'Invalid image URL']
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

const documentSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['identity', 'financial', 'legal', 'proof', 'receipt', 'report', 'image', 'other'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  ipfsHash: {
    type: String,
    required: true,
    match: [/^Qm[a-zA-Z0-9]{44}$/, 'Invalid IPFS hash format']
  },
  size: {
    type: Number,
    required: true,
    min: 1
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationDate: Date
}, {
  timestamps: true
})

const campaignSchema = new Schema<ICampaign>({
  title: {
    type: String,
    required: [true, 'Campaign title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Campaign description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  story: {
    type: String,
    required: [true, 'Campaign story is required'],
    maxlength: [5000, 'Story cannot exceed 5000 characters']
  },
  category: {
    type: String,
    enum: {
      values: [
        'education', 
        'healthcare', 
        'emergency', 
        'environment', 
        'child-welfare', 
        'women-empowerment', 
        'agriculture', 
        'water-sanitation', 
        'food-nutrition'
      ] as CampaignCategory[],
      message: 'Invalid campaign category'
    },
    required: [true, 'Campaign category is required']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1000, 'Target amount must be at least ₹1000']
  },
  raisedAmount: {
    type: Number,
    default: 0,
    min: [0, 'Raised amount cannot be negative']
  },
  donorCount: {
    type: Number,
    default: 0,
    min: [0, 'Donor count cannot be negative']
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Campaign creator is required']
  },
  beneficiaries: {
    type: Number,
    required: [true, 'Number of beneficiaries is required'],
    min: [1, 'At least 1 beneficiary is required']
  },
  location: {
    type: String,
    required: [true, 'Campaign location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Campaign image is required'],
    match: [/^https?:\/\/.+/, 'Invalid image URL']
  },
  gallery: [{
    type: String,
    match: [/^https?:\/\/.+/, 'Invalid gallery image URL']
  }],
  
  // Blockchain fields
  contractAddress: {
    type: String,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid contract address']
  },
  ipfsPlanHash: {
    type: String,
    match: [/^Qm[a-zA-Z0-9]{44}$/, 'Invalid IPFS hash format']
  },
  transactionHash: {
    type: String,
    match: [/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash']
  },
  
  // Status and timing
  status: {
    type: String,
    enum: {
      values: [
        'draft', 
        'pending_approval', 
        'active', 
        'paused', 
        'completed', 
        'cancelled', 
        'under_review'
      ] as CampaignStatus[],
      message: 'Invalid campaign status'
    },
    default: 'draft'
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(this: ICampaign, value: Date) {
        return !value || value > this.startDate
      },
      message: 'End date must be after start date'
    }
  },
  
  // Milestones
  milestones: [milestoneSchema],
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationDate: Date,
  
  // Metadata
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  documents: [documentSchema],
  updates: [campaignUpdateSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
campaignSchema.index({ status: 1, createdAt: -1 })
campaignSchema.index({ category: 1, status: 1 })
campaignSchema.index({ creator: 1, status: 1 })
campaignSchema.index({ location: 1 })
campaignSchema.index({ isUrgent: 1, status: 1 })
campaignSchema.index({ targetAmount: 1, raisedAmount: 1 })
campaignSchema.index({ 
  title: 'text', 
  description: 'text', 
  story: 'text', 
  location: 'text' 
}, {
  weights: {
    title: 10,
    description: 5,
    story: 3,
    location: 1
  }
})

// Virtuals
campaignSchema.virtual('progressPercentage').get(function() {
  return Math.min((this.raisedAmount / this.targetAmount) * 100, 100)
})

campaignSchema.virtual('daysRemaining').get(function() {
  if (!this.endDate) return null
  const today = new Date()
  const timeDiff = this.endDate.getTime() - today.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
})

campaignSchema.virtual('donations', {
  ref: 'Donation',
  localField: '_id',
  foreignField: 'campaignId'
})

// Pre-save middleware
campaignSchema.pre('save', function(next) {
  // Ensure milestones are ordered correctly
  this.milestones.forEach((milestone, index) => {
    milestone.order = index + 1
  })
  next()
})

// Instance methods
campaignSchema.methods.canReceiveDonations = function(): boolean {
  return this.status === 'active' && 
         this.raisedAmount < this.targetAmount &&
         (!this.endDate || this.endDate > new Date())
}

campaignSchema.methods.updateProgress = async function(donationAmount: number) {
  this.raisedAmount += donationAmount
  this.donorCount += 1
  
  if (this.raisedAmount >= this.targetAmount) {
    this.status = 'completed'
  }
  
  return this.save()
}

export const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema)
