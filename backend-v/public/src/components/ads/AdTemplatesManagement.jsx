import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Switch } from '../ui/switch';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Search,
  Filter,
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Target,
  DollarSign,
  Calendar,
  Globe,
  Lock,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import adminApiService from '../../services/adminApiService';
import { useAuth } from '../../contexts/AuthContext';

const AdTemplatesManagement = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Dialog states
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  // Form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    category: 'other',
    objective: 'OUTCOME_LEADS',
    adTitle: '',
    adDescription: '',
    adHeadline: '',
    adText: '',
    adImageUrl: '',
    adVideoUrl: '',
    callToAction: 'LEARN_MORE',
    targeting: {
      ageMin: null,
      ageMax: null,
      genders: [],
      locations: {
        countries: [],
        regions: [],
        cities: []
      },
      interests: [],
      behaviors: [],
      customAudiences: [],
      lookalikeAudiences: []
    },
    budget: {
      type: 'daily',
      amount: null,
      currency: 'USD'
    },
    schedule: {
      startDate: null,
      endDate: null,
      timezone: 'UTC'
    },
    funnelId: null,
    funnelUrl: '',
    productInfo: '',
    targetAudience: '',
    placements: ['all'],
    optimization: {
      optimizationGoal: 'LINK_CLICKS',
      bidStrategy: 'LOWEST_COST'
    },
    tags: [],
    isActive: true,
    isPublic: false
  });

  // Load templates
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (statusFilter !== 'all') params.append('isActive', statusFilter === 'active');
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await adminApiService.apiCall(`/ad-templates?${params.toString()}`);
      
      if (response.success) {
        setTemplates(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load templates');
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load ad templates');
    } finally {
      setLoading(false);
    }
  };

  // Load templates on mount
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadTemplates();
    }
  }, [authLoading, isAuthenticated, categoryFilter, statusFilter, searchQuery]);

  // Handle create/edit
  const handleSave = async () => {
    try {
      const url = editingTemplate 
        ? `/ad-templates/${editingTemplate._id}`
        : '/ad-templates';
      
      const method = editingTemplate ? 'PUT' : 'POST';
      
      const response = await adminApiService.apiCall(url, {
        method,
        body: templateForm
      });
      
      if (response.success) {
        toast.success(editingTemplate ? 'Template updated successfully' : 'Template created successfully');
        setShowTemplateDialog(false);
        resetForm();
        loadTemplates();
      } else {
        toast.error(response.message || 'Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      const response = await adminApiService.apiCall(`/ad-templates/${selectedTemplate._id}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        toast.success('Template deleted successfully');
        setShowDeleteDialog(false);
        setSelectedTemplate(null);
        loadTemplates();
      } else {
        toast.error(response.message || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  // Handle duplicate
  const handleDuplicate = async (template) => {
    try {
      const response = await adminApiService.apiCall(`/ad-templates/${template._id}/duplicate`, {
        method: 'POST'
      });
      
      if (response.success) {
        toast.success('Template duplicated successfully');
        loadTemplates();
      } else {
        toast.error(response.message || 'Failed to duplicate template');
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    }
  };

  // Reset form
  const resetForm = () => {
    setTemplateForm({
      name: '',
      description: '',
      category: 'other',
      objective: 'OUTCOME_LEADS',
      adTitle: '',
      adDescription: '',
      adHeadline: '',
      adText: '',
      adImageUrl: '',
      adVideoUrl: '',
      callToAction: 'LEARN_MORE',
      targeting: {
        ageMin: null,
        ageMax: null,
        genders: [],
        locations: { countries: [], regions: [], cities: [] },
        interests: [],
        behaviors: [],
        customAudiences: [],
        lookalikeAudiences: []
      },
      budget: { type: 'daily', amount: null, currency: 'USD' },
      schedule: { startDate: null, endDate: null, timezone: 'UTC' },
      funnelId: null,
      funnelUrl: '',
      productInfo: '',
      targetAudience: '',
      placements: ['all'],
      optimization: { optimizationGoal: 'LINK_CLICKS', bidStrategy: 'LOWEST_COST' },
      tags: [],
      isActive: true,
      isPublic: false
    });
    setEditingTemplate(null);
  };

  // Open edit dialog
  const openEditDialog = (template) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name || '',
      description: template.description || '',
      category: template.category || 'other',
      objective: template.objective || 'OUTCOME_LEADS',
      adTitle: template.adTitle || '',
      adDescription: template.adDescription || '',
      adHeadline: template.adHeadline || '',
      adText: template.adText || '',
      adImageUrl: template.adImageUrl || '',
      adVideoUrl: template.adVideoUrl || '',
      callToAction: template.callToAction || 'LEARN_MORE',
      targeting: template.targeting || {
        ageMin: null,
        ageMax: null,
        genders: [],
        locations: { countries: [], regions: [], cities: [] },
        interests: [],
        behaviors: [],
        customAudiences: [],
        lookalikeAudiences: []
      },
      budget: template.budget || { type: 'daily', amount: null, currency: 'USD' },
      schedule: template.schedule || { startDate: null, endDate: null, timezone: 'UTC' },
      funnelId: template.funnelId || null,
      funnelUrl: template.funnelUrl || '',
      productInfo: template.productInfo || '',
      targetAudience: template.targetAudience || '',
      placements: template.placements || ['all'],
      optimization: template.optimization || { optimizationGoal: 'LINK_CLICKS', bidStrategy: 'LOWEST_COST' },
      tags: template.tags || [],
      isActive: template.isActive !== undefined ? template.isActive : true,
      isPublic: template.isPublic || false
    });
    setShowTemplateDialog(true);
  };

  // Open create dialog
  const openCreateDialog = () => {
    resetForm();
    setShowTemplateDialog(true);
  };

  // Get category badge color
  const getCategoryColor = (category) => {
    const colors = {
      lead_generation: 'bg-blue-100 text-blue-700 border-blue-300',
      sales: 'bg-green-100 text-green-700 border-green-300',
      awareness: 'bg-purple-100 text-purple-700 border-purple-300',
      engagement: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      conversion: 'bg-orange-100 text-orange-700 border-orange-300',
      retargeting: 'bg-pink-100 text-pink-700 border-pink-300',
      other: 'bg-slate-100 text-slate-700 border-slate-300'
    };
    return colors[category] || colors.other;
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-full px-4 lg:px-8 md:px-6 sm:px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Ad Campaigns Templates</h1>
          <p className="text-sm text-slate-600">
            Create and manage prebuilt ad templates with prefilled information
          </p>
        </div>

        {/* Filters and Actions */}
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="lead_generation">Lead Generation</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="awareness">Awareness</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="conversion">Conversion</SelectItem>
                    <SelectItem value="retargeting">Retargeting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={openCreateDialog} className="bg-slate-900 hover:bg-slate-800">
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Templates Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-sm text-slate-500">No templates found</p>
                <Button onClick={openCreateDialog} className="mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Template
                </Button>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                      <TableHead className="font-semibold text-slate-900">Name</TableHead>
                      <TableHead className="font-semibold text-slate-900">Category</TableHead>
                      <TableHead className="font-semibold text-slate-900">Ad Title</TableHead>
                      <TableHead className="font-semibold text-slate-900">Objective</TableHead>
                      <TableHead className="font-semibold text-slate-900">Status</TableHead>
                      <TableHead className="font-semibold text-slate-900">Usage</TableHead>
                      <TableHead className="font-semibold text-slate-900">Visibility</TableHead>
                      <TableHead className="font-semibold text-slate-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template._id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getCategoryColor(template.category)}>
                            {template.category.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{template.adTitle}</TableCell>
                        <TableCell className="text-sm text-slate-600">{template.objective?.replace('OUTCOME_', '')}</TableCell>
                        <TableCell>
                          {template.isActive ? (
                            <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-red-300 text-red-700 bg-red-50">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {template.usageCount || 0} times
                        </TableCell>
                        <TableCell>
                          {template.isPublic ? (
                            <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                              <Globe className="h-3 w-3 mr-1" />
                              Public
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-slate-300 text-slate-700 bg-slate-50">
                              <Lock className="h-3 w-3 mr-1" />
                              Private
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(template)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicate(template)}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTemplate(template);
                                setShowDeleteDialog(true);
                              }}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
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
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent
          className="!max-w-none sm:!max-w-none p-0 overflow-hidden border-0 shadow-2xl flex flex-col"
          style={{ width: '70vw', maxHeight: '90vh' }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              {editingTemplate ? 'Update the template details' : 'Fill in the template information to prefill ad campaigns'}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 max-h-[calc(90vh-180px)] overflow-y-auto">
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <FileText className="h-4 w-4 text-slate-600" />
                      <h3 className="text-base font-semibold text-slate-900">Basic Information</h3>
                    </div>
                    <div className="space-y-4 pt-2">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium text-slate-700 mb-1.5 block">Template Name *</Label>
                        <Input
                          id="name"
                          value={templateForm.name}
                          onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                          placeholder="e.g., Lead Generation Template"
                          className="h-10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description" className="text-sm font-medium text-slate-700 mb-1.5 block">Description</Label>
                        <Textarea
                          id="description"
                          value={templateForm.description}
                          onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                          placeholder="Describe what this template is used for..."
                          rows={3}
                          className="resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="category" className="text-sm font-medium text-slate-700 mb-1.5 block">Category</Label>
                          <Select
                            value={templateForm.category}
                            onValueChange={(value) => setTemplateForm({ ...templateForm, category: value })}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lead_generation">Lead Generation</SelectItem>
                              <SelectItem value="sales">Sales</SelectItem>
                              <SelectItem value="awareness">Awareness</SelectItem>
                              <SelectItem value="engagement">Engagement</SelectItem>
                              <SelectItem value="conversion">Conversion</SelectItem>
                              <SelectItem value="retargeting">Retargeting</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="objective" className="text-sm font-medium text-slate-700 mb-1.5 block">Campaign Objective</Label>
                          <Select
                            value={templateForm.objective}
                            onValueChange={(value) => setTemplateForm({ ...templateForm, objective: value })}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OUTCOME_TRAFFIC">Traffic</SelectItem>
                              <SelectItem value="OUTCOME_LEADS">Leads</SelectItem>
                              <SelectItem value="OUTCOME_ENGAGEMENT">Engagement</SelectItem>
                              <SelectItem value="OUTCOME_APP_PROMOTION">App Promotion</SelectItem>
                              <SelectItem value="OUTCOME_SALES">Sales</SelectItem>
                              <SelectItem value="OUTCOME_AWARENESS">Awareness</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ad Content */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Target className="h-4 w-4 text-slate-600" />
                      <h3 className="text-base font-semibold text-slate-900">Ad Content</h3>
                    </div>
                    <div className="space-y-4 pt-2">
                      <div>
                        <Label htmlFor="adTitle" className="text-sm font-medium text-slate-700 mb-1.5 block">Ad Title *</Label>
                        <Input
                          id="adTitle"
                          value={templateForm.adTitle}
                          onChange={(e) => setTemplateForm({ ...templateForm, adTitle: e.target.value })}
                          placeholder="Enter the ad title"
                          className="h-10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="adDescription" className="text-sm font-medium text-slate-700 mb-1.5 block">Ad Description *</Label>
                        <Textarea
                          id="adDescription"
                          value={templateForm.adDescription}
                          onChange={(e) => setTemplateForm({ ...templateForm, adDescription: e.target.value })}
                          placeholder="Enter the ad description"
                          rows={4}
                          className="resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="adHeadline" className="text-sm font-medium text-slate-700 mb-1.5 block">Headline</Label>
                          <Input
                            id="adHeadline"
                            value={templateForm.adHeadline}
                            onChange={(e) => setTemplateForm({ ...templateForm, adHeadline: e.target.value })}
                            placeholder="Optional headline"
                            className="h-10"
                          />
                        </div>
                        <div>
                          <Label htmlFor="callToAction" className="text-sm font-medium text-slate-700 mb-1.5 block">Call to Action</Label>
                          <Select
                            value={templateForm.callToAction}
                            onValueChange={(value) => setTemplateForm({ ...templateForm, callToAction: value })}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LEARN_MORE">Learn More</SelectItem>
                              <SelectItem value="SHOP_NOW">Shop Now</SelectItem>
                              <SelectItem value="SIGN_UP">Sign Up</SelectItem>
                              <SelectItem value="DOWNLOAD">Download</SelectItem>
                              <SelectItem value="BOOK_TRAVEL">Book Travel</SelectItem>
                              <SelectItem value="CONTACT_US">Contact Us</SelectItem>
                              <SelectItem value="GET_QUOTE">Get Quote</SelectItem>
                              <SelectItem value="APPLY_NOW">Apply Now</SelectItem>
                              <SelectItem value="SUBSCRIBE">Subscribe</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="adText" className="text-sm font-medium text-slate-700 mb-1.5 block">Ad Text</Label>
                        <Textarea
                          id="adText"
                          value={templateForm.adText}
                          onChange={(e) => setTemplateForm({ ...templateForm, adText: e.target.value })}
                          placeholder="Additional ad text"
                          rows={3}
                          className="resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="adImageUrl" className="text-sm font-medium text-slate-700 mb-1.5 block">Image URL</Label>
                          <Input
                            id="adImageUrl"
                            value={templateForm.adImageUrl}
                            onChange={(e) => setTemplateForm({ ...templateForm, adImageUrl: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                            className="h-10"
                          />
                        </div>
                        <div>
                          <Label htmlFor="adVideoUrl" className="text-sm font-medium text-slate-700 mb-1.5 block">Video URL</Label>
                          <Input
                            id="adVideoUrl"
                            value={templateForm.adVideoUrl}
                            onChange={(e) => setTemplateForm({ ...templateForm, adVideoUrl: e.target.value })}
                            placeholder="https://example.com/video.mp4"
                            className="h-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Budget & Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <DollarSign className="h-4 w-4 text-slate-600" />
                      <h3 className="text-base font-semibold text-slate-900">Budget & Settings</h3>
                    </div>
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="budgetType" className="text-sm font-medium text-slate-700 mb-1.5 block">Budget Type</Label>
                          <Select
                            value={templateForm.budget.type}
                            onValueChange={(value) => setTemplateForm({
                              ...templateForm,
                              budget: { ...templateForm.budget, type: value }
                            })}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily Budget</SelectItem>
                              <SelectItem value="lifetime">Lifetime Budget</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="budgetAmount" className="text-sm font-medium text-slate-700 mb-1.5 block">Budget Amount (USD)</Label>
                          <Input
                            id="budgetAmount"
                            type="number"
                            value={templateForm.budget.amount || ''}
                            onChange={(e) => setTemplateForm({
                              ...templateForm,
                              budget: { ...templateForm.budget, amount: e.target.value ? parseFloat(e.target.value) : null }
                            })}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="h-10"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="funnelUrl" className="text-sm font-medium text-slate-700 mb-1.5 block">Funnel URL</Label>
                        <Input
                          id="funnelUrl"
                          value={templateForm.funnelUrl}
                          onChange={(e) => setTemplateForm({ ...templateForm, funnelUrl: e.target.value })}
                          placeholder="https://yourfunnel.com/landing-page"
                          className="h-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Target Audience & Product Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <TrendingUp className="h-4 w-4 text-slate-600" />
                      <h3 className="text-base font-semibold text-slate-900">Targeting & Product</h3>
                    </div>
                    <div className="space-y-4 pt-2">
                      <div>
                        <Label htmlFor="targetAudience" className="text-sm font-medium text-slate-700 mb-1.5 block">Target Audience Description</Label>
                        <Textarea
                          id="targetAudience"
                          value={templateForm.targetAudience}
                          onChange={(e) => setTemplateForm({ ...templateForm, targetAudience: e.target.value })}
                          placeholder="Describe your target audience..."
                          rows={3}
                          className="resize-none"
                        />
                      </div>
                      <div>
                        <Label htmlFor="productInfo" className="text-sm font-medium text-slate-700 mb-1.5 block">Product/Service Information</Label>
                        <Textarea
                          id="productInfo"
                          value={templateForm.productInfo}
                          onChange={(e) => setTemplateForm({ ...templateForm, productInfo: e.target.value })}
                          placeholder="Describe your product or service..."
                          rows={3}
                          className="resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Visibility Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Eye className="h-4 w-4 text-slate-600" />
                      <h3 className="text-base font-semibold text-slate-900">Visibility Settings</h3>
                    </div>
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                          <Label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active</Label>
                          <p className="text-xs text-slate-500 mt-0.5">Template will be available for use</p>
                        </div>
                        <Switch
                          id="isActive"
                          checked={templateForm.isActive}
                          onCheckedChange={(checked) => setTemplateForm({ ...templateForm, isActive: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                          <Label htmlFor="isPublic" className="text-sm font-medium text-slate-700">Public</Label>
                          <p className="text-xs text-slate-500 mt-0.5">Make this template available to all users</p>
                        </div>
                        <Switch
                          id="isPublic"
                          checked={templateForm.isPublic}
                          onCheckedChange={(checked) => setTemplateForm({ ...templateForm, isPublic: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t border-slate-200 bg-slate-50/50">
            <Button
              variant="outline"
              onClick={() => {
                setShowTemplateDialog(false);
                resetForm();
              }}
              className="h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!templateForm.name || !templateForm.adTitle || !templateForm.adDescription}
              className="bg-slate-900 hover:bg-slate-800 h-10"
            >
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedTemplate?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdTemplatesManagement;
