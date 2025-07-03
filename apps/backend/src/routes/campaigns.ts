import express from 'express';
import { Campaign } from '../models/Campaign.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { campaignCacheMiddleware, invalidateCacheMiddleware } from '../middleware/cache.js';
import { AppError } from '../types/index.js';
import { AuthenticatedRequest, CampaignFilters } from '../types/index.js';

const router = express.Router();

// @desc    Get all campaigns
// @route   GET /api/campaigns
// @access  Public
router.get('/', campaignCacheMiddleware(), optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status = 'active',
      location,
      minAmount,
      maxAmount,
      isUrgent,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query as any;

    // Build query
    const query: any = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (isUrgent) query.isUrgent = isUrgent === 'true';
    
    if (minAmount || maxAmount) {
      query.targetAmount = {};
      if (minAmount) query.targetAmount.$gte = Number(minAmount);
      if (maxAmount) query.targetAmount.$lte = Number(maxAmount);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Only show verified campaigns to public
    if (!req.user || req.user.role === 'donor') {
      query.isVerified = true;
    }

    // Sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    const campaigns = await Campaign.find(query)
      .populate('creator', 'name profile.avatar')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Campaign.countDocuments(query);

    res.status(200).json({
      success: true,
      data: campaigns,
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

// @desc    Get single campaign
// @route   GET /api/campaigns/:id
// @access  Public
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('creator', 'name email profile walletAddress')
      .populate('milestones.verifiedBy', 'name')
      .populate('documents.uploadedBy', 'name');

    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }

    // Check if user can view this campaign
    if (!campaign.isVerified && 
        (!req.user || 
         (req.user.role !== 'admin' && 
          req.user.role !== 'auditor' && 
          req.user._id.toString() !== campaign.creator.toString()))) {
      return next(new AppError('Campaign not found', 404));
    }

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new campaign
// @route   POST /api/campaigns
// @access  Private (Charity/Admin)
router.post('/', protect, authorize('charity', 'admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    req.body.creator = req.user?.id;
    
    const campaign = await Campaign.create(req.body);

    res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update campaign
// @route   PUT /api/campaigns/:id
// @access  Private (Owner/Admin)
router.put('/:id', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    let campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }

    // Make sure user is campaign owner or admin
    if (campaign.creator.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return next(new AppError('Not authorized to update this campaign', 401));
    }

    // Don't allow updates to certain fields if campaign is active
    if (campaign.status === 'active') {
      const restrictedFields = ['targetAmount', 'endDate', 'category'];
      restrictedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          delete req.body[field];
        }
      });
    }

    campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete campaign
// @route   DELETE /api/campaigns/:id
// @access  Private (Owner/Admin)
router.delete('/:id', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }

    // Make sure user is campaign owner or admin
    if (campaign.creator.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return next(new AppError('Not authorized to delete this campaign', 401));
    }

    // Don't allow deletion if campaign has received donations
    if (campaign.raisedAmount > 0) {
      return next(new AppError('Cannot delete campaign that has received donations', 400));
    }

    await campaign.deleteOne();

    res.status(200).json({
      success: true,
      data: 'Campaign deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add campaign update
// @route   POST /api/campaigns/:id/updates
// @access  Private (Owner/Admin)
router.post('/:id/updates', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }

    // Make sure user is campaign owner or admin
    if (campaign.creator.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return next(new AppError('Not authorized to add updates to this campaign', 401));
    }

    const update = {
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date()
    };

    campaign.updates.push(update);
    await campaign.save();

    res.status(201).json({
      success: true,
      data: campaign.updates[campaign.updates.length - 1]
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Submit milestone for verification
// @route   POST /api/campaigns/:id/milestones/:milestoneId/submit
// @access  Private (Owner)
router.post('/:id/milestones/:milestoneId/submit', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }

    // Make sure user is campaign owner
    if (campaign.creator.toString() !== req.user?.id) {
      return next(new AppError('Not authorized to submit milestones for this campaign', 401));
    }

    const milestone = campaign.milestones.id(req.params.milestoneId);
    
    if (!milestone) {
      return next(new AppError('Milestone not found', 404));
    }

    if (milestone.status !== 'pending') {
      return next(new AppError('Milestone cannot be submitted', 400));
    }

    milestone.status = 'submitted';
    milestone.submittedAt = new Date();
    milestone.proofDocuments = req.body.proofDocuments || [];

    await campaign.save();

    res.status(200).json({
      success: true,
      data: milestone
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Verify milestone
// @route   POST /api/campaigns/:id/milestones/:milestoneId/verify
// @access  Private (Admin/Auditor)
router.post('/:id/milestones/:milestoneId/verify', protect, authorize('admin', 'auditor'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { approved, rejectionReason } = req.body;
    
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }

    const milestone = campaign.milestones.id(req.params.milestoneId);
    
    if (!milestone) {
      return next(new AppError('Milestone not found', 404));
    }

    if (milestone.status !== 'submitted') {
      return next(new AppError('Milestone is not submitted for verification', 400));
    }

    milestone.status = approved ? 'verified' : 'rejected';
    milestone.verifiedAt = new Date();
    milestone.verifiedBy = req.user?.id;
    
    if (!approved && rejectionReason) {
      milestone.rejectionReason = rejectionReason;
    }

    await campaign.save();

    res.status(200).json({
      success: true,
      data: milestone
    });
  } catch (error) {
    next(error);
  }
});

export default router;
