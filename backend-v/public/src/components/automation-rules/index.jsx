import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  RefreshCw,
  Workflow,
  Play,
  Pause,
  MoreVertical,
  Eye,
  Copy,
  Trash2,
  Activity,
  BarChart3,
  TrendingUp,
  Calendar,
  Loader2,
  Zap
} from 'lucide-react';
import automationRulesService from '../../services/automationRulesService';
import AutomationRulesGraphBuilder from './AutomationRulesGraphBuilder';

// Stats Card Component
const StatsCard = ({ title, value, icon, helpText }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm font-medium text-gray-600">{title}</div>
          {helpText && (
            <div className="text-xs text-gray-500 mt-1">{helpText}</div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Professional Loader Component
const ProfessionalLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <Card className="w-full max-w-2xl">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center space-y-6 py-12">
          <div className="relative w-16 h-16">
            <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
            <Zap className="h-6 w-6 text-blue-600 absolute top-5 left-5" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Automation Rules</h3>
            <p className="text-sm text-gray-600">Setting up your intelligent automation workflows...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Main Automation Rules Dashboard Component
const AutomationRulesDashboard = () => {
  const navigate = useNavigate();

  // Component state
  const [sequences, setSequences] = useState([]);
  const [flows, setFlows] = useState([]);
  const [runs, setRuns] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rules');

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal states
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Builder resources for funnel assignment
  const [builderResources, setBuilderResources] = useState({
    funnels: []
  });

  // API Functions
  const fetchSequences = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Starting to fetch sequences and builder resources...");

      const response = await automationRulesService.getSequences();
      setSequences(response.data || []);
      console.log("Sequences fetched:", response.data?.length || 0);

      // Also fetch builder resources (funnels)
      try {
        console.log("Fetching builder resources...");
        const resourcesResponse = await automationRulesService.getBuilderResources();
        console.log("Builder resources response:", resourcesResponse.data);
        const newResources = resourcesResponse.data || { funnels: [] };
        console.log("Setting builder resources:", newResources);
        setBuilderResources(newResources);
      } catch (resourcesErr) {
        console.error("Could not fetch builder resources:", resourcesErr);
        setBuilderResources({ funnels: [] });
      }
    } catch (error) {
      console.error('Error fetching sequences:', error);
      setSequences([]);
      setBuilderResources({ funnels: [] });
      toast.error('Failed to load automation sequences');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle funnel assignment
  const handleFunnelAssignment = async (ruleId, funnelId) => {
    try {
      await automationRulesService.assignFunnel(ruleId, funnelId || null);

      // Update local state
      setSequences(prev => prev.map(rule =>
        rule._id === ruleId
          ? { ...rule, funnelId: funnelId || null }
          : rule
      ));
      toast.success(`Rule ${funnelId ? 'assigned to funnel' : 'unassigned from funnel'}`);
    } catch (error) {
      console.error('Error assigning funnel:', error);
      toast.error(error.response?.data?.message || 'Failed to assign funnel');
    }
  };

  const fetchFlows = useCallback(async () => {
    try {
      const response = await automationRulesService.getFlows();
      setFlows(response.data || []);
    } catch (error) {
      console.error('Error fetching flows:', error);
    }
  }, []);

  const fetchRuns = useCallback(async () => {
    try {
      const response = await automationRulesService.getRuns();
      setRuns(response.data || []);
    } catch (error) {
      console.error('Error fetching runs:', error);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await automationRulesService.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    Promise.all([
      fetchSequences(),
      fetchFlows(),
      fetchRuns(),
      fetchAnalytics()
    ]).finally(() => setLoading(false));
  }, [fetchSequences, fetchFlows, fetchRuns, fetchAnalytics]);

  // Delete sequence
  const handleDeleteSequence = async () => {
    try {
      await automationRulesService.deleteSequence(selectedSequence._id);

      toast.success('Automation sequence deleted successfully');

      setIsDeleteDialogOpen(false);
      setSelectedSequence(null);
      fetchSequences();
    } catch (error) {
      toast.error('Failed to delete automation sequence');
    }
  };

  // Duplicate sequence
  const handleDuplicateSequence = async (sequence) => {
    try {
      await automationRulesService.duplicateSequence(sequence._id);
      toast.success('Automation sequence duplicated successfully');
      fetchSequences();
    } catch (error) {
      toast.error('Failed to duplicate automation sequence');
    }
  };

  // Filter sequences based on search and status
  const filteredSequences = useMemo(() => {
    return sequences.filter(sequence => {
      const matchesSearch = sequence.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sequence.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' ||
                          (filterStatus === 'active' && sequence.isActive) ||
                          (filterStatus === 'inactive' && !sequence.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [sequences, searchTerm, filterStatus]);

  if (loading) {
    return <ProfessionalLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Automation Builder - FunnelsEye</h1>
              <p className="text-gray-600 mt-1">Create and manage your automated workflows</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Rules"
              value={sequences.length}
              icon={<Workflow className="h-5 w-5" />}
              helpText="Active automation rules"
            />
            <StatsCard
              title="Active Rules"
              value={sequences.filter(s => s.isActive).length}
              icon={<Play className="h-5 w-5" />}
              helpText="Currently running"
            />
            <StatsCard
              title="Total Runs"
              value={runs.length}
              icon={<Activity className="h-5 w-5" />}
              helpText="Execution instances"
            />
            <StatsCard
              title="Success Rate"
              value={analytics?.successRate ? `${analytics.successRate}%` : 'N/A'}
              icon={<TrendingUp className="h-5 w-5" />}
              helpText="Successful executions"
            />
          </div>

          {/* Search and Actions Bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search automation rules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={fetchSequences}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>

                <Button
                  onClick={() => navigate('/automation-rules/create')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Rule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="ml-6 mt-6">
              <TabsTrigger value="rules">
                <Workflow className="h-4 w-4 mr-2" />
                Rules
              </TabsTrigger>
              <TabsTrigger value="runs">
                <Activity className="h-4 w-4 mr-2" />
                Runs
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rules">
              <div className="space-y-4">
                {/* Search and Filters */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search rules..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate('/automation-rules/create')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Rule
                  </Button>
                </div>

                {/* Rules Table */}
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Trigger</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Funnels</TableHead>
                        <TableHead>Last Run</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSequences.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex flex-col items-center gap-3">
                              <Workflow className="h-12 w-12 text-gray-400" />
                              <p className="text-gray-500">No automation rules found</p>
                              <Button
                                size="sm"
                                onClick={() => navigate('/automation-rules/create')}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Rule
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSequences.map((sequence) => (
                          <TableRow key={sequence._id}>
                            <TableCell>
                              <div>
                                <div className="font-semibold">{sequence.name}</div>
                                {sequence.description && (
                                  <div className="text-sm text-gray-500 line-clamp-1">
                                    {sequence.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {sequence.triggerEvent || 'Multiple'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={sequence.isActive ? 'default' : 'secondary'}>
                                {sequence.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Select
                                value={sequence.funnelId || ''}
                                onValueChange={(value) => handleFunnelAssignment(sequence._id, value)}
                              >
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="No funnel" />
                                </SelectTrigger>
                                <SelectContent>
                                  {builderResources.funnels && builderResources.funnels.length > 0 ? (
                                    builderResources.funnels.map(funnel => (
                                      <SelectItem key={funnel.id || funnel._id} value={funnel.id || funnel._id}>
                                        {funnel.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="" disabled>No funnels available</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-500">
                                {sequence.lastExecutedAt
                                  ? new Date(sequence.lastExecutedAt).toLocaleDateString()
                                  : 'Never'
                                }
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => navigate(`/automation-rules/${sequence._id}/edit`)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View/Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDuplicateSequence(sequence)}
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedSequence(sequence);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </TabsContent>

            {/* Runs Tab */}
            <TabsContent value="runs">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Automation Runs</h3>
                {runs.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center gap-3 py-8">
                        <Activity className="h-12 w-12 text-gray-400" />
                        <p className="text-gray-500">No runs yet</p>
                        <p className="text-sm text-gray-400">Automation execution history will appear here</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sequence</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Started</TableHead>
                          <TableHead>Duration</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {runs.map((run) => (
                          <TableRow key={run._id}>
                            <TableCell className="font-medium">
                              {run.sequenceName}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={run.status === 'completed' ? 'default' : run.status === 'failed' ? 'destructive' : 'secondary'}
                              >
                                {run.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {new Date(run.startedAt).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {run.completedAt
                                ? `${Math.round((new Date(run.completedAt) - new Date(run.startedAt)) / 1000)}s`
                                : 'Running...'
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Analytics</h3>
                {analytics ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatsCard
                      title="Total Executions"
                      value={analytics.totalExecutions || 0}
                      icon={<Activity className="h-5 w-5" />}
                    />
                    <StatsCard
                      title="Success Rate"
                      value={`${analytics.successRate || 0}%`}
                      icon={<TrendingUp className="h-5 w-5" />}
                    />
                    <StatsCard
                      title="Average Duration"
                      value={`${analytics.averageDuration || 0}s`}
                      icon={<Calendar className="h-5 w-5" />}
                    />
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center gap-3 py-8">
                        <BarChart3 className="h-12 w-12 text-gray-400" />
                        <p className="text-gray-500">No analytics data available</p>
                        <p className="text-sm text-gray-400">Analytics will appear here once automations start running</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Automation Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedSequence?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSequence} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AutomationRulesDashboard;
