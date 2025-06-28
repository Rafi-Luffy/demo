import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HomePage } from '@/pages/HomePage'
import { CampaignsPage } from '@/pages/CampaignsPage'
import { DonatePage } from '@/pages/DonatePage'
import { DashboardPage } from '@/pages/DashboardPage'
import { TransparencyPage } from '@/pages/TransparencyPage'
import { ImpactPage } from '@/pages/ImpactPage'
import { AboutPage } from '@/pages/AboutPage'
import { ContactPage } from '@/pages/ContactPage'
import { VolunteerPage } from '@/pages/VolunteerPage'
import { AdminPage } from '@/pages/AdminPage'
import { BlockchainPage } from '@/pages/BlockchainPage'
import { AuditPage } from '@/pages/AuditPage'
import { SmartContractPage } from '@/pages/SmartContractPage'
import { IPFSDocumentsPage } from '@/pages/IPFSDocumentsPage'
import { MilestonePage } from '@/pages/MilestonePage'
import { useWeb3Store } from '@/store/web3Store'
import { useThemeStore } from '@/store/themeStore'

function App() {
  const { isDarkMode } = useThemeStore()
  const { initializeWeb3 } = useWeb3Store()

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  useEffect(() => {
    // Initialize Web3 connection on app start
    initializeWeb3()
  }, [initializeWeb3])

  return (
    <div className="min-h-screen bg-warm-cream dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transparency" element={<TransparencyPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/blockchain" element={<BlockchainPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/smart-contracts" element={<SmartContractPage />} />
          <Route path="/documents" element={<IPFSDocumentsPage />} />
          <Route path="/milestones" element={<MilestonePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}

export default App