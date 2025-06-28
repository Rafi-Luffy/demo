import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Code, Play, FileText, Shield, Zap, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWeb3Store } from '@/store/web3Store'
import { useToast } from '@/hooks/use-toast'

interface ContractFunction {
  name: string
  description: string
  inputs: Array<{
    name: string
    type: string
    description: string
  }>
  outputs: Array<{
    name: string
    type: string
    description: string
  }>
  payable: boolean
  gasEstimate: string
}

interface ContractEvent {
  name: string
  description: string
  parameters: Array<{
    name: string
    type: string
    indexed: boolean
  }>
}

const contractFunctions: ContractFunction[] = [
  {
    name: 'donate',
    description: 'Make a donation to a specific campaign',
    inputs: [
      { name: 'campaignId', type: 'uint256', description: 'ID of the campaign' },
      { name: 'amount', type: 'uint256', description: 'Donation amount in wei' }
    ],
    outputs: [{ name: 'success', type: 'bool', description: 'Transaction success status' }],
    payable: true,
    gasEstimate: '45,000'
  },
  {
    name: 'createCampaign',
    description: 'Create a new fundraising campaign',
    inputs: [
      { name: 'title', type: 'string', description: 'Campaign title' },
      { name: 'target', type: 'uint256', description: 'Target amount in wei' },
      { name: 'deadline', type: 'uint256', description: 'Campaign deadline timestamp' }
    ],
    outputs: [{ name: 'campaignId', type: 'uint256', description: 'New campaign ID' }],
    payable: false,
    gasEstimate: '120,000'
  },
  {
    name: 'submitMilestone',
    description: 'Submit milestone proof for fund release',
    inputs: [
      { name: 'campaignId', type: 'uint256', description: 'Campaign ID' },
      { name: 'milestoneId', type: 'uint256', description: 'Milestone ID' },
      { name: 'proofHash', type: 'string', description: 'IPFS hash of proof documents' }
    ],
    outputs: [{ name: 'success', type: 'bool', description: 'Submission success' }],
    payable: false,
    gasEstimate: '75,000'
  },
  {
    name: 'verifyMilestone',
    description: 'Verify milestone completion (auditor only)',
    inputs: [
      { name: 'campaignId', type: 'uint256', description: 'Campaign ID' },
      { name: 'milestoneId', type: 'uint256', description: 'Milestone ID' },
      { name: 'approved', type: 'bool', description: 'Approval status' }
    ],
    outputs: [{ name: 'success', type: 'bool', description: 'Verification success' }],
    payable: false,
    gasEstimate: '55,000'
  },
  {
    name: 'withdrawFunds',
    description: 'Withdraw approved milestone funds',
    inputs: [
      { name: 'campaignId', type: 'uint256', description: 'Campaign ID' },
      { name: 'milestoneId', type: 'uint256', description: 'Milestone ID' }
    ],
    outputs: [{ name: 'amount', type: 'uint256', description: 'Withdrawn amount' }],
    payable: false,
    gasEstimate: '65,000'
  }
]

const contractEvents: ContractEvent[] = [
  {
    name: 'DonationReceived',
    description: 'Emitted when a donation is made',
    parameters: [
      { name: 'donor', type: 'address', indexed: true },
      { name: 'campaignId', type: 'uint256', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false }
    ]
  },
  {
    name: 'CampaignCreated',
    description: 'Emitted when a new campaign is created',
    parameters: [
      { name: 'campaignId', type: 'uint256', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'target', type: 'uint256', indexed: false },
      { name: 'deadline', type: 'uint256', indexed: false }
    ]
  },
  {
    name: 'MilestoneSubmitted',
    description: 'Emitted when milestone proof is submitted',
    parameters: [
      { name: 'campaignId', type: 'uint256', indexed: true },
      { name: 'milestoneId', type: 'uint256', indexed: true },
      { name: 'proofHash', type: 'string', indexed: false }
    ]
  },
  {
    name: 'MilestoneVerified',
    description: 'Emitted when milestone is verified',
    parameters: [
      { name: 'campaignId', type: 'uint256', indexed: true },
      { name: 'milestoneId', type: 'uint256', indexed: true },
      { name: 'approved', type: 'bool', indexed: false },
      { name: 'verifier', type: 'address', indexed: true }
    ]
  }
]

export function SmartContractPage() {
  const { isConnected, account } = useWeb3Store()
  const { toast } = useToast()
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null)
  const [functionInputs, setFunctionInputs] = useState<Record<string, Record<string, string>>>({})
  const [isExecuting, setIsExecuting] = useState(false)

  const handleInputChange = (functionName: string, inputName: string, value: string) => {
    setFunctionInputs(prev => ({
      ...prev,
      [functionName]: {
        ...prev[functionName],
        [inputName]: value
      }
    }))
  }

  const executeFunction = async (func: ContractFunction) => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to interact with smart contracts',
        variant: 'destructive'
      })
      return
    }

    setIsExecuting(true)
    try {
      // Mock contract execution
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: 'Function Executed! 🎉',
        description: `Successfully executed ${func.name} function`,
        variant: 'success'
      })
    } catch (error) {
      toast({
        title: 'Execution Failed',
        description: 'Failed to execute smart contract function',
        variant: 'destructive'
      })
    } finally {
      setIsExecuting(false)
    }
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
              <span className="inline-block transform -rotate-2 text-warm-orange">Smart</span>
              <br />
              <span className="inline-block transform rotate-1">Contract Interface</span>
            </h1>
            <p className="text-xl md:text-2xl text-warm-charcoal-light mb-8 leading-relaxed">
              Interact directly with our smart contracts. Every function is transparent, 
              auditable, and designed for maximum accountability in charitable giving.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Contract Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="warm-card mb-8"
        >
          <h2 className="text-2xl font-handwritten font-bold text-warm-charcoal mb-6 transform -rotate-1">
            Contract Overview 📋
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-warm-blue/10 p-6 rounded-xl text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-warm-blue" />
              <h3 className="font-handwritten font-bold text-warm-blue mb-2">Security Audited</h3>
              <p className="text-sm text-warm-charcoal-light">
                All contracts have been audited by leading security firms
              </p>
            </div>
            
            <div className="bg-warm-green/10 p-6 rounded-xl text-center">
              <Zap className="h-12 w-12 mx-auto mb-4 text-warm-green" />
              <h3 className="font-handwritten font-bold text-warm-green mb-2">Gas Optimized</h3>
              <p className="text-sm text-warm-charcoal-light">
                Optimized for minimal gas costs and maximum efficiency
              </p>
            </div>
            
            <div className="bg-warm-orange/10 p-6 rounded-xl text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-warm-orange" />
              <h3 className="font-handwritten font-bold text-warm-orange mb-2">Open Source</h3>
              <p className="text-sm text-warm-charcoal-light">
                Fully open source and verifiable on blockchain explorers
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contract Functions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="warm-card mb-8"
        >
          <h2 className="text-2xl font-handwritten font-bold text-warm-charcoal mb-6 transform rotate-1">
            Contract Functions ⚡
          </h2>

          <div className="space-y-6">
            {contractFunctions.map((func, index) => (
              <motion.div
                key={func.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-warm-orange/20 rounded-xl p-6 hover:shadow-handmade transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <Code className="h-5 w-5 text-warm-blue" />
                      <h3 className="font-mono font-bold text-warm-charcoal">{func.name}</h3>
                      {func.payable && (
                        <span className="px-2 py-1 bg-warm-orange/10 text-warm-orange rounded-full text-xs font-bold">
                          Payable
                        </span>
                      )}
                    </div>
                    <p className="text-warm-charcoal-light mb-4">{func.description}</p>
                    <div className="text-sm text-warm-charcoal-light">
                      <span className="font-medium">Gas Estimate:</span> {func.gasEstimate}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => setSelectedFunction(selectedFunction === func.name ? null : func.name)}
                    variant="outline"
                    size="sm"
                    className="border-warm-blue text-warm-blue hover:bg-warm-blue hover:text-white"
                  >
                    {selectedFunction === func.name ? 'Hide' : 'Interact'}
                  </Button>
                </div>

                {/* Function Inputs */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-handwritten font-bold text-warm-charcoal mb-2">Inputs:</h4>
                    <div className="space-y-2">
                      {func.inputs.map((input) => (
                        <div key={input.name} className="bg-warm-cream/50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-mono text-sm font-bold text-warm-blue">{input.name}</span>
                            <span className="text-xs text-warm-charcoal-light">({input.type})</span>
                          </div>
                          <p className="text-xs text-warm-charcoal-light">{input.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-handwritten font-bold text-warm-charcoal mb-2">Outputs:</h4>
                    <div className="space-y-2">
                      {func.outputs.map((output) => (
                        <div key={output.name} className="bg-warm-green/10 p-3 rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-mono text-sm font-bold text-warm-green">{output.name}</span>
                            <span className="text-xs text-warm-charcoal-light">({output.type})</span>
                          </div>
                          <p className="text-xs text-warm-charcoal-light">{output.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Interactive Form */}
                {selectedFunction === func.name && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-warm-orange/20 pt-4"
                  >
                    <h4 className="font-handwritten font-bold text-warm-charcoal mb-4">
                      Execute Function 🚀
                    </h4>
                    
                    <div className="space-y-4 mb-6">
                      {func.inputs.map((input) => (
                        <div key={input.name}>
                          <label className="block text-sm font-medium text-warm-charcoal mb-1">
                            {input.name} ({input.type})
                          </label>
                          <input
                            type="text"
                            placeholder={`Enter ${input.name}`}
                            value={functionInputs[func.name]?.[input.name] || ''}
                            onChange={(e) => handleInputChange(func.name, input.name, e.target.value)}
                            className="w-full px-4 py-2 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none font-mono text-sm"
                          />
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => executeFunction(func)}
                      disabled={!isConnected || isExecuting}
                      variant="handmade"
                      className="w-full"
                    >
                      {isExecuting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Executing...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Execute Function
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contract Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="warm-card"
        >
          <h2 className="text-2xl font-handwritten font-bold text-warm-charcoal mb-6 transform -rotate-1">
            Contract Events 📡
          </h2>

          <div className="space-y-4">
            {contractEvents.map((event, index) => (
              <motion.div
                key={event.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-warm-green/20 rounded-xl p-6"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-warm-green" />
                  <h3 className="font-mono font-bold text-warm-charcoal">{event.name}</h3>
                </div>
                
                <p className="text-warm-charcoal-light mb-4">{event.description}</p>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {event.parameters.map((param) => (
                    <div key={param.name} className="bg-warm-cream/50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-mono text-sm font-bold text-warm-green">{param.name}</span>
                        {param.indexed && (
                          <span className="text-xs bg-warm-blue/10 text-warm-blue px-1 rounded">indexed</span>
                        )}
                      </div>
                      <span className="text-xs text-warm-charcoal-light">{param.type}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}