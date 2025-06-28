import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, CheckCircle, AlertTriangle, Clock, Search, Eye, Download, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface AuditRecord {
  id: string
  campaignId: string
  campaignTitle: string
  auditorAddress: string
  auditorName: string
  auditDate: Date
  status: 'passed' | 'failed' | 'pending'
  score: number
  findings: AuditFinding[]
  reportHash: string
  transactionHash: string
}

interface AuditFinding {
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  description: string
  recommendation: string
  resolved: boolean
}

const mockAuditRecords: AuditRecord[] = [
  {
    id: 'audit1',
    campaignId: '1',
    campaignTitle: 'Little Priya Needs School Books',
    auditorAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b9',
    auditorName: 'CertifiedAuditor.eth',
    auditDate: new Date('2024-01-20'),
    status: 'passed',
    score: 95,
    findings: [
      {
        severity: 'low',
        category: 'Documentation',
        description: 'Minor formatting issues in expense reports',
        recommendation: 'Standardize report formatting',
        resolved: true
      }
    ],
    reportHash: 'QmXoW8s...Y4Z',
    transactionHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
  },
  {
    id: 'audit2',
    campaignId: '2',
    campaignTitle: 'Emergency Food for Flood Victims',
    auditorAddress: '0x8ba1f109551bD432803012645Hac136c0532925',
    auditorName: 'BlockchainAudits.org',
    auditDate: new Date('2024-01-25'),
    status: 'pending',
    score: 0,
    findings: [],
    reportHash: '',
    transactionHash: ''
  },
  {
    id: 'audit3',
    campaignId: '3',
    campaignTitle: 'Clean Water for Rampur Village',
    auditorAddress: '0x9cb2g210662cE543914756Ibd247d0643036',
    auditorName: 'TrustAudit.eth',
    auditDate: new Date('2024-01-18'),
    status: 'failed',
    score: 65,
    findings: [
      {
        severity: 'high',
        category: 'Fund Utilization',
        description: 'Discrepancy in reported vs actual expenses',
        recommendation: 'Provide additional documentation for ₹15,000 expense',
        resolved: false
      },
      {
        severity: 'medium',
        category: 'Transparency',
        description: 'Delayed milestone reporting',
        recommendation: 'Implement automated milestone tracking',
        resolved: false
      }
    ],
    reportHash: 'QmYp9X...A5B',
    transactionHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f2b3c4d'
  }
]

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'text-red-700 bg-red-100'
    case 'high': return 'text-red-600 bg-red-50'
    case 'medium': return 'text-yellow-600 bg-yellow-50'
    case 'low': return 'text-green-600 bg-green-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'passed': return 'text-green-600 bg-green-100'
    case 'failed': return 'text-red-600 bg-red-100'
    case 'pending': return 'text-yellow-600 bg-yellow-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'passed': return CheckCircle
    case 'failed': return AlertTriangle
    case 'pending': return Clock
    default: return Shield
  }
}

export function AuditPage() {
  const { toast } = useToast()
  const [auditRecords] = useState(mockAuditRecords)
  const [selectedAudit, setSelectedAudit] = useState<AuditRecord | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredAudits = auditRecords.filter(audit => {
    const matchesSearch = audit.campaignTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.auditorName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || audit.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const downloadReport = (reportHash: string) => {
    window.open(`https://ipfs.io/ipfs/${reportHash}`, '_blank')
    toast({
      title: 'Downloading Report',
      description: 'Audit report is being downloaded from IPFS',
      variant: 'success'
    })
  }

  return (
    <div className="min-h-screen bg-warm-cream">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-warm-orange/10 via-warm-cream to-warm-green/10 relative overflow-hidden">
        <div className="absolute inset-0 mandala-bg"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-handwritten font-bold mb-6 text-warm-charcoal">
              <span className="inline-block transform -rotate-2 text-warm-orange">Audit</span>
              <br />
              <span className="inline-block transform rotate-1">Dashboard</span>
            </h1>
            <p className="text-xl md:text-2xl text-warm-charcoal-light mb-8 leading-relaxed">
              Independent audits ensure every campaign meets our transparency standards. 
              All audit reports are stored immutably and publicly accessible.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Audit Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { 
              label: 'Total Audits', 
              value: auditRecords.length, 
              color: 'text-warm-blue',
              icon: Shield
            },
            { 
              label: 'Passed', 
              value: auditRecords.filter(a => a.status === 'passed').length, 
              color: 'text-green-600',
              icon: CheckCircle
            },
            { 
              label: 'Failed', 
              value: auditRecords.filter(a => a.status === 'failed').length, 
              color: 'text-red-600',
              icon: AlertTriangle
            },
            { 
              label: 'Pending', 
              value: auditRecords.filter(a => a.status === 'pending').length, 
              color: 'text-yellow-600',
              icon: Clock
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="warm-card text-center group hover:shadow-handmade transition-all duration-300 transform hover:-translate-y-2"
            >
              <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
              <div className="text-warm-charcoal-light font-handwritten">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="warm-card mb-8"
        >
          <h2 className="text-2xl font-handwritten font-bold text-warm-charcoal mb-6 transform -rotate-1">
            Filter Audits 🔍
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-warm-orange" />
              <input
                type="text"
                placeholder="Search by campaign or auditor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none font-handwritten"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-warm-green/30 rounded-xl focus:border-warm-green focus:outline-none font-handwritten"
            >
              <option value="all">All Statuses</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        
        </motion.div>

        {/* Audit Records */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="warm-card"
        >
          <h2 className="text-2xl font-handwritten font-bold text-warm-charcoal mb-6 transform rotate-1">
            Audit Records 📋
          </h2>

          {filteredAudits.length > 0 ? (
            <div className="space-y-6">
              {filteredAudits.map((audit, index) => {
                const StatusIcon = getStatusIcon(audit.status)
                
                return (
                  <motion.div
                    key={audit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-warm-orange/20 rounded-xl p-6 hover:shadow-handmade transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`h-6 w-6 ${getStatusColor(audit.status).split(' ')[0]}`} />
                        <div>
                          <h3 className="font-handwritten font-bold text-warm-charcoal text-lg">
                            {audit.campaignTitle}
                          </h3>
                          <p className="text-warm-charcoal-light">
                            Audited by {audit.auditorName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(audit.status)}`}>
                          {audit.status.toUpperCase()}
                        </span>
                        {audit.status !== 'pending' && (
                          <div className="mt-2">
                            <span className="text-2xl font-bold text-warm-green">{audit.score}</span>
                            <span className="text-sm text-warm-charcoal-light">/100</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-warm-cream/50 p-3 rounded-lg">
                        <div className="text-sm text-warm-charcoal-light mb-1">Campaign ID</div>
                        <div className="font-mono text-warm-blue">{audit.campaignId}</div>
                      </div>
                      
                      <div className="bg-warm-cream/50 p-3 rounded-lg">
                        <div className="text-sm text-warm-charcoal-light mb-1">Audit Date</div>
                        <div className="font-medium">{audit.auditDate.toLocaleDateString()}</div>
                      </div>
                      
                      <div className="bg-warm-cream/50 p-3 rounded-lg">
                        <div className="text-sm text-warm-charcoal-light mb-1">Findings</div>
                        <div className="font-bold text-warm-orange">{audit.findings.length}</div>
                      </div>
                    </div>

                    {audit.findings.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-medium text-warm-charcoal mb-2">Key Findings:</div>
                        <div className="space-y-2">
                          {audit.findings.slice(0, 2).map((finding, idx) => (
                            <div key={idx} className="flex items-start space-x-3 p-3 bg-warm-cream/50 rounded-lg">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${getSeverityColor(finding.severity)}`}>
                                {finding.severity.toUpperCase()}
                              </span>
                              <div className="flex-1">
                                <div className="font-medium text-warm-charcoal">{finding.category}</div>
                                <div className="text-sm text-warm-charcoal-light">{finding.description}</div>
                              </div>
                              {finding.resolved && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                          ))}
                          {audit.findings.length > 2 && (
                            <div className="text-sm text-warm-charcoal-light text-center">
                              +{audit.findings.length - 2} more findings
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAudit(audit)}
                        className="border-warm-blue text-warm-blue hover:bg-warm-blue hover:text-white"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      
                      {audit.reportHash && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReport(audit.reportHash)}
                          className="border-warm-green text-warm-green hover:bg-warm-green hover:text-white"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Report
                        </Button>
                      )}
                      
                      {audit.transactionHash && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a
                            href={`https://polygonscan.com/tx/${audit.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View on Chain
                          </a>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 mx-auto mb-4 text-warm-charcoal-light" />
              <h3 className="text-xl font-handwritten font-bold text-warm-charcoal mb-2">
                No Audit Records Found
              </h3>
              <p className="text-warm-charcoal-light font-handwritten">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Detailed Audit Modal */}
      {selectedAudit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAudit(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="warm-card max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-handwritten font-bold text-warm-charcoal">
                Detailed Audit Report
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedAudit(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Audit Summary */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-warm-cream/50 p-4 rounded-xl">
                    <h4 className="font-handwritten font-bold text-warm-charcoal mb-2">Campaign</h4>
                    <p className="text-warm-charcoal-light">{selectedAudit.campaignTitle}</p>
                  </div>
                  
                  <div className="bg-warm-cream/50 p-4 rounded-xl">
                    <h4 className="font-handwritten font-bold text-warm-charcoal mb-2">Auditor</h4>
                    <p className="text-warm-charcoal-light">{selectedAudit.auditorName}</p>
                    <p className="font-mono text-xs text-warm-blue">{selectedAudit.auditorAddress}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-warm-cream/50 p-4 rounded-xl">
                    <h4 className="font-handwritten font-bold text-warm-charcoal mb-2">Status</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(selectedAudit.status)}`}>
                      {selectedAudit.status.toUpperCase()}
                    </span>
                  </div>
                  
                  {selectedAudit.status !== 'pending' && (
                    <div className="bg-warm-cream/50 p-4 rounded-xl">
                      <h4 className="font-handwritten font-bold text-warm-charcoal mb-2">Score</h4>
                      <div className="text-3xl font-bold text-warm-green">
                        {selectedAudit.score}/100
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Findings */}
              {selectedAudit.findings.length > 0 && (
                <div>
                  <h4 className="font-handwritten font-bold text-warm-charcoal mb-4">All Findings</h4>
                  <div className="space-y-4">
                    {selectedAudit.findings.map((finding, idx) => (
                      <div key={idx} className="border border-warm-orange/20 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(finding.severity)}`}>
                              {finding.severity.toUpperCase()}
                            </span>
                            <h5 className="font-bold text-warm-charcoal">{finding.category}</h5>
                          </div>
                          {finding.resolved && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-warm-charcoal-light">Issue:</span>
                            <p className="text-warm-charcoal">{finding.description}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-warm-charcoal-light">Recommendation:</span>
                            <p className="text-warm-charcoal">{finding.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Blockchain Information */}
              {selectedAudit.transactionHash && (
                <div className="bg-warm-blue/10 p-4 rounded-xl">
                  <h4 className="font-handwritten font-bold text-warm-blue mb-2">Blockchain Record</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-warm-charcoal-light">Transaction Hash:</span>
                      <p className="font-mono text-warm-blue break-all">{selectedAudit.transactionHash}</p>
                    </div>
                    {selectedAudit.reportHash && (
                      <div>
                        <span className="text-warm-charcoal-light">IPFS Report Hash:</span>
                        <p className="font-mono text-warm-blue break-all">{selectedAudit.reportHash}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}