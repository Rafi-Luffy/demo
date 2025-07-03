import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import '@/i18n'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HomePage } from '@/pages/HomePage'
import { CampaignsPage } from '@/pages/CampaignsPage'
import { StoriesPage } from '@/pages/StoriesPage'
import DonatePage from '@/pages/DonatePage'
import { DashboardPage } from '@/pages/DashboardPage'
import { TransparencyPage } from '@/pages/TransparencyPage'
import { ImpactPage } from '@/pages/ImpactPage'
import { AboutPage } from '@/pages/AboutPage'
import { ContactPage } from '@/pages/ContactPage'
import { VolunteerPage } from '@/pages/VolunteerPage'
import { AdminPage } from '@/pages/AdminPage'
import { BlockchainPage } from '@/pages/BlockchainPage'
import { AuditPage } from '@/pages/AuditPage'
import { IPFSDocumentsPage } from '@/pages/IPFSDocumentsPage'
import { MilestonePage } from '@/pages/MilestonePage'
import { SmartContractPage } from '@/pages/SmartContractPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  return (
    <div className="min-h-screen bg-warm-cream">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transparency" element={<TransparencyPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/blockchain" element={<BlockchainPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/documents" element={<IPFSDocumentsPage />} />
          <Route path="/milestones" element={<MilestonePage />} />
          <Route path="/smart-contracts" element={<SmartContractPage />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}

export default App