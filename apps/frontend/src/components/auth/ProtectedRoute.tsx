import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore, type UserRole } from '@/store/authStore'
import { LoginModal } from '@/components/auth/LoginModal'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  fallbackPath?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole = 'user', 
  fallbackPath = '/' 
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Not authenticated at all
  if (!isAuthenticated || !user) {
    if (requiredRole === 'admin') {
      return <Navigate to={fallbackPath} replace />
    }
    
    // For user routes, show login modal
    return (
      <>
        <LoginModal 
          isOpen={true} 
          onClose={() => setShowLoginModal(false)}
        />
        <Navigate to={fallbackPath} replace />
      </>
    )
  }

  // Check role permissions
  const hasPermission = () => {
    if (requiredRole === 'guest') return true
    if (requiredRole === 'user') return user.role === 'user' || user.role === 'admin'
    if (requiredRole === 'admin') return user.role === 'admin'
    return false
  }

  if (!hasPermission()) {
    return <Navigate to={fallbackPath} replace />
  }

  return <>{children}</>
}
