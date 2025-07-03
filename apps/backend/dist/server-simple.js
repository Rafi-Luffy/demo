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
const dotenv_1 = __importDefault(require("dotenv"));
const database_js_1 = __importDefault(require("./config/database.js"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Connect to MongoDB
(0, database_js_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
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
    max: process.env.NODE_ENV === 'production' ? 100 : 1000,
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/', limiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Compression middleware
app.use((0, compression_1.default)());
// Trust proxy
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
// API status endpoint
app.get('/api/status', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'DilSeDaan API is live',
        version: '1.0.0',
        features: [
            'User Authentication (JWT)',
            'Campaign Management',
            'Donation Processing',
            'Blockchain Integration',
            'IPFS Document Storage',
            'Audit System',
            'Admin Dashboard',
            'Real-time Transparency'
        ],
        timestamp: new Date().toISOString()
    });
});
// Mock campaign data endpoint
app.get('/api/campaigns', (req, res) => {
    const mockCampaigns = [
        {
            id: '1',
            title: 'Education for Rural Children',
            description: 'Supporting education in remote villages',
            targetAmount: 100000,
            raisedAmount: 45000,
            donorCount: 120,
            category: 'education',
            location: 'Rajasthan, India',
            imageUrl: 'https://example.com/image1.jpg',
            isVerified: true,
            status: 'active',
            createdAt: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        {
            id: '2',
            title: 'Clean Water Initiative',
            description: 'Providing clean water access to villages',
            targetAmount: 200000,
            raisedAmount: 89000,
            donorCount: 250,
            category: 'water-sanitation',
            location: 'West Bengal, India',
            imageUrl: 'https://example.com/image2.jpg',
            isVerified: true,
            status: 'active',
            createdAt: new Date(),
            endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
        }
    ];
    res.status(200).json({
        success: true,
        data: mockCampaigns,
        pagination: {
            page: 1,
            limit: 10,
            total: 2,
            pages: 1
        }
    });
});
// Mock blockchain status endpoint
app.get('/api/blockchain/status', (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            ethereum: {
                isConnected: true,
                latestBlock: 18500000,
                network: 'mainnet'
            },
            polygon: {
                isConnected: true,
                latestBlock: 50000000,
                network: 'mainnet'
            }
        }
    });
});
// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
});
// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});
const server = app.listen(PORT, () => {
    console.log(`🚀 DilSeDaan API Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API status: http://localhost:${PORT}/api/status`);
    console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
});
exports.default = app;
//# sourceMappingURL=server-simple.js.map