import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, Eye, Download, Shield, CheckCircle, Clock, X, FileText, Image, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useIPFSStore } from '@/store/ipfsStore'
import { useToast } from '@/hooks/use-toast'

const documentTypes = [
  { value: 'receipt', label: 'Receipt', icon: FileText, color: 'text-warm-blue' },
  { value: 'report', label: 'Report', icon: File, color: 'text-warm-green' },
  { value: 'proof', label: 'Proof of Work', icon: Shield, color: 'text-warm-orange' },
  { value: 'milestone', label: 'Milestone Document', icon: CheckCircle, color: 'text-purple-600' },
  { value: 'audit', label: 'Audit Document', icon: Eye, color: 'text-red-600' }
]

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
    return Image
  } else if (['mp4', 'avi', 'mov', 'wmv'].includes(extension || '')) {
    return Video
  } else {
    return FileText
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function IPFSDocumentsPage() {
  const { 
    documents, 
    uploadProgress, 
    uploadDocument, 
    verifyDocument, 
    getDocumentsByType,
    getDocumentsByCampaign 
  } = useIPFSStore()
  
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCampaign, setSelectedCampaign] = useState('all')
  const [uploadType, setUploadType] = useState('receipt')
  const [uploadCampaign, setUploadCampaign] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<any>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    if (!uploadCampaign) {
      toast({
        title: 'Campaign Required',
        description: 'Please select a campaign for this document',
        variant: 'destructive'
      })
      return
    }

    setIsUploading(true)
    
    try {
      for (const file of Array.from(files)) {
        await uploadDocument(file, uploadType as any, uploadCampaign)
      }
      
      toast({
        title: 'Upload Successful! 🎉',
        description: `${files.length} document(s) uploaded to IPFS`,
        variant: 'success'
      })
      
      // Reset form
      setUploadCampaign('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload documents to IPFS',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleVerifyDocument = (hash: string) => {
    verifyDocument(hash, 'current-auditor') // Would be from auth context
    toast({
      title: 'Document Verified! ✅',
      description: 'Document has been marked as verified',
      variant: 'success'
    })
  }

  const filteredDocuments = documents.filter(doc => {
    const typeMatch = selectedType === 'all' || doc.type === selectedType
    const campaignMatch = selectedCampaign === 'all' || doc.campaignId === selectedCampaign
    return typeMatch && campaignMatch
  })

  const uniqueCampaigns = [...new Set(documents.map(doc => doc.campaignId))]

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
              <span className="inline-block transform -rotate-2 text-warm-orange">IPFS</span>
              <br />
              <span className="inline-block transform rotate-1">Document Storage</span>
            </h1>
            <p className="text-xl md:text-2xl text-warm-charcoal-light mb-8 leading-relaxed">
              All proof documents, receipts, and reports are stored immutably on IPFS. 
              Every document is cryptographically secured and permanently accessible.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="warm-card mb-8"
        >
          <h2 className="text-2xl font-handwritten font-bold text-warm-charcoal mb-6 transform -rotate-1">
            Upload Documents 📤
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warm-charcoal mb-2">
                  Document Type
                </label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none font-handwritten"
                >
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-charcoal mb-2">
                  Campaign ID
                </label>
                <input
                  type="text"
                  value={uploadCampaign}
                  onChange={(e) => setUploadCampaign(e.target.value)}
                  placeholder="Enter campaign ID"
                  className="w-full px-4 py-3 border-2 border-warm-green/30 rounded-xl focus:border-warm-green focus:outline-none font-handwritten"
                />
              </div>
            </div>

            <div className="border-2 border-dashed border-warm-blue/30 rounded-xl p-8 text-center hover:border-warm-blue/50 transition-colors">
              <Upload className="h-12 w-12 mx-auto mb-4 text-warm-blue" />
              <p className="text-warm-charcoal-light mb-4 font-handwritten">
                Drag and drop files here, or click to select
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.avi"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                variant="handmade"
                className="transform hover:scale-105"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Select Files
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-handwritten font-bold text-warm-charcoal">Upload Progress:</h3>
              {Object.entries(uploadProgress).map(([id, progress]) => (
                progress !== undefined && (
                  <div key={id} className="bg-warm-cream/50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-handwritten">Uploading to IPFS...</span>
                      <span className="text-sm font-bold">{progress}%</span>
                    </div>
                    <Progress value={progress} variant="handmade" />
                  </div>
                )
              ))}
            </div>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="warm-card mb-8"
        >
          <h2 className="text-2xl font-handwritten font-bold text-warm-charcoal mb-6 transform rotate-1">
            Filter Documents 🔍
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-warm-charcoal mb-2">
                Document Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none font-handwritten"
              >
                <option value="all">All Types</option>
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-charcoal mb-2">
                Campaign
              </label>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="w-full px-4 py-3 border-2 border-warm-green/30 rounded-xl focus:border-warm-green focus:outline-none font-handwritten"
              >
                <option value="all">All Campaigns</option>
                {uniqueCampaigns.map(campaignId => (
                  <option key={campaignId} value={campaignId}>
                    Campaign {campaignId}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Documents Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="warm-card"
        >
          <h2 className="text-2xl font-handwritten font-bold text-warm-charcoal mb-6 transform -rotate-1">
            Document Library 📚
          </h2>

          {filteredDocuments.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc, index) => {
                const typeInfo = documentTypes.find(t => t.value === doc.type)
                const FileIcon = getFileIcon(doc.name)
                
                return (
                  <motion.div
                    key={doc.hash}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-warm-orange/20 rounded-xl p-6 hover:shadow-handmade transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <FileIcon className={`h-8 w-8 ${typeInfo?.color || 'text-warm-charcoal'}`} />
                        <div>
                          <h3 className="font-handwritten font-bold text-warm-charcoal truncate">
                            {doc.name}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${typeInfo?.color || 'text-warm-charcoal'} bg-current/10`}>
                            {typeInfo?.label || doc.type}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {doc.verified ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-warm-charcoal-light">Campaign:</span>
                        <span className="font-mono text-warm-blue">{doc.campaignId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-warm-charcoal-light">Size:</span>
                        <span className="font-mono">{formatFileSize(doc.size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-warm-charcoal-light">Uploaded:</span>
                        <span className="font-mono text-xs">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="bg-warm-cream/50 p-3 rounded-lg mb-4">
                      <div className="text-xs text-warm-charcoal-light mb-1">IPFS Hash:</div>
                      <div className="font-mono text-xs text-warm-blue break-all">{doc.hash}</div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-warm-blue text-warm-blue hover:bg-warm-blue hover:text-white"
                        onClick={() => setPreviewDocument(doc)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {!doc.verified && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                          onClick={() => handleVerifyDocument(doc.hash)}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-warm-charcoal-light" />
              <h3 className="text-xl font-handwritten font-bold text-warm-charcoal mb-2">
                No Documents Found
              </h3>
              <p className="text-warm-charcoal-light font-handwritten">
                Upload some documents or adjust your filters to see results.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Document Preview Modal */}
      <AnimatePresence>
        {previewDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewDocument(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="warm-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-handwritten font-bold text-warm-charcoal">
                  Document Preview
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewDocument(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-warm-cream/50 p-3 rounded-lg">
                    <span className="text-warm-charcoal-light">Name:</span>
                    <p className="font-medium">{previewDocument.name}</p>
                  </div>
                  <div className="bg-warm-cream/50 p-3 rounded-lg">
                    <span className="text-warm-charcoal-light">Type:</span>
                    <p className="font-medium">{previewDocument.type}</p>
                  </div>
                  <div className="bg-warm-cream/50 p-3 rounded-lg">
                    <span className="text-warm-charcoal-light">Campaign:</span>
                    <p className="font-medium">{previewDocument.campaignId}</p>
                  </div>
                  <div className="bg-warm-cream/50 p-3 rounded-lg">
                    <span className="text-warm-charcoal-light">Status:</span>
                    <p className={`font-medium ${previewDocument.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {previewDocument.verified ? 'Verified' : 'Pending Verification'}
                    </p>
                  </div>
                </div>

                <div className="bg-warm-cream/50 p-4 rounded-lg">
                  <span className="text-warm-charcoal-light text-sm">IPFS Hash:</span>
                  <p className="font-mono text-sm text-warm-blue break-all mt-1">
                    {previewDocument.hash}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Button
                    variant="handmade"
                    className="flex-1"
                    asChild
                  >
                    <a
                      href={`https://ipfs.io/ipfs/${previewDocument.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download from IPFS
                    </a>
                  </Button>
                  
                  {!previewDocument.verified && (
                    <Button
                      variant="outline"
                      className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                      onClick={() => {
                        handleVerifyDocument(previewDocument.hash)
                        setPreviewDocument(null)
                      }}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Verify Document
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}