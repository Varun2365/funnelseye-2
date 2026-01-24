import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { toast } from 'sonner';
import { templates } from '../funnel-builder/funnel-templates';
import {
  ArrowLeft,
  Eye,
  Edit,
  Settings,
  Plus,
  ChevronRight,
  X,
  CheckCircle,
  Save,
  FileText,
  Users,
  Sparkles,
  Calendar,
  CreditCard,
  Copy,
  ExternalLink,
  GripVertical,
  Trash2,
  Menu,
  Play,
  Upload,
  Image as ImageIcon,
  Globe,
  Search,
  Share2,
  Code
} from 'lucide-react';

// Add minimal CSS for drag and drop
const funnelStyles = `
/* Drag and Drop Styles */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = funnelStyles;
  document.head.appendChild(styleSheet);
}

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
    { type: 'welcome-page', name: 'Welcome Page', icon: FileText, iconColor: 'text-blue-600', iconBg: 'bg-gradient-to-br from-blue-50 to-blue-100', iconHoverBg: 'group-hover:from-blue-100 group-hover:to-blue-200' },
    { type: 'vsl-page', name: 'Video Sales Letter', icon: Play, iconColor: 'text-purple-600', iconBg: 'bg-gradient-to-br from-purple-50 to-purple-100', iconHoverBg: 'group-hover:from-purple-100 group-hover:to-purple-200' },
    { type: 'product-offer', name: 'Product Offer', icon: Sparkles, iconColor: 'text-amber-600', iconBg: 'bg-gradient-to-br from-amber-50 to-amber-100', iconHoverBg: 'group-hover:from-amber-100 group-hover:to-amber-200' },
    { type: 'thankyou-page', name: 'Thank You Page', icon: CheckCircle, iconColor: 'text-green-600', iconBg: 'bg-gradient-to-br from-green-50 to-green-100', iconHoverBg: 'group-hover:from-green-100 group-hover:to-green-200' },
    { type: 'whatsapp-page', name: 'WhatsApp Community', icon: Users, iconColor: 'text-emerald-600', iconBg: 'bg-gradient-to-br from-emerald-50 to-emerald-100', iconHoverBg: 'group-hover:from-emerald-100 group-hover:to-emerald-200' },
    { type: 'appointment-page', name: 'Appointment', icon: Calendar, iconColor: 'text-indigo-600', iconBg: 'bg-gradient-to-br from-indigo-50 to-indigo-100', iconHoverBg: 'group-hover:from-indigo-100 group-hover:to-indigo-200' },
    { type: 'payment-page', name: 'Payment', icon: CreditCard, iconColor: 'text-rose-600', iconBg: 'bg-gradient-to-br from-rose-50 to-rose-100', iconHoverBg: 'group-hover:from-rose-100 group-hover:to-rose-200' },
    { type: 'custom-page', name: 'Custom Page', icon: Plus, iconColor: 'text-slate-600', iconBg: 'bg-gradient-to-br from-slate-50 to-slate-100', iconHoverBg: 'group-hover:from-slate-100 group-hover:to-slate-200' }
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
    if (e) {
      e.preventDefault();
    }
    if (stageType === 'custom-page' && !customName.trim()) {
      toast.error('Please enter a name for your custom stage');
      return;
    }
    onAddStage(stageType, customName || defaultStages.find(s => s.type === stageType)?.name);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-semibold">Add New Stage</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {!showNameInput ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-4">
              {defaultStages.map(stage => {
                const IconComponent = stage.icon;
                return (
                  <button
                    key={stage.type}
                    onClick={() => handleStageSelect(stage.type, stage.name)}
                    className="flex items-center gap-4 p-5 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50/50 hover:shadow-md transition-all duration-200 text-left group"
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${stage.iconBg} ${stage.iconHoverBg} flex items-center justify-center transition-all`}>
                      <IconComponent className={`w-6 h-6 ${stage.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900">{stage.name}</h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 group-hover:text-gray-600 transition-colors" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6 pr-4">
              <div className="space-y-3">
                <Label htmlFor="custom-name" className="text-base font-medium text-gray-900">Stage Name</Label>
                <Input
                  id="custom-name"
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., My Awesome Page"
                  autoFocus
                  className="h-12 text-base"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="pt-6 border-t">
          {showNameInput ? (
            <>
              <Button type="button" variant="outline" onClick={() => setShowNameInput(false)} className="border-gray-300 hover:bg-gray-50 px-6">
                Back
              </Button>
              <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                Add Stage
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose} className="border-gray-300 hover:bg-gray-50 px-6">
              Cancel
            </Button>
          )}
        </DialogFooter>
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

  // Template categories
  const templateCategories = {
    customer: { name: 'Customer Templates', description: 'Templates designed for customer-facing pages and landing pages.' },
    coach: { name: 'Coach Templates', description: 'Templates designed for coach business pages and professional coaching funnels.' }
  };

  // Organize templates into customer/coach categories
  const organizeTemplates = (templateSet) => {
    if (!templateSet || typeof templateSet !== 'object') return { customer: {}, coach: {} };
    
    const organized = { customer: {}, coach: {} };
    
    Object.keys(templateSet).forEach(key => {
      const template = templateSet[key];
      // Categorize based on key name or template properties
      if (key.toLowerCase().includes('coach') || key.toLowerCase().includes('business')) {
        organized.coach[key] = template;
      } else {
        organized.customer[key] = template;
      }
    });
    
    return organized;
  };

  // Get base template set
  const baseTemplateSet = {
    'welcome-page': templates?.welcomeTemplates || {},
    'vsl-page': templates?.vslTemplates || {},
    'thankyou-page': templates?.thankyouTemplates || {},
    'whatsapp-page': templates?.whatsappTemplates || {},
    'product-offer': templates?.productOfferTemplates || {},
    'custom-page': templates?.miscTemplates || {},
    'appointment-page': templates?.appointmentTemplates || {},
    'payment-page': templates?.paymentTemplates || {}
  }[stageType] || {};

  // Organize templates by category
  const organizedTemplates = organizeTemplates(baseTemplateSet);

  // Get organized template set based on category
  const getOrganizedTemplateSet = () => {
    if (!templateCategory) {
      return baseTemplateSet;
    }
    
    // For welcome-page, use organized templates
    if (stageType === 'welcome-page' && organizedTemplates[templateCategory]) {
      return organizedTemplates[templateCategory];
    }
    
    // For other stage types, use base template set
    return baseTemplateSet;
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
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
              className="absolute left-4 top-4 hover:bg-blue-50 hover:text-blue-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {viewMode === 'customer-coach-selection' ? (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Select Template Category
                </h3>
                <p className="text-sm text-gray-600">
                  Choose whether you want Customer templates or Coach templates
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(templateCategories).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => handleCategorySelect(key)}
                    className="relative p-6 border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all duration-300 text-left group bg-white"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(59, 130, 246, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                        key === 'customer' 
                          ? 'bg-gradient-to-br from-green-50 to-green-100 group-hover:from-green-100 group-hover:to-green-200' 
                          : 'bg-gradient-to-br from-blue-50 to-blue-100 group-hover:from-blue-100 group-hover:to-blue-200'
                      }`}>
                        {key === 'customer' ? (
                          <Users className={`w-7 h-7 ${key === 'customer' ? 'text-green-600' : 'text-blue-600'}`} />
                        ) : (
                          <FileText className="w-7 h-7 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">{category.name}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{category.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : viewMode === 'options' ? (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">How would you like to start?</h3>
                <p className="text-sm text-gray-600">Select a template or start with a blank canvas.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start from Scratch */}
                <button
                  onClick={handleStartFromScratch}
                  className="p-6 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-md transition-all duration-200 text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:from-gray-100 group-hover:to-gray-200 transition-all">
                      <Plus className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base text-gray-900 mb-1.5">Start from Scratch</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">Begin with a blank canvas and build your page from the ground up with complete creative freedom.</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </button>

                {/* Current Template */}
                {currentTemplate || isBlankTemplate ? (
                  <button
                    onClick={() => {
                      if (currentTemplate) {
                        handleTemplateSelect(selectedKey);
                      } else {
                        handleStartFromScratch();
                      }
                    }}
                    className="p-6 border-2 border-blue-400 bg-blue-50 rounded-xl text-left group hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-base text-blue-900 mb-1.5">Current Template</h3>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          {currentTemplate?.name || 'Blank Template (Start from Scratch)'}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (stageType === 'welcome-page') {
                        setViewMode('customer-coach-selection');
                      } else {
                        setViewMode('templates');
                      }
                    }}
                    className="p-6 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-md transition-all duration-200 text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all">
                        <Sparkles className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-base text-gray-900 mb-1.5">Choose Template</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">Browse and select from our collection of professionally designed templates.</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
                    </div>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-6">
                Select a template to use as the starting point for your page design.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Object.keys(templateSet).map((templateKey) => {
                  const template = templateSet[templateKey];
                  const isSelected = selectedKey === templateKey;
                  const isHovered = hoveredTemplate === templateKey;
                  return (
                    <div
                      key={templateKey}
                      onClick={() => handleTemplateSelect(templateKey)}
                      onMouseEnter={(e) => {
                        setHoveredTemplate(templateKey);
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#3b82f6';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        setHoveredTemplate(null);
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        backgroundColor: 'white',
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <div style={{
                        position: 'relative',
                        overflow: 'hidden',
                        aspectRatio: '1',
                        backgroundColor: '#f3f4f6'
                      }}>
                        {isHovered ? (
                          <TemplatePreview template={template} isHovered={isHovered} />
                        ) : (
                          <>
                            <img
                              src={template.thumbnail}
                              alt={template.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block'
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/200x200/ccc/ffffff?text=Template';
                              }}
                            />
                            {isSelected && (
                              <div style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: '#3b82f6',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '600',
                                zIndex: 10
                              }}>
                                Selected
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewTemplate(template);
                              }}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                left: '8px',
                                background: 'rgba(255, 255, 255, 0.9)',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#3b82f6',
                                zIndex: 15,
                                transition: 'all 0.2s',
                                width: '28px',
                                height: '28px',
                                opacity: isHovered ? 1 : 0.8
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.1)';
                                e.target.style.opacity = '1';
                                e.target.style.background = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.opacity = '0.8';
                                e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                              }}
                              title="View Template Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                      <div style={{
                        padding: '12px',
                        backgroundColor: 'white'
                      }}>
                        <h4 style={{
                          margin: '0 0 4px 0',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#1a202c'
                        }}>{template.name}</h4>
                        <p style={{
                          margin: 0,
                          fontSize: '12px',
                          color: '#6b7280',
                          lineHeight: '1.4'
                        }}>{template.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="border-gray-300 hover:bg-gray-50">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Template Preview Modal */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{previewTemplate.name || 'Template Preview'}</DialogTitle>
              <p className="text-sm text-muted-foreground">Live Template Preview</p>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh]">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div 
                  dangerouslySetInnerHTML={{ __html: previewTemplate.html || '<p>Preview not available</p>' }}
                  style={{ minHeight: '400px' }}
                />
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
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
  const [funnelUrl, setFunnelUrl] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [draggedStageId, setDraggedStageId] = useState(null);
  const [dragOverStageId, setDragOverStageId] = useState(null);
  const [previewHovered, setPreviewHovered] = useState(false);

  const [basicInfo, setBasicInfo] = useState({
    name: '',
    description: '',
    targetAudience: 'customer',
    funnelUrl: '',
    indexPageId: '',
    slug: '',
    title: '',
    keywords: ''
  });

  const [stageSettings, setStageSettings] = useState({
    name: '',
    slug: '',
    title: '',
    description: '',
    keywords: '',
    favicon: '',
    socialImage: '',
    socialTitle: '',
    socialDescription: '',
    customHtmlHead: '',
    customHtmlBody: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  // Track if we're dragging to prevent click events
  const isDraggingRef = useRef(false);

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

          // Set funnel URL
          if (result.data.stages && result.data.stages.length > 0) {
            const pageId = result.data.stages[0].pageId;
            const fullUrl = buildPreviewUrl(result.data.funnelUrl, pageId);
            setFunnelUrl(fullUrl || '');
          }

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

  // Get base URL for funnel previews
  const getFunnelBaseUrl = () => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080';
    }
    return 'https://api.funnelseye.com';
  };

  // Helper function to build preview funnel URL
  const buildPreviewUrl = (funnelUrl, pageId) => {
    if (!funnelUrl || !pageId) return null;
    const baseUrl = getFunnelBaseUrl();
    return `${baseUrl}/preview/funnels/${funnelUrl}/${pageId}`;
  };

  const getFunnelUrl = () => {
    if (!funnel?.funnelUrl || !funnel?.stages?.length) return null;
    const pageId = funnel.indexPageId || funnel.stages[0]?.pageId || funnel.stages[0]?._id;
    return buildPreviewUrl(funnel.funnelUrl, pageId);
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


  // Update stage settings when active stage changes
  useEffect(() => {
    if (funnel && activeStageId) {
      const currentStage = funnel.stages?.find(s => (s._id === activeStageId) || (s.pageId === activeStageId));
      if (currentStage) {
        const basicInfo = currentStage.basicInfo || {};
        setStageSettings({
          name: currentStage.name || '',
          slug: basicInfo.slug || '',
          title: basicInfo.title || '',
          description: basicInfo.description || '',
          keywords: basicInfo.keywords || '',
          favicon: basicInfo.favicon || '',
          socialImage: basicInfo.socialImage || '',
          socialTitle: basicInfo.socialTitle || '',
          socialDescription: basicInfo.socialDescription || '',
          customHtmlHead: basicInfo.customHtmlHead || '',
          customHtmlBody: basicInfo.customHtmlBody || ''
        });
      }
    }
  }, [funnel, activeStageId]);

  // Update stage settings
  const updateStageSettings = (key, value) => {
    setStageSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Save stage settings to backend
  const saveStageSettings = async () => {
    if (!activeStage || !funnel || !funnelId) {
      toast.error('No stage selected');
      return;
    }

    setIsSaving(true);
    try {
      const stageId = activeStage._id || activeStage.pageId;
      const updatedStages = funnel.stages.map(stage => {
        if ((stage._id === stageId) || (stage.pageId === stageId)) {
          return {
            ...stage,
            name: stageSettings.name,
            basicInfo: {
              ...(stage.basicInfo || {}),
              slug: stageSettings.slug,
              title: stageSettings.title,
              description: stageSettings.description,
              keywords: stageSettings.keywords,
              favicon: stageSettings.favicon,
              socialImage: stageSettings.socialImage,
              socialTitle: stageSettings.socialTitle,
              socialDescription: stageSettings.socialDescription,
              customHtmlHead: stageSettings.customHtmlHead,
              customHtmlBody: stageSettings.customHtmlBody
            }
          };
        }
        return stage;
      });

      const response = await fetch(`/api/admin/funnels/${funnelId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...funnel,
          stages: updatedStages
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setFunnel(result.data);
        toast.success('Settings saved successfully');
      } else {
        throw new Error(result.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error(`Failed to save settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle file upload for images
  const handleImageUpload = async (file, type) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/content/admin/upload-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      if (result.success && result.data) {
        // Construct the file URL from the filename
        // The file is typically stored in uploads directory
        const fileUrl = `/uploads/${result.data.filename}`;
        updateStageSettings(type, fileUrl);
        toast.success('Image uploaded successfully');
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error(`Failed to upload image: ${err.message}`);
    }
  };

  // Handle preview funnel
  const handlePreviewFunnel = async (specificPageId = null) => {
    try {
      if (!funnel?.funnelUrl || !funnel?.stages || funnel.stages.length === 0) {
        toast.error('Funnel URL not available. Please publish the funnel first.');
        return;
      }

      // Use specificPageId if provided, otherwise use indexPageId or first stage's pageId
      let pageId = specificPageId;
      if (!pageId) {
        pageId = funnel.indexPageId || funnel.stages[0]?.pageId;
      }

      if (!pageId) {
        toast.error('No pages available in this funnel. Please add a stage first.');
        return;
      }

      const previewUrl = buildPreviewUrl(funnel.funnelUrl, pageId);
      if (previewUrl) {
        window.open(previewUrl, '_blank');
      } else {
        toast.error('Unable to generate preview URL');
      }
    } catch (err) {
      console.error('Error previewing funnel:', err);
      toast.error('Failed to open preview. Please try again.');
    }
  };

  // Get page URL
  const getPageUrl = async (stageId) => {
    try {
      if (!funnel?.funnelUrl || !funnel?.stages || funnel.stages.length === 0) {
        return null;
      }

      // Find the stage in the backend data to get its pageId
      const backendStage = funnel.stages?.find(s =>
        (s.pageId === stageId) || (s._id === stageId) ||
        (funnel.stages.find(st => st.id === stageId) && s.pageId === funnel.stages.find(st => st.id === stageId).id)
      );

      // If not found in backend, try to use stageId directly
      const pageId = backendStage?.pageId || stageId;

      if (!pageId) {
        return null;
      }

      return buildPreviewUrl(funnel.funnelUrl, pageId);
    } catch (err) {
      console.error('Error getting page URL:', err);
      return null;
    }
  };

  // Handle preview stage
  const handlePreviewStage = async (stageId) => {
    const previewUrl = await getPageUrl(stageId);
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    } else {
      toast.error('Unable to preview page. Please ensure the funnel is saved and published first.');
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error('Failed to copy URL');
    }
  };

  // Handle add stage
  const handleAddStage = async (type, name) => {
    if (!funnel || !funnelId) {
      toast.error('Funnel not loaded');
      return;
    }

    if (type !== 'custom-page' && funnel?.stages?.some(s => s.type === type)) {
      toast.error(`${name} stage already exists in this funnel.`);
      return;
    }

    try {
      // Generate a unique pageId
      const pageId = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Default HTML content
      const defaultHtml = '<div class="container"><h1>' + name + '</h1><p>Start building your page here.</p></div>';
      
      // Create new stage object
      const newStage = {
        name: name,
        type: type,
        pageId: pageId,
        order: funnel.stages?.length || 0,
        html: defaultHtml,
        css: '',
        js: '',
        assets: [],
        basicInfo: {
          title: name,
          slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          description: '',
          keywords: ''
        },
        isEnabled: true
      };

      // Add stage to local state first for immediate UI update
      const updatedStages = [...(funnel.stages || []), newStage];
      setFunnel(prev => ({
        ...prev,
        stages: updatedStages
      }));

      // Save to backend
      const response = await fetch(`/api/admin/funnels/${funnelId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...funnel,
          stages: updatedStages
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to add stage: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Update with the actual stage data from backend (includes _id, pageId, etc.)
        setFunnel(result.data);
        
        // Set the newly added stage as active
        const newStageFromBackend = result.data.stages?.find(s => 
          s.type === type && s.name === name && 
          (!funnel.stages || !funnel.stages.some(oldStage => oldStage._id === s._id))
        );
        
        if (newStageFromBackend) {
          setActiveStageId(newStageFromBackend._id || newStageFromBackend.pageId);
        }
        
        setActiveTab('Template');
        toast.success(`${name} stage added successfully`);
      } else {
        throw new Error(result.message || 'Failed to add stage');
      }
    } catch (err) {
      console.error('Error adding stage:', err);
      toast.error(`Failed to add stage: ${err.message}`);
      
      // Revert local state on error
      setFunnel(prev => ({
        ...prev,
        stages: funnel.stages || []
      }));
    }
  };

  // Handle remove stage
  const handleRemoveStage = async (stageId) => {
    if (!funnel || !funnelId) {
      toast.error('Funnel not loaded');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete this stage?`)) {
      return;
    }

    try {
      // Remove stage from local state first
      const updatedStages = funnel.stages?.filter(s => 
        (s._id !== stageId) && (s.pageId !== stageId)
      ) || [];

      // If we're deleting the active stage, switch to another one
      if (activeStageId === stageId) {
        const remainingStages = updatedStages;
        if (remainingStages.length > 0) {
          setActiveStageId(remainingStages[0]._id || remainingStages[0].pageId);
        } else {
          setActiveStageId('');
        }
      }

      setFunnel(prev => ({
        ...prev,
        stages: updatedStages
      }));

      // Save to backend
      const response = await fetch(`/api/admin/funnels/${funnelId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...funnel,
          stages: updatedStages
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to delete stage: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setFunnel(result.data);
        toast.success('Stage deleted successfully');
      } else {
        throw new Error(result.message || 'Failed to delete stage');
      }
    } catch (err) {
      console.error('Error deleting stage:', err);
      toast.error(`Failed to delete stage: ${err.message}`);
      
      // Revert local state on error
      setFunnel(prev => ({
        ...prev,
        stages: funnel.stages || []
      }));
    }
  };

  // Handle duplicate stage
  const handleDuplicateStage = async (stageId) => {
    if (!funnel || !funnelId) {
      toast.error('Funnel not loaded');
      return;
    }

    try {
      const stageToDuplicate = funnel.stages?.find(s => 
        (s._id === stageId) || (s.pageId === stageId)
      );

      if (!stageToDuplicate) {
        toast.error('Stage not found');
        return;
      }

      // Create duplicated stage
      const newStage = {
        name: `${stageToDuplicate.name} (Copy)`,
        type: stageToDuplicate.type,
        order: funnel.stages?.length || 0,
        html: stageToDuplicate.html || '',
        css: stageToDuplicate.css || '',
        js: stageToDuplicate.js || '',
        assets: [...(stageToDuplicate.assets || [])],
        basicInfo: { ...(stageToDuplicate.basicInfo || {}) },
        isEnabled: true
      };

      // Add to local state
      const updatedStages = [...(funnel.stages || []), newStage];
      setFunnel(prev => ({
        ...prev,
        stages: updatedStages
      }));

      // Save to backend
      const response = await fetch(`/api/admin/funnels/${funnelId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...funnel,
          stages: updatedStages
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to duplicate stage: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setFunnel(result.data);
        
        // Set the duplicated stage as active
        const duplicatedStage = result.data.stages?.find(s => 
          s.name === newStage.name && 
          (!funnel.stages || !funnel.stages.some(oldStage => oldStage._id === s._id))
        );
        
        if (duplicatedStage) {
          setActiveStageId(duplicatedStage._id || duplicatedStage.pageId);
        }
        
        setActiveTab('Template');
        toast.success('Stage duplicated successfully');
      } else {
        throw new Error(result.message || 'Failed to duplicate stage');
      }
    } catch (err) {
      console.error('Error duplicating stage:', err);
      toast.error(`Failed to duplicate stage: ${err.message}`);
      
      // Revert local state on error
      setFunnel(prev => ({
        ...prev,
        stages: funnel.stages || []
      }));
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, stageId) => {
    isDraggingRef.current = true;
    setDraggedStageId(stageId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', stageId);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedStageId(null);
    setDragOverStageId(null);
    // Reset dragging flag after a short delay to allow drop to complete
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (stageId !== draggedStageId) {
      setDragOverStageId(stageId);
    }
  };

  const handleDragLeave = (e) => {
    setDragOverStageId(null);
  };

  const handleDrop = async (e, targetStageId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedStageId || draggedStageId === targetStageId || !funnel || !funnelId) {
      setDraggedStageId(null);
      setDragOverStageId(null);
      return;
    }

    try {
      const draggedIndex = funnel.stages?.findIndex(s => 
        (s._id === draggedStageId) || (s.pageId === draggedStageId)
      );
      const targetIndex = funnel.stages?.findIndex(s => 
        (s._id === targetStageId) || (s.pageId === targetStageId)
      );

      if (draggedIndex === -1 || targetIndex === -1) {
        setDraggedStageId(null);
        setDragOverStageId(null);
        return;
      }

      // Create new stages array with reordered items
      const newStages = [...(funnel.stages || [])];
      const [removed] = newStages.splice(draggedIndex, 1);
      newStages.splice(targetIndex, 0, removed);

      // Update order property for all stages
      newStages.forEach((stage, index) => {
        stage.order = index;
      });

      // Update local state
      setFunnel(prev => ({
        ...prev,
        stages: newStages
      }));

      // Save to backend
      const response = await fetch(`/api/admin/funnels/${funnelId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...funnel,
          stages: newStages
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to reorder stages: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setFunnel(result.data);
        toast.success('Stages reordered successfully');
      } else {
        throw new Error(result.message || 'Failed to reorder stages');
      }
    } catch (err) {
      console.error('Error reordering stages:', err);
      toast.error(`Failed to reorder stages: ${err.message}`);
      
      // Revert local state on error
      setFunnel(prev => ({
        ...prev,
        stages: funnel.stages || []
      }));
    }

    setDraggedStageId(null);
    setDragOverStageId(null);
  };

  // Handle template select
  const handleTemplateSelect = async (templateKey, category = null) => {
    if (!activeStage || !funnel) {
      toast.error('No stage selected');
      return;
    }

    const stageId = activeStage._id || activeStage.pageId;
    const stageType = activeStage.type;

    // Get template set based on stage type
    const templateSetMap = {
      'welcome-page': templates?.welcomeTemplates || {},
      'vsl-page': templates?.vslTemplates || {},
      'thankyou-page': templates?.thankyouTemplates || {},
      'whatsapp-page': templates?.whatsappTemplates || {},
      'product-offer': templates?.productOfferTemplates || {},
      'custom-page': templates?.miscTemplates || {},
      'appointment-page': templates?.appointmentTemplates || {},
      'payment-page': templates?.paymentTemplates || {}
    };

    const templateSet = templateSetMap[stageType] || {};
    
    // If category is provided and it's welcome-page, get organized templates
    let selectedTemplate = templateSet[templateKey];
    if (category && stageType === 'welcome-page') {
      const organized = organizeTemplates(templateSet);
      selectedTemplate = organized[category]?.[templateKey] || selectedTemplate;
    }

    if (!selectedTemplate) {
      toast.error('Template not found');
      return;
    }

    try {
      // Update stage with template content
      const updatedStages = funnel.stages.map(stage => {
        if ((stage._id === stageId) || (stage.pageId === stageId)) {
          return {
            ...stage,
            html: selectedTemplate.html || stage.html,
            css: selectedTemplate.css || stage.css,
            js: selectedTemplate.js || stage.js,
            basicInfo: {
              ...stage.basicInfo,
              ...(selectedTemplate.basicInfo || {})
            }
          };
        }
        return stage;
      });

      // Save to backend
      const response = await fetch(`/api/admin/funnels/${funnelId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...funnel,
          stages: updatedStages
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update template: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setFunnel(result.data);
        toast.success(`Template "${selectedTemplate.name}" applied successfully!`);
      } else {
        throw new Error(result.message || 'Failed to update template');
      }
    } catch (err) {
      console.error('Error applying template:', err);
      toast.error(`Failed to apply template: ${err.message}`);
    }
  };

  // Handle start from scratch
  const handleStartFromScratch = async () => {
    if (!activeStage || !funnel) {
      toast.error('No stage selected');
      return;
    }

    const stageId = activeStage._id || activeStage.pageId;
    const blankTemplate = {
      html: '<div class="container"><h1>Your Page Title</h1><p>Start building your page here.</p></div>',
      css: '.container { max-width: 1200px; margin: 0 auto; padding: 20px; }',
      js: ''
    };

    try {
      const updatedStages = funnel.stages.map(stage => {
        if ((stage._id === stageId) || (stage.pageId === stageId)) {
          return {
            ...stage,
            html: blankTemplate.html,
            css: blankTemplate.css,
            js: blankTemplate.js
          };
        }
        return stage;
      });

      const response = await fetch(`/api/admin/funnels/${funnelId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...funnel,
          stages: updatedStages
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setFunnel(result.data);
        toast.success('Started from scratch!');
      } else {
        throw new Error(result.message || 'Failed to update');
      }
    } catch (err) {
      console.error('Error starting from scratch:', err);
      toast.error(`Failed to start from scratch: ${err.message}`);
    }
  };

  // Helper function to organize templates (used in handleTemplateSelect)
  const organizeTemplates = (templateSet) => {
    if (!templateSet || typeof templateSet !== 'object') return { customer: {}, coach: {} };
    
    const organized = { customer: {}, coach: {} };
    
    Object.keys(templateSet).forEach(key => {
      const template = templateSet[key];
      if (key.toLowerCase().includes('coach') || key.toLowerCase().includes('business')) {
        organized.coach[key] = template;
      } else {
        organized.customer[key] = template;
      }
    });
    
    return organized;
  };

  // Handle build page - opens editor in new tab
  const handleBuildPage = (stageId) => {
    if (!funnel || !funnelId || !stageId) {
      toast.error('Funnel or stage not loaded');
      return;
    }

    const stage = funnel.stages?.find(s => (s._id === stageId) || (s.pageId === stageId));
    if (!stage) {
      toast.error('Stage not found');
      return;
    }

    // Open editor in new tab (editor will handle empty content)
    const editorUrl = `/funnel_edit/${funnelId}/${stageId}`;
    window.open(editorUrl, '_blank');
  };

  // Get active stage (safe to call even when funnel is loading)
  const activeStage = funnel?.stages?.find(s => (s._id === activeStageId) || (s.pageId === activeStageId));

  // Update page URL when active stage changes
  useEffect(() => {
    if (!funnel || loading) return;
    const loadPageUrl = async () => {
      if (activeStage?.id || activeStage?._id || activeStage?.pageId) {
        const url = await getPageUrl(activeStage._id || activeStage.pageId || activeStage.id);
        setPageUrl(url || '');
      } else {
        setPageUrl('');
      }
    };
    loadPageUrl();
  }, [activeStage, funnel, loading]);

  // Load funnel preview URL
  useEffect(() => {
    if (!funnel || loading) return;
    const loadFunnelUrl = async () => {
      if (funnel?.funnelUrl) {
        const pageId = funnel.indexPageId || (funnel.stages && funnel.stages.length > 0 ? funnel.stages[0].pageId : null);
        if (pageId) {
          const url = buildPreviewUrl(funnel.funnelUrl, pageId);
          setFunnelUrl(url || '');
        }
      }
    };
    if (funnel?.name) {
      loadFunnelUrl();
    }
  }, [funnel?.name, funnel?.funnelUrl, funnel?.stages, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10" />
                <div>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-96" />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !funnel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {error ? 'Error Loading Funnel' : 'Funnel Not Found'}
              </h3>
              <p className="text-gray-600 mb-4">
                {error || 'The requested funnel could not be found.'}
              </p>
              <Button onClick={() => navigate('/funnels')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Funnels
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const TABS = ['Template', 'Basic'];
  if (activeStage && ['appointment-page', 'payment-page'].includes(activeStage.type)) {
    TABS.push('Settings');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Toggle */}
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50 lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Sidebar Overlay for Mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="flex h-16 items-center px-6 gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/funnels')}
            className="shrink-0 hover:bg-blue-50 hover:text-blue-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold truncate">
              Funnel: {funnel?.name || 'Untitled Funnel'}
            </h1>
            <p className="text-sm text-muted-foreground truncate">
              Editing Stage: {activeStage?.name || 'N/A'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Funnel Active Switch */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {isFunnelActive ? 'Active' : 'Inactive'}
              </span>
              {isStatusLoading ? (
                <div className="h-6 w-11 flex items-center justify-center">
                  <div className="h-4 w-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
                </div>
              ) : (
                <Switch
                  checked={isFunnelActive}
                  onCheckedChange={async (checked) => {
                    setIsStatusLoading(true);
                    setIsFunnelActive(checked);
                    try {
                      // TODO: Update funnel status via API
                      toast.success(`Funnel ${checked ? 'activated' : 'deactivated'} successfully`);
                    } catch (err) {
                      setIsFunnelActive(!checked);
                      toast.error('Failed to update funnel status');
                    } finally {
                      setIsStatusLoading(false);
                    }
                  }}
                  disabled={isStatusLoading}
                  className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                />
              )}
            </div>

            {funnelUrl && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md border max-w-[300px]">
                <span className="text-xs truncate flex-1">
                  {funnelUrl}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 hover:bg-green-50 hover:text-green-600"
                  onClick={() => copyToClipboard(funnelUrl)}
                  title="Copy link"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}

            <Button
              onClick={() => handlePreviewFunnel()}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ExternalLink className="h-4 w-4" />
              Preview
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className={`w-[280px] bg-background border-r transition-transform flex flex-col overflow-hidden ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'} ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}`}>
          <div className="p-5 border-b shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Funnel Stages</h3>
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 min-h-0 overflow-hidden max-w-full">
            <div className="p-2 space-y-1 overflow-x-hidden">
              {funnel?.stages?.map((stage, index) => {
                const isIndexPage = index === 0;
                const stageId = stage._id || stage.pageId;
                const isActive = activeStageId === stageId;
                const isDragging = draggedStageId === stageId;
                const isDragOver = dragOverStageId === stageId;
                
                return (
                  <div
                    key={stageId || index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, stageId)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, stageId)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, stageId)}
                    onClick={(e) => {
                      if (isDraggingRef.current) {
                        e.preventDefault();
                        return;
                      }
                      setActiveStageId(stageId);
                      setActiveTab('Template');
                      if (isMobile) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`
                      group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors w-full min-w-0 overflow-hidden
                      ${isActive ? 'bg-accent' : 'hover:bg-accent/50'}
                      ${isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}
                      ${isDragOver ? 'border-t-2 border-t-primary -translate-y-0.5' : ''}
                    `}
                  >
                    <div
                      className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-sm truncate ${isIndexPage ? 'font-semibold' : ''}`}>
                            {stage.name}
                          </span>
                        </div>
                        {isIndexPage && (
                          <Badge variant="secondary" className="mt-1 text-[8px] px-1.5 py-0 h-4">
                            <span className="h-1 w-1 rounded-full bg-green-500 mr-1" />
                            Index
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 hover:bg-blue-50 hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewStage(stageId);
                        }}
                        title="Preview Page"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 hover:bg-green-50 hover:text-green-600"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const stageUrl = await getPageUrl(stageId);
                          if (stageUrl) {
                            copyToClipboard(stageUrl);
                          } else {
                            toast.error('Stage URL not available. Please publish the funnel first.');
                          }
                        }}
                        title="Copy Stage Link"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 hover:bg-blue-50 hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuildPage(stageId);
                        }}
                        title="Edit in GrapesJS Editor"
                      >
                        <Code className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 hover:bg-purple-50 hover:text-purple-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateStage(stageId);
                        }}
                        title="Duplicate Stage"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveStage(stageId);
                        }}
                        title="Delete Stage"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground ml-1 shrink-0" />
                    </div>
                  </div>
                );
              })}
              
              {/* Add New Stage button - directly below last stage */}
              <div className="pt-1 w-full min-w-0">
                <Button
                  className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setShowStageModal(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add New Stage
                </Button>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background">
          {activeStage ? (
            <div className="space-y-6 py-6">
              {/* Template Section */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Template Selection</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Choose how you want to start building your page. Select a template or start from scratch.
                  </p>
                </CardHeader>
                <CardContent>
                  {activeStage?.html ? (
                    <div className="border rounded-lg p-6 bg-gradient-to-br from-white to-blue-50/30">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Template Configured</span>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {activeStage.name || 'Page Template'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Your page is ready to be built. Click "Build Page" to open the visual editor.
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setShowTemplateModal(true)}
                            className="gap-2 border-gray-300 hover:bg-gray-50"
                          >
                            <Edit className="h-4 w-4" />
                            Change Template
                          </Button>
                          <Button
                            onClick={() => handleBuildPage(activeStage._id || activeStage.pageId)}
                            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                          >
                            <Edit className="h-4 w-4" />
                            Build Page
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-12 text-center">
                      <div className="w-14 h-14 rounded-lg bg-yellow-100 flex items-center justify-center mx-auto mb-5">
                        <Edit className="h-7 w-7 text-yellow-600" />
                      </div>
                      <h4 className="text-base font-semibold mb-2">No Template Selected</h4>
                      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                        Select a template to get started with your page design, or start from scratch with a blank canvas.
                      </p>
                      <Button onClick={() => setShowTemplateModal(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Edit className="h-4 w-4" />
                        Select Template
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stage Settings */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold">Stage Settings</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Configure page details, SEO, and social media settings
                      </p>
                    </div>
                    <Button
                      onClick={saveStageSettings}
                      disabled={isSaving}
                      className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="text-base font-semibold">Basic Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="page-name" className="text-sm font-medium">
                          Page Name
                        </Label>
                        <Input
                          id="page-name"
                          type="text"
                          value={stageSettings.name}
                          onChange={(e) => updateStageSettings('name', e.target.value)}
                          placeholder="Welcome Page"
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="url-slug" className="text-sm font-medium">
                          URL Slug
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="url-slug"
                            type="text"
                            value={stageSettings.slug}
                            onChange={(e) => updateStageSettings('slug', e.target.value)}
                            placeholder="welcome-page-1768479851955"
                            className="h-10"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          URL-friendly version (e.g., my-awesome-page)
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* SEO Settings */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Search className="h-5 w-5 text-green-600" />
                      <h3 className="text-base font-semibold">SEO Settings</h3>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="page-title" className="text-sm font-medium">
                          Page Title
                        </Label>
                        <Input
                          id="page-title"
                          type="text"
                          value={stageSettings.title}
                          onChange={(e) => updateStageSettings('title', e.target.value)}
                          placeholder="Fitness Webinar Registration"
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="keywords" className="text-sm font-medium">
                          Keywords
                        </Label>
                        <Input
                          id="keywords"
                          type="text"
                          value={stageSettings.keywords}
                          onChange={(e) => updateStageSettings('keywords', e.target.value)}
                          placeholder="Comma-separated keywords"
                          className="h-10"
                        />
                        <p className="text-xs text-muted-foreground">
                          Comma-separated keywords
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="meta-description" className="text-sm font-medium">
                          Meta Description
                        </Label>
                        <Textarea
                          id="meta-description"
                          value={stageSettings.description}
                          onChange={(e) => updateStageSettings('description', e.target.value)}
                          placeholder="Join our exclusive 3-day fitness transformation webinar for busy professionals. Learn the proven system to transform your health."
                          className="min-h-[100px] resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Assets & Media */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <ImageIcon className="h-5 w-5 text-purple-600" />
                      <h3 className="text-base font-semibold">Assets & Media</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Favicon</Label>
                        <div className="flex items-center gap-4">
                          {stageSettings.favicon ? (
                            <div className="flex items-center gap-3">
                              <img
                                src={stageSettings.favicon}
                                alt="Favicon"
                                className="w-10 h-10 rounded border"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateStageSettings('favicon', '')}
                                className="h-8"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <label className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(file, 'favicon');
                                }}
                              />
                              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Upload className="h-5 w-5" />
                                <span className="text-sm">Select Image</span>
                              </div>
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Social Share Image</Label>
                        <div className="flex items-center gap-4">
                          {stageSettings.socialImage ? (
                            <div className="flex items-center gap-3">
                              <img
                                src={stageSettings.socialImage}
                                alt="Social Share"
                                className="w-20 h-20 rounded border object-cover"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateStageSettings('socialImage', '')}
                                className="h-8"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <label className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(file, 'socialImage');
                                }}
                              />
                              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Upload className="h-5 w-5" />
                                <span className="text-sm">Select Image</span>
                              </div>
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Social Media Settings */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Share2 className="h-5 w-5 text-pink-600" />
                      <h3 className="text-base font-semibold">Social Media Settings</h3>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="social-title" className="text-sm font-medium">
                          Social Title
                        </Label>
                        <Input
                          id="social-title"
                          type="text"
                          value={stageSettings.socialTitle}
                          onChange={(e) => updateStageSettings('socialTitle', e.target.value)}
                          placeholder="Title for social sharing"
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="social-description" className="text-sm font-medium">
                          Social Description
                        </Label>
                        <Textarea
                          id="social-description"
                          value={stageSettings.socialDescription}
                          onChange={(e) => updateStageSettings('socialDescription', e.target.value)}
                          placeholder="Description for social sharing"
                          className="min-h-[100px] resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Custom HTML */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Code className="h-5 w-5 text-amber-600" />
                      <h3 className="text-base font-semibold">Custom HTML</h3>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="custom-html-head" className="text-sm font-medium">
                          Custom HTML Head
                        </Label>
                        <Textarea
                          id="custom-html-head"
                          value={stageSettings.customHtmlHead}
                          onChange={(e) => updateStageSettings('customHtmlHead', e.target.value)}
                          placeholder="<meta>, <link>, <style>, <script> tags"
                          className="min-h-[120px] resize-none font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Add custom HTML to be included in the &lt;head&gt; section.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="custom-html-body" className="text-sm font-medium">
                          Custom HTML Body
                        </Label>
                        <Textarea
                          id="custom-html-body"
                          value={stageSettings.customHtmlBody}
                          onChange={(e) => updateStageSettings('customHtmlBody', e.target.value)}
                          placeholder="Tracking codes, scripts"
                          className="min-h-[120px] resize-none font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Add custom HTML to be included just before the closing &lt;/body&gt; tag.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <Settings className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Welcome to Your Funnel Builder</h2>
                      <p className="text-sm text-muted-foreground mb-6">
                        Select a stage from the sidebar or add a new one to begin crafting your premium funnel.
                      </p>
                    </div>
                    <Button onClick={() => setShowStageModal(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add New Stage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showStageModal && (
        <StageTypeModal
          onClose={() => setShowStageModal(false)}
          onAddStage={handleAddStage}
        />
      )}

      {showTemplateModal && activeStage && (() => {
        const { type } = activeStage;
        // Get current template key if any (this would be stored in stage metadata)
        const selectedKey = null; // TODO: Get from stage metadata if stored
        
        return (
          <TemplateSelectionModal
            stageType={type}
            selectedKey={selectedKey}
            onClose={() => setShowTemplateModal(false)}
            onSelect={(templateKey, category) => {
              handleTemplateSelect(templateKey, category);
              setShowTemplateModal(false);
            }}
            onStartFromScratch={() => {
              handleStartFromScratch();
              setShowTemplateModal(false);
            }}
          />
        );
      })()}
    </div>
  );
};

export default FunnelManagement;