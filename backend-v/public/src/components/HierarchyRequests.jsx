import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Settings,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  FileText,
  BarChart3,
  PieChart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const HierarchyRequests = () => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Dialog states
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [bulkProcessDialogOpen, setBulkProcessDialogOpen] = useState(false);
  
  // Form states
  const [processForm, setProcessForm] = useState({
    status: '',
    adminNotes: ''
  });

  // Load requests data
  const loadRequests = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage
      };
      
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (typeFilter && typeFilter !== 'all') {
        params.requestType = typeFilter;
      }
      
      console.log('📋 [HierarchyRequests] Loading requests with params:', params);
      
      const response = await axios.get('/admin/hierarchy/requests', { params });
      console.log('📋 [HierarchyRequests] Requests response:', response.data);
      
      if (response.data.success) {
        setRequests(response.data.data.requests);
        setTotalPages(response.data.data.pagination.pages);
      } else {
        showToast(response.data.message || 'Failed to load requests', 'error');
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      showToast('Error loading requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load analytics data
  const loadAnalytics = async () => {
    try {
      const response = await axios.get('/admin/hierarchy/analytics');
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  useEffect(() => {
    loadRequests();
    loadAnalytics();
  }, [currentPage, statusFilter, typeFilter]);

  // Process single request
  const processRequest = async () => {
    if (!selectedRequest || !processForm.status) {
      showToast('Please select a status', 'warning');
      return;
    }

    try {
      const response = await axios.put(`/admin/hierarchy/requests/${selectedRequest._id}/process`, {
        status: processForm.status,
        adminNotes: processForm.adminNotes
      });

      if (response.data.success) {
        showToast(`Request ${processForm.status} successfully`, 'success');
        setProcessDialogOpen(false);
        setRequestDialogOpen(false);
        setProcessForm({ status: '', adminNotes: '' });
        loadRequests();
        loadAnalytics();
      } else {
        showToast(response.data.message || 'Failed to process request', 'error');
      }
    } catch (error) {
      console.error('Error processing request:', error);
      showToast('Error processing request', 'error');
    }
  };

  // Bulk process requests
  const bulkProcessRequests = async () => {
    if (selectedRequests.length === 0) {
      showToast('Please select requests first', 'warning');
      return;
    }

    if (!processForm.status) {
      showToast('Please select a status', 'warning');
      return;
    }

    try {
      const response = await axios.post('/admin/hierarchy/requests/bulk-process', {
        requestIds: selectedRequests,
        status: processForm.status,
        adminNotes: processForm.adminNotes
      });

      if (response.data.success) {
        showToast(`Successfully ${processForm.status} ${response.data.data.processedCount} requests`, 'success');
        setBulkProcessDialogOpen(false);
        setProcessForm({ status: '', adminNotes: '' });
        setSelectedRequests([]);
        loadRequests();
        loadAnalytics();
      } else {
        showToast(response.data.message || 'Failed to bulk process requests', 'error');
      }
    } catch (error) {
      console.error('Error bulk processing requests:', error);
      showToast('Error bulk processing requests', 'error');
    }
  };

  // Open request details dialog
  const openRequestDialog = async (requestId) => {
    try {
      const response = await axios.get(`/admin/hierarchy/requests/${requestId}`);
      if (response.data.success) {
        setSelectedRequest(response.data.data);
        setRequestDialogOpen(true);
      } else {
        showToast(response.data.message || 'Failed to load request details', 'error');
      }
    } catch (error) {
      console.error('Error loading request details:', error);
      showToast('Error loading request details', 'error');
    }
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get request type badge
  const getRequestTypeBadge = (type) => {
    switch (type) {
      case 'hierarchy_change':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Hierarchy Change</Badge>;
      case 'level_change':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Level Change</Badge>;
      case 'sponsor_change':
        return <Badge variant="default" className="bg-orange-100 text-orange-800">Sponsor Change</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Handle request selection
  const handleRequestSelection = (requestId, isSelected) => {
    if (isSelected) {
      setSelectedRequests(prev => [...prev, requestId]);
    } else {
      setSelectedRequests(prev => prev.filter(id => id !== requestId));
    }
  };

  // Select all requests
  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedRequests(requests.map(req => req._id));
    } else {
      setSelectedRequests([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hierarchy Change Requests</h1>
          <p className="text-muted-foreground">Manage coach hierarchy change requests</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadRequests} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.statusDistribution.reduce((sum, item) => sum + item.count, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                All time requests
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.statusDistribution.find(item => item.status === 'pending')?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.statusDistribution.find(item => item.status === 'approved')?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully processed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.processingTime.avgProcessingTime.toFixed(1)}h
              </div>
              <p className="text-xs text-muted-foreground">
                Average response time
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by coach name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Request Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hierarchy_change">Hierarchy Change</SelectItem>
                  <SelectItem value="level_change">Level Change</SelectItem>
                  <SelectItem value="sponsor_change">Sponsor Change</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={loadRequests} className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedRequests.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {selectedRequests.length} request(s) selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setBulkProcessDialogOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Bulk Process
                </Button>
                <Button
                  onClick={() => setSelectedRequests([])}
                  variant="ghost"
                  size="sm"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Hierarchy Change Requests</CardTitle>
          <CardDescription>
            Review and process coach hierarchy change requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading requests...
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedRequests.length === requests.length && requests.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead>Request Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedRequests.includes(request._id)}
                          onChange={(e) => handleRequestSelection(request._id, e.target.checked)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.coachId?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {request.coachId?.email}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {request.coachId?.selfCoachId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRequestTypeBadge(request.requestType)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(request.createdAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => openRequestDialog(request._id)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Review the hierarchy change request details
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Coach Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Coach Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm">{selectedRequest.coachId?.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm">{selectedRequest.coachId?.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Coach ID</Label>
                      <p className="text-sm">{selectedRequest.coachId?.selfCoachId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Current Level</Label>
                      <p className="text-sm">{selectedRequest.coachId?.currentLevel}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Request Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Request Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Request Type</Label>
                        <div className="mt-1">
                          {getRequestTypeBadge(selectedRequest.requestType)}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="mt-1">
                          {getStatusBadge(selectedRequest.status)}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Reason</Label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                        {selectedRequest.reason}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Created</Label>
                      <p className="text-sm">
                        {new Date(selectedRequest.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current vs Requested Data */}
              <Card>
                <CardHeader>
                  <CardTitle>Changes Requested</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Current Data</Label>
                        <div className="mt-2 p-3 bg-muted rounded-md">
                          <pre className="text-xs whitespace-pre-wrap">
                            {JSON.stringify(selectedRequest.currentData, null, 2)}
                          </pre>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Requested Data</Label>
                        <div className="mt-2 p-3 bg-muted rounded-md">
                          <pre className="text-xs whitespace-pre-wrap">
                            {JSON.stringify(selectedRequest.requestedData, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Notes */}
              {selectedRequest.adminNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm p-3 bg-muted rounded-md">
                      {selectedRequest.adminNotes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedRequest?.status === 'pending' && (
              <Button onClick={() => setProcessDialogOpen(true)}>
                Process Request
              </Button>
            )}
            <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Request Dialog */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Request</DialogTitle>
            <DialogDescription>
              Approve or reject this hierarchy change request
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Decision</Label>
              <Select value={processForm.status} onValueChange={(value) => setProcessForm(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approve</SelectItem>
                  <SelectItem value="rejected">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <Textarea
                id="adminNotes"
                placeholder="Add notes about your decision..."
                value={processForm.adminNotes}
                onChange={(e) => setProcessForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={processRequest}>
              {processForm.status === 'approved' ? 'Approve' : 'Reject'} Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Process Dialog */}
      <Dialog open={bulkProcessDialogOpen} onOpenChange={setBulkProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Process Requests</DialogTitle>
            <DialogDescription>
              Process {selectedRequests.length} selected requests
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulkStatus">Decision</Label>
              <Select value={processForm.status} onValueChange={(value) => setProcessForm(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approve All</SelectItem>
                  <SelectItem value="rejected">Reject All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bulkAdminNotes">Admin Notes</Label>
              <Textarea
                id="bulkAdminNotes"
                placeholder="Add notes for all requests..."
                value={processForm.adminNotes}
                onChange={(e) => setProcessForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkProcessDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={bulkProcessRequests}>
              {processForm.status === 'approved' ? 'Approve' : 'Reject'} All Requests
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HierarchyRequests;
