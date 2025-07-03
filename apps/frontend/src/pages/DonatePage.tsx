import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { 
  Heart, 
  Shield, 
  BookOpen, 
  Utensils, 
  Droplets, 
  Users,
  Target,
  Clock,
  CheckCircle,
  Star,
  Globe,
  Coins,
  MapPin,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useDonationStore } from '@/store/donationStore'
import { getProgressPercentage } from '@/lib/utils'
import { IndianPaymentGateway } from '@/components/payment/IndianPaymentGateway'

// Define the Campaign type according to your data structure
interface Campaign {
  id: string
  title: string
  imageUrl: string
  raisedAmount: number
  targetAmount: number
  description?: string
  location?: string
  beneficiaries?: number
  isUrgent?: boolean
}

// --- PROFESSIONAL IMPACT CALCULATOR ---
const ImpactCalculator = ({ amount }: { amount: number }) => {
    const [isActive, setIsActive] = React.useState(false);
    
    const impact = {
      meals: Math.floor(amount / 50),
      books: Math.floor(amount / 200),
      medicine: Math.floor(amount / 300),
      waterDays: Math.floor(amount / 100),
      schoolDays: Math.floor(amount / 150)
    };
  
    const impactItems = [
      { 
        key: 'meals', 
        value: impact.meals, 
        icon: Utensils, 
        label: 'Nutritious Meals', 
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        description: 'for children and families'
      },
      { 
        key: 'books', 
        value: impact.books, 
        icon: BookOpen, 
        label: 'Educational Books', 
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        description: 'for students in need'
      },
      { 
        key: 'medicine', 
        value: impact.medicine, 
        icon: Heart, 
        label: 'Medical Treatments', 
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        description: 'for healthcare support'
      },
      { 
        key: 'waterDays', 
        value: impact.waterDays, 
        icon: Droplets, 
        label: 'Days of Clean Water', 
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50',
        description: 'for families'
      },
      { 
        key: 'schoolDays', 
        value: impact.schoolDays, 
        icon: Star, 
        label: 'School Days', 
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        description: 'of education'
      }
    ].filter(item => item.value > 0);

    React.useEffect(() => {
        setIsActive(amount > 0);
    }, [amount]);
  
    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Professional Impact Display */}
            <div className="bg-white rounded-2xl shadow-lg border border-warm-cream p-8 mb-8">
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-warm-charcoal mb-2">Your Impact</h3>
                    <div className="flex items-center justify-center gap-2">
                        <Coins className="h-6 w-6 text-warm-orange" />
                        <span className="text-3xl font-bold text-warm-orange">₹{amount.toLocaleString()}</span>
                    </div>
                    <p className="text-warm-charcoal/70 mt-2">will provide the following support:</p>
                </div>

                {/* Impact Grid */}
                <AnimatePresence mode="wait">
                    {isActive && impactItems.length > 0 ? (
                        <motion.div
                            key="impact-grid"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                            {impactItems.map((item, index) => (
                                <motion.div
                                    key={item.key}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`${item.bgColor} rounded-xl p-4 border-l-4 border-l-orange-500`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <item.icon className={`h-5 w-5 ${item.color}`} />
                                        <span className="font-bold text-lg text-warm-charcoal">{item.value}</span>
                                    </div>
                                    <h4 className="font-semibold text-warm-charcoal text-sm">{item.label}</h4>
                                    <p className="text-warm-charcoal/60 text-xs mt-1">{item.description}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 text-warm-charcoal/50"
                        >
                            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">Select an amount to see your impact</p>
                            <p className="text-sm">Every contribution makes a difference</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

// --- MAIN PAGE COMPONENT ---
export function DonatePage() {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('campaign');
  const { campaigns, getCampaignById, addDonation } = useDonationStore();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [donationAmount, setDonationAmount] = useState(1000);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  useEffect(() => {
    if (campaignId) {
      const campaign = getCampaignById(campaignId);
      setSelectedCampaign(campaign ?? null);
    } else if (campaigns.length > 0) {
      setSelectedCampaign(campaigns[0]);
    }
  }, [campaignId, campaigns, getCampaignById]);

  const quickAmounts = [500, 1000, 2500, 5000, 10000];

  if (!selectedCampaign) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-warm-orange mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-warm-charcoal mb-2">Loading Campaign...</h2>
          <p className="text-warm-charcoal/70">Preparing your donation experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-cream to-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-warm-orange/5 to-warm-green/5"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            {/* Campaign Header */}
            <div className="text-center mb-12">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold text-warm-charcoal mb-6 leading-tight"
              >
                Make a Difference Today
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-warm-charcoal/80 max-w-3xl mx-auto"
              >
                Your generosity has the power to transform lives. Join thousands of compassionate donors in creating positive change.
              </motion.p>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left Column - Campaign Details */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-8"
              >
                {/* Campaign Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-warm-cream">
                  <div className="relative h-64">
                    <img
                      src={selectedCampaign.imageUrl}
                      alt={selectedCampaign.title}
                      className="w-full h-full object-cover"
                    />
                    {selectedCampaign.isUrgent && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Urgent
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-warm-charcoal mb-4">{selectedCampaign.title}</h2>
                    
                    {/* Progress */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-warm-charcoal">Progress</span>
                        <span className="text-sm text-warm-charcoal/70">
                          {getProgressPercentage(selectedCampaign.raisedAmount, selectedCampaign.targetAmount)}%
                        </span>
                      </div>
                      <Progress 
                        value={getProgressPercentage(selectedCampaign.raisedAmount, selectedCampaign.targetAmount)} 
                        className="h-3 mb-3"
                      />
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-warm-orange">₹{selectedCampaign.raisedAmount.toLocaleString()}</span>
                        <span className="text-warm-charcoal/70">of ₹{selectedCampaign.targetAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Campaign Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 bg-warm-cream rounded-lg">
                        <Users className="h-5 w-5 text-warm-orange mx-auto mb-1" />
                        <div className="text-lg font-bold text-warm-charcoal">{selectedCampaign.beneficiaries || 'Many'}</div>
                        <div className="text-xs text-warm-charcoal/70">Beneficiaries</div>
                      </div>
                      <div className="text-center p-3 bg-warm-cream rounded-lg">
                        <MapPin className="h-5 w-5 text-warm-orange mx-auto mb-1" />
                        <div className="text-sm font-bold text-warm-charcoal">{selectedCampaign.location}</div>
                        <div className="text-xs text-warm-charcoal/70">Location</div>
                      </div>
                      <div className="text-center p-3 bg-warm-cream rounded-lg">
                        <Target className="h-5 w-5 text-warm-orange mx-auto mb-1" />
                        <div className="text-lg font-bold text-warm-charcoal">
                          {Math.round((selectedCampaign.raisedAmount / selectedCampaign.targetAmount) * 100)}%
                        </div>
                        <div className="text-xs text-warm-charcoal/70">Funded</div>
                      </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex items-center gap-4 text-sm text-warm-charcoal/70">
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>Verified Campaign</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span>Tax Benefits</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Donation Form */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-8"
              >
                {/* Donation Form */}
                <div className="bg-white rounded-2xl shadow-lg border border-warm-cream p-8">
                  <h3 className="text-2xl font-bold text-warm-charcoal mb-6">Make Your Donation</h3>
                  
                  {/* Amount Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-warm-charcoal mb-3">
                      Select Amount
                    </label>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {quickAmounts.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setDonationAmount(amount)}
                          className={`p-3 rounded-xl font-semibold transition-all ${
                            donationAmount === amount
                              ? 'bg-warm-orange text-white shadow-lg transform scale-105'
                              : 'bg-warm-cream text-warm-charcoal hover:bg-warm-orange/10 border border-warm-orange/20'
                          }`}
                        >
                          ₹{amount.toLocaleString()}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-charcoal font-semibold">₹</span>
                      <input
                        type="number"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(parseInt(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-3 border-2 border-warm-cream rounded-xl focus:border-warm-orange outline-none transition-colors font-semibold text-lg"
                        placeholder="Enter custom amount"
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Donor Information */}
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-warm-charcoal mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          className="w-full p-3 border-2 border-warm-cream rounded-xl focus:border-warm-orange outline-none transition-colors"
                          placeholder="Enter your name"
                          disabled={isAnonymous}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-warm-charcoal mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={donorEmail}
                          onChange={(e) => setDonorEmail(e.target.value)}
                          className="w-full p-3 border-2 border-warm-cream rounded-xl focus:border-warm-orange outline-none transition-colors"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="w-4 h-4 text-warm-orange rounded"
                      />
                      <label htmlFor="anonymous" className="text-sm text-warm-charcoal">
                        Donate anonymously
                      </label>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-warm-charcoal mb-3">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['upi', 'card', 'netbanking'].map((method) => (
                        <button
                          key={method}
                          onClick={() => setSelectedPayment(method)}
                          className={`p-3 rounded-xl font-medium transition-all capitalize ${
                            selectedPayment === method
                              ? 'bg-warm-green text-white shadow-lg'
                              : 'bg-warm-cream text-warm-charcoal hover:bg-warm-green/10 border border-warm-green/20'
                          }`}
                        >
                          {method === 'upi' ? 'UPI' : method === 'card' ? 'Card' : 'Net Banking'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Donate Button */}
                  <button
                    onClick={() => setShowPaymentGateway(true)}
                    className="w-full bg-gradient-to-r from-warm-orange to-warm-golden text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Heart className="h-5 w-5" fill="currentColor" />
                    Donate ₹{donationAmount.toLocaleString()} Now
                  </button>

                  {/* Security Notice */}
                  <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2 text-green-700 text-sm">
                      <Shield className="h-4 w-4" />
                      <span>Secure & Transparent</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      All donations are processed securely and tracked on blockchain for complete transparency.
                    </p>
                  </div>
                </div>

                {/* Impact Calculator */}
                <ImpactCalculator amount={donationAmount} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Payment Gateway Modal */}
      <AnimatePresence>
        {showPaymentGateway && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPaymentGateway(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-warm-charcoal">Complete Your Donation</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPaymentGateway(false)}
                    className="text-warm-charcoal hover:bg-warm-cream"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <IndianPaymentGateway
                  amount={donationAmount}
                  campaignId={selectedCampaign?.id || ''}
                  onSuccess={(paymentData) => {
                    // Add donation to store
                    addDonation({
                      id: Date.now().toString(),
                      amount: donationAmount,
                      cause: selectedCampaign?.title || 'General Donation',
                      donorName: isAnonymous ? 'Anonymous' : donorName,
                      donorEmail,
                      isAnonymous,
                      timestamp: new Date(),
                      status: 'completed',
                      paymentMethod: selectedPayment as 'upi' | 'card' | 'netbanking',
                      transactionId: paymentData.transactionId
                    });
                    
                    setShowPaymentGateway(false);
                  }}
                  onError={(error) => {
                    console.error('Payment error:', error);
                    setShowPaymentGateway(false);
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DonatePage;
