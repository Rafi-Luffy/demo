import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { IUser, UserRole, KYCStatus } from '@/types'

const userProfileSchema = new Schema({
  avatar: { type: String },
  bio: { type: String, maxlength: 500 },
  location: { type: String },
  website: { type: String },
  socialLinks: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String
  },
  preferences: {
    language: { type: String, enum: ['en', 'hi'], default: 'en' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    privacy: {
      showDonations: { type: Boolean, default: true },
      showProfile: { type: Boolean, default: true }
    }
  },
  stats: {
    totalDonated: { type: Number, default: 0 },
    totalCampaigns: { type: Number, default: 0 },
    totalVolunteerHours: { type: Number, default: 0 },
    impactScore: { type: Number, default: 0 }
  }
}, { _id: false })

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[+]?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number']
  },
  role: {
    type: String,
    enum: {
      values: ['donor', 'charity', 'auditor', 'admin'] as UserRole[],
      message: 'Role must be donor, charity, auditor, or admin'
    },
    default: 'donor'
  },
  walletAddress: {
    type: String,
    lowercase: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Please enter a valid Ethereum address']
  },
  profile: {
    type: userProfileSchema,
    default: () => ({})
  },
  kycStatus: {
    type: String,
    enum: {
      values: ['pending', 'in_review', 'verified', 'rejected'] as KYCStatus[],
      message: 'KYC status must be pending, in_review, verified, or rejected'
    },
    default: 'pending'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ walletAddress: 1 }, { sparse: true })
userSchema.index({ role: 1 })
userSchema.index({ kycStatus: 1 })
userSchema.index({ createdAt: -1 })

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
    this.password = await bcrypt.hash(this.password, saltRounds)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Instance method to generate auth token
userSchema.methods.generateAuthToken = function(): string {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role 
    },
    process.env.JWT_SECRET!,
    { 
      expiresIn: process.env.JWT_EXPIRE || '7d' 
    }
  )
}

// Instance method to generate refresh token
userSchema.methods.generateRefreshToken = function(): string {
  return jwt.sign(
    { 
      id: this._id 
    },
    process.env.JWT_REFRESH_SECRET!,
    { 
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' 
    }
  )
}

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name
})

// Virtual for donation count
userSchema.virtual('donationCount', {
  ref: 'Donation',
  localField: '_id',
  foreignField: 'donorId',
  count: true
})

// Virtual for created campaigns
userSchema.virtual('campaigns', {
  ref: 'Campaign',
  localField: '_id',
  foreignField: 'creator'
})

export const User = mongoose.model<IUser>('User', userSchema)
