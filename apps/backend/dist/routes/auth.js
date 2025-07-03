"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const User_js_1 = require("../models/User.js");
const index_js_1 = require("../types/index.js");
const jwt_js_1 = require("../utils/jwt.js");
const auth_js_1 = require("../middleware/auth.js");
const router = express_1.default.Router();
// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password, role, walletAddress } = req.body;
        // Check if user exists
        const existingUser = await User_js_1.User.findOne({
            $or: [{ email }, { walletAddress: walletAddress || null }]
        });
        if (existingUser) {
            return next(new index_js_1.AppError('User already exists with this email or wallet address', 400));
        }
        // Create user
        const user = await User_js_1.User.create({
            name,
            email,
            password,
            role: role || 'donor',
            walletAddress,
            profile: {
                preferences: {
                    language: 'en',
                    notifications: {
                        email: true,
                        sms: false,
                        push: true
                    },
                    privacy: {
                        showDonations: false,
                        showProfile: true
                    }
                }
            }
        });
        (0, jwt_js_1.sendTokenResponse)(user, 201, res);
    }
    catch (error) {
        next(error);
    }
});
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Validate email & password
        if (!email || !password) {
            return next(new index_js_1.AppError('Please provide an email and password', 400));
        }
        // Check for user
        const user = await User_js_1.User.findOne({ email }).select('+password');
        if (!user) {
            return next(new index_js_1.AppError('Invalid credentials', 401));
        }
        // Check if password matches
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return next(new index_js_1.AppError('Invalid credentials', 401));
        }
        // Update last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });
        (0, jwt_js_1.sendTokenResponse)(user, 200, res);
    }
    catch (error) {
        next(error);
    }
});
// @desc    Wallet login
// @route   POST /api/auth/wallet-login
// @access  Public
router.post('/wallet-login', async (req, res, next) => {
    try {
        const { walletAddress, signature, message } = req.body;
        if (!walletAddress || !signature || !message) {
            return next(new index_js_1.AppError('Wallet address, signature, and message are required', 400));
        }
        // Find user by wallet address
        let user = await User_js_1.User.findOne({ walletAddress: walletAddress.toLowerCase() });
        if (!user) {
            // Create new user with wallet
            user = await User_js_1.User.create({
                name: `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
                email: `${walletAddress}@wallet.local`,
                password: crypto_1.default.randomBytes(32).toString('hex'), // Random password
                role: 'donor',
                walletAddress: walletAddress.toLowerCase(),
                isEmailVerified: false,
                profile: {
                    preferences: {
                        language: 'en',
                        notifications: {
                            email: false,
                            sms: false,
                            push: true
                        },
                        privacy: {
                            showDonations: false,
                            showProfile: true
                        }
                    }
                }
            });
        }
        // Update last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });
        (0, jwt_js_1.sendTokenResponse)(user, 200, res);
    }
    catch (error) {
        next(error);
    }
});
// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', auth_js_1.protect, async (req, res, next) => {
    try {
        const user = await User_js_1.User.findById(req.user?.id);
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        next(error);
    }
});
// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
router.put('/updatedetails', auth_js_1.protect, async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            'profile.bio': req.body.bio,
            'profile.location': req.body.location,
            'profile.website': req.body.website,
            'profile.socialLinks': req.body.socialLinks,
            'profile.preferences': req.body.preferences
        };
        // Remove undefined fields
        Object.keys(fieldsToUpdate).forEach(key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]);
        const user = await User_js_1.User.findByIdAndUpdate(req.user?.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        next(error);
    }
});
// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
router.put('/updatepassword', auth_js_1.protect, async (req, res, next) => {
    try {
        const user = await User_js_1.User.findById(req.user?.id).select('+password');
        if (!user) {
            return next(new index_js_1.AppError('User not found', 404));
        }
        // Check current password
        if (!(await user.comparePassword(req.body.currentPassword))) {
            return next(new index_js_1.AppError('Password is incorrect', 401));
        }
        user.password = req.body.newPassword;
        await user.save();
        (0, jwt_js_1.sendTokenResponse)(user, 200, res);
    }
    catch (error) {
        next(error);
    }
});
// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return next(new index_js_1.AppError('Refresh token is required', 400));
        }
        try {
            const decoded = (0, jwt_js_1.verifyRefreshToken)(refreshToken);
            const user = await User_js_1.User.findById(decoded.id);
            if (!user) {
                return next(new index_js_1.AppError('Invalid refresh token', 401));
            }
            const accessToken = (0, jwt_js_1.generateAccessToken)(user._id);
            res.status(200).json({
                success: true,
                data: {
                    accessToken,
                    expiresIn: 3600
                }
            });
        }
        catch (error) {
            return next(new index_js_1.AppError('Invalid refresh token', 401));
        }
    }
    catch (error) {
        next(error);
    }
});
// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
router.get('/logout', (req, res) => {
    res.cookie('refreshToken', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        data: 'User logged out successfully'
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map