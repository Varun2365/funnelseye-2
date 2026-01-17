import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { RefreshCw, Search, TrendingUp, Users, DollarSign, Target, Eye, BarChart3 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import axios from 'axios';

const PerformanceTrackingTab = () => {
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCoach, setSelectedCoach] = useState(null);
    const [performanceData, setPerformanceData] = useState(null);
    const [performanceType, setPerformanceType] = useState('coach');
    const [timeRange, setTimeRange] = useState('30');
    const { showToast } = useToast();

    // Fetch coaches for performance tracking
    const fetchCoaches = async () => {
        setLoading(true);
        try {
            // This would need to be implemented in the backend
            const response = await axios.get('/advanced-mlm/admin/coaches');
            if (response.data.success) {
                setCoaches(response.data.data.coaches || []);
            } else {
                showToast('Failed to fetch coaches', 'error');
            }
        } catch (error) {
            console.error('Error fetching coaches:', error);
            showToast('Error fetching coaches', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fetch performance data
    const fetchPerformanceData = async (coachId, type = 'coach') => {
        try {
            let endpoint = '';
            switch (type) {
                case 'coach':
                    endpoint = `/advanced-mlm/admin/coach-performance/${coachId}`;
                    break;
                case 'sales':
                    endpoint = `/advanced-mlm/admin/sales-performance/${coachId}`;
                    break;
                case 'clients':
                    endpoint = `/advanced-mlm/admin/client-performance/${coachId}`;
                    break;
                case 'leads':
                    endpoint = `/advanced-mlm/admin/lead-performance/${coachId}`;
                    break;
                default:
                    endpoint = `/advanced-mlm/admin/coach-performance/${coachId}`;
            }

            const response = await axios.get(endpoint, {
                params: { days: timeRange }
            });

            if (response.data.success) {
                setPerformanceData(response.data.data);
            } else {
                showToast('Failed to fetch performance data', 'error');
            }
        } catch (error) {
            console.error('Error fetching performance data:', error);
            showToast('Error fetching performance data', 'error');
        }
    };

    // Get performance metrics summary
    const getPerformanceSummary = (data) => {
        if (!data) return null;

        return {
            totalRevenue: data.totalRevenue || 0,
            totalCommissions: data.totalCommissions || 0,
            activeClients: data.activeClients || 0,
            newLeads: data.newLeads || 0,
            conversionRate: data.conversionRate || 0,
            teamSize: data.teamSize || 0
        };
    };

    // Filter coaches based on search
    const filteredCoaches = coaches.filter(coach =>
        coach.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coach.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchCoaches();
    }, []);

    const summary = getPerformanceSummary(performanceData);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Performance Tracking</h2>
                    <p className="text-muted-foreground">
                        Monitor coach performance, sales, clients, and team metrics
                    </p>
                </div>
                <Button onClick={fetchCoaches} disabled={loading} variant="outline">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="search">Search Coaches</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Search by coach name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="performanceType">Performance Type</Label>
                            <Select value={performanceType} onValueChange={setPerformanceType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select performance type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="coach">Coach Performance</SelectItem>
                                    <SelectItem value="sales">Sales Performance</SelectItem>
                                    <SelectItem value="clients">Client Performance</SelectItem>
                                    <SelectItem value="leads">Lead Performance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="timeRange">Time Range</Label>
                            <Select value={timeRange} onValueChange={setTimeRange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select time range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">Last 7 days</SelectItem>
                                    <SelectItem value="30">Last 30 days</SelectItem>
                                    <SelectItem value="90">Last 90 days</SelectItem>
                                    <SelectItem value="365">Last year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Coaches Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Coaches ({filteredCoaches.length})</CardTitle>
                    <CardDescription>
                        Click on a coach to view their performance metrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                            Loading coaches...
                        </div>
                    ) : filteredCoaches.length === 0 ? (
                        <Alert>
                            <Users className="h-4 w-4" />
                            <AlertDescription>
                                No coaches found matching your search criteria.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Coach</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead>Team Size</TableHead>
                                    <TableHead>Revenue</TableHead>
                                    <TableHead>Commissions</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCoaches.map((coach) => (
                                    <TableRow key={coach._id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{coach.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {coach.email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                Level {coach.currentLevel || 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {coach.teamSize || 0} members
                                        </TableCell>
                                        <TableCell>
                                            ${coach.totalRevenue || 0}
                                        </TableCell>
                                        <TableCell>
                                            ${coach.totalCommissions || 0}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedCoach(coach);
                                                    fetchPerformanceData(coach._id, performanceType);
                                                }}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View Performance
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Performance Details */}
            {selectedCoach && performanceData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Performance Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Summary</CardTitle>
                            <CardDescription>
                                Key metrics for {selectedCoach.name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-muted rounded-md">
                                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                    <div className="text-2xl font-bold">
                                        ${summary?.totalRevenue || 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Total Revenue
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-md">
                                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                                    <div className="text-2xl font-bold">
                                        ${summary?.totalCommissions || 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Total Commissions
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-md">
                                    <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                                    <div className="text-2xl font-bold">
                                        {summary?.activeClients || 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Active Clients
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-md">
                                    <Target className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                                    <div className="text-2xl font-bold">
                                        {summary?.newLeads || 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        New Leads
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detailed Performance Data */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Detailed Performance</CardTitle>
                            <CardDescription>
                                Complete performance breakdown
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label>Performance Type</Label>
                                    <Badge variant="outline" className="ml-2">
                                        {performanceType.charAt(0).toUpperCase() + performanceType.slice(1)}
                                    </Badge>
                                </div>
                                <div>
                                    <Label>Time Range</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Last {timeRange} days
                                    </div>
                                </div>
                                <div>
                                    <Label>Raw Data</Label>
                                    <div className="p-3 bg-muted rounded-md max-h-64 overflow-auto">
                                        <pre className="text-sm">
                                            {JSON.stringify(performanceData, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Performance Analytics */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance Analytics</CardTitle>
                    <CardDescription>
                        Overall system performance metrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-muted rounded-md">
                            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                            <div className="text-2xl font-bold">
                                {coaches.length}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Total Coaches
                            </div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-md">
                            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                            <div className="text-2xl font-bold">
                                {coaches.reduce((sum, coach) => sum + (coach.totalRevenue || 0), 0)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Total Revenue
                            </div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-md">
                            <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                            <div className="text-2xl font-bold">
                                {coaches.reduce((sum, coach) => sum + (coach.teamSize || 0), 0)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Total Team Members
                            </div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-md">
                            <DollarSign className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                            <div className="text-2xl font-bold">
                                {coaches.reduce((sum, coach) => sum + (coach.totalCommissions || 0), 0)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Total Commissions
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PerformanceTrackingTab;
