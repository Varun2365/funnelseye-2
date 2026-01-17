import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Settings,
  CreditCard,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Banknote,
  Wallet,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Upload,
  Eye,
  EyeOff,
  Edit,
  Save,
  X,
  Trash2,
  Plus,
  Filter,
  Search,
  ArrowUpDown,
  Activity,
  PieChart,
  BarChart3,
  Receipt,
  Shield,
  Zap,
  Layers,
  FileText,
  AlertTriangle,
  UserCheck,
  Target,
  BarChart,
  BarChartHorizontal,
  PieChartIcon,
  LineChart,
  IndianRupee,
  Percent,
  Timer,
  Globe
} from 'lucide-react';
import adminApiService from '../services/adminApiService';
import { useToast } from '../contexts/ToastContext';

// Import sub-components from downline management
import AdminRequestsTab from './downline/AdminRequestsTab';
import HierarchyManagementTab from './downline/HierarchyManagementTab';
import CommissionManagementTab from './downline/CommissionManagementTab';
import PerformanceTrackingTab from './downline/PerformanceTrackingTab';

const FinancialMlmManagement = () => {
  const { showToast } = useToast();

  // State for financial settings
  const [financialSettings, setFinancialSettings] = useState({
    razorpayApiKey: '',
    razorpaySecret: '',
    platformFee: 0,
    mlmCommission: 0,
    payoutFrequency: 'weekly',
    payoutDay: 'monday',
    payoutTime: '09:00',
    taxRate: 0,
    upiEnabled: true,
    bankTransferEnabled: true,
    minimumPayoutAmount: 100
  });

  // State for revenue and statistics
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    razorpayBalance: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
    platformEarnings: 0,
    coachEarnings: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    dailyRevenue: 0,
    accountName: '',
    accountId: '',
    accountType: '',
    availableAmount: 0,
    refreshedAt: null
  });

  // State for coaches and payouts
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState(0);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);

  // Dialog states
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [showPayoutAllDialog, setShowPayoutAllDialog] = useState(false);
  const [showRevenueDialog, setShowRevenueDialog] = useState(false);
  const [showRazorpayDialog, setShowRazorpayDialog] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processingPayout, setProcessingPayout] = useState(false);
  const [refreshingBalance, setRefreshingBalance] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState('dashboard');

  // Load financial data
  const loadFinancialData = async () => {
    try {
      setLoading(true);
      const [settingsResponse, statsResponse, coachesResponse, historyResponse] = await Promise.all([
        adminApiService.getFinancialSettings(),
        adminApiService.getRevenueStats(),
        adminApiService.getCoachesForPayout(),
        adminApiService.getPaymentHistory()
      ]);

      if (settingsResponse.success) {
        setFinancialSettings(settingsResponse.data);
      }
      if (statsResponse.success) {
        setRevenueStats(statsResponse.data);
      }
      if (coachesResponse.success) {
        setCoaches(coachesResponse.data);
      }
      if (historyResponse.success) {
        setPaymentHistory(historyResponse.data.payments);
        setPayoutHistory(historyResponse.data.payouts);
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
      showToast('Error loading financial data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancialData();
  }, []);

  // Auto-refresh balance after 1 second delay
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(async () => {
        if (!refreshingBalance) {
          await handleRefreshBalance();
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Save financial settings
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await adminApiService.updateFinancialSettings(financialSettings);
      if (response.success) {
        showToast('Financial settings updated successfully', 'success');
        setShowSettingsDialog(false);
      } else {
        showToast(response.message || 'Failed to update settings', 'error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Process individual payout
  const handleProcessPayout = async () => {
    try {
      setProcessingPayout(true);
      const response = await adminApiService.processCoachPayout(
        selectedCoach._id, 
        payoutAmount,
        'INR',
        'payout',
        'IMPS',
        `Manual payout - ${selectedCoach.name} - FE`
      );
      if (response.success) {
        showToast(`Razorpay payout of ₹${payoutAmount} processed for ${selectedCoach.name}. Transaction ID: ${response.data?.payoutId || 'N/A'}`, 'success');
        setShowPayoutDialog(false);
        setSelectedCoach(null);
        setPayoutAmount(0);
        loadFinancialData(); // Refresh data
      } else {
        showToast(response.message || 'Failed to process payout', 'error');
      }
    } catch (error) {
      console.error('Error processing payout:', error);
      showToast('Error processing payout', 'error');
    } finally {
      setProcessingPayout(false);
    }
  };

  const handleSetupRazorpayCoach = async () => {
    if (!selectedCoach) return;

    try {
      setProcessingPayout(true);
      const response = await adminApiService.setupRazorpayCoach(selectedCoach._id);
      
      if (response.success) {
        showToast(`Razorpay setup initiated for ${selectedCoach.name}. Please check the coach's payment details.`, 'success');
        loadFinancialData(); // Refresh data
      } else {
        showToast(response.message || 'Failed to setup Razorpay', 'error');
      }
    } catch (error) {
      console.error('Error setting up Razorpay:', error);
      showToast('Error setting up Razorpay for coach', 'error');
    } finally {
      setProcessingPayout(false);
    }
  };

  // Process payout all
  const handlePayoutAll = async () => {
    try {
      setProcessingPayout(true);
      const response = await adminApiService.processPayoutAll();
      if (response.success) {
        showToast(`Payout processed for ${response.data.processedCount} coaches`, 'success');
        setShowPayoutAllDialog(false);
        loadFinancialData(); // Refresh data
      } else {
        showToast(response.message || 'Failed to process payouts', 'error');
      }
    } catch (error) {
      console.error('Error processing payouts:', error);
      showToast('Error processing payouts', 'error');
    } finally {
      setProcessingPayout(false);
    }
  };

  // Check if Razorpay credentials are configured
  const isRazorpayConfigured = () => {
    return financialSettings?.razorpayApiKey && financialSettings?.razorpaySecret;
  };

  // Refresh Razorpay balance
  const handleRefreshBalance = async () => {
    if (refreshingBalance) return; // Prevent multiple simultaneous calls

    try {
      setRefreshingBalance(true);
      setBalanceLoading(true);
      const response = await adminApiService.refreshRazorpayBalance();
      if (response.success) {
        setRevenueStats(prev => ({
          ...prev,
          razorpayBalance: response.data.balance,
          accountName: response.data.accountName || '',
          accountId: response.data.accountId || '',
          accountType: response.data.accountType || '',
          availableAmount: response.data.availableAmount || 0,
          refreshedAt: response.data.refreshedAt || null
        }));
        setBalanceLoading(false);
        showToast('Razorpay balance refreshed', 'success');
      } else {
        if (response.message?.includes('not configured')) {
          showToast('Please configure Razorpay credentials in Financial Settings first', 'warning');
        } else {
          showToast(response.message || 'Failed to refresh balance', 'error');
        }
      }
    } catch (error) {
      console.error('Error refreshing balance:', error);
      if (error.message?.includes('not configured')) {
        showToast('Please configure Razorpay credentials in Financial Settings first', 'warning');
      } else {
        showToast('Error refreshing balance', 'error');
      }
    } finally {
      setRefreshingBalance(false);
      setBalanceLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
          <p className="text-sm text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Financial & MLM</h1>
            <p className="text-sm text-gray-600 mt-1">Comprehensive financial management system</p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Vertical Sidebar Tabs */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
            <TabsList className="flex flex-col h-auto w-full bg-transparent p-6 space-y-1">
              <TabsTrigger
                value="dashboard"
                className="w-full justify-start px-3 py-2 text-left border-0 bg-transparent hover:bg-gray-100 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-r-2 data-[state=active]:border-r-blue-600 rounded-none"
              >
                <BarChart3 className="w-4 h-4 mr-3" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="payouts"
                className="w-full justify-start px-3 py-2 text-left border-0 bg-transparent hover:bg-gray-100 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-r-2 data-[state=active]:border-r-blue-600 rounded-none"
              >
                <CreditCard className="w-4 h-4 mr-3" />
                Payouts
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="w-full justify-start px-3 py-2 text-left border-0 bg-transparent hover:bg-gray-100 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-r-2 data-[state=active]:border-r-blue-600 rounded-none"
              >
                <Receipt className="w-4 h-4 mr-3" />
                Transactions
              </TabsTrigger>
              <TabsTrigger
                value="mlm-admin"
                className="w-full justify-start px-3 py-2 text-left border-0 bg-transparent hover:bg-gray-100 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-r-2 data-[state=active]:border-r-blue-600 rounded-none"
              >
                <Users className="w-4 h-4 mr-3" />
                MLM Admin
              </TabsTrigger>
              <TabsTrigger
                value="hierarchy"
                className="w-full justify-start px-3 py-2 text-left border-0 bg-transparent hover:bg-gray-100 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-r-2 data-[state=active]:border-r-blue-600 rounded-none"
              >
                <Layers className="w-4 h-4 mr-3" />
                Hierarchy
              </TabsTrigger>
              <TabsTrigger
                value="commission"
                className="w-full justify-start px-3 py-2 text-left border-0 bg-transparent hover:bg-gray-100 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-r-2 data-[state=active]:border-r-blue-600 rounded-none"
              >
                <Percent className="w-4 h-4 mr-3" />
                Commission
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="w-full justify-start px-3 py-2 text-left border-0 bg-transparent hover:bg-gray-100 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-r-2 data-[state=active]:border-r-blue-600 rounded-none"
              >
                <Activity className="w-4 h-4 mr-3" />
                Performance
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6 mt-0">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <IndianRupee className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-yellow-800">
                      ₹{revenueStats.totalRevenue?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-yellow-700">Total Revenue</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500">+12.5% from last month</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-800">Available Balance</h3>
                  <button
                    onClick={handleRefreshBalance}
                    disabled={refreshingBalance}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white border border-blue-200 rounded-lg hover:bg-blue-25 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-3 h-3 text-blue-600 ${refreshingBalance ? 'animate-spin' : ''}`} />
                    <span className="text-blue-600 font-medium">
                      {refreshingBalance ? 'Refreshing...' : 'Refresh'}
                    </span>
                  </button>
                </div>
                {balanceLoading ? (
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-200 p-3 rounded-lg animate-pulse">
                      <div className="w-6 h-6 bg-gray-300 rounded"></div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-8 bg-gray-300 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-24"></div>
                      <div className="h-3 bg-gray-300 rounded animate-pulse w-32"></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Wallet className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-blue-800">
                        ₹{revenueStats.razorpayBalance?.toLocaleString() || 0}
                      </p>
                      <p className="text-sm text-blue-700">Current Balance</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {revenueStats.accountName || 'RazorpayX'}
                    </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-orange-800">
                      ₹{revenueStats.pendingPayouts?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-orange-700">Pending Payouts</p>
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-orange-500" />
                      <span className="text-xs text-orange-500">Processing</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Banknote className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-purple-800">
                      ₹{revenueStats.platformEarnings?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-purple-700">Platform Earnings</p>
                    <p className="text-xs text-purple-600 mt-1">
                      {financialSettings?.platformFee || 0}% platform fee
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow duration-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowSettingsDialog(true)}
                  className="group flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors duration-200 mb-2">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Settings</span>
                </button>

                <button
                  onClick={() => setShowPayoutAllDialog(true)}
                  className="group flex flex-col items-center justify-center p-4 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                >
                  <div className="p-2 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors duration-200 mb-2">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">Payout All</span>
                </button>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        ₹{revenueStats.monthlyRevenue?.toLocaleString() || 0}
                      </p>
                      <p className="text-sm text-blue-700 mt-1">This Month</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        ₹{revenueStats.weeklyRevenue?.toLocaleString() || 0}
                      </p>
                      <p className="text-sm text-green-700 mt-1">This Week</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        ₹{revenueStats.dailyRevenue?.toLocaleString() || 0}
                      </p>
                      <p className="text-sm text-purple-700 mt-1">Today</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        ₹{revenueStats.coachEarnings?.toLocaleString() || 0}
                      </p>
                      <p className="text-sm text-orange-700 mt-1">Coach Earnings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    System Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Platform Fee</span>
                    <span className="text-sm font-semibold text-gray-900">{financialSettings?.platformFee || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">MLM Commission</span>
                    <span className="text-sm font-semibold text-gray-900">{financialSettings?.mlmCommission || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Tax Rate</span>
                    <span className="text-sm font-semibold text-gray-900">{financialSettings?.taxRate || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Payout Frequency</span>
                    <span className="text-sm font-semibold text-gray-900 capitalize">{financialSettings?.payoutFrequency || 'weekly'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">Min Payout</span>
                    <span className="text-sm font-semibold text-gray-900">₹{financialSettings?.minimumPayoutAmount || 100}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            </TabsContent>


            {/* Payouts Tab */}
            <TabsContent value="payouts" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coaches List */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Coach Payouts
                    </CardTitle>
                    <CardDescription>Select coaches to process payouts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {coaches.map((coach) => (
                        <div
                          key={coach._id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                            selectedCoach?._id === coach._id
                              ? 'border-blue-300 bg-blue-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                          onClick={() => {
                            setSelectedCoach(coach);
                            setPayoutAmount(coach.pendingAmount || 0);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{coach.name}</p>
                                <p className="text-sm text-gray-500">{coach.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                ₹{coach.pendingAmount?.toLocaleString() || 0}
                              </p>
                              <p className="text-sm text-gray-500">Available</p>
                            </div>
                          </div>
                          {!coach.razorpayDetails?.isActive && (
                            <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                              Razorpay setup required
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payout Actions */}
              <div>
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={() => setShowPayoutDialog(true)}
                      disabled={!selectedCoach}
                      className="w-full"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Process Payout
                    </Button>

                    {selectedCoach && !selectedCoach.razorpayDetails?.isActive && (
                      <Button
                        variant="outline"
                        onClick={handleSetupRazorpayCoach}
                        disabled={processingPayout}
                        className="w-full"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Setup Razorpay
                      </Button>
                    )}

                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => setShowPayoutAllDialog(true)}
                        variant="outline"
                        className="w-full"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Payout All Eligible
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Receipt className="w-5 h-5 mr-2" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {paymentHistory.slice(0, 10).map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <CreditCard className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">₹{payment.amount}</p>
                            <p className="text-xs text-gray-500">{payment.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={payment.status === 'success' ? 'default' : 'secondary'} className="mb-1">
                            {payment.status}
                          </Badge>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Banknote className="w-5 h-5 mr-2" />
                    Payout History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {payoutHistory.slice(0, 10).map((payout, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <Banknote className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{payout.coachName}</p>
                            <p className="text-xs text-gray-500">₹{payout.amount}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'} className="mb-1">
                            {payout.status}
                          </Badge>
                          <p className="text-xs text-gray-500">
                            {new Date(payout.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            </TabsContent>

            {/* MLM Administration Tab */}
            <TabsContent value="mlm-admin" className="space-y-6 mt-0">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  MLM Administration
                </CardTitle>
                <CardDescription>Manage MLM system requests and administration</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminRequestsTab />
              </CardContent>
            </Card>
            </TabsContent>

            {/* Hierarchy Management Tab */}
            <TabsContent value="hierarchy" className="space-y-6 mt-0">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Layers className="w-5 h-5 mr-2" />
                  Hierarchy Management
                </CardTitle>
                <CardDescription>Manage coach hierarchy and relationships</CardDescription>
              </CardHeader>
              <CardContent>
                <HierarchyManagementTab />
              </CardContent>
            </Card>
            </TabsContent>

            {/* Commission Settings Tab */}
            <TabsContent value="commission" className="space-y-6 mt-0">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Percent className="w-5 h-5 mr-2" />
                  Commission Settings
                </CardTitle>
                <CardDescription>Configure commission rates and payout structures</CardDescription>
              </CardHeader>
              <CardContent>
                <CommissionManagementTab />
              </CardContent>
            </Card>
            </TabsContent>

            {/* Performance Tracking Tab */}
            <TabsContent value="performance" className="space-y-6 mt-0">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Performance Tracking
                  </CardTitle>
                  <CardDescription>Monitor system performance and coach metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <PerformanceTrackingTab />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

      {/* Financial Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-xl font-semibold">Financial Settings</DialogTitle>
            <DialogDescription className="text-gray-600">
              Configure your platform's financial parameters
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Razorpay Integration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Shield className="w-4 h-4" />
                Razorpay Integration
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <Label htmlFor="razorpay-key" className="text-sm font-medium text-gray-700">API Key</Label>
                  <div className="relative mt-1">
                    <Input
                      id="razorpay-key"
                      type={showApiKey ? "text" : "password"}
                      value={financialSettings?.razorpayApiKey || ''}
                      onChange={(e) => setFinancialSettings(prev => ({ ...prev, razorpayApiKey: e.target.value }))}
                      placeholder="Enter your Razorpay API key"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <Label htmlFor="razorpay-secret" className="text-sm font-medium text-gray-700">API Secret</Label>
                  <div className="relative mt-1">
                    <Input
                      id="razorpay-secret"
                      type={showApiSecret ? "text" : "password"}
                      value={financialSettings?.razorpaySecret || ''}
                      onChange={(e) => setFinancialSettings(prev => ({ ...prev, razorpaySecret: e.target.value }))}
                      placeholder="Enter your Razorpay API secret"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiSecret(!showApiSecret)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showApiSecret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Percent className="w-4 h-4" />
                Platform Configuration
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="platform-fee" className="text-sm font-medium text-gray-700">Platform Fee (%)</Label>
                  <Input
                    id="platform-fee"
                    type="number"
                    value={financialSettings?.platformFee || 0}
                    onChange={(e) => setFinancialSettings(prev => ({ ...prev, platformFee: parseFloat(e.target.value) }))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="mlm-commission" className="text-sm font-medium text-gray-700">MLM Commission (%)</Label>
                  <Input
                    id="mlm-commission"
                    type="number"
                    value={financialSettings?.mlmCommission || 0}
                    onChange={(e) => setFinancialSettings(prev => ({ ...prev, mlmCommission: parseFloat(e.target.value) }))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="tax-rate" className="text-sm font-medium text-gray-700">Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    value={financialSettings?.taxRate || 0}
                    onChange={(e) => setFinancialSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="min-payout" className="text-sm font-medium text-gray-700">Min Payout (₹)</Label>
                  <Input
                    id="min-payout"
                    type="number"
                    value={financialSettings?.minimumPayoutAmount || 100}
                    onChange={(e) => setFinancialSettings(prev => ({ ...prev, minimumPayoutAmount: parseInt(e.target.value) }))}
                    placeholder="100"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowSettingsDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Individual Payout Dialog */}
      <Dialog open={showPayoutDialog} onOpenChange={(open) => {
        setShowPayoutDialog(open);
        if (open && selectedCoach) {
          setPayoutAmount(selectedCoach.pendingAmount || 0);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payout</DialogTitle>
            <DialogDescription>
              Process payout for {selectedCoach?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Earnings Breakdown */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Earnings Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Earnings:</span>
                  <span className="font-medium">₹{selectedCoach?.totalEarnings?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee ({financialSettings?.platformFee || 0}%):</span>
                  <span className="text-red-600">-₹{selectedCoach?.platformFeeAmount?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="font-medium">Amount to Pay:</span>
                  <span className="font-bold text-green-600">₹{selectedCoach?.pendingAmount?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="payout-amount">Payout Amount</Label>
              <Input
                id="payout-amount"
                type="number"
                value={payoutAmount || selectedCoach?.pendingAmount || 0}
                onChange={(e) => setPayoutAmount(parseFloat(e.target.value))}
                placeholder="Enter payout amount"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Amount auto-filled with calculated payout amount
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleProcessPayout} 
              disabled={processingPayout || !payoutAmount || payoutAmount > selectedCoach?.pendingAmount}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {processingPayout ? 'Processing...' : 'Process Payout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payout All Dialog */}
      <Dialog open={showPayoutAllDialog} onOpenChange={setShowPayoutAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payout All Coaches</DialogTitle>
            <DialogDescription>
              Process payouts for all eligible coaches with pending amounts above ₹{financialSettings?.minimumPayoutAmount || 100}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Payout Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Eligible Coaches:</span>
                  <span className="text-sm font-medium">{coaches.filter(c => c.pendingAmount >= (financialSettings?.minimumPayoutAmount || 100)).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Amount:</span>
                  <span className="text-sm font-medium">
                    ₹{coaches.filter(c => c.pendingAmount >= (financialSettings?.minimumPayoutAmount || 100)).reduce((sum, c) => sum + c.pendingAmount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutAllDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePayoutAll} 
              disabled={processingPayout}
              className="bg-green-600 hover:bg-green-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              {processingPayout ? 'Processing...' : 'Payout All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default FinancialMlmManagement;
