import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
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
  Zap,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Switch } from '../ui/switch';
import automationRulesService from '../../services/automationRulesService';
import AutomationRulesGraphBuilder from './AutomationRulesGraphBuilder';

// Stats Card Component
const StatsCard = ({ title, value, icon, helpText }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <div className="text-sm font-medium text-muted-foreground">{title}</div>
          {helpText && (
            <div className="text-xs text-muted-foreground mt-1">{helpText}</div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Professional Loader Component
const ProfessionalLoader = () => (
  <div className="w-full min-h-screen bg-background flex items-center justify-center">
    <div className="w-full max-w-md mx-auto">
      <div className="text-center space-y-6 py-12">
        <div className="relative w-16 h-16 mx-auto">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
          <Zap className="h-6 w-6 text-primary absolute top-5 left-5" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">Loading Automation Rules</h3>
          <p className="text-muted-foreground">Setting up your intelligent automation workflows...</p>
        </div>
      </div>
    </div>
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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [expandedRuns, setExpandedRuns] = useState(new Set());
  const [runDetails, setRunDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(new Set());
  const [togglingStatus, setTogglingStatus] = useState(new Set());
  const [assigningFunnel, setAssigningFunnel] = useState(new Set());
  
  // Create rule form state
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleFunnelId, setNewRuleFunnelId] = useState('__none__');
  const [isCreating, setIsCreating] = useState(false);

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
    setAssigningFunnel(prev => new Set(prev).add(ruleId));
    try {
      const value = funnelId === '__none__' || funnelId === '' ? null : funnelId;
      await automationRulesService.assignFunnel(ruleId, value);

      // Refresh sequences to get updated data from server
      await fetchSequences();
      toast.success(`Rule ${value ? 'assigned to funnel' : 'unassigned from funnel'}`);
    } catch (error) {
      console.error('Error assigning funnel:', error);
      toast.error(error.response?.data?.message || 'Failed to assign funnel');
    } finally {
      setAssigningFunnel(prev => {
        const newSet = new Set(prev);
        newSet.delete(ruleId);
        return newSet;
      });
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (ruleId, currentStatus) => {
    setTogglingStatus(prev => new Set(prev).add(ruleId));
    try {
      const newStatus = !currentStatus;
      await automationRulesService.toggleSequence(ruleId);

      // Update local state
      setSequences(prev => prev.map(rule =>
        rule._id === ruleId
          ? { ...rule, isActive: newStatus }
          : rule
      ));
      toast.success(`Rule ${newStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to toggle rule status');
    } finally {
      setTogglingStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(ruleId);
        return newSet;
      });
    }
  };

  // Handle create new rule
  const handleCreateRule = async () => {
    if (!newRuleName.trim()) {
      toast.error('Please enter a rule name');
      return;
    }

    setIsCreating(true);
    try {
      const ruleData = {
        name: newRuleName.trim(),
        description: '',
        workflowType: 'graph',
        isActive: false,
        nodes: [],
        edges: [],
        funnelId: newRuleFunnelId === '__none__' ? null : newRuleFunnelId
      };

      const response = await automationRulesService.createSequence(ruleData);
      
      if (response.success && response.data?._id) {
        toast.success('Automation rule created successfully');
        setIsCreateDialogOpen(false);
        setNewRuleName('');
        setNewRuleFunnelId('');
        // Navigate to editor
        navigate(`/automation-rules/${response.data._id}/edit`);
      } else {
        throw new Error('Failed to create rule');
      }
    } catch (error) {
      console.error('Error creating rule:', error);
      toast.error(error.response?.data?.message || 'Failed to create automation rule');
    } finally {
      setIsCreating(false);
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

  const toggleRunExpansion = async (executionId) => {
    const newExpanded = new Set(expandedRuns);
    if (newExpanded.has(executionId)) {
      newExpanded.delete(executionId);
    } else {
      newExpanded.add(executionId);
      // Fetch details if not already loaded
      if (!runDetails[executionId]) {
        setLoadingDetails(prev => new Set(prev).add(executionId));
        try {
          const response = await automationRulesService.getRunDetails(executionId);
          if (response.success && response.data) {
            setRunDetails(prev => ({
              ...prev,
              [executionId]: response.data
            }));
          }
        } catch (error) {
          console.error('Error fetching run details:', error);
        } finally {
          setLoadingDetails(prev => {
            const newSet = new Set(prev);
            newSet.delete(executionId);
            return newSet;
          });
        }
      }
    }
    setExpandedRuns(newExpanded);
  };

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

  // Pagination logic - only apply when not searching
  const paginatedSequences = useMemo(() => {
    if (searchTerm.trim()) {
      // When searching, show all filtered results (no pagination)
      return filteredSequences;
    }
    // When not searching, apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSequences.slice(startIndex, endIndex);
  }, [filteredSequences, currentPage, itemsPerPage, searchTerm]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (searchTerm.trim()) {
      return 1; // No pagination when searching
    }
    return Math.ceil(filteredSequences.length / itemsPerPage);
  }, [filteredSequences.length, itemsPerPage, searchTerm]);

  // Reset to page 1 when search term or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage, filterStatus]);

  if (loading) {
    return <ProfessionalLoader />;
  }

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="w-full">
        {/* Header Section */}
        <div className="bg-card border-b border-border/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Automation Rules</h1>
              <p className="text-muted-foreground">
                Create and manage your automated workflows
              </p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Rule
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-8 py-6">
          <TabsList className="inline-flex grid-cols-3 mb-6 bg-muted/50">
            <TabsTrigger value="rules" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Workflow className="h-4 w-4 mr-2 text-blue-500" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="runs" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Activity className="h-4 w-4 mr-2 text-green-500" />
              Runs
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BarChart3 className="h-4 w-4 mr-2 text-purple-500" />
              Analytics
            </TabsTrigger>
          </TabsList>

            <TabsContent value="rules">
              <div className="space-y-0">
                {/* Search and Filters */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search rules..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-background border-border/50 focus:border-primary/50"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-44 bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 hover:border-slate-300 focus:border-blue-400 transition-colors">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rules Table */}
                <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
                  <Table className="border-0">
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30 border-0">
                        <TableHead className="font-semibold text-foreground py-4 px-6 border-0 w-12">#</TableHead>
                        <TableHead className="font-semibold text-foreground py-4 px-6 border-0">Name</TableHead>
                        <TableHead className="font-semibold text-foreground py-4 px-6 border-0">Status</TableHead>
                        <TableHead className="font-semibold text-foreground py-4 px-6 border-0">Funnels</TableHead>
                        <TableHead className="font-semibold text-foreground py-4 px-6 border-0">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSequences.length === 0 ? (
                        <TableRow className="border-0">
                          <TableCell colSpan={5} className="text-center py-20 border-0">
                            <div className="flex flex-col items-center gap-6">
                              <div className="mx-auto w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center">
                                <Workflow className="h-10 w-10 text-muted-foreground" />
                              </div>
                              <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-foreground">
                                  {searchTerm.trim() ? 'No Items Found' : 'No automation rules found'}
                                </h3>
                                <p className="text-muted-foreground max-w-md">
                                  {searchTerm.trim() 
                                    ? 'Try adjusting your search terms to find what you\'re looking for.'
                                    : 'Get started by creating your first automation rule to streamline your workflows.'
                                  }
                                </p>
                              </div>
                              {!searchTerm.trim() && (
                              <Button
                                  onClick={() => setIsCreateDialogOpen(true)}
                                className="bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Rule
                              </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedSequences.map((sequence, index) => {
                          const isToggling = togglingStatus.has(sequence._id);
                          const isAssigning = assigningFunnel.has(sequence._id);
                          
                          // Calculate actual index for display (considering pagination)
                          const displayIndex = searchTerm.trim() 
                            ? index + 1 
                            : (currentPage - 1) * itemsPerPage + index + 1;
                          
                          return (
                            <TableRow 
                              key={sequence._id} 
                              className="hover:bg-muted/20 transition-colors border-b border-border/50 cursor-pointer"
                              onClick={() => navigate(`/automation-rules/${sequence._id}/edit`)}
                            >
                              <TableCell className="py-4 px-6 border-0">
                                <div className="text-sm text-muted-foreground font-medium">
                                  {displayIndex}
                                </div>
                              </TableCell>
                            <TableCell className="py-4 px-6 border-0">
                              <div className="space-y-1">
                                <div className="font-semibold text-foreground">{sequence.name}</div>
                                {sequence.description && (
                                  <div className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                                    {sequence.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                              <TableCell className="py-4 px-6 border-0" onClick={(e) => e.stopPropagation()}>
                                {isToggling ? (
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Updating...</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={sequence.isActive}
                                      onCheckedChange={() => handleStatusToggle(sequence._id, sequence.isActive)}
                                      className={sequence.isActive 
                                        ? "data-[state=checked]:bg-green-500" 
                                        : "data-[state=unchecked]:bg-red-400"
                                      }
                                      style={{ transform: 'scale(0.8)' }}
                                    />
                                    <span className={`text-sm font-medium ${
                                      sequence.isActive ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {sequence.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                )}
                            </TableCell>
                            <TableCell className="py-4 px-6 border-0" onClick={(e) => e.stopPropagation()}>
                                {isAssigning ? (
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Assigning...</span>
                                  </div>
                                ) : (
                              <Select
                                    value={
                                      sequence.funnelId 
                                        ? (typeof sequence.funnelId === 'object' 
                                            ? (sequence.funnelId._id || sequence.funnelId.id || String(sequence.funnelId))
                                            : String(sequence.funnelId))
                                        : '__none__'
                                    }
                                    onValueChange={(value) => handleFunnelAssignment(sequence._id, value === '__none__' ? null : value)}
                                    disabled={isAssigning}
                              >
                                <SelectTrigger className="w-[200px] bg-background border-border/50">
                                  <SelectValue placeholder="No funnel" />
                                </SelectTrigger>
                                <SelectContent>
                                      <SelectItem value="__none__">No funnel</SelectItem>
                                      {builderResources.funnels && builderResources.funnels.length > 0 ? (
                                        builderResources.funnels.map(funnel => (
                                          <SelectItem key={funnel.id || funnel._id} value={String(funnel.id || funnel._id)}>
                                            {funnel.name}
                                          </SelectItem>
                                        ))
                                      ) : (
                                        <SelectItem value="__no_funnels__" disabled>No funnels available</SelectItem>
                                      )}
                                </SelectContent>
                              </Select>
                                )}
                            </TableCell>
                              <TableCell className="py-4 px-6 border-0" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                    >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/automation-rules/${sequence._id}/edit`);
                                      }}
                                      className="text-blue-600 focus:text-blue-700 focus:bg-blue-50 cursor-pointer"
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDuplicateSequence(sequence);
                                      }}
                                      className="text-green-600 focus:text-green-700 focus:bg-green-50 cursor-pointer"
                                    >
                                      <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      setSelectedSequence(sequence);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                      className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                                  >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination Controls */}
                {filteredSequences.length > 0 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="items-per-page" className="text-sm text-muted-foreground">
                          Items per page:
                        </Label>
                        <Select
                          value={String(itemsPerPage)}
                          onValueChange={(value) => setItemsPerPage(Number(value))}
                          disabled={!!searchTerm.trim()}
                        >
                          <SelectTrigger id="items-per-page" className="w-20 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {searchTerm.trim() 
                          ? `Showing ${filteredSequences.length} result${filteredSequences.length !== 1 ? 's' : ''}`
                          : `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, filteredSequences.length)} of ${filteredSequences.length}`
                        }
                      </div>
                    </div>
                    
                    {!searchTerm.trim() && totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="h-9"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <div className="flex items-center gap-2 px-4">
                          <span className="text-sm text-muted-foreground">
                            Page
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {currentPage} of {totalPages}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="h-9"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Runs Tab */}
            <TabsContent value="runs">
              <div className="space-y-0">
                <div className="space-y-1 mb-6 flex items-center justify-between">
                  <div>
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Automation Runs
                  </h3>
                    <p className="text-muted-foreground">View execution history and logs of your automation rules</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchRuns}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
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
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Rule</TableHead>
                          <TableHead>Lead</TableHead>
                          <TableHead>Trigger</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Started</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Progress</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {runs.map((run) => {
                          const isExpanded = expandedRuns.has(run.executionId);
                          const details = runDetails[run.executionId];
                          const isLoadingDetails = loadingDetails.has(run.executionId);
                          const history = details?.executionHistory || run.executionHistory || [];
                          const errors = details?.errorLogs || run.errorLogs || [];
                          const visitedCount = run.visitedNodes?.length || 0;
                          const completedCount = run.completedNodes?.length || 0;
                          
                          return (
                            <React.Fragment key={run._id || run.executionId}>
                              <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRunExpansion(run.executionId)}>
                                <TableCell>
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </TableCell>
                            <TableCell className="font-medium">
                                  <div className="space-y-1">
                                    <div>{run.ruleName || 'Unknown Rule'}</div>
                                    {run.funnelName && (
                                      <div className="text-xs text-muted-foreground">Funnel: {run.funnelName}</div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="text-sm">{run.leadName || 'Unknown Lead'}</div>
                                    {run.leadEmail && (
                                      <div className="text-xs text-muted-foreground">{run.leadEmail}</div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">
                                    {run.triggerEvent || 'Unknown'}
                                  </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                    variant={
                                      run.status === 'completed' 
                                        ? 'default' 
                                        : run.status === 'failed' 
                                        ? 'destructive' 
                                        : run.status === 'waiting_delay' || run.status === 'waiting_reply'
                                        ? 'secondary'
                                        : 'secondary'
                                    }
                                    className={
                                      run.status === 'running' 
                                        ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                        : ''
                                    }
                                  >
                                    {run.status?.replace('_', ' ') || 'unknown'}
                              </Badge>
                            </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {run.startedAt ? new Date(run.startedAt).toLocaleString() : 'N/A'}
                            </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                              {run.completedAt
                                ? `${Math.round((new Date(run.completedAt) - new Date(run.startedAt)) / 1000)}s`
                                    : run.startedAt
                                    ? `${Math.round((new Date() - new Date(run.startedAt)) / 1000)}s`
                                    : 'N/A'
                              }
                            </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-muted rounded-full h-2">
                                      <div 
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{ 
                                          width: `${run.metrics?.nodesProcessed > 0 ? Math.min(100, (completedCount / run.metrics.nodesProcessed) * 100) : 0}%` 
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {completedCount}/{run.metrics?.nodesProcessed || 0}
                                    </span>
                                  </div>
                                </TableCell>
                          </TableRow>
                              {isExpanded && (
                                <TableRow>
                                  <TableCell colSpan={8} className="bg-muted/30 p-0">
                                    <div className="p-6 space-y-6">
                                      {isLoadingDetails ? (
                                        <div className="flex items-center justify-center py-8">
                                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                          <span className="ml-2 text-muted-foreground">Loading details...</span>
                                        </div>
                                      ) : (
                                        <>
                                          {/* Metrics Summary */}
                                          <div className="grid grid-cols-4 gap-4">
                                            <Card>
                                              <CardContent className="pt-4">
                                                <div className="text-2xl font-bold">{run.metrics?.nodesProcessed || 0}</div>
                                                <div className="text-sm text-muted-foreground">Nodes Processed</div>
                                              </CardContent>
                                            </Card>
                                            <Card>
                                              <CardContent className="pt-4">
                                                <div className="text-2xl font-bold">{run.metrics?.actionsExecuted || 0}</div>
                                                <div className="text-sm text-muted-foreground">Actions Executed</div>
                                              </CardContent>
                                            </Card>
                                            <Card>
                                              <CardContent className="pt-4">
                                                <div className="text-2xl font-bold">{run.metrics?.delaysCompleted || 0}</div>
                                                <div className="text-sm text-muted-foreground">Delays Completed</div>
                                              </CardContent>
                                            </Card>
                                            <Card>
                                              <CardContent className="pt-4">
                                                <div className="text-2xl font-bold text-red-600">{run.metrics?.errors || 0}</div>
                                                <div className="text-sm text-muted-foreground">Errors</div>
                                              </CardContent>
                                            </Card>
                                          </div>

                                          {/* Execution History */}
                                          <div>
                                            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                              <FileText className="h-5 w-5" />
                                              Execution History
                                            </h4>
                                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                              {history.length === 0 ? (
                                                <div className="text-center py-8 text-muted-foreground">
                                                  No execution history available
                                                </div>
                                              ) : (
                                                history.map((entry, idx) => (
                                                  <Card key={idx} className="border-l-4 border-l-primary">
                                                    <CardContent className="pt-4">
                                                      <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                          <div className="flex items-center gap-2 mb-2">
                                                            {entry.status === 'completed' ? (
                                                              <CheckCircle className="h-4 w-4 text-green-600" />
                                                            ) : entry.status === 'failed' ? (
                                                              <XCircle className="h-4 w-4 text-red-600" />
                                                            ) : (
                                                              <Clock className="h-4 w-4 text-yellow-600" />
                                                            )}
                                                            <span className="font-semibold">
                                                              {entry.nodeDetails?.label || entry.nodeId}
                                                            </span>
                                                            <Badge variant="outline" className="text-xs">
                                                              {entry.nodeType || entry.action}
                                                            </Badge>
                                                          </div>
                                                          {entry.nodeDetails && (
                                                            <div className="text-sm text-muted-foreground mb-2">
                                                              Type: {entry.nodeDetails.type} | 
                                                              Node Type: {entry.nodeDetails.nodeType}
                                                            </div>
                                                          )}
                                                          {entry.result && typeof entry.result === 'object' && (
                                                            <div className="text-xs bg-muted p-2 rounded mt-2">
                                                              <pre className="whitespace-pre-wrap">
                                                                {JSON.stringify(entry.result, null, 2)}
                                                              </pre>
                                                            </div>
                                                          )}
                                                          {entry.error && (
                                                            <div className="text-xs bg-red-50 text-red-800 p-2 rounded mt-2">
                                                              Error: {entry.error}
                                                            </div>
                                                          )}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                          {entry.startedAt ? new Date(entry.startedAt).toLocaleTimeString() : ''}
                                                          {entry.completedAt && entry.startedAt && (
                                                            <span className="ml-2">
                                                              ({Math.round((new Date(entry.completedAt) - new Date(entry.startedAt)) / 1000)}s)
                                                            </span>
                                                          )}
                                                        </div>
                                                      </div>
                                                    </CardContent>
                                                  </Card>
                                                ))
                                              )}
                                            </div>
                                          </div>

                                          {/* Error Logs */}
                                          {errors.length > 0 && (
                                            <div>
                                              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
                                                <AlertCircle className="h-5 w-5" />
                                                Error Logs
                                              </h4>
                                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                                {errors.map((error, idx) => (
                                                  <Card key={idx} className="border-l-4 border-l-red-500 bg-red-50">
                                                    <CardContent className="pt-4">
                                                      <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                          <div className="font-semibold text-red-900 mb-1">
                                                            {error.nodeDetails?.label || error.nodeId || 'Unknown Node'}
                                                          </div>
                                                          <div className="text-sm text-red-800">{error.error}</div>
                                                          {error.retryCount > 0 && (
                                                            <div className="text-xs text-red-600 mt-1">
                                                              Retry Count: {error.retryCount}
                                                            </div>
                                                          )}
                                                        </div>
                                                        <div className="text-xs text-red-600">
                                                          {error.timestamp ? new Date(error.timestamp).toLocaleString() : ''}
                                                        </div>
                                                      </div>
                                                    </CardContent>
                                                  </Card>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {/* Visited Nodes */}
                                          {run.visitedNodes && run.visitedNodes.length > 0 && (
                                            <div>
                                              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                <Activity className="h-5 w-5" />
                                                Visited Nodes ({run.visitedNodes.length})
                                              </h4>
                                              <div className="flex flex-wrap gap-2">
                                                {run.visitedNodes.map((nodeId, idx) => {
                                                  const nodeDetails = details?.nodeMap?.[nodeId];
                                                  return (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                      {nodeDetails?.label || nodeId}
                                                    </Badge>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="space-y-0">
                <div className="space-y-1 mb-6">
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    Analytics
                  </h3>
                  <p className="text-muted-foreground">Performance insights and metrics for your automation rules</p>
                </div>
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
        </div>

        {/* Create New Rule Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">Create New Automation Rule</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter the details to create a new automation rule
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name" className="text-sm font-medium">
                  Rule Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="rule-name"
                  placeholder="Enter automation rule name..."
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newRuleName.trim()) {
                      handleCreateRule();
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-funnel" className="text-sm font-medium">
                  Assign Funnel (Optional)
                </Label>
                  <Select
                    value={newRuleFunnelId}
                    onValueChange={setNewRuleFunnelId}
                  >
                    <SelectTrigger id="rule-funnel" className="w-full">
                      <SelectValue placeholder="Select a funnel (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No funnel</SelectItem>
                      {builderResources.funnels && builderResources.funnels.length > 0 ? (
                        builderResources.funnels.map(funnel => (
                          <SelectItem key={funnel.id || funnel._id} value={String(funnel.id || funnel._id)}>
                            {funnel.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__no_funnels__" disabled>No funnels available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setNewRuleName('');
                  setNewRuleFunnelId('__none__');
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateRule}
                disabled={isCreating || !newRuleName.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Go
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
