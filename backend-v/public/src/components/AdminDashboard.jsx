import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
    Users,
    DollarSign,
    TrendingUp,
    Activity,
    Shield,
    Settings,
    AlertTriangle,
    CheckCircle,
    Clock,
    BarChart3,
    PieChart,
    Download,
    RefreshCw,
    CreditCard,
    UserPlus,
    List,
    Send,
    Eye,
    Play,
    MessageSquare,
    MessageCircle,
    Timer
} from 'lucide-react';
import adminApiService from '../services/adminApiService';

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [systemHealth, setSystemHealth] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Send Message Dialog State
    const [sendMessageDialogOpen, setSendMessageDialogOpen] = useState(false);
    const [messagingChannels, setMessagingChannels] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [sendMessageForm, setSendMessageForm] = useState({
        channelId: '',
        templateId: '',
        message: '',
        recipient: '',
        delay: 0
    });
    const [sendingMessage, setSendingMessage] = useState(false);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [dashboard, health, analyticsData] = await Promise.all([
                adminApiService.getDashboard(),
                adminApiService.getSystemHealth(),
                adminApiService.getSystemAnalytics()
            ]);

            setDashboardData(dashboard.data);
            setSystemHealth(health.data);
            setAnalytics(analyticsData.data);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        
        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const StatCard = ({ title, value, change, icon: Icon, color = "blue" }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-4 w-4 text-${color}-600`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {change && (
                    <p className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change > 0 ? '+' : ''}{change}% from last month
                    </p>
                )}
            </CardContent>
        </Card>
    );

    // Send Message Functions
    const loadMessagingChannels = async () => {
        try {
            const response = await fetch('/api/messaging/v3/channels', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            const result = await response.json();
            if (result.success) {
                setMessagingChannels(result.data);
            }
        } catch (error) {
            console.error('Error loading messaging channels:', error);
        }
    };

    const loadTemplates = async (channelId) => {
        if (!channelId) return;

        try {
            const channel = messagingChannels.find(c => c._id === channelId);
            if (channel && channel.type === 'whatsapp_api') {
                const response = await fetch('/api/messaging/whatsapp/templates', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });
                const result = await response.json();
                if (result.success) {
                    setTemplates(result.data);
                }
            } else {
                setTemplates([]);
            }
        } catch (error) {
            console.error('Error loading templates:', error);
            setTemplates([]);
        }
    };

    const handleSendMessage = async () => {
        try {
            setSendingMessage(true);

            const response = await fetch('/api/admin/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(sendMessageForm)
            });

            const result = await response.json();

            if (result.success) {
                setSendMessageDialogOpen(false);
                setSendMessageForm({
                    channelId: '',
                    templateId: '',
                    message: '',
                    recipient: '',
                    delay: 0
                });
                alert('Message queued successfully!');
            } else {
                alert('Error queuing message: ' + result.message);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Error sending message: ' + error.message);
        } finally {
            setSendingMessage(false);
        }
    };

    const handleChannelChange = (channelId) => {
        setSendMessageForm(prev => ({
            ...prev,
            channelId,
            templateId: '' // Reset template when channel changes
        }));
        loadTemplates(channelId);
    };

    const HealthIndicator = ({ status, label }) => {
        const getStatusColor = (status) => {
            switch (status) {
                case 'healthy': return 'text-green-600';
                case 'warning': return 'text-yellow-600';
                case 'error': return 'text-red-600';
                default: return 'text-gray-600';
            }
        };

        const getStatusIcon = (status) => {
            switch (status) {
                case 'healthy': return <CheckCircle className="h-4 w-4" />;
                case 'warning': return <AlertTriangle className="h-4 w-4" />;
                case 'error': return <AlertTriangle className="h-4 w-4" />;
                default: return <Clock className="h-4 w-4" />;
            }
        };

        return (
            <div className="flex items-center space-x-2">
                {getStatusIcon(status)}
                <span className={`text-sm ${getStatusColor(status)}`}>{label}</span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading dashboard...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    Error loading dashboard: {error}
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-2"
                        onClick={fetchDashboardData}
                    >
                        Retry
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Dialog open={sendMessageDialogOpen} onOpenChange={setSendMessageDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => {
                                loadMessagingChannels();
                                setSendMessageDialogOpen(true);
                            }}>
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Send Message
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Send Message</DialogTitle>
                                <DialogDescription>
                                    Send a message through one of your messaging channels
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="channel" className="text-right">
                                        Channel
                                    </Label>
                                    <Select value={sendMessageForm.channelId} onValueChange={handleChannelChange}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select a channel" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {messagingChannels.map(channel => (
                                                <SelectItem key={channel._id} value={channel._id}>
                                                    {channel.name} ({channel.type})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {templates.length > 0 && (
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="template" className="text-right">
                                            Template
                                        </Label>
                                        <Select
                                            value={sendMessageForm.templateId}
                                            onValueChange={(value) => setSendMessageForm(prev => ({ ...prev, templateId: value }))}
                                        >
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Select a template (optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {templates.map(template => (
                                                    <SelectItem key={template.id} value={template.id}>
                                                        {template.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="recipient" className="text-right">
                                        Recipient
                                    </Label>
                                    <Input
                                        id="recipient"
                                        placeholder="Phone number (e.g., +1234567890)"
                                        className="col-span-3"
                                        value={sendMessageForm.recipient}
                                        onChange={(e) => setSendMessageForm(prev => ({ ...prev, recipient: e.target.value }))}
                                    />
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="message" className="text-right">
                                        Message
                                    </Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Enter your message..."
                                        className="col-span-3"
                                        rows={4}
                                        value={sendMessageForm.message}
                                        onChange={(e) => setSendMessageForm(prev => ({ ...prev, message: e.target.value }))}
                                    />
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="delay" className="text-right">
                                        Delay (sec)
                                    </Label>
                                    <Input
                                        id="delay"
                                        type="number"
                                        placeholder="0"
                                        className="col-span-3"
                                        value={sendMessageForm.delay}
                                        onChange={(e) => setSendMessageForm(prev => ({ ...prev, delay: parseInt(e.target.value) || 0 }))}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    onClick={handleSendMessage}
                                    disabled={sendingMessage || !sendMessageForm.channelId || !sendMessageForm.message || !sendMessageForm.recipient}
                                >
                                    {sendingMessage ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Queuing...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Send Message
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button variant="outline" onClick={fetchDashboardData}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={() => adminApiService.exportSystemAnalytics()}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                    </Button>
                </div>
            </div>

            {/* System Health Alert */}
            {systemHealth && systemHealth.status !== 'healthy' && (
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        System health status: <Badge variant="destructive">{systemHealth.status}</Badge>
                        {systemHealth.message && ` - ${systemHealth.message}`}
                    </AlertDescription>
                </Alert>
            )}

            {/* Main Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value={dashboardData?.users?.total || 0}
                    change={dashboardData?.users?.growth}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Active Coaches"
                    value={dashboardData?.coaches?.active || 0}
                    change={dashboardData?.coaches?.growth}
                    icon={Users}
                    color="green"
                />
                <StatCard
                    title="Monthly Revenue"
                    value={`₹${dashboardData?.revenue?.monthly || 0}`}
                    change={dashboardData?.revenue?.growth}
                    icon={DollarSign}
                    color="green"
                />
                <StatCard
                    title="System Uptime"
                    value={`${systemHealth?.uptime || 0}%`}
                    icon={Activity}
                    color="blue"
                />
            </div>

            {/* Detailed Analytics */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="financial">Financial</TabsTrigger>
                    <TabsTrigger value="system">System</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Latest system events</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {dashboardData?.recentActivity?.map((activity, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <div className={`w-2 h-2 rounded-full ${
                                                activity.type === 'success' ? 'bg-green-500' :
                                                activity.type === 'warning' ? 'bg-yellow-500' :
                                                'bg-red-500'
                                            }`} />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{activity.message}</p>
                                                <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* System Health */}
                        <Card>
                            <CardHeader>
                                <CardTitle>System Health</CardTitle>
                                <CardDescription>Current system status</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <HealthIndicator 
                                    status={systemHealth?.database?.status} 
                                    label="Database" 
                                />
                                <HealthIndicator 
                                    status={systemHealth?.api?.status} 
                                    label="API Services" 
                                />
                                <HealthIndicator 
                                    status={systemHealth?.payment?.status} 
                                    label="Payment Gateway" 
                                />
                                <HealthIndicator 
                                    status={systemHealth?.storage?.status} 
                                    label="File Storage" 
                                />
                                
                                {systemHealth?.performance && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>CPU Usage</span>
                                            <span>{systemHealth.performance.cpu}%</span>
                                        </div>
                                        <Progress value={systemHealth.performance.cpu} />
                                        
                                        <div className="flex justify-between text-sm">
                                            <span>Memory Usage</span>
                                            <span>{systemHealth.performance.memory}%</span>
                                        </div>
                                        <Progress value={systemHealth.performance.memory} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Performance Metrics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Metrics</CardTitle>
                                <CardDescription>System performance indicators</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span>Response Time</span>
                                        <Badge variant="outline">{analytics?.performance?.responseTime || 'N/A'}ms</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Error Rate</span>
                                        <Badge variant={analytics?.performance?.errorRate > 5 ? 'destructive' : 'outline'}>
                                            {analytics?.performance?.errorRate || 'N/A'}%
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Growth */}
                        <Card>
                            <CardHeader>
                                <CardTitle>User Growth</CardTitle>
                                <CardDescription>User registration trends</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span>New Users (24h)</span>
                                        <Badge variant="outline">{analytics?.users?.newToday || 0}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>New Users (7d)</span>
                                        <Badge variant="outline">{analytics?.users?.newThisWeek || 0}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Active Users</span>
                                        <Badge variant="outline">{analytics?.users?.active || 0}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-6">
                    {/* Financial Overview Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{analytics?.financial?.revenue || 0}</div>
                                <p className="text-xs text-muted-foreground">This month</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Platform Fee</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{analytics?.financial?.platformFee || 0}</div>
                                <p className="text-xs text-muted-foreground">This month</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{analytics?.financial?.payouts || 0}</div>
                                <p className="text-xs text-muted-foreground">This month</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analytics?.financial?.transactions || 0}</div>
                                <p className="text-xs text-muted-foreground">This month</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payment Management Actions */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Razorpay Setup & Configuration */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Razorpay Configuration
                                </CardTitle>
                                <CardDescription>Manage payment gateway settings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Gateway Status</span>
                                    <Badge variant={analytics?.payment?.razorpayStatus === 'active' ? 'default' : 'destructive'}>
                                        {analytics?.payment?.razorpayStatus || 'Inactive'}
                                    </Badge>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="flex-1">
                                        <Settings className="h-4 w-4 mr-1" />
                                        Configure
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1">
                                        <RefreshCw className="h-4 w-4 mr-1" />
                                        Test Connection
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Coach Payment Setup */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Coach Payment Setup
                                </CardTitle>
                                <CardDescription>Manage coach payment methods</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Coaches Configured</span>
                                    <Badge variant="outline">{analytics?.coaches?.configured || 0}</Badge>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="flex-1">
                                        <UserPlus className="h-4 w-4 mr-1" />
                                        Setup Coach
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1">
                                        <List className="h-4 w-4 mr-1" />
                                        View All
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payout Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Payout Management
                            </CardTitle>
                            <CardDescription>Process and manage coach payouts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                {/* Single Payout */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm">Single Payout</h4>
                                    <p className="text-xs text-muted-foreground">Send payout to individual coach</p>
                                    <Button size="sm" className="w-full">
                                        <Send className="h-4 w-4 mr-1" />
                                        Process Single Payout
                                    </Button>
                                </div>

                                {/* Monthly Payouts */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm">Monthly Payouts</h4>
                                    <p className="text-xs text-muted-foreground">Process all pending monthly payouts</p>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="flex-1">
                                            <Eye className="h-4 w-4 mr-1" />
                                            Preview
                                        </Button>
                                        <Button size="sm" className="flex-1">
                                            <Play className="h-4 w-4 mr-1" />
                                            Execute
                                        </Button>
                                    </div>
                                </div>

                                {/* MLM Commission Payouts */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm">MLM Commission Payouts</h4>
                                    <p className="text-xs text-muted-foreground">Process MLM commission payouts</p>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="flex-1">
                                            <TrendingUp className="h-4 w-4 mr-1" />
                                            Preview
                                        </Button>
                                        <Button size="sm" className="flex-1">
                                            <Play className="h-4 w-4 mr-1" />
                                            Execute
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Payment Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Recent Payment Activity
                            </CardTitle>
                            <CardDescription>Latest payment transactions and payouts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {dashboardData?.recentPayments?.map((payment, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-2 h-2 rounded-full ${
                                                payment.status === 'success' ? 'bg-green-500' :
                                                payment.status === 'pending' ? 'bg-yellow-500' :
                                                'bg-red-500'
                                            }`} />
                                            <div>
                                                <p className="text-sm font-medium">{payment.description}</p>
                                                <p className="text-xs text-muted-foreground">{payment.timestamp}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">₹{payment.amount}</p>
                                            <Badge variant={payment.status === 'success' ? 'default' : 'secondary'}>
                                                {payment.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="system" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>System Resources</CardTitle>
                                <CardDescription>Server resource usage</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>CPU Usage</span>
                                            <span>{systemHealth?.performance?.cpu || 0}%</span>
                                        </div>
                                        <Progress value={systemHealth?.performance?.cpu || 0} />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Memory Usage</span>
                                            <span>{systemHealth?.performance?.memory || 0}%</span>
                                        </div>
                                        <Progress value={systemHealth?.performance?.memory || 0} />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Disk Usage</span>
                                            <span>{systemHealth?.performance?.disk || 0}%</span>
                                        </div>
                                        <Progress value={systemHealth?.performance?.disk || 0} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>System Information</CardTitle>
                                <CardDescription>Server details</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Server Time</span>
                                        <span className="text-sm">{new Date().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Uptime</span>
                                        <span className="text-sm">{systemHealth?.uptime || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Version</span>
                                        <span className="text-sm">{systemHealth?.version || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Environment</span>
                                        <Badge variant="outline">{systemHealth?.environment || 'N/A'}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminDashboard;
