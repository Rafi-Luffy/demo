import express from 'express';
import { ethers } from 'ethers';
import { protect, authorize } from '../middleware/auth.js';
import { AppError } from '../types/index.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = express.Router();

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

// Smart Contract ABIs - Enhanced for charity platform
const DONATION_CONTRACT_ABI = [
  // Donation functions
  "function createCampaign(string memory title, uint256 targetAmount, uint256 deadline, string memory ipfsHash) external returns (uint256)",
  "function donate(uint256 campaignId) external payable",
  "function emergencyWithdraw(uint256 campaignId) external",
  
  // Milestone functions
  "function createMilestone(uint256 campaignId, string memory title, uint256 targetAmount, string memory proofHash) external",
  "function verifyMilestone(uint256 campaignId, uint256 milestoneId, bool approved) external",
  "function releaseMilestoneFunds(uint256 campaignId, uint256 milestoneId) external",
  
  // View functions
  "function getCampaignDetails(uint256 campaignId) external view returns (string memory, uint256, uint256, uint256, address, bool, string memory)",
  "function getDonationHistory(address donor) external view returns (uint256[], uint256[], uint256[])",
  "function getTotalDonations() external view returns (uint256)",
  "function getActiveCampaigns() external view returns (uint256[])",
  
  // Events
  "event CampaignCreated(uint256 indexed campaignId, address indexed creator, string title, uint256 targetAmount)",
  "event DonationMade(uint256 indexed campaignId, address indexed donor, uint256 amount, uint256 timestamp)",
  "event MilestoneCreated(uint256 indexed campaignId, uint256 indexed milestoneId, string title, uint256 targetAmount)",
  "event MilestoneVerified(uint256 indexed campaignId, uint256 indexed milestoneId, bool approved, address verifier)",
  "event FundsReleased(uint256 indexed campaignId, uint256 indexed milestoneId, uint256 amount, address recipient)",
  "event EmergencyWithdrawal(uint256 indexed campaignId, uint256 amount, address recipient, string reason)"
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

// Initialize contracts
const getContracts = (network: 'polygon' | 'mumbai' = 'polygon') => {
  const provider = network === 'mumbai' ? mumbaiProvider : polygonProvider;
  const addresses = CONTRACTS[network];
  
  return {
    donation: new ethers.Contract(addresses.donation, DONATION_CONTRACT_ABI, provider),
    provider,
    addresses
  };
};

// @desc    Get blockchain network status - Enhanced for Polygon
// @route   GET /api/blockchain/status
// @access  Public
router.get('/status', async (req, res, next) => {
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

// @desc    Get transaction details
// @route   GET /api/blockchain/transaction/:hash
// @access  Public
router.get('/transaction/:hash', async (req, res, next) => {
  try {
    const { hash } = req.params;
    const { network = 'ethereum' } = req.query;

    const provider = network === 'polygon' ? polygonProvider : ethereumProvider;
    
    const [transaction, receipt] = await Promise.all([
      provider.getTransaction(hash),
      provider.getTransactionReceipt(hash)
    ]);

    if (!transaction) {
      return next(new AppError('Transaction not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        hash: transaction.hash,
        from: transaction.from,
        to: transaction.to,
        value: ethers.formatEther(transaction.value || '0'),
        gasLimit: transaction.gasLimit.toString(),
        gasPrice: transaction.gasPrice ? ethers.formatUnits(transaction.gasPrice, 'gwei') : null,
        blockNumber: transaction.blockNumber,
        blockHash: transaction.blockHash,
        confirmations: receipt ? await transaction.confirmations() : 0,
        status: receipt ? (receipt.status === 1 ? 'success' : 'failed') : 'pending',
        timestamp: transaction.blockNumber ? 
          (await provider.getBlock(transaction.blockNumber))?.timestamp : null
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get wallet balance
// @route   GET /api/blockchain/balance/:address
// @access  Public
router.get('/balance/:address', async (req, res, next) => {
  try {
    const { address } = req.params;
    const { network = 'ethereum' } = req.query;

    const provider = network === 'polygon' ? polygonProvider : ethereumProvider;
    
    const balance = await provider.getBalance(address);

    res.status(200).json({
      success: true,
      data: {
        address,
        network,
        balance: ethers.formatEther(balance),
        balanceWei: balance.toString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Verify donation transaction
// @route   POST /api/blockchain/verify-donation
// @access  Private
router.post('/verify-donation', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { transactionHash, expectedAmount, campaignId, network = 'ethereum' } = req.body;

    const provider = network === 'polygon' ? polygonProvider : ethereumProvider;
    const contractAddress = network === 'polygon' 
      ? process.env.POLYGON_CONTRACT_ADDRESS 
      : process.env.ETHEREUM_CONTRACT_ADDRESS;

    if (!contractAddress) {
      return next(new AppError('Contract address not configured', 500));
    }

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

    // Get transaction details
    const transaction = await provider.getTransaction(transactionHash);
    
    if (!transaction) {
      return next(new AppError('Transaction details not found', 404));
    }

    // Verify the amount
    const transactionValue = ethers.formatEther(transaction.value || '0');
    const expectedValue = parseFloat(expectedAmount);
    
    if (Math.abs(parseFloat(transactionValue) - expectedValue) > 0.0001) {
      return next(new AppError('Transaction amount does not match expected amount', 400));
    }

    // Parse donation event from logs
    const contract = new ethers.Contract(contractAddress, donationContractABI, provider);
    const donationEvents = receipt.logs
      .map(log => {
        try {
          return contract.interface.parseLog({ topics: log.topics, data: log.data });
        } catch {
          return null;
        }
      })
      .filter(event => event?.name === 'DonationMade');

    const donationEvent = donationEvents.find(event => 
      event && event.args.campaignId.toString() === campaignId.toString()
    );

    if (!donationEvent) {
      return next(new AppError('No matching donation event found', 400));
    }

    res.status(200).json({
      success: true,
      data: {
        verified: true,
        transactionHash,
        from: transaction.from,
        amount: transactionValue,
        campaignId: donationEvent.args.campaignId.toString(),
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        gasFee: ethers.formatEther((receipt.gasUsed * (transaction.gasPrice || 0n)).toString())
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Deploy new campaign contract
// @route   POST /api/blockchain/deploy-campaign
// @access  Private (Admin/Charity)
router.post('/deploy-campaign', protect, authorize('admin', 'charity'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { campaignId, targetAmount, endDate, network = 'ethereum' } = req.body;

    // This would deploy a new campaign contract
    // For now, return a mock response
    const mockContractAddress = `0x${Math.random().toString(16).slice(2, 42).padStart(40, '0')}`;
    const mockTransactionHash = `0x${Math.random().toString(16).slice(2, 66).padStart(64, '0')}`;

    res.status(200).json({
      success: true,
      data: {
        campaignId,
        contractAddress: mockContractAddress,
        transactionHash: mockTransactionHash,
        network,
        status: 'deployed'
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get campaign on-chain data
// @route   GET /api/blockchain/campaign/:id
// @access  Public
router.get('/campaign/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { network = 'ethereum' } = req.query;

    const provider = network === 'polygon' ? polygonProvider : ethereumProvider;
    const contractAddress = network === 'polygon' 
      ? process.env.POLYGON_CONTRACT_ADDRESS 
      : process.env.ETHEREUM_CONTRACT_ADDRESS;

    if (!contractAddress) {
      return next(new AppError('Contract address not configured', 500));
    }

    const contract = new ethers.Contract(contractAddress, donationContractABI, provider);
    
    try {
      const [raised, target, charity, isActive] = await contract.getCampaignDetails(id);

      res.status(200).json({
        success: true,
        data: {
          campaignId: id,
          raisedAmount: ethers.formatEther(raised),
          targetAmount: ethers.formatEther(target),
          charityAddress: charity,
          isActive,
          network
        }
      });
    } catch (contractError) {
      return next(new AppError('Campaign not found on blockchain', 404));
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Get gas price estimates
// @route   GET /api/blockchain/gas-price
// @access  Public
router.get('/gas-price', async (req, res, next) => {
  try {
    const { network = 'ethereum' } = req.query;

    const provider = network === 'polygon' ? polygonProvider : ethereumProvider;
    
    const feeData = await provider.getFeeData();

    res.status(200).json({
      success: true,
      data: {
        network,
        gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : null,
        maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
