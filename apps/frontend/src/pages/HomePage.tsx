import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Heart, Smile, Home, BookOpen, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useDonationStore } from '@/store/donationStore'
import { formatCurrency, formatNumber, getProgressPercentage } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'

type Campaign = {
  id: string
  imageUrl: string
  title: string
  description: string
  category: string
  donorCount: number
  raisedAmount: number
  targetAmount: number
  location: string
  isUrgent?: boolean
}

export function HomePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useTranslation()
  const { campaigns } = useDonationStore()
  const featuredCampaigns: Campaign[] = campaigns.slice(0, 3)

  const handleReadStory = (storyTitle: string) => {
    toast({
      title: "Reading Full Story",
      description: `Opening "${storyTitle}" for you...`,
    })
    // Navigate to impact page with story details
    navigate('/impact', { state: { storyTitle } })
  }

  const handleDonateClick = (campaignId?: string) => {
    toast({
      title: "Redirecting to Donate",
      description: "Taking you to our secure donation page...",
    })
    const url = campaignId ? `/donate?campaign=${campaignId}` : '/donate'
    navigate(url)
  }

  const handleVolunteerClick = () => {
    toast({
      title: "Join Our Volunteer Family!",
      description: "Let's make a difference together...",
    })
    navigate('/volunteer')
  }

  const handleTransparencyClick = () => {
    toast({
      title: "View Transparency Reports",
      description: "See exactly where every rupee goes...",
    })
    navigate('/transparency')
  }

  const handleCampaignsClick = () => {
    toast({
      title: "Browsing All Campaigns",
      description: "Exploring all the ways to help...",
    })
    navigate('/campaigns')
  }

  const stats = [
    { 
      label: t('home.stats.familiesFed'), 
      value: '15,432', 
      icon: Heart, 
      description: t('home.stats.familiesFedDesc'),
      color: 'text-warm-orange'
    },
    { 
      label: t('home.stats.childrenEducated'), 
      value: '9,876', 
      icon: Smile,
      description: t('home.stats.childrenEducatedDesc'),
      color: 'text-warm-green'
    },
    { 
      label: t('home.stats.livesSaved'), 
      value: '234', 
      icon: Home, 
      description: t('home.stats.livesSavedDesc'),
      color: 'text-warm-blue'
    },
    { 
      label: t('home.stats.skillsTrained'), 
      value: '1,567', 
      icon: BookOpen, 
      description: t('home.stats.skillsTrainedDesc'),
      color: 'text-warm-golden'
    },
  ]

  const impactStories = [
    {
      title: "Ravi's ₹300 Journey: From Dim Corners to Bright Futures",
      description: "Your ₹300 helped Ravi from a Delhi slum get his school books. Now he dreams of becoming an engineer! From studying under street lights to having his own desk, Ravi's transformation shows how small acts of kindness create ripples of hope across generations.",
      image: "/images/home_image_1.png",
      impact: "Education",
      hearts: 456
    },
    {
      title: "The 7 PM Promise: No Child Sleeps Hungry in Dadar",
      description: "Thanks to 89 donors, street children in Mumbai get hot meals daily. No child sleeps hungry anymore. Every evening at 7 PM, warm meals reach 200+ children, turning empty stomachs into full hearts and creating a community where care knows no boundaries.",
      image: "/images/home_image_2.png", 
      impact: "Food & Nutrition",
      hearts: 623
    },
    {
      title: "Breaking Barriers in Rural Bihar: Meera's Educational Triumph",
      description: "Your kindness helped Meera from rural Bihar attend school. She's now the first girl in her village to reach 10th grade! Breaking centuries of tradition, Meera's courage and your support are paving the way for countless girls to dream beyond boundaries.",
      image: "/images/home_image_3.png",
      impact: "Women Empowerment", 
      hearts: 789
    }
  ]

  return (
    <div className="min-h-screen bg-warm-cream">
      {/* Hero Section with Hand-drawn Feel */}
      <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden mandala-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-warm-orange/5 via-warm-cream to-warm-green/5"></div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-4 sm:left-10 w-16 h-16 sm:w-20 sm:h-20 bg-warm-orange/10 rounded-full blur-xl animate-gentle-float"></div>
        <div className="absolute bottom-20 right-4 sm:right-10 w-24 h-24 sm:w-32 sm:h-32 bg-warm-green/10 rounded-full blur-xl animate-gentle-float" style={{ animationDelay: '1s' }}></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Hand-drawn style heading */}
            <div className="mb-8 space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 text-warm-charcoal leading-tight">
                <span className="inline-block hero-script text-5xl sm:text-6xl md:text-7xl lg:text-8xl">Dil Se</span>
                <br />
                <span className="inline-block hero-script text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-black">Donate Karo</span>
                <br />
                <span className="text-2xl sm:text-3xl md:text-4xl inline-block hero-subtitle mt-2">
                  {t('home.hero.subtitle')}
                </span>
              </h1>
              
              {/* Hand-drawn underline */}
              <svg className="mx-auto mt-4" width="300" height="20" viewBox="0 0 300 20">
                <path 
                  d="M10,15 Q150,5 290,12" 
                  stroke="#ff9a00" 
                  strokeWidth="3" 
                  fill="none"
                  className="sketch-line"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl md:text-2xl text-warm-charcoal-light mb-8 max-w-3xl mx-auto leading-relaxed font-main font-medium"
            >
              {t('home.hero.description')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Button
                variant="handmade"
                size="handmade"
                className="transform hover:scale-110 hover:rotate-2 shadow-handmade"
                onClick={() => handleDonateClick()}
              >
                <Heart className="mr-3 h-5 w-5 animate-heart-beat" fill="currentColor" />
                {t('home.hero.startDonating')}
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="handmade"
                className="border-2 border-warm-green text-warm-green hover:bg-warm-green hover:text-white transform hover:-rotate-1 font-bold"
                onClick={handleTransparencyClick}
              >
                {t('home.hero.viewTransparency')}
              </Button>
            </motion.div>

            {/* Trust indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-8 flex items-center justify-center space-x-2 text-warm-charcoal-light"
            >
              <div className="w-3 h-3 bg-warm-green rounded-full animate-pulse"></div>
              <span className="text-sm">100% transparent • Blockchain secured • Made with ❤️ in India</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats with Organic Feel */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 lotus-pattern"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl section-heading mb-4">
              {t('home.stats.title')}
            </h2>
            <p className="text-warm-charcoal-light text-lg">{t('home.stats.subtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 imperfect-grid">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? 1 : -1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="warm-card text-center group hover:shadow-handmade transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-3 sm:mb-4 ${stat.color} bg-current/10 group-hover:animate-bounce-gentle`}>
                  <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color}`} />
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-warm-charcoal mb-2">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base text-warm-charcoal font-medium mb-1">{stat.label}</div>
                <div className="text-xs sm:text-sm text-warm-charcoal-light">{stat.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Stories Section */}
      <section className="py-20 bg-warm-cream relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl section-heading mb-4">
              {t('home.stories.title')}
            </h2>
            <p className="text-xl text-warm-charcoal-light max-w-2xl mx-auto">
              {t('home.stories.subtitle')}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {impactStories.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="warm-card group hover:shadow-handmade transition-all duration-500 transform hover:-translate-y-2 hover:rotate-1"
              >
                <div className="relative overflow-hidden rounded-2xl mb-6">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg">
                    <span className="text-sm text-warm-orange font-bold">
                      {story.impact}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg">
                    <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
                    <span className="text-sm font-bold text-warm-charcoal">{story.hearts} hearts</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-warm-charcoal leading-tight line-clamp-2">
                    {story.title}
                  </h3>
                  <p className="text-warm-charcoal-light leading-relaxed text-sm line-clamp-4">
                    {story.description}
                  </p>
                  
                  <div className="pt-4 border-t border-warm-orange/20">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-warm-orange hover:text-white hover:bg-warm-orange border-warm-orange font-medium transform hover:scale-105 transition-all duration-300 w-full"
                      onClick={() => handleReadStory(story.title)}
                    >
                      Read Full Story
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bridge Section between Real Stories and Campaigns */}
      <section className="py-1 bg-gradient-to-r from-warm-cream via-warm-orange/5 to-warm-cream">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl section-heading text-warm-charcoal transform -rotate-1">
              {t('home.stories.bridge')}
            </h2>
            <p className="text-lg text-warm-charcoal-light mt-2 max-w-xl mx-auto">
              {t('home.stories.bridgeSubtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Campaigns with Hand-drawn Progress */}
      <section className="pt-1 pb-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 paper-texture"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl md:text-5xl section-heading mb-4">
              {t('home.campaigns.title')}
            </h2>
            <p className="text-xl text-warm-charcoal-light max-w-2xl mx-auto">
              {t('home.campaigns.subtitle')}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 50, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? 1 : -1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="warm-card group hover:shadow-handmade transition-all duration-500 transform hover:-translate-y-3"
              >
                <div className="relative overflow-hidden rounded-2xl mb-6">
                  <img
                    src={campaign.imageUrl}
                    alt={campaign.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  
                  {campaign.isUrgent && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                      {t('campaigns.urgent')} 🚨
                    </div>
                  )}
                  
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-sm bg-black/50 px-2 py-1 rounded">
                      📍 {t(`campaigns.campaign${parseInt(campaign.id)}.location`)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-warm-orange bg-warm-orange/10 px-3 py-1 rounded-full font-medium">
                      {t(`campaigns.campaign${parseInt(campaign.id)}.category`)}
                    </span>
                    <span className="text-sm text-warm-charcoal-light">
                      {campaign.donorCount} {t('campaigns.kindHearts')} ❤️
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-warm-charcoal leading-tight">
                    {t(`campaigns.campaign${parseInt(campaign.id)}.title`)}
                  </h3>
                  
                  <p className="text-warm-charcoal-light leading-relaxed">
                    {t(`campaigns.campaign${parseInt(campaign.id)}.description`)}
                  </p>

                  {/* Hand-drawn style progress */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-warm-charcoal">{t('campaigns.progress')}</span>
                      <span className="text-sm font-semibold text-warm-green">
                        {getProgressPercentage(campaign.raisedAmount, campaign.targetAmount).toFixed(0)}% {t('campaigns.complete')} 🎉
                      </span>
                    </div>
                    
                    <Progress 
                      value={getProgressPercentage(campaign.raisedAmount, campaign.targetAmount)} 
                      variant="handmade"
                      className="transform rotate-1"
                    />
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-lg font-bold text-warm-green">
                          {formatCurrency(campaign.raisedAmount)}
                        </div>
                        <div className="text-sm text-warm-charcoal-light">
                          {t('campaigns.raised')} {formatCurrency(campaign.targetAmount)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-warm-orange">
                          {formatNumber(Math.floor((campaign.targetAmount - campaign.raisedAmount) / 100))}
                        </div>
                        <div className="text-sm text-warm-charcoal-light">
                          {t('campaigns.moreFamiliesToHelp')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="organic"
                    className="w-full font-semibold text-lg py-6 bg-gradient-to-r from-warm-orange to-warm-golden hover:from-warm-golden hover:to-warm-orange shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    onClick={() => handleDonateClick(campaign.id)}
                  >
                    <Heart className="mr-2 h-5 w-5 animate-heart-beat" fill="currentColor" />
                    {t('campaigns.donateWithLove')}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-12"
          >
            <Button
              variant="outline"
              size="handmade"
              className="border-2 border-warm-green text-warm-green hover:bg-warm-green hover:text-white transform hover:rotate-1"
              onClick={handleCampaignsClick}
            >
              {t('common.seeAll')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Trust & Transparency Section */}
      <section className="py-20 bg-gradient-to-br from-warm-green/10 via-warm-cream to-warm-blue/10 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl section-heading mb-4">
              {t('home.trust.title')}
            </h2>
            <p className="text-xl text-warm-charcoal-light max-w-2xl mx-auto">
              {t('home.trust.subtitle')}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: "🔗",
                title: t('home.trust.blockchain.title'),
                description: t('home.trust.blockchain.description'),
                color: "warm-blue"
              },
              {
                icon: "📸",
                title: t('home.trust.photos.title'),
                description: t('home.trust.photos.description'),
                color: "warm-green"
              },
              {
                icon: "❤️",
                title: t('home.trust.madeInIndia.title'),
                description: t('home.trust.madeInIndia.description'),
                color: "warm-orange"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="warm-card text-center group hover:shadow-handmade transition-all duration-500 transform hover:-translate-y-2 p-6 min-h-[280px] flex flex-col justify-center"
              >
                <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 group-hover:animate-bounce-gentle">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-warm-charcoal mb-3 sm:mb-4">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-warm-charcoal-light leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action with Emotional Appeal */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-warm-orange via-warm-golden to-warm-green relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-4xl mx-auto text-white space-y-6 md:space-y-8"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl section-heading transform -rotate-1 leading-tight text-white">
              {t('home.cta.title')}
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl opacity-90 leading-relaxed max-w-3xl mx-auto">
              {t('home.cta.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center pt-4">
              <Button
                variant="secondary"
                size="handmade"
                className="bg-white text-warm-orange hover:bg-warm-cream transform hover:scale-110 hover:-rotate-2 shadow-handmade font-semibold w-full sm:w-auto"
                onClick={() => handleDonateClick()}
              >
                <Heart className="mr-3 h-5 w-5 animate-heart-beat" fill="currentColor" />
                {t('home.cta.startDonating')}
              </Button>
              
              <Button
                variant="outline"
                size="handmade"
                className="border-2 border-white text-white hover:bg-white hover:text-warm-orange transform hover:rotate-1 font-medium w-full sm:w-auto bg-transparent"
                onClick={handleVolunteerClick}
              >
                {t('home.cta.volunteer')}
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="pt-2 text-white/80 font-handwritten"
            >
              <p>{t('home.cta.madeWithLove')}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}