import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/authUtils';
import { canAccessSection, hasPermission, PERMISSIONS } from '../../utils/permissions';
import AccessDenied from '../../components/AccessDenied';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  useToast,
  Icon,
  Spinner,
  Center,
  useColorModeValue,
  SimpleGrid,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  FormHelperText,
  Textarea,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Avatar,
  Tooltip,
  Skeleton,
  SkeletonText,
  Progress,
  CircularProgress,
  Wrap,
  WrapItem,
  Stack,
  ButtonGroup,
  Switch,
  ScaleFade,
  Collapse,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  TagLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import {
  FiCheckSquare,
  FiPlus,
  FiFilter,
  FiRefreshCw,
  FiEdit,
  FiTrash2,
  FiMoreVertical,
  FiSearch,
  FiClock,
  FiUser,
  FiUsers,
  FiAlertCircle,
  FiActivity,
  FiTrendingUp,
  FiCalendar,
  FiEye,
  FiArrowUp,
  FiArrowDown,
  FiArrowLeft,
  FiTarget,
  FiBarChart2,
  FiGlobe,
  FiPlay,
  FiPause,
  FiCheckCircle,
  FiX,
  FiPhone,
  FiMessageSquare,
  FiCheck,
  FiArrowRight
} from 'react-icons/fi';
import {
  SearchIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  ViewIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  CopyIcon,
  WarningIcon
} from '@chakra-ui/icons';
// Using a simpler approach without drag-and-drop library for now
// Can be enhanced with @hello-pangea/dnd later if needed

import { API_BASE_URL } from '../../config/apiConfig';

// Professional Loading Skeleton Component with Smooth Animations
const ProfessionalLoader = () => {
  return (
    <Box maxW="full" py={8} px={6}>
      <VStack spacing={8} align="stretch">
        {/* Header Section with Professional Animation */}
        <Card 
          bg="white" 
          borderRadius="xl" 
          boxShadow="lg" 
          border="1px" 
          borderColor="gray.200"
          overflow="hidden"
          position="relative"
        >
          <Box
          
            position="absolute"
            top="0"
            left="-100%"
            width="100%"
            height="100%"
            background="linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent)"
            animation="shimmer 2s infinite"
            sx={{
              '@keyframes shimmer': {
                '0%': { left: '-100%' },
                '100%': { left: '100%' }
              }
            }}
          />
          <CardHeader py={6}>
            <VStack spacing={6} align="stretch">
              <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={4}>
                <VStack align={{ base: 'center', md: 'start' }} spacing={2}>
                  <Skeleton height="40px" width="400px" borderRadius="lg" />
                  <Skeleton height="20px" width="600px" borderRadius="md" />
                </VStack>
                <HStack spacing={2}>
                  <Skeleton height="32px" width="100px" borderRadius="7px" />
                  <Skeleton height="32px" width="80px" borderRadius="7px" />
                  <Skeleton height="32px" width="120px" borderRadius="7px" />
                  <Skeleton height="32px" width="120px" borderRadius="7px" />
                </HStack>
              </Flex>
              
              {/* Professional Stats Cards with Gradient Animation */}
              <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
                {[...Array(4)].map((_, i) => (
                  <Card 
                    key={i} 
                    variant="outline"
                    borderRadius="xl"
                    overflow="hidden"
                    position="relative"
                    _hover={{ transform: 'translateY(-2px)', transition: 'all 0.3s' }}
                  >
                    <Box
                      position="absolute"
                      top="0"
                      left="-100%"
                      width="100%"
                      height="100%"
                      background={`linear-gradient(90deg, transparent, ${
                        ['rgba(59, 130, 246, 0.1)', 'rgba(34, 197, 94, 0.1)', 'rgba(251, 146, 60, 0.1)', 'rgba(168, 85, 247, 0.1)'][i]
                      }, transparent)`}
                      animation="shimmer 2.5s infinite"
                      sx={{
                        '@keyframes shimmer': {
                          '0%': { left: '-100%' },
                          '100%': { left: '100%' }
                        }
                      }}
                    />
                    <CardBody p={6}>
                      <HStack spacing={4} align="center" w="full">
                        <Skeleton 
                          height="60px" 
                          width="60px" 
                          borderRadius="xl" 
                          startColor="gray.200"
                          endColor="gray.300"
                        />
                        <VStack align="start" spacing={2} flex={1}>
                          <Skeleton height="16px" width="120px" borderRadius="md" />
                          <Skeleton height="32px" width="80px" borderRadius="lg" />
                        </VStack>
                        <Skeleton height="24px" width="60px" borderRadius="full" />
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </VStack>
          </CardHeader>
        </Card>

        {/* Loading Progress Indicator */}
        <Box textAlign="center" py={4}>
          <VStack spacing={3}>
            <HStack spacing={2}>
              <Box
                w="8px"
                h="8px"
                bg="blue.500"
                borderRadius="full"
                animation="pulse 1.4s infinite"
                sx={{
                  '@keyframes pulse': {
                    '0%, 80%, 100%': { transform: 'scale(0.8)', opacity: 0.5 },
                    '40%': { transform: 'scale(1)', opacity: 1 }
                  }
                }}
              />
              <Box
                w="8px"
                h="8px"
                bg="blue.500"
                borderRadius="full"
                animation="pulse 1.4s infinite 0.2s"
                sx={{
                  '@keyframes pulse': {
                    '0%, 80%, 100%': { transform: 'scale(0.8)', opacity: 0.5 },
                    '40%': { transform: 'scale(1)', opacity: 1 }
                  }
                }}
              />
              <Box
                w="8px"
                h="8px"
                bg="blue.500"
                borderRadius="full"
                animation="pulse 1.4s infinite 0.4s"
                sx={{
                  '@keyframes pulse': {
                    '0%, 80%, 100%': { transform: 'scale(0.8)', opacity: 0.5 },
                    '40%': { transform: 'scale(1)', opacity: 1 }
                  }
                }}
              />
            </HStack>
            <Text color="gray.500" fontSize="sm" fontWeight="medium">
              Loading your tasks and activities...
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon, color = "blue", trend, isLoading = false, onClick }) => {
  const bgColor = useColorModeValue(`${color}.50`, `${color}.900`);
  const borderColor = useColorModeValue(`${color}.200`, `${color}.700`);
  
  return (
    <Box
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={5}
      minH="120px"
      display="flex"
      alignItems="center"
      transition="all 0.2s"
      cursor={onClick ? "pointer" : "default"}
      _hover={{ transform: onClick ? 'translateY(-2px)' : 'none', borderColor: `${color}.300`, boxShadow: onClick ? 'md' : 'none' }}
      onClick={onClick}
    >
      <HStack spacing={3} align="center">
        <Box
          p={2}
          bg={`${color}.100`}
          borderRadius="md"
          color={`${color}.600`}
          fontSize="lg"
        >
          {icon}
        </Box>
        <VStack align="start" spacing={0} flex={1}>
          <Text fontSize="xs" fontWeight="600" color={`${color}.600`} textTransform="uppercase" letterSpacing="0.2em">
            {title}
          </Text>
          {isLoading ? (
            <Skeleton height="22px" width="60px" mt={1} />
          ) : (
            <Text fontSize="xl" fontWeight="600" color={`${color}.800`} mt={0.5}>
              {value}
            </Text>
          )}
        </VStack>
        {trend !== undefined && trend !== null && (
          <Badge 
            colorScheme={trend > 0 ? 'green' : 'red'} 
            variant="solid" 
            size="sm"
            borderRadius="md"
            px={2}
            py={0.5}
          >
            {trend > 0 ? '+' : ''}{trend}%
          </Badge>
        )}
      </HStack>
    </Box>
  );
};

// --- BEAUTIFUL TOAST NOTIFICATIONS ---
const useCustomToast = () => {
  const toast = useToast();
  
  return useCallback((message, status = 'success') => {
    let title = 'Success!';
    if (status === 'error') title = 'Error!';
    else if (status === 'warning') title = 'Warning!';
    else if (status === 'info') title = 'Info!';
    
    toast({
      title,
      description: message,
      status,
      duration: 5000,
      isClosable: true,
      position: 'top-right',
      variant: 'subtle',
    });
  }, [toast]);
};

const TasksAndActivities = () => {
  const navigate = useNavigate();
  const authState = useSelector(state => state.auth);
  const user = authState?.user;
  const token = getToken(authState);
  const toast = useToast();
  const customToast = useCustomToast();
  
  // Check permissions
  const canAccess = canAccessSection(authState, 'tasks');
  const canViewTasks = hasPermission(authState, PERMISSIONS.TASKS.VIEW);
  const canCreateTasks = hasPermission(authState, PERMISSIONS.TASKS.CREATE);
  const canUpdateTasks = hasPermission(authState, PERMISSIONS.TASKS.UPDATE);
  const canDeleteTasks = hasPermission(authState, PERMISSIONS.TASKS.DELETE);
  
  // Show access denied if staff doesn't have permission
  if (!canAccess || !canViewTasks) {
    return (
      <AccessDenied
        message="You don't have permission to view tasks and activities."
        requiredPermission={PERMISSIONS.TASKS.VIEW}
        section="Tasks & Activities"
      />
    );
  }
  
  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const shadowColor = useColorModeValue('md', 'dark-lg');
  
  // State management
  const [loading, setLoading] = useState(true);
  const [kanbanData, setKanbanData] = useState({
    'Pending': [],
    'In Progress': [],
    'Completed': [],
    'Overdue': [],
  });
  const [activities, setActivities] = useState([]);
  const [ongoingActivities, setOngoingActivities] = useState({
    tasks: [],
    appointments: [],
    staff: []
  });
  const [stats, setStats] = useState({
    tasks: 0,
    leads: 0,
    appointments: 0,
    staff: 0,
    funnels: 0,
    total: 0
  });
  
  // Tab management
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  
  // Staff list
  const [staffList, setStaffList] = useState([]);
  const [tasksByStaff, setTasksByStaff] = useState({});
  const [leadsList, setLeadsList] = useState([]);
  
  // Funnel and stages management
  const [funnelsList, setFunnelsList] = useState([]);
  const [selectedFunnel, setSelectedFunnel] = useState(null);
  const [customStages, setCustomStages] = useState([]);
  const { isOpen: isStageModalOpen, onOpen: onStageModalOpen, onClose: onStageModalClose } = useDisclosure();
  const [editingStage, setEditingStage] = useState(null);
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('blue');
  
  // Activity popup
  const { isOpen: isActivityModalOpen, onOpen: onActivityModalOpen, onClose: onActivityModalClose } = useDisclosure();
  const [selectedActivityType, setSelectedActivityType] = useState(null);
  const [selectedActivityData, setSelectedActivityData] = useState([]);
  
  // Task detail modal
  const { isOpen: isTaskDetailOpen, onOpen: onTaskDetailOpen, onClose: onTaskDetailClose } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Workflow and assign workflow modals
  const { isOpen: isWorkflowModalOpen, onOpen: onWorkflowModalOpen, onClose: onWorkflowModalClose } = useDisclosure();
  const { isOpen: isAssignWorkflowModalOpen, onOpen: onAssignWorkflowModalOpen, onClose: onAssignWorkflowModalClose } = useDisclosure();
  
  // Drag and drop
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignedTo: 'all',
    dateRange: '7',
    search: '',
    funnelId: 'all'
  });
  
  // Modals
  const { isOpen: isTaskOpen, onOpen: onTaskOpen, onClose: onTaskClose } = useDisclosure();
  const [taskForm, setTaskForm] = useState({
    name: '',
    description: '',
    priority: 'MEDIUM',
    stage: 'LEAD_GENERATION',
    relatedLead: '',
    assignedTo: '',
    dueDate: ''
  });
  
  
  // Load data
  useEffect(() => {
    loadData();
  }, [filters]);
  
  // Initialize vowoci1010@24faw.com custom stages on mount (only if no custom stages exist)
  useEffect(() => {
    const savedStages = localStorage.getItem('taskCustomStages');
    if (savedStages) {
      try {
        const parsed = JSON.parse(savedStages);
        if (parsed && parsed.length > 0) {
          setCustomStages(parsed);
          return; // Don't override with funnel stages if we have saved custom stages
        }
      } catch (e) {
        
        console.error('Error parsing saved stages:', e);
      }
    }
    
    // Only load funnel stages if no saved custom stages exist
    if (funnelsList.length > 0 && customStages.length === 0) {
      loadCustomStages(funnelsList, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funnelsList]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStaffList(),
        loadLeadsList(),
        loadFunnelsList(),
        loadKanbanBoard(),
        loadRecentActivities(),
        loadOngoingActivities(),
        loadActivityStats(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadFunnelsList = async () => {
    if (!token || !user) {
      console.warn('Missing token or user for funnel loading');
      return;
    }
    
    try {
      console.log('Loading funnels for user:', user._id || user.id);
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/funnels/coach/${user._id || user.id}/funnels`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }, 15000); // Increased timeout
      
      if (response.ok) {
        const data = await response.json();
        console.log('Funnels API response:', data);
        
        // Handle different response formats
        let funnels = [];
        if (data.success && data.data) {
          funnels = Array.isArray(data.data) ? data.data : [data.data];
        } else if (Array.isArray(data)) {
          funnels = data;
        } else if (data.funnels && Array.isArray(data.funnels)) {
          funnels = data.funnels;
        }
        
        console.log('Processed funnels:', funnels.length, funnels);
        
        // Ensure each funnel has required properties
        const processedFunnels = funnels.map(funnel => ({
          ...funnel,
          id: funnel._id || funnel.id || `funnel-${Date.now()}`,
          name: funnel.name || funnel.title || 'Unnamed Funnel',
          stages: funnel.stages || [],
          isActive: funnel.isActive ?? funnel.isPublished ?? true
        }));
        
        setFunnelsList(processedFunnels);
        
        // Load custom stages from localStorage or use funnel stages
        if (processedFunnels.length > 0) {
          loadCustomStages(processedFunnels);
        }
        
        customToast(`Loaded ${processedFunnels.length} funnels successfully`, 'success');
      } else {
        const errorText = await response.text();
        console.error('Funnels API error:', response.status, errorText);
        customToast(`Failed to load funnels: ${response.status}`, 'error');
      }
    } catch (error) {
      console.error('Error loading funnels list:', error);
      customToast('Error loading funnels. Please try again.', 'error');
      // Set empty array to prevent infinite loading
      setFunnelsList([]);
    }
  };
  
  const loadCustomStages = (funnels = [], forceReload = false) => {
    // Always try to load from localStorage first (unless force reload)
    if (!forceReload) {
      const savedStages = localStorage.getItem('taskCustomStages');
      if (savedStages) {
        try {
          const parsed = JSON.parse(savedStages);
          if (parsed && parsed.length > 0) {
            // Only use saved stages if no funnel is selected, or if we want to preserve custom stages
            if (!selectedFunnel) {
              setCustomStages(parsed);
              return;
            }
            // If funnel is selected but we have custom stages, merge them
            if (selectedFunnel && selectedFunnel.stages && selectedFunnel.stages.length > 0) {
              const funnelStages = selectedFunnel.stages.map((stage, index) => ({
                id: stage._id || stage.id || `funnel-stage-${index}`,
                name: stage.basicInfo?.title || stage.name || `Stage ${index + 1}`,
                order: index,
                color: 'blue',
                isFunnelStage: true
              }));
              // Merge: add funnel stages that don't exist in custom stages
              const merged = [...parsed];
              funnelStages.forEach(funnelStage => {
                if (!merged.find(s => s.id === funnelStage.id && s.name === funnelStage.name)) {
                  merged.push(funnelStage);
                }
              });
              setCustomStages(merged.sort((a, b) => a.order - b.order));
              return;
            }
          }
        } catch (e) {
          console.error('Error parsing saved stages:', e);
        }
      }
    }
    
    // If a funnel is selected, use its stages as base (but preserve custom stages)
    if (selectedFunnel && selectedFunnel.stages && selectedFunnel.stages.length > 0) {
      const funnelStages = selectedFunnel.stages.map((stage, index) => ({
        id: stage._id || stage.id || `funnel-stage-${index}`,
        name: stage.basicInfo?.title || stage.name || `Stage ${index + 1}`,
        order: index,
        color: 'blue',
        isFunnelStage: true
      }));
      
      // Merge with existing custom stages
      const existingCustom = customStages.filter(s => !s.isFunnelStage);
      const merged = [...existingCustom, ...funnelStages].sort((a, b) => a.order - b.order);
      setCustomStages(merged);
      if (!forceReload) {
        localStorage.setItem('taskCustomStages', JSON.stringify(merged));
      }
    } else if (funnels.length > 0 && funnels[0]?.stages && forceReload) {
      // Use first funnel's stages if available (only on initial load)
      const funnel = funnels[0];
      const funnelStages = funnel.stages.map((stage, index) => ({
        id: stage._id || stage.id || `funnel-stage-${index}`,
        name: stage.basicInfo?.title || stage.name || `Stage ${index + 1}`,
        order: index,
        color: 'blue',
        isFunnelStage: true
      }));
      setCustomStages(funnelStages);
    } else if (customStages.length === 0) {
      // Default stages only if no custom stages exist
      const defaultStages = [
        { id: 'Pending', name: 'Pending', order: 0, color: 'yellow' },
        { id: 'In Progress', name: 'In Progress', order: 1, color: 'blue' },
        { id: 'Completed', name: 'Completed', order: 2, color: 'green' },
        { id: 'Overdue', name: 'Overdue', order: 3, color: 'red' }
      ];
      setCustomStages(defaultStages);
    }
  };
  
  // Update stages when funnel selection changes (but preserve custom stages)
  useEffect(() => {
    if (selectedFunnel) {
      loadCustomStages([selectedFunnel], false); // false = don't force reload, preserve custom
    } else if (funnelsList.length > 0 && customStages.length === 0) {
      // Only load funnel stages if no custom stages exist
      loadCustomStages(funnelsList, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFunnel]);
  
  const loadLeadsList = async () => {
    if (!token) return;
    
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/leads?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }, 10000);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setLeadsList(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading leads list:', error);
    }
  };
  
  const loadStaffList = async () => {
    if (!token) return;
    
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/staff`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }, 10000);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStaffList(data.data || []);
          // Load tasks for each staff member
          loadTasksByStaff(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading staff list:', error);
    }
  };
  
  const loadTasksByStaff = async (staffMembers) => {
    if (!token || !staffMembers.length) return;
    
    try {
      // Get all tasks
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/workflow/tasks?limit=200`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }, 10000);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const tasks = data.data;
          
          // Group tasks by staff member
          const grouped = {};
          
          // Initialize with all staff
          staffMembers.forEach(staff => {
            grouped[staff._id] = {
              staff: staff,
              tasks: []
            };
          });
          
          // Also add coach's own tasks
          const userId = user?._id || user?.id;
          if (userId) {
            grouped[userId] = {
              staff: { _id: userId, name: 'Coach', email: user?.email },
              tasks: []
            };
          }
          
          // Assign tasks to staff
          tasks.forEach(task => {
            const assignedToId = task.assignedTo?._id || task.assignedTo;
            if (assignedToId && grouped[assignedToId]) {
              grouped[assignedToId].tasks.push(task);
            } else if (assignedToId) {
              // Staff not in list, create entry
              grouped[assignedToId] = {
                staff: task.assignedTo || { _id: assignedToId, name: 'Unknown' },
                tasks: [task]
              };
            }
          });
          
          setTasksByStaff(grouped);
        }
      }
    } catch (error) {
      console.error('Error loading tasks by staff:', error);
    }
  };
  
  // Helper function for fetch with timeout
  const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  };
  
  const loadKanbanBoard = async () => {
    if (!token) return;
    
    try {
      // Build query params
      const params = new URLSearchParams({ limit: '200' });
      if (filters.funnelId && filters.funnelId !== 'all') {
        params.append('funnelId', filters.funnelId);
      }
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/workflow/tasks?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }, 10000);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          let tasks = Array.isArray(data.data) ? data.data : [];
          
          // Apply filters
          if (filters.status !== 'all') tasks = tasks.filter(t => t.status === filters.status);
          if (filters.priority !== 'all') tasks = tasks.filter(t => t.priority === filters.priority);
          if (filters.assignedTo !== 'all') {
            const assignedToId = filters.assignedTo;
            tasks = tasks.filter(t => {
              const taskAssignedToId = t.assignedTo?._id || t.assignedTo;
              return taskAssignedToId?.toString() === assignedToId?.toString();
            });
          }
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            tasks = tasks.filter(t => 
              t.name?.toLowerCase().includes(searchLower) ||
              t.description?.toLowerCase().includes(searchLower)
            );
          }
          
          // Group by stages
          const stages = customStages.length > 0 ? customStages : [
            { id: 'Pending', name: 'Pending', order: 0 },
            { id: 'In Progress', name: 'In Progress', order: 1 },
            { id: 'Completed', name: 'Completed', order: 2 },
            { id: 'Overdue', name: 'Overdue', order: 3 }
          ];
          
          const grouped = {};
          stages.forEach(stage => {
            grouped[stage.id] = [];
          });
          
          tasks.forEach(task => {
            const taskStage = task.customStage || task.stage;
            const stageId = stages.find(s => s.id === taskStage || s.name === taskStage)?.id;
            
            if (stageId && grouped[stageId]) {
              grouped[stageId].push(task);
            } else {
              const status = task.status || 'Pending';
              if (status !== 'Completed' && task.dueDate && new Date(task.dueDate) < new Date()) {
                if (grouped['Overdue']) grouped['Overdue'].push(task);
                else grouped['Pending'] = grouped['Pending'] || [];
              } else if (grouped[status]) {
                grouped[status].push(task);
              } else {
                grouped['Pending'] = grouped['Pending'] || [];
                grouped['Pending'].push(task);
              }
            }
          });
          
          setKanbanData(grouped);
        }
      }
    } catch (error) {
      console.error('Error loading kanban board:', error);
    }
  };
  
  const loadRecentActivities = async () => {
    if (!token) return;
    
    try {
      const params = new URLSearchParams({
        limit: '100', // Increased limit to show more activities
        days: filters.dateRange
      });
      if (filters.status !== 'all') params.append('type', filters.status);
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/activities/recent?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }, 10000);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const activitiesData = data.data || [];
          setActivities(activitiesData);
          console.log('[Activities] Loaded', activitiesData.length, 'activities');
          return activitiesData; // Return for use in modal
        }
      } else {
        console.error('[Activities] API Error:', response.status);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
    return [];
  };
  
  const loadOngoingActivities = async () => {
    if (!token) return;
    
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/activities/ongoing`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }, 10000);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOngoingActivities(data.data || { tasks: [], appointments: [], staff: [] });
        }
      }
    } catch (error) {
      console.error('Error loading ongoing activities:', error);
    }
  };
  
  const loadActivityStats = async () => {
    if (!token) return;
    
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/activities/stats?days=${filters.dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }, 10000);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data || {});
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };
  
  // Handle task card click - show task details
  const handleTaskCardClick = (task) => {
    setSelectedTask(task);
    onTaskDetailOpen();
  };

  // Handle activity card click
  const handleActivityCardClick = async (type, data) => {
    setSelectedActivityType(type);
    
    // If it's recent activities, always reload to get fresh data
    if (type === 'recent') {
      const freshActivities = await loadRecentActivities();
      setSelectedActivityData(freshActivities || activities || []);
    } else {
      setSelectedActivityData(data || []);
    }
    
    onActivityModalOpen();
  };
  
  // Handle funnel selection
  const handleFunnelSelect = (funnelId) => {
    console.log('Funnel selected:', funnelId);
    
    if (funnelId === 'all' || !funnelId) {
      console.log('Clearing funnel selection');
      setSelectedFunnel(null);
      // Reload default stages
      loadCustomStages(funnelsList, true);
      return;
    }
    
    const funnel = funnelsList.find(f => (f._id || f.id) === funnelId);
    console.log('Found funnel:', funnel);
    
    if (!funnel) {
      console.error('Funnel not found:', funnelId, 'Available funnels:', funnelsList.map(f => ({ id: f._id || f.id, name: f.name })));
      customToast('Funnel not found', 'error');
      return;
    }
    
    setSelectedFunnel(funnel);
    if (funnel.stages && funnel.stages.length > 0) {
      console.log('Loading stages for funnel:', funnel.name, funnel.stages);
      loadCustomStages([funnel]);
    } else {
      console.log('No stages found for funnel, using defaults');
      loadCustomStages([]);
    }
  };
  
  // Handle drag and drop
  const handleDragStart = (e, task) => {
    try {
      setDraggedTask(task);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', task._id);
      e.target.style.opacity = '0.5';
      console.log('[Drag] Started dragging task:', task.name, 'ID:', task._id);
    } catch (error) {
      console.error('[Drag] Error starting drag:', error);
      // Fallback for browsers that don't support dataTransfer
      setDraggedTask(task);
    }
  };
  
  const handleDragEnd = (e) => {
    try {
      e.target.style.opacity = '1';
      setDraggedTask(null);
      setDragOverStage(null);
      console.log('[Drag] Drag ended');
    } catch (error) {
      console.error('[Drag] Error ending drag:', error);
      // Ensure cleanup even on error
      setDraggedTask(null);
      setDragOverStage(null);
    }
  };
  
  const handleDragOver = (e, stageId) => {
    try {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverStage(stageId);
      console.log('[Drag] Dragging over stage:', stageId);
    } catch (error) {
      console.error('[Drag] Error handling drag over:', error);
      // Fallback
      e.preventDefault();
      setDragOverStage(stageId);
    }
  };
  
  const handleDragLeave = (e) => {
    try {
      // Only clear if we're actually leaving the stage container
      if (!e.currentTarget.contains(e.relatedTarget)) {
        setDragOverStage(null);
        console.log('[Drag] Left stage area');
      }
    } catch (error) {
      console.error('[Drag] Error handling drag leave:', error);
      setDragOverStage(null);
    }
  };
  
  const handleDrop = async (e, targetStageId) => {
    try {
      e.preventDefault();
      e.stopPropagation();
      setDragOverStage(null);
      
      if (!draggedTask) {
        console.warn('[Drag] No task being dragged');
        return;
      }
      
      console.log('[Drag] Dropping task:', draggedTask.name, 'to stage:', targetStageId);
      
      // Validate target stage exists
      const targetStage = customStages.find(s => s.id === targetStageId) || 
                        ['Pending', 'In Progress', 'Completed', 'Overdue'].includes(targetStageId);
      
      if (!targetStage && !['Pending', 'In Progress', 'Completed', 'Overdue'].includes(targetStageId)) {
        console.error('[Drag] Invalid target stage:', targetStageId);
        toast({
          title: 'Error',
          description: 'Invalid target stage',
          status: 'error',
          duration: 2000,
          isClosable: true,
        });
        return;
      }
      
      // Map stage ID to status
      let newStatus = targetStageId;
      let newStageId = targetStageId;
      
      // If using custom stages, map to proper status
      if (targetStage) {
        newStatus = targetStage.name;
        newStageId = targetStage.id;
      }
      
      // Don't do anything if dropping in the same stage
      const currentStageId = draggedTask.customStage || draggedTask.stage || 'Pending';
      if (currentStageId === targetStageId) {
        console.log('[Drag] Same stage, no action needed');
        setDraggedTask(null);
        return;
      }
      
      // Update task status/stage
      await handleMoveTask(draggedTask._id, newStatus, newStageId);
      setDraggedTask(null);
      
    } catch (error) {
      console.error('[Drag] Error during drop:', error);
      toast({
        title: 'Error',
        description: 'Failed to move task. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setDraggedTask(null);
      setDragOverStage(null);
    }
  };
  
  // Enhanced move task handler with better error handling
  const handleMoveTask = async (taskId, newStatus, newStageId = null) => {
    try {
      if (!taskId) {
        throw new Error('Task ID is required');
      }
      
      if (!newStatus) {
        throw new Error('New status is required');
      }
      
      console.log('[MoveTask] Moving task:', taskId, 'to status:', newStatus, 'stage:', newStageId);
      
      const updateData = { 
        status: newStatus,
        updatedAt: new Date()
      };
      
      // Add custom stage if provided
      if (newStageId) {
        updateData.customStage = newStageId;
        // Also update stage field if it exists
        const stage = customStages.find(s => s.id === newStageId);
        if (stage) {
          updateData.stage = stage.name;
        }
      }
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/workflow/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updateData)
      }, 15000); // Increased timeout
      
      if (response.ok) {
        const result = await response.json();
        console.log('[MoveTask] Success:', result);
        
        toast({
          title: 'Success',
          description: `Task moved to ${newStatus}`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        
        // Reload data to reflect changes
        await loadKanbanBoard();
        
      } else {
        const errorData = await response.json().catch(() => ({ 
          message: `Server error (${response.status})` 
        }));
        
        console.error('[MoveTask] API Error:', response.status, errorData);
        
        throw new Error(errorData.message || `Failed to move task (${response.status})`);
      }
    } catch (error) {
      console.error('[MoveTask] Error:', error);
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to move task. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handle workflow/stage click - navigate to same page with workflow context
  const handleWorkflowClick = (funnel) => {
    if (!funnel) return;
    
    console.log('[Workflow] Clicked funnel:', funnel.name);
    
    // Set the selected funnel
    handleFunnelSelect(funnel._id || funnel.id);
    
    // Automatically switch to Workflow Board tab (index 1)
    setActiveTabIndex(1);
    
    // Show toast for feedback
    customToast(`Switched to ${funnel.name} workflow`, 'info');
    
    // The page stays the same, just updates the workflow context and switches tab
    // This maintains existing behavior while providing workflow navigation
  };
  

  // Handle stage click - focus on specific stage
  const handleStageClick = (stage) => {
    console.log('[Stage] Clicked stage:', stage.name);
    
    // Scroll to the stage
    const stageElement = document.getElementById(`stage-${stage.id}`);
    if (stageElement) {
      stageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight the stage temporarily
      stageElement.style.transition = 'all 0.3s';
      stageElement.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
      setTimeout(() => {
        stageElement.style.boxShadow = '';
      }, 2000);
    }
    
    customToast(`Focused on ${stage.name} stage`, 'info');
  };
  
  // Add custom stage
  const handleAddStage = () => {
    if (!newStageName.trim()) {
      toast({
        title: 'Error',
        description: 'Stage name is required',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    
    // Check if stage name already exists
    const existingStage = customStages.find(s => 
      s.name.toLowerCase() === newStageName.trim().toLowerCase()
    );
    
    if (existingStage) {
      toast({
        title: 'Error',
        description: 'A stage with this name already exists',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    
    // Find the highest order number
    const maxOrder = customStages.length > 0 
      ? Math.max(...customStages.map(s => s.order || 0))
      : -1;
    
    const newStage = {
      id: `custom-stage-${Date.now()}`,
      name: newStageName.trim(),
      order: maxOrder + 1,
      color: newStageColor,
      isFunnelStage: false
    };
    
    // Add to existing stages (don't override)
    const updatedStages = [...customStages, newStage].sort((a, b) => a.order - b.order);
    setCustomStages(updatedStages);
    localStorage.setItem('taskCustomStages', JSON.stringify(updatedStages));
    
    setNewStageName('');
    setNewStageColor('blue');
    onStageModalClose();
    
    toast({
      title: 'Success',
      description: 'Stage added successfully',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
    
    // Reload kanban board with new stages
    loadKanbanBoard();
  };
  
  // Reorder stages (move up/down)
  const handleReorderStage = (stageId, direction) => {
    const stages = [...customStages];
    const index = stages.findIndex(s => s.id === stageId);
    
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
      // Swap with previous
      [stages[index].order, stages[index - 1].order] = [stages[index - 1].order, stages[index].order];
    } else if (direction === 'down' && index < stages.length - 1) {
      // Swap with next
      [stages[index].order, stages[index + 1].order] = [stages[index + 1].order, stages[index].order];
    } else {
      return; // Can't move further
    }
    
    const sorted = stages.sort((a, b) => a.order - b.order);
    setCustomStages(sorted);
    localStorage.setItem('taskCustomStages', JSON.stringify(sorted));
    
    toast({
      title: 'Success',
      description: 'Stage order updated',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
    
    loadKanbanBoard();
  };
  
  // Delete custom stage
  const handleDeleteStage = (stageId) => {
    const updatedStages = customStages.filter(s => s.id !== stageId);
    setCustomStages(updatedStages);
    localStorage.setItem('taskCustomStages', JSON.stringify(updatedStages));
    
    toast({
      title: 'Success',
      description: 'Stage deleted successfully',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
    
    loadKanbanBoard();
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'green';
      default: return 'gray';
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'green';
      case 'In Progress': return 'blue';
      case 'Pending': return 'yellow';
      case 'Overdue': return 'red';
      default: return 'gray';
    }
  };
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading && activities.length === 0) {
    return <ProfessionalLoader />;
  }
  
  return (
    <Box bg="gray.50" minH="100vh" py={6} px={6}>
      <Box maxW="full" mx="auto">
        <VStack spacing={6} align="stretch" w="full">
          {/* Merged Top Section with Stats - Matching Calendar Design */}
          <Card 
            bg={cardBg} 
            backdropFilter="blur(20px)" 
            borderRadius="7px" 
            border="1px solid" 
            borderColor={borderColor}
            boxShadow="sm"
          >
            {/* Header with Title and Actions */}
            <CardHeader py={4} px={6} borderBottom="1px" borderColor="gray.100">
              <Flex justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Heading fontSize="2xl" fontWeight="700" color={textColor} letterSpacing="-0.5px">
                    Tasks & Activities
                  </Heading>
                  <Text color="gray.500" fontSize="sm">
                    Manage tasks, track activities, and monitor ongoing work
                  </Text>
                </VStack>
                <HStack spacing={2}>
                  <Button
                    leftIcon={<FiRefreshCw />}
                    onClick={loadData}
                    variant="ghost"
                    size="sm"
                    borderRadius="7px"
                    _hover={{ bg: 'gray.100' }}
                    color="gray.600"
                  >
                    Refresh
                  </Button>
                  <Button
                    leftIcon={<AddIcon />}
                    onClick={onTaskOpen}
                    bg="blue.500"
                    color="white"
                    size="sm"
                    _hover={{ bg: 'blue.600' }}
                    borderRadius="7px"
                    fontWeight="500"
                    px={4}
                  >
                    New Task
                  </Button>
                </HStack>
              </Flex>
            </CardHeader>
            
            {/* Stats Cards */}
            <CardBody px={6} py={5} borderBottom="1px" borderColor="gray.100">
              {loading ? (
                <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} variant="outline" borderRadius="xl" p={4}>
                      <HStack spacing={4} align="center" w="full">
                        <Skeleton height="60px" width="60px" borderRadius="xl" />
                        <VStack align="start" spacing={2} flex={1}>
                          <Skeleton height="16px" width="120px" borderRadius="md" />
                          <Skeleton height="32px" width="80px" borderRadius="lg" />
                        </VStack>
                        <Skeleton height="24px" width="60px" borderRadius="full" />
                      </HStack>
                    </Card>
                  ))}
                </SimpleGrid>
              ) : (
                <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
                  <StatsCard
                    title="Tasks"
                    value={Object.values(kanbanData).reduce((sum, tasks) => sum + (Array.isArray(tasks) ? tasks.length : 0), 0)}
                    icon={<Box as={FiCheckSquare} boxSize={5} />}
                    color="blue"
                  />
                  <StatsCard
                    title="Overdue"
                    value={kanbanData.Overdue?.length || 0}
                    icon={<Box as={FiAlertCircle} boxSize={5} />}
                    color="red"
                  />
                  <StatsCard
                    title="Activities"
                    value={stats.total || 0}
                    icon={<Box as={FiActivity} boxSize={5} />}
                    color="green"
                    onClick={() => handleActivityCardClick('recent', activities)}
                  />
                  <StatsCard
                    title="Ongoing"
                    value={ongoingActivities.tasks?.length || 0}
                    icon={<Box as={FiPlay} boxSize={5} />}
                    color="purple"
                    onClick={() => handleActivityCardClick('ongoing-tasks', ongoingActivities.tasks || [])}
                  />
                  <StatsCard
                    title="Upcoming"
                    value={ongoingActivities.appointments?.length || 0}
                    icon={<Box as={FiCalendar} boxSize={5} />}
                    color="orange"
                    onClick={() => handleActivityCardClick('appointments', ongoingActivities.appointments || [])}
                  />
                </SimpleGrid>
              )}
            </CardBody>
          </Card>
          
          {/* Filters - Matching Calendar Design */}
          <Card bg={cardBg} boxShadow="sm" border="1px" borderColor={borderColor} borderRadius="7px">
            <CardBody px={6} py={4}>
              <SimpleGrid columns={{ base: 1, md: 6 }} spacing={4}>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search tasks..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    bg={inputBg}
                    borderColor={borderColor}
                    _focus={{ borderColor: 'blue.400', bg: 'white' }}
                  />
                </InputGroup>
                <Select
                  value={filters.funnelId}
                  onChange={(e) => handleFunnelSelect(e.target.value)}
                  placeholder="Select Funnel"
                  bg={inputBg}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'blue.400', bg: 'white' }}
                  transition="all 0.2s"
                  _hover={{ borderColor: 'blue.300' }}
                >
                  <option value="all">All Funnels</option>
                  {funnelsList.map(funnel => (
                    <option key={funnel._id || funnel.id} value={funnel._id || funnel.id}>
                      {funnel.name || 'Unnamed Funnel'}
                    </option>
                  ))}
                </Select>
                <Select 
                  value={filters.status} 
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })} 
                  bg={inputBg} 
                  borderColor={borderColor} 
                  _focus={{ borderColor: 'blue.400', bg: 'white' }}
                  transition="all 0.2s"
                  _hover={{ borderColor: 'blue.300' }}
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Overdue">Overdue</option>
                </Select>
                <Select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  bg={inputBg}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'blue.400', bg: 'white' }}
                  transition="all 0.2s"
                  _hover={{ borderColor: 'blue.300' }}
                >
                  <option value="all">All Priorities</option>
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </Select>
                <Select
                  value={filters.assignedTo}
                  onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
                  bg={inputBg}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'blue.400', bg: 'white' }}
                  transition="all 0.2s"
                  _hover={{ borderColor: 'blue.300' }}
                >
                  <option value="all">All Staff</option>
                  <option value={user?._id || user?.id || 'coach'}>Coach (Me)</option>
                  {staffList.map(staff => (
                    <option key={staff._id} value={staff._id}>
                      {staff.name || staff.email}
                    </option>
                  ))}
                </Select>
                <HStack spacing={2}>
                  <Button
                    leftIcon={<FiPlus />}
                    onClick={onStageModalOpen}
                    variant="outline"
                    size="sm"
                    colorScheme="blue"
                    borderRadius="7px"
                  >
                    Add Stage
                  </Button>
                  <Button
                    leftIcon={<FiFilter />}
                    onClick={() => setFilters({
                      status: 'all',
                      priority: 'all',
                      assignedTo: 'all',
                      dateRange: '7',
                      search: '',
                      funnelId: 'all'
                    })}
                    variant="outline"
                    size="sm"
                    borderRadius="7px"
                  >
                    Clear
                  </Button>
                </HStack>
              </SimpleGrid>
            </CardBody>
          </Card>
          
          {/* Main Tab Navigation */}
          <Tabs defaultIndex={0} index={activeTabIndex} onChange={setActiveTabIndex}>
            <TabList bg="white" borderBottom="2px" borderColor="gray.200" px={6} py={3}>
              <Tab 
                fontSize="md" 
                fontWeight="600" 
                _selected={{ color: 'blue.600', borderBottomColor: 'blue.600' }}
                color="gray.600"
                pb={3}
              >
                All Workflows
              </Tab>
              <Tab 
                fontSize="md" 
                fontWeight="600" 
                _selected={{ color: 'blue.600', borderBottomColor: 'blue.600' }}
                color="gray.600"
                pb={3}
              >
                Workflow Board
              </Tab>
              <Tab 
                fontSize="md" 
                fontWeight="600" 
                _selected={{ color: 'blue.600', borderBottomColor: 'blue.600' }}
                color="gray.600"
                pb={3}
              >
                Activities
              </Tab>
              <Tab 
                fontSize="md" 
                fontWeight="600" 
                _selected={{ color: 'blue.600', borderBottomColor: 'blue.600' }}
                color="gray.600"
                pb={3}
              >
                Ongoing
              </Tab>
              <Tab 
                fontSize="md" 
                fontWeight="600" 
                _selected={{ color: 'blue.600', borderBottomColor: 'blue.600' }}
                color="gray.600"
                pb={3}
              >
                Staff Tasks
              </Tab>
            </TabList>
            
            <TabPanels>
              {/* All Workflows Tab - Table View */}
              <TabPanel px={0}>
                <Box mb={4} p={4} bg="linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)" borderRadius="md" border="1px" borderColor="blue.200">
                  <HStack spacing={3}>
                    <Box as={FiCheckSquare} color="blue.600" boxSize={5} />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="700" color="blue.800" fontSize="lg">All Workflows</Text>
                      <Text color="blue.600" fontSize="sm">Complete overview of all workflow boards. Click on any workflow to view its detailed kanban board.</Text>
                    </VStack>
                  </HStack>
                </Box>
                
                {/* Workflow Table */}
                <Card bg={cardBg} boxShadow="md" border="1px" borderColor={borderColor} borderRadius="7px">
                  <CardBody p={0}>
                    <TableContainer>
                      <Table variant="simple">
                        <Thead bg="linear-gradient(135deg, rgba(249, 250, 251, 1) 0%, rgba(243, 244, 246, 1) 100%)">
                          <Tr>
                            <Th fontWeight="600" color="gray.700" fontSize="sm" py={3}>Workflow Name</Th>
                            <Th fontWeight="600" color="gray.700" fontSize="sm" py={3}>Stages</Th>
                            <Th fontWeight="600" color="gray.700" fontSize="sm" py={3}>Active Tasks</Th>
                            <Th fontWeight="600" color="gray.700" fontSize="sm" py={3}>Status</Th>
                            <Th fontWeight="600" color="gray.700" fontSize="sm" py={3}>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {funnelsList.length > 0 ? (
                            funnelsList.map((funnel, index) => {
                              const funnelTasks = Object.values(kanbanData).reduce((sum, tasks) => sum + (Array.isArray(tasks) ? tasks.length : 0), 0);
                              return (
                                <Tr 
                                  key={funnel._id || funnel.id}
                                  _hover={{ bg: 'blue.50' }}
                                  transition="all 0.2s"
                                  cursor="pointer"
                                  onClick={() => handleWorkflowClick(funnel)}
                                >
                                  <Td py={4}>
                                    <VStack align="start" spacing={1}>
                                      <HStack spacing={2}>
                                        <Box
                                          w={3}
                                          h={3}
                                          bg="blue.500"
                                          borderRadius="full"
                                        />
                                        <Text fontWeight="600" color={textColor} fontSize="sm">
                                          {funnel.name || 'Unnamed Funnel'}
                                        </Text>
                                      </HStack>
                                      {funnel.description && (
                                        <Text fontSize="xs" color={mutedTextColor} noOfLines={1}>
                                          {funnel.description}
                                        </Text>
                                      )}
                                    </VStack>
                                  </Td>
                                  <Td>
                                    <HStack spacing={1}>
                                      <Badge colorScheme="blue" fontSize="xs" px={2} py={1}>
                                        {funnel.stages?.length || 0} stages
                                      </Badge>
                                    </HStack>
                                  </Td>
                                  <Td>
                                    <HStack spacing={2}>
                                      <Text fontWeight="600" color="blue.600" fontSize="sm">
                                        {funnelTasks}
                                      </Text>
                                      <Text fontSize="xs" color={mutedTextColor}>
                                        tasks
                                      </Text>
                                    </HStack>
                                  </Td>
                                  <Td>
                                    <Badge 
                                      colorScheme={funnel.isActive ? 'green' : 'yellow'} 
                                      variant="solid"
                                      fontSize="xs"
                                      px={2}
                                      py={1}
                                    >
                                      {funnel.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </Td>
                                  <Td>
                                    <HStack spacing={2}>
                                      <Button
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="blue"
                                        leftIcon={<FiEye />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleWorkflowClick(funnel);
                                        }}
                                      >
                                        View
                                      </Button>
                                      <Button
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="gray"
                                        leftIcon={<FiEdit />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          customToast('Edit workflow functionality coming soon', 'info');
                                        }}
                                      >
                                        Edit
                                      </Button>
                                    </HStack>
                                  </Td>
                                </Tr>
                              );
                            })
                          ) : (
                            <Tr>
                              <Td colSpan={5}>
                                <Center py={8}>
                                  <VStack spacing={3}>
                                    <Icon as={FiCheckSquare} boxSize={10} color="gray.400" />
                                    <Text color="gray.500" fontSize="md" fontWeight="500">
                                      No workflows found
                                    </Text>
                                    <Text fontSize="sm" color="gray.400">
                                      Create your first workflow to get started
                                    </Text>
                                    <Button
                                      leftIcon={<FiPlus />}
                                      colorScheme="blue"
                                      size="sm"
                                      onClick={() => customToast('Create workflow functionality coming soon', 'info')}
                                    >
                                      Create Workflow
                                    </Button>
                                  </VStack>
                                </Center>
                              </Td>
                            </Tr>
                          )}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </CardBody>
                </Card>
              </TabPanel>
              
              {/* Workflow Board Tab - Kanban View */}
              <TabPanel px={0}>
                <Box mb={4} p={4} bg="linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)" borderRadius="md" border="1px" borderColor="green.200">
                  <HStack spacing={3}>
                    <Box as={FiCheckSquare} color="green.600" boxSize={5} />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="700" color="green.800" fontSize="lg">Workflow Board</Text>
                      <Text color="green.600" fontSize="sm">Interactive kanban board for task management. Drag and drop tasks between stages to update their status.</Text>
                    </VStack>
                  </HStack>
                </Box>
                
                {/* Workflow Selection and Kanban Board */}
                <VStack spacing={6} align="stretch">
                  {/* Only show workflow controls when a workflow is selected */}
                  {selectedFunnel && (
                    <Card bg={cardBg} boxShadow="sm" border="1px" borderColor={borderColor} borderRadius="7px">
                      <CardBody px={6} py={4}>
                        <HStack justify="space-between" align="center">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="600" color={textColor} fontSize="md">
                              📊 {selectedFunnel.name} Workflow
                            </Text>
                            <Text fontSize="sm" color={mutedTextColor}>
                              {selectedFunnel.stages?.length || 0} stages • {Object.values(kanbanData).reduce((sum, tasks) => sum + (Array.isArray(tasks) ? tasks.length : 0), 0)} total tasks
                            </Text>
                          </VStack>
                          <HStack spacing={2}>
                            <Button
                              leftIcon={<FiArrowLeft />}
                              onClick={() => {
                                handleFunnelSelect('all');
                                setActiveTabIndex(0); // Go back to All Workflows tab
                              }}
                              variant="outline"
                              size="sm"
                              colorScheme="gray"
                              borderRadius="7px"
                            >
                              Back to All
                            </Button>
                            <Button
                              leftIcon={<FiPlus />}
                              onClick={onStageModalOpen}
                              variant="outline"
                              size="sm"
                              colorScheme="blue"
                              borderRadius="7px"
                            >
                              Add Stage
                            </Button>
                          </HStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  )}
                  
                  {/* Kanban Board - Only show when workflow is selected */}
                  {selectedFunnel ? (
                    <Box overflowX="auto" pb={4}>
                      <SimpleGrid 
                        columns={{ base: 1, md: customStages.length > 0 ? Math.min(customStages.length, 6) : 4 }} 
                        spacing={4}
                        minW="max-content"
                      >
                        {(customStages.length > 0 ? customStages : [
                          { id: 'Pending', name: 'Pending', order: 0, color: 'yellow' },
                          { id: 'In Progress', name: 'In Progress', order: 1, color: 'blue' },
                          { id: 'Completed', name: 'Completed', order: 2, color: 'green' },
                          { id: 'Overdue', name: 'Overdue', order: 3, color: 'red' }
                        ]).sort((a, b) => a.order - b.order).map((stage) => {
                          const stageId = stage.id;
                          const tasks = kanbanData[stageId] || [];
                          const isDragOver = dragOverStage === stageId;
                          
                          return (
                            <Card
                              key={stageId}
                              id={`stage-${stageId}`}
                              bg={cardBg}
                              boxShadow="md"
                              border="2px solid"
                              borderColor={isDragOver ? `${stage.color}.400` : borderColor}
                              minH="400px"
                              minW="280px"
                              onDragOver={(e) => handleDragOver(e, stageId)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, stageId)}
                              transition="all 0.2s"
                              cursor="default"
                              onClick={() => handleStageClick(stage)}
                              {...(isDragOver && {
                                bgGradient: `linear(to-b, ${stage.color}.50, ${stage.color}.100)`
                              })}
                            >
                              <CardHeader 
                                bg={`${stage.color}.50`} 
                                borderRadius="md" 
                                py={3}
                                cursor="pointer"
                                onClick={() => handleStageClick(stage)}
                                _hover={{ bg: `${stage.color}.100` }}
                                transition="all 0.2s"
                                borderBottom="1px solid"
                                borderColor={`${stage.color}.200`}
                              >
                                <HStack justify="space-between">
                                  <VStack align="start" spacing={0}>
                                    <Heading size="sm" color="gray.800" fontWeight="600">
                                      {stage.name}
                                    </Heading>
                                    {stage.isFunnelStage && (
                                      <Text fontSize="xs" color={`${stage.color}.600`} fontWeight="500">
                                        Funnel Stage
                                      </Text>
                                    )}
                                  </VStack>
                                  <VStack spacing={1} align="end">
                                    <Badge 
                                      colorScheme={stage.color} 
                                      fontSize="sm" 
                                      px={2} 
                                      py={1}
                                      borderRadius="md"
                                    >
                                      {tasks?.length || 0}
                                    </Badge>
                                    <HStack spacing={1}>
                                      <IconButton
                                        icon={<FiArrowUp />}
                                        size="xs"
                                        variant="ghost"
                                        colorScheme={stage.color}
                                        onClick={() => handleReorderStage(stageId, 'up')}
                                        isDisabled={stage.order === 0}
                                        aria-label="Move stage up"
                                      />
                                      <IconButton
                                        icon={<FiArrowDown />}
                                        size="xs"
                                        variant="ghost"
                                        colorScheme={stage.color}
                                        onClick={() => handleReorderStage(stageId, 'down')}
                                        isDisabled={stage.order === (customStages.length - 1)}
                                        aria-label="Move stage down"
                                      />
                                    </HStack>
                                  </VStack>
                                </HStack>
                              </CardHeader>
                              <CardBody py={3}>
                                <VStack spacing={2} align="stretch">
                                  {tasks && tasks.length > 0 ? (
                                    tasks.map((task, index) => (
                                      <Card
                                        key={task._id || index}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task)}
                                        onDragEnd={handleDragEnd}
                                        bg="white"
                                        boxShadow="sm"
                                        border="1px solid"
                                        borderColor="gray.200"
                                        cursor="grab"
                                        _hover={{ boxShadow: 'md', transform: 'translateY(-1px)', cursor: 'grab', borderColor: 'blue.300' }}
                                        _active={{ cursor: 'grabbing' }}
                                        transition="all 0.2s"
                                        onClick={() => handleTaskCardClick(task)}
                                        size="sm"
                                      >
                                        <CardBody p={3}>
                                          <VStack align="stretch" spacing={2}>
                                            {/* Task Header */}
                                            <HStack justify="space-between" align="start" spacing={2}>
                                              <Text 
                                                fontWeight="600" 
                                                color="gray.800" 
                                                fontSize="sm"
                                                cursor="pointer"
                                                _hover={{ color: 'blue.600' }}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleTaskCardClick(task);
                                                }}
                                              >
                                                {task.name}
                                              </Text>
                                              <Menu>
                                                <MenuButton
                                                  as={IconButton}
                                                  icon={<FiMoreVertical />}
                                                  variant="ghost"
                                                  size="xs"
                                                  onClick={(e) => e.stopPropagation()}
                                                />
                                                <MenuList fontSize="sm">
                                                  <MenuItem 
                                                    icon={<FiEye />}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleTaskCardClick(task);
                                                    }}
                                                  >
                                                    View Details
                                                  </MenuItem>
                                                  <MenuItem icon={<FiEdit />}>Edit Task</MenuItem>
                                                  <MenuDivider />
                                                  {customStages.length > 0 && customStages.filter(s => s.id !== stageId).map((otherStage) => (
                                                    <MenuItem 
                                                      key={otherStage.id}
                                                      icon={<FiCheckSquare />}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMoveTask(task._id, otherStage.name, otherStage.id);
                                                      }}
                                                    >
                                                      Move to {otherStage.name}
                                                    </MenuItem>
                                                  ))}
                                                  <MenuDivider />
                                                  <MenuItem icon={<FiTrash2 />} color="red.500">Delete Task</MenuItem>
                                                </MenuList>
                                              </Menu>
                                            </HStack>
                                            
                                            {/* Task Priority and Metadata */}
                                            <HStack justify="space-between" flexWrap="wrap" spacing={2}>
                                              <Badge 
                                                colorScheme={getPriorityColor(task.priority)} 
                                                size="xs" 
                                                px={2} 
                                                py={1}
                                                borderRadius="md"
                                              >
                                                {task.priority}
                                              </Badge>
                                              {task.estimatedHours && (
                                                <HStack spacing={1}>
                                                  <Icon as={FiClock} boxSize={3} color="gray.500" />
                                                  <Text fontSize="xs" color="gray.600">
                                                    {task.estimatedHours}h
                                                  </Text>
                                                </HStack>
                                              )}
                                            </HStack>
                                            
                                            {/* Due Date */}
                                            {task.dueDate && (
                                              <HStack spacing={1}>
                                                <Icon as={FiCalendar} boxSize={3} color="gray.500" />
                                                <Text fontSize="xs" color="gray.600">
                                                  {formatDate(task.dueDate)}
                                                </Text>
                                                {new Date(task.dueDate) < new Date() && task.status !== 'Completed' && (
                                                  <Badge colorScheme="red" size="xs" borderRadius="md">Overdue</Badge>
                                                )}
                                              </HStack>
                                            )}
                                            
                                            {/* Assigned Person */}
                                            {task.assignedTo && (
                                              <HStack spacing={2}>
                                                <Avatar 
                                                  size="xs" 
                                                  name={task.assignedTo.name || task.assignedTo.firstName || 'Unassigned'} 
                                                  bg="blue.500"
                                                />
                                                <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                                  {task.assignedTo.name || `${task.assignedTo.firstName || ''} ${task.assignedTo.lastName || ''}`.trim() || 'Unassigned'}
                                                </Text>
                                              </HStack>
                                            )}
                                            
                                            {/* Related Lead */}
                                            {task.relatedLead && (
                                              <HStack spacing={1}>
                                                <Icon as={FiUser} boxSize={3} color="gray.500" />
                                                <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                                  {task.relatedLead?.name || task.relatedLead?.email || 'N/A'}
                                                </Text>
                                              </HStack>
                                            )}
                                          </VStack>
                                        </CardBody>
                                      </Card>
                                    ))
                                  ) : (
                                    <Center py={6}>
                                      <VStack spacing={2}>
                                        <Icon as={FiCheckSquare} boxSize={8} color={mutedTextColor} />
                                        <Text color={mutedTextColor} fontSize="sm" textAlign="center">
                                          No tasks in {stage.name}
                                        </Text>
                                        <Text fontSize="xs" color="gray.400">
                                          Drag tasks here or create new ones
                                        </Text>
                                      </VStack>
                                    </Center>
                                  )}
                                </VStack>
                              </CardBody>
                            </Card>
                          );
                        })}
                      </SimpleGrid>
                    </Box>
                  ) : (
                    /* Show workflow selection when no workflow is selected */
                    <Center py={12}>
                      <VStack spacing={6}>
                        <Icon as={FiCheckSquare} boxSize={16} color="gray.300" />
                        <VStack spacing={2} align="center">
                          <Text fontSize="xl" fontWeight="600" color="gray.600">
                            Select a Workflow to View
                          </Text>
                          <Text fontSize="md" color="gray.400" textAlign="center">
                            Go to "All Workflows" tab and click on any workflow to view its kanban board
                          </Text>
                        </VStack>
                        <Button
                          colorScheme="blue"
                          size="lg"
                          onClick={() => setActiveTabIndex(0)}
                          leftIcon={<FiArrowLeft />}
                        >
                          Browse All Workflows
                        </Button>
                      </VStack>
                    </Center>
                  )}
                </VStack>
              </TabPanel>
              
              {/* Activities Tab - Past Events */}
              <TabPanel px={0}>
                <Box mb={4} p={4} bg="linear-gradient(135deg, rgba(251, 146, 60, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)" borderRadius="md" border="1px" borderColor="orange.200">
                  <HStack spacing={3}>
                    <Box as={FiActivity} color="orange.600" boxSize={5} />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="700" color="orange.800" fontSize="lg">Activities</Text>
                      <Text color="orange.600" fontSize="sm">View activities and events that have already happened. Track what was completed and when.</Text>
                    </VStack>
                  </HStack>
                </Box>
                <Card bg={cardBg} boxShadow="sm" border="1px" borderColor={borderColor} borderRadius="7px">
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {activities.length > 0 ? (
                        activities.map((activity, index) => (
                          <Card key={activity.id || index} bg={cardBg} size="sm" border="1px solid" borderColor={borderColor}>
                            <CardBody>
                              <HStack spacing={4} align="start">
                                <Box
                                  p={2}
                                  borderRadius="md"
                                  bg={`${getStatusColor(activity.status)}.100`}
                                >
                                  <Icon
                                    as={activity.type === 'task' ? FiCheckSquare : FiActivity}
                                    boxSize={5}
                                    color={`${getStatusColor(activity.status)}.600`}
                                  />
                                </Box>
                                <Box flex={1}>
                                  <HStack justify="space-between" mb={1}>
                                    <Text fontWeight="semibold" color={textColor} fontSize="sm">
                                      {activity.title}
                                    </Text>
                                    <Text fontSize="xs" color={mutedTextColor}>
                                      {formatDate(activity.timestamp)} {formatTime(activity.timestamp)}
                                    </Text>
                                  </HStack>
                                  <Text fontSize="xs" color={mutedTextColor} mb={2}>
                                    {activity.description}
                                  </Text>
                                  <HStack spacing={2}>
                                    <Badge colorScheme={getStatusColor(activity.status)} size="sm">
                                      {activity.type}
                                    </Badge>
                                    {activity.priority && (
                                      <Badge colorScheme={getPriorityColor(activity.priority)} size="sm">
                                        {activity.priority}
                                      </Badge>
                                    )}
                                  </HStack>
                                </Box>
                              </HStack>
                            </CardBody>
                          </Card>
                        ))
                      ) : (
                        <Center py={10}>
                          <VStack spacing={2}>
                            <Icon as={FiActivity} boxSize={10} color={mutedTextColor} />
                            <Text color={mutedTextColor}>No recent activities</Text>
                          </VStack>
                        </Center>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
              
              {/* Ongoing Tab - Live Work */}
              <TabPanel px={0}>
                <Box mb={4} p={4} bg="linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)" borderRadius="md" border="1px" borderColor="purple.200">
                  <HStack spacing={3}>
                    <Box as={FiPlay} color="purple.600" boxSize={5} />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="700" color="purple.800" fontSize="lg">Ongoing</Text>
                      <Text color="purple.600" fontSize="sm">Real-time view of currently active work and live operations. See what's happening right now.</Text>
                    </VStack>
                  </HStack>
                </Box>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  {/* Ongoing Tasks */}
                  <Card bg={cardBg} boxShadow="sm" border="1px" borderColor={borderColor} borderRadius="7px">
                    <CardHeader>
                      <Heading size="sm" color={textColor}>Ongoing Tasks</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={2} align="stretch">
                        {ongoingActivities.tasks && ongoingActivities.tasks.length > 0 ? (
                          ongoingActivities.tasks.map((task, index) => (
                            <Card key={task._id || index} bg={cardBg} size="sm" border="1px solid" borderColor={borderColor}>
                              <CardBody p={3}>
                                <Text fontWeight="semibold" color={textColor} fontSize="sm" mb={1}>
                                  {task.name}
                                </Text>
                                <HStack justify="space-between">
                                  <Badge colorScheme={getPriorityColor(task.priority)} size="sm">
                                    {task.priority}
                                  </Badge>
                                  <Text fontSize="xs" color={mutedTextColor}>
                                    Due: {formatDate(task.dueDate)}
                                  </Text>
                                </HStack>
                              </CardBody>
                            </Card>
                          ))
                        ) : (
                          <Text fontSize="sm" color={mutedTextColor} textAlign="center" py={4}>
                            No ongoing tasks
                          </Text>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                  
                  {/* Upcoming Appointments */}
                  <Card bg={cardBg} boxShadow="sm" border="1px" borderColor={borderColor} borderRadius="7px">
                    <CardHeader>
                      <Heading size="sm" color={textColor}>Upcoming Appointments</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={2} align="stretch">
                        {ongoingActivities.appointments && ongoingActivities.appointments.length > 0 ? (
                          ongoingActivities.appointments.map((appointment, index) => (
                            <Card key={appointment._id || index} bg={cardBg} size="sm" border="1px solid" borderColor={borderColor}>
                              <CardBody p={3}>
                                <Text fontWeight="semibold" color={textColor} fontSize="sm" mb={1}>
                                  {appointment.summary || 'Appointment'}
                                </Text>
                                <HStack justify="space-between">
                                  <Text fontSize="xs" color={mutedTextColor}>
                                    {appointment.leadId?.name || 'Lead'}
                                  </Text>
                                  <Text fontSize="xs" color={mutedTextColor}>
                                    {formatDate(appointment.startTime)} {formatTime(appointment.startTime)}
                                  </Text>
                                </HStack>
                              </CardBody>
                            </Card>
                          ))
                        ) : (
                          <Text fontSize="sm" color={mutedTextColor} textAlign="center" py={4}>
                            No upcoming appointments
                          </Text>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                  
                  {/* Active Staff */}
                  <Card bg={cardBg} boxShadow="sm" border="1px" borderColor={borderColor} borderRadius="7px">
                    <CardHeader>
                      <Heading size="sm" color={textColor}>Active Staff</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={2} align="stretch">
                        {ongoingActivities.staff && ongoingActivities.staff.length > 0 ? (
                          ongoingActivities.staff.map((staff, index) => (
                            <Card key={staff._id || index} bg={cardBg} size="sm" border="1px solid" borderColor={borderColor}>
                              <CardBody p={3}>
                                <HStack>
                                  <Avatar size="sm" name={staff.userId?.firstName || 'Staff'} />
                                  <Box flex={1}>
                                    <Text fontWeight="semibold" color={textColor} fontSize="sm">
                                      {staff.userId?.firstName} {staff.userId?.lastName}
                                    </Text>
                                    <Text fontSize="xs" color={mutedTextColor}>
                                      {staff.role || 'Staff Member'}
                                    </Text>
                                  </Box>
                                </HStack>
                              </CardBody>
                            </Card>
                          ))
                        ) : (
                          <Text fontSize="sm" color={mutedTextColor} textAlign="center" py={4}>
                            No active staff
                          </Text>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </TabPanel>
              
              {/* Staff Tasks Tab */}
              <TabPanel px={0}>
                <Box mb={4} p={4} bg="linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)" borderRadius="md" border="1px" borderColor="teal.200">
                  <HStack spacing={3}>
                    <Box as={FiUsers} color="teal.600" boxSize={5} />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="700" color="teal.800" fontSize="lg">Staff Tasks</Text>
                      <Text color="teal.600" fontSize="sm">View and manage tasks assigned to team members. Monitor workload and progress across staff.</Text>
                    </VStack>
                  </HStack>
                </Box>
                <Card bg={cardBg} boxShadow="sm" border="1px" borderColor={borderColor} borderRadius="7px">
                  <CardHeader>
                    <Heading size="md" color={textColor}>Tasks by Staff Member</Heading>
                  </CardHeader>
                  <CardBody>
                    {Object.keys(tasksByStaff).length === 0 ? (
                      <Center py={10}>
                        <VStack spacing={2}>
                          <Icon as={FiUsers} boxSize={10} color={mutedTextColor} />
                          <Text color={mutedTextColor}>No staff members found</Text>
                        </VStack>
                      </Center>
                    ) : (
                      <VStack spacing={6} align="stretch">
                        {Object.values(tasksByStaff).map((staffData, index) => {
                          const staff = staffData.staff;
                          const staffTasks = staffData.tasks || [];
                          
                          if (staffTasks.length === 0 && filters.assignedTo !== 'all') {
                            return null; // Skip if filtering and no tasks
                          }
                          
                          return (
                            <Card key={staff._id || index} bg={cardBg} border="1px solid" borderColor={borderColor}>
                              <CardHeader bg="blue.50" borderRadius="md">
                                <HStack justify="space-between">
                                  <HStack spacing={3}>
                                    <Avatar 
                                      size="md" 
                                      name={staff.name || staff.email || 'Staff'} 
                                      src={staff.avatar}
                                    />
                                    <Box>
                                      <Heading size="sm" color={textColor}>
                                        {staff.name || staff.email || 'Staff Member'}
                                      </Heading>
                                      <Text fontSize="xs" color={mutedTextColor}>
                                        {staff.email || staff.role || 'Staff'}
                                      </Text>
                                    </Box>
                                  </HStack>
                                  <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                                    {staffTasks.length} {staffTasks.length === 1 ? 'Task' : 'Tasks'}
                                  </Badge>
                                </HStack>
                              </CardHeader>
                              <CardBody>
                                {staffTasks.length === 0 ? (
                                  <Center py={6}>
                                    <Text color={mutedTextColor} fontSize="sm">
                                      No tasks assigned
                                    </Text>
                                  </Center>
                                ) : (
                                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                                    {staffTasks.map((task, taskIndex) => (
                                      <Card 
                                        key={task._id || taskIndex} 
                                        bg={cardBg} 
                                        border="1px solid" 
                                        borderColor={borderColor}
                                        _hover={{ boxShadow: 'md' }}
                                      >
                                        <CardBody p={3}>
                                          <VStack align="stretch" spacing={2}>
                                            <HStack justify="space-between">
                                              <Text fontWeight="semibold" color={textColor} fontSize="sm" noOfLines={1}>
                                                {task.name}
                                              </Text>
                                              <Badge colorScheme={getStatusColor(task.status)} size="sm">
                                                {task.status}
                                              </Badge>
                                            </HStack>
                                            {task.description && (
                                              <Text fontSize="xs" color={mutedTextColor} noOfLines={2}>
                                                {task.description}
                                              </Text>
                                            )}
                                            <HStack justify="space-between">
                                              <Badge colorScheme={getPriorityColor(task.priority)} size="sm">
                                                {task.priority}
                                              </Badge>
                                              <HStack spacing={1}>
                                                <Icon as={FiClock} boxSize={3} color={mutedTextColor} />
                                                <Text fontSize="xs" color={mutedTextColor}>
                                                  {formatDate(task.dueDate)}
                                                </Text>
                                              </HStack>
                                            </HStack>
                                            {task.relatedLead && (
                                              <HStack spacing={1}>
                                                <Icon as={FiUser} boxSize={3} color={mutedTextColor} />
                                                <Text fontSize="xs" color={mutedTextColor} noOfLines={1}>
                                                  Lead: {task.relatedLead?.name || task.relatedLead?.email || 'N/A'}
                                                </Text>
                                              </HStack>
                                            )}
                                            {/* Quick actions */}
                                            <HStack spacing={1} mt={1}>
                                              {task.status !== 'Completed' && (
                                                <Button
                                                  size="xs"
                                                  variant="ghost"
                                                  colorScheme="green"
                                                  onClick={() => handleMoveTask(task._id, 'Completed')}
                                                >
                                                  ✓ Complete
                                                </Button>
                                              )}
                                              {task.status !== 'In Progress' && task.status !== 'Completed' && (
                                                <Button
                                                  size="xs"
                                                  variant="ghost"
                                                  onClick={() => handleMoveTask(task._id, 'In Progress')}
                                                >
                                                  Start
                                                </Button>
                                              )}
                                            </HStack>
                                          </VStack>
                                        </CardBody>
                                      </Card>
                                    ))}
                                  </SimpleGrid>
                                )}
                              </CardBody>
                            </Card>
                          );
                        })}
                      </VStack>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>
                                      </TabPanels>
          </Tabs>
          
          {/* Create Task Modal */}
          <Modal isOpen={isTaskOpen} onClose={onTaskClose} size="xl">
            <ModalOverlay />
            <ModalContent bg={cardBg} color={textColor}>
              <ModalHeader>Create New Task</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Task Name</FormLabel>
                    <Input
                      value={taskForm.name}
                      onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                      placeholder="Enter task name"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      placeholder="Enter task description"
                      rows={3}
                    />
                  </FormControl>
                  
                  <SimpleGrid columns={2} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel>Stage</FormLabel>
                      <Select
                        value={taskForm.stage}
                        onChange={(e) => setTaskForm({ ...taskForm, stage: e.target.value })}
                      >
                        <option value="LEAD_GENERATION">Lead Generation</option>
                        <option value="LEAD_QUALIFICATION">Lead Qualification</option>
                        <option value="PROPOSAL">Proposal</option>
                        <option value="CLOSING">Closing</option>
                        <option value="ONBOARDING">Onboarding</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                  
                  <FormControl>
                    <FormLabel>Related Lead</FormLabel>
                    <Select
                      value={taskForm.relatedLead}
                      onChange={(e) => setTaskForm({ ...taskForm, relatedLead: e.target.value })}
                      placeholder="Select a lead (optional)"
                    >
                      <option value="">No Lead (General Task)</option>
                      {leadsList.map(lead => (
                        <option key={lead._id} value={lead._id}>
                          {lead.name || lead.email || lead.phone || 'Unnamed Lead'}
                        </option>
                      ))}
                    </Select>
                    <FormHelperText>
                      {leadsList.length === 0 
                        ? 'No leads found. A lead will be auto-selected if available, or you can create a task without a lead.'
                        : 'Select a lead this task is related to (optional)'}
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Assign To</FormLabel>
                    <Select
                      value={taskForm.assignedTo}
                      onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                      placeholder="Select staff member (optional)"
                    >
                      <option value="">Unassigned</option>
                      <option value={user?._id || user?.id || 'coach'}>Coach (Me)</option>
                      {staffList.map(staff => (
                        <option key={staff._id} value={staff._id}>
                          {staff.name || staff.email}
                        </option>
                      ))}
                    </Select>
                    <FormHelperText>Leave unassigned to assign to yourself</FormHelperText>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Due Date</FormLabel>
                    <Input
                      type="datetime-local"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Estimated Hours</FormLabel>
                    <Input
                      type="number"
                      value={taskForm.estimatedHours}
                      onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: parseFloat(e.target.value) || 1 })}
                      min={0.5}
                      step={0.5}
                    />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onTaskClose}>
                  Cancel
                </Button>
                  <Button
                  colorScheme="blue"
                  onClick={async () => {
                    try {
                      // Validate required fields
                      if (!taskForm.name || !taskForm.name.trim()) {
                        toast({
                          title: 'Error',
                          description: 'Task name is required',
                          status: 'error',
                          duration: 3000,
                          isClosable: true,
                        });
                        return;
                      }
                      
                      if (!taskForm.dueDate) {
                        toast({
                          title: 'Error',
                          description: 'Due date is required',
                          status: 'error',
                          duration: 3000,
                          isClosable: true,
                        });
                        return;
                      }
                      
                      // Prepare task payload - only include fields that have values
                      const taskPayload = {
                        name: taskForm.name.trim(),
                        description: taskForm.description || '',
                        dueDate: taskForm.dueDate,
                        priority: taskForm.priority || 'MEDIUM',
                        stage: taskForm.stage || 'LEAD_GENERATION',
                        estimatedHours: taskForm.estimatedHours || 1,
                        // If no assignment, assign to coach
                        assignedTo: taskForm.assignedTo || user?._id || user?.id || null
                      };
                      
                      // Only include relatedLead if it's provided and not empty
                      if (taskForm.relatedLead && taskForm.relatedLead.trim() !== '') {
                        taskPayload.relatedLead = taskForm.relatedLead;
                      }
                      
                      const response = await fetchWithTimeout(`${API_BASE_URL}/api/workflow/tasks`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                          'Accept': 'application/json'
                        },
                        body: JSON.stringify(taskPayload)
                      }, 10000);
                      
                      if (response.ok) {
                        toast({
                          title: 'Success',
                          description: 'Task created successfully',
                          status: 'success',
                          duration: 2000,
                          isClosable: true,
                        });
                        onTaskClose();
                        setTaskForm({
                          name: '',
                          description: '',
                          priority: 'MEDIUM',
                          stage: 'LEAD_GENERATION',
                          dueDate: '',
                          relatedLead: '',
                          estimatedHours: 1,
                          assignedTo: ''
                        });
                        loadKanbanBoard();
                        loadRecentActivities();
                        loadTasksByStaff(staffList);
                      } else {
                        const errorData = await response.json().catch(() => ({}));
                        const errorMessage = errorData.message || errorData.error || 'Failed to create task';
                        const errorSuggestion = errorData.suggestion || '';
                        
                        toast({
                          title: 'Error',
                          description: errorSuggestion ? `${errorMessage}. ${errorSuggestion}` : errorMessage,
                          status: 'error',
                          duration: 5000,
                          isClosable: true,
                        });
                        return;
                      }
                    } catch (error) {
                      toast({
                        title: 'Error',
                        description: error.message || 'Failed to create task. Please check your connection and try again.',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                      });
                    }
                  }}
                >
                  Create Task
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          
          {/* Activity Details Modal */}
          <Modal isOpen={isActivityModalOpen} onClose={onActivityModalClose} size="4xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                {selectedActivityType === 'recent' && `Recent Activities (${selectedActivityData?.length || activities.length || 0})`}
                {selectedActivityType === 'ongoing-tasks' && `Ongoing Tasks (${selectedActivityData?.length || 0})`}
                {selectedActivityType === 'appointments' && `Upcoming Appointments (${selectedActivityData?.length || 0})`}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody maxH="70vh" overflowY="auto">
                <VStack spacing={4} align="stretch">
                  {selectedActivityData && selectedActivityData.length > 0 ? (
                    selectedActivityData.map((activity, index) => (
                      <Card key={activity.id || index} bg={cardBg} border="1px solid" borderColor={borderColor}>
                        <CardBody>
                          <HStack spacing={4} align="start">
                            <Box
                              p={2}
                              borderRadius="md"
                              bg={`${getStatusColor(activity.status || 'Pending')}.100`}
                            >
                              <Icon
                                as={activity.type === 'task' ? FiCheckSquare : FiActivity}
                                boxSize={5}
                                color={`${getStatusColor(activity.status || 'Pending')}.600`}
                              />
                            </Box>
                            <VStack align="start" spacing={1} flex={1}>
                              <Text fontWeight="semibold" color={textColor}>
                                {activity.title || activity.name || 'Activity'}
                              </Text>
                              {activity.description && (
                                <Text fontSize="sm" color={mutedTextColor}>
                                  {activity.description}
                                </Text>
                              )}
                              <HStack spacing={4} fontSize="xs" color={mutedTextColor}>
                                {activity.timestamp && (
                                  <Text>{new Date(activity.timestamp).toLocaleString()}</Text>
                                )}
                                {activity.status && (
                                  <Badge colorScheme={getStatusColor(activity.status)}>
                                    {activity.status}
                                  </Badge>
                                )}
                              </HStack>
                            </VStack>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))
                  ) : (
                    <Center py={8}>
                      <VStack spacing={2}>
                        <Icon as={FiActivity} boxSize={10} color={mutedTextColor} />
                        <Text color={mutedTextColor} fontWeight="semibold">No activities found</Text>
                        {selectedActivityType === 'recent' && (
                          <Text fontSize="sm" color={mutedTextColor}>
                            Try refreshing or adjusting the date range filter
                          </Text>
                        )}
                      </VStack>
                    </Center>
                  )}
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button onClick={onActivityModalClose}>Close</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          
          {/* Task Detail Modal */}
          <Modal isOpen={isTaskDetailOpen} onClose={onTaskDetailClose} size="2xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Task Details</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {selectedTask && (
                  <VStack spacing={6} align="stretch">
                    {/* Task Title & Description */}
                    <Box>
                      <Text fontWeight="bold" fontSize="lg" color={textColor} mb={2}>
                        {selectedTask.name}
                      </Text>
                      {selectedTask.description && (
                        <Text color={mutedTextColor} mb={4}>
                          {selectedTask.description}
                        </Text>
                      )}
                    </Box>
                    
                    {/* Task Basic Info */}
                    <SimpleGrid columns={2} spacing={4}>
                      <Box>
                        <Text fontSize="sm" color={mutedTextColor} mb={1}>Priority</Text>
                        <Badge colorScheme={getPriorityColor(selectedTask.priority)}>
                          {selectedTask.priority}
                        </Badge>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color={mutedTextColor} mb={1}>Status</Text>
                        <Badge colorScheme={getStatusColor(selectedTask.status)}>
                          {selectedTask.status}
                        </Badge>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color={mutedTextColor} mb={1}>Due Date</Text>
                        <Text>
                          {selectedTask.dueDate 
                            ? `${formatDate(selectedTask.dueDate)} ${formatTime(selectedTask.dueDate)}`
                            : 'Not set'}
                        </Text>
                      </Box>
                      {selectedTask.estimatedHours && (
                        <Box>
                          <Text fontSize="sm" color={mutedTextColor} mb={1}>Estimated Hours</Text>
                          <Text>{selectedTask.estimatedHours}h</Text>
                        </Box>
                      )}
                      {selectedTask.assignedTo && (
                        <Box>
                          <Text fontSize="sm" color={mutedTextColor} mb={1}>Assigned To</Text>
                          <HStack spacing={2}>
                            <Avatar 
                              size="sm" 
                              name={selectedTask.assignedTo.name || selectedTask.assignedTo.firstName} 
                            />
                            <Text>
                              {selectedTask.assignedTo.name || 
                               `${selectedTask.assignedTo.firstName || ''} ${selectedTask.assignedTo.lastName || ''}`.trim()}
                            </Text>
                          </HStack>
                        </Box>
                      )}
                      {selectedTask.relatedLead && (
                        <Box>
                          <Text fontSize="sm" color={mutedTextColor} mb={1}>Related Lead</Text>
                          <Text>
                            {selectedTask.relatedLead.name || 
                             selectedTask.relatedLead.email || 
                             selectedTask.relatedLead.phone || 
                             'N/A'}
                          </Text>
                        </Box>
                      )}
                    </SimpleGrid>

                    {/* NEW: Task Origin */}
                    <Box bg="gray.50" p={4} borderRadius="md" border="1px" borderColor="gray.200">
                      <Text fontWeight="600" color={textColor} mb={2} fontSize="sm">
                        📋 Task Origin
                      </Text>
                      <HStack spacing={4}>
                        <Badge colorScheme="blue" variant="outline">
                          {selectedTask.createdVia || 'Manual'}
                        </Badge>
                        <Text fontSize="xs" color={mutedTextColor}>
                          Created on {selectedTask.createdAt ? formatDate(selectedTask.createdAt) : 'Unknown'}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color={mutedTextColor} mt={2}>
                        This task was created {selectedTask.createdVia === 'automation' ? 'automatically' : selectedTask.createdVia === 'system' ? 'by the system' : 'manually'} 
                        {selectedTask.triggerEvent && ` triggered by: ${selectedTask.triggerEvent}`}
                      </Text>
                    </Box>

                    {/* NEW: Task Activity Log (Mini Timeline) */}
                    <Box>
                      <Text fontWeight="600" color={textColor} mb={3} fontSize="sm">
                        📊 Task Activity Log
                      </Text>
                      <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
                        {/* Task Created */}
                        <HStack spacing={3} p={2} bg="blue.50" borderRadius="md">
                          <Box as={FiPlus} color="blue.600" boxSize={4} />
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontSize="xs" fontWeight="500" color="blue.800">Task Created</Text>
                            <Text fontSize="xs" color="blue.600">
                              {selectedTask.createdAt ? `${formatDate(selectedTask.createdAt)} at ${formatTime(selectedTask.createdAt)}` : 'Unknown time'}
                            </Text>
                          </VStack>
                        </HStack>
                        
                        {/* Status Changes */}
                        {selectedTask.statusHistory?.map((history, index) => (
                          <HStack key={index} spacing={3} p={2} bg="yellow.50" borderRadius="md">
                            <Box as={FiArrowRight} color="yellow.600" boxSize={4} />
                            <VStack align="start" spacing={0} flex={1}>
                              <Text fontSize="xs" fontWeight="500" color="yellow.800">Status Changed</Text>
                              <Text fontSize="xs" color="yellow.600">
                                {history.fromStatus} → {history.toStatus}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {history.timestamp ? `${formatDate(history.timestamp)} at ${formatTime(history.timestamp)}` : 'Unknown time'}
                              </Text>
                            </VStack>
                          </HStack>
                        )) || (
                          <Text fontSize="xs" color="gray.400" textAlign="center" py={2}>
                            No status changes recorded
                          </Text>
                        )}
                        
                        {/* Task Completed (if applicable) */}
                        {selectedTask.status === 'Completed' && (
                          <HStack spacing={3} p={2} bg="green.50" borderRadius="md">
                            <Box as={FiCheckCircle} color="green.600" boxSize={4} />
                            <VStack align="start" spacing={0} flex={1}>
                              <Text fontSize="xs" fontWeight="500" color="green.800">Task Completed</Text>
                              <Text fontSize="xs" color="green.600">
                                {selectedTask.completedAt ? `${formatDate(selectedTask.completedAt)} at ${formatTime(selectedTask.completedAt)}` : 'Unknown time'}
                              </Text>
                            </VStack>
                          </HStack>
                        )}
                      </VStack>
                    </Box>

                    {/* NEW: Quick Execution Actions */}
                    <Box>
                      <Text fontWeight="600" color={textColor} mb={3} fontSize="sm">
                        ⚡ Quick Actions
                      </Text>
                      <Wrap spacing={2}>
                        {selectedTask.relatedLead?.phone && (
                          <Button 
                            size="sm" 
                            leftIcon={<FiPhone />} 
                            colorScheme="green" 
                            variant="outline"
                            onClick={() => {
                              customToast(`Calling ${selectedTask.relatedLead.name || selectedTask.relatedLead.phone}...`, 'info');
                              // Log activity
                            }}
                          >
                            Call Lead
                          </Button>
                        )}
                        {selectedTask.relatedLead?.phone && (
                          <Button 
                            size="sm" 
                            leftIcon={<FiMessageSquare />} 
                            colorScheme="green" 
                            variant="outline"
                            onClick={() => {
                              customToast(`Opening WhatsApp for ${selectedTask.relatedLead.name || selectedTask.relatedLead.phone}...`, 'info');
                              // Log activity
                            }}
                          >
                            WhatsApp
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          leftIcon={<FiEdit />} 
                          colorScheme="blue" 
                          variant="outline"
                          onClick={() => {
                            customToast('Adding note to task...', 'info');
                            // Log activity
                          }}
                        >
                          Add Note
                        </Button>
                        {selectedTask.status !== 'Completed' && (
                          <Button 
                            size="sm" 
                            leftIcon={<FiCheck />} 
                            colorScheme="green" 
                            onClick={() => {
                              customToast('Task marked as completed!', 'success');
                              // Update task status and log activity
                              onTaskDetailClose();
                            }}
                          >
                            Complete Task
                          </Button>
                        )}
                      </Wrap>
                    </Box>
                  </VStack>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onTaskDetailClose}>
                  Close
                </Button>
                <Button colorScheme="blue">Edit Task</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          
          {/* Add Stage Modal */}
          <Modal isOpen={isStageModalOpen} onClose={onStageModalClose} size="md">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Add Custom Stage</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Stage Name</FormLabel>
                    <Input
                      value={newStageName}
                      onChange={(e) => setNewStageName(e.target.value)}
                      placeholder="Enter stage name"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Stage Color</FormLabel>
                    <SimpleGrid columns={5} spacing={2}>
                      {['blue', 'green', 'yellow', 'red', 'purple', 'orange', 'pink', 'teal', 'cyan', 'gray'].map(color => (
                        <Box
                          key={color}
                          w={8}
                          h={8}
                          bg={`${color}.500`}
                          borderRadius="md"
                          cursor="pointer"
                          border={newStageColor === color ? '2px solid' : '2px solid transparent'}
                          borderColor={newStageColor === color ? `${color}.700` : 'transparent'}
                          onClick={() => setNewStageColor(color)}
                          _hover={{ transform: 'scale(1.1)' }}
                          transition="all 0.2s"
                        />
                      ))}
                    </SimpleGrid>
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="outline" mr={3} onClick={onStageModalClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleAddStage}>
                  Add Stage
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* New Workflow Modal */}
          <Modal isOpen={isWorkflowModalOpen} onClose={onWorkflowModalClose} size="lg">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Create New Workflow</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Workflow Name</FormLabel>
                    <Input
                      placeholder="Enter workflow name"
                      defaultValue=""
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      placeholder="Describe the workflow purpose"
                      rows={3}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Workflow Type</FormLabel>
                    <Select placeholder="Select workflow type">
                      <option value="lead">Lead Management</option>
                      <option value="task">Task Management</option>
                      <option value="approval">Approval Process</option>
                      <option value="custom">Custom Workflow</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Default Stages</FormLabel>
                    <SimpleGrid columns={2} spacing={2}>
                      <Checkbox defaultChecked>Lead Generation</Checkbox>
                      <Checkbox defaultChecked>Qualification</Checkbox>
                      <Checkbox defaultChecked>Proposal</Checkbox>
                      <Checkbox defaultChecked>Negotiation</Checkbox>
                      <Checkbox defaultChecked>Closing</Checkbox>
                      <Checkbox>Follow-up</Checkbox>
                    </SimpleGrid>
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="outline" mr={3} onClick={onWorkflowModalClose}>
                  Cancel
                </Button>
                <Button colorScheme="green" onClick={() => {
                  customToast('Workflow created successfully!', 'success');
                  onWorkflowModalClose();
                }}>
                  Create Workflow
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Assign Workflow Modal */}
          <Modal isOpen={isAssignWorkflowModalOpen} onClose={onAssignWorkflowModalClose} size="lg">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Assign Workflow to Funnel</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Select Funnel</FormLabel>
                    <Select placeholder="Choose a funnel">
                      {funnelsList.map(funnel => (
                        <option key={funnel._id || funnel.id} value={funnel._id || funnel.id}>
                          {funnel.name || 'Unnamed Funnel'}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Select Workflow</FormLabel>
                    <Select placeholder="Choose a workflow">
                      <option value="workflow-1">Lead Conversion Workflow</option>
                      <option value="workflow-2">Task Management Workflow</option>
                      <option value="workflow-3">Customer Onboarding</option>
                      <option value="workflow-4">Sales Process</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Assignment Type</FormLabel>
                    <RadioGroup defaultValue="replace">
                      <VStack align="start">
                        <Radio value="replace">Replace existing stages</Radio>
                        <Radio value="merge">Merge with existing stages</Radio>
                        <Radio value="append">Append to existing stages</Radio>
                      </VStack>
                    </RadioGroup>
                  </FormControl>
                  
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="bold">Note:</Text>
                      <Text fontSize="sm">Assigning a workflow will modify the funnel's stage structure. This action can be undone.</Text>
                    </Box>
                  </Alert>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="outline" mr={3} onClick={onAssignWorkflowModalClose}>
                  Cancel
                </Button>
                <Button colorScheme="purple" onClick={() => {
                  customToast('Workflow assigned to funnel successfully!', 'success');
                  onAssignWorkflowModalClose();
                }}>
                  Assign Workflow
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          </VStack>
      </Box>
    </Box>
  );
};

export default TasksAndActivities;
