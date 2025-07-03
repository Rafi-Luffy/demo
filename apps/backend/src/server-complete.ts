import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dilsedaan');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.web3.storage", "wss:", "ws:", "https://polygon-rpc.com"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourapp.com'] 
    : ['http://localhost:3000', 'http://localhost:3003'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for demo
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Performance monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Polygon Web3 Setup
let provider: ethers.JsonRpcProvider;
let contract: ethers.Contract;

const initializeBlockchain = () => {
  try {
    provider = new ethers.JsonRpcProvider(
      process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com'
    );
    
    const contractABI = [
      // Add your contract ABI here
      "function getAllCampaigns() view returns (tuple(uint256 id, string title, string description, uint256 targetAmount, uint256 raisedAmount, uint256 deadline, address creator, uint8 category, uint8 status, string ipfsHash, uint256 donorCount, uint256 createdAt, bool isVerified, uint256[] milestoneIds, string location, uint256 beneficiaryCount)[])",
      "function createCampaign(string title, string description, uint256 targetAmount, uint256 deadline, uint8 category, string ipfsHash, string location, uint256 beneficiaryCount) returns (uint256)",
      "function donate(uint256 campaignId, string message, bool isAnonymous, address token) payable",
      "function registerVolunteer(string name, string email, string skills, string location, string ipfsProfile) returns (uint256)",
      "function getVolunteersByStatus(uint8 status) view returns (tuple(uint256 id, address volunteer, string name, string email, string skills, string location, uint8 status, uint256 hoursContributed, uint256[] assignedCampaigns, uint256 joinedAt, string ipfsProfile)[])",
      "function getCampaignMilestones(uint256 campaignId) view returns (tuple(uint256 id, uint256 campaignId, string title, string description, uint256 targetAmount, uint256 currentAmount, uint256 deadline, bool isCompleted, string proofHash, uint256 createdAt)[])",
      "function getContractStats() view returns (uint256, uint256, uint256, uint256)"
    ];

    contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS || '',
      contractABI,
      provider
    );

    console.log('✅ Blockchain initialized successfully');
  } catch (error) {
    console.error('❌ Blockchain initialization error:', error);
  }
};

// Initialize blockchain connection
initializeBlockchain();

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    blockchain: !!contract,
    database: mongoose.connection.readyState === 1
  });
});

// ===== CAMPAIGN ROUTES =====
app.get('/api/campaigns', async (req, res) => {
  try {
    if (!contract) {
      return res.status(500).json({ error: 'Blockchain not connected' });
    }

    const campaigns = await contract.getAllCampaigns();
    const formattedCampaigns = campaigns.map((campaign: any) => ({
      id: campaign.id.toString(),
      title: campaign.title,
      description: campaign.description,
      targetAmount: ethers.formatEther(campaign.targetAmount),
      raisedAmount: ethers.formatEther(campaign.raisedAmount),
      deadline: new Date(campaign.deadline.toNumber() * 1000),
      creator: campaign.creator,
      category: campaign.category,
      status: campaign.status,
      imageUrl: `https://gateway.pinata.cloud/ipfs/${campaign.ipfsHash}` || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400',
      donorCount: campaign.donorCount.toNumber(),
      createdAt: new Date(campaign.createdAt.toNumber() * 1000),
      isVerified: campaign.isVerified,
      location: campaign.location,
      beneficiaryCount: campaign.beneficiaryCount.toNumber(),
      isUrgent: campaign.deadline.toNumber() * 1000 < Date.now() + (7 * 24 * 60 * 60 * 1000) // Urgent if less than 7 days left
    }));

    res.json(formattedCampaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    
    // Return mock data if blockchain fails
    const mockCampaigns = [
      {
        id: '1',
        title: 'Feed 1000 Children in Delhi',
        description: 'Help us provide nutritious meals to underprivileged children in Delhi slums. Every meal counts and brings hope to these beautiful souls.',
        imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        category: 'Food & Nutrition',
        raisedAmount: 75000,
        targetAmount: 100000,
        donorCount: 127,
        location: 'Delhi, India',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isUrgent: false,
        isVerified: true,
        beneficiaryCount: 1000
      },
      {
        id: '2',
        title: 'Education for Rural Girls',
        description: 'Support education initiatives for girls in rural Rajasthan. Breaking barriers and building futures.',
        imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0a501ba2fe8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        category: 'Education',
        raisedAmount: 45000,
        targetAmount: 250000,
        donorCount: 89,
        location: 'Rajasthan, India',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isUrgent: false,
        isVerified: true,
        beneficiaryCount: 500
      },
      {
        id: '3',
        title: 'Medical Emergency Fund',
        description: 'Emergency medical assistance for families who cannot afford treatment. Your donation can save lives.',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        category: 'Healthcare',
        raisedAmount: 180000,
        targetAmount: 500000,
        donorCount: 234,
        location: 'Mumbai, India',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isUrgent: true,
        isVerified: true,
        beneficiaryCount: 200
      }
    ];

    res.json(mockCampaigns);
  }
});

app.post('/api/campaigns', async (req, res) => {
  try {
    const {
      title,
      description,
      targetAmount,
      deadline,
      category,
      ipfsHash,
      location,
      beneficiaryCount
    } = req.body;

    // Validate required fields
    if (!title || !description || !targetAmount || !deadline || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!contract) {
      return res.status(500).json({ error: 'Blockchain not connected' });
    }

    // For demo purposes, return success
    const mockCampaignId = Date.now().toString();
    
    res.json({
      success: true,
      campaignId: mockCampaignId,
      message: 'Campaign created successfully',
      data: {
        id: mockCampaignId,
        title,
        description,
        targetAmount,
        deadline,
        category,
        location,
        beneficiaryCount
      }
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// ===== VOLUNTEER ROUTES =====
app.get('/api/volunteers', async (req, res) => {
  try {
    // Mock volunteer data for demo
    const mockVolunteers = [
      {
        id: '1',
        name: 'Priya Sharma',
        email: 'priya@example.com',
        skills: 'Teaching, Cooking, Event Management',
        location: 'Delhi, India',
        status: 'approved',
        hoursContributed: 45,
        joinedAt: new Date('2024-01-15'),
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b3ac?w=100&h=100&fit=crop&crop=face'
      },
      {
        id: '2',
        name: 'Raj Patel',
        email: 'raj@example.com',
        skills: 'Medical Assistance, Transport',
        location: 'Mumbai, India',
        status: 'active',
        hoursContributed: 78,
        joinedAt: new Date('2024-02-20'),
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      },
      {
        id: '3',
        name: 'Anjali Singh',
        email: 'anjali@example.com',
        skills: 'Social Media, Content Creation',
        location: 'Bangalore, India',
        status: 'pending',
        hoursContributed: 0,
        joinedAt: new Date('2024-06-28'),
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
      }
    ];

    const { status } = req.query;
    let filteredVolunteers = mockVolunteers;

    if (status) {
      filteredVolunteers = mockVolunteers.filter(v => v.status === status);
    }

    res.json(filteredVolunteers);
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
});

app.post('/api/volunteers', async (req, res) => {
  try {
    const { name, email, skills, location, phone, motivation } = req.body;

    // Validate required fields
    if (!name || !email || !skills || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // For demo purposes, return success
    const volunteerId = Date.now().toString();
    
    res.json({
      success: true,
      volunteerId,
      message: 'Volunteer registration successful! You will be contacted soon.',
      data: {
        id: volunteerId,
        name,
        email,
        skills,
        location,
        phone,
        motivation,
        status: 'pending',
        joinedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error registering volunteer:', error);
    res.status(500).json({ error: 'Failed to register volunteer' });
  }
});

// ===== DONATION ROUTES =====
app.post('/api/donations', async (req, res) => {
  try {
    const { campaignId, amount, message, isAnonymous, donorName, donorEmail } = req.body;

    if (!campaignId || !amount) {
      return res.status(400).json({ error: 'Campaign ID and amount are required' });
    }

    // For demo purposes, simulate successful donation
    const donationId = Date.now().toString();
    
    res.json({
      success: true,
      donationId,
      message: 'Donation successful! Thank you for your kindness.',
      data: {
        id: donationId,
        campaignId,
        amount,
        message,
        isAnonymous,
        donorName: isAnonymous ? 'Anonymous' : donorName,
        timestamp: new Date(),
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}` // Mock hash
      }
    });
  } catch (error) {
    console.error('Error processing donation:', error);
    res.status(500).json({ error: 'Failed to process donation' });
  }
});

// ===== BLOCKCHAIN ROUTES =====
app.get('/api/blockchain/stats', async (req, res) => {
  try {
    if (!contract) {
      return res.json({
        totalCampaigns: 3,
        totalDonations: 450,
        totalVolunteers: 23,
        totalMilestones: 8,
        totalRaised: '₹3,45,000',
        isConnected: false
      });
    }

    const [totalCampaigns, totalDonations, totalVolunteers, totalMilestones] = await contract.getContractStats();
    
    res.json({
      totalCampaigns: totalCampaigns.toNumber(),
      totalDonations: totalDonations.toNumber(),
      totalVolunteers: totalVolunteers.toNumber(),
      totalMilestones: totalMilestones.toNumber(),
      isConnected: true
    });
  } catch (error) {
    console.error('Error fetching blockchain stats:', error);
    res.json({
      totalCampaigns: 3,
      totalDonations: 450,
      totalVolunteers: 23,
      totalMilestones: 8,
      totalRaised: '₹3,45,000',
      isConnected: false
    });
  }
});

// ===== MILESTONES ROUTES =====
app.get('/api/campaigns/:campaignId/milestones', async (req, res) => {
  try {
    const { campaignId } = req.params;

    // Mock milestone data
    const mockMilestones = [
      {
        id: '1',
        campaignId,
        title: 'Purchase Food Supplies',
        description: 'Buy rice, dal, and vegetables for 500 meals',
        targetAmount: 50000,
        currentAmount: 35000,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        isCompleted: false,
        createdAt: new Date('2024-06-01')
      },
      {
        id: '2',
        campaignId,
        title: 'Distribute Meals',
        description: 'Distribute meals to children in 5 locations',
        targetAmount: 50000,
        currentAmount: 15000,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        isCompleted: false,
        createdAt: new Date('2024-06-01')
      }
    ];

    res.json(mockMilestones);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ error: 'Failed to fetch milestones' });
  }
});

// ===== ADMIN ROUTES =====
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const dashboardData = {
      summary: {
        totalCampaigns: 3,
        activeCampaigns: 2,
        totalDonations: 450,
        totalVolunteers: 23,
        pendingVolunteers: 5,
        totalRaised: 345000,
        monthlyGrowth: 23.5
      },
      recentCampaigns: [
        {
          id: '1',
          title: 'Feed 1000 Children in Delhi',
          creator: 'Priya Foundation',
          status: 'active',
          raised: 75000,
          target: 100000,
          createdAt: new Date('2024-06-15')
        }
      ],
      recentDonations: [
        {
          id: '1',
          amount: 5000,
          donor: 'Anonymous',
          campaign: 'Feed 1000 Children',
          timestamp: new Date()
        }
      ],
      pendingApprovals: {
        volunteers: 5,
        campaigns: 2
      }
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// ===== TRANSPARENCY ROUTES =====
app.get('/api/transparency/audit-trail', async (req, res) => {
  try {
    const auditTrail = [
      {
        id: '1',
        action: 'Campaign Created',
        entity: 'Feed 1000 Children in Delhi',
        user: 'Priya Foundation',
        timestamp: new Date('2024-06-15T10:30:00Z'),
        transactionHash: '0xabc123...',
        details: 'New campaign created with target of ₹1,00,000'
      },
      {
        id: '2',
        action: 'Donation Received',
        entity: 'Campaign #1',
        user: 'Anonymous Donor',
        timestamp: new Date('2024-06-16T14:22:00Z'),
        transactionHash: '0xdef456...',
        details: 'Donation of ₹5,000 received'
      },
      {
        id: '3',
        action: 'Milestone Completed',
        entity: 'Purchase Food Supplies',
        user: 'Priya Foundation',
        timestamp: new Date('2024-06-20T09:15:00Z'),
        transactionHash: '0xghi789...',
        details: 'Milestone 1 marked as completed with proof uploaded'
      }
    ];

    res.json(auditTrail);
  } catch (error) {
    console.error('Error fetching audit trail:', error);
    res.status(500).json({ error: 'Failed to fetch audit trail' });
  }
});

// ===== IMPACT ROUTES =====
app.get('/api/impact/stories', async (req, res) => {
  try {
    const impactStories = [
      {
        id: '1',
        title: 'Padhega India, Tabhi Toh Badhega India!',
        description: 'Your ₹300 helped Ravi from a Delhi slum get his school books. Now he dreams of becoming an engineer!',
        image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        impact: 'Education',
        hearts: 456,
        campaignId: '2',
        beneficiary: 'Ravi Kumar',
        location: 'Delhi',
        date: new Date('2024-05-15')
      },
      {
        id: '2',
        title: 'Ek Thali Khushiyon Ki',
        description: 'Thanks to 89 donors, street children in Mumbai get hot meals daily. No child sleeps hungry anymore.',
        image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        impact: 'Food & Nutrition',
        hearts: 623,
        campaignId: '1',
        beneficiary: 'Street Children Community',
        location: 'Mumbai',
        date: new Date('2024-06-01')
      }
    ];

    res.json(impactStories);
  } catch (error) {
    console.error('Error fetching impact stories:', error);
    res.status(500).json({ error: 'Failed to fetch impact stories' });
  }
});

// ===== IPFS ROUTES =====
app.post('/api/ipfs/upload', async (req, res) => {
  try {
    // Mock IPFS upload
    const mockHash = `Qm${Math.random().toString(36).substr(2, 44)}`;
    
    res.json({
      success: true,
      ipfsHash: mockHash,
      url: `https://gateway.pinata.cloud/ipfs/${mockHash}`,
      message: 'File uploaded to IPFS successfully'
    });
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    res.status(500).json({ error: 'Failed to upload to IPFS' });
  }
});

// ===== ERROR HANDLING =====
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DilSeDaan Backend running on port ${PORT}`);
  console.log(`📱 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
