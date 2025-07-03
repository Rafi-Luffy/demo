import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  QrCode, 
  Shield, 
  CheckCircle, 
  IndianRupee, 
  Users,
  Calculator,
  Gift,
  Clock,
  AlertCircle,
  Heart,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface PaymentMethod {
  id: string
  name: string
  icon: React.ElementType
  description: string
  processingFee: number
  instantTransfer: boolean
  supportedBanks?: string[]
  color: string
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'upi',
    name: 'UPI',
    icon: Smartphone,
    description: 'PhonePe, GPay, Paytm & 200+ apps',
    processingFee: 0,
    instantTransfer: true,
    color: 'bg-green-50 border-green-200 text-green-700'
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    icon: Building2,
    description: 'All major Indian banks',
    processingFee: 0,
    instantTransfer: true,
    supportedBanks: ['SBI', 'HDFC', 'ICICI', 'Axis', 'PNB', 'BOB', '60+ more'],
    color: 'bg-blue-50 border-blue-200 text-blue-700'
  },
  {
    id: 'cards',
    name: 'Debit/Credit Card',
    icon: CreditCard,
    description: 'Visa, Mastercard, RuPay',
    processingFee: 2.5,
    instantTransfer: true,
    color: 'bg-purple-50 border-purple-200 text-purple-700'
  },
  {
    id: 'wallet',
    name: 'Digital Wallets',
    icon: QrCode,
    description: 'Paytm, PhonePe, Amazon Pay',
    processingFee: 1.5,
    instantTransfer: true,
    color: 'bg-orange-50 border-orange-200 text-orange-700'
  }
]

interface IndianPaymentGatewayProps {
  amount: number
  campaignId: string
  onSuccess: (paymentData: any) => void
  onError: (error: string) => void
}

export function IndianPaymentGateway({ 
  amount, 
  campaignId, 
  onSuccess, 
  onError 
}: IndianPaymentGatewayProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showTaxBenefits, setShowTaxBenefits] = useState(false)
  const { toast } = useToast()

  const calculateTaxSaving = (donationAmount: number) => {
    // 80G deduction - 50% of donation or 10% of gross income (whichever is less)
    const taxSaving = Math.min(donationAmount * 0.5, donationAmount * 0.3) // Assuming 30% tax bracket
    return Math.floor(taxSaving)
  }

  const processingFee = selectedMethod ? 
    paymentMethods.find(m => m.id === selectedMethod)?.processingFee || 0 : 0
  
  const finalAmount = amount + (amount * processingFee / 100)
  const taxSaving = calculateTaxSaving(amount)

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast({
        title: 'Payment Method Required',
        description: 'Please select a payment method to continue',
        variant: 'destructive'
      })
      return
    }

    setIsProcessing(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const paymentData = {
        transactionId: `TXN${Date.now()}`,
        amount: finalAmount,
        method: selectedMethod,
        campaignId,
        timestamp: new Date().toISOString(),
        taxCertificateEligible: true
      }
      
      onSuccess(paymentData)
      
      toast({
        title: 'Payment Successful! 🎉',
        description: `₹${amount.toLocaleString()} donated successfully. Tax certificate will be emailed.`,
        variant: 'success'
      })
    } catch (error) {
      onError('Payment failed. Please try again.')
      toast({
        title: 'Payment Failed',
        description: 'Please try again or contact support',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tax Benefits Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Calculator className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-handwritten font-bold text-green-700 text-lg">
                Tax Benefits Under Section 80G
              </h3>
              <p className="text-sm text-green-600">Save taxes while making a difference!</p>
            </div>
          </div>
          <Gift className="h-8 w-8 text-green-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white/70 p-3 rounded-lg text-center">
            <IndianRupee className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <p className="text-sm text-gray-600">Your Donation</p>
            <p className="font-bold text-green-700">₹{amount.toLocaleString()}</p>
          </div>
          <div className="bg-white/70 p-3 rounded-lg text-center">
            <FileText className="h-5 w-5 mx-auto mb-1 text-blue-600" />
            <p className="text-sm text-gray-600">Tax Deduction (50%)</p>
            <p className="font-bold text-blue-700">₹{Math.floor(amount * 0.5).toLocaleString()}</p>
          </div>
          <div className="bg-white/70 p-3 rounded-lg text-center">
            <Calculator className="h-5 w-5 mx-auto mb-1 text-purple-600" />
            <p className="text-sm text-gray-600">Estimated Tax Saving</p>
            <p className="font-bold text-purple-700">₹{taxSaving.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-sm text-green-700">
          <CheckCircle className="h-4 w-4" />
          <span>80G Certificate will be emailed within 24 hours</span>
        </div>
      </motion.div>

      {/* Payment Methods */}
      <div>
        <h3 className="text-lg font-handwritten font-bold text-warm-charcoal mb-4">
          Choose Payment Method 💳
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method, index) => (
            <motion.button
              key={method.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedMethod(method.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-300 transform hover:scale-105 ${
                selectedMethod === method.id
                  ? 'border-warm-orange bg-warm-orange/10'
                  : 'border-warm-cream hover:border-warm-orange/50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${method.color}`}>
                  <method.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-handwritten font-bold text-warm-charcoal">
                      {method.name}
                    </h4>
                    {method.instantTransfer && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Instant
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-warm-charcoal-light mt-1">
                    {method.description}
                  </p>
                  {method.processingFee > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      Processing fee: {method.processingFee}%
                    </p>
                  )}
                  {method.supportedBanks && (
                    <p className="text-xs text-blue-600 mt-1">
                      Supports: {method.supportedBanks.slice(0, 3).join(', ')}
                      {method.supportedBanks.length > 3 && '...'}
                    </p>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Amount Summary */}
      {selectedMethod && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-warm-cream/50 p-4 rounded-xl"
        >
          <h4 className="font-handwritten font-bold text-warm-charcoal mb-3">
            Payment Summary
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Donation Amount:</span>
              <span>₹{amount.toLocaleString()}</span>
            </div>
            {processingFee > 0 && (
              <div className="flex justify-between text-sm text-orange-600">
                <span>Processing Fee ({processingFee}%):</span>
                <span>₹{Math.ceil(amount * processingFee / 100).toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-warm-orange/20 pt-2 flex justify-between font-bold">
              <span>Total Amount:</span>
              <span>₹{Math.ceil(finalAmount).toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Security Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <Shield className="h-5 w-5 text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-700">Secure & Encrypted</h4>
            <p className="text-sm text-blue-600">
              256-bit SSL encryption • PCI DSS compliant • Your payment data is 100% secure
            </p>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={!selectedMethod || isProcessing}
        className="w-full py-6 text-lg font-handwritten font-bold bg-warm-orange hover:bg-warm-orange/90 text-white transform hover:scale-105 transition-all duration-300"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Processing Payment...
          </>
        ) : (
          <>
            <Heart className="mr-3 h-5 w-5 animate-pulse" fill="currentColor" />
            Complete Donation of ₹{Math.ceil(finalAmount).toLocaleString()}
          </>
        )}
      </Button>

      {/* Trust Indicators */}
      <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-warm-charcoal-light">
        <div className="flex items-center space-x-1">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>12A/80G Registered</span>
        </div>
        <div className="flex items-center space-x-1">
          <Shield className="h-4 w-4 text-blue-500" />
          <span>FCRA Compliant</span>
        </div>
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-purple-500" />
          <span>10,000+ Happy Donors</span>
        </div>
        <div className="flex items-center space-x-1">
          <FileText className="h-4 w-4 text-orange-500" />
          <span>Instant Tax Receipt</span>
        </div>
      </div>
    </div>
  )
}
