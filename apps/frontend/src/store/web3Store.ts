import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Web3State {
  // Connection state
  isConnected: boolean
  account: string | null
  chainId: number | null
  balance: string
  
  // Contract addresses
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
  addPendingTransaction: (txHash: string) => void
  updateTransactionStatus: (txHash: string, status: 'completed' | 'failed') => void
  
  // Smart contract interactions
  donateToContract: (campaignId: string, amount: string) => Promise<string>
  submitMilestone: (campaignId: string, milestoneData: MilestoneData) => Promise<string>
  verifyMilestone: (milestoneId: string) => Promise<string>
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
}

export interface MilestoneData {
  title: string
  description: string
  targetAmount: string
  proofDocuments: string[] // IPFS hashes
  deadline: number
}

export const useWeb3Store = create<Web3State>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: false,
      account: null,
      chainId: null,
      balance: '0',
      donationContractAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b9',
      milestoneContractAddress: '0x8ba1f109551bD432803012645Hac136c0532925',
      auditContractAddress: '0x9cb2g210662cE543914756Ibd247d0643036',
      pendingTransactions: [],
      completedTransactions: [],

      // Initialize Web3 connection
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
              
              const balance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [accounts[0], 'latest']
              })

              set({
                isConnected: true,
                account: accounts[0],
                chainId: parseInt(chainId, 16),
                balance: (parseInt(balance, 16) / 1e18).toFixed(4)
              })
            }

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
              if (accounts.length === 0) {
                get().disconnectWallet()
              } else {
                set({ account: accounts[0] })
              }
            })

            // Listen for chain changes
            window.ethereum.on('chainChanged', (chainId: string) => {
              set({ chainId: parseInt(chainId, 16) })
            })
          }
        } catch (error) {
          console.error('Failed to initialize Web3:', error)
        }
      },

      // Connect wallet
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

          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
          })

          set({
            isConnected: true,
            account: accounts[0],
            chainId: parseInt(chainId, 16),
            balance: (parseInt(balance, 16) / 1e18).toFixed(4)
          })
        } catch (error) {
          console.error('Failed to connect wallet:', error)
          throw error
        }
      },

      // Disconnect wallet
      disconnectWallet: () => {
        set({
          isConnected: false,
          account: null,
          chainId: null,
          balance: '0'
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
              type: 'donation'
            } as Transaction
          ]
        }))
      },

      // Smart contract interactions
      donateToContract: async (campaignId: string, amount: string) => {
        const { account, donationContractAddress } = get()
        
        if (!account || !donationContractAddress) {
          throw new Error('Wallet not connected or contract not deployed')
        }

        try {
          const txHash = await window.ethereum!.request({
            method: 'eth_sendTransaction',
            params: [{
              from: account,
              to: donationContractAddress,
              value: (parseFloat(amount) * 1e18).toString(16),
              data: `0x${campaignId}` // Simple campaign ID encoding
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
        const { account, milestoneContractAddress } = get()
        
        if (!account || !milestoneContractAddress) {
          throw new Error('Wallet not connected or contract not deployed')
        }

        try {
          // This would encode the milestone data for the smart contract
          const encodedData = `0x${campaignId}${milestoneData.title}`
          
          const txHash = await window.ethereum!.request({
            method: 'eth_sendTransaction',
            params: [{
              from: account,
              to: milestoneContractAddress,
              data: encodedData
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
        const { account, auditContractAddress } = get()
        
        if (!account || !auditContractAddress) {
          throw new Error('Wallet not connected or contract not deployed')
        }

        try {
          const txHash = await window.ethereum!.request({
            method: 'eth_sendTransaction',
            params: [{
              from: account,
              to: auditContractAddress,
              data: `0x${milestoneId}`
            }]
          })

          get().addPendingTransaction(txHash)
          return txHash
        } catch (error) {
          console.error('Milestone verification failed:', error)
          throw error
        }
      }
    }),
    {
      name: 'web3-storage',
      partialize: (state) => ({
        completedTransactions: state.completedTransactions,
        donationContractAddress: state.donationContractAddress,
        milestoneContractAddress: state.milestoneContractAddress,
        auditContractAddress: state.auditContractAddress
      })
    }
  )
)