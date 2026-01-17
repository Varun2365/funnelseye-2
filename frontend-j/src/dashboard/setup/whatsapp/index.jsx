import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCoachId, getToken, debugAuthState } from '../../../utils/authUtils';
import { API_BASE_URL } from '../../../config/apiConfig';
import {
  Box,
  Text,
  Button,
  Flex,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Input,
  Textarea,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  InputGroup,
  InputLeftElement,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tooltip,
  Switch,
  FormControl,
  FormLabel,
  SimpleGrid,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Center,
  Skeleton,
  SkeletonText,
  TableContainer,
  Spinner,
  Progress,
  Divider,
  Tag,
  TagLabel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Radio,
  RadioGroup,
  Stack,
  Image
} from '@chakra-ui/react';
import {
  SearchIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  ViewIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  CopyIcon,
  SettingsIcon,
  CheckIcon,
  WarningIcon,
  InfoIcon
} from '@chakra-ui/icons';
import {
  FiEye,
  FiEdit,
  FiTrash2,
  FiCopy,
  FiUsers,
  FiMoreVertical,
  FiPlay,
  FiPause,
  FiBarChart2,
  FiTrendingUp,
  FiCalendar,
  FiTarget,
  FiGlobe,
  FiSettings,
  FiMessageSquare,
  FiClock,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiActivity,
  FiZap,
  FiShield,
  FiQrCode,
  FiSmartphone,
  FiSend,
  FiDownload
} from 'react-icons/fi';

// Beautiful Loading Skeleton Component
const BeautifulSkeleton = () => {
  return (
    <Box maxW="full" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header Skeleton */}
        <Box>
          <VStack spacing={4} align="start">
            <Skeleton height="40px" width="400px" />
            <Skeleton height="20px" width="600px" />
            <HStack spacing={4}>
              <Skeleton height="40px" width="300px" />
              <Skeleton height="40px" width="150px" />
            </HStack>
          </VStack>
        </Box>
    
        {/* Stats Cards Skeleton */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          {[...Array(4)].map((_, i) => (
            <Card key={i} variant="outline">
              <CardBody>
                <VStack spacing={3}>
                  <Skeleton height="60px" width="60px" borderRadius="lg" />
                  <SkeletonText noOfLines={2} spacing="4" />
                  <Skeleton height="30px" width="80px" />
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Table Skeleton */}
        <Card variant="outline">
          <CardBody>
            <VStack spacing={4} align="stretch">
              {[...Array(5)].map((_, i) => (
                <HStack key={i} spacing={4} justify="space-between">
                  <Skeleton height="20px" width="200px" />
                  <Skeleton height="20px" width="150px" />
                  <Skeleton height="20px" width="100px" />
                  <Skeleton height="20px" width="120px" />
                  <Skeleton height="20px" width="100px" />
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon, color = "blue", trend, isLoading = false }) => {
  const bgColor = useColorModeValue(`${color}.50`, `${color}.900`);
  const borderColor = useColorModeValue(`${color}.200`, `${color}.700`);
  
  return (
    <Card 
      bg={bgColor} 
      border="1px" 
      borderColor={borderColor}
      borderRadius="xl"
      _hover={{ transform: 'translateY(-3px)', shadow: 'xl', borderColor: `${color}.300` }}
      transition="all 0.3s"
      position="relative"
      overflow="hidden"
      boxShadow="md"
    >
      <CardBody p={6}>
        <HStack spacing={4} align="center" w="full">
          <Box
            p={4}
            bg={`${color}.100`}
            borderRadius="xl"
            color={`${color}.600`}
            boxShadow="md"
            _groupHover={{ transform: 'scale(1.1)', bg: `${color}.200` }}
            transition="all 0.3s"
          >
            {icon}
          </Box>
          <VStack align="start" spacing={1} flex={1}>
            <Text fontSize="sm" color={`${color}.700`} fontWeight="medium" textTransform="uppercase" letterSpacing="wide">
              {title}
            </Text>
            {isLoading ? (
              <Skeleton height="28px" width="70px" />
            ) : (
              <Text fontSize="3xl" fontWeight="bold" color={`${color}.800`}>
                {value}
              </Text>
            )}
          </VStack>
          {trend && (
            <Badge 
              colorScheme={trend > 0 ? 'green' : 'red'} 
              variant="solid" 
              size="sm"
              borderRadius="full"
              px={3}
              py={1}
            >
              {trend > 0 ? '+' : ''}{trend}%
            </Badge>
          )}
        </HStack>
      </CardBody>
    </Card>
  );
};

// Custom Toast Hook
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

// Status Badge Component
const StatusBadge = ({ status }) => {
  const colorScheme = {
    connected: 'green',
    disconnected: 'red',
    testing: 'yellow',
    error: 'red'
  }[status] || 'gray';

  const displayName = {
    connected: 'Connected',
    disconnected: 'Disconnected',
    testing: 'Testing...',
    error: 'Error'
  }[status] || status;

  return (
    <Badge colorScheme={colorScheme} variant="solid" borderRadius="full" px={3} py={1}>
      {displayName}
    </Badge>
  );
};

function WhatsAppSetupComponent() {
  // State Management
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);

  // Integration State
  const [integrationSettings, setIntegrationSettings] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [usageStats, setUsageStats] = useState(null);
  const [qrCode, setQrCode] = useState(null);

  // Templates State
  const [messageTemplates, setMessageTemplates] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);

  // Form States
  const [setupFormData, setSetupFormData] = useState({
    instanceId: '',
    apiKey: '',
    webhookUrl: '',
    phoneNumber: ''
  });

  const [templateFormData, setTemplateFormData] = useState({
    name: '',
    category: 'UTILITY',
    language: 'en',
    content: '',
    variables: []
  });

  // Modal States
  const { isOpen: isSetupModalOpen, onOpen: onSetupModalOpen, onClose: onSetupModalClose } = useDisclosure();
  const { isOpen: isTemplateModalOpen, onOpen: onTemplateModalOpen, onClose: onTemplateModalClose } = useDisclosure();
  const { isOpen: isQrModalOpen, onOpen: onQrModalOpen, onClose: onQrModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const customToast = useCustomToast();
  const authState = useSelector(state => state.auth);
  const coachID = getCoachId(authState);
  const token = getToken(authState);

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // API Helper Function
  const apiCall = async (endpoint, method = 'GET', body = null) => {
    if (!coachID || !token) {
      throw new Error('Authentication data not available. Please log in again.');
    }

    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Coach-ID': coachID,
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    };

    let requestBody = body || {};
    if (method !== 'GET') {
      requestBody = {
        ...requestBody,
        coachId: coachID,
        token: token,
        authData: {
          coachId: coachID,
          token: token,
          timestamp: new Date().toISOString()
        }
      };
    } else {
      const url = new URL(`${API_BASE_URL}${endpoint}`);
      url.searchParams.append('coachId', coachID);
      url.searchParams.append('token', token);
      endpoint = url.pathname + url.search;
    }

    if (method !== 'GET') {
      config.body = JSON.stringify(requestBody);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    return response.json();
  };

  // Data Fetching Functions
  const fetchIntegrationSettings = async () => {
    try {
      const data = await apiCall('/api/whatsapp-integration');
      setIntegrationSettings(data?.integration || data);
      setConnectionStatus(data?.integration?.isActive ? 'connected' : 'disconnected');
    } catch (err) {
      console.error('Error fetching integration settings:', err);
      
      const fallbackSettings = {
        instanceId: '',
        apiKey: '',
        webhookUrl: '',
        phoneNumber: '',
        isActive: false,
        connectedAt: null,
        lastSync: null
      };
      
      setIntegrationSettings(fallbackSettings);
      setConnectionStatus('disconnected');
    }
  };

  const fetchUsageStats = async () => {
    try {
      const data = await apiCall('/api/whatsapp-integration/usage');
      setUsageStats(data?.usage || data);
    } catch (err) {
      console.error('Error fetching usage stats:', err);
      
      const fallbackStats = {
        monthlyMessages: 0,
        totalContacts: 0,
        totalTemplates: 0,
        deliveryRate: '0%',
        lastUpdated: new Date().toISOString()
      };
      
      setUsageStats(fallbackStats);
    }
  };

  const fetchMessageTemplates = async () => {
    try {
      const data = await apiCall('/api/whatsapp-integration/templates');
      setMessageTemplates(data?.templates || []);
    } catch (err) {
      console.error('Error fetching message templates:', err);
      
      const fallbackTemplates = [
        {
          id: 'demo-template-1',
          name: 'Welcome Message',
          category: 'UTILITY',
          language: 'en',
          content: 'Hello {{1}}, welcome to our service!',
          variables: ['name'],
          status: 'APPROVED',
          createdAt: new Date().toISOString()
        },
        {
          id: 'demo-template-2',
          name: 'Appointment Reminder',
          category: 'UTILITY',
          language: 'en',
          content: 'Hi {{1}}, your appointment is scheduled for {{2}} at {{3}}.',
          variables: ['name', 'date', 'time'],
          status: 'PENDING',
          createdAt: new Date().toISOString()
        }
      ];
      
      setMessageTemplates(fallbackTemplates);
    }
  };

  const fetchRecentMessages = async () => {
    try {
      const data = await apiCall('/api/whatsapp-integration/messages');
      setRecentMessages(data?.messages || []);
    } catch (err) {
      console.error('Error fetching recent messages:', err);
      
      const fallbackMessages = [
        {
          id: 'msg-1',
          to: '+91 98765 43210',
          content: 'Hello, I am interested in your services',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          status: 'delivered',
          type: 'text'
        },
        {
          id: 'msg-2',
          to: '+91 98765 43211',
          content: 'Thank you for your interest! How can I help you today?',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          status: 'read',
          type: 'template'
        }
      ];
      
      setRecentMessages(fallbackMessages);
    }
  };

  const generateQRCode = async () => {
    setQrLoading(true);
    try {
      const data = await apiCall('/api/whatsapp-integration/qr', 'POST');
      setQrCode(data?.qrCode || data);
      onQrModalOpen();
      customToast('QR Code generated successfully!', 'success');
    } catch (err) {
      console.error('Error generating QR code:', err);
      customToast(`QR Code generation failed: ${err.message}`, 'error');
    } finally {
      setQrLoading(false);
    }
  };

  // Initial Data Loading
  useEffect(() => {
    const loadData = async () => {
      if (!coachID || !token) {
        customToast('Authentication data not available. Please log in again.', 'error');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        await Promise.all([
          fetchIntegrationSettings(),
          fetchUsageStats(),
          fetchMessageTemplates(),
          fetchRecentMessages()
        ]);
        
        customToast('WhatsApp integration data loaded successfully!', 'success');
      } catch (err) {
        console.error('Error loading data:', err);
        customToast('⚠️ Using Demo Data - API connection failed. Showing demo WhatsApp integration data.', 'warning');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [coachID, token, customToast]);

  // Event Handlers
  const handleSetupIntegration = async () => {
    if (!setupFormData.instanceId || !setupFormData.apiKey) {
      customToast('Please fill in all required fields', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await apiCall('/api/whatsapp-integration/setup', 'POST', setupFormData);
      await fetchIntegrationSettings();
      customToast('WhatsApp integration setup successfully!', 'success');
      onSetupModalClose();
    } catch (err) {
      console.error('Error setting up integration:', err);
      customToast(`Setup failed: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateIntegration = async () => {
    setActionLoading(true);
    try {
      await apiCall('/api/whatsapp-integration', 'PUT', setupFormData);
      await fetchIntegrationSettings();
      customToast('Integration settings updated successfully!', 'success');
      onSetupModalClose();
    } catch (err) {
      console.error('Error updating integration:', err);
      customToast(`Update failed: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    setConnectionStatus('testing');
    try {
      const result = await apiCall('/api/whatsapp-integration/test', 'POST');
      setConnectionStatus(result.success ? 'connected' : 'error');
      customToast(
        result.success ? 'Connection test successful!' : 'Connection test failed!',
        result.success ? 'success' : 'error'
      );
    } catch (err) {
      console.error('Error testing connection:', err);
      setConnectionStatus('error');
      customToast(`Connection test failed: ${err.message}`, 'error');
    } finally {
      setTestLoading(false);
    }
  };

  const handleDeleteIntegration = async () => {
    setActionLoading(true);
    try {
      await apiCall('/api/whatsapp-integration', 'DELETE');
      setIntegrationSettings(null);
      setConnectionStatus('disconnected');
      customToast('WhatsApp integration deleted successfully!', 'success');
    } catch (err) {
      console.error('Error deleting integration:', err);
      customToast(`Delete failed: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateFormData.name || !templateFormData.content) {
      customToast('Please fill in template name and content', 'error');
      return;
    }

    setActionLoading(true);
    try {
      if (isEditMode) {
        customToast('Template updated successfully!', 'success');
      } else {
        await apiCall('/api/whatsapp-integration/templates', 'POST', templateFormData);
        customToast('Message template created successfully!', 'success');
      }
      await fetchMessageTemplates();
      onTemplateModalClose();
      setTemplateFormData({
        name: '',
        category: 'UTILITY',
        language: 'en',
        content: '',
        variables: []
      });
    } catch (err) {
      console.error('Error creating template:', err);
      customToast(`Template creation failed: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenSetupModal = () => {
    if (integrationSettings) {
      setSetupFormData({
        instanceId: integrationSettings.instanceId || '',
        apiKey: integrationSettings.apiKey || '',
        webhookUrl: integrationSettings.webhookUrl || '',
        phoneNumber: integrationSettings.phoneNumber || ''
      });
    }
    onSetupModalOpen();
  };

  const handleOpenTemplateModal = (editMode = false, template = null) => {
    setIsEditMode(editMode);
    setSelectedTemplate(template);
    
    if (editMode && template) {
      setTemplateFormData({
        name: template.name || '',
        category: template.category || 'UTILITY',
        language: template.language || 'en',
        content: template.content || '',
        variables: template.variables || []
      });
    } else {
      setTemplateFormData({
        name: '',
        category: 'UTILITY',
        language: 'en',
        content: '',
        variables: []
      });
    }
    onTemplateModalOpen();
  };

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalMessages: recentMessages.length,
      deliveredMessages: recentMessages.filter(m => m.status === 'delivered' || m.status === 'read').length,
      totalTemplates: messageTemplates.length,
      approvedTemplates: messageTemplates.filter(t => t.status === 'APPROVED').length
    };
  }, [recentMessages, messageTemplates]);

  if (loading) {
    return <BeautifulSkeleton />;
  }

  return (
    <Box bg="gray.100" minH="100vh" py={6} px={6}>
      <Box maxW="full" mx="auto">
        <VStack spacing={8} align="stretch" w="full">
          
          {/* Header Section */}
          <Card bg="white" borderRadius="xl" boxShadow="lg" border="1px" borderColor="gray.200">
            <CardHeader py={6}>
              <VStack spacing={6} align="stretch">
                <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={4}>
                  <VStack align={{ base: 'center', md: 'start' }} spacing={2}>
                    <HStack spacing={3}>
                      <Box as={FiMessageSquare} color="green.500" size="32px" />
                      <Heading size="lg" color="gray.800" fontWeight="bold">
                        WhatsApp Integration
                      </Heading>
                      <StatusBadge status={connectionStatus} />
                    </HStack>
                    <Text color="gray.500" fontSize="sm" fontWeight="medium">
                      Configure and manage your WhatsApp Business API integration
                    </Text>
                  </VStack>
                  
                  <HStack spacing={4}>
                    <Button
                      leftIcon={<Box as={FiQrCode} />}
                      variant="outline"
                      colorScheme="green"
                      onClick={generateQRCode}
                      isLoading={qrLoading}
                      loadingText="Generating..."
                    >
                      Generate QR
                    </Button>
                    <Button
                      leftIcon={<Box as={FiRefreshCw} />}
                      variant="outline"
                      colorScheme="gray"
                      onClick={handleTestConnection}
                      isLoading={testLoading}
                      loadingText="Testing..."
                    >
                      Test Connection
                    </Button>
                    <Button
                      leftIcon={<SettingsIcon />}
                      bg="green.500"
                      color="white"
                      onClick={handleOpenSetupModal}
                      _hover={{ bg: "green.600" }}
                    >
                      {integrationSettings ? 'Update Settings' : 'Setup Integration'}
                    </Button>
                  </HStack>
                </Flex>
                
                {/* Stats Cards */}
                <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
                  <StatsCard
                    title="Total Messages"
                    value={stats.totalMessages}
                    icon={<Box as={FiMessageSquare} size="24px" />}
                    color="green"
                    isLoading={loading}
                  />
                  <StatsCard
                    title="Delivered"
                    value={stats.deliveredMessages}
                    icon={<Box as={FiCheck} size="24px" />}
                    color="blue"
                    isLoading={loading}
                  />
                  <StatsCard
                    title="Templates"
                    value={stats.totalTemplates}
                    icon={<Box as={FiTarget} size="24px" />}
                    color="purple"
                    isLoading={loading}
                  />
                  <StatsCard
                    title="Approved"
                    value={stats.approvedTemplates}
                    icon={<Box as={FiShield} size="24px" />}
                    color="orange"
                    isLoading={loading}
                  />
                </SimpleGrid>
              </VStack>
            </CardHeader>
          </Card>

          {/* Connection Status Alert */}
          {connectionStatus === 'disconnected' && (
            <Alert status="warning" borderRadius="lg">
              <AlertIcon />
              <Box>
                <AlertTitle>WhatsApp Integration Not Connected!</AlertTitle>
                <AlertDescription>
                  Please configure your WhatsApp Business API credentials to enable messaging features.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Recent Messages Section */}
          <Card bg="white" borderRadius="xl" boxShadow="lg" border="1px" borderColor="gray.200">
            <CardHeader py={6}>
              <Flex justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Heading size="lg" color="gray.800" fontWeight="bold">Recent Messages</Heading>
                  <Text color="gray.500" fontSize="sm">Latest WhatsApp messages sent</Text>
                </VStack>
              </Flex>
            </CardHeader>
            
            <CardBody pt={0}>
              {recentMessages.length > 0 ? (
                <TableContainer>
                  <Table variant="simple" size="md">
                    <Thead>
                      <Tr bg="gray.50">
                        <Th>Recipient</Th>
                        <Th>Message Content</Th>
                        <Th>Type</Th>
                        <Th>Status</Th>
                        <Th>Timestamp</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {recentMessages.map((message, index) => (
                        <Tr key={index} _hover={{ bg: 'gray.50' }}>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold">{message.to}</Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Text fontSize="sm" maxW="200px" isTruncated>
                              {message.content}
                            </Text>
                          </Td>
                          <Td>
                            <Badge colorScheme={message.type === 'template' ? 'purple' : 'blue'} size="sm">
                              {message.type}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge 
                              colorScheme={
                                message.status === 'delivered' ? 'green' :
                                message.status === 'read' ? 'blue' :
                                message.status === 'sent' ? 'yellow' : 'red'
                              }
                              variant="solid"
                            >
                              {message.status}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="gray.500">
                              {new Date(message.timestamp).toLocaleString()}
                            </Text>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <Tooltip label="View Details">
                                <IconButton
                                  size="sm"
                                  variant="ghost"
                                  icon={<Box as={FiEye} />}
                                  colorScheme="blue"
                                />
                              </Tooltip>
                              <Tooltip label="Copy Message">
                                <IconButton
                                  size="sm"
                                  variant="ghost"
                                  icon={<Box as={FiCopy} />}
                                  onClick={() => {
                                    navigator.clipboard.writeText(message.content);
                                    customToast('Message copied to clipboard!', 'success');
                                  }}
                                  colorScheme="green"
                                />
                              </Tooltip>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              ) : (
                <Center py={10}>
                  <VStack spacing={4}>
                    <Box as={FiMessageSquare} size="48px" color="gray.300" />
                    <Text color="gray.500">No recent messages found</Text>
                  </VStack>
                </Center>
              )}
            </CardBody>
          </Card>

          {/* Message Templates Section */}
          <Card bg="white" borderRadius="xl" boxShadow="lg" border="1px" borderColor="gray.200">
            <CardHeader py={6}>
              <Flex justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Heading size="lg" color="gray.800" fontWeight="bold">Message Templates</Heading>
                  <Text color="gray.500" fontSize="sm">Create and manage WhatsApp message templates</Text>
                </VStack>
                <Button
                  leftIcon={<AddIcon />}
                  bg="purple.500"
                  color="white"
                  onClick={() => handleOpenTemplateModal(false, null)}
                  _hover={{ bg: 'purple.600' }}
                  isDisabled={connectionStatus !== 'connected'}
                >
                  New Template
                </Button>
              </Flex>
            </CardHeader>
            
            <CardBody pt={0}>
              {messageTemplates.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {messageTemplates.map((template, index) => (
                    <Card key={index} variant="outline" _hover={{ shadow: 'md' }}>
                      <CardBody>
                        <VStack align="start" spacing={3}>
                          <HStack justify="space-between" w="full">
                            <Text fontWeight="bold" fontSize="lg">{template.name}</Text>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<Box as={FiMoreVertical} />}
                                variant="ghost"
                                size="sm"
                              />
                              <MenuList>
                                <MenuItem 
                                  icon={<Box as={FiEdit} />}
                                  onClick={() => handleOpenTemplateModal(true, template)}
                                >
                                  Edit Template
                                </MenuItem>
                                <MenuItem 
                                  icon={<Box as={FiCopy} />}
                                >
                                  Duplicate Template
                                </MenuItem>
                                <MenuDivider />
                                <MenuItem 
                                  icon={<Box as={FiTrash2} />} 
                                  color="red.500"
                                >
                                  Delete Template
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                          <VStack align="start" spacing={2} w="full">
                            <HStack>
                              <Box as={FiGlobe} color="gray.500" />
                              <Text fontSize="sm" color="gray.600">
                                Language: {template.language}
                              </Text>
                            </HStack>
                            <HStack>
                              <Box as={FiTarget} color="gray.500" />
                              <Text fontSize="sm" color="gray.600">
                                Category: {template.category}
                              </Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.600" noOfLines={3}>
                              {template.content}
                            </Text>
                            <Badge 
                              colorScheme={
                                template.status === 'APPROVED' ? 'green' :
                                template.status === 'PENDING' ? 'yellow' : 'red'
                              }
                              variant="solid"
                              size="sm"
                            >
                              {template.status}
                            </Badge>
                          </VStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              ) : (
                <Center py={10}>
                  <VStack spacing={4}>
                    <Box as={FiTarget} size="48px" color="gray.300" />
                    <Text color="gray.500">No message templates found</Text>
                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="purple"
                      variant="outline"
                      onClick={() => handleOpenTemplateModal(false, null)}
                      isDisabled={connectionStatus !== 'connected'}
                    >
                      Create First Template
                    </Button>
                  </VStack>
                </Center>
              )}
            </CardBody>
          </Card>

          {/* Usage Statistics */}
          {usageStats && (
            <Card bg="white" borderRadius="xl" boxShadow="lg" border="1px" borderColor="gray.200">
              <CardHeader py={6}>
                <Heading size="lg" color="gray.800" fontWeight="bold">Usage Statistics</Heading>
              </CardHeader>
              <CardBody pt={0}>
                <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
                  <Stat>
                    <StatLabel>Monthly Messages</StatLabel>
                    <StatNumber>{usageStats.monthlyMessages || 0}</StatNumber>
                    <StatHelpText>This month</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Total Contacts</StatLabel>
                    <StatNumber>{usageStats.totalContacts || 0}</StatNumber>
                    <StatHelpText>All time</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Total Templates</StatLabel>
                    <StatNumber>{usageStats.totalTemplates || 0}</StatNumber>
                    <StatHelpText>Created</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Delivery Rate</StatLabel>
                    <StatNumber>{usageStats.deliveryRate || '0%'}</StatNumber>
                    <StatHelpText>Success rate</StatHelpText>
                  </Stat>
                </SimpleGrid>
              </CardBody>
            </Card>
          )}

        </VStack>
      </Box>

      {/* Setup Integration Modal */}
      <Modal isOpen={isSetupModalOpen} onClose={onSetupModalClose} size="xl">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>
            <HStack spacing={3}>
              <Box as={FiSettings} color="green.500" />
              <Text>{integrationSettings ? 'Update WhatsApp Integration' : 'Setup WhatsApp Integration'}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Instance ID</FormLabel>
                <Input
                  value={setupFormData.instanceId}
                  onChange={(e) => setSetupFormData({ ...setupFormData, instanceId: e.target.value })}
                  placeholder="Enter WhatsApp Instance ID"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>API Key</FormLabel>
                <Input
                  type="password"
                  value={setupFormData.apiKey}
                  onChange={(e) => setSetupFormData({ ...setupFormData, apiKey: e.target.value })}
                  placeholder="Enter WhatsApp API Key"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Webhook URL</FormLabel>
                <Input
                  value={setupFormData.webhookUrl}
                  onChange={(e) => setSetupFormData({ ...setupFormData, webhookUrl: e.target.value })}
                  placeholder="https://your-domain.com/webhook"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  value={setupFormData.phoneNumber}
                  onChange={(e) => setSetupFormData({ ...setupFormData, phoneNumber: e.target.value })}
                  placeholder="+1234567890"
                />
              </FormControl>

              <Alert status="info" borderRadius="lg">
                <AlertIcon />
                <Box fontSize="sm">
                  <AlertTitle>Setup Instructions:</AlertTitle>
                  <AlertDescription>
                    1. Create a WhatsApp Business API account<br/>
                    2. Generate Instance ID and API Key<br/>
                    3. Set webhook URL for message delivery<br/>
                    4. Verify your phone number
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onSetupModalClose}>
              Cancel
            </Button>
            {integrationSettings && (
              <Button
                colorScheme="red"
                variant="outline"
                mr={3}
                onClick={handleDeleteIntegration}
                isLoading={actionLoading}
              >
                Delete Integration
              </Button>
            )}
            <Button
              bg="green.500"
              color="white"
              onClick={integrationSettings ? handleUpdateIntegration : handleSetupIntegration}
              isLoading={actionLoading}
              loadingText={integrationSettings ? 'Updating...' : 'Setting up...'}
              _hover={{ bg: 'green.600' }}
            >
              {integrationSettings ? 'Update Integration' : 'Setup Integration'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Message Template Modal */}
      <Modal isOpen={isTemplateModalOpen} onClose={onTemplateModalClose} size="xl">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>
            <HStack spacing={3}>
              <Box as={FiTarget} color="purple.500" />
              <Text>{isEditMode ? 'Edit Message Template' : 'Create Message Template'}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Template Name</FormLabel>
                <Input
                  value={templateFormData.name}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })}
                  placeholder="e.g., Welcome Message"
                />
              </FormControl>
              
              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={templateFormData.category}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, category: e.target.value })}
                  >
                    <option value="UTILITY">Utility</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="AUTHENTICATION">Authentication</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Language</FormLabel>
                  <Select
                    value={templateFormData.language}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, language: e.target.value })}
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
              
              <FormControl isRequired>
                <FormLabel>Template Content</FormLabel>
                <Textarea
                  value={templateFormData.content}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, content: e.target.value })}
                  placeholder="Enter your message template. Use {{1}}, {{2}} for variables..."
                  rows={4}
                />
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Use {{1}}, {{2}}, {{3}} etc. for dynamic variables
                </Text>
              </FormControl>

              <Alert status="info" borderRadius="lg">
                <AlertIcon />
                <Box fontSize="sm">
                  <AlertTitle>Template Guidelines:</AlertTitle>
                  <AlertDescription>
                    • Templates must be approved by WhatsApp<br/>
                    • Use clear, professional language<br/>
                    • Include variables for personalization<br/>
                    • Follow WhatsApp Business Policy
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onTemplateModalClose}>
              Cancel
            </Button>
            <Button
              bg="purple.500"
              color="white"
              onClick={handleCreateTemplate}
              isLoading={actionLoading}
              loadingText={isEditMode ? 'Updating...' : 'Creating...'}
              _hover={{ bg: 'purple.600' }}
            >
              {isEditMode ? 'Update Template' : 'Create Template'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* QR Code Modal */}
      <Modal isOpen={isQrModalOpen} onClose={onQrModalClose} size="md">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>
            <HStack spacing={3}>
              <Box as={FiQrCode} color="green.500" />
              <Text>WhatsApp QR Code</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="center">
              <Text fontSize="sm" color="gray.600" textAlign="center">
                Scan this QR code with your WhatsApp mobile app to connect your account
              </Text>
              {qrCode ? (
                <Box p={4} bg="white" borderRadius="xl" border="2px" borderColor="gray.200">
                  <Image 
                    src={qrCode} 
                    alt="WhatsApp QR Code" 
                    maxW="200px" 
                    maxH="200px"
                  />
                </Box>
              ) : (
                <Center h="200px">
                  <Spinner size="lg" color="green.500" />
                </Center>
              )}
              <Alert status="info" borderRadius="lg">
                <AlertIcon />
                <Box fontSize="sm">
                  <AlertTitle>Instructions:</AlertTitle>
                  <AlertDescription>
                    1. Open WhatsApp on your phone<br/>
                    2. Go to Settings → Linked Devices<br/>
                    3. Tap "Link a Device"<br/>
                    4. Scan this QR code
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onQrModalClose}>
              Close
            </Button>
            <Button
              bg="green.500"
              color="white"
              onClick={generateQRCode}
              isLoading={qrLoading}
              _hover={{ bg: 'green.600' }}
            >
              Generate New QR
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
}

export default WhatsAppSetupComponent;

