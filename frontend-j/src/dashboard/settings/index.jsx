// WhatsAppSetup.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCoachId, getToken, debugAuthState } from '../../utils/authUtils';
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
  Switch,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Badge,
  Spinner,
  useColorModeValue,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
  Progress,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Container,
  Flex,
  Icon,
  Stack,
  SimpleGrid,
  Center,
  CircularProgress,
  CircularProgressLabel
} from '@chakra-ui/react';
import { 
  CheckCircleIcon, 
  WarningIcon, 
  InfoIcon, 
  SettingsIcon, 
  ChatIcon, 
  PhoneIcon,
  CheckIcon,
  TimeIcon,
  StarIcon
} from '@chakra-ui/icons';
import axios from 'axios';

import { API_BASE_URL as BASE_URL } from '../../config/apiConfig';

const WhatsAppSetup = () => {
  const dispatch = useDispatch();
  const authState = useSelector(state => state.auth);
  const auth = {
    user: authState?.user,
    token: getToken(authState)
  };
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Modern color scheme
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, blue.900, purple.900)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentIntegration, setCurrentIntegration] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [baileysStatus, setBaileysStatus] = useState('disconnected');
  const [testResults, setTestResults] = useState([]);
  const [inboxStats, setInboxStats] = useState({});
  const [conversations, setConversations] = useState([]);
  
  // Form states for different integrations
  const [metaConfig, setMetaConfig] = useState({
    integrationType: 'meta_official',
    metaApiToken: '',
    phoneNumberId: '',
    whatsAppBusinessAccountId: '',
    autoReplyEnabled: true,
    autoReplyMessage: 'Thanks for your message! I\'ll get back to you soon.'
  });
  
  const [baileysConfig, setBaileysConfig] = useState({
    integrationType: 'baileys_personal',
    personalPhoneNumber: '',
    autoReplyEnabled: true,
    autoReplyMessage: 'Thanks for your message! I\'ll get back to you soon.'
  });
  
  const [centralConfig, setCentralConfig] = useState({
    integrationType: 'central_fallback',
    useCentralFallback: true,
    centralAccountCredits: 100
  });
  
  const [messageForm, setMessageForm] = useState({
    recipientPhone: '',
    messageContent: '',
    messageType: 'text'
  });
  
  const [errors, setErrors] = useState({});

  // Updated API headers with proper Redux integration
  const getHeaders = () => ({
    'Authorization': `Bearer ${auth.token}`,
    'Content-Type': 'application/json'
    // Removed 'User-ID' header to fix CORS issues
  });

  // Setup integrations
  const setupIntegration = async (config) => {
    setLoading(true);
    setErrors({});
    
    try {
      const response = await axios.post(
        `${BASE_URL}/api/whatsapp/integration/setup`,
        config,
        { headers: getHeaders() }
      );
      
      if (response.data.success) {
        setCurrentIntegration(response.data.data);
        toast({
          title: '🎉 सफलता!',
          description: 'WhatsApp integration सफलतापूर्वक setup हो गया',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: error.response?.data?.message || 'Setup में error आया है',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize Baileys
  const initializeBaileys = async () => {
    setLoading(true);
    try {
      console.log('Initializing Baileys...');
      
      const response = await axios.post(
        `${BASE_URL}/api/whatsapp/baileys/initialize`,
        {},
        { headers: getHeaders() }
      );
      
      console.log('Baileys initialization successful:', response.data);
      
      // Get QR code
      const qrResponse = await axios.get(
        `${BASE_URL}/api/whatsapp/baileys/qr-code`,
        { headers: getHeaders() }
      );
      
      console.log('QR code fetched successfully:', qrResponse.data);
      setQrCode(qrResponse.data.qrCode);
      onOpen(); // Open QR modal
      
      toast({
        title: '✅ Success!',
        description: 'Baileys initialized successfully. Please scan QR code.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Baileys initialization failed:', error);
      
      // Handle specific error types
      if (error.response?.status === 404) {
        toast({
          title: '⚠️ WhatsApp Not Available',
          description: 'WhatsApp integration is not set up on this server. Please contact your administrator.',
          status: 'warning',
          duration: 7000,
          isClosable: true,
        });
      } else if (error.response?.status === 403) {
        toast({
          title: '❌ Permission Error',
          description: 'You do not have permission to initialize WhatsApp',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else if (error.response?.status === 401) {
        toast({
          title: '❌ Authentication Error',
          description: 'Please log in again',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: '❌ Error',
          description: 'Baileys initialize नहीं हो सका',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Check Baileys status
  const checkBaileysStatus = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/whatsapp/baileys/status`,
        { headers: getHeaders() }
      );
      setBaileysStatus(response.data.status);
      console.log('Baileys status check successful:', response.data);
    } catch (error) {
      console.error('Status check failed:', error);
      
      // Handle specific error types
      if (error.response?.status === 404) {
        console.log('WhatsApp status endpoint not available - this is normal if WhatsApp integration is not set up');
        setBaileysStatus('not_configured');
      } else if (error.response?.status === 403) {
        toast({
          title: '❌ Permission Error',
          description: 'You do not have permission to check WhatsApp status',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else if (error.response?.status === 401) {
        toast({
          title: '❌ Authentication Error',
          description: 'Please log in again',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  // Send test message
  const sendTestMessage = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/whatsapp/message/send`,
        messageForm,
        { headers: getHeaders() }
      );
      
      if (response.data.success) {
        toast({
          title: '📱 Message भेजा गया!',
          description: `Message ID: ${response.data.data.messageId}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setMessageForm({
          recipientPhone: '',
          messageContent: '',
          messageType: 'text'
        });
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Message नहीं भेजा जा सका',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Test integration
  const testIntegration = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/whatsapp/integration/test`,
        {},
        { headers: getHeaders() }
      );
      setTestResults(response.data.results || []);
    } catch (error) {
      toast({
        title: '❌ Test Failed',
        description: 'Integration test नहीं हो सका',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Get conversations
  const getConversations = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/whatsapp/inbox/conversations?limit=20`,
        { headers: getHeaders() }
      );
      setConversations(response.data.conversations || []);
      console.log('Conversations fetched successfully:', response.data);
    } catch (error) {
      console.error('Conversations fetch failed:', error);
      
      // Handle specific error types
      if (error.response?.status === 404) {
        console.log('WhatsApp conversations endpoint not available - this is normal if WhatsApp integration is not set up');
        setConversations([]);
      } else if (error.response?.status === 403) {
        toast({
          title: '❌ Permission Error',
          description: 'You do not have permission to view conversations',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else if (error.response?.status === 401) {
        toast({
          title: '❌ Authentication Error',
          description: 'Please log in again',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  // Get inbox stats
  const getInboxStats = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/whatsapp/inbox/stats`,
        { headers: getHeaders() }
      );
      setInboxStats(response.data.stats || {});
      console.log('Inbox stats fetched successfully:', response.data);
    } catch (error) {
      console.error('Stats fetch failed:', error);
      
      // Handle specific error types
      if (error.response?.status === 404) {
        console.log('WhatsApp inbox stats endpoint not available - this is normal if WhatsApp integration is not set up');
        setInboxStats({});
      } else if (error.response?.status === 403) {
        toast({
          title: '❌ Permission Error',
          description: 'You do not have permission to view inbox stats',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else if (error.response?.status === 401) {
        toast({
          title: '❌ Authentication Error',
          description: 'Please log in again',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  // Switch integration
  const switchIntegration = async (integrationType) => {
    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/api/whatsapp/integration/switch`,
        { integrationType },
        { headers: getHeaders() }
      );
      
      toast({
        title: '🔄 Integration Switch',
        description: `${integrationType} पर switch हो गया`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: '❌ Switch Failed',
        description: 'Integration switch नहीं हो सका',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    checkBaileysStatus();
    getInboxStats();
    getConversations();
  }, []);

  return (
    <Box 
      minHeight="100vh" 
      bgGradient={bgGradient}
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgImage: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
        zIndex: 0
      }}
    >
      <Container maxW="7xl" py={8} position="relative" zIndex={1}>
        <VStack spacing={8}>
          {/* Modern Header */}
          <Box textAlign="center" py={8}>
            <VStack spacing={4}>
              <Box position="relative">
                <Icon as={ChatIcon} w={16} h={16} color={accentColor} />
                <Box
                  position="absolute"
                  top={-2}
                  right={-2}
                  w={6}
                  h={6}
                  bg="green.400"
                  borderRadius="full"
                  border="2px solid white"
                />
              </Box>
              <Heading 
                size="2xl" 
                bgGradient="linear(to-r, blue.400, purple.500)" 
                bgClip="text"
                fontWeight="800"
              >
                WhatsApp Integration Hub
              </Heading>
              <Text fontSize="lg" color={mutedColor} maxW="2xl">
                Professional WhatsApp Integration Management System - 
                सबसे advanced और powerful WhatsApp integration platform
              </Text>
              
              {/* User Info Card */}
              <Card 
                bg={cardBg} 
                shadow="xl" 
                borderRadius="2xl"
                border="1px solid"
                borderColor={borderColor}
                p={4}
                maxW="md"
              >
                <HStack spacing={4} justify="center">
                  <VStack spacing={1}>
                    <Text fontSize="sm" color={mutedColor}>User ID</Text>
                    <Badge colorScheme="blue" fontSize="xs" px={3} py={1} borderRadius="full">
                      {getCoachId(authState) || 'Not Available'}
                    </Badge>
                  </VStack>
                  <Divider orientation="vertical" h={8} />
                  <VStack spacing={1}>
                    <Text fontSize="sm" color={mutedColor}>Token Status</Text>
                    <Badge 
                      colorScheme={auth.token ? "green" : "red"} 
                      fontSize="xs" 
                      px={3} 
                      py={1} 
                      borderRadius="full"
                    >
                      {auth.token ? "Active" : "Inactive"}
                    </Badge>
                  </VStack>
                </HStack>
              </Card>
            </VStack>
          </Box>

          {/* Current Status Alert */}
          {currentIntegration && (
            <Alert 
              status="success" 
              borderRadius="2xl" 
              bg="green.50" 
              border="1px solid" 
              borderColor="green.200"
              maxW="4xl"
            >
              <AlertIcon />
              <Box flex="1">
                <AlertTitle fontSize="lg">
                  🚀 Active Integration: {currentIntegration.integrationType}
                </AlertTitle>
                <AlertDescription>
                  Status: <Badge colorScheme="green" ml={2} px={3} py={1} borderRadius="full">
                    {currentIntegration.statusSummary}
                  </Badge>
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Main Interface */}
          <Card 
            w="100%" 
            bg={cardBg} 
            shadow="2xl" 
            borderRadius="3xl"
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
          >
            <CardBody p={0}>
              <Tabs 
                index={activeTab} 
                onChange={setActiveTab} 
                variant="enclosed"
                size="lg"
              >
                <TabList 
                  bg={useColorModeValue('gray.50', 'gray.700')} 
                  borderBottom="none"
                  px={6}
                  py={2}
                >
                  <Tab 
                    fontWeight="600" 
                    fontSize="md"
                    _selected={{ 
                      color: accentColor, 
                      bg: cardBg,
                      borderColor: accentColor,
                      borderBottomColor: cardBg
                    }}
                    borderRadius="xl"
                    mx={1}
                  >
                    <HStack>
                      <Icon as={SettingsIcon} />
                      <Text>Setup & Config</Text>
                    </HStack>
                  </Tab>
                  <Tab 
                    fontWeight="600" 
                    fontSize="md"
                    _selected={{ 
                      color: accentColor, 
                      bg: cardBg,
                      borderColor: accentColor,
                      borderBottomColor: cardBg
                    }}
                    borderRadius="xl"
                    mx={1}
                  >
                    <HStack>
                      <Icon as={CheckIcon} />
                      <Text>Testing</Text>
                    </HStack>
                  </Tab>
                  <Tab 
                    fontWeight="600" 
                    fontSize="md"
                    _selected={{ 
                      color: accentColor, 
                      bg: cardBg,
                      borderColor: accentColor,
                      borderBottomColor: cardBg
                    }}
                    borderRadius="xl"
                    mx={1}
                  >
                    <HStack>
                      <Icon as={ChatIcon} />
                      <Text>Messaging</Text>
                    </HStack>
                  </Tab>
                  <Tab 
                    fontWeight="600" 
                    fontSize="md"
                    _selected={{ 
                      color: accentColor, 
                      bg: cardBg,
                      borderColor: accentColor,
                      borderBottomColor: cardBg
                    }}
                    borderRadius="xl"
                    mx={1}
                  >
                    <HStack>
                      <Icon as={InfoIcon} />
                      <Text>Inbox</Text>
                    </HStack>
                  </Tab>
                  <Tab 
                    fontWeight="600" 
                    fontSize="md"
                    _selected={{ 
                      color: accentColor, 
                      bg: cardBg,
                      borderColor: accentColor,
                      borderBottomColor: cardBg
                    }}
                    borderRadius="xl"
                    mx={1}
                  >
                    <HStack>
                      <Icon as={StarIcon} />
                      <Text>Control</Text>
                    </HStack>
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* Setup & Configuration Tab */}
                  <TabPanel p={8}>
                    <VStack spacing={8}>
                      <Box textAlign="center">
                        <Heading size="lg" color={textColor} mb={2}>
                          🔧 Phase 1: Setup & Configuration
                        </Heading>
                        <Text color={mutedColor}>Complete setup in just 45 minutes</Text>
                      </Box>
                      
                      <SimpleGrid columns={{ base: 1, lg: 1 }} spacing={6} w="100%">
                        {/* Meta Official API Setup Card */}
                        <Card 
                          bg={useColorModeValue('gradient.50', 'gray.700')} 
                          border="2px solid"
                          borderColor="blue.200"
                          borderRadius="2xl"
                          overflow="hidden"
                          _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
                          transition="all 0.3s"
                        >
                          <CardHeader bg="blue.500" color="white" py={6}>
                            <HStack justify="space-between">
                              <HStack>
                                <Icon as={StarIcon} w={6} h={6} />
                                <VStack align="start" spacing={0}>
                                  <Heading size="md">Meta Official API Integration</Heading>
                                  <Text fontSize="sm" opacity={0.9}>Premium WhatsApp Business Solution</Text>
                                </VStack>
                              </HStack>
                              <Badge colorScheme="yellow" fontSize="sm" px={3} py={1}>
                                High Priority
                              </Badge>
                            </HStack>
                          </CardHeader>
                          <CardBody p={8}>
                            <VStack spacing={6}>
                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                                <FormControl isRequired>
                                  <FormLabel fontWeight="600" color={textColor}>
                                    Meta API Token
                                  </FormLabel>
                                  <Input
                                    value={metaConfig.metaApiToken}
                                    onChange={(e) => setMetaConfig({...metaConfig, metaApiToken: e.target.value})}
                                    placeholder="your_meta_api_token"
                                    size="lg"
                                    borderRadius="xl"
                                    bg={cardBg}
                                    border="2px solid"
                                    borderColor={borderColor}
                                    _focus={{ borderColor: accentColor, shadow: 'lg' }}
                                  />
                                </FormControl>
                                
                                <FormControl isRequired>
                                  <FormLabel fontWeight="600" color={textColor}>
                                    Phone Number ID
                                  </FormLabel>
                                  <Input
                                    value={metaConfig.phoneNumberId}
                                    onChange={(e) => setMetaConfig({...metaConfig, phoneNumberId: e.target.value})}
                                    placeholder="your_phone_number_id"
                                    size="lg"
                                    borderRadius="xl"
                                    bg={cardBg}
                                    border="2px solid"
                                    borderColor={borderColor}
                                    _focus={{ borderColor: accentColor, shadow: 'lg' }}
                                  />
                                </FormControl>
                              </SimpleGrid>
                              
                              <FormControl isRequired>
                                <FormLabel fontWeight="600" color={textColor}>
                                  Business Account ID
                                </FormLabel>
                                <Input
                                  value={metaConfig.whatsAppBusinessAccountId}
                                  onChange={(e) => setMetaConfig({...metaConfig, whatsAppBusinessAccountId: e.target.value})}
                                  placeholder="your_business_account_id"
                                  size="lg"
                                  borderRadius="xl"
                                  bg={cardBg}
                                  border="2px solid"
                                  borderColor={borderColor}
                                  _focus={{ borderColor: accentColor, shadow: 'lg' }}
                                />
                              </FormControl>
                              
                              <FormControl>
                                <HStack justify="space-between" p={4} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="xl">
                                  <VStack align="start" spacing={0}>
                                    <Text fontWeight="600" color={textColor}>Auto Reply Enable</Text>
                                    <Text fontSize="sm" color={mutedColor}>Automatically respond to messages</Text>
                                  </VStack>
                                  <Switch
                                    isChecked={metaConfig.autoReplyEnabled}
                                    onChange={(e) => setMetaConfig({...metaConfig, autoReplyEnabled: e.target.checked})}
                                    size="lg"
                                    colorScheme="blue"
                                  />
                                </HStack>
                              </FormControl>
                              
                              <FormControl>
                                <FormLabel fontWeight="600" color={textColor}>
                                  Auto Reply Message
                                </FormLabel>
                                <Textarea
                                  value={metaConfig.autoReplyMessage}
                                  onChange={(e) => setMetaConfig({...metaConfig, autoReplyMessage: e.target.value})}
                                  placeholder="Thanks for your message! I'll get back to you soon."
                                  size="lg"
                                  borderRadius="xl"
                                  bg={cardBg}
                                  border="2px solid"
                                  borderColor={borderColor}
                                  _focus={{ borderColor: accentColor, shadow: 'lg' }}
                                  rows={3}
                                />
                              </FormControl>
                              
                              <Button
                                colorScheme="blue"
                                size="lg"
                                isLoading={loading}
                                onClick={() => setupIntegration(metaConfig)}
                                w="100%"
                                borderRadius="xl"
                                py={8}
                                fontSize="lg"
                                fontWeight="700"
                                leftIcon={<CheckIcon />}
                                _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                                transition="all 0.3s"
                              >
                                Setup Meta API Integration
                              </Button>
                            </VStack>
                          </CardBody>
                        </Card>

                        {/* Baileys Personal Account Setup Card */}
                        <Card 
                          bg={useColorModeValue('green.50', 'gray.700')} 
                          border="2px solid"
                          borderColor="green.200"
                          borderRadius="2xl"
                          overflow="hidden"
                          _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
                          transition="all 0.3s"
                        >
                          <CardHeader bg="green.500" color="white" py={6}>
                            <HStack justify="space-between">
                              <HStack>
                                <Icon as={PhoneIcon} w={6} h={6} />
                                <VStack align="start" spacing={0}>
                                  <Heading size="md">Baileys Personal Account</Heading>
                                  <Text fontSize="sm" opacity={0.9}>Personal WhatsApp Integration</Text>
                                </VStack>
                              </HStack>
                              <Badge colorScheme="green" fontSize="sm" px={3} py={1}>
                                Medium Priority
                              </Badge>
                            </HStack>
                          </CardHeader>
                          <CardBody p={8}>
                            <VStack spacing={6}>
                              <FormControl isRequired>
                                <FormLabel fontWeight="600" color={textColor}>
                                  Personal Phone Number
                                </FormLabel>
                                <Input
                                  value={baileysConfig.personalPhoneNumber}
                                  onChange={(e) => setBaileysConfig({...baileysConfig, personalPhoneNumber: e.target.value})}
                                  placeholder="+1234567890"
                                  size="lg"
                                  borderRadius="xl"
                                  bg={cardBg}
                                  border="2px solid"
                                  borderColor={borderColor}
                                  _focus={{ borderColor: 'green.400', shadow: 'lg' }}
                                />
                              </FormControl>
                              
                              <FormControl>
                                <HStack justify="space-between" p={4} bg={useColorModeValue('green.50', 'green.900')} borderRadius="xl">
                                  <VStack align="start" spacing={0}>
                                    <Text fontWeight="600" color={textColor}>Auto Reply Enable</Text>
                                    <Text fontSize="sm" color={mutedColor}>Automatically respond to messages</Text>
                                  </VStack>
                                  <Switch
                                    isChecked={baileysConfig.autoReplyEnabled}
                                    onChange={(e) => setBaileysConfig({...baileysConfig, autoReplyEnabled: e.target.checked})}
                                    size="lg"
                                    colorScheme="green"
                                  />
                                </HStack>
                              </FormControl>
                              
                              <FormControl>
                                <FormLabel fontWeight="600" color={textColor}>
                                  Auto Reply Message
                                </FormLabel>
                                <Textarea
                                  value={baileysConfig.autoReplyMessage}
                                  onChange={(e) => setBaileysConfig({...baileysConfig, autoReplyMessage: e.target.value})}
                                  placeholder="Thanks for your message! I'll get back to you soon."
                                  size="lg"
                                  borderRadius="xl"
                                  bg={cardBg}
                                  border="2px solid"
                                  borderColor={borderColor}
                                  _focus={{ borderColor: 'green.400', shadow: 'lg' }}
                                  rows={3}
                                />
                              </FormControl>
                              
                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                                <Button
                                  colorScheme="green"
                                  size="lg"
                                  isLoading={loading}
                                  onClick={() => setupIntegration(baileysConfig)}
                                  borderRadius="xl"
                                  py={8}
                                  fontSize="lg"
                                  fontWeight="700"
                                  leftIcon={<CheckIcon />}
                                  _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                                  transition="all 0.3s"
                                >
                                  Setup Baileys
                                </Button>
                                <Button
                                  colorScheme="teal"
                                  size="lg"
                                  onClick={initializeBaileys}
                                  borderRadius="xl"
                                  py={8}
                                  fontSize="lg"
                                  fontWeight="700"
                                  leftIcon={<InfoIcon />}
                                  _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                                  transition="all 0.3s"
                                >
                                  Get QR Code
                                </Button>
                              </SimpleGrid>
                              
                              {/* Baileys Status Display */}
                              <Alert 
                                status={baileysStatus === 'connected' ? 'success' : baileysStatus === 'not_configured' ? 'info' : 'warning'}
                                borderRadius="xl"
                                bg={baileysStatus === 'connected' ? 'green.50' : baileysStatus === 'not_configured' ? 'blue.50' : 'yellow.50'}
                              >
                                <AlertIcon />
                                <Box flex="1">
                                  <AlertTitle>
                                    {baileysStatus === 'not_configured' ? 'WhatsApp Integration Status' : 'Baileys Connection Status'}
                                  </AlertTitle>
                                  <AlertDescription>
                                    {baileysStatus === 'not_configured' ? (
                                      <Text fontSize="sm" color="blue.600">
                                        WhatsApp integration is not set up on this server. Contact your administrator to enable WhatsApp features.
                                      </Text>
                                    ) : (
                                      <Badge 
                                        colorScheme={baileysStatus === 'connected' ? 'green' : 'yellow'}
                                        fontSize="md"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                      >
                                        {baileysStatus.toUpperCase()}
                                      </Badge>
                                    )}
                                  </AlertDescription>
                                </Box>
                              </Alert>
                            </VStack>
                          </CardBody>
                        </Card>

                        {/* Central Fallback Setup Card */}
                        <Card 
                          bg={useColorModeValue('purple.50', 'gray.700')} 
                          border="2px solid"
                          borderColor="purple.200"
                          borderRadius="2xl"
                          overflow="hidden"
                          _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
                          transition="all 0.3s"
                        >
                          <CardHeader bg="purple.500" color="white" py={6}>
                            <HStack justify="space-between">
                              <HStack>
                                <Icon as={SettingsIcon} w={6} h={6} />
                                <VStack align="start" spacing={0}>
                                  <Heading size="md">Central Fallback Integration</Heading>
                                  <Text fontSize="sm" opacity={0.9}>Backup Integration System</Text>
                                </VStack>
                              </HStack>
                              <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>
                                Medium Priority
                              </Badge>
                            </HStack>
                          </CardHeader>
                          <CardBody p={8}>
                            <VStack spacing={6}>
                              <FormControl>
                                <HStack justify="space-between" p={4} bg={useColorModeValue('purple.50', 'purple.900')} borderRadius="xl">
                                  <VStack align="start" spacing={0}>
                                    <Text fontWeight="600" color={textColor}>Use Central Fallback</Text>
                                    <Text fontSize="sm" color={mutedColor}>Enable backup integration system</Text>
                                  </VStack>
                                  <Switch
                                    isChecked={centralConfig.useCentralFallback}
                                    onChange={(e) => setCentralConfig({...centralConfig, useCentralFallback: e.target.checked})}
                                    size="lg"
                                    colorScheme="purple"
                                  />
                                </HStack>
                              </FormControl>
                              
                              <FormControl>
                                <FormLabel fontWeight="600" color={textColor}>
                                  Central Account Credits
                                </FormLabel>
                                <Input
                                  type="number"
                                  value={centralConfig.centralAccountCredits}
                                  onChange={(e) => setCentralConfig({...centralConfig, centralAccountCredits: parseInt(e.target.value)})}
                                  placeholder="100"
                                  size="lg"
                                  borderRadius="xl"
                                  bg={cardBg}
                                  border="2px solid"
                                  borderColor={borderColor}
                                  _focus={{ borderColor: 'purple.400', shadow: 'lg' }}
                                />
                              </FormControl>
                              
                              <Button
                                colorScheme="purple"
                                size="lg"
                                isLoading={loading}
                                onClick={() => setupIntegration(centralConfig)}
                                w="100%"
                                borderRadius="xl"
                                py={8}
                                fontSize="lg"
                                fontWeight="700"
                                leftIcon={<CheckIcon />}
                                _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                                transition="all 0.3s"
                              >
                                Setup Central Fallback
                              </Button>
                            </VStack>
                          </CardBody>
                        </Card>
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>

                  {/* Testing Tab */}
                  <TabPanel p={8}>
                    <VStack spacing={8}>
                      <Box textAlign="center">
                        <Heading size="lg" color={textColor} mb={2}>
                          🧪 Phase 2: Core Functionality Testing
                        </Heading>
                        <Text color={mutedColor}>Complete testing in 60 minutes</Text>
                      </Box>
                      
                      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="100%">
                        {/* Integration Test Card */}
                        <Card 
                          bg={cardBg} 
                          shadow="xl" 
                          borderRadius="2xl"
                          border="2px solid"
                          borderColor="blue.200"
                          _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
                          transition="all 0.3s"
                        >
                          <CardHeader bg="blue.500" color="white" borderTopRadius="2xl">
                            <HStack>
                              <Icon as={CheckIcon} w={6} h={6} />
                              <Heading size="md">Integration Test Suite</Heading>
                            </HStack>
                          </CardHeader>
                          <CardBody p={6}>
                            <VStack spacing={6}>
                              <Button
                                colorScheme="blue"
                                size="lg"
                                onClick={testIntegration}
                                isLoading={loading}
                                w="100%"
                                borderRadius="xl"
                                py={8}
                                fontSize="lg"
                                fontWeight="700"
                                leftIcon={<CheckIcon />}
                                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                                transition="all 0.3s"
                              >
                                Run Complete Integration Test
                              </Button>
                              
                              {testResults.length > 0 && (
                                <Box w="100%">
                                  <Text fontWeight="bold" mb={4} fontSize="lg">Test Results:</Text>
                                  <VStack spacing={3}>
                                    {testResults.map((result, index) => (
                                      <Alert 
                                        key={index} 
                                        status={result.success ? 'success' : 'error'}
                                        borderRadius="xl"
                                        variant="subtle"
                                      >
                                        <AlertIcon />
                                        <AlertDescription fontWeight="500">
                                          {result.message}
                                        </AlertDescription>
                                      </Alert>
                                    ))}
                                  </VStack>
                                </Box>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                        
                        {/* Baileys Status Check Card */}
                        <Card 
                          bg={cardBg} 
                          shadow="xl" 
                          borderRadius="2xl"
                          border="2px solid"
                          borderColor="green.200"
                          _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
                          transition="all 0.3s"
                        >
                          <CardHeader bg="green.500" color="white" borderTopRadius="2xl">
                            <HStack>
                              <Icon as={PhoneIcon} w={6} h={6} />
                              <Heading size="md">Baileys Status Monitor</Heading>
                            </HStack>
                          </CardHeader>
                          <CardBody p={6}>
                            <VStack spacing={6}>
                              <Button
                                colorScheme="green"
                                size="lg"
                                onClick={checkBaileysStatus}
                                w="100%"
                                borderRadius="xl"
                                py={8}
                                fontSize="lg"
                                fontWeight="700"
                                leftIcon={<TimeIcon />}
                                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                                transition="all 0.3s"
                              >
                                Check Connection Status
                              </Button>
                              
                              <Center>
                                <VStack spacing={4}>
                                  <CircularProgress 
                                    value={baileysStatus === 'connected' ? 100 : 0} 
                                    color={baileysStatus === 'connected' ? 'green.400' : baileysStatus === 'not_configured' ? 'blue.400' : 'red.400'}
                                    size="120px"
                                    thickness="8px"
                                  >
                                    <CircularProgressLabel>
                                      <Icon 
                                        as={baileysStatus === 'connected' ? CheckCircleIcon : baileysStatus === 'not_configured' ? InfoIcon : WarningIcon} 
                                        w={8} 
                                        h={8} 
                                        color={baileysStatus === 'connected' ? 'green.400' : baileysStatus === 'not_configured' ? 'blue.400' : 'red.400'}
                                      />
                                    </CircularProgressLabel>
                                  </CircularProgress>
                                  
                                  <VStack spacing={2}>
                                    <Text fontWeight="600" fontSize="lg">Connection Status</Text>
                                    {baileysStatus === 'not_configured' ? (
                                      <VStack spacing={2}>
                                        <Badge 
                                          colorScheme="blue"
                                          fontSize="md"
                                          px={4}
                                          py={2}
                                          borderRadius="full"
                                        >
                                          NOT CONFIGURED
                                        </Badge>
                                        <Text fontSize="sm" color="blue.600" textAlign="center">
                                          WhatsApp integration not available
                                        </Text>
                                      </VStack>
                                    ) : (
                                      <Badge 
                                        colorScheme={baileysStatus === 'connected' ? 'green' : 'red'}
                                        fontSize="md"
                                        px={4}
                                        py={2}
                                        borderRadius="full"
                                      >
                                        {baileysStatus.toUpperCase()}
                                      </Badge>
                                    )}
                                  </VStack>
                                </VStack>
                              </Center>
                            </VStack>
                          </CardBody>
                        </Card>
                      </SimpleGrid>
                      
                      {/* Progress Tracking */}
                      <Card w="100%" bg={cardBg} shadow="xl" borderRadius="2xl">
                        <CardHeader>
                          <Heading size="lg" textAlign="center">📊 Testing Progress Dashboard</Heading>
                        </CardHeader>
                        <CardBody p={8}>
                          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
                            <VStack spacing={4}>
                              <Text fontWeight="600" fontSize="lg">Phase 1: Setup & Configuration</Text>
                              <CircularProgress value={75} color="green.400" size="80px" thickness="8px">
                                <CircularProgressLabel fontWeight="bold">75%</CircularProgressLabel>
                              </CircularProgress>
                              <Badge colorScheme="green" px={3} py={1} borderRadius="full">Completed</Badge>
                            </VStack>
                            
                            <VStack spacing={4}>
                              <Text fontWeight="600" fontSize="lg">Phase 2: Core Functionality</Text>
                              <CircularProgress value={50} color="blue.400" size="80px" thickness="8px">
                                <CircularProgressLabel fontWeight="bold">50%</CircularProgressLabel>
                              </CircularProgress>
                              <Badge colorScheme="blue" px={3} py={1} borderRadius="full">In Progress</Badge>
                            </VStack>
                            
                            <VStack spacing={4}>
                              <Text fontWeight="600" fontSize="lg">Phase 3: Advanced Features</Text>
                              <CircularProgress value={25} color="purple.400" size="80px" thickness="8px">
                                <CircularProgressLabel fontWeight="bold">25%</CircularProgressLabel>
                              </CircularProgress>
                              <Badge colorScheme="purple" px={3} py={1} borderRadius="full">Pending</Badge>
                            </VStack>
                          </SimpleGrid>
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>

                  {/* Messaging Tab */}
                  <TabPanel p={8}>
                    <VStack spacing={8}>
                      <Box textAlign="center">
                        <Heading size="lg" color={textColor} mb={2}>
                          💬 Message Testing Center
                        </Heading>
                        <Text color={mutedColor}>Test your WhatsApp messaging functionality</Text>
                      </Box>
                      
                      <Card 
                        w="100%" 
                        bg={cardBg} 
                        shadow="2xl" 
                        borderRadius="3xl"
                        border="2px solid"
                        borderColor="green.200"
                        maxW="4xl"
                        mx="auto"
                      >
                        <CardHeader bg="green.500" color="white" borderTopRadius="3xl" py={6}>
                          <Center>
                            <HStack spacing={4}>
                              <Icon as={ChatIcon} w={8} h={8} />
                              <Heading size="lg">Send Test Message</Heading>
                            </HStack>
                          </Center>
                        </CardHeader>
                        <CardBody p={8}>
                          <VStack spacing={8}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
                              <FormControl isRequired>
                                <FormLabel fontWeight="600" fontSize="lg" color={textColor}>
                                  📱 Recipient Phone Number
                                </FormLabel>
                                <Input
                                  value={messageForm.recipientPhone}
                                  onChange={(e) => setMessageForm({...messageForm, recipientPhone: e.target.value})}
                                  placeholder="+1234567890"
                                  size="lg"
                                  borderRadius="xl"
                                  bg={useColorModeValue('green.50', 'green.900')}
                                  border="2px solid"
                                  borderColor="green.200"
                                  _focus={{ borderColor: 'green.400', shadow: 'lg' }}
                                  fontSize="lg"
                                />
                              </FormControl>
                              
                              <FormControl>
                                <FormLabel fontWeight="600" fontSize="lg" color={textColor}>
                                  📝 Message Type
                                </FormLabel>
                                <Select
                                  value={messageForm.messageType}
                                  onChange={(e) => setMessageForm({...messageForm, messageType: e.target.value})}
                                  size="lg"
                                  borderRadius="xl"
                                  bg={useColorModeValue('green.50', 'green.900')}
                                  border="2px solid"
                                  borderColor="green.200"
                                  _focus={{ borderColor: 'green.400', shadow: 'lg' }}
                                  fontSize="lg"
                                >
                                  <option value="text">📄 Text Message</option>
                                  <option value="template">📋 Template Message</option>
                                </Select>
                              </FormControl>
                            </SimpleGrid>
                            
                            <FormControl isRequired w="100%">
                              <FormLabel fontWeight="600" fontSize="lg" color={textColor}>
                                💭 Message Content
                              </FormLabel>
                              <Textarea
                                value={messageForm.messageContent}
                                onChange={(e) => setMessageForm({...messageForm, messageContent: e.target.value})}
                                placeholder="Hello! How can I help you today? 😊"
                                size="lg"
                                borderRadius="xl"
                                bg={useColorModeValue('green.50', 'green.900')}
                                border="2px solid"
                                borderColor="green.200"
                                _focus={{ borderColor: 'green.400', shadow: 'lg' }}
                                rows={6}
                                fontSize="lg"
                              />
                            </FormControl>
                            
                            <Button
                              colorScheme="green"
                              size="xl"
                              onClick={sendTestMessage}
                              isLoading={loading}
                              w="100%"
                              borderRadius="2xl"
                              py={10}
                              fontSize="xl"
                              fontWeight="800"
                              leftIcon={<ChatIcon />}
                              _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
                              transition="all 0.3s"
                              bgGradient="linear(to-r, green.400, green.600)"
                            >
                              🚀 Send Message Now
                            </Button>
                          </VStack>
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>

                  {/* Inbox Management Tab */}
                  <TabPanel p={8}>
                    <VStack spacing={8}>
                      <Box textAlign="center">
                        <Heading size="lg" color={textColor} mb={2}>
                          📬 Inbox Management Dashboard
                        </Heading>
                        <Text color={mutedColor}>Monitor and manage your WhatsApp conversations</Text>
                      </Box>
                      
                      {/* Stats Dashboard */}
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="100%">
                        <Stat 
                          textAlign="center" 
                          p={8} 
                          bg={cardBg}
                          shadow="xl"
                          borderRadius="2xl"
                          border="2px solid"
                          borderColor="blue.200"
                          _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
                          transition="all 0.3s"
                        >
                          <StatLabel fontSize="lg" color={mutedColor} fontWeight="600">
                            💬 Total Conversations
                          </StatLabel>
                          <StatNumber fontSize="4xl" color="blue.500" fontWeight="800">
                            {inboxStats.totalConversations || 0}
                          </StatNumber>
                          <StatHelpText fontSize="md" color={mutedColor}>
                            All conversations
                          </StatHelpText>
                        </Stat>
                        
                        <Stat 
                          textAlign="center" 
                          p={8} 
                          bg={cardBg}
                          shadow="xl"
                          borderRadius="2xl"
                          border="2px solid"
                          borderColor="red.200"
                          _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
                          transition="all 0.3s"
                        >
                          <StatLabel fontSize="lg" color={mutedColor} fontWeight="600">
                            🔴 Unread Messages
                          </StatLabel>
                          <StatNumber fontSize="4xl" color="red.500" fontWeight="800">
                            {inboxStats.unreadMessages || 0}
                          </StatNumber>
                          <StatHelpText fontSize="md" color={mutedColor}>
                            Pending responses
                          </StatHelpText>
                        </Stat>
                        
                        <Stat 
                          textAlign="center" 
                          p={8} 
                          bg={cardBg}
                          shadow="xl"
                          borderRadius="2xl"
                          border="2px solid"
                          borderColor="green.200"
                          _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
                          transition="all 0.3s"
                        >
                          <StatLabel fontSize="lg" color={mutedColor} fontWeight="600">
                            🔥 Active Chats
                          </StatLabel>
                          <StatNumber fontSize="4xl" color="green.500" fontWeight="800">
                            {inboxStats.activeChats || 0}
                          </StatNumber>
                          <StatHelpText fontSize="md" color={mutedColor}>
                            Currently active
                          </StatHelpText>
                        </Stat>
                      </SimpleGrid>
                      
                      {/* Conversations */}
                      <Card 
                        w="100%" 
                        bg={cardBg} 
                        shadow="2xl" 
                        borderRadius="3xl"
                        border="2px solid"
                        borderColor={borderColor}
                      >
                        <CardHeader bg={useColorModeValue('gray.50', 'gray.700')} borderTopRadius="3xl" py={6}>
                          <HStack justify="space-between">
                            <HStack>
                              <Icon as={ChatIcon} w={6} h={6} color={accentColor} />
                              <Heading size="lg">Recent Conversations</Heading>
                            </HStack>
                            <Button 
                              size="md" 
                              onClick={getConversations}
                              colorScheme="blue"
                              borderRadius="xl"
                              fontWeight="600"
                              leftIcon={<TimeIcon />}
                              _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                              transition="all 0.3s"
                            >
                              Refresh
                            </Button>
                          </HStack>
                        </CardHeader>
                        <CardBody p={8}>
                          {conversations.length > 0 ? (
                            <VStack spacing={4}>
                              {conversations.map((conv, index) => (
                                <Box 
                                  key={index} 
                                  p={6} 
                                  bg={useColorModeValue('gray.50', 'gray.700')}
                                  borderRadius="2xl" 
                                  w="100%"
                                  border="1px solid"
                                  borderColor={borderColor}
                                  _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                                  transition="all 0.3s"
                                >
                                  <HStack justify="space-between">
                                    <HStack spacing={4}>
                                      <Box
                                        w={12}
                                        h={12}
                                        bg="blue.500"
                                        borderRadius="full"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        color="white"
                                        fontWeight="bold"
                                        fontSize="lg"
                                      >
                                        {(conv.contactName || conv.phone)?.[0] || '?'}
                                      </Box>
                                      <VStack align="start" spacing={1}>
                                        <Text fontWeight="700" fontSize="lg" color={textColor}>
                                          {conv.contactName || conv.phone}
                                        </Text>
                                        <Text fontSize="md" color={mutedColor}>
                                          {conv.lastMessage}
                                        </Text>
                                      </VStack>
                                    </HStack>
                                    <VStack align="end" spacing={2}>
                                      <Badge 
                                        colorScheme={conv.unread ? 'red' : 'green'} 
                                        fontSize="sm"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                      >
                                        {conv.unread ? '🔴 Unread' : '✅ Read'}
                                      </Badge>
                                      <Text fontSize="sm" color={mutedColor}>
                                        {conv.timestamp}
                                      </Text>
                                    </VStack>
                                  </HStack>
                                </Box>
                              ))}
                            </VStack>
                          ) : (
                            <Center py={16}>
                              <VStack spacing={4}>
                                <Icon as={ChatIcon} w={16} h={16} color={mutedColor} />
                                <Text fontSize="xl" color={mutedColor} fontWeight="600">
                                  {baileysStatus === 'not_configured' ? 'WhatsApp Not Configured' : 'No conversations found'}
                                </Text>
                                <Text color={mutedColor} textAlign="center">
                                  {baileysStatus === 'not_configured' 
                                    ? 'WhatsApp integration is not set up on this server. Contact your administrator to enable WhatsApp features.'
                                    : 'Start messaging to see conversations here'
                                  }
                                </Text>
                              </VStack>
                            </Center>
                          )}
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>

                  {/* Integration Control Tab */}
                  <TabPanel p={8}>
                    <VStack spacing={8}>
                      <Box textAlign="center">
                        <Heading size="lg" color={textColor} mb={2}>
                          🎛️ Integration Control Center
                        </Heading>
                        <Text color={mutedColor}>Switch between integrations and manage settings</Text>
                      </Box>
                      
                      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="100%">
                        {/* Switch Integration Card */}
                        <Card 
                          bg={cardBg} 
                          shadow="2xl" 
                          borderRadius="3xl"
                          border="2px solid"
                          borderColor="purple.200"
                          _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
                          transition="all 0.3s"
                        >
                          <CardHeader bg="purple.500" color="white" borderTopRadius="3xl" py={6}>
                            <Center>
                              <HStack>
                                <Icon as={SettingsIcon} w={6} h={6} />
                                <Heading size="md">Switch Integration</Heading>
                              </HStack>
                            </Center>
                          </CardHeader>
                          <CardBody p={8}>
                            <VStack spacing={6}>
                              <Button
                                colorScheme="blue"
                                size="lg"
                                onClick={() => switchIntegration('meta_official')}
                                w="100%"
                                borderRadius="xl"
                                py={8}
                                fontSize="lg"
                                fontWeight="700"
                                leftIcon={<StarIcon />}
                                _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                                transition="all 0.3s"
                              >
                                🏢 Switch to Meta API
                              </Button>
                              <Button
                                colorScheme="green"
                                size="lg"
                                onClick={() => switchIntegration('baileys_personal')}
                                w="100%"
                                borderRadius="xl"
                                py={8}
                                fontSize="lg"
                                fontWeight="700"
                                leftIcon={<PhoneIcon />}
                                _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                                transition="all 0.3s"
                              >
                                📱 Switch to Baileys
                              </Button>
                              <Button
                                colorScheme="purple"
                                size="lg"
                                onClick={() => switchIntegration('central_fallback')}
                                w="100%"
                                borderRadius="xl"
                                py={8}
                                fontSize="lg"
                                fontWeight="700"
                                leftIcon={<SettingsIcon />}
                                _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                                transition="all 0.3s"
                              >
                                🔄 Switch to Central
                              </Button>
                            </VStack>
                          </CardBody>
                        </Card>
                        
                        {/* Environment Config Card */}
                        <Card 
                          bg={cardBg} 
                          shadow="2xl" 
                          borderRadius="3xl"
                          border="2px solid"
                          borderColor="gray.200"
                          _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
                          transition="all 0.3s"
                        >
                          <CardHeader bg="gray.500" color="white" borderTopRadius="3xl" py={6}>
                            <Center>
                              <HStack>
                                <Icon as={InfoIcon} w={6} h={6} />
                                <Heading size="md">Environment Config</Heading>
                              </HStack>
                            </Center>
                          </CardHeader>
                          <CardBody p={8}>
                            <VStack spacing={6} align="start">
                              <Box w="100%">
                                <Text fontSize="sm" color={mutedColor} mb={1}>Base URL</Text>
                                <Text fontSize="lg" fontWeight="600" color={textColor}>
                                  {BASE_URL}
                                </Text>
                              </Box>
                              
                              <Divider />
                              
                              <Box w="100%">
                                <Text fontSize="sm" color={mutedColor} mb={1}>User ID</Text>
                                <Badge colorScheme="blue" fontSize="md" px={4} py={2} borderRadius="full">
                                  {getCoachId(authState) || 'Not Available'}
                                </Badge>
                              </Box>
                              
                              <Box w="100%">
                                <Text fontSize="sm" color={mutedColor} mb={1}>Authentication Token</Text>
                                <Badge 
                                  colorScheme={auth.token ? "green" : "red"} 
                                  fontSize="md" 
                                  px={4} 
                                  py={2} 
                                  borderRadius="full"
                                >
                                  {auth.token ? '🔐 Active Token' : '❌ No Token'}
                                </Badge>
                              </Box>
                              
                              <Divider />
                              
                              <Text fontSize="sm" color={mutedColor} textAlign="center" w="100%">
                                🔧 Environment variables configured in backend
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Modern QR Code Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="3xl" border="2px solid" borderColor="green.200">
          <ModalHeader 
            bg="green.500" 
            color="white" 
            borderTopRadius="3xl"
            textAlign="center"
            py={6}
          >
            <VStack spacing={2}>
              <Icon as={PhoneIcon} w={8} h={8} />
              <Heading size="lg">Baileys QR Code Scanner</Heading>
            </VStack>
          </ModalHeader>
          <ModalCloseButton color="white" size="lg" />
          <ModalBody p={8} textAlign="center">
            {qrCode ? (
              <VStack spacing={6}>
                <Box 
                  p={4} 
                  bg="white" 
                  borderRadius="2xl" 
                  shadow="xl"
                  display="inline-block"
                >
                  <Image src={qrCode} alt="QR Code" maxWidth="300px" borderRadius="xl" />
                </Box>
                <Alert status="info" borderRadius="xl" bg="blue.50">
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <AlertTitle>📱 Scan Instructions:</AlertTitle>
                    <AlertDescription>
                      WhatsApp app में जाकर इस QR code को scan करें
                    </AlertDescription>
                  </VStack>
                </Alert>
              </VStack>
            ) : (
              <VStack spacing={6}>
                <Spinner size="xl" color="green.500" thickness="4px" />
                <Text fontSize="lg" fontWeight="600">QR Code generate हो रहा है...</Text>
                <Text color={mutedColor}>Please wait a moment</Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter p={6}>
            <HStack spacing={4} w="100%">
              <Button 
                onClick={checkBaileysStatus} 
                flex={1}
                colorScheme="green"
                size="lg"
                borderRadius="xl"
                fontWeight="600"
                leftIcon={<CheckIcon />}
              >
                Check Status
              </Button>
              <Button 
                onClick={onClose}
                flex={1}
                size="lg"
                borderRadius="xl"
                fontWeight="600"
              >
                Close
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default WhatsAppSetup;
