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
  Brain,
  LayoutGrid,
} from 'lucide-react';
import automationRulesService from '../../services/automationRulesService';

// Custom Node Types
const TriggerNode = ({ data, selected }) => {
  return (
    <div className={`px-5 py-6 bg-emerald-50 border-2 rounded-[6px] min-w-[160px] ${selected ? 'border-emerald-500 shadow-lg' : 'border-emerald-300'}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-200 rounded-full">
          <Zap className="h-4 w-4 text-emerald-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-emerald-900 truncate">{data.label}</div>
          {data.description && (
            <div className="text-xs text-emerald-700 truncate">{data.description}</div>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-emerald-500 !border-2 !border-white"
      />
    </div>
  );
};

const ActionNode = ({ data, selected }) => {
  return (
    <div className={`px-5 py-6 bg-blue-50 border-2 rounded-[6px] min-w-[160px] ${selected ? 'border-blue-700 shadow-lg' : 'border-blue-400'}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-200 rounded-full">
          {data.icon || <Settings className="h-4 w-4 text-blue-800" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-blue-900 truncate">{data.label}</div>
          {data.description && (
            <div className="text-xs text-blue-800 truncate">{data.description}</div>
          )}
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-blue-700 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-blue-700 !border-2 !border-white"
      />
    </div>
  );
};

const DelayNode = ({ data, selected }) => {
  return (
    <div className={`px-5 py-6 bg-amber-50 border-2 rounded-[6px] min-w-[160px] ${selected ? 'border-amber-500 shadow-lg' : 'border-amber-300'}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-200 rounded-full">
          <Clock className="h-4 w-4 text-amber-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-amber-900">Delay</div>
          <div className="text-xs text-amber-700">{data.delayMinutes || 0} minutes</div>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-amber-500 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-amber-500 !border-2 !border-white"
      />
    </div>
  );
};

const ConditionNode = ({ data, selected }) => {
  return (
    <div className={`px-5 py-6 bg-violet-50 border-2 rounded-[6px] min-w-[160px] ${selected ? 'border-violet-500 shadow-lg' : 'border-violet-300'}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-violet-200 rounded-full">
          <Filter className="h-4 w-4 text-violet-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-violet-900 truncate">
            {data.conditionType === 'Message Validation' ? 'Message Check' : 'Condition'}
          </div>
          <div className="text-xs text-violet-700 truncate">{data.conditionType || 'Custom'}</div>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-violet-500 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="false"
        className="!w-2 !h-2 !bg-red-500 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!w-2 !h-2 !bg-emerald-500 !border-2 !border-white"
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
  const [connectionSource, setConnectionSource] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiRequirement, setAiRequirement] = useState('');
  const [dropPosition, setDropPosition] = useState(null);
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

  const reactFlowInstance = useReactFlow();

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

            // Load graph data - check both new format (nodes/edges at top level) and old format (graphData)
            let loadedNodes = [];
            let loadedEdges = [];
            
            // Check for new format first (nodes and edges at top level)
            if (rule.nodes && Array.isArray(rule.nodes)) {
              loadedNodes = rule.nodes;
              loadedEdges = rule.edges || [];
              console.log('📊 Loading graph data (new format):', { 
                nodesCount: loadedNodes.length, 
                edgesCount: loadedEdges.length,
                nodes: loadedNodes,
                edges: loadedEdges
              });
            } 
            // Fallback to old format (graphData nested)
            else if (rule.graphData) {
              let graphDataToLoad = rule.graphData;
              
              // Handle case where graphData might be a string (JSON)
              if (typeof graphDataToLoad === 'string') {
                try {
                  graphDataToLoad = JSON.parse(graphDataToLoad);
                } catch (e) {
                  console.error('Failed to parse graphData string:', e);
                  graphDataToLoad = null;
                }
              }

              if (graphDataToLoad) {
                loadedNodes = graphDataToLoad.nodes || [];
                loadedEdges = graphDataToLoad.edges || [];
                console.log('📊 Loading graph data (old format):', { 
                  nodesCount: loadedNodes.length, 
                  edgesCount: loadedEdges.length,
                  nodes: loadedNodes,
                  edges: loadedEdges
                });
              }
            }

            if (loadedNodes.length > 0 || loadedEdges.length > 0) {

              // Ensure nodes have required properties
              const formattedNodes = loadedNodes.map((node, index) => ({
                ...node,
                id: node.id || `${node.type || 'node'}-${Date.now()}-${index}`,
                type: node.type || 'action',
                position: node.position || { x: 100 + (index * 250), y: 100 + (index * 100) },
                data: {
                  ...(node.data || {}),
                  label: node.data?.label || node.label || 'Untitled Node',
                  description: node.data?.description || node.description || '',
                  value: node.data?.value || node.nodeType || node.data?.label || node.label || 'Untitled Node'
                }
              }));

              // Ensure edges have required properties
              const formattedEdges = loadedEdges.map((edge, index) => ({
                ...edge,
                id: edge.id || `edge-${edge.source}-${edge.target}-${index}`,
                source: edge.source,
                target: edge.target,
                type: edge.type || 'default',
                animated: edge.animated !== undefined ? edge.animated : true,
                style: edge.style || { stroke: '#60a5fa', strokeWidth: 2 },
                markerEnd: edge.markerEnd || { type: MarkerType.ArrowClosed }
              }));

              // Use setTimeout to ensure ReactFlow is ready
              setTimeout(() => {
                setNodes(formattedNodes);
                setEdges(formattedEdges);
                
                console.log('✅ Graph data loaded and set:', { 
                  formattedNodesCount: formattedNodes.length, 
                  formattedEdgesCount: formattedEdges.length 
                });
              }, 100);
            } else {
              console.log('⚠️ No graph data found in rule');
              // Initialize with empty arrays
              setNodes([]);
              setEdges([]);
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

  // Reset connection state on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isConnecting) {
        setIsConnecting(false);
        setConnectionSource(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isConnecting]);

  // Handle connection start
  const onConnectStart = useCallback((event, { nodeId, handleId, handleType }) => {
    setIsConnecting(true);
    // Store the source node for potential connection to new node
    if (handleType === 'source') {
      const sourceNode = nodes.find(n => n.id === nodeId);
      if (sourceNode) {
        setConnectionSource(sourceNode);
      }
    }
  }, [nodes]);

  // Handle node connection (called when connection is successfully made)
  const onConnect = useCallback(
    (params) => {
      const animatedEdge = {
        ...params,
        animated: true,
        style: { stroke: '#60a5fa', strokeWidth: 2 }
      };
      setEdges((eds) => addEdge(animatedEdge, eds));
      // Immediately reset connection state when connection is made
      setIsConnecting(false);
      setConnectionSource(null);
    },
    [setEdges]
  );

  // Handle connection end (called after connection attempt, whether successful or not)
  const onConnectEnd = useCallback((event) => {
    // Always reset connecting state
    setIsConnecting(false);
    
    // Check if connection was dropped on empty space (not on a handle)
    const targetHandle = event.target?.closest('.react-flow__handle');
    
    // If we still have a connectionSource, it means connection wasn't made to existing node
    // Check if we dropped on empty space (not on a handle)
    if (connectionSource && !targetHandle) {
      // Connection was dropped on empty space - capture drop position
      const clientX = event.clientX || (event.touches && event.touches[0]?.clientX) || 0;
      const clientY = event.clientY || (event.touches && event.touches[0]?.clientY) || 0;
      
      // Convert screen coordinates to flow coordinates
      if (reactFlowInstance && clientX && clientY) {
        const flowPosition = reactFlowInstance.screenToFlowPosition({
          x: clientX,
          y: clientY
        });
        setDropPosition(flowPosition);
      } else {
        // Fallback to center if we can't get position
        setDropPosition({ x: 400, y: 300 });
      }
      
      // Open palette
      setIsPaletteOpen(true);
    } else if (targetHandle) {
      // Connection was made to existing node - clear connection source and drop position
      setConnectionSource(null);
      setDropPosition(null);
    } else {
      // No connection source or other case - just reset
      setConnectionSource(null);
      setDropPosition(null);
    }
  }, [connectionSource, reactFlowInstance]);

  // Handle node click
  const onNodeClick = useCallback((event, node) => {
    // Don't open config if we're in the middle of connecting
    if (isConnecting) {
      return;
    }
    // Check if click was on a handle
    const target = event.target;
    if (target.closest('.react-flow__handle')) {
      return;
    }
    setSelectedNode(node);
    setIsNodeConfigOpen(true);
  }, [isConnecting]);

  // Handle pane click (clicking on empty canvas)
  const onPaneClick = useCallback(() => {
    // Reset connection state when clicking on empty canvas
    if (isConnecting) {
      setIsConnecting(false);
      setConnectionSource(null);
    }
  }, [isConnecting]);

  // Add new node
  const addNode = (type, data) => {
    // Use drop position if available (from drag-drop connection), otherwise use random position
    const nodePosition = dropPosition || {
      x: Math.random() * 400 + 100,
      y: Math.random() * 400 + 100,
    };

    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: nodePosition,
      data: {
        label: typeof data === 'string' ? data : data.label || data.value || type,
        description: typeof data === 'string' ? '' : data.description || '',
        value: typeof data === 'object' && data.value ? data.value : (typeof data === 'string' ? data : data.label || type),
        ...(typeof data === 'object' ? data : {}),
      },
    };

    setNodes((nds) => [...nds, newNode]);

    // If we have a connection source, create the connection
    if (connectionSource) {
      const newEdge = {
        id: `${connectionSource.id}-${newNode.id}`,
        source: connectionSource.id,
        target: newNode.id,
        type: 'default',
        animated: true,
        style: { stroke: '#60a5fa', strokeWidth: 2 }
      };
      setEdges((eds) => addEdge(newEdge, eds));
      setConnectionSource(null); // Clear the connection source
      toast.success(`${type} node added and connected`);
    } else {
      toast.success(`${type} node added`);
    }

    // Clear drop position after use
    setDropPosition(null);
    setIsPaletteOpen(false);
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

  // Format and realign graph
  const handleFormatGraph = () => {
    if (nodes.length === 0) {
      toast.info('No nodes to format');
      return;
    }

    // Build adjacency lists
    const incomingEdges = new Map();
    const outgoingEdges = new Map();
    
    edges.forEach(edge => {
      if (!incomingEdges.has(edge.target)) {
        incomingEdges.set(edge.target, []);
      }
      incomingEdges.get(edge.target).push(edge.source);
      
      if (!outgoingEdges.has(edge.source)) {
        outgoingEdges.set(edge.source, []);
      }
      outgoingEdges.get(edge.source).push(edge.target);
    });

    // Find root nodes (nodes with no incoming edges)
    const rootNodes = nodes.filter(node => !incomingEdges.has(node.id));
    
    if (rootNodes.length === 0 && nodes.length > 0) {
      // If no root nodes found, use the first node
      rootNodes.push(nodes[0]);
    }

    // Assign layers using BFS
    const nodeLayer = new Map();
    const visited = new Set();
    const queue = [];
    
    // Initialize root nodes at layer 0
    rootNodes.forEach(node => {
      nodeLayer.set(node.id, 0);
      visited.add(node.id);
      queue.push(node.id);
    });

    // BFS to assign layers
    while (queue.length > 0) {
      const currentNodeId = queue.shift();
      const currentLayer = nodeLayer.get(currentNodeId);
      
      const children = outgoingEdges.get(currentNodeId) || [];
      children.forEach(childId => {
        if (!visited.has(childId)) {
          visited.add(childId);
          nodeLayer.set(childId, currentLayer + 1);
          queue.push(childId);
        } else {
          // If already visited, use the maximum layer
          const existingLayer = nodeLayer.get(childId);
          nodeLayer.set(childId, Math.max(existingLayer, currentLayer + 1));
        }
      });
    }

    // Group nodes by layer
    const nodesByLayer = new Map();
    nodes.forEach(node => {
      const layer = nodeLayer.get(node.id) || 0;
      if (!nodesByLayer.has(layer)) {
        nodesByLayer.set(layer, []);
      }
      nodesByLayer.get(layer).push(node);
    });

    // Calculate positions
    const layerWidth = 500; // Horizontal spacing between layers
    const nodeHeight = 200; // Vertical spacing between nodes in same layer
    const startX = 100;
    const startY = 100;

    const formattedNodes = nodes.map(node => {
      const layer = nodeLayer.get(node.id) || 0;
      const layerNodes = nodesByLayer.get(layer);
      const indexInLayer = layerNodes.findIndex(n => n.id === node.id);
      
      const x = startX + (layer * layerWidth);
      const layerNodeCount = layerNodes.length;
      const totalHeight = (layerNodeCount - 1) * nodeHeight;
      const y = startY + (indexInLayer * nodeHeight) - (totalHeight / 2);
      
      return {
        ...node,
        position: { x, y }
      };
    });

    setNodes(formattedNodes);
    toast.success('Graph formatted successfully');
  };

  // Save workflow
  const handleSave = async () => {
    try {
      setSaving(true);

      // Transform nodes to match MongoDB schema requirements
      const transformedNodes = (nodes || []).map(node => {
        // Extract label from data.label or use node type as fallback
        const label = node.data?.label || node.label || node.type || 'Untitled Node';
        
        // Extract nodeType from data.value or use label as fallback
        const nodeType = node.data?.value || node.data?.nodeType || node.nodeType || label;
        
        return {
          id: node.id,
          type: node.type || 'action',
          nodeType: nodeType,
          label: label,
          position: node.position || { x: 0, y: 0 },
          data: node.data || {},
          config: node.data?.config || node.config || {}
        };
      });

      const workflowData = {
        ...ruleData,
        workflowType: 'graph',
        nodes: transformedNodes,
        edges: edges || [],
      };

      console.log('💾 Saving workflow:', {
        id,
        nodesCount: transformedNodes.length,
        edgesCount: edges?.length || 0,
        transformedNodes: transformedNodes,
        edges: edges
      });

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

  // Group events by categories (already grouped in the service response)
  const groupedEvents = useMemo(() => {
    return eventsAndActions.events || {};
  }, [eventsAndActions.events]);

  // Group actions by categories (already grouped in the service response)
  const groupedActions = useMemo(() => {
    return eventsAndActions.actions || {};
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
    <div className="w-full h-full flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/automation-rules')}
              className="hover:bg-gray-100 rounded-[4px]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Input
                placeholder="Enter automation rule name..."
                value={ruleData.name}
                onChange={(e) => setRuleData({ ...ruleData, name: e.target.value })}
                className="w-72 border-gray-200 focus:border-gray-400 focus:ring-gray-400 bg-white rounded-[4px]"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="active-switch"
                checked={ruleData.isActive}
                onCheckedChange={async (checked) => {
                  setRuleData({ ...ruleData, isActive: checked });
                  // Immediately update the rule status via API
                  if (id) {
                    try {
                      await automationRulesService.toggleSequence(id);
                      toast.success(`Automation rule ${checked ? 'activated' : 'deactivated'}`);
                    } catch (error) {
                      console.error('Error toggling rule status:', error);
                      toast.error('Failed to update rule status');
                      // Revert the change on error
                      setRuleData({ ...ruleData, isActive: !checked });
                    }
                  }
                }}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-400"
                style={{ transform: 'scale(0.8)' }}
              />
              <span className={`text-xs font-medium ${ruleData.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {ruleData.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsAIDialogOpen(true)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-[4px]"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Creator
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsPaletteOpen(true)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-[4px]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Node
            </Button>
            <Button 
              variant="outline" 
              onClick={handleFormatGraph}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-[4px]"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Formatter
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all rounded-[4px]"
            >
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
        <div className="flex-1 relative overflow-hidden" ref={reactFlowWrapper} style={{ '--react-flow-attribution-display': 'none' }}>
          <style>{`
            .react-flow__attribution {
              display: none !important;
            }
            .react-flow__edge-path {
              stroke-dasharray: 5;
              animation: dashdraw 0.5s linear infinite;
            }
            @keyframes dashdraw {
              to {
                stroke-dashoffset: -10;
              }
            }
            .react-flow__background-pattern {
              opacity: 0.7 !important;
            }
          `}</style>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            style={{ width: '100%', height: '100%' }}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            connectionMode="loose"
            deleteKeyCode={null}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: '#60a5fa', strokeWidth: 2 }
            }}
          >
            <Background 
              variant="cross" 
              gap={50} 
              size={50}
              color="#9ca3af"
              className="opacity-10"
            />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Node Palette Sheet */}
        <Sheet 
          open={isPaletteOpen} 
          onOpenChange={(open) => {
            setIsPaletteOpen(open);
            if (!open) {
              // If palette is closed without selecting a node, clear the connection source and drop position
              if (connectionSource) {
                setConnectionSource(null);
              }
              setDropPosition(null);
            }
          }}
        >
          <SheetContent side="right" className=" p-0 overflow-hidden h-screen">
            <div className="h-screen flex flex-col bg-white">
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
                  <div className="h-[10px]"></div>
                  <div className="relative px-4">
                    <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search nodes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-9 bg-gray-50/50 border-0 focus:border-gray-200 focus:ring-1 focus:ring-gray-200 rounded-md"
                    />
                  </div>

                  {/* Tabs */}
                  <Tabs defaultValue="triggers" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-9 bg-gray-50 mx-4">
                      <TabsTrigger value="triggers" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
                        Triggers
                      </TabsTrigger>
                      <TabsTrigger value="actions" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
                        Actions
                      </TabsTrigger>
                      <TabsTrigger value="flow" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
                        Flow
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="triggers" className="mt-4">
                      <ScrollArea className="h-[calc(100vh-300px)] flex-1">
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
                        <div className="px-3">
                          <Accordion type="multiple" className="space-y-0">
                          {Object.entries(filteredEvents).map(([category, events], index) => (
                            <div key={category}>
                              {index > 0 && <div className="border-t border-gray-100 mx-4"></div>}
                              <AccordionItem value={category} className="border-0 py-2 rounded-md">
                                <AccordionTrigger className="px-4 py-3 text-sm font-medium text-gray-700 hover:no-underline">
                                <div className="flex items-center gap-2">
                                  {category}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="p-0">
                                <div className="space-y-1">
                                  {events.map((event, index) => {
                                    const label = typeof event === 'string' ? event : event.label || event.value || '';
                                    const description = typeof event === 'string' ? '' : event.description || '';
                                    return (
                                      <div key={`${category}-${index}`}>
                                        <div
                                          className="cursor-pointer py-2 px-2"
                                          onClick={() => addNode('trigger', event)}
                                        >
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
                                        </div>
                                        {index < events.length - 1 && <div className="border-t border-gray-100 mx-2 mt-2"></div>}
                                      </div>
                                    );
                                  })}
                                </div>
                              </AccordionContent>
                              </AccordionItem>
                            </div>
                          ))}
                          </Accordion>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                    <TabsContent value="actions" className="mt-4">
                      <ScrollArea className="h-[calc(100vh-300px)] flex-1">
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
                        <div className="px-3">
                          <Accordion type="multiple" className="space-y-0">
                          {Object.entries(filteredActions).map(([category, actions], index) => (
                            <div key={category}>
                              {index > 0 && <div className="border-t border-gray-100 mx-4"></div>}
                              <AccordionItem value={category} className="border-0 py-2 rounded-md">
                                <AccordionTrigger className="px-4 py-3 text-sm font-medium text-gray-700 hover:no-underline">
                                <div className="flex items-center gap-2">
                                  {category}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="p-0">
                                <div className="space-y-1">
                                  {actions.map((action, index) => {
                                    const label = typeof action === 'string' ? action : action.label || action.value || '';
                                    const description = typeof action === 'string' ? '' : action.description || '';
                                    return (
                                      <div key={`${category}-${index}`} className="py-5">
                                        <div
                                          className="cursor-pointer py-2 px-[10px]"
                                          onClick={() => addNode('action', action)}
                                        >
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
                                        </div>
                                        {index < actions.length - 1 && <div className="border-t border-gray-100 mx-2 mt-2"></div>}
                                      </div>
                                    );
                                  })}
                                </div>
                              </AccordionContent>
                              </AccordionItem>
                            </div>
                          ))}
                        </Accordion>
                        </div>
                      )}

                    </div>
                  </ScrollArea>
                </TabsContent>
                    <TabsContent value="flow" className="mt-4">
                      <ScrollArea className="h-[calc(100vh-300px)] flex-1">
                    <div className="space-y-3">
                      <div className="space-y-3">
                        <>
                          <div>
                            <div
                              className="cursor-pointer py-2 px-2"
                              onClick={() => addNode('delay', { delayMinutes: 60 })}
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-orange-50 rounded-lg flex-shrink-0 mt-0.5">
                                  <Clock className="h-5 w-5 text-orange-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 leading-5">Delay</div>
                                  <div className="text-xs text-gray-500 mt-1 leading-4">Wait for a specified amount of time before continuing</div>
                                </div>
                              </div>
                            </div>
                            <div className="border-t border-gray-100 mx-2 mt-2"></div>
                          </div>
                          <div
                            className="cursor-pointer py-2 px-2"
                            onClick={() => addNode('condition', { conditionType: 'Custom' })}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-purple-50 rounded-lg flex-shrink-0 mt-0.5">
                                <GitBranch className="h-5 w-5 text-purple-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 leading-5">Condition</div>
                                <div className="text-xs text-gray-500 mt-1 leading-4">Branch the workflow based on conditions</div>
                              </div>
                            </div>
                          </div>
                        </>
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

        {/* AI Workflow Creator Dialog */}
        <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Workflow Creator
              </DialogTitle>
              <DialogDescription>
                Describe your automation requirements and our AI will help you build the perfect workflow
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="ai-requirement">What would you like to automate?</Label>
                <Textarea
                  id="ai-requirement"
                  placeholder="Example: When a new lead is created, send them a welcome email, then wait 2 days and send a follow-up message if they haven't responded..."
                  value={aiRequirement}
                  onChange={(e) => setAiRequirement(e.target.value)}
                  rows={6}
                  className="mt-2"
                />
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800">
                  <strong>💡 Tip:</strong> Be as specific as possible. Include details about triggers, actions, delays, and conditions.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAIDialogOpen(false);
                setAiRequirement('');
              }}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // TODO: Implement AI workflow generation
                  toast.info('AI workflow generation coming soon!');
                  setIsAIDialogOpen(false);
                  setAiRequirement('');
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Brain className="h-4 w-4 mr-2" />
                Generate Workflow
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
};

// Main Graph Builder Component with ReactFlowProvider wrapper
const AutomationRulesGraphBuilder = () => {
  return (
    <div className="w-full h-screen">
      
      <ReactFlowProvider>
        <GraphBuilderInner />
      </ReactFlowProvider>
    </div>
  );
};

export default AutomationRulesGraphBuilder;
