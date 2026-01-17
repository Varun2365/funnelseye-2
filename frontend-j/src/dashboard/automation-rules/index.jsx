import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
  FiRefreshCw, FiPlus, FiSettings, FiSend, FiMessageSquare, FiCheckCircle,
  FiRepeat, FiLink
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { getCoachId, getToken, isAuthenticated, debugAuthState, getAuthHeaders } from '../../utils/authUtils';

import { API_BASE_URL as BASE_URL } from '../../config/apiConfig';
import AutomationRulesGraphBuilder from './AutomationRulesGraphBuilder';
import automationRulesService from './automationRulesService';

// --- API CONFIGURATION ---
const API_BASE_URL = `${BASE_URL}/api`;

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
              position="relative"
            >
              <CircularProgress
                isIndeterminate
                color="blue.600"
                thickness="2px"
                size="16"
                position="absolute"
              />
              <FiZap size={24} color="#3182ce" />
            </Box>

            <Box>
              <Heading size="lg" color="gray.900" mb={2}>
                Loading Automation Rules
              </Heading>
              <Text color="gray.600" fontSize="md">
                Setting up your intelligent automation workflows...
              </Text>
            </Box>

            <Progress
              value={undefined}
              isIndeterminate
              colorScheme="blue"
              w="full"
              h="2px"
              borderRadius="full"
            />
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  </Container>
);

// Main Automation Rules Dashboard Component
const AutomationRulesDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  // Redux state (same pattern as reference file)
  const authState = useSelector((state) => state.auth);
  const token = getToken(authState);
  const coachId = getCoachId(authState);
  const isAuth = isAuthenticated(authState);

  // Get auth headers (same pattern as reference file)
  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Component state
  const [sequences, setSequences] = useState([]);
  const [flows, setFlows] = useState([]);
  const [runs, setRuns] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal states
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form states for create/edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    triggerEvent: '',
    actions: [],
    isActive: true
  });

  // Builder resources for funnel assignment
  const [builderResources, setBuilderResources] = useState({
    funnels: []
  });

  // API Functions
  const fetchSequences = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Starting to fetch sequences and builder resources...");
      console.log("Auth token available:", !!getToken());

      const response = await automationRulesService.getSequences();
      setSequences(response.data || []);
      console.log("Sequences fetched:", response.data?.length || 0);

      // Also fetch builder resources (funnels)
      try {
        console.log("Fetching builder resources...");
        const resourcesResponse = await axios.get(`${API_BASE_URL}/automation-rules/builder-resources`, {
          headers: getAuthHeaders()
        });
        console.log("Builder resources response:", resourcesResponse.data);
        const newResources = resourcesResponse.data.data || { funnels: [] };
        console.log("Setting builder resources:", newResources);
        console.log("Funnels in response:", newResources.funnels);
        setBuilderResources(newResources);
      } catch (resourcesErr) {
        console.error("Could not fetch builder resources:", resourcesErr);
        console.error("Error details:", resourcesErr.response?.data || resourcesErr.message);
        setBuilderResources({ funnels: [] });
      }
    } catch (error) {
      console.error('Error fetching sequences:', error);
      setSequences([]);
      setBuilderResources({ funnels: [] });
      toast({
        title: 'Error',
        description: 'Failed to load automation sequences',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Handle funnel assignment
  const handleFunnelAssignment = async (ruleId, funnelId) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/automation-rules/${ruleId}/assign-funnel`,
        { funnelId: funnelId || null },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        // Update local state
        setSequences(prev => prev.map(rule =>
          rule._id === ruleId
            ? { ...rule, funnelId: funnelId || null }
            : rule
        ));
        toast({
          title: 'Funnel assignment updated',
          description: `Rule ${funnelId ? 'assigned to funnel' : 'unassigned from funnel'}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error assigning funnel:', error);
      toast({
        title: 'Assignment failed',
        description: error.response?.data?.message || 'Failed to assign funnel',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchFlows = useCallback(async () => {
    try {
      const response = await automationRulesService.getFlows();
      setFlows(response.data || []);
    } catch (error) {
      console.error('Error fetching flows:', error);
    }
  }, []);

  const fetchRuns = useCallback(async () => {
    try {
      const response = await automationRulesService.getRuns();
      setRuns(response.data || []);
    } catch (error) {
      console.error('Error fetching runs:', error);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await automationRulesService.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    const tokenToUse = token || localStorage.getItem('token');
    if (tokenToUse) {
      // Set token and coach ID in service
      automationRulesService.setToken(tokenToUse);
      if (coachId) {
        automationRulesService.setCoachId(coachId);
      }

      Promise.all([
        fetchSequences(),
        fetchFlows(),
        fetchRuns(),
        fetchAnalytics()
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, coachId, fetchSequences, fetchFlows, fetchRuns, fetchAnalytics]);

  // Create new sequence
  const handleCreateSequence = async () => {
    try {
      const response = await automationRulesService.createSequence(formData);

      toast({
        title: 'Success',
        description: 'Automation sequence created successfully',
        status: 'success',
        duration: 3000,
      });

      setIsCreateModalOpen(false);
      setFormData({ name: '', description: '', triggerEvent: '', actions: [], isActive: true });
      fetchSequences();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create automation sequence',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Update sequence
  const handleUpdateSequence = async () => {
    try {
      const response = await automationRulesService.updateSequence(selectedSequence._id, formData);

      toast({
        title: 'Success',
        description: 'Automation sequence updated successfully',
        status: 'success',
        duration: 3000,
      });

      setIsEditModalOpen(false);
      setSelectedSequence(null);
      setFormData({ name: '', description: '', triggerEvent: '', actions: [], isActive: true });
      fetchSequences();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update automation sequence',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Delete sequence
  const handleDeleteSequence = async () => {
    try {
      await automationRulesService.deleteSequence(selectedSequence._id);

      toast({
        title: 'Success',
        description: 'Automation sequence deleted successfully',
        status: 'success',
        duration: 3000,
      });

      setIsDeleteDialogOpen(false);
      setSelectedSequence(null);
      fetchSequences();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete automation sequence',
        status: 'error',
        duration: 3000,
      });
    }
  };


  // Filter sequences based on search and status
  const filteredSequences = useMemo(() => {
    return sequences.filter(sequence => {
      const matchesSearch = sequence.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sequence.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' ||
                          (filterStatus === 'active' && sequence.isActive) ||
                          (filterStatus === 'inactive' && !sequence.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [sequences, searchTerm, filterStatus]);

  if (loading) {
    return <ProfessionalLoader />;
  }

  return (
    <Container maxW="8xl" mx="auto" py={8} px={6}>
      <VStack spacing={8} align="stretch">
        {/* Header Section */}
      <Box mb={8}>
        <HStack justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="xl" color="gray.900" fontWeight="700">
              Automation Builder - FunnelsEye
            </Heading>
            <Text color="gray.600" fontSize="md" mt={1}>
              Create and manage your automated workflows
            </Text>
          </Box>
        </HStack>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <StatsCard
            title="Total Rules"
            value={sequences.length}
            icon={<FiRepeat size={20} />}
            color="blue"
            helpText="Active automation rules"
          />
          <StatsCard
            title="Active Rules"
            value={sequences.filter(s => s.isActive).length}
            icon={<FiPlay size={20} />}
            color="green"
            helpText="Currently running"
          />
          <StatsCard
            title="Total Runs"
            value={runs.length}
            icon={<FiActivity size={20} />}
            color="purple"
            helpText="Execution instances"
          />
          <StatsCard
            title="Success Rate"
            value={analytics?.successRate ? `${analytics.successRate}%` : 'N/A'}
            icon={<FiTrendingUp size={20} />}
            color="orange"
            helpText="Successful executions"
          />
        </SimpleGrid>

        {/* Search and Actions Bar */}
        <Card bg="white" borderRadius="xl" border="1px" borderColor="gray.200" shadow="sm" mb={6}>
          <CardBody py={4}>
            <HStack spacing={4}>
              <InputGroup maxW="400px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search automation rules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg="gray.50"
                  border="1px"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'gray.300' }}
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                />
              </InputGroup>

              <Button
                leftIcon={<FiRefreshCw />}
                variant="outline"
                size="md"
                onClick={fetchSequences}
                isLoading={loading}
                loadingText="Refreshing..."
              >
                Refresh
              </Button>

              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                size="md"
                onClick={() => window.open('/create/workflow', '_blank')}
                fontWeight="600"
              >
                Create Rule
              </Button>
            </HStack>
          </CardBody>
        </Card>
      </Box>

      {/* Main Content Tabs */}
        <Card bg="white" borderRadius="xl" border="1px" borderColor="gray.200" shadow="sm">
          <Tabs variant="enclosed" colorScheme="blue" index={activeTab} onChange={setActiveTab}>
            <TabList px={6} pt={4}>
              <Tab fontSize="sm" fontWeight="600">
                <HStack spacing={2}>
                  <FiRepeat size={16} />
                  <Text>Rules</Text>
                </HStack>
              </Tab>
              <Tab fontSize="sm" fontWeight="600">
                <HStack spacing={2}>
                  <FiActivity size={16} />
                  <Text>Runs</Text>
                </HStack>
              </Tab>
              <Tab fontSize="sm" fontWeight="600">
                <HStack spacing={2}>
                  <FiBarChart2 size={16} />
                  <Text>Analytics</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Rules Tab */}
              <TabPanel px={6} py={6}>
                <VStack spacing={4} align="stretch">
                  {/* Search and Filters */}
                  <HStack spacing={4} justify="space-between">
                    <HStack spacing={4} flex={1}>
                      <InputGroup maxW="md">
                        <InputLeftElement pointerEvents="none">
                          <SearchIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="Search rules..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          bg="gray.50"
                          border="1px"
                          borderColor="gray.300"
                        />
                      </InputGroup>
                      <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        maxW="150px"
                        bg="gray.50"
                        border="1px"
                        borderColor="gray.300"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </Select>
                    </HStack>
                    <Button
                      leftIcon={<FiPlus />}
                      colorScheme="blue"
                      size="sm"
                      onClick={() => window.open('/create/workflow', '_blank')}
                    >
                      New Rule
                    </Button>
                  </HStack>

                  {/* Rules Table */}
                  <Card bg="white" borderRadius="lg" border="1px" borderColor="gray.200">
                    <TableContainer>
                      <Table variant="simple" size="md">
                        <Thead bg="gray.50">
                          <Tr>
                            <Th fontSize="xs" fontWeight="700" color="gray.700" textTransform="uppercase" letterSpacing="0.05em">Name</Th>
                            <Th fontSize="xs" fontWeight="700" color="gray.700" textTransform="uppercase" letterSpacing="0.05em">Trigger</Th>
                            <Th fontSize="xs" fontWeight="700" color="gray.700" textTransform="uppercase" letterSpacing="0.05em">Status</Th>
                            <Th fontSize="xs" fontWeight="700" color="gray.700" textTransform="uppercase" letterSpacing="0.05em">Funnels</Th>
                            <Th fontSize="xs" fontWeight="700" color="gray.700" textTransform="uppercase" letterSpacing="0.05em">Last Run</Th>
                            <Th fontSize="xs" fontWeight="700" color="gray.700" textTransform="uppercase" letterSpacing="0.05em">Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredSequences.length === 0 ? (
                            <Tr>
                              <Td colSpan={5} textAlign="center" py={8}>
                                <VStack spacing={3}>
                                  <FiRepeat size={48} color="#cbd5e0" />
                                  <Text color="gray.500" fontSize="md">No automation rules found</Text>
                                  <Button
                                    leftIcon={<FiPlus />}
                                    colorScheme="blue"
                                    size="sm"
                                    onClick={() => window.open('/create/workflow', '_blank')}
                                  >
                                    Create Your First Rule
                                  </Button>
                                </VStack>
                              </Td>
                            </Tr>
                          ) : (
                            filteredSequences.map((sequence) => (
                              <Tr key={sequence._id} _hover={{ bg: 'gray.50' }}>
                                <Td>
                                  <VStack align="start" spacing={1}>
                                    <Text fontWeight="600" color="gray.900" fontSize="sm">
                                      {sequence.name}
                                    </Text>
                                    {sequence.description && (
                                      <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                        {sequence.description}
                                      </Text>
                                    )}
                                  </VStack>
                                </Td>
                                <Td>
                                  <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                                    {sequence.triggerEvent || 'Multiple'}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Badge
                                    colorScheme={sequence.isActive ? 'green' : 'gray'}
                                    variant="subtle"
                                    fontSize="xs"
                                  >
                                    {sequence.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </Td>
                                <Td onClick={(e) => e.stopPropagation()}>
                                  <Select
                                    size="sm"
                                    value={sequence.funnelId || ''}
                                    onChange={(e) => handleFunnelAssignment(sequence._id, e.target.value)}
                                    placeholder="No funnel"
                                    maxW="200px"
                                    fontSize="xs"
                                    borderRadius="md"
                                    borderColor="gray.300"
                                    _hover={{ borderColor: 'blue.400' }}
                                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                                  >
                                    {console.log('Rendering funnels in dropdown:', builderResources.funnels)}
                                    {builderResources.funnels && builderResources.funnels.length > 0 ? (
                                      builderResources.funnels.map(funnel => (
                                        <option key={funnel.id} value={funnel.id}>
                                          {funnel.name}
                                        </option>
                                      ))
                                    ) : (
                                      <option disabled>No funnels available</option>
                                    )}
                                  </Select>
                                </Td>
                                <Td>
                                  <Text fontSize="xs" color="gray.500">
                                    {sequence.lastExecutedAt
                                      ? new Date(sequence.lastExecutedAt).toLocaleDateString()
                                      : 'Never'
                                    }
                                  </Text>
                                </Td>
                                <Td>
                                  <Menu>
                                    <MenuButton
                                      as={IconButton}
                                      icon={<FiMoreVertical />}
                                      variant="ghost"
                                      size="sm"
                                      color="gray.500"
                                    />
                                    <MenuList>
                                      <MenuItem
                                        icon={<FiEye />}
                                        onClick={() => window.open(`/create/workflow/${sequence._id}`, '_blank')}
                                      >
                                        View/Edit
                                      </MenuItem>
                                      <MenuItem
                                        icon={<FiCopy />}
                                        onClick={() => {/* TODO: Duplicate functionality */}}
                                      >
                                        Duplicate
                                      </MenuItem>
                                      <MenuDivider />
                                      <MenuItem
                                        icon={<FiTrash2 />}
                                        color="red.500"
                                        onClick={() => {
                                          setSelectedSequence(sequence);
                                          setIsDeleteDialogOpen(true);
                                        }}
                                      >
                                        Delete
                                      </MenuItem>
                                    </MenuList>
                                  </Menu>
                                </Td>
                              </Tr>
                            ))
                          )}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Card>
                </VStack>
              </TabPanel>

              {/* Runs Tab */}
              <TabPanel px={6} py={6}>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="lg" fontWeight="600" color="gray.900">Automation Runs</Text>
                  {runs.length === 0 ? (
                    <Card bg="white" borderRadius="lg" border="1px" borderColor="gray.200" p={8}>
                      <VStack spacing={3}>
                        <FiActivity size={48} color="#cbd5e0" />
                        <Text color="gray.500" fontSize="md">No runs yet</Text>
                        <Text color="gray.400" fontSize="sm">Automation execution history will appear here</Text>
                      </VStack>
                    </Card>
                  ) : (
                    <Card bg="white" borderRadius="lg" border="1px" borderColor="gray.200">
                      <TableContainer>
                        <Table variant="simple" size="md">
                          <Thead bg="gray.50">
                            <Tr>
                              <Th fontSize="xs" fontWeight="700" color="gray.700" textTransform="uppercase" letterSpacing="0.05em">Sequence</Th>
                              <Th fontSize="xs" fontWeight="700" color="gray.700" textTransform="uppercase" letterSpacing="0.05em">Status</Th>
                              <Th fontSize="xs" fontWeight="700" color="gray.700" textTransform="uppercase" letterSpacing="0.05em">Started</Th>
                              <Th fontSize="xs" fontWeight="700" color="gray.700" textTransform="uppercase" letterSpacing="0.05em">Duration</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {runs.map((run) => (
                              <Tr key={run._id}>
                                <Td>
                                  <Text fontSize="sm" fontWeight="500">
                                    {run.sequenceName}
                                  </Text>
                                </Td>
                                <Td>
                                  <Badge
                                    colorScheme={run.status === 'completed' ? 'green' : run.status === 'failed' ? 'red' : 'yellow'}
                                    variant="subtle"
                                    fontSize="xs"
                                  >
                                    {run.status}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Text fontSize="xs" color="gray.500">
                                    {new Date(run.startedAt).toLocaleString()}
                                  </Text>
                                </Td>
                                <Td>
                                  <Text fontSize="xs" color="gray.500">
                                    {run.completedAt
                                      ? `${Math.round((new Date(run.completedAt) - new Date(run.startedAt)) / 1000)}s`
                                      : 'Running...'
                                    }
                                  </Text>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </Card>
                  )}
                </VStack>
              </TabPanel>

              {/* Analytics Tab */}
              <TabPanel px={6} py={6}>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="lg" fontWeight="600" color="gray.900">Analytics</Text>
                  {analytics ? (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                      <StatsCard
                        title="Total Executions"
                        value={analytics.totalExecutions || 0}
                        icon={<FiActivity size={20} />}
                        color="blue"
                      />
                      <StatsCard
                        title="Success Rate"
                        value={`${analytics.successRate || 0}%`}
                        icon={<FiCheckCircle size={20} />}
                        color="green"
                      />
                      <StatsCard
                        title="Average Duration"
                        value={`${analytics.averageDuration || 0}s`}
                        icon={<FiClock size={20} />}
                        color="orange"
                      />
                    </SimpleGrid>
                  ) : (
                    <Card bg="white" borderRadius="lg" border="1px" borderColor="gray.200" p={8}>
                      <VStack spacing={3}>
                        <FiBarChart2 size={48} color="#cbd5e0" />
                        <Text color="gray.500" fontSize="md">No analytics data available</Text>
                        <Text color="gray.400" fontSize="sm">Analytics will appear here once automations start running</Text>
                      </VStack>
                    </Card>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Card>
      </VStack>


      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={undefined}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Automation Rule
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{selectedSequence?.name}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteSequence} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>


    </Container>
  );
};

export default AutomationRulesDashboard;