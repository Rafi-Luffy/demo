"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ethers_1 = require("ethers");
const auth_js_1 = require("../middleware/auth.js");
const index_js_1 = require("../types/index.js");
const router = express_1.default.Router();
// Initialize providers
const ethereumProvider = new ethers_1.ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
const polygonProvider = new ethers_1.ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
// Contract ABIs (simplified for demo)
const donationContractABI = [
    "function donate(uint256 campaignId) external payable",
    "function withdraw(uint256 campaignId, uint256 amount) external",
    "function getCampaignDetails(uint256 campaignId) external view returns (uint256, uint256, address, bool)",
    "event DonationMade(uint256 indexed campaignId, address indexed donor, uint256 amount)",
    "event Withdrawal(uint256 indexed campaignId, address indexed charity, uint256 amount)"
];
// @desc    Get blockchain network status
// @route   GET /api/blockchain/status
// @access  Public
router.get('/status', async (req, res, next) => {
    try {
        const [ethBlock, polygonBlock] = await Promise.all([
            ethereumProvider.getBlockNumber(),
            polygonProvider.getBlockNumber()
        ]);
        res.status(200).json({
            success: true,
            data: {
                ethereum: {
                    isConnected: true,
                    latestBlock: ethBlock,
                    network: 'mainnet'
                },
                polygon: {
                    isConnected: true,
                    latestBlock: polygonBlock,
                    network: 'mainnet'
                }
            }
        });
    }
    catch (error) {
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
            return next(new index_js_1.AppError('Transaction not found', 404));
        }
        res.status(200).json({
            success: true,
            data: {
                hash: transaction.hash,
                from: transaction.from,
                to: transaction.to,
                value: ethers_1.ethers.formatEther(transaction.value || '0'),
                gasLimit: transaction.gasLimit.toString(),
                gasPrice: transaction.gasPrice ? ethers_1.ethers.formatUnits(transaction.gasPrice, 'gwei') : null,
                blockNumber: transaction.blockNumber,
                blockHash: transaction.blockHash,
                confirmations: receipt ? await transaction.confirmations() : 0,
                status: receipt ? (receipt.status === 1 ? 'success' : 'failed') : 'pending',
                timestamp: transaction.blockNumber ?
                    (await provider.getBlock(transaction.blockNumber))?.timestamp : null
            }
        });
    }
    catch (error) {
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
                balance: ethers_1.ethers.formatEther(balance),
                balanceWei: balance.toString()
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// @desc    Verify donation transaction
// @route   POST /api/blockchain/verify-donation
// @access  Private
router.post('/verify-donation', auth_js_1.protect, async (req, res, next) => {
    try {
        const { transactionHash, expectedAmount, campaignId, network = 'ethereum' } = req.body;
        const provider = network === 'polygon' ? polygonProvider : ethereumProvider;
        const contractAddress = network === 'polygon'
            ? process.env.POLYGON_CONTRACT_ADDRESS
            : process.env.ETHEREUM_CONTRACT_ADDRESS;
        if (!contractAddress) {
            return next(new index_js_1.AppError('Contract address not configured', 500));
        }
        // Get transaction receipt
        const receipt = await provider.getTransactionReceipt(transactionHash);
        if (!receipt) {
            return next(new index_js_1.AppError('Transaction not found or not confirmed', 404));
        }
        if (receipt.status !== 1) {
            return next(new index_js_1.AppError('Transaction failed', 400));
        }
        // Verify transaction is to the correct contract
        if (receipt.to?.toLowerCase() !== contractAddress.toLowerCase()) {
            return next(new index_js_1.AppError('Transaction not to donation contract', 400));
        }
        // Get transaction details
        const transaction = await provider.getTransaction(transactionHash);
        if (!transaction) {
            return next(new index_js_1.AppError('Transaction details not found', 404));
        }
        // Verify the amount
        const transactionValue = ethers_1.ethers.formatEther(transaction.value || '0');
        const expectedValue = parseFloat(expectedAmount);
        if (Math.abs(parseFloat(transactionValue) - expectedValue) > 0.0001) {
            return next(new index_js_1.AppError('Transaction amount does not match expected amount', 400));
        }
        // Parse donation event from logs
        const contract = new ethers_1.ethers.Contract(contractAddress, donationContractABI, provider);
        const donationEvents = receipt.logs
            .map(log => {
            try {
                return contract.interface.parseLog({ topics: log.topics, data: log.data });
            }
            catch {
                return null;
            }
        })
            .filter(event => event?.name === 'DonationMade');
        const donationEvent = donationEvents.find(event => event && event.args.campaignId.toString() === campaignId.toString());
        if (!donationEvent) {
            return next(new index_js_1.AppError('No matching donation event found', 400));
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
                gasFee: ethers_1.ethers.formatEther((receipt.gasUsed * (transaction.gasPrice || 0n)).toString())
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// @desc    Deploy new campaign contract
// @route   POST /api/blockchain/deploy-campaign
// @access  Private (Admin/Charity)
router.post('/deploy-campaign', auth_js_1.protect, (0, auth_js_1.authorize)('admin', 'charity'), async (req, res, next) => {
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
    }
    catch (error) {
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
            return next(new index_js_1.AppError('Contract address not configured', 500));
        }
        const contract = new ethers_1.ethers.Contract(contractAddress, donationContractABI, provider);
        try {
            const [raised, target, charity, isActive] = await contract.getCampaignDetails(id);
            res.status(200).json({
                success: true,
                data: {
                    campaignId: id,
                    raisedAmount: ethers_1.ethers.formatEther(raised),
                    targetAmount: ethers_1.ethers.formatEther(target),
                    charityAddress: charity,
                    isActive,
                    network
                }
            });
        }
        catch (contractError) {
            return next(new index_js_1.AppError('Campaign not found on blockchain', 404));
        }
    }
    catch (error) {
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
                gasPrice: feeData.gasPrice ? ethers_1.ethers.formatUnits(feeData.gasPrice, 'gwei') : null,
                maxFeePerGas: feeData.maxFeePerGas ? ethers_1.ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers_1.ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=blockchain.js.map