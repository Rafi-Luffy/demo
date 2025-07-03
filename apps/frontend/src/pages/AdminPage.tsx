import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Users, DollarSign, TrendingUp, Activity, Plus, Edit, Trash2, Eye, Download, Shield, Star, Heart, Calendar, Search, Filter, CheckCircle, Clock, AlertTriangle, UserCheck, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

// Types for real data
interface AdminStats {
  totalDonations: number
  totalDonors: number
  activeCampaigns: number
  totalImpact: number
  pendingCampaigns: number
  verifiedCampaigns: number
}

interface RecentDonation {
  _id: string
  donor: { name: string; _id: string }
  campaign: { title: string; _id: string }
  amount: number
  currency: string
  status: string
  createdAt: string
  transactionHash: string
}

interface Campaign {
  _id: string
  title: string
  description: string
  category: string
  targetAmount: number
  currentAmount: number
  status: string
  creator: { name: string; _id: string }
  createdAt: string
  isVerified: boolean
  isUrgent: boolean
}

interface User {
  _id: string
  name: string
  email: string
  role: string
  isVerified: boolean
  createdAt: string
  profile?: {
    avatar?: string
    phone?: string
  }
}

export function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalDonations: 0,
    totalDonors: 0,
    activeCampaigns: 0,
    totalImpact: 0,
    pendingCampaigns: 0,
    verifiedCampaigns: 0
  })
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const { user } = useAuthStore()
  const navigate = useNavigate()

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/')
      return
    }
  }, [user, navigate])

  // Fetch admin data
  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      const [statsRes, donationsRes, campaignsRes, usersRes] = await Promise.all([
        apiClient.get('/admin/dashboard'),
        apiClient.get('/donations?limit=10'),
        apiClient.get('/campaigns?limit=20'),
        apiClient.get('/admin/users?limit=20'),
      ])

      // Set admin stats (with fallback for mock data)
      setAdminStats({
        totalDonations: statsRes.data.data?.totalDonations || 2500000,
        totalDonors: statsRes.data.data?.totalDonors || 12500,
        activeCampaigns: campaignsRes.data.data?.length || 45,
        totalImpact: statsRes.data.data?.totalImpact || 75000,
        pendingCampaigns: campaignsRes.data.data?.filter((c: Campaign) => c.status === 'pending').length || 8,
        verifiedCampaigns: campaignsRes.data.data?.filter((c: Campaign) => c.isVerified).length || 37,
      })

      setRecentDonations(donationsRes.data.data || [])
      setCampaigns(campaignsRes.data.data || [])
      setUsers(usersRes.data.data || [])
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
      // Use mock data as fallback
      setAdminStats({
        totalDonations: 2500000,
        totalDonors: 12500,
        activeCampaigns: 45,
        totalImpact: 75000,
        pendingCampaigns: 8,
        verifiedCampaigns: 37
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCampaignAction = async (campaignId: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      await apiClient.patch(`/admin/campaigns/${campaignId}`, { action })
      fetchAdminData() // Refresh data
    } catch (error) {
      console.error(`Failed to ${action} campaign:`, error)
    }
  }

  const handleUserAction = async (userId: string, action: 'verify' | 'suspend' | 'delete') => {
    try {
      await apiClient.patch(`/admin/users/${userId}`, { action })
      fetchAdminData() // Refresh data
    } catch (error) {
      console.error(`Failed to ${action} user:`, error)
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || campaign.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Mock chart data (you can replace with real aggregated data from API)
  const categoryData = [
    { name: 'Education', donations: 850000, donors: 3200, color: '#F97316' },
    { name: 'Healthcare', donations: 650000, donors: 2100, color: '#10B981' },
    { name: 'Food Relief', donations: 450000, donors: 1800, color: '#F59E0B' },
    { name: 'Water & Sanitation', donations: 350000, donors: 1400, color: '#06B6D4' },
    { name: 'Emergency', donations: 200000, donors: 900, color: '#EF4444' },
  ]

  const monthlyTrends = [
    { month: 'Jul', donations: 180000, donors: 450 },
    { month: 'Aug', donations: 220000, donors: 520 },
    { month: 'Sep', donations: 195000, donors: 480 },
    { month: 'Oct', donations: 280000, donors: 650 },
    { month: 'Nov', donations: 320000, donors: 720 },
    { month: 'Dec', donations: 380000, donors: 850 },
  ]

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'campaigns', label: 'Campaigns', icon: Heart },
    { id: 'donations', label: 'Donations', icon: DollarSign },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'reports', label: 'Reports', icon: Download },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-warm-orange mx-auto mb-4"></div>
          <p className="text-warm-charcoal text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-cream py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl section-heading mb-2 transform -rotate-1">
              Admin Dashboard 👑
            </h1>
            <p className="text-lg text-warm-charcoal-light">
              Manage campaigns, track donations, and monitor platform performance
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Button variant="outline" className="border-warm-orange text-warm-orange hover:bg-warm-orange hover:text-white">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button asChild className="btn-handmade">
              <Link to="/create-campaign">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="warm-card p-2 mb-8"
        >
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-warm-orange text-white shadow-gentle'
                    : 'text-warm-charcoal hover:bg-warm-orange/10'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="warm-card p-6"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-warm-orange/10">
                    <DollarSign className="h-8 w-8 text-warm-orange" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-warm-charcoal-light">Total Donations</p>
                    <p className="text-2xl font-bold text-warm-charcoal">
                      ₹{(adminStats.totalDonations / 100000).toFixed(1)}L
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="warm-card p-6"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-warm-green/10">
                    <Users className="h-8 w-8 text-warm-green" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-warm-charcoal-light">Total Donors</p>
                    <p className="text-2xl font-bold text-warm-charcoal">
                      {adminStats.totalDonors.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="warm-card p-6"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-warm-blue/10">
                    <Activity className="h-8 w-8 text-warm-blue" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-warm-charcoal-light">Active Campaigns</p>
                    <p className="text-2xl font-bold text-warm-charcoal">
                      {adminStats.activeCampaigns}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="warm-card p-6"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-warm-pink/10">
                    <Heart className="h-8 w-8 text-warm-pink" fill="currentColor" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-warm-charcoal-light">Lives Impacted</p>
                    <p className="text-2xl font-bold text-warm-charcoal">
                      {adminStats.totalImpact.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Monthly Trends */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="warm-card p-6"
              >
                <h3 className="text-xl section-heading mb-6">Monthly Donation Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`₹${(value / 1000).toFixed(0)}K`, 'Donations']} />
                    <Line 
                      type="monotone" 
                      dataKey="donations" 
                      stroke="#F97316" 
                      strokeWidth={3}
                      dot={{ fill: '#F97316', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Category Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="warm-card p-6"
              >
                <h3 className="text-xl section-heading mb-6">Campaign Categories</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="donations"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`₹${(value / 1000).toFixed(0)}K`, 'Donations']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {categoryData.map((category) => (
                    <div key={category.name} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm">{category.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Recent Donations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="warm-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl section-heading">Recent Donations</h3>
                <Button variant="outline" size="sm" className="border-warm-orange text-warm-orange hover:bg-warm-orange hover:text-white">
                  View All
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-warm-orange/20">
                      <th className="text-left py-3 px-4 font-medium text-warm-charcoal">Donation ID</th>
                      <th className="text-left py-3 px-4 font-medium text-warm-charcoal">Donor</th>
                      <th className="text-left py-3 px-4 font-medium text-warm-charcoal">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-warm-charcoal">Campaign</th>
                      <th className="text-left py-3 px-4 font-medium text-warm-charcoal">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-warm-charcoal">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDonations.length > 0 ? recentDonations.map((donation) => (
                      <tr key={donation._id} className="border-b border-warm-orange/10">
                        <td className="py-3 px-4 font-mono text-sm">{donation._id.slice(-6)}</td>
                        <td className="py-3 px-4">{donation.donor.name}</td>
                        <td className="py-3 px-4 font-semibold">₹{donation.amount.toLocaleString()}</td>
                        <td className="py-3 px-4">{donation.campaign.title}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            donation.status === 'confirmed' 
                              ? 'bg-warm-green/20 text-warm-green' 
                              : 'bg-warm-orange/20 text-warm-orange'
                          }`}>
                            {donation.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-warm-charcoal-light">
                          No recent donations found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search and Filters */}
            <div className="warm-card p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-charcoal-light h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-warm-orange/30 rounded-lg focus:border-warm-orange focus:outline-none"
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-warm-orange/30 rounded-lg focus:border-warm-orange focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>

            {/* Campaigns List */}
            <div className="warm-card p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-warm-orange/20">
                      <th className="text-left py-3 px-4 font-medium text-warm-charcoal">Campaign</th>
                      <th className="text-left py-3 px-4 font-medium text-warm-charcoal">Creator</th>
                      <th className="text-left py-3 px-4 font-medium text-warm-charcoal">Target</th>
                      <th className="text-left py-3 px-4 font-medium text-warm-charcoal">Raised</th>
                      <th className="text-left py-3 px-4 font-medium text-warm-charcoal">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-warm-charcoal">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaigns.length > 0 ? filteredCampaigns.map((campaign) => (
                      <tr key={campaign._id} className="border-b border-warm-orange/10">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{campaign.title}</div>
                            <div className="text-sm text-warm-charcoal-light">{campaign.category}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{campaign.creator?.name || 'Unknown'}</td>
                        <td className="py-3 px-4">₹{campaign.targetAmount.toLocaleString()}</td>
                        <td className="py-3 px-4">₹{campaign.currentAmount?.toLocaleString() || '0'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              campaign.status === 'active' 
                                ? 'bg-warm-green/20 text-warm-green' 
                                : campaign.status === 'pending'
                                ? 'bg-warm-orange/20 text-warm-orange'
                                : 'bg-warm-charcoal/20 text-warm-charcoal'
                            }`}>
                              {campaign.status}
                            </span>
                            {campaign.isVerified && (
                              <CheckCircle className="h-4 w-4 text-warm-green" />
                            )}
                            {campaign.isUrgent && (
                              <AlertTriangle className="h-4 w-4 text-warm-pink" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {campaign.status === 'pending' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleCampaignAction(campaign._id, 'approve')}
                                  className="text-warm-green hover:bg-warm-green/10"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleCampaignAction(campaign._id, 'reject')}
                                  className="text-warm-pink hover:bg-warm-pink/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-warm-charcoal-light">
                          No campaigns found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search */}
            <div className="warm-card p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-charcoal-light h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-warm-orange/30 rounded-lg focus:border-warm-orange focus:outline-none"
                />
              </div>
            </div>

            {/* Users List */}
            <div className="warm-card p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-warm-orange/20">
                      <th className="text-left py-3 px-4 font-medium text-warm-charcoal">User</th>
                      <th className="text-left py-3 px-4 font-medium text-warm-charcoal">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-warm-charcoal">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-warm-charcoal">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-warm-charcoal">Joined</th>
                      <th className="text-left py-3 px-4 font-medium text-warm-charcoal">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                      <tr key={user._id} className="border-b border-warm-orange/10">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-warm-orange flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-warm-pink/20 text-warm-pink' 
                              : user.role === 'charity'
                              ? 'bg-warm-blue/20 text-warm-blue'
                              : 'bg-warm-green/20 text-warm-green'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.isVerified 
                                ? 'bg-warm-green/20 text-warm-green' 
                                : 'bg-warm-orange/20 text-warm-orange'
                            }`}>
                              {user.isVerified ? 'Verified' : 'Pending'}
                            </span>
                            {user.isVerified && (
                              <CheckCircle className="h-4 w-4 text-warm-green" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!user.isVerified && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleUserAction(user._id, 'verify')}
                                className="text-warm-green hover:bg-warm-green/10"
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleUserAction(user._id, 'suspend')}
                              className="text-warm-orange hover:bg-warm-orange/10"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-warm-charcoal-light">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Other tabs - placeholder for now */}
        {['donations', 'reports'].includes(activeTab) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="warm-card p-12 text-center"
          >
            <h3 className="text-2xl section-heading mb-4 transform -rotate-1">
              {tabs.find(t => t.id === activeTab)?.label} Section 🚧
            </h3>
            <p className="text-warm-charcoal-light mb-6">
              This section is under development. More admin features coming soon!
            </p>
            <Button className="btn-handmade">
              Coming Soon
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}