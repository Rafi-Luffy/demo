import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, User, Mail, Phone, MapPin, Calendar, Clock, Star, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  availability: string[]
  skills: string[]
  interests: string[]
  experience: string
  motivation: string
}

const availabilityOptions = [
  'Weekends only',
  'Weekday evenings',
  'Flexible hours',
  'Full-time availability',
  'Emergency response',
  'Event-based'
]

const skillOptions = [
  'Teaching/Education',
  'Healthcare/Medical',
  'Technology/IT',
  'Marketing/Social Media',
  'Photography/Videography',
  'Translation',
  'Cooking/Food Preparation',
  'Fundraising',
  'Event Management',
  'Arts & Crafts',
  'Sports/Fitness',
  'Counseling/Psychology'
]

const interestOptions = [
  'Child Education',
  'Senior Citizen Care',
  'Animal Welfare',
  'Environmental Conservation',
  'Disaster Relief',
  'Women Empowerment',
  'Healthcare Support',
  'Food Distribution',
  'Skill Development',
  'Community Building'
]

export function GeneralVolunteerSignupPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    availability: [],
    skills: [],
    interests: [],
    experience: '',
    motivation: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleMultiSelect = (field: 'availability' | 'skills' | 'interests', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
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
      title: 'Welcome to Our Family! 🎉',
      description: 'Your volunteer application has been submitted. We\'ll contact you soon with exciting opportunities!',
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
                Welcome to Our Family! 🎉
              </h1>
              
              <p className="text-lg text-warm-charcoal-light mb-8">
                Thank you for choosing to make a difference! Your volunteer application has been submitted successfully. 
                Our team will review your information and contact you within 48 hours with exciting opportunities that match your interests and skills.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center space-x-2 text-warm-green">
                  <CheckCircle className="h-5 w-5" />
                  <span>Application submitted successfully</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-warm-orange">
                  <Clock className="h-5 w-5" />
                  <span>Response within 48 hours</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-warm-blue">
                  <Star className="h-5 w-5" />
                  <span>Personalized opportunities matching your profile</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="btn-handmade">
                  <Link to="/volunteer">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Browse More Opportunities
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
              Join Our Volunteer Family! 🤝
            </h1>
            <p className="text-lg text-warm-charcoal-light max-w-2xl mx-auto">
              Fill out this form to become a general volunteer. We'll match you with opportunities that fit your skills, 
              interests, and availability. Every small act of kindness creates big ripples of change!
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
              {/* Personal Information */}
              <div>
                <h2 className="text-xl section-heading mb-4 transform -rotate-1">Personal Information 👤</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-warm-charcoal mb-2">
                    Location (City, State) *
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

              {/* Availability */}
              <div>
                <h2 className="text-xl section-heading mb-4 transform rotate-1">Availability ⏰</h2>
                <p className="text-sm text-warm-charcoal-light mb-4">When are you available to volunteer? (Select all that apply)</p>
                <div className="grid md:grid-cols-3 gap-3">
                  {availabilityOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.availability.includes(option)}
                        onChange={() => handleMultiSelect('availability', option)}
                        className="rounded border-2 border-warm-orange text-warm-orange focus:ring-warm-orange"
                      />
                      <span className="text-sm text-warm-charcoal">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h2 className="text-xl section-heading mb-4 transform -rotate-1">Your Skills 🛠️</h2>
                <p className="text-sm text-warm-charcoal-light mb-4">What skills do you bring? (Select all that apply)</p>
                <div className="grid md:grid-cols-3 gap-3">
                  {skillOptions.map((skill) => (
                    <label key={skill} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.skills.includes(skill)}
                        onChange={() => handleMultiSelect('skills', skill)}
                        className="rounded border-2 border-warm-green text-warm-green focus:ring-warm-green"
                      />
                      <span className="text-sm text-warm-charcoal">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <h2 className="text-xl section-heading mb-4 transform rotate-1">Areas of Interest 💝</h2>
                <p className="text-sm text-warm-charcoal-light mb-4">Which causes are you passionate about? (Select all that apply)</p>
                <div className="grid md:grid-cols-3 gap-3">
                  {interestOptions.map((interest) => (
                    <label key={interest} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.interests.includes(interest)}
                        onChange={() => handleMultiSelect('interests', interest)}
                        className="rounded border-2 border-warm-blue text-warm-blue focus:ring-warm-blue"
                      />
                      <span className="text-sm text-warm-charcoal">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience & Motivation */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-warm-charcoal mb-2">
                    Previous Volunteer Experience
                  </label>
                  <textarea
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white resize-none"
                    placeholder="Tell us about any previous volunteer experience (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-charcoal mb-2">
                    What Motivates You? *
                  </label>
                  <textarea
                    required
                    value={formData.motivation}
                    onChange={(e) => handleInputChange('motivation', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white resize-none"
                    placeholder="Why do you want to volunteer with us? What drives your passion to help others?"
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
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <Heart className="mr-3 h-5 w-5" fill="currentColor" />
                      Join Our Mission!
                    </>
                  )}
                </Button>
                <p className="text-sm text-warm-charcoal-light mt-4">
                  By submitting this form, you agree to be contacted by our volunteer coordination team.
                </p>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
