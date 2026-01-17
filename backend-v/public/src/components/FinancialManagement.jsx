import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
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
  Zap
} from 'lucide-react';
import adminApiService from '../services/adminApiService';
import { useToast } from '../contexts/ToastContext';

const FinancialManagement = () => {
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
    try {
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
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
          <p className="text-muted-foreground">Manage platform finances, payouts, and revenue</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowSettingsDialog(true)}
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button 
            onClick={() => setShowPayoutAllDialog(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            Payout All
          </Button>
        </div>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{revenueStats.totalRevenue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              All-time earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Razorpay Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₹{revenueStats.razorpayBalance?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {revenueStats.accountName ? `${revenueStats.accountName}` : 'RazorpayX Balance'}
            </p>
            {revenueStats.accountType && (
              <p className="text-xs text-muted-foreground">
                Type: {revenueStats.accountType}
              </p>
            )}
            {revenueStats.availableAmount !== undefined && revenueStats.availableAmount !== revenueStats.razorpayBalance && (
              <p className="text-xs text-muted-foreground">
                Available: ₹{revenueStats.availableAmount?.toLocaleString() || 0}
              </p>
            )}
            <div className="flex items-center space-x-2 mt-2">
              <Button 
                size="sm" 
                variant={isRazorpayConfigured() ? "outline" : "secondary"}
                onClick={handleRefreshBalance}
                className="h-6 px-2 text-xs"
                title={isRazorpayConfigured() ? "Refresh Razorpay balance" : "Configure Razorpay credentials first"}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                {isRazorpayConfigured() ? "Refresh" : "Configure"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₹{revenueStats.pendingPayouts?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Earnings</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ₹{revenueStats.platformEarnings?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Fee: {financialSettings?.platformFee || 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="coaches">Coaches</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Statistics</CardTitle>
                <CardDescription>Platform revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{revenueStats.monthlyRevenue?.toLocaleString() || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ₹{revenueStats.weeklyRevenue?.toLocaleString() || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">This Week</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ₹{revenueStats.dailyRevenue?.toLocaleString() || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Today</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      ₹{revenueStats.coachEarnings?.toLocaleString() || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Coach Earnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Settings Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Settings</CardTitle>
                <CardDescription>Current platform configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Platform Fee</span>
                    <span className="text-sm font-bold">{financialSettings?.platformFee || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">MLM Commission</span>
                    <span className="text-sm font-bold">{financialSettings?.mlmCommission || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Tax Rate</span>
                    <span className="text-sm font-bold">{financialSettings?.taxRate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Payout Frequency</span>
                    <span className="text-sm font-bold capitalize">{financialSettings?.payoutFrequency || 'weekly'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Min Payout Amount</span>
                    <span className="text-sm font-bold">₹{financialSettings?.minimumPayoutAmount || 100}</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowSettingsDialog(true)}
                  className="w-full"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Coaches Tab */}
        <TabsContent value="coaches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Coaches for Payout</CardTitle>
              <CardDescription>Select coaches and process individual payouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search coaches..." className="w-64" />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => setShowPayoutDialog(true)}
                      disabled={!selectedCoach}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Process Payout
                    </Button>
                    {selectedCoach && !selectedCoach.razorpayDetails?.isActive && (
                      <Button 
                        variant="outline"
                        onClick={handleSetupRazorpayCoach}
                        disabled={processingPayout}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Setup Razorpay
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {coaches.map((coach) => (
                    <div 
                      key={coach._id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedCoach?._id === coach._id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedCoach(coach);
                        setPayoutAmount(coach.pendingAmount || 0);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{coach.name}</p>
                          <p className="text-sm text-muted-foreground">{coach.email}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm text-gray-600">
                          Total: ₹{coach.totalEarnings?.toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-red-600">
                          Platform Fee: ₹{coach.platformFeeAmount?.toLocaleString() || 0}
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          ₹{coach.pendingAmount?.toLocaleString() || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">To Pay</p>
                        {!coach.razorpayDetails?.isActive && (
                          <div className="text-xs text-orange-600 mt-1">
                            Razorpay not setup
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payout Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Payout Settings</CardTitle>
                <CardDescription>Configure automatic payout parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label>Payout Frequency</Label>
                    <Select 
                      value={financialSettings?.payoutFrequency || 'weekly'} 
                      onValueChange={(value) => setFinancialSettings(prev => ({ ...prev, payoutFrequency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Payout Day</Label>
                    <Select 
                      value={financialSettings?.payoutDay || 'monday'} 
                      onValueChange={(value) => setFinancialSettings(prev => ({ ...prev, payoutDay: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Payout Time</Label>
                    <Input 
                      type="time" 
                      value={financialSettings?.payoutTime || '09:00'}
                      onChange={(e) => setFinancialSettings(prev => ({ ...prev, payoutTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Minimum Payout Amount</Label>
                    <Input 
                      type="number" 
                      value={financialSettings?.minimumPayoutAmount || 100}
                      onChange={(e) => setFinancialSettings(prev => ({ ...prev, minimumPayoutAmount: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveSettings} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardContent>
            </Card>

            {/* Payout Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payout Methods</CardTitle>
                <CardDescription>Configure available payout methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">UPI Payouts</p>
                      <p className="text-sm text-muted-foreground">Enable UPI-based payouts</p>
                    </div>
                    <Button 
                      variant={financialSettings?.upiEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFinancialSettings(prev => ({ ...prev, upiEnabled: !prev?.upiEnabled }))}
                    >
                      {financialSettings?.upiEnabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Bank Transfer</p>
                      <p className="text-sm text-muted-foreground">Enable bank transfer payouts</p>
                    </div>
                    <Button 
                      variant={financialSettings?.bankTransferEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFinancialSettings(prev => ({ ...prev, bankTransferEnabled: !prev?.bankTransferEnabled }))}
                    >
                      {financialSettings?.bankTransferEnabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Recent payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {paymentHistory.slice(0, 10).map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">₹{payment.amount}</p>
                          <p className="text-xs text-muted-foreground">{payment.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={payment.status === 'success' ? 'default' : 'secondary'}>
                          {payment.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payout History */}
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>Recent payout transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {payoutHistory.slice(0, 10).map((payout, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{payout.coachName}</p>
                          <p className="text-xs text-muted-foreground">₹{payout.amount}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}>
                          {payout.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
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
      </Tabs>

      {/* Financial Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Financial Settings</DialogTitle>
            <DialogDescription>
              Configure platform financial parameters and Razorpay integration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="razorpay-key">Razorpay API Key</Label>
                <Input
                  id="razorpay-key"
                  type="password"
                  value={financialSettings?.razorpayApiKey || ''}
                  onChange={(e) => setFinancialSettings(prev => ({ ...prev, razorpayApiKey: e.target.value }))}
                  placeholder="Enter Razorpay API Key"
                />
              </div>
              <div>
                <Label htmlFor="razorpay-secret">Razorpay Secret</Label>
                <Input
                  id="razorpay-secret"
                  type="password"
                  value={financialSettings?.razorpaySecret || ''}
                  onChange={(e) => setFinancialSettings(prev => ({ ...prev, razorpaySecret: e.target.value }))}
                  placeholder="Enter Razorpay Secret"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platform-fee">Platform Fee (%)</Label>
                <Input
                  id="platform-fee"
                  type="number"
                  value={financialSettings?.platformFee || 0}
                  onChange={(e) => setFinancialSettings(prev => ({ ...prev, platformFee: parseFloat(e.target.value) }))}
                  placeholder="Enter platform fee percentage"
                />
              </div>
              <div>
                <Label htmlFor="mlm-commission">MLM Commission (%)</Label>
                <Input
                  id="mlm-commission"
                  type="number"
                  value={financialSettings?.mlmCommission || 0}
                  onChange={(e) => setFinancialSettings(prev => ({ ...prev, mlmCommission: parseFloat(e.target.value) }))}
                  placeholder="Enter MLM commission percentage"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  value={financialSettings?.taxRate || 0}
                  onChange={(e) => setFinancialSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                  placeholder="Enter tax rate percentage"
                />
              </div>
              <div>
                <Label htmlFor="min-payout">Minimum Payout Amount</Label>
                <Input
                  id="min-payout"
                  type="number"
                  value={financialSettings?.minimumPayoutAmount || 100}
                  onChange={(e) => setFinancialSettings(prev => ({ ...prev, minimumPayoutAmount: parseInt(e.target.value) }))}
                  placeholder="Enter minimum payout amount"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
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
  );
};

export default FinancialManagement;