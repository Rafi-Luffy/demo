import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ChevronDown } from 'lucide-react'
import { useLanguageStore } from '@/store/languageStore'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const { currentLanguage, switchLanguage, getSupportedLanguages } = useLanguageStore()
  const { t } = useTranslation()
  
  const languages = getSupportedLanguages()
  const currentLang = languages.find(lang => lang.code === currentLanguage)

  const handleLanguageChange = (languageCode: string) => {
    switchLanguage(languageCode as any)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center space-x-2 h-9 px-3 rounded-full hover:bg-warm-green/10 transition-all duration-300 text-warm-green"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">{currentLang?.nativeName || 'EN'}</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-warm-orange/20 py-2 z-50 max-h-80 overflow-y-auto"
            >
              <div className="px-3 py-2 text-xs font-medium text-warm-charcoal-light border-b border-warm-orange/10">
                {t('languages.selectLanguage')}
              </div>
              
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-all duration-200 hover:bg-warm-orange/5 ${
                    currentLanguage === language.code 
                      ? 'text-warm-orange bg-warm-orange/10 font-medium' 
                      : 'text-warm-charcoal hover:text-warm-orange'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-base">{language.code === 'en' ? '🇺🇸' : '🇮🇳'}</span>
                    <div>
                      <div className="font-medium">{language.nativeName}</div>
                      <div className="text-xs text-warm-charcoal-light">{language.name}</div>
                    </div>
                  </div>
                  {currentLanguage === language.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-warm-orange rounded-full"
                    />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
