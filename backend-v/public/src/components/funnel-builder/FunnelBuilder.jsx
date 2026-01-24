import React, { useEffect, useState, useRef } from 'react';
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
  BarChart3
} from 'lucide-react';
import adminApiService from '../../services/adminApiService';
import { useAuth } from '../../contexts/AuthContext';

const FunnelBuilder = () => {
  const { funnelId } = useParams();
  const navigate = useNavigate();
  const { admin } = useAuth();
  const [funnel, setFunnel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('design');
  const [selectedElement, setSelectedElement] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [showElementDialog, setShowElementDialog] = useState(false);
  const canvasRef = useRef(null);

  // Mock funnel data structure
  const [funnelData, setFunnelData] = useState({
    id: funnelId || 'new',
    name: 'New Funnel',
    description: '',
    stages: [
      {
        id: 'stage-1',
        name: 'Landing Page',
        type: 'landing',
        elements: [
          {
            id: 'hero-1',
            type: 'hero',
            content: {
              title: 'Welcome to Our Amazing Offer',
              subtitle: 'Transform your life with our proven system',
              buttonText: 'Get Started Now',
              buttonUrl: '#'
            },
            styles: {
              backgroundColor: '#0f172a',
              textColor: '#ffffff',
              padding: '80px 20px'
            }
          }
        ]
      }
    ]
  });

  const elementTypes = [
    { id: 'hero', label: 'Hero Section', icon: Target, description: 'Main headline and CTA' },
    { id: 'text', label: 'Text Block', icon: Code, description: 'Paragraph or content text' },
    { id: 'button', label: 'Button', icon: Zap, description: 'Call-to-action button' },
    { id: 'image', label: 'Image', icon: Layers, description: 'Image or media element' },
    { id: 'form', label: 'Form', icon: Users, description: 'Lead capture form' },
  ];

  useEffect(() => {
    if (funnelId && funnelId !== 'new') {
      loadFunnel();
    } else {
      setLoading(false);
    }
  }, [funnelId]);

  const loadFunnel = async () => {
    try {
      // TODO: Implement API call
      // const response = await adminApiService.getFunnel(funnelId);
      // setFunnelData(response.data);
    } catch (error) {
      console.error('Error loading funnel:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFunnel = async () => {
    try {
      setSaving(true);
      // TODO: Implement API call
      // await adminApiService.saveFunnel(funnelData);
      console.log('Funnel saved:', funnelData);
    } catch (error) {
      console.error('Error saving funnel:', error);
    } finally {
      setSaving(false);
    }
  };

  const addElement = (elementType) => {
    const newElement = {
      id: `element-${Date.now()}`,
      type: elementType,
      content: getDefaultContent(elementType),
      styles: getDefaultStyles(elementType)
    };

    setFunnelData(prev => ({
      ...prev,
      stages: prev.stages.map(stage =>
        stage.id === 'stage-1'
          ? { ...stage, elements: [...stage.elements, newElement] }
          : stage
      )
    }));

    setShowElementDialog(false);
  };

  const getDefaultContent = (type) => {
    switch (type) {
      case 'hero':
        return {
          title: 'New Hero Title',
          subtitle: 'Add your compelling subtitle here',
          buttonText: 'Get Started',
          buttonUrl: '#'
        };
      case 'text':
        return {
          text: 'Add your content here...'
        };
      case 'button':
        return {
          text: 'Click Here',
          url: '#'
        };
      case 'image':
        return {
          src: '',
          alt: 'Image description'
        };
      case 'form':
        return {
          fields: ['name', 'email'],
          submitText: 'Submit'
        };
      default:
        return {};
    }
  };

  const getDefaultStyles = (type) => {
    switch (type) {
      case 'hero':
        return {
          backgroundColor: '#0f172a',
          textColor: '#ffffff',
          padding: '60px 20px',
          textAlign: 'center'
        };
      default:
        return {
          padding: '20px',
          margin: '10px 0'
        };
    }
  };

  const renderElement = (element) => {
    switch (element.type) {
      case 'hero':
  return (
          <div
            style={{
              backgroundColor: element.styles.backgroundColor,
              color: element.styles.textColor,
              padding: element.styles.padding,
              textAlign: element.styles.textAlign,
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
            className="element-item"
            onClick={() => setSelectedElement(element)}
          >
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {element.content.title}
            </h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
              {element.content.subtitle}
            </p>
          <button
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1.1rem',
                cursor: 'pointer',
                alignSelf: 'center'
              }}
            >
              {element.content.buttonText}
          </button>
    </div>
  );
      case 'text':
    return (
          <div
            style={element.styles}
            className="element-item"
            onClick={() => setSelectedElement(element)}
          >
            <p>{element.content.text}</p>
    </div>
  );
      case 'button':
  return (
          <div className="element-item" onClick={() => setSelectedElement(element)}>
            <button style={element.styles}>
              {element.content.text}
        </button>
    </div>
  );
      default:
      return (
        <div
            className="element-item p-4 border-2 border-dashed border-gray-300 text-center text-gray-500"
            onClick={() => setSelectedElement(element)}
        >
            {element.type} element
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
    );
  }

    return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/funnels')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{funnelData.name}</h1>
            <p className="text-sm text-muted-foreground">{funnelData.description || 'No description'}</p>
      </div>
              </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md">
            <Button
              variant={previewMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={previewMode === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('tablet')}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={saveFunnel} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          </div>
        </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Elements */}
        <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
          <div className="space-y-4">
                <div>
              <h3 className="font-semibold mb-2">Elements</h3>
              <div className="space-y-2">
                {elementTypes.map((element) => (
                  <Button
                    key={element.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => addElement(element.id)}
                  >
                    <element.icon className="h-4 w-4 mr-2" />
                    {element.label}
                  </Button>
                ))}
              </div>
                  </div>
                  </div>
                    </div>

        {/* Main Canvas */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div
              ref={canvasRef}
              className={`bg-white border mx-auto transition-all duration-300 ${
                previewMode === 'desktop' ? 'w-full max-w-6xl' :
                previewMode === 'tablet' ? 'w-full max-w-2xl' :
                'w-full max-w-sm'
              }`}
              style={{ minHeight: '600px' }}
            >
              {funnelData.stages[0]?.elements.map((element) => (
                <div key={element.id}>
                  {renderElement(element)}
                      </div>
                    ))}

              {funnelData.stages[0]?.elements.length === 0 && (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Start Building Your Funnel</h3>
                    <p className="mb-4">Add elements from the left panel to create your landing page</p>
                    <Button onClick={() => setShowElementDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Element
                    </Button>
          </div>
                </div>
        )}
      </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 border-l bg-white p-4 overflow-y-auto">
          {selectedElement ? (
            <div>
              <h3 className="font-semibold mb-4">Element Properties</h3>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="space-y-4">
                  {selectedElement.type === 'hero' && (
                    <>
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={selectedElement.content.title}
                          onChange={(e) => {
                            // Update element content
                          }}
            />
          </div>
                      <div>
                        <Label htmlFor="subtitle">Subtitle</Label>
                        <Textarea
                          id="subtitle"
                          value={selectedElement.content.subtitle}
                          onChange={(e) => {
                            // Update element content
                          }}
            />
          </div>
                      <div>
                        <Label htmlFor="buttonText">Button Text</Label>
                        <Input
                          id="buttonText"
                          value={selectedElement.content.buttonText}
                          onChange={(e) => {
                            // Update element content
                          }}
            />
          </div>
                    </>
                  )}
                </TabsContent>
                <TabsContent value="style" className="space-y-4">
                  <div>
                    <Label htmlFor="bgColor">Background Color</Label>
                    <Input
                      id="bgColor"
                      type="color"
                      value={selectedElement.styles.backgroundColor || '#ffffff'}
                      onChange={(e) => {
                        // Update element styles
                      }}
            />
          </div>
                  <div>
                    <Label htmlFor="textColor">Text Color</Label>
                    <Input
                      id="textColor"
                      type="color"
                      value={selectedElement.styles.textColor || '#000000'}
                      onChange={(e) => {
                        // Update element styles
                      }}
            />
          </div>
                </TabsContent>
              </Tabs>
        </div>
          ) : (
            <div className="text-center text-gray-500">
              <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Select an element to edit its properties</p>
          </div>
          )}
        </div>
      </div>

      {/* Element Dialog */}
      <Dialog open={showElementDialog} onOpenChange={setShowElementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Element</DialogTitle>
            <DialogDescription>
              Choose an element type to add to your funnel
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {elementTypes.map((element) => (
              <Button
                key={element.id}
                variant="outline"
                className="h-20 flex-col"
                onClick={() => addElement(element.id)}
              >
                <element.icon className="h-6 w-6 mb-2" />
                {element.label}
              </Button>
            ))}
        </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FunnelBuilder;