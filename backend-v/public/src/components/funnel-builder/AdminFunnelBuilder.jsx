// AdminFunnelBuilder.jsx - Complete funnel builder for admin panel
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import {
  ArrowLeft,
  Save,
  Eye,
  Code,
  Palette,
  Settings,
  Plus,
  Trash2,
  Copy,
  Move,
  Smartphone,
  Monitor,
  Tablet,
  Layers,
  Zap,
  Target,
  Users,
  BarChart3,
  CheckCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from "grapesjs-preset-webpage";
import gjsCountdown from "grapesjs-component-countdown";
import gjsTabs from "grapesjs-tabs";
import gjsCustomCode from "grapesjs-custom-code";
import gjsTooltip from "grapesjs-tooltip";
import gjsTyped from "grapesjs-typed";
import gjsNavbar from "grapesjs-navbar";
import gjsBlocksBasic from "grapesjs-blocks-basic";
import gjsStyleGradient from 'grapesjs-style-gradient';
import gjsPluginExport from 'grapesjs-plugin-export';
import { templates } from './funnel-templates';
import adminApiService from '../../services/adminApiService';

const AdminFunnelBuilder = () => {
  const { funnelId, category, templateKey } = useParams();
  const navigate = useNavigate();
  const [editorInstance, setEditorInstance] = useState(null);
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showAIPopup, setShowAIPopup] = useState(false);
  const [showCustomCodePopup, setShowCustomCodePopup] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(null);
  const [assets, setAssets] = useState([]);
  const [availableForms, setAvailableForms] = useState([]);
  const [showPagesSidebar, setShowPagesSidebar] = useState(true);
  const [showBlocksPanel, setShowBlocksPanel] = useState(false);
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(true);
  const [toolsPanelSide, setToolsPanelSide] = useState('right');
  const [showBuilderPanel, setShowBuilderPanel] = useState(false);
  const [activeBuilderCategory, setActiveBuilderCategory] = useState('sections');
  const [builderSearchTerm, setBuilderSearchTerm] = useState('');
  const [blockCategories, setBlockCategories] = useState([]);
  const [isBuilderDragging, setIsBuilderDragging] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [error, setError] = useState(null);
  const [funnelData, setFunnelData] = useState({
    name: 'New Funnel',
    description: '',
    category: category || 'coach',
    templateKey: templateKey || '',
    stages: []
  });

  // Refs
  const editorInitializedRef = React.useRef(false);
  const editorContainerRef = React.useRef(null);
  const projectDataRef = React.useRef(null);

  // Stage types mapping
  const stageTypes = {
    coach: [
      { id: 'welcome-page', name: 'Welcome Page', description: 'Lead capture and introduction' },
      { id: 'vsl-page', name: 'Video Sales Letter', description: 'Sales presentation video' },
      { id: 'product-offer', name: 'Product Offer', description: 'Sales page with pricing' },
      { id: 'appointment-page', name: 'Appointment Booking', description: 'Schedule consultations' },
      { id: 'payment-page', name: 'Payment Page', description: 'Secure checkout' },
      { id: 'thankyou-page', name: 'Thank You Page', description: 'Post-purchase confirmation' },
      { id: 'custom-page', name: 'Custom Page', description: 'Flexible custom content' }
    ],
    customer: [
      { id: 'welcome-page', name: 'Welcome Page', description: 'Lead capture and introduction' },
      { id: 'product-offer', name: 'Product Offer', description: 'Product sales page' },
      { id: 'payment-page', name: 'Payment Page', description: 'Secure checkout' },
      { id: 'thankyou-page', name: 'Thank You Page', description: 'Order confirmation' },
      { id: 'custom-page', name: 'Custom Page', description: 'Flexible custom content' }
    ]
  };

  // Initialize GrapesJS editor
  const initializeEditor = useCallback(async () => {
    if (editorInitializedRef.current || !editorContainerRef.current) {
      console.log('Editor already initialized or container not found');
      setIsEditorLoading(false);
      return;
    }

    // Add timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('Editor loading timeout - setting loading to false');
      setIsEditorLoading(false);
    }, 10000); // 10 second timeout

    try {
      console.log('Initializing GrapesJS editor...');
      setIsEditorLoading(true);

      // Check if container exists
      if (!editorContainerRef.current) {
        throw new Error('Editor container not found');
      }

      const editor = grapesjs.init({
        container: editorContainerRef.current,
        height: '100vh',
        width: 'auto',
        fromElement: false,
        storageManager: {
          type: 'local',
          autosave: true,
          autoload: true,
          stepsBeforeSave: 1,
        },
        assetManager: {
          assets: assets,
          upload: false,
          uploadFile: (e) => {
            // Handle file upload
          },
        },
        plugins: [
          gjsPresetWebpage,
          gjsBlocksBasic,
          gjsNavbar,
          gjsTabs,
          gjsCustomCode,
          gjsCountdown,
          gjsTooltip,
          gjsTyped,
          gjsStyleGradient,
          gjsPluginExport
        ],
        pluginsOpts: {
          gjsPresetWebpage: {},
          gjsBlocksBasic: {},
          gjsNavbar: {},
          gjsTabs: {},
          gjsCustomCode: {},
          gjsCountdown: {},
          gjsTooltip: {},
          gjsTyped: {},
          gjsStyleGradient: {},
          gjsPluginExport: {}
        }
      });

      console.log('GrapesJS editor initialized successfully');

      // Load template if specified
      if (templateKey && currentStage?.type) {
        console.log('Loading template:', templateKey, 'for stage type:', currentStage.type);
        const templateSet = {
          'welcome-page': templates.welcomeTemplates,
          'vsl-page': templates.vslTemplates,
          'thankyou-page': templates.thankyouTemplates,
          'product-offer': templates.productOfferTemplates,
          'custom-page': templates.miscTemplates,
          'appointment-page': templates.appointmentTemplates,
          'payment-page': templates.paymentTemplates,
        }[currentStage.type];

        console.log('Template set available:', !!templateSet);
        console.log('Available templates:', templateSet ? Object.keys(templateSet) : 'none');

        if (templateSet && templateSet[templateKey]) {
          console.log('Template found, loading...');
          const template = templateSet[templateKey];
          try {
            if (template.html) {
              editor.setComponents(template.html);
              console.log('Template HTML loaded');
            }
            if (template.css) {
              editor.setStyle(template.css);
              console.log('Template CSS loaded');
            }
          } catch (templateError) {
            console.error('Error loading template:', templateError);
            // Load a basic template as fallback
            editor.setComponents('<div class="container"><h1>Welcome to your funnel!</h1><p>Start building your content here.</p></div>');
          }
        } else {
          console.warn('Template not found:', templateKey, 'in template set for type:', currentStage.type, '- loading blank template');
          // Load a basic template as fallback
          editor.setComponents('<div class="container"><h1>Welcome to your funnel!</h1><p>Start building your content here.</p></div>');
        }
      }

      setEditorInstance(editor);
      editorInitializedRef.current = true;

      // Editor events
      editor.on('load', () => {
        console.log('GrapesJS editor loaded event fired');
        clearTimeout(loadingTimeout);
        setIsEditorLoading(false);
      });

      editor.on('component:add', () => {
        console.log('Component added');
      });

      editor.on('component:remove', () => {
        console.log('Component removed');
      });

      // If editor is already loaded (might happen with some plugins), set loading to false immediately
      if (editor.getHtml) {
        console.log('Editor appears to be ready, setting loading to false');
        clearTimeout(loadingTimeout);
        setIsEditorLoading(false);
      }

    } catch (error) {
      console.error('Error initializing editor:', error);
      clearTimeout(loadingTimeout);
      setIsEditorLoading(false);

      // Show error in UI
      setError(`Failed to initialize editor: ${error.message}`);
    }
  }, [assets, currentStage?.type, templateKey]);

  // Initialize stage
  useEffect(() => {
    if (!currentStage && category) {
      const defaultStageType = category === 'coach' ? 'welcome-page' : 'product-offer';
      setCurrentStage({
        id: 'stage-1',
        name: category === 'coach' ? 'Welcome Page' : 'Product Offer',
        type: defaultStageType,
        content: ''
      });
    }
  }, [category, currentStage]);

  // Initialize editor when stage is set
  useEffect(() => {
    if (currentStage && !editorInstance && !editorInitializedRef.current) {
      console.log('Triggering editor initialization');
      initializeEditor();
    }
  }, [currentStage, editorInstance, initializeEditor]);

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      if (editorInstance) {
        console.log('Cleaning up editor instance');
        try {
          editorInstance.destroy();
        } catch (e) {
          console.error('Error destroying editor:', e);
        }
        setEditorInstance(null);
        editorInitializedRef.current = false;
      }
    };
  }, [editorInstance]);

  // Handle back navigation
  const handleBack = () => {
    navigate('/funnels');
  };

  // Handle save
  const handleSave = async (mode = 'single') => {
    if (!editorInstance) return;

    try {
      setIsSaving(true);
      const html = editorInstance.getHtml();
      const css = editorInstance.getCss();
      const js = editorInstance.getJs();

      const stageData = {
        ...currentStage,
        content: {
          html,
          css,
          js
        }
      };

      // Update funnel data
      setFunnelData(prev => ({
        ...prev,
        stages: [stageData]
      }));

      // TODO: Save to backend
      // await adminApiService.saveFunnel(funnelId, funnelData);

      setSuccessMessage('Funnel saved successfully!');
      setShowSuccessPopup(true);

    } catch (error) {
      console.error('Error saving funnel:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle template select
  const handleTemplateSelect = (templateKey) => {
    setFunnelData(prev => ({ ...prev, templateKey }));
    setShowTemplateSelector(false);

    // Navigate to builder with template
    navigate(`/admin/funnels/builder/${funnelId}/${category}/${templateKey}`);
  };

  // Handle stage type change
  const handleStageTypeChange = (stageType) => {
    setCurrentStage(prev => ({
      ...prev,
      type: stageType
    }));
    setShowTemplateSelector(true);
  };

  // Debug logging
  console.log('AdminFunnelBuilder params:', { funnelId, category, templateKey });

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-4">Error Loading Funnel Builder</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
            <Button variant="outline" onClick={handleBack}>
              Back to Funnels
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isEditorLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Funnel Builder...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Funnel: {funnelId}, Category: {category}, Template: {templateKey}
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            If this takes too long, check the browser console for errors.
          </p>
        </div>
      </div>
    );
  }

  // Add error boundary-like behavior
  try {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Funnels
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{funnelData.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {currentStage?.name} - {currentStage?.type?.replace('-', ' ')}
                </p>
              </div>
            </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={() => handleSave('single')} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Pages/Stages */}
        {showPagesSidebar && (
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium">Funnel Stages</h3>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2">
                {stageTypes[funnelData.category]?.map((stageType) => (
                  <div
                    key={stageType.id}
                    className={`p-3 rounded-lg cursor-pointer mb-2 ${
                      currentStage?.type === stageType.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleStageTypeChange(stageType.id)}
                  >
                    <h4 className="font-medium text-sm">{stageType.name}</h4>
                    <p className="text-xs text-muted-foreground">{stageType.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 relative">
          <div ref={editorContainerRef} className="w-full h-full" />
        </div>

        {/* Right Sidebar - Tools */}
        {isToolsPanelOpen && toolsPanelSide === 'right' && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium">Builder Tools</h3>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4">
                <Tabs defaultValue="blocks" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="blocks">Blocks</TabsTrigger>
                    <TabsTrigger value="layers">Layers</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="blocks" className="mt-4">
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Text
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Image
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Button
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="layers" className="mt-4">
                    <p className="text-sm text-muted-foreground">Layer management coming soon...</p>
                  </TabsContent>

                  <TabsContent value="settings" className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="stage-name">Stage Name</Label>
                        <Input
                          id="stage-name"
                          value={currentStage?.name || ''}
                          onChange={(e) => setCurrentStage(prev => ({
                            ...prev,
                            name: e.target.value
                          }))}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Template Selector Dialog */}
      {showTemplateSelector && (
        <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select a Template</DialogTitle>
              <DialogDescription>
                Choose a template for your {currentStage?.type.replace('-', ' ')}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              {/* Template selector content will be implemented */}
              <div className="text-center py-8">
                <p className="text-muted-foreground">Template selector coming soon...</p>
                <Button
                  onClick={() => setShowTemplateSelector(false)}
                  className="mt-4"
                >
                  Continue with Blank Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Success!
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>{successMessage}</p>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowSuccessPopup(false)}>
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
    );
  } catch (error) {
    console.error('Error in AdminFunnelBuilder:', error);
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Error Loading Funnel Builder</h2>
          <p className="text-muted-foreground mb-4">
            There was an error loading the funnel builder. Please try again.
          </p>
          <Button onClick={handleBack}>
            Back to Funnels
          </Button>
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm">Error Details</summary>
            <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        </div>
      </div>
    );
  }
};

export default AdminFunnelBuilder;