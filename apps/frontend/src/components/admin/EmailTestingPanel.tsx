import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface EmailTestResult {
  success: boolean
  message: string
}

export function EmailTestingPanel() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<Record<string, EmailTestResult>>({})
  const { toast } = useToast()

  const [testData, setTestData] = useState({
    email: '',
    name: 'Test User',
    amount: '1000',
    campaign: 'गरीब बच्चों की शिक्षा (Education for Poor Children)'
  })

  const testEmail = async (type: 'welcome' | 'donation' | 'reset') => {
    if (!testData.email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to test",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    try {
      let endpoint = ''
      let body = {}

      switch (type) {
        case 'welcome':
          endpoint = '/api/test/email/welcome'
          body = { name: testData.name, email: testData.email }
          break
        case 'donation':
          endpoint = '/api/test/email/donation'
          body = { 
            email: testData.email, 
            amount: parseInt(testData.amount), 
            campaign: testData.campaign 
          }
          break
        case 'reset':
          endpoint = '/api/test/email/reset'
          body = { email: testData.email }
          break
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()
      
      setResults(prev => ({
        ...prev,
        [type]: { success: data.success, message: data.message }
      }))

      toast({
        title: data.success ? "Email Sent!" : "Email Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive"
      })

    } catch (error) {
      const errorMsg = 'Failed to send test email. Make sure the backend is running.'
      setResults(prev => ({
        ...prev,
        [type]: { success: false, message: errorMsg }
      }))

      toast({
        title: "Test Failed",
        description: errorMsg,
        variant: "destructive"
      })
    }

    setIsLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-warm-orange/10 rounded-lg">
          <Mail className="h-6 w-6 text-warm-orange" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-warm-charcoal">Email Testing Panel</h2>
          <p className="text-warm-charcoal-light">Test the email service functionality</p>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-warm-cream/50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-warm-charcoal mb-3">Test Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-warm-charcoal mb-2">
              Test Email Address *
            </label>
            <input
              type="email"
              value={testData.email}
              onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-warm-orange/30 rounded-lg focus:border-warm-orange focus:outline-none"
              placeholder="your-email@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-charcoal mb-2">
              Test User Name
            </label>
            <input
              type="text"
              value={testData.name}
              onChange={(e) => setTestData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-warm-orange/30 rounded-lg focus:border-warm-orange focus:outline-none"
              placeholder="Test User"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-charcoal mb-2">
              Test Donation Amount (₹)
            </label>
            <input
              type="number"
              value={testData.amount}
              onChange={(e) => setTestData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-3 py-2 border border-warm-orange/30 rounded-lg focus:border-warm-orange focus:outline-none"
              placeholder="1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-charcoal mb-2">
              Test Campaign Name
            </label>
            <input
              type="text"
              value={testData.campaign}
              onChange={(e) => setTestData(prev => ({ ...prev, campaign: e.target.value }))}
              className="w-full px-3 py-2 border border-warm-orange/30 rounded-lg focus:border-warm-orange focus:outline-none"
              placeholder="Campaign name"
            />
          </div>
        </div>
      </div>

      {/* Email Tests */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Welcome Email */}
        <div className="border border-warm-orange/20 rounded-lg p-4">
          <h4 className="font-semibold text-warm-charcoal mb-2">Welcome Email</h4>
          <p className="text-sm text-warm-charcoal-light mb-4">
            Beautiful onboarding email with platform features and Hindi greeting
          </p>
          <Button
            onClick={() => testEmail('welcome')}
            disabled={isLoading}
            className="w-full bg-warm-orange hover:bg-warm-orange/90"
          >
            <Send className="h-4 w-4 mr-2" />
            Test Welcome Email
          </Button>
          {results.welcome && (
            <div className={`mt-2 p-2 rounded text-sm flex items-center space-x-2 ${
              results.welcome.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {results.welcome.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-xs">{results.welcome.message}</span>
            </div>
          )}
        </div>

        {/* Donation Confirmation */}
        <div className="border border-warm-green/20 rounded-lg p-4">
          <h4 className="font-semibold text-warm-charcoal mb-2">Donation Confirmation</h4>
          <p className="text-sm text-warm-charcoal-light mb-4">
            Thank you email sent after successful donations
          </p>
          <Button
            onClick={() => testEmail('donation')}
            disabled={isLoading}
            className="w-full bg-warm-green hover:bg-warm-green/90"
          >
            <Send className="h-4 w-4 mr-2" />
            Test Donation Email
          </Button>
          {results.donation && (
            <div className={`mt-2 p-2 rounded text-sm flex items-center space-x-2 ${
              results.donation.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {results.donation.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-xs">{results.donation.message}</span>
            </div>
          )}
        </div>

        {/* Password Reset */}
        <div className="border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-warm-charcoal mb-2">Password Reset</h4>
          <p className="text-sm text-warm-charcoal-light mb-4">
            Secure password reset link for account recovery
          </p>
          <Button
            onClick={() => testEmail('reset')}
            disabled={isLoading}
            variant="outline"
            className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <Send className="h-4 w-4 mr-2" />
            Test Reset Email
          </Button>
          {results.reset && (
            <div className={`mt-2 p-2 rounded text-sm flex items-center space-x-2 ${
              results.reset.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {results.reset.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-xs">{results.reset.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Testing Instructions</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Enter your email address in the configuration above</li>
          <li>• Make sure the backend server is running on port 5000</li>
          <li>• Configure email settings in backend/.env file</li>
          <li>• Check your email inbox after testing</li>
          <li>• Emails may take a few minutes to arrive</li>
        </ul>
      </div>
    </motion.div>
  )
}
