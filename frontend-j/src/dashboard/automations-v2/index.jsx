import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Box, Flex, Text, Button, Input, InputGroup, InputLeftElement,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge, Avatar,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, FormHelperText, Select, Textarea, Switch, useDisclosure,
  HStack, VStack, Divider, IconButton, Menu, MenuButton, MenuList, MenuItem,
  Alert, AlertIcon, AlertTitle, AlertDescription, useToast,
  Skeleton, SkeletonText, Card, CardBody, CardHeader, Heading,
  SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText,
  Tabs, TabList, TabPanels, Tab, TabPanel, Checkbox, CheckboxGroup,
  Tooltip, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody,
  useColorModeValue, Container, Spacer, Tag, TagLabel, TagCloseButton,
  Progress, CircularProgress, Center, Wrap, WrapItem,
  GridItem, Grid, Stack, ButtonGroup, FormErrorMessage,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  MenuDivider, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Code, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
  Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton
} from '@chakra-ui/react';
import {
  SearchIcon, AddIcon, EditIcon, DeleteIcon, EmailIcon, PhoneIcon,
  ViewIcon, DownloadIcon, ChevronDownIcon, StarIcon,
  CalendarIcon, InfoIcon, CheckCircleIcon, WarningIcon, TimeIcon,
  ChatIcon, ExternalLinkIcon, SettingsIcon, CopyIcon,
} from '@chakra-ui/icons';
import {
  FiFileText, FiUser, FiMail, FiPhone, FiCalendar, FiFilter, FiUpload,
  FiEye, FiEdit, FiTrash2, FiCopy, FiUsers, FiMoreVertical,
  FiPlay, FiPause, FiBarChart2, FiTrendingUp, FiTarget, FiGlobe, FiWifi,
  FiZap, FiActivity, FiClock, FiBell, FiCode, FiDatabase, FiShield,
  FiAlertTriangle, FiInfo, FiExternalLink, FiSave, FiX, FiXCircle,
  FiRefreshCw, FiPlus, FiSettings, FiSend, FiMessageSquare, FiCheckCircle
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { getCoachId, getToken, isAuthenticated, debugAuthState } from '../../utils/authUtils';
import { API_BASE_URL } from '../../config/apiConfig';

// API_BASE_URL automatically switches between:
// - Development: http://localhost:8080/api
// - Production: https://api.funnelseye.com/api
const API_ENDPOINT = `${API_BASE_URL}/api`;
import GraphAutomationBuilderV2 from './GraphAutomationBuilderV2';


// Stats Card Component
const StatsCard = ({ title, value, icon, color = "blue", helpText }) => (
  <Card bg="white" borderRadius="lg" border="1px" borderColor="gray.200" shadow="sm">
    <CardBody p={4}>
      <HStack spacing={3} align="center">
        <Box
          p={2}
          bg={`${color}.50`}
          borderRadius="lg"
          color={`${color}.600`}
        >
          {icon}
        </Box>
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="gray.900">
            {value}
          </Text>
          <Text fontSize="sm" color="gray.600" fontWeight="500">
            {title}
          </Text>
          {helpText && (
            <Text fontSize="xs" color="gray.500" mt={1}>
              {helpText}
            </Text>
          )}
        </Box>
      </HStack>
    </CardBody>
  </Card>
);

// Professional Loader Component
const ProfessionalLoader = () => (
  <Container maxW="7xl" mx="auto" py={8} px={4}>
    <VStack spacing={8} align="stretch">
      {/* Header Section with Professional Animation */}
      <Card
        bg="white"
        borderRadius="2xl"
        border="1px"
        borderColor="gray.200"
        shadow="xl"
        overflow="hidden"
      >
        <CardBody p={8}>
          <VStack spacing={6} align="center" textAlign="center">
            <Box
              w={16}
              h={16}
              borderRadius="full"
              bg="blue.50"
              display="flex"
              alignItems="center"
              justifyContent="center"
              animation="spin 2s linear infinite"
            >
              <FiZap size={32} color="#3182ce" />
            </Box>
            <VStack spacing={2}>
              <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                Loading Automation Dashboard
              </Text>
              <Text color="gray.600" fontSize="sm">
                Preparing your automation workspace...
              </Text>
            </VStack>
            <Progress
              w="full"
              maxW="300px"
              size="sm"
              colorScheme="blue"
              isIndeterminate
              borderRadius="full"
            />
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  </Container>
);

const AutomationsV2 = () => {
  console.log('AutomationsV2 component rendered');

  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  // State management
  const [automations, setAutomations] = useState([]);
  const [sequences, setSequences] = useState([]);
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const [analytics, setAnalytics] = useState({});
  const [activeTab, setActiveTab] = useState(0);

  // Additional state for comprehensive UI
  const [error, setError] = useState(null);
  const [automationRules, setAutomationRules] = useState([]);
  const [eventsActions, setEventsActions] = useState({ events: [], actions: [] });
  const [stats, setStats] = useState({
    totalRules: 0,
    activeRules: 0,
    inactiveRules: 0,
    executedToday: 0
  });
  const [sequenceStats, setSequenceStats] = useState({
    totalSequences: 0,
    activeSequences: 0,
    inactiveSequences: 0,
    totalSteps: 0
  });
  const [sequenceSearchTerm, setSequenceSearchTerm] = useState('');
  const [sequenceStatusFilter, setSequenceStatusFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [messagingUsage, setMessagingUsage] = useState({
    whatsappCredits: 0,
    emailCredits: 0,
    smsCredits: 0,
    totalMessages: 0
  });

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    triggerEvent: '',
    triggerConditions: [],
    workflowType: 'graph',
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 }
  });

  // Auth - Get auth state from Redux
  const authState = useSelector(state => state.auth);
  const token = getToken(authState);
  const coachId = getCoachId(authState);

  console.log('Auth debug:', { token: !!token, coachId, authState: !!authState });

  // Get auth headers
  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Fetch automations data
  const fetchAutomations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_ENDPOINT}/automations-v2/sequences`, {
        headers: getAuthHeaders()
      });
      setSequences(response.data.data || []);
    } catch (error) {
      console.error('Error fetching sequences:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch automation sequences',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  const fetchFlows = useCallback(async () => {
    try {
      const response = await axios.get(`${API_ENDPOINT}/automations-v2/flows`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFlows(response.data.data || []);
    } catch (error) {
      console.error('Error fetching flows:', error);
    }
  }, [token]);

  const fetchRuns = useCallback(async () => {
    try {
      const response = await axios.get(`${API_ENDPOINT}/automations-v2/runs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAutomations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching runs:', error);
    }
  }, [token]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await axios.get(`${API_ENDPOINT}/automations-v2/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data.data || {});
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, [token]);

  // Handle query parameters for actions
  useEffect(() => {
    const action = searchParams.get('action');

    // Handle refresh action
    if (action === 'refresh') {
      window.location.reload();
      return;
    }

    // Other actions are now handled directly through button clicks
    console.log('Action from URL:', action);
  }, [searchParams]);

  // Load data on component mount
  useEffect(() => {
    console.log('Data loading useEffect triggered:', { token: !!token, coachId });
    if (token && coachId) {
      console.log('Loading data...');
      fetchAutomations();
      fetchFlows();
      fetchRuns();
      fetchAnalytics();
    } else {
      console.log('Not loading data - missing token or coachId');
    }
  }, [token, coachId, fetchAutomations, fetchFlows, fetchRuns, fetchAnalytics]);

  // Handle opening graph builder - open in new tab
  const handleOpenGraphBuilder = (existingRule = null) => {
    console.log('handleOpenGraphBuilder called with:', existingRule);

    let url;
    if (existingRule && existingRule._id) {
      // Edit existing rule - open editor in new tab
      url = `/editor/automation?action=edit&id=${existingRule._id}&return=/automations-v2`;
    } else {
      // Create new rule - open editor in new tab
      url = `/editor/automation?action=new&return=/automations-v2`;
    }

    // Open in new tab with fullscreen features
    const newWindow = window.open(
      url,
      '_blank',
      'width=' + screen.width + ',height=' + screen.height + ',scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,directories=no,status=no'
    );

    // Focus the new window
    if (newWindow) {
      newWindow.focus();
    }
  };

  // Create automation sequence
  const handleCreateSequence = async () => {
    try {
      const response = await axios.post(`${API_ENDPOINT}/automations-v2/sequences`, formData, {
        headers: getAuthHeaders()
      });

      toast({
        title: 'Success',
        description: 'Automation sequence created successfully',
        status: 'success',
        duration: 3000,
      });

      fetchAutomations();
      onCreateClose();
      resetForm();
    } catch (error) {
      console.error('Error creating sequence:', error);
      toast({
        title: 'Error',
        description: 'Failed to create automation sequence',
        status: 'error',
        duration: 5000,
      });
    }
  };



  // Delete automation
  const handleDeleteAutomation = async () => {
    try {
      await axios.delete(`${API_ENDPOINT}/automations-v2/sequences/${selectedAutomation._id}`, {
        headers: getAuthHeaders()
      });

      toast({
        title: 'Success',
        description: 'Automation deleted successfully',
        status: 'success',
        duration: 3000,
      });

      fetchAutomations();
      onDeleteClose();
      setSelectedAutomation(null);
    } catch (error) {
      console.error('Error deleting automation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete automation',
        status: 'error',
        duration: 5000,
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      triggerEvent: '',
      triggerConditions: [],
      workflowType: 'graph',
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 }
    });
  };

  // Filter automations
  const filteredSequences = useMemo(() => {
    return sequences.filter(sequence =>
      sequence.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sequence.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sequences, searchTerm]);

  // Filter automation rules
  const filteredRules = useMemo(() => {
    return automationRules.filter(rule => {
      const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rule.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || rule.isActive === (statusFilter === 'active');
      return matchesSearch && matchesStatus;
    });
  }, [automationRules, searchTerm, statusFilter]);

  // Filter messaging sequences
  const filteredMessagingSequences = useMemo(() => {
    return sequences.filter(sequence => {
      const matchesSearch = sequence.name.toLowerCase().includes(sequenceSearchTerm.toLowerCase()) ||
                          sequence.description?.toLowerCase().includes(sequenceSearchTerm.toLowerCase());
      const matchesStatus = sequenceStatusFilter === 'all' ||
                          (sequenceStatusFilter === 'active' && sequence.isActive) ||
                          (sequenceStatusFilter === 'inactive' && !sequence.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [sequences, sequenceSearchTerm, sequenceStatusFilter]);

  // Events and actions for graph builder
  const eventsActionsData = {
    triggers: [
      'lead_created', 'lead_status_changed', 'lead_converted_to_client',
      'form_submitted', 'appointment_booked', 'payment_successful',
      'whatsapp_message_received', 'email_opened', 'task_completed'
    ],
    actions: [
      'send_whatsapp_message', 'send_email_message', 'update_lead_score',
      'add_lead_tag', 'create_task', 'schedule_calendar_event',
      'wait_delay', 'call_webhook', 'trigger_another_automation'
    ],
    conditions: [
      'equals', 'not_equals', 'contains', 'greater_than', 'less_than',
      'message_reply_yes', 'message_reply_no', 'has_tag', 'no_tag'
    ]
  };

  // Builder resources
  const builderResources = {
    sequences,
    flows,
    analytics
  };

  console.log('Rendering AutomationsV2 component');

  // Show loader while loading
  if (loading) {
    return <ProfessionalLoader />;
  }

  // Show error state
  if (error) {
    return (
      <Box p={6}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Container maxW="7xl" mx="auto" px={4}>
      <VStack spacing={6} align="stretch">
        <Tabs index={activeTab} onChange={(i) => setActiveTab(i)} colorScheme="blue">
          <TabList borderBottom="1px" borderColor="gray.200" px={6} pt={2}>
            <Tab
              _selected={{ color: 'blue.600', borderBottom: '2px solid', borderColor: 'blue.600' }}
              fontWeight="500"
              fontSize="sm"
              px={4}
              py={3}
              color="gray.600"
              _hover={{ color: 'gray.900' }}
            >
              Automation Rules
            </Tab>
            <Tab
              _selected={{ color: 'blue.600', borderBottom: '2px solid', borderColor: 'blue.600' }}
              fontWeight="500"
              fontSize="sm"
              px={4}
              py={3}
              color="gray.600"
              _hover={{ color: 'gray.900' }}
            >
              Messaging Sequences
            </Tab>
            <Tab
              _selected={{ color: 'blue.600', borderBottom: '2px solid', borderColor: 'blue.600' }}
              fontWeight="500"
              fontSize="sm"
              px={4}
              py={3}
              color="gray.600"
              _hover={{ color: 'gray.900' }}
            >
              Messaging Usage
            </Tab>
          </TabList>

          <TabPanels>
            {/* Automation Rules Tab */}
            <TabPanel>
              {/* Hero + Stats + Filters */}
              <Box
                bg="white"
                borderRadius="lg"
                border="1px"
                borderColor="gray.200"
                p={6}
              >
                <VStack spacing={6} align="stretch">
                  <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={4}>
                    <VStack align={{ base: 'center', md: 'start' }} spacing={1}>
                      <Heading size="lg" color="gray.900" fontWeight="600">
                        Automation Rules
                      </Heading>
                      <Text color="gray.500" fontSize="sm" fontWeight="400">
                        Manage and automate your business workflows
                      </Text>
                    </VStack>
                    <HStack spacing={3}>
                      <IconButton
                        icon={<FiRefreshCw />}
                        aria-label="Refresh"
                        onClick={() => window.location.reload()}
                        variant="outline"
                        size="sm"
                      />
                      <Button
                        leftIcon={<FiPlus />}
                        colorScheme="blue"
                        size="sm"
                        fontSize="sm"
                        onClick={handleOpenGraphBuilder}
                      >
                        Create Rule
                      </Button>
                    </HStack>
                  </Flex>

                  <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
                    <StatsCard
                      title="Total Rules"
                      value={stats.totalRules}
                      icon={<FiZap size={20} />}
                      color="blue"
                    />
                    <StatsCard
                      title="Active Rules"
                      value={stats.activeRules}
                      icon={<FiActivity size={20} />}
                      color="green"
                    />
                    <StatsCard
                      title="Inactive Rules"
                      value={stats.inactiveRules}
                      icon={<FiPause size={20} />}
                      color="orange"
                    />
                    <StatsCard
                      title="Executed Today"
                      value={stats.executedToday}
                      icon={<FiClock size={20} />}
                      color="purple"
                    />
                  </SimpleGrid>

                  <HStack spacing={4} justify="space-between" flexWrap="wrap">
                    <HStack spacing={3} flex={1} minW="300px">
                      <InputGroup maxW="400px" flex={1}>
                        <InputLeftElement pointerEvents="none">
                          <SearchIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="Search rules..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          bg="gray.50"
                          border="none"
                          _focus={{ bg: 'white', border: '1px', borderColor: 'blue.300' }}
                        />
                      </InputGroup>
                      <Select
                        maxW="180px"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        bg="gray.50"
                        border="none"
                        _focus={{ bg: 'white', border: '1px', borderColor: 'blue.300' }}
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </Select>
                    </HStack>
                  </HStack>
                </VStack>
              </Box>

              {/* Automation Rules Table */}
              <Box
                bg="white"
                borderRadius="lg"
                border="1px"
                borderColor="gray.200"
                overflow="hidden"
              >
                <Flex justify="space-between" align="center" p={5} borderBottom="1px" borderColor="gray.100">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="md" fontWeight="600" color="gray.900">
                      Automation Rules
                    </Text>
                    <Text color="gray.500" fontSize="xs" mt={1}>
                      {filteredRules.length} {filteredRules.length === 1 ? 'rule' : 'rules'}
                    </Text>
                  </VStack>
                </Flex>

                <Box>
                  <TableContainer w="full" overflowX="auto" className="hide-scrollbar">
                    <Table variant="simple" size="md" w="full">
                      <Thead>
                        <Tr bg="gray.50">
                          <Th px={6} py={4} fontSize="xs" fontWeight="600" color="gray.600" textTransform="uppercase" letterSpacing="wider">
                            Rule Name
                          </Th>
                          <Th px={6} py={4} fontSize="xs" fontWeight="600" color="gray.600" textTransform="uppercase" letterSpacing="wider">
                            Trigger Event
                          </Th>
                          <Th px={6} py={4} fontSize="xs" fontWeight="600" color="gray.600" textTransform="uppercase" letterSpacing="wider">
                            Actions
                          </Th>
                          <Th px={6} py={4} fontSize="xs" fontWeight="600" color="gray.600" textTransform="uppercase" letterSpacing="wider">
                            Status
                          </Th>
                          <Th px={6} py={4} fontSize="xs" fontWeight="600" color="gray.600" textTransform="uppercase" letterSpacing="wider">
                            Last Executed
                          </Th>
                          <Th px={6} py={4} fontSize="xs" fontWeight="600" color="gray.600" textTransform="uppercase" letterSpacing="wider">
                            Actions
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredRules.length === 0 ? (
                          <Tr>
                            <Td colSpan={6} textAlign="center" py={12}>
                              <VStack spacing={3}>
                                <FiZap size={48} color="#a0aec0" />
                                <Text color="gray.500" fontSize="sm">
                                  No automation rules found
                                </Text>
                                <Button
                                  leftIcon={<FiPlus />}
                                  colorScheme="blue"
                                  size="sm"
                                  onClick={handleOpenGraphBuilder}
                                >
                                  Create Your First Rule
                                </Button>
                              </VStack>
                            </Td>
                          </Tr>
                        ) : (
                          filteredRules.map((rule) => (
                            <Tr
                              key={rule._id}
                              borderBottom="1px"
                              borderColor="gray.100"
                              _hover={{ bg: 'gray.50', cursor: 'pointer' }}
                              onClick={() => handleOpenGraphBuilder(rule)}
                              transition="background 0.2s"
                            >
                              <Td px={6} py={4}>
                                <VStack align="start" spacing={0.5}>
                                  <Text fontWeight="600" fontSize="sm" color="gray.900">{rule.name}</Text>
                                  <Text color="gray.400" fontSize="xs">
                                    {rule.description || 'No description'}
                                  </Text>
                                </VStack>
                              </Td>
                              <Td px={6} py={4}>
                                <Badge
                                  colorScheme="blue"
                                  variant="subtle"
                                  borderRadius="md"
                                  px={2.5}
                                  py={1}
                                  fontSize="xs"
                                  textTransform="capitalize"
                                >
                                  {rule.triggerEvent?.replace(/_/g, ' ') || 'No trigger'}
                                </Badge>
                              </Td>
                              <Td px={6} py={4}>
                                <Text fontSize="sm" color="gray.600">
                                  {rule.actions?.length || 0} actions
                                </Text>
                              </Td>
                              <Td px={6} py={4}>
                                {rule.isActive ? (
                                  <Badge
                                    colorScheme="green"
                                    variant="subtle"
                                    borderRadius="md"
                                    px={2.5}
                                    py={1}
                                    fontSize="xs"
                                  >
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge
                                    colorScheme="gray"
                                    variant="subtle"
                                    borderRadius="md"
                                    px={2.5}
                                    py={1}
                                    fontSize="xs"
                                  >
                                    Inactive
                                  </Badge>
                                )}
                              </Td>
                              <Td px={6} py={4}>
                                <Text fontSize="sm" color="gray.600">
                                  {rule.lastExecuted ? new Date(rule.lastExecuted).toLocaleDateString() : 'Never'}
                                </Text>
                              </Td>
                              <Td px={6} py={4}>
                                <HStack spacing={2}>
                                  <IconButton
                                    icon={<FiEye />}
                                    aria-label="View rule"
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle view action
                                    }}
                                  />
                                  <IconButton
                                    icon={<FiEdit />}
                                    aria-label="Edit rule"
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenGraphBuilder(rule);
                                    }}
                                  />
                                </HStack>
                              </Td>
                            </Tr>
                          ))
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            </TabPanel>

            {/* Messaging Sequences Tab */}
            <TabPanel>
              <Box
                bg="white"
                borderRadius="lg"
                border="1px"
                borderColor="gray.200"
                p={6}
              >
                <VStack spacing={6} align="stretch">
                  <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={4}>
                    <VStack align={{ base: 'center', md: 'start' }} spacing={1}>
                      <Heading size="lg" color="gray.900" fontWeight="600">
                        Messaging Sequences
                      </Heading>
                      <Text color="gray.500" fontSize="sm" fontWeight="400">
                        Automated messaging workflows and sequences
                      </Text>
                    </VStack>
                    <Button
                      leftIcon={<FiPlus />}
                      colorScheme="blue"
                      size="sm"
                      fontSize="sm"
                      onClick={handleOpenGraphBuilder}
                    >
                      Create Sequence
                    </Button>
                  </Flex>

                  <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
                    <StatsCard
                      title="Total Sequences"
                      value={sequenceStats.totalSequences}
                      icon={<FiMessageSquare size={20} />}
                      color="blue"
                    />
                    <StatsCard
                      title="Active Sequences"
                      value={sequenceStats.activeSequences}
                      icon={<FiActivity size={20} />}
                      color="green"
                    />
                    <StatsCard
                      title="Inactive Sequences"
                      value={sequenceStats.inactiveSequences}
                      icon={<FiPause size={20} />}
                      color="orange"
                    />
                    <StatsCard
                      title="Total Steps"
                      value={sequenceStats.totalSteps}
                      icon={<FiZap size={20} />}
                      color="purple"
                    />
                  </SimpleGrid>

                  <HStack spacing={4} justify="space-between" flexWrap="wrap">
                    <HStack spacing={3} flex={1} minW="300px">
                      <InputGroup maxW="400px" flex={1}>
                        <InputLeftElement pointerEvents="none">
                          <SearchIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="Search sequences..."
                          value={sequenceSearchTerm}
                          onChange={(e) => setSequenceSearchTerm(e.target.value)}
                          bg="gray.50"
                          border="none"
                          _focus={{ bg: 'white', border: '1px', borderColor: 'blue.300' }}
                        />
                      </InputGroup>
                      <Select
                        maxW="180px"
                        value={sequenceStatusFilter}
                        onChange={(e) => setSequenceStatusFilter(e.target.value)}
                        bg="gray.50"
                        border="none"
                        _focus={{ bg: 'white', border: '1px', borderColor: 'blue.300' }}
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </Select>
                    </HStack>
                  </HStack>
                </VStack>
              </Box>

              <Box
                bg="white"
                borderRadius="lg"
                border="1px"
                borderColor="gray.200"
                overflow="hidden"
              >
                <Flex justify="space-between" align="center" p={5} borderBottom="1px" borderColor="gray.100">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="md" fontWeight="600" color="gray.900">
                      Messaging Sequences
                    </Text>
                    <Text color="gray.500" fontSize="xs" mt={1}>
                      {filteredMessagingSequences.length} {filteredMessagingSequences.length === 1 ? 'sequence' : 'sequences'}
                    </Text>
                  </VStack>
                </Flex>

                <Box>
                  <TableContainer w="full" overflowX="auto" className="hide-scrollbar">
                    <Table variant="simple" size="md" w="full">
                      <Thead>
                        <Tr bg="gray.50">
                          <Th px={6} py={4} fontSize="xs" fontWeight="600" color="gray.600" textTransform="uppercase" letterSpacing="wider">
                            Sequence Name
                          </Th>
                          <Th px={6} py={4} fontSize="xs" fontWeight="600" color="gray.600" textTransform="uppercase" letterSpacing="wider">
                            Steps
                          </Th>
                          <Th px={6} py={4} fontSize="xs" fontWeight="600" color="gray.600" textTransform="uppercase" letterSpacing="wider">
                            Status
                          </Th>
                          <Th px={6} py={4} fontSize="xs" fontWeight="600" color="gray.600" textTransform="uppercase" letterSpacing="wider">
                            Created
                          </Th>
                          <Th px={6} py={4} fontSize="xs" fontWeight="600" color="gray.600" textTransform="uppercase" letterSpacing="wider">
                            Actions
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredMessagingSequences.length === 0 ? (
                          <Tr>
                            <Td colSpan={5} textAlign="center" py={12}>
                              <VStack spacing={3}>
                                <FiMessageSquare size={48} color="#a0aec0" />
                                <Text color="gray.500" fontSize="sm">
                                  No messaging sequences found
                                </Text>
                                <Button
                                  leftIcon={<FiPlus />}
                                  colorScheme="blue"
                                  size="sm"
                                  onClick={handleOpenGraphBuilder}
                                >
                                  Create Your First Sequence
                                </Button>
                              </VStack>
                            </Td>
                          </Tr>
                        ) : (
                          filteredMessagingSequences.map((sequence) => (
                            <Tr
                              key={sequence._id}
                              borderBottom="1px"
                              borderColor="gray.100"
                              _hover={{ bg: 'gray.50', cursor: 'pointer' }}
                              onClick={() => handleOpenGraphBuilder(sequence)}
                              transition="background 0.2s"
                            >
                              <Td px={6} py={4}>
                                <VStack align="start" spacing={0.5}>
                                  <Text fontWeight="600" fontSize="sm" color="gray.900">{sequence.name}</Text>
                                  <Text color="gray.400" fontSize="xs">
                                    {sequence.description || 'No description'}
                                  </Text>
                                </VStack>
                              </Td>
                              <Td px={6} py={4}>
                                <Text fontSize="sm" color="gray.600">
                                  {sequence.nodes?.length || 0} steps
                                </Text>
                              </Td>
                              <Td px={6} py={4}>
                                {sequence.isActive ? (
                                  <Badge
                                    colorScheme="green"
                                    variant="subtle"
                                    borderRadius="md"
                                    px={2.5}
                                    py={1}
                                    fontSize="xs"
                                  >
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge
                                    colorScheme="gray"
                                    variant="subtle"
                                    borderRadius="md"
                                    px={2.5}
                                    py={1}
                                    fontSize="xs"
                                  >
                                    Inactive
                                  </Badge>
                                )}
                              </Td>
                              <Td px={6} py={4}>
                                <Text fontSize="sm" color="gray.600">
                                  {sequence.createdAt ? new Date(sequence.createdAt).toLocaleDateString() : 'Unknown'}
                                </Text>
                              </Td>
                              <Td px={6} py={4}>
                                <HStack spacing={2}>
                                  <IconButton
                                    icon={<FiEye />}
                                    aria-label="View sequence"
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle view action
                                    }}
                                  />
                                  <IconButton
                                    icon={<FiEdit />}
                                    aria-label="Edit sequence"
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenGraphBuilder(sequence);
                                    }}
                                  />
                                </HStack>
                              </Td>
                            </Tr>
                          ))
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            </TabPanel>

            {/* Messaging Usage Tab */}
            <TabPanel>
              <Box
                bg="white"
                borderRadius="lg"
                border="1px"
                borderColor="gray.200"
                p={6}
              >
                <VStack spacing={6} align="stretch">
                  <VStack align={{ base: 'center', md: 'start' }} spacing={1}>
                    <Heading size="lg" color="gray.900" fontWeight="600">
                      Messaging Usage
                    </Heading>
                    <Text color="gray.500" fontSize="sm" fontWeight="400">
                      Track your messaging credits and usage statistics
                    </Text>
                  </VStack>

                  <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
                    <StatsCard
                      title="WhatsApp Credits"
                      value={messagingUsage.whatsappCredits}
                      icon={<FaWhatsapp size={20} />}
                      color="green"
                      helpText="Available for messaging"
                    />
                    <StatsCard
                      title="Email Credits"
                      value={messagingUsage.emailCredits}
                      icon={<FiMail size={20} />}
                      color="blue"
                      helpText="Available for emails"
                    />
                    <StatsCard
                      title="SMS Credits"
                      value={messagingUsage.smsCredits}
                      icon={<FiPhone size={20} />}
                      color="purple"
                      helpText="Available for SMS"
                    />
                    <StatsCard
                      title="Total Messages"
                      value={messagingUsage.totalMessages}
                      icon={<FiMessageSquare size={20} />}
                      color="orange"
                      helpText="Sent this month"
                    />
                  </SimpleGrid>
                </VStack>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default AutomationsV2;