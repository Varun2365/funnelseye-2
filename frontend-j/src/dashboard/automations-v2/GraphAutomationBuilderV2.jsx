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
  Panel,
  useOnSelectionChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  CircularProgress,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Checkbox,
  Radio,
  RadioGroup,
  Stack,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import {
  FiPlay,
  FiSave,
  FiTrash2,
  FiSettings,
  FiMessageSquare,
  FiMail,
  FiPhone,
  FiCalendar,
  FiClock,
  FiZap,
  FiGitBranch,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiInfo,
  FiPlus,
  FiEdit,
  FiCopy,
  FiMove,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiCode,
  FiDatabase,
  FiSend,
  FiUser,
  FiTarget,
  FiFilter,
  FiChevronDown,
  FiChevronRight,
  FiMaximize,
  FiMinimize,
  FiSearch,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';
import { getToken } from '../../utils/authUtils';
import { API_BASE_URL } from '../../config/apiConfig';

// API endpoint with /api prefix
const API_ENDPOINT = `${API_BASE_URL}/api`;

// Enhanced Node Types for V2
const nodeTypes = {
  trigger: 'trigger',
  action: 'action',
  condition: 'condition',
  delay: 'delay',
  messageValidation: 'messageValidation',
  replyHandler: 'replyHandler',
  end: 'end'
};

// Helper functions for icons
const getTriggerIcon = (eventValue) => {
  const eventStr = typeof eventValue === 'string' ? eventValue : eventValue.value || eventValue.label || '';
  const eventLower = eventStr.toLowerCase();

  if (eventLower.includes('lead')) {
    if (eventLower.includes('created')) return FiUser;
    if (eventLower.includes('updated')) return FiEdit;
    return FiUser;
  }
  if (eventLower.includes('appointment') || eventLower.includes('calendar')) return FiCalendar;
  if (eventLower.includes('payment')) return FiTarget;
  if (eventLower.includes('form') || eventLower.includes('submission')) return FiDatabase;
  if (eventLower.includes('email')) return FiMail;
  if (eventLower.includes('task')) return FiCheckCircle;
  if (eventLower.includes('message') || eventLower.includes('whatsapp')) return FiMessageSquare;

  return FiZap; // default
};

const getActionIcon = (actionValue) => {
  const actionStr = typeof actionValue === 'string' ? actionValue : actionValue.value || actionValue.label || '';
  const actionLower = actionStr.toLowerCase();

  if (actionLower.includes('email') || actionLower.includes('send_email')) return FiMail;
  if (actionLower.includes('whatsapp') || actionLower.includes('sms') || actionLower.includes('message')) return FiMessageSquare;
  if (actionLower.includes('task') || actionLower.includes('create_task')) return FiCheckCircle;
  if (actionLower.includes('calendar') || actionLower.includes('appointment')) return FiCalendar;
  if (actionLower.includes('tag') || actionLower.includes('update_lead')) return FiUser;
  if (actionLower.includes('webhook') || actionLower.includes('call_webhook')) return FiCode;
  if (actionLower.includes('delay') || actionLower.includes('wait')) return FiClock;
  if (actionLower.includes('notification')) return FiInfo;

  return FiSettings; // default
};

// Helper function to format labels from underscore-separated to proper English
const formatLabel = (label) => {
  if (!label || typeof label !== 'string') return label;

  return label
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .replace(/Lead/g, 'Lead')
    .replace(/Whatsapp/g, 'WhatsApp')
    .replace(/Sms/g, 'SMS')
    .replace(/Email/g, 'Email')
    .replace(/Webhook/g, 'Webhook')
    .replace(/Api/g, 'API')
    .replace(/Id/g, 'ID')
    .replace(/Url/g, 'URL');
};

// Custom Node Components
const TriggerNode = ({ data, selected }) => {
  return (
    <Card
      size="sm"
      bg={selected ? 'blue.50' : 'green.50'}
      border={selected ? '2px solid #3182ce' : '2px solid #38a169'}
      borderRadius="7px"
      minW="240px"
    >
      <CardBody p={4}>
        <VStack spacing={2} align="stretch">
          <HStack spacing={2}>
            <FiZap color="#38a169" />
            <Text fontWeight="bold" fontSize="sm">Trigger</Text>
            <Badge colorScheme="green" size="sm">{data.triggerEvent}</Badge>
          </HStack>
          <Text fontSize="xs" color="gray.600">{data.label}</Text>
          {data.conditions && data.conditions.length > 0 && (
            <Badge colorScheme="blue" size="sm" alignSelf="start">
              {data.conditions.length} condition{data.conditions.length > 1 ? 's' : ''}
            </Badge>
          )}
        </VStack>
      </CardBody>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#38a169', width: 8, height: 8 }}
      />
    </Card>
  );
};

const ActionNode = ({ data, selected }) => {
  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'send_whatsapp_message': return <FaWhatsapp color="#25d366" />;
      case 'send_email_message': return <FiMail color="#3182ce" />;
      case 'send_sms_message': return <FiPhone color="#805ad5" />;
      case 'create_task': return <FiCheckCircle color="#38a169" />;
      case 'wait_delay': return <FiClock color="#ed8936" />;
      case 'call_webhook': return <FiCode color="#805ad5" />;
      default: return <FiSettings color="#4a5568" />;
    }
  };

  return (
    <Card
      size="sm"
      bg={selected ? 'blue.50' : 'blue.50'}
      border={selected ? '2px solid #3182ce' : '2px solid #3182ce'}
      borderRadius="7px"
      minW="260px"
    >
      <CardBody p={4}>
        <VStack spacing={2} align="stretch">
          <HStack spacing={2}>
            {getActionIcon(data.actionType)}
            <Text fontWeight="bold" fontSize="sm">Action</Text>
          </HStack>
          <Text fontSize="xs">{data.label}</Text>
          {data.delay && (
            <Badge colorScheme="orange" size="sm" alignSelf="start">
              Delay: {data.delay}s
            </Badge>
          )}
        </VStack>
      </CardBody>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#3182ce', width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#3182ce', width: 8, height: 8 }}
      />
    </Card>
  );
};

const ConditionNode = ({ data, selected }) => {
  return (
    <Card
      size="sm"
      bg={selected ? 'yellow.100' : 'yellow.50'}
      border={selected ? '2px solid #d69e2e' : '2px solid #d69e2e'}
      borderRadius="7px"
      minW="280px"
    >
      <CardBody p={4}>
        <VStack spacing={2} align="stretch">
          <HStack spacing={2}>
            <FiGitBranch color="#d69e2e" />
            <Text fontWeight="bold" fontSize="sm">Condition</Text>
          </HStack>
          <Text fontSize="xs">{data.label}</Text>
          <HStack spacing={2} justify="center">
            <Badge colorScheme="green" size="sm">TRUE</Badge>
            <Badge colorScheme="red" size="sm">FALSE</Badge>
          </HStack>
          {data.conditionType && (
            <Badge colorScheme="purple" size="sm" alignSelf="center">
              {data.conditionType}
            </Badge>
          )}
        </VStack>
      </CardBody>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#d69e2e', width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{ background: '#38a169', width: 8, height: 8, top: '25%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ background: '#e53e3e', width: 8, height: 8, top: '75%' }}
      />
    </Card>
  );
};

const MessageValidationNode = ({ data, selected }) => {
  return (
    <Card
      size="sm"
      bg={selected ? 'purple.100' : 'purple.50'}
      border={selected ? '2px solid #805ad5' : '2px solid #805ad5'}
      borderRadius="7px"
      minW="260px"
    >
      <CardBody p={4}>
        <VStack spacing={2} align="stretch">
          <HStack spacing={2}>
            <FiMessageSquare color="#805ad5" />
            <Text fontWeight="bold" fontSize="sm">Message Validation</Text>
          </HStack>
          <Text fontSize="xs">{data.label}</Text>
          <Wrap spacing={1} justify="center">
            {data.validationRules?.map((rule, index) => (
              <Badge key={index} colorScheme="purple" size="sm">
                {rule}
              </Badge>
            ))}
          </Wrap>
        </VStack>
      </CardBody>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#805ad5', width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#805ad5', width: 8, height: 8 }}
      />
    </Card>
  );
};

const ReplyHandlerNode = ({ data, selected }) => {
  return (
    <Card
      size="sm"
      bg={selected ? 'cyan.100' : 'cyan.50'}
      border={selected ? '2px solid #00b5d8' : '2px solid #00b5d8'}
      borderRadius="7px"
      minW="260px"
    >
      <CardBody p={4}>
        <VStack spacing={2} align="stretch">
          <HStack spacing={2}>
            <FiMessageSquare color="#00b5d8" />
            <Text fontWeight="bold" fontSize="sm">Reply Handler</Text>
          </HStack>
          <Text fontSize="xs">{data.label}</Text>
          <Wrap spacing={1} justify="center">
            {data.expectedReplies?.map((reply, index) => (
              <Badge key={index} colorScheme="cyan" size="sm">
                {reply}
              </Badge>
            ))}
          </Wrap>
          {data.timeout && (
            <Badge colorScheme="orange" size="sm" alignSelf="center">
              Timeout: {data.timeout}m
            </Badge>
          )}
        </VStack>
      </CardBody>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#00b5d8', width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="replied"
        style={{ background: '#38a169', width: 8, height: 8, top: '33%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="timeout"
        style={{ background: '#ed8936', width: 8, height: 8, top: '66%' }}
      />
    </Card>
  );
};

const DelayNode = ({ data, selected }) => {
  return (
    <Card
      size="sm"
      bg={selected ? 'orange.100' : 'orange.50'}
      border={selected ? '2px solid #ed8936' : '2px solid #ed8936'}
      borderRadius="7px"
      minW="220px"
    >
      <CardBody p={4}>
        <VStack spacing={2} align="stretch">
          <HStack spacing={2}>
            <FiClock color="#ed8936" />
            <Text fontWeight="bold" fontSize="sm">Delay</Text>
          </HStack>
          <Text fontSize="sm" fontWeight="medium">{data.delay || 0} seconds</Text>
          <Text fontSize="xs" color="gray.600">{data.label}</Text>
        </VStack>
      </CardBody>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#ed8936', width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#ed8936', width: 8, height: 8 }}
      />
    </Card>
  );
};

const EndNode = ({ data, selected }) => {
  return (
    <Card
      size="sm"
      bg={selected ? 'red.100' : 'red.50'}
      border={selected ? '2px solid #e53e3e' : '2px solid #e53e3e'}
      borderRadius="7px"
      minW="200px"
    >
      <CardBody p={4}>
        <VStack spacing={2} align="stretch">
          <HStack spacing={2}>
            <FiXCircle color="#e53e3e" />
            <Text fontWeight="bold" fontSize="sm">End</Text>
          </HStack>
          <Text fontSize="xs" color="gray.600">{data.label}</Text>
        </VStack>
      </CardBody>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#e53e3e', width: 8, height: 8 }}
      />
    </Card>
  );
};

// Node type mappings
const nodeTypeComponents = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  messageValidation: MessageValidationNode,
  replyHandler: ReplyHandlerNode,
  delay: DelayNode,
  end: EndNode,
};

// Main Graph Builder Component
const GraphAutomationBuilderV2Content = ({ rule, onSave, eventsActions, builderResources, viewMode = false }) => {
  const toast = useToast();
  const token = getToken();

  // Get auth headers
  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(rule?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rule?.edges || []);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // UI state
  const [automationName, setAutomationName] = useState(rule?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);


  // Drawer states
  const {
    isOpen: isNodePaletteOpen,
    onOpen: onNodePaletteOpen,
    onClose: onNodePaletteClose
  } = useDisclosure();

  const {
    isOpen: isNodeConfigOpen,
    onOpen: onNodeConfigOpen,
    onClose: onNodeConfigClose
  } = useDisclosure();

  // Node configuration state
  const [nodeConfig, setNodeConfig] = useState({
    id: '',
    type: '',
    label: '',
    data: {}
  });

  // Initialize nodes and edges from rule
  useEffect(() => {
    if (rule) {
      setAutomationName(rule.name || '');

      // Validate and fix node positions to prevent NaN errors
      const validatedNodes = (rule.nodes || []).map(node => ({
        ...node,
        position: {
          x: typeof node.position?.x === 'number' && !isNaN(node.position.x) ? node.position.x : 100,
          y: typeof node.position?.y === 'number' && !isNaN(node.position.y) ? node.position.y : 100
        }
      }));

      setNodes(validatedNodes);
      setEdges(rule.edges || []);
    }
  }, [rule, setNodes, setEdges]);

  // Handle node connections
  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        style: { strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Handle node selection
  // Handle selection changes without interfering with panning
  useOnSelectionChange({
    onChange: ({ nodes: selectedNodes }) => {
      if (selectedNodes.length === 1) {
        setSelectedNode(selectedNodes[0]);
      } else {
        setSelectedNode(null);
      }
    }
  });

  // Add new node
  const addNode = useCallback((nodeType, position = { x: 100, y: 100 }) => {
    // Ensure position has valid numeric values
    const validPosition = {
      x: typeof position.x === 'number' && !isNaN(position.x) ? position.x : 100,
      y: typeof position.y === 'number' && !isNaN(position.y) ? position.y : 100
    };

    const newNode = {
      id: `${nodeType}_${Date.now()}`,
      type: nodeType,
      position: validPosition,
      data: {
        label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node`,
        ...getDefaultNodeData(nodeType)
      }
    };

    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  // Get default node data based on type
  const getDefaultNodeData = (nodeType) => {
    switch (nodeType) {
      case 'trigger':
        return {
          triggerEvent: 'lead_created',
          conditions: []
        };
      case 'action':
        return {
          actionType: 'send_whatsapp_message',
          config: {},
          delay: 0
        };
      case 'condition':
        return {
          conditionType: 'equals',
          field: '',
          operator: 'equals',
          value: '',
          label: 'Check condition'
        };
      case 'messageValidation':
        return {
          validationRules: ['contains_text'],
          expectedContent: '',
          label: 'Validate message'
        };
      case 'replyHandler':
        return {
          expectedReplies: ['yes', 'no'],
          timeout: 24, // hours
          label: 'Wait for reply'
        };
      case 'delay':
        return {
          delay: 60, // seconds
          label: 'Wait'
        };
      case 'end':
        return {
          label: 'End automation'
        };
      default:
        return {};
    }
  };

  // Configure node
  const configureNode = useCallback((node) => {
    setNodeConfig({
      id: node.id,
      type: node.type,
      label: node.data.label || '',
      data: { ...node.data }
    });
    onNodeConfigOpen();
  }, [onNodeConfigOpen]);

  // Save node configuration
  const saveNodeConfig = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeConfig.id
          ? { ...node, data: { ...node.data, ...nodeConfig.data, label: nodeConfig.label } }
          : node
      )
    );
    onNodeConfigClose();
  }, [nodeConfig, setNodes, onNodeConfigClose]);

  // Delete node
  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  // Save automation
  const handleSave = useCallback(async () => {
    if (!automationName.trim()) {
      toast({
        title: 'Error',
        description: 'Automation name is required',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);
    try {
      const automationData = {
        name: automationName,
        workflowType: 'graph',
        nodes,
        edges,
        viewport: reactFlowInstance?.getViewport() || { x: 0, y: 0, zoom: 1 },
        isActive: true
      };

      // Validate the automation before saving
      const validationErrors = validateAutomation(nodes, edges);
      if (validationErrors.length > 0) {
        toast({
          title: 'Validation Error',
          description: validationErrors.join(', '),
          status: 'error',
          duration: 5000,
        });
        setIsSaving(false);
        return;
      }

      await onSave(automationData);

    } catch (error) {
      console.error('Error saving automation:', error);
      toast({
        title: 'Error',
        description: 'Failed to save automation',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [automationName, nodes, edges, reactFlowInstance, onSave, toast]);

  // Validate automation
  const validateAutomation = (nodes, edges) => {
    const errors = [];

    // Check for at least one trigger node
    const triggerNodes = nodes.filter(node => node.type === 'trigger');
    if (triggerNodes.length === 0) {
      errors.push('At least one trigger node is required');
    }

    // Check for proper connections
    const connectedNodes = new Set();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    const orphanNodes = nodes.filter(node => !connectedNodes.has(node.id) && node.type !== 'trigger');
    if (orphanNodes.length > 0) {
      errors.push(`${orphanNodes.length} node(s) are not connected to the flow`);
    }

    return errors;
  };

  // Test automation
  const testAutomation = useCallback(async () => {
    try {
      const response = await axios.post(`${API_ENDPOINT}/automations-v2/ai-analysis`, {
        content: 'Test message',
        context: { automationId: rule?._id }
      }, {
        headers: getAuthHeaders()
      });

      toast({
        title: 'Test Successful',
        description: 'Automation analysis completed',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: 'Failed to test automation',
        status: 'error',
        duration: 5000,
      });
    }
  }, [rule, token, toast]);

  // Export/Import functions for portability
  const exportAutomation = useCallback(() => {
    const automationData = {
      name: automationName,
      workflowType: 'graph',
      nodes,
      edges,
      viewport: reactFlowInstance?.getViewport() || { x: 0, y: 0, zoom: 1 },
      version: '2.0',
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(automationData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${automationName.replace(/\s+/g, '_')}_automation_v2.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: 'Automation exported successfully',
      status: 'success',
      duration: 3000,
    });
  }, [automationName, nodes, edges, reactFlowInstance, toast]);

  // Custom node types for React Flow
  const customNodeTypes = useMemo(() => ({
    trigger: TriggerNode,
    action: ActionNode,
    condition: ConditionNode,
    delay: DelayNode,
    messageValidation: MessageValidationNode,
    replyHandler: ReplyHandlerNode,
    end: EndNode,
  }), []);

  // Filtered data for search
  const filteredTriggers = useMemo(() => {
    if (!eventsActions?.triggers) return {};

    const searchLower = searchQuery.toLowerCase();
    const result = {};

    // Group triggers by category
    eventsActions.triggers.forEach(trigger => {
      const triggerLabel = typeof trigger === 'string' ? trigger : trigger.label || trigger.value;
      const triggerDesc = typeof trigger === 'string' ? '' : trigger.description || '';

      if (searchLower && !triggerLabel.toLowerCase().includes(searchLower) && !triggerDesc.toLowerCase().includes(searchLower)) {
        return;
      }

      const category = 'Automation Triggers'; // Simplified category
      if (!result[category]) result[category] = [];
      result[category].push(trigger);
    });

    return result;
  }, [eventsActions?.triggers, searchQuery]);

  const filteredActions = useMemo(() => {
    if (!eventsActions?.actions) return {};

    const searchLower = searchQuery.toLowerCase();
    const result = {};

    // Group actions by category
    eventsActions.actions.forEach(action => {
      const actionLabel = typeof action === 'string' ? action : action.label || action.value;
      const actionDesc = typeof action === 'string' ? '' : action.description || '';

      if (searchLower && !actionLabel.toLowerCase().includes(searchLower) && !actionDesc.toLowerCase().includes(searchLower)) {
        return;
      }

      const category = 'Automation Actions'; // Simplified category
      if (!result[category]) result[category] = [];
      result[category].push(action);
    });

    return result;
  }, [eventsActions?.actions, searchQuery]);

  return (
    <Box h="100vh" display="flex" flexDirection="column">
      {/* Header */}
      <Box p={4} borderBottom="1px solid" borderColor="gray.200">
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Heading size="md">FunnelsEye Automation Builder</Heading>
            </VStack>

            <HStack spacing={2}>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                size="sm"
                onClick={onNodePaletteOpen}
              >
                Add Node
              </Button>
              <Button
                leftIcon={<FiPlay />}
                colorScheme="green"
                variant="outline"
                size="sm"
                onClick={testAutomation}
              >
                Test
              </Button>
              <Button
                leftIcon={<FiSave />}
                colorScheme="blue"
                size="sm"
                onClick={handleSave}
                isLoading={isSaving}
                loadingText="Saving..."
              >
                Save Automation
              </Button>
            </HStack>
          </HStack>

          <SimpleGrid columns={2} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm">Automation Name</FormLabel>
              <Input
                value={automationName}
                onChange={(e) => setAutomationName(e.target.value)}
                placeholder="Enter automation name"
                size="sm"
              />
            </FormControl>

          </SimpleGrid>
        </VStack>
      </Box>

      {/* React Flow Canvas */}
      <Box
        flex={1}
        position="relative"
        style={{
          cursor: 'grab',
          userSelect: 'none'
        }}
        _active={{
          cursor: 'grabbing'
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          // onSelectionChange={onSelectionChange}  // Temporarily disabled to test panning
          onInit={setReactFlowInstance}
          nodeTypes={customNodeTypes}
          onNodeDoubleClick={(event, node) => {
            setSelectedNode(node);
            onNodeConfigOpen();
          }}
          fitView={!rule?.viewport || !rule.viewport.x || !rule.viewport.y || !rule.viewport.zoom}
          defaultViewport={rule?.viewport && rule.viewport.x !== undefined && rule.viewport.y !== undefined && rule.viewport.zoom !== undefined
            ? { x: rule.viewport.x, y: rule.viewport.y, zoom: rule.viewport.zoom }
            : { x: 0, y: 0, zoom: 1 }}
          panOnDrag={true}
          panOnScroll={false}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={false}
          selectNodesOnDrag={false}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          selectionOnDrag={false}  // Disable selection when dragging
          selectionMode="partial"  // Allow partial selection but don't interfere with panning
          connectionLineStyle={{ stroke: '#b1b1b7', strokeWidth: 2 }}
          connectionLineType="smoothstep"
          defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
          snapToGrid={true}
          snapGrid={[15, 15]}
          proOptions={{ hideAttribution: true }}
          attributionPosition="bottom-left"
          style={{
            cursor: 'grab',
            userSelect: 'none'
          }}
        >
          <Background variant="dots" gap={20} size={1} />
          <Controls />
          <MiniMap
            nodeStrokeColor={(n) => {
              if (n.type === 'trigger') return '#38a169';
              if (n.type === 'action') return '#3182ce';
              if (n.type === 'condition') return '#d69e2e';
              return '#4a5568';
            }}
            nodeColor={(n) => {
              if (n.type === 'trigger') return '#c6f6d5';
              if (n.type === 'action') return '#bee3f8';
              if (n.type === 'condition') return '#fef5e7';
              return '#e2e8f0';
            }}
          />

          <Panel position="top-right">
            <VStack spacing={2}>
              <Button
                size="sm"
                leftIcon={<FiRefreshCw />}
                onClick={() => reactFlowInstance?.fitView()}
              >
                Fit View
              </Button>
            </VStack>
          </Panel>
        </ReactFlow>
      </Box>

      {/* Node Palette Drawer */}
      <Drawer
        isOpen={isNodePaletteOpen}
        placement="right"
        onClose={() => {
          onNodePaletteClose();
          setSearchQuery('');
          setActiveTab(0);
        }}
        size="md"
      >
        <DrawerOverlay zIndex={1000} />
        <DrawerContent
          boxShadow="none"
          zIndex={1001}
        >
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
                  <VStack spacing={4} align="stretch" maxH="calc(100vh - 300px)" overflowY="auto">
                    {Object.keys(filteredTriggers).length === 0 && searchQuery.trim() ? (
                      <Box textAlign="center" py={12}>
                        <FiZap size={48} color="#a0aec0" style={{ margin: '0 auto 16px' }} />
                        <Text color="gray.500" fontSize="sm">
                          No triggers found matching "{searchQuery}"
                        </Text>
                      </Box>
                    ) : Object.keys(filteredTriggers).length === 0 ? (
                      <Box textAlign="center" py={12}>
                        <FiZap size={48} color="#a0aec0" style={{ margin: '0 auto 16px' }} />
                        <Text color="gray.500" fontSize="sm">
                          No triggers available
                        </Text>
                      </Box>
                    ) : searchQuery.trim() ? (
                      // When searching, show all results in groups without accordion
                      Object.keys(filteredTriggers).map((category) => {
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
                              {filteredTriggers[category].map((event, index) => {
                                const eventLabel = typeof event === 'string' ? event : event.label || event.value;
                                const eventValue = typeof event === 'string' ? event : event.value || event.label;
                                const eventDesc = typeof event === 'string' ? '' : event.description || '';
                                const TriggerIcon = getTriggerIcon(eventValue);
                                const formattedLabel = formatLabel(eventLabel);
                                return (
                                  <Card
                                    key={`${category}-${index}`}
                                    cursor="pointer"
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Add ${formattedLabel} trigger node`}
                                    onClick={() => {
                                      addNode('trigger', event);
                                      onNodePaletteClose();
                                      setSearchQuery('');
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        addNode('trigger', event);
                                        onNodePaletteClose();
                                        setSearchQuery('');
                                      }
                                    }}
                                    _hover={{
                                      borderColor: 'blue.300',
                                      boxShadow: 'md',
                                      transform: 'translateY(-1px)'
                                    }}
                                    _focus={{
                                      outline: '2px solid',
                                      outlineColor: 'blue.400',
                                      boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)'
                                    }}
                                    transition="all 0.2s"
                                    border="1px"
                                    borderColor="gray.200"
                                    bg="white"
                                    p={4}
                                    minH="80px"
                                  >
                                    <HStack spacing={3} align="start">
                                      <Box
                                        p={3}
                                        borderRadius="lg"
                                        bg="blue.50"
                                        color="blue.600"
                                        flexShrink={0}
                                      >
                                        <TriggerIcon size={20} />
                                      </Box>
                                      <VStack align="start" spacing={1} flex={1}>
                                        <Text fontSize="sm" fontWeight="600" color="gray.900">
                                          {formattedLabel}
                                        </Text>
                                        {eventDesc && (
                                          <Text fontSize="xs" color="gray.600" noOfLines={2} lineHeight="1.4">
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
                        {Object.keys(filteredTriggers).map((category) => {
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
                                  {filteredTriggers[category].map((event, index) => {
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
                                          onNodePaletteClose();
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
                  <VStack spacing={4} align="stretch" maxH="calc(100vh - 300px)" overflowY="auto">
                    {Object.keys(filteredActions).length === 0 ? (
                      <Box textAlign="center" py={12}>
                        <FiZap size={48} color="#a0aec0" style={{ margin: '0 auto 16px' }} />
                        <Text color="gray.500" fontSize="sm">
                          No actions found matching "{searchQuery}"
                        </Text>
                      </Box>
                    ) : searchQuery.trim() ? (
                      // When searching, show all results in groups without accordion
                      Object.keys(filteredActions).map((category) => {
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
                              {filteredActions[category].map((action, index) => {
                                const actionLabel = typeof action === 'string' ? action : action.label || action.value;
                                const actionValue = typeof action === 'string' ? action : action.value || action.label;
                                const actionDesc = typeof action === 'string' ? '' : action.description || '';
                                const ActionIcon = getActionIcon(actionValue);
                                const formattedLabel = formatLabel(actionLabel);
                                return (
                                  <Card
                                    key={`${category}-${index}`}
                                    cursor="pointer"
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Add ${formattedLabel} action node`}
                                    onClick={() => {
                                      addNode('action', action);
                                      onNodePaletteClose();
                                      setSearchQuery('');
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        addNode('action', action);
                                        onNodePaletteClose();
                                        setSearchQuery('');
                                      }
                                    }}
                                    _hover={{
                                      borderColor: 'green.300',
                                      boxShadow: 'md',
                                      transform: 'translateY(-1px)'
                                    }}
                                    _focus={{
                                      outline: '2px solid',
                                      outlineColor: 'green.400',
                                      boxShadow: '0 0 0 3px rgba(72, 187, 120, 0.6)'
                                    }}
                                    transition="all 0.2s"
                                    border="1px"
                                    borderColor="gray.200"
                                    bg="white"
                                    p={4}
                                    minH="80px"
                                  >
                                    <HStack spacing={3} align="start">
                                      <Box
                                        p={3}
                                        borderRadius="lg"
                                        bg="green.50"
                                        color="green.600"
                                        flexShrink={0}
                                      >
                                        <ActionIcon size={20} />
                                      </Box>
                                      <VStack align="start" spacing={1} flex={1}>
                                        <Text fontSize="sm" fontWeight="600" color="gray.900">
                                          {formattedLabel}
                                        </Text>
                                        {actionDesc && (
                                          <Text fontSize="xs" color="gray.600" noOfLines={2} lineHeight="1.4">
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
                      <Accordion allowMultiple defaultIndex={[0]}>
                        {Object.keys(filteredActions).map((category) => {
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
                                  {filteredActions[category].map((action, index) => {
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
                                          onNodePaletteClose();
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
                  <VStack spacing={4} align="stretch" maxH="calc(100vh - 300px)" overflowY="auto">
                    <Box>
                      <HStack spacing={2} mb={4} px={2}>
                        <FiGitBranch color="#718096" size={16} />
                        <Text fontSize="sm" fontWeight="600" color="gray.700" textTransform="uppercase" letterSpacing="0.5px">
                          Flow Control Nodes
                        </Text>
                      </HStack>
                      <VStack spacing={3} align="stretch">
                        {[
                          { label: 'Delay', type: 'delay', icon: FiClock, color: 'orange', data: { label: 'Delay', delay: 0 }, description: 'Wait for a specified amount of time before continuing the workflow' },
                          { label: 'Condition', type: 'condition', icon: FiGitBranch, color: 'purple', data: { label: 'Condition' }, description: 'Branch workflow based on conditions with if/else logic' },
                          { label: 'Message Validation', type: 'messageValidation', icon: FiMessageSquare, color: 'purple', data: { label: 'Message Validation', validationRules: ['contains_text'], expectedContent: '' }, description: 'Validate incoming message content against specific rules' },
                          { label: 'Reply Handler', type: 'replyHandler', icon: FiMessageSquare, color: 'cyan', data: { label: 'Reply Handler', expectedReplies: ['yes', 'no'], timeout: 24 }, description: 'Handle user replies with conditional branching logic' },
                          { label: 'End Automation', type: 'end', icon: FiXCircle, color: 'red', data: { label: 'End Automation' }, description: 'Mark the end of the automation workflow' }
                        ].map((item, index) => {
                          const IconComponent = item.icon;
                          return (
                            <Card
                              key={index}
                              cursor="pointer"
                              role="button"
                              tabIndex={0}
                              aria-label={`Add ${item.label} node`}
                              onClick={() => {
                                addNode(item.type);
                                onNodePaletteClose();
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  addNode(item.type);
                                  onNodePaletteClose();
                                }
                              }}
                              _hover={{
                                borderColor: `${item.color}.300`,
                                boxShadow: 'lg',
                                transform: 'translateY(-2px)'
                              }}
                              _focus={{
                                outline: '2px solid',
                                outlineColor: `${item.color}.400`,
                                boxShadow: `0 0 0 3px ${item.color === 'orange' ? 'rgba(237, 137, 54, 0.6)' :
                                               item.color === 'purple' ? 'rgba(128, 90, 213, 0.6)' :
                                               item.color === 'cyan' ? 'rgba(0, 181, 216, 0.6)' :
                                               'rgba(229, 62, 62, 0.6)'}`
                              }}
                              transition="all 0.2s"
                              border="1px"
                              borderColor="gray.200"
                              bg="white"
                              p={4}
                              minH="90px"
                              _active={{ transform: 'translateY(0px)' }}
                            >
                              <HStack spacing={4} align="start">
                                <Box
                                  p={3}
                                  borderRadius="lg"
                                  bg={`${item.color}.50`}
                                  color={`${item.color}.600`}
                                  flexShrink={0}
                                  boxShadow="sm"
                                >
                                  <IconComponent size={20} />
                                </Box>
                                <VStack align="start" spacing={1} flex={1}>
                                  <Text fontSize="sm" fontWeight="600" color="gray.900">
                                    {item.label}
                                  </Text>
                                  <Text fontSize="xs" color="gray.600" noOfLines={2} lineHeight="1.4">
                                    {item.description}
                                  </Text>
                                </VStack>
                              </HStack>
                            </Card>
                          );
                        })}
                      </VStack>
                    </Box>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Node Configuration Drawer */}
      <Drawer isOpen={isNodeConfigOpen} placement="right" onClose={onNodeConfigClose} size="lg">
        <DrawerOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" zIndex={1000} />
        <DrawerContent
          bg="white"
          boxShadow="none"
          zIndex={1001}
        >
          <DrawerCloseButton zIndex={1002} />
          <DrawerHeader
            borderBottom="1px"
            borderColor="gray.200"
            bg="gray.50"
          >
            <VStack align="start" spacing={1}>
              <Text fontSize="lg" fontWeight="bold">
                Configure {selectedNode?.type?.charAt(0).toUpperCase() + selectedNode?.type?.slice(1)} Node
              </Text>
              <Text fontSize="sm" color="gray.600">
                {selectedNode?.data?.label || 'Node Configuration'}
              </Text>
            </VStack>
          </DrawerHeader>
          <DrawerBody px={6} py={6} overflowY="auto">
            {selectedNode && (
              <VStack spacing={6} align="stretch">
                <Card bg="white" border="1px" borderColor="gray.200">
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="600">Node Label</FormLabel>
                        <Input
                          size="md"
                          value={selectedNode.data?.label || ''}
                          onChange={(e) => {
                            setNodes(nodes => nodes.map(node =>
                              node.id === selectedNode.id
                                ? { ...node, data: { ...node.data, label: e.target.value } }
                                : node
                            ));
                          }}
                          placeholder="Enter node label"
                        />
                        <FormHelperText fontSize="xs">
                          This label will be displayed on the node in the workflow
                        </FormHelperText>
                      </FormControl>

                      {/* Node-specific configuration */}
                      {selectedNode.type === 'trigger' && (
                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="600">Trigger Event</FormLabel>
                          <Select
                            size="md"
                            value={selectedNode.data?.triggerEvent || ''}
                            onChange={(e) => {
                              setNodes(nodes => nodes.map(node =>
                                node.id === selectedNode.id
                                  ? { ...node, data: { ...node.data, triggerEvent: e.target.value } }
                                  : node
                              ));
                            }}
                          >
                            {eventsActions?.triggers?.map(trigger => (
                              <option key={trigger} value={trigger}>
                                {typeof trigger === 'string' ? trigger.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : trigger.label || trigger.value}
                              </option>
                            ))}
                          </Select>
                          <FormHelperText fontSize="xs">
                            Select the event that will trigger this automation
                          </FormHelperText>
                        </FormControl>
                      )}

                      {selectedNode.type === 'action' && (
                        <>
                          <FormControl>
                            <FormLabel fontSize="sm" fontWeight="600">Action Type</FormLabel>
                            <Select
                              size="md"
                              value={selectedNode.data?.actionType || ''}
                              onChange={(e) => {
                                setNodes(nodes => nodes.map(node =>
                                  node.id === selectedNode.id
                                    ? { ...node, data: { ...node.data, actionType: e.target.value } }
                                    : node
                                ));
                              }}
                            >
                              {eventsActions?.actions?.map(action => (
                                <option key={action} value={action}>
                                  {typeof action === 'string' ? action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : action.label || action.value}
                                </option>
                              ))}
                            </Select>
                            <FormHelperText fontSize="xs">
                              Choose the action to perform when this node executes
                            </FormHelperText>
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="sm" fontWeight="600">Delay After Action (seconds)</FormLabel>
                            <NumberInput size="md" min={0} max={3600}>
                              <NumberInputField
                                value={selectedNode.data?.delay || 0}
                                onChange={(value) => {
                                  setNodes(nodes => nodes.map(node =>
                                    node.id === selectedNode.id
                                      ? { ...node, data: { ...node.data, delay: parseInt(value) || 0 } }
                                      : node
                                  ));
                                }}
                              />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                            <FormHelperText fontSize="xs">
                              Optional delay before moving to the next node (0 = no delay)
                            </FormHelperText>
                          </FormControl>
                        </>
                      )}

                      {selectedNode.type === 'condition' && (
                        <>
                          <FormControl>
                            <FormLabel fontSize="sm" fontWeight="600">Condition Type</FormLabel>
                            <Select
                              size="md"
                              value={selectedNode.data?.conditionType || ''}
                              onChange={(e) => {
                                setNodes(nodes => nodes.map(node =>
                                  node.id === selectedNode.id
                                    ? { ...node, data: { ...node.data, conditionType: e.target.value } }
                                    : node
                                ));
                              }}
                            >
                              {eventsActions?.conditions?.map(condition => (
                                <option key={condition} value={condition}>
                                  {typeof condition === 'string' ? condition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : condition.label || condition.value}
                                </option>
                              ))}
                            </Select>
                            <FormHelperText fontSize="xs">
                              Select the type of condition to evaluate
                            </FormHelperText>
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="sm" fontWeight="600">Field to Check</FormLabel>
                            <Input
                              size="md"
                              placeholder="e.g., message_content, lead_status, lead_score"
                              value={selectedNode.data?.field || ''}
                              onChange={(e) => {
                                setNodes(nodes => nodes.map(node =>
                                  node.id === selectedNode.id
                                    ? { ...node, data: { ...node.data, field: e.target.value } }
                                    : node
                                ));
                              }}
                            />
                            <FormHelperText fontSize="xs">
                              The field or variable to evaluate in the condition
                            </FormHelperText>
                          </FormControl>
                        </>
                      )}

                      {selectedNode.type === 'delay' && (
                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="600">Delay Duration (seconds)</FormLabel>
                          <NumberInput size="md" min={1} max={86400}>
                            <NumberInputField
                              value={selectedNode.data?.delay || 60}
                              onChange={(value) => {
                                setNodes(nodes => nodes.map(node =>
                                  node.id === selectedNode.id
                                    ? { ...node, data: { ...node.data, delay: parseInt(value) || 60 } }
                                    : node
                                ));
                              }}
                            />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                          <FormHelperText fontSize="xs">
                            How long to wait before continuing to the next node
                          </FormHelperText>
                        </FormControl>
                      )}

                      {selectedNode.type === 'messageValidation' && (
                        <>
                          <FormControl>
                            <FormLabel fontSize="sm" fontWeight="600">Validation Rules</FormLabel>
                            <VStack spacing={2} align="stretch">
                              {['contains_text', 'is_numeric', 'is_email', 'min_length'].map((rule) => (
                                <Checkbox
                                  key={rule}
                                  isChecked={selectedNode.data?.validationRules?.includes(rule) || false}
                                  onChange={(e) => {
                                    const currentRules = selectedNode.data?.validationRules || [];
                                    const newRules = e.target.checked
                                      ? [...currentRules, rule]
                                      : currentRules.filter(r => r !== rule);
                                    setNodes(nodes => nodes.map(node =>
                                      node.id === selectedNode.id
                                        ? { ...node, data: { ...node.data, validationRules: newRules } }
                                        : node
                                    ));
                                  }}
                                >
                                  {rule.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Checkbox>
                              ))}
                            </VStack>
                            <FormHelperText fontSize="xs">
                              Select validation rules to apply to incoming messages
                            </FormHelperText>
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="sm" fontWeight="600">Expected Content</FormLabel>
                            <Input
                              size="md"
                              placeholder="Text to match (for contains_text rule)"
                              value={selectedNode.data?.expectedContent || ''}
                              onChange={(e) => {
                                setNodes(nodes => nodes.map(node =>
                                  node.id === selectedNode.id
                                    ? { ...node, data: { ...node.data, expectedContent: e.target.value } }
                                    : node
                                ));
                              }}
                            />
                            <FormHelperText fontSize="xs">
                              Optional: Expected text content for validation
                            </FormHelperText>
                          </FormControl>
                        </>
                      )}

                      {selectedNode.type === 'replyHandler' && (
                        <>
                          <FormControl>
                            <FormLabel fontSize="sm" fontWeight="600">Expected Replies</FormLabel>
                            <Input
                              size="md"
                              placeholder="yes,no,maybe (comma-separated)"
                              value={selectedNode.data?.expectedReplies?.join(', ') || ''}
                              onChange={(e) => {
                                const replies = e.target.value.split(',').map(r => r.trim()).filter(r => r);
                                setNodes(nodes => nodes.map(node =>
                                  node.id === selectedNode.id
                                    ? { ...node, data: { ...node.data, expectedReplies: replies } }
                                    : node
                                ));
                              }}
                            />
                            <FormHelperText fontSize="xs">
                              Comma-separated list of expected reply keywords
                            </FormHelperText>
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="sm" fontWeight="600">Timeout (hours)</FormLabel>
                            <NumberInput size="md" min={1} max={168}>
                              <NumberInputField
                                value={selectedNode.data?.timeout || 24}
                                onChange={(value) => {
                                  setNodes(nodes => nodes.map(node =>
                                    node.id === selectedNode.id
                                      ? { ...node, data: { ...node.data, timeout: parseInt(value) || 24 } }
                                      : node
                                  ));
                                }}
                              />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                            <FormHelperText fontSize="xs">
                              Maximum time to wait for a reply before timing out
                            </FormHelperText>
                          </FormControl>
                        </>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize="sm">Node Behavior</AlertTitle>
                    <AlertDescription fontSize="xs">
                      {selectedNode.type === 'trigger' && "This node starts the automation when the specified event occurs."}
                      {selectedNode.type === 'action' && "This node performs an action like sending a message or updating data."}
                      {selectedNode.type === 'condition' && "This node evaluates a condition and routes the flow based on true/false results."}
                      {selectedNode.type === 'delay' && "This node pauses the automation for the specified duration."}
                      {selectedNode.type === 'messageValidation' && "This node validates incoming message content against specified rules."}
                      {selectedNode.type === 'replyHandler' && "This node waits for and processes user replies with conditional branching."}
                      {selectedNode.type === 'end' && "This node marks the end of the automation workflow."}
                    </AlertDescription>
                  </Box>
                </Alert>
              </VStack>
            )}
          </DrawerBody>
          <DrawerFooter borderTop="1px" borderColor="gray.200">
            <HStack spacing={3}>
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedNode) {
                    deleteNode(selectedNode.id);
                    setSelectedNode(null);
                    onNodeConfigClose();
                  }
                }}
                colorScheme="red"
                size="sm"
                isDisabled={!selectedNode}
              >
                Delete Node
              </Button>
              <Button
                colorScheme="blue"
                onClick={onNodeConfigClose}
                size="sm"
              >
                Done
              </Button>
            </HStack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

// Main wrapper component
const GraphAutomationBuilderV2 = (props) => {
  return (
    <ReactFlowProvider>
      <GraphAutomationBuilderV2Content {...props} />
    </ReactFlowProvider>
  );
};

export default GraphAutomationBuilderV2;
