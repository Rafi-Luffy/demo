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
exports.Audit = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const auditSchema = new mongoose_1.Schema({
    auditor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    campaign: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true
    },
    auditType: {
        type: String,
        enum: ['financial', 'milestone', 'compliance', 'security', 'impact'],
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'completed', 'failed'],
        default: 'scheduled'
    },
    findings: [{
            severity: {
                type: String,
                enum: ['low', 'medium', 'high', 'critical'],
                required: true
            },
            category: {
                type: String,
                enum: ['financial_discrepancy', 'milestone_delay', 'documentation_missing', 'compliance_violation', 'other'],
                required: true
            },
            description: {
                type: String,
                required: true,
                maxlength: [1000, 'Finding description cannot exceed 1000 characters']
            },
            recommendation: {
                type: String,
                maxlength: [500, 'Recommendation cannot exceed 500 characters']
            },
            evidence: [{
                    type: String, // IPFS hash
                    description: String
                }],
            resolved: {
                type: Boolean,
                default: false
            },
            resolvedAt: Date,
            resolvedBy: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User'
            }
        }],
    overallScore: {
        type: Number,
        min: 0,
        max: 100
    },
    report: {
        executiveSummary: {
            type: String,
            maxlength: [2000, 'Executive summary cannot exceed 2000 characters']
        },
        methodology: {
            type: String,
            maxlength: [1000, 'Methodology cannot exceed 1000 characters']
        },
        recommendations: [{
                priority: {
                    type: String,
                    enum: ['low', 'medium', 'high', 'critical'],
                    required: true
                },
                description: {
                    type: String,
                    required: true,
                    maxlength: [500, 'Recommendation cannot exceed 500 characters']
                },
                timeline: String,
                responsible: String
            }],
        attachments: [{
                name: String,
                ipfsHash: String,
                type: String,
                size: Number
            }]
    },
    scheduledDate: Date,
    completedDate: Date,
    nextAuditDate: Date,
    metadata: {
        auditDuration: Number, // in hours
        resourcesUsed: Number,
        stakeholdersInterviewed: [String],
        documentsReviewed: Number
    }
}, {
    timestamps: true
});
// Indexes
auditSchema.index({ campaign: 1, createdAt: -1 });
auditSchema.index({ auditor: 1, createdAt: -1 });
auditSchema.index({ status: 1 });
auditSchema.index({ auditType: 1 });
auditSchema.index({ 'findings.severity': 1 });
// Virtual for audit quality score
auditSchema.virtual('qualityScore').get(function () {
    const criticalFindings = this.findings.filter(f => f.severity === 'critical').length;
    const highFindings = this.findings.filter(f => f.severity === 'high').length;
    const mediumFindings = this.findings.filter(f => f.severity === 'medium').length;
    const deductions = (criticalFindings * 20) + (highFindings * 10) + (mediumFindings * 5);
    return Math.max(0, 100 - deductions);
});
// Static method to get audit statistics
auditSchema.statics.getAuditStats = function (campaignId) {
    const match = campaignId ? { campaign: new mongoose_1.default.Types.ObjectId(campaignId) } : {};
    return this.aggregate([
        { $match: match },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                averageScore: { $avg: '$overallScore' }
            }
        }
    ]);
};
// Instance method to calculate risk level
auditSchema.methods.calculateRiskLevel = function () {
    const criticalFindings = this.findings.filter(f => f.severity === 'critical' && !f.resolved).length;
    const highFindings = this.findings.filter(f => f.severity === 'high' && !f.resolved).length;
    if (criticalFindings > 0)
        return 'critical';
    if (highFindings > 2)
        return 'high';
    if (highFindings > 0 || this.overallScore < 70)
        return 'medium';
    return 'low';
};
exports.Audit = mongoose_1.default.model('Audit', auditSchema);
//# sourceMappingURL=Audit.js.map