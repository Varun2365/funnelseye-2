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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
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
  TrendingUp,
  Zap,
  BarChart,
  Palette,
  Users,
  MapPin,
  Wallet,
  CheckCircle2,
  Workflow,
  Sparkles
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
  const [activeTab, setActiveTab] = useState('basics');
  
  // Funnel and stage data
  const [funnels, setFunnels] = useState([]);
  const [funnelStages, setFunnelStages] = useState([]);
  const [loadingFunnels, setLoadingFunnels] = useState(false);
  
  // Form state - New structure matching requirements
  const [templateForm, setTemplateForm] = useState({
    // Tab 1: Template Basics
    name: '',
    description: '',
    funnelType: 'lead_gen',
    stageId: '',
    objective: 'OUTCOME_LEADS',
    status: 'active', // 'active' or 'draft'
    
    // Tab 2: Ad Creative
    creative: {
      primaryText: '',
      headline: '',
      description: '',
      cta: 'LEARN_MORE',
      type: 'image' // 'image' or 'video'
    },
    
    // Tab 3: Targeting & Audiences
    audienceRules: {
      triggerTypes: [], // ['FunnelStageViewed', 'FormFilled', 'PageEngaged', 'ExitIntent']
      rules: [{
        eventType: '',
        stageId: '',
        lookbackDays: 30,
        intentLabel: ''
      }]
    },
    
    // Tab 4: Funnel & Events Mapping
    funnelMapping: {
      triggerEvent: 'FunnelStageViewed',
      redirectStageId: '',
      showSameStage: false,
      metaEventName: '',
      customEventKey: ''
    },
    
    // Tab 5: Budget & Delivery
    budget: {
      type: 'daily', // 'daily' or 'lifetime'
      amount: null,
      optimizationGoal: 'LANDING_PAGE_VIEWS',
      placementStrategy: 'advantage_plus' // 'advantage_plus' or 'manual'
    }
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

  // Load funnels and stages
  const loadFunnels = async () => {
    try {
      setLoadingFunnels(true);
      const response = await adminApiService.apiCall('/funnels');
      if (response.success) {
        setFunnels(response.data || []);
      }
    } catch (error) {
      console.error('Error loading funnels:', error);
    } finally {
      setLoadingFunnels(false);
    }
  };

  // Load stages when funnel is selected
  const handleFunnelTypeChange = (funnelType) => {
    setTemplateForm(prev => ({ ...prev, funnelType, stageId: '' }));
    // Load stages based on funnel type (for now, we'll load all stages)
    loadFunnelStages();
  };

  const loadFunnelStages = async () => {
    try {
      // Fetch stages from all funnels or a specific funnel
      // For now, we'll create a generic list of common stages
      const commonStages = [
        { pageId: 'landing-page', name: 'Landing Page', order: 0 },
        { pageId: 'lead-form', name: 'Lead Form', order: 1 },
        { pageId: 'thank-you', name: 'Thank You', order: 2 },
        { pageId: 'upsell', name: 'Upsell', order: 3 },
        { pageId: 'webinar', name: 'Webinar', order: 4 },
        { pageId: 'coaching-call', name: 'Coaching Call', order: 5 }
      ];
      setFunnelStages(commonStages);
    } catch (error) {
      console.error('Error loading stages:', error);
    }
  };

  // Generate custom event key
  const generateCustomEventKey = () => {
    const { name, funnelMapping } = templateForm;
    if (name && funnelMapping?.metaEventName) {
      const key = `${name.toLowerCase().replace(/\s+/g, '_')}_${funnelMapping.metaEventName.toLowerCase()}`;
      setTemplateForm(prev => ({
        ...prev,
        funnelMapping: { 
          ...(prev.funnelMapping || {}), 
          customEventKey: key 
        }
      }));
    }
  };

  // Validation for preview tab
  const validateForm = () => {
    const errors = [];
    if (!templateForm.stageId) errors.push('Funnel stage must be selected');
    if (!templateForm.funnelMapping?.triggerEvent) errors.push('At least one event must be mapped');
    if (!templateForm.objective) errors.push('Objective must be selected');
    return errors;
  };

  // Load templates and funnels on mount
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadTemplates();
      loadFunnels();
      loadFunnelStages();
    }
  }, [authLoading, isAuthenticated, categoryFilter, statusFilter, searchQuery]);

  // Generate custom event key when meta event name changes
  useEffect(() => {
    if (templateForm.funnelMapping?.metaEventName) {
      generateCustomEventKey();
    }
  }, [templateForm.funnelMapping?.metaEventName, templateForm.name]);

  // Handle create/edit
  const handleSave = async (saveAsDraft = false) => {
    try {
      // Validate required fields
      const errors = validateForm();
      if (errors.length > 0 && !saveAsDraft) {
        toast.error(`Please fix the following: ${errors.join(', ')}`);
        setActiveTab('preview');
        return;
      }

      const url = editingTemplate 
        ? `/ad-templates/${editingTemplate._id}`
        : '/ad-templates';
      
      const method = editingTemplate ? 'PUT' : 'POST';
      
      const payload = {
        ...templateForm,
        status: saveAsDraft ? 'draft' : templateForm.status
      };
      
      const response = await adminApiService.apiCall(url, {
        method,
        body: payload
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
      // Tab 1: Template Basics
      name: '',
      description: '',
      funnelType: 'lead_gen',
      stageId: '',
      objective: 'OUTCOME_LEADS',
      status: 'active',
      
      // Tab 2: Ad Creative
      creative: {
        primaryText: '',
        headline: '',
        description: '',
        cta: 'LEARN_MORE',
        type: 'image'
      },
      
      // Tab 3: Targeting & Audiences
      audienceRules: {
        triggerTypes: [],
        rules: [{
          eventType: '',
          stageId: '',
          lookbackDays: 30,
          intentLabel: ''
        }]
      },
      
      // Tab 4: Funnel & Events Mapping
      funnelMapping: {
        triggerEvent: 'FunnelStageViewed',
        redirectStageId: '',
        showSameStage: false,
        metaEventName: '',
        customEventKey: ''
      },
      
      // Tab 5: Budget & Delivery
      budget: {
        type: 'daily',
        amount: null,
        optimizationGoal: 'LANDING_PAGE_VIEWS',
        placementStrategy: 'advantage_plus'
      }
    });
    setEditingTemplate(null);
    setActiveTab('basics');
    setFunnelStages([]);
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
    <div className="min-h-screen bg-white p-6">
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

      {/* Create/Edit Template Dialog - New Vertical Tab Layout */}
      <Dialog open={showTemplateDialog} onOpenChange={(open) => {
        setShowTemplateDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent
          className="!max-w-none sm:!max-w-none p-0 overflow-hidden border-0 shadow-2xl flex flex-col !top-[50%] !left-[50%] !-translate-x-1/2 !-translate-y-1/2"
          style={{ width: '1400px', height: '850px' }}
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              {editingTemplate ? 'Edit Ad Template' : 'Create New Ad Template'}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 mt-2">
              {editingTemplate 
                ? 'Update the template structure and logic. Coaches will use their own accounts, pixels, and budgets.'
                : 'Define reusable ad template structure. Coaches will connect their Meta accounts, pixels, and budgets later.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar - Vertical Tabs */}
            <div className="w-64 border-r border-slate-200 bg-white flex flex-col">
              <div className="p-4 space-y-1">
                {[
                  { id: 'basics', label: 'Template Basics', icon: FileText, color: 'blue' },
                  { id: 'creative', label: 'Ad Creative', icon: Palette, color: 'purple' },
                  { id: 'targeting', label: 'Targeting & Audiences', icon: Users, color: 'green' },
                  { id: 'mapping', label: 'Events Mapping', icon: MapPin, color: 'orange' },
                  { id: 'budget', label: 'Budget & Delivery', icon: Wallet, color: 'amber' },
                  { id: 'preview', label: 'Preview & Save', icon: CheckCircle2, color: 'emerald' }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 text-left ${
                        isActive
                          ? 'bg-blue-600 text-white rounded-[5px]'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="font-medium text-sm">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Content Area */}
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="p-8">

                {/* Tab 1: Template Basics */}
                {activeTab === 'basics' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Template Basics</h3>
                        <p className="text-sm text-slate-500">Define the identity and scope of the ad template</p>
                      </div>
                    </div>

                    <div className="space-y-5 pt-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-semibold text-slate-700 mb-2 block">
                          Template Name *
                        </Label>
                        <Input
                          id="name"
                          value={templateForm.name}
                          onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                          placeholder="e.g., Lead Generation Template"
                          className="h-11"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-sm font-semibold text-slate-700 mb-2 block">
                          Template Description
                        </Label>
                        <Textarea
                          id="description"
                          value={templateForm.description}
                          onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                          placeholder="Describe what this template is used for..."
                          rows={4}
                          className="resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <Label htmlFor="funnelType" className="text-sm font-semibold text-slate-700 mb-2 block">
                            Funnel Type *
                          </Label>
                          <Select
                            value={templateForm.funnelType}
                            onValueChange={handleFunnelTypeChange}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lead_gen">Lead Gen</SelectItem>
                              <SelectItem value="webinar">Webinar</SelectItem>
                              <SelectItem value="coaching_call">Coaching Call</SelectItem>
                              <SelectItem value="course_sale">Course Sale</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="stageId" className="text-sm font-semibold text-slate-700 mb-2 block">
                            Funnel Stage *
                          </Label>
                          <Select
                            value={templateForm.stageId}
                            onValueChange={(value) => setTemplateForm({ ...templateForm, stageId: value })}
                            disabled={loadingFunnels}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder={loadingFunnels ? "Loading stages..." : "Select stage"} />
                            </SelectTrigger>
                            <SelectContent>
                              {funnelStages.map((stage) => (
                                <SelectItem key={stage.pageId} value={stage.pageId}>
                                  {stage.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <Label htmlFor="objective" className="text-sm font-semibold text-slate-700 mb-2 block">
                            Objective *
                          </Label>
                          <Select
                            value={templateForm.objective}
                            onValueChange={(value) => setTemplateForm({ ...templateForm, objective: value })}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OUTCOME_TRAFFIC">Traffic</SelectItem>
                              <SelectItem value="OUTCOME_LEADS">Leads</SelectItem>
                              <SelectItem value="OUTCOME_SALES">Conversions</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="status" className="text-sm font-semibold text-slate-700 mb-2 block">
                            Status
                          </Label>
                          <div className="flex items-center gap-3 h-11">
                            <Switch
                              id="status"
                              checked={templateForm.status === 'active'}
                              onCheckedChange={(checked) => 
                                setTemplateForm({ ...templateForm, status: checked ? 'active' : 'draft' })
                              }
                            />
                            <span className="text-sm text-slate-600">
                              {templateForm.status === 'active' ? 'Active' : 'Draft'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Ad Creative */}
                {activeTab === 'creative' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Palette className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Ad Creative</h3>
                        <p className="text-sm text-slate-500">Define reusable creative structure (content, not assets)</p>
                      </div>
                    </div>

                    <div className="space-y-5 pt-4">
                      <div>
                        <Label htmlFor="primaryText" className="text-sm font-semibold text-slate-700 mb-2 block">
                          Primary Text *
                        </Label>
                        <Textarea
                          id="primaryText"
                          value={templateForm.creative?.primaryText || ''}
                          onChange={(e) => setTemplateForm({
                            ...templateForm,
                            creative: { ...(templateForm.creative || {}), primaryText: e.target.value }
                          })}
                          placeholder="Enter primary ad text. Use {{variable}} for dynamic content..."
                          rows={5}
                          className="resize-none"
                        />
                        <p className="text-xs text-slate-500 mt-1.5">
                          Supports dynamic variables like {"{{name}}"}, {"{{offer}}"}, etc.
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="headline" className="text-sm font-semibold text-slate-700 mb-2 block">
                          Headline *
                        </Label>
                        <Input
                          id="headline"
                          value={templateForm.creative?.headline || ''}
                          onChange={(e) => setTemplateForm({
                            ...templateForm,
                            creative: { ...(templateForm.creative || {}), headline: e.target.value }
                          })}
                          placeholder="Enter headline"
                          className="h-11"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-sm font-semibold text-slate-700 mb-2 block">
                          Description (Optional)
                        </Label>
                        <Input
                          id="description"
                          value={templateForm.creative?.description || ''}
                          onChange={(e) => setTemplateForm({
                            ...templateForm,
                            creative: { ...(templateForm.creative || {}), description: e.target.value }
                          })}
                          placeholder="Optional description"
                          className="h-11"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <Label htmlFor="cta" className="text-sm font-semibold text-slate-700 mb-2 block">
                            CTA Button *
                          </Label>
                          <Select
                            value={templateForm.creative?.cta || 'LEARN_MORE'}
                            onValueChange={(value) => setTemplateForm({
                              ...templateForm,
                              creative: { ...(templateForm.creative || {}), cta: value }
                            })}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LEARN_MORE">Learn More</SelectItem>
                              <SelectItem value="SIGN_UP">Sign Up</SelectItem>
                              <SelectItem value="BOOK_NOW">Book Now</SelectItem>
                              <SelectItem value="SHOP_NOW">Shop Now</SelectItem>
                              <SelectItem value="GET_QUOTE">Get Quote</SelectItem>
                              <SelectItem value="APPLY_NOW">Apply Now</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="creativeType" className="text-sm font-semibold text-slate-700 mb-2 block">
                            Creative Type
                          </Label>
                          <div className="flex gap-4 h-11 items-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="creativeType"
                                value="image"
                                checked={(templateForm.creative?.type || 'image') === 'image'}
                                onChange={(e) => setTemplateForm({
                                  ...templateForm,
                                  creative: { ...(templateForm.creative || {}), type: e.target.value }
                                })}
                                className="w-4 h-4 text-purple-600"
                              />
                              <span className="text-sm text-slate-700">Image</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="creativeType"
                                value="video"
                                checked={(templateForm.creative?.type || 'image') === 'video'}
                                onChange={(e) => setTemplateForm({
                                  ...templateForm,
                                  creative: { ...(templateForm.creative || {}), type: e.target.value }
                                })}
                                className="w-4 h-4 text-purple-600"
                              />
                              <span className="text-sm text-slate-700">Video</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800 flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          <strong>Note:</strong> Coach will replace assets inside Meta Ads Manager. This template defines structure only.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Targeting & Audiences */}
                {activeTab === 'targeting' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Targeting & Audiences</h3>
                        <p className="text-sm text-slate-500">Define retargeting logic, not final audience IDs</p>
                      </div>
                    </div>

                    <div className="space-y-5 pt-4">
                      <div>
                        <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                          Audience Trigger Type (Multi-select)
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          {['FunnelStageViewed', 'FormFilled', 'PageEngaged', 'ExitIntent'].map((trigger) => (
                            <label key={trigger} className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                              <input
                                type="checkbox"
                                checked={(templateForm.audienceRules?.triggerTypes || []).includes(trigger)}
                                onChange={(e) => {
                                  const current = templateForm.audienceRules?.triggerTypes || [];
                                  const updated = e.target.checked
                                    ? [...current, trigger]
                                    : current.filter(t => t !== trigger);
                                  setTemplateForm({
                                    ...templateForm,
                                    audienceRules: { ...(templateForm.audienceRules || {}), triggerTypes: updated }
                                  });
                                }}
                                className="w-4 h-4 text-green-600"
                              />
                              <span className="text-sm text-slate-700">{trigger}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                          Audience Rule Builder
                        </Label>
                        {(templateForm.audienceRules?.rules || []).map((rule, index) => (
                          <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4 mb-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">IF Event</Label>
                                <Select
                                  value={rule.eventType}
                                  onValueChange={(value) => {
                                    const newRules = [...(templateForm.audienceRules?.rules || [])];
                                    newRules[index].eventType = value;
                                    setTemplateForm({
                                      ...templateForm,
                                      audienceRules: { ...(templateForm.audienceRules || {}), rules: newRules }
                                    });
                                  }}
                                >
                                  <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select event" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="FunnelStageViewed">FunnelStageViewed</SelectItem>
                                    <SelectItem value="FormFilled">FormFilled</SelectItem>
                                    <SelectItem value="PageEngaged">PageEngaged</SelectItem>
                                    <SelectItem value="ExitIntent">ExitIntent</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">AND Stage</Label>
                                <Select
                                  value={rule.stageId}
                                  onValueChange={(value) => {
                                    const newRules = [...(templateForm.audienceRules?.rules || [])];
                                    newRules[index].stageId = value;
                                    setTemplateForm({
                                      ...templateForm,
                                      audienceRules: { ...(templateForm.audienceRules || {}), rules: newRules }
                                    });
                                  }}
                                >
                                  <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select stage" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {funnelStages.map((stage) => (
                                      <SelectItem key={stage.pageId} value={stage.pageId}>
                                        {stage.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Lookback (days)</Label>
                                <Input
                                  type="number"
                                  value={rule.lookbackDays}
                                  onChange={(e) => {
                                    const newRules = [...(templateForm.audienceRules?.rules || [])];
                                    newRules[index].lookbackDays = parseInt(e.target.value) || 30;
                                    setTemplateForm({
                                      ...templateForm,
                                      audienceRules: { ...(templateForm.audienceRules || {}), rules: newRules }
                                    });
                                  }}
                                  className="h-10"
                                  min="1"
                                  max="90"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Audience Intent Label</Label>
                              <Input
                                value={rule.intentLabel}
                                onChange={(e) => {
                                  const newRules = [...(templateForm.audienceRules?.rules || [])];
                                  newRules[index].intentLabel = e.target.value;
                                  setTemplateForm({
                                    ...templateForm,
                                    audienceRules: { ...(templateForm.audienceRules || {}), rules: newRules }
                                  });
                                }}
                                placeholder="e.g., Landing Page - Viewed but Not Filled"
                                className="h-10"
                              />
                            </div>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTemplateForm({
                              ...templateForm,
                              audienceRules: {
                                ...(templateForm.audienceRules || {}),
                                rules: [...(templateForm.audienceRules?.rules || []), {
                                  eventType: '',
                                  stageId: '',
                                  lookbackDays: 30,
                                  intentLabel: ''
                                }]
                              }
                            });
                          }}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Rule
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 4: Funnel & Events Mapping */}
                {activeTab === 'mapping' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <MapPin className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Funnel & Events Mapping</h3>
                        <p className="text-sm text-slate-500">Connect ads to stage-wise funnel progression</p>
                      </div>
                    </div>

                    <div className="space-y-5 pt-4">
                      <div>
                        <Label htmlFor="triggerEvent" className="text-sm font-semibold text-slate-700 mb-2 block">
                          Trigger Event *
                        </Label>
                        <Select
                          value={templateForm.funnelMapping?.triggerEvent || 'FunnelStageViewed'}
                          onValueChange={(value) => setTemplateForm({
                            ...templateForm,
                            funnelMapping: { ...(templateForm.funnelMapping || {}), triggerEvent: value }
                          })}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FunnelStageViewed">FunnelStageViewed</SelectItem>
                            <SelectItem value="FormFilled">FormFilled</SelectItem>
                            <SelectItem value="ButtonClicked">ButtonClicked</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                          Next Funnel Action
                        </Label>
                        <div className="space-y-3">
                          <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                            <input
                              type="radio"
                              name="funnelAction"
                              checked={!templateForm.funnelMapping?.showSameStage}
                              onChange={() => setTemplateForm({
                                ...templateForm,
                                funnelMapping: { ...(templateForm.funnelMapping || {}), showSameStage: false }
                              })}
                              className="w-4 h-4 text-orange-600"
                            />
                            <span className="text-sm text-slate-700">Redirect To Stage</span>
                          </label>
                          {!templateForm.funnelMapping?.showSameStage && (
                            <Select
                              value={templateForm.funnelMapping?.redirectStageId || ''}
                              onValueChange={(value) => setTemplateForm({
                                ...templateForm,
                                funnelMapping: { ...(templateForm.funnelMapping || {}), redirectStageId: value }
                              })}
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select stage" />
                              </SelectTrigger>
                              <SelectContent>
                                {funnelStages.map((stage) => (
                                  <SelectItem key={stage.pageId} value={stage.pageId}>
                                    {stage.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                            <input
                              type="radio"
                              name="funnelAction"
                              checked={templateForm.funnelMapping?.showSameStage || false}
                              onChange={() => setTemplateForm({
                                ...templateForm,
                                funnelMapping: { ...(templateForm.funnelMapping || {}), showSameStage: true }
                              })}
                              className="w-4 h-4 text-orange-600"
                            />
                            <span className="text-sm text-slate-700">Show Same Stage</span>
                          </label>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label htmlFor="metaEventName" className="text-sm font-semibold text-slate-700 mb-2 block">
                          Pixel Event Fired - Meta Event Name *
                        </Label>
                        <Input
                          id="metaEventName"
                          value={templateForm.funnelMapping?.metaEventName || ''}
                          onChange={(e) => {
                            setTemplateForm({
                              ...templateForm,
                              funnelMapping: { 
                                ...(templateForm.funnelMapping || {}), 
                                metaEventName: e.target.value 
                              }
                            });
                            generateCustomEventKey();
                          }}
                          placeholder="e.g., Lead, ViewContent, CompleteRegistration"
                          className="h-11"
                        />
                        <p className="text-xs text-slate-500 mt-1.5">
                          Standard Meta event name that will be fired
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="customEventKey" className="text-sm font-semibold text-slate-700 mb-2 block">
                          Custom Event Key (Auto-generated)
                        </Label>
                        <Input
                          id="customEventKey"
                          value={templateForm.funnelMapping?.customEventKey || ''}
                          readOnly
                          className="h-11 bg-slate-50"
                        />
                        <p className="text-xs text-slate-500 mt-1.5">
                          Auto-generated from template name and event name
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 5: Budget & Delivery */}
                {activeTab === 'budget' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Wallet className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Budget & Delivery</h3>
                        <p className="text-sm text-slate-500">Define default delivery behavior (coach can edit later)</p>
                      </div>
                    </div>

                    <div className="space-y-5 pt-4">
                      <div>
                        <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                          Budget Type
                        </Label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 flex-1">
                            <input
                              type="radio"
                              name="budgetType"
                              value="daily"
                              checked={(templateForm.budget?.type || 'daily') === 'daily'}
                              onChange={(e) => setTemplateForm({
                                ...templateForm,
                                budget: { ...(templateForm.budget || {}), type: e.target.value }
                              })}
                              className="w-4 h-4 text-amber-600"
                            />
                            <span className="text-sm text-slate-700 font-medium">Daily</span>
                          </label>
                          <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 flex-1">
                            <input
                              type="radio"
                              name="budgetType"
                              value="lifetime"
                              checked={(templateForm.budget?.type || 'daily') === 'lifetime'}
                              onChange={(e) => setTemplateForm({
                                ...templateForm,
                                budget: { ...(templateForm.budget || {}), type: e.target.value }
                              })}
                              className="w-4 h-4 text-amber-600"
                            />
                            <span className="text-sm text-slate-700 font-medium">Lifetime</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="budgetAmount" className="text-sm font-semibold text-slate-700 mb-2 block">
                          Default Budget Amount (USD)
                        </Label>
                          <Input
                            id="budgetAmount"
                            type="number"
                            value={templateForm.budget?.amount || ''}
                            onChange={(e) => setTemplateForm({
                              ...templateForm,
                              budget: { ...(templateForm.budget || {}), amount: e.target.value ? parseFloat(e.target.value) : null }
                            })}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="h-11"
                          />
                        <p className="text-xs text-slate-500 mt-1.5">
                          Coach can edit this amount after importing
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="optimizationGoal" className="text-sm font-semibold text-slate-700 mb-2 block">
                          Optimization Goal
                        </Label>
                        <Select
                          value={templateForm.budget?.optimizationGoal || 'LANDING_PAGE_VIEWS'}
                          onValueChange={(value) => setTemplateForm({
                            ...templateForm,
                            budget: { ...(templateForm.budget || {}), optimizationGoal: value }
                          })}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LANDING_PAGE_VIEWS">Landing Page Views</SelectItem>
                            <SelectItem value="LEADS">Leads</SelectItem>
                            <SelectItem value="CONVERSIONS">Conversions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                          Placement Strategy
                        </Label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 flex-1">
                            <input
                              type="radio"
                              name="placementStrategy"
                              value="advantage_plus"
                              checked={(templateForm.budget?.placementStrategy || 'advantage_plus') === 'advantage_plus'}
                              onChange={(e) => setTemplateForm({
                                ...templateForm,
                                budget: { ...(templateForm.budget || {}), placementStrategy: e.target.value }
                              })}
                              className="w-4 h-4 text-amber-600"
                            />
                            <span className="text-sm text-slate-700 font-medium">Advantage+</span>
                          </label>
                          <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 flex-1">
                            <input
                              type="radio"
                              name="placementStrategy"
                              value="manual"
                              checked={(templateForm.budget?.placementStrategy || 'advantage_plus') === 'manual'}
                              onChange={(e) => setTemplateForm({
                                ...templateForm,
                                budget: { ...(templateForm.budget || {}), placementStrategy: e.target.value }
                              })}
                              className="w-4 h-4 text-amber-600"
                            />
                            <span className="text-sm text-slate-700 font-medium">Manual</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 6: Preview & Save */}
                {activeTab === 'preview' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Preview & Save</h3>
                        <p className="text-sm text-slate-500">Review your template before publishing</p>
                      </div>
                    </div>

                    <div className="space-y-5 pt-4">
                      {/* Validation Checklist */}
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h4 className="text-sm font-semibold text-slate-900 mb-3">Validation Checklist</h4>
                        <div className="space-y-2">
                          {[
                            { label: 'Funnel stage selected', valid: !!templateForm.stageId },
                            { label: 'At least one event mapped', valid: !!templateForm.funnelMapping?.triggerEvent },
                            { label: 'Objective selected', valid: !!templateForm.objective },
                            { label: 'Template name provided', valid: !!templateForm.name },
                            { label: 'Creative content provided', valid: !!templateForm.creative?.headline && !!templateForm.creative?.primaryText }
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              {item.valid ? (
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className={`text-sm ${item.valid ? 'text-slate-700' : 'text-slate-500'}`}>
                                {item.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Preview Sections */}
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="text-sm font-semibold text-slate-900 mb-2">Ad Copy Preview</h4>
                          <div className="space-y-2 text-sm text-slate-700">
                            <p><strong>Headline:</strong> {templateForm.creative?.headline || 'Not set'}</p>
                            <p><strong>Primary Text:</strong> {templateForm.creative?.primaryText || 'Not set'}</p>
                            <p><strong>CTA:</strong> {templateForm.creative?.cta || 'Not set'}</p>
                          </div>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="text-sm font-semibold text-slate-900 mb-2">Target Audience Logic</h4>
                          <div className="space-y-1 text-sm text-slate-700">
                            {(templateForm.audienceRules?.rules || []).map((rule, idx) => (
                              <p key={idx}>
                                IF {rule.eventType || 'Event'} on {rule.stageId ? funnelStages.find(s => s.pageId === rule.stageId)?.name : 'Stage'} 
                                {' '}within {rule.lookbackDays} days → {rule.intentLabel || 'No label'}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <h4 className="text-sm font-semibold text-slate-900 mb-2">Funnel Stage Mapping</h4>
                          <div className="space-y-1 text-sm text-slate-700">
                            <p><strong>Trigger:</strong> {templateForm.funnelMapping?.triggerEvent || 'Not set'}</p>
                            <p><strong>Action:</strong> {templateForm.funnelMapping?.showSameStage 
                              ? 'Show Same Stage' 
                              : `Redirect to ${funnelStages.find(s => s.pageId === templateForm.funnelMapping?.redirectStageId)?.name || 'Stage'}`}
                            </p>
                            <p><strong>Meta Event:</strong> {templateForm.funnelMapping?.metaEventName || 'Not set'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-slate-200 bg-slate-50/50">
            <Button
              variant="outline"
              onClick={() => {
                setShowTemplateDialog(false);
                resetForm();
              }}
              className="h-11"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave(true)}
              className="h-11"
            >
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSave(false)}
              disabled={!templateForm.name || !templateForm.stageId || !templateForm.objective}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-11"
            >
              {editingTemplate ? 'Update Template' : 'Publish Template'}
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
