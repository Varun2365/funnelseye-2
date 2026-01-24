import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Skeleton } from '../ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Eye,
  ExternalLink,
  Copy,
  Edit,
  Play,
  Pause,
  Settings,
  Plus,
  Trash2,
  GripVertical,
  ChevronRight,
  X,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Save,
  RefreshCw,
  FileText,
  Users,
  Sparkles,
  Calendar,
  CreditCard,
  Menu
} from 'lucide-react';

// Professional Skeleton Loader
const MainSkeletonLoader = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-5 w-96 mt-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
                <Skeleton className="h-10 w-full mt-4" />
              </CardContent>
            </Card>
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full mt-4" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Template Preview Component
const TemplatePreview = ({ template, isHovered }) => {
  const previewRef = React.useRef(null);
  const scrollIntervalRef = React.useRef(null);

  React.useEffect(() => {
    if (isHovered && previewRef.current) {
      const container = previewRef.current;
      const totalHeight = container.scrollHeight;
      const visibleHeight = container.clientHeight;
      const maxScroll = totalHeight - visibleHeight;

      if (maxScroll <= 0) return;

      let currentScroll = 0;
      let direction = 1;
      let isAnimating = true;

      const animate = () => {
        if (!isAnimating || !previewRef.current) return;

        const scrollSpeed = 1.5;
        currentScroll += direction * scrollSpeed;

        if (currentScroll >= maxScroll) {
          currentScroll = maxScroll;
          direction = -1;
        } else if (currentScroll <= 0) {
          currentScroll = 0;
          direction = 1;
        }

        if (previewRef.current) {
          previewRef.current.scrollTop = currentScroll;
        }

        if (isAnimating) {
          scrollIntervalRef.current = requestAnimationFrame(animate);
        }
      };

      scrollIntervalRef.current = requestAnimationFrame(animate);

      return () => {
        isAnimating = false;
        if (scrollIntervalRef.current) {
          cancelAnimationFrame(scrollIntervalRef.current);
        }
      };
    } else {
      if (scrollIntervalRef.current) {
        cancelAnimationFrame(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      if (previewRef.current) {
        previewRef.current.scrollTop = 0;
      }
    }
  }, [isHovered]);

  const createPreviewContent = () => {
    if (!template || !template.html) return null;

    const parser = new DOMParser();
    const doc = parser.parseFromString(template.html, 'text/html');
    const sections = doc.querySelectorAll('section, div[class*="section"], div[class*="hero"], div[class*="header"], div[class*="footer"]');

    if (sections.length === 0) {
      return (
        <div style={{ padding: '20px', minHeight: '300px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div style={{ color: 'white', textAlign: 'center' }}>
            <h3 style={{ margin: '20px 0' }}>Template Preview</h3>
            <p>{template.name}</p>
          </div>
        </div>
      );
    }

    return Array.from(sections).slice(0, 5).map((section, index) => {
      const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'];
      const height = 100 + (index % 3) * 30;
      return (
        <div
          key={index}
          style={{
            minHeight: `${height}px`,
            background: `linear-gradient(135deg, ${colors[index % colors.length]} 0%, ${colors[(index + 1) % colors.length]} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            padding: '20px',
            borderBottom: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
              {section.tagName.toLowerCase()} Section
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              {template.name} - Part {index + 1}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div
      ref={previewRef}
      style={{
        width: '100%',
        height: '180px',
        overflow: 'hidden',
        position: 'relative',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        cursor: 'default'
      }}
    >
      {createPreviewContent() || (
        <div style={{
          padding: '20px',
          minHeight: '180px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Template Preview</h4>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Hover to see auto-scroll</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Stage Type Modal Component
const StageTypeModal = ({ onClose, onAddStage }) => {
  const [stageType, setStageType] = useState('');
  const [customName, setCustomName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const defaultStages = [
    { type: 'welcome-page', name: 'Welcome Page', icon: FileText },
    { type: 'vsl-page', name: 'Video Sales Letter', icon: Play },
    { type: 'product-offer', name: 'Product Offer', icon: Sparkles },
    { type: 'thankyou-page', name: 'Thank You Page', icon: CheckCircle },
    { type: 'whatsapp-page', name: 'WhatsApp Community', icon: Users },
    { type: 'appointment-page', name: 'Appointment', icon: Calendar },
    { type: 'payment-page', name: 'Payment', icon: CreditCard },
    { type: 'custom-page', name: 'Custom Page', icon: Plus }
  ];

  const handleStageSelect = (type, name) => {
    if (type === 'custom-page') {
      setStageType(type);
      setShowNameInput(true);
    } else {
      onAddStage(type, name);
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (stageType === 'custom-page' && !customName.trim()) {
      toast.error('Please enter a name for your custom stage');
      return;
    }
    onAddStage(stageType, customName || defaultStages.find(s => s.type === stageType)?.name);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">Add New Stage</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {!showNameInput ? (
            <>
              <p className="text-sm text-gray-600 mb-6">Select the type of stage you want to add to your funnel.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {defaultStages.map(stage => {
                  const IconComponent = stage.icon;
                  return (
                    <button
                      key={stage.type}
                      onClick={() => handleStageSelect(stage.type, stage.name)}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm">{stage.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {stage.type === 'welcome-page' && 'First impression page for visitors'}
                          {stage.type === 'vsl-page' && 'Video sales presentation'}
                          {stage.type === 'product-offer' && 'Present your product or service'}
                          {stage.type === 'thankyou-page' && 'Confirmation after action'}
                          {stage.type === 'whatsapp-page' && 'WhatsApp community integration'}
                          {stage.type === 'appointment-page' && 'Booking and scheduling'}
                          {stage.type === 'payment-page' && 'Payment processing'}
                          {stage.type === 'custom-page' && 'Build your own page'}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="custom-name" className="text-sm font-medium text-gray-700">Stage Name</Label>
                <Input
                  id="custom-name"
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., My Awesome Page"
                  className="mt-1"
                  autoFocus
                />
              </div>
              <DialogFooter className="pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowNameInput(false)}>
                  Back
                </Button>
                <Button type="submit">
                  Add Stage
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>

        {!showNameInput && (
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Template Selection Modal Component
const TemplateSelectionModal = ({ stageType, selectedKey, onClose, onSelect, onStartFromScratch }) => {
  const [viewMode, setViewMode] = useState('options');
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [templateCategory, setTemplateCategory] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // For demo purposes, we'll use placeholder template data
  const templates = {
    welcomeTemplates: {
      'customer-welcome': {
        name: 'Customer Welcome',
        description: 'Professional welcome page for customers',
        thumbnail: 'https://placehold.co/400x300/10b981/ffffff?text=Welcome',
        html: '<div>Welcome Page</div>',
        css: '',
        js: '',
        basicInfo: {}
      },
      'coach-welcome': {
        name: 'Coach Welcome',
        description: 'Specialized welcome page for coaches',
        thumbnail: 'https://placehold.co/400x300/3b82f6/ffffff?text=Coach+Welcome',
        html: '<div>Coach Welcome Page</div>',
        css: '',
        js: '',
        basicInfo: {}
      }
    },
    vslTemplates: {
      'standard-vsl': {
        name: 'Standard VSL',
        description: 'Classic video sales letter layout',
        thumbnail: 'https://placehold.co/400x300/8b5cf6/ffffff?text=VSL',
        html: '<div>VSL Page</div>',
        css: '',
        js: '',
        basicInfo: {}
      }
    }
  };

  const templateCategories = {
    customer: { name: 'Customer Templates', description: 'Templates designed for customer-facing pages' },
    coach: { name: 'Coach Templates', description: 'Templates designed for coaching business pages' }
  };

  const baseTemplateSet = {
    'welcome-page': templates.welcomeTemplates,
    'vsl-page': templates.vslTemplates,
    'thankyou-page': {},
    'whatsapp-page': {},
    'product-offer': {},
    'custom-page': {},
    'appointment-page': {},
    'payment-page': {}
  }[stageType];

  const getOrganizedTemplateSet = () => {
    if (!templateCategory || !templates[`${templateCategory}Templates`]) {
      return baseTemplateSet;
    }
    return templates[`${templateCategory}Templates`];
  };

  const templateSet = getOrganizedTemplateSet();
  const currentTemplate = selectedKey && templateSet && selectedKey !== 'blank-template' ? templateSet[selectedKey] : null;
  const isBlankTemplate = selectedKey === 'blank-template';

  const handleTemplateSelect = (templateKey) => {
    onSelect(templateKey, templateCategory);
    onClose();
  };

  const handleStartFromScratch = () => {
    onStartFromScratch();
    onClose();
  };

  const handleCategorySelect = (category) => {
    setTemplateCategory(category);
    setViewMode('templates');
  };

  const needsCategorySelection = stageType === 'welcome-page' && viewMode === 'templates' && !templateCategory;

  if (!templateSet || Object.keys(templateSet).length === 0) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Template Selection</DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <p>This stage is managed by system settings and does not have a selectable design here.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {viewMode === 'options' ? 'Select Template' :
             viewMode === 'customer-coach-selection' ? 'Choose Category' :
             'Choose a Template'}
          </DialogTitle>
          {(viewMode === 'templates' || viewMode === 'customer-coach-selection') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (viewMode === 'customer-coach-selection') {
                  setViewMode('options');
                } else if (templateCategory) {
                  setTemplateCategory(null);
                  setViewMode('customer-coach-selection');
                } else {
                  setViewMode('options');
                }
              }}
              className="absolute left-4 top-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {viewMode === 'customer-coach-selection' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center mb-6">
                Choose whether you want Customer templates or Coach templates
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(templateCategories).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => handleCategorySelect(key)}
                    className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        {key === 'customer' ? <Users className="w-6 h-6 text-blue-600" /> : <FileText className="w-6 h-6 text-blue-600" />}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : viewMode === 'options' ? (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">How would you like to start?</h3>
                <p className="text-sm text-gray-600">Select a template or start with a blank canvas.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start from Scratch */}
                <button
                  onClick={handleStartFromScratch}
                  className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <Plus className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Start from Scratch</h3>
                      <p className="text-sm text-gray-500 mt-1">Begin with a blank canvas and build your page from the ground up.</p>
                    </div>
                  </div>
                </button>

                {/* Choose Template */}
                <button
                  onClick={() => {
                    if (stageType === 'welcome-page') {
                      setViewMode('customer-coach-selection');
                    } else {
                      setViewMode('templates');
                    }
                  }}
                  className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Choose Template</h3>
                      <p className="text-sm text-gray-500 mt-1">Browse from our collection of professionally designed templates.</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-6">
                Select a template to use as the starting point for your page design.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.keys(templateSet).map((templateKey) => {
                  const template = templateSet[templateKey];
                  const isSelected = selectedKey === templateKey;
                  const isHovered = hoveredTemplate === templateKey;
                  return (
                    <button
                      key={templateKey}
                      onClick={() => handleTemplateSelect(templateKey)}
                      onMouseEnter={() => setHoveredTemplate(templateKey)}
                      onMouseLeave={() => setHoveredTemplate(null)}
                      className={`relative border rounded-lg overflow-hidden transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                        {isHovered ? (
                          <TemplatePreview template={template} isHovered={isHovered} />
                        ) : (
                          <img
                            src={template.thumbnail}
                            alt={template.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/400x300/ccc/ffffff?text=Template';
                            }}
                          />
                        )}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                            Selected
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 text-sm">{template.name}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const FunnelManagement = () => {
  const { funnelId } = useParams();
  const navigate = useNavigate();
  const { admin } = useAuth();

  const [funnel, setFunnel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Template');
  const [activeStageId, setActiveStageId] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const [isFunnelActive, setIsFunnelActive] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const [basicInfo, setBasicInfo] = useState({
    name: '',
    description: '',
    targetAudience: 'customer',
    funnelUrl: '',
    indexPageId: ''
  });

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 767;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch funnel data
  useEffect(() => {
    const fetchFunnel = async () => {
      if (!funnelId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/admin/funnels/${funnelId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch funnel: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setFunnel(result.data);
          setIsFunnelActive(result.data.isActive);
          setActiveStageId(result.data.stages?.[0]?.pageId || result.data.stages?.[0]?._id || '');
          setBasicInfo({
            name: result.data.name || '',
            description: result.data.description || '',
            targetAudience: result.data.targetAudience || 'customer',
            funnelUrl: result.data.funnelUrl || '',
            indexPageId: result.data.indexPageId || result.data.stages?.[0]?.pageId || result.data.stages?.[0]?._id || ''
          });
        } else {
          throw new Error(result.message || 'Failed to fetch funnel');
        }
      } catch (err) {
        console.error('Error fetching funnel:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFunnel();
  }, [funnelId]);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('URL copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy URL');
    }
  };

  const getFunnelUrl = () => {
    if (!funnel?.funnelUrl || !funnel?.stages?.length) return null;
    const pageId = funnel.indexPageId || funnel.stages[0]?.pageId || funnel.stages[0]?._id;
    return pageId ? `/funnels/${funnel.funnelUrl}/${pageId}` : null;
  };

  // Toggle funnel status
  const handleToggleStatus = async () => {
    if (!funnel) return;

    setIsStatusLoading(true);
    try {
      const response = await fetch(`/api/admin/funnels/${funnelId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setFunnel(prev => ({ ...prev, isActive: !prev.isActive }));
        setIsFunnelActive(!isFunnelActive);
        toast.success(`Funnel ${!funnel.isActive ? 'activated' : 'deactivated'} successfully`);
      } else {
        throw new Error(result.message || 'Failed to toggle status');
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      toast.error('Failed to update funnel status');
    } finally {
      setIsStatusLoading(false);
    }
  };

  // Handle stage addition (placeholder for now)
  const handleAddStage = (type, name) => {
    toast.info(`Adding stage: ${name} (${type})`);
    // TODO: Implement actual stage addition logic
  };

  // Handle template selection (placeholder)
  const handleTemplateSelect = (templateKey, category) => {
    toast.success(`Template ${templateKey} selected!`);
    setShowTemplateModal(false);
  };

  // Handle start from scratch
  const handleStartFromScratch = () => {
    toast.info('Starting from scratch!');
    setShowTemplateModal(false);
  };

  // Get active stage
  const activeStage = funnel?.stages?.find(s => (s._id === activeStageId) || (s.pageId === activeStageId));

  const TABS = ['Template', 'Basic'];
  if (activeStage && ['appointment-page', 'payment-page'].includes(activeStage.type)) {
    TABS.push('Settings');
  }

  // Loading state
  if (loading) {
    return <MainSkeletonLoader />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-xl font-bold text-red-800 mb-2">Error Loading Funnel</CardTitle>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={() => navigate('/funnels')} variant="outline">
            Back to Funnels
          </Button>
        </Card>
      </div>
    );
  }

  // No funnel found
  if (!funnel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <CardTitle className="text-xl font-bold text-gray-800 mb-2">Funnel Not Found</CardTitle>
          <p className="text-gray-600 mb-4">The funnel you are looking for does not exist.</p>
          <Button onClick={() => navigate('/funnels')} variant="outline">
            Back to Funnels
          </Button>
        </Card>
      </div>
    );
  }

  // Content renderer
  const renderContentArea = () => {
    switch (activeTab) {
      case 'Template':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Selection</CardTitle>
              <p className="text-sm text-gray-600">
                Choose how you want to start building your page for: <span className="font-medium">{activeStage?.name || 'No stage selected'}</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setShowTemplateModal(true)} className="w-full">
                <Edit className="w-4 h-4 mr-2" />
                Select Template
              </Button>
            </CardContent>
          </Card>
        );

      case 'Basic':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Funnel Name</Label>
                  <Input value={basicInfo.name} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label>Funnel URL Slug</Label>
                  <Input value={basicInfo.funnelUrl} readOnly className="bg-gray-50" />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea value={basicInfo.description} readOnly className="bg-gray-50 min-h-[100px]" />
                </div>
                <div>
                  <Label>Target Audience</Label>
                  <Input value={basicInfo.targetAudience} readOnly className="bg-gray-50" />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'Settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Settings for {activeStage?.name || 'selected stage'}</p>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 bg-white border border-gray-200 rounded-lg p-2 shadow-lg md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''
        }`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {isMobile && (
                  <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                )}
                <h2 className="text-lg font-semibold text-gray-900">Funnel Stages</h2>
                <div></div>
              </div>
            </div>

            {/* Stages List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {funnel.stages?.length > 0 ? (
                  funnel.stages.map((stage, index) => (
                    <div
                      key={stage._id || stage.pageId}
                      onClick={() => {
                        setActiveStageId(stage._id || stage.pageId);
                        if (isMobile) setSidebarOpen(false);
                      }}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        activeStageId === (stage._id || stage.pageId) ? 'bg-blue-50 border border-blue-200' : 'border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          activeStageId === (stage._id || stage.pageId) ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <FileText className={`w-4 h-4 ${
                            activeStageId === (stage._id || stage.pageId) ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            activeStageId === (stage._id || stage.pageId) ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {stage.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {stage.type?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                        </div>
                      </div>
                      {activeStageId === (stage._id || stage.pageId) && (
                        <ChevronRight className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No stages yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Add Stage Button */}
            <div className="p-4 border-t border-gray-200">
              <Button onClick={() => setShowStageModal(true)} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add New Stage
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/funnels')} className="hidden md:flex">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{funnel.name}</h1>
                  <p className="text-sm text-gray-600 mt-1">{funnel.description || 'No description'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Status Toggle */}
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${isFunnelActive ? 'text-green-600' : 'text-gray-500'}`}>
                    {isFunnelActive ? 'Active' : 'Inactive'}
                  </span>
                  {isStatusLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  ) : (
                    <Switch
                      checked={isFunnelActive}
                      onCheckedChange={handleToggleStatus}
                      disabled={isStatusLoading}
                    />
                  )}
                </div>

                {/* Preview Button */}
                {getFunnelUrl() && (
                  <Button variant="outline" size="sm" onClick={() => window.open(getFunnelUrl(), '_blank')}>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                )}
              </div>
            </div>
          </header>

          {/* URL Bar */}
          {getFunnelUrl() && (
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Funnel URL:</span>
                <code className="bg-white px-3 py-1 rounded border text-sm font-mono text-blue-600">
                  {window.location.origin}{getFunnelUrl()}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(window.location.origin + getFunnelUrl())}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Content */}
          <main className="p-6">
            <div className="max-w-4xl mx-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  {TABS.map(tab => (
                    <TabsTrigger key={tab} value={tab} className="text-sm">
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {TABS.map(tab => (
                  <TabsContent key={tab} value={tab} className="space-y-6">
                    {renderContentArea()}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </main>
        </div>
      </div>

      {/* Modals */}
      {showStageModal && (
        <StageTypeModal
          onClose={() => setShowStageModal(false)}
          onAddStage={handleAddStage}
        />
      )}

      {showTemplateModal && activeStage && (
        <TemplateSelectionModal
          stageType={activeStage.type}
          selectedKey={activeStage.selectedTemplateKey}
          onClose={() => setShowTemplateModal(false)}
          onSelect={handleTemplateSelect}
          onStartFromScratch={handleStartFromScratch}
        />
      )}
    </div>
  );
};

export default FunnelManagement;