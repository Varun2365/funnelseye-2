import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { 
    Users, 
    TrendingUp, 
    DollarSign, 
    BarChart3, 
    Settings, 
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    Clock,
    UserPlus,
    Download,
    Eye,
    Edit,
    Trash2,
    Network,
    Target,
    Award
} from 'lucide-react';
import adminApiService from '../services/adminApiService';

const MlmManagement = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // MLM Settings
    const [mlmSettings, setMlmSettings] = useState({
        commissionStructure: {
            level1: 5,
            level2: 3,
            level3: 2,
            level4: 1,
            level5: 0.5,
            level6: 0.3,
            level7: 0.2,
            level8: 0.1,
            level9: 0.05,
            level10: 0.02
        },
        eligibilityRules: {
            minimumSubscriptionAmount: 1000,
            qualificationPeriod: 30,
            activeStatusRequired: true
        }
    });
    
    // Hierarchy Management
    const [hierarchy, setHierarchy] = useState([]);
    const [selectedCoach, setSelectedCoach] = useState(null);
    const [hierarchyData, setHierarchyData] = useState(null);
    
    // Commission Analytics
    const [analytics, setAnalytics] = useState(null);
    const [commissionPeriod, setCommissionPeriod] = useState('2024-01');

    const fetchMlmSettings = async () => {
        try {
            const response = await adminApiService.getMlmSettings();
            setMlmSettings(response.data);
        } catch (err) {
            console.error('Failed to fetch MLM settings:', err);
        }
    };

    const fetchMlmAnalytics = async () => {
        try {
            const response = await adminApiService.getMlmAnalytics();
            setAnalytics(response.data);
        } catch (err) {
            console.error('Failed to fetch MLM analytics:', err);
        }
    };

    const fetchHierarchy = async () => {
        try {
            const response = await adminApiService.getMlmHierarchy();
            setHierarchy(response.data);
        } catch (err) {
            console.error('Failed to fetch hierarchy:', err);
        }
    };

    useEffect(() => {
        fetchMlmSettings();
        fetchMlmAnalytics();
        fetchHierarchy();
    }, []);

    const handleMlmSettingsUpdate = async () => {
        try {
            setLoading(true);
            await adminApiService.updateMlmSettings(mlmSettings);
            setSuccess('MLM settings updated successfully');
            await fetchMlmSettings();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleHierarchyUpdate = async () => {
        try {
            setLoading(true);
            await adminApiService.updateMlmHierarchy(hierarchyData);
            setSuccess('Hierarchy updated successfully');
            await fetchHierarchy();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color = "blue", change }) => (
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

    const getStatusBadge = (status) => {
        const variants = {
            active: 'default',
            inactive: 'secondary',
            suspended: 'destructive',
            pending: 'outline'
        };

        const colors = {
            active: 'text-green-600',
            inactive: 'text-gray-600',
            suspended: 'text-red-600',
            pending: 'text-yellow-600'
        };

        return (
            <Badge variant={variants[status] || 'outline'} className={colors[status]}>
                {status}
            </Badge>
        );
    };

    const renderHierarchyTree = (coaches, level = 0) => {
        return coaches.map((coach, index) => (
            <div key={coach._id} className="ml-4">
                <div className="flex items-center space-x-2 py-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">{coach.name}</span>
                    <Badge variant="outline" className="text-xs">
                        Level {level + 1}
                    </Badge>
                    {getStatusBadge(coach.status)}
                </div>
                {coach.downline && coach.downline.length > 0 && (
                    <div className="ml-4">
                        {renderHierarchyTree(coach.downline, level + 1)}
                    </div>
                )}
            </div>
        ));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">MLM Management</h1>
                    <p className="text-muted-foreground">Manage MLM hierarchy, commissions, and analytics</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => {
                        fetchMlmSettings();
                        fetchMlmAnalytics();
                        fetchHierarchy();
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

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
                    <TabsTrigger value="commissions">Commissions</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-4">
                        <StatCard
                            title="Total Coaches"
                            value={analytics?.totalCoaches || 0}
                            icon={Users}
                            color="blue"
                            change={analytics?.coachesGrowth}
                        />
                        <StatCard
                            title="Active Networks"
                            value={analytics?.activeNetworks || 0}
                            icon={Network}
                            color="green"
                            change={analytics?.networksGrowth}
                        />
                        <StatCard
                            title="Total Commissions"
                            value={`₹${analytics?.totalCommissions || 0}`}
                            icon={DollarSign}
                            color="purple"
                            change={analytics?.commissionsGrowth}
                        />
                        <StatCard
                            title="Avg Commission"
                            value={`₹${analytics?.avgCommission || 0}`}
                            icon={Award}
                            color="orange"
                            change={analytics?.avgCommissionGrowth}
                        />
                    </div>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent MLM Activity</CardTitle>
                            <CardDescription>Latest hierarchy changes and commission events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {analytics?.recentActivity?.map((activity, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <div className={`w-2 h-2 rounded-full ${
                                            activity.type === 'commission' ? 'bg-green-500' :
                                            activity.type === 'hierarchy' ? 'bg-blue-500' :
                                            'bg-yellow-500'
                                        }`} />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{activity.message}</p>
                                            <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {activity.type}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Commission Structure</CardTitle>
                            <CardDescription>Configure commission percentages for each level</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                {Object.entries(mlmSettings.commissionStructure).map(([level, percentage]) => (
                                    <div key={level} className="space-y-2">
                                        <Label htmlFor={level}>{level.replace('level', 'Level ')}</Label>
                                        <div className="flex space-x-2">
                                        <Input
                                            id={level}
                                            type="number"
                                                step="0.01"
                                            value={percentage}
                                                onChange={(e) => setMlmSettings(prev => ({
                                                    ...prev,
                                                    commissionStructure: {
                                                        ...prev.commissionStructure,
                                                    [level]: parseFloat(e.target.value)
                                            }
                                                }))}
                                                placeholder="0"
                                        />
                                            <span className="flex items-center text-sm text-muted-foreground">%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button onClick={handleMlmSettingsUpdate} disabled={loading}>
                                <Settings className="h-4 w-4 mr-2" />
                                Update Commission Structure
                                </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Eligibility Rules</CardTitle>
                            <CardDescription>Set rules for commission eligibility</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="minSubscription">Minimum Subscription Amount (₹)</Label>
                                    <Input
                                        id="minSubscription"
                                        type="number"
                                        value={mlmSettings.eligibilityRules.minimumSubscriptionAmount}
                                        onChange={(e) => setMlmSettings(prev => ({
                                            ...prev,
                                            eligibilityRules: {
                                                ...prev.eligibilityRules,
                                                minimumSubscriptionAmount: parseFloat(e.target.value)
                                            }
                                        }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="qualificationPeriod">Qualification Period (days)</Label>
                                    <Input
                                        id="qualificationPeriod"
                                        type="number"
                                        value={mlmSettings.eligibilityRules.qualificationPeriod}
                                        onChange={(e) => setMlmSettings(prev => ({
                                            ...prev,
                                            eligibilityRules: {
                                                ...prev.eligibilityRules,
                                                qualificationPeriod: parseInt(e.target.value)
                                            }
                                        }))}
                                    />
                                </div>
                                </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="activeStatusRequired"
                                    checked={mlmSettings.eligibilityRules.activeStatusRequired}
                                    onChange={(e) => setMlmSettings(prev => ({
                                        ...prev,
                                        eligibilityRules: {
                                            ...prev.eligibilityRules,
                                            activeStatusRequired: e.target.checked
                                        }
                                    }))}
                                />
                                <Label htmlFor="activeStatusRequired">Active status required for commissions</Label>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Hierarchy Tab */}
                <TabsContent value="hierarchy" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>MLM Hierarchy</CardTitle>
                            <CardDescription>View and manage the coach hierarchy structure</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex space-x-2">
                                    <Input
                                        placeholder="Search coaches..."
                                        className="flex-1"
                                    />
                                    <Button variant="outline">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Add Coach
                                    </Button>
                                        </div>

                                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                                    {hierarchy.length > 0 ? (
                                        renderHierarchyTree(hierarchy)
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Network className="h-12 w-12 mx-auto mb-4" />
                                            <p>No hierarchy data available</p>
                                        </div>
                                    )}
                                        </div>
                                    </div>
                        </CardContent>
                    </Card>

                    {/* Hierarchy Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Hierarchy Management</CardTitle>
                            <CardDescription>Manage coach relationships and hierarchy changes</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="coachId">Coach ID</Label>
                                    <Input
                                        id="coachId"
                                        placeholder="Enter coach ID"
                                        value={selectedCoach || ''}
                                        onChange={(e) => setSelectedCoach(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sponsorId">New Sponsor ID</Label>
                                    <Input
                                        id="sponsorId"
                                        placeholder="Enter sponsor ID"
                                    />
                                    </div>
                                </div>
                            <div className="space-y-2">
                                <Label htmlFor="changeReason">Reason for Change</Label>
                                <Textarea
                                    id="changeReason"
                                    placeholder="Explain the reason for this hierarchy change..."
                                />
                                </div>
                            <Button onClick={handleHierarchyUpdate} disabled={loading}>
                                <Edit className="h-4 w-4 mr-2" />
                                Update Hierarchy
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Commissions Tab */}
                <TabsContent value="commissions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Commission Management</CardTitle>
                            <CardDescription>View and manage commission calculations</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex space-x-2">
                                <Input
                                    placeholder="Period (YYYY-MM)"
                                    value={commissionPeriod}
                                    onChange={(e) => setCommissionPeriod(e.target.value)}
                                />
                                <Button variant="outline">
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Calculate Commissions
                                </Button>
                                <Button>
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Process Payouts
                                </Button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <StatCard
                                    title="Pending Commissions"
                                    value="₹12,345"
                                    icon={Clock}
                                    color="yellow"
                                />
                                <StatCard
                                    title="Processed This Month"
                                    value="₹45,678"
                                    icon={CheckCircle}
                                    color="green"
                                />
                                <StatCard
                                    title="Total Commissions"
                                    value="₹78,901"
                                    icon={DollarSign}
                                    color="blue"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Commission Details Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Commission Details</CardTitle>
                            <CardDescription>Detailed commission breakdown by level</CardDescription>
                        </CardHeader>
                        <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Coach</TableHead>
                                                <TableHead>Level</TableHead>
                                        <TableHead>Base Amount</TableHead>
                                        <TableHead>Percentage</TableHead>
                                        <TableHead>Commission</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                    {analytics?.commissionDetails?.map((commission, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{commission.coachName}</TableCell>
                                                    <TableCell>
                                                <Badge variant="outline">Level {commission.level}</Badge>
                                                    </TableCell>
                                            <TableCell>₹{commission.baseAmount}</TableCell>
                                            <TableCell>{commission.percentage}%</TableCell>
                                            <TableCell>₹{commission.commissionAmount}</TableCell>
                                                    <TableCell>
                                                {getStatusBadge(commission.status)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Metrics</CardTitle>
                                <CardDescription>Key MLM performance indicators</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Conversion Rate</span>
                                    <Badge variant="outline">{analytics?.conversionRate || 'N/A'}%</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Retention Rate</span>
                                    <Badge variant="outline">{analytics?.retentionRate || 'N/A'}%</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Avg Network Size</span>
                                    <Badge variant="outline">{analytics?.avgNetworkSize || 'N/A'}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Top Performer</span>
                                    <Badge variant="outline">{analytics?.topPerformer || 'N/A'}</Badge>
                                </div>
                            </CardContent>
                        </Card>

                    <Card>
                        <CardHeader>
                                <CardTitle>Growth Trends</CardTitle>
                                <CardDescription>MLM growth and expansion trends</CardDescription>
                        </CardHeader>
                        <CardContent>
                                <div className="text-center py-8 text-muted-foreground">
                                    <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                                    <p>Growth trend charts will be displayed here</p>
                                    <p className="text-sm">Integration with charting library needed</p>
                                </div>
                            </CardContent>
                        </Card>
                                                        </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Commission Analytics</CardTitle>
                            <CardDescription>Detailed commission analysis and trends</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                                <p>Commission analytics charts will be displayed here</p>
                                <p className="text-sm">Integration with charting library needed</p>
                                </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MlmManagement;
