import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Settings, 
  Shield, 
  CreditCard, 
  Users, 
  Bell, 
  Zap, 
  Database,
  Globe,
  Loader2,
  CheckCircle,
  AlertCircle,
  Save,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import axios from 'axios';

// Import configuration section components
import PlatformCoreConfig from './config/PlatformCoreConfig';
import SecurityConfig from './config/SecurityConfig';
import PaymentSystemConfig from './config/PaymentSystemConfig';
import MLMConfig from './config/MLMConfig';
import NotificationConfig from './config/NotificationConfig';
import IntegrationConfig from './config/IntegrationConfig';
import AIServicesConfig from './config/AIServicesConfig';
import DatabaseConfig from './config/DatabaseConfig';
import CORSConfig from './config/CORSConfig';

const PlatformConfig = () => {
  const [configData, setConfigData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('core');

  useEffect(() => {
    // Add a small delay to ensure auth context is ready
    const timer = setTimeout(() => {
      fetchPlatformConfig();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchPlatformConfig = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 [PLATFORM] Fetching platform config...');
      console.log('🔄 [PLATFORM] Axios base URL:', axios.defaults.baseURL);
      console.log('🔄 [PLATFORM] Auth header:', axios.defaults.headers.common['Authorization']);
      
      const response = await axios.get('/admin/platform-config');

      console.log('✅ [PLATFORM] Platform config fetched:', response.data);
      
      if (response.data.success) {
        setConfigData(response.data.data);
      } else {
        setError('Failed to fetch platform configuration');
      }
    } catch (error) {
      console.error('❌ [PLATFORM] Error fetching platform config:', error);
      console.error('❌ [PLATFORM] Error response:', error.response?.data);
      console.error('❌ [PLATFORM] Error status:', error.response?.status);
      setError(error.response?.data?.message || 'Failed to fetch platform configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (section, data) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      console.log('🔄 [PLATFORM] Saving config for section:', section);
      const response = await axios.patch(`/admin/platform-config/${section}`, data);

      if (response.data.success) {
        setSuccess(`${section} configuration updated successfully`);
        // Update local config data
        setConfigData(prev => ({
          ...prev,
          systemSettings: {
            ...prev.systemSettings,
            [section]: response.data.data.config || response.data.data
          }
        }));
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      setError(error.response?.data?.message || 'Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleExportConfig = async () => {
    try {
      console.log('🔄 [PLATFORM] Exporting config...');
      const response = await axios.get('/admin/platform-config/export');

      if (response.data.success) {
        // Create and download file
        const dataStr = JSON.stringify(response.data.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `platform-config-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        setSuccess('Configuration exported successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error exporting config:', error);
      setError('Failed to export configuration');
    }
  };

  const handleImportConfig = async (file) => {
    try {
      const fileContent = await file.text();
      const configData = JSON.parse(fileContent);
      
      console.log('🔄 [PLATFORM] Importing config...');
      const response = await axios.post('/admin/platform-config/import', configData);

      if (response.data.success) {
        setSuccess('Configuration imported successfully');
        fetchPlatformConfig(); // Refresh the config
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error importing config:', error);
      setError('Failed to import configuration');
    }
  };

  const getSystemStatus = () => {
    if (!configData?.systemSettings) return 'Unknown';
    
    const { maintenanceMode, environment, debugMode } = configData.systemSettings.platformConfig || {};
    
    if (maintenanceMode) return 'Maintenance';
    if (environment === 'production') return 'Production';
    if (debugMode) return 'Development';
    return 'Staging';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Production': return 'bg-green-100 text-green-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Development': return 'bg-blue-100 text-blue-800';
      case 'Staging': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Platform Configuration</h1>
            <p className="text-muted-foreground">
              Manage system-wide platform settings and configurations
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading platform configuration...</p>
            <p className="text-sm text-muted-foreground">Check browser console for detailed logs</p>
            <Button 
              variant="outline" 
              onClick={fetchPlatformConfig}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Configuration</h1>
          <p className="text-muted-foreground">
            Manage system-wide platform settings and configurations
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(getSystemStatus())}>
            {getSystemStatus()}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPlatformConfig}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>System Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Platform Name</p>
              <p className="text-lg font-semibold">
                {configData?.systemSettings?.platformConfig?.platformName || 'FunnelsEye'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Version</p>
              <p className="text-lg font-semibold">
                {configData?.systemSettings?.platformConfig?.platformVersion || '1.0.0'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Environment</p>
              <p className="text-lg font-semibold">
                {configData?.systemSettings?.platformConfig?.environment || 'development'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9">
          <TabsTrigger value="core" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Core</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
          <TabsTrigger value="mlm" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">MLM</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">AI Services</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Database</span>
          </TabsTrigger>
          <TabsTrigger value="cors" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">CORS</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="core">
          <PlatformCoreConfig 
            config={configData?.systemSettings?.platformConfig} 
            onSave={(data) => handleSaveConfig('platformConfig', data)}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="security">
          <SecurityConfig 
            config={configData?.systemSettings?.security} 
            onSave={(data) => handleSaveConfig('security', data)}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentSystemConfig 
            config={configData?.systemSettings?.paymentSystem} 
            onSave={(data) => handleSaveConfig('paymentSystem', data)}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="mlm">
          <MLMConfig 
            config={configData?.systemSettings?.mlmSystem} 
            onSave={(data) => handleSaveConfig('mlmSystem', data)}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationConfig 
            config={configData?.systemSettings?.notifications} 
            onSave={(data) => handleSaveConfig('notifications', data)}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationConfig 
            config={configData?.systemSettings?.integrations} 
            onSave={(data) => handleSaveConfig('integrations', data)}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="ai">
          <AIServicesConfig 
            config={configData?.systemSettings?.aiServices} 
            onSave={(data) => handleSaveConfig('aiServices', data)}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="database">
          <DatabaseConfig 
            config={configData?.systemSettings?.databaseConfig} 
            onSave={(data) => handleSaveConfig('databaseConfig', data)}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="cors">
          <CORSConfig 
            config={configData?.systemSettings?.corsConfig} 
            onSave={(data) => handleSaveConfig('corsConfig', data)}
            saving={saving}
          />
        </TabsContent>
      </Tabs>

      {/* Import/Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Management</CardTitle>
          <CardDescription>
            Import or export platform configuration settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button onClick={handleExportConfig} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Configuration
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={(e) => e.target.files[0] && handleImportConfig(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Configuration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformConfig;
