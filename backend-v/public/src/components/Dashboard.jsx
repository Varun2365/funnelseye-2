import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Users,
  CreditCard,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Server,
  Database,
  Zap,
  Shield,
  RefreshCw,
  BarChart3,
  Target,
  MessageSquare,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Funnel,
  Trophy,
  Settings,
  PlayCircle,
  PauseCircle,
  MoreHorizontal
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import adminApiService from '../services/adminApiService';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [funnelData, setFunnelData] = useState(null);
  const [coachData, setCoachData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [systemHealthLoading, setSystemHealthLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log('📊 [DASHBOARD] Fetching all dashboard data...');

      const [
        dashboardResponse,
        systemHealthResponse,
        financialResponse,
        revenueTrendsResponse,
        topCoachesResponse
      ] = await Promise.allSettled([
        adminApiService.getDashboard(),
        adminApiService.getSystemHealth(),
        adminApiService.getFinancialDashboard(),
        adminApiService.getRevenueTrends(),
        adminApiService.getTopPerformingCoaches()
      ]);

      if (dashboardResponse.status === 'fulfilled') {
        setDashboardData(dashboardResponse.value.data);
      }

      if (systemHealthResponse.status === 'fulfilled') {
        setSystemHealth(systemHealthResponse.value.data);
      }

      if (financialResponse.status === 'fulfilled') {
        setFinancialData(financialResponse.value.data);
      }

      if (revenueTrendsResponse.status === 'fulfilled') {
        setFunnelData(revenueTrendsResponse.value.data); // Reusing funnelData for revenue trends
      }

      if (topCoachesResponse.status === 'fulfilled') {
        setCoachData(topCoachesResponse.value.data);
      }

    } catch (error) {
      console.error('📊 [DASHBOARD] Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setError('');
    fetchAllData();
  };

  const handleSystemHealthRefresh = async () => {
    try {
      setSystemHealthLoading(true);
      const response = await adminApiService.getSystemHealth();
      setSystemHealth(response.data);
    } catch (error) {
      console.error('Error refreshing system health:', error);
    } finally {
      setSystemHealthLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 animate-pulse mb-2"></div>
                <div className="h-3 bg-muted rounded w-32 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
            <Button onClick={handleRefresh} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = dashboardData?.overview || {};
  const systemHealthData = systemHealth || {};
  const recentActivity = dashboardData?.recentActivity || [];
  const performanceMetrics = dashboardData?.performanceMetrics || {};

  // Number formatting function with k/M suffixes
  const formatCompactNumber = (num) => {
    if (num === 0) return '0';
    if (num < 1000) return num.toString();

    const suffixes = ['', 'k', 'M', 'B', 'T'];
    let suffixIndex = 0;
    let formattedNum = num;

    while (formattedNum >= 1000 && suffixIndex < suffixes.length - 1) {
      formattedNum /= 1000;
      suffixIndex++;
    }

    return `${formattedNum.toFixed(1).replace(/\.0$/, '')}${suffixes[suffixIndex]}`;
  };

  // Full number for tooltips
  const formatFullNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };
  const financialStats = financialData?.stats || {};
  const funnelStats = funnelData?.stats || {};
  const topCoaches = coachData?.coaches || [];

  // Real chart data from backend
  const userGrowthData = dashboardData?.charts?.userGrowth || [];
  const revenueData = funnelData?.revenueTrends || []; // Updated to use revenue trends from backend
  const topCoachesList = coachData?.coaches || [];

  const paymentMethodData = financialData?.charts?.paymentMethods || [];

  const getHealthStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'online':
      case 'active': return 'text-green-600';
      case 'warning':
      case 'degraded': return 'text-yellow-600';
      case 'error':
      case 'offline':
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'online':
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
      case 'degraded': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
      case 'offline':
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Navigation Tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">FunnelsEye Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of your platform performance and key metrics.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('overview')}
              className="text-xs"
            >
              Overview
            </Button>
            <Button
              variant={activeTab === 'analytics' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('analytics')}
              className="text-xs"
            >
              Analytics
            </Button>
            <Button
              variant={activeTab === 'performance' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('performance')}
              className="text-xs"
            >
              Performance
            </Button>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="relative overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold cursor-help"
              title={formatFullNumber(stats.totalUsers)}
            >
              {formatCompactNumber(stats.totalUsers)}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +{formatCompactNumber(stats.newUsersThisMonth || 0)} this month
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-3xl"></div>
        </Card>

        <Card className="relative overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold cursor-help"
              title={`₹${formatFullNumber(stats.totalRevenue)}`}
            >
              ₹{formatCompactNumber(stats.totalRevenue)}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +{stats.revenueGrowth || 0}% this month
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-bl-3xl"></div>
        </Card>

        <Card className="relative overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coaches</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold cursor-help"
              title={formatFullNumber(stats.totalCoaches)}
            >
              {formatCompactNumber(stats.totalCoaches)}
            </div>
            <div className="flex items-center text-xs text-blue-600">
              <Award className="h-3 w-3 mr-1" />
              {formatCompactNumber(stats.coachGrowth || 0)} new this month
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-bl-3xl"></div>
        </Card>

        <Card className="relative overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate || 0}%</div>
            <div className="flex items-center text-xs text-orange-600">
              <Funnel className="h-3 w-3 mr-1" />
              {formatCompactNumber(stats.totalConversions || 0)} conversions
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-bl-3xl"></div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getHealthStatusIcon(systemHealthData.status)}
              <span className={`text-sm font-medium ${getHealthStatusColor(systemHealthData.status)}`}>
                {systemHealthData.status || 'Unknown'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Uptime: {systemHealthData.performance?.uptime ? Math.floor(systemHealthData.performance.uptime / 3600) : 0}h
            </p>
          </CardContent>
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-bl-3xl"></div>
        </Card>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Top Performing Coaches */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Top Performing Coaches</span>
              </CardTitle>
              <CardDescription>
                Coaches with highest performance this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCoachesList.slice(0, 5).map((coach, index) => (
                  <div key={coach._id || index} className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {coach.firstName} {coach.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCompactNumber(coach.revenue || 0)} revenue
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatCompactNumber(coach.students || 0)} students
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Trends (Full Width) */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Revenue Trends</span>
              </CardTitle>
              <CardDescription>
                Monthly revenue performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Actions & System Health Row */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Quick Actions */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>
                  Common administrative tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 grid-cols-2">
                  <Button className="h-auto p-4 flex flex-col items-center space-y-2 bg-blue-50/50 hover:bg-blue-100/70 dark:bg-blue-950/10 dark:hover:bg-blue-950/20 transition-colors border border-blue-200/50 dark:border-blue-800/50 rounded-lg text-blue-700 dark:text-blue-300">
                    <Users className="h-6 w-6" />
                    <span className="text-sm font-medium">Manage Users</span>
                  </Button>

                  <Button className="h-auto p-4 flex flex-col items-center space-y-2 bg-green-50/50 hover:bg-green-100/70 dark:bg-green-950/10 dark:hover:bg-green-950/20 transition-colors border border-green-200/50 dark:border-green-800/50 rounded-lg text-green-700 dark:text-green-300">
                    <CreditCard className="h-6 w-6" />
                    <span className="text-sm font-medium">Process Payouts</span>
                  </Button>

                  <Button className="h-auto p-4 flex flex-col items-center space-y-2 bg-purple-50/50 hover:bg-purple-100/70 dark:bg-purple-950/10 dark:hover:bg-purple-950/20 transition-colors border border-purple-200/50 dark:border-purple-800/50 rounded-lg text-purple-700 dark:text-purple-300">
                    <MessageSquare className="h-6 w-6" />
                    <span className="text-sm font-medium">Send Broadcast</span>
                  </Button>

                  <Button className="h-auto p-4 flex flex-col items-center space-y-2 bg-orange-50/50 hover:bg-orange-100/70 dark:bg-orange-950/10 dark:hover:bg-orange-950/20 transition-colors border border-orange-200/50 dark:border-orange-800/50 rounded-lg text-orange-700 dark:text-orange-300">
                    <Settings className="h-6 w-6" />
                    <span className="text-sm font-medium">System Settings</span>
                  </Button>

                  <Button className="h-auto p-4 flex flex-col items-center space-y-2 bg-red-50/50 hover:bg-red-100/70 dark:bg-red-950/10 dark:hover:bg-red-950/20 transition-colors border border-red-200/50 dark:border-red-800/50 rounded-lg text-red-700 dark:text-red-300">
                    <Eye className="h-6 w-6" />
                    <span className="text-sm font-medium">View Analytics</span>
                  </Button>

                  <Button className="h-auto p-4 flex flex-col items-center space-y-2 bg-indigo-50/50 hover:bg-indigo-100/70 dark:bg-indigo-950/10 dark:hover:bg-indigo-950/20 transition-colors border border-indigo-200/50 dark:border-indigo-800/50 rounded-lg text-indigo-700 dark:text-indigo-300">
                    <Target className="h-6 w-6" />
                    <span className="text-sm font-medium">Manage Funnels</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Health Dashboard */}
            <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="h-5 w-5" />
                <span>System Health</span>
              </CardTitle>
              <CardDescription>
                Real-time system status and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-end">
                <Button
                  onClick={handleSystemHealthRefresh}
                  variant="outline"
                  size="sm"
                  disabled={systemHealthLoading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${systemHealthLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <Database className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <p className="text-xs font-medium text-green-700 dark:text-green-400">Database</p>
                  <Badge variant={systemHealthData.database?.connected ? "default" : "destructive"} className="text-xs mt-1">
                    {systemHealthData.database?.connected ? 'Connected' : 'Offline'}
                  </Badge>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Zap className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400">API</p>
                  <Badge variant="default" className="text-xs mt-1">
                    {systemHealthData.performance?.responseTime ? `${systemHealthData.performance.responseTime.toFixed(0)}ms` : 'N/A'}
                  </Badge>
                </div>
              </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm text-muted-foreground">
                      {systemHealthData.performance?.cpu || 0}% ({systemHealthData.performance?.cpuCores || 8} cores)
                    </span>
                  </div>
                  <Progress value={systemHealthData.performance?.cpu || 0} className="h-1.5" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm text-muted-foreground">
                      {systemHealthData.performance?.memoryUsed || 0}GB/{systemHealthData.performance?.totalMemory || 0}GB
                    </span>
                  </div>
                  <Progress value={systemHealthData.performance?.memory || 0} className="h-1.5" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uptime</span>
                  <span className="text-sm text-muted-foreground">
                    {systemHealthData.performance?.uptime ? `${Math.floor(systemHealthData.performance.uptime / 3600)}h` : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Analytics</CardTitle>
              <CardDescription>Detailed user acquisition metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Revenue distribution by payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Performance Metrics</span>
              </CardTitle>
              <CardDescription>
                Key performance indicators and system metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {performanceMetrics.successRate || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {performanceMetrics.avgResponseTime || 0}ms
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {formatNumber(performanceMetrics.totalRequests || 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {performanceMetrics.errorRate || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Error Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;