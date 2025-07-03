import express from 'express';
import { Donation } from '../models/Donation.js';
import { Campaign } from '../models/Campaign.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { AppError } from '../types/index.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = express.Router();

// @desc    Get all donations
// @route   GET /api/donations
// @access  Private
router.get('/', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      campaignId,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query as any;

    // Build query based on user role
    const query: any = {};
    
    if (req.user?.role === 'donor') {
      query.donor = req.user.id;
    } else if (req.user?.role === 'charity') {
      // Get campaigns created by this charity
      const campaigns = await Campaign.find({ creator: req.user.id }).select('_id');
      query.campaign = { $in: campaigns.map(c => c._id) };
    }
    
    if (campaignId) query.campaign = campaignId;
    if (status) query.status = status;

    // Sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    const donations = await Donation.find(query)
      .populate('donor', 'name profile.avatar')
      .populate('campaign', 'title imageUrl creator')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Filter out anonymous donations for non-admin users
    const filteredDonations = donations.map(donation => {
      if (donation.isAnonymous && 
          req.user?.role !== 'admin' && 
          req.user?.id !== donation.donor._id.toString()) {
        return {
          ...donation.toObject(),
          donor: {
            name: 'Anonymous',
            profile: { avatar: null }
          }
        };
      }
      return donation;
    });

    const total = await Donation.countDocuments(query);

    res.status(200).json({
      success: true,
      data: filteredDonations,
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

// @desc    Get single donation
// @route   GET /api/donations/:id
// @access  Private
router.get('/:id', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email profile')
      .populate('campaign', 'title description creator');

    if (!donation) {
      return next(new AppError('Donation not found', 404));
    }

    // Check if user can view this donation
    if (req.user?.role !== 'admin' &&
        req.user?.id !== donation.donor._id.toString() &&
        req.user?.id !== donation.campaign.creator.toString()) {
      return next(new AppError('Not authorized to view this donation', 401));
    }

    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new donation
// @route   POST /api/donations
// @access  Private
router.post('/', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { campaignId, amount, currency, message, isAnonymous, transactionHash } = req.body;

    // Check if campaign exists and is active
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }

    if (campaign.status !== 'active') {
      return next(new AppError('Campaign is not accepting donations', 400));
    }

    // Check if campaign has ended
    if (campaign.endDate && new Date() > campaign.endDate) {
      return next(new AppError('Campaign has ended', 400));
    }

    // Check for duplicate transaction hash
    if (transactionHash) {
      const existingDonation = await Donation.findOne({ transactionHash });
      if (existingDonation) {
        return next(new AppError('Transaction already processed', 400));
      }
    }

    // Create donation
    const donation = await Donation.create({
      donor: req.user?.id,
      campaign: campaignId,
      amount,
      currency: currency || 'ETH',
      message,
      isAnonymous: isAnonymous || false,
      transactionHash,
      blockNumber: req.body.blockNumber,
      gasUsed: req.body.gasUsed,
      gasFee: req.body.gasFee,
      status: transactionHash ? 'confirmed' : 'pending'
    });

    // Update campaign raised amount and donor count
    if (donation.status === 'confirmed') {
      await Campaign.findByIdAndUpdate(campaignId, {
        $inc: { 
          raisedAmount: amount,
          donorCount: 1
        }
      });
    }

    const populatedDonation = await Donation.findById(donation._id)
      .populate('donor', 'name profile.avatar')
      .populate('campaign', 'title imageUrl');

    res.status(201).json({
      success: true,
      data: populatedDonation
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update donation status (for blockchain confirmations)
// @route   PUT /api/donations/:id/status
// @access  Private (Admin only)
router.put('/:id/status', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { status, blockNumber, gasUsed, gasFee } = req.body;

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return next(new AppError('Donation not found', 404));
    }

    const oldStatus = donation.status;
    
    donation.status = status;
    if (blockNumber) donation.blockNumber = blockNumber;
    if (gasUsed) donation.gasUsed = gasUsed;
    if (gasFee) donation.gasFee = gasFee;

    await donation.save();

    // Update campaign totals if status changed to confirmed
    if (oldStatus !== 'confirmed' && status === 'confirmed') {
      await Campaign.findByIdAndUpdate(donation.campaign, {
        $inc: { 
          raisedAmount: donation.amount,
          donorCount: 1
        }
      });
    }
    // Update campaign totals if status changed from confirmed
    else if (oldStatus === 'confirmed' && status !== 'confirmed') {
      await Campaign.findByIdAndUpdate(donation.campaign, {
        $inc: { 
          raisedAmount: -donation.amount,
          donorCount: -1
        }
      });
    }

    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get donation analytics
// @route   GET /api/donations/analytics
// @access  Private
router.get('/analytics/stats', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { campaignId, timeframe = '30d' } = req.query as any;

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

    // Build match query
    const matchQuery: any = {
      createdAt: { $gte: startDate },
      status: 'confirmed'
    };

    if (campaignId) {
      matchQuery.campaign = campaignId;
    } else if (req.user?.role === 'charity') {
      // Get campaigns created by this charity
      const campaigns = await Campaign.find({ creator: req.user.id }).select('_id');
      matchQuery.campaign = { $in: campaigns.map(c => c._id) };
    } else if (req.user?.role === 'donor') {
      matchQuery.donor = req.user.id;
    }

    const analytics = await Donation.aggregate([
      { $match: matchQuery },
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

    // Get daily breakdown
    const dailyStats = await Donation.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: analytics[0] || {
          totalAmount: 0,
          totalDonations: 0,
          averageDonation: 0,
          uniqueDonorCount: 0
        },
        dailyStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Generate tax receipt
// @route   GET /api/donations/:id/receipt
// @access  Private
router.get('/:id/receipt', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email profile')
      .populate('campaign', 'title creator');

    if (!donation) {
      return next(new AppError('Donation not found', 404));
    }

    // Check if user can access this receipt
    if (req.user?.id !== donation.donor._id.toString() && req.user?.role !== 'admin') {
      return next(new AppError('Not authorized to access this receipt', 401));
    }

    // Generate receipt if not already generated
    if (!donation.taxReceiptGenerated) {
      await donation.generateTaxReceipt();
    }

    res.status(200).json({
      success: true,
      data: {
        receiptId: donation.taxReceiptId,
        donation: donation,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
