import express from 'express';
import { Audit } from '../models/Audit.js';
import { Campaign } from '../models/Campaign.js';
import { protect, authorize } from '../middleware/auth.js';
import { AppError } from '../types/index.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = express.Router();

// @desc    Get all audits
// @route   GET /api/audits
// @access  Private (Admin/Auditor)
router.get('/', protect, authorize('admin', 'auditor'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      campaignId,
      auditType,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query as any;

    // Build query
    const query: any = {};
    if (campaignId) query.campaign = campaignId;
    if (auditType) query.auditType = auditType;
    if (status) query.status = status;

    // If user is auditor, only show their audits
    if (req.user?.role === 'auditor') {
      query.auditor = req.user.id;
    }

    // Sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    const audits = await Audit.find(query)
      .populate('auditor', 'name email')
      .populate('campaign', 'title creator')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Audit.countDocuments(query);

    res.status(200).json({
      success: true,
      data: audits,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single audit
// @route   GET /api/audits/:id
// @access  Private (Admin/Auditor/Campaign Owner)
router.get('/:id', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const audit = await Audit.findById(req.params.id)
      .populate('auditor', 'name email profile')
      .populate('campaign', 'title description creator');

    if (!audit) {
      return next(new AppError('Audit not found', 404));
    }

    // Check if user can view this audit
    const campaign = await Campaign.findById(audit.campaign);
    
    if (req.user?.role !== 'admin' &&
        req.user?.id !== audit.auditor.toString() &&
        req.user?.id !== campaign?.creator.toString()) {
      return next(new AppError('Not authorized to view this audit', 401));
    }

    res.status(200).json({
      success: true,
      data: audit
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new audit
// @route   POST /api/audits
// @access  Private (Admin/Auditor)
router.post('/', protect, authorize('admin', 'auditor'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { campaignId, auditType, scheduledDate } = req.body;

    // Check if campaign exists
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }

    // Check if there's already a pending audit of this type for this campaign
    const existingAudit = await Audit.findOne({
      campaign: campaignId,
      auditType,
      status: { $in: ['scheduled', 'in_progress'] }
    });

    if (existingAudit) {
      return next(new AppError(`A ${auditType} audit is already in progress for this campaign`, 400));
    }

    const audit = await Audit.create({
      auditor: req.user?.id,
      campaign: campaignId,
      auditType,
      scheduledDate: scheduledDate || new Date(),
      status: 'scheduled'
    });

    const populatedAudit = await Audit.findById(audit._id)
      .populate('auditor', 'name email')
      .populate('campaign', 'title');

    res.status(201).json({
      success: true,
      data: populatedAudit
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update audit
// @route   PUT /api/audits/:id
// @access  Private (Admin/Assigned Auditor)
router.put('/:id', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    let audit = await Audit.findById(req.params.id);

    if (!audit) {
      return next(new AppError('Audit not found', 404));
    }

    // Check if user can update this audit
    if (req.user?.role !== 'admin' && req.user?.id !== audit.auditor.toString()) {
      return next(new AppError('Not authorized to update this audit', 401));
    }

    audit = await Audit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('auditor', 'name email').populate('campaign', 'title');

    res.status(200).json({
      success: true,
      data: audit
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Start audit
// @route   POST /api/audits/:id/start
// @access  Private (Assigned Auditor)
router.post('/:id/start', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const audit = await Audit.findById(req.params.id);

    if (!audit) {
      return next(new AppError('Audit not found', 404));
    }

    // Check if user is the assigned auditor
    if (req.user?.id !== audit.auditor.toString()) {
      return next(new AppError('Not authorized to start this audit', 401));
    }

    if (audit.status !== 'scheduled') {
      return next(new AppError('Audit cannot be started', 400));
    }

    audit.status = 'in_progress';
    await audit.save();

    res.status(200).json({
      success: true,
      data: audit
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Complete audit
// @route   POST /api/audits/:id/complete
// @access  Private (Assigned Auditor)
router.post('/:id/complete', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { findings, overallScore, report } = req.body;

    const audit = await Audit.findById(req.params.id);

    if (!audit) {
      return next(new AppError('Audit not found', 404));
    }

    // Check if user is the assigned auditor
    if (req.user?.id !== audit.auditor.toString()) {
      return next(new AppError('Not authorized to complete this audit', 401));
    }

    if (audit.status !== 'in_progress') {
      return next(new AppError('Audit is not in progress', 400));
    }

    audit.status = 'completed';
    audit.completedDate = new Date();
    audit.findings = findings || [];
    audit.overallScore = overallScore;
    audit.report = report;

    // Calculate next audit date (e.g., 90 days from now)
    audit.nextAuditDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    await audit.save();

    res.status(200).json({
      success: true,
      data: audit
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add audit finding
// @route   POST /api/audits/:id/findings
// @access  Private (Assigned Auditor)
router.post('/:id/findings', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const finding = req.body;

    const audit = await Audit.findById(req.params.id);

    if (!audit) {
      return next(new AppError('Audit not found', 404));
    }

    // Check if user is the assigned auditor
    if (req.user?.id !== audit.auditor.toString()) {
      return next(new AppError('Not authorized to add findings to this audit', 401));
    }

    if (audit.status !== 'in_progress') {
      return next(new AppError('Can only add findings to audits in progress', 400));
    }

    audit.findings.push({
      ...finding,
      resolved: false
    });

    await audit.save();

    res.status(201).json({
      success: true,
      data: audit.findings[audit.findings.length - 1]
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Resolve audit finding
// @route   PUT /api/audits/:id/findings/:findingId/resolve
// @access  Private (Campaign Owner/Admin)
router.put('/:id/findings/:findingId/resolve', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const audit = await Audit.findById(req.params.id).populate('campaign');

    if (!audit) {
      return next(new AppError('Audit not found', 404));
    }

    // Check if user can resolve findings
    const campaign = audit.campaign as any;
    if (req.user?.role !== 'admin' && req.user?.id !== campaign.creator.toString()) {
      return next(new AppError('Not authorized to resolve findings', 401));
    }

    const finding = audit.findings.id(req.params.findingId);
    
    if (!finding) {
      return next(new AppError('Finding not found', 404));
    }

    finding.resolved = true;
    finding.resolvedAt = new Date();
    finding.resolvedBy = req.user.id;

    await audit.save();

    res.status(200).json({
      success: true,
      data: finding
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get audit statistics
// @route   GET /api/audits/stats
// @access  Private (Admin/Auditor)
router.get('/stats/overview', protect, authorize('admin', 'auditor'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { timeframe = '30d' } = req.query as any;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const matchQuery: any = {
      createdAt: { $gte: startDate }
    };

    // If user is auditor, only show their stats
    if (req.user?.role === 'auditor') {
      matchQuery.auditor = req.user.id;
    }

    const stats = await Audit.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          averageScore: { $avg: '$overallScore' }
        }
      }
    ]);

    const findingStats = await Audit.aggregate([
      { $match: matchQuery },
      { $unwind: '$findings' },
      {
        $group: {
          _id: '$findings.severity',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: ['$findings.resolved', 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        auditStats: stats,
        findingStats,
        timeframe
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
