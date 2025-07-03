import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X, Heart, Globe, Wallet, User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { useWeb3Store } from '@/store/web3Store'
import { useLanguageStore } from '@/store/languageStore'
import { useAuthStore } from '@/store/authStore'
import { LoginModal } from '@/components/auth/LoginModal'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const publicNavItems = [
  { href: '/', key: 'Home' },
  { href: '/campaigns', key: 'Stories' },
  { href: '/impact', key: 'Impact' },
  { href: '/transparency', key: 'Trust' },
  { href: '/volunteer', key: 'Volunteer' },
  { href: '/about', key: 'About' },
  { href: '/contact', key: 'Contact' },
]

const userNavItems = [
  { href: '/', key: 'Home' },
  { href: '/campaigns', key: 'Stories' },
  { href: '/dashboard', key: 'Dashboard' },
  { href: '/impact', key: 'Impact' },
  { href: '/transparency', key: 'Trust' },
  { href: '/volunteer', key: 'Volunteer' },
  { href: '/about', key: 'About' },
  { href: '/contact', key: 'Contact' },
]

const adminNavItems = [
  { href: '/', key: 'Home' },
  { href: '/campaigns', key: 'Stories' },
  { href: '/dashboard', key: 'Dashboard' },
  { href: '/admin', key: 'Admin' },
  { href: '/impact', key: 'Impact' },
  { href: '/transparency', key: 'Trust' },
  { href: '/blockchain', key: 'Blockchain' },
  { href: '/audit', key: 'Audit' },
  { href: '/volunteer', key: 'Volunteer' },
  { href: '/about', key: 'About' },
  { href: '/contact', key: 'Contact' },
]

const blockchainItems = [
  { href: '/smart-contracts', key: 'Smart Contracts' },
  { href: '/documents', key: 'Documents' },
  { href: '/milestones', key: 'Milestones' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showBlockchainMenu, setShowBlockchainMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { isConnected, account, connectWallet, disconnectWallet, initializeWeb3 } = useWeb3Store()
  const { currentLanguage, switchLanguage, isHindi } = useLanguageStore()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { t } = useTranslation()
  const location = useLocation()

  // Get appropriate nav items based on user role
  const getNavItems = () => {
    if (user?.role === 'admin') return adminNavItems
    if (user?.role === 'user') return userNavItems
    return publicNavItems
  }

  const navItems = getNavItems()

  // Initialize web3 on component mount
  React.useEffect(() => {
    initializeWeb3()
  }, [initializeWeb3])

  const handleWalletAction = async () => {
    if (isConnected) {
      disconnectWallet()
    } else {
      try {
        await connectWallet()
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-warm-cream/95 backdrop-blur-md border-b border-warm-orange/20 shadow-gentle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo with hand-drawn feel - FIXED SIZE */}
          <Link to="/" className="flex items-center space-x-1 sm:space-x-2 group flex-shrink-0">
            <motion.div 
              className="relative"
              whileHover={{ rotate: [0, -10, 10, -5, 0] }}
              transition={{ duration: 0.5 }}
            >
              <div className="h-8 w-8 sm:h-9 sm:w-9 bg-gradient-to-br from-warm-orange to-warm-pink rounded-full flex items-center justify-center shadow-gentle transform -rotate-3">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="currentColor" />
              </div>
              {/* Hand-drawn circle accent */}
              <div className="absolute inset-0 rounded-full border-2 border-warm-orange/30 transform rotate-6 scale-110"></div>
            </motion.div>
            <div className="hidden sm:flex flex-col justify-center leading-none">
              <motion.h1 
                className="font-handwritten font-bold text-warm-orange group-hover:text-warm-golden transition-colors duration-300 text-sm"
                whileHover={{ scale: 1.05 }}
                style={{ lineHeight: 1 }}
              >
                DilSeDaan
              </motion.h1>
              <p className="text-xs text-warm-orange/80 font-handwritten" style={{ lineHeight: 1 }}>दिल से ❤️</p>
            </div>
          </Link>

          {/* Desktop Navigation - Improved for Admin */}
          <div className="hidden lg:flex items-center space-x-1 max-w-2xl overflow-x-auto scrollbar-hide">
            {navItems.map((item) => (
              <div key={item.href} className="relative flex-shrink-0">
                {item.href === '/blockchain' ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setShowBlockchainMenu(true)}
                    onMouseLeave={() => setShowBlockchainMenu(false)}
                  >
                    <Link
                      to={item.href}
                      className={cn(
                        'px-2 py-1 text-xs font-medium transition-all duration-300 rounded-lg relative group transform hover:-rotate-1 whitespace-nowrap',
                        location.pathname.startsWith('/blockchain') || location.pathname.startsWith('/smart-contracts') || location.pathname.startsWith('/documents') || location.pathname.startsWith('/milestones') || location.pathname.startsWith('/audit')
                          ? 'text-warm-orange bg-warm-orange/10'
                          : 'text-warm-charcoal hover:text-warm-orange hover:bg-warm-orange/5'
                      )}
                    >
                      {item.key}
                    </Link>
                    
                    {/* Blockchain Dropdown */}
                    {showBlockchainMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-handmade border border-warm-orange/20 py-2 z-50"
                      >
                        {blockchainItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            to={subItem.href}
                            className="block px-4 py-2 text-sm text-warm-charcoal hover:text-warm-orange hover:bg-warm-orange/5 transition-colors"
                          >
                            {subItem.key}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={cn(
                      'px-2 py-1 text-xs font-medium transition-all duration-300 rounded-lg relative group transform hover:-rotate-1 whitespace-nowrap',
                      location.pathname === item.href
                        ? 'text-warm-orange bg-warm-orange/10'
                        : 'text-warm-charcoal hover:text-warm-orange hover:bg-warm-orange/5'
                    )}
                  >
                    {item.key}
                    {location.pathname === item.href && (
                      <motion.div
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-warm-orange rounded-full"
                        layoutId="navbar-indicator"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    {/* Hand-drawn underline effect on hover */}
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-warm-orange/50 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Language Selection */}
            <LanguageSwitcher />

            {/* Authentication Section */}
            {isAuthenticated ? (
              <div
                className="relative"
                onMouseEnter={() => setShowUserMenu(true)}
                onMouseLeave={() => setShowUserMenu(false)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 h-9 px-3 rounded-full hover:bg-warm-orange/10 transition-all duration-300"
                >
                  <div className="h-6 w-6 rounded-full bg-warm-orange flex items-center justify-center">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-warm-charcoal hidden sm:block">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className="h-3 w-3 text-warm-charcoal" />
                </Button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-handmade border border-warm-orange/20 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-warm-orange/10">
                      <p className="text-sm font-medium text-warm-charcoal">{user?.name}</p>
                      <p className="text-xs text-warm-charcoal-light">{user?.email}</p>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-warm-charcoal hover:text-warm-orange hover:bg-warm-orange/5 transition-colors"
                    >
                      <User className="h-4 w-4 inline mr-2" />
                      My Profile
                    </Link>
                    
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-warm-charcoal hover:text-warm-orange hover:bg-warm-orange/5 transition-colors"
                    >
                      <Settings className="h-4 w-4 inline mr-2" />
                      Settings
                    </Link>
                    
                    <div className="border-t border-warm-orange/10 my-1"></div>
                    
                    <button
                      onClick={logout}
                      className="block w-full px-4 py-2 text-left text-sm text-warm-charcoal hover:text-warm-orange hover:bg-warm-orange/5 transition-colors"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <Button
                onClick={() => setShowLoginModal(true)}
                variant="ghost"
                size="sm"
                className="text-warm-charcoal hover:text-warm-orange hover:bg-warm-orange/10 transform hover:scale-105 transition-all duration-300"
              >
                <User className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}

            {/* Web3 Wallet Connection */}
            <Button
              onClick={handleWalletAction}
              variant={isConnected ? "outline" : "default"}
              size="sm"
              className={`hidden sm:flex items-center space-x-2 transform hover:scale-105 transition-all duration-300 ${
                isConnected 
                  ? 'border-warm-green text-warm-green hover:bg-warm-green hover:text-white' 
                  : 'bg-warm-orange hover:bg-warm-orange-dark text-white'
              }`}
            >
              <Wallet className="h-4 w-4" />
              <span className="text-xs">
                {isConnected 
                  ? `${account?.substring(0, 4)}...${account?.substring(account.length - 4)}`
                  : 'Connect'
                }
              </span>
            </Button>

            {/* CTA Button */}
            <Button
              asChild
              variant="handmade"
              size="sm"
              className="hidden sm:flex transform hover:scale-110 hover:rotate-2 shadow-handmade"
            >
              <Link to="/donate">
                <Heart className="h-4 w-4 mr-1 sm:mr-2" fill="currentColor" />
                <span className="hidden sm:inline">Donate</span>
              </Link>
            </Button>

            {/* Mobile menu button */}
            <Button
              onClick={() => setIsOpen(!isOpen)}
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 rounded-full hover:bg-warm-orange/10 transform hover:rotate-12 transition-all duration-300"
            >
              {isOpen ? (
                <X className="h-5 w-5 text-warm-charcoal" />
              ) : (
                <Menu className="h-5 w-5 text-warm-charcoal" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden py-4 border-t border-warm-orange/20 bg-warm-cream/90 backdrop-blur-sm"
          >
            <div className="space-y-1">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.href}
                    className={cn(
                      'block px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 transform hover:scale-105',
                      location.pathname === item.href
                        ? 'text-warm-orange bg-warm-orange/10'
                        : 'text-warm-charcoal hover:text-warm-orange hover:bg-warm-orange/5'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.key}
                  </Link>
                  
                  {/* Mobile Blockchain Submenu */}
                  {item.href === '/blockchain' && (
                    <div className="ml-4 mt-2 space-y-2">
                      {blockchainItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          to={subItem.href}
                          className="block px-4 py-1 text-sm text-warm-charcoal-light hover:text-warm-orange transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {subItem.key}
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
              
              {/* Mobile Wallet Connection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-4 border-t border-warm-orange/20"
              >
                {/* Mobile Language Switcher */}
                <div className="mb-4">
                  <LanguageSwitcher />
                </div>

                {/* Mobile Authentication */}
                {isAuthenticated ? (
                  <div className="mb-3">
                    <div className="flex items-center space-x-3 px-4 py-2 bg-warm-orange/5 rounded-lg mb-2">
                      <div className="h-10 w-10 rounded-full bg-warm-orange flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-warm-charcoal">{user?.name}</p>
                        <p className="text-xs text-warm-charcoal-light">{user?.email}</p>
                      </div>
                    </div>
                    <Button
                      onClick={logout}
                      variant="outline"
                      className="w-full border-warm-orange text-warm-orange hover:bg-warm-orange hover:text-white"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      setShowLoginModal(true)
                      setIsOpen(false)
                    }}
                    variant="outline"
                    className="w-full mb-3 border-warm-orange text-warm-orange hover:bg-warm-orange hover:text-white"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                )}

                <Button
                  onClick={handleWalletAction}
                  variant={isConnected ? "outline" : "default"}
                  className={`w-full mb-3 ${
                    isConnected 
                      ? 'border-warm-green text-warm-green hover:bg-warm-green hover:text-white' 
                      : 'bg-warm-orange hover:bg-warm-orange-dark text-white'
                  }`}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {isConnected 
                    ? `${account?.substring(0, 6)}...${account?.substring(account.length - 4)}`
                    : 'Connect Wallet'
                  }
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  asChild
                  variant="handmade"
                  size="handmade"
                  className="w-full"
                >
                  <Link to="/donate" onClick={() => setIsOpen(false)}>
                    <Heart className="h-4 w-4 mr-2" fill="currentColor" />
                    Donate with Love
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Login Modal - BETTER POSITIONING */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/50">
          <div className="relative w-full max-w-md mt-16">
            <LoginModal 
              isOpen={showLoginModal} 
              onClose={() => setShowLoginModal(false)} 
            />
          </div>
        </div>
      )}
    </nav>
  )
}