import React, { useState, useEffect, useCallback } from 'react';
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
import { RefreshCw, Search, Users, ArrowUpDown, Settings, Eye } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import axios from 'axios';
import HierarchyVisualization from './HierarchyVisualization';

const HierarchyManagementTab = () => {
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalCoaches: 0,
        hasNext: false,
        hasPrev: false,
    });
    const [selectedCoach, setSelectedCoach] = useState(null);
    const [hierarchyData, setHierarchyData] = useState(null);
    const [hierarchyDialogOpen, setHierarchyDialogOpen] = useState(false);
    const [changeUplineDialogOpen, setChangeUplineDialogOpen] = useState(false);
    const [changeUplineData, setChangeUplineData] = useState({
        coachId: '',
        coachSearch: '',
        newUplineId: '',
        newUplineName: '',
        uplineSearch: '',
        isExternalSponsor: false
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const { showToast } = useToast();

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchCoaches();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Fetch coaches for hierarchy management
    const fetchCoaches = useCallback(async () => {
        setLoading(true);
        try {
            console.log('Fetching coaches...');
            const params = new URLSearchParams({
                page: pagination.currentPage.toString(),
                limit: '20',
                ...(searchTerm ? { search: searchTerm } : {}),
            });
            const response = await axios.get(`/advanced-mlm/admin/coaches?${params}`);
            console.log('Coaches response:', response.data);
            if (response.data.success) {
                setCoaches(response.data.data.coaches || []);
                setPagination(response.data.data.pagination || {
                    currentPage: 1,
                    totalPages: 0,
                    totalCoaches: 0,
                    hasNext: false,
                    hasPrev: false,
                });
                console.log('Set coaches:', response.data.data.coaches || []);
            } else {
                showToast('Failed to fetch coaches', 'error');
            }
        } catch (error) {
            console.error('Error fetching coaches:', error);
            showToast('Error fetching coaches', 'error');
        } finally {
            setLoading(false);
        }
    }, [pagination.currentPage, searchTerm, showToast]);

    // Fetch hierarchy for a specific coach
    const fetchHierarchy = async (coachId) => {
        try {
            console.log('Fetching hierarchy for coachId:', coachId);
            const response = await axios.get(`/advanced-mlm/admin/hierarchy/${coachId}`);
            console.log('Hierarchy response:', response.data);
            if (response.data.success) {
                setHierarchyData(response.data.data);
                setHierarchyDialogOpen(true);
            } else {
                showToast('Failed to fetch hierarchy', 'error');
            }
        } catch (error) {
            console.error('Error fetching hierarchy:', error);
            showToast('Error fetching hierarchy', 'error');
        }
    };

    // Change coach upline
    const changeUpline = async () => {
        if (!changeUplineData.coachId || !changeUplineData.newUplineName) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        setIsProcessing(true);
        try {
            const response = await axios.put('/advanced-mlm/admin/change-upline', changeUplineData);
            if (response.data.success) {
                showToast('Upline changed successfully', 'success');
                setChangeUplineDialogOpen(false);
                setChangeUplineData({
                    coachId: '',
                    coachSearch: '',
                    newUplineId: '',
                    newUplineName: '',
                    uplineSearch: '',
                    isExternalSponsor: false
                });
                fetchCoaches(); // Refresh the list
            } else {
                showToast('Failed to change upline', 'error');
            }
        } catch (error) {
            console.error('Error changing upline:', error);
            showToast('Error changing upline', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    // Use coaches directly since search is now server-side
    const filteredCoaches = coaches;

    useEffect(() => {
        fetchCoaches();
    }, [fetchCoaches]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Hierarchy Management</h2>
                    <p className="text-muted-foreground">
                        Manage coach hierarchy, upline changes, and team structure
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchCoaches} disabled={loading} variant="outline">
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Dialog open={changeUplineDialogOpen} onOpenChange={setChangeUplineDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <ArrowUpDown className="h-4 w-4 mr-2" />
                                Change Upline
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Change Coach Upline</DialogTitle>
                                <DialogDescription>
                                    Change the upline sponsor for a coach
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="coachId">Coach</Label>
                                    <Select
                                        value={changeUplineData.coachId}
                                        onValueChange={(value) => 
                                            setChangeUplineData(prev => ({ ...prev, coachId: value }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Search and select coach" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <div className="p-2">
                                                <Input
                                                    placeholder="Search coaches..."
                                                    value={changeUplineData.coachSearch || ''}
                                                    onChange={(e) => 
                                                        setChangeUplineData(prev => ({ ...prev, coachSearch: e.target.value }))
                                                    }
                                                    className="mb-2"
                                                />
                                            </div>
                                            {coaches
                                                .filter(coach => 
                                                    !changeUplineData.coachSearch || 
                                                    coach.name?.toLowerCase().includes(changeUplineData.coachSearch.toLowerCase()) ||
                                                    coach.email?.toLowerCase().includes(changeUplineData.coachSearch.toLowerCase()) ||
                                                    coach.selfCoachId?.toLowerCase().includes(changeUplineData.coachSearch.toLowerCase())
                                                )
                                                .map((coach) => (
                                                    <SelectItem key={coach._id} value={coach._id}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{coach.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {coach.email} • ID: {coach.selfCoachId}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="newUplineName">New Upline Sponsor</Label>
                                    <Select
                                        value={changeUplineData.newUplineId}
                                        onValueChange={(value) => {
                                            const selectedCoach = coaches.find(coach => coach._id === value);
                                            setChangeUplineData(prev => ({ 
                                                ...prev, 
                                                newUplineId: value,
                                                newUplineName: selectedCoach?.name || ''
                                            }));
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Search and select new upline sponsor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <div className="p-2">
                                                <Input
                                                    placeholder="Search upline sponsors..."
                                                    value={changeUplineData.uplineSearch || ''}
                                                    onChange={(e) => 
                                                        setChangeUplineData(prev => ({ ...prev, uplineSearch: e.target.value }))
                                                    }
                                                    className="mb-2"
                                                />
                                            </div>
                                            {coaches
                                                .filter(coach => 
                                                    !changeUplineData.uplineSearch || 
                                                    coach.name?.toLowerCase().includes(changeUplineData.uplineSearch.toLowerCase()) ||
                                                    coach.email?.toLowerCase().includes(changeUplineData.uplineSearch.toLowerCase()) ||
                                                    coach.selfCoachId?.toLowerCase().includes(changeUplineData.uplineSearch.toLowerCase())
                                                )
                                                .map((coach) => (
                                                    <SelectItem key={coach._id} value={coach._id}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{coach.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {coach.email} • ID: {coach.selfCoachId}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isExternalSponsor"
                                        checked={changeUplineData.isExternalSponsor}
                                        onChange={(e) => 
                                            setChangeUplineData(prev => ({ ...prev, isExternalSponsor: e.target.checked }))
                                        }
                                    />
                                    <Label htmlFor="isExternalSponsor">External Sponsor</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setChangeUplineDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={changeUpline}
                                    disabled={isProcessing || !changeUplineData.coachId || !changeUplineData.newUplineName}
                                >
                                    {isProcessing ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Change Upline'
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Search */}
            <Card>
                <CardHeader>
                    <CardTitle>Search Coaches</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by coach name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Coaches Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Coaches ({pagination.totalCoaches})</CardTitle>
                    <CardDescription>
                        Click on a coach to view their hierarchy
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
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Coach</TableHead>
                                        <TableHead>Current Level</TableHead>
                                        <TableHead>Sponsor</TableHead>
                                        <TableHead>Team Size</TableHead>
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
                                                {coach.sponsorId?.name || 'No Sponsor'}
                                            </TableCell>
                                            <TableCell>
                                                {coach.teamSize || 0} members
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedCoach(coach);
                                                        fetchHierarchy(coach._id);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View Visual Hierarchy
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {((pagination.currentPage - 1) * 20) + 1} to{' '}
                                    {Math.min(pagination.currentPage * 20, pagination.totalCoaches)} of{' '}
                                    {pagination.totalCoaches} coaches
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!pagination.hasPrev}
                                        onClick={() => {
                                            setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
                                        }}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm">
                                        Page {pagination.currentPage} of {pagination.totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!pagination.hasNext}
                                        onClick={() => {
                                            setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
                                        }}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Hierarchy Dialog */}
            <Dialog open={hierarchyDialogOpen} onOpenChange={setHierarchyDialogOpen}>
                <DialogContent 
                    className="overflow-auto"
                    style={{ 
                        width: '60vw', 
                        height: '95vh', 
                        maxWidth: 'none',
                        maxHeight: 'none'
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>
                            Hierarchy Structure - {selectedCoach?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Visual representation of the complete downline hierarchy
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {hierarchyData && (
                            <HierarchyVisualization 
                                hierarchyData={hierarchyData} 
                                coachName={selectedCoach?.name} 
                            />
                        )}
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setHierarchyDialogOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HierarchyManagementTab;
