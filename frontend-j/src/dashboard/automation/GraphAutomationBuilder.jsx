import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  IconButton,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormHelperText,
  useToast,
  Code,
  SimpleGrid,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tooltip,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  InputGroup,
  InputLeftElement,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverHeader,
  PopoverArrow,
  Spinner,
} from '@chakra-ui/react';
import {

  FiPlay,
  FiPause,
  FiSave,
  FiX,
  FiSettings,
  FiPlus,
  FiTrash2,
  FiEdit,
  FiCheck,
  FiAlertCircle,
  FiInfo,
  FiSearch,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiCheckCircle,
  FiMail,
  FiList,
  FiTrendingUp,
  FiTag,
  FiMessageSquare,
  FiClock,
  FiFilter,
  FiBell,
  FiFileText,
  FiLink,
  FiShare2,
  FiCreditCard,
  FiShoppingCart,
  FiBarChart2,
  FiZap,
} from 'react-icons/fi';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { getCoachId, getToken } from '../../utils/authUtils';
import { API_BASE_URL as BASE_URL } from '../../config/apiConfig';
import MessageSequenceBuilder from './MessageSequenceBuilder';

const API_BASE_URL = `${BASE_URL}/api`;

// Custom Node Components
const TriggerNode = ({ data, selected }) => {
  return (
    <Box
      bg="blue.50"
      border="2px"
      borderColor={selected ? 'blue.500' : 'blue.200'}
      borderRadius="lg"
      p={4}
      minW="200px"
      boxShadow={selected ? 'lg' : 'md'}
      transition="all 0.2s"
    >
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
      <VStack spacing={2} align="start">
        <HStack>
          <FiZap color="#3182CE" />
          <Text fontWeight="bold" fontSize="sm" color="blue.700">
            {data.label || 'Trigger'}
          </Text>
        </HStack>
        <Badge colorScheme="blue" size="sm">
          {data.nodeType || 'Event'}
        </Badge>
        {data.description && (
          <Text fontSize="xs" color="gray.600" noOfLines={2}>
            {data.description}
          </Text>
        )}
      </VStack>
    </Box>
  );
};

const ActionNode = ({ data, selected }) => {
  const getActionColor = (type) => {
    const colors = {
      send_whatsapp_message: 'green',
      send_email_message: 'blue',
      send_sms_message: 'purple',
      create_task: 'orange',
      update_lead_status: 'teal',
      add_lead_tag: 'pink',
      default: 'gray',
    };
    return colors[type] || colors.default;
  };

  const colorScheme = getActionColor(data.nodeType);

  return (
    <Box
      bg={`${colorScheme}.50`}
      border="2px"
      borderColor={selected ? `${colorScheme}.500` : `${colorScheme}.200`}
      borderRadius="lg"
      p={4}
      minW="200px"
      boxShadow={selected ? 'lg' : 'md'}
      transition="all 0.2s"
    >
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
      <VStack spacing={2} align="start">
        <HStack>
          <FiPlay color={`var(--chakra-colors-${colorScheme}-500)`} />
          <Text fontWeight="bold" fontSize="sm" color={`${colorScheme}.700`}>
            {data.label || 'Action'}
          </Text>
        </HStack>
        <Badge colorScheme={colorScheme} size="sm">
          {data.nodeType || 'Action'}
        </Badge>
        {data.description && (
          <Text fontSize="xs" color="gray.600" noOfLines={2}>
            {data.description}
          </Text>
        )}
      </VStack>
    </Box>
  );
};

const DelayNode = ({ data, selected }) => {
  return (
    <Box
      bg="orange.50"
      border="2px"
      borderColor={selected ? 'orange.500' : 'orange.200'}
      borderRadius="lg"
      p={4}
      minW="200px"
      boxShadow={selected ? 'lg' : 'md'}
      transition="all 0.2s"
    >
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
      <VStack spacing={2} align="start">
        <HStack>
          <FiPause color="#DD6B20" />
          <Text fontWeight="bold" fontSize="sm" color="orange.700">
            {data.label || 'Delay'}
          </Text>
        </HStack>
        <Badge colorScheme="orange" size="sm">
          Wait {data.delay || 0}s
        </Badge>
      </VStack>
    </Box>
  );
};

const ConditionNode = ({ data, selected }) => {
  return (
    <Box
      bg="purple.50"
      border="2px"
      borderColor={selected ? 'purple.500' : 'purple.200'}
      borderRadius="lg"
      p={4}
      minW="200px"
      boxShadow={selected ? 'lg' : 'md'}
      transition="all 0.2s"
    >
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{ background: '#10b981', top: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ background: '#ef4444', top: '70%' }}
      />
      <VStack spacing={2} align="start">
        <HStack>
          <FiSettings color="#805AD5" />
          <Text fontWeight="bold" fontSize="sm" color="purple.700">
            {data.label || 'Condition'}
          </Text>
        </HStack>
        <Badge colorScheme="purple" size="sm">
          If/Else
        </Badge>
      </VStack>
    </Box>
  );
};

const SequenceNode = ({ data, selected }) => {
  const steps = data.sequenceSteps || [];
  return (
    <Box
      bg="pink.50"
      border="2px"
      borderColor={selected ? 'pink.500' : 'pink.200'}
      borderRadius="lg"
      p={4}
      minW="220px"
      boxShadow={selected ? 'lg' : 'md'}
      transition="all 0.2s"
    >
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
      <VStack spacing={2} align="start">
        <HStack>
          <FiMessageSquare color="#B83280" />
          <Text fontWeight="bold" fontSize="sm" color="pink.700">
            {data.label || 'Message Sequence'}
          </Text>
        </HStack>
        <Badge colorScheme="pink" size="sm">
          {steps.length} {steps.length === 1 ? 'Step' : 'Steps'}
        </Badge>
        {steps.slice(0, 2).map((step, index) => (
          <Text key={index} fontSize="xs" color="gray.600" noOfLines={1}>
            {step.title || `Step ${index + 1}`} • {step.delayAmount || 0} {step.delayUnit || 'minutes'}
          </Text>
        ))}
        {steps.length > 2 && (
          <Text fontSize="xs" color="gray.500">+{steps.length - 2} more</Text>
        )}
      </VStack>
    </Box>
  );
};

// Node types mapping
const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  delay: DelayNode,
  condition: ConditionNode,
  sequence: SequenceNode,
};

// Inner ReactFlow component that has access to useReactFlow hook
const ReactFlowInner = ({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onConnectStart, onConnectEnd, onNodeClick, nodeTypes, rule, onViewportReady }) => {
  const reactFlowInstance = useReactFlow();
  
  // Store reference to reactFlowInstance in parent
  useEffect(() => {
    if (reactFlowInstance && onViewportReady) {
      onViewportReady(reactFlowInstance);
    }
  }, [reactFlowInstance, onViewportReady]);

  // Restore viewport when rule is loaded
  useEffect(() => {
    if (rule?.viewport && reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.setViewport({
          x: rule.viewport.x || 0,
          y: rule.viewport.y || 0,
          zoom: rule.viewport.zoom || 1,
        });
      }, 100);
    }
  }, [rule, reactFlowInstance]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onConnectStart={onConnectStart}
      onConnectEnd={onConnectEnd}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      fitView={!rule?.viewport}
      defaultViewport={rule?.viewport ? { x: rule.viewport.x, y: rule.viewport.y, zoom: rule.viewport.zoom } : undefined}
      connectionLineStyle={{ stroke: '#b1b1b7', strokeWidth: 2 }}
      connectionLineType="smoothstep"
      defaultEdgeOptions={{ type: 'smoothstep', animated: false }}
      snapToGrid={true}
      snapGrid={[15, 15]}
      proOptions={{ hideAttribution: true }}
    >
      <Background />
      <Controls />
      <MiniMap />
      <style>{`
        .react-flow__attribution {
          display: none !important;
        }
      `}</style>
    </ReactFlow>
  );
};

// Main Component
const shouldHideBillingTrigger = (event) => {
  const value =
    typeof event === 'string'
      ? event
      : event?.value || event?.label || event?.name || '';
  if (!value) return false;
  const normalized = value.toLowerCase();
  return (
    normalized.includes('invoice') ||
    normalized.includes('subscription') ||
    normalized.includes('refund')
  );
};

const GraphAutomationBuilder = ({ rule, onSave, onClose, eventsActions, builderResources, viewMode = false }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  // safeSelectedNode prevents ReferenceError if selectedNode becomes unavailable in some scopes
  const safeSelectedNode = (typeof selectedNode !== 'undefined') ? selectedNode : null;
  const [ruleName, setRuleName] = useState(rule?.name || '');
  const [ruleDescription, setRuleDescription] = useState(rule?.description || '');
  const [isActive, setIsActive] = useState(rule?.isActive !== false);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState(null);
  
  const { isOpen: isNodeConfigOpen, onOpen: onNodeConfigOpen, onClose: onNodeConfigClose } = useDisclosure();
  const { isOpen: isNodePaletteOpen, onOpen: onNodePaletteOpen, onClose: onNodePaletteClose } = useDisclosure();
  const { isOpen: isUnsavedDialogOpen, onOpen: onUnsavedDialogOpen, onClose: onUnsavedDialogClose } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [pendingClose, setPendingClose] = useState(false);
  const [shouldOpenMessageCategory, setShouldOpenMessageCategory] = useState(false);
  const [isCreatingTestWorkflow, setIsCreatingTestWorkflow] = useState(false);
  const cancelRef = useRef();
  
  const toast = useToast();
  const authState = useSelector((state) => state.auth);
  const token = getToken(authState);
  const coachId = getCoachId(authState);

  // Initialize nodes and edges from rule
  useEffect(() => {
    if (rule && (rule.workflowType === 'graph' || (rule.nodes && rule.nodes.length > 0))) {
      if (rule.nodes && rule.nodes.length > 0) {
        const initialNodes = rule.nodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: node.position || { x: 0, y: 0 },
          data: {
            ...(node.data || {}),
            label: node.label || node.data?.label || node.nodeType || 'Node',
            nodeType: node.nodeType || node.data?.nodeType || '',
            config: node.config || node.data?.config || {},
            description: node.description || node.data?.description || '',
          },
        }));
        setNodes(initialNodes);
      }
      if (rule.edges && rule.edges.length > 0) {
        const initialEdges = rule.edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle || null,
          targetHandle: edge.targetHandle || null,
          type: edge.type || 'smoothstep',
          animated: edge.animated || false,
          label: edge.label || '',
        }));
        setEdges(initialEdges);
      }
    } else if (rule && rule.workflowType === 'legacy') {
      // Convert legacy rule to graph format
      const triggerNode = {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 250 },
        data: {
          label: 'Trigger',
          nodeType: rule.triggerEvent,
          description: `Triggers on: ${rule.triggerEvent}`,
        },
      };
      
      const actionNodes = (rule.actions || []).map((action, index) => ({
        id: `action-${index + 1}`,
        type: 'action',
        position: { x: 400 + index * 300, y: 250 },
        data: {
          label: action.type,
          nodeType: action.type,
          config: action.config,
        },
      }));

      const newEdges = actionNodes.map((node, index) => ({
        id: `edge-${index}`,
        source: index === 0 ? 'trigger-1' : `action-${index}`,
        target: node.id,
        type: 'smoothstep',
      }));

      setNodes([triggerNode, ...actionNodes]);
      setEdges(newEdges);
    }
    
  }, [rule]);

  // Initialize saved state after nodes/edges are set
  useEffect(() => {
    if (rule && !lastSavedState) {
      // Use a small delay to ensure nodes/edges are set
      const timer = setTimeout(() => {
        setLastSavedState({
          name: rule.name || '',
          description: rule.description || '',
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges))
        });
        setHasUnsavedChanges(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [rule, nodes, edges, lastSavedState]);

  // Track changes to detect unsaved state
  useEffect(() => {
    if (!lastSavedState) return;
    
    const currentState = {
      name: ruleName.trim(),
      description: (ruleDescription || '').trim(),
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges))
    };
    
    const savedState = {
      name: (lastSavedState.name || '').trim(),
      description: (lastSavedState.description || '').trim(),
      nodes: lastSavedState.nodes || [],
      edges: lastSavedState.edges || []
    };
    
    const hasChanges = JSON.stringify(currentState) !== JSON.stringify(savedState);
    setHasUnsavedChanges(hasChanges);
  }, [ruleName, ruleDescription, nodes, edges, lastSavedState]);

  // State for drag connection
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [pendingConnection, setPendingConnection] = useState(null);

  const onConnectStart = useCallback((event, { nodeId, handleId, handleType }) => {
    if (handleType === 'source') {
      setConnectingFrom({ nodeId, handleId });
    }
  }, []);

  const onConnectEnd = useCallback((event) => {
    if (!connectingFrom) return;
    
    // Check if we're connecting to an existing node handle
    const targetHandle = event.target.closest('.react-flow__handle');
    if (targetHandle) {
      // If connecting to existing node, let default behavior handle it
      setConnectingFrom(null);
      return;
    }

    // If not connecting to existing node, open palette to add new node
    const position = reactFlowInstance ? reactFlowInstance.screenToFlowPosition({
      x: event.clientX || (event.touches && event.touches[0]?.clientX) || 0,
      y: event.clientY || (event.touches && event.touches[0]?.clientY) || 0
    }) : { x: 0, y: 0 };
    
    // If the connection starts from a trigger node, default to Actions tab and expand Messages
    const sourceNode = nodes.find((n) => n.id === connectingFrom.nodeId);
    if (sourceNode?.type === 'trigger') {
      setActiveTab(1); // Actions tab
      setShouldOpenMessageCategory(true);
    } else {
      setShouldOpenMessageCategory(false);
    }

    setPendingConnection({
      source: connectingFrom.nodeId,
      sourceHandle: connectingFrom.handleId,
      position
    });
    setConnectingFrom(null);
    onNodePaletteOpen();
  }, [connectingFrom, reactFlowInstance, onNodePaletteOpen, nodes]);

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#b1b1b7', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      setConnectingFrom(null);
      setPendingConnection(null);
    },
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    onNodeConfigOpen();
  }, [onNodeConfigOpen]);

  const addNode = useCallback((nodeType, nodeData) => {
    // Use pending connection position if available, otherwise random position
    const position = pendingConnection?.position || {
      x: Math.random() * 400 + 200,
      y: Math.random() * 400 + 100,
    };

    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position,
      data: {
        label: nodeData.label || nodeData.name || nodeType,
        nodeType: nodeData.value || nodeData.type || nodeType,
        description: nodeData.description || '',
        config: {},
        ...nodeData,
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    
    // If there's a pending connection, create the edge
    if (pendingConnection) {
      setTimeout(() => {
        const newEdge = {
          id: `edge-${Date.now()}`,
          source: pendingConnection.source,
          target: newNode.id,
          sourceHandle: pendingConnection.sourceHandle || null,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#b1b1b7', strokeWidth: 2 },
        };
        setEdges((eds) => addEdge(newEdge, eds));
        setPendingConnection(null);
      }, 100);
    }
    
    onNodePaletteClose();
  }, [setNodes, onNodePaletteClose, pendingConnection, setEdges]);

  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (safeSelectedNode?.id === nodeId) {
      setSelectedNode(null);
      onNodeConfigClose();
    }
  }, [setNodes, setEdges, safeSelectedNode, onNodeConfigClose]);

  const updateNodeConfig = useCallback((config) => {
    if (!safeSelectedNode) return;
    
    setNodes((nds) =>
      nds.map((node) =>
        node.id === safeSelectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                ...config,
              },
            }
          : node
      )
    );
    setSelectedNode((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        ...config,
      },
    }));
    
    // Show success message
    toast({
      title: 'Success',
      description: 'Node configuration saved',
      status: 'success',
      duration: 2000,
    });
  }, [safeSelectedNode, setNodes, toast]);

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setPendingClose(true);
      onUnsavedDialogOpen();
    } else {
      onClose();
    }
  };

  // Create comprehensive test workflow with all node types
  const handleCreateTestWorkflow = async () => {
    if (isCreatingTestWorkflow) return;
    
    setIsCreatingTestWorkflow(true);
    
    try {
      // Get available events and actions
      if (!eventsActions || !eventsActions.events || !eventsActions.actions) {
        toast({
          title: 'Error',
          description: 'Unable to load events and actions. Please refresh the page.',
          status: 'error',
          duration: 5000,
        });
        setIsCreatingTestWorkflow(false);
        return;
      }

      const availableEvents = eventsActions.events || [];
      const availableActions = eventsActions.actions || [];

      // Find a lead-related trigger (preferably lead_created)
      const leadTrigger = availableEvents.find(e => 
        (typeof e === 'string' ? e : e.value || e.label || '').includes('lead_created')
      ) || availableEvents.find(e => 
        (typeof e === 'string' ? e : e.value || e.label || '').includes('lead')
      ) || availableEvents[0];

      const triggerEventValue = typeof leadTrigger === 'string' 
        ? leadTrigger 
        : leadTrigger.value || leadTrigger.label || 'lead_created';

      // Generate unique IDs
      const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create nodes
      const testNodes = [];
      const testEdges = [];
      let xPos = 100;
      let yPos = 300;
      const nodeSpacing = 400;
      const verticalSpacing = 200;

      // 1. Trigger Node
      const triggerNodeId = generateId('trigger');
      testNodes.push({
        id: triggerNodeId,
        type: 'trigger',
        position: { x: xPos, y: yPos },
        data: {
          label: 'Lead Created',
          nodeType: triggerEventValue,
          description: 'Triggers when a new lead is created',
          config: {},
        },
      });
      xPos += nodeSpacing;
      let lastNodeId = triggerNodeId;

      // 2. First Action: Send WhatsApp Message
      const whatsappAction = availableActions.find(a => 
        (typeof a === 'string' ? a : a.value || a.label || '').includes('whatsapp')
      ) || availableActions.find(a => 
        (typeof a === 'string' ? a : a.value || a.label || '').includes('message')
      );
      
      if (whatsappAction) {
        const actionValue = typeof whatsappAction === 'string' 
          ? whatsappAction 
          : whatsappAction.value || whatsappAction.label || 'send_whatsapp_message';
        
        const actionNodeId = generateId('action-whatsapp');
        testNodes.push({
          id: actionNodeId,
          type: 'action',
          position: { x: xPos, y: yPos },
          data: {
            label: 'Send Welcome WhatsApp',
            nodeType: actionValue,
            description: 'Send welcome message via WhatsApp',
            config: {
              message: 'Hi {{lead.name}}, welcome! Thanks for joining us. We\'re excited to have you on board!',
              phoneNumber: '{{lead.phone}}',
              countryCode: '{{lead.countryCode}}',
            },
          },
        });
        testEdges.push({
          id: generateId('edge'),
          source: lastNodeId,
          target: actionNodeId,
          type: 'smoothstep',
          animated: false,
        });
        lastNodeId = actionNodeId;
        xPos += nodeSpacing;
      }

      // 3. Delay Node
      const delayNodeId = generateId('delay');
      testNodes.push({
        id: delayNodeId,
        type: 'delay',
        position: { x: xPos, y: yPos },
        data: {
          label: 'Wait 5 seconds',
          nodeType: 'delay',
          description: 'Delay before next action',
          config: {
            delaySeconds: 5,
          },
        },
      });
      testEdges.push({
        id: generateId('edge'),
        source: lastNodeId,
        target: delayNodeId,
        type: 'smoothstep',
        animated: false,
      });
      lastNodeId = delayNodeId;
      xPos += nodeSpacing;

      // 4. Second Action: Send Email
      const emailAction = availableActions.find(a => 
        (typeof a === 'string' ? a : a.value || a.label || '').includes('email')
      );
      
      if (emailAction) {
        const actionValue = typeof emailAction === 'string' 
          ? emailAction 
          : emailAction.value || emailAction.label || 'send_email_message';
        
        const actionNodeId = generateId('action-email');
        testNodes.push({
          id: actionNodeId,
          type: 'action',
          position: { x: xPos, y: yPos },
          data: {
            label: 'Send Welcome Email',
            nodeType: actionValue,
            description: 'Send welcome email to lead',
            config: {
              to: '{{lead.email}}',
              subject: 'Welcome {{lead.name}}!',
              body: '<h1>Welcome {{lead.name}}!</h1><p>Thank you for joining us. We\'re thrilled to have you on board.</p><p>Best regards,<br>{{coach.name}}</p>',
              fromName: '{{coach.name}}',
              fromEmail: '{{coach.email}}',
            },
          },
        });
        testEdges.push({
          id: generateId('edge'),
          source: lastNodeId,
          target: actionNodeId,
          type: 'smoothstep',
          animated: false,
        });
        lastNodeId = actionNodeId;
        xPos += nodeSpacing;
      }

      // 5. Third Action: Add Note
      const noteAction = availableActions.find(a => 
        (typeof a === 'string' ? a : a.value || a.label || '').includes('note')
      );
      
      if (noteAction) {
        const actionValue = typeof noteAction === 'string' 
          ? noteAction 
          : noteAction.value || noteAction.label || 'add_note_to_lead';
        
        const actionNodeId = generateId('action-note');
        testNodes.push({
          id: actionNodeId,
          type: 'action',
          position: { x: xPos, y: yPos - verticalSpacing },
          data: {
            label: 'Add Welcome Note',
            nodeType: actionValue,
            description: 'Add note to lead record',
            config: {
              note: 'New lead {{lead.name}} ({{lead.email}}) joined on {{currentDate}}. Welcome sequence initiated.',
              noteType: 'general',
              priority: 'normal',
              visibility: 'all',
            },
          },
        });
        testEdges.push({
          id: generateId('edge'),
          source: lastNodeId,
          target: actionNodeId,
          type: 'smoothstep',
          animated: false,
        });
      }

      // 6. Fourth Action: Create Task
      const taskAction = availableActions.find(a => 
        (typeof a === 'string' ? a : a.value || a.label || '').includes('task')
      );
      
      if (taskAction) {
        const actionValue = typeof taskAction === 'string' 
          ? taskAction 
          : taskAction.value || taskAction.label || 'create_task';
        
        const actionNodeId = generateId('action-task');
        testNodes.push({
          id: actionNodeId,
          type: 'action',
          position: { x: xPos, y: yPos },
          data: {
            label: 'Create Follow-up Task',
            nodeType: actionValue,
            description: 'Create task for follow-up',
            config: {
              name: 'Follow up with {{lead.name}}',
              description: 'Schedule a follow-up call with {{lead.name}} ({{lead.email}})',
              priority: 'MEDIUM',
              stage: 'LEAD_QUALIFICATION',
              dueDateOffset: 2,
              estimatedHours: 1,
            },
          },
        });
        testEdges.push({
          id: generateId('edge'),
          source: lastNodeId,
          target: actionNodeId,
          type: 'smoothstep',
          animated: false,
        });
        lastNodeId = actionNodeId;
        xPos += nodeSpacing;
      }

      // 7. Fifth Action: Update Lead Status
      const statusAction = availableActions.find(a => 
        (typeof a === 'string' ? a : a.value || a.label || '').includes('status')
      );
      
      if (statusAction) {
        const actionValue = typeof statusAction === 'string' 
          ? statusAction 
          : statusAction.value || statusAction.label || 'update_lead_status';
        
        const actionNodeId = generateId('action-status');
        testNodes.push({
          id: actionNodeId,
          type: 'action',
          position: { x: xPos, y: yPos },
          data: {
            label: 'Update Lead Status',
            nodeType: actionValue,
            description: 'Update lead status to Contacted',
            config: {
              status: 'Contacted',
            },
          },
        });
        testEdges.push({
          id: generateId('edge'),
          source: lastNodeId,
          target: actionNodeId,
          type: 'smoothstep',
          animated: false,
        });
        lastNodeId = actionNodeId;
        xPos += nodeSpacing;
      }

      // 8. Sixth Action: Add Tag
      const tagAction = availableActions.find(a => 
        (typeof a === 'string' ? a : a.value || a.label || '').includes('tag')
      );
      
      if (tagAction) {
        const actionValue = typeof tagAction === 'string' 
          ? tagAction 
          : tagAction.value || tagAction.label || 'add_lead_tag';
        
        const actionNodeId = generateId('action-tag');
        testNodes.push({
          id: actionNodeId,
          type: 'action',
          position: { x: xPos, y: yPos - verticalSpacing },
          data: {
            label: 'Add Welcome Tag',
            nodeType: actionValue,
            description: 'Add tag to lead',
            config: {
              tag: 'Welcome Sequence',
            },
          },
        });
        testEdges.push({
          id: generateId('edge'),
          source: lastNodeId,
          target: actionNodeId,
          type: 'smoothstep',
          animated: false,
        });
      }

      // 9. Seventh Action: Update Lead Score
      const scoreAction = availableActions.find(a => 
        (typeof a === 'string' ? a : a.value || a.label || '').includes('score')
      );
      
      if (scoreAction) {
        const actionValue = typeof scoreAction === 'string' 
          ? scoreAction 
          : scoreAction.value || scoreAction.label || 'update_lead_score';
        
        const actionNodeId = generateId('action-score');
        testNodes.push({
          id: actionNodeId,
          type: 'action',
          position: { x: xPos, y: yPos },
          data: {
            label: 'Update Lead Score',
            nodeType: actionValue,
            description: 'Increase lead score',
            config: {
              score: 10,
              reason: 'New lead joined - welcome sequence initiated',
            },
          },
        });
        testEdges.push({
          id: generateId('edge'),
          source: lastNodeId,
          target: actionNodeId,
          type: 'smoothstep',
          animated: false,
        });
        lastNodeId = actionNodeId;
        xPos += nodeSpacing;
      }

      // 10. Eighth Action: Send Internal Notification
      const notificationAction = availableActions.find(a => 
        (typeof a === 'string' ? a : a.value || a.label || '').includes('notification')
      );
      
      if (notificationAction) {
        const actionValue = typeof notificationAction === 'string' 
          ? notificationAction 
          : notificationAction.value || notificationAction.label || 'send_internal_notification';
        
        const actionNodeId = generateId('action-notification');
        testNodes.push({
          id: actionNodeId,
          type: 'action',
          position: { x: xPos, y: yPos },
          data: {
            label: 'Notify Team',
            nodeType: actionValue,
            description: 'Send internal notification',
            config: {
              message: 'New lead {{lead.name}} has been added. Welcome sequence completed.',
              recipients: 'all',
              notificationType: 'info',
            },
          },
        });
        testEdges.push({
          id: generateId('edge'),
          source: lastNodeId,
          target: actionNodeId,
          type: 'smoothstep',
          animated: false,
        });
        lastNodeId = actionNodeId;
        xPos += nodeSpacing;
      }

      // 11. Second Delay Node
      const delayNodeId2 = generateId('delay-2');
      testNodes.push({
        id: delayNodeId2,
        type: 'delay',
        position: { x: xPos, y: yPos },
        data: {
          label: 'Wait 10 seconds',
          nodeType: 'delay',
          description: 'Delay before final actions',
          config: {
            delaySeconds: 10,
          },
        },
      });
      testEdges.push({
        id: generateId('edge'),
        source: lastNodeId,
        target: delayNodeId2,
        type: 'smoothstep',
        animated: false,
      });
      lastNodeId = delayNodeId2;
      xPos += nodeSpacing;

      // 12. Ninth Action: Create Deal (if available)
      const dealAction = availableActions.find(a => 
        (typeof a === 'string' ? a : a.value || a.label || '').includes('deal')
      );
      
      if (dealAction) {
        const actionValue = typeof dealAction === 'string' 
          ? dealAction 
          : dealAction.value || dealAction.label || 'create_deal';
        
        const actionNodeId = generateId('action-deal');
        testNodes.push({
          id: actionNodeId,
          type: 'action',
          position: { x: xPos, y: yPos - verticalSpacing },
          data: {
            label: 'Create Initial Deal',
            nodeType: actionValue,
            description: 'Create a deal for the new lead',
            config: {
              dealName: 'Deal with {{lead.name}}',
              amount: 1000,
              currency: 'USD',
              stage: 'prospecting',
              description: 'Initial deal created for {{lead.name}}',
            },
          },
        });
        testEdges.push({
          id: generateId('edge'),
          source: lastNodeId,
          target: actionNodeId,
          type: 'smoothstep',
          animated: false,
        });
      }

      // 13. Tenth Action: Add to Funnel (if available)
      const funnelAction = availableActions.find(a => 
        (typeof a === 'string' ? a : a.value || a.label || '').includes('funnel')
      );
      
      if (funnelAction) {
        const actionValue = typeof funnelAction === 'string' 
          ? funnelAction 
          : funnelAction.value || funnelAction.label || 'add_to_funnel';
        
        const actionNodeId = generateId('action-funnel');
        testNodes.push({
          id: actionNodeId,
          type: 'action',
          position: { x: xPos, y: yPos },
          data: {
            label: 'Add to Funnel',
            nodeType: actionValue,
            description: 'Add lead to sales funnel',
            config: {
              funnelId: '', // Will need to be selected by user
              stageId: '', // Will need to be selected by user
            },
          },
        });
        testEdges.push({
          id: generateId('edge'),
          source: lastNodeId,
          target: actionNodeId,
          type: 'smoothstep',
          animated: false,
        });
        lastNodeId = actionNodeId;
        xPos += nodeSpacing;
      }

      // 14. Eleventh Action: Call Webhook (if available)
      const webhookAction = availableActions.find(a => 
        (typeof a === 'string' ? a : a.value || a.label || '').includes('webhook')
      );
      
      if (webhookAction) {
        const actionValue = typeof webhookAction === 'string' 
          ? webhookAction 
          : webhookAction.value || webhookAction.label || 'call_webhook';
        
        const actionNodeId = generateId('action-webhook');
        testNodes.push({
          id: actionNodeId,
          type: 'action',
          position: { x: xPos, y: yPos },
          data: {
            label: 'Call Webhook',
            nodeType: actionValue,
            description: 'Send data to external webhook',
            config: {
              url: 'https://example.com/webhook',
              method: 'POST',
              payload: JSON.stringify({
                event: 'lead_created',
                leadName: '{{lead.name}}',
                leadEmail: '{{lead.email}}',
                timestamp: '{{timestamp}}',
              }, null, 2),
              timeout: 30,
            },
          },
        });
        testEdges.push({
          id: generateId('edge'),
          source: lastNodeId,
          target: actionNodeId,
          type: 'smoothstep',
          animated: false,
        });
      }

      // Update state with test workflow
      setNodes(testNodes);
      setEdges(testEdges);
      setRuleName('Test Workflow - Comprehensive Automation');
      setRuleDescription('A comprehensive test workflow demonstrating all node types and actions. This workflow includes triggers, actions, delays, and demonstrates the full automation capabilities.');

      toast({
        title: 'Test Workflow Created!',
        description: `Created workflow with ${testNodes.length} nodes and ${testEdges.length} connections. Review and save when ready.`,
        status: 'success',
        duration: 5000,
      });

      // Log to console for backend visibility
      console.log('========================================');
      console.log('[TEST WORKFLOW] Comprehensive test workflow created successfully!');
      console.log('========================================');
      console.log(`[TEST WORKFLOW] Total Nodes: ${testNodes.length}`);
      console.log(`[TEST WORKFLOW] Total Edges: ${testEdges.length}`);
      console.log(`[TEST WORKFLOW] Trigger Event: ${triggerEventValue}`);
      console.log('[TEST WORKFLOW] Node Breakdown:');
      testNodes.forEach((node, index) => {
        console.log(`  ${index + 1}. [${node.type.toUpperCase()}] ${node.data.label} (${node.data.nodeType || 'N/A'})`);
      });
      console.log('[TEST WORKFLOW] Edge Connections:');
      testEdges.forEach((edge, index) => {
        const sourceNode = testNodes.find(n => n.id === edge.source);
        const targetNode = testNodes.find(n => n.id === edge.target);
        console.log(`  ${index + 1}. ${sourceNode?.data?.label || edge.source} → ${targetNode?.data?.label || edge.target}`);
      });
      console.log('========================================');
      console.log('[TEST WORKFLOW] This workflow will demonstrate:');
      console.log('  - Trigger node execution');
      console.log('  - Multiple action types (WhatsApp, Email, Notes, Tasks, etc.)');
      console.log('  - Delay node functionality');
      console.log('  - Sequential workflow execution');
      console.log('  - Template variable substitution');
      console.log('  - Backend logging for each node');
      console.log('========================================');

    } catch (error) {
      console.error('Error creating test workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to create test workflow. Please try again.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsCreatingTestWorkflow(false);
    }
  };

  const handleSaveAndClose = async () => {
    await handleSave();
    if (!hasUnsavedChanges) {
      onClose();
    }
  };

  const handleDiscardAndClose = () => {
    setHasUnsavedChanges(false);
    onUnsavedDialogClose();
    onClose();
  };

  const handleSave = async () => {
    if (!ruleName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a rule name',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (nodes.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one node to the workflow',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    const hasTrigger = nodes.some((n) => n.type === 'trigger');
    const hasAction = nodes.some((n) => n.type === 'action');

    if (!hasTrigger) {
      toast({
        title: 'Error',
        description: 'Workflow must have at least one trigger node',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!hasAction) {
      toast({
        title: 'Error',
        description: 'Workflow must have at least one action node',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Validate workflow
    try {
      const validationResponse = await axios.post(
        `${API_BASE_URL}/automation-rules/validate-graph`,
        { nodes, edges },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!validationResponse.data.valid) {
        toast({
          title: 'Validation Errors',
          description: validationResponse.data.errors.join(', '),
          status: 'error',
          duration: 5000,
        });
        return;
      }

      if (validationResponse.data.warnings.length > 0) {
        console.warn('Validation warnings:', validationResponse.data.warnings);
      }
    } catch (error) {
      console.error('Validation error:', error);
      // Continue anyway if validation endpoint fails
    }

    // Get current viewport from ReactFlow
    const currentViewport = reactFlowInstance ? reactFlowInstance.getViewport() : { x: 0, y: 0, zoom: 1 };

    // Prepare workflow data - ensure all required fields are present
    const workflowData = {
      name: ruleName.trim(),
      description: ruleDescription?.trim() || '',
      workflowType: 'graph',
      nodes: nodes.map((node) => {
        const nodeData = {
          id: node.id,
          type: node.type,
          nodeType: node.data?.nodeType || node.data?.type || '',
          label: node.data?.label || node.data?.nodeType || 'Node',
          position: node.position || { x: 0, y: 0 },
          data: {
            label: node.data?.label || node.data?.nodeType || 'Node',
            nodeType: node.data?.nodeType || node.data?.type || '',
            description: node.data?.description || '',
            ...(node.data || {}),
          },
          config: node.data?.config || {},
        };
        return nodeData;
      }),
      edges: edges.map((edge) => ({
        id: edge.id || `edge-${Date.now()}-${Math.random()}`,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || null,
        targetHandle: edge.targetHandle || null,
        type: edge.type || 'smoothstep',
        animated: edge.animated || false,
        label: edge.label || '',
      })),
      viewport: {
        x: currentViewport.x || 0,
        y: currentViewport.y || 0,
        zoom: currentViewport.zoom || 1,
      },
      isActive: isActive !== undefined ? isActive : true,
      coachId: coachId || rule?.coachId,
    };

    if (onSave) {
      onSave(workflowData);
      // Update saved state after successful save
      setLastSavedState({
        name: ruleName.trim(),
        description: ruleDescription?.trim() || '',
        nodes: nodes,
        edges: edges
      });
      setHasUnsavedChanges(false);
      
      // If pending close, close after save
      if (pendingClose) {
        setPendingClose(false);
        onUnsavedDialogClose();
        setTimeout(() => {
          onClose();
        }, 300);
      }
    }
  };

  // Group triggers and actions by category
  const nodeCategories = useMemo(() => {
    if (!eventsActions) return { triggers: {}, actions: {} };
    
    const triggers = (eventsActions.events || []).filter(
      (event) => !shouldHideBillingTrigger(event)
    );
    const actions = eventsActions.actions || [];
    
    // Group triggers by category
    const groupedTriggers = {};
    triggers.forEach(event => {
      const category = event.category || 'Other';
      if (!groupedTriggers[category]) {
        groupedTriggers[category] = [];
      }
      groupedTriggers[category].push(event);
    });
    
    // Group actions by category
    const groupedActions = {};
    actions.forEach(action => {
      const category = action.category || 'Other';
      if (!groupedActions[category]) {
        groupedActions[category] = [];
      }
      groupedActions[category].push(action);
    });
    
    return { triggers: groupedTriggers, actions: groupedActions };
  }, [eventsActions]);

  // Get icon for trigger event
  const getTriggerIcon = (eventValue) => {
    const eventStr = typeof eventValue === 'string' ? eventValue : eventValue.value || eventValue.label || '';
    const eventLower = eventStr.toLowerCase();
    
    if (eventLower.includes('lead')) {
      if (eventLower.includes('created')) return FiUser;
      if (eventLower.includes('status')) return FiEdit;
      if (eventLower.includes('score')) return FiTrendingUp;
      return FiUser;
    }
    if (eventLower.includes('appointment')) return FiCalendar;
    if (eventLower.includes('payment')) return FiDollarSign;
    if (eventLower.includes('task')) return FiCheckCircle;
    if (eventLower.includes('form')) return FiFileText;
    if (eventLower.includes('funnel')) return FiBarChart2;
    if (eventLower.includes('content')) return FiMessageSquare;
    return FiZap;
  };

  // Get icon for action
  const getActionIcon = (actionValue) => {
    const actionStr = typeof actionValue === 'string' ? actionValue : actionValue.value || actionValue.label || '';
    const actionLower = actionStr.toLowerCase();
    
    if (actionLower.includes('email') || actionLower.includes('send_email')) return FiMail;
    if (actionLower.includes('whatsapp') || actionLower.includes('sms') || actionLower.includes('message')) return FiMessageSquare;
    if (actionLower.includes('task') || actionLower.includes('create_task')) return FiList;
    if (actionLower.includes('lead')) {
      if (actionLower.includes('status')) return FiEdit;
      if (actionLower.includes('score')) return FiTrendingUp;
      if (actionLower.includes('tag')) return FiTag;
      if (actionLower.includes('note')) return FiFileText;
      return FiUser;
    }
    if (actionLower.includes('calendar') || actionLower.includes('event')) return FiCalendar;
    if (actionLower.includes('notification')) return FiBell;
    if (actionLower.includes('webhook')) return FiLink;
    if (actionLower.includes('automation') || actionLower.includes('trigger')) return FiZap;
    if (actionLower.includes('invoice') || actionLower.includes('payment')) return FiCreditCard;
    if (actionLower.includes('funnel')) return FiBarChart2;
    if (actionLower.includes('deal')) return FiShoppingCart;
    return FiPlay;
  };

  // Filter nodes based on search query
  const filteredTriggers = useMemo(() => {
    if (!searchQuery.trim()) return nodeCategories.triggers;
    const query = searchQuery.toLowerCase();
    const filtered = {};
    Object.keys(nodeCategories.triggers).forEach(category => {
      const categoryItems = nodeCategories.triggers[category].filter(event => {
      const label = typeof event === 'string' ? event : event.label || event.value || '';
        const desc = typeof event === 'string' ? '' : event.description || '';
        return label.toLowerCase().includes(query) || desc.toLowerCase().includes(query);
    });
      if (categoryItems.length > 0) {
        filtered[category] = categoryItems;
      }
    });
    return filtered;
  }, [nodeCategories.triggers, searchQuery]);

  const filteredActions = useMemo(() => {
    if (!searchQuery.trim()) return nodeCategories.actions;
    const query = searchQuery.toLowerCase();
    const filtered = {};
    Object.keys(nodeCategories.actions).forEach(category => {
      const categoryItems = nodeCategories.actions[category].filter(action => {
      const label = typeof action === 'string' ? action : action.label || action.value || '';
        const desc = typeof action === 'string' ? '' : action.description || '';
        return label.toLowerCase().includes(query) || desc.toLowerCase().includes(query);
    });
      if (categoryItems.length > 0) {
        filtered[category] = categoryItems;
      }
    });
    return filtered;
  }, [nodeCategories.actions, searchQuery]);

  // Determine if we're editing a nurturing/message sequence
  const isSequenceMode = useMemo(() => {
    if (!rule) return false;
    if (rule.meta && rule.meta.type === 'nurturing-sequence') return true;
    if (rule.nodes && rule.nodes.some(n => n.type === 'sequence' || n.data?.nodeType === 'sequence')) return true;
    return false;
  }, [rule]);

  // If sequence mode, restrict triggers/actions/flow control
  const sequenceTriggerKeywords = ['appointment', 'book', 'lead', 'form', 'payment', 'schedule', 'booking'];
  const filteredSequenceTriggers = useMemo(() => {
    if (!isSequenceMode) return filteredTriggers;
    const filtered = {};
    Object.keys(nodeCategories.triggers || {}).forEach(category => {
      const items = (nodeCategories.triggers[category] || []).filter(event => {
        const label = (typeof event === 'string' ? event : event.label || event.value || '').toLowerCase();
        return sequenceTriggerKeywords.some(k => label.includes(k));
      });
      if (items.length) filtered[category] = items;
    });
    return Object.keys(filtered).length ? filtered : filteredTriggers;
  }, [isSequenceMode, nodeCategories.triggers, filteredTriggers]);

  const filteredSequenceActions = useMemo(() => {
    if (!isSequenceMode) return filteredActions;
    const allowedKeywords = ['message', 'email', 'whatsapp', 'sms', 'notification'];
    const filtered = {};
    Object.keys(nodeCategories.actions || {}).forEach(category => {
      const items = (nodeCategories.actions[category] || []).filter(action => {
        const label = (typeof action === 'string' ? action : action.label || action.value || '').toLowerCase();
        return allowedKeywords.some(k => label.includes(k));
      });
      if (items.length) filtered[category] = items;
    });
    return Object.keys(filtered).length ? filtered : filteredActions;
  }, [isSequenceMode, nodeCategories.actions, filteredActions]);

  return (
    <Box 
      w="100%" 
      h="100%" 
      bg="gray.50" 
      position="relative"
      display="flex" 
      flexDirection="column"
    >
      {/* Top Toolbar - Elegant & Minimal */}
      <Box
        bg="white"
        borderBottom="1px"
        borderColor="gray.100"
        px={6}
        py={4}
        zIndex={10}
        flexShrink={0}
      >
        <HStack justify="space-between" align="center" spacing={6}>
          <HStack spacing={4} flex={1} align="center">
            <VStack align="start" spacing={1} flex={1}>
              <FormControl>
            <Input
                  placeholder="Workflow name"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
                  variant="filled"
                  fontSize="lg"
                  fontWeight="600"
                  color="gray.800"
                  bg="gray.50"
                  border="1px"
                  borderColor="transparent"
                  _placeholder={{ color: 'gray.400', fontWeight: '400' }}
                  _hover={{ bg: 'gray.100', borderColor: 'gray.200' }}
                  _focus={{ bg: 'white', borderColor: 'blue.300', boxShadow: '0 0 0 1px var(--chakra-colors-blue-300)' }}
                  px={3}
                  py={2}
                  maxW="400px"
                  borderRadius="md"
                />
              </FormControl>
              <FormControl>
                <Input
                  placeholder="Add description (optional)"
                  value={ruleDescription}
                  onChange={(e) => setRuleDescription(e.target.value)}
                  variant="filled"
                  fontSize="xs"
                  fontWeight="400"
                  color="gray.500"
                  bg="gray.50"
                  border="1px"
                  borderColor="transparent"
                  _placeholder={{ color: 'gray.400' }}
                  _hover={{ bg: 'gray.100', borderColor: 'gray.200' }}
                  _focus={{ bg: 'white', borderColor: 'blue.300', boxShadow: '0 0 0 1px var(--chakra-colors-blue-300)' }}
                  px={3}
                  py={1.5}
                  maxW="400px"
                  borderRadius="md"
                />
              </FormControl>
            </VStack>
          </HStack>
          <HStack spacing={3} align="center">
            <Button
              leftIcon={<FiZap />}
              variant="outline"
              size="sm"
              onClick={handleCreateTestWorkflow}
              colorScheme="purple"
              fontWeight="500"
              isLoading={isCreatingTestWorkflow}
              loadingText="Creating..."
            >
              Create Test Workflow
            </Button>
            <Button
              leftIcon={<FiPlus />}
              variant="ghost"
              size="sm"
              onClick={onNodePaletteOpen}
              colorScheme="blue"
              fontWeight="500"
            >
              Add Node
            </Button>
            <IconButton
              icon={<FiSettings />}
              aria-label="Configure Node"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (safeSelectedNode) {
                  onNodeConfigOpen();
                }
              }}
              isDisabled={!safeSelectedNode}
              colorScheme="gray"
            />
            <Divider orientation="vertical" h="24px" />
            <HStack spacing={2}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClose}
                colorScheme="gray"
                fontWeight="500"
              >
                Close
            </Button>
            <Button
              leftIcon={<FiSave />}
                colorScheme="blue"
              size="sm"
              onClick={handleSave}
                fontWeight="500"
                borderRadius="md"
            >
                Save
            </Button>
            </HStack>
          </HStack>
        </HStack>
      </Box>

      {/* React Flow Canvas */}
      <Box flex={1} position="relative" minH={0}>
        <ReactFlowProvider>
          <ReactFlowInner
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            rule={rule}
            onViewportReady={setReactFlowInstance}
          />
        </ReactFlowProvider>
      </Box>

      {/* Node Palette Drawer */}
      <Drawer 
        isOpen={isNodePaletteOpen} 
        placement="right" 
        onClose={() => {
          onNodePaletteClose();
          setSearchQuery('');
          setActiveTab(0);
          setShouldOpenMessageCategory(false);
        }} 
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="bold">Add Node to Workflow</Text>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="md"
                />
              </InputGroup>
            </VStack>
          </DrawerHeader>
          <DrawerBody>
            <Tabs index={activeTab} onChange={setActiveTab}>
              <TabList>
                <Tab>Triggers</Tab>
                <Tab>Actions</Tab>
                <Tab>Flow Control</Tab>
              </TabList>

              <TabPanels>
                {/* Triggers Tab */}
                <TabPanel px={0} pt={4}>
                    <VStack spacing={2} align="stretch" maxH="calc(100vh - 300px)" overflowY="auto">
                    {Object.keys(isSequenceMode ? filteredSequenceTriggers : filteredTriggers).length === 0 ? (
                      <Text color="gray.500" textAlign="center" py={8}>
                        No triggers found matching "{searchQuery}"
                      </Text>
                    ) : searchQuery.trim() ? (
                      // When searching, show all results in groups without accordion
                      Object.keys(isSequenceMode ? filteredSequenceTriggers : filteredTriggers).map((category) => {
                        const simpleCategory = category
                          .replace('Lead & Customer Lifecycle', 'Leads')
                          .replace('Funnel & Conversion', 'Funnels')
                          .replace('Appointment & Calendar', 'Appointments')
                          .replace('Task & System', 'Tasks')
                          .replace('Payment & Subscription', 'Payments');
                        
                        return (
                          <Box key={category} mb={4}>
                            <Text fontSize="xs" fontWeight="500" color="gray.500" textTransform="uppercase" mb={2} px={2}>
                              {simpleCategory}
                            </Text>
                            <VStack spacing={2} align="stretch">
                                {(isSequenceMode ? filteredSequenceTriggers[category] : filteredTriggers[category]).map((event, index) => {
                        const eventLabel = typeof event === 'string' ? event : event.label || event.value;
                        const eventValue = typeof event === 'string' ? event : event.value || event.label;
                                const eventDesc = typeof event === 'string' ? '' : event.description || '';
                        const TriggerIcon = getTriggerIcon(eventValue);
                        return (
                          <Card
                                    key={`${category}-${index}`}
                            cursor="pointer"
                            onClick={() => {
                              addNode('trigger', event);
                              setSearchQuery('');
                            }}
                            _hover={{
                              borderColor: 'blue.300',
                              boxShadow: 'md',
                              transform: 'translateY(-1px)'
                            }}
                            transition="all 0.2s"
                            border="1px"
                            borderColor="gray.200"
                            bg="white"
                            p={3}
                          >
                                    <HStack spacing={3} align="start">
                              <Box
                                p={2}
                                borderRadius="md"
                                bg="blue.50"
                                color="blue.600"
                                        flexShrink={0}
                              >
                                <TriggerIcon size={18} />
                              </Box>
                                      <VStack align="start" spacing={0.5} flex={1}>
                              <Text fontSize="sm" fontWeight="600" color="gray.700">
                                {eventLabel}
                              </Text>
                                        {eventDesc && (
                                          <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                            {eventDesc}
                                          </Text>
                                        )}
                                      </VStack>
                            </HStack>
                          </Card>
                                );
                              })}
                            </VStack>
                          </Box>
                        );
                      })
                    ) : (
                      // When not searching, show accordion
                      <Accordion allowMultiple defaultIndex={[]}>
                        {Object.keys(isSequenceMode ? filteredSequenceTriggers : filteredTriggers).map((category) => {
                          const simpleCategory = category
                            .replace('Lead & Customer Lifecycle', 'Leads')
                            .replace('Funnel & Conversion', 'Funnels')
                            .replace('Appointment & Calendar', 'Appointments')
                            .replace('Task & System', 'Tasks')
                            .replace('Payment & Subscription', 'Payments');
                          
                          return (
                            <AccordionItem key={category} border="none" mb={2}>
                              <AccordionButton
                                px={2}
                                py={3}
                                bg="gray.50"
                                borderRadius="md"
                                minH="44px"
                                _hover={{ bg: 'gray.100' }}
                                _expanded={{ bg: 'blue.50', color: 'blue.700' }}
                              >
                                <Box flex="1" textAlign="left">
                                  <Text fontSize="xs" fontWeight="500" textTransform="uppercase">
                                    {simpleCategory}
                                  </Text>
                                </Box>
                                <AccordionIcon />
                              </AccordionButton>
                              <AccordionPanel px={2} pt={2} pb={0}>
                                <VStack spacing={2} align="stretch">
                                  {(isSequenceMode ? filteredSequenceTriggers[category] : filteredTriggers[category]).map((event, index) => {
                                    const eventLabel = typeof event === 'string' ? event : event.label || event.value;
                                    const eventValue = typeof event === 'string' ? event : event.value || event.label;
                                    const eventDesc = typeof event === 'string' ? '' : event.description || '';
                                    const TriggerIcon = getTriggerIcon(eventValue);
                                    return (
                                      <Card
                                        key={`${category}-${index}`}
                                        cursor="pointer"
                                        onClick={() => {
                                          addNode('trigger', event);
                                          setSearchQuery('');
                                        }}
                                        _hover={{
                                          borderColor: 'blue.300',
                                          boxShadow: 'md',
                                          transform: 'translateY(-1px)'
                                        }}
                                        transition="all 0.2s"
                                        border="1px"
                                        borderColor="gray.200"
                                        bg="white"
                                        p={3}
                                      >
                                        <HStack spacing={3} align="start">
                                          <Box
                                            p={2}
                                            borderRadius="md"
                                            bg="blue.50"
                                            color="blue.600"
                                            flexShrink={0}
                                          >
                                            <TriggerIcon size={18} />
                                          </Box>
                                          <VStack align="start" spacing={0.5} flex={1}>
                                            <Text fontSize="sm" fontWeight="600" color="gray.700">
                                              {eventLabel}
                                            </Text>
                                            {eventDesc && (
                                              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                                {eventDesc}
                                              </Text>
                                            )}
                                          </VStack>
                                        </HStack>
                                      </Card>
                                    );
                                  })}
                                </VStack>
                              </AccordionPanel>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    )}
                  </VStack>
                </TabPanel>

                {/* Actions Tab */}
                <TabPanel px={0} pt={4}>
                  <VStack spacing={2} align="stretch" maxH="calc(100vh - 300px)" overflowY="auto">
                    {Object.keys(isSequenceMode ? filteredSequenceActions : filteredActions).length === 0 ? (
                      <Text color="gray.500" textAlign="center" py={8}>
                        No actions found matching "{searchQuery}"
                      </Text>
                    ) : searchQuery.trim() ? (
                      // When searching, show all results in groups without accordion
                      Object.keys(isSequenceMode ? filteredSequenceActions : filteredActions).map((category) => {
                        const simpleCategory = category
                          .replace('Lead Data & Funnel Actions', 'Lead Actions')
                          .replace('Communication Actions', 'Messages')
                          .replace('Task & Workflow Actions', 'Tasks')
                          .replace('Zoom Integration Actions', 'Zoom')
                          .replace('Payment Actions', 'Payments')
                          .replace('System Actions', 'System');
                        
                        return (
                          <Box key={category} mb={4}>
                            <Text fontSize="xs" fontWeight="500" color="gray.500" textTransform="uppercase" mb={2} px={2}>
                              {simpleCategory}
                            </Text>
                            <VStack spacing={2} align="stretch">
                              {(isSequenceMode ? filteredSequenceActions[category] : filteredActions[category]).map((action, index) => {
                        const actionLabel = typeof action === 'string' ? action : action.label || action.value;
                        const actionValue = typeof action === 'string' ? action : action.value || action.label;
                                const actionDesc = typeof action === 'string' ? '' : action.description || '';
                        const ActionIcon = getActionIcon(actionValue);
                        return (
                          <Card
                                    key={`${category}-${index}`}
                            cursor="pointer"
                            onClick={() => {
                              addNode('action', action);
                              setSearchQuery('');
                            }}
                            _hover={{
                              borderColor: 'green.300',
                              boxShadow: 'md',
                              transform: 'translateY(-1px)'
                            }}
                            transition="all 0.2s"
                            border="1px"
                            borderColor="gray.200"
                            bg="white"
                            p={3}
                          >
                                    <HStack spacing={3} align="start">
                              <Box
                                p={2}
                                borderRadius="md"
                                bg="green.50"
                                color="green.600"
                                        flexShrink={0}
                              >
                                <ActionIcon size={18} />
                              </Box>
                                      <VStack align="start" spacing={0.5} flex={1}>
                              <Text fontSize="sm" fontWeight="600" color="gray.700">
                                {actionLabel}
                              </Text>
                                        {actionDesc && (
                                          <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                            {actionDesc}
                                          </Text>
                                        )}
                                      </VStack>
                            </HStack>
                          </Card>
                                );
                              })}
                            </VStack>
                          </Box>
                        );
                      })
                    ) : (
                      // When not searching, show accordion
                      <Accordion
                        allowMultiple
                        defaultIndex={() => {
                          const categories = Object.keys(isSequenceMode ? filteredSequenceActions : filteredActions);
                          const messageIndex = categories.findIndex((c) =>
                            c.toLowerCase().includes('communication')
                          );
                          return shouldOpenMessageCategory && messageIndex >= 0 ? [messageIndex] : [];
                        }}
                      >
                        {Object.keys(isSequenceMode ? filteredSequenceActions : filteredActions).map((category) => {
                          const simpleCategory = category
                            .replace('Lead Data & Funnel Actions', 'Lead Actions')
                            .replace('Communication Actions', 'Messages')
                            .replace('Task & Workflow Actions', 'Tasks')
                            .replace('Zoom Integration Actions', 'Zoom')
                            .replace('Payment Actions', 'Payments')
                            .replace('System Actions', 'System');
                          
                          return (
                            <AccordionItem key={category} border="none" mb={2}>
                              <AccordionButton
                                px={2}
                                py={3}
                                bg="gray.50"
                                borderRadius="md"
                                minH="44px"
                                _hover={{ bg: 'gray.100' }}
                                _expanded={{ bg: 'green.50', color: 'green.700' }}
                              >
                                <Box flex="1" textAlign="left">
                                  <Text fontSize="xs" fontWeight="500" textTransform="uppercase">
                                    {simpleCategory}
                                  </Text>
                                </Box>
                                <AccordionIcon />
                              </AccordionButton>
                              <AccordionPanel px={2} pt={2} pb={0}>
                                <VStack spacing={2} align="stretch">
                                  {(isSequenceMode ? filteredSequenceActions[category] : filteredActions[category]).map((action, index) => {
                                    const actionLabel = typeof action === 'string' ? action : action.label || action.value;
                                    const actionValue = typeof action === 'string' ? action : action.value || action.label;
                                    const actionDesc = typeof action === 'string' ? '' : action.description || '';
                                    const ActionIcon = getActionIcon(actionValue);
                                    return (
                                      <Card
                                        key={`${category}-${index}`}
                                        cursor="pointer"
                                        onClick={() => {
                                          addNode('action', action);
                                          setSearchQuery('');
                                        }}
                                        _hover={{
                                          borderColor: 'green.300',
                                          boxShadow: 'md',
                                          transform: 'translateY(-1px)'
                                        }}
                                        transition="all 0.2s"
                                        border="1px"
                                        borderColor="gray.200"
                                        bg="white"
                                        p={3}
                                      >
                                        <HStack spacing={3} align="start">
                                          <Box
                                            p={2}
                                            borderRadius="md"
                                            bg="green.50"
                                            color="green.600"
                                            flexShrink={0}
                                          >
                                            <ActionIcon size={18} />
                                          </Box>
                                          <VStack align="start" spacing={0.5} flex={1}>
                                            <Text fontSize="sm" fontWeight="600" color="gray.700">
                                              {actionLabel}
                                            </Text>
                                            {actionDesc && (
                                              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                                {actionDesc}
                                              </Text>
                                            )}
                                          </VStack>
                                        </HStack>
                                      </Card>
                                    );
                                  })}
                                </VStack>
                              </AccordionPanel>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    )}
                  </VStack>
                </TabPanel>

                {/* Flow Control Tab */}
                <TabPanel px={0} pt={4}>
                  <VStack spacing={2} align="stretch" maxH="calc(100vh - 300px)" overflowY="auto">
                    {(() => {
                      const baseItems = {
                        'Flow Control': [
                          { label: 'Delay', type: 'delay', icon: FiClock, color: 'orange', data: { label: 'Delay', delay: 0 }, description: 'Wait for a specified amount of time before continuing' },
                        ]
                      };
                      // In normal mode include condition and sequence; in sequence mode include only Delay and Message Sequence
                      const flowControlItems = isSequenceMode ? {
                        'Flow Control': [
                          baseItems['Flow Control'][0],
                          { label: 'Message Sequence', type: 'sequence', icon: FiMessageSquare, color: 'pink', data: { label: 'Message Sequence', sequenceSteps: [] }, description: 'Send a sequence of messages with delays' }
                        ]
                      } : {
                        'Flow Control': [
                          ...baseItems['Flow Control'],
                          { label: 'Condition', type: 'condition', icon: FiFilter, color: 'purple', data: { label: 'Condition' }, description: 'Branch workflow based on conditions (if/else)' },
                          { label: 'Message Sequence', type: 'sequence', icon: FiMessageSquare, color: 'pink', data: { label: 'Message Sequence', sequenceSteps: [] }, description: 'Send a sequence of messages with delays' },
                        ]
                      };
                      
                      const filtered = {};
                      Object.keys(flowControlItems).forEach(category => {
                        const categoryItems = flowControlItems[category].filter(item => 
                          !searchQuery.trim() || 
                          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
                        );
                        if (categoryItems.length > 0) {
                          filtered[category] = categoryItems;
                        }
                      });

                      if (Object.keys(filtered).length === 0) {
                        return (
                          <Text color="gray.500" textAlign="center" py={8}>
                            No flow control items found matching "{searchQuery}"
                          </Text>
                        );
                      }

                      return searchQuery.trim() ? (
                        // When searching, show all results in groups without accordion
                        Object.keys(filtered).map((category) => {
                          const simpleCategory = category.replace('Flow Control', 'Flow');
                          return (
                            <Box key={category} mb={4}>
                              <Text fontSize="xs" fontWeight="500" color="gray.500" textTransform="uppercase" mb={2} px={2}>
                                {simpleCategory}
                              </Text>
                              <VStack spacing={2} align="stretch">
                                {filtered[category].map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                          <Card
                                      key={`${category}-${index}`}
                            cursor="pointer"
                            onClick={() => {
                              addNode(item.type, item.data);
                              setSearchQuery('');
                            }}
                            _hover={{
                              borderColor: `${item.color}.300`,
                              boxShadow: 'md',
                              transform: 'translateY(-1px)'
                            }}
                            transition="all 0.2s"
                            border="1px"
                            borderColor="gray.200"
                            bg="white"
                            p={3}
                          >
                                      <HStack spacing={3} align="start">
                              <Box
                                p={2}
                                borderRadius="md"
                                bg={`${item.color}.50`}
                                color={`${item.color}.600`}
                                          flexShrink={0}
                              >
                                <IconComponent size={18} />
                              </Box>
                                        <VStack align="start" spacing={0.5} flex={1}>
                              <Text fontSize="sm" fontWeight="600" color="gray.700">
                                {item.label}
                              </Text>
                                          {item.description && (
                                            <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                              {item.description}
                                            </Text>
                                          )}
                                        </VStack>
                            </HStack>
                          </Card>
                        );
                                })}
                              </VStack>
                            </Box>
                          );
                        })
                      ) : (
                        // When not searching, show accordion
                        <Accordion allowMultiple defaultIndex={[]}>
                          {Object.keys(filtered).map((category) => {
                            const simpleCategory = category.replace('Flow Control', 'Flow');
                            return (
                              <AccordionItem key={category} border="none" mb={2}>
                                <AccordionButton
                                  px={2}
                                  py={3}
                                  bg="gray.50"
                                  borderRadius="md"
                                  minH="44px"
                                  _hover={{ bg: 'gray.100' }}
                                  _expanded={{ bg: 'purple.50', color: 'purple.700' }}
                                >
                                  <Box flex="1" textAlign="left">
                                    <Text fontSize="xs" fontWeight="500" textTransform="uppercase">
                                      {simpleCategory}
                                    </Text>
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel px={2} pt={2} pb={0}>
                                  <VStack spacing={2} align="stretch">
                                    {filtered[category].map((item, index) => {
                                      const IconComponent = item.icon;
                                      return (
                                        <Card
                                          key={`${category}-${index}`}
                                          cursor="pointer"
                                          onClick={() => {
                                            addNode(item.type, item.data);
                                            setSearchQuery('');
                                          }}
                                          _hover={{
                                            borderColor: `${item.color}.300`,
                                            boxShadow: 'md',
                                            transform: 'translateY(-1px)'
                                          }}
                                          transition="all 0.2s"
                                          border="1px"
                                          borderColor="gray.200"
                                          bg="white"
                                          p={3}
                                        >
                                          <HStack spacing={3} align="start">
                                            <Box
                                              p={2}
                                              borderRadius="md"
                                              bg={`${item.color}.50`}
                                              color={`${item.color}.600`}
                                              flexShrink={0}
                                            >
                                              <IconComponent size={18} />
                                            </Box>
                                            <VStack align="start" spacing={0.5} flex={1}>
                                              <Text fontSize="sm" fontWeight="600" color="gray.700">
                                                {item.label}
                                              </Text>
                                              {item.description && (
                                                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                                  {item.description}
                                                </Text>
                                              )}
                                            </VStack>
                                          </HStack>
                                        </Card>
                                      );
                                    })}
                                  </VStack>
                                </AccordionPanel>
                              </AccordionItem>
                            );
                          })}
                        </Accordion>
                      );
                    })()}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Unsaved Changes Dialog */}
      <AlertDialog
        isOpen={isUnsavedDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={onUnsavedDialogClose}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
        <AlertDialogContent borderRadius="xl" maxW="400px" boxShadow="xl">
          <AlertDialogHeader
            fontSize="lg"
            fontWeight="600"
            color="gray.800"
            pb={2}
          >
            Unsaved Changes
          </AlertDialogHeader>
          <AlertDialogBody py={4}>
            <Text color="gray.600" fontSize="sm" lineHeight="1.6">
              You have unsaved changes. Do you want to save before closing?
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter gap={2} pt={2}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDiscardAndClose}
              colorScheme="gray"
              fontWeight="500"
            >
              Discard
            </Button>
            <Button
              ref={cancelRef}
              variant="ghost"
              size="sm"
              onClick={onUnsavedDialogClose}
              colorScheme="gray"
              fontWeight="500"
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={handleSaveAndClose}
              fontWeight="500"
              borderRadius="md"
            >
              Save & Close
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Node Configuration Drawer */}
      <Drawer isOpen={isNodeConfigOpen} placement="right" onClose={onNodeConfigClose} size="lg">
        <DrawerOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
        <DrawerContent bg="white">
          <DrawerCloseButton zIndex={10} />
          <DrawerHeader
            borderBottom="1px"
            borderColor="gray.100"
            pb={4}
            pt={6}
            px={6}
            bg="gray.50"
          >
            <VStack align="start" spacing={1}>
              <HStack spacing={2} align="center">
                <Box
                  w={2}
                  h={2}
                  borderRadius="full"
                  bg={
                    safeSelectedNode?.type === 'trigger'
                      ? 'blue.500'
                      : safeSelectedNode?.type === 'action'
                      ? 'green.500'
                      : safeSelectedNode?.type === 'delay'
                      ? 'yellow.500'
                      : safeSelectedNode?.type === 'condition'
                      ? 'purple.500'
                      : 'gray.500'
                  }
                />
                <Text fontSize="lg" fontWeight="600" color="gray.800">
                  Configure Node
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.500" fontWeight="400">
                {safeSelectedNode?.data?.label || safeSelectedNode?.data?.nodeType || 'Node'}
              </Text>
            </VStack>
          </DrawerHeader>
          <DrawerBody px={6} py={6} overflowY="auto">
            {safeSelectedNode && (
              <NodeConfigurationPanel
                node={safeSelectedNode}
                onUpdate={updateNodeConfig}
                onDelete={() => {
                  deleteNode(safeSelectedNode.id);
                  onNodeConfigClose();
                }}
                builderResources={builderResources}
                allNodes={nodes}
                onClose={onNodeConfigClose}
              />
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

// Professional Variable Tooltip Component
const VariableTooltip = ({ triggerEvent, onInsert, fieldName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const getAllVariables = () => {
    const general = [
      { path: '{{currentDate}}', description: 'Current date (YYYY-MM-DD)', category: 'System' },
      { path: '{{currentTime}}', description: 'Current time (HH:MM:SS)', category: 'System' },
      { path: '{{currentDateTime}}', description: 'Current date and time', category: 'System' },
      { path: '{{timestamp}}', description: 'Unix timestamp', category: 'System' },
    ];

    const lead = [
      { path: '{{lead.name}}', description: 'Lead full name', category: 'Lead' },
      { path: '{{lead.firstName}}', description: 'Lead first name', category: 'Lead' },
      { path: '{{lead.lastName}}', description: 'Lead last name', category: 'Lead' },
      { path: '{{lead.email}}', description: 'Lead email address', category: 'Lead' },
      { path: '{{lead.phone}}', description: 'Lead phone number', category: 'Lead' },
      { path: '{{lead.countryCode}}', description: 'Lead country code', category: 'Lead' },
      { path: '{{lead.status}}', description: 'Lead status', category: 'Lead' },
      { path: '{{lead.temperature}}', description: 'Lead temperature (Hot/Warm/Cold)', category: 'Lead' },
      { path: '{{lead.source}}', description: 'Lead source', category: 'Lead' },
      { path: '{{lead.score}}', description: 'Lead score', category: 'Lead' },
      { path: '{{lead.funnelId}}', description: 'Lead funnel ID', category: 'Lead' },
      { path: '{{lead.stage}}', description: 'Lead stage', category: 'Lead' },
    ];

    const coach = [
      { path: '{{coach.name}}', description: 'Coach name', category: 'Coach' },
      { path: '{{coach.email}}', description: 'Coach email', category: 'Coach' },
      { path: '{{coach.company}}', description: 'Coach company', category: 'Coach' },
    ];

    const staff = [
      { path: '{{assignedStaff.name}}', description: 'Assigned staff name', category: 'Staff' },
      { path: '{{assignedStaff.email}}', description: 'Assigned staff email', category: 'Staff' },
    ];

    const appointment = [
      { path: '{{appointment.startTime}}', description: 'Appointment start time', category: 'Appointment' },
      { path: '{{appointment.endTime}}', description: 'Appointment end time', category: 'Appointment' },
      { path: '{{appointment.duration}}', description: 'Appointment duration (minutes)', category: 'Appointment' },
      { path: '{{appointment.type}}', description: 'Appointment type', category: 'Appointment' },
      { path: '{{appointment.title}}', description: 'Appointment title', category: 'Appointment' },
    ];

    const payment = [
      { path: '{{payment.amount}}', description: 'Payment amount', category: 'Payment' },
      { path: '{{payment.currency}}', description: 'Payment currency', category: 'Payment' },
      { path: '{{payment.status}}', description: 'Payment status', category: 'Payment' },
      { path: '{{payment.transactionId}}', description: 'Transaction ID', category: 'Payment' },
    ];

    let allVars = [...general, ...coach];
    
    if (triggerEvent && triggerEvent.includes('lead')) {
      allVars = [...allVars, ...lead, ...staff];
    }
    if (triggerEvent && triggerEvent.includes('appointment')) {
      allVars = [...allVars, ...appointment];
    }
    if (triggerEvent && triggerEvent.includes('payment')) {
      allVars = [...allVars, ...payment];
    }

    return allVars;
  };

  const variables = getAllVariables();
  const filteredVars = searchTerm
    ? variables.filter(v => 
        v.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : variables;

  const groupedVars = filteredVars.reduce((acc, v) => {
    if (!acc[v.category]) acc[v.category] = [];
    acc[v.category].push(v);
    return acc;
  }, {});

  const handleInsert = (variable) => {
    if (onInsert) {
      onInsert(variable);
    }
  };

  return (
    <PopoverContent
      w="500px"
      maxH="600px"
      borderRadius="xl"
      boxShadow="xl"
      border="1px"
      borderColor="gray.200"
      _focus={{ boxShadow: 'xl' }}
    >
      <PopoverArrow />
      <PopoverHeader
        borderBottom="1px"
        borderColor="gray.100"
        pb={3}
        pt={4}
        px={4}
      >
        <VStack align="stretch" spacing={2}>
          <Text fontSize="sm" fontWeight="600" color="gray.800">
            Available Variables
          </Text>
          <InputGroup size="sm">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search variables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="gray.50"
              borderColor="gray.200"
              _focus={{ bg: 'white', borderColor: 'blue.300' }}
            />
          </InputGroup>
        </VStack>
      </PopoverHeader>
      <PopoverBody p={0} maxH="500px" overflowY="auto">
        <VStack align="stretch" spacing={0} divider={<Divider />}>
          {Object.entries(groupedVars).map(([category, vars]) => (
            <Box key={category}>
              <Box
                px={4}
                py={2}
                bg="gray.50"
                borderBottom="1px"
                borderColor="gray.100"
              >
                <Text fontSize="xs" fontWeight="600" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                  {category}
                </Text>
              </Box>
              <VStack align="stretch" spacing={0}>
                {vars.map((v, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    size="sm"
                    justifyContent="flex-start"
                    borderRadius="none"
                    px={4}
                    py={3}
                    h="auto"
                    onClick={() => handleInsert(v.path)}
                    _hover={{ bg: 'blue.50' }}
                    _active={{ bg: 'blue.100' }}
                  >
                    <HStack spacing={3} align="start" w="100%">
                      <Code
                        fontSize="xs"
                        color="blue.600"
                        bg="blue.50"
                        px={2}
                        py={1}
                        borderRadius="md"
                        fontWeight="600"
                      >
                        {v.path}
                      </Code>
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="xs" color="gray.700" fontWeight="500">
                          {v.description}
                        </Text>
                      </VStack>
                    </HStack>
                  </Button>
                ))}
              </VStack>
            </Box>
          ))}
        </VStack>
        {filteredVars.length === 0 && (
          <Box p={4} textAlign="center">
            <Text fontSize="sm" color="gray.500">
              No variables found
            </Text>
          </Box>
        )}
      </PopoverBody>
    </PopoverContent>
  );
};

// Node Configuration Panel Component
const NodeConfigurationPanel = ({ node, onUpdate, onDelete, builderResources, allNodes, onClose }) => {
  const [config, setConfig] = useState(node.data.config || {});
  const [label, setLabel] = useState(node.data.label || '');
  const [sequenceSteps, setSequenceSteps] = useState(node.data.sequenceSteps || []);

  useEffect(() => {
    setConfig(node.data.config || {});
    setLabel(node.data.label || '');
    setSequenceSteps(node.data.sequenceSteps || []);
  }, [node]);

  // Find trigger node to get trigger event
  const triggerNode = allNodes?.find(n => n.type === 'trigger');
  const triggerEvent = triggerNode?.data?.nodeType || '';

  const handleSave = () => {
    const finalLabel = label.trim() || node.data.label || node.data.nodeType || 'Node';
    const payload = { label: finalLabel, config };
    if (node.type === 'sequence') {
      payload.sequenceSteps = sequenceSteps;
    }
    onUpdate(payload);
    // Close drawer after saving
    if (onClose) {
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  const renderConfigFields = () => {
    const nodeType = node.data.nodeType;
    
    switch (node.type) {
      case 'trigger':
        return (
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Trigger Event</FormLabel>
              <Text fontSize="sm" color="gray.600">
                {nodeType}
              </Text>
            </FormControl>
          </VStack>
        );

      case 'action':
        return (
          <ActionConfigFields
            actionType={nodeType}
            config={config}
            onChange={setConfig}
            builderResources={builderResources}
            triggerEvent={triggerEvent}
          />
        );

      case 'delay':
        return (
          <VStack spacing={5} align="stretch">
            <SimpleGrid columns={3} spacing={4}>
            <FormControl>
                <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                  Hours
                </FormLabel>
              <NumberInput
                  value={config.delayHours || 0}
                  onChange={(value) => setConfig({ ...config, delayHours: parseInt(value) || 0 })}
                min={0}
              >
                  <NumberInputField
                    bg="white"
                    borderColor="gray.200"
                    _hover={{ borderColor: 'gray.300' }}
                    _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                    borderRadius="md"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
              </NumberInput>
            </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                  Minutes
                </FormLabel>
                <NumberInput
                  value={config.delayMinutes || 0}
                  onChange={(value) => setConfig({ ...config, delayMinutes: parseInt(value) || 0 })}
                  min={0}
                  max={59}
                >
                  <NumberInputField
                    bg="white"
                    borderColor="gray.200"
                    _hover={{ borderColor: 'gray.300' }}
                    _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                    borderRadius="md"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                  Seconds
                </FormLabel>
                <NumberInput
                  value={config.delaySeconds || 0}
                  onChange={(value) => setConfig({ ...config, delaySeconds: parseInt(value) || 0 })}
                  min={0}
                  max={59}
                >
                  <NumberInputField
                    bg="white"
                    borderColor="gray.200"
                    _hover={{ borderColor: 'gray.300' }}
                    _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                    borderRadius="md"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>
            <FormHelperText fontSize="xs" color="gray.500">
              The workflow will wait for the specified duration before proceeding to the next node
            </FormHelperText>
          </VStack>
        );

      case 'condition':
        return (
          <VStack spacing={4} align="stretch">
            <Alert status="info">
              <AlertIcon />
              Condition configuration coming soon
            </Alert>
          </VStack>
        );

      case 'sequence':
        return (
          <VStack spacing={4} align="stretch">
            <MessageSequenceBuilder
              sequences={sequenceSteps}
              onChange={setSequenceSteps}
            />
          </VStack>
        );

      default:
        return null;
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Node Label Section */}
      <Box>
      <FormControl>
          <FormLabel fontSize="sm" fontWeight="600" color="gray.700" mb={2}>
            Node Label
          </FormLabel>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
            placeholder="Enter a descriptive label for this node"
            bg="white"
            borderColor="gray.200"
            _hover={{ borderColor: 'gray.300' }}
            _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
            borderRadius="md"
          />
          <FormHelperText fontSize="xs" color="gray.500" mt={1}>
            This label will be displayed on the node in the workflow
          </FormHelperText>
      </FormControl>
      </Box>

      <Divider borderColor="gray.200" />

      {/* Configuration Fields */}
      <Box>
        <Text fontSize="sm" fontWeight="600" color="gray.700" mb={4}>
          Configuration
        </Text>
      {renderConfigFields()}
      </Box>

      <Divider borderColor="gray.200" />

      {/* Action Buttons */}
      <HStack spacing={3} pt={2}>
        <Button
          leftIcon={<FiTrash2 />}
          colorScheme="red"
          variant="ghost"
          onClick={onDelete}
          flex={1}
          fontWeight="500"
          borderRadius="md"
        >
          Delete
        </Button>
        <Button
          leftIcon={<FiCheck />}
          colorScheme="blue"
          onClick={handleSave}
          flex={1}
          fontWeight="500"
          borderRadius="md"
          boxShadow="sm"
        >
          Save Changes
        </Button>
              {/* Delete icon removed: use the primary Delete button above which calls onDelete */}
      </HStack>
    </VStack>
  );
};

// Action Configuration Fields Component
const ActionConfigFields = ({ actionType, config, onChange, builderResources, triggerEvent }) => {
  const [activeVariableField, setActiveVariableField] = useState(null);

  const updateField = (field, value) => {
    onChange({ ...config, [field]: value });
  };

  const insertVariable = (variable, fieldName) => {
    const currentValue = config[fieldName] || '';
    const input = document.getElementById(`action-config-${fieldName}`);
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue = currentValue.substring(0, start) + variable + currentValue.substring(end);
      updateField(fieldName, newValue);
      setTimeout(() => {
        input.focus();
        const newPos = start + variable.length;
        input.setSelectionRange(newPos, newPos);
      }, 0);
    } else {
      updateField(fieldName, currentValue + variable);
    }
    setActiveVariableField(null);
  };

  // Variable Input Field Component
  const VariableInput = ({ fieldName, value, onChange, placeholder, type = 'input', rows = 4, ...props }) => {
    const isTextarea = type === 'textarea';
    const InputComponent = isTextarea ? Textarea : Input;
    
    return (
      <FormControl>
        <HStack spacing={2} align="center" mb={2}>
          <FormLabel fontSize="sm" fontWeight="600" color="gray.700" mb={0} flex={1}>
            {props.label || fieldName}
          </FormLabel>
          <Popover
            isOpen={activeVariableField === fieldName}
            onOpen={() => setActiveVariableField(fieldName)}
            onClose={() => setActiveVariableField(null)}
            placement="left"
            closeOnBlur={true}
            trapFocus={false}
            autoFocus={false}
            returnFocusOnClose={false}
          >
            <PopoverTrigger>
              <IconButton
                icon={<FiInfo />}
                size="sm"
                variant="ghost"
                colorScheme="blue"
                aria-label="Show variables"
                borderRadius="md"
                _hover={{ bg: 'blue.50', color: 'blue.600' }}
              />
            </PopoverTrigger>
            <VariableTooltip
              triggerEvent={triggerEvent}
              onInsert={(variable) => insertVariable(variable, fieldName)}
              fieldName={fieldName}
            />
          </Popover>
        </HStack>
        <InputComponent
          id={`action-config-${fieldName}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          bg="white"
          borderColor="gray.200"
          _hover={{ borderColor: 'gray.300' }}
          _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
          borderRadius="md"
          rows={isTextarea ? rows : undefined}
          fontSize="sm"
          {...props}
        />
        {props.helperText && (
          <FormHelperText fontSize="xs" color="gray.500" mt={1}>
            {props.helperText}
          </FormHelperText>
        )}
      </FormControl>
    );
  };

  switch (actionType) {
    case 'add_note_to_lead':
      return (
        <VStack spacing={5} align="stretch">
          <VariableInput
            fieldName="note"
            label="Note Content"
              value={config.note || ''}
            onChange={(value) => updateField('note', value)}
            placeholder="Enter note content. Use variables for dynamic values"
            type="textarea"
            rows={6}
            helperText="This note will be added to the lead's activity timeline"
          />
          <SimpleGrid columns={2} spacing={4}>
          <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Note Type
              </FormLabel>
            <Select
              value={config.noteType || 'general'}
              onChange={(e) => updateField('noteType', e.target.value)}
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                borderRadius="md"
            >
              <option value="general">General</option>
              <option value="call">Call</option>
              <option value="meeting">Meeting</option>
              <option value="followup">Follow-up</option>
              <option value="important">Important</option>
                <option value="reminder">Reminder</option>
                <option value="internal">Internal</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Visibility
              </FormLabel>
              <Select
                value={config.visibility || 'all'}
                onChange={(e) => updateField('visibility', e.target.value)}
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                borderRadius="md"
              >
                <option value="all">All Staff</option>
                <option value="coach">Coach Only</option>
                <option value="assigned">Assigned Staff Only</option>
              </Select>
            </FormControl>
          </SimpleGrid>
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
              Priority
            </FormLabel>
            <Select
              value={config.priority || 'normal'}
              onChange={(e) => updateField('priority', e.target.value)}
              bg="white"
              borderColor="gray.200"
              _hover={{ borderColor: 'gray.300' }}
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
              borderRadius="md"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </FormControl>
        </VStack>
      );

    case 'create_task':
      return (
        <VStack spacing={5} align="stretch">
          <VariableInput
            fieldName="name"
            label="Task Name"
              value={config.name || ''}
            onChange={(value) => updateField('name', value)}
              placeholder="e.g., Follow up with {{lead.name}}"
            helperText="A clear, descriptive name for the task"
          />
          <VariableInput
            fieldName="description"
            label="Task Description"
              value={config.description || ''}
            onChange={(value) => updateField('description', value)}
            placeholder="Detailed description of what needs to be done"
            type="textarea"
            rows={4}
            helperText="Provide context and any specific instructions"
          />
          <SimpleGrid columns={2} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Priority
              </FormLabel>
              <Select
                value={config.priority || 'MEDIUM'}
                onChange={(e) => updateField('priority', e.target.value)}
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                borderRadius="md"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Stage
              </FormLabel>
              <Select
                value={config.stage || 'LEAD_GENERATION'}
                onChange={(e) => updateField('stage', e.target.value)}
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                borderRadius="md"
              >
                <option value="LEAD_GENERATION">Lead Generation</option>
                <option value="LEAD_QUALIFICATION">Lead Qualification</option>
                <option value="PROPOSAL">Proposal</option>
                <option value="CLOSING">Closing</option>
                <option value="ONBOARDING">Onboarding</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="CUSTOMER_SUCCESS">Customer Success</option>
              </Select>
            </FormControl>
          </SimpleGrid>
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
              Assign To
            </FormLabel>
            <Select
              value={config.assignedTo || ''}
              onChange={(e) => updateField('assignedTo', e.target.value)}
              placeholder="Select staff (optional, defaults to coach)"
              bg="white"
              borderColor="gray.200"
              _hover={{ borderColor: 'gray.300' }}
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
              borderRadius="md"
            >
              <option value="">Coach (Me)</option>
              {(builderResources?.staff || []).map(staff => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                </option>
              ))}
            </Select>
            <FormHelperText fontSize="xs" color="gray.500" mt={1}>
              Leave empty to assign to the coach
            </FormHelperText>
          </FormControl>
          <SimpleGrid columns={2} spacing={4}>
          <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Due Date Offset (days)
              </FormLabel>
            <NumberInput
              value={config.dueDateOffset || 7}
              onChange={(value) => updateField('dueDateOffset', parseInt(value) || 7)}
              min={0}
            >
                <NumberInputField
                  bg="white"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'gray.300' }}
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                  borderRadius="md"
                />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
              <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                Days from trigger event
              </FormHelperText>
          </FormControl>
          <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Estimated Hours
              </FormLabel>
            <NumberInput
              value={config.estimatedHours || 1}
              onChange={(value) => updateField('estimatedHours', parseFloat(value) || 1)}
              min={0.5}
              step={0.5}
            >
                <NumberInputField
                  bg="white"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'gray.300' }}
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                  borderRadius="md"
                />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
              <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                Time estimate for completion
              </FormHelperText>
          </FormControl>
          </SimpleGrid>
        </VStack>
      );

    case 'send_whatsapp_message':
    case 'send_sms_message':
      return (
        <VStack spacing={5} align="stretch">
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
              Message Template
            </FormLabel>
            <Select
              value={config.templateId || ''}
              onChange={(e) => updateField('templateId', e.target.value)}
              placeholder="Select template (optional)"
              bg="white"
              borderColor="gray.200"
              _hover={{ borderColor: 'gray.300' }}
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
              borderRadius="md"
            >
              <option value="">Custom Message</option>
              {(builderResources?.messageTemplates || [])
                .filter(t => t.type === (actionType === 'send_whatsapp_message' ? 'whatsapp' : 'sms'))
                .map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
            </Select>
            <FormHelperText fontSize="xs" color="gray.500" mt={1}>
              Using a template ensures compliance with messaging platform requirements
            </FormHelperText>
          </FormControl>
          <VariableInput
            fieldName="message"
            label="Message Content"
            value={config.message || ''}
            onChange={(value) => updateField('message', value)}
            placeholder="Enter your message. Use variables for personalization"
            type="textarea"
            rows={8}
            helperText={`Max ${actionType === 'send_whatsapp_message' ? '4096' : '1600'} characters`}
          />
          <SimpleGrid columns={2} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Phone Number
            </FormLabel>
              <Input
                value={config.phoneNumber || '{{lead.phone}}'}
                onChange={(e) => updateField('phoneNumber', e.target.value)}
                placeholder="{{lead.phone}}"
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                borderRadius="md"
              />
          </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Country Code
              </FormLabel>
              <Input
                value={config.countryCode || '{{lead.countryCode}}'}
                onChange={(e) => updateField('countryCode', e.target.value)}
                placeholder="{{lead.countryCode}}"
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                borderRadius="md"
              />
            </FormControl>
          </SimpleGrid>
          {actionType === 'send_whatsapp_message' && (
            <>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                  Media URL (Optional)
                </FormLabel>
                <Input
                  value={config.mediaUrl || ''}
                  onChange={(e) => updateField('mediaUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  bg="white"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'gray.300' }}
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                  borderRadius="md"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                  Media Type
                </FormLabel>
                <Select
                  value={config.mediaType || 'none'}
                  onChange={(e) => updateField('mediaType', e.target.value)}
                  bg="white"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'gray.300' }}
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                  borderRadius="md"
                >
                  <option value="none">No Media</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="audio">Audio</option>
                </Select>
              </FormControl>
            </>
          )}
        </VStack>
      );

    case 'send_email_message':
      return (
        <VStack spacing={5} align="stretch">
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
              Email Template
            </FormLabel>
            <Select
              value={config.templateId || ''}
              onChange={(e) => updateField('templateId', e.target.value)}
              placeholder="Select template (optional)"
              bg="white"
              borderColor="gray.200"
              _hover={{ borderColor: 'gray.300' }}
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
              borderRadius="md"
            >
              <option value="">Custom Email</option>
              {(builderResources?.messageTemplates || [])
                .filter(t => t.type === 'email')
                .map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
            </Select>
            <FormHelperText fontSize="xs" color="gray.500" mt={1}>
              Templates ensure consistent branding and formatting
            </FormHelperText>
          </FormControl>
          <SimpleGrid columns={2} spacing={4}>
            <VariableInput
              fieldName="to"
              label="Recipient Email"
              value={config.to || '{{lead.email}}'}
              onChange={(value) => updateField('to', value)}
              placeholder="{{lead.email}}"
              helperText="Email address of the recipient"
            />
            <VariableInput
              fieldName="subject"
              label="Subject Line"
              value={config.subject || ''}
              onChange={(value) => updateField('subject', value)}
              placeholder="Email subject line"
              helperText="Keep it concise and engaging"
            />
          </SimpleGrid>
          <VariableInput
            fieldName="body"
            label="Email Body"
            value={config.body || ''}
            onChange={(value) => updateField('body', value)}
            placeholder="Enter email body. HTML is supported"
            type="textarea"
            rows={10}
            helperText="You can use HTML formatting. Max 100KB"
          />
          <SimpleGrid columns={2} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                From Name
              </FormLabel>
              <Input
                value={config.fromName || '{{coach.name}}'}
                onChange={(e) => updateField('fromName', e.target.value)}
                placeholder="{{coach.name}}"
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                borderRadius="md"
            />
          </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                From Email
              </FormLabel>
              <Input
                value={config.fromEmail || '{{coach.email}}'}
                onChange={(e) => updateField('fromEmail', e.target.value)}
                placeholder="{{coach.email}}"
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                borderRadius="md"
              />
            </FormControl>
          </SimpleGrid>
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
              Reply-To Email
            </FormLabel>
            <Input
              value={config.replyTo || ''}
              onChange={(e) => updateField('replyTo', e.target.value)}
              placeholder="support@example.com"
              bg="white"
              borderColor="gray.200"
              _hover={{ borderColor: 'gray.300' }}
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
              borderRadius="md"
            />
          </FormControl>
        </VStack>
      );

    case 'assign_lead_to_staff':
      return (
        <FormControl isRequired>
          <FormLabel>Assign To Staff</FormLabel>
          <Select
            value={config.staffId || ''}
            onChange={(e) => updateField('staffId', e.target.value)}
            placeholder="Select staff member"
          >
            {(builderResources?.staff || []).map(staff => (
              <option key={staff.id} value={staff.id}>
                {staff.name}
              </option>
            ))}
          </Select>
        </FormControl>
      );

    case 'update_lead_status':
      return (
        <FormControl isRequired>
          <FormLabel>New Status</FormLabel>
          <Select
            value={config.status || ''}
            onChange={(e) => updateField('status', e.target.value)}
            placeholder="Select status"
          >
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Closed">Closed</option>
            <option value="Lost">Lost</option>
          </Select>
        </FormControl>
      );

    case 'add_lead_tag':
      return (
        <FormControl isRequired>
          <FormLabel>Tag Name</FormLabel>
          <Input
            value={config.tag || ''}
            onChange={(e) => updateField('tag', e.target.value)}
            placeholder="Enter tag name"
          />
        </FormControl>
      );

    case 'update_lead_score':
      return (
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Score</FormLabel>
            <NumberInput
              value={config.score || 0}
              onChange={(value) => updateField('score', parseInt(value) || 0)}
              min={0}
              max={100}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          <FormControl>
            <FormLabel>Reason</FormLabel>
            <Input
              value={config.reason || ''}
              onChange={(e) => updateField('reason', e.target.value)}
              placeholder="Reason for score update"
            />
          </FormControl>
        </VStack>
      );

    case 'add_to_funnel':
    case 'move_to_funnel_stage':
      return (
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Funnel</FormLabel>
            <Select
              value={config.funnelId || ''}
              onChange={(e) => {
                updateField('funnelId', e.target.value);
                updateField('stageId', ''); // Reset stage when funnel changes
              }}
              placeholder="Select funnel"
            >
              {(builderResources?.funnels || []).map(funnel => (
                <option key={funnel.id} value={funnel.id}>
                  {funnel.name}
                </option>
              ))}
            </Select>
          </FormControl>
          {config.funnelId && (
            <FormControl isRequired>
              <FormLabel>Stage</FormLabel>
              <Select
                value={config.stageId || ''}
                onChange={(e) => updateField('stageId', e.target.value)}
                placeholder="Select stage"
              >
                {(builderResources?.funnels || [])
                  .find(f => f.id === config.funnelId)
                  ?.stages?.map(stage => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
              </Select>
            </FormControl>
          )}
        </VStack>
      );

    case 'wait_delay':
      return (
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Delay (Days)</FormLabel>
            <NumberInput
              value={config.delayDays || 0}
              onChange={(value) => updateField('delayDays', parseInt(value) || 0)}
              min={0}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          <FormControl>
            <FormLabel>Delay (Hours)</FormLabel>
            <NumberInput
              value={config.delayHours || 0}
              onChange={(value) => updateField('delayHours', parseInt(value) || 0)}
              min={0}
              max={23}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          <FormControl>
            <FormLabel>Delay (Minutes)</FormLabel>
            <NumberInput
              value={config.delayMinutes || 0}
              onChange={(value) => updateField('delayMinutes', parseInt(value) || 0)}
              min={0}
              max={59}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </VStack>
      );

    case 'remove_lead_tag':
      return (
        <FormControl isRequired>
          <FormLabel>Tag Name</FormLabel>
          <Input
            value={config.tag || ''}
            onChange={(e) => updateField('tag', e.target.value)}
            placeholder="Enter tag name to remove"
          />
        </FormControl>
      );

    case 'remove_from_funnel':
      return (
        <FormControl isRequired>
          <FormLabel>Funnel</FormLabel>
          <Select
            value={config.funnelId || ''}
            onChange={(e) => updateField('funnelId', e.target.value)}
            placeholder="Select funnel"
          >
            {(builderResources?.funnels || []).map(funnel => (
              <option key={funnel.id} value={funnel.id}>
                {funnel.name}
              </option>
            ))}
          </Select>
        </FormControl>
      );

    case 'update_lead_field':
      return (
        <VStack spacing={5} align="stretch">
          <FormControl isRequired>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
              Field Name
            </FormLabel>
            <Select
              value={config.field || ''}
              onChange={(e) => updateField('field', e.target.value)}
              placeholder="Select field to update"
              bg="white"
              borderColor="gray.200"
              _hover={{ borderColor: 'gray.300' }}
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
              borderRadius="md"
            >
              <option value="status">Status</option>
              <option value="temperature">Temperature</option>
              <option value="source">Source</option>
              <option value="score">Score</option>
              <option value="custom">Custom Field</option>
            </Select>
            <FormHelperText fontSize="xs" color="gray.500" mt={1}>
              Select the lead field you want to update
            </FormHelperText>
          </FormControl>
          {config.field === 'custom' && (
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Custom Field Name
              </FormLabel>
              <Input
                value={config.customFieldName || ''}
                onChange={(e) => updateField('customFieldName', e.target.value)}
                placeholder="Enter custom field name"
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                borderRadius="md"
              />
            </FormControl>
          )}
          <VariableInput
            fieldName="value"
            label="Field Value"
            value={config.value || ''}
            onChange={(value) => updateField('value', value)}
            placeholder="Enter the new value"
            helperText="Use variables for dynamic values"
          />
        </VStack>
      );

    case 'create_deal':
      return (
        <VStack spacing={5} align="stretch">
          <VariableInput
            fieldName="dealName"
            label="Deal Name"
            value={config.dealName || ''}
            onChange={(value) => updateField('dealName', value)}
            placeholder="e.g., Deal with {{lead.name}}"
            helperText="A descriptive name for this deal"
          />
          <SimpleGrid columns={2} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Amount
              </FormLabel>
              <NumberInput
                value={config.amount || 0}
                onChange={(value) => updateField('amount', parseFloat(value) || 0)}
                min={0}
              >
                <NumberInputField
                  bg="white"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'gray.300' }}
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                  borderRadius="md"
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Currency
              </FormLabel>
              <Select
                value={config.currency || 'USD'}
                onChange={(e) => updateField('currency', e.target.value)}
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                borderRadius="md"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </Select>
            </FormControl>
          </SimpleGrid>
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
              Stage
            </FormLabel>
            <Select
              value={config.stage || 'prospecting'}
              onChange={(e) => updateField('stage', e.target.value)}
              bg="white"
              borderColor="gray.200"
              _hover={{ borderColor: 'gray.300' }}
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
              borderRadius="md"
            >
              <option value="prospecting">Prospecting</option>
              <option value="qualification">Qualification</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed-won">Closed Won</option>
              <option value="closed-lost">Closed Lost</option>
            </Select>
          </FormControl>
          <VariableInput
            fieldName="description"
            label="Deal Description"
            value={config.description || ''}
            onChange={(value) => updateField('description', value)}
            placeholder="Additional details about the deal"
            type="textarea"
            rows={4}
            helperText="Optional description or notes"
          />
        </VStack>
      );

    case 'send_internal_notification':
      return (
        <VStack spacing={5} align="stretch">
          <VariableInput
            fieldName="message"
            label="Notification Message"
            value={config.message || ''}
            onChange={(value) => updateField('message', value)}
            placeholder="Enter notification message"
            type="textarea"
            rows={5}
            helperText="This notification will be sent to selected recipients"
          />
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
              Recipients
            </FormLabel>
            <Select
              value={config.recipients || 'all'}
              onChange={(e) => updateField('recipients', e.target.value)}
              bg="white"
              borderColor="gray.200"
              _hover={{ borderColor: 'gray.300' }}
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
              borderRadius="md"
            >
              <option value="self">Send to Self (Coach) - For Testing</option>
              <option value="all">All Staff</option>
              <option value="coach">Coach Only</option>
              <option value="assigned">Assigned Staff Only</option>
              {(builderResources?.staff || []).map(staff => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                </option>
              ))}
            </Select>
            <FormHelperText fontSize="xs" color="gray.500" mt={1}>
              Select who should receive this notification. Use "Send to Self" to test the notification system.
            </FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
              Notification Type
            </FormLabel>
            <Select
              value={config.notificationType || 'info'}
              onChange={(e) => updateField('notificationType', e.target.value)}
              bg="white"
              borderColor="gray.200"
              _hover={{ borderColor: 'gray.300' }}
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
              borderRadius="md"
            >
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </Select>
          </FormControl>
        </VStack>
      );

    case 'send_push_notification':
      return (
        <VStack spacing={5} align="stretch">
          <VariableInput
            fieldName="title"
            label="Notification Title"
            value={config.title || ''}
            onChange={(value) => updateField('title', value)}
            placeholder="Enter notification title"
            helperText="Keep it short and attention-grabbing (max 50 chars)"
          />
          <VariableInput
            fieldName="body"
            label="Notification Body"
            value={config.body || ''}
            onChange={(value) => updateField('body', value)}
            placeholder="Enter notification message"
            type="textarea"
            rows={5}
            helperText="Main message content (max 200 chars)"
          />
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
              Priority
            </FormLabel>
            <Select
              value={config.priority || 'normal'}
              onChange={(e) => updateField('priority', e.target.value)}
              bg="white"
              borderColor="gray.200"
              _hover={{ borderColor: 'gray.300' }}
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
              borderRadius="md"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </Select>
          </FormControl>
        </VStack>
      );

    case 'schedule_drip_sequence':
      return (
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Sequence ID</FormLabel>
            <Input
              value={config.sequenceId || ''}
              onChange={(e) => updateField('sequenceId', e.target.value)}
              placeholder="Enter sequence ID"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Delay (hours)</FormLabel>
            <NumberInput
              value={config.delay || 0}
              onChange={(value) => updateField('delay', parseInt(value) || 0)}
              min={0}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </VStack>
      );

    case 'create_multiple_tasks':
      return (
        <Alert status="info">
          <AlertIcon />
          Multiple task creation configuration coming soon. For now, use the single task action.
        </Alert>
      );

    case 'create_calendar_event':
      return (
        <VStack spacing={5} align="stretch">
          <VariableInput
            fieldName="title"
            label="Event Title"
            value={config.title || ''}
            onChange={(value) => updateField('title', value)}
            placeholder="e.g., Meeting with {{lead.name}}"
            helperText="A clear title for the calendar event"
          />
          <SimpleGrid columns={2} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Start Time Offset (hours)
              </FormLabel>
              <NumberInput
                value={config.startTimeOffset || 0}
                onChange={(value) => updateField('startTimeOffset', parseInt(value) || 0)}
                min={0}
              >
                <NumberInputField
                  bg="white"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'gray.300' }}
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                  borderRadius="md"
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                Hours from trigger
              </FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Duration (minutes)
              </FormLabel>
              <NumberInput
                value={config.duration || 60}
                onChange={(value) => updateField('duration', parseInt(value) || 60)}
                min={15}
                step={15}
              >
                <NumberInputField
                  bg="white"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'gray.300' }}
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                  borderRadius="md"
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </SimpleGrid>
          <VariableInput
            fieldName="description"
            label="Event Description"
            value={config.description || ''}
            onChange={(value) => updateField('description', value)}
            placeholder="Additional details about the event"
            type="textarea"
            rows={4}
            helperText="Optional description for the calendar event"
          />
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
              Location
            </FormLabel>
            <Input
              value={config.location || ''}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="Meeting location or video link"
              bg="white"
              borderColor="gray.200"
              _hover={{ borderColor: 'gray.300' }}
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
              borderRadius="md"
            />
          </FormControl>
        </VStack>
      );

    case 'add_followup_date':
      return (
        <VStack spacing={5} align="stretch">
          <SimpleGrid columns={2} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Follow-up Date Offset (days)
              </FormLabel>
              <NumberInput
                value={config.followupDateOffset || 7}
                onChange={(value) => updateField('followupDateOffset', parseInt(value) || 7)}
                min={0}
              >
                <NumberInputField
                  bg="white"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'gray.300' }}
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                  borderRadius="md"
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                Days from trigger event
              </FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Time of Day
              </FormLabel>
              <Select
                value={config.timeOfDay || '09:00'}
                onChange={(e) => updateField('timeOfDay', e.target.value)}
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                borderRadius="md"
              >
                <option value="09:00">9:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="14:00">2:00 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="16:00">4:00 PM</option>
                <option value="17:00">5:00 PM</option>
              </Select>
            </FormControl>
          </SimpleGrid>
          <VariableInput
            fieldName="notes"
            label="Follow-up Notes"
            value={config.notes || ''}
            onChange={(value) => updateField('notes', value)}
            placeholder="Notes or context for the follow-up"
            type="textarea"
            rows={4}
            helperText="These notes will be associated with the follow-up date"
          />
        </VStack>
      );

    case 'create_zoom_meeting':
      return (
        <VStack spacing={5} align="stretch">
          <VariableInput
            fieldName="topic"
            label="Meeting Topic"
            value={config.topic || ''}
            onChange={(value) => updateField('topic', value)}
            placeholder="e.g., Consultation with {{lead.name}}"
            helperText="A clear topic for the Zoom meeting"
          />
          <SimpleGrid columns={2} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Start Time Offset (hours)
              </FormLabel>
              <NumberInput
                value={config.startTimeOffset || 0}
                onChange={(value) => updateField('startTimeOffset', parseInt(value) || 0)}
                min={0}
              >
                <NumberInputField
                  bg="white"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'gray.300' }}
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                  borderRadius="md"
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                Hours from trigger
              </FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Duration (minutes)
              </FormLabel>
              <NumberInput
                value={config.duration || 60}
                onChange={(value) => updateField('duration', parseInt(value) || 60)}
                min={15}
                step={15}
              >
                <NumberInputField
                  bg="white"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'gray.300' }}
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                  borderRadius="md"
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </SimpleGrid>
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
              Meeting Password (optional)
            </FormLabel>
            <Input
              value={config.password || ''}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="Leave empty for no password"
              type="password"
              bg="white"
              borderColor="gray.200"
              _hover={{ borderColor: 'gray.300' }}
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
              borderRadius="md"
            />
          </FormControl>
        </VStack>
      );

    case 'create_invoice':
      return (
        <VStack spacing={5} align="stretch">
          <SimpleGrid columns={2} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Amount
              </FormLabel>
              <NumberInput
                value={config.amount || 0}
                onChange={(value) => updateField('amount', parseFloat(value) || 0)}
                min={0}
                precision={2}
              >
                <NumberInputField
                  bg="white"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'gray.300' }}
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                  borderRadius="md"
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Currency
              </FormLabel>
              <Select
                value={config.currency || 'USD'}
                onChange={(e) => updateField('currency', e.target.value)}
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                borderRadius="md"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </Select>
            </FormControl>
          </SimpleGrid>
          <VariableInput
            fieldName="description"
            label="Invoice Description"
            value={config.description || ''}
            onChange={(value) => updateField('description', value)}
            placeholder="Description of services or products"
            type="textarea"
            rows={4}
            helperText="Detailed description of what the invoice is for"
          />
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
              Due Date Offset (days)
            </FormLabel>
            <NumberInput
              value={config.dueDateOffset || 30}
              onChange={(value) => updateField('dueDateOffset', parseInt(value) || 30)}
              min={0}
            >
              <NumberInputField
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                borderRadius="md"
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormHelperText fontSize="xs" color="gray.500" mt={1}>
              Days from invoice creation
            </FormHelperText>
          </FormControl>
        </VStack>
      );

    case 'issue_refund':
      return (
        <VStack spacing={5} align="stretch">
          <SimpleGrid columns={2} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Amount
              </FormLabel>
              <NumberInput
                value={config.amount || 0}
                onChange={(value) => updateField('amount', parseFloat(value) || 0)}
                min={0}
                precision={2}
              >
                <NumberInputField
                  bg="white"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'gray.300' }}
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                  borderRadius="md"
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Currency
              </FormLabel>
              <Select
                value={config.currency || 'USD'}
                onChange={(e) => updateField('currency', e.target.value)}
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                borderRadius="md"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </Select>
            </FormControl>
          </SimpleGrid>
          <VariableInput
            fieldName="reason"
            label="Refund Reason"
            value={config.reason || ''}
            onChange={(value) => updateField('reason', value)}
            placeholder="Reason for issuing the refund"
            type="textarea"
            rows={4}
            helperText="Document the reason for this refund"
          />
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
              Payment ID (optional)
            </FormLabel>
            <Input
              value={config.paymentId || ''}
              onChange={(e) => updateField('paymentId', e.target.value)}
              placeholder="Specific payment ID (leave empty for all)"
              bg="white"
              borderColor="gray.200"
              _hover={{ borderColor: 'gray.300' }}
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
              borderRadius="md"
            />
            <FormHelperText fontSize="xs" color="gray.500" mt={1}>
              Leave empty to refund all payments for this lead
            </FormHelperText>
          </FormControl>
        </VStack>
      );

    case 'call_webhook':
      return (
        <VStack spacing={5} align="stretch">
          <FormControl isRequired>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
              Webhook URL
            </FormLabel>
            <Input
              value={config.url || ''}
              onChange={(e) => updateField('url', e.target.value)}
              placeholder="https://example.com/webhook"
              bg="white"
              borderColor="gray.200"
              _hover={{ borderColor: 'gray.300' }}
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
              borderRadius="md"
            />
            <FormHelperText fontSize="xs" color="gray.500" mt={1}>
              The endpoint URL to send the webhook request to
            </FormHelperText>
          </FormControl>
          <SimpleGrid columns={2} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                HTTP Method
              </FormLabel>
              <Select
                value={config.method || 'POST'}
                onChange={(e) => updateField('method', e.target.value)}
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                borderRadius="md"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Timeout (seconds)
              </FormLabel>
              <NumberInput
                value={config.timeout || 30}
                onChange={(value) => updateField('timeout', parseInt(value) || 30)}
                min={5}
                max={300}
              >
                <NumberInputField
                  bg="white"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'gray.300' }}
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                  borderRadius="md"
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </SimpleGrid>
          <VariableInput
            fieldName="payload"
            label="Request Payload (JSON)"
            value={config.payload || ''}
            onChange={(value) => updateField('payload', value)}
            placeholder='{"key": "value", "leadName": "{{lead.name}}"}'
            type="textarea"
            rows={8}
            helperText="JSON payload. Use {{variables}} for dynamic values"
          />
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
              Headers (JSON)
            </FormLabel>
            <Textarea
              value={config.headers || '{"Content-Type": "application/json"}'}
              onChange={(e) => updateField('headers', e.target.value)}
              placeholder='{"Authorization": "Bearer token"}'
              rows={3}
              fontFamily="mono"
              fontSize="xs"
              bg="white"
              borderColor="gray.200"
              _hover={{ borderColor: 'gray.300' }}
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
              borderRadius="md"
            />
            <FormHelperText fontSize="xs" color="gray.500" mt={1}>
              Optional custom headers in JSON format
            </FormHelperText>
          </FormControl>
        </VStack>
      );

    case 'trigger_another_automation':
      return (
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Automation Rule</FormLabel>
            <Select
              value={config.automationRuleId || ''}
              onChange={(e) => updateField('automationRuleId', e.target.value)}
              placeholder="Select automation rule"
            >
              {(builderResources?.automationRules || []).map(rule => (
                <option key={rule.id} value={rule.id}>
                  {rule.name}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Delay (seconds)</FormLabel>
            <NumberInput
              value={config.delay || 0}
              onChange={(value) => updateField('delay', parseInt(value) || 0)}
              min={0}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </VStack>
      );

    default:
      return (
        <Alert status="info">
          <AlertIcon />
          Configuration for "{actionType}" will be available soon. The action will still execute with default settings.
        </Alert>
      );
  }
};

export default GraphAutomationBuilder;