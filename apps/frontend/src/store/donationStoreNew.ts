// Real API integration for donation data
import { api } from '../lib/api'
import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

export interface Donation {
  _id: string
  donor: {
    _id: string
    name: string
    profile?: {
      avatar?: string
    }
  }
  campaign: {
    _id: string
    title: string
    imageUrl: string
    creator: string
  }
  amount: number
  currency: 'ETH' | 'MATIC' | 'USDC' | 'DAI'
  transactionHash: string
  blockNumber: number
  gasUsed: number
  gasFee: number
  status: 'pending' | 'confirmed' | 'failed'
  isAnonymous: boolean
  message?: string
  ipfsHash?: string
  taxReceiptGenerated: boolean
  taxReceiptId?: string
  metadata?: {
    donorLocation?: string
    deviceInfo?: string
    networkId?: number
  }
  createdAt: string
  updatedAt: string
  usdAmount: number
}

export interface DonationFilters {
  campaignId?: string
  status?: 'pending' | 'confirmed' | 'failed'
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DonationAnalytics {
  totalAmount: number
  totalDonations: number
  averageDonation: number
  uniqueDonorCount: number
  dailyStats: {
    _id: {
      year: number
      month: number
      day: number
    }
    amount: number
    count: number
  }[]
}

interface DonationState {
  donations: Donation[]
  selectedDonation: Donation | null
  analytics: DonationAnalytics | null
  loading: boolean
  error: string | null
  filters: DonationFilters
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  
  // Actions
  fetchDonations: (filters?: DonationFilters) => Promise<void>
  fetchDonationById: (id: string) => Promise<void>
  createDonation: (donationData: {
    campaignId: string
    amount: number
    currency?: string
    message?: string
    isAnonymous?: boolean
    transactionHash?: string
    blockNumber?: number
    gasUsed?: number
    gasFee?: number
  }) => Promise<Donation | null>
  updateDonationStatus: (id: string, statusData: {
    status: string
    blockNumber?: number
    gasUsed?: number
    gasFee?: number
  }) => Promise<boolean>
  fetchAnalytics: (filters?: { campaignId?: string; timeframe?: string }) => Promise<void>
  getTaxReceipt: (id: string) => Promise<any>
  setFilters: (filters: Partial<DonationFilters>) => void
  clearError: () => void
  resetState: () => void
}

const initialState = {
  donations: [],
  selectedDonation: null,
  analytics: null,
  loading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc' as const
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  }
}

export const useDonationStore = create<DonationState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        fetchDonations: async (filters?: DonationFilters) => {
          set({ loading: true, error: null })
          
          try {
            const currentFilters = { ...get().filters, ...filters }
            const response = await api.donation.getAll(currentFilters)
            
            if (response.data.success) {
              set({
                donations: response.data.data,
                pagination: response.data.pagination,
                filters: currentFilters,
                loading: false
              })
            } else {
              throw new Error(response.data.error || 'Failed to fetch donations')
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.error || error.message || 'Failed to fetch donations',
              loading: false
            })
          }
        },

        fetchDonationById: async (id: string) => {
          set({ loading: true, error: null })
          
          try {
            const response = await api.donation.getById(id)
            
            if (response.data.success) {
              set({
                selectedDonation: response.data.data,
                loading: false
              })
            } else {
              throw new Error(response.data.error || 'Failed to fetch donation')
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.error || error.message || 'Failed to fetch donation',
              loading: false
            })
          }
        },

        createDonation: async (donationData) => {
          set({ loading: true, error: null })
          
          try {
            const response = await api.donation.create(donationData)
            
            if (response.data.success) {
              const newDonation = response.data.data
              set(state => ({
                donations: [newDonation, ...state.donations],
                loading: false
              }))
              return newDonation
            } else {
              throw new Error(response.data.error || 'Failed to create donation')
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.error || error.message || 'Failed to create donation',
              loading: false
            })
            return null
          }
        },

        updateDonationStatus: async (id: string, statusData) => {
          set({ loading: true, error: null })
          
          try {
            const response = await api.donation.updateStatus(id, statusData)
            
            if (response.data.success) {
              const updatedDonation = response.data.data
              set(state => ({
                donations: state.donations.map(d => d._id === id ? updatedDonation : d),
                selectedDonation: state.selectedDonation?._id === id ? updatedDonation : state.selectedDonation,
                loading: false
              }))
              return true
            } else {
              throw new Error(response.data.error || 'Failed to update donation status')
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.error || error.message || 'Failed to update donation status',
              loading: false
            })
            return false
          }
        },

        fetchAnalytics: async (filters?: { campaignId?: string; timeframe?: string }) => {
          set({ loading: true, error: null })
          
          try {
            const response = await api.donation.getAnalytics(filters)
            
            if (response.data.success) {
              set({
                analytics: response.data.data,
                loading: false
              })
            } else {
              throw new Error(response.data.error || 'Failed to fetch analytics')
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.error || error.message || 'Failed to fetch analytics',
              loading: false
            })
          }
        },

        getTaxReceipt: async (id: string) => {
          set({ loading: true, error: null })
          
          try {
            const response = await api.donation.getTaxReceipt(id)
            
            if (response.data.success) {
              set({ loading: false })
              return response.data.data
            } else {
              throw new Error(response.data.error || 'Failed to get tax receipt')
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.error || error.message || 'Failed to get tax receipt',
              loading: false
            })
            return null
          }
        },

        setFilters: (filters: Partial<DonationFilters>) => {
          set(state => ({
            filters: { ...state.filters, ...filters }
          }))
        },

        clearError: () => set({ error: null }),

        resetState: () => set(initialState)
      }),
      {
        name: 'donation-store',
        partialize: (state) => ({
          filters: state.filters
        })
      }
    ),
    { name: 'donation-store' }
  )
)
