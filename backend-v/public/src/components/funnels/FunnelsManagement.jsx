import React, { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Plus, FileText, Users, Sparkles, Eye, Edit, Copy, Trash2, Play, Pause, ChevronLeft, ChevronRight, ExternalLink, Search, Layers, Loader2, X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FunnelsManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('customer');
  const [selectedFunnels, setSelectedFunnels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    targetAudience: 'customer'
  });
  const [funnelStatuses, setFunnelStatuses] = useState({});
  const [loadingToggles, setLoadingToggles] = useState({}); // Track loading state for each toggle

  const [funnels, setFunnels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSelectFunnel = (funnelId) => {
    setSelectedFunnels(prev =>
      prev.includes(funnelId)
        ? prev.filter(id => id !== funnelId)
        : [...prev, funnelId]
    );
  };

  const handleSelectAll = (funnels) => {
    const allIds = (funnels || []).map(f => f.id);
    setSelectedFunnels(prev => {
      const currentSelected = prev || [];
      return currentSelected.length === allIds.length ? [] : allIds;
    });
  };

  // Use fetched data directly (pagination handled by API)
  const currentFunnels = Array.isArray(funnels) ? funnels : [];
  const safeTotalItems = typeof totalItems === 'number' && !isNaN(totalItems) ? totalItems : 0;
  const safeItemsPerPage = typeof itemsPerPage === 'number' && !isNaN(itemsPerPage) ? itemsPerPage : 10;
  const totalPages = Math.max(1, Math.ceil(safeTotalItems / safeItemsPerPage));

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedFunnels([]); // Clear selections when changing pages
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page
    setSelectedFunnels([]);
  };

  // Fetch funnels from API
  const fetchFunnels = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        targetAudience: activeTab === 'customer' ? 'customer' : activeTab === 'coach' ? 'coach' : 'all'
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin authentication token not found. Please log in again.');
      }

      const response = await fetch(`/api/admin/funnels/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch funnels: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const funnelData = Array.isArray(result.data) ? result.data : [];
        setFunnels(funnelData);

        // Update funnel statuses
        const statuses = {};
        funnelData.forEach(funnel => {
          if (funnel && funnel.id) {
            statuses[funnel.id] = funnel.isActive;
          }
        });
        setFunnelStatuses(statuses);

        // Update total items for pagination
        setTotalItems(result.pagination?.total || funnelData.length || 0);
      } else {
        throw new Error(result.message || 'Failed to fetch funnels');
      }
    } catch (err) {
      console.error('Error fetching funnels:', err);
      setError(err.message);
      setTotalItems(0); // Reset total items on error
    } finally {
      setLoading(false);
    }
  };

  // Toggle funnel status
  const handleToggleFunnelStatus = async (funnelId) => {
    // Set loading state for this specific toggle
    setLoadingToggles(prev => ({ ...prev, [funnelId]: true }));

    try {
      const response = await fetch(`/api/admin/funnels/${funnelId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle funnel status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Update the status locally
        setFunnelStatuses(prev => ({
          ...prev,
          [funnelId]: result.data.isActive
        }));

        // Update the funnel in the list
        setFunnels(prev => prev.map(funnel =>
          funnel.id === funnelId
            ? { ...funnel, isActive: result.data.isActive }
            : funnel
        ));
      } else {
        throw new Error(result.message || 'Failed to update funnel status');
      }
    } catch (error) {
      console.error('Failed to update funnel status:', error);
      // Reset loading state
      setLoadingToggles(prev => ({ ...prev, [funnelId]: false }));
    } finally {
      // Remove loading state
      setLoadingToggles(prev => ({ ...prev, [funnelId]: false }));
    }
  };

  // Generate funnel URL
  const generateFunnelUrl = (funnelId, funnelName) => {
    const slug = funnelName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `https://funnelseye.com/f/${slug}-${funnelId}`;
  };

  // Copy URL to clipboard
  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
      console.log('URL copied to clipboard:', url);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  // Handle create form input changes
  const handleCreateFormChange = (field, value) => {
    setCreateForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle create funnel submission
  const handleCreateFunnel = async () => {
    if (!createForm.name.trim()) {
      console.error('Funnel name is required');
      return;
    }

    try {
      const response = await fetch('/api/admin/funnels', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: createForm.name.trim(),
          description: createForm.description.trim(),
          targetAudience: createForm.targetAudience,
          funnelUrl: createForm.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
          stages: [],
          coachId: null // Admin-created funnel
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create funnel: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log('Funnel created successfully:', result.data);

        // Reset form and close dialog
        setCreateForm({
          name: '',
          description: '',
          targetAudience: 'customer'
        });
        setIsCreateDialogOpen(false);

        // Refresh the funnels list
        fetchFunnels();
      } else {
        throw new Error(result.message || 'Failed to create funnel');
      }
    } catch (error) {
      console.error('Error creating funnel:', error);
    }
  };

  // Bulk actions
  const handleBulkActivate = async () => {
    setLoadingToggles(prev => {
      const updated = { ...prev };
      selectedFunnels.forEach(id => {
        updated[id] = true;
      });
      return updated;
    });

    try {
      const response = await fetch('/api/admin/funnels/bulk/activate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ funnelIds: selectedFunnels })
      });

      if (!response.ok) {
        throw new Error(`Failed to bulk activate funnels: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Update local state
        setFunnelStatuses(prev => {
          const updated = { ...prev };
          selectedFunnels.forEach(id => {
            updated[id] = true;
          });
          return updated;
        });

        setFunnels(prev => prev.map(funnel =>
          selectedFunnels.includes(funnel.id)
            ? { ...funnel, isActive: true }
            : funnel
        ));

        console.log('Bulk activated funnels:', selectedFunnels);
      } else {
        throw new Error(result.message || 'Failed to bulk activate funnels');
      }
    } catch (error) {
      console.error('Failed to bulk activate funnels:', error);
    } finally {
      setLoadingToggles(prev => {
        const updated = { ...prev };
        selectedFunnels.forEach(id => {
          updated[id] = false;
        });
        return updated;
      });
    }
  };

  const handleBulkDeactivate = async () => {
    setLoadingToggles(prev => {
      const updated = { ...prev };
      selectedFunnels.forEach(id => {
        updated[id] = true;
      });
      return updated;
    });

    try {
      const response = await fetch('/api/admin/funnels/bulk/deactivate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ funnelIds: selectedFunnels })
      });

      if (!response.ok) {
        throw new Error(`Failed to bulk deactivate funnels: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Update local state
        setFunnelStatuses(prev => {
          const updated = { ...prev };
          selectedFunnels.forEach(id => {
            updated[id] = false;
          });
          return updated;
        });

        setFunnels(prev => prev.map(funnel =>
          selectedFunnels.includes(funnel.id)
            ? { ...funnel, isActive: false }
            : funnel
        ));

        console.log('Bulk deactivated funnels:', selectedFunnels);
      } else {
        throw new Error(result.message || 'Failed to bulk deactivate funnels');
      }
    } catch (error) {
      console.error('Failed to bulk deactivate funnels:', error);
    } finally {
      setLoadingToggles(prev => {
        const updated = { ...prev };
        selectedFunnels.forEach(id => {
          updated[id] = false;
        });
        return updated;
      });
    }
  };

  const handleBulkDelete = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedFunnels.length} selected funnel(s)? This action cannot be undone.`);

    if (!confirmed) return;

    try {
      const response = await fetch('/api/admin/funnels/bulk/delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ funnelIds: selectedFunnels })
      });

      if (!response.ok) {
        throw new Error(`Failed to bulk delete funnels: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Remove deleted funnels from local state
        setFunnels(prev => prev.filter(funnel => !selectedFunnels.includes(funnel.id)));
        setSelectedFunnels([]);
        setFunnelStatuses(prev => {
          const updated = { ...prev };
          selectedFunnels.forEach(id => {
            delete updated[id];
          });
          return updated;
        });

        console.log('Bulk deleted funnels:', selectedFunnels);
      } else {
        throw new Error(result.message || 'Failed to bulk delete funnels');
      }
    } catch (error) {
      console.error('Failed to bulk delete funnels:', error);
    }
  };

  // Fetch funnels when component mounts or dependencies change
  React.useEffect(() => {
    fetchFunnels();
  }, [activeTab, currentPage, itemsPerPage, searchTerm]);

  // Reset pagination and search when switching tabs
  React.useEffect(() => {
    setCurrentPage(1);
    setSelectedFunnels([]);
    setSearchTerm('');
  }, [activeTab]);

  const EmptyState = ({ type }) => (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div className="mb-6 p-4 rounded-full bg-white">
        {type === 'customer' ? (
          <Users className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        ) : (
          <FileText className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
        )}
      </div>
      <div className="text-center space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          No {type === 'customer' ? 'Customer' : 'Coach'} Funnels Yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          Start by creating your first funnel
        </p>
        <Button
          onClick={() => navigate('/funnels/create')}
          className="mt-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-[5px]"
          size="sm"
        >
          <Sparkles className="h-4 w-4" />
          Create Your First Funnel
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Funnels Management
            </h1>
            <p className="text-gray-600 text-sm">
              Create and manage your sales funnels for maximum conversions
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-initial lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search funnels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-[5px] whitespace-nowrap"
                  size="default"
                >
                  <Plus className="h-5 w-5" />
                  Create Funnel
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-white">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-gray-900">Create New Funnel</DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Set up a new sales funnel to capture and convert your leads effectively.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="funnel-name" className="text-sm font-medium text-gray-700">
                      Funnel Name *
                    </Label>
                    <Input
                      id="funnel-name"
                      placeholder="Enter funnel name"
                      value={createForm.name}
                      onChange={(e) => handleCreateFormChange('name', e.target.value)}
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="funnel-description" className="text-sm font-medium text-gray-700">
                      Description
                    </Label>
                    <Textarea
                      id="funnel-description"
                      placeholder="Describe your funnel's purpose and goals"
                      value={createForm.description}
                      onChange={(e) => handleCreateFormChange('description', e.target.value)}
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 min-h-[100px] resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target-audience" className="text-sm font-medium text-gray-700">
                      Target Audience
                    </Label>
                    <Select
                      value={createForm.targetAudience}
                      onValueChange={(value) => handleCreateFormChange('targetAudience', value)}
                    >
                      <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select target audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="coach">Coach</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateFunnel}
                    disabled={!createForm.name.trim()}
                    className="px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    Create Funnel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-fit bg-gray-100 p-1 rounded-[6px]">
            <TabsTrigger
              value="customer"
              className="rounded-[6px] data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Users className="h-4 w-4 mr-2" />
              Customer Funnels
            </TabsTrigger>
            <TabsTrigger
              value="coach"
              className="rounded-[6px] data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              <FileText className="h-4 w-4 mr-2" />
              Coach Funnels
            </TabsTrigger>
          </TabsList>

          {/* Bulk Actions */}
          {selectedFunnels.length > 0 && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      {selectedFunnels.length} funnel{selectedFunnels.length > 1 ? 's' : ''} selected
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleBulkActivate}
                    size="sm"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                    disabled={(selectedFunnels || []).some(id => (loadingToggles || {})[id])}
                  >
                    {selectedFunnels.some(id => loadingToggles[id]) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    Activate
                  </Button>
                  <Button
                    onClick={handleBulkDeactivate}
                    size="sm"
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={(selectedFunnels || []).some(id => (loadingToggles || {})[id])}
                  >
                    {selectedFunnels.some(id => loadingToggles[id]) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Pause className="h-4 w-4" />
                    )}
                    Deactivate
                  </Button>
                  <Button
                    onClick={handleBulkDelete}
                    size="sm"
                    variant="destructive"
                    className="flex items-center gap-2"
                    disabled={(selectedFunnels || []).some(id => (loadingToggles || {})[id])}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                  <Button
                    onClick={() => setSelectedFunnels([])}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          )}

          <TabsContent value="customer" className="mt-6">
            <div className="bg-white rounded-[10px] border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200">
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedFunnels.length === currentFunnels.length && currentFunnels.length > 0}
                        onCheckedChange={() => handleSelectAll(currentFunnels)}
                      />
                    </TableHead>
                    <TableHead className="w-[80px] font-semibold text-gray-700 py-4">S. No.</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Funnel Overview</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Status & Activity</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Stages</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700 py-4">Quick Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentFunnels.length > 0 ? (
                    currentFunnels.map((funnel, index) => {
                      const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;
                      return (
                        <TableRow
                          key={funnel?.id || index}
                          className="hover:bg-gray-50 py-13 cursor-pointer"
                          onClick={() => funnel?.id && navigate(`/funnels/manage/${funnel.id}`)}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedFunnels.includes(funnel?.id)}
                              onCheckedChange={() => funnel?.id && handleSelectFunnel(funnel.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-gray-600">{serialNumber}</div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="font-semibold text-gray-900 text-lg">{funnel?.name || 'Unnamed Funnel'}</div>
                              <div className="text-sm text-gray-500">{funnel?.description || 'No description'}</div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" />
                                  {funnel?.funnelUrl ? `/${funnel.funnelUrl}` : 'Not set'}
                                </span>
                                {funnel?.funnelUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={() => copyToClipboard(`/${funnel.funnelUrl}`)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                {loadingToggles[funnel.id] ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-gray-500 scale-75" />
                                ) : (
                                  <Switch
                                    checked={funnelStatuses[funnel?.id] || false}
                                    onCheckedChange={() => funnel?.id && handleToggleFunnelStatus(funnel.id)}
                                    className={`scale-75 ${funnelStatuses[funnel?.id] ? 'data-[state=checked]:bg-green-600' : 'data-[state=unchecked]:bg-red-600'}`}
                                  />
                                )}
                                <Badge
                                  variant={funnelStatuses[funnel?.id] ? 'default' : 'secondary'}
                                  className={`text-xs ${funnelStatuses[funnel?.id] ? 'bg-green-100 text-green-800 border-green-200' : 'bg-orange-100 text-orange-800 border-orange-200'}`}
                                >
                                  {funnelStatuses[funnel?.id] ? (
                                    <><Play className="w-3 h-3 mr-1 text-green-600" />Active</>
                                  ) : (
                                    <><Pause className="w-3 h-3 mr-1 text-orange-600" />Inactive</>
                                  )}
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-gray-500">
                                  Created • {funnel?.createdAt ? new Date(funnel.createdAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                  }) : 'Unknown'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Updated • {funnel?.updatedAt ? new Date(funnel.updatedAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                  }) : 'Unknown'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Layers className="h-4 w-4 text-gray-500" />
                            {(funnel.stages || []).length} stages
                          </div>
                        </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50">
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow className="py-13">
                      <TableCell colSpan={6} className="p-0">
                        <EmptyState type="customer" />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {funnels.length > 0 && activeTab === 'customer' && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Show</span>
                  <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>entries</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="coach" className="mt-6">
            <div className="bg-white rounded-[10px] border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200">
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedFunnels.length === currentFunnels.length && currentFunnels.length > 0}
                        onCheckedChange={() => handleSelectAll(currentFunnels)}
                      />
                    </TableHead>
                    <TableHead className="w-[80px] font-semibold text-gray-700 py-4">S. No.</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Funnel Overview</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Status & Activity</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Stages</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700 py-4">Quick Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentFunnels.length > 0 ? (
                    currentFunnels.map((funnel, index) => {
                      const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;
                      return (
                        <TableRow
                          key={funnel?.id || index}
                          className="hover:bg-gray-50 py-13 cursor-pointer"
                          onClick={() => funnel?.id && navigate(`/funnels/manage/${funnel.id}`)}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedFunnels.includes(funnel?.id)}
                              onCheckedChange={() => funnel?.id && handleSelectFunnel(funnel.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-gray-600">{serialNumber}</div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="font-semibold text-gray-900 text-lg">{funnel?.name || 'Unnamed Funnel'}</div>
                              <div className="text-sm text-gray-500">{funnel?.description || 'No description'}</div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" />
                                  {funnel?.funnelUrl ? `/${funnel.funnelUrl}` : 'Not set'}
                                </span>
                                {funnel?.funnelUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={() => copyToClipboard(`/${funnel.funnelUrl}`)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                {loadingToggles[funnel.id] ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-gray-500 scale-75" />
                                ) : (
                                  <Switch
                                    checked={funnelStatuses[funnel?.id] || false}
                                    onCheckedChange={() => funnel?.id && handleToggleFunnelStatus(funnel.id)}
                                    className={`scale-75 ${funnelStatuses[funnel?.id] ? 'data-[state=checked]:bg-green-600' : 'data-[state=unchecked]:bg-red-600'}`}
                                  />
                                )}
                                <Badge
                                  variant={funnelStatuses[funnel?.id] ? 'default' : 'secondary'}
                                  className={`text-xs ${funnelStatuses[funnel?.id] ? 'bg-green-100 text-green-800 border-green-200' : 'bg-orange-100 text-orange-800 border-orange-200'}`}
                                >
                                  {funnelStatuses[funnel?.id] ? (
                                    <><Play className="w-3 h-3 mr-1 text-green-600" />Active</>
                                  ) : (
                                    <><Pause className="w-3 h-3 mr-1 text-orange-600" />Inactive</>
                                  )}
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-gray-500">
                                  Created • {funnel?.createdAt ? new Date(funnel.createdAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                  }) : 'Unknown'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Updated • {funnel?.updatedAt ? new Date(funnel.updatedAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                  }) : 'Unknown'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Layers className="h-4 w-4 text-gray-500" />
                            {(funnel.stages || []).length} stages
                          </div>
                        </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50">
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow className="py-13">
                      <TableCell colSpan={6} className="p-0">
                        <EmptyState type="coach" />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {funnels.length > 0 && activeTab === 'coach' && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Show</span>
                  <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>entries</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FunnelsManagement;