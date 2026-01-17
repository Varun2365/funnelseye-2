import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
    Settings, 
    Save, 
    RefreshCw, 
    AlertTriangle, 
    CheckCircle, 
    Shield, 
    Database, 
    Server, 
    Mail, 
    Bell,
    Globe,
    Activity
} from 'lucide-react';
import adminApiService from '../services/adminApiService';

const SystemSettings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [systemHealth, setSystemHealth] = useState(null);
    
    // System Settings State
    const [settings, setSettings] = useState({
        general: {
            siteName: 'FunnelsEye',
            siteDescription: 'Complete MLM and Coaching Platform',
            siteUrl: 'https://funnelseye.com',
            timezone: 'Asia/Kolkata',
            language: 'en',
            maintenanceMode: false,
            debugMode: false
        },
        security: {
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            lockoutDuration: 15,
            requireTwoFactor: false,
            passwordMinLength: 8,
            passwordRequireSpecial: true,
            enableAuditLogs: true,
            enableSecurityAlerts: true
        },
        email: {
            smtpHost: '',
            smtpPort: 587,
            smtpUser: '',
            smtpPassword: '',
            fromEmail: 'noreply@funnelseye.com',
            fromName: 'FunnelsEye',
            enableEmailNotifications: true,
            enableEmailMarketing: false
        }
    });

    const fetchSystemSettings = async () => {
        try {
            const response = await adminApiService.getSystemSettings();
            setSettings(response.data);
        } catch (err) {
            console.error('Failed to fetch system settings:', err);
        }
    };

    const fetchSystemHealth = async () => {
        try {
            const response = await adminApiService.getSystemHealth();
            setSystemHealth(response.data);
        } catch (err) {
            console.error('Failed to fetch system health:', err);
        }
    };

    useEffect(() => {
        fetchSystemSettings();
        fetchSystemHealth();
    }, []);

    const handleSettingsUpdate = async (section = null) => {
        try {
            setLoading(true);
            if (section) {
                await adminApiService.updateSettingsSection(section, settings[section]);
            } else {
                await adminApiService.updateSystemSettings(settings);
            }
            setSuccess(section ? `${section} settings updated successfully` : 'All settings updated successfully');
            await fetchSystemSettings();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color = "blue", status }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-4 w-4 text-${color}-600`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {status && (
                    <Badge variant={status === 'healthy' ? 'default' : 'destructive'} className="mt-1">
                        {status}
                    </Badge>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">System Settings</h1>
                    <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => {
                        fetchSystemSettings();
                        fetchSystemHealth();
                    }}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        {error}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="ml-2"
                            onClick={() => setError(null)}
                        >
                            Dismiss
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                        {success}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="ml-2"
                            onClick={() => setSuccess(null)}
                        >
                            Dismiss
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* System Health Overview */}
            {systemHealth && (
                <div className="grid gap-4 md:grid-cols-4">
                    <StatCard
                        title="System Status"
                        value={systemHealth.status === 'healthy' ? 'Online' : 'Issues'}
                        icon={Activity}
                        color={systemHealth.status === 'healthy' ? 'green' : 'red'}
                        status={systemHealth.status}
                    />
                    <StatCard
                        title="Uptime"
                        value={`${systemHealth.uptime || 0}%`}
                        icon={Server}
                        color="blue"
                    />
                    <StatCard
                        title="CPU Usage"
                        value={`${systemHealth.performance?.cpu || 0}%`}
                        icon={Activity}
                        color={systemHealth.performance?.cpu > 80 ? 'red' : 'green'}
                    />
                    <StatCard
                        title="Memory Usage"
                        value={`${systemHealth.performance?.memory || 0}%`}
                        icon={Database}
                        color={systemHealth.performance?.memory > 80 ? 'red' : 'green'}
                    />
                </div>
            )}

            {/* Main Settings Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>Basic system configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="siteName">Site Name</Label>
                                    <Input
                                        id="siteName"
                                        value={settings.general.siteName}
                                        onChange={(e) => setSettings(prev => ({
                                            ...prev,
                                            general: { ...prev.general, siteName: e.target.value }
                                        }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="siteUrl">Site URL</Label>
                                    <Input
                                        id="siteUrl"
                                        value={settings.general.siteUrl}
                                        onChange={(e) => setSettings(prev => ({
                                            ...prev,
                                            general: { ...prev.general, siteUrl: e.target.value }
                                        }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="siteDescription">Site Description</Label>
                                <Textarea
                                    id="siteDescription"
                                    value={settings.general.siteDescription}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        general: { ...prev.general, siteDescription: e.target.value }
                                    }))}
                                />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <Select
                                        value={settings.general.timezone}
                                        onValueChange={(value) => setSettings(prev => ({
                                            ...prev,
                                            general: { ...prev.general, timezone: value }
                                        }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                                            <SelectItem value="America/New_York">America/New_York</SelectItem>
                                            <SelectItem value="Europe/London">Europe/London</SelectItem>
                                            <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="language">Language</Label>
                                    <Select
                                        value={settings.general.language}
                                        onValueChange={(value) => setSettings(prev => ({
                                            ...prev,
                                            general: { ...prev.general, language: value }
                                        }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="hi">Hindi</SelectItem>
                                            <SelectItem value="es">Spanish</SelectItem>
                                            <SelectItem value="fr">French</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="maintenanceMode"
                                        checked={settings.general.maintenanceMode}
                                        onCheckedChange={(checked) => setSettings(prev => ({
                                            ...prev,
                                            general: { ...prev.general, maintenanceMode: checked }
                                        }))}
                                    />
                                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="debugMode"
                                        checked={settings.general.debugMode}
                                        onCheckedChange={(checked) => setSettings(prev => ({
                                            ...prev,
                                            general: { ...prev.general, debugMode: checked }
                                        }))}
                                    />
                                    <Label htmlFor="debugMode">Debug Mode</Label>
                                </div>
                            </div>
                            <Button onClick={() => handleSettingsUpdate('general')} disabled={loading}>
                                <Save className="h-4 w-4 mr-2" />
                                Save General Settings
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                            <CardDescription>Configure security policies and authentication</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                                    <Input
                                        id="sessionTimeout"
                                        type="number"
                                        value={settings.security.sessionTimeout}
                                        onChange={(e) => setSettings(prev => ({
                                            ...prev,
                                            security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                                        }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                                    <Input
                                        id="maxLoginAttempts"
                                        type="number"
                                        value={settings.security.maxLoginAttempts}
                                        onChange={(e) => setSettings(prev => ({
                                            ...prev,
                                            security: { ...prev.security, maxLoginAttempts: parseInt(e.target.value) }
                                        }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="requireTwoFactor"
                                        checked={settings.security.requireTwoFactor}
                                        onCheckedChange={(checked) => setSettings(prev => ({
                                            ...prev,
                                            security: { ...prev.security, requireTwoFactor: checked }
                                        }))}
                                    />
                                    <Label htmlFor="requireTwoFactor">Require Two-Factor Authentication</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="enableAuditLogs"
                                        checked={settings.security.enableAuditLogs}
                                        onCheckedChange={(checked) => setSettings(prev => ({
                                            ...prev,
                                            security: { ...prev.security, enableAuditLogs: checked }
                                        }))}
                                    />
                                    <Label htmlFor="enableAuditLogs">Enable Audit Logs</Label>
                                </div>
                            </div>
                            <Button onClick={() => handleSettingsUpdate('security')} disabled={loading}>
                                <Shield className="h-4 w-4 mr-2" />
                                Save Security Settings
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Email Settings */}
                <TabsContent value="email" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Settings</CardTitle>
                            <CardDescription>Configure SMTP and email notifications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="smtpHost">SMTP Host</Label>
                                    <Input
                                        id="smtpHost"
                                        value={settings.email.smtpHost}
                                        onChange={(e) => setSettings(prev => ({
                                            ...prev,
                                            email: { ...prev.email, smtpHost: e.target.value }
                                        }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtpPort">SMTP Port</Label>
                                    <Input
                                        id="smtpPort"
                                        type="number"
                                        value={settings.email.smtpPort}
                                        onChange={(e) => setSettings(prev => ({
                                            ...prev,
                                            email: { ...prev.email, smtpPort: parseInt(e.target.value) }
                                        }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="enableEmailNotifications"
                                        checked={settings.email.enableEmailNotifications}
                                        onCheckedChange={(checked) => setSettings(prev => ({
                                            ...prev,
                                            email: { ...prev.email, enableEmailNotifications: checked }
                                        }))}
                                    />
                                    <Label htmlFor="enableEmailNotifications">Enable Email Notifications</Label>
                                </div>
                            </div>
                            <Button onClick={() => handleSettingsUpdate('email')} disabled={loading}>
                                <Mail className="h-4 w-4 mr-2" />
                                Save Email Settings
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Save All Settings */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-medium">Save All Settings</h3>
                            <p className="text-sm text-muted-foreground">
                                Save all configuration changes at once
                            </p>
                        </div>
                        <Button onClick={() => handleSettingsUpdate()} disabled={loading}>
                            <Save className="h-4 w-4 mr-2" />
                            Save All Settings
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SystemSettings;