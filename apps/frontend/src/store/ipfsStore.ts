import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface IPFSDocument {
  hash: string
  name: string
  type: 'receipt' | 'report' | 'proof' | 'milestone' | 'audit'
  campaignId: string
  uploadedBy: string
  uploadedAt: number
  size: number
  verified: boolean
  verifiedBy?: string
  verifiedAt?: number
}

export interface IPFSState {
  documents: IPFSDocument[]
  uploadProgress: { [key: string]: number | undefined }
  
  // Actions
  uploadDocument: (file: File, type: IPFSDocument['type'], campaignId: string) => Promise<string>
  getDocument: (hash: string) => Promise<Blob>
  verifyDocument: (hash: string, verifiedBy: string) => void
  getDocumentsByType: (type: IPFSDocument['type']) => IPFSDocument[]
  getDocumentsByCampaign: (campaignId: string) => IPFSDocument[]
}

export const useIPFSStore = create<IPFSState>()(
  persist(
    (set, get) => ({
      documents: [
        {
          hash: 'QmXoW8s...Y4Z',
          name: 'school_books_receipt.pdf',
          type: 'receipt',
          campaignId: '1',
          uploadedBy: 'charity-org-1',
          uploadedAt: Date.now() - 86400000,
          size: 245760,
          verified: true,
          verifiedBy: 'auditor-1',
          verifiedAt: Date.now() - 43200000
        },
        {
          hash: 'QmYp9X...A5B',
          name: 'milestone_report_q1.pdf',
          type: 'milestone',
          campaignId: '2',
          uploadedBy: 'charity-org-2',
          uploadedAt: Date.now() - 172800000,
          size: 512000,
          verified: false
        }
      ],
      uploadProgress: {},

      uploadDocument: async (file: File, type: IPFSDocument['type'], campaignId: string) => {
        const uploadId = Date.now().toString()
        
        try {
          // Set initial progress
          set(state => ({
            uploadProgress: { ...state.uploadProgress, [uploadId]: 0 }
          }))

          // Simulate IPFS upload with progress
          const formData = new FormData()
          formData.append('file', file)
          
          // Mock IPFS upload - in real implementation, this would use IPFS API
          const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
          
          // Simulate upload progress
          for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 100))
            set(state => ({
              uploadProgress: { ...state.uploadProgress, [uploadId]: progress }
            }))
          }

          // Create document record
          const document: IPFSDocument = {
            hash: mockHash,
            name: file.name,
            type,
            campaignId,
            uploadedBy: 'current-user', // Would be from auth context
            uploadedAt: Date.now(),
            size: file.size,
            verified: false
          }

          // Add to store
          set(state => ({
            documents: [...state.documents, document],
            uploadProgress: { ...state.uploadProgress, [uploadId]: undefined }
          }))

          return mockHash
        } catch (error) {
          console.error('IPFS upload failed:', error)
          set(state => ({
            uploadProgress: { ...state.uploadProgress, [uploadId]: undefined }
          }))
          throw error
        }
      },

      getDocument: async (hash: string) => {
        // Mock IPFS retrieval - in real implementation, this would fetch from IPFS
        try {
          const response = await fetch(`https://ipfs.io/ipfs/${hash}`)
          return await response.blob()
        } catch (error) {
          console.error('Failed to retrieve document from IPFS:', error)
          throw error
        }
      },

      verifyDocument: (hash: string, verifiedBy: string) => {
        set(state => ({
          documents: state.documents.map(doc =>
            doc.hash === hash
              ? { ...doc, verified: true, verifiedBy, verifiedAt: Date.now() }
              : doc
          )
        }))
      },

      getDocumentsByType: (type: IPFSDocument['type']) => {
        return get().documents.filter(doc => doc.type === type)
      },

      getDocumentsByCampaign: (campaignId: string) => {
        return get().documents.filter(doc => doc.campaignId === campaignId)
      }
    }),
    {
      name: 'ipfs-storage'
    }
  )
)