import React, { useState, useEffect } from 'react';
import adminApiService from '../services/adminApiService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { 
  MessageSquare, 
  Key, 
  DollarSign, 
  Settings, 
  Globe, 
  TestTube,
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertTriangle,
  Info,
  RefreshCw,
  Send,
  Eye,
  EyeOff,
  Webhook,
  Database,
  BarChart3,
  Users,
  TrendingUp,
  Activity
} from 'lucide-react';

const WhatsAppAdminSetup = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAccessToken, setShowAccessToken] = useState(false);

  // Overview data
  const [overview, setOverview] = useState(null);
  
  // Central WhatsApp Configuration
  const [config, setConfig] = useState({
    phoneNumberId: '',
    accessToken: '',
    businessAccountId: ''
  });
  const [configStatus, setConfigStatus] = useState(null);

  // Credit Settings
  const [creditSettings, setCreditSettings] = useState({
    creditPrice: 0.01,
    autoRecharge: false,
    rechargeThreshold: 10,
    rechargeAmount: 100,
    isEnabled: true,
    webhookVerifyToken: '',
    webhookUrl: ''
  });

  // System Stats
  const [systemStats, setSystemStats] = useState({
    totalCreditsInSystem: 0,
    totalActiveCoaches: 0,
    totalMessages: 0,
    todayMessages: 0
  });

  // Health Check
  const [healthStatus, setHealthStatus] = useState(null);

  // Templates
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesSyncLoading, setTemplatesSyncLoading] = useState(false);

  // Contacts
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsPage, setContactsPage] = useState(1);
  const [contactsTotal, setContactsTotal] = useState(0);
  const [contactsSearch, setContactsSearch] = useState('');

  // Fetch overview data
  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getWhatsAppSettingsOverview();
      if (response.success) {
        setOverview(response.data);
        
        // Update individual states
        if (response.data.centralWhatsApp) {
          setConfig({
            phoneNumberId: response.data.centralWhatsApp.phoneNumberId || '',
            accessToken: '', // Don't expose token
            businessAccountId: response.data.centralWhatsApp.businessAccountId || ''
          });
          setConfigStatus(response.data.centralWhatsApp);
        }
        
        if (response.data.creditSettings) {
          setCreditSettings(response.data.creditSettings);
        }
        
        if (response.data.systemStats) {
          setSystemStats(response.data.systemStats);
        }
      }
    } catch (err) {
      console.error('Error fetching overview:', err);
      setError('Failed to fetch WhatsApp overview: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Setup Central WhatsApp
  const handleSetupCentralWhatsApp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await adminApiService.setupCentralWhatsApp(config);
      
      if (response.success) {
        setSuccess(response.message || 'Central WhatsApp configured successfully!');
        await fetchOverview();
        await testConfiguration();
      }
    } catch (err) {
      console.error('Error setting up WhatsApp:', err);
      setError('Failed to setup WhatsApp: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update Credit Settings
  const handleUpdateCreditSettings = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await adminApiService.updateCreditSettings(creditSettings);
      
      if (response.success) {
        setSuccess('Credit settings updated successfully!');
        await fetchOverview();
      }
    } catch (err) {
      console.error('Error updating credit settings:', err);
      setError('Failed to update credit settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Test Configuration
  const testConfiguration = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.testWhatsAppConfiguration();
      
      if (response.success) {
        setHealthStatus({
          success: true,
          message: 'Configuration is working properly',
          ...response.data
        });
      }
    } catch (err) {
      console.error('Error testing configuration:', err);
      setHealthStatus({
        success: false,
        message: err.message,
        errorCode: err.errorCode
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const response = await adminApiService.getWhatsAppTemplates();
      if (response.success) {
        setTemplates(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to fetch templates: ' + err.message);
    } finally {
      setTemplatesLoading(false);
    }
  };

  // Sync templates
  const syncTemplates = async () => {
    try {
      setTemplatesSyncLoading(true);
      setError('');
      setSuccess('');
      const response = await adminApiService.syncWhatsAppTemplates();
      if (response.success) {
        setSuccess(`Templates synced successfully! ${response.data?.syncedCount || 0} templates processed.`);
        await fetchTemplates();
        await fetchOverview(); // Refresh overview to update count
      }
    } catch (err) {
      console.error('Error syncing templates:', err);
      setError('Failed to sync templates: ' + err.message);
    } finally {
      setTemplatesSyncLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchOverview();
    if (configStatus) {
      testConfiguration();
    }
    if (activeTab === 'templates') {
      fetchTemplates();
    }
    if (activeTab === 'contacts') {
      fetchContacts();
    }
  };

  // Initialize
  useEffect(() => {
    fetchOverview();
  }, []);

  // Fetch templates when templates tab is active
  useEffect(() => {
    if (activeTab === 'templates' && configStatus) {
      fetchTemplates();
    }
  }, [activeTab, configStatus]);

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      setContactsLoading(true);
      const params = {
        page: contactsPage,
        limit: 20
      };
      if (contactsSearch) {
        params.search = contactsSearch;
      }
      const response = await adminApiService.getWhatsAppContacts(params);
      if (response.success) {
        setContacts(Array.isArray(response.data?.contacts) ? response.data.contacts : []);
        setContactsTotal(response.data?.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to fetch contacts: ' + err.message);
    } finally {
      setContactsLoading(false);
    }
  };

  // Fetch contacts when contacts tab is active
  useEffect(() => {
    if (activeTab === 'contacts') {
      fetchContacts();
    }
  }, [activeTab, contactsPage, contactsSearch]);

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Admin Setup</h1>
          <p className="text-gray-500 mt-1">Configure central WhatsApp and manage credit settings</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      {systemStats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalCreditsInSystem}</div>
              <p className="text-xs text-muted-foreground">System-wide balance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Coaches</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalActiveCoaches}</div>
              <p className="text-xs text-muted-foreground">Using WhatsApp</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalMessages}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Messages</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.todayMessages}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="api-setup">
            <Key className="w-4 h-4 mr-2" />
            API Setup
          </TabsTrigger>
          <TabsTrigger value="templates">
            <MessageSquare className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="contacts">
            <Users className="w-4 h-4 mr-2" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="credit-settings">
            <DollarSign className="w-4 h-4 mr-2" />
            Credit Settings
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Settings className="w-4 h-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Status</CardTitle>
              <CardDescription>Current WhatsApp Business API configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {configStatus ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Phone Number ID</p>
                        <p className="text-sm text-gray-500">{configStatus.phoneNumberId}</p>
                      </div>
                    </div>
                    {configStatus.isActive ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Business Account ID</p>
                      <p className="font-medium">{configStatus.businessAccountId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Templates</p>
                      <p className="font-medium">{configStatus.templatesCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contacts</p>
                      <p className="font-medium">{configStatus.contactsCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Configured</p>
                      <p className="font-medium">{new Date(configStatus.configuredAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {healthStatus && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-2">
                        {healthStatus.success ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <div>
                              <p className="font-medium text-green-700">Connection Healthy</p>
                              <p className="text-sm text-gray-500">{healthStatus.message}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-red-500" />
                            <div>
                              <p className="font-medium text-red-700">Connection Failed</p>
                              <p className="text-sm text-gray-500">{healthStatus.message}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}

                  <Button onClick={testConfiguration} variant="outline" className="w-full" disabled={loading}>
                    <TestTube className="w-4 h-4 mr-2" />
                    Test Configuration
                  </Button>
                </>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Central WhatsApp is not configured yet. Go to API Setup to configure it.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Credit Settings Overview */}
          {creditSettings && (
            <Card>
              <CardHeader>
                <CardTitle>Credit System</CardTitle>
                <CardDescription>Current credit pricing and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Credit Price</p>
                    <p className="text-2xl font-bold">${creditSettings.creditPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Auto Recharge</p>
                    <p className="text-lg font-medium">
                      {creditSettings.autoRecharge ? (
                        <Badge className="bg-green-500">Enabled</Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Recharge Threshold</p>
                    <p className="text-lg font-medium">{creditSettings.rechargeThreshold} credits</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Recharge Amount</p>
                    <p className="text-lg font-medium">{creditSettings.rechargeAmount} credits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* API Setup Tab */}
        <TabsContent value="api-setup">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Business API Configuration</CardTitle>
              <CardDescription>
                Configure your Meta WhatsApp Business API credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSetupCentralWhatsApp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumberId">Phone Number ID *</Label>
                  <Input
                    id="phoneNumberId"
                    value={config.phoneNumberId}
                    onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
                    placeholder="Enter your WhatsApp Phone Number ID"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Find this in your Meta Business Manager → WhatsApp → API Setup
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessToken">Access Token *</Label>
                  <div className="relative">
                    <Input
                      id="accessToken"
                      type={showAccessToken ? "text" : "password"}
                      value={config.accessToken}
                      onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                      placeholder="Enter your WhatsApp Access Token"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowAccessToken(!showAccessToken)}
                    >
                      {showAccessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Your permanent access token from Meta Business Manager
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessAccountId">Business Account ID *</Label>
                  <Input
                    id="businessAccountId"
                    value={config.businessAccountId}
                    onChange={(e) => setConfig({ ...config, businessAccountId: e.target.value })}
                    placeholder="Enter your WhatsApp Business Account ID"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Your WhatsApp Business Account ID from Meta
                  </p>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Important:</strong> Make sure you have:
                    <ul className="list-disc ml-4 mt-2 space-y-1">
                      <li>Verified your Meta Business Account</li>
                      <li>Created a permanent access token (not temporary)</li>
                      <li>Granted necessary permissions for messaging</li>
                      <li>Verified your phone number in Meta Business Manager</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {configStatus ? 'Updating...' : 'Setting up...'}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {configStatus ? 'Update Configuration' : 'Setup WhatsApp'}
                      </>
                    )}
                  </Button>
                  {configStatus && (
                    <Button type="button" onClick={testConfiguration} variant="outline" disabled={loading}>
                      <TestTube className="w-4 h-4 mr-2" />
                      Test
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>WhatsApp Templates</CardTitle>
                  <CardDescription>
                    Manage Meta WhatsApp message templates
                  </CardDescription>
                </div>
                <Button 
                  onClick={syncTemplates} 
                  disabled={templatesSyncLoading || !configStatus}
                  variant="outline"
                >
                  {templatesSyncLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync from Meta
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!configStatus ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Please configure WhatsApp API settings first to manage templates.
                  </AlertDescription>
                </Alert>
              ) : templatesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-2">No templates found</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Sync templates from Meta Business Manager to see them here
                  </p>
                  <Button onClick={syncTemplates} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Templates
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {templates.length} template{templates.length !== 1 ? 's' : ''} found
                    </p>
                    <div className="flex gap-2">
                      <Badge className="bg-green-500">
                        {templates.filter(t => t.status === 'APPROVED').length} Approved
                      </Badge>
                      <Badge variant="secondary">
                        {templates.filter(t => t.status === 'PENDING').length} Pending
                      </Badge>
                      <Badge variant="destructive">
                        {templates.filter(t => t.status === 'REJECTED').length} Rejected
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {templates.map((template) => (
                      <Card key={template.templateId || template.templateName} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{template.templateName}</h3>
                                <Badge 
                                  className={
                                    template.status === 'APPROVED' 
                                      ? 'bg-green-500' 
                                      : template.status === 'PENDING'
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  }
                                >
                                  {template.status}
                                </Badge>
                                <Badge variant="outline">{template.category}</Badge>
                                <Badge variant="outline">{template.language}</Badge>
                              </div>
                              {template.components?.find(c => c.type === 'BODY')?.text && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {template.components.find(c => c.type === 'BODY').text}
                                </p>
                              )}
                              {template.variables && template.variables.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500 mb-1">Variables:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {template.variables.map((variable, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {variable.placeholder || `{{${variable.index}}}`}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>WhatsApp Contacts</CardTitle>
                  <CardDescription>
                    View and manage contacts across all coaches
                  </CardDescription>
                </div>
                <Button 
                  onClick={fetchContacts} 
                  disabled={contactsLoading}
                  variant="outline"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${contactsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by name, phone, or email..."
                    value={contactsSearch}
                    onChange={(e) => {
                      setContactsSearch(e.target.value);
                      setContactsPage(1);
                    }}
                    className="flex-1"
                  />
                </div>

                {/* Contacts List */}
                {contactsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-2">No contacts found</p>
                    <p className="text-sm text-gray-400">
                      {contactsSearch ? 'Try adjusting your search' : 'Contacts will appear here as messages are sent'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {contacts.map((contact) => (
                        <Card key={contact._id || contact.phone} className="border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold">{contact.name || 'Unknown'}</h3>
                                  {contact.status && (
                                    <Badge variant="outline">{contact.status}</Badge>
                                  )}
                                  {contact.messageCount !== undefined && (
                                    <Badge variant="secondary">
                                      {contact.messageCount} message{contact.messageCount !== 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                </div>
                                <div className="space-y-1 text-sm text-gray-600">
                                  {contact.phone && (
                                    <p>
                                      <span className="font-medium">Phone:</span> {contact.phone}
                                    </p>
                                  )}
                                  {contact.email && (
                                    <p>
                                      <span className="font-medium">Email:</span> {contact.email}
                                    </p>
                                  )}
                                  {contact.coachId && (
                                    <p>
                                      <span className="font-medium">Coach:</span> {contact.coachId?.name || contact.coachId?.email || 'N/A'}
                                    </p>
                                  )}
                                  {contact.source && (
                                    <p>
                                      <span className="font-medium">Source:</span> {contact.source}
                                    </p>
                                  )}
                                  {contact.leadTemperature && (
                                    <p>
                                      <span className="font-medium">Temperature:</span> {contact.leadTemperature}
                                    </p>
                                  )}
                                  {contact.createdAt && (
                                    <p className="text-xs text-gray-500">
                                      Added: {new Date(contact.createdAt).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Pagination */}
                    {contactsTotal > 20 && (
                      <div className="flex items-center justify-between pt-4 border-t">
                        <p className="text-sm text-gray-500">
                          Showing {(contactsPage - 1) * 20 + 1} - {Math.min(contactsPage * 20, contactsTotal)} of {contactsTotal}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setContactsPage(p => Math.max(1, p - 1))}
                            disabled={contactsPage === 1 || contactsLoading}
                            variant="outline"
                            size="sm"
                          >
                            Previous
                          </Button>
                          <Button
                            onClick={() => setContactsPage(p => p + 1)}
                            disabled={contactsPage * 20 >= contactsTotal || contactsLoading}
                            variant="outline"
                            size="sm"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credit Settings Tab */}
        <TabsContent value="credit-settings">
          <Card>
            <CardHeader>
              <CardTitle>Credit System Configuration</CardTitle>
              <CardDescription>
                Configure credit pricing and auto-recharge settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateCreditSettings} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="creditPrice">Credit Price (per message)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="creditPrice"
                        type="number"
                        step="0.001"
                        min="0"
                        value={creditSettings.creditPrice}
                        onChange={(e) => setCreditSettings({ ...creditSettings, creditPrice: parseFloat(e.target.value) })}
                        className="pl-7"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Price coaches pay per WhatsApp message sent
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isEnabled">Enable Credit System</Label>
                      <p className="text-sm text-gray-500">
                        Allow coaches to use WhatsApp messaging
                      </p>
                    </div>
                    <Switch
                      id="isEnabled"
                      checked={creditSettings.isEnabled}
                      onCheckedChange={(checked) => setCreditSettings({ ...creditSettings, isEnabled: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoRecharge">Auto Recharge</Label>
                      <p className="text-sm text-gray-500">
                        Automatically add credits when balance is low
                      </p>
                    </div>
                    <Switch
                      id="autoRecharge"
                      checked={creditSettings.autoRecharge}
                      onCheckedChange={(checked) => setCreditSettings({ ...creditSettings, autoRecharge: checked })}
                    />
                  </div>

                  {creditSettings.autoRecharge && (
                    <>
                      <div className="space-y-2 ml-6">
                        <Label htmlFor="rechargeThreshold">Recharge Threshold</Label>
                        <Input
                          id="rechargeThreshold"
                          type="number"
                          min="1"
                          value={creditSettings.rechargeThreshold}
                          onChange={(e) => setCreditSettings({ ...creditSettings, rechargeThreshold: parseInt(e.target.value) })}
                          required
                        />
                        <p className="text-xs text-gray-500">
                          Trigger recharge when balance falls below this amount
                        </p>
                      </div>

                      <div className="space-y-2 ml-6">
                        <Label htmlFor="rechargeAmount">Recharge Amount</Label>
                        <Input
                          id="rechargeAmount"
                          type="number"
                          min="1"
                          value={creditSettings.rechargeAmount}
                          onChange={(e) => setCreditSettings({ ...creditSettings, rechargeAmount: parseInt(e.target.value) })}
                          required
                        />
                        <p className="text-xs text-gray-500">
                          Number of credits to add during auto-recharge
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Update Credit Settings
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          {/* Webhook Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Configure webhooks for receiving WhatsApp messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={creditSettings.webhookUrl}
                  onChange={(e) => setCreditSettings({ ...creditSettings, webhookUrl: e.target.value })}
                  placeholder="https://your-domain.com/api/central-messaging/v1/webhook"
                />
                <p className="text-xs text-gray-500">
                  Your server endpoint for receiving WhatsApp webhooks
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhookVerifyToken">Webhook Verify Token</Label>
                <Input
                  id="webhookVerifyToken"
                  value={creditSettings.webhookVerifyToken}
                  onChange={(e) => setCreditSettings({ ...creditSettings, webhookVerifyToken: e.target.value })}
                  placeholder="Enter a secure verify token"
                />
                <p className="text-xs text-gray-500">
                  Token for Meta to verify your webhook endpoint
                </p>
              </div>

              <Alert>
                <Webhook className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Configure this webhook URL in your Meta Business Manager:
                  <br />
                  WhatsApp → Configuration → Webhook
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleUpdateCreditSettings} 
                variant="outline" 
                className="w-full"
                disabled={loading}
              >
                <Webhook className="w-4 h-4 mr-2" />
                Update Webhook Settings
              </Button>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Database and configuration details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Credits in System</p>
                  <p className="text-lg font-medium">{systemStats.totalCreditsInSystem}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Coaches</p>
                  <p className="text-lg font-medium">{systemStats.totalActiveCoaches}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Messages</p>
                  <p className="text-lg font-medium">{systemStats.totalMessages}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Today's Messages</p>
                  <p className="text-lg font-medium">{systemStats.todayMessages}</p>
                </div>
              </div>

              {configStatus && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-lg font-medium">
                      {new Date(configStatus.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  {configStatus.configuredBy && (
                    <div>
                      <p className="text-sm text-gray-500">Configured By</p>
                      <p className="text-lg font-medium">
                        {configStatus.configuredBy.name || configStatus.configuredBy.email}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhatsAppAdminSetup;

