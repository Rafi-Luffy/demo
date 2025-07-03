import express from 'express';
import { User } from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { AppError } from '../types/index.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = express.Router();

// Apply protection and admin authorization to all routes
router.use(protect);
router.use(authorize('admin'));

// @desc    Get dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
router.get('/dashboard', async (req: AuthenticatedRequest, res, next) => {
  try {
    const [
      totalUsers,
      totalCampaigns,
      totalDonations,
      pendingVerifications
    ] = await Promise.all([
      User.countDocuments(),
      // Campaign.countDocuments(),
      // Donation.countDocuments({ status: 'confirmed' }),
      // Campaign.countDocuments({ isVerified: false, status: 'pending_approval' })
      0, 0, 0 // Temporary until models are fully implemented
    ]);

    // Get user role distribution
    const userRoles = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent activities (mock data for now)
    const recentActivities = [
      {
        type: 'user_registered',
        description: 'New user registered',
        timestamp: new Date(),
        details: { role: 'donor' }
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalCampaigns,
          totalDonations,
          pendingVerifications
        },
        userRoles: userRoles.reduce((acc, role) => {
          acc[role._id] = role.count;
          return acc;
        }, {}),
        recentActivities
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get('/users', async (req: AuthenticatedRequest, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      kycStatus,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query as any;

    // Build query
    const query: any = {};
    if (role) query.role = role;
    if (kycStatus) query.kycStatus = kycStatus;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
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

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
router.put('/users/:id/status', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { kycStatus, isEmailVerified, isPhoneVerified } = req.body;

    const updateFields: any = {};
    if (kycStatus) updateFields.kycStatus = kycStatus;
    if (isEmailVerified !== undefined) updateFields.isEmailVerified = isEmailVerified;
    if (isPhoneVerified !== undefined) updateFields.isPhoneVerified = isPhoneVerified;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
router.delete('/users/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Prevent deletion of admin users (except self)
    if (user.role === 'admin' && user._id.toString() !== req.user?.id) {
      return next(new AppError('Cannot delete other admin users', 403));
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
router.get('/stats', async (req: AuthenticatedRequest, res, next) => {
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

    // User registration stats
    const userStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Mock campaign and donation stats
    const campaignStats = [];
    const donationStats = [];

    res.status(200).json({
      success: true,
      data: {
        timeframe,
        userRegistrations: userStats,
        campaigns: campaignStats,
        donations: donationStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update platform settings
// @route   PUT /api/admin/settings
// @access  Private (Admin only)
router.put('/settings', async (req: AuthenticatedRequest, res, next) => {
  try {
    const settings = req.body;

    // In production, store these in a settings collection
    // For now, return the settings as confirmation
    res.status(200).json({
      success: true,
      data: {
        ...settings,
        updatedBy: req.user?.id,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get system health
// @route   GET /api/admin/health
// @access  Private (Admin only)
router.get('/health', async (req: AuthenticatedRequest, res, next) => {
  try {
    // Check database connection
    const dbHealth = await User.findOne().select('_id').lean();
    
    // Mock blockchain health check
    const blockchainHealth = {
      ethereum: { connected: true, latency: 150 },
      polygon: { connected: true, latency: 80 }
    };

    // Mock IPFS health check
    const ipfsHealth = {
      connected: true,
      peerCount: 45,
      storageUsed: '2.4 GB'
    };

    res.status(200).json({
      success: true,
      data: {
        database: {
          connected: !!dbHealth,
          status: 'healthy'
        },
        blockchain: blockchainHealth,
        ipfs: ipfsHealth,
        api: {
          status: 'healthy',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: process.env.npm_package_version || '1.0.0'
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Send system notification
// @route   POST /api/admin/notifications
// @access  Private (Admin only)
router.post('/notifications', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { type, title, message, targetUsers, priority = 'medium' } = req.body;

    // In production, this would create notifications and send them
    const notification = {
      type,
      title,
      message,
      priority,
      targetUsers: targetUsers || 'all',
      sentBy: req.user?.id,
      sentAt: new Date()
    };

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
});

export default router;
