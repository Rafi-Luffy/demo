import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ethers } from 'ethers'

// Types
export type NetworkType = 'polygon' | 'mumbai' | 'unknown'
export type TransactionType = 'donation' | 'milestone' | 'verification' | 'audit'
export type TransactionStatus = 'pending' | 'completed' | 'failed'

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  status: TransactionStatus
  type: TransactionType
  campaignId?: string
  gasUsed?: string
  gasPrice?: string
  network?: NetworkType
}

export interface MilestoneData {
  title: string
  description: string
  targetAmount: string
  proofDocuments: string[] // IPFS hashes
  deadline: number
}

export interface Web3State {
  // Connection state
  isConnected: boolean
  account: string | null
  chainId: number | null
  balance: string
  network: NetworkType
  
  // Contract addresses
  donationContractAddress: string | null
  milestoneContractAddress: string | null
  auditContractAddress: string | null
  
  // Transaction state
  pendingTransactions: string[]
  completedTransactions: Transaction[]
  
  // Polygon-specific optimizations
  gasPrice: string | null
  isPolygonNetwork: boolean
  networkError: string | null
  
  // Actions
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  initializeWeb3: () => Promise<void>
  switchToPolygon: () => Promise<void>
  addPendingTransaction: (txHash: string) => void
  updateTransactionStatus: (txHash: string, status: TransactionStatus) => void
  getNetworkFromChainId: (chainId: number) => NetworkType
  
  // Enhanced smart contract interactions with Polygon optimization
  donateToContract: (campaignId: string, amount: string, message?: string) => Promise<string>
  createCampaign: (title: string, targetAmount: string, deadline: number, ipfsHash: string) => Promise<string>
  submitMilestone: (campaignId: string, milestoneData: MilestoneData) => Promise<string>
  verifyMilestone: (milestoneId: string, approved: boolean, reason?: string) => Promise<string>
  
  // Polygon-specific features
  getOptimizedGasPrice: () => Promise<void>
  estimateTransactionCost: (type: TransactionType) => Promise<string>
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  status: 'pending' | 'completed' | 'failed'
  type: 'donation' | 'milestone' | 'verification'
  campaignId?: string
  gasUsed?: string
  gasPrice?: string
  network?: 'polygon' | 'mumbai'
}

export interface MilestoneData {
  title: string
  description: string
  targetAmount: string
  proofDocuments: string[] // IPFS hashes
  deadline: number
}

// Polygon network configurations
const POLYGON_MAINNET = {
  chainId: '0x89', // 137 in hex
  chainName: 'Polygon Mainnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://polygon-rpc.com'],
  blockExplorerUrls: ['https://polygonscan.com'],
}

const POLYGON_MUMBAI = {
  chainId: '0x13881', // 80001 in hex
  chainName: 'Polygon Mumbai Testnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
  blockExplorerUrls: ['https://mumbai.polygonscan.com'],
}

// Enhanced contract ABIs for better performance
const DONATION_CONTRACT_ABI = [
  "function createCampaign(string memory title, uint256 targetAmount, uint256 deadline, string memory ipfsHash) external returns (uint256)",
  "function donate(uint256 campaignId, string memory message, bool isAnonymous) external payable",
  "function emergencyWithdraw(uint256 campaignId, string memory reason) external",
  "function getCampaignDetails(uint256 campaignId) external view returns (string memory, uint256, uint256, uint256, address, bool, string memory)",
  "function getDonationHistory(address donor) external view returns (uint256[], uint256[], uint256[])",
  "function getTotalDonations() external view returns (uint256)",
  "function getActiveCampaigns() external view returns (uint256[])",
  "function MIN_DONATION() external view returns (uint256)",
  "function PLATFORM_FEE() external view returns (uint256)",
  "event DonationMade(uint256 indexed campaignId, uint256 indexed donationId, address indexed donor, uint256 amount, uint256 timestamp)",
  "event CampaignCreated(uint256 indexed campaignId, address indexed creator, string title, uint256 targetAmount, uint256 deadline)"
];

const MILESTONE_CONTRACT_ABI = [
  "function createMilestone(uint256 campaignId, string memory title, string memory description, uint256 targetAmount, uint256 deadline, uint256 order) external returns (uint256)",
  "function submitMilestone(uint256 milestoneId, string[] memory proofDocuments) external",
  "function verifyMilestone(uint256 milestoneId, bool approved, string memory rejectionReason) external",
  "function getMilestoneDetails(uint256 milestoneId) external view returns (uint256, string memory, string memory, uint256, uint256, uint8, string[] memory, uint256, uint256, address, string memory, uint256)",
  "function getCampaignMilestones(uint256 campaignId) external view returns (uint256[] memory)",
  "event MilestoneCreated(uint256 indexed milestoneId, uint256 indexed campaignId, string title, uint256 targetAmount, uint256 deadline)",
  "event MilestoneSubmitted(uint256 indexed milestoneId, uint256 indexed campaignId, string[] proofDocuments, uint256 timestamp)",
  "event MilestoneVerified(uint256 indexed milestoneId, uint256 indexed campaignId, bool approved, address verifier, uint256 timestamp)"
];

const AUDIT_CONTRACT_ABI = [
  "function requestAudit(uint256 targetId, uint8 auditType, address auditor) external payable returns (uint256)",
  "function getAuditDetails(uint256 auditId) external view returns (uint256, uint8, uint8, address, address, string memory, string memory, uint256, uint256, uint256, bool)",
  "function auditFee() external view returns (uint256)",
  "event AuditRequested(uint256 indexed auditId, uint256 indexed targetId, uint8 auditType, address requester, address auditor)",
  "event AuditCompleted(uint256 indexed auditId, uint256 indexed targetId, uint256 score, bool isPassed, string ipfsReportHash)"
];

export const useWeb3Store = create<Web3State>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: false,
      account: null,
      chainId: null,
      balance: '0',
      network: 'unknown',
      gasPrice: null,
      isPolygonNetwork: false,
      networkError: null,
      donationContractAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b9',
      milestoneContractAddress: '0x8ba1f109551bD432803012645Hac136c0532925',
      auditContractAddress: '0x9cb2g210662cE543914756Ibd247d0643036',
      pendingTransactions: [],
      completedTransactions: [],

      // Get network type from chainId
      getNetworkFromChainId: (chainId: number) => {
        switch (chainId) {
          case 137:
            return 'polygon'
          case 80001:
            return 'mumbai'
          default:
            return 'unknown'
        }
      },

      // Switch to Polygon network
      switchToPolygon: async () => {
        try {
          if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask is not installed')
          }

          const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
          
          // If already on Polygon, return
          if (currentChainId === POLYGON_MAINNET.chainId) {
            set({ isPolygonNetwork: true, network: 'polygon', networkError: null })
            return
          }

          try {
            // Try to switch to Polygon
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: POLYGON_MAINNET.chainId }],
            })
            set({ isPolygonNetwork: true, network: 'polygon', networkError: null })
          } catch (switchError: any) {
            // If network doesn't exist, add it
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [POLYGON_MAINNET],
              })
              set({ isPolygonNetwork: true, network: 'polygon', networkError: null })
            } else {
              throw switchError
            }
          }
        } catch (error: any) {
          console.error('Failed to switch to Polygon:', error)
          set({ 
            networkError: 'Failed to switch to Polygon network',
            isPolygonNetwork: false 
          })
          throw error
        }
      },

      // Get optimized gas price for Polygon
      getOptimizedGasPrice: async () => {
        try {
          if (typeof window !== 'undefined' && window.ethereum) {
            const gasPrice = await window.ethereum.request({
              method: 'eth_gasPrice'
            })
            set({ gasPrice: ethers.formatUnits(gasPrice, 'gwei') })
          }
        } catch (error) {
          console.error('Failed to fetch gas price:', error)
        }
      },

      // Estimate transaction cost
      estimateTransactionCost: async (type: 'donation' | 'milestone' | 'verification') => {
        try {
          const { gasPrice } = get()
          if (!gasPrice) return '~0.001 MATIC'

          const gasEstimates = {
            donation: 50000,
            milestone: 100000,
            verification: 75000
          }

          const estimatedGas = gasEstimates[type]
          const cost = (parseFloat(gasPrice) * estimatedGas) / 1e9
          return `~${cost.toFixed(4)} MATIC`
        } catch (error) {
          console.error('Failed to estimate transaction cost:', error)
          return '~0.001 MATIC'
        }
      },

      // Initialize Web3 connection with Polygon optimization
      initializeWeb3: async () => {
        try {
          if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
            // Check if already connected
            const accounts = await window.ethereum.request({ 
              method: 'eth_accounts' 
            })
            
            if (accounts.length > 0) {
              const chainId = await window.ethereum.request({ 
                method: 'eth_chainId' 
              })
              
              const chainIdNumber = parseInt(chainId, 16)
              const network = get().getNetworkFromChainId(chainIdNumber)
              const isPolygonNetwork = network === 'polygon' || network === 'mumbai'
              
              const balance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [accounts[0], 'latest']
              })

              set({
                isConnected: true,
                account: accounts[0],
                chainId: chainIdNumber,
                balance: (parseInt(balance, 16) / 1e18).toFixed(4),
                network,
                isPolygonNetwork,
                networkError: isPolygonNetwork ? null : 'Please switch to Polygon network for optimal performance'
              })

              // Get gas price if on Polygon
              if (isPolygonNetwork) {
                get().getOptimizedGasPrice()
              }
            }

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
              if (accounts.length === 0) {
                get().disconnectWallet()
              } else {
                set({ 
                  account: accounts[0],
                  isConnected: true
                })
                // Update balance
                if (window.ethereum) {
                  window.ethereum.request({
                    method: 'eth_getBalance',
                    params: [accounts[0], 'latest']
                  }).then((balance: string) => {
                    set({ balance: (parseInt(balance, 16) / 1e18).toFixed(4) })
                  })
                }
              }
            })

            // Listen for chain changes
            window.ethereum.on('chainChanged', (chainId: string) => {
              const chainIdNumber = parseInt(chainId, 16)
              const network = get().getNetworkFromChainId(chainIdNumber)
              const isPolygonNetwork = network === 'polygon' || network === 'mumbai'
              
              set({ 
                chainId: chainIdNumber,
                network,
                isPolygonNetwork,
                networkError: isPolygonNetwork ? null : 'Please switch to Polygon network for optimal performance'
              })

              // Get gas price if on Polygon
              if (isPolygonNetwork) {
                get().getOptimizedGasPrice()
              }
            })

            // Listen for disconnect
            window.ethereum.on('disconnect', () => {
              get().disconnectWallet()
            })
          }
        } catch (error) {
          console.error('Error initializing Web3:', error)
          set({ networkError: 'Failed to initialize Web3 connection' })
        }
      },

      // Connect wallet with Polygon optimization
      connectWallet: async () => {
        try {
          if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask is not installed')
          }

          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
          })

          const chainId = await window.ethereum.request({
            method: 'eth_chainId'
          })

          const chainIdNumber = parseInt(chainId, 16)
          const network = get().getNetworkFromChainId(chainIdNumber)
          const isPolygonNetwork = network === 'polygon' || network === 'mumbai'

          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
          })

          set({
            isConnected: true,
            account: accounts[0],
            chainId: chainIdNumber,
            balance: (parseInt(balance, 16) / 1e18).toFixed(4),
            network,
            isPolygonNetwork,
            networkError: isPolygonNetwork ? null : 'Please switch to Polygon network for optimal performance'
          })

          // Get gas price if on Polygon
          if (isPolygonNetwork) {
            get().getOptimizedGasPrice()
          }

          // Suggest switching to Polygon if not already
          if (!isPolygonNetwork) {
            setTimeout(() => {
              if (window.confirm('Switch to Polygon network for lower fees and faster transactions?')) {
                get().switchToPolygon()
              }
            }, 1000)
          }
        } catch (error) {
          console.error('Failed to connect wallet:', error)
          set({ networkError: 'Failed to connect wallet' })
          throw error
        }
      },

      // Disconnect wallet
      disconnectWallet: () => {
        set({
          isConnected: false,
          account: null,
          chainId: null,
          balance: '0',
          network: 'unknown',
          gasPrice: null,
          isPolygonNetwork: false,
          networkError: null
        })
      },

      // Add pending transaction
      addPendingTransaction: (txHash: string) => {
        set(state => ({
          pendingTransactions: [...state.pendingTransactions, txHash]
        }))
      },

      // Update transaction status
      updateTransactionStatus: (txHash: string, status: 'completed' | 'failed') => {
        set(state => ({
          pendingTransactions: state.pendingTransactions.filter(tx => tx !== txHash),
          completedTransactions: [
            ...state.completedTransactions.filter(tx => tx.hash !== txHash),
            {
              hash: txHash,
              from: state.account || '',
              to: state.donationContractAddress || '',
              value: '0',
              timestamp: Date.now(),
              status,
              type: 'donation',
              network: state.network
            } as Transaction
          ]
        }))
      },

      // Enhanced smart contract interactions with Polygon optimization
      donateToContract: async (campaignId: string, amount: string, message: string = '', isAnonymous: boolean = false) => {
        const { account, donationContractAddress, isPolygonNetwork } = get()
        
        if (!account || !donationContractAddress) {
          throw new Error('Wallet not connected or contract not deployed')
        }

        if (!isPolygonNetwork) {
          throw new Error('Please switch to Polygon network for optimal transaction fees')
        }

        try {
          const provider = new ethers.BrowserProvider(window.ethereum!)
          const signer = await provider.getSigner()
          const contract = new ethers.Contract(donationContractAddress, DONATION_CONTRACT_ABI, signer)

          // Get minimum donation amount
          const minDonation = await contract.MIN_DONATION()
          const donationAmount = ethers.parseEther(amount)

          if (donationAmount < minDonation) {
            throw new Error(`Minimum donation is ${ethers.formatEther(minDonation)} MATIC`)
          }

          // Estimate gas with 20% buffer for Polygon
          const gasEstimate = await contract.donate.estimateGas(
            campaignId,
            message,
            isAnonymous,
            { value: donationAmount }
          )

          const tx = await contract.donate(campaignId, message, isAnonymous, {
            value: donationAmount,
            gasLimit: gasEstimate * BigInt(120) / BigInt(100) // 20% buffer
          })

          get().addPendingTransaction(tx.hash)
          
          // Wait for confirmation on Polygon (faster than Ethereum)
          const receipt = await tx.wait()
          get().updateTransactionStatus(tx.hash, receipt.status === 1 ? 'completed' : 'failed')

          return tx.hash
        } catch (error: any) {
          console.error('Donation failed:', error)
          throw new Error(error.message || 'Donation transaction failed')
        }
      },

      submitMilestone: async (campaignId: string, milestoneData: MilestoneData) => {
        const { account, milestoneContractAddress, isPolygonNetwork } = get()
        
        if (!account || !milestoneContractAddress) {
          throw new Error('Wallet not connected or milestone contract not available')
        }

        if (!isPolygonNetwork) {
          throw new Error('Please switch to Polygon network for optimal transaction fees')
        }

        try {
          const provider = new ethers.BrowserProvider(window.ethereum!)
          const signer = await provider.getSigner()
          const contract = new ethers.Contract(milestoneContractAddress, MILESTONE_CONTRACT_ABI, signer)

          // Create milestone first
          const createTx = await contract.createMilestone(
            campaignId,
            milestoneData.title,
            milestoneData.description,
            ethers.parseEther(milestoneData.targetAmount),
            milestoneData.deadline,
            1 // order
          )

          get().addPendingTransaction(createTx.hash)
          
          const createReceipt = await createTx.wait()
          get().updateTransactionStatus(createTx.hash, createReceipt.status === 1 ? 'completed' : 'failed')

          // Extract milestone ID from events
          const milestoneCreatedEvent = createReceipt.logs?.find((log: any) => {
            try {
              const parsedLog = contract.interface.parseLog(log)
              return parsedLog?.name === 'MilestoneCreated'
            } catch {
              return false
            }
          })

          if (milestoneCreatedEvent) {
            const parsedEvent = contract.interface.parseLog(milestoneCreatedEvent)
            const milestoneId = parsedEvent?.args[0]

            // Submit milestone proof if documents provided
            if (milestoneData.proofDocuments.length > 0) {
              const submitTx = await contract.submitMilestone(milestoneId, milestoneData.proofDocuments)
              get().addPendingTransaction(submitTx.hash)
              
              const submitReceipt = await submitTx.wait()
              get().updateTransactionStatus(submitTx.hash, submitReceipt.status === 1 ? 'completed' : 'failed')
            }
          }

          return createTx.hash
        } catch (error: any) {
          console.error('Milestone submission failed:', error)
          throw new Error(error.message || 'Milestone submission failed')
        }
      },

      verifyMilestone: async (milestoneId: string, approved: boolean = true, rejectionReason: string = '') => {
        const { account, milestoneContractAddress, isPolygonNetwork } = get()
        
        if (!account || !milestoneContractAddress) {
          throw new Error('Wallet not connected or milestone contract not available')
        }

        if (!isPolygonNetwork) {
          throw new Error('Please switch to Polygon network for optimal transaction fees')
        }

        try {
          const provider = new ethers.BrowserProvider(window.ethereum!)
          const signer = await provider.getSigner()
          const contract = new ethers.Contract(milestoneContractAddress, MILESTONE_CONTRACT_ABI, signer)

          const tx = await contract.verifyMilestone(milestoneId, approved, rejectionReason)
          
          get().addPendingTransaction(tx.hash)
          
          const receipt = await tx.wait()
          get().updateTransactionStatus(tx.hash, receipt.status === 1 ? 'completed' : 'failed')

          return tx.hash
        } catch (error: any) {
          console.error('Milestone verification failed:', error)
          throw new Error(error.message || 'Milestone verification failed')
        }
      },

      // New method: Request audit
      requestAudit: async (targetId: string, auditType: number, auditor: string) => {
        const { account, auditContractAddress, isPolygonNetwork } = get()
        
        if (!account || !auditContractAddress) {
          throw new Error('Wallet not connected or audit contract not available')
        }

        if (!isPolygonNetwork) {
          throw new Error('Please switch to Polygon network for optimal transaction fees')
        }

        try {
          const provider = new ethers.BrowserProvider(window.ethereum!)
          const signer = await provider.getSigner()
          const contract = new ethers.Contract(auditContractAddress, AUDIT_CONTRACT_ABI, signer)

          // Get audit fee
          const auditFee = await contract.auditFee()

          const tx = await contract.requestAudit(targetId, auditType, auditor, {
            value: auditFee
          })

          get().addPendingTransaction(tx.hash)
          
          const receipt = await tx.wait()
          get().updateTransactionStatus(tx.hash, receipt.status === 1 ? 'completed' : 'failed')

          return tx.hash
        } catch (error: any) {
          console.error('Audit request failed:', error)
          throw new Error(error.message || 'Audit request failed')
        }
      },

      // New method: Get contract configuration
      getContractConfig: async () => {
        const { isPolygonNetwork, donationContractAddress, network } = get()
        
        if (!isPolygonNetwork || !donationContractAddress) {
          return null
        }

        try {
          const provider = new ethers.BrowserProvider(window.ethereum!)
          const contract = new ethers.Contract(donationContractAddress, DONATION_CONTRACT_ABI, provider)

          const [minDonation, platformFee] = await Promise.all([
            contract.MIN_DONATION(),
            contract.PLATFORM_FEE()
          ])

          return {
            minDonation: ethers.formatEther(minDonation),
            platformFee: platformFee.toString(),
            network
          }
        } catch (error) {
          console.error('Failed to get contract config:', error)
          return null
        }
      }
    }),
    {
      name: 'web3-polygon-storage',
      partialize: (state) => ({
        isConnected: state.isConnected,
        account: state.account,
        completedTransactions: state.completedTransactions,
        donationContractAddress: state.donationContractAddress,
        milestoneContractAddress: state.milestoneContractAddress,
        auditContractAddress: state.auditContractAddress,
        network: state.network,
        isPolygonNetwork: state.isPolygonNetwork
      }),
      onRehydrateStorage: () => (state) => {
        // Re-initialize web3 connection on app load
        if (state) {
          setTimeout(() => state.initializeWeb3(), 100)
        }
      },
    }
  )
)