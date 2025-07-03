import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/use-toast'

interface AdminLoginProps {
  onSuccess?: () => void
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const { loginAsAdmin, isLoading } = useAuthStore()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const success = await loginAsAdmin(credentials.username, credentials.password)
    
    if (success) {
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the administration panel.",
      })
      onSuccess?.()
    } else {
      toast({
        title: "Authentication Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-orange/10 via-warm-cream to-warm-green/10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-warm-orange/10 rounded-full mb-4">
            <Shield className="h-8 w-8 text-warm-orange" />
          </div>
          <h2 className="text-3xl font-handwritten font-bold text-warm-charcoal mb-2">
            Admin Access Required
          </h2>
          <p className="text-warm-charcoal-light">
            Please authenticate to access the administration panel
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-warm-charcoal mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-warm-charcoal/50" />
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none font-main"
                placeholder="Enter admin username"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-warm-charcoal mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-warm-charcoal/50" />
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none font-main"
                placeholder="Enter admin password"
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-warm-orange hover:bg-warm-orange/90 text-white font-semibold py-3 transform hover:scale-105 transition-all duration-300"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Authenticating...
              </div>
            ) : (
              <>
                <Shield className="mr-2 h-5 w-5" />
                Access Admin Panel
              </>
            )}
          </Button>
        </form>
        
        <div className="text-xs text-warm-charcoal-light text-center mt-4 p-3 bg-warm-orange/10 rounded-lg">
          <p><strong>Demo Credentials:</strong></p>
          <p>Username: admin</p>
          <p>Password: dilsedaan2024</p>
        </div>
      </motion.div>
    </div>
  )
}
