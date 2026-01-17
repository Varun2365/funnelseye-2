import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';

const SupportTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [agents, setAgents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('tickets');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const { showToast } = useToast();

    // Form states
    const [ticketForm, setTicketForm] = useState({
        subject: '',
        description: '',
        priority: 'medium',
        category: '',
        assignedTo: '',
        status: 'open'
    });

    const [replyForm, setReplyForm] = useState({
        message: '',
        isInternal: false
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchTickets(),
                fetchAgents(),
                fetchCategories()
            ]);
        } catch (error) {
            console.error('Error fetching support data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTickets = async () => {
        try {
            const response = await axios.get('/api/admin/support/tickets');
            setTickets(response.data.data || []);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        }
    };

    const fetchAgents = async () => {
        try {
            const response = await axios.get('/api/admin/support/agents');
            setAgents(response.data.data || []);
        } catch (error) {
            console.error('Error fetching agents:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/admin/support/categories');
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const createTicket = async () => {
        setSaving(true);
        try {
            await axios.post('/api/admin/support/tickets', ticketForm);
            showToast('Ticket created successfully', 'success');
            setTicketForm({
                subject: '',
                description: '',
                priority: 'medium',
                category: '',
                assignedTo: '',
                status: 'open'
            });
            await fetchTickets();
        } catch (error) {
            console.error('Error creating ticket:', error);
            showToast('Error creating ticket', 'error');
        } finally {
            setSaving(false);
        }
    };

    const updateTicketStatus = async (ticketId, newStatus) => {
        try {
            await axios.patch(`/api/admin/support/tickets/${ticketId}`, {
                status: newStatus
            });
            showToast('Ticket status updated', 'success');
            await fetchTickets();
        } catch (error) {
            console.error('Error updating ticket status:', error);
            showToast('Error updating ticket status', 'error');
        }
    };

    const assignTicket = async (ticketId, agentId) => {
        try {
            await axios.patch(`/api/admin/support/tickets/${ticketId}`, {
                assignedTo: agentId
            });
            showToast('Ticket assigned successfully', 'success');
            await fetchTickets();
        } catch (error) {
            console.error('Error assigning ticket:', error);
            showToast('Error assigning ticket', 'error');
        }
    };

    const addReply = async (ticketId) => {
        if (!replyForm.message.trim()) {
            showToast('Please enter a reply message', 'error');
            return;
        }

        setSaving(true);
        try {
            await axios.post(`/api/admin/support/tickets/${ticketId}/replies`, replyForm);
            showToast('Reply added successfully', 'success');
            setReplyForm({ message: '', isInternal: false });
            await fetchTickets();
            setSelectedTicket(null);
        } catch (error) {
            console.error('Error adding reply:', error);
            showToast('Error adding reply', 'error');
        } finally {
            setSaving(false);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'destructive';
            case 'high': return 'destructive';
            case 'medium': return 'default';
            case 'low': return 'secondary';
            default: return 'secondary';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'default';
            case 'in_progress': return 'secondary';
            case 'resolved': return 'outline';
            case 'closed': return 'secondary';
            default: return 'secondary';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'open': return 'Open';
            case 'in_progress': return 'In Progress';
            case 'resolved': return 'Resolved';
            case 'closed': return 'Closed';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading support data...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Support & Ticketing System</h1>
                <p className="text-muted-foreground">
                    Manage support tickets, assign agents, and track customer issues
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="tickets">All Tickets</TabsTrigger>
                    <TabsTrigger value="create">Create Ticket</TabsTrigger>
                    <TabsTrigger value="agents">Support Agents</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="tickets" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Support Tickets</CardTitle>
                            <CardDescription>
                                View and manage all support tickets
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {tickets.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Assigned To</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tickets.map((ticket) => (
                                            <TableRow key={ticket._id}>
                                                <TableCell className="font-mono text-sm">
                                                    #{ticket.ticketId}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {ticket.subject}
                                                </TableCell>
                                                <TableCell>
                                                    {ticket.customerId?.firstName} {ticket.customerId?.lastName}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getPriorityColor(ticket.priority)}>
                                                        {ticket.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusColor(ticket.status)}>
                                                        {getStatusText(ticket.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {ticket.assignedTo ? 
                                                        `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : 
                                                        'Unassigned'
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setSelectedTicket(ticket)}
                                                        >
                                                            View
                                                        </Button>
                                                        <Select onValueChange={(value) => updateTicketStatus(ticket._id, value)}>
                                                            <SelectTrigger className="w-32">
                                                                <SelectValue placeholder="Status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="open">Open</SelectItem>
                                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                                <SelectItem value="resolved">Resolved</SelectItem>
                                                                <SelectItem value="closed">Closed</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Select onValueChange={(value) => assignTicket(ticket._id, value)}>
                                                            <SelectTrigger className="w-32">
                                                                <SelectValue placeholder="Assign" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="">Unassign</SelectItem>
                                                                {agents.map((agent) => (
                                                                    <SelectItem key={agent._id} value={agent._id}>
                                                                        {agent.firstName} {agent.lastName}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No tickets found
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="create" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Ticket</CardTitle>
                            <CardDescription>
                                Create a new support ticket manually
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ticketSubject">Subject</Label>
                                    <Input
                                        id="ticketSubject"
                                        value={ticketForm.subject}
                                        onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                                        placeholder="Enter ticket subject"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ticketCategory">Category</Label>
                                    <Select value={ticketForm.category} onValueChange={(value) => setTicketForm({ ...ticketForm, category: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category._id} value={category._id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ticketPriority">Priority</Label>
                                    <Select value={ticketForm.priority} onValueChange={(value) => setTicketForm({ ...ticketForm, priority: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ticketStatus">Status</Label>
                                    <Select value={ticketForm.status} onValueChange={(value) => setTicketForm({ ...ticketForm, status: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="open">Open</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ticketAssignedTo">Assign To</Label>
                                    <Select value={ticketForm.assignedTo} onValueChange={(value) => setTicketForm({ ...ticketForm, assignedTo: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select agent" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Unassigned</SelectItem>
                                            {agents.map((agent) => (
                                                <SelectItem key={agent._id} value={agent._id}>
                                                    {agent.firstName} {agent.lastName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ticketDescription">Description</Label>
                                <Textarea
                                    id="ticketDescription"
                                    value={ticketForm.description}
                                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                                    placeholder="Describe the issue or request"
                                    rows={4}
                                />
                            </div>
                            <Button onClick={createTicket} disabled={saving}>
                                {saving ? "Creating..." : "Create Ticket"}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="agents" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Support Agents</CardTitle>
                            <CardDescription>
                                Manage support team members and their performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {agents.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Active Tickets</TableHead>
                                            <TableHead>Performance</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {agents.map((agent) => (
                                            <TableRow key={agent._id}>
                                                <TableCell className="font-medium">
                                                    {agent.firstName} {agent.lastName}
                                                </TableCell>
                                                <TableCell>{agent.email}</TableCell>
                                                <TableCell>{agent.role}</TableCell>
                                                <TableCell>
                                                    {tickets.filter(t => t.assignedTo?._id === agent._id && t.status !== 'closed').length}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">View Details</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="default">Active</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No support agents found
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{tickets.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    All time
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">
                                    {tickets.filter(t => t.status === 'open').length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Require attention
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">
                                    {tickets.filter(t => t.status === 'in_progress').length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Being worked on
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {tickets.filter(t => t.status === 'resolved').length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Successfully closed
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-background rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">
                                Ticket #{selectedTicket.ticketId} - {selectedTicket.subject}
                            </h2>
                            <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                                Close
                            </Button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Customer:</span> {selectedTicket.customerId?.firstName} {selectedTicket.customerId?.lastName}
                                </div>
                                <div>
                                    <span className="font-medium">Priority:</span> 
                                    <Badge variant={getPriorityColor(selectedTicket.priority)} className="ml-2">
                                        {selectedTicket.priority}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="font-medium">Status:</span> 
                                    <Badge variant={getStatusColor(selectedTicket.status)} className="ml-2">
                                        {getStatusText(selectedTicket.status)}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="font-medium">Created:</span> {new Date(selectedTicket.createdAt).toLocaleString()}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-medium mb-2">Description:</h3>
                                <p className="text-sm text-muted-foreground">{selectedTicket.description}</p>
                            </div>

                            {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                                <div>
                                    <h3 className="font-medium mb-2">Replies:</h3>
                                    <div className="space-y-2">
                                        {selectedTicket.replies.map((reply, index) => (
                                            <div key={index} className="border-l-2 border-primary pl-4 py-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium">
                                                        {reply.isInternal ? 'Internal Note' : 'Reply'}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {new Date(reply.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm mt-1">{reply.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="font-medium mb-2">Add Reply:</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="internalNote"
                                            checked={replyForm.isInternal}
                                            onChange={(e) => setReplyForm({ ...replyForm, isInternal: e.target.checked })}
                                        />
                                        <Label htmlFor="internalNote">Internal Note (not visible to customer)</Label>
                                    </div>
                                    <Textarea
                                        value={replyForm.message}
                                        onChange={(e) => setReplyForm({ ...replyForm, message: e.target.value })}
                                        placeholder="Enter your reply..."
                                        rows={3}
                                    />
                                    <Button onClick={() => addReply(selectedTicket._id)} disabled={saving}>
                                        {saving ? "Adding..." : "Add Reply"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportTickets;
