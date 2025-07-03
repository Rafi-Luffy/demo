import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Plus, Heart, Users, Target, MapPin, Calendar, Upload, FileText, User, Mail, Phone, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDonationStore } from '@/store/donationStore'
import { getProgressPercentage } from '@/lib/utils'

interface CampaignFormData {
  title: string
  description: string
  category: string
  targetAmount: number
  location: string
  organizationName: string
  contactPerson: string
  email: string
  phone: string
  documents: string[]
}

export function StoriesPage() {
  const { campaigns } = useDonationStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    category: 'Education',
    targetAmount: 50000,
    location: '',
    organizationName: '',
    contactPerson: '',
    email: '',
    phone: '',
    documents: []
  })

  const categories = [
    'Education',
    'Healthcare',
    'Food & Nutrition',
    'Environment',
    'Disaster Relief',
    'Women Empowerment',
    'Child Welfare',
    'Elderly Care',
    'Animal Welfare',
    'Community Development'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log('Campaign submission:', formData)
    alert('Campaign submitted successfully! We will review and get back to you within 24 hours.')
    setShowCreateModal(false)
    setFormData({
      title: '',
      description: '',
      category: 'Education',
      targetAmount: 50000,
      location: '',
      organizationName: '',
      contactPerson: '',
      email: '',
      phone: '',
      documents: []
    })
  }

  return (
    <div className="min-h-screen bg-warm-cream">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-warm-orange/10 via-warm-cream to-warm-green/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-warm-charcoal mb-6">
              Stories That Touch Hearts ❤️
            </h1>
            <p className="text-xl text-warm-charcoal/80 max-w-3xl mx-auto mb-8">
              Every campaign here represents real people with real needs. Browse through stories that need your support, or start your own campaign to make a difference.
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-warm-orange to-warm-green text-white font-bold py-4 px-8 rounded-xl text-lg hover:shadow-lg transition-all transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Start a Campaign
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-warm-cream hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-48">
                  <img
                    src={campaign.imageUrl}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                  {campaign.isUrgent && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                      URGENT 🚨
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {campaign.location}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm bg-warm-orange/10 text-warm-orange px-3 py-1 rounded-full font-medium">
                      {campaign.category}
                    </span>
                    <span className="text-sm text-warm-charcoal/70 flex items-center">
                      <Heart className="h-3 w-3 mr-1 text-red-500" fill="currentColor" />
                      {campaign.donorCount}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-warm-charcoal mb-3 leading-tight">
                    {campaign.title}
                  </h3>

                  <p className="text-warm-charcoal/70 text-sm mb-4 line-clamp-3">
                    {campaign.description}
                  </p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-warm-charcoal">
                        ₹{campaign.raisedAmount.toLocaleString()} raised
                      </span>
                      <span className="text-warm-charcoal/70">
                        {getProgressPercentage(campaign.raisedAmount, campaign.targetAmount)}%
                      </span>
                    </div>
                    <div className="w-full bg-warm-cream rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-warm-orange to-warm-green h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${getProgressPercentage(campaign.raisedAmount, campaign.targetAmount)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-warm-charcoal/70 mt-1">
                      Goal: ₹{campaign.targetAmount.toLocaleString()}
                    </div>
                  </div>

                  <Button asChild className="w-full bg-warm-orange hover:bg-warm-orange/90 text-white">
                    <Link to={`/donate?campaign=${campaign.id}`}>
                      <Heart className="h-4 w-4 mr-2" fill="currentColor" />
                      Donate Now
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-warm-charcoal">Start a Campaign</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-warm-charcoal/50 hover:text-warm-charcoal"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Organization Details */}
                <div>
                  <h4 className="text-lg font-semibold text-warm-charcoal mb-4 flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Organization Details
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.organizationName}
                        onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                        className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                        placeholder="Enter your organization name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                      placeholder="contact@organization.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                {/* Campaign Details */}
                <div>
                  <h4 className="text-lg font-semibold text-warm-charcoal mb-4 flex items-center">
                    <Heart className="h-5 w-5 mr-2" fill="currentColor" />
                    Campaign Details
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Campaign Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                        placeholder="Give your campaign a compelling title"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-warm-charcoal mb-2">
                          Category *
                        </label>
                        <select
                          required
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-warm-charcoal mb-2">
                          <Target className="h-4 w-4 inline mr-1" />
                          Target Amount (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min="10000"
                          value={formData.targetAmount}
                          onChange={(e) => setFormData({ ...formData, targetAmount: parseInt(e.target.value) })}
                          className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                          placeholder="50000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                        placeholder="City, State"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        <FileText className="h-4 w-4 inline mr-1" />
                        Campaign Description *
                      </label>
                      <textarea
                        required
                        rows={6}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none resize-none"
                        placeholder="Describe your campaign in detail. Explain the problem, your solution, and how donations will be used."
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-warm-orange to-warm-green text-white"
                  >
                    Submit Campaign
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default StoriesPage
