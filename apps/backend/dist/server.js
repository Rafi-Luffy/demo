"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// import mongoSanitize from 'express-mongo-sanitize';
// import { xss } from 'express-xss-sanitizer';
const dotenv_1 = __importDefault(require("dotenv"));
const database_js_1 = __importDefault(require("./config/database.js"));
const errorHandler_js_1 = __importDefault(require("./middleware/errorHandler.js"));
const notFound_js_1 = require("./middleware/notFound.js");
const auth_js_1 = __importDefault(require("./routes/auth.js"));
const users_js_1 = __importDefault(require("./routes/users.js"));
const campaigns_js_1 = __importDefault(require("./routes/campaigns.js"));
const donations_js_1 = __importDefault(require("./routes/donations.js"));
const audits_js_1 = __importDefault(require("./routes/audits.js"));
const blockchain_js_1 = __importDefault(require("./routes/blockchain.js"));
const ipfs_js_1 = __importDefault(require("./routes/ipfs.js"));
const admin_js_1 = __importDefault(require("./routes/admin.js"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Connect to MongoDB
(0, database_js_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "https://api.web3.storage", "wss:", "ws:"],
        },
    },
}));
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://yourapp.com']
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit login attempts
    message: {
        error: 'Too many authentication attempts, please try again later.'
    }
});
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Compression middleware
app.use((0, compression_1.default)());
// Data sanitization
// app.use(mongoSanitize()); // Against NoSQL injection
// app.use(xss()); // Against XSS attacks
// Trust proxy for Heroku, Railway, etc.
app.set('trust proxy', 1);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});
// API Routes
app.use('/api/auth', auth_js_1.default);
app.use('/api/users', users_js_1.default);
app.use('/api/campaigns', campaigns_js_1.default);
app.use('/api/donations', donations_js_1.default);
app.use('/api/audits', audits_js_1.default);
app.use('/api/blockchain', blockchain_js_1.default);
app.use('/api/ipfs', ipfs_js_1.default);
app.use('/api/admin', admin_js_1.default);
// Catch 404 and forward to error handler
app.use(notFound_js_1.notFound);
// Error handling middleware (must be last)
app.use(errorHandler_js_1.default);
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED PROMISE REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    process.exit(0);
});
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map