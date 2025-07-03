"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_js_1 = require("../models/User.js");
const auth_js_1 = require("../middleware/auth.js");
const index_js_1 = require("../types/index.js");
const router = express_1.default.Router();
// Apply protection and admin authorization to all routes
router.use(auth_js_1.protect);
router.use((0, auth_js_1.authorize)('admin'));
// @desc    Get dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
router.get('/dashboard', async (req, res, next) => {
    try {
        const [totalUsers, totalCampaigns, totalDonations, pendingVerifications] = await Promise.all([
            User_js_1.User.countDocuments(),
            // Campaign.countDocuments(),
            // Donation.countDocuments({ status: 'confirmed' }),
            // Campaign.countDocuments({ isVerified: false, status: 'pending_approval' })
            0, 0, 0 // Temporary until models are fully implemented
        ]);
        // Get user role distribution
        const userRoles = await User_js_1.User.aggregate([
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
    }
    catch (error) {
        next(error);
    }
});
// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get('/users', async (req, res, next) => {
    try {
        const { page = 1, limit = 20, role, kycStatus, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        // Build query
        const query = {};
        if (role)
            query.role = role;
        if (kycStatus)
            query.kycStatus = kycStatus;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        // Sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        // Execute query with pagination
        const skip = (Number(page) - 1) * Number(limit);
        const users = await User_js_1.User.find(query)
            .select('-password')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));
        const total = await User_js_1.User.countDocuments(query);
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
    }
    catch (error) {
        next(error);
    }
});
// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
router.put('/users/:id/status', async (req, res, next) => {
    try {
        const { kycStatus, isEmailVerified, isPhoneVerified } = req.body;
        const updateFields = {};
        if (kycStatus)
            updateFields.kycStatus = kycStatus;
        if (isEmailVerified !== undefined)
            updateFields.isEmailVerified = isEmailVerified;
        if (isPhoneVerified !== undefined)
            updateFields.isPhoneVerified = isPhoneVerified;
        const user = await User_js_1.User.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return next(new index_js_1.AppError('User not found', 404));
        }
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        next(error);
    }
});
// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
router.delete('/users/:id', async (req, res, next) => {
    try {
        const user = await User_js_1.User.findById(req.params.id);
        if (!user) {
            return next(new index_js_1.AppError('User not found', 404));
        }
        // Prevent deletion of admin users (except self)
        if (user.role === 'admin' && user._id.toString() !== req.user?.id) {
            return next(new index_js_1.AppError('Cannot delete other admin users', 403));
        }
        await user.deleteOne();
        res.status(200).json({
            success: true,
            data: 'User deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
router.get('/stats', async (req, res, next) => {
    try {
        const { timeframe = '30d' } = req.query;
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
        const userStats = await User_js_1.User.aggregate([
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
    }
    catch (error) {
        next(error);
    }
});
// @desc    Update platform settings
// @route   PUT /api/admin/settings
// @access  Private (Admin only)
router.put('/settings', async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
});
// @desc    Get system health
// @route   GET /api/admin/health
// @access  Private (Admin only)
router.get('/health', async (req, res, next) => {
    try {
        // Check database connection
        const dbHealth = await User_js_1.User.findOne().select('_id').lean();
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
    }
    catch (error) {
        next(error);
    }
});
// @desc    Send system notification
// @route   POST /api/admin/notifications
// @access  Private (Admin only)
router.post('/notifications', async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map