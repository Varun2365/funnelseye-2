import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  CreditCard, 
  Save, 
  RefreshCw, 
  TestTube,
  DollarSign,
  Percent,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  BarChart3,
  Calendar,
  Wallet
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import adminApiService from '../services/adminApiService';

const PaymentSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testing, setTesting] = useState(false);
  const [commissionPayouts, setCommissionPayouts] = useState([]);
  const [paymentAnalytics, setPaymentAnalytics] = useState(null);
  const [processingPayout, setProcessingPayout] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchCommissionPayouts();
    fetchPaymentAnalytics();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('💳 [PAYMENT_SETTINGS] Fetching payment settings...');
      
      // Fetch payment settings from admin financial routes
      const settingsResponse = await adminApiService.getPaymentSettings();
      console.log('💳 [PAYMENT_SETTINGS] Settings received:', settingsResponse);
      
      // Fetch gateway configurations from unified-payments
      const gatewaysResponse = await adminApiService.getUnifiedPaymentSettings();
      console.log('💳 [PAYMENT_SETTINGS] Gateways received:', gatewaysResponse);
      
      // Combine the data
      setSettings({
        ...settingsResponse,
        gateways: gatewaysResponse?.gateways || []
      });
    } catch (error) {
      console.error('💳 [PAYMENT_SETTINGS] Error fetching settings:', error);
      setError(`Failed to load payment settings: ${error.message || 'Unknown error'}`);
      // Set default settings to prevent infinite loading
      setSettings({
        fees: { platformFeePercentage: 0, minimumFee: 0, transactionFee: 0, refundFee: 0, feeInclusive: false },
        commissions: { bronze: 0, silver: 0, gold: 0, platinum: 0, diamond: 0, maxLevels: 5, cap: 0, autoDistribute: false },
        payouts: { frequency: 'weekly', minimumAmount: 0, method: 'bank_transfer', delayDays: 0, autoProcess: false },
        gateways: []
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCommissionPayouts = async () => {
    try {
      console.log('💳 [PAYMENT_SETTINGS] Fetching commission payouts...');
      
      const response = await adminApiService.getCommissionPayouts();
      console.log('💳 [PAYMENT_SETTINGS] Commission payouts received:', response);
      
      setCommissionPayouts(response || []);
    } catch (error) {
      console.error('💳 [PAYMENT_SETTINGS] Error fetching commission payouts:', error);
      setCommissionPayouts([]);
    }
  };

  const fetchPaymentAnalytics = async () => {
    try {
      console.log('💳 [PAYMENT_SETTINGS] Fetching payment analytics...');
      
      const response = await adminApiService.getPaymentAnalytics();
      console.log('💳 [PAYMENT_SETTINGS] Payment analytics received:', response);
      
      setPaymentAnalytics(response);
    } catch (error) {
      console.error('💳 [PAYMENT_SETTINGS] Error fetching payment analytics:', error);
      setPaymentAnalytics(null);
    }
  };

  const handleSaveSettings = async (section, data) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      console.log('💳 [PAYMENT_SETTINGS] Saving settings for section:', section, data);
      
      if (section === 'gateways') {
        // Save gateway settings to unified-payments
        await adminApiService.updateUnifiedPaymentSettings({
          centralAccount: {
            gatewayAccounts: data.reduce((acc, gateway) => {
              if (gateway.gatewayName) {
                acc[gateway.gatewayName] = gateway;
              }
              return acc;
            }, {})
          }
        });
        console.log('💳 [PAYMENT_SETTINGS] Gateway settings saved');
      } else {
        // Save other settings to admin financial routes
        await adminApiService.updatePaymentSettings(section, data);
        console.log('💳 [PAYMENT_SETTINGS] Settings saved');
      }
      
      setSuccess('Settings saved successfully');
      
      // Refresh settings
      fetchSettings();
    } catch (error) {
      console.error('💳 [PAYMENT_SETTINGS] Error saving settings:', error);
      setError(`Failed to save settings: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTestGateway = async (gatewayName) => {
    try {
      setTesting(true);
      setError('');
      setSuccess('');
      
      console.log('💳 [PAYMENT_SETTINGS] Testing gateway:', gatewayName);
      
      const response = await adminApiService.testPaymentGateway(gatewayName);
      
      console.log('💳 [PAYMENT_SETTINGS] Gateway test result:', response);
      setSuccess(`Gateway test successful: ${response.message || 'Connection established'}`);
    } catch (error) {
      console.error('💳 [PAYMENT_SETTINGS] Error testing gateway:', error);
      setError(`Gateway test failed: ${error.message || 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  const handleProcessPayout = async (paymentId) => {
    try {
      setProcessingPayout(true);
      setError('');
      setSuccess('');
      
      console.log('💳 [PAYMENT_SETTINGS] Processing payout for payment:', paymentId);
      
      const response = await adminApiService.processCommissionPayout(paymentId);
      
      console.log('💳 [PAYMENT_SETTINGS] Payout processed:', response);
      setSuccess('Commission payout processed successfully');
      
      // Refresh payouts
      fetchCommissionPayouts();
    } catch (error) {
      console.error('💳 [PAYMENT_SETTINGS] Error processing payout:', error);
      setError(`Failed to process payout: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessingPayout(false);
    }
  };

  const getGatewayStatus = (gateway) => {
    const gatewayConfig = settings?.gateways?.find(g => g.gatewayName === gateway);
    if (gatewayConfig?.isActive && gatewayConfig?.isEnabled) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    } else if (gatewayConfig?.isEnabled) {
      return <Badge variant="secondary">Inactive</Badge>;
    } else {
      return <Badge variant="outline">Disabled</Badge>;
    }
  };

  const getGatewayConfig = (gateway) => {
    return settings?.gateways?.find(g => g.gatewayName === gateway) || {};
  };

  const getPayoutStatus = (status) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      case 'processing': return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'completed': return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Payment Settings</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Settings</h1>
          <p className="text-muted-foreground">
            Configure payment gateways, fees, commission structures, and manage payouts.
          </p>
        </div>
        <Button onClick={fetchSettings} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="gateways" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gateways">Payment Gateways</TabsTrigger>
          <TabsTrigger value="fees">Platform Fees</TabsTrigger>
          <TabsTrigger value="commissions">MLM Commissions</TabsTrigger>
          <TabsTrigger value="payouts">Payout Settings</TabsTrigger>
          <TabsTrigger value="commission-payouts">Commission Payouts</TabsTrigger>
          <TabsTrigger value="analytics">Payment Analytics</TabsTrigger>
        </TabsList>

        {/* Payment Gateways */}
        <TabsContent value="gateways" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Gateways</span>
              </CardTitle>
              <CardDescription>
                Configure and manage payment gateway integrations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Razorpay Configuration */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">Razorpay</h3>
                    {getGatewayStatus('razorpay')}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestGateway('razorpay')}
                    disabled={testing}
                  >
                    <TestTube className="mr-2 h-4 w-4" />
                    {testing ? 'Testing...' : 'Test'}
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="razorpayKeyId">Key ID</Label>
                    <Input
                      id="razorpayKeyId"
                      value={getGatewayConfig('razorpay')?.config?.razorpay?.keyId || ''}
                      onChange={(e) => {
                        const updatedGateways = settings?.gateways?.map(g => 
                          g.gatewayName === 'razorpay' 
                            ? { ...g, config: { ...g.config, razorpay: { ...g.config?.razorpay, keyId: e.target.value } } }
                            : g
                        );
                        setSettings(prev => ({ ...prev, gateways: updatedGateways }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="razorpayKeySecret">Key Secret</Label>
                    <Input
                      id="razorpayKeySecret"
                      type="password"
                      value={getGatewayConfig('razorpay')?.config?.razorpay?.keySecret || ''}
                      onChange={(e) => {
                        const updatedGateways = settings?.gateways?.map(g => 
                          g.gatewayName === 'razorpay' 
                            ? { ...g, config: { ...g.config, razorpay: { ...g.config?.razorpay, keySecret: e.target.value } } }
                            : g
                        );
                        setSettings(prev => ({ ...prev, gateways: updatedGateways }));
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Switch
                    id="razorpayEnabled"
                    checked={getGatewayConfig('razorpay')?.isEnabled || false}
                    onCheckedChange={(checked) => {
                      const updatedGateways = settings?.gateways?.map(g => 
                        g.gatewayName === 'razorpay' ? { ...g, isEnabled: checked } : g
                      );
                      setSettings(prev => ({ ...prev, gateways: updatedGateways }));
                    }}
                  />
                  <Label htmlFor="razorpayEnabled">Enable Razorpay</Label>
                </div>
              </div>

              {/* Stripe Configuration */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">Stripe</h3>
                    {getGatewayStatus('stripe')}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestGateway('stripe')}
                    disabled={testing}
                  >
                    <TestTube className="mr-2 h-4 w-4" />
                    {testing ? 'Testing...' : 'Test'}
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="stripePublicKey">Public Key</Label>
                    <Input
                      id="stripePublicKey"
                      type="password"
                      value={getGatewayConfig('stripe')?.config?.stripe?.publishableKey || ''}
                      onChange={(e) => {
                        const updatedGateways = settings?.gateways?.map(g => 
                          g.gatewayName === 'stripe' 
                            ? { ...g, config: { ...g.config, stripe: { ...g.config?.stripe, publishableKey: e.target.value } } }
                            : g
                        );
                        setSettings(prev => ({ ...prev, gateways: updatedGateways }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripeSecretKey">Secret Key</Label>
                    <Input
                      id="stripeSecretKey"
                      type="password"
                      value={getGatewayConfig('stripe')?.config?.stripe?.secretKey || ''}
                      onChange={(e) => {
                        const updatedGateways = settings?.gateways?.map(g => 
                          g.gatewayName === 'stripe' 
                            ? { ...g, config: { ...g.config, stripe: { ...g.config?.stripe, secretKey: e.target.value } } }
                            : g
                        );
                        setSettings(prev => ({ ...prev, gateways: updatedGateways }));
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Switch
                    id="stripeEnabled"
                    checked={getGatewayConfig('stripe')?.isEnabled || false}
                    onCheckedChange={(checked) => {
                      const updatedGateways = settings?.gateways?.map(g => 
                        g.gatewayName === 'stripe' ? { ...g, isEnabled: checked } : g
                      );
                      setSettings(prev => ({ ...prev, gateways: updatedGateways }));
                    }}
                  />
                  <Label htmlFor="stripeEnabled">Enable Stripe</Label>
                </div>
              </div>

              {/* PayPal Configuration */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">PayPal</h3>
                    {getGatewayStatus('paypal')}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestGateway('paypal')}
                    disabled={testing}
                  >
                    <TestTube className="mr-2 h-4 w-4" />
                    {testing ? 'Testing...' : 'Test'}
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="paypalClientId">Client ID</Label>
                    <Input
                      id="paypalClientId"
                      value={getGatewayConfig('paypal')?.config?.paypal?.clientId || ''}
                      onChange={(e) => {
                        const updatedGateways = settings?.gateways?.map(g => 
                          g.gatewayName === 'paypal' 
                            ? { ...g, config: { ...g.config, paypal: { ...g.config?.paypal, clientId: e.target.value } } }
                            : g
                        );
                        setSettings(prev => ({ ...prev, gateways: updatedGateways }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paypalSecret">Secret</Label>
                    <Input
                      id="paypalSecret"
                      type="password"
                      value={getGatewayConfig('paypal')?.config?.paypal?.clientSecret || ''}
                      onChange={(e) => {
                        const updatedGateways = settings?.gateways?.map(g => 
                          g.gatewayName === 'paypal' 
                            ? { ...g, config: { ...g.config, paypal: { ...g.config?.paypal, clientSecret: e.target.value } } }
                            : g
                        );
                        setSettings(prev => ({ ...prev, gateways: updatedGateways }));
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Switch
                    id="paypalEnabled"
                    checked={getGatewayConfig('paypal')?.isEnabled || false}
                    onCheckedChange={(checked) => {
                      const updatedGateways = settings?.gateways?.map(g => 
                        g.gatewayName === 'paypal' ? { ...g, isEnabled: checked } : g
                      );
                      setSettings(prev => ({ ...prev, gateways: updatedGateways }));
                    }}
                  />
                  <Label htmlFor="paypalEnabled">Enable PayPal</Label>
                </div>
              </div>

              <Button 
                onClick={() => handleSaveSettings('gateways', settings?.gateways || [])}
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Gateway Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Fees */}
        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Percent className="h-5 w-5" />
                <span>Platform Fees</span>
              </CardTitle>
              <CardDescription>
                Configure platform fees and commission rates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platformFeePercentage">Platform Fee (%)</Label>
                  <Input
                    id="platformFeePercentage"
                    type="number"
                    step="0.01"
                    value={settings?.fees?.platformFeePercentage || 0}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      fees: { ...prev?.fees, platformFeePercentage: parseFloat(e.target.value) }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumFee">Minimum Fee ($)</Label>
                  <Input
                    id="minimumFee"
                    type="number"
                    step="0.01"
                    value={settings?.fees?.minimumFee || 0}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      fees: { ...prev?.fees, minimumFee: parseFloat(e.target.value) }
                    }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="transactionFee">Transaction Fee ($)</Label>
                  <Input
                    id="transactionFee"
                    type="number"
                    step="0.01"
                    value={settings?.fees?.transactionFee || 0}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      fees: { ...prev?.fees, transactionFee: parseFloat(e.target.value) }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refundFee">Refund Fee ($)</Label>
                  <Input
                    id="refundFee"
                    type="number"
                    step="0.01"
                    value={settings?.fees?.refundFee || 0}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      fees: { ...prev?.fees, refundFee: parseFloat(e.target.value) }
                    }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="feeInclusive"
                  checked={settings?.fees?.feeInclusive || false}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    fees: { ...prev?.fees, feeInclusive: checked }
                  }))}
                />
                <Label htmlFor="feeInclusive">Fees are inclusive of tax</Label>
              </div>

              <Button 
                onClick={() => handleSaveSettings('fees', settings?.fees)}
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Fee Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MLM Commissions */}
        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>MLM Commission Structure</span>
              </CardTitle>
              <CardDescription>
                Configure multi-level marketing commission rates and ranks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Commission Rates by Rank</h4>
                <div className="grid gap-4">
                  {['bronze', 'silver', 'gold', 'platinum', 'diamond'].map((rank) => (
                    <div key={rank} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="w-20">
                        <Label className="capitalize">{rank}</Label>
                      </div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={settings?.commissions?.[rank] || 0}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            commissions: { ...prev?.commissions, [rank]: parseFloat(e.target.value) }
                          }))}
                        />
                      </div>
                      <div className="w-12 text-sm text-muted-foreground">%</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxCommissionLevels">Max Commission Levels</Label>
                  <Input
                    id="maxCommissionLevels"
                    type="number"
                    value={settings?.commissions?.maxLevels || 5}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      commissions: { ...prev?.commissions, maxLevels: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commissionCap">Commission Cap ($)</Label>
                  <Input
                    id="commissionCap"
                    type="number"
                    step="0.01"
                    value={settings?.commissions?.cap || 0}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      commissions: { ...prev?.commissions, cap: parseFloat(e.target.value) }
                    }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoCommission"
                  checked={settings?.commissions?.autoDistribute || false}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    commissions: { ...prev?.commissions, autoDistribute: checked }
                  }))}
                />
                <Label htmlFor="autoCommission">Auto-distribute commissions</Label>
              </div>

              <Button 
                onClick={() => handleSaveSettings('commissions', settings?.commissions)}
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Commission Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payout Settings */}
        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Payout Settings</span>
              </CardTitle>
              <CardDescription>
                Configure payout frequency and minimum thresholds.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="payoutFrequency">Payout Frequency</Label>
                  <Select 
                    value={settings?.payouts?.frequency || 'weekly'}
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev,
                      payouts: { ...prev?.payouts, frequency: value }
                    }))}
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
                <div className="space-y-2">
                  <Label htmlFor="minimumPayout">Minimum Payout ($)</Label>
                  <Input
                    id="minimumPayout"
                    type="number"
                    step="0.01"
                    value={settings?.payouts?.minimumAmount || 0}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      payouts: { ...prev?.payouts, minimumAmount: parseFloat(e.target.value) }
                    }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="payoutMethod">Default Payout Method</Label>
                  <Select 
                    value={settings?.payouts?.method || 'bank_transfer'}
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev,
                      payouts: { ...prev?.payouts, method: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payoutDelay">Payout Delay (days)</Label>
                  <Input
                    id="payoutDelay"
                    type="number"
                    value={settings?.payouts?.delayDays || 0}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      payouts: { ...prev?.payouts, delayDays: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoPayout"
                  checked={settings?.payouts?.autoProcess || false}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    payouts: { ...prev?.payouts, autoProcess: checked }
                  }))}
                />
                <Label htmlFor="autoPayout">Enable automatic payouts</Label>
              </div>

              <Button 
                onClick={() => handleSaveSettings('payouts', settings?.payouts)}
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Payout Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commission Payouts */}
        <TabsContent value="commission-payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Commission Payouts</span>
              </CardTitle>
              <CardDescription>
                Manage and process commission payouts for MLM members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commissionPayouts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No commission payouts pending</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {commissionPayouts.map((payout) => (
                      <div key={payout._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary rounded-full">
                              <Users className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <div>
                              <h4 className="font-medium">{payout.userName}</h4>
                              <p className="text-sm text-muted-foreground">{payout.userEmail}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getPayoutStatus(payout.status)}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleProcessPayout(payout._id)}
                              disabled={processingPayout || payout.status === 'completed'}
                            >
                              {processingPayout ? 'Processing...' : 'Process Payout'}
                            </Button>
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <Label className="text-sm font-medium">Amount</Label>
                            <p className="text-lg font-semibold">${payout.amount?.toFixed(2)}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Commission Type</Label>
                            <p className="text-sm">{payout.commissionType}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Created</Label>
                            <p className="text-sm">{new Date(payout.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Payment Analytics</span>
              </CardTitle>
              <CardDescription>
                View payment performance and transaction analytics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentAnalytics ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Total Revenue</p>
                        <p className="text-2xl font-bold">${paymentAnalytics.totalRevenue?.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Total Transactions</p>
                        <p className="text-2xl font-bold">{paymentAnalytics.totalTransactions}</p>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Percent className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium">Success Rate</p>
                        <p className="text-2xl font-bold">{paymentAnalytics.successRate?.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">This Month</p>
                        <p className="text-2xl font-bold">${paymentAnalytics.thisMonthRevenue?.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No analytics data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentSettings;