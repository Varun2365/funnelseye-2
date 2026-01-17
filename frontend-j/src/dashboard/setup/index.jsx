import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  Select,
  Avatar,
  Badge,
  Spinner,
  Skeleton,
  useColorModeValue,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  InputGroup,
  InputLeftElement,
  InputRightElement,  
  Flex,
  Spacer,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  FormControl,
  FormLabel,
  Switch,
  Checkbox,
  Tag,
  TagLabel,
  TagCloseButton,
  Tooltip,
  Container,
  SimpleGrid,
  Center,
  Icon,
  ButtonGroup,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormHelperText
} from '@chakra-ui/react';

import axios from 'axios';
import { 
  FiFilter, 
  FiSearch, 
  FiStar, 
  FiTrash2, 
  FiChevronDown, 
  FiRefreshCw, 
  FiDownload, 
  FiArrowRight,
  FiMessageSquare,
  FiPhone,
  FiVideo,
  FiPaperclip,
  FiSend,
  FiMoreVertical,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiMail,
  FiInfo,
  FiServer,
  FiHash,
  FiUser,
  FiLock,
  FiEye,
  FiShield,
  FiX,
  FiSave,
  FiCreditCard,
} from 'react-icons/fi';

import { API_BASE_URL as BASE_URL } from '../../config/apiConfig';

// Mock Data Service for when APIs are not available
const MockDataService = {
  getMockConversations: () => [
    {
      id: 'mock_1',
      contactName: 'John Doe',
      phone: '+1234567890',
      email: 'john@example.com',
      lastMessage: 'Hello, I need help with my order',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      unreadCount: 2,
      status: 'active',
      source: 'whatsapp',
      avatar: 'https://via.placeholder.com/40'
    },
    {
      id: 'mock_2',
      contactName: 'Jane Smith',
      phone: '+1234567891',
      email: 'jane@example.com',
      lastMessage: 'Thank you for your help!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      unreadCount: 0,
      status: 'resolved',
      source: 'email',
      avatar: 'https://via.placeholder.com/40'
    },
    {
      id: 'mock_3',
      contactName: 'Mike Johnson',
      phone: '+1234567892',
      email: 'mike@example.com',
      lastMessage: 'Can you send me the details?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      unreadCount: 1,
      status: 'pending',
      source: 'whatsapp',
      avatar: 'https://via.placeholder.com/40'
    }
  ],

  getMockTemplates: () => [
    {
      id: 'template_1',
      name: 'Welcome Message',
      content: 'Welcome to our service! How can we help you today?',
      status: 'approved',
      category: 'greeting',
      language: 'en'
    },
    {
      id: 'template_2',
      name: 'Order Confirmation',
      content: 'Your order #{order_id} has been confirmed. Thank you!',
      status: 'approved',
      category: 'transaction',
      language: 'en'
    },
    {
      id: 'template_3',
      name: 'Follow Up',
      content: 'Hi {name}, how was your experience with us?',
      status: 'pending',
      category: 'follow_up',
      language: 'en'
    }
  ],

  getMockInboxStats: () => ({
    totalConversations: 156,
    unreadMessages: 23,
    resolvedToday: 12,
    averageResponseTime: '2.5 minutes'
  })
};

// --- PROFESSIONAL LOADER COMPONENT ---
const ProfessionalLoader = () => {
  return (
    <Box maxW="full" py={8} px={6}>
      <VStack spacing={8} align="stretch">
        {/* Professional Inbox Layout Skeleton */}
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
            background="linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.05), transparent)"
            animation="shimmer 3s infinite"
            sx={{
              '@keyframes shimmer': {
                '0%': { left: '-100%' },
                '100%': { left: '100%' }
              }
            }}
          />
          <CardHeader py={6}>
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Skeleton height="32px" width="200px" borderRadius="lg" />
                <Skeleton height="16px" width="300px" borderRadius="md" />
              </VStack>
              <HStack spacing={3}>
                <Skeleton height="32px" width="150px" borderRadius="lg" />
                <Skeleton height="32px" width="150px" borderRadius="lg" />
              </HStack>
            </Flex>
          </CardHeader>
          
          <CardBody pt={0} px={0}>
            {/* Inbox Layout Skeleton */}
            <Grid templateColumns={{ base: "1fr", md: "400px 1fr" }} height="700px" gap={0}>
              {/* Left Sidebar - Conversations List */}
              <GridItem bg="gray.50" borderRight="2px" borderColor="gray.200">
                <VStack spacing={0} height="100%" p={4}>
                  {/* Search Bar */}
                  <Skeleton height="50px" width="100%" borderRadius="xl" mb={6} />
                  
                  {/* Conversation Items */}
                  {[...Array(6)].map((_, i) => (
                    <Box key={i} w="100%" p={4} borderBottom="1px" borderColor="gray.200">
                      <HStack spacing={4} align="start">
                        <Skeleton height="50px" width="50px" borderRadius="full" />
                        <VStack align="start" spacing={3} flex={1}>
                          <Skeleton height="18px" width="140px" borderRadius="md" />
                          <Skeleton height="16px" width="200px" borderRadius="sm" />
                          <Skeleton height="14px" width="100px" borderRadius="sm" />
                        </VStack>
                        <Skeleton height="24px" width="24px" borderRadius="full" />
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </GridItem>
              
              {/* Right Side - Chat Area */}
              <GridItem>
                <VStack spacing={0} height="100%">
                  {/* Chat Header */}
                  <Box p={6} borderBottom="2px" borderColor="gray.200" w="100%">
                    <HStack spacing={4}>
                      <Skeleton height="50px" width="50px" borderRadius="full" />
                      <VStack align="start" spacing={2} flex={1}>
                        <Skeleton height="22px" width="180px" borderRadius="md" />
                        <Skeleton height="16px" width="120px" borderRadius="sm" />
                      </VStack>
                      <HStack spacing={3}>
                        <Skeleton height="40px" width="40px" borderRadius="lg" />
                        <Skeleton height="40px" width="40px" borderRadius="lg" />
                      </HStack>
                    </HStack>
                  </Box>
                  
                  {/* Messages Area */}
                  <Box flex={1} p={6} w="100%">
                    <VStack spacing={6} align="stretch">
                      {[...Array(6)].map((_, i) => (
                        <HStack key={i} justify={i % 2 === 0 ? 'flex-end' : 'flex-start'} w="100%">
                          <Box maxW="70%" bg={i % 2 === 0 ? 'blue.100' : 'gray.100'} p={4} borderRadius="2xl">
                            <Skeleton height="18px" width="250px" borderRadius="md" />
                            <Skeleton height="14px" width="100px" borderRadius="sm" mt={3} />
                          </Box>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                  
                  {/* Message Input */}
                  <Box p={6} borderTop="2px" borderColor="gray.200" w="100%">
                    <HStack spacing={4}>
                      <Skeleton height="50px" width="50px" borderRadius="lg" />
                      <Skeleton height="50px" width="100%" borderRadius="xl" />
                      <Skeleton height="50px" width="100px" borderRadius="xl" />
                    </HStack>
                  </Box>
                </VStack>
              </GridItem>
            </Grid>
          </CardBody>
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
            <Text color="gray.500" fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
              Loading inbox conversations...
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

const WhatsAppInbox = () => {
  const auth = useSelector(state => state.auth);
  const toast = useToast();
  
  // Error boundary state
  const [hasError, setHasError] = useState(false);
  
  // Gmail Setup Modal State
  const [showGmailSetup, setShowGmailSetup] = useState(false);
  const [gmailConfig, setGmailConfig] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
    smtpSecure: false
  });
  const [gmailSetupLoading, setGmailSetupLoading] = useState(false);
  
  // Buy Credits Modal State
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [creditPackages, setCreditPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [buyCreditsLoading, setBuyCreditsLoading] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);
  
  // Gmail Setup Functions
  const handleGmailConfigChange = (field, value) => {
    setGmailConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testGmailConfig = async () => {
    setGmailSetupLoading(true);
    try {
      console.log('🚀 [GMAIL TEST] Testing Gmail configuration...');
      console.log('🚀 [GMAIL TEST] Config:', gmailConfig);
      
      // Call API to test email configuration
      const response = await messagingAPI.testEmailConfig({
        to: gmailConfig.fromEmail || 'test@example.com',
        subject: 'Test Email Configuration',
        body: 'This is a test email to verify your Gmail configuration is working properly.'
      });
      
      if (response.success) {
        toast({
          title: '✅ Gmail Configuration Test Successful!',
          description: 'Test email sent successfully. Your Gmail setup is working correctly.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        console.log('✅ [GMAIL TEST] Configuration test successful:', response.data);
      } else {
        throw new Error(response.message || 'Test failed');
      }
    } catch (error) {
      console.error('❌ [GMAIL TEST] Configuration test failed:', error);
      toast({
        title: '❌ Test Failed',
        description: error.response?.data?.message || 'Failed to test Gmail configuration. Please check your settings.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setGmailSetupLoading(false);
    }
  };

  const saveGmailConfig = async () => {
    setGmailSetupLoading(true);
    try {
      console.log('🚀 [GMAIL SETUP] Saving Gmail configuration...');
      console.log('🚀 [GMAIL SETUP] Config:', gmailConfig);
      
      // Call API to setup email configuration
      const response = await messagingAPI.setupEmailConfig({
        provider: 'gmail',
        host: gmailConfig.smtpHost,
        port: parseInt(gmailConfig.smtpPort),
        secure: gmailConfig.smtpSecure,
        auth: {
          user: gmailConfig.smtpUsername,
          pass: gmailConfig.smtpPassword
        },
        fromEmail: gmailConfig.fromEmail,
        fromName: gmailConfig.fromName
      });
      
      if (response.success) {
        toast({
          title: '✅ Gmail Setup Complete!',
          description: 'Your Gmail configuration has been saved successfully. You can now send emails.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        setShowGmailSetup(false);
        console.log('✅ [GMAIL SETUP] Configuration saved successfully:', response.data);
      } else {
        throw new Error(response.message || 'Setup failed');
      }
    } catch (error) {
      console.error('❌ [GMAIL SETUP] Configuration save failed:', error);
      toast({
        title: '❌ Gmail Setup Failed',
        description: error.response?.data?.message || 'Failed to save Gmail configuration. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setGmailSetupLoading(false);
    }
  };

  // Buy Credits Functions
  const loadCreditPackages = async () => {
    try {
      console.log('🚀 [BUY CREDITS] Loading credit packages...');
      const response = await messagingAPI.getCreditPackages();
      
      if (response.success && response.data && response.data.packages) {
        setCreditPackages(response.data.packages);
        console.log('✅ [BUY CREDITS] Credit packages loaded:', response.data.packages);
      } else {
        // Mock packages if API fails
        const mockPackages = [
          {
            id: 'basic',
            name: 'Basic Package',
            credits: 1000,
            price: 50,
            currency: 'USD',
            description: 'Perfect for small businesses',
            features: ['1000 WhatsApp messages', 'Email support', 'Basic analytics']
          },
          {
            id: 'premium',
            name: 'Premium Package',
            credits: 5000,
            price: 200,
            currency: 'USD',
            description: 'Great for growing businesses',
            features: ['5000 WhatsApp messages', 'Priority support', 'Advanced analytics', 'Bulk messaging']
          },
          {
            id: 'enterprise',
            name: 'Enterprise Package',
            credits: 10000,
            price: 350,
            currency: 'USD',
            description: 'For large enterprises',
            features: ['10000 WhatsApp messages', '24/7 support', 'Custom analytics', 'API access', 'Dedicated manager']
          }
        ];
        setCreditPackages(mockPackages);
        console.log('🎭 [BUY CREDITS] Using mock packages');
      }
    } catch (error) {
      console.error('❌ [BUY CREDITS] Error loading packages:', error);
      toast({
        title: '❌ Error Loading Packages',
        description: 'Failed to load credit packages. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const loadCreditBalance = async () => {
    try {
      console.log('🚀 [BUY CREDITS] Loading credit balance...');
      const response = await messagingAPI.getCreditBalance();
      
      if (response.success && response.data && response.data.balance !== undefined) {
        setCreditBalance(response.data.balance);
        console.log('✅ [BUY CREDITS] Credit balance loaded:', response.data.balance);
      } else {
        setCreditBalance(0);
        console.log('⚠️ [BUY CREDITS] No balance available');
      }
    } catch (error) {
      console.error('❌ [BUY CREDITS] Error loading balance:', error);
      setCreditBalance(0);
    }
  };

  const purchaseCredits = async () => {
    if (!selectedPackage) {
      toast({
        title: '⚠️ Select a Package',
        description: 'Please select a credit package to purchase.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setBuyCreditsLoading(true);
    try {
      console.log('🚀 [BUY CREDITS] Purchasing credits...');
      console.log('🚀 [BUY CREDITS] Selected Package:', selectedPackage);
      
      const purchaseData = {
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        credits: selectedPackage.credits,
        amount: selectedPackage.price,
        currency: selectedPackage.currency || 'USD'
      };

      const response = await messagingAPI.purchaseCredits(purchaseData);
      
      if (response.success) {
        toast({
          title: '✅ Credits Purchased Successfully!',
          description: `You have purchased ${selectedPackage.credits} credits for $${selectedPackage.price}.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Refresh balance and close modal
        await loadCreditBalance();
        setShowBuyCredits(false);
        setSelectedPackage(null);
        
        console.log('✅ [BUY CREDITS] Credits purchased successfully:', response.data);
      } else {
        throw new Error(response.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('❌ [BUY CREDITS] Purchase failed:', error);
      toast({
        title: '❌ Purchase Failed',
        description: error.response?.data?.message || 'Failed to purchase credits. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setBuyCreditsLoading(false);
    }
  };

  const openBuyCreditsModal = async () => {
    setShowBuyCredits(true);
    await Promise.all([
      loadCreditPackages(),
      loadCreditBalance()
    ]);
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure();
  const cancelRef = useRef();
  
  // Modern color scheme
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, blue.900, purple.900)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  
  // State management
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [inboxType, setInboxType] = useState('whatsapp'); // 'whatsapp' or 'email'
  const [conversations, setConversations] = useState([]);
  const [emailConversations, setEmailConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('messages');
  const [searchResults, setSearchResults] = useState([]);
  const [inboxStats, setInboxStats] = useState({
    totalConversations: 0,
    unreadMessages: 0,
    activeConversations: 0,
    resolvedToday: 0,
    responseTime: '0 min',
    satisfactionRate: '0%'
  });
  const [filters, setFilters] = useState({
    status: 'all',
    unread: false,
    archived: false,
    pinned: false
  });
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    hasMore: true
  });
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [messageForm, setMessageForm] = useState({
    messageType: 'text',
    templateName: '',
    templateParams: {}
  });
  const [templates, setTemplates] = useState([]);
  const [whatsappDevices, setWhatsappDevices] = useState([]);
  const [whatsappSettings, setWhatsappSettings] = useState({});
  
  // Color mode values - moved to top to fix hooks order
  const statsBg1 = useColorModeValue('blue.50', 'blue.900');
  const statsBg2 = useColorModeValue('red.50', 'red.900');
  const statsBg3 = useColorModeValue('green.50', 'green.900');
  const statsBg4 = useColorModeValue('purple.50', 'purple.900');
  const deviceBg = useColorModeValue('green.50', 'green.900');
  const deviceBorderColor = useColorModeValue('green.200', 'green.700');
  const deviceTextColor = useColorModeValue('green.700', 'green.200');
  const deviceTextColor2 = useColorModeValue('green.600', 'green.300');
  const deviceIconColor = useColorModeValue('green.500', 'green.300');
  const messageInputBg = useColorModeValue('gray.50', 'gray.700');
  const messageThemBg = useColorModeValue('gray.100', 'gray.700');
  const messageMeBg = useColorModeValue('gray.50', 'gray.700');
  const messageActionsBg = useColorModeValue('blue.50', 'blue.900');
  const messageActionsTextColor = useColorModeValue('blue.600', 'blue.200');
  const actionRedBg = useColorModeValue('red.50', 'red.900');
  const actionGrayBg = useColorModeValue('gray.50', 'gray.700');
  const actionYellowBg = useColorModeValue('yellow.50', 'yellow.900');
  const contactItemBg = useColorModeValue('blue.50', 'blue.900');

  // Get user data from Redux
  const userId = auth?.user?.id || auth?.user?._id;
  const token = auth?.token || auth?.accessToken;
  const coachId = auth?.user?.coachId || userId;
  const isAuthenticated = !!(userId && token);

  // Debug auth state
  useEffect(() => {
    console.log('🔍 Auth Debug:', {
      userId: userId,
      coachId: coachId,
      token: token ? 'Present' : 'Missing',
      tokenLength: token?.length || 0,
      isAuthenticated: isAuthenticated,
      fullAuth: auth
    });
  }, [auth, userId, coachId, token, isAuthenticated]);

  // API headers with real authentication
  const getHeaders = () => {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  };

  // Unified API Service Class for WhatsApp/Email Messaging
  class UnifiedMessagingAPI {
    constructor(baseUrl, token) {
      this.baseUrl = baseUrl;
      this.token = token;
    }

    getHeaders() {
      return {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
    }

    // Unified Inbox API
    async getUnifiedInbox(page = 1, limit = 20, filters = {}) {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...filters
        });

        console.log('🚀 [UNIFIED INBOX API] Request URL:', `${this.baseUrl}/api/whatsapp/v1/messagingv1/unified/inbox?${params}`);
        console.log('🚀 [UNIFIED INBOX API] Request Headers:', this.getHeaders());
        console.log('🚀 [UNIFIED INBOX API] Request Filters:', filters);

        const response = await axios.get(
          `${this.baseUrl}/api/whatsapp/v1/messagingv1/unified/inbox?${params}`,
          { headers: this.getHeaders() }
        );

        console.log('✅ [UNIFIED INBOX API] Response Status:', response.status);
        console.log('✅ [UNIFIED INBOX API] Response Headers:', response.headers);
        console.log('✅ [UNIFIED INBOX API] Full Response Data:', JSON.stringify(response.data, null, 2));

        return response.data;
      } catch (error) {
        console.error('❌ [UNIFIED INBOX API] Error Status:', error.response?.status);
        console.error('❌ [UNIFIED INBOX API] Error Data:', error.response?.data);
        console.error('❌ [UNIFIED INBOX API] Full Error:', error);
        throw error;
      }
    }

    // Get Unified Conversation
    async getUnifiedConversation(contactId) {
      try {
        console.log('🚀 [UNIFIED CONVERSATION API] Request URL:', `${this.baseUrl}/api/whatsapp/v1/messagingv1/unified/inbox/conversation/${contactId}`);
        console.log('🚀 [UNIFIED CONVERSATION API] Contact ID:', contactId);
        console.log('🚀 [UNIFIED CONVERSATION API] Request Headers:', this.getHeaders());

        const response = await axios.get(
          `${this.baseUrl}/api/whatsapp/v1/messagingv1/unified/inbox/conversation/${contactId}`,
          { headers: this.getHeaders() }
        );

        console.log('✅ [UNIFIED CONVERSATION API] Response Status:', response.status);
        console.log('✅ [UNIFIED CONVERSATION API] Response Headers:', response.headers);
        console.log('✅ [UNIFIED CONVERSATION API] Full Response Data:', JSON.stringify(response.data, null, 2));

        return response.data;
      } catch (error) {
        console.error('❌ [UNIFIED CONVERSATION API] Error Status:', error.response?.status);
        console.error('❌ [UNIFIED CONVERSATION API] Error Data:', error.response?.data);
        console.error('❌ [UNIFIED CONVERSATION API] Full Error:', error);
        throw error;
      }
    }

    // Get Unified Templates
    async getUnifiedTemplates() {
      try {
        console.log('🚀 [UNIFIED TEMPLATES API] Request URL:', `${this.baseUrl}/api/whatsapp/v1/messagingv1/unified/templates`);
        console.log('🚀 [UNIFIED TEMPLATES API] Request Headers:', this.getHeaders());

        const response = await axios.get(
          `${this.baseUrl}/api/whatsapp/v1/messagingv1/unified/templates`,
          { headers: this.getHeaders() }
        );

        console.log('✅ [UNIFIED TEMPLATES API] Response Status:', response.status);
        console.log('✅ [UNIFIED TEMPLATES API] Response Headers:', response.headers);
        console.log('✅ [UNIFIED TEMPLATES API] Full Response Data:', JSON.stringify(response.data, null, 2));

        return response.data;
      } catch (error) {
        console.error('❌ [UNIFIED TEMPLATES API] Error Status:', error.response?.status);
        console.error('❌ [UNIFIED TEMPLATES API] Error Data:', error.response?.data);
        console.error('❌ [UNIFIED TEMPLATES API] Full Error:', error);
        throw error;
      }
    }

    // Send Unified Message
    async sendUnifiedMessage(messageData) {
      try {
        console.log('🚀 [SEND UNIFIED MESSAGE API] Request URL:', `${this.baseUrl}/api/whatsapp/v1/messagingv1/unified/send`);
        console.log('🚀 [SEND UNIFIED MESSAGE API] Request Headers:', this.getHeaders());
        console.log('🚀 [SEND UNIFIED MESSAGE API] Request Body:', JSON.stringify(messageData, null, 2));

        const response = await axios.post(
          `${this.baseUrl}/api/whatsapp/v1/messagingv1/unified/send`,
          messageData,
          { headers: this.getHeaders() }
        );

        console.log('✅ [SEND UNIFIED MESSAGE API] Response Status:', response.status);
        console.log('✅ [SEND UNIFIED MESSAGE API] Response Headers:', response.headers);
        console.log('✅ [SEND UNIFIED MESSAGE API] Full Response Data:', JSON.stringify(response.data, null, 2));

        return response.data;
      } catch (error) {
        console.error('❌ [SEND UNIFIED MESSAGE API] Error Status:', error.response?.status);
        console.error('❌ [SEND UNIFIED MESSAGE API] Error Data:', error.response?.data);
        console.error('❌ [SEND UNIFIED MESSAGE API] Full Error:', error);
        throw error;
      }
    }

    // Send Bulk Messages
    async sendBulkMessages(bulkData) {
      try {
        console.log('🚀 [SEND BULK MESSAGES API] Request URL:', `${this.baseUrl}/api/whatsapp/v1/messagingv1/unified/send-bulk`);
        console.log('🚀 [SEND BULK MESSAGES API] Request Headers:', this.getHeaders());
        console.log('🚀 [SEND BULK MESSAGES API] Request Body:', JSON.stringify(bulkData, null, 2));

        const response = await axios.post(
          `${this.baseUrl}/api/whatsapp/v1/messagingv1/unified/send-bulk`,
          bulkData,
          { headers: this.getHeaders() }
        );

        console.log('✅ [SEND BULK MESSAGES API] Response Status:', response.status);
        console.log('✅ [SEND BULK MESSAGES API] Response Headers:', response.headers);
        console.log('✅ [SEND BULK MESSAGES API] Full Response Data:', JSON.stringify(response.data, null, 2));

        return response.data;
      } catch (error) {
        console.error('❌ [SEND BULK MESSAGES API] Error Status:', error.response?.status);
        console.error('❌ [SEND BULK MESSAGES API] Error Data:', error.response?.data);
        console.error('❌ [SEND BULK MESSAGES API] Full Error:', error);
        throw error;
      }
    }

    // Get Parameter Options
    async getParameterOptions() {
      try {
        console.log('🚀 [PARAMETER OPTIONS API] Request URL:', `${this.baseUrl}/api/whatsapp/v1/messagingv1/unified/parameter-options`);
        console.log('🚀 [PARAMETER OPTIONS API] Request Headers:', this.getHeaders());

        const response = await axios.get(
          `${this.baseUrl}/api/whatsapp/v1/messagingv1/unified/parameter-options`,
          { headers: this.getHeaders() }
        );

        console.log('✅ [PARAMETER OPTIONS API] Response Status:', response.status);
        console.log('✅ [PARAMETER OPTIONS API] Response Headers:', response.headers);
        console.log('✅ [PARAMETER OPTIONS API] Full Response Data:', JSON.stringify(response.data, null, 2));

        return response.data;
      } catch (error) {
        console.error('❌ [PARAMETER OPTIONS API] Error Status:', error.response?.status);
        console.error('❌ [PARAMETER OPTIONS API] Error Data:', error.response?.data);
        console.error('❌ [PARAMETER OPTIONS API] Full Error:', error);
        throw error;
      }
    }

    // Get 24-Hour Contacts
    async get24HourContacts(page = 1, limit = 20) {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString()
        });

        console.log('🚀 [24-HOUR CONTACTS API] Request URL:', `${this.baseUrl}/api/whatsapp/v1/messagingv1/unified/24hr-contacts?${params}`);
        console.log('🚀 [24-HOUR CONTACTS API] Request Headers:', this.getHeaders());
        console.log('🚀 [24-HOUR CONTACTS API] Page:', page, 'Limit:', limit);

        const response = await axios.get(
          `${this.baseUrl}/api/whatsapp/v1/messagingv1/unified/24hr-contacts?${params}`,
          { headers: this.getHeaders() }
        );

        console.log('✅ [24-HOUR CONTACTS API] Response Status:', response.status);
        console.log('✅ [24-HOUR CONTACTS API] Response Headers:', response.headers);
        console.log('✅ [24-HOUR CONTACTS API] Full Response Data:', JSON.stringify(response.data, null, 2));

        return response.data;
      } catch (error) {
        console.error('❌ [24-HOUR CONTACTS API] Error Status:', error.response?.status);
        console.error('❌ [24-HOUR CONTACTS API] Error Data:', error.response?.data);
        console.error('❌ [24-HOUR CONTACTS API] Full Error:', error);
        throw error;
      }
    }

    // Get Queue Stats (Admin Only)
    async getQueueStats() {
      try {
        console.log('🚀 [QUEUE STATS API] Request URL:', `${this.baseUrl}/api/whatsapp/v1/messagingv1/unified/queue-stats`);
        console.log('🚀 [QUEUE STATS API] Request Headers:', this.getHeaders());

        const response = await axios.get(
          `${this.baseUrl}/api/whatsapp/v1/messagingv1/unified/queue-stats`,
          { headers: this.getHeaders() }
        );

        console.log('✅ [QUEUE STATS API] Response Status:', response.status);
        console.log('✅ [QUEUE STATS API] Response Headers:', response.headers);
        console.log('✅ [QUEUE STATS API] Full Response Data:', JSON.stringify(response.data, null, 2));

        return response.data;
      } catch (error) {
        console.error('❌ [QUEUE STATS API] Error Status:', error.response?.status);
        console.error('❌ [QUEUE STATS API] Error Data:', error.response?.data);
        console.error('❌ [QUEUE STATS API] Full Error:', error);
        throw error;
      }
    }

    // Get Coach WhatsApp Settings
    async getCoachWhatsAppSettings() {
      try {
        console.log('🚀 [COACH WHATSAPP SETTINGS API] Request URL:', `${this.baseUrl}/api/whatsapp/v1/messagingv1/settings`);
        console.log('🚀 [COACH WHATSAPP SETTINGS API] Request Headers:', this.getHeaders());
        
        const response = await axios.get(
          `${this.baseUrl}/api/whatsapp/v1/messagingv1/settings`,
          { headers: this.getHeaders() }
        );
        
        console.log('✅ [COACH WHATSAPP SETTINGS API] Response Status:', response.status);
        console.log('✅ [COACH WHATSAPP SETTINGS API] Response Headers:', response.headers);
        console.log('✅ [COACH WHATSAPP SETTINGS API] Full Response Data:', JSON.stringify(response.data, null, 2));
        
        return response.data;
      } catch (error) {
        console.error('❌ [COACH WHATSAPP SETTINGS API] Error Status:', error.response?.status);
        console.error('❌ [COACH WHATSAPP SETTINGS API] Error Data:', error.response?.data);
        console.error('❌ [COACH WHATSAPP SETTINGS API] Full Error:', error);
        throw error;
      }
    }

    // Set Coach WhatsApp Settings
    async setCoachWhatsAppSettings(settingsData) {
      try {
        console.log('🚀 [SET COACH WHATSAPP SETTINGS API] Request URL:', `${this.baseUrl}/api/whatsapp/v1/messagingv1/settings`);
        console.log('🚀 [SET COACH WHATSAPP SETTINGS API] Request Headers:', this.getHeaders());
        console.log('🚀 [SET COACH WHATSAPP SETTINGS API] Request Body:', settingsData);
        
        const response = await axios.post(
          `${this.baseUrl}/api/whatsapp/v1/messagingv1/settings`,
          settingsData,
          { headers: this.getHeaders() }
        );
        
        console.log('✅ [SET COACH WHATSAPP SETTINGS API] Response Status:', response.status);
        console.log('✅ [SET COACH WHATSAPP SETTINGS API] Response Headers:', response.headers);
        console.log('✅ [SET COACH WHATSAPP SETTINGS API] Full Response Data:', JSON.stringify(response.data, null, 2));
        
        return response.data;
      } catch (error) {
        console.error('❌ [SET COACH WHATSAPP SETTINGS API] Error Status:', error.response?.status);
        console.error('❌ [SET COACH WHATSAPP SETTINGS API] Error Data:', error.response?.data);
        console.error('❌ [SET COACH WHATSAPP SETTINGS API] Full Error:', error);
        throw error;
      }
    }

    // Get Coach WhatsApp Devices
    async getCoachWhatsAppDevices() {
      try {
        console.log('🚀 [COACH WHATSAPP DEVICES API] Request URL:', `${this.baseUrl}/api/whatsapp/v1/messagingv1/devices`);
        console.log('🚀 [COACH WHATSAPP DEVICES API] Request Headers:', this.getHeaders());
        
        const response = await axios.get(
          `${this.baseUrl}/api/whatsapp/v1/messagingv1/devices`,
          { headers: this.getHeaders() }
        );
        
        console.log('✅ [COACH WHATSAPP DEVICES API] Response Status:', response.status);
        console.log('✅ [COACH WHATSAPP DEVICES API] Response Headers:', response.headers);
        console.log('✅ [COACH WHATSAPP DEVICES API] Full Response Data:', JSON.stringify(response.data, null, 2));
        
        return response.data;
      } catch (error) {
        console.error('❌ [COACH WHATSAPP DEVICES API] Error Status:', error.response?.status);
        console.error('❌ [COACH WHATSAPP DEVICES API] Error Data:', error.response?.data);
        console.error('❌ [COACH WHATSAPP DEVICES API] Full Error:', error);
        throw error;
      }
    }

    // Create WhatsApp Device
    async createWhatsAppDevice(deviceData) {
      try {
        console.log('🚀 [CREATE WHATSAPP DEVICE API] Request URL:', `${this.baseUrl}/api/whatsapp/v1/messagingv1/devices`);
        console.log('🚀 [CREATE WHATSAPP DEVICE API] Request Headers:', this.getHeaders());
        console.log('🚀 [CREATE WHATSAPP DEVICE API] Request Body:', deviceData);
        
        const response = await axios.post(
          `${this.baseUrl}/api/whatsapp/v1/messagingv1/devices`,
          deviceData,
          { headers: this.getHeaders() }
        );
        
        console.log('✅ [CREATE WHATSAPP DEVICE API] Response Status:', response.status);
        console.log('✅ [CREATE WHATSAPP DEVICE API] Response Headers:', response.headers);
        console.log('✅ [CREATE WHATSAPP DEVICE API] Full Response Data:', JSON.stringify(response.data, null, 2));
        
        return response.data;
      } catch (error) {
        console.error('❌ [CREATE WHATSAPP DEVICE API] Error Status:', error.response?.status);
        console.error('❌ [CREATE WHATSAPP DEVICE API] Error Data:', error.response?.data);
        console.error('❌ [CREATE WHATSAPP DEVICE API] Full Error:', error);
        throw error;
      }
    }

    // Get Device Status
    async getDeviceStatus(deviceId) {
      try {
        console.log('🚀 [DEVICE STATUS API] Request URL:', `${this.baseUrl}/api/whatsapp/v1/messagingv1/devices/${deviceId}/status`);
        console.log('🚀 [DEVICE STATUS API] Request Headers:', this.getHeaders());
        
        const response = await axios.get(
          `${this.baseUrl}/api/whatsapp/v1/messagingv1/devices/${deviceId}/status`,
          { headers: this.getHeaders() }
        );
        
        console.log('✅ [DEVICE STATUS API] Response Status:', response.status);
        console.log('✅ [DEVICE STATUS API] Response Headers:', response.headers);
        console.log('✅ [DEVICE STATUS API] Full Response Data:', JSON.stringify(response.data, null, 2));
        
        return response.data;
      } catch (error) {
        console.error('❌ [DEVICE STATUS API] Error Status:', error.response?.status);
        console.error('❌ [DEVICE STATUS API] Error Data:', error.response?.data);
        console.error('❌ [DEVICE STATUS API] Full Error:', error);
        throw error;
      }
    }

    // Switch WhatsApp Device
    async switchWhatsAppDevice(deviceId) {
      try {
        console.log('🚀 [SWITCH WHATSAPP DEVICE API] Request URL:', `${this.baseUrl}/api/whatsapp/v1/messagingv1/devices/${deviceId}/switch`);
        console.log('🚀 [SWITCH WHATSAPP DEVICE API] Request Headers:', this.getHeaders());
        
        const response = await axios.post(
          `${this.baseUrl}/api/whatsapp/v1/messagingv1/devices/${deviceId}/switch`,
          {},
          { headers: this.getHeaders() }
        );
        
        console.log('✅ [SWITCH WHATSAPP DEVICE API] Response Status:', response.status);
        console.log('✅ [SWITCH WHATSAPP DEVICE API] Response Headers:', response.headers);
        console.log('✅ [SWITCH WHATSAPP DEVICE API] Full Response Data:', JSON.stringify(response.data, null, 2));
        
        return response.data;
      } catch (error) {
        console.error('❌ [SWITCH WHATSAPP DEVICE API] Error Status:', error.response?.status);
        console.error('❌ [SWITCH WHATSAPP DEVICE API] Error Data:', error.response?.data);
        console.error('❌ [SWITCH WHATSAPP DEVICE API] Full Error:', error);
        throw error;
      }
    }

    // Get Messaging Statistics
    async getMessagingStats() {
      try {
        console.log('🚀 [MESSAGING STATS API] Request URL:', `${this.baseUrl}/api/whatsapp/v1/messagingv1/stats`);
        console.log('🚀 [MESSAGING STATS API] Request Headers:', this.getHeaders());
        
        const response = await axios.get(
          `${this.baseUrl}/api/whatsapp/v1/messagingv1/stats`,
          { headers: this.getHeaders() }
        );
        
        console.log('✅ [MESSAGING STATS API] Response Status:', response.status);
        console.log('✅ [MESSAGING STATS API] Response Headers:', response.headers);
        console.log('✅ [MESSAGING STATS API] Full Response Data:', JSON.stringify(response.data, null, 2));
        
        return response.data;
      } catch (error) {
        console.error('❌ [MESSAGING STATS API] Error Status:', error.response?.status);
        console.error('❌ [MESSAGING STATS API] Error Data:', error.response?.data);
        console.error('❌ [MESSAGING STATS API] Full Error:', error);
        throw error;
      }
    }

    // Email Configuration Methods
    async getEmailConfig() {
      try {
        console.log('🚀 [EMAIL CONFIG] Getting email configuration...');
        
        const response = await axios.get(`${this.baseUrl}/api/whatsapp/v1/admin/email/config`, {
          headers: this.getHeaders()
        });
        
        console.log('✅ [EMAIL CONFIG] Email config retrieved');
        console.log('✅ [EMAIL CONFIG] Response Status:', response.status);
        console.log('✅ [EMAIL CONFIG] Response Data:', response.data);
        
        return response.data;
      } catch (error) {
        console.error('❌ [EMAIL CONFIG] Failed to get email config:', error);
        console.error('❌ [EMAIL CONFIG] Error Status:', error.response?.status);
        console.error('❌ [EMAIL CONFIG] Error Data:', error.response?.data);
        throw error;
      }
    }

    async setupEmailConfig(emailConfig) {
      try {
        console.log('🚀 [EMAIL SETUP] Setting up email configuration...');
        console.log('🚀 [EMAIL SETUP] Config:', emailConfig);
        
        const response = await axios.post(`${this.baseUrl}/api/whatsapp/v1/admin/email/setup`, emailConfig, {
          headers: this.getHeaders()
        });
        
        console.log('✅ [EMAIL SETUP] Email setup successful');
        console.log('✅ [EMAIL SETUP] Response Status:', response.status);
        console.log('✅ [EMAIL SETUP] Response Data:', response.data);
        
        return response.data;
      } catch (error) {
        console.error('❌ [EMAIL SETUP] Email setup failed:', error);
        console.error('❌ [EMAIL SETUP] Error Status:', error.response?.status);
        console.error('❌ [EMAIL SETUP] Error Data:', error.response?.data);
        throw error;
      }
    }

    async testEmailConfig(testData) {
      try {
        console.log('🚀 [EMAIL TEST] Testing email configuration...');
        console.log('🚀 [EMAIL TEST] Test Data:', testData);
        
        const response = await axios.post(`${this.baseUrl}/api/whatsapp/v1/admin/email/test-config`, testData, {
          headers: this.getHeaders()
        });
        
        console.log('✅ [EMAIL TEST] Email test successful');
        console.log('✅ [EMAIL TEST] Response Status:', response.status);
        console.log('✅ [EMAIL TEST] Response Data:', response.data);
        
        return response.data;
      } catch (error) {
        console.error('❌ [EMAIL TEST] Email test failed:', error);
        console.error('❌ [EMAIL TEST] Error Status:', error.response?.status);
        console.error('❌ [EMAIL TEST] Error Data:', error.response?.data);
        throw error;
      }
    }

    async getEmailStatus() {
      try {
        console.log('🚀 [EMAIL STATUS] Getting email status...');
        
        const response = await axios.get(`${this.baseUrl}/api/whatsapp/v1/admin/email/status`, {
          headers: this.getHeaders()
        });
        
        console.log('✅ [EMAIL STATUS] Email status retrieved');
        console.log('✅ [EMAIL STATUS] Response Status:', response.status);
        console.log('✅ [EMAIL STATUS] Response Data:', response.data);
        
        return response.data;
      } catch (error) {
        console.error('❌ [EMAIL STATUS] Failed to get email status:', error);
        console.error('❌ [EMAIL STATUS] Error Status:', error.response?.status);
        console.error('❌ [EMAIL STATUS] Error Data:', error.response?.data);
        throw error;
      }
    }
  }

  // Initialize API service
  const messagingAPI = new UnifiedMessagingAPI(BASE_URL, token);

  // Get Coach WhatsApp Settings
  const getCoachWhatsAppSettings = async () => {
    try {
      console.log('🚀 [GET COACH WHATSAPP SETTINGS] Starting settings fetch...');
      
      console.log('🚀 [GET COACH WHATSAPP SETTINGS] Calling Unified Coach Settings API...');
      const response = await messagingAPI.getCoachWhatsAppSettings();
      
      console.log('✅ [GET COACH WHATSAPP SETTINGS] Unified Coach Settings API Response Received');
      console.log('✅ [GET COACH WHATSAPP SETTINGS] Response Success:', response.success);
      console.log('✅ [GET COACH WHATSAPP SETTINGS] Response Data Keys:', response.data ? Object.keys(response.data) : 'No data');
      
      if (response.success && response.data) {
        console.log('✅ [GET COACH WHATSAPP SETTINGS] Processing Response Data...');
        console.log('✅ [GET COACH WHATSAPP SETTINGS] Raw Settings:', response.data);
        
        setWhatsappSettings(response.data);
        console.log('✅ [GET COACH WHATSAPP SETTINGS] Coach settings loaded:', response.data);
        return response.data;
      } else {
        console.log('⚠️ [GET COACH WHATSAPP SETTINGS] No settings available from unified API');
        return null;
      }
    } catch (error) {
      console.error('❌ [GET COACH WHATSAPP SETTINGS] Unified coach settings fetch error:', error);
      return null;
    }
  };

  // Set Coach WhatsApp Settings
  const setCoachWhatsAppSettings = async (settingsData) => {
    try {
      console.log('🚀 [SET COACH WHATSAPP SETTINGS] Starting settings update...');
      console.log('🚀 [SET COACH WHATSAPP SETTINGS] Settings Data:', settingsData);
      
      console.log('🚀 [SET COACH WHATSAPP SETTINGS] Calling Unified Coach Settings API...');
      const response = await messagingAPI.setCoachWhatsAppSettings(settingsData);
      
      console.log('✅ [SET COACH WHATSAPP SETTINGS] Unified Coach Settings API Response Received');
      console.log('✅ [SET COACH WHATSAPP SETTINGS] Response Success:', response.success);
      console.log('✅ [SET COACH WHATSAPP SETTINGS] Response Data Keys:', response.data ? Object.keys(response.data) : 'No data');
      
      if (response.success && response.data) {
        console.log('✅ [SET COACH WHATSAPP SETTINGS] Processing Response Data...');
        console.log('✅ [SET COACH WHATSAPP SETTINGS] Updated Settings:', response.data);
        
        setWhatsappSettings(response.data);
        console.log('✅ [SET COACH WHATSAPP SETTINGS] Coach settings updated:', response.data);
        
        toast({
          title: '✅ Settings Updated',
          description: 'Coach WhatsApp settings have been updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update coach settings');
      }
    } catch (error) {
      console.error('❌ [SET COACH WHATSAPP SETTINGS] Coach settings update error:', error);
      
      toast({
        title: '❌ Settings Update Failed',
        description: error.response?.data?.message || 'Failed to update coach settings. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      throw error;
    }
  };


  // Get Inbox Stats
  const getInboxStats = async () => {
    try {
      console.log('🚀 [GET INBOX STATS] Starting inbox stats fetch...');
      
      // Use unified messaging API for stats
      console.log('🚀 [GET INBOX STATS] Calling Unified Messaging Stats API...');
      const response = await messagingAPI.getMessagingStats();
      
      console.log('✅ [GET INBOX STATS] Unified Messaging Stats API Response Received');
      console.log('✅ [GET INBOX STATS] Response Success:', response.success);
      console.log('✅ [GET INBOX STATS] Response Data Keys:', response.data ? Object.keys(response.data) : 'No data');
      
      if (response.success && response.data) {
        console.log('✅ [GET INBOX STATS] Processing Response Data...');
        console.log('✅ [GET INBOX STATS] Raw Stats:', response.data);
        
        // Update inbox stats with the response data
        setInboxStats(prev => ({
          ...prev,
          totalConversations: response.data.totalConversations || 0,
          unreadMessages: response.data.unreadMessages || 0,
          activeChats: response.data.activeChats || 0,
          resolvedToday: response.data.resolvedToday || 0,
          totalMessages: response.data.totalMessages || 0,
          todayMessages: response.data.todayMessages || 0
        }));
        
        console.log('✅ [GET INBOX STATS] Inbox stats updated:', response.data);
        return response.data;
      } else {
        console.log('⚠️ [GET INBOX STATS] No stats available from unified API');
        return null;
      }
    } catch (error) {
      console.error('❌ [GET INBOX STATS] Unified inbox stats fetch error:', error);
      
      // Use mock data as fallback
      console.log('🎭 [GET INBOX STATS] Using mock inbox stats as fallback');
      const mockStats = MockDataService.getMockInboxStats();
      setInboxStats(mockStats);
      
      return mockStats;
    }
  };

  // Get Parameter Options for Templates
  const getParameterOptions = async () => {
    try {
      console.log('🚀 API Call - getParameterOptions');
      const response = await messagingAPI.getParameterOptions();
      
      if (response.success && response.data) {
        console.log('✅ Parameter options loaded:', response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('❌ Parameter options fetch error:', error);
      return null;
    }
  };

  // Get Messaging Statistics
  const getMessagingStats = async () => {
    try {
      console.log('🚀 [GET MESSAGING STATS] Starting stats fetch...');
      
      console.log('🚀 [GET MESSAGING STATS] Calling Unified Stats API...');
      const response = await messagingAPI.getMessagingStats();
      
      console.log('✅ [GET MESSAGING STATS] Unified Stats API Response Received');
      console.log('✅ [GET MESSAGING STATS] Response Success:', response.success);
      console.log('✅ [GET MESSAGING STATS] Response Data Keys:', response.data ? Object.keys(response.data) : 'No data');
      
      if (response.success && response.data) {
        console.log('✅ [GET MESSAGING STATS] Processing Response Data...');
        console.log('✅ [GET MESSAGING STATS] Raw Stats:', response.data);
        
        return response.data;
      } else {
        console.log('⚠️ [GET MESSAGING STATS] No stats available from unified API');
        return {};
      }
    } catch (error) {
      console.error('❌ [GET MESSAGING STATS] Unified stats fetch error:', error);
      return {};
    }
  };

  // Create WhatsApp Device
  const createWhatsAppDevice = async (deviceData) => {
    try {
      console.log('🚀 [CREATE WHATSAPP DEVICE] Starting device creation...');
      console.log('🚀 [CREATE WHATSAPP DEVICE] Device Data:', deviceData);
      
      console.log('🚀 [CREATE WHATSAPP DEVICE] Calling Unified Create Device API...');
      const response = await messagingAPI.createWhatsAppDevice(deviceData);
      
      console.log('✅ [CREATE WHATSAPP DEVICE] Unified Create Device API Response Received');
      console.log('✅ [CREATE WHATSAPP DEVICE] Response Success:', response.success);
      console.log('✅ [CREATE WHATSAPP DEVICE] Response Data Keys:', response.data ? Object.keys(response.data) : 'No data');
      
      if (response.success && response.data) {
        console.log('✅ [CREATE WHATSAPP DEVICE] Processing Response Data...');
        console.log('✅ [CREATE WHATSAPP DEVICE] Created Device:', response.data);
        
        // Refresh devices list
        await getWhatsappDevices();
        
        toast({
          title: '✅ Device Created',
          description: 'WhatsApp device created successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        return response.data;
      } else {
        console.log('⚠️ [CREATE WHATSAPP DEVICE] Device creation failed');
        return null;
      }
    } catch (error) {
      console.error('❌ [CREATE WHATSAPP DEVICE] Unified device creation error:', error);
      
      toast({
        title: '❌ Device Creation Failed',
        description: 'Failed to create WhatsApp device. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return null;
    }
  };

  // Switch WhatsApp Device
  const switchWhatsAppDevice = async (deviceId) => {
    try {
      console.log('🚀 [SWITCH WHATSAPP DEVICE] Starting device switch...');
      console.log('🚀 [SWITCH WHATSAPP DEVICE] Device ID:', deviceId);
      
      console.log('🚀 [SWITCH WHATSAPP DEVICE] Calling Unified Switch Device API...');
      const response = await messagingAPI.switchWhatsAppDevice(deviceId);
      
      console.log('✅ [SWITCH WHATSAPP DEVICE] Unified Switch Device API Response Received');
      console.log('✅ [SWITCH WHATSAPP DEVICE] Response Success:', response.success);
      console.log('✅ [SWITCH WHATSAPP DEVICE] Response Data Keys:', response.data ? Object.keys(response.data) : 'No data');
      
      if (response.success && response.data) {
        console.log('✅ [SWITCH WHATSAPP DEVICE] Processing Response Data...');
        console.log('✅ [SWITCH WHATSAPP DEVICE] Switched Device:', response.data);
        
        // Refresh devices list
        await getWhatsappDevices();
        
        toast({
          title: '✅ Device Switched',
          description: 'WhatsApp device switched successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        return response.data;
      } else {
        console.log('⚠️ [SWITCH WHATSAPP DEVICE] Device switch failed');
        return null;
      }
    } catch (error) {
      console.error('❌ [SWITCH WHATSAPP DEVICE] Unified device switch error:', error);
      
      toast({
        title: '❌ Device Switch Failed',
        description: 'Failed to switch WhatsApp device. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return null;
    }
  };

  // Get Device Status
  const getDeviceStatus = async (deviceId) => {
    try {
      console.log('🚀 [GET DEVICE STATUS] Starting device status fetch...');
      console.log('🚀 [GET DEVICE STATUS] Device ID:', deviceId);
      
      console.log('🚀 [GET DEVICE STATUS] Calling Unified Device Status API...');
      const response = await messagingAPI.getDeviceStatus(deviceId);
      
      console.log('✅ [GET DEVICE STATUS] Unified Device Status API Response Received');
      console.log('✅ [GET DEVICE STATUS] Response Success:', response.success);
      console.log('✅ [GET DEVICE STATUS] Response Data Keys:', response.data ? Object.keys(response.data) : 'No data');
      
      if (response.success && response.data) {
        console.log('✅ [GET DEVICE STATUS] Processing Response Data...');
        console.log('✅ [GET DEVICE STATUS] Device Status:', response.data);
        
        return response.data;
      } else {
        console.log('⚠️ [GET DEVICE STATUS] No device status available');
        return null;
      }
    } catch (error) {
      console.error('❌ [GET DEVICE STATUS] Unified device status fetch error:', error);
      return null;
    }
  };

  // Get 24-Hour Contacts
  const get24HourContacts = async (page = 1, limit = 20) => {
    try {
      console.log('🚀 API Call - get24HourContacts');
      const response = await messagingAPI.get24HourContacts(page, limit);
      
      if (response.success && response.data) {
        console.log('✅ 24-hour contacts loaded:', response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('❌ 24-hour contacts fetch error:', error);
      return null;
    }
  };

  // Send Media Message - Using Unified Messaging API
  const sendMediaMessage = async (mediaUrl, mediaType, caption = '') => {
    if (!selectedConversation || !mediaUrl) return;

    setLoading(true);
    try {
      console.log('🚀 API Call - sendUnifiedMediaMessage');
      
      const messageData = {
        to: selectedConversation.phone || selectedConversation.email,
        messageType: inboxType === 'whatsapp' ? 'whatsapp' : 'email',
        type: 'media',
        mediaUrl: mediaUrl,
        mediaType: mediaType,
        caption: caption
      };

      console.log('📡 Unified Media Message Data:', messageData);

      const response = await messagingAPI.sendUnifiedMessage(messageData);

      if (response.success) {
        // Refresh messages and conversations
        getMessages(selectedConversation.id || selectedConversation.phone);
        getConversations();
        
        toast({
          title: '📎 Media Message Sent!',
          description: `${mediaType} sent successfully to ${selectedConversation.contactName}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        console.log('✅ Unified media message sent successfully');
      } else {
        throw new Error(response.message || 'Failed to send media message');
      }
    } catch (error) {
      console.error('❌ Send media message error:', error.response?.data || error.message);
      toast({
        title: '❌ Media Send Failed',
        description: error.response?.data?.message || 'Failed to send media message. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Enhanced Error Handler
  const handleAPIError = (error, operation = 'operation') => {
    console.error(`❌ ${operation} error:`, error.response?.data || error.message);
    
    let errorMessage = 'An unexpected error occurred. Please try again.';
    let errorTitle = 'Error';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Handle specific error types
    if (error.response?.status === 401) {
      errorTitle = 'Authentication Error';
      errorMessage = 'Your session has expired. Please log in again.';
    } else if (error.response?.status === 403) {
      errorTitle = 'Permission Denied';
      errorMessage = 'You do not have permission to perform this action.';
    } else if (error.response?.status === 404) {
      errorTitle = 'Not Found';
      errorMessage = 'The requested resource was not found.';
    } else if (error.response?.status >= 500) {
      errorTitle = 'Server Error';
      errorMessage = 'Server is temporarily unavailable. Please try again later.';
    }
    
    toast({
      title: errorTitle,
      description: errorMessage,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  // Get conversations with filters and pagination - Using Unified Inbox API
  const getConversations = async (loadMore = false) => {
    setLoading(true);
    try {
      console.log('🚀 [GET CONVERSATIONS] Starting conversation fetch...');
      console.log('🚀 [GET CONVERSATIONS] Load More:', loadMore);
      console.log('🚀 [GET CONVERSATIONS] Current Inbox Type:', inboxType);
      console.log('🚀 [GET CONVERSATIONS] Search Term:', searchTerm);
      console.log('🚀 [GET CONVERSATIONS] Pagination:', pagination);
      
      // Use unified inbox API with proper filters
      const filters = {
        type: inboxType === 'whatsapp' ? 'whatsapp' : inboxType === 'email' ? 'email' : '',
        contact: searchTerm || '',
        within24Hours: false
      };

      const currentPage = loadMore ? Math.ceil(conversations.length / pagination.limit) + 1 : 1;

      console.log('🚀 [GET CONVERSATIONS] Calling Unified Inbox API...');
      console.log('🚀 [GET CONVERSATIONS] Page:', currentPage, 'Limit:', pagination.limit);
      console.log('🚀 [GET CONVERSATIONS] Filters:', filters);

      const response = await messagingAPI.getUnifiedInbox(
        currentPage,
        pagination.limit,
        filters
      );

      console.log('✅ [GET CONVERSATIONS] Unified Inbox API Response Received');
      console.log('✅ [GET CONVERSATIONS] Response Success:', response.success);
      console.log('✅ [GET CONVERSATIONS] Response Data Keys:', response.data ? Object.keys(response.data) : 'No data');

      if (response.success && response.data) {
        const { messages = [], conversations = [], stats = {} } = response.data;
        
        console.log('✅ [GET CONVERSATIONS] Processing Response Data...');
        console.log('✅ [GET CONVERSATIONS] Raw Messages Count:', messages.length);
        console.log('✅ [GET CONVERSATIONS] Raw Conversations Count:', conversations.length);
        console.log('✅ [GET CONVERSATIONS] Raw Stats:', stats);
        
        // Transform unified inbox data to conversation format
        const newConversations = conversations.map(conv => ({
          id: conv._id || conv.id,
          phone: conv.phone || conv.contactId,
          contactName: conv.contactName || conv.name || 'Unknown Contact',
          lastMessage: conv.lastMessage?.content || 'No messages yet',
          timestamp: conv.lastMessage?.timestamp || new Date().toISOString(),
          unread: conv.unreadCount > 0,
          unreadCount: conv.unreadCount || 0,
          status: conv.status || 'active',
          pinned: conv.pinned || false,
          avatar: conv.avatar || null,
          email: conv.email || '',
          messageType: conv.messageType || 'whatsapp',
          totalMessages: conv.totalMessages || 0
        }));

        console.log('✅ [GET CONVERSATIONS] Transformed Conversations Count:', newConversations.length);
        console.log('✅ [GET CONVERSATIONS] Sample Transformed Conversation:', newConversations[0]);
        
        if (loadMore) {
          setConversations(prev => [...prev, ...newConversations]);
        } else {
          setConversations(newConversations);
        }

        // Update inbox stats
        setInboxStats(prev => ({
          ...prev,
          totalConversations: stats.total || 0,
          unreadMessages: stats.unread || 0,
          activeConversations: stats.active || 0
        }));

        // Update pagination
        setPagination(prev => ({
          ...prev,
          offset: loadMore ? prev.offset + prev.limit : prev.limit,
          hasMore: newConversations.length === prev.limit
        }));

        console.log('✅ Unified Inbox loaded successfully');
      } else {
        console.warn('⚠️ Unified Inbox API returned unexpected format:', response);
        setConversations([]);
      }

    } catch (error) {
      handleAPIError(error, 'Unified Inbox fetch');
      
      // Fallback to legacy API if unified API fails
      try {
        console.log('🔄 Falling back to legacy API...');
        const headers = getHeaders();
      const params = new URLSearchParams({
        limit: pagination.limit,
        offset: loadMore ? pagination.offset : 0,
        ...filters
      });

      const response = await axios.get(
        `${BASE_URL}/api/coach-dashboard/leads?${params}`,
        { headers }
      );

      const leadsData = response.data.leads || response.data.data || response.data || [];
      
        if (Array.isArray(leadsData)) {
      const newConversations = leadsData.map(lead => ({
        id: lead._id || lead.id || `lead-${Math.random()}`,
        phone: lead.phone || lead.contactNumber || lead.contact || 'Unknown',
            contactName: lead.name || lead.contactName || 'Unknown Contact',
        lastMessage: lead.lastMessage || lead.message || lead.description || 'No messages yet',
        timestamp: lead.createdAt || lead.timestamp || lead.date || new Date().toISOString(),
        unread: lead.unread || lead.isUnread || false,
        unreadCount: lead.unreadCount || lead.unreadMessages || 0,
        status: lead.status || lead.state || 'active',
        pinned: lead.pinned || lead.isPinned || false,
        avatar: lead.avatar || lead.profileImage || null,
            email: lead.email || lead.emailAddress || '',
            messageType: 'whatsapp'
      }));
      
      if (loadMore) {
        setConversations(prev => [...prev, ...newConversations]);
      } else {
        setConversations(newConversations);
      }

      setPagination(prev => ({
        ...prev,
        offset: loadMore ? prev.offset + prev.limit : prev.limit,
        hasMore: newConversations.length === prev.limit
      }));
        }
      } catch (fallbackError) {
        handleAPIError(fallbackError, 'Legacy conversations fetch');
        
        // Use mock data as final fallback
        console.log('🎭 Using mock data as fallback');
        const mockConversations = MockDataService.getMockConversations();
        setConversations(mockConversations);
        setPagination(prev => ({ ...prev, hasMore: false }));
      
      toast({
          title: '📱 Demo Mode Active',
          description: 'API server not available. Showing demo data.',
          status: 'info',
        duration: 5000,
        isClosable: true,
      });
      }
    } finally {
      setLoading(false);
    }
  };

  // Get messages for selected conversation - Using Unified Conversation API
  const getMessages = async (contactId, limit = 50) => {
    setLoading(true);
    try {
      console.log('🚀 [GET MESSAGES] Starting message fetch...');
      console.log('🚀 [GET MESSAGES] Contact ID:', contactId);
      console.log('🚀 [GET MESSAGES] Limit:', limit);
      
      // Use unified conversation API
      console.log('🚀 [GET MESSAGES] Calling Unified Conversation API...');
      const response = await messagingAPI.getUnifiedConversation(contactId);
      
      console.log('✅ [GET MESSAGES] Unified Conversation API Response Received');
      console.log('✅ [GET MESSAGES] Response Success:', response.success);
      console.log('✅ [GET MESSAGES] Response Data Keys:', response.data ? Object.keys(response.data) : 'No data');

      if (response.success && response.data) {
        const { messages = [], contact = {} } = response.data;
        
        console.log('✅ [GET MESSAGES] Processing Response Data...');
        console.log('✅ [GET MESSAGES] Raw Messages Count:', messages.length);
        console.log('✅ [GET MESSAGES] Raw Contact:', contact);
        
        // Transform unified conversation data to message format
        const transformedMessages = messages.map(msg => ({
          id: msg._id || msg.id,
          content: msg.content || msg.body || msg.message || 'No message content',
          timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
          from: msg.direction === 'inbound' ? 'them' : 'me',
          read: msg.isRead !== false,
          type: msg.type || 'text',
          messageType: msg.messageType || 'whatsapp',
          status: msg.status || 'delivered',
          subject: msg.subject || null,
          to: msg.to || null,
          fromDetails: msg.from || null
        }));

        // Update selected conversation with contact details
        if (contact) {
          setSelectedConversation(prev => ({
            ...prev,
            contactName: contact.name || prev?.contactName || 'Unknown Contact',
            phone: contact.phone || prev?.phone || '',
            email: contact.email || prev?.email || ''
          }));
        }
        
        setMessages(transformedMessages);
        console.log('✅ Unified Conversation loaded successfully');
      } else {
        console.warn('⚠️ Unified Conversation API returned unexpected format:', response);
        setMessages([]);
      }

    } catch (error) {
      handleAPIError(error, 'Unified Conversation fetch');
      
      // Fallback to legacy API
      try {
        console.log('🔄 Falling back to legacy messages API...');
      const headers = getHeaders();
      
      const response = await axios.get(
          `${BASE_URL}/api/coach-dashboard/leads?phone=${contactId}&limit=${limit}`,
        { headers }
      );
      
      const leadsData = response.data.leads || response.data.data || [];
      
        if (Array.isArray(leadsData)) {
      const messages = leadsData.map(lead => ({
        id: lead._id || lead.id,
        content: lead.message || lead.lastMessage || 'No message content',
        timestamp: lead.createdAt || lead.timestamp || new Date().toISOString(),
        from: lead.from || 'them',
        read: lead.read || true,
            type: lead.messageType || 'text',
            messageType: 'whatsapp'
      }));
      
      setMessages(messages);
        } else {
      setMessages([]);
        }
      } catch (fallbackError) {
        handleAPIError(fallbackError, 'Legacy messages fetch');
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Send message - Using Unified Messaging API
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      console.log('🚀 [SEND MESSAGE] Starting message send...');
      console.log('🚀 [SEND MESSAGE] Message Content:', newMessage.trim());
      console.log('🚀 [SEND MESSAGE] Selected Conversation:', selectedConversation);
      console.log('🚀 [SEND MESSAGE] Inbox Type:', inboxType);
      
      // Prepare message data based on message type
      const messageData = {
        to: selectedConversation.phone || selectedConversation.email,
        messageType: inboxType === 'whatsapp' ? 'whatsapp' : 'email',
        type: 'text',
        message: newMessage.trim()
      };

      // Add email-specific fields if sending email
      if (inboxType === 'email' && selectedConversation.email) {
        messageData.subject = `Message from ${auth?.user?.name || 'Coach'}`;
        messageData.emailBody = newMessage.trim();
      }

      console.log('🚀 [SEND MESSAGE] Prepared Message Data:', messageData);

      console.log('🚀 [SEND MESSAGE] Calling Unified Messaging API...');
      const response = await messagingAPI.sendUnifiedMessage(messageData);

      console.log('✅ [SEND MESSAGE] Unified Messaging API Response Received');
      console.log('✅ [SEND MESSAGE] Response Success:', response.success);
      console.log('✅ [SEND MESSAGE] Response Data:', response.data);

      if (response.success) {
        setNewMessage('');
        // Refresh messages and conversations
        getMessages(selectedConversation.id || selectedConversation.phone);
        getConversations();
        
        toast({
          title: `📱 ${inboxType === 'whatsapp' ? 'WhatsApp' : 'Email'} Message Sent!`,
          description: `Message sent successfully to ${selectedConversation.contactName}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        console.log('✅ Unified message sent successfully');
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error) {
      handleAPIError(error, 'Send unified message');
      
      // Fallback to legacy API
      try {
        console.log('🔄 Falling back to legacy send message API...');
      const headers = getHeaders();
      
      const messageData = {
        name: selectedConversation.contactName,
        phone: selectedConversation.phone,
        email: selectedConversation.email || '',
        message: newMessage,
        coachId: coachId,
        funnelId: 'whatsapp-inbox',
        funnelType: inboxType === 'whatsapp' ? 'whatsapp' : 'email',
        status: 'message-sent',
        targetAudience: 'client'
      };

      const response = await axios.post(
        `${BASE_URL}/api/leads`,
        messageData,
        { headers }
      );

      if (response.data.success) {
        setNewMessage('');
          getMessages(selectedConversation.id || selectedConversation.phone);
          getConversations();
        
        toast({
          title: '📱 Message Sent!',
          description: `Message sent successfully to ${selectedConversation.contactName}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      } catch (fallbackError) {
        handleAPIError(fallbackError, 'Legacy send message');
      }
    } finally {
      setLoading(false);
    }
  };

  // Send template message - Using Unified Messaging API
  const sendTemplateMessage = async () => {
    if (!selectedConversation || !messageForm.templateName) return;

    setLoading(true);
    try {
      console.log('🚀 API Call - sendUnifiedTemplateMessage');
      console.log('📡 Using Unified Messaging API for Templates');
      
      // Prepare template message data
      const messageData = {
        to: selectedConversation.phone || selectedConversation.email,
        messageType: inboxType === 'whatsapp' ? 'whatsapp' : 'email',
        type: 'template',
        templateName: messageForm.templateName,
        templateParameters: Object.values(messageForm.templateParams || {})
      };

      console.log('📡 Unified Template Message Data:', messageData);

      const response = await messagingAPI.sendUnifiedMessage(messageData);

      if (response.success) {
        // Refresh messages and conversations
        getMessages(selectedConversation.id || selectedConversation.phone);
        getConversations();
        
        toast({
          title: '📋 Template Message Sent!',
          description: `Template message sent successfully to ${selectedConversation.contactName}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        onClose(); // Close template modal
        console.log('✅ Unified template message sent successfully');
      } else {
        throw new Error(response.message || 'Failed to send template message');
      }
    } catch (error) {
      console.error('❌ Send unified template message error:', error.response?.data || error.message);
      
      // Fallback to legacy API
      try {
        console.log('🔄 Falling back to legacy template message API...');
      const headers = getHeaders();
      const selectedTemplate = templates.find(t => t.id === messageForm.templateName);
      const templateContent = selectedTemplate ? selectedTemplate.content : `Template: ${messageForm.templateName}`;
      
      const messageData = {
        name: selectedConversation.contactName,
        phone: selectedConversation.phone,
        email: selectedConversation.email || '',
        message: templateContent,
        coachId: coachId,
        funnelId: 'template-message',
        funnelType: 'template',
        status: 'template-sent',
        targetAudience: 'client',
        templateName: messageForm.templateName,
        templateParams: messageForm.templateParams
      };

      const response = await axios.post(
        `${BASE_URL}/api/leads`,
        messageData,
        { headers }
      );

      if (response.data.success) {
          getMessages(selectedConversation.id || selectedConversation.phone);
          getConversations();
          
        toast({
          title: '📋 Template Message Sent!',
          description: `Template message sent successfully to ${selectedConversation.contactName}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
          onClose();
      }
      } catch (fallbackError) {
        console.error('❌ Fallback template message also failed:', fallbackError);
      toast({
        title: '❌ Error',
          description: error.response?.data?.message || 'Failed to send template message. Please try again.',
        status: 'error',
          duration: 5000,
        isClosable: true,
      });
      }
    } finally {
      setLoading(false);
    }
  };

  // Mark conversation as read - Update local state
  const markAsRead = async (conversationId) => {
    try {
      // Update conversation in local state since marking as read API may not exist
      if (inboxType === 'whatsapp') {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, unreadCount: 0, unread: false }
              : conv
          )
        );
      } else {
        setEmailConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, unreadCount: 0, unread: false }
              : conv
          )
        );
      }
      
      console.log('✅ Conversation marked as read');
      
      // Try API call if authenticated
      if (isAuthenticated) {
        try {
          await axios.put(
            `${BASE_URL}/api/leads/${conversationId}`,
            { read: true, status: 'read' },
            { headers: getHeaders() }
          );
          getConversations();
        } catch (apiResult) {
          console.log('ℹ️ Mark as read API call not available, using local state only');
        }
      }
    } catch (error) {
      console.error('❌ Mark as read failed:', error);
    }
  };

  // Archive conversation - Real API call
  const archiveConversation = async (conversationId) => {
    try {
      // Update conversation status in sample data
      if (inboxType === 'whatsapp') {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, status: 'archived' }
              : conv
          )
        );
      } else {
        setEmailConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, status: 'archived' }
              : conv
          )
        );
      }
      
      toast({
        title: '🗃️ Conversation Archived',
        description: 'Conversation archived successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      console.log('✅ Conversation archived');
      
      // Real API call
      if (isAuthenticated) {
        try {
          await axios.put(
            `${BASE_URL}/api/leads/${conversationId}`,
            { status: 'archived' },
            { headers: getHeaders() }
          );
          getConversations();
        } catch (apiError) {
          console.log('ℹ️ Archive API call not available, using local state only');
        }
      }
    } catch (error) {
      toast({
        title: '❌ Archive Failed',
        description: 'Failed to archive conversation',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Pin/Unpin conversation - Real API call
  const pinConversation = async (conversationId, isPinned) => {
    try {
      // Update conversation pinned status in sample data
      if (inboxType === 'whatsapp') {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, pinned: !isPinned }
              : conv
          )
        );
      } else {
        setEmailConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, pinned: !isPinned }
              : conv
          )
        );
      }
      
      toast({
        title: isPinned ? '📌 Conversation Unpinned' : '📌 Conversation Pinned',
        description: `Conversation ${isPinned ? 'unpinned' : 'pinned'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      console.log(`✅ Conversation ${isPinned ? 'unpinned' : 'pinned'}`);
      
      // Real API call
      if (isAuthenticated) {
        try {
          await axios.put(
            `${BASE_URL}/api/leads/${conversationId}`,
            { pinned: !isPinned },
            { headers: getHeaders() }
          );
          getConversations();
        } catch (apiError) {
          console.log('ℹ️ Pin/Unpin API call not available, using local state only');
        }
      }
    } catch (error) {
      toast({
        title: '❌ Pin/Unpin Failed',
        description: 'Failed to pin/unpin conversation',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Search inbox - Real API call
  const searchInbox = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Search in sample data
      const currentConversations = inboxType === 'whatsapp' ? conversations : emailConversations;
      const filteredResults = currentConversations.filter(conv => 
        conv.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inboxType === 'whatsapp' ? conv.phone : conv.email).toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const searchResults = filteredResults.map(conv => ({
        contact: conv.contactName,
        message: conv.lastMessage,
        phone: inboxType === 'whatsapp' ? conv.phone : conv.email,
        timestamp: conv.lastMessageTime || conv.timestamp
      }));
      
      setSearchResults(searchResults);
      
      toast({
        title: '🔍 Search Complete',
        description: `Found ${searchResults.length} results`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      
      // Real API call for search
      if (isAuthenticated) {
        try {
          const params = new URLSearchParams({
            search: searchTerm,
            limit: 20
          });

          const response = await axios.get(
            `${BASE_URL}/api/coach-dashboard/leads?${params}`,
            { headers: getHeaders() }
          );

          if (response.data.success && response.data.leads) {
            const searchResults = response.data.leads.map(lead => ({
              contact: lead.name || 'Unknown Contact',
              phone: lead.phone || '',
              message: lead.message || lead.lastMessage || '',
              timestamp: lead.createdAt || new Date().toISOString()
            }));
            
            setSearchResults(searchResults);
          } else {
            setSearchResults([]);
          }
        } catch (apiError) {
          console.log('ℹ️ Search API call failed, using local search');
          setSearchResults([]);
        }
      } else {
        // Use local search as fallback
        const allConversations = inboxType === 'whatsapp' ? conversations : emailConversations;
        const searchResults = allConversations
          .filter(conv => 
            (searchType === 'messages' && conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (searchType === 'contacts' && conv.contactName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (searchType === 'phone' && conv.phone?.includes(searchTerm))
          )
          .map(conv => ({
            contact: conv.contactName,
            phone: conv.phone,
            message: conv.lastMessage
          }));
        
        setSearchResults(searchResults);
        
        toast({
          title: '🔍 Search Complete',
          description: `Found ${searchResults.length} results`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: '❌ Search Failed',
        description: 'Failed to search conversations',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Get WhatsApp Templates - Using Unified Templates API
  const getTemplates = async () => {
    try {
      console.log('🚀 [GET TEMPLATES] Starting templates fetch...');
      
      // Use unified templates API
      console.log('🚀 [GET TEMPLATES] Calling Unified Templates API...');
      const response = await messagingAPI.getUnifiedTemplates();
      
      console.log('✅ [GET TEMPLATES] Unified Templates API Response Received');
      console.log('✅ [GET TEMPLATES] Response Success:', response.success);
      console.log('✅ [GET TEMPLATES] Response Data Keys:', response.data ? Object.keys(response.data) : 'No data');
      
      if (response.success && response.data) {
        const { templates = [] } = response.data;
        
        console.log('✅ [GET TEMPLATES] Processing Response Data...');
        console.log('✅ [GET TEMPLATES] Raw Templates Count:', templates.length);
        console.log('✅ [GET TEMPLATES] Sample Template:', templates[0]);
        
        // Transform unified templates data
        const transformedTemplates = templates.map(template => ({
          id: template.templateId || template.templateName,
          name: template.templateName,
          content: template.components?.find(c => c.type === 'BODY')?.text || '',
          status: template.status,
          category: template.category,
          language: template.language,
          createdAt: template.createdAt,
          approvedAt: template.approvedAt,
          components: template.components || []
        }));
        
        setTemplates(transformedTemplates);
        console.log('✅ Unified templates loaded successfully:', transformedTemplates);
      } else {
        console.warn('⚠️ Unified Templates API returned unexpected format:', response);
        setTemplates([]);
      }
    } catch (error) {
      console.error('❌ Unified templates fetch error:', error);
      
      // Fallback to legacy API
      try {
        console.log('🔄 Falling back to legacy templates API...');
        const headers = getHeaders();
      const response = await axios.get(`${BASE_URL}/api/messaging/v1`, { headers });
      
      if (response.data.success && response.data.templates) {
        setTemplates(response.data.templates);
          console.log('✅ Templates loaded from legacy API:', response.data.templates);
      } else {
        setTemplates([]);
          console.log('⚠️ No templates available from legacy API');
        }
      } catch (fallbackError) {
        console.error('❌ Fallback templates API also failed:', fallbackError);
        
        // Use mock data as final fallback
        console.log('🎭 Using mock templates as fallback');
        const mockTemplates = MockDataService.getMockTemplates();
        setTemplates(mockTemplates);
        
        toast({
          title: '📱 Demo Mode Active',
          description: 'Template API not available. Showing demo templates.',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  // Get WhatsApp Devices - Real API call
  const getWhatsappDevices = async () => {
    try {
      console.log('🚀 [GET WHATSAPP DEVICES] Starting devices fetch...');
      
      // Use unified messaging API
      console.log('🚀 [GET WHATSAPP DEVICES] Calling Unified Devices API...');
      const response = await messagingAPI.getCoachWhatsAppDevices();
      
      console.log('✅ [GET WHATSAPP DEVICES] Unified Devices API Response Received');
      console.log('✅ [GET WHATSAPP DEVICES] Response Success:', response.success);
      console.log('✅ [GET WHATSAPP DEVICES] Response Data Keys:', response.data ? Object.keys(response.data) : 'No data');
      
      if (response.success && response.data) {
        const { devices = [] } = response.data;
        
        console.log('✅ [GET WHATSAPP DEVICES] Processing Response Data...');
        console.log('✅ [GET WHATSAPP DEVICES] Raw Devices Count:', devices.length);
        console.log('✅ [GET WHATSAPP DEVICES] Sample Device:', devices[0]);
        
        setWhatsappDevices(devices);
        console.log('✅ [GET WHATSAPP DEVICES] WhatsApp devices loaded:', devices);
      } else {
        setWhatsappDevices([]);
        console.log('⚠️ [GET WHATSAPP DEVICES] No devices available from unified API');
      }
    } catch (error) {
      console.error('❌ [GET WHATSAPP DEVICES] Unified devices fetch error:', error);
      
      // Fallback to legacy API
      try {
        console.log('🔄 [GET WHATSAPP DEVICES] Falling back to legacy API...');
        const headers = getHeaders();
      const response = await axios.get(`${BASE_URL}/api/messaging/v1/devices`, { headers });
      
      if (response.data.success && response.data.devices) {
        setWhatsappDevices(response.data.devices);
          console.log('✅ [GET WHATSAPP DEVICES] Legacy devices loaded:', response.data.devices);
      } else {
        setWhatsappDevices([]);
          console.log('⚠️ [GET WHATSAPP DEVICES] No devices available from legacy API');
      }
      } catch (fallbackError) {
        console.error('❌ [GET WHATSAPP DEVICES] Legacy devices fetch error:', fallbackError);
      setWhatsappDevices([]);
      }
    }
  };

  // Get WhatsApp Settings - Real API call
  const getWhatsappSettings = async () => {
  	try {
      console.log('🚀 [GET WHATSAPP SETTINGS] Starting settings fetch...');
      
      // Use unified messaging API
      console.log('🚀 [GET WHATSAPP SETTINGS] Calling Unified Settings API...');
      const response = await messagingAPI.getCoachWhatsAppSettings();
      
      console.log('✅ [GET WHATSAPP SETTINGS] Unified Settings API Response Received');
      console.log('✅ [GET WHATSAPP SETTINGS] Response Success:', response.success);
      console.log('✅ [GET WHATSAPP SETTINGS] Response Data Keys:', response.data ? Object.keys(response.data) : 'No data');
      
      if (response.success && response.data) {
        const { settings = {} } = response.data;
        
        console.log('✅ [GET WHATSAPP SETTINGS] Processing Response Data...');
        console.log('✅ [GET WHATSAPP SETTINGS] Raw Settings:', settings);
        
        setWhatsappSettings(settings);
        console.log('✅ [GET WHATSAPP SETTINGS] WhatsApp settings loaded:', settings);
      } else {
        setWhatsappSettings({});
        console.log('⚠️ [GET WHATSAPP SETTINGS] No settings available from unified API');
      }
    } catch (error) {
      console.error('❌ [GET WHATSAPP SETTINGS] Unified settings fetch error:', error);
      
      // Fallback to legacy API
      try {
        console.log('🔄 [GET WHATSAPP SETTINGS] Falling back to legacy API...');
        const headers = getHeaders();
      const response = await axios.get(`${BASE_URL}/api/messaging/v1/settings`, { headers });
      
      if (response.data.success && response.data.settings) {
        setWhatsappSettings(response.data.settings);
          console.log('✅ [GET WHATSAPP SETTINGS] Legacy settings loaded:', response.data.settings);
      } else {
        setWhatsappSettings({});
          console.log('⚠️ [GET WHATSAPP SETTINGS] No settings available from legacy API');
      }
      } catch (fallbackError) {
        console.error('❌ [GET WHATSAPP SETTINGS] Legacy settings fetch error:', fallbackError);
      setWhatsappSettings({});
      }
    }
  };

  // Get Credit Balance - Real API call
  const getCreditBalance = async () => {
    try {
      console.log('🚀 [GET CREDIT BALANCE] Starting credit balance fetch...');
      
      // Use unified messaging API
      console.log('🚀 [GET CREDIT BALANCE] Calling Unified Credit Balance API...');
      const response = await messagingAPI.getCreditBalance();
      
      console.log('✅ [GET CREDIT BALANCE] Unified Credit Balance API Response Received');
      console.log('✅ [GET CREDIT BALANCE] Response Success:', response.success);
      console.log('✅ [GET CREDIT BALANCE] Response Data Keys:', response.data ? Object.keys(response.data) : 'No data');
      
      if (response.success && response.data && response.data.balance !== undefined) {
        console.log('✅ [GET CREDIT BALANCE] Processing Response Data...');
        console.log('✅ [GET CREDIT BALANCE] Raw Balance:', response.data.balance);
        
        setCreditBalance(response.data.balance);
        console.log('✅ [GET CREDIT BALANCE] Credit balance loaded:', response.data.balance);
      } else {
        setCreditBalance(0);
        console.log('⚠️ [GET CREDIT BALANCE] No balance available from unified API');
      }
    } catch (error) {
      console.error('❌ [GET CREDIT BALANCE] Unified credit balance fetch error:', error);
      
      // Fallback to legacy API
    try {
      const headers = getHeaders();
        console.log('🚀 [GET CREDIT BALANCE] Fallback to legacy API...');
      
      const response = await axios.get(`${BASE_URL}/api/messaging/v1/credits/balance`, { headers });
      
      if (response.data.success && response.data.balance !== undefined) {
        setCreditBalance(response.data.balance);
          console.log('✅ [GET CREDIT BALANCE] Legacy credit balance loaded:', response.data.balance);
      } else {
        setCreditBalance(0);
          console.log('⚠️ [GET CREDIT BALANCE] No balance available from legacy API');
      }
      } catch (fallbackError) {
        console.error('❌ [GET CREDIT BALANCE] Legacy credit balance fetch error:', fallbackError);
      setCreditBalance(0);
      }
    }
  };

  // Get Credit Packages - Real API call
  const getCreditPackages = async () => {
    try {
      console.log('🚀 [GET CREDIT PACKAGES] Starting credit packages fetch...');
      
      // Use unified messaging API
      console.log('🚀 [GET CREDIT PACKAGES] Calling Unified Credit Packages API...');
      const response = await messagingAPI.getCreditPackages();
      
      console.log('✅ [GET CREDIT PACKAGES] Unified Credit Packages API Response Received');
      console.log('✅ [GET CREDIT PACKAGES] Response Success:', response.success);
      console.log('✅ [GET CREDIT PACKAGES] Response Data Keys:', response.data ? Object.keys(response.data) : 'No data');
      
      if (response.success && response.data && response.data.packages) {
        console.log('✅ [GET CREDIT PACKAGES] Processing Response Data...');
        console.log('✅ [GET CREDIT PACKAGES] Raw Packages Count:', response.data.packages.length);
        console.log('✅ [GET CREDIT PACKAGES] Sample Package:', response.data.packages[0]);
        
        setCreditPackages(response.data.packages);
        console.log('✅ [GET CREDIT PACKAGES] Credit packages loaded:', response.data.packages);
      } else {
        setCreditPackages([]);
        console.log('⚠️ [GET CREDIT PACKAGES] No packages available from unified API');
      }
    } catch (error) {
      console.error('❌ [GET CREDIT PACKAGES] Unified credit packages fetch error:', error);
      
      // Fallback to legacy API
    try {
      const headers = getHeaders();
        console.log('🚀 [GET CREDIT PACKAGES] Fallback to legacy API...');
      
      const response = await axios.get(`${BASE_URL}/api/messaging/v1/credits/packages`, { headers });
      
      if (response.data.success && response.data.packages) {
        setCreditPackages(response.data.packages);
          console.log('✅ [GET CREDIT PACKAGES] Legacy credit packages loaded:', response.data.packages);
      } else {
        setCreditPackages([]);
          console.log('⚠️ [GET CREDIT PACKAGES] No packages available from legacy API');
      }
      } catch (fallbackError) {
        console.error('❌ [GET CREDIT PACKAGES] Legacy credit packages fetch error:', fallbackError);
      setCreditPackages([]);
      }
    }
  };

  // Send Bulk Messages - Real API call
  const sendBulkMessages = async (contacts, message, delay = 2000) => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      console.log('🚀 [SEND BULK MESSAGES] Starting bulk message send...');
      console.log('🚀 [SEND BULK MESSAGES] Contacts Count:', contacts.length);
      console.log('🚀 [SEND BULK MESSAGES] Message:', message);
      console.log('🚀 [SEND BULK MESSAGES] Delay:', delay);
      console.log('🚀 [SEND BULK MESSAGES] Inbox Type:', inboxType);
      
      // Prepare bulk message data for unified API
      const bulkData = {
        recipients: contacts.map(contact => contact.phone || contact.email),
        messageType: inboxType === 'whatsapp' ? 'whatsapp' : 'email',
        type: 'text',
        message: message
      };

      console.log('🚀 [SEND BULK MESSAGES] Prepared Bulk Data:', bulkData);

      console.log('🚀 [SEND BULK MESSAGES] Calling Unified Bulk Messaging API...');
      const response = await messagingAPI.sendBulkMessages(bulkData);

      console.log('✅ [SEND BULK MESSAGES] Unified Bulk Messaging API Response Received');
      console.log('✅ [SEND BULK MESSAGES] Response Success:', response.success);
      console.log('✅ [SEND BULK MESSAGES] Response Data:', response.data);

      if (response.success) {
        const { totalRecipients, successful, failed } = response.data;
        
        console.log('✅ [SEND BULK MESSAGES] Bulk Send Results:');
        console.log('✅ [SEND BULK MESSAGES] Total Recipients:', totalRecipients);
        console.log('✅ [SEND BULK MESSAGES] Successful:', successful);
        console.log('✅ [SEND BULK MESSAGES] Failed:', failed);
        
        toast({
          title: '🚀 Bulk Messages Sent!',
          description: `Successfully sent ${successful}/${totalRecipients} messages. ${failed > 0 ? `${failed} failed.` : ''}`,
          status: successful > 0 ? 'success' : 'error',
          duration: 5000,
          isClosable: true,
        });
        
        getConversations(); // Refresh conversations
        console.log('✅ Unified bulk messages sent successfully:', response.data);
      } else {
        throw new Error(response.message || 'Failed to send bulk messages');
      }
    } catch (error) {
      console.error('❌ Unified bulk messaging error:', error.response?.data || error.message);
      
      // Fallback to legacy API
      try {
        console.log('🔄 Falling back to legacy bulk messaging API...');
      const headers = getHeaders();
      
      const bulkData = {
        contacts: contacts.map(contact => ({
          name: contact.name,
          phone: contact.phone,
          message: message
        })),
        coachId: coachId,
        funnelId: 'bulk-messaging',
        funnelType: 'whatsapp',
        delay: delay
      };

      const response = await axios.post(
        `${BASE_URL}/api/messaging/send-bulk`,
        bulkData,
        { headers }
      );

      if (response.data.success) {
        toast({
          title: '🚀 Bulk Messages Sent!',
          description: `Successfully sent ${contacts.length} messages`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
          getConversations();
          console.log('✅ Legacy bulk messages sent successfully:', response.data);
        }
      } catch (fallbackError) {
        console.error('❌ Fallback bulk messaging also failed:', fallbackError);
      toast({
        title: '❌ Bulk Send Failed',
          description: error.response?.data?.message || 'Failed to send bulk messages. Please try again.',
          status: 'error',
          duration: 5000,
        isClosable: true,
      });
      }
    } finally {
      setLoading(false);
    }
  };


  // Delete conversation - Using working API
  const deleteConversation = async (conversationId) => {
    try {
      await axios.delete(
        `${BASE_URL}/api/leads/${conversationId}`,
        { headers: getHeaders() }
      );
      
      toast({
        title: '🗑️ Conversation Deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setSelectedConversation(null);
      getConversations();
      onDeleteClose();
    } catch (error) {
      toast({
        title: '❌ Delete Failed',
        description: error.response?.data?.message || 'Conversation delete नहीं हो सका',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle conversation selection
  const selectConversation = (conversation) => {
    console.log('🚀 [SELECT CONVERSATION] Starting conversation selection...');
    console.log('🚀 [SELECT CONVERSATION] Selected Conversation:', conversation);
    console.log('🚀 [SELECT CONVERSATION] Conversation ID:', conversation.id);
    console.log('🚀 [SELECT CONVERSATION] Conversation Phone:', conversation.phone);
    console.log('🚀 [SELECT CONVERSATION] Conversation Contact Name:', conversation.contactName);
    console.log('🚀 [SELECT CONVERSATION] Unread Count:', conversation.unreadCount);
    
    setSelectedConversation(conversation);
    
    // Load messages for the selected conversation using unified API
    const contactId = conversation.id || conversation.phone || conversation.contactId;
    console.log('🚀 [SELECT CONVERSATION] Contact ID for Messages:', contactId);
    
    if (contactId) {
      console.log('🚀 [SELECT CONVERSATION] Loading messages for contact:', contactId);
      getMessages(contactId);
    }
    
    // Mark as read if there are unread messages
    if (conversation.unreadCount > 0) {
      console.log('🚀 [SELECT CONVERSATION] Marking conversation as read:', conversation.id);
      markAsRead(conversation.id);
    }
    
    console.log('✅ [SELECT CONVERSATION] Conversation selection completed');
  };

  // Error handling wrapper
  const handleError = (error, context) => {
    console.error(`🚨 [ERROR HANDLER] ${context}:`, error);
    setHasError(true);
    toast({
      title: 'An error occurred',
      description: `Something went wrong in ${context}. Please refresh the page.`,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  // Load data on component mount
  useEffect(() => {
    console.log('🚀 [COMPONENT MOUNT] Component mounted - checking auth state...');
    console.log('🚀 [COMPONENT MOUNT] Auth State:', {
      coachId: coachId,
      token: token ? 'Present' : 'Missing',
      tokenLength: token?.length || 0,
      isAuthenticated: isAuthenticated,
      userId: userId,
      auth: auth
    });
    
    // Initialize inbox with real API calls
    console.log('🚀 [COMPONENT MOUNT] Initializing inbox with real API calls...');
    
    // Simulate loading time to show ProfessionalLoader
    const loadingTimer = setTimeout(() => {
      setInitialLoading(false);
      console.log('✅ [COMPONENT MOUNT] ProfessionalLoader completed - showing inbox');
    }, 2000); // 2 seconds loading time
    
    if (isAuthenticated) {
      console.log('✅ [COMPONENT MOUNT] User is authenticated, loading all data...');
      // Load all data with real APIs
      Promise.all([
        (async () => {
          console.log('🚀 [COMPONENT MOUNT] Loading conversations...');
          return getConversations();
        })(),
        (async () => {
          console.log('🚀 [COMPONENT MOUNT] Loading templates...');
          return getTemplates();
        })(),
        (async () => {
          console.log('🚀 [COMPONENT MOUNT] Loading WhatsApp devices...');
          return getWhatsappDevices();
        })(),
        (async () => {
          console.log('🚀 [COMPONENT MOUNT] Loading WhatsApp settings...');
          return getWhatsappSettings();
        })(),
        (async () => {
          console.log('🚀 [COMPONENT MOUNT] Loading credit balance...');
          return getCreditBalance();
        })(),
        (async () => {
          console.log('🚀 [COMPONENT MOUNT] Loading credit packages...');
          return getCreditPackages();
        })(),
        (async () => {
          console.log('🚀 [COMPONENT MOUNT] Loading inbox stats...');
          return getInboxStats();
        })()
      ]).then(() => {
        console.log('✅ [COMPONENT MOUNT] All initial data loaded successfully');
      }).catch(error => {
        console.error('❌ [COMPONENT MOUNT] Error loading initial data:', error);
      });
      
      // Auto refresh every 30 seconds
      const interval = setInterval(() => {
        getConversations();
        getInboxStats();
        if (selectedConversation) {
          getMessages(selectedConversation.phone);
        }
      }, 30000);

      return () => clearInterval(interval);
    } else {
      console.log('🔐 Not authenticated - clearing data');
      toast({
        title: '🔐 Authentication Required',
        description: 'Please log in to access WhatsApp Inbox',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
    
    return () => clearTimeout(loadingTimer);
  }, [userId, coachId, token, isAuthenticated]); // Updated dependencies

  // Handle filter changes - Real API call
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     setPagination(prev => ({ ...prev, offset: 0 }));
  //     getConversations();
  //   }
  // }, [filters, isAuthenticated]);

  // Show authentication message if not authenticated
  // if (!isAuthenticated) {
  //   return (
  //     <Box 
  //       minHeight="100vh" 
  //       bgGradient={bgGradient}
  //       display="flex" 
  //       alignItems="center" 
  //       justifyContent="center"
  //     >
  //       <Container maxW="md">
  //         <Card bg={cardBg} shadow="2xl" borderRadius="3xl" p={8} textAlign="center">
  //           <VStack spacing={6}>
  //             <Icon as={FiMessageSquare} w={16} h={16} color="gray.400" />
  //             <Heading size="lg" color={textColor}>
  //               🔐 Authentication Required
  //             </Heading>
  //             <Text fontSize="md" color={mutedColor}>
  //               Please log in to access WhatsApp Inbox
  //             </Text>
  //             
  //             {/* Debug Info - Show only in development */}
  //             {process.env.NODE_ENV === 'development' && (
  //               <Box p={4} bg="yellow.50" borderRadius="xl" w="100%">
  //                 <Text fontSize="sm" color="yellow.800" fontWeight="bold" mb={2}>
  //                   🔍 Debug Info:
  //                 </Text>
  //                 <VStack spacing={1} align="start">
  //                   <Text fontSize="xs" color="yellow.700">
  //                     Token: {token ? '✅ Present' : '❌ Missing'}
  //                   </Text>
  //                   <Text fontSize="xs" color="yellow.700">
  //                     Coach ID: {coachId || '❌ Missing'}
  //                   </Text>
  //                   <Text fontSize="xs" color="yellow.700">
  //                     User: {auth?.user ? '✅ Present' : '❌ Missing'}
  //                   </Text>
  //                   <Text fontSize="xs" color="yellow.700">
  //                     Auth State: {JSON.stringify(auth, null, 2)}
  //                   </Text>
  //                 </VStack>
  //               </Box>
  //             )}
  //             
  //             <Button 
  //               colorScheme="blue" 
  //               size="lg"
  //               borderRadius="xl"
  //               onClick={() => window.location.href = '/login'}
  //             >
  //               Go to Login
  //             </Button>
  //           </VStack>
  //         </Card>
  //       </Container>
  //     </Box>
  //   );
  // }

  // Show ProfessionalLoader when initially loading
  if (initialLoading) {
    return <ProfessionalLoader />;
  }

  // Show error state if something went wrong
  if (hasError) {
    return (
      <Box minHeight="100vh" bgGradient={bgGradient} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6} textAlign="center" p={8}>
          <Box fontSize="4rem">⚠️</Box>
          <Heading size="lg" color="red.500">Something went wrong!</Heading>
          <Text color="gray.600" maxW="md">
            An error occurred while loading the WhatsApp inbox. Please refresh the page or try again later.
          </Text>
          <Button 
            colorScheme="red" 
            onClick={() => window.location.reload()}
            leftIcon={<FiRefreshCw />}
          >
            Refresh Page
          </Button>
        </VStack>
      </Box>
    );
  }


  return (
    <Box minHeight="100vh" bgGradient={bgGradient}>
      {/* Debug Header - Show only in development */}
      {process.env.NODE_ENV === 'development' && (
        <Box p={3} bg="green.100" borderBottom="1px" borderColor="green.200">
          <Container maxW="7xl">
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="bold" color="green.800">
                🔍 Debug: Token {token ? '✅' : '❌'} | Coach ID: {coachId || 'Missing'} {coachId ? '✅' : '❌'}
              </Text>
              <Badge colorScheme={isAuthenticated ? "green" : "red"}>
                {isAuthenticated ? 'Connected' : 'Not Connected'}
              </Badge>
            </HStack>
          </Container>
        </Box>
      )}
      
      <Container maxW="full" px={{ base: 2, md: 4 }} py={{ base: 2, md: 4 }}>
        <Card bg={cardBg} shadow="2xl" borderRadius={{ base: "xl", md: "3xl" }} overflow="hidden" height={{ base: "100vh", md: "90vh" }}>
          <Grid 
            templateColumns={{ base: "1fr", md: "350px 1fr", lg: "400px 1fr" }} 
            height="100%"
            gap={0}
          >
            {/* Left Sidebar - Conversations List */}
            <GridItem bg={cardBg} borderRight="2px" borderColor={borderColor}>
              <VStack spacing={0} height="100%">
                {/* Header */}
                <Box p={{ base: 3, md: 4, lg: 6 }} borderBottom="2px" borderColor={borderColor} w="100%">
                  <VStack spacing={{ base: 2, md: 3, lg: 4 }}>
                    <HStack justify="space-between" w="100%" flexWrap="wrap" gap={2}>
                      <VStack align="start" spacing={1} minW={0} flex={1}>
                        <HStack spacing={{ base: 2, md: 3 }} flexWrap="wrap">
                          <Heading size={{ base: "sm", md: "md", lg: "lg" }} color={textColor}>
                            {inboxType === 'whatsapp' ? 'WhatsApp Inbox' : 'Email Inbox'}
                          </Heading>
                          <ButtonGroup size={{ base: "xs", md: "sm" }} variant="outline" spacing={0} borderRadius="lg" overflow="hidden" shadow="sm">
                            <Button
                              leftIcon={<Icon as={FiMessageSquare} />}
                              colorScheme={inboxType === 'whatsapp' ? 'green' : 'gray'}
                              onClick={() => setInboxType('whatsapp')}
                              borderRadius="0"
                              borderRightRadius={inboxType === 'email' ? '0' : 'lg'}
                              borderLeftRadius="lg"
                              _hover={{ 
                                transform: 'translateY(-1px)', 
                                shadow: 'md',
                                bg: inboxType === 'whatsapp' ? 'green.50' : 'gray.50'
                              }}
                              _active={{ transform: 'translateY(0px)' }}
                              transition="all 0.2s"
                              fontWeight="medium"
                              px={{ base: 2, md: 4 }}
                              py={{ base: 1, md: 2 }}
                              borderRight="1px solid"
                              borderRightColor="gray.200"
                            >
                              WhatsApp
                            </Button>
                            <Button
                              leftIcon={<Icon as={FiMail} />}
                              colorScheme={inboxType === 'email' ? 'blue' : 'gray'}
                              onClick={() => setInboxType('email')}
                              borderRadius="0"
                              borderLeftRadius={inboxType === 'whatsapp' ? '0' : 'lg'}
                              borderRightRadius="lg"
                              _hover={{ 
                                transform: 'translateY(-1px)', 
                                shadow: 'md',
                                bg: inboxType === 'email' ? 'blue.50' : 'gray.50'
                              }}
                              _active={{ transform: 'translateY(0px)' }}
                              transition="all 0.2s"
                              fontWeight="medium"
                              px={{ base: 2, md: 4 }}
                              py={{ base: 1, md: 2 }}
                            >
                              Email
                            </Button>
                          </ButtonGroup>
                        </HStack>
                      </VStack>
                      
                      {/* Title and Action Buttons in same line */}
                      <HStack justify="space-between" align="center" w="100%">
                        <Text fontSize="sm" color={mutedColor}>
                          {inboxType === 'whatsapp' ? 'Professional WhatsApp Messaging Hub' : 'Professional Email Communication Hub'}
                        </Text>
                        
                        {/* Action Buttons */}
                        <HStack spacing={2}>
                          {/* Gmail Setup Button */}
                          {inboxType === 'email' && (
                            <Button
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              leftIcon={<FiMail />}
                              onClick={() => setShowGmailSetup(true)}
                              borderRadius="xl"
                              fontWeight="600"
                              _hover={{ transform: 'translateY(-2px)' }}
                              transition="all 0.3s"
                            >
                              Gmail Setup
                            </Button>
                          )}
                          
                          {/* Buy Credits Button */}
                          {inboxType === 'whatsapp' && (
                            <Button
                              size="sm"
                              colorScheme="green"
                              variant="outline"
                              leftIcon={<FiCreditCard />}
                              onClick={openBuyCreditsModal}
                              borderRadius="xl"
                              fontWeight="600"
                              _hover={{ transform: 'translateY(-2px)' }}
                              transition="all 0.3s"
                            >
                              Buy Credits
                            </Button>
                          )}
                          
                          {/* Bulk Messages Button */}
                          <Button
                            size="sm"
                            colorScheme="purple"
                            variant="outline"
                            leftIcon={<FiSend />}
                            onClick={() => {
                              if (conversations.length > 0) {
                                const bulkContacts = conversations.slice(0, 5).map(conv => ({
                                  phone: conv.phone,
                                  name: conv.contactName,
                                  leadId: conv.id
                                }));
                                sendBulkMessages(bulkContacts, "Hello! This is a bulk message from your coach.");
                              }
                            }}
                            borderRadius="xl"
                            fontWeight="600"
                            _hover={{ transform: 'translateY(-2px)' }}
                            transition="all 0.3s"
                            disabled={conversations.length === 0}
                          >
                            Bulk Send
                          </Button>
                        </HStack>
                      </HStack>
                      
                      <HStack spacing={2}>
                        
                        <IconButton
                          icon={<FiRefreshCw />}
                          size="md"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => getConversations()}
                          isLoading={loading}
                          borderRadius="xl"
                          _hover={{ transform: 'rotate(180deg)', transition: 'transform 0.3s' }}
                        />
                        
                        <IconButton
                          icon={<FiFilter />}
                          size="md"
                          colorScheme="green"
                          variant="ghost"
                          onClick={onOpen}
                          borderRadius="xl"
                          _hover={{ transform: 'scale(1.1)', transition: 'transform 0.2s' }}
                        />
                      </HStack>
                    </HStack>

                    {/* Enhanced Stats Dashboard */}
                    <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={{ base: 2, md: 3, lg: 4 }} w="100%">
                      <Stat textAlign="center" p={{ base: 2, md: 3 }} bg={statsBg1} borderRadius="xl" position="relative" overflow="hidden">
                        <Box position="absolute" top="0" right="0" w="30px" h="30px" bg="blue.400" borderRadius="full" opacity="0.1" transform="translate(15px, -15px)" />
                        <StatLabel fontSize={{ base: "xs", md: "sm" }} color={mutedColor} fontWeight="600">
                          {inboxType === 'whatsapp' ? '📱 WhatsApp' : '📧 Email'}
                        </StatLabel>
                        <StatNumber fontSize={{ base: "lg", md: "xl" }} color="blue.500" fontWeight="800">
                          {(inboxType === 'whatsapp' ? conversations : emailConversations).length}
                        </StatNumber>
                      </Stat>
                      
                      <Stat textAlign="center" p={{ base: 2, md: 3 }} bg={statsBg2} borderRadius="xl" position="relative" overflow="hidden">
                        <Box position="absolute" top="0" right="0" w="30px" h="30px" bg="red.400" borderRadius="full" opacity="0.1" transform="translate(15px, -15px)" />
                        <StatLabel fontSize={{ base: "xs", md: "sm" }} color={mutedColor} fontWeight="600">📬 Unread</StatLabel>
                        <StatNumber fontSize={{ base: "lg", md: "xl" }} color="red.500" fontWeight="800">
                          {(inboxType === 'whatsapp' ? conversations : emailConversations).reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)}
                        </StatNumber>
                      </Stat>
                      
                      <Stat textAlign="center" p={{ base: 2, md: 3 }} bg={statsBg3} borderRadius="xl" position="relative" overflow="hidden">
                        <Box position="absolute" top="0" right="0" w="30px" h="30px" bg="green.400" borderRadius="full" opacity="0.1" transform="translate(15px, -15px)" />
                        <StatLabel fontSize={{ base: "xs", md: "sm" }} color={mutedColor} fontWeight="600">✅ Active</StatLabel>
                        <StatNumber fontSize={{ base: "lg", md: "xl" }} color="green.500" fontWeight="800">
                          {(inboxType === 'whatsapp' ? conversations : emailConversations).filter(conv => conv.status === 'active').length}
                        </StatNumber>
                      </Stat>
                      
                      <Stat textAlign="center" p={{ base: 2, md: 3 }} bg={statsBg4} borderRadius="xl" position="relative" overflow="hidden">
                        <Box position="absolute" top="0" right="0" w="30px" h="30px" bg="purple.400" borderRadius="full" opacity="0.1" transform="translate(15px, -15px)" />
                        <StatLabel fontSize={{ base: "xs", md: "sm" }} color={mutedColor} fontWeight="600">📋 Templates</StatLabel>
                        <StatNumber fontSize={{ base: "lg", md: "xl" }} color="purple.500" fontWeight="800">
                          {templates.length}
                        </StatNumber>
                      </Stat>
                    </SimpleGrid>

                    {/* WhatsApp Device Status */}
                    {whatsappDevices.length > 0 && (
                      <Box w="100%" p={3} bg={deviceBg} borderRadius="xl" border="2px solid" borderColor={deviceBorderColor}>
                        <HStack justify="space-between" align="center">
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" fontWeight="700" color={deviceTextColor}>
                              📱 WhatsApp Device Status
                            </Text>
                            <Text fontSize="xs" color={deviceTextColor2}>
                              {whatsappDevices[0]?.name || 'Main Device'}
                            </Text>
                          </VStack>
                          <CircularProgress 
                            value={75} 
                            size="40px" 
                            color={deviceIconColor}
                            thickness="8px"
                          >
                            <CircularProgressLabel fontSize="xs" fontWeight="bold">✓</CircularProgressLabel>
                          </CircularProgress>
                        </HStack>
                      </Box>
                    )}

                    {/* Search */}
                    <InputGroup size={{ base: "sm", md: "md" }}>
                      <InputLeftElement>
                        <Icon as={FiSearch} color={mutedColor} />
                      </InputLeftElement>
                      <Input
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchInbox()}
                        borderRadius="xl"
                        bg={messageInputBg}
                        border="2px solid"
                        borderColor={borderColor}
                        _focus={{ borderColor: accentColor, shadow: 'lg' }}
                        fontSize={{ base: "sm", md: "md" }}
                      />
                      <InputRightElement>
                        <Button 
                          size={{ base: "xs", md: "sm" }} 
                          onClick={searchInbox} 
                          isLoading={loading}
                          colorScheme="blue"
                          borderRadius="lg"
                          fontSize={{ base: "xs", md: "sm" }}
                        >
                          Go
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </VStack>
                </Box>

                {/* Conversations List */}
                <Box flex={1} overflowY="auto" w="100%">
                  {loading && conversations.length === 0 ? (
                    <Center p={8}>
                      <VStack spacing={4}>
                        <Spinner size="lg" color={accentColor} thickness="4px" />
                        <Text color={mutedColor} fontWeight="600">Loading conversations...</Text>
                      </VStack>
                    </Center>
                  ) : (inboxType === 'whatsapp' ? conversations : emailConversations).length > 0 ? (
                    <VStack spacing={0}>
                      {(inboxType === 'whatsapp' ? conversations : emailConversations).map((conversation) => (
                        <Box
                          key={conversation.id}
                          p={{ base: 3, md: 4 }}
                          borderBottom="1px"
                          borderColor={borderColor}
                          w="100%"
                          cursor="pointer"
                          bg={selectedConversation?.id === conversation.id ? selectedBg : 'transparent'}
                          _hover={{ bg: hoverBg }}
                          onClick={() => selectConversation(conversation)}
                          transition="all 0.2s"
                        >
                          <HStack spacing={4} align="start">
                            <Box position="relative">
                              <Avatar
                                size="md"
                                name={conversation.contactName || conversation.phone}
                                src={conversation.avatar}
                                bg="blue.500"
                              />
                              {conversation.status === 'online' && (
                                <Box
                                  position="absolute"
                                  bottom={0}
                                  right={0}
                                  w={3}
                                  h={3}
                                  bg="green.400"
                                  borderRadius="full"
                                  border="2px solid white"
                                />
                              )}
                            </Box>
                            
                            <VStack align="start" spacing={1} flex={1} minW={0}>
                              <HStack justify="space-between" w="100%">
                                <Text fontWeight="700" fontSize="md" isTruncated color={textColor}>
                                  {conversation.contactName || (inboxType === 'whatsapp' ? conversation.phone : conversation.email)}
                                </Text>
                                <HStack spacing={1}>
                                  {conversation.pinned && (
                                    <Icon as={FiStar} color="yellow.400" w={4} h={4} />
                                  )}
                                  {conversation.unread && (
                                    <Badge colorScheme="red" fontSize="xs" borderRadius="full" px={2}>
                                      {conversation.unreadCount || 'New'}
                                    </Badge>
                                  )}
                                </HStack>
                              </HStack>
                              
                              <Text fontSize="sm" color={mutedColor} isTruncated w="100%">
                                {conversation.lastMessage}
                              </Text>
                              
                              <HStack justify="space-between" w="100%">
                                <Text fontSize="xs" color={mutedColor}>
                                  {conversation.timestamp}
                                </Text>
                                {conversation.status && (
                                  <Badge
                                    size="sm"
                                    colorScheme={
                                      conversation.status === 'active' ? 'green' :
                                      conversation.status === 'archived' ? 'gray' : 'blue'
                                    }
                                    borderRadius="full"
                                  >
                                    {conversation.status}
                                  </Badge>
                                )}
                              </HStack>
                            </VStack>
                            
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<FiMoreVertical />}
                                size="sm"
                                variant="ghost"
                                onClick={(e) => e.stopPropagation()}
                                borderRadius="lg"
                              />
                              <MenuList borderRadius="xl" shadow="xl">
                                <MenuItem
                                  icon={<FiStar />}
                                  onClick={() => pinConversation(conversation.id, conversation.pinned)}
                                  borderRadius="lg"
                                >
                                  {conversation.pinned ? 'Unpin' : 'Pin'}
                                </MenuItem>
                                <MenuItem
                                  icon={<FiDownload />}
                                  onClick={() => archiveConversation(conversation.id)}
                                  borderRadius="lg"
                                >
                                  Archive
                                </MenuItem>
                                <Divider />
                                <MenuItem
                                  icon={<FiTrash2 />}
                                  onClick={() => {
                                    setConversationToDelete(conversation);
                                    onDeleteOpen();
                                  }}
                                  color="red.500"
                                  borderRadius="lg"
                                >
                                  Delete
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </Box>
                      ))}
                      
                      {pagination.hasMore && (
                        <Box p={4} w="100%">
                          <Button
                            size="md"
                            variant="outline"
                            onClick={() => getConversations(true)}
                            isLoading={loading}
                            w="100%"
                            borderRadius="xl"
                            fontWeight="600"
                          >
                            Load More Conversations
                          </Button>
                        </Box>
                      )}
                    </VStack>
                  ) : (
                    <Center p={8}>
                      <VStack spacing={4}>
                        <Icon as={FiMessageSquare} w={12} h={12} color={mutedColor} />
                        <Text fontSize="lg" color={mutedColor} fontWeight="600">
                          No {inboxType === 'whatsapp' ? 'WhatsApp' : 'Email'} conversations found
                        </Text>
                        <Text fontSize="sm" color={mutedColor} textAlign="center">
                          {inboxType === 'whatsapp' ? 'Start a new WhatsApp conversation or check your filters' : 'Start a new email conversation or check your filters'}
                        </Text>
                      </VStack>
                    </Center>
                  )}
                </Box>
              </VStack>
            </GridItem>

            {/* Right Side - Chat Area */}
            <GridItem>
              {selectedConversation ? (
                <VStack spacing={0} height="100%">
                  {/* Enhanced Chat Header */}
                  <HStack
                    p={{ base: 3, md: 4, lg: 6 }}
                    borderBottom="2px"
                    borderColor={borderColor}
                    w="100%"
                    bg={cardBg}
                    justify="space-between"
                    flexWrap="wrap"
                    gap={2}
                  >
                    <HStack spacing={{ base: 3, md: 4 }} minW={0} flex={1}>
                      <Box position="relative">
                        <Avatar
                          size={{ base: "sm", md: "md" }}
                          name={selectedConversation.contactName || (inboxType === 'whatsapp' ? selectedConversation.phone : selectedConversation.email)}
                          src={selectedConversation.avatar}
                          bg="blue.500"
                        />
                        {selectedConversation.status === 'online' && (
                          <Box
                            position="absolute"
                            bottom={0}
                            right={0}
                            w={{ base: 2, md: 3 }}
                            h={{ base: 2, md: 3 }}
                            bg="green.400"
                            borderRadius="full"
                            border="2px solid white"
                          />
                        )}
                      </Box>
                      <VStack align="start" spacing={1} minW={0} flex={1}>
                        <Text fontWeight="700" fontSize={{ base: "md", md: "lg" }} color={textColor} isTruncated>
                          {selectedConversation.contactName || (inboxType === 'whatsapp' ? selectedConversation.phone : selectedConversation.email)}
                        </Text>
                        <HStack spacing={2} flexWrap="wrap">
                          <Badge
                            colorScheme={selectedConversation.status === 'online' ? 'green' : 'gray'}
                            fontSize={{ base: "2xs", md: "xs" }}
                            borderRadius="full"
                          >
                            {selectedConversation.status === 'online' ? '🟢 Online' : '⚫ Last seen recently'}
                          </Badge>
                          {selectedConversation.verified && (
                            <Badge colorScheme="blue" fontSize={{ base: "2xs", md: "xs" }} borderRadius="full">
                              ✅ Verified
                            </Badge>
                          )}
                        </HStack>
                      </VStack>
                    </HStack>
                    
                    <HStack spacing={2}>
                      <IconButton 
                        icon={<FiPhone />} 
                        size="md" 
                        colorScheme="green"
                        variant="ghost"
                        borderRadius="xl"
                      />
                      <IconButton 
                        icon={<FiVideo />} 
                        size="md" 
                        colorScheme="blue"
                        variant="ghost"
                        borderRadius="xl"
                      />
                      <Menu>
                        <MenuButton 
                          as={IconButton} 
                          icon={<FiMoreVertical />} 
                          size="md"
                          variant="ghost"
                          borderRadius="xl"
                        />
                        <MenuList borderRadius="xl" shadow="xl">
                          <MenuItem icon={<FiMessageSquare />} borderRadius="lg">View Contact</MenuItem>
                          <MenuItem icon={<FiDownload />} borderRadius="lg">Export Chat</MenuItem>
                          <MenuItem icon={<FiTrash2 />} color="red.500" borderRadius="lg">Block Contact</MenuItem>
                        </MenuList>
                      </Menu>
                    </HStack>
                  </HStack>

                  {/* Enhanced Messages Area */}
                  <Box flex={1} overflowY="auto" p={6} w="100%">
                    {loading && messages.length === 0 ? (
                      <Center p={8}>
                        <VStack spacing={4}>
                          <Spinner size="lg" color={accentColor} thickness="4px" />
                          <Text color={mutedColor} fontWeight="600">Loading messages...</Text>
                        </VStack>
                      </Center>
                    ) : messages.length > 0 ? (
                      <VStack spacing={4} align="stretch">
                        {messages.map((message, index) => (
                          <HStack
                            key={index}
                            justify={message.from === 'me' ? 'flex-end' : 'flex-start'}
                            w="100%"
                          >
                            <Box
                              maxW="70%"
                              bg={message.from === 'me' ? 'blue.500' : messageThemBg}
                              color={message.from === 'me' ? 'white' : textColor}
                              p={4}
                              borderRadius="2xl"
                              borderBottomRightRadius={message.from === 'me' ? 'md' : '2xl'}
                              borderBottomLeftRadius={message.from === 'me' ? '2xl' : 'md'}
                              shadow="md"
                              position="relative"
                            >
                              <Text fontSize="md" lineHeight="1.5">
                                {message.content}
                              </Text>
                              <HStack justify="space-between" mt={2} spacing={2}>
                                <Text
                                  fontSize="xs"
                                  color={message.from === 'me' ? 'blue.100' : mutedColor}
                                >
                                  {message.timestamp}
                                </Text>
                                {message.from === 'me' && (
                                  <Icon 
                                    as={message.read ? FiCheckCircle : FiCheck} 
                                    w={3} 
                                    h={3} 
                                    color={message.read ? 'blue.200' : 'blue.300'}
                                  />
                                )}
                              </HStack>
                            </Box>
                          </HStack>
                        ))}
                      </VStack>
                    ) : (
                      <Center p={8}>
                        <VStack spacing={4}>
                          <Icon as={FiMessageSquare} w={12} h={12} color={mutedColor} />
                          <Text fontSize="lg" color={mutedColor} fontWeight="600">
                            No messages yet
                          </Text>
                          <Text fontSize="sm" color={mutedColor} textAlign="center">
                            Start the conversation by sending a message
                          </Text>
                        </VStack>
                      </Center>
                    )}
                  </Box>

                  {/* Enhanced Message Input */}
                  <Box
                    p={{ base: 3, md: 4, lg: 6 }}
                    borderTop="2px"
                    borderColor={borderColor}
                    w="100%"
                    bg={cardBg}
                  >
                    <VStack spacing={4}>
                      {/* Message Type Selector */}
                      <HStack w="100%" spacing={4}>
                        <Select
                          size="md"
                          value={messageForm.messageType}
                          onChange={(e) => setMessageForm({...messageForm, messageType: e.target.value})}
                          maxW="200px"
                          borderRadius="xl"
                          bg={messageInputBg}
                          border="2px solid"
                          borderColor={borderColor}
                          _focus={{ borderColor: accentColor, shadow: 'lg' }}
                        >
                          <option value="text">📄 Text Message</option>
                          <option value="template">📋 Template Message</option>
                          <option value="email">📧 Email Message</option>
                        </Select>
                        
                        {messageForm.messageType === 'template' && (
                          <Select
                            size="md"
                            placeholder="Select Template"
                            value={messageForm.templateName}
                            onChange={(e) => setMessageForm({...messageForm, templateName: e.target.value})}
                            flex={1}
                            minW="200px"
                            borderRadius="xl"
                            bg={messageInputBg}
                            border="2px solid"
                            borderColor={borderColor}
                            _focus={{ borderColor: accentColor, shadow: 'lg' }}
                          >
                            {templates.map((template) => (
                              <option key={template.id} value={template.id}>
                                📋 {template.name}
                              </option>
                            ))}
                          </Select>
                        )}

                        {/* Credit Balance Display */}
                        <HStack spacing={2} p={3} bg={messageActionsBg} borderRadius="xl" border="2px solid" borderColor={borderColor}>
                          <Text fontSize="sm" fontWeight="600" color={messageActionsTextColor}>
                            💳 Credits:
                          </Text>
                          <Badge colorScheme={creditBalance > 100 ? 'green' : creditBalance > 50 ? 'yellow' : 'red'} borderRadius="lg" px={2}>
                            {creditBalance}
                          </Badge>
                        </HStack>
                      </HStack>

                      {/* Message Input */}
                      <HStack w="100%" spacing={{ base: 2, md: 3 }} flexWrap="wrap">
                        <IconButton
                          icon={<FiPaperclip />}
                          size={{ base: "md", md: "lg" }}
                          colorScheme="gray"
                          variant="ghost"
                          borderRadius="xl"
                        />
                        <Input
                          placeholder={
                            messageForm.messageType === 'template' 
                              ? 'Template parameters (JSON)...' 
                              : 'Type your message here...'
                          }
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              messageForm.messageType === 'template' ? sendTemplateMessage() : sendMessage();
                            }
                          }}
                          size={{ base: "md", md: "lg" }}
                          borderRadius="xl"
                          bg={messageInputBg}
                          border="2px solid"
                          borderColor={borderColor}
                          _focus={{ borderColor: accentColor, shadow: 'lg' }}
                          flex={1}
                          minW={{ base: "200px", md: "300px" }}
                        />
                        <Button
                          colorScheme="blue"
                          onClick={messageForm.messageType === 'template' ? sendTemplateMessage : sendMessage}
                          isLoading={loading}
                          disabled={!newMessage.trim()}
                          size={{ base: "md", md: "lg" }}
                          borderRadius="xl"
                          px={{ base: 4, md: 8 }}
                          leftIcon={<FiSend />}
                          _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                          transition="all 0.3s"
                        >
                          Send
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>
                </VStack>
              ) : (
                <Center height="100%" bg={cardBg}>
                  <VStack spacing={6}>
                    <Icon as={FiMessageSquare} w={20} h={20} color={mutedColor} />
                    <VStack spacing={2} textAlign="center">
                      <Heading size="lg" color={textColor}>
                        Welcome to {inboxType === 'whatsapp' ? 'WhatsApp' : 'Email'} Inbox
                      </Heading>
                      <Text fontSize="lg" color={mutedColor}>
                        Select a conversation to start {inboxType === 'whatsapp' ? 'messaging' : 'emailing'}
                      </Text>
                      <Text fontSize="md" color={mutedColor}>
                        Choose from your existing conversations or start a new one
                      </Text>
                    </VStack>
                    <Button colorScheme="blue" size="lg" borderRadius="xl">
                      Start New Conversation
                    </Button>
                  </VStack>
                </Center>
              )}
            </GridItem>
          </Grid>
        </Card>
      </Container>

      {/* Enhanced Filter Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="3xl" border="2px solid" borderColor={borderColor}>
          <ModalHeader bg={accentColor} color="white" borderTopRadius="3xl" py={6}>
            <Center>
              <HStack>
                <Icon as={FiFilter} w={6} h={6} />
                <Heading size="lg">Filter Conversations</Heading>
              </HStack>
            </Center>
          </ModalHeader>
          <ModalCloseButton color="white" size="lg" />
          <ModalBody p={8}>
            <VStack spacing={6}>
              <FormControl>
                <FormLabel fontWeight="600" fontSize="lg">Status</FormLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  size="lg"
                  borderRadius="xl"
                  border="2px solid"
                  borderColor={borderColor}
                >
                  <option value="all">All Conversations</option>
                  <option value="active">Active Only</option>
                  <option value="archived">Archived Only</option>
                  <option value="blocked">Blocked Only</option>
                </Select>
              </FormControl>

              <SimpleGrid columns={2} spacing={6} w="100%">
                <FormControl>
                  <HStack justify="space-between" p={4} bg={actionRedBg} borderRadius="xl">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="600">Show only unread</Text>
                      <Text fontSize="sm" color={mutedColor}>Filter unread messages</Text>
                    </VStack>
                    <Switch
                      isChecked={filters.unread}
                      onChange={(e) => setFilters({...filters, unread: e.target.checked})}
                      size="lg"
                      colorScheme="red"
                    />
                  </HStack>
                </FormControl>

                <FormControl>
                  <HStack justify="space-between" p={4} bg={actionGrayBg} borderRadius="xl">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="600">Show archived</Text>
                      <Text fontSize="sm" color={mutedColor}>Include archived chats</Text>
                    </VStack>
                    <Switch
                      isChecked={filters.archived}
                      onChange={(e) => setFilters({...filters, archived: e.target.checked})}
                      size="lg"
                      colorScheme="gray"
                    />
                  </HStack>
                </FormControl>

                <FormControl>
                  <HStack justify="space-between" p={4} bg={actionYellowBg} borderRadius="xl">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="600">Show pinned only</Text>
                      <Text fontSize="sm" color={mutedColor}>Filter pinned conversations</Text>
                    </VStack>
                    <Switch
                      isChecked={filters.pinned}
                      onChange={(e) => setFilters({...filters, pinned: e.target.checked})}
                      size="lg"
                      colorScheme="yellow"
                    />
                  </HStack>
                </FormControl>
              </SimpleGrid>

              <Divider />

              <FormControl>
                <FormLabel fontWeight="600" fontSize="lg">Search Type</FormLabel>
                <Select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  size="lg"
                  borderRadius="xl"
                  border="2px solid"
                  borderColor={borderColor}
                >
                  <option value="messages">🔍 Search Messages</option>
                  <option value="contacts">👥 Search Contacts</option>
                  <option value="both">🔍👥 Search Both</option>
                </Select>
              </FormControl>

              {searchResults.length > 0 && (
                <Box w="100%">
                  <Text fontWeight="bold" mb={4} fontSize="lg">🔍 Search Results:</Text>
                  <VStack spacing={3}>
                    {searchResults.map((result, index) => (
                      <Box key={index} p={4} bg={contactItemBg} borderRadius="xl" w="100%">
                        <Text fontSize="md" fontWeight="bold" color={textColor}>{result.contact}</Text>
                        <Text fontSize="sm" color={mutedColor}>{result.message}</Text>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter p={6}>
            <HStack spacing={4} w="100%">
              <Button 
                onClick={() => {
                  setFilters({
                    status: 'all',
                    unread: false,
                    archived: false,
                    pinned: false
                  });
                  setSearchTerm('');
                  setSearchResults([]);
                }} 
                flex={1}
                size="lg"
                borderRadius="xl"
                variant="outline"
              >
                Clear All
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={onClose}
                flex={1}
                size="lg"
                borderRadius="xl"
              >
                Apply Filters
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Enhanced Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(10px)" />
        <AlertDialogContent borderRadius="3xl" border="2px solid" borderColor="red.200">
          <AlertDialogHeader fontSize="xl" fontWeight="bold" bg="red.500" color="white" borderTopRadius="3xl" py={6}>
            <Center>
              <HStack>
                <Icon as={FiTrash2} w={6} h={6} />
                <Text>Delete Conversation</Text>
              </HStack>
            </Center>
          </AlertDialogHeader>

          <AlertDialogBody p={8} textAlign="center">
            <VStack spacing={4}>
              <Text fontSize="lg">
                Are you sure you want to delete conversation with
              </Text>
              <Text fontSize="xl" fontWeight="bold" color="red.500">
                {conversationToDelete?.contactName || conversationToDelete?.phone}
              </Text>
              <Text fontSize="md" color={mutedColor}>
                This action cannot be undone and all messages will be permanently deleted.
              </Text>
            </VStack>
          </AlertDialogBody>

          <AlertDialogFooter p={6}>
            <HStack spacing={4} w="100%">
              <Button 
                ref={cancelRef} 
                onClick={onDeleteClose}
                flex={1}
                size="lg"
                borderRadius="xl"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                colorScheme="red" 
                onClick={() => deleteConversation(conversationToDelete?.id)} 
                flex={1}
                size="lg"
                borderRadius="xl"
                leftIcon={<FiTrash2 />}
              >
                Delete Forever
              </Button>
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Buy Credits Modal */}
      <Modal isOpen={showBuyCredits} onClose={() => setShowBuyCredits(false)} size="xl">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent 
          bg={cardBg} 
          borderRadius="2xl" 
          border="1px solid" 
          borderColor="green.200"
          boxShadow="2xl"
        >
          <ModalHeader 
            bg="linear-gradient(135deg, #10b981 0%, #059669 100%)" 
            color="white" 
            borderRadius="2xl 2xl 0 0"
            py={6}
          >
            <HStack spacing={3}>
              <Icon as={FiCreditCard} w={6} h={6} />
              <VStack align="start" spacing={0}>
                <Text fontSize="xl" fontWeight="bold">💳 Buy WhatsApp Credits</Text>
                <Text fontSize="sm" opacity={0.9}>Purchase credits to send WhatsApp messages</Text>
              </VStack>
            </HStack>
          </ModalHeader>
          
          <ModalCloseButton color="white" size="lg" />
          
          <ModalBody p={8}>
            <VStack spacing={6}>
              {/* Current Balance */}
              <Box 
                p={4} 
                bg="green.50" 
                borderRadius="xl" 
                border="1px solid" 
                borderColor="green.200"
                w="100%"
              >
                <HStack spacing={3} mb={2}>
                  <Icon as={FiCreditCard} color="green.500" w={5} h={5} />
                  <Text fontWeight="bold" color="green.700">💰 Current Balance:</Text>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {creditBalance.toLocaleString()} Credits
                </Text>
                <Text fontSize="sm" color="green.600">
                  Available for sending WhatsApp messages
                </Text>
              </Box>

              {/* Credit Packages */}
              <Box w="100%">
                <Text fontWeight="bold" fontSize="lg" mb={4} color={textColor}>
                  📦 Choose a Credit Package:
                </Text>
                
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  {creditPackages.map((pkg) => (
                    <Box
                      key={pkg.id}
                      p={6}
                      bg={selectedPackage?.id === pkg.id ? "green.50" : "gray.50"}
                      borderRadius="xl"
                      border="2px solid"
                      borderColor={selectedPackage?.id === pkg.id ? "green.300" : "gray.200"}
                      cursor="pointer"
                      _hover={{ 
                        borderColor: "green.300", 
                        bg: "green.50",
                        transform: "translateY(-2px)",
                        boxShadow: "lg"
                      }}
                      transition="all 0.3s ease"
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      <VStack spacing={4} align="start">
                        {/* Package Header */}
                        <VStack align="start" spacing={1} w="100%">
                          <Text fontSize="lg" fontWeight="bold" color={textColor}>
                            {pkg.name}
                          </Text>
                          <Text fontSize="sm" color={mutedColor}>
                            {pkg.description}
                          </Text>
                        </VStack>

                        {/* Price */}
                        <Box w="100%" textAlign="center">
                          <Text fontSize="3xl" fontWeight="bold" color="green.600">
                            ${pkg.price}
                          </Text>
                          <Text fontSize="sm" color={mutedColor}>
                            {pkg.credits.toLocaleString()} Credits
                          </Text>
                        </Box>

                        {/* Features */}
                        <VStack align="start" spacing={2} w="100%">
                          {pkg.features?.map((feature, index) => (
                            <HStack key={index} spacing={2}>
                              <Icon as={FiCheckCircle} color="green.500" w={4} h={4} />
                              <Text fontSize="sm" color={textColor}>
                                {feature}
                              </Text>
                            </HStack>
                          ))}
                        </VStack>

                        {/* Selection Indicator */}
                        {selectedPackage?.id === pkg.id && (
                          <HStack spacing={2} color="green.600" w="100%" justify="center">
                            <Icon as={FiCheckCircle} w={5} h={5} />
                            <Text fontWeight="bold">Selected</Text>
                          </HStack>
                        )}
                      </VStack>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>

              {/* Purchase Info */}
              {selectedPackage && (
                <Box 
                  p={4} 
                  bg="blue.50" 
                  borderRadius="xl" 
                  border="1px solid" 
                  borderColor="blue.200"
                  w="100%"
                >
                  <HStack spacing={3} mb={3}>
                    <Icon as={FiInfo} color="blue.500" w={5} h={5} />
                    <Text fontWeight="bold" color="blue.700">📋 Purchase Summary:</Text>
                  </HStack>
                  <VStack align="start" spacing={2} fontSize="sm" color="blue.600">
                    <Text><strong>Package:</strong> {selectedPackage.name}</Text>
                    <Text><strong>Credits:</strong> {selectedPackage.credits.toLocaleString()}</Text>
                    <Text><strong>Price:</strong> ${selectedPackage.price} {selectedPackage.currency}</Text>
                    <Text><strong>New Balance:</strong> {(creditBalance + selectedPackage.credits).toLocaleString()} credits</Text>
                  </VStack>
                </Box>
              )}

              {/* Payment Methods */}
              <Box 
                p={4} 
                bg="yellow.50" 
                borderRadius="xl" 
                border="1px solid" 
                borderColor="yellow.200"
                w="100%"
              >
                <HStack spacing={3} mb={2}>
                  <Icon as={FiCreditCard} color="yellow.600" w={5} h={5} />
                  <Text fontWeight="bold" color="yellow.700">💳 Payment Methods:</Text>
                </HStack>
                <HStack spacing={4}>
                  <Text fontSize="sm" color="yellow.600">• Credit/Debit Card</Text>
                  <Text fontSize="sm" color="yellow.600">• PayPal</Text>
                  <Text fontSize="sm" color="yellow.600">• Bank Transfer</Text>
                </HStack>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter 
            p={6} 
            borderTop="1px solid" 
            borderColor="gray.200"
            bg="gray.50"
            borderRadius="0 0 2xl 2xl"
          >
            <HStack spacing={4} w="100%">
              <Button
                variant="outline"
                colorScheme="gray"
                size="lg"
                borderRadius="xl"
                onClick={() => setShowBuyCredits(false)}
                flex={1}
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.3s ease"
              >
                <Icon as={FiX} mr={2} />
                Cancel
              </Button>
              
              <Button
                colorScheme="green"
                size="lg"
                borderRadius="xl"
                onClick={purchaseCredits}
                isLoading={buyCreditsLoading}
                loadingText="Processing..."
                flex={2}
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.3s ease"
                leftIcon={<Icon as={FiCreditCard} />}
                disabled={!selectedPackage}
              >
                Purchase {selectedPackage ? `${selectedPackage.credits} Credits - $${selectedPackage.price}` : 'Credits'}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Gmail Setup Modal */}
      <Modal isOpen={showGmailSetup} onClose={() => setShowGmailSetup(false)} size="xl">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent 
          bg={cardBg} 
          borderRadius="2xl" 
          border="1px solid" 
          borderColor="blue.200"
          boxShadow="2xl"
        >
          <ModalHeader 
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
            color="white" 
            borderRadius="2xl 2xl 0 0"
            py={6}
          >
            <HStack spacing={3}>
              <Icon as={FiMail} w={6} h={6} />
              <VStack align="start" spacing={0}>
                <Text fontSize="xl" fontWeight="bold">📧 Gmail Setup</Text>
                <Text fontSize="sm" opacity={0.9}>Configure your Gmail SMTP settings for email integration</Text>
              </VStack>
            </HStack>
          </ModalHeader>
          
          <ModalCloseButton color="white" size="lg" />
          
          <ModalBody p={8}>
            <VStack spacing={6}>
              {/* Setup Instructions */}
              <Box 
                p={4} 
                bg="blue.50" 
                borderRadius="xl" 
                border="1px solid" 
                borderColor="blue.200"
                w="100%"
              >
                <HStack spacing={3} mb={3}>
                  <Icon as={FiInfo} color="blue.500" w={5} h={5} />
                  <Text fontWeight="bold" color="blue.700">📋 Setup Instructions:</Text>
                </HStack>
                <VStack align="start" spacing={2} fontSize="sm" color="blue.600">
                  <Text>1. Enable 2-Factor Authentication on your Gmail account</Text>
                  <Text>2. Generate an App Password in Google Account settings</Text>
                  <Text>3. Use the App Password (not your regular password) below</Text>
                  <Text>4. Test the configuration before saving</Text>
                </VStack>
              </Box>

              {/* SMTP Configuration Form */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
                <FormControl>
                  <FormLabel fontWeight="600" color={textColor}>
                    <Icon as={FiServer} mr={2} />
                    SMTP Host
                  </FormLabel>
                  <Input
                    value={gmailConfig.smtpHost}
                    onChange={(e) => handleGmailConfigChange('smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                    size="lg"
                    borderRadius="xl"
                    border="2px solid"
                    borderColor={borderColor}
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                  />
                  <FormHelperText color={mutedColor}>
                    Gmail SMTP server address
                  </FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="600" color={textColor}>
                    <Icon as={FiHash} mr={2} />
                    SMTP Port
                  </FormLabel>
                  <Input
                    value={gmailConfig.smtpPort}
                    onChange={(e) => handleGmailConfigChange('smtpPort', e.target.value)}
                    placeholder="587"
                    size="lg"
                    borderRadius="xl"
                    border="2px solid"
                    borderColor={borderColor}
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                  />
                  <FormHelperText color={mutedColor}>
                    Standard Gmail SMTP port
                  </FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="600" color={textColor}>
                    <Icon as={FiUser} mr={2} />
                    Gmail Username
                  </FormLabel>
                  <Input
                    value={gmailConfig.smtpUsername}
                    onChange={(e) => handleGmailConfigChange('smtpUsername', e.target.value)}
                    placeholder="your-email@gmail.com"
                    size="lg"
                    borderRadius="xl"
                    border="2px solid"
                    borderColor={borderColor}
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                  />
                  <FormHelperText color={mutedColor}>
                    Your Gmail email address
                  </FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="600" color={textColor}>
                    <Icon as={FiLock} mr={2} />
                    App Password
                  </FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type="password"
                      value={gmailConfig.smtpPassword}
                      onChange={(e) => handleGmailConfigChange('smtpPassword', e.target.value)}
                      placeholder="16-character app password"
                      borderRadius="xl"
                      border="2px solid"
                      borderColor={borderColor}
                      _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                    />
                    <InputRightElement pr={3}>
                      <Icon as={FiEye} color="gray.400" />
                    </InputRightElement>
                  </InputGroup>
                  <FormHelperText color={mutedColor}>
                    Gmail App Password (not your regular password)
                  </FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="600" color={textColor}>
                    <Icon as={FiMail} mr={2} />
                    From Email
                  </FormLabel>
                  <Input
                    value={gmailConfig.fromEmail}
                    onChange={(e) => handleGmailConfigChange('fromEmail', e.target.value)}
                    placeholder="your-business@gmail.com"
                    size="lg"
                    borderRadius="xl"
                    border="2px solid"
                    borderColor={borderColor}
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                  />
                  <FormHelperText color={mutedColor}>
                    Email address recipients will see
                  </FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="600" color={textColor}>
                    <Icon as={FiUser} mr={2} />
                    From Name
                  </FormLabel>
                  <Input
                    value={gmailConfig.fromName}
                    onChange={(e) => handleGmailConfigChange('fromName', e.target.value)}
                    placeholder="Your Business Name"
                    size="lg"
                    borderRadius="xl"
                    border="2px solid"
                    borderColor={borderColor}
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                  />
                  <FormHelperText color={mutedColor}>
                    Display name for your business
                  </FormHelperText>
                </FormControl>
              </SimpleGrid>

              {/* Security Notice */}
              <Box 
                p={4} 
                bg="yellow.50" 
                borderRadius="xl" 
                border="1px solid" 
                borderColor="yellow.200"
                w="100%"
              >
                <HStack spacing={3} mb={2}>
                  <Icon as={FiShield} color="yellow.600" w={5} h={5} />
                  <Text fontWeight="bold" color="yellow.700">🔒 Security Notice:</Text>
                </HStack>
                <Text fontSize="sm" color="yellow.600">
                  Your credentials are encrypted and stored securely. We never store your actual Gmail password.
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter 
            p={6} 
            borderTop="1px solid" 
            borderColor="gray.200"
            bg="gray.50"
            borderRadius="0 0 2xl 2xl"
          >
            <HStack spacing={4} w="100%">
              <Button
                variant="outline"
                colorScheme="gray"
                size="lg"
                borderRadius="xl"
                onClick={() => setShowGmailSetup(false)}
                flex={1}
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.3s ease"
              >
                <Icon as={FiX} mr={2} />
                Cancel
              </Button>
              
              <Button
                colorScheme="blue"
                size="lg"
                borderRadius="xl"
                onClick={testGmailConfig}
                isLoading={gmailSetupLoading}
                loadingText="Testing..."
                flex={1}
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.3s ease"
                leftIcon={<Icon as={FiCheck} />}
              >
                Test Configuration
              </Button>
              
              <Button
                colorScheme="green"
                size="lg"
                borderRadius="xl"
                onClick={saveGmailConfig}
                isLoading={gmailSetupLoading}
                loadingText="Saving..."
                flex={1}
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.3s ease"
                leftIcon={<Icon as={FiSave} />}
              >
                Save & Setup
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default WhatsAppInbox;