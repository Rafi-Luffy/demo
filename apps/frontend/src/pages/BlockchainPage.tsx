import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link2, Shield, Eye, Copy, ExternalLink, Wallet, Activity, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWeb3Store } from '@/store/web3Store'
import { useToast } from '@/hooks/use-toast'

const networkInfo: Record<number, { name: string; explorer: string; color: string }> = {
  137: { name: 'Polygon Mainnet', explorer: 'https://polygonscan.com', color: 'text-purple-600' },
  80001: { name: 'Polygon Mumbai', explorer: 'https://mumbai.polygonscan.com', color: 'text-blue-600' },
  1: { name: 'Ethereum Mainnet', explorer: 'https://etherscan.io', color: 'text-blue-500' },
  5: { name: 'Goerli Testnet', explorer: 'https://goerli.etherscan.io', color: 'text-green-600' }
}

const contractAddresses = {
  donation: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b9',
  milestone: '0x8ba1f109551bD432803012645Hac136c0532925',
  audit: '0x9cb2g210662cE543914756Ibd247d0643036'
}

interface RecentBlock {
  number: number
  hash: string
  timestamp: number
  transactions: number
  gasUsed: number
}

export function BlockchainPage() {
  const { 
    isConnected, 
    account, 
    chainId, 
    balance, 
    connectWallet, 
    disconnectWallet,
    pendingTransactions,
    completedTransactions 
  } = useWeb3Store()
  
  const { toast } = useToast()
  const [recentBlocks, setRecentBlocks] = useState<RecentBlock[]>([])

  const currentNetwork = chainId ? networkInfo[chainId] : null

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: 'Address copied to clipboard',
      variant: 'success'
    })
  }

  const handleConnect = async () => {
    try {
      await connectWallet()
      toast({
        title: 'Wallet Connected! 🎉',
        description: 'Successfully connected to your wallet',
        variant: 'success'
      })
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Please make sure MetaMask is installed and unlocked',
        variant: 'destructive'
      })
    }
  }

  // Mock recent blocks data
  useEffect(() => {
    const mockBlocks: RecentBlock[] = Array.from({ length: 5 }, (_, i) => ({
      number: 45678901 - i,
      hash: `0x${Math.random().toString(16).substring(2, 18)}...`,
      timestamp: Date.now() - (i * 15000),
      transactions: Math.floor(Math.random() * 200) + 50,
      gasUsed: Math.floor(Math.random() * 15000000) + 5000000
    }))
    setRecentBlocks(mockBlocks)
  }, [])

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
              <span className="inline-block transform -rotate-2 text-warm-orange">Blockchain</span>
              <br />
              <span className="inline-block transform rotate-1">Transparency Hub</span>
            </h1>
            <p className="text-xl md:text-2xl text-warm-charcoal-light mb-8 leading-relaxed">
              Every donation, every transaction, every impact - all recorded immutably on the blockchain. 
              Connect your wallet to explore the transparent world of decentralized charity.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Wallet Connection Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="warm-card mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-handwritten font-bold text-warm-charcoal transform -rotate-1">
              Wallet Connection 🔗
            </h2>
            {isConnected && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-handwritten text-green-600">Connected</span>
              </div>
            )}
          </div>

          {!isConnected ? (
            <div className="text-center py-8">
              <Wallet className="h-16 w-16 mx-auto mb-4 text-warm-orange" />
              <h3 className="text-xl font-handwritten font-bold text-warm-charcoal mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-warm-charcoal-light mb-6">
                Connect your MetaMask wallet to interact with our smart contracts and view your transaction history.
              </p>
              <Button
                onClick={handleConnect}
                variant="handmade"
                size="handmade"
                className="transform hover:scale-105"
              >
                <Wallet className="mr-2 h-5 w-5" />
                Connect MetaMask
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-warm-cream/80 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-warm-charcoal-light">Account</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(account || '')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="font-mono text-sm text-warm-blue break-all">{account}</p>
                </div>
                
                <div className="bg-warm-cream/80 p-4 rounded-xl">
                  <span className="text-sm text-warm-charcoal-light">Balance</span>
                  <p className="text-2xl font-bold text-warm-green">{balance} MATIC</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-warm-cream/80 p-4 rounded-xl">
                  <span className="text-sm text-warm-charcoal-light">Network</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${currentNetwork?.color === 'text-purple-600' ? 'bg-purple-600' : 'bg-blue-600'}`}></div>
                    <p className="font-medium text-warm-charcoal">
                      {currentNetwork?.name || 'Unknown Network'}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={disconnectWallet}
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                >
                  Disconnect Wallet
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Smart Contract Addresses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="warm-card mb-8"
        >
          <h2 className="text-2xl font-handwritten font-bold text-warm-charcoal mb-6 transform rotate-1">
            Smart Contract Addresses 📋
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(contractAddresses).map(([name, address]) => (
              <div key={name} className="bg-warm-cream/80 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-handwritten font-bold text-warm-charcoal capitalize">
                    {name} Contract
                  </h3>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(address)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {currentNetwork && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a
                          href={`${currentNetwork.explorer}/address/${address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                <p className="font-mono text-xs text-warm-blue break-all">{address}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Transaction History */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="warm-card mb-8"
          >
            <h2 className="text-2xl font-handwritten font-bold text-warm-charcoal mb-6 transform -rotate-1">
              Your Transaction History 📊
            </h2>

            {pendingTransactions.length > 0 && (
              <div className="mb-6">
                <h3 className="font-handwritten font-bold text-warm-orange mb-3">Pending Transactions</h3>
                <div className="space-y-2">
                  {pendingTransactions.map((txHash) => (
                    <div key={txHash} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Activity className="h-5 w-5 text-yellow-600 animate-spin" />
                        <span className="font-mono text-sm">{txHash.substring(0, 20)}...</span>
                      </div>
                      <span className="text-sm text-yellow-600 font-medium">Pending</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completedTransactions.length > 0 ? (
              <div className="space-y-3">
                {completedTransactions.slice(0, 5).map((tx) => (
                  <div key={tx.hash} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${tx.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="font-mono text-sm text-warm-blue">{tx.hash.substring(0, 20)}...</p>
                        <p className="text-xs text-warm-charcoal-light">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-warm-green">{tx.value} MATIC</p>
                      <p className="text-xs text-warm-charcoal-light capitalize">{tx.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-warm-charcoal-light" />
                <p className="text-warm-charcoal-light font-handwritten">
                  No transactions yet. Start donating to see your blockchain activity!
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Recent Blockchain Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="warm-card"
        >
          <h2 className="text-2xl font-handwritten font-bold text-warm-charcoal mb-6 transform rotate-1">
            Recent Blockchain Activity 🔗
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-warm-orange/20">
                  <th className="text-left py-3 px-4 font-handwritten text-warm-charcoal">Block</th>
                  <th className="text-left py-3 px-4 font-handwritten text-warm-charcoal">Hash</th>
                  <th className="text-left py-3 px-4 font-handwritten text-warm-charcoal">Transactions</th>
                  <th className="text-left py-3 px-4 font-handwritten text-warm-charcoal">Gas Used</th>
                  <th className="text-left py-3 px-4 font-handwritten text-warm-charcoal">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentBlocks.map((block) => (
                  <tr key={block.number} className="border-b border-warm-cream hover:bg-warm-cream/50">
                    <td className="py-3 px-4 font-mono text-warm-blue">{block.number}</td>
                    <td className="py-3 px-4 font-mono text-sm">{block.hash}</td>
                    <td className="py-3 px-4 text-warm-green font-bold">{block.transactions}</td>
                    <td className="py-3 px-4 text-warm-charcoal-light">
                      {(block.gasUsed / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-3 px-4 text-warm-charcoal-light text-sm">
                      {Math.floor((Date.now() - block.timestamp) / 1000)}s ago
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}