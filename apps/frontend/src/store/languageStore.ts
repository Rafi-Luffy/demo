import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '@/i18n'

type SupportedLanguage = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'gu' | 'kn'

interface LanguageState {
  currentLanguage: SupportedLanguage
  switchLanguage: (language: SupportedLanguage) => void
  isHindi: boolean
  isRegionalLanguage: boolean
  getSupportedLanguages: () => Array<{code: SupportedLanguage, name: string, nativeName: string}>
}

const supportedLanguages = [
  { code: 'en' as SupportedLanguage, name: 'English', nativeName: 'English' },
  { code: 'hi' as SupportedLanguage, name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ta' as SupportedLanguage, name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te' as SupportedLanguage, name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn' as SupportedLanguage, name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr' as SupportedLanguage, name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu' as SupportedLanguage, name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn' as SupportedLanguage, name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
]

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'en',
      isHindi: false,
      isRegionalLanguage: false,
      getSupportedLanguages: () => supportedLanguages,
      switchLanguage: (language: SupportedLanguage) => {
        i18n.changeLanguage(language)
        set({ 
          currentLanguage: language,
          isHindi: language === 'hi',
          isRegionalLanguage: language !== 'en'
        })
      },
    }),
    {
      name: 'language-storage',
      onRehydrateStorage: () => (state) => {
        if (state && state.currentLanguage) {
          i18n.changeLanguage(state.currentLanguage)
        } else {
          // Try to detect browser language or default to English
          const browserLang = navigator.language.split('-')[0] as SupportedLanguage
          const supportedCodes = supportedLanguages.map(l => l.code)
          const defaultLang = supportedCodes.includes(browserLang) ? browserLang : 'en'
          i18n.changeLanguage(defaultLang)
        }
      },
    }
  )
)
