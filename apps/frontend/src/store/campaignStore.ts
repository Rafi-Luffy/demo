// Real API integration for campaign data
import { api } from '../lib/api'
import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

export interface Campaign {
  _id: string
  title: string
  description: string
  story: string
  category: string
  targetAmount: number
  raisedAmount: number
  donorCount: number
  creator: string
  beneficiaries: number
  location: string
  imageUrl: string
  gallery?: string[]
  contractAddress?: string
  ipfsPlanHash?: string
  transactionHash?: string
  status: 'draft' | 'pending_approval' | 'active' | 'paused' | 'completed' | 'cancelled'
  isUrgent: boolean
  startDate: string
  endDate?: string
  milestones: Milestone[]
  isVerified: boolean
  verifiedBy?: string
  verificationDate?: string
  tags: string[]
  documents: Document[]
  updates: CampaignUpdate[]
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  _id: string
  title: string
  description: string
  targetAmount: number
  deadline: string
  status: 'pending' | 'submitted' | 'verified' | 'rejected' | 'funds_released'
  proofDocuments: string[]
  submittedAt?: string
  verifiedAt?: string
  verifiedBy?: string
  rejectionReason?: string
  transactionHash?: string
  order: number
}

export interface CampaignUpdate {
  _id: string
  title: string
  content: string
  images?: string[]
  createdAt: string
  createdBy: string
}

export interface CampaignFilters {
  category?: string
  status?: string
  location?: string
  minAmount?: number
  maxAmount?: number
  isUrgent?: boolean
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface CampaignState {
  campaigns: Campaign[]
  selectedCampaign: Campaign | null
  loading: boolean
  error: string | null
  filters: CampaignFilters
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  
  // Actions
  fetchCampaigns: (filters?: CampaignFilters) => Promise<void>
  fetchCampaignById: (id: string) => Promise<void>
  createCampaign: (campaignData: Partial<Campaign>) => Promise<Campaign | null>
  updateCampaign: (id: string, campaignData: Partial<Campaign>) => Promise<Campaign | null>
  deleteCampaign: (id: string) => Promise<boolean>
  addCampaignUpdate: (id: string, updateData: { title: string; content: string; images?: string[] }) => Promise<boolean>
  submitMilestone: (campaignId: string, milestoneId: string, proofDocuments: string[]) => Promise<boolean>
  verifyMilestone: (campaignId: string, milestoneId: string, approved: boolean, rejectionReason?: string) => Promise<boolean>
  setFilters: (filters: Partial<CampaignFilters>) => void
  clearError: () => void
  resetState: () => void
}

const initialState = {
  campaigns: [],
  selectedCampaign: null,
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

export const useCampaignStore = create<CampaignState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        fetchCampaigns: async (filters?: CampaignFilters) => {
          set({ loading: true, error: null })
          
          try {
            const currentFilters = { ...get().filters, ...filters }
            const response = await api.campaign.getAll(currentFilters)
            
            if (response.data.success) {
              set({
                campaigns: response.data.data,
                pagination: response.data.pagination,
                filters: currentFilters,
                loading: false
              })
            } else {
              throw new Error(response.data.error || 'Failed to fetch campaigns')
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.error || error.message || 'Failed to fetch campaigns',
              loading: false
            })
          }
        },

        fetchCampaignById: async (id: string) => {
          set({ loading: true, error: null })
          
          try {
            const response = await api.campaign.getById(id)
            
            if (response.data.success) {
              set({
                selectedCampaign: response.data.data,
                loading: false
              })
            } else {
              throw new Error(response.data.error || 'Failed to fetch campaign')
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.error || error.message || 'Failed to fetch campaign',
              loading: false
            })
          }
        },

        createCampaign: async (campaignData: Partial<Campaign>) => {
          set({ loading: true, error: null })
          
          try {
            const response = await api.campaign.create(campaignData)
            
            if (response.data.success) {
              const newCampaign = response.data.data
              set(state => ({
                campaigns: [newCampaign, ...state.campaigns],
                loading: false
              }))
              return newCampaign
            } else {
              throw new Error(response.data.error || 'Failed to create campaign')
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.error || error.message || 'Failed to create campaign',
              loading: false
            })
            return null
          }
        },

        updateCampaign: async (id: string, campaignData: Partial<Campaign>) => {
          set({ loading: true, error: null })
          
          try {
            const response = await api.campaign.update(id, campaignData)
            
            if (response.data.success) {
              const updatedCampaign = response.data.data
              set(state => ({
                campaigns: state.campaigns.map(c => c._id === id ? updatedCampaign : c),
                selectedCampaign: state.selectedCampaign?._id === id ? updatedCampaign : state.selectedCampaign,
                loading: false
              }))
              return updatedCampaign
            } else {
              throw new Error(response.data.error || 'Failed to update campaign')
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.error || error.message || 'Failed to update campaign',
              loading: false
            })
            return null
          }
        },

        deleteCampaign: async (id: string) => {
          set({ loading: true, error: null })
          
          try {
            const response = await api.campaign.delete(id)
            
            if (response.data.success) {
              set(state => ({
                campaigns: state.campaigns.filter(c => c._id !== id),
                selectedCampaign: state.selectedCampaign?._id === id ? null : state.selectedCampaign,
                loading: false
              }))
              return true
            } else {
              throw new Error(response.data.error || 'Failed to delete campaign')
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.error || error.message || 'Failed to delete campaign',
              loading: false
            })
            return false
          }
        },

        addCampaignUpdate: async (id: string, updateData: { title: string; content: string; images?: string[] }) => {
          set({ loading: true, error: null })
          
          try {
            const response = await api.campaign.addUpdate(id, updateData)
            
            if (response.data.success) {
              const newUpdate = response.data.data
              set(state => ({
                selectedCampaign: state.selectedCampaign?._id === id ? {
                  ...state.selectedCampaign,
                  updates: [newUpdate, ...state.selectedCampaign.updates]
                } : state.selectedCampaign,
                loading: false
              }))
              return true
            } else {
              throw new Error(response.data.error || 'Failed to add update')
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.error || error.message || 'Failed to add update',
              loading: false
            })
            return false
          }
        },

        submitMilestone: async (campaignId: string, milestoneId: string, proofDocuments: string[]) => {
          set({ loading: true, error: null })
          
          try {
            const response = await api.campaign.submitMilestone(campaignId, milestoneId, { proofDocuments })
            
            if (response.data.success) {
              const updatedMilestone = response.data.data
              set(state => ({
                selectedCampaign: state.selectedCampaign?._id === campaignId ? {
                  ...state.selectedCampaign,
                  milestones: state.selectedCampaign.milestones.map(m => 
                    m._id === milestoneId ? updatedMilestone : m
                  )
                } : state.selectedCampaign,
                loading: false
              }))
              return true
            } else {
              throw new Error(response.data.error || 'Failed to submit milestone')
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.error || error.message || 'Failed to submit milestone',
              loading: false
            })
            return false
          }
        },

        verifyMilestone: async (campaignId: string, milestoneId: string, approved: boolean, rejectionReason?: string) => {
          set({ loading: true, error: null })
          
          try {
            const response = await api.campaign.verifyMilestone(campaignId, milestoneId, { approved, rejectionReason })
            
            if (response.data.success) {
              const updatedMilestone = response.data.data
              set(state => ({
                selectedCampaign: state.selectedCampaign?._id === campaignId ? {
                  ...state.selectedCampaign,
                  milestones: state.selectedCampaign.milestones.map(m => 
                    m._id === milestoneId ? updatedMilestone : m
                  )
                } : state.selectedCampaign,
                loading: false
              }))
              return true
            } else {
              throw new Error(response.data.error || 'Failed to verify milestone')
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.error || error.message || 'Failed to verify milestone',
              loading: false
            })
            return false
          }
        },

        setFilters: (filters: Partial<CampaignFilters>) => {
          set(state => ({
            filters: { ...state.filters, ...filters }
          }))
        },

        clearError: () => set({ error: null }),

        resetState: () => set(initialState)
      }),
      {
        name: 'campaign-store',
        partialize: (state) => ({
          filters: state.filters
        })
      }
    ),
    { name: 'campaign-store' }
  )
)
