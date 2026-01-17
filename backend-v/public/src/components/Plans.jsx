import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Download
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import axios from 'axios';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    billingCycle: 'monthly',
    features: [],
    isActive: true,
    maxUsers: '',
    maxStorage: '',
    maxProjects: '',
    supportLevel: 'basic'
  });
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/subscriptions/plans');
      setPlans(response.data.data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPlan) {
        // Update existing plan
        await axios.put(`/api/subscriptions/plans/${selectedPlan._id}`, planForm);
      } else {
        // Create new plan
        await axios.post('/api/subscriptions/plans', planForm);
      }
      
      setDialogOpen(false);
      setSelectedPlan(null);
      resetForm();
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      setError('Failed to save plan');
    }
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency || 'USD',
      billingCycle: plan.billingCycle || 'monthly',
      features: plan.features || [],
      isActive: plan.isActive,
      maxUsers: plan.maxUsers || '',
      maxStorage: plan.maxStorage || '',
      maxProjects: plan.maxProjects || '',
      supportLevel: plan.supportLevel || 'basic'
    });
    setDialogOpen(true);
  };

  const handleDelete = async (planId) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/subscriptions/plans/${planId}`);
      fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      setError('Failed to delete plan');
    }
  };

  const handleDuplicate = async (plan) => {
    const duplicatedPlan = {
      ...planForm,
      name: `${plan.name} (Copy)`,
      isActive: false
    };
    delete duplicatedPlan._id;
    
    try {
      await axios.post('/api/subscriptions/plans', duplicatedPlan);
      fetchPlans();
    } catch (error) {
      console.error('Error duplicating plan:', error);
      setError('Failed to duplicate plan');
    }
  };

  const resetForm = () => {
    setPlanForm({
      name: '',
      description: '',
      price: '',
      currency: 'USD',
      billingCycle: 'monthly',
      features: [],
      isActive: true,
      maxUsers: '',
      maxStorage: '',
      maxProjects: '',
      supportLevel: 'basic'
    });
    setNewFeature('');
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setPlanForm(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setPlanForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const getBillingCycleBadge = (cycle) => {
    const variants = {
      monthly: 'default',
      yearly: 'secondary',
      quarterly: 'outline',
      weekly: 'destructive'
    };
    return <Badge variant={variants[cycle] || 'outline'}>{cycle}</Badge>;
  };

  const getSupportLevelBadge = (level) => {
    const colors = {
      basic: 'bg-gray-100 text-gray-800',
      standard: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-green-100 text-green-800'
    };
    return <Badge className={colors[level] || 'bg-gray-100 text-gray-800'}>{level}</Badge>;
  };

  if (loading && plans.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Manage subscription plans and pricing for coaches and users.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchPlans} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Plans ({plans.filter(p => p.isActive).length})</CardTitle>
          <CardDescription>
            Manage subscription plans and their features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Billing Cycle</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Limits</TableHead>
                <TableHead>Support</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan._id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{plan.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {plan.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">
                      ${plan.price}
                      <span className="text-sm text-muted-foreground ml-1">
                        /{plan.billingCycle}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getBillingCycleBadge(plan.billingCycle)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {plan.features?.slice(0, 3).map((feature, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {feature}
                        </div>
                      ))}
                      {plan.features?.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          +{plan.features.length - 3} more
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      {plan.maxUsers && <div>Users: {plan.maxUsers}</div>}
                      {plan.maxStorage && <div>Storage: {plan.maxStorage}</div>}
                      {plan.maxProjects && <div>Projects: {plan.maxProjects}</div>}
                    </div>
                  </TableCell>
                  <TableCell>{getSupportLevelBadge(plan.supportLevel)}</TableCell>
                  <TableCell>
                    <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(plan)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Plan
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(plan)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(plan._id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Plan Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? 'Edit Plan' : 'Create New Plan'}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan ? 'Update plan information and features.' : 'Create a new subscription plan for your platform.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  value={planForm.name}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Basic Plan"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={planForm.price}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={planForm.description}
                onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this plan offers..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={planForm.currency} onValueChange={(value) => setPlanForm(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingCycle">Billing Cycle</Label>
                <Select value={planForm.billingCycle} onValueChange={(value) => setPlanForm(prev => ({ ...prev, billingCycle: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportLevel">Support Level</Label>
                <Select value={planForm.supportLevel} onValueChange={(value) => setPlanForm(prev => ({ ...prev, supportLevel: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxUsers">Max Users</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={planForm.maxUsers}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, maxUsers: e.target.value }))}
                  placeholder="Unlimited"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStorage">Max Storage (GB)</Label>
                <Input
                  id="maxStorage"
                  type="number"
                  value={planForm.maxStorage}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, maxStorage: e.target.value }))}
                  placeholder="Unlimited"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxProjects">Max Projects</Label>
                <Input
                  id="maxProjects"
                  type="number"
                  value={planForm.maxProjects}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, maxProjects: e.target.value }))}
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Features</Label>
              <div className="space-y-2">
                {planForm.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...planForm.features];
                        newFeatures[index] = e.target.value;
                        setPlanForm(prev => ({ ...prev, features: newFeatures }));
                      }}
                      placeholder="Feature description"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add new feature..."
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={planForm.isActive}
                onCheckedChange={(checked) => setPlanForm(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Plan is active</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setDialogOpen(false);
                setSelectedPlan(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Plans;
