import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { toast } from 'sonner';
import {
  Save,
  X,
  Settings,
  Plus,
  Trash2,
  Play,
  Pause,
  Zap,
  Mail,
  MessageSquare,
  Calendar,
  User,
  Clock,
  GitBranch,
  Filter,
  DollarSign,
  CheckCircle,
  FileText,
  Link,
  Bell,
  List,
  Tag,
  TrendingUp,
  CreditCard,
  ShoppingCart,
  BarChart2,
  Search,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import automationRulesService from '../../services/automationRulesService';

// Custom Node Types
const TriggerNode = ({ data, selected }) => {
  return (
    <div className={`px-4 py-3 bg-green-50 border-2 rounded-lg min-w-[200px] ${selected ? 'border-green-600 shadow-lg' : 'border-green-200'}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-full">
          <Zap className="h-4 w-4 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-green-800 truncate">{data.label}</div>
          {data.description && (
            <div className="text-xs text-green-600 truncate">{data.description}</div>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-green-600 !border-2 !border-white"
      />
    </div>
  );
};

const ActionNode = ({ data, selected }) => {
  return (
    <div className={`px-4 py-3 bg-blue-50 border-2 rounded-lg min-w-[200px] ${selected ? 'border-blue-600 shadow-lg' : 'border-blue-200'}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-full">
          {data.icon || <Settings className="h-4 w-4 text-blue-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-blue-800 truncate">{data.label}</div>
          {data.description && (
            <div className="text-xs text-blue-600 truncate">{data.description}</div>
          )}
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-blue-600 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-blue-600 !border-2 !border-white"
      />
    </div>
  );
};

const DelayNode = ({ data, selected }) => {
  return (
    <div className={`px-4 py-3 bg-orange-50 border-2 rounded-lg min-w-[180px] ${selected ? 'border-orange-600 shadow-lg' : 'border-orange-200'}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-100 rounded-full">
          <Clock className="h-4 w-4 text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-orange-800">Delay</div>
          <div className="text-xs text-orange-600">{data.delayMinutes || 0} minutes</div>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-orange-600 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-orange-600 !border-2 !border-white"
      />
    </div>
  );
};

const ConditionNode = ({ data, selected }) => {
  return (
    <div className={`px-4 py-3 bg-purple-50 border-2 rounded-lg min-w-[200px] ${selected ? 'border-purple-600 shadow-lg' : 'border-purple-200'}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-full">
          <Filter className="h-4 w-4 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-purple-800 truncate">
            {data.conditionType === 'Message Validation' ? 'Message Check' : 'Condition'}
          </div>
          <div className="text-xs text-purple-600 truncate">{data.conditionType || 'Custom'}</div>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-purple-600 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="false"
        className="!w-2 !h-2 !bg-red-600 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!w-2 !h-2 !bg-green-600 !border-2 !border-white"
      />
    </div>
  );
};

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  delay: DelayNode,
  condition: ConditionNode,
};

// Inner Component that uses React Flow hooks
const GraphBuilderInner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isNodeConfigOpen, setIsNodeConfigOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ruleData, setRuleData] = useState({
    name: '',
    description: '',
    isActive: true,
  });
  const [eventsAndActions, setEventsAndActions] = useState({ events: [], actions: [], categories: [] });

  // Debug logging for state changes
  useEffect(() => {
    console.log('🔍 [State] eventsAndActions changed:', eventsAndActions);
    console.log('🔍 [State] events count:', eventsAndActions.events?.length || 0);
    console.log('🔍 [State] actions count:', eventsAndActions.actions?.length || 0);
  }, [eventsAndActions]);
  const [searchQuery, setSearchQuery] = useState('');

  const { project } = useReactFlow();

  // Load rule data
  useEffect(() => {
    const loadRule = async () => {
      try {
        setLoading(true);
        if (id) {
          const response = await automationRulesService.getSequenceById(id);
          if (response.success && response.data) {
            const rule = response.data;
            setRuleData({
              name: rule.name || '',
              description: rule.description || '',
              isActive: rule.isActive !== undefined ? rule.isActive : true,
            });

            // Load graph data if exists
            if (rule.graphData) {
              setNodes(rule.graphData.nodes || []);
              setEdges(rule.graphData.edges || []);
            }
          }
        }

        // Load events and actions
        try {
          const eventsResponse = await automationRulesService.getEventsAndActions();
          setEventsAndActions(eventsResponse.data || { events: [], actions: [], categories: [] });
        } catch (error) {
          console.error('Error loading events and actions:', error);
          setEventsAndActions({ events: [], actions: [], categories: [] });
        }
      } catch (error) {
        console.error('Error loading rule:', error);
        toast.error('Failed to load automation rule');
      } finally {
        setLoading(false);
      }
    };

    loadRule();
  }, [id]);

  // Handle node connection
  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  // Handle node click
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setIsNodeConfigOpen(true);
  }, []);

  // Add new node
  const addNode = (type, data) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      data: {
        label: typeof data === 'string' ? data : data.label || data.value || type,
        description: typeof data === 'string' ? '' : data.description || '',
        ...(typeof data === 'object' ? data : {}),
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setIsPaletteOpen(false);
    toast.success(`${type} node added`);
  };

  // Delete selected node
  const deleteNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
      setSelectedNode(null);
      setIsNodeConfigOpen(false);
      toast.success('Node deleted');
    }
  };

  // Save workflow
  const handleSave = async () => {
    try {
      setSaving(true);

      const workflowData = {
        ...ruleData,
        workflowType: 'graph',
        graphData: {
          nodes,
          edges,
        },
      };

      let response;
      if (id) {
        response = await automationRulesService.updateSequence(id, workflowData);
      } else {
        response = await automationRulesService.createSequence(workflowData);
      }

      if (response.success) {
        toast.success(`Automation rule ${id ? 'updated' : 'created'} successfully`);
        if (!id && response.data?._id) {
          navigate(`/automation-rules/${response.data._id}/edit`);
        }
      } else {
        throw new Error(response.message || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error(error.message || 'Failed to save automation rule');
    } finally {
      setSaving(false);
    }
  };

  // Group events by categories
  const groupedEvents = useMemo(() => {
    const groups = {};
    (eventsAndActions.events || []).forEach(event => {
      const category = event.category || 'Lead Management';
      if (!groups[category]) groups[category] = [];
      groups[category].push(event);
    });
    return groups;
  }, [eventsAndActions.events]);

  // Group actions by categories
  const groupedActions = useMemo(() => {
    const groups = {};
    (eventsAndActions.actions || []).forEach(action => {
      const category = action.category || 'Custom';
      if (!groups[category]) groups[category] = [];
      groups[category].push(action);
    });
    return groups;
  }, [eventsAndActions.actions]);

  // Filter events/actions by search query
  const filteredEvents = useMemo(() => {
    if (!searchQuery) return groupedEvents;
    const query = searchQuery.toLowerCase();
    const filtered = {};

    Object.keys(groupedEvents).forEach(category => {
      const categoryEvents = groupedEvents[category].filter((event) => {
        const label = typeof event === 'string' ? event : event.label || event.value || '';
        return label.toLowerCase().includes(query);
      });
      if (categoryEvents.length > 0) {
        filtered[category] = categoryEvents;
      }
    });

    return filtered;
  }, [groupedEvents, searchQuery]);

  const filteredActions = useMemo(() => {
    if (!searchQuery) return groupedActions;
    const query = searchQuery.toLowerCase();
    const filtered = {};

    Object.keys(groupedActions).forEach(category => {
      const categoryActions = groupedActions[category].filter((action) => {
        const label = typeof action === 'string' ? action : action.label || action.value || '';
        return label.toLowerCase().includes(query);
      });
      if (categoryActions.length > 0) {
        filtered[category] = categoryActions;
      }
    });

    return filtered;
  }, [groupedActions, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Loading automation rule...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/automation-rules')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <Input
                placeholder="Rule name..."
                value={ruleData.name}
                onChange={(e) => setRuleData({ ...ruleData, name: e.target.value })}
                className="w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="active-switch">Active</Label>
              <Switch
                id="active-switch"
                checked={ruleData.isActive}
                onCheckedChange={(checked) => setRuleData({ ...ruleData, isActive: checked })}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsPaletteOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Node
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ReactFlow Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Node Palette Sheet */}
        <Sheet open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
          <SheetContent side="right" className="w-[450px] p-0 overflow-hidden">
            <div className="h-full flex flex-col bg-white">
              <div className="border-b border-gray-100 bg-gray-50/50">
                <SheetHeader className="space-y-2 px-6 py-6">
                  <SheetTitle className="text-lg font-semibold text-gray-900">Add Node</SheetTitle>
                  <SheetDescription className="text-sm text-gray-600">
                    Select a trigger, action, or flow control to add to your workflow
                  </SheetDescription>
                </SheetHeader>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="space-y-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search nodes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10 bg-gray-50 border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    />
                  </div>

                  {/* Tabs */}
                  <Tabs defaultValue="triggers" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-10 bg-gray-100">
                      <TabsTrigger value="triggers" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Triggers
                      </TabsTrigger>
                      <TabsTrigger value="actions" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Actions
                      </TabsTrigger>
                      <TabsTrigger value="flow" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Flow
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="triggers" className="mt-6">
                      <ScrollArea className="h-[calc(100vh-500px)]">
                    <div className="space-y-3">
                      {(() => {
                        const totalEvents = Object.values(filteredEvents).reduce((sum, events) => sum + events.length, 0);
                        return totalEvents === 0 ? (
                          <div className="text-center py-12">
                            <Zap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">No triggers found</p>
                            {searchQuery && <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>}
                          </div>
                        ) : null;
                      })()}
                      {Object.keys(filteredEvents).length > 0 && (
                        <Accordion type="multiple" className="space-y-2">
                          {Object.entries(filteredEvents).map(([category, events]) => (
                            <AccordionItem key={category} value={category} className="border border-gray-200 rounded-lg px-0">
                              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  {category}
                                  <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                    {events.length}
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4">
                                <div className="space-y-2">
                                  {events.map((event, index) => {
                                    const label = typeof event === 'string' ? event : event.label || event.value || '';
                                    const description = typeof event === 'string' ? '' : event.description || '';
                                    return (
                                      <Card
                                        key={`${category}-${index}`}
                                        className="cursor-pointer hover:border-green-300 hover:shadow-sm transition-all duration-200 border border-gray-100"
                                        onClick={() => addNode('trigger', event)}
                                      >
                                        <CardContent className="p-3">
                                          <div className="flex items-start gap-3">
                                            <div className="p-2 bg-green-50 rounded-lg flex-shrink-0 mt-0.5">
                                              <Zap className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="text-sm font-medium text-gray-900 leading-5">{label}</div>
                                              {description && (
                                                <div className="text-xs text-gray-500 mt-1 leading-4">{description}</div>
                                              )}
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    );
                                  })}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                    <TabsContent value="actions" className="mt-6">
                      <ScrollArea className="h-[calc(100vh-500px)]">
                    <div className="space-y-3">
                      {(() => {
                        const totalActions = Object.values(filteredActions).reduce((sum, actions) => sum + actions.length, 0);
                        return totalActions === 0 ? (
                          <div className="text-center py-12">
                            <Settings className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">No actions found</p>
                            {searchQuery && <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>}
                          </div>
                        ) : null;
                      })()}
                      {Object.keys(filteredActions).length > 0 && (
                        <Accordion type="multiple" className="space-y-2">
                          {Object.entries(filteredActions).map(([category, actions]) => (
                            <AccordionItem key={category} value={category} className="border border-gray-200 rounded-lg px-0">
                              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  {category}
                                  <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                    {actions.length}
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4">
                                <div className="space-y-2">
                                  {actions.map((action, index) => {
                                    const label = typeof action === 'string' ? action : action.label || action.value || '';
                                    const description = typeof action === 'string' ? '' : action.description || '';
                                    return (
                                      <Card
                                        key={`${category}-${index}`}
                                        className="cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all duration-200 border border-gray-100"
                                        onClick={() => addNode('action', action)}
                                      >
                                        <CardContent className="p-3">
                                          <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0 mt-0.5">
                                              <Settings className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="text-sm font-medium text-gray-900 leading-5">{label}</div>
                                              {description && (
                                                <div className="text-xs text-gray-500 mt-1 leading-4">{description}</div>
                                              )}
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    );
                                  })}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                    <TabsContent value="flow" className="mt-6">
                      <ScrollArea className="h-[calc(100vh-500px)]">
                    <div className="space-y-3">
                      <div className="space-y-3">
                        <Card
                          className="cursor-pointer hover:border-orange-300 hover:shadow-sm transition-all duration-200 border border-gray-100"
                          onClick={() => addNode('delay', { delayMinutes: 60 })}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-orange-50 rounded-lg flex-shrink-0 mt-0.5">
                                <Clock className="h-5 w-5 text-orange-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 leading-5">Delay</div>
                                <div className="text-xs text-gray-500 mt-1 leading-4">Wait for a specified amount of time before continuing</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card
                          className="cursor-pointer hover:border-purple-300 hover:shadow-sm transition-all duration-200 border border-gray-100"
                          onClick={() => addNode('condition', { conditionType: 'Custom' })}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-purple-50 rounded-lg flex-shrink-0 mt-0.5">
                                <GitBranch className="h-5 w-5 text-purple-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 leading-5">Condition</div>
                                <div className="text-xs text-gray-500 mt-1 leading-4">Branch the workflow based on conditions</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Node Configuration Dialog */}
        <Dialog open={isNodeConfigOpen} onOpenChange={setIsNodeConfigOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configure Node</DialogTitle>
              <DialogDescription>Configure the settings for this node</DialogDescription>
            </DialogHeader>
            {selectedNode && (
              <div className="space-y-4">
                <div>
                  <Label>Node Type</Label>
                  <Input value={selectedNode.type} disabled />
                </div>
                <div>
                  <Label>Label</Label>
                  <Input
                    value={selectedNode.data.label || ''}
                    onChange={(e) => {
                      setNodes((nds) =>
                        nds.map((node) =>
                          node.id === selectedNode.id
                            ? { ...node, data: { ...node.data, label: e.target.value } }
                            : node
                        )
                      );
                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, label: e.target.value } });
                    }}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={selectedNode.data.description || ''}
                    onChange={(e) => {
                      setNodes((nds) =>
                        nds.map((node) =>
                          node.id === selectedNode.id
                            ? { ...node, data: { ...node.data, description: e.target.value } }
                            : node
                        )
                      );
                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, description: e.target.value } });
                    }}
                    rows={3}
                  />
                </div>
                {selectedNode.type === 'delay' && (
                  <div>
                    <Label>Delay (minutes)</Label>
                    <Input
                      type="number"
                      value={selectedNode.data.delayMinutes || 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setNodes((nds) =>
                          nds.map((node) =>
                            node.id === selectedNode.id
                              ? { ...node, data: { ...node.data, delayMinutes: value } }
                              : node
                          )
                        );
                        setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, delayMinutes: value } });
                      }}
                    />
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="destructive" onClick={deleteNode}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button onClick={() => setIsNodeConfigOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
};

// Main Graph Builder Component with ReactFlowProvider wrapper
const AutomationRulesGraphBuilder = () => {
  return (
    <ReactFlowProvider>
      <GraphBuilderInner />
    </ReactFlowProvider>
  );
};

export default AutomationRulesGraphBuilder;
