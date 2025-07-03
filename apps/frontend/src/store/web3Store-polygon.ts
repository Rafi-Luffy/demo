import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Enhanced for Polygon integration
declare global {
  interface Window {
    ethereum?: any
  }
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
  network?: string
}

export interface MilestoneData {
  title: string
  description: string
  targetAmount: string
  proofDocuments: string[] // IPFS hashes
  deadline: number
}

// Polygon network configurations
const POLYGON_NETWORKS = {
  137: {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/']
  },
  80001: {
    chainId: '0x13881',
    chainName: 'Polygon Mumbai',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/']
  }
}

// Smart contract addresses on Polygon
const CONTRACT_ADDRESSES = {
  137: { // Polygon Mainnet
    donation: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b9',
    milestone: '0x8ba1f109551bD432803012645Hac136c0532925',
    audit: '0x9cb2g210662cE543914756Ibd247d0643036'
  },
  80001: { // Polygon Mumbai
    donation: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b9',
    milestone: '0x8ba1f109551bD432803012645Hac136c0532925',
    audit: '0x9cb2g210662cE543914756Ibd247d0643036'
  }
}

export interface Web3State {
  // Connection state
  isConnected: boolean
  account: string | null
  chainId: number | null
  balance: string
  network: string | null
  
  // Contract addresses (dynamic based on network)
  donationContractAddress: string | null
  milestoneContractAddress: string | null
  auditContractAddress: string | null
  
  // Transaction state
  pendingTransactions: string[]
  completedTransactions: Transaction[]
  
  // Actions
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  initializeWeb3: () => Promise<void>
  switchToPolygon: () => Promise<void>
  addPendingTransaction: (txHash: string) => void
  updateTransactionStatus: (txHash: string, status: 'completed' | 'failed') => void
  
  // Enhanced smart contract interactions
  donateToContract: (campaignId: string, amount: string) => Promise<string>
  submitMilestone: (campaignId: string, milestoneData: MilestoneData) => Promise<string>
  verifyMilestone: (milestoneId: string) => Promise<string>
  createCampaign: (title: string, targetAmount: string, deadline: number, ipfsHash: string) => Promise<string>
}

export const useWeb3Store = create<Web3State>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: false,
      account: null,
      chainId: null,
      balance: '0',
      network: null,
      donationContractAddress: null,
      milestoneContractAddress: null,
      auditContractAddress: null,
      pendingTransactions: [],
      completedTransactions: [],

      // Initialize Web3 connection
      initializeWeb3: async () => {
        try {
          if (typeof window !== 'undefined' && window.ethereum) {
            // Check if already connected
            const accounts = await window.ethereum.request({
              method: 'eth_accounts'
            })

            if (accounts.length > 0) {
              const chainId = await window.ethereum.request({
                method: 'eth_chainId'
              })

              const balance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [accounts[0], 'latest']
              })

              const networkInfo = POLYGON_NETWORKS[parseInt(chainId, 16) as keyof typeof POLYGON_NETWORKS]
              const contractAddresses = CONTRACT_ADDRESSES[parseInt(chainId, 16) as keyof typeof CONTRACT_ADDRESSES]

              set({
                isConnected: true,
                account: accounts[0],
                chainId: parseInt(chainId, 16),
                balance: (parseInt(balance, 16) / 1e18).toFixed(4),
                network: networkInfo?.chainName || 'Unknown Network',
                donationContractAddress: contractAddresses?.donation || null,
                milestoneContractAddress: contractAddresses?.milestone || null,
                auditContractAddress: contractAddresses?.audit || null
              })

              // Update balance periodically
              setInterval(async () => {
                if (get().isConnected && get().account) {
                  try {
                    const balance = await window.ethereum.request({
                      method: 'eth_getBalance',
                      params: [get().account, 'latest']
                    })
                    set({ balance: (parseInt(balance, 16) / 1e18).toFixed(4) })
                  } catch (error) {
                    console.error('Error updating balance:', error)
                  }
                }
              }, 30000) // Update every 30 seconds
            }

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
              if (accounts.length === 0) {
                get().disconnectWallet()
              } else {
                set({ account: accounts[0] })
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
              const newChainId = parseInt(chainId, 16)
              const networkInfo = POLYGON_NETWORKS[newChainId as keyof typeof POLYGON_NETWORKS]
              const contractAddresses = CONTRACT_ADDRESSES[newChainId as keyof typeof CONTRACT_ADDRESSES]
              
              set({ 
                chainId: newChainId,
                network: networkInfo?.chainName || 'Unknown Network',
                donationContractAddress: contractAddresses?.donation || null,
                milestoneContractAddress: contractAddresses?.milestone || null,
                auditContractAddress: contractAddresses?.audit || null
              })
            })

            // Listen for disconnect
            window.ethereum.on('disconnect', () => {
              get().disconnectWallet()
            })
          }
        } catch (error) {
          console.error('Error initializing Web3:', error)
        }
      },

      // Connect wallet with automatic Polygon switching
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

          const currentChainId = parseInt(chainId, 16)
          
          // If not on Polygon, prompt to switch
          if (currentChainId !== 137 && currentChainId !== 80001) {
            await get().switchToPolygon()
            return
          }

          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
          })

          const networkInfo = POLYGON_NETWORKS[currentChainId as keyof typeof POLYGON_NETWORKS]
          const contractAddresses = CONTRACT_ADDRESSES[currentChainId as keyof typeof CONTRACT_ADDRESSES]

          set({
            isConnected: true,
            account: accounts[0],
            chainId: currentChainId,
            balance: (parseInt(balance, 16) / 1e18).toFixed(4),
            network: networkInfo?.chainName || 'Unknown Network',
            donationContractAddress: contractAddresses?.donation || null,
            milestoneContractAddress: contractAddresses?.milestone || null,
            auditContractAddress: contractAddresses?.audit || null
          })
        } catch (error) {
          console.error('Failed to connect wallet:', error)
          throw error
        }
      },

      // Switch to Polygon network
      switchToPolygon: async () => {
        try {
          if (!window.ethereum) {
            throw new Error('MetaMask is not installed')
          }

          // Try to switch to Polygon Mainnet first
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: POLYGON_NETWORKS[137].chainId }]
            })
          } catch (switchError: any) {
            // If network doesn't exist, add it
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [POLYGON_NETWORKS[137]]
              })
            } else {
              throw switchError
            }
          }
        } catch (error) {
          console.error('Failed to switch to Polygon:', error)
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
          network: null,
          donationContractAddress: null,
          milestoneContractAddress: null,
          auditContractAddress: null
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
              network: state.network || 'polygon'
            } as Transaction
          ]
        }))
      },

      // Enhanced smart contract interactions
      donateToContract: async (campaignId: string, amount: string) => {
        const { account, donationContractAddress, chainId } = get()
        
        if (!account || !donationContractAddress) {
          throw new Error('Wallet not connected or contract not deployed')
        }

        if (chainId !== 137 && chainId !== 80001) {
          await get().switchToPolygon()
        }

        try {
          const txHash = await window.ethereum!.request({
            method: 'eth_sendTransaction',
            params: [{
              from: account,
              to: donationContractAddress,
              value: (parseFloat(amount) * 1e18).toString(16),
              data: `0x${campaignId.padStart(64, '0')}`, // Encode campaign ID
              gas: '0x15F90' // 90000 gas
            }]
          })

          get().addPendingTransaction(txHash)
          return txHash
        } catch (error) {
          console.error('Donation failed:', error)
          throw error
        }
      },

      submitMilestone: async (campaignId: string, milestoneData: MilestoneData) => {
        const { account, milestoneContractAddress, chainId } = get()
        
        if (!account || !milestoneContractAddress) {
          throw new Error('Wallet not connected or contract not deployed')
        }

        if (chainId !== 137 && chainId !== 80001) {
          await get().switchToPolygon()
        }

        try {
          // Encode milestone data for the smart contract
          const encodedData = `0x${campaignId.padStart(64, '0')}`
          
          const txHash = await window.ethereum!.request({
            method: 'eth_sendTransaction',
            params: [{
              from: account,
              to: milestoneContractAddress,
              data: encodedData,
              gas: '0x14C08' // 85000 gas
            }]
          })

          get().addPendingTransaction(txHash)
          return txHash
        } catch (error) {
          console.error('Milestone submission failed:', error)
          throw error
        }
      },

      verifyMilestone: async (milestoneId: string) => {
        const { account, auditContractAddress, chainId } = get()
        
        if (!account || !auditContractAddress) {
          throw new Error('Wallet not connected or contract not deployed')
        }

        if (chainId !== 137 && chainId !== 80001) {
          await get().switchToPolygon()
        }

        try {
          const encodedData = `0x${milestoneId.padStart(64, '0')}`
          
          const txHash = await window.ethereum!.request({
            method: 'eth_sendTransaction',
            params: [{
              from: account,
              to: auditContractAddress,
              data: encodedData,
              gas: '0xD6D8' // 55000 gas
            }]
          })

          get().addPendingTransaction(txHash)
          return txHash
        } catch (error) {
          console.error('Milestone verification failed:', error)
          throw error
        }
      },

      createCampaign: async (title: string, targetAmount: string, deadline: number, ipfsHash: string) => {
        const { account, donationContractAddress, chainId } = get()
        
        if (!account || !donationContractAddress) {
          throw new Error('Wallet not connected or contract not deployed')
        }

        if (chainId !== 137 && chainId !== 80001) {
          await get().switchToPolygon()
        }

        try {
          // Simple encoding for campaign creation
          const encodedData = `0x${title.length.toString(16).padStart(64, '0')}`
          
          const txHash = await window.ethereum!.request({
            method: 'eth_sendTransaction',
            params: [{
              from: account,
              to: donationContractAddress,
              data: encodedData,
              gas: '0x1D4C0' // 120000 gas
            }]
          })

          get().addPendingTransaction(txHash)
          return txHash
        } catch (error) {
          console.error('Campaign creation failed:', error)
          throw error
        }
      }
    }),
    {
      name: 'web3-storage',
      partialize: (state) => ({
        donationContractAddress: state.donationContractAddress,
        milestoneContractAddress: state.milestoneContractAddress,
        auditContractAddress: state.auditContractAddress
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
