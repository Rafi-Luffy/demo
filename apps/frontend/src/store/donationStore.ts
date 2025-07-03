import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Donation {
  id: string
  amount: number
  cause: string
  donorName: string
  donorEmail: string
  message?: string
  isAnonymous: boolean
  timestamp: Date
  status: 'pending' | 'completed' | 'failed'
  paymentMethod: 'upi' | 'card' | 'netbanking'
  transactionId?: string
  taxBenefit?: number
}

export interface Campaign {
  id: string
  title: string
  description: string
  category: string
  targetAmount: number
  raisedAmount: number
  donorCount: number
  imageUrl: string
  isUrgent: boolean
  endDate?: Date
  location: string
  beneficiaries?: number
  story?: string
  // Blockchain & verification fields
  contractAddress?: string
  ipfsPlanHash?: string
  milestones?: {
    total: number
    verified: number
  }
}

interface DonationState {
  donations: Donation[]
  campaigns: Campaign[]
  totalDonated: number
  totalImpact: number
  addDonation: (donation: Donation) => void
  updateDonationStatus: (id: string, status: Donation['status']) => void
  getCampaignById: (id: string) => Campaign | undefined
  addCampaign: (campaign: Campaign) => void
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
}

export const useDonationStore = create<DonationState>()(
  persist(
    (set, get) => ({
      donations: [],
      campaigns: [
        {
          id: '1',
          title: 'Padhega India, Tabhi Toh Badhega India!',
          description: 'Education is the foundation of progress. Help us provide quality education to underprivileged children across India.',
          category: 'Education',
          targetAmount: 150000,
          raisedAmount: 89500,
          donorCount: 234,
          imageUrl: '/images/image_1.png',
          isUrgent: false,
          location: 'Pan India',
          beneficiaries: 500,
          story: 'Every child deserves access to quality education. Join us in building a literate India.'
        },
        {
          id: '2',
          title: 'Ek Thali Khushiyon Ki',
          description: 'Nutritious meals for hungry children and families. Because no one should sleep on an empty stomach.',
          category: 'Food & Nutrition',
          targetAmount: 200000,
          raisedAmount: 165000,
          donorCount: 412,
          imageUrl: '/images/image_2.png',
          isUrgent: true,
          location: 'Rural India',
          beneficiaries: 800,
          story: 'One plate of happiness at a time. Your donation can feed a family today.'
        },
        {
          id: '3',
          title: 'Beti Padhao, Sapne Sajao',
          description: 'Empowering girls through education. Every girl child deserves to dream and achieve her goals.',
          category: 'Girl Child Education',
          targetAmount: 180000,
          raisedAmount: 92000,
          donorCount: 156,
          imageUrl: '/images/image_3.png',
          isUrgent: false,
          location: 'Rural Areas',
          beneficiaries: 300,
          story: 'Education is the key to breaking barriers. Support girl child education.'
        },
        {
          id: '4',
          title: 'Ek Chhat – Ek Jeevan',
          description: 'Providing shelter and homes for the homeless. Everyone deserves a safe place to call home.',
          category: 'Housing',
          targetAmount: 350000,
          raisedAmount: 178000,
          donorCount: 89,
          imageUrl: '/images/image_4.png',
          isUrgent: false,
          location: 'Urban Slums',
          beneficiaries: 50,
          story: 'A roof over the head, hope in the heart. Help us build homes.'
        },
        {
          id: '5',
          title: 'Jeevan Bachao, Muskaan Lautaao',
          description: 'Critical medical care and treatments for those who cannot afford healthcare.',
          category: 'Healthcare',
          targetAmount: 400000,
          raisedAmount: 298000,
          donorCount: 567,
          imageUrl: '/images/image_5.png',
          isUrgent: true,
          location: 'Hospitals Nationwide',
          beneficiaries: 25,
          story: 'Save lives, restore smiles. Your donation can save a life today.'
        },
        {
          id: '6',
          title: 'Garmi ho ya Sardi, Madad ho har kism ki',
          description: 'Emergency relief and disaster management support for communities in need.',
          category: 'Disaster Relief',
          targetAmount: 120000,
          raisedAmount: 67000,
          donorCount: 203,
          imageUrl: '/images/image_6.png',
          isUrgent: true,
          location: 'Disaster Affected Areas',
          beneficiaries: 600,
          story: 'Whether heat or cold, help of every kind. Emergency support when needed most.'
        },
        {
          id: '7',
          title: 'Gaon-Gaon Paani, Har Haath Swachhta',
          description: 'Clean water and sanitation facilities for rural communities across India.',
          category: 'Water & Sanitation',
          targetAmount: 280000,
          raisedAmount: 145000,
          donorCount: 178,
          imageUrl: '/images/image_7.png',
          isUrgent: false,
          location: 'Rural Villages',
          beneficiaries: 1200,
          story: 'Village to village water, cleanliness in every hand. Clean water for all.'
        },
        {
          id: '8',
          title: 'Naye Hunar, Nayi Pehchaan',
          description: 'Skill development and vocational training programs for unemployed youth.',
          category: 'Skill Development',
          targetAmount: 220000,
          raisedAmount: 98000,
          donorCount: 134,
          imageUrl: '/images/image_8.png',
          isUrgent: false,
          location: 'Training Centers',
          beneficiaries: 150,
          story: 'New skills, new identity. Empowering youth with employable skills.'
        },
        {
          id: '9',
          title: 'Maa Yamuna Ko Saaf Bhi Rakhna Hai, Zinda Bhi',
          description: 'River cleaning and environmental conservation efforts to save our sacred rivers.',
          category: 'Environment',
          targetAmount: 160000,
          raisedAmount: 78000,
          donorCount: 289,
          imageUrl: '/images/image_9.png',
          isUrgent: false,
          location: 'River Yamuna',
          beneficiaries: 50000,
          story: 'Keep Mother Yamuna clean and alive. Environmental conservation for future generations.'
        },
        {
          id: '10',
          title: 'Buzurgo Ka Haq – Apnapan aur Samman',
          description: 'Care and support for elderly citizens. Ensuring dignity and respect for our elders.',
          category: 'Elderly Care',
          targetAmount: 190000,
          raisedAmount: 112000,
          donorCount: 167,
          imageUrl: '/images/image_10.png',
          isUrgent: false,
          location: 'Old Age Homes',
          beneficiaries: 200,
          story: 'Rights of the elderly - belonging and respect. Honor our elders.'
        },
        {
          id: '11',
          title: 'Khilti Muskaan, Acid ke Paar',
          description: 'Support and rehabilitation for acid attack survivors. Restoring hope and confidence.',
          category: 'Women Support',
          targetAmount: 300000,
          raisedAmount: 145000,
          donorCount: 234,
          imageUrl: '/images/image_11.png',
          isUrgent: true,
          location: 'Rehabilitation Centers',
          beneficiaries: 30,
          story: 'Blooming smiles, beyond acid. Supporting survivors towards a new life.'
        },
        {
          id: '12',
          title: 'Mazdoor Desh Ka Mazboot Haath',
          description: 'Support for daily wage workers and labor rights. Strengthening the backbone of our nation.',
          category: 'Labor Rights',
          targetAmount: 80000,
          raisedAmount: 34000,
          donorCount: 156,
          imageUrl: '/images/image_12.png',
          isUrgent: false,
          location: 'Industrial Areas',
          beneficiaries: 2000,
          story: 'Workers are the strong hands of the nation. Supporting labor rights and welfare.'
        },
        {
          id: '13',
          title: 'Man Ki Baat, Sunne Wale Hain Hum',
          description: 'Mental health support and counseling services. Because mental wellness matters too.',
          category: 'Mental Health',
          targetAmount: 250000,
          raisedAmount: 123000,
          donorCount: 198,
          imageUrl: '/images/image_13.png',
          isUrgent: false,
          location: 'Counseling Centers',
          beneficiaries: 400,
          story: 'Words from the heart, we are here to listen. Mental health support for all.'
        }
      ],
      totalDonated: 0,
      totalImpact: 0,
      addDonation: (donation) =>
        set((state) => ({
          donations: [...state.donations, donation],
          totalDonated: state.totalDonated + donation.amount,
        })),
      updateDonationStatus: (id, status) =>
        set((state) => ({
          donations: state.donations.map((donation) =>
            donation.id === id ? { ...donation, status } : donation
          ),
        })),
      getCampaignById: (id) => get().campaigns.find((campaign) => campaign.id === id),
      addCampaign: (campaign) =>
        set((state) => ({
          campaigns: [...state.campaigns, campaign],
        })),
      updateCampaign: (id, updates) =>
        set((state) => ({
          campaigns: state.campaigns.map((campaign) =>
            campaign.id === id ? { ...campaign, ...updates } : campaign
          ),
        })),
    }),
    {
      name: 'donation-storage',
    }
  )
)