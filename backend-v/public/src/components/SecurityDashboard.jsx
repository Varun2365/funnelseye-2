import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';

const SecurityDashboard = () => {
    const [securitySettings, setSecuritySettings] = useState({});
    const [activeSessions, setActiveSessions] = useState([]);
    const [securityIncidents, setSecurityIncidents] = useState(null);
    const [threatSummary, setThreatSummary] = useState(null);
    const [complianceReport, setComplianceReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [timeRange, setTimeRange] = useState(30);
    const { showToast } = useToast();

    useEffect(() => {
        fetchAllData();
    }, [timeRange]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchSecuritySettings(),
                fetchActiveSessions(),
                fetchSecurityIncidents(),
                fetchThreatSummary(),
                fetchComplianceReport()
            ]);
        } catch (error) {
            console.error('Error fetching security data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSecuritySettings = async () => {
        try {
            const response = await axios.get('/api/admin/security/settings');
            setSecuritySettings(response.data.data);
        } catch (error) {
            console.error('Error fetching security settings:', error);
        }
    };

    const fetchActiveSessions = async () => {
        try {
            const response = await axios.get('/api/admin/security/active-sessions');
            setActiveSessions(response.data.data);
        } catch (error) {
            console.error('Error fetching active sessions:', error);
        }
    };

    const fetchSecurityIncidents = async () => {
        try {
            const response = await axios.get(`/api/admin/security/incidents?timeRange=${timeRange}`);
            setSecurityIncidents(response.data.data);
        } catch (error) {
            console.error('Error fetching security incidents:', error);
        }
    };

    const fetchThreatSummary = async () => {
        try {
            const response = await axios.get(`/api/admin/security/threat-summary?timeRange=${timeRange}`);
            setThreatSummary(response.data.data);
        } catch (error) {
            console.error('Error fetching threat summary:', error);
        }
    };

    const fetchComplianceReport = async () => {
        try {
            const response = await axios.get(`/api/admin/security/compliance?timeRange=${timeRange}`);
            setComplianceReport(response.data.data);
        } catch (error) {
            console.error('Error fetching compliance report:', error);
        }
    };

    const updateSecuritySettings = async () => {
        setSaving(true);
        try {
            const response = await axios.put('/api/admin/security/settings', securitySettings);
            showToast('Security settings updated successfully', 'success');
            await fetchSecuritySettings();
        } catch (error) {
            console.error('Error updating security settings:', error);
            showToast('Error updating security settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const terminateSession = async (sessionId) => {
        try {
            await axios.delete(`/api/admin/security/sessions/${sessionId}`);
            showToast('Session terminated successfully', 'success');
            await fetchActiveSessions();
        } catch (error) {
            console.error('Error terminating session:', error);
            showToast('Error terminating session', 'error');
        }
    };

    const getRiskLevelColor = (riskLevel) => {
        switch (riskLevel) {
            case 'critical': return 'destructive';
            case 'high': return 'destructive';
            case 'medium': return 'default';
            case 'low': return 'secondary';
            default: return 'secondary';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading security data...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage multi-factor authentication, monitor security threats, and ensure compliance
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="timeRange">Time Range:</Label>
                    <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(parseInt(value))}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="settings">Security Settings</TabsTrigger>
                    <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
                    <TabsTrigger value="incidents">Security Incidents</TabsTrigger>
                    <TabsTrigger value="threats">Threat Detection</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    <Badge variant={getRiskLevelColor(threatSummary?.riskLevel)}>
                                        {threatSummary?.riskLevel?.toUpperCase() || 'MINIMAL'}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Current threat level
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    {threatSummary?.failedLogins || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Last {timeRange} days
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {activeSessions.length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Current sessions
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {complianceReport?.complianceScore || 0}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Overall compliance
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Configuration</CardTitle>
                            <CardDescription>
                                Configure password policies, session settings, and API security
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="minLength">Minimum Password Length</Label>
                                    <Input
                                        id="minLength"
                                        type="number"
                                        min="8"
                                        max="128"
                                        value={securitySettings.passwordPolicy?.minLength || 8}
                                        onChange={(e) => 
                                            setSecuritySettings({
                                                ...securitySettings,
                                                passwordPolicy: {
                                                    ...securitySettings.passwordPolicy,
                                                    minLength: parseInt(e.target.value)
                                                }
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                                    <Input
                                        id="sessionTimeout"
                                        type="number"
                                        min="5"
                                        max="1440"
                                        value={securitySettings.sessionSettings?.timeout || 30}
                                        onChange={(e) => 
                                            setSecuritySettings({
                                                ...securitySettings,
                                                sessionSettings: {
                                                    ...securitySettings.sessionSettings,
                                                    timeout: parseInt(e.target.value)
                                                }
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="requireUppercase"
                                        checked={securitySettings.passwordPolicy?.requireUppercase || false}
                                        onCheckedChange={(checked) => 
                                            setSecuritySettings({
                                                ...securitySettings,
                                                passwordPolicy: {
                                                    ...securitySettings.passwordPolicy,
                                                    requireUppercase: checked
                                                }
                                            })
                                        }
                                    />
                                    <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="requireNumbers"
                                        checked={securitySettings.passwordPolicy?.requireNumbers || false}
                                        onCheckedChange={(checked) => 
                                            setSecuritySettings({
                                                ...securitySettings,
                                                passwordPolicy: {
                                                    ...securitySettings.passwordPolicy,
                                                    requireNumbers: checked
                                                }
                                            })
                                        }
                                    />
                                    <Label htmlFor="requireNumbers">Require Numbers</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="requireSpecialChars"
                                        checked={securitySettings.passwordPolicy?.requireSpecialChars || false}
                                        onCheckedChange={(checked) => 
                                            setSecuritySettings({
                                                ...securitySettings,
                                                passwordPolicy: {
                                                    ...securitySettings.passwordPolicy,
                                                    requireSpecialChars: checked
                                                }
                                            })
                                        }
                                    />
                                    <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button onClick={updateSecuritySettings} disabled={saving}>
                                    {saving ? "Saving..." : "Save Security Settings"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sessions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Sessions</CardTitle>
                            <CardDescription>
                                Monitor and manage active admin sessions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {activeSessions.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Admin</TableHead>
                                            <TableHead>IP Address</TableHead>
                                            <TableHead>User Agent</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead>Last Activity</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activeSessions.map((session) => (
                                            <TableRow key={session.id}>
                                                <TableCell className="font-medium">
                                                    {session.adminEmail}
                                                </TableCell>
                                                <TableCell>{session.ipAddress}</TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {session.userAgent}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(session.createdAt).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(session.lastActivity).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => terminateSession(session.id)}
                                                    >
                                                        Terminate
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No active sessions
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="incidents" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Incidents</CardTitle>
                            <CardDescription>
                                Monitor security-related events and incidents
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {securityIncidents ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">
                                                {securityIncidents.incidents?.failedLogins?.length || 0}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Failed Logins</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-600">
                                                {securityIncidents.incidents?.suspiciousActivity?.length || 0}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Suspicious Activity</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-yellow-600">
                                                {securityIncidents.incidents?.unauthorizedAccess?.length || 0}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Unauthorized Access</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Recent Incidents</h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Admin</TableHead>
                                                    <TableHead>Action</TableHead>
                                                    <TableHead>Category</TableHead>
                                                    <TableHead>Severity</TableHead>
                                                    <TableHead>Timestamp</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {securityIncidents.incidents?.failedLogins?.slice(0, 10).map((incident) => (
                                                    <TableRow key={incident._id}>
                                                        <TableCell className="font-medium">
                                                            {incident.adminId?.firstName} {incident.adminId?.lastName}
                                                        </TableCell>
                                                        <TableCell>{incident.action}</TableCell>
                                                        <TableCell>{incident.category}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={incident.severity === 'high' ? 'destructive' : 'secondary'}>
                                                                {incident.severity}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(incident.createdAt).toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No security incidents data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="threats" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Threat Detection Summary</CardTitle>
                            <CardDescription>
                                Real-time threat monitoring and risk assessment
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {threatSummary ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">
                                                {threatSummary.failedLogins || 0}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Failed Login Attempts</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-600">
                                                {threatSummary.suspiciousIPs?.length || 0}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Suspicious IPs</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-yellow-600">
                                                {threatSummary.unusualAccess || 0}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Unusual Access Patterns</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Suspicious IP Addresses</h3>
                                        {threatSummary.suspiciousIPs?.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>IP Address</TableHead>
                                                        <TableHead>Failed Attempts</TableHead>
                                                        <TableHead>Last Attempt</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {threatSummary.suspiciousIPs.map((ip) => (
                                                        <TableRow key={ip._id}>
                                                            <TableCell className="font-medium">{ip._id}</TableCell>
                                                            <TableCell>{ip.attempts}</TableCell>
                                                            <TableCell>
                                                                {new Date(ip.lastAttempt).toLocaleString()}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="text-center text-muted-foreground py-4">
                                                No suspicious IP addresses detected
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No threat detection data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Compliance Report</CardTitle>
                            <CardDescription>
                                GDPR/DPDP compliance and security standards monitoring
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {complianceReport ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {complianceReport.complianceScore || 0}%
                                            </div>
                                            <div className="text-sm text-muted-foreground">Overall Compliance Score</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">
                                                {complianceReport.dataAccessLogs || 0}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Data Access Logs</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Security Metrics</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>MFA Adoption</Label>
                                                <div className="text-lg font-semibold">
                                                    {complianceReport.securityMetrics?.mfaAdoption || 0} / {complianceReport.securityMetrics?.totalAdmins || 0}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Password Policy Compliance</Label>
                                                <div className="text-lg font-semibold text-green-600">
                                                    {complianceReport.securityMetrics?.passwordPolicyCompliance || 0}%
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Session Timeout Compliance</Label>
                                                <div className="text-lg font-semibold text-green-600">
                                                    {complianceReport.securityMetrics?.sessionTimeoutCompliance || 0}%
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Audit Logging</Label>
                                                <div className="text-lg font-semibold text-green-600">
                                                    {complianceReport.securityMetrics?.auditLoggingEnabled ? 'Enabled' : 'Disabled'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No compliance data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SecurityDashboard;
