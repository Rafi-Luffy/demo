import mongoose, { Schema } from 'mongoose';
import { IAudit } from '../types/index.js';

const auditSchema = new Schema<IAudit>({
  auditor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  campaign: {
    type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
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
auditSchema.virtual('qualityScore').get(function() {
  const criticalFindings = this.findings.filter(f => f.severity === 'critical').length;
  const highFindings = this.findings.filter(f => f.severity === 'high').length;
  const mediumFindings = this.findings.filter(f => f.severity === 'medium').length;
  
  const deductions = (criticalFindings * 20) + (highFindings * 10) + (mediumFindings * 5);
  return Math.max(0, 100 - deductions);
});

// Static method to get audit statistics
auditSchema.statics.getAuditStats = function(campaignId?: string) {
  const match = campaignId ? { campaign: new mongoose.Types.ObjectId(campaignId) } : {};
  
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
auditSchema.methods.calculateRiskLevel = function() {
  const criticalFindings = this.findings.filter(f => f.severity === 'critical' && !f.resolved).length;
  const highFindings = this.findings.filter(f => f.severity === 'high' && !f.resolved).length;
  
  if (criticalFindings > 0) return 'critical';
  if (highFindings > 2) return 'high';
  if (highFindings > 0 || this.overallScore < 70) return 'medium';
  return 'low';
};

export const Audit = mongoose.model<IAudit>('Audit', auditSchema);
