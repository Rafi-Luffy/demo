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
// Apply protection to all routes
router.use(auth_js_1.protect);
// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', async (req, res, next) => {
    try {
        const user = await User_js_1.User.findById(req.user?.id).select('-password');
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
// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', async (req, res, next) => {
    try {
        const allowedFields = [
            'name',
            'phone',
            'profile.bio',
            'profile.location',
            'profile.website',
            'profile.socialLinks',
            'profile.preferences'
        ];
        const updateData = {};
        // Only allow updating specific fields
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                if (field.includes('.')) {
                    const [parent, child] = field.split('.');
                    if (!updateData[parent])
                        updateData[parent] = {};
                    updateData[parent][child] = req.body[field];
                }
                else {
                    updateData[field] = req.body[field];
                }
            }
        });
        const user = await User_js_1.User.findByIdAndUpdate(req.user?.id, updateData, { new: true, runValidators: true }).select('-password');
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
// @desc    Upload profile picture
// @route   POST /api/users/avatar
// @access  Private
router.post('/avatar', async (req, res, next) => {
    try {
        const { avatarUrl } = req.body;
        if (!avatarUrl) {
            return next(new index_js_1.AppError('Avatar URL is required', 400));
        }
        const user = await User_js_1.User.findByIdAndUpdate(req.user?.id, { 'profile.avatar': avatarUrl }, { new: true, runValidators: true }).select('-password');
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
// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', async (req, res, next) => {
    try {
        // Mock user statistics (in production, aggregate from actual data)
        const stats = {
            totalDonated: 0,
            totalCampaigns: 0,
            totalVolunteerHours: 0,
            impactScore: 0,
            donationHistory: [],
            campaignHistory: []
        };
        res.status(200).json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        next(error);
    }
});
// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
router.delete('/account', async (req, res, next) => {
    try {
        const { confirmPassword } = req.body;
        const user = await User_js_1.User.findById(req.user?.id).select('+password');
        if (!user) {
            return next(new index_js_1.AppError('User not found', 404));
        }
        // Verify password
        const isMatch = await user.comparePassword(confirmPassword);
        if (!isMatch) {
            return next(new index_js_1.AppError('Invalid password', 401));
        }
        // In production, you might want to soft delete or anonymize data
        await user.deleteOne();
        res.status(200).json({
            success: true,
            data: 'Account deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map