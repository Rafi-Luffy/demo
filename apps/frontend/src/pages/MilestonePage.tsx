import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, CheckCircle, Clock, AlertTriangle, Plus, Eye, Upload, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useWeb3Store } from '@/store/web3Store'
import { useIPFSStore } from '@/store/ipfsStore'
import { useToast } from '@/hooks/use-toast'

interface Milestone {
  id: string
  campaignId: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  deadline: Date
  status: 'pending' | 'in_progress' | 'submitted' | 'verified' | 'rejected'
  proofDocuments: string[]
  submittedAt?: Date
  verifiedAt?: Date
  verifiedBy?: string
  rejectionReason?: string
}

const mockMilestones: Milestone[] = [
  {
    id: 'ms1',
    campaignId: '1',
    title: 'Purchase School Books',
    description: 'Buy textbooks and notebooks for 50 children in rural school',
    targetAmount: 15000,
    currentAmount: 15000,
    deadline: new Date('2024-02-15'),
    status: 'verified',
    proofDocuments: ['QmXoW8s...Y4Z', 'QmYp9X...A5B'],
    submittedAt: new Date('2024-01-20'),
    verifiedAt: new Date('2024-01-22'),
    verifiedBy: '0xAuditor123...'
  },
  {
    id: 'ms2',
    campaignId: '1',
    title: 'Distribute Books to Students',
    description: 'Hand out books to students and collect acknowledgment receipts',
    targetAmount: 5000,
    currentAmount: 3000,
    deadline: new Date('2024-03-01'),
    status: 'in_progress',
    proofDocuments: [],
  },
  {
    id: 'ms3',
    campaignId: '2',
    title: 'Emergency Food Procurement',
    description: 'Purchase rice, dal, and essential food items for flood victims',
    targetAmount: 80000,
    currentAmount: 80000,
    deadline: new Date('2024-01-25'),
    status: 'submitted',
    proofDocuments: ['QmZa7B...C9D'],
    submittedAt: new Date('2024-01-24')
  },
  {
    id: 'ms4',
    campaignId: '2',
    title: 'Food Distribution',
    description: 'Distribute food packets to affected families',
    targetAmount: 20000,
    currentAmount: 0,
    deadline: new Date('2024-02-05'),
    status: 'pending',
    proofDocuments: []
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'verified': return 'text-green-600 bg-green-100'
    case 'submitted': return 'text-blue-600 bg-blue-100'
    case 'in_progress': return 'text-yellow-600 bg-yellow-100'
    case 'rejected': return 'text-red-600 bg-red-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'verified': return CheckCircle
    case 'submitted': return Eye
    case 'in_progress': return Clock
    case 'rejected': return AlertTriangle
    default: return Target
  }
}

export function MilestonePage() {
  const { isConnected, submitMilestone, verifyMilestone } = useWeb3Store()
  const { uploadDocument } = useIPFSStore()
  const { toast } = useToast()
  
  const [milestones, setMilestones] = useState(mockMilestones)
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [proofFiles, setProofFiles] = useState<File[]>([])

  const handleSubmitMilestone = async (milestone: Milestone) => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to submit milestones',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Upload proof documents to IPFS
      const proofHashes = []
      for (const file of proofFiles) {
        const hash = await uploadDocument(file, 'milestone', milestone.campaignId)
        proofHashes.push(hash)
      }

      // Submit milestone to smart contract
      const txHash = await submitMilestone(milestone.campaignId, {
        title: milestone.title,
        description: milestone.description,
        targetAmount: milestone.targetAmount.toString(),
        proofDocuments: proofHashes,
        deadline: Math.floor(milestone.deadline.getTime() / 1000)
      })

      // Update local state
      setMilestones(prev => prev.map(ms => 
        ms.id === milestone.id 
          ? { ...ms, status: 'submitted', proofDocuments: proofHashes, submittedAt: new Date() }
          : ms
      ))

      toast({
        title: 'Milestone Submitted! 🎉',
        description: `Transaction hash: ${txHash.substring(0, 20)}...`,
        variant: 'success'
      })

      setProofFiles([])
      setSelectedMilestone(null)
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit milestone to blockchain',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyMilestone = async (milestone: Milestone, approved: boolean) => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to verify milestones',
        variant: 'destructive'
      })
      return
    }

    setIsVerifying(true)
    try {
      const txHash = await verifyMilestone(milestone.id)

      // Update local state
      setMilestones(prev => prev.map(ms => 
        ms.id === milestone.id 
          ? { 
              ...ms, 
              status: approved ? 'verified' : 'rejected',
              verifiedAt: new Date(),
              verifiedBy: 'current-auditor' // Would be from auth context
            }
          : ms
      ))

      toast({
        title: `Milestone ${approved ? 'Approved' : 'Rejected'}! ✅`,
        description: `Transaction hash: ${txHash.substring(0, 20)}...`,
        variant: 'success'
      })
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: 'Failed to verify milestone on blockchain',
        variant: 'destructive'
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const groupedMilestones = milestones.reduce((acc, milestone) => {
    if (!acc[milestone.campaignId]) {
      acc[milestone.campaignId] = []
    }
    acc[milestone.campaignId].push(milestone)
    return acc
  }, {} as Record<string, Milestone[]>)

  return (
    <div className="min-h-screen bg-warm-cream">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-warm-orange/10 via-warm-cream to-warm-green/10 relative overflow-hidden">
        <div className="absolute inset-0 mandala-bg"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-handwritten font-bold mb-6 text-warm-charcoal">
              <span className="inline-block transform -rotate-2 text-warm-orange">Milestone</span>
              <br />
              <span className="inline-block transform rotate-1">Management</span>
            </h1>
            <p className="text-xl md:text-2xl text-warm-charcoal-light mb-8 leading-relaxed">
              Track progress through verified milestones. Every step is documented, 
              every achievement is proven, and every fund release is transparent.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: 'Total Milestones', value: milestones.length, color: 'text-warm-blue' },
            { label: 'Verified', value: milestones.filter(m => m.status === 'verified').length, color: 'text-green-600' },
            { label: 'In Progress', value: milestones.filter(m => m.status === 'in_progress').length, color: 'text-yellow-600' },
            { label: 'Pending Review', value: milestones.filter(m => m.status === 'submitted').length, color: 'text-blue-600' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="warm-card text-center group hover:shadow-handmade transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
              <div className="text-warm-charcoal-light font-handwritten">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Milestones by Campaign */}
        {Object.entries(groupedMilestones).map(([campaignId, campaignMilestones]) => (
          <motion.div
            key={campaignId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="warm-card mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-handwritten font-bold text-warm-charcoal transform -rotate-1">
                Campaign {campaignId} Milestones 🎯
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateForm(true)}
                className="border-warm-green text-warm-green hover:bg-warm-green hover:text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </div>

            <div className="space-y-6">
              {campaignMilestones.map((milestone, index) => {
                const StatusIcon = getStatusIcon(milestone.status)
                const progress = (milestone.currentAmount / milestone.targetAmount) * 100
                
                return (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-warm-orange/20 rounded-xl p-6 hover:shadow-handmade transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`h-6 w-6 ${getStatusColor(milestone.status).split(' ')[0]}`} />
                        <div>
                          <h3 className="font-handwritten font-bold text-warm-charcoal text-lg">
                            {milestone.title}
                          </h3>
                          <p className="text-warm-charcoal-light">{milestone.description}</p>
                        </div>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(milestone.status)}`}>
                        {milestone.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-warm-cream/50 p-3 rounded-lg">
                        <div className="text-sm text-warm-charcoal-light mb-1">Target Amount</div>
                        <div className="font-bold text-warm-green">₹{milestone.targetAmount.toLocaleString()}</div>
                      </div>
                      
                      <div className="bg-warm-cream/50 p-3 rounded-lg">
                        <div className="text-sm text-warm-charcoal-light mb-1">Current Amount</div>
                        <div className="font-bold text-warm-blue">₹{milestone.currentAmount.toLocaleString()}</div>
                      </div>
                      
                      <div className="bg-warm-cream/50 p-3 rounded-lg">
                        <div className="text-sm text-warm-charcoal-light mb-1">Deadline</div>
                        <div className="font-bold text-warm-orange">
                          {milestone.deadline.toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-handwritten text-warm-charcoal">Progress</span>
                        <span className="text-sm font-bold text-warm-green">{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} variant="handmade" />
                    </div>

                    {milestone.proofDocuments.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-medium text-warm-charcoal mb-2">Proof Documents:</div>
                        <div className="flex flex-wrap gap-2">
                          {milestone.proofDocuments.map((hash, idx) => (
                            <a
                              key={idx}
                              href={`https://ipfs.io/ipfs/${hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 px-3 py-1 bg-warm-blue/10 text-warm-blue rounded-full text-xs hover:bg-warm-blue/20 transition-colors"
                            >
                              <FileText className="h-3 w-3" />
                              <span>Document {idx + 1}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      {milestone.status === 'in_progress' && (
                        <Button
                          variant="handmade"
                          size="sm"
                          onClick={() => setSelectedMilestone(milestone)}
                          disabled={isSubmitting}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Submit Proof
                        </Button>
                      )}
                      
                      {milestone.status === 'submitted' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifyMilestone(milestone, true)}
                            disabled={isVerifying}
                            className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifyMilestone(milestone, false)}
                            disabled={isVerifying}
                            className="border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMilestone(milestone)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Milestone Submission Modal */}
      <AnimatePresence>
        {selectedMilestone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMilestone(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="warm-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-handwritten font-bold text-warm-charcoal mb-6">
                Submit Milestone Proof
              </h3>

              <div className="space-y-6">
                <div className="bg-warm-cream/50 p-4 rounded-xl">
                  <h4 className="font-handwritten font-bold text-warm-charcoal mb-2">
                    {selectedMilestone.title}
                  </h4>
                  <p className="text-warm-charcoal-light">{selectedMilestone.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-charcoal mb-2">
                    Upload Proof Documents
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setProofFiles(Array.from(e.target.files || []))}
                    className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  {proofFiles.length > 0 && (
                    <div className="mt-2 text-sm text-warm-charcoal-light">
                      {proofFiles.length} file(s) selected
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={() => handleSubmitMilestone(selectedMilestone)}
                    disabled={isSubmitting || proofFiles.length === 0}
                    variant="handmade"
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Submit to Blockchain
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMilestone(null)}
                    className="border-warm-charcoal text-warm-charcoal hover:bg-warm-charcoal hover:text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}