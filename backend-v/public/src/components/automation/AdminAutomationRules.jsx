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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Automation Rules</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage automation rules that can be assigned to subscription plans
          </p>
        </div>
        <Button onClick={() => window.location.href = '/automation-rules/create'}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Rule
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Rules</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="public">Public</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Automation Rules</CardTitle>
                  <CardDescription>
                    View and manage all automation rules in the system
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search rules..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
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
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="legacy">Legacy</SelectItem>
                      <SelectItem value="graph">Graph</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredRules.length === 0 ? (
                <div className="text-center py-12">
                  <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No automation rules found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery ? 'Try adjusting your search filters' : 'Get started by creating your first automation rule'}
                  </p>
                  <Button onClick={() => window.location.href = '/automation-rules/create'}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Rule
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Public</TableHead>
                      <TableHead>Executions</TableHead>
                      <TableHead>Last Executed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRules.map((rule) => (
                      <TableRow key={rule._id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{rule.name}</div>
                            {rule.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {rule.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.workflowType === 'graph' ? 'default' : 'secondary'}>
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
                        <TableCell>
                          <Badge variant="outline">{rule.category || 'custom'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.isActive ? 'default' : 'secondary'}>
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
                        <TableCell>
                          {rule.isPublic ? (
                            <Badge variant="default">Public</Badge>
                          ) : (
                            <Badge variant="outline">Private</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span>{rule.executionCount || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {rule.lastExecutedAt ? (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(rule.lastExecutedAt).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(rule)}
                              title={rule.isActive ? 'Deactivate' : 'Activate'}
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
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicate(rule)}
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(rule._id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Rules</CardTitle>
              <CardDescription>Automation rules that are currently active</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inactive Rules</CardTitle>
              <CardDescription>Automation rules that are currently disabled</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="public" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Public Rules</CardTitle>
              <CardDescription>Automation rules available for subscription plan assignment</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAutomationRules;
