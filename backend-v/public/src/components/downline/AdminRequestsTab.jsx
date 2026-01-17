import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { RefreshCw, Search, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import axios from 'axios';

const AdminRequestsTab = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [processDialogOpen, setProcessDialogOpen] = useState(false);
    const [processData, setProcessData] = useState({
        status: '',
        adminNotes: ''
    });
    const { showToast } = useToast();

    // Fetch pending admin requests
    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/advanced-mlm/admin/pending-requests');
            if (response.data.success) {
                setRequests(response.data.data);
            } else {
                showToast('Failed to fetch admin requests', 'error');
            }
        } catch (error) {
            console.error('Error fetching admin requests:', error);
            showToast('Error fetching admin requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Process admin request
    const processRequest = async () => {
        if (!selectedRequest || !processData.status) {
            showToast('Please select a status', 'error');
            return;
        }

        setIsProcessing(true);
        try {
            const response = await axios.put(
                `/advanced-mlm/admin/process-request/${selectedRequest._id}`,
                {
                    status: processData.status,
                    adminNotes: processData.adminNotes
                }
            );

            if (response.data.success) {
                showToast(`Request ${processData.status} successfully`, 'success');
                setProcessDialogOpen(false);
                setProcessData({ status: '', adminNotes: '' });
                setSelectedRequest(null);
                fetchRequests(); // Refresh the list
            } else {
                showToast('Failed to process request', 'error');
            }
        } catch (error) {
            console.error('Error processing request:', error);
            showToast('Error processing request', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    // Filter requests based on search and status
    const filteredRequests = requests.filter(request => {
        const matchesSearch = 
            request.coachId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.requestType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.reason?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    // Get status badge variant
    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'pending': return 'default';
            case 'approved': return 'default';
            case 'rejected': return 'destructive';
            default: return 'secondary';
        }
    };

    // Get request type display name
    const getRequestTypeDisplay = (type) => {
        switch (type) {
            case 'sponsor_change': return 'Sponsor Change';
            case 'level_change': return 'Level Change';
            case 'team_rank_change': return 'Team Rank Change';
            case 'president_team_rank_change': return 'President Team Rank Change';
            default: return type;
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Admin Requests</h2>
                    <p className="text-muted-foreground">
                        Review and process pending admin requests from coaches
                    </p>
                </div>
                <Button onClick={fetchRequests} disabled={loading} variant="outline">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="search">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Search by coach name, request type, or reason..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Requests Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Admin Requests ({filteredRequests.length})</CardTitle>
                    <CardDescription>
                        Click on a request to view details and process it
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                            Loading requests...
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <Alert>
                            <Clock className="h-4 w-4" />
                            <AlertDescription>
                                No admin requests found matching your criteria.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Coach</TableHead>
                                    <TableHead>Request Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRequests.map((request) => (
                                    <TableRow key={request._id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {request.coachId?.name || 'Unknown Coach'}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {request.coachId?.email || 'No email'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {getRequestTypeDisplay(request.requestType)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(request.status)}>
                                                {request.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {request.reason}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSelectedRequest(request)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Request Details</DialogTitle>
                                                        <DialogDescription>
                                                            Review the request details before processing
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    {selectedRequest && (
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <Label>Coach</Label>
                                                                    <div className="font-medium">
                                                                        {selectedRequest.coachId?.name}
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {selectedRequest.coachId?.email}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <Label>Request Type</Label>
                                                                    <Badge variant="outline">
                                                                        {getRequestTypeDisplay(selectedRequest.requestType)}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <Label>Reason</Label>
                                                                <div className="p-3 bg-muted rounded-md">
                                                                    {selectedRequest.reason}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <Label>Requested Data</Label>
                                                                <div className="p-3 bg-muted rounded-md">
                                                                    <pre className="text-sm">
                                                                        {JSON.stringify(selectedRequest.requestedData, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            </div>
                                                            {selectedRequest.status === 'pending' && (
                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <Label htmlFor="status">Decision</Label>
                                                                        <Select
                                                                            value={processData.status}
                                                                            onValueChange={(value) => 
                                                                                setProcessData(prev => ({ ...prev, status: value }))
                                                                            }
                                                                        >
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select decision" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="approved">Approve</SelectItem>
                                                                                <SelectItem value="rejected">Reject</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                    <div>
                                                                        <Label htmlFor="adminNotes">Admin Notes</Label>
                                                                        <Textarea
                                                                            id="adminNotes"
                                                                            placeholder="Add notes about your decision..."
                                                                            value={processData.adminNotes}
                                                                            onChange={(e) => 
                                                                                setProcessData(prev => ({ ...prev, adminNotes: e.target.value }))
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <DialogFooter>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setProcessDialogOpen(false);
                                                                setSelectedRequest(null);
                                                                setProcessData({ status: '', adminNotes: '' });
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        {selectedRequest?.status === 'pending' && (
                                                            <Button
                                                                onClick={processRequest}
                                                                disabled={isProcessing || !processData.status}
                                                            >
                                                                {isProcessing ? (
                                                                    <>
                                                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                                        Processing...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {processData.status === 'approved' ? (
                                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                                        ) : (
                                                                            <XCircle className="h-4 w-4 mr-2" />
                                                                        )}
                                                                        {processData.status === 'approved' ? 'Approve' : 'Reject'}
                                                                    </>
                                                                )}
                                                            </Button>
                                                        )}
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminRequestsTab;
