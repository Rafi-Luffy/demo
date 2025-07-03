import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Upload, MapPin, Calendar, DollarSign, Users, Star, CheckCircle, ArrowRight, Shield, FileText, Target, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'

interface CampaignData {
  // Basic Information
  organizationName: string
  organizationEmail: string
  organizationPhone: string
  organizationAddress: string
  registrationNumber: string
  
  // Campaign Details
  campaignTitle: string
  category: string
  description: string
  location: string
  targetAmount: number
  duration: number
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  
  // Beneficiary Information
  beneficiaryCount: number
  beneficiaryDetails: string
  impactStatement: string
  
  // Milestones & Implementation
  milestones: { title: string; amount: number; description: string; timeline: string }[]
  implementation: string
  
  // Verification Documents
  documents: {
    organizationCertificate: File | null
    projectProposal: File | null
    budgetBreakdown: File | null
    beneficiaryProof: File | null
  }
  
  // Contact Person
  contactName: string
  contactDesignation: string
  contactEmail: string
  contactPhone: string
}

const categoryOptions = [
  'Education & Literacy',
  'Healthcare & Medical',
  'Clean Water & Sanitation',
  'Food & Nutrition',
  'Disaster Relief',
  'Women Empowerment',
  'Child Welfare',
  'Senior Citizen Care',
  'Environmental Conservation',
  'Skill Development',
  'Animal Welfare',
  'Community Infrastructure',
  'Digital Literacy',
  'Mental Health Support'
]

export function CreateCampaignPage() {
  const [formData, setFormData] = useState<CampaignData>({
    organizationName: '',
    organizationEmail: '',
    organizationPhone: '',
    organizationAddress: '',
    registrationNumber: '',
    campaignTitle: '',
    category: '',
    description: '',
    location: '',
    targetAmount: 0,
    duration: 30,
    urgency: 'medium',
    beneficiaryCount: 0,
    beneficiaryDetails: '',
    impactStatement: '',
    milestones: [
      { title: '', amount: 0, description: '', timeline: '' }
    ],
    implementation: '',
    documents: {
      organizationCertificate: null,
      projectProposal: null,
      budgetBreakdown: null,
      beneficiaryProof: null
    },
    contactName: '',
    contactDesignation: '',
    contactEmail: '',
    contactPhone: ''
  })
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: keyof CampaignData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (field: keyof CampaignData['documents'], file: File | null) => {
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [field]: file }
    }))
  }

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: '', amount: 0, description: '', timeline: '' }]
    }))
  }

  const updateMilestone = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) => 
        i === index ? { ...milestone, [field]: value } : milestone
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    toast({
      title: 'Campaign Submitted! 🎉',
      description: 'Your campaign has been submitted for verification. Our team will review and contact you within 48-72 hours.',
      variant: 'success',
    })
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-warm-cream py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="warm-card p-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="w-24 h-24 bg-warm-green rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="h-12 w-12 text-white" />
              </motion.div>
              
              <h1 className="text-3xl section-heading mb-4 transform -rotate-1">
                Campaign Under Review! 🔍
              </h1>
              
              <p className="text-lg text-warm-charcoal-light mb-8">
                Thank you for submitting your campaign! Our verification team will thoroughly review your submission, 
                verify all documents, and conduct due diligence checks. You'll hear from us within 48-72 hours.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center space-x-2 text-warm-green">
                  <CheckCircle className="h-5 w-5" />
                  <span>Campaign details submitted</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-warm-orange">
                  <Shield className="h-5 w-5" />
                  <span>Document verification in progress</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-warm-blue">
                  <Clock className="h-5 w-5" />
                  <span>Due diligence check: 48-72 hours</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-warm-green">
                  <Star className="h-5 w-5" />
                  <span>Campaign will go live upon approval</span>
                </div>
              </div>
              
              <div className="bg-warm-orange/10 rounded-xl p-6 mb-8">
                <h3 className="font-bold text-warm-charcoal mb-2">What happens next?</h3>
                <ul className="text-sm text-warm-charcoal-light space-y-1 text-left">
                  <li>• Document verification by our legal team</li>
                  <li>• Background check on organization</li>
                  <li>• Review of proposed milestones and budget</li>
                  <li>• Final approval and campaign activation</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="btn-handmade">
                  <Link to="/campaigns">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Browse Existing Campaigns
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-warm-orange text-warm-orange hover:bg-warm-orange hover:text-white">
                  <Link to="/">
                    <Heart className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  const steps = [
    { id: 1, title: 'Organization Details', icon: Shield },
    { id: 2, title: 'Campaign Information', icon: Heart },
    { id: 3, title: 'Milestones & Budget', icon: Target },
    { id: 4, title: 'Documents & Verification', icon: FileText }
  ]

  return (
    <div className="min-h-screen bg-warm-cream py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl section-heading mb-4 transform -rotate-1">
              Start a Campaign for Your Cause! 🌟
            </h1>
            <p className="text-lg text-warm-charcoal-light max-w-3xl mx-auto">
              Create a transparent, blockchain-verified campaign to raise funds for your charitable cause. 
              Our platform ensures 100% transparency and helps you connect with generous donors worldwide.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    currentStep >= step.id 
                      ? 'bg-warm-orange border-warm-orange text-white' 
                      : 'border-warm-orange/30 text-warm-orange/50'
                  }`}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-full h-1 mx-4 transition-all duration-300 ${
                      currentStep > step.id ? 'bg-warm-orange' : 'bg-warm-orange/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-xl section-heading">{steps[currentStep - 1].title}</h2>
            </div>
          </div>

          {/* Form */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="warm-card p-8"
          >
            <form onSubmit={handleSubmit}>
              {/* Step 1: Organization Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.organizationName}
                        onChange={(e) => handleInputChange('organizationName', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                        placeholder="Your registered organization name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Registration Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.registrationNumber}
                        onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                        placeholder="Government registration number"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      Organization Address *
                    </label>
                    <textarea
                      required
                      value={formData.organizationAddress}
                      onChange={(e) => handleInputChange('organizationAddress', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white resize-none"
                      placeholder="Complete registered address"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Organization Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.organizationEmail}
                        onChange={(e) => handleInputChange('organizationEmail', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                        placeholder="official@organization.org"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Organization Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.organizationPhone}
                        onChange={(e) => handleInputChange('organizationPhone', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.contactName}
                        onChange={(e) => handleInputChange('contactName', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                        placeholder="Primary contact person"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Designation *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.contactDesignation}
                        onChange={(e) => handleInputChange('contactDesignation', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                        placeholder="CEO, Director, Project Manager, etc."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Campaign Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      Campaign Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.campaignTitle}
                      onChange={(e) => handleInputChange('campaignTitle', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                      placeholder="e.g., Clean Water for 500 Families in Rural Maharashtra"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                      >
                        <option value="">Select a category</option>
                        {categoryOptions.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                        placeholder="City, State, Country"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      Campaign Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white resize-none"
                      placeholder="Describe the problem, your solution, and the impact it will create..."
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Target Amount (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        min="10000"
                        value={formData.targetAmount}
                        onChange={(e) => handleInputChange('targetAmount', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                        placeholder="100000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Campaign Duration (days) *
                      </label>
                      <input
                        type="number"
                        required
                        min="7"
                        max="365"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Urgency Level *
                      </label>
                      <select
                        required
                        value={formData.urgency}
                        onChange={(e) => handleInputChange('urgency', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Number of Beneficiaries *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.beneficiaryCount}
                        onChange={(e) => handleInputChange('beneficiaryCount', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                        placeholder="500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Beneficiary Details *
                      </label>
                      <textarea
                        required
                        value={formData.beneficiaryDetails}
                        onChange={(e) => handleInputChange('beneficiaryDetails', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white resize-none"
                        placeholder="Who will benefit from this campaign?"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Milestones & Budget */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      Expected Impact Statement *
                    </label>
                    <textarea
                      required
                      value={formData.impactStatement}
                      onChange={(e) => handleInputChange('impactStatement', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white resize-none"
                      placeholder="What measurable impact will this campaign create?"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg section-heading">Project Milestones</h3>
                      <Button type="button" onClick={addMilestone} variant="outline" size="sm">
                        + Add Milestone
                      </Button>
                    </div>
                    
                    {formData.milestones.map((milestone, index) => (
                      <div key={index} className="bg-warm-cream/50 p-4 rounded-xl mb-4">
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-warm-charcoal mb-2">
                              Milestone {index + 1} Title *
                            </label>
                            <input
                              type="text"
                              required
                              value={milestone.title}
                              onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                              className="w-full px-3 py-2 border border-warm-orange/30 rounded-lg focus:border-warm-orange focus:outline-none bg-white"
                              placeholder="e.g., Water pump installation"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-warm-charcoal mb-2">
                              Amount (₹) *
                            </label>
                            <input
                              type="number"
                              required
                              value={milestone.amount}
                              onChange={(e) => updateMilestone(index, 'amount', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-warm-orange/30 rounded-lg focus:border-warm-orange focus:outline-none bg-white"
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-warm-charcoal mb-2">
                              Description *
                            </label>
                            <textarea
                              required
                              value={milestone.description}
                              onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-warm-orange/30 rounded-lg focus:border-warm-orange focus:outline-none bg-white resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-warm-charcoal mb-2">
                              Timeline *
                            </label>
                            <input
                              type="text"
                              required
                              value={milestone.timeline}
                              onChange={(e) => updateMilestone(index, 'timeline', e.target.value)}
                              className="w-full px-3 py-2 border border-warm-orange/30 rounded-lg focus:border-warm-orange focus:outline-none bg-white"
                              placeholder="e.g., Week 1-2"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      Implementation Plan *
                    </label>
                    <textarea
                      required
                      value={formData.implementation}
                      onChange={(e) => handleInputChange('implementation', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white resize-none"
                      placeholder="Detailed plan of how you will execute this project..."
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Documents */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-warm-orange/10 p-4 rounded-xl mb-6">
                    <h3 className="font-bold text-warm-charcoal mb-2">Required Documents</h3>
                    <p className="text-sm text-warm-charcoal-light">
                      Upload clear, high-quality scans of all required documents. All documents will be verified by our team.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Organization Registration Certificate *
                      </label>
                      <input
                        type="file"
                        required
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('organizationCertificate', e.target.files?.[0] || null)}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Detailed Project Proposal *
                      </label>
                      <input
                        type="file"
                        required
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload('projectProposal', e.target.files?.[0] || null)}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Budget Breakdown *
                      </label>
                      <input
                        type="file"
                        required
                        accept=".pdf,.xlsx,.xls"
                        onChange={(e) => handleFileUpload('budgetBreakdown', e.target.files?.[0] || null)}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Beneficiary Identification Proof *
                      </label>
                      <input
                        type="file"
                        required
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('beneficiaryProof', e.target.files?.[0] || null)}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Contact Person Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                        placeholder="contact@organization.org"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Contact Person Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="border-warm-orange text-warm-orange hover:bg-warm-orange hover:text-white"
                  >
                    Previous
                  </Button>
                )}
                
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="btn-handmade ml-auto"
                  >
                    Next Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-handmade ml-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-3"
                        >
                          ⏳
                        </motion.div>
                        Submitting Campaign...
                      </>
                    ) : (
                      <>
                        <Heart className="mr-3 h-5 w-5" fill="currentColor" />
                        Submit Campaign for Review
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
