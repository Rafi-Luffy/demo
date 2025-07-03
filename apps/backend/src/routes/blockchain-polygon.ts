import express from 'express';
import { ethers } from 'ethers';
import { protect, authorize } from '../middleware/auth.js';
import { polygonCacheMiddleware } from '../middleware/cache.js';
import { blockchainPerformanceMiddleware } from '../middleware/performance.js';
import { AppError } from '../types/index.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = express.Router();

// Apply blockchain performance monitoring to all routes
router.use(blockchainPerformanceMiddleware);

// Enhanced Polygon configuration for better performance
const POLYGON_MAINNET_RPC = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';
const POLYGON_MUMBAI_RPC = process.env.POLYGON_MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com';

// Use Polygon for primary blockchain operations (faster and cheaper)
const polygonProvider = new ethers.JsonRpcProvider(POLYGON_MAINNET_RPC, {
  name: 'polygon',
  chainId: 137
});

const mumbaiProvider = new ethers.JsonRpcProvider(POLYGON_MUMBAI_RPC, {
  name: 'mumbai',
  chainId: 80001
});

// Complete Smart Contract ABIs - Polygon Optimized
const DONATION_CONTRACT_ABI = [
  // Campaign Management
  "function createCampaign(string memory title, uint256 targetAmount, uint256 deadline, string memory ipfsHash) external returns (uint256)",
  "function getCampaignDetails(uint256 campaignId) external view returns (string memory, uint256, uint256, uint256, address, bool, string memory)",
  "function getActiveCampaigns() external view returns (uint256[])",
  "function getCampaignCount() external view returns (uint256)",
  
  // Donation Functions
  "function donate(uint256 campaignId, string memory message, bool isAnonymous) external payable",
  "function withdrawFunds(uint256 campaignId) external",
  "function emergencyWithdraw(uint256 campaignId, string memory reason) external",
  
  // View Functions
  "function getDonationHistory(address donor) external view returns (uint256[], uint256[], uint256[])",
  "function getTotalDonations() external view returns (uint256)",
  "function getContractBalance() external view returns (uint256)",
  
  // Admin Functions
  "function verifyCreator(address creator) external",
  "function updatePlatformWallet(address payable newWallet) external",
  "function pause() external",
  "function unpause() external",
  
  // Constants
  "function MIN_DONATION() external view returns (uint256)",
  "function PLATFORM_FEE() external view returns (uint256)",
  "function platformWallet() external view returns (address)",
  
  // Events
  "event CampaignCreated(uint256 indexed campaignId, address indexed creator, string title, uint256 targetAmount, uint256 deadline)",
  "event DonationMade(uint256 indexed campaignId, uint256 indexed donationId, address indexed donor, uint256 amount, uint256 timestamp)",
  "event CampaignCompleted(uint256 indexed campaignId, uint256 totalRaised, uint256 donorCount)",
  "event EmergencyWithdrawal(uint256 indexed campaignId, uint256 amount, address recipient, string reason)"
];

const MILESTONE_CONTRACT_ABI = [
  // Milestone Management
  "function createMilestone(uint256 campaignId, string memory title, string memory description, uint256 targetAmount, uint256 deadline, uint256 order) external returns (uint256)",
  "function submitMilestone(uint256 milestoneId, string[] memory proofDocuments) external",
  "function verifyMilestone(uint256 milestoneId, bool approved, string memory rejectionReason) external",
  "function releaseMilestoneFunds(uint256 milestoneId) external payable",
  
  // View Functions
  "function getMilestoneDetails(uint256 milestoneId) external view returns (uint256, string memory, string memory, uint256, uint256, uint8, string[] memory, uint256, uint256, address, string memory, uint256)",
  "function getCampaignMilestones(uint256 campaignId) external view returns (uint256[] memory)",
  "function getPendingMilestones() external view returns (uint256[] memory)",
  "function isMilestoneOverdue(uint256 milestoneId) external view returns (bool)",
  "function getMilestoneCount() external view returns (uint256)",
  
  // Admin Functions
  "function addVerifier(address verifier) external",
  "function removeVerifier(address verifier) external",
  "function updateDonationContract(address newContract) external",
  
  // Events
  "event MilestoneCreated(uint256 indexed milestoneId, uint256 indexed campaignId, string title, uint256 targetAmount, uint256 deadline)",
  "event MilestoneSubmitted(uint256 indexed milestoneId, uint256 indexed campaignId, string[] proofDocuments, uint256 timestamp)",
  "event MilestoneVerified(uint256 indexed milestoneId, uint256 indexed campaignId, bool approved, address verifier, uint256 timestamp)",
  "event FundsReleased(uint256 indexed milestoneId, uint256 indexed campaignId, uint256 amount, address recipient)"
];

const AUDIT_CONTRACT_ABI = [
  // Audit Management
  "function requestAudit(uint256 targetId, uint8 auditType, address auditor) external payable returns (uint256)",
  "function startAudit(uint256 auditId) external",
  "function submitAuditFindings(uint256 auditId, string memory findings, string memory ipfsReportHash, uint256 score, string[] memory evidenceHashes) external",
  "function disputeAudit(uint256 auditId, string memory reason) external",
  "function resolveDispute(uint256 auditId, bool maintainResult, uint256 newScore) external",
  
  // Auditor Management
  "function registerAuditor(string memory name, string memory credentials) external",
  "function approveAuditor(address auditor) external",
  
  // View Functions
  "function getAuditDetails(uint256 auditId) external view returns (uint256, uint8, uint8, address, address, string memory, string memory, uint256, uint256, uint256, bool)",
  "function getTargetAudits(uint256 targetId) external view returns (uint256[] memory)",
  "function getAuditorDetails(address auditor) external view returns (string memory, string memory, uint256, uint256, bool, uint256)",
  "function getPendingAudits(address auditor) external view returns (uint256[] memory)",
  "function getAuditCount() external view returns (uint256)",
  
  // Admin Functions
  "function updateAuditFee(uint256 newFee) external",
  "function updatePlatformWallet(address payable newWallet) external",
  "function emergencyWithdraw() external",
  
  // Constants
  "function MIN_AUDIT_SCORE() external view returns (uint256)",
  "function auditFee() external view returns (uint256)",
  
  // Events
  "event AuditRequested(uint256 indexed auditId, uint256 indexed targetId, uint8 auditType, address requester, address auditor)",
  "event AuditCompleted(uint256 indexed auditId, uint256 indexed targetId, uint256 score, bool isPassed, string ipfsReportHash)",
  "event AuditorRegistered(address indexed auditor, string name, string credentials)",
  "event AuditDisputed(uint256 indexed auditId, address disputer, string reason)"
];

// Smart contract addresses
const CONTRACTS = {
  polygon: {
    donation: process.env.POLYGON_DONATION_CONTRACT || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b9',
    milestone: process.env.POLYGON_MILESTONE_CONTRACT || '0x8ba1f109551bD432803012645Hac136c0532925',
    audit: process.env.POLYGON_AUDIT_CONTRACT || '0x9cb2g210662cE543914756Ibd247d0643036'
  },
  mumbai: {
    donation: process.env.MUMBAI_DONATION_CONTRACT || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b9',
    milestone: process.env.MUMBAI_MILESTONE_CONTRACT || '0x8ba1f109551bD432803012645Hac136c0532925',
    audit: process.env.MUMBAI_AUDIT_CONTRACT || '0x9cb2g210662cE543914756Ibd247d0643036'
  }
};

// Initialize contracts with complete ABIs
const getContracts = (network: 'polygon' | 'mumbai' = 'polygon') => {
  const provider = network === 'mumbai' ? mumbaiProvider : polygonProvider;
  const addresses = CONTRACTS[network];
  
  return {
    donation: new ethers.Contract(addresses.donation, DONATION_CONTRACT_ABI, provider),
    milestone: new ethers.Contract(addresses.milestone, MILESTONE_CONTRACT_ABI, provider),
    audit: new ethers.Contract(addresses.audit, AUDIT_CONTRACT_ABI, provider),
    provider,
    addresses
  };
};

// @desc    Get Polygon network status - Enhanced for performance
// @route   GET /api/blockchain/status
// @access  Public
router.get('/status', polygonCacheMiddleware(30000), async (req, res, next) => {
  try {
    const [polygonBlock, mumbaiBlock, polygonGasPrice] = await Promise.all([
      polygonProvider.getBlockNumber(),
      mumbaiProvider.getBlockNumber(),
      polygonProvider.getFeeData()
    ]);

    res.status(200).json({
      success: true,
      data: {
        polygon: {
          isConnected: true,
          latestBlock: polygonBlock,
          network: 'polygon-mainnet',
          chainId: 137,
          gasPrice: polygonGasPrice.gasPrice ? ethers.formatUnits(polygonGasPrice.gasPrice, 'gwei') : null,
          maxFeePerGas: polygonGasPrice.maxFeePerGas ? ethers.formatUnits(polygonGasPrice.maxFeePerGas, 'gwei') : null
        },
        mumbai: {
          isConnected: true,
          latestBlock: mumbaiBlock,
          network: 'polygon-mumbai',
          chainId: 80001
        },
        contracts: CONTRACTS
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get transaction details from Polygon
// @route   GET /api/blockchain/transaction/:hash
// @access  Public
router.get('/transaction/:hash', async (req, res, next) => {
  try {
    const { hash } = req.params;
    const { network = 'polygon' } = req.query;

    const provider = network === 'mumbai' ? mumbaiProvider : polygonProvider;
    
    const [transaction, receipt] = await Promise.all([
      provider.getTransaction(hash),
      provider.getTransactionReceipt(hash)
    ]);

    if (!transaction) {
      return next(new AppError('Transaction not found', 404));
    }

    const block = transaction.blockNumber ? await provider.getBlock(transaction.blockNumber) : null;

    res.status(200).json({
      success: true,
      data: {
        hash: transaction.hash,
        from: transaction.from,
        to: transaction.to,
        value: ethers.formatEther(transaction.value || '0'),
        valueWei: transaction.value?.toString() || '0',
        gasLimit: transaction.gasLimit.toString(),
        gasPrice: transaction.gasPrice ? ethers.formatUnits(transaction.gasPrice, 'gwei') : null,
        gasUsed: receipt?.gasUsed?.toString() || null,
        blockNumber: transaction.blockNumber,
        blockHash: transaction.blockHash,
        confirmations: transaction.blockNumber ? await provider.getBlockNumber() - transaction.blockNumber + 1 : 0,
        status: receipt ? (receipt.status === 1 ? 'success' : 'failed') : 'pending',
        timestamp: block?.timestamp || null,
        network: network === 'mumbai' ? 'polygon-mumbai' : 'polygon-mainnet'
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get MATIC balance for address
// @route   GET /api/blockchain/balance/:address
// @access  Public
router.get('/balance/:address', async (req, res, next) => {
  try {
    const { address } = req.params;
    const { network = 'polygon' } = req.query;

    const provider = network === 'mumbai' ? mumbaiProvider : polygonProvider;
    
    // Validate address
    if (!ethers.isAddress(address)) {
      return next(new AppError('Invalid address format', 400));
    }
    
    const balance = await provider.getBalance(address);

    res.status(200).json({
      success: true,
      data: {
        address,
        network: network === 'mumbai' ? 'polygon-mumbai' : 'polygon-mainnet',
        balance: ethers.formatEther(balance),
        balanceWei: balance.toString(),
        currency: 'MATIC'
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Verify donation transaction on Polygon
// @route   POST /api/blockchain/verify-donation
// @access  Private
router.post('/verify-donation', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { transactionHash, expectedAmount, campaignId, network = 'polygon' } = req.body;

    const { provider, addresses } = getContracts(network as 'polygon' | 'mumbai');
    const contractAddress = addresses.donation;

    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(transactionHash);
    
    if (!receipt) {
      return next(new AppError('Transaction not found or not confirmed', 404));
    }

    if (receipt.status !== 1) {
      return next(new AppError('Transaction failed', 400));
    }

    // Verify transaction is to the correct contract
    if (receipt.to?.toLowerCase() !== contractAddress.toLowerCase()) {
      return next(new AppError('Transaction not to donation contract', 400));
    }

    // Parse donation events
    const contract = new ethers.Contract(contractAddress, DONATION_CONTRACT_ABI, provider);
    const donationEvents = receipt.logs
      .map((log: any) => {
        try {
          return contract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .filter((event: any) => event?.name === 'DonationMade');

    const donationEvent = donationEvents.find((event: any) =>
      event?.args[0]?.toString() === campaignId.toString()
    );

    if (!donationEvent) {
      return next(new AppError('No matching donation event found', 400));
    }

    const actualAmount = ethers.formatEther(donationEvent.args[2]);
    const expectedAmountFormatted = parseFloat(expectedAmount.toString());
    const actualAmountFormatted = parseFloat(actualAmount);

    if (Math.abs(actualAmountFormatted - expectedAmountFormatted) > 0.001) {
      return next(new AppError('Donation amount mismatch', 400));
    }

    res.status(200).json({
      success: true,
      data: {
        verified: true,
        transactionHash,
        campaignId: donationEvent.args[0].toString(),
        donor: donationEvent.args[1],
        amount: actualAmount,
        timestamp: donationEvent.args[3]?.toString(),
        network: network === 'mumbai' ? 'polygon-mumbai' : 'polygon-mainnet'
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get donation history for address
// @route   GET /api/blockchain/donations/:address
// @access  Public
router.get('/donations/:address', async (req, res, next) => {
  try {
    const { address } = req.params;
    const { network = 'polygon', limit = '50' } = req.query;

    if (!ethers.isAddress(address)) {
      return next(new AppError('Invalid address format', 400));
    }

    const { donation: contract } = getContracts(network as 'polygon' | 'mumbai');

    // Get donation history from contract
    const [campaignIds, amounts, timestamps] = await contract.getDonationHistory(address);

    const donations = campaignIds.map((campaignId: any, index: number) => ({
      campaignId: campaignId.toString(),
      amount: ethers.formatEther(amounts[index]),
      amountWei: amounts[index].toString(),
      timestamp: timestamps[index].toString(),
      network: network === 'mumbai' ? 'polygon-mumbai' : 'polygon-mainnet'
    })).slice(0, parseInt(limit as string));

    res.status(200).json({
      success: true,
      data: {
        address,
        donations,
        totalDonations: donations.length,
        network: network === 'mumbai' ? 'polygon-mumbai' : 'polygon-mainnet'
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get campaign details from blockchain
// @route   GET /api/blockchain/campaign/:id
// @access  Public
router.get('/campaign/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { network = 'polygon' } = req.query;

    const { donation: contract } = getContracts(network as 'polygon' | 'mumbai');

    const [title, targetAmount, raisedAmount, deadline, creator, isActive, ipfsHash] = 
      await contract.getCampaignDetails(id);

    res.status(200).json({
      success: true,
      data: {
        campaignId: id,
        title,
        targetAmount: ethers.formatEther(targetAmount),
        raisedAmount: ethers.formatEther(raisedAmount),
        deadline: deadline.toString(),
        creator,
        isActive,
        ipfsHash,
        network: network === 'mumbai' ? 'polygon-mumbai' : 'polygon-mainnet'
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get platform statistics from blockchain
// @route   GET /api/blockchain/stats
// @access  Public
router.get('/stats', async (req, res, next) => {
  try {
    const { network = 'polygon' } = req.query;

    const { donation: contract } = getContracts(network as 'polygon' | 'mumbai');

    const [totalDonations, activeCampaigns] = await Promise.all([
      contract.getTotalDonations(),
      contract.getActiveCampaigns()
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDonations: ethers.formatEther(totalDonations),
        totalDonationsWei: totalDonations.toString(),
        activeCampaignsCount: activeCampaigns.length,
        activeCampaigns: activeCampaigns.map((id: any) => id.toString()),
        network: network === 'mumbai' ? 'polygon-mumbai' : 'polygon-mainnet'
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get gas price estimation for transactions
// @route   GET /api/blockchain/gas-price
// @access  Public
router.get('/gas-price', async (req, res, next) => {
  try {
    const { network = 'polygon' } = req.query;

    const provider = network === 'mumbai' ? mumbaiProvider : polygonProvider;
    const feeData = await provider.getFeeData();

    res.status(200).json({
      success: true,
      data: {
        gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : null,
        maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null,
        network: network === 'mumbai' ? 'polygon-mumbai' : 'polygon-mainnet',
        estimatedCosts: {
          donation: '~0.001 MATIC',
          campaignCreation: '~0.005 MATIC',
          milestoneVerification: '~0.002 MATIC'
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create campaign on blockchain
// @route   POST /api/blockchain/campaign
// @access  Protected
router.post('/campaign', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { title, targetAmount, deadline, ipfsHash, network = 'polygon' } = req.body;

    if (!title || !targetAmount || !deadline || !ipfsHash) {
      return next(new AppError('Missing required fields', 400));
    }

    const { donation: contract } = getContracts(network as 'polygon' | 'mumbai');

    // Estimate gas for the transaction
    const gasEstimate = await contract.createCampaign.estimateGas(
      title,
      ethers.parseEther(targetAmount.toString()),
      Math.floor(new Date(deadline).getTime() / 1000),
      ipfsHash
    );

    const gasPrice = await contract.runner.provider.getFeeData();

    res.status(200).json({
      success: true,
      data: {
        gasEstimate: gasEstimate.toString(),
        gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : null,
        estimatedCost: gasPrice.gasPrice 
          ? ethers.formatEther((gasEstimate * gasPrice.gasPrice).toString())
          : 'Unknown',
        network: network === 'mumbai' ? 'polygon-mumbai' : 'polygon-mainnet',
        contractAddress: contract.target
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create milestone on blockchain
// @route   POST /api/blockchain/milestone
// @access  Protected
router.post('/milestone', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { 
      campaignId, 
      title, 
      description, 
      targetAmount, 
      deadline, 
      order, 
      network = 'polygon' 
    } = req.body;

    if (!campaignId || !title || !description || !targetAmount || !deadline || !order) {
      return next(new AppError('Missing required fields', 400));
    }

    const { milestone: contract } = getContracts(network as 'polygon' | 'mumbai');

    const gasEstimate = await contract.createMilestone.estimateGas(
      campaignId,
      title,
      description,
      ethers.parseEther(targetAmount.toString()),
      Math.floor(new Date(deadline).getTime() / 1000),
      order
    );

    const gasPrice = await contract.runner.provider.getFeeData();

    res.status(200).json({
      success: true,
      data: {
        gasEstimate: gasEstimate.toString(),
        gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : null,
        estimatedCost: gasPrice.gasPrice 
          ? ethers.formatEther((gasEstimate * gasPrice.gasPrice).toString())
          : 'Unknown',
        network: network === 'mumbai' ? 'polygon-mumbai' : 'polygon-mainnet',
        contractAddress: contract.target
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Submit milestone proof
// @route   POST /api/blockchain/milestone/:id/submit
// @access  Protected
router.post('/milestone/:id/submit', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { proofDocuments, network = 'polygon' } = req.body;

    if (!proofDocuments || !Array.isArray(proofDocuments) || proofDocuments.length === 0) {
      return next(new AppError('Proof documents required', 400));
    }

    const { milestone: contract } = getContracts(network as 'polygon' | 'mumbai');

    const gasEstimate = await contract.submitMilestone.estimateGas(id, proofDocuments);
    const gasPrice = await contract.runner.provider.getFeeData();

    res.status(200).json({
      success: true,
      data: {
        milestoneId: id,
        gasEstimate: gasEstimate.toString(),
        gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : null,
        estimatedCost: gasPrice.gasPrice 
          ? ethers.formatEther((gasEstimate * gasPrice.gasPrice).toString())
          : 'Unknown',
        network: network === 'mumbai' ? 'polygon-mumbai' : 'polygon-mainnet'
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Request audit
// @route   POST /api/blockchain/audit
// @access  Protected
router.post('/audit', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { targetId, auditType, auditor, network = 'polygon' } = req.body;

    if (!targetId || auditType === undefined || !auditor) {
      return next(new AppError('Missing required fields', 400));
    }

    const { audit: contract } = getContracts(network as 'polygon' | 'mumbai');

    // Get audit fee
    const auditFee = await contract.auditFee();

    const gasEstimate = await contract.requestAudit.estimateGas(
      targetId,
      auditType,
      auditor,
      { value: auditFee }
    );

    const gasPrice = await contract.runner.provider.getFeeData();

    res.status(200).json({
      success: true,
      data: {
        auditFee: ethers.formatEther(auditFee),
        gasEstimate: gasEstimate.toString(),
        gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : null,
        estimatedCost: gasPrice.gasPrice 
          ? ethers.formatEther((gasEstimate * gasPrice.gasPrice).toString())
          : 'Unknown',
        totalCost: ethers.formatEther(
          auditFee + (gasPrice.gasPrice ? gasEstimate * gasPrice.gasPrice : BigInt(0))
        ),
        network: network === 'mumbai' ? 'polygon-mumbai' : 'polygon-mainnet'
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get milestone details from blockchain
// @route   GET /api/blockchain/milestone/:id
// @access  Public
router.get('/milestone/:id', polygonCacheMiddleware(60000), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { network = 'polygon' } = req.query;

    const { milestone: contract } = getContracts(network as 'polygon' | 'mumbai');

    const milestoneDetails = await contract.getMilestoneDetails(id);

    res.status(200).json({
      success: true,
      data: {
        milestoneId: id,
        campaignId: milestoneDetails[0].toString(),
        title: milestoneDetails[1],
        description: milestoneDetails[2],
        targetAmount: ethers.formatEther(milestoneDetails[3]),
        deadline: milestoneDetails[4].toString(),
        status: milestoneDetails[5], // Enum value
        proofDocuments: milestoneDetails[6],
        submittedAt: milestoneDetails[7].toString(),
        verifiedAt: milestoneDetails[8].toString(),
        verifier: milestoneDetails[9],
        rejectionReason: milestoneDetails[10],
        order: milestoneDetails[11].toString(),
        network: network === 'mumbai' ? 'polygon-mumbai' : 'polygon-mainnet'
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get audit details from blockchain
// @route   GET /api/blockchain/audit/:id
// @access  Public
router.get('/audit/:id', polygonCacheMiddleware(60000), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { network = 'polygon' } = req.query;

    const { audit: contract } = getContracts(network as 'polygon' | 'mumbai');

    const auditDetails = await contract.getAuditDetails(id);

    res.status(200).json({
      success: true,
      data: {
        auditId: id,
        targetId: auditDetails[0].toString(),
        auditType: auditDetails[1], // Enum value
        status: auditDetails[2], // Enum value
        auditor: auditDetails[3],
        requester: auditDetails[4],
        findings: auditDetails[5],
        ipfsReportHash: auditDetails[6],
        score: auditDetails[7].toString(),
        requestedAt: auditDetails[8].toString(),
        completedAt: auditDetails[9].toString(),
        isPassed: auditDetails[10],
        network: network === 'mumbai' ? 'polygon-mumbai' : 'polygon-mainnet'
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get contract constants and configuration
// @route   GET /api/blockchain/config
// @access  Public
router.get('/config', polygonCacheMiddleware(300000), async (req, res, next) => {
  try {
    const { network = 'polygon' } = req.query;

    const { donation, milestone, audit } = getContracts(network as 'polygon' | 'mumbai');

    const [
      minDonation,
      platformFee,
      platformWallet,
      auditFee,
      minAuditScore
    ] = await Promise.all([
      donation.MIN_DONATION(),
      donation.PLATFORM_FEE(),
      donation.platformWallet(),
      audit.auditFee(),
      audit.MIN_AUDIT_SCORE()
    ]);

    res.status(200).json({
      success: true,
      data: {
        donation: {
          minDonation: ethers.formatEther(minDonation),
          platformFee: platformFee.toString(), // Basis points (e.g., 25 = 2.5%)
          platformWallet
        },
        audit: {
          auditFee: ethers.formatEther(auditFee),
          minAuditScore: minAuditScore.toString()
        },
        network: network === 'mumbai' ? 'polygon-mumbai' : 'polygon-mainnet',
        contractAddresses: {
          donation: donation.target,
          milestone: milestone.target,
          audit: audit.target
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get pending milestones for verification
// @route   GET /api/blockchain/milestones/pending
// @access  Protected (Verifiers only)
router.get('/milestones/pending', protect, authorize('admin', 'verifier'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { network = 'polygon' } = req.query;

    const { milestone: contract } = getContracts(network as 'polygon' | 'mumbai');

    const pendingMilestones = await contract.getPendingMilestones();

    res.status(200).json({
      success: true,
      data: {
        pendingMilestones: pendingMilestones.map(id => id.toString()),
        count: pendingMilestones.length,
        network: network === 'mumbai' ? 'polygon-mumbai' : 'polygon-mainnet'
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
