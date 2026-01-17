import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, RefreshCw, Download, Upload, TestTube, CheckCircle, XCircle } from 'lucide-react';
import adminApiService from '../services/adminApiService';
import { 
    PaymentSettings, 
    SecuritySettings, 
    NotificationSettings, 
    IntegrationSettings, 
    AiServicesSettings 
} from './PlatformConfigComponents';

const PlatformConfiguration = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('core');
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        loadConfiguration();
    }, []);

    const loadConfiguration = async () => {
        try {
            setLoading(true);
            const response = await adminApiService.getPlatformConfig();
            setConfig(response.data);
        } catch (error) {
            console.error('Error loading configuration:', error);
            setStatus({ type: 'error', message: 'Failed to load configuration' });
        } finally {
            setLoading(false);
        }
    };

    const saveConfiguration = async (section, data) => {
        try {
            setSaving(true);
            await adminApiService.updateConfigSection(section, data);
            setStatus({ type: 'success', message: `${section} settings saved successfully` });
            await loadConfiguration();
        } catch (error) {
            console.error('Error saving configuration:', error);
            setStatus({ type: 'error', message: 'Failed to save configuration' });
        } finally {
            setSaving(false);
        }
    };

    const resetToDefaults = async () => {
        try {
            setSaving(true);
            await adminApiService.resetToDefaults();
            setStatus({ type: 'success', message: 'Configuration reset to defaults' });
            await loadConfiguration();
        } catch (error) {
            console.error('Error resetting configuration:', error);
            setStatus({ type: 'error', message: 'Failed to reset configuration' });
        } finally {
            setSaving(false);
        }
    };

    const exportConfig = async () => {
        try {
            const response = await adminApiService.exportConfig();
            const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `platform-config-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setStatus({ type: 'success', message: 'Configuration exported successfully' });
        } catch (error) {
            console.error('Error exporting configuration:', error);
            setStatus({ type: 'error', message: 'Failed to export configuration' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!config) {
        return (
            <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load platform configuration. Please try again.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Platform Configuration</h1>
                    <p className="text-muted-foreground">
                        Manage all platform settings and configurations
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportConfig}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="outline" onClick={resetToDefaults}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset
                    </Button>
                </div>
            </div>

            {/* Status Alert */}
            {status.message && (
                <Alert className={status.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                    {status.type === 'error' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    <AlertDescription>{status.message}</AlertDescription>
                </Alert>
            )}

            {/* Configuration Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="core">Core</TabsTrigger>
                    <TabsTrigger value="payment">Payment</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="integrations">Integrations</TabsTrigger>
                    <TabsTrigger value="ai">AI Services</TabsTrigger>
                </TabsList>

                {/* Core Settings */}
                <TabsContent value="core">
                    <CoreSettings 
                        config={config.systemSettings?.platformConfig} 
                        onSave={(data) => saveConfiguration('platformConfig', data)}
                        saving={saving}
                    />
                </TabsContent>

                {/* Payment Settings */}
                <TabsContent value="payment">
                    <PaymentSettings 
                        config={config.systemSettings?.paymentSystem} 
                        globalPayment={config.globalPaymentSettings}
                        onSave={(data) => saveConfiguration('paymentSystem', data)}
                        saving={saving}
                    />
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security">
                    <SecuritySettings 
                        config={config.systemSettings?.security} 
                        onSave={(data) => saveConfiguration('security', data)}
                        saving={saving}
                    />
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications">
                    <NotificationSettings 
                        config={config.systemSettings?.notifications} 
                        onSave={(data) => saveConfiguration('notifications', data)}
                        saving={saving}
                    />
                </TabsContent>

                {/* Integration Settings */}
                <TabsContent value="integrations">
                    <IntegrationSettings 
                        config={config.systemSettings?.integrations} 
                        onSave={(data) => saveConfiguration('integrations', data)}
                        saving={saving}
                    />
                </TabsContent>

                {/* AI Services Settings */}
                <TabsContent value="ai">
                    <AiServicesSettings 
                        config={config.systemSettings?.aiServices} 
                        onSave={(data) => saveConfiguration('aiServices', data)}
                        saving={saving}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};

// Core Settings Component
const CoreSettings = ({ config, onSave, saving }) => {
    const [formData, setFormData] = useState({
        platformName: config?.platformName || 'FunnelsEye',
        platformVersion: config?.platformVersion || '1.0.0',
        maintenanceMode: config?.maintenanceMode || false,
        maintenanceMessage: config?.maintenanceMessage || 'System is under maintenance. Please try again later.',
        maxUsers: config?.maxUsers || 10000,
        maxCoaches: config?.maxCoaches || 1000,
        maxLeads: config?.maxLeads || 100000,
        systemTimezone: config?.systemTimezone || 'UTC',
        dateFormat: config?.dateFormat || 'MM/DD/YYYY',
        timeFormat: config?.timeFormat || '12h',
        environment: config?.environment || 'development',
        debugMode: config?.debugMode || true,
        logLevel: config?.logLevel || 'info'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Core Platform Settings</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="platformName">Platform Name</Label>
                            <Input
                                id="platformName"
                                value={formData.platformName}
                                onChange={(e) => handleChange('platformName', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="platformVersion">Platform Version</Label>
                            <Input
                                id="platformVersion"
                                value={formData.platformVersion}
                                onChange={(e) => handleChange('platformVersion', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="maintenanceMode"
                                checked={formData.maintenanceMode}
                                onCheckedChange={(checked) => handleChange('maintenanceMode', checked)}
                            />
                            <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                        </div>

                        {formData.maintenanceMode && (
                            <div className="space-y-2">
                                <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                                <Input
                                    id="maintenanceMessage"
                                    value={formData.maintenanceMessage}
                                    onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="maxUsers">Max Users</Label>
                            <Input
                                id="maxUsers"
                                type="number"
                                value={formData.maxUsers}
                                onChange={(e) => handleChange('maxUsers', parseInt(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxCoaches">Max Coaches</Label>
                            <Input
                                id="maxCoaches"
                                type="number"
                                value={formData.maxCoaches}
                                onChange={(e) => handleChange('maxCoaches', parseInt(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxLeads">Max Leads</Label>
                            <Input
                                id="maxLeads"
                                type="number"
                                value={formData.maxLeads}
                                onChange={(e) => handleChange('maxLeads', parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="systemTimezone">System Timezone</Label>
                            <Select value={formData.systemTimezone} onValueChange={(value) => handleChange('systemTimezone', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UTC">UTC</SelectItem>
                                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                    <SelectItem value="Asia/Kolkata">India Standard Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateFormat">Date Format</Label>
                            <Select value={formData.dateFormat} onValueChange={(value) => handleChange('dateFormat', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="timeFormat">Time Format</Label>
                            <Select value={formData.timeFormat} onValueChange={(value) => handleChange('timeFormat', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="12h">12 Hour</SelectItem>
                                    <SelectItem value="24h">24 Hour</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="environment">Environment</Label>
                            <Select value={formData.environment} onValueChange={(value) => handleChange('environment', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="development">Development</SelectItem>
                                    <SelectItem value="staging">Staging</SelectItem>
                                    <SelectItem value="production">Production</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="logLevel">Log Level</Label>
                            <Select value={formData.logLevel} onValueChange={(value) => handleChange('logLevel', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="error">Error</SelectItem>
                                    <SelectItem value="warn">Warning</SelectItem>
                                    <SelectItem value="info">Info</SelectItem>
                                    <SelectItem value="debug">Debug</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="debugMode"
                            checked={formData.debugMode}
                            onCheckedChange={(checked) => handleChange('debugMode', checked)}
                        />
                        <Label htmlFor="debugMode">Debug Mode</Label>
                    </div>

                    <Button type="submit" disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Core Settings
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default PlatformConfiguration;
