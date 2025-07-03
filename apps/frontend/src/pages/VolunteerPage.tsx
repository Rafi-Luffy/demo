import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Calendar, MapPin, Clock, Heart, Award, CheckCircle, Star, Smile, Heart as HandHeart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface VolunteerOpportunity {
  id: number
  title: string
  description: string
  location: string
  date: string
  time: string
  volunteers: number
  maxVolunteers: number
  skills: string[]
  category: string
  urgent: boolean
  impact: string
  emoji: string
}


export function VolunteerPage() {
  const { t } = useTranslation()
  const [selectedOpportunity, setSelectedOpportunity] = useState<VolunteerOpportunity | null>(null)
  const [showSignupForm, setShowSignupForm] = useState(false)
  const [showGeneralSignup, setShowGeneralSignup] = useState(false)
  const [showCreateOpportunity, setShowCreateOpportunity] = useState(false)
  const { toast } = useToast()

  // Generate volunteer opportunities from translation keys
  const volunteerOpportunities: VolunteerOpportunity[] = [
    {
      id: 1,
      title: t('volunteer.opportunities.opportunity1.title'),
      description: t('volunteer.opportunities.opportunity1.description'),
      location: t('volunteer.opportunities.opportunity1.location'),
      date: t('volunteer.opportunities.opportunity1.date'),
      time: t('volunteer.opportunities.opportunity1.time'),
      volunteers: 15,
      maxVolunteers: 25,
      skills: t('volunteer.opportunities.opportunity1.skills', { returnObjects: true }) as string[],
      category: t('volunteer.opportunities.opportunity1.category'),
      urgent: true,
      impact: t('volunteer.opportunities.opportunity1.impact'),
      emoji: '🍽️'
    },
    {
      id: 2,
      title: t('volunteer.opportunities.opportunity2.title'),
      description: t('volunteer.opportunities.opportunity2.description'),
      location: t('volunteer.opportunities.opportunity2.location'),
      date: t('volunteer.opportunities.opportunity2.date'),
      time: t('volunteer.opportunities.opportunity2.time'),
      volunteers: 8,
      maxVolunteers: 12,
      skills: t('volunteer.opportunities.opportunity2.skills', { returnObjects: true }) as string[],
      category: t('volunteer.opportunities.opportunity2.category'),
      urgent: false,
      impact: t('volunteer.opportunities.opportunity2.impact'),
      emoji: '📚'
    },
    {
      id: 3,
      title: t('volunteer.opportunities.opportunity3.title'),
      description: t('volunteer.opportunities.opportunity3.description'),
      location: t('volunteer.opportunities.opportunity3.location'),
      date: t('volunteer.opportunities.opportunity3.date'),
      time: t('volunteer.opportunities.opportunity3.time'),
      volunteers: 12,
      maxVolunteers: 20,
      skills: t('volunteer.opportunities.opportunity3.skills', { returnObjects: true }) as string[],
      category: t('volunteer.opportunities.opportunity3.category'),
      urgent: false,
      impact: t('volunteer.opportunities.opportunity3.impact'),
      emoji: '🏥'
    },
    {
      id: 4,
      title: t('volunteer.opportunities.opportunity4.title'),
      description: t('volunteer.opportunities.opportunity4.description'),
      location: t('volunteer.opportunities.opportunity4.location'),
      date: t('volunteer.opportunities.opportunity4.date'),
      time: t('volunteer.opportunities.opportunity4.time'),
      volunteers: 5,
      maxVolunteers: 10,
      skills: t('volunteer.opportunities.opportunity4.skills', { returnObjects: true }) as string[],
      category: t('volunteer.opportunities.opportunity4.category'),
      urgent: false,
      impact: t('volunteer.opportunities.opportunity4.impact'),
      emoji: '💻'
    },
    {
      id: 5,
      title: t('volunteer.opportunities.opportunity5.title'),
      description: t('volunteer.opportunities.opportunity5.description'),
      location: t('volunteer.opportunities.opportunity5.location'),
      date: t('volunteer.opportunities.opportunity5.date'),
      time: t('volunteer.opportunities.opportunity5.time'),
      volunteers: 20,
      maxVolunteers: 40,
      skills: t('volunteer.opportunities.opportunity5.skills', { returnObjects: true }) as string[],
      category: t('volunteer.opportunities.opportunity5.category'),
      urgent: false,
      impact: t('volunteer.opportunities.opportunity5.impact'),
      emoji: '🌱'
    },
    {
      id: 6,
      title: t('volunteer.opportunities.opportunity6.title'),
      description: t('volunteer.opportunities.opportunity6.description'),
      location: t('volunteer.opportunities.opportunity6.location'),
      date: t('volunteer.opportunities.opportunity6.date'),
      time: t('volunteer.opportunities.opportunity6.time'),
      volunteers: 18,
      maxVolunteers: 30,
      skills: t('volunteer.opportunities.opportunity6.skills', { returnObjects: true }) as string[],
      category: t('volunteer.opportunities.opportunity6.category'),
      urgent: true,
      impact: t('volunteer.opportunities.opportunity6.impact'),
      emoji: '❄️'
    }
  ]

  const volunteerBenefits = [
    {
      icon: Heart,
      title: t('volunteer.benefits.impact.title'),
      description: t('volunteer.benefits.impact.description'),
      emoji: '💝'
    },
    {
      icon: Users,
      title: t('volunteer.benefits.people.title'),
      description: t('volunteer.benefits.people.description'),
      emoji: '🤝'
    },
    {
      icon: Award,
      title: t('volunteer.benefits.experience.title'),
      description: t('volunteer.benefits.experience.description'),
      emoji: '🌟'
    },
    {
      icon: CheckCircle,
      title: t('volunteer.benefits.certificates.title'),
      description: t('volunteer.benefits.certificates.description'),
      emoji: '🏆'
    },
  ]

  const volunteerTestimonials = [
    {
      name: t('volunteer.testimonials.priya.name'),
      role: t('volunteer.testimonials.priya.role'),
      text: t('volunteer.testimonials.priya.text'),
      image: "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg",
      hours: t('volunteer.testimonials.priya.hours')
    },
    {
      name: t('volunteer.testimonials.rahul.name'),
      role: t('volunteer.testimonials.rahul.role'),
      text: t('volunteer.testimonials.rahul.text'),
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
      hours: t('volunteer.testimonials.rahul.hours')
    },
    {
      name: t('volunteer.testimonials.sneha.name'),
      role: t('volunteer.testimonials.sneha.role'),
      text: t('volunteer.testimonials.sneha.text'),
      image: "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg",
      hours: t('volunteer.testimonials.sneha.hours')
    }
  ]

  const handleSignup = (opportunity: VolunteerOpportunity) => {
    setSelectedOpportunity(opportunity)
    setShowSignupForm(true)
  }

  const submitApplication = () => {
    toast({
      title: t('volunteer.signup.success'),
      description: t('volunteer.signup.successMessage'),
      variant: 'success',
    })
    setShowSignupForm(false)
  }

  return (
    <div className="min-h-screen bg-warm-cream py-8">
      <div className="container mx-auto px-4">
        {/* Emotional Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl section-heading mb-4 transform -rotate-1 leading-tight">
            {t('volunteer.hero.title')}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-warm-charcoal-light max-w-3xl mx-auto leading-relaxed">
            {t('volunteer.hero.subtitle')}
          </p>
          
          {/* Hand-drawn volunteer icon */}
          <svg className="mx-auto mt-6" width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="20" r="8" fill="#ff9a00" className="animate-heart-beat" />
            <path d="M30,28 L30,50 M22,35 L38,35 M20,42 L40,42" stroke="#34a853" strokeWidth="4" strokeLinecap="round" />
            <path d="M15,50 L45,50" stroke="#2962ff" strokeWidth="6" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* Benefits with warm design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-4 gap-6 mb-16"
        >
          {volunteerBenefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? 1 : -1 }}
              transition={{ delay: index * 0.1 }}
              className="warm-card text-center group hover:shadow-handmade transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="text-4xl mb-4 group-hover:animate-bounce-gentle">
                {benefit.emoji}
              </div>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-warm-blue/10 rounded-full mb-4">
                <benefit.icon className="h-6 w-6 text-warm-blue" />
              </div>
              <h3 className="text-sm sm:text-base font-handwritten font-bold text-warm-charcoal mb-2 transform -rotate-1 break-words">
                {benefit.title}
              </h3>
              <p className="text-warm-charcoal-light text-xs sm:text-sm leading-relaxed break-words">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Volunteer Opportunities with warm design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-lg sm:text-xl md:text-2xl section-heading mb-8 text-center transform rotate-1 break-words">
            {t('volunteer.opportunities.title')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {volunteerOpportunities.map((opportunity, index) => (
              <motion.div
                key={opportunity.id}
                initial={{ opacity: 0, y: 30, rotate: 0 }}
                animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? 1 : -1 }}
                transition={{ delay: index * 0.1 }}
                className="warm-card group hover:shadow-handmade transition-all duration-500 transform hover:-translate-y-3 hover:rotate-0"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl">{opportunity.emoji}</span>
                    <span className="px-3 py-1 bg-warm-blue/10 text-warm-blue rounded-full text-sm font-handwritten font-bold">
                      {opportunity.category}
                    </span>
                    {opportunity.urgent && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-handwritten font-bold animate-pulse">
                        {t('volunteer.opportunities.urgent')}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-handwritten font-bold text-warm-charcoal mb-2 transform -rotate-1 break-words">
                  {opportunity.title}
                </h3>
                <p className="text-warm-charcoal-light mb-4 leading-relaxed text-xs sm:text-sm break-words">{opportunity.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-xs sm:text-sm">
                    <MapPin className="h-4 w-4 text-warm-orange flex-shrink-0" />
                    <span className="font-handwritten break-words">{opportunity.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm">
                    <Calendar className="h-4 w-4 text-warm-green flex-shrink-0" />
                    <span className="font-handwritten">{new Date(opportunity.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm">
                    <Clock className="h-4 w-4 text-warm-blue flex-shrink-0" />
                    <span className="font-handwritten">{opportunity.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm">
                    <Users className="h-4 w-4 text-warm-golden flex-shrink-0" />
                    <span className="font-handwritten">{opportunity.volunteers}/{opportunity.maxVolunteers} volunteers</span>
                  </div>
                </div>

                {/* Impact highlight */}
                <div className="bg-warm-green/10 rounded-xl p-3 mb-4 border-l-4 border-warm-green">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-warm-green" />
                    <span className="font-handwritten font-bold text-warm-green">{opportunity.impact}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-warm-charcoal-light mb-2 font-handwritten">{t('volunteer.opportunities.skillsNeeded')}</div>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-warm-orange/10 text-warm-orange rounded-full text-xs font-handwritten"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="handmade"
                    className="flex-1 font-handwritten font-bold"
                    onClick={() => handleSignup(opportunity)}
                  >
                    <Heart className="mr-2 h-4 w-4" fill="currentColor" />
                    {t('volunteer.opportunities.joinMission')}
                  </Button>
                  <Button variant="outline" size="sm" className="border-2 border-warm-blue text-warm-blue hover:bg-warm-blue hover:text-white">
                    <Star className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Volunteer Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-xl md:text-2xl section-heading mb-8 text-center transform -rotate-1">
            {t('volunteer.testimonials.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {volunteerTestimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="warm-card text-center group hover:shadow-handmade transition-all duration-300 transform hover:-translate-y-2"
              >
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-warm-orange/30"
                />
                <h3 className="font-handwritten font-bold text-warm-charcoal mb-1">{testimonial.name}</h3>
                <p className="text-sm text-warm-charcoal-light mb-3 font-handwritten">{testimonial.role}</p>
                <p className="text-warm-charcoal-light italic mb-4 leading-relaxed">"{testimonial.text}"</p>
                <div className="bg-warm-golden/10 rounded-lg p-2">
                  <span className="text-sm font-handwritten text-warm-golden">
                    ⏰ {testimonial.hours}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Simple Signup Form Modal */}
        {showSignupForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="warm-card max-w-md w-full"
            >
              <h3 className="text-xl font-handwritten font-bold text-warm-charcoal mb-4 transform -rotate-1">
                {t('volunteer.signup.title')}
              </h3>
              
              {selectedOpportunity && (
                <div className="bg-warm-blue/10 rounded-xl p-4 mb-6 border-l-4 border-warm-blue">
                  <h4 className="font-handwritten font-bold text-warm-blue">
                    {selectedOpportunity.title}
                  </h4>
                  <p className="text-sm text-warm-charcoal-light font-handwritten">
                    {selectedOpportunity.location} • {new Date(selectedOpportunity.date).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder={t('volunteer.signup.namePlaceholder')}
                  className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none font-handwritten bg-white/50"
                />
                <input
                  type="email"
                  placeholder={t('volunteer.signup.emailPlaceholder')}
                  className="w-full px-4 py-3 border-2 border-warm-green/30 rounded-xl focus:border-warm-green focus:outline-none font-handwritten bg-white/50"
                />
                <input
                  type="tel"
                  placeholder={t('volunteer.signup.phonePlaceholder')}
                  className="w-full px-4 py-3 border-2 border-warm-blue/30 rounded-xl focus:border-warm-blue focus:outline-none font-handwritten bg-white/50"
                />
                <textarea
                  rows={3}
                  placeholder={t('volunteer.signup.whyPlaceholder')}
                  className="w-full px-4 py-3 border-2 border-warm-golden/30 rounded-xl focus:border-warm-golden focus:outline-none font-handwritten bg-white/50 resize-none"
                />
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="handmade"
                  className="flex-1 font-handwritten font-bold"
                  onClick={submitApplication}
                >
                  <Heart className="mr-2 h-4 w-4" fill="currentColor" />
                  {t('volunteer.signup.submit')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSignupForm(false)}
                  className="border-2 border-warm-charcoal text-warm-charcoal hover:bg-warm-charcoal hover:text-white"
                >
                  {t('volunteer.signup.cancel')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center bg-gradient-to-r from-warm-orange via-warm-golden to-warm-green rounded-2xl p-12 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-handwritten font-bold mb-6 transform -rotate-1">
              {t('volunteer.cta.title')}
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90 font-handwritten leading-relaxed">
              {t('volunteer.cta.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                onClick={() => setShowGeneralSignup(true)}
                className="btn-handmade"
              >
                <HandHeart className="mr-3 h-5 w-5" />
                {t('volunteer.cta.generalSignup')}
              </Button>
              
              <Button
                onClick={() => setShowCreateOpportunity(true)}
                className="btn-handmade bg-gradient-to-r from-purple-500 to-blue-600 hover:from-blue-600 hover:to-purple-500 text-white border-2 border-purple-400"
              >
                {t('volunteer.cta.createOpportunity')}
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-white/80 font-handwritten"
            >
              <p>{t('volunteer.cta.quote')}</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* General Volunteer Signup Modal */}
      {showGeneralSignup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-warm-charcoal">Join as Volunteer</h3>
                <button
                  onClick={() => setShowGeneralSignup(false)}
                  className="text-warm-charcoal/50 hover:text-warm-charcoal"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
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
                      className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-charcoal mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
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
                    className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-charcoal mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                    placeholder="City, State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-charcoal mb-2">
                    Areas of Interest
                  </label>
                  <select
                    className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                  >
                    <option value="">Select your interest</option>
                    <option value="education">Education</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="environment">Environment</option>
                    <option value="community">Community Development</option>
                    <option value="disaster">Disaster Relief</option>
                    <option value="elderly">Elderly Care</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-charcoal mb-2">
                    Availability
                  </label>
                  <textarea
                    rows={3}
                    className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none resize-none"
                    placeholder="When are you available? (weekends, evenings, etc.)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-charcoal mb-2">
                    Why do you want to volunteer?
                  </label>
                  <textarea
                    rows={4}
                    className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none resize-none"
                    placeholder="Tell us about your motivation to volunteer..."
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowGeneralSignup(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-warm-orange to-warm-green text-white"
                    onClick={() => {
                      toast({
                        title: "Application Submitted!",
                        description: "Thank you for your interest in volunteering. We'll contact you soon.",
                      })
                      setShowGeneralSignup(false)
                    }}
                  >
                    <Heart className="h-4 w-4 mr-2" fill="currentColor" />
                    Join as Volunteer
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Opportunity Modal */}
      {showCreateOpportunity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-warm-charcoal">Create Volunteer Opportunity</h3>
                <button
                  onClick={() => setShowCreateOpportunity(false)}
                  className="text-warm-charcoal/50 hover:text-warm-charcoal"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-6">
                {/* Organization Details */}
                <div>
                  <h4 className="text-lg font-semibold text-warm-charcoal mb-4">Organization Details</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                        placeholder="Your organization name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        required
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
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                      placeholder="contact@organization.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                {/* Opportunity Details */}
                <div>
                  <h4 className="text-lg font-semibold text-warm-charcoal mb-4">Opportunity Details</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Opportunity Title *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                        placeholder="e.g., Teaching at Community Center"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-warm-charcoal mb-2">
                          Category *
                        </label>
                        <select
                          required
                          className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                        >
                          <option value="">Select category</option>
                          <option value="education">Education</option>
                          <option value="healthcare">Healthcare</option>
                          <option value="environment">Environment</option>
                          <option value="community">Community Development</option>
                          <option value="disaster">Disaster Relief</option>
                          <option value="elderly">Elderly Care</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-warm-charcoal mb-2">
                          Date *
                        </label>
                        <input
                          type="date"
                          required
                          className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-warm-charcoal mb-2">
                          Duration *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                          placeholder="e.g., 2-4 hours"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-warm-charcoal mb-2">
                          Location *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                          placeholder="City, State or Online"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-warm-charcoal mb-2">
                          Volunteers Needed *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                          placeholder="5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Description *
                      </label>
                      <textarea
                        required
                        rows={6}
                        className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none resize-none"
                        placeholder="Describe the volunteer opportunity, requirements, and impact..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-warm-charcoal mb-2">
                        Skills Required
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-warm-cream rounded-xl focus:border-warm-orange outline-none"
                        placeholder="e.g., Teaching, First Aid, Computer Skills (comma separated)"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateOpportunity(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 text-white"
                    onClick={() => {
                      toast({
                        title: "Opportunity Created!",
                        description: "Your volunteer opportunity has been submitted for review.",
                      })
                      setShowCreateOpportunity(false)
                    }}
                  >
                    Create Opportunity
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