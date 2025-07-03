import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Plus, MapPin, Calendar, Clock, Users, Star, CheckCircle, ArrowRight, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'

interface OpportunityData {
  title: string
  description: string
  category: string
  location: string
  date: string
  startTime: string
  endTime: string
  volunteersNeeded: number
  skills: string[]
  contactName: string
  contactEmail: string
  contactPhone: string
  organization: string
  objectives: string
  requirements: string
}

const categoryOptions = [
  'Education & Learning',
  'Healthcare & Medical',
  'Environmental Conservation',
  'Animal Welfare',
  'Senior Citizen Care',
  'Child Welfare',
  'Women Empowerment',
  'Disaster Relief',
  'Community Development',
  'Arts & Culture',
  'Sports & Recreation',
  'Food & Nutrition',
  'Technology & Digital Literacy',
  'Skill Development',
  'Other'
]

const skillOptions = [
  'Teaching/Training',
  'Medical/Healthcare',
  'Technology/IT',
  'Marketing/Communication',
  'Event Management',
  'Photography/Videography',
  'Translation',
  'Cooking/Food Prep',
  'Physical Labor',
  'Counseling/Psychology',
  'Arts & Crafts',
  'Sports/Fitness',
  'Administrative Work',
  'Fundraising',
  'Social Media',
  'Research/Analysis'
]

export function CreateCustomOpportunityPage() {
  const [formData, setFormData] = useState<OpportunityData>({
    title: '',
    description: '',
    category: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    volunteersNeeded: 1,
    skills: [],
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    organization: '',
    objectives: '',
    requirements: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: keyof OpportunityData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    toast({
      title: 'Opportunity Created! 🎉',
      description: 'Your custom volunteer opportunity has been submitted for review. We\'ll contact you once it\'s approved!',
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
            className="max-w-2xl mx-auto text-center"
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
                Opportunity Created! 🌟
              </h1>
              
              <p className="text-lg text-warm-charcoal-light mb-8">
                Thank you for creating a custom volunteer opportunity! Your submission has been received and is being reviewed by our team. 
                We'll verify the details and contact you within 48-72 hours to confirm publication.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center space-x-2 text-warm-green">
                  <CheckCircle className="h-5 w-5" />
                  <span>Opportunity submitted successfully</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-warm-orange">
                  <Clock className="h-5 w-5" />
                  <span>Review process: 48-72 hours</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-warm-blue">
                  <Star className="h-5 w-5" />
                  <span>We'll help you find the perfect volunteers</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="btn-handmade">
                  <Link to="/volunteer">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Browse Existing Opportunities
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

  return (
    <div className="min-h-screen bg-warm-cream py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl section-heading mb-4 transform -rotate-1">
              Create Custom Opportunity! 💡
            </h1>
            <p className="text-lg text-warm-charcoal-light max-w-2xl mx-auto">
              Have a unique volunteer opportunity in mind? Create a custom opportunity and we'll help you find 
              passionate volunteers who are perfect for your cause. Every great change starts with a great idea!
            </p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="warm-card p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl section-heading mb-4 transform -rotate-1">Opportunity Details 📋</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      Opportunity Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                      placeholder="e.g., Teach Digital Skills to Senior Citizens"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white resize-none"
                      placeholder="Describe what volunteers will be doing and the impact they'll make..."
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
                        placeholder="Mumbai, Maharashtra"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h2 className="text-xl section-heading mb-4 transform rotate-1">Schedule & Logistics 📅</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      End Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-warm-charcoal mb-2">
                    Number of Volunteers Needed *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={formData.volunteersNeeded}
                    onChange={(e) => handleInputChange('volunteersNeeded', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                  />
                </div>
              </div>

              {/* Skills Required */}
              <div>
                <h2 className="text-xl section-heading mb-4 transform -rotate-1">Skills & Requirements 🛠️</h2>
                <p className="text-sm text-warm-charcoal-light mb-4">What skills would be helpful for this opportunity? (Select all that apply)</p>
                <div className="grid md:grid-cols-4 gap-3 mb-6">
                  {skillOptions.map((skill) => (
                    <label key={skill} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.skills.includes(skill)}
                        onChange={() => handleSkillToggle(skill)}
                        className="rounded border-2 border-warm-orange text-warm-orange focus:ring-warm-orange"
                      />
                      <span className="text-sm text-warm-charcoal">{skill}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-charcoal mb-2">
                    Additional Requirements
                  </label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white resize-none"
                    placeholder="Any specific requirements, certifications, or qualifications needed (optional)"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-xl section-heading mb-4 transform rotate-1">Contact Information 📞</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      Organization/Group Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.organization}
                      onChange={(e) => handleInputChange('organization', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                      placeholder="Organization or group hosting this opportunity"
                    />
                  </div>
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
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      Email Address *
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
                      Phone Number *
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

              {/* Objectives */}
              <div>
                <h2 className="text-xl section-heading mb-4 transform -rotate-1">Impact & Goals 🎯</h2>
                <div>
                  <label className="block text-sm font-medium text-warm-charcoal mb-2">
                    What will this opportunity achieve? *
                  </label>
                  <textarea
                    required
                    value={formData.objectives}
                    onChange={(e) => handleInputChange('objectives', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white resize-none"
                    placeholder="Describe the impact and goals of this volunteer opportunity. What positive change will it create?"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-handmade px-12 py-4"
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
                      Creating Opportunity...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-3 h-5 w-5" />
                      Create Opportunity!
                    </>
                  )}
                </Button>
                <p className="text-sm text-warm-charcoal-light mt-4">
                  By submitting this opportunity, you agree to our volunteer coordination guidelines and verification process.
                </p>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
