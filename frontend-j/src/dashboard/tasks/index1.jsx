import React, { useState, useEffect } from 'react';
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
} from 'react-icons/fi';
// Using a simpler approach without drag-and-drop library for now
// Can be enhanced with @hello-pangea/dnd later if needed

import { API_BASE_URL } from '../../config/apiConfig';

const TasksAndActivities = () => {
  const navigate = useNavigate();
  const authState = useSelector(state => state.auth);
  const user = authState?.user;
  const token = getToken(authState);
  const toast = useToast();
  
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
    dueDate: '',
    relatedLead: '',
    estimatedHours: 1,
    assignedTo: ''
  });
  
  // Load data
  useEffect(() => {
    loadData();
  }, [filters]);
  
  // Initialize custom stages on mount (only if no custom stages exist)
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
        loadActivityStats()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadFunnelsList = async () => {
    if (!token) return;
    
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/funnels/coach/${user?._id || user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }, 10000);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setFunnelsList(data.data || []);
          // Load custom stages from localStorage or use funnel stages
          loadCustomStages(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading funnels list:', error);
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
      
      // Get all tasks and group by status/stage
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/workflow/tasks?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }, 10000);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[Tasks] API Response:', data);
        if (data.success && data.data) {
          let tasks = Array.isArray(data.data) ? data.data : [];
          console.log(`[Tasks] Loaded ${tasks.length} tasks`);
          
          // Filter by funnel if selected
          if (filters.funnelId && filters.funnelId !== 'all') {
            tasks = tasks.filter(t => {
              const taskFunnelId = t.relatedLead?.funnelId?._id || t.relatedLead?.funnelId || t.funnelId;
              return taskFunnelId?.toString() === filters.funnelId?.toString();
            });
          }
          
          // Apply other filters
          if (filters.status !== 'all') {
            tasks = tasks.filter(t => t.status === filters.status);
          }
          if (filters.priority !== 'all') {
            tasks = tasks.filter(t => t.priority === filters.priority);
          }
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
          
          // Group tasks by custom stages or default status
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
            // Check if task has a custom stage
            const taskStage = task.customStage || task.stage;
            const stageId = stages.find(s => s.id === taskStage || s.name === taskStage)?.id;
            
            if (stageId && grouped[stageId]) {
              grouped[stageId].push(task);
            } else {
              // Fallback to status-based grouping
              const status = task.status || 'Pending';
              // Check if overdue
              if (status !== 'Completed' && task.dueDate && new Date(task.dueDate) < new Date()) {
                if (grouped['Overdue']) {
                  grouped['Overdue'].push(task);
                } else {
                  grouped['Pending'] = grouped['Pending'] || [];
                  grouped['Pending'].push(task);
                }
              } else if (grouped[status]) {
                grouped[status].push(task);
              } else {
                grouped['Pending'] = grouped['Pending'] || [];
                grouped['Pending'].push(task);
              }
            }
          });
          
          console.log('[Tasks] Grouped tasks:', grouped);
          setKanbanData(grouped);
        } else {
          console.warn('[Tasks] API response missing data:', data);
          setKanbanData({});
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Tasks] API Error:', response.status, errorData);
        toast({
          title: 'Error loading tasks',
          description: errorData.message || `Failed to load tasks (${response.status})`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error loading kanban board:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load tasks',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
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
    setFilters({ ...filters, funnelId });
    if (funnelId === 'all') {
      setSelectedFunnel(null);
      loadCustomStages([]);
    } else {
      const funnel = funnelsList.find(f => (f._id || f.id) === funnelId);
      setSelectedFunnel(funnel);
      if (funnel && funnel.stages) {
        loadCustomStages([funnel]);
      }
    }
  };
  
  // Handle drag and drop
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.5';
  };
  
  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedTask(null);
    setDragOverStage(null);
  };
  
  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageId);
  };
  
  const handleDragLeave = () => {
    setDragOverStage(null);
  };
  
  const handleDrop = async (e, targetStageId) => {
    e.preventDefault();
    setDragOverStage(null);
    
    if (!draggedTask) return;
    
    // Map stage ID to status if needed
    const stage = customStages.find(s => s.id === targetStageId);
    let newStatus = targetStageId;
    
    // If using custom stages, we might need to map to status
    if (stage) {
      // For now, use the stage name as status or keep custom stage
      newStatus = stage.name;
    }
    
    // Update task status/stage
    await handleMoveTask(draggedTask._id, newStatus, targetStageId);
    setDraggedTask(null);
  };
  
  // Enhanced move task handler
  const handleMoveTask = async (taskId, newStatus, newStageId = null) => {
    try {
      const updateData = { status: newStatus };
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
      }, 10000);
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Task moved successfully',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        loadKanbanBoard();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to move task');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to move task',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handle task card click - open detail modal
  const handleTaskCardClick = (task) => {
    setSelectedTask(task);
    onTaskDetailOpen();
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
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }
  
  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="7xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <Box>
              <Heading size="xl" color={textColor} mb={2}>
                Tasks & Activities
              </Heading>
              <Text color={mutedTextColor} fontSize="lg">
                Manage tasks, track activities, and monitor ongoing work
              </Text>
            </Box>
            <HStack spacing={3}>
              <Button
                leftIcon={<FiRefreshCw />}
                onClick={loadData}
                variant="outline"
                size="sm"
                colorScheme="blue"
              >
                Refresh
              </Button>
              <Button
                leftIcon={<FiPlus />}
                onClick={onTaskOpen}
                colorScheme="blue"
                size="sm"
              >
                New Task
              </Button>
            </HStack>
          </HStack>
          
          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
            <Card bg={cardBg} boxShadow="md">
              <CardBody>
                <Stat>
                  <StatLabel color={mutedTextColor}>Total Tasks</StatLabel>
                  <StatNumber color={textColor}>
                    {Object.values(kanbanData).reduce((sum, tasks) => sum + (Array.isArray(tasks) ? tasks.length : 0), 0)}
                  </StatNumber>
                  <StatHelpText color="blue.500">
                    Active: {kanbanData['In Progress']?.length || kanbanData['in-progress']?.length || 0}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card bg={cardBg} boxShadow="md">
              <CardBody>
                <Stat>
                  <StatLabel color={mutedTextColor}>Overdue</StatLabel>
                  <StatNumber color="red.500">{kanbanData.Overdue?.length || 0}</StatNumber>
                  <StatHelpText color="red.500">Requires attention</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card 
              bg={cardBg} 
              boxShadow="md"
              cursor="pointer"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s"
              onClick={() => handleActivityCardClick('recent', activities)}
            >
              <CardBody>
                <Stat>
                  <StatLabel color={mutedTextColor}>Recent Activities</StatLabel>
                  <StatNumber color={textColor}>{stats.total || 0}</StatNumber>
                  <StatHelpText color="green.500">Last {filters.dateRange} days - Click to view</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card 
              bg={cardBg} 
              boxShadow="md"
              cursor="pointer"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s"
              onClick={() => handleActivityCardClick('ongoing-tasks', ongoingActivities.tasks || [])}
            >
              <CardBody>
                <Stat>
                  <StatLabel color={mutedTextColor}>Ongoing Tasks</StatLabel>
                  <StatNumber color={textColor}>{ongoingActivities.tasks?.length || 0}</StatNumber>
                  <StatHelpText color="blue.500">In progress - Click to view</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card 
              bg={cardBg} 
              boxShadow="md"
              cursor="pointer"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s"
              onClick={() => handleActivityCardClick('appointments', ongoingActivities.appointments || [])}
            >
              <CardBody>
                <Stat>
                  <StatLabel color={mutedTextColor}>Upcoming</StatLabel>
                  <StatNumber color={textColor}>{ongoingActivities.appointments?.length || 0}</StatNumber>
                  <StatHelpText color="purple.500">Appointments - Click to view</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          {/* Filters */}
          <Card bg={cardBg} boxShadow="md">
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 6 }} spacing={4}>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search tasks..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </InputGroup>
                <Select
                  value={filters.funnelId}
                  onChange={(e) => handleFunnelSelect(e.target.value)}
                  placeholder="Select Funnel"
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
                    size="md"
                    colorScheme="blue"
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
                    size="md"
                  >
                    Clear
                  </Button>
                </HStack>
              </SimpleGrid>
            </CardBody>
          </Card>
          
          {/* Tabs: Kanban Board, Activity Feed, and Staff View */}
          <Tabs defaultIndex={0}>
            <TabList>
              <Tab>Kanban Board</Tab>
              <Tab>Activity Feed</Tab>
              <Tab>Ongoing Activities</Tab>
              <Tab>Staff Tasks</Tab>
            </TabList>
            
            <TabPanels>
              {/* Kanban Board Tab */}
              <TabPanel px={0}>
                <SimpleGrid 
                  columns={{ base: 1, md: customStages.length > 0 ? Math.min(customStages.length, 6) : 4 }} 
                  spacing={4}
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
                        bg={cardBg}
                        boxShadow="md"
                        border="2px solid"
                        borderColor={isDragOver ? `${stage.color}.400` : borderColor}
                        minH="500px"
                        onDragOver={(e) => handleDragOver(e, stageId)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, stageId)}
                        transition="all 0.2s"
                        {...(isDragOver && {
                          bgGradient: `linear(to-b, ${stage.color}.50, ${stage.color}.100)`
                        })}
                      >
                        <CardHeader bg={`${stage.color}.50`} borderRadius="md">
                          <HStack justify="space-between">
                            <Heading size="sm" color={textColor}>
                              {stage.name}
                            </Heading>
                            <Badge colorScheme={stage.color}>
                              {tasks?.length || 0}
                            </Badge>
                          </HStack>
                        </CardHeader>
                        <CardBody>
                          <VStack spacing={3} align="stretch">
                            {tasks && tasks.length > 0 ? (
                              tasks.map((task, index) => (
                                <Card
                                  key={task._id || index}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, task)}
                                  onDragEnd={handleDragEnd}
                                  bg={cardBg}
                                  boxShadow="sm"
                                  border="1px solid"
                                  borderColor={borderColor}
                                  cursor="grab"
                                  _hover={{ boxShadow: 'md', transform: 'translateY(-2px)', cursor: 'grab' }}
                                  _active={{ cursor: 'grabbing' }}
                                  transition="all 0.2s"
                                  onClick={() => handleTaskCardClick(task)}
                                >
                                <CardBody p={4}>
                                  <VStack align="stretch" spacing={3}>
                                    {/* Header with task name and menu */}
                                    <HStack justify="space-between" align="start">
                                      <VStack align="start" spacing={1} flex={1}>
                                        <Text 
                                          fontWeight="bold" 
                                          color={textColor} 
                                          fontSize="md"
                                          cursor="pointer"
                                          _hover={{ color: 'blue.500' }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleTaskCardClick(task);
                                          }}
                                        >
                                          {task.name}
                                        </Text>
                                        {task.description && (
                                          <Text fontSize="xs" color={mutedTextColor} noOfLines={2}>
                                            {task.description}
                                          </Text>
                                        )}
                                      </VStack>
                                      <Menu>
                                        <MenuButton
                                          as={IconButton}
                                          icon={<FiMoreVertical />}
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                        <MenuList>
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
                                          {customStages.length === 0 && (
                                            <>
                                              {stageId !== 'Pending' && (
                                                <MenuItem 
                                                  icon={<FiCheckSquare />}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMoveTask(task._id, 'Pending');
                                                  }}
                                                >
                                                  Move to Pending
                                                </MenuItem>
                                              )}
                                              {stageId !== 'In Progress' && (
                                                <MenuItem 
                                                  icon={<FiCheckSquare />}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMoveTask(task._id, 'In Progress');
                                                  }}
                                                >
                                                  Move to In Progress
                                                </MenuItem>
                                              )}
                                              {stageId !== 'Completed' && (
                                                <MenuItem 
                                                  icon={<FiCheckSquare />}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMoveTask(task._id, 'Completed');
                                                  }}
                                                >
                                                  Move to Completed
                                                </MenuItem>
                                              )}
                                            </>
                                          )}
                                          <MenuDivider />
                                          <MenuItem icon={<FiTrash2 />} color="red.500">Delete Task</MenuItem>
                                        </MenuList>
                                      </Menu>
                                    </HStack>
                                    
                                    {/* Task metadata */}
                                    <HStack justify="space-between" flexWrap="wrap" spacing={2}>
                                      <Badge colorScheme={getPriorityColor(task.priority)} size="sm" px={2} py={1}>
                                        {task.priority}
                                      </Badge>
                                      {task.estimatedHours && (
                                        <HStack spacing={1}>
                                          <Icon as={FiClock} boxSize={3} color={mutedTextColor} />
                                          <Text fontSize="xs" color={mutedTextColor}>
                                            {task.estimatedHours}h
                                          </Text>
                                        </HStack>
                                      )}
                                    </HStack>
                                    
                                    {/* Due date */}
                                    {task.dueDate && (
                                      <HStack spacing={1}>
                                        <Icon as={FiCalendar} boxSize={3} color={mutedTextColor} />
                                        <Text fontSize="xs" color={mutedTextColor}>
                                          Due: {formatDate(task.dueDate)} {formatTime(task.dueDate)}
                                        </Text>
                                        {new Date(task.dueDate) < new Date() && task.status !== 'Completed' && (
                                          <Badge colorScheme="red" size="xs">Overdue</Badge>
                                        )}
                                      </HStack>
                                    )}
                                    
                                    {/* Assigned to */}
                                    {task.assignedTo && (
                                      <HStack spacing={2}>
                                        <Avatar 
                                          size="xs" 
                                          name={task.assignedTo.name || task.assignedTo.firstName || 'Unassigned'} 
                                        />
                                        <Text fontSize="xs" color={mutedTextColor}>
                                          {task.assignedTo.name || `${task.assignedTo.firstName || ''} ${task.assignedTo.lastName || ''}`.trim() || 'Unassigned'}
                                        </Text>
                                      </HStack>
                                    )}
                                    
                                    {/* Related lead */}
                                    {task.relatedLead && (
                                      <HStack spacing={1}>
                                        <Icon as={FiUser} boxSize={3} color={mutedTextColor} />
                                        <Text fontSize="xs" color={mutedTextColor} noOfLines={1}>
                                          Lead: {task.relatedLead?.name || task.relatedLead?.email || 'N/A'}
                                        </Text>
                                      </HStack>
                                    )}
                                    
                                    {/* Task stage */}
                                    {task.stage && (
                                      <Badge colorScheme="purple" size="xs" w="fit-content">
                                        {task.stage}
                                      </Badge>
                                    )}
                                  </VStack>
                                </CardBody>
                              </Card>
                            ))
                          ) : (
                            <Center py={8}>
                              <Text color={mutedTextColor} fontSize="sm">
                                No tasks
                              </Text>
                            </Center>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                    );
                  })}
                </SimpleGrid>
              </TabPanel>
              
              {/* Activity Feed Tab */}
              <TabPanel px={0}>
                <Card bg={cardBg} boxShadow="md">
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
              
              {/* Ongoing Activities Tab */}
              <TabPanel px={0}>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  {/* Ongoing Tasks */}
                  <Card bg={cardBg} boxShadow="md">
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
                  <Card bg={cardBg} boxShadow="md">
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
                  <Card bg={cardBg} boxShadow="md">
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
                <Card bg={cardBg} boxShadow="md">
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
                  <VStack spacing={4} align="stretch">
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
                      placeholder="e.g., Review, Testing, Approval"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Stage Color</FormLabel>
                    <Select
                      value={newStageColor}
                      onChange={(e) => setNewStageColor(e.target.value)}
                    >
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="yellow">Yellow</option>
                      <option value="orange">Orange</option>
                      <option value="red">Red</option>
                      <option value="purple">Purple</option>
                      <option value="pink">Pink</option>
                      <option value="teal">Teal</option>
                    </Select>
                  </FormControl>
                  
                  {customStages.length > 0 && (
                    <Box w="full">
                      <Text fontSize="sm" fontWeight="semibold" mb={2}>
                        Current Stages ({customStages.length})
                      </Text>
                      <VStack spacing={2} align="stretch">
                        {customStages.sort((a, b) => a.order - b.order).map((stage, index) => (
                          <HStack 
                            key={stage.id} 
                            justify="space-between" 
                            p={3} 
                            bg={`${stage.color}.50`} 
                            borderRadius="md"
                            border="1px solid"
                            borderColor={`${stage.color}.200`}
                          >
                            <HStack spacing={3} flex={1}>
                              <Badge colorScheme={stage.color} px={2} py={1}>
                                {stage.name}
                              </Badge>
                              {stage.isFunnelStage && (
                                <Badge colorScheme="purple" variant="outline" fontSize="xs">
                                  From Funnel
                                </Badge>
                              )}
                              <Text fontSize="xs" color={mutedTextColor}>
                                Order: {stage.order}
                              </Text>
                            </HStack>
                            <HStack spacing={1}>
                              <IconButton
                                icon={<FiArrowUp />}
                                size="xs"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => handleReorderStage(stage.id, 'up')}
                                isDisabled={index === 0}
                                title="Move up"
                              />
                              <IconButton
                                icon={<FiArrowDown />}
                                size="xs"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => handleReorderStage(stage.id, 'down')}
                                isDisabled={index === customStages.length - 1}
                                title="Move down"
                              />
                              {!stage.isFunnelStage && (
                                <IconButton
                                  icon={<FiTrash2 />}
                                  size="xs"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => handleDeleteStage(stage.id)}
                                  title="Delete stage"
                                />
                              )}
                            </HStack>
                          </HStack>
                        ))}
                      </VStack>
                      <Text fontSize="xs" color={mutedTextColor} mt={2}>
                        💡 Tip: Use arrows to reorder stages. Funnel stages cannot be deleted.
                      </Text>
                    </Box>
                  )}
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onStageModalClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleAddStage}>
                  Add Stage
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </VStack>
      </Container>
    </Box>
  );
};

export default TasksAndActivities;

