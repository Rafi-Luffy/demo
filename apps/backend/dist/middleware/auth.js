"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_js_1 = require("../models/User.js");
const index_js_1 = require("../types/index.js");
const protect = async (req, res, next) => {
    try {
        let token;
        // Check for token in header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Make sure token exists
        if (!token) {
            return next(new index_js_1.AppError('Not authorized to access this route', 401));
        }
        try {
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            // Get user from token
            const user = await User_js_1.User.findById(decoded.id).select('-password');
            if (!user) {
                return next(new index_js_1.AppError('No user found with this ID', 404));
            }
            req.user = user;
            next();
        }
        catch (error) {
            return next(new index_js_1.AppError('Not authorized to access this route', 401));
        }
    }
    catch (error) {
        next(error);
    }
};
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new index_js_1.AppError('Not authorized to access this route', 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new index_js_1.AppError(`User role ${req.user.role} is not authorized to access this route`, 403));
        }
        next();
    };
};
exports.authorize = authorize;
const optionalAuth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                const user = await User_js_1.User.findById(decoded.id).select('-password');
                if (user) {
                    req.user = user;
                }
            }
            catch (error) {
                // Token is invalid, but that's okay for optional auth
                console.log('Invalid token in optional auth:', error);
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map