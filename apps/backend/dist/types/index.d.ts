import { Request } from 'express';
import { Document, Types } from 'mongoose';
export interface IUser extends Document {
    _id: string;
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: UserRole;
    walletAddress?: string;
    profile: IUserProfile;
    kycStatus: KYCStatus;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateAuthToken(): string;
    generateRefreshToken(): string;
}
export type UserRole = 'donor' | 'charity' | 'auditor' | 'admin';
export type KYCStatus = 'pending' | 'in_review' | 'verified' | 'rejected';
export interface IUserProfile {
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
    socialLinks?: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        instagram?: string;
    };
    preferences: {
        language: 'en' | 'hi';
        notifications: {
            email: boolean;
            sms: boolean;
            push: boolean;
        };
        privacy: {
            showDonations: boolean;
            showProfile: boolean;
        };
    };
    stats?: {
        totalDonated?: number;
        totalCampaigns?: number;
        totalVolunteerHours?: number;
        impactScore?: number;
    };
}
export interface ICampaign extends Document {
    _id: string;
    title: string;
    description: string;
    story: string;
    category: CampaignCategory;
    targetAmount: number;
    raisedAmount: number;
    donorCount: number;
    creator: string;
    beneficiaries: number;
    location: string;
    imageUrl: string;
    gallery?: string[];
    contractAddress?: string;
    ipfsPlanHash?: string;
    transactionHash?: string;
    status: CampaignStatus;
    isUrgent: boolean;
    startDate: Date;
    endDate?: Date;
    milestones: IMilestone[];
    isVerified: boolean;
    verifiedBy?: string;
    verificationDate?: Date;
    tags: string[];
    documents: IDocument[];
    updates: ICampaignUpdate[];
    createdAt: Date;
    updatedAt: Date;
}
export type CampaignCategory = 'education' | 'healthcare' | 'emergency' | 'environment' | 'child-welfare' | 'women-empowerment' | 'agriculture' | 'water-sanitation' | 'food-nutrition';
export type CampaignStatus = 'draft' | 'pending_approval' | 'active' | 'paused' | 'completed' | 'cancelled' | 'under_review';
export interface IMilestone {
    _id: string;
    campaignId: string;
    title: string;
    description: string;
    targetAmount: number;
    deadline: Date;
    status: MilestoneStatus;
    proofDocuments: string[];
    submittedAt?: Date;
    verifiedAt?: Date;
    verifiedBy?: string;
    rejectionReason?: string;
    transactionHash?: string;
    order: number;
}
export type MilestoneStatus = 'pending' | 'submitted' | 'verified' | 'rejected' | 'funds_released';
export interface IDonation extends Document {
    _id: string;
    donor: Types.ObjectId;
    campaign: Types.ObjectId;
    amount: number;
    currency: 'ETH' | 'MATIC' | 'USDC' | 'DAI';
    transactionHash: string;
    blockNumber: number;
    gasUsed: number;
    gasFee: number;
    status: 'pending' | 'confirmed' | 'failed';
    isAnonymous: boolean;
    message?: string;
    ipfsHash?: string;
    taxReceiptGenerated: boolean;
    taxReceiptId?: string;
    metadata?: {
        donorLocation?: string;
        deviceInfo?: string;
        networkId?: number;
    };
    createdAt: Date;
    updatedAt: Date;
    usdAmount: number;
    generateTaxReceipt(): Promise<IDonation>;
}
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'crypto';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export interface IAudit extends Document {
    _id: string;
    auditor: string;
    campaign: string;
    auditType: 'financial' | 'milestone' | 'compliance' | 'security' | 'impact';
    status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
    findings: IAuditFinding[];
    overallScore?: number;
    report?: IAuditReport;
    scheduledDate?: Date;
    completedDate?: Date;
    nextAuditDate?: Date;
    metadata?: {
        auditDuration?: number;
        resourcesUsed?: number;
        stakeholdersInterviewed?: string[];
        documentsReviewed?: number;
    };
    createdAt: Date;
    updatedAt: Date;
    qualityScore: number;
    calculateRiskLevel(): string;
}
export type AuditType = 'financial' | 'impact' | 'compliance' | 'security';
export type AuditStatus = 'scheduled' | 'in_progress' | 'completed' | 'failed';
export interface IAuditFinding {
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'financial_discrepancy' | 'milestone_delay' | 'documentation_missing' | 'compliance_violation' | 'other';
    description: string;
    recommendation?: string;
    evidence?: {
        type: string;
        description?: string;
    }[];
    resolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
}
export interface IAuditReport {
    executiveSummary?: string;
    methodology?: string;
    recommendations?: {
        priority: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        timeline?: string;
        responsible?: string;
    }[];
    attachments?: {
        name?: string;
        ipfsHash?: string;
        type?: string;
        size?: number;
    }[];
}
export interface IDocument {
    _id: string;
    name: string;
    type: DocumentType;
    url: string;
    ipfsHash: string;
    size: number;
    mimeType: string;
    uploadedBy: string;
    uploadedAt: Date;
    isVerified: boolean;
    verifiedBy?: string;
    verificationDate?: Date;
}
export type DocumentType = 'identity' | 'financial' | 'legal' | 'proof' | 'receipt' | 'report' | 'image' | 'other';
export interface ICampaignUpdate {
    _id: string;
    title: string;
    content: string;
    images?: string[];
    createdAt: Date;
    createdBy: string;
}
export interface IBlockchainTransaction extends Document {
    _id: string;
    hash: string;
    from: string;
    to: string;
    value: string;
    gasUsed: string;
    gasPrice: string;
    blockNumber: number;
    blockHash: string;
    timestamp: Date;
    status: 'pending' | 'confirmed' | 'failed';
    type: TransactionType;
    relatedId?: string;
    metadata?: any;
    createdAt: Date;
}
export type TransactionType = 'donation' | 'milestone_submission' | 'milestone_verification' | 'fund_withdrawal' | 'contract_deployment';
export interface IVolunteerOpportunity extends Document {
    _id: string;
    title: string;
    description: string;
    location: string;
    date: Date;
    duration: number;
    skillsRequired: string[];
    maxVolunteers: number;
    currentVolunteers: number;
    createdBy: string;
    campaignId?: string;
    status: 'active' | 'filled' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}
export interface IVolunteerApplication extends Document {
    _id: string;
    volunteerId: string;
    opportunityId: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    appliedAt: Date;
    message?: string;
    skills: string[];
    experience?: string;
    hoursCompleted?: number;
    feedback?: string;
    rating?: number;
}
export interface AuthenticatedRequest extends Request {
    user?: IUser;
}
export interface PaginationQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface CampaignFilters extends PaginationQuery {
    category?: CampaignCategory;
    status?: CampaignStatus;
    location?: string;
    minAmount?: number;
    maxAmount?: number;
    isUrgent?: boolean;
    search?: string;
}
export interface DonationFilters extends PaginationQuery {
    donorId?: string;
    campaignId?: string;
    paymentStatus?: PaymentStatus;
    minAmount?: number;
    maxAmount?: number;
    startDate?: Date;
    endDate?: Date;
}
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: any;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
export interface AuthResponse {
    user: Partial<IUser>;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface ContractConfig {
    address: string;
    abi: any[];
    network: 'ethereum' | 'polygon';
}
export interface ContractEvent {
    event: string;
    blockNumber: number;
    transactionHash: string;
    args: any;
    timestamp: Date;
}
export interface IPFSUploadResult {
    hash: string;
    url: string;
    size: number;
}
export interface INotification extends Document {
    _id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    isRead: boolean;
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
}
export type NotificationType = 'donation_received' | 'milestone_verified' | 'campaign_approved' | 'audit_completed' | 'volunteer_accepted' | 'system_update';
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode: number);
}
export interface Config {
    NODE_ENV: string;
    PORT: number;
    MONGODB_URI: string;
    JWT_SECRET: string;
    JWT_EXPIRE: string;
    ETHEREUM_RPC_URL: string;
    POLYGON_RPC_URL: string;
    IPFS_API_URL: string;
    SMTP_HOST: string;
    SMTP_PORT: number;
    SMTP_USER: string;
    SMTP_PASS: string;
}
//# sourceMappingURL=index.d.ts.map