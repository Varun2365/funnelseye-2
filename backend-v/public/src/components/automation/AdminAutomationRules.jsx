import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Search,
  Filter,
  Loader2,
  Play,
  Pause,
  Workflow,
  Calendar,
  TrendingUp,
  Eye,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import adminApiService from '../../services/adminApiService';
import { useAuth } from '../../contexts/AuthContext';

const AdminAutomationRules = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [workflowTypeFilter, setWorkflowTypeFilter] = useState('all');

  // Load automation rules
  const loadRules = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (statusFilter !== 'all') params.append('isActive', statusFilter === 'active');
      if (workflowTypeFilter !== 'all') params.append('workflowType', workflowTypeFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await adminApiService.apiCall(`/admin-automation-rules?${params.toString()}`);
      
      if (response.success) {
        setRules(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load automation rules');
      }
    } catch (error) {
      console.error('Error loading automation rules:', error);
      toast.error('Failed to load automation rules');
    } finally {
      setLoading(false);
    }
  };

  // Load rules on mount
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadRules();
    }
  }, [authLoading, isAuthenticated, categoryFilter, statusFilter, workflowTypeFilter, searchQuery]);

  // Handle delete
  const handleDelete = async (ruleId) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) {
      return;
    }

    try {
      const response = await adminApiService.apiCall(`/admin-automation-rules/${ruleId}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        toast.success('Automation rule deleted successfully');
        loadRules();
      } else {
        toast.error(response.message || 'Failed to delete automation rule');
      }
    } catch (error) {
      console.error('Error deleting automation rule:', error);
      toast.error('Failed to delete automation rule');
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (rule) => {
    try {
      const response = await adminApiService.apiCall(`/admin-automation-rules/${rule._id}/toggle`, {
        method: 'PUT',
        body: { isActive: !rule.isActive }
      });
      
      if (response.success) {
        toast.success(`Automation rule ${!rule.isActive ? 'activated' : 'deactivated'} successfully`);
        loadRules();
      } else {
        toast.error(response.message || 'Failed to update automation rule');
      }
    } catch (error) {
      console.error('Error toggling automation rule:', error);
      toast.error('Failed to update automation rule');
    }
  };

  // Handle duplicate
  const handleDuplicate = async (rule) => {
    try {
      const response = await adminApiService.apiCall(`/admin-automation-rules/${rule._id}/duplicate`, {
        method: 'POST'
      });
      
      if (response.success) {
        toast.success('Automation rule duplicated successfully');
        loadRules();
      } else {
        toast.error(response.message || 'Failed to duplicate automation rule');
      }
    } catch (error) {
      console.error('Error duplicating automation rule:', error);
      toast.error('Failed to duplicate automation rule');
    }
  };

  // Filtered rules
  const filteredRules = rules.filter((rule) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        rule.name?.toLowerCase().includes(query) ||
        rule.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-full">
        {/* Header */}
        <div className="bg-card border-b border-border/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Automation Rules</h1>
              <p className="text-muted-foreground">
                Manage automation rules that can be assigned to subscription plans
              </p>
            </div>
            <Button
              onClick={() => window.location.href = '/automation-rules/create'}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Rule
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="px-8 py-6">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-muted/50">
            <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">All Rules</TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Active</TabsTrigger>
            <TabsTrigger value="inactive" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Inactive</TabsTrigger>
            <TabsTrigger value="public" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Public</TabsTrigger>
          </TabsList>

        <TabsContent value="all" className="space-y-0">
          <div className="bg-card border-b border-border/50 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground">All Automation Rules</h2>
                <p className="text-sm text-muted-foreground">
                  View and manage all automation rules in the system
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search rules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-72 h-10 bg-background border-border/50 focus:border-primary/50 transition-colors"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-44 h-10 bg-background border-border/50 focus:border-primary/50">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="lead_management">Lead Management</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="workflow">Workflow</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={workflowTypeFilter} onValueChange={setWorkflowTypeFilter}>
                  <SelectTrigger className="w-40 h-10 bg-background border-border/50 focus:border-primary/50">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="legacy">Legacy</SelectItem>
                    <SelectItem value="graph">Graph</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Loading automation rules...</p>
                </div>
              </div>
            ) : filteredRules.length === 0 ? (
              <div className="text-center py-20">
                <div className="mx-auto w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                  <Workflow className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No automation rules found</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  {searchQuery ? 'Try adjusting your search filters to find what you\'re looking for.' : 'Get started by creating your first automation rule to streamline your workflows.'}
                </p>
                <Button
                  onClick={() => window.location.href = '/automation-rules/create'}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Rule
                </Button>
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/50">
                      <TableHead className="font-semibold text-foreground py-4 px-6">Name</TableHead>
                      <TableHead className="font-semibold text-foreground py-4 px-6">Type</TableHead>
                      <TableHead className="font-semibold text-foreground py-4 px-6">Category</TableHead>
                      <TableHead className="font-semibold text-foreground py-4 px-6">Status</TableHead>
                      <TableHead className="font-semibold text-foreground py-4 px-6">Public</TableHead>
                      <TableHead className="font-semibold text-foreground py-4 px-6">Executions</TableHead>
                      <TableHead className="font-semibold text-foreground py-4 px-6">Last Executed</TableHead>
                      <TableHead className="font-semibold text-foreground py-4 px-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRules.map((rule) => (
                      <TableRow key={rule._id} className="hover:bg-muted/20 transition-colors border-border/30">
                        <TableCell className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="font-semibold text-foreground">{rule.name}</div>
                            {rule.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                                {rule.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge variant={rule.workflowType === 'graph' ? 'default' : 'secondary'} className="font-medium">
                            {rule.workflowType === 'graph' ? (
                              <>
                                <Workflow className="mr-1 h-3 w-3" />
                                Graph
                              </>
                            ) : (
                              'Legacy'
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge variant="outline" className="font-medium capitalize">
                            {rule.category || 'custom'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge variant={rule.isActive ? 'default' : 'secondary'} className="font-medium">
                            {rule.isActive ? (
                              <>
                                <Play className="mr-1 h-3 w-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <Pause className="mr-1 h-3 w-3" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          {rule.isPublic ? (
                            <Badge variant="default" className="font-medium">Public</Badge>
                          ) : (
                            <Badge variant="outline" className="font-medium">Private</Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{rule.executionCount || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          {rule.lastExecutedAt ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(rule.lastExecutedAt).toLocaleDateString()}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground font-medium">Never</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(rule)}
                              title={rule.isActive ? 'Deactivate' : 'Activate'}
                              className="h-8 w-8 p-0 hover:bg-muted"
                            >
                              {rule.isActive ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.location.href = `/automation-rules/${rule._id}/edit`}
                              title="Edit"
                              className="h-8 w-8 p-0 hover:bg-muted"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicate(rule)}
                              title="Duplicate"
                              className="h-8 w-8 p-0 hover:bg-muted"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(rule._id)}
                              title="Delete"
                              className="h-8 w-8 p-0 hover:bg-muted text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-0">
          <div className="bg-card border-b border-border/50 px-8 py-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">Active Rules</h2>
              <p className="text-sm text-muted-foreground">
                Automation rules that are currently active
              </p>
            </div>
          </div>
          <div className="px-8 py-8">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredRules.filter(r => r.isActive).length === 0 ? (
                <div className="text-center py-12">
                  <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No active rules found</h3>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Executions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRules.filter(r => r.isActive).map((rule) => (
                      <TableRow key={rule._id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>
                          <Badge variant={rule.workflowType === 'graph' ? 'default' : 'secondary'}>
                            {rule.workflowType === 'graph' ? 'Graph' : 'Legacy'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{rule.category || 'custom'}</Badge>
                        </TableCell>
                        <TableCell>{rule.executionCount || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleToggleActive(rule)}>
                              <Pause className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => window.location.href = `/automation-rules/${rule._id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
          </div>
        </TabsContent>

        <TabsContent value="inactive" className="space-y-0">
          <div className="bg-card border-b border-border/50 px-8 py-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">Inactive Rules</h2>
              <p className="text-sm text-muted-foreground">
                Automation rules that are currently disabled
              </p>
            </div>
          </div>
          <div className="px-8 py-8">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredRules.filter(r => !r.isActive).length === 0 ? (
                <div className="text-center py-12">
                  <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No inactive rules found</h3>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Executions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRules.filter(r => !r.isActive).map((rule) => (
                      <TableRow key={rule._id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>
                          <Badge variant={rule.workflowType === 'graph' ? 'default' : 'secondary'}>
                            {rule.workflowType === 'graph' ? 'Graph' : 'Legacy'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{rule.category || 'custom'}</Badge>
                        </TableCell>
                        <TableCell>{rule.executionCount || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleToggleActive(rule)}>
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => window.location.href = `/automation-rules/${rule._id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
          </div>
        </TabsContent>

        <TabsContent value="public" className="space-y-0">
          <div className="bg-card border-b border-border/50 px-8 py-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">Public Rules</h2>
              <p className="text-sm text-muted-foreground">
                Automation rules available for subscription plan assignment
              </p>
            </div>
          </div>
          <div className="px-8 py-8">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredRules.filter(r => r.isPublic).length === 0 ? (
                <div className="text-center py-12">
                  <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No public rules found</h3>
                  <p className="text-sm text-muted-foreground">Mark rules as public to make them available for subscription plans</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage Count</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRules.filter(r => r.isPublic).map((rule) => (
                      <TableRow key={rule._id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>
                          <Badge variant={rule.workflowType === 'graph' ? 'default' : 'secondary'}>
                            {rule.workflowType === 'graph' ? 'Graph' : 'Legacy'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{rule.category || 'custom'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{rule.usageCount || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => window.location.href = `/automation-rules/${rule._id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default AdminAutomationRules;
