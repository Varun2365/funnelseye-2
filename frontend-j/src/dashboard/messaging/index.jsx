import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  AvatarBadge,
  IconButton,
  VStack,
  HStack,
  Divider,
  Badge,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Button,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spinner,
  useToast,
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
  Textarea,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
  Image,
  Center,
  Skeleton,
  SkeletonCircle,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, InfoIcon, CloseIcon } from '@chakra-ui/icons';
import {
  FiSearch,
  FiMoreVertical,
  FiPaperclip,
  FiSmile,
  FiSend,
  FiCheck,
  FiInbox,
  FiFileText,
  FiUsers,
  FiBarChart2,
  FiMail,
  FiMessageCircle,
  FiSettings,
  FiChevronDown,
  FiPlus,
  FiRefreshCw,
  FiCreditCard,
  FiClock,
  FiAlertCircle,
  FiImage,
  FiVideo,
  FiFile,
  FiX,
  FiChevronLeft,
  FiPhone,
  FiCheckCircle,
} from 'react-icons/fi';
import { useSelector } from 'react-redux';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// --- BEAUTIFUL TOAST NOTIFICATIONS (same as calendar page) ---
const useCustomToast = () => {
  const toast = useToast();

  return useCallback((message, status = 'info') => {
    const statusConfig = {
      success: {
        title: 'Success',
        bg: 'white',
        borderColor: 'green.200',
        iconColor: 'green.500',
        titleColor: 'green.700',
        textColor: 'gray.700',
        icon: CheckCircleIcon
      },
      error: {
        title: 'Error',
        bg: 'white',
        borderColor: 'red.200',
        iconColor: 'red.500',
        titleColor: 'red.700',
        textColor: 'gray.700',
        icon: WarningIcon
      },
      warning: {
        title: 'Warning',
        bg: 'white',
        borderColor: 'orange.200',
        iconColor: 'orange.500',
        titleColor: 'orange.700',
        textColor: 'gray.700',
        icon: WarningIcon
      },
      info: {
        title: 'Info',
        bg: 'white',
        borderColor: 'blue.200',
        iconColor: 'blue.500',
        titleColor: 'blue.700',
        textColor: 'gray.700',
        icon: InfoIcon
      }
    };

    const config = statusConfig[status] || statusConfig.info;
    const IconComponent = config.icon;

    toast({
      title: config.title,
      description: message,
      status,
      duration: 4000,
      isClosable: true,
      position: 'top-right',
      variant: 'subtle',
      containerStyle: {
        maxWidth: '400px',
      },
      render: ({ onClose }) => (
        <Box
          bg={config.bg}
          border="1px solid"
          borderColor={config.borderColor}
          borderRadius="7px"
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          p={4}
          display="flex"
          alignItems="flex-start"
          gap={3}
          minW="320px"
          maxW="400px"
        >
          <Box
            as={IconComponent}
            color={config.iconColor}
            boxSize={5}
            mt={0.5}
            flexShrink={0}
          />
          <VStack align="start" spacing={1} flex={1}>
            <Text
              fontSize="sm"
              fontWeight="600"
              color={config.titleColor}
            >
              {config.title}
            </Text>
            <Text
              fontSize="sm"
              color={config.textColor}
              lineHeight="1.5"
            >
              {message}
            </Text>
          </VStack>
          <IconButton
            aria-label="Close"
            icon={<CloseIcon />}
            size="xs"
            variant="ghost"
            onClick={onClose}
            color="gray.400"
            _hover={{ color: 'gray.600', bg: 'gray.50' }}
            borderRadius="7px"
            flexShrink={0}
          />
        </Box>
      ),
    });
  }, [toast]);
};

// Custom hook for API calls
const useMessagingAPI = () => {
  const token = useSelector((state) => state.auth?.token);

  const apiCall = useCallback(async (endpoint, options = {}) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...options,
      };

      const url = `${API_BASE}/api/central-messaging/v1${endpoint}`;
      const response = await axios({ url, ...config });

      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error.response?.data || error;
    }
  }, [token]);

  return { apiCall };
};

const MessagingDashboard = () => {
  // Get token for direct API calls
  const token = useSelector((state) => state.auth?.token);
  
  // State management
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [credits, setCredits] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState('320px');
  const [activeTab, setActiveTab] = useState(0);
  const [messagingMode, setMessagingMode] = useState('whatsapp');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Template modal state
  const { isOpen: isTemplateOpen, onOpen: onTemplateOpen, onClose: onTemplateClose } = useDisclosure();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateParams, setTemplateParams] = useState({});

  // New message modal state
  const { isOpen: isNewMessageOpen, onOpen: onNewMessageOpen, onClose: onNewMessageClose } = useDisclosure();
  const [newMessageRecipient, setNewMessageRecipient] = useState('');
  const [newMessageText, setNewMessageText] = useState('');

  // Media modal state
  const { isOpen: isMediaOpen, onOpen: onMediaOpen, onClose: onMediaClose } = useDisclosure();
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [mediaCaption, setMediaCaption] = useState('');

  // Email compose modal state
  const { isOpen: isEmailComposeOpen, onOpen: onEmailComposeOpen, onClose: onEmailComposeClose } = useDisclosure();
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailConfig, setEmailConfig] = useState(null);

  // Lead search state for new conversation
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [leadSearchResults, setLeadSearchResults] = useState([]);
  const [isSearchingLeads, setIsSearchingLeads] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const searchTimeoutRef = useRef(null);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const toast = useCustomToast();
  const { apiCall } = useMessagingAPI();

  // Tab configuration
  const whatsappTabNames = ['Inbox', 'Templates', 'Contacts', 'Credits'];
  const whatsappTabIcons = [FiInbox, FiFileText, FiUsers, FiCreditCard];
  
  const emailTabNames = ['Inbox', 'Settings', 'Contacts', 'Analytics'];
  const emailTabIcons = [FiInbox, FiSettings, FiUsers, FiBarChart2];

  const tabNames = messagingMode === 'whatsapp' ? whatsappTabNames : emailTabNames;

  // Color scheme
  const bgColor = useColorModeValue('white', 'gray.800');
  const sidebarBg = useColorModeValue('#f7f8fa', 'gray.900');
  const chatBg = useColorModeValue('#e5ddd5', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedText = useColorModeValue('gray.600', 'gray.400');
  const primaryBlue = useColorModeValue('#0084ff', '#0084ff');
  const primaryGreen = useColorModeValue('#128C7E', '#128C7E');
  const accentColor = messagingMode === 'whatsapp' ? primaryGreen : primaryBlue;
  const sentMessageBg = useColorModeValue('#dcf8c6', '#2b5278');
  const receivedMessageBg = useColorModeValue('white', '#2a2f35');
  const activeChatBg = useColorModeValue('#f0f2f5', '#2a2f35');

  // Fetch inbox/conversations - try multiple endpoints for compatibility
  const fetchInbox = useCallback(async () => {
    try {
      setLoading(true);
      
      // Try the coach inbox endpoint first
      let result;
      try {
        result = await apiCall('/coach/inbox');
      } catch (e) {
        // Fall back to general inbox endpoint
        console.log('Coach inbox failed, trying general inbox...');
        result = await apiCall('/inbox');
      }
      
      if (result?.success) {
        const convData = result.data?.conversations || result.data?.messages || result.data || [];
        setConversations(Array.isArray(convData) ? convData : []);
      } else {
        // If no data, set empty array (no conversations yet)
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching inbox:', error);
      // Don't show error toast if there's just no data
      if (error?.response?.status !== 404) {
        toast('No conversations found. Start a new conversation!', 'info');
      }
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [apiCall, toast]);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    try {
      const result = await apiCall('/coach/contacts');
      if (result.success) {
        setContacts(result.data?.contacts || result.data || []);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
    }
  }, [apiCall]);

  // Fetch Meta templates (from admin) - these are the approved WhatsApp templates
  const fetchTemplates = useCallback(async () => {
    try {
      console.log('🔄 Fetching templates for coach...');
      console.log('🔑 Token present:', !!token);
      
      // Use the dedicated coach endpoint that bypasses admin-only restrictions
      const response = await axios.get(`${API_BASE}/api/central-messaging/v1/coach/whatsapp-templates`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      console.log('📦 Templates API response:', response.data);
      
      if (response.data?.success) {
        const data = response.data?.data;
        
        // The endpoint returns { templates: [...], count: number }
        const templates = data?.templates || [];
        
        console.log('📋 Templates received:', templates.length);
        if (templates.length > 0) {
          console.log('📋 First template:', templates[0]);
        }
        
        setTemplates(templates);
      } else {
        console.error('Templates API returned unsuccessful:', response.data);
        setTemplates([]);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      console.error('Error response:', error.response?.data);
      // Show specific error info
      if (error.response?.status === 401) {
        console.log('⚠️ Authentication failed for templates');
      } else if (error.response?.status === 500) {
        console.log('⚠️ Templates service not configured yet');
      }
      setTemplates([]);
    }
  }, [token]);

  // Debounced lead search
  const searchLeads = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setLeadSearchResults([]);
      return;
    }

    try {
      setIsSearchingLeads(true);
      const result = await apiCall(`/coach/contacts/search?q=${encodeURIComponent(query)}&limit=20`);
      if (result.success) {
        setLeadSearchResults(result.data?.contacts || result.data || []);
      }
    } catch (error) {
      console.error('Error searching leads:', error);
      setLeadSearchResults([]);
    } finally {
      setIsSearchingLeads(false);
    }
  }, [apiCall]);

  // Handle lead search input with debounce
  const handleLeadSearchChange = useCallback((value) => {
    setLeadSearchQuery(value);
    setSelectedLead(null);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search - 300ms delay
    searchTimeoutRef.current = setTimeout(() => {
      searchLeads(value);
    }, 300);
  }, [searchLeads]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Fetch credit balance from coach user schema
  const fetchCredits = useCallback(async () => {
    try {
      const result = await apiCall('/coach/credits/balance');
      if (result.success) {
        setCredits(result.data);
      } else {
        // Set default credits structure if API returns unsuccessful
        setCredits({
          balance: 0,
          package: { name: 'Standard Plan' },
          usage: { creditsUsed: 0, totalMessagesSent: 0 },
          usagePercentage: 0
        });
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      // Set default credits structure on error so UI doesn't keep loading
      setCredits({
        balance: 0,
        package: { name: 'Standard Plan' },
        usage: { creditsUsed: 0, totalMessagesSent: 0 },
        usagePercentage: 0,
        error: true
      });
    }
  }, [apiCall]);

  // Fetch conversation messages
  const fetchConversation = useCallback(async (contactId) => {
    try {
      const result = await apiCall(`/coach/inbox/conversation/${contactId}`);
      if (result.success) {
        setMessages(result.data?.messages || result.data || []);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  }, [apiCall]);

  // Fetch messaging stats
  const fetchStats = useCallback(async () => {
    try {
      const result = await apiCall('/coach/stats');
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [apiCall]);

  // Fetch email configuration
  const fetchEmailConfig = useCallback(async () => {
    try {
      const result = await apiCall('/coach/email/config');
      if (result.success) {
        setEmailConfig(result.data?.emailSettings || null);
      }
    } catch (error) {
      console.error('Error fetching email config:', error);
      // Set default email config to avoid showing warning
      setEmailConfig({
        isConfigured: true,
        provider: 'system',
        canSend: true
      });
    }
  }, [apiCall]);

  // Send email message
  const handleSendEmail = async () => {
    if (!emailRecipient || !emailSubject || !emailBody) return;

    try {
      setSendingMessage(true);

      const result = await apiCall('/send', {
        method: 'POST',
        data: {
          to: emailRecipient,
          messageType: 'email',
          subject: emailSubject,
          emailBody: emailBody,
        },
      });

      if (result.success) {
        toast('Your email has been sent successfully', 'success');

        onEmailComposeClose();
        setEmailRecipient('');
        setEmailSubject('');
        setEmailBody('');
        fetchCredits();
        fetchInbox();
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast(error.message || 'Failed to send email', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchInbox();
    fetchContacts();
    fetchTemplates();
    fetchCredits();
    fetchStats();
    fetchEmailConfig();
  }, []);

  // Refresh all data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchInbox(),
      fetchContacts(),
      fetchTemplates(),
      fetchCredits(),
      fetchStats(),
    ]);
    setRefreshing(false);
    toast('All data has been refreshed', 'success');
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation when selected
  useEffect(() => {
    if (selectedConversation?.conversationId || selectedConversation?.phone) {
      fetchConversation(selectedConversation.conversationId || selectedConversation.phone);
    }
  }, [selectedConversation, fetchConversation]);

  // Send text message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      setSendingMessage(true);

      // Check if within 24hr window or need template
      const isWithin24Hours = selectedConversation.isWithin24Hours !== false;

      if (!isWithin24Hours) {
        toast('This contact is outside the 24-hour window. Please use a template message.', 'warning');
        onTemplateOpen();
        setSendingMessage(false);
        return;
      }

      const result = await apiCall('/coach/send', {
        method: 'POST',
        data: {
          to: selectedConversation.phone || selectedConversation.participantPhone,
          message: messageInput,
          leadId: selectedConversation.leadId,
        },
      });

      if (result.success) {
        // Add message to local state
    const newMessage = {
          id: result.data?.messageId || Date.now(),
      text: messageInput,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
          direction: 'outbound',
    };
    setMessages([...messages, newMessage]);
    setMessageInput('');

        // Deduct credits after successful send
        try {
          await apiCall('/coach/credits/deduct', {
            method: 'POST',
            data: { amount: 1, description: 'Text message sent' }
          });
        } catch (creditError) {
          console.error('Error deducting credits:', creditError);
          // Don't fail the message send if credit deduction fails
        }

        // Refresh credits
        fetchCredits();

        toast('Message sent successfully', 'success');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast(error.message || 'Failed to send message', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  // Send template message
  const handleSendTemplate = async () => {
    if (!selectedTemplate) return;
    
    // Determine recipient - either from selected conversation or new message modal
    const recipientPhone = selectedConversation?.phone || selectedConversation?.participantPhone || newMessageRecipient;
    const recipientLeadId = selectedConversation?.leadId || selectedLead?._id;
    
    if (!recipientPhone) {
      toast('Please select a recipient', 'error');
      return;
    }

    try {
      setSendingMessage(true);

      // Convert templateParams object to array format expected by backend
      // templateParams is now an object like { 1: "value1", 2: "value2" }
      // We need to convert it to ["value1", "value2"] in order
      const paramCount = selectedTemplate.parameterCount || selectedTemplate.variables?.length || 0;
      let paramsArray = [];
      
      if (paramCount > 0) {
        for (let i = 1; i <= paramCount; i++) {
          const paramValue = templateParams[i] || '';
          if (!paramValue.trim()) {
            toast(`Please fill in parameter ${i} (${paramCount} parameters required)`, 'warning');
            setSendingMessage(false);
            return;
          }
          paramsArray.push(paramValue);
        }
      }

      // Use the correct endpoint for sending WhatsApp templates
      // IMPORTANT: Include language from template to avoid language mismatch errors
      const response = await axios.post(`${API_BASE}/api/central-messaging/v1/coach/send`, {
        to: recipientPhone,
        type: 'template',
        templateName: selectedTemplate.name || selectedTemplate.templateName,
        templateId: selectedTemplate.templateId || selectedTemplate._id,
        language: selectedTemplate.language, // Include template's language
        templateParameters: paramsArray,
        parameters: paramsArray,
        leadId: recipientLeadId,
      }, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.data?.success || response.data?.data?.wamid || response.data?.wamid) {
        toast('Template message sent successfully', 'success');

        // Deduct credits after successful send
        try {
          await apiCall('/coach/credits/deduct', {
            method: 'POST',
            data: { amount: 1, description: 'Template message sent' }
          });
        } catch (creditError) {
          console.error('Error deducting credits:', creditError);
          // Don't fail the message send if credit deduction fails
        }

        // Refresh conversation or inbox
        if (selectedConversation) {
          fetchConversation(selectedConversation.conversationId || selectedConversation.phone);
        }
        fetchInbox();
        fetchCredits();
        onTemplateClose();
        onNewMessageClose();
        setSelectedTemplate(null);
        setTemplateParams({});
        setNewMessageRecipient('');
        setLeadSearchQuery('');
        setLeadSearchResults([]);
        setSelectedLead(null);
      } else {
        throw new Error(response.data?.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending template:', error);
      toast(error.response?.data?.message || error.message || 'Failed to send template', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  // Send media message
  const handleSendMedia = async () => {
    if (!mediaUrl || !selectedConversation) return;

    try {
      setSendingMessage(true);

      const result = await apiCall('/coach/send', {
        method: 'POST',
        data: {
          to: selectedConversation.phone || selectedConversation.participantPhone,
          mediaUrl,
          mediaType,
          message: mediaCaption,
          leadId: selectedConversation.leadId,
        },
      });

      if (result.success) {
        toast('Media sent successfully', 'success');

        // Deduct credits after successful send
        try {
          await apiCall('/coach/credits/deduct', {
            method: 'POST',
            data: { amount: 1, description: 'Media message sent' }
          });
        } catch (creditError) {
          console.error('Error deducting credits:', creditError);
          // Don't fail the message send if credit deduction fails
        }

        fetchConversation(selectedConversation.conversationId || selectedConversation.phone);
        fetchCredits();
        onMediaClose();
        setMediaUrl('');
        setMediaCaption('');
      }
    } catch (error) {
      console.error('Error sending media:', error);
      toast(error.message || 'Failed to send media', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  // Start new conversation
  const handleNewConversation = async () => {
    if (!newMessageRecipient || !newMessageText) return;

    try {
      setSendingMessage(true);

      const result = await apiCall('/coach/send', {
        method: 'POST',
        data: {
          to: newMessageRecipient,
          message: newMessageText,
        },
      });

      if (result.success) {
        toast('Message sent successfully', 'success');

        // Deduct credits after successful send
        try {
          await apiCall('/coach/credits/deduct', {
            method: 'POST',
            data: { amount: 1, description: 'New conversation started' }
          });
        } catch (creditError) {
          console.error('Error deducting credits:', creditError);
          // Don't fail the message send if credit deduction fails
        }

        fetchInbox();
        fetchCredits();
        onNewMessageClose();
        setNewMessageRecipient('');
        setNewMessageText('');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast(error.message || 'Failed to send message. If starting a new conversation, you may need to use a template.', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle credit purchase with Razorpay
  const handlePurchaseCredits = async (pkg) => {
    try {
      setSendingMessage(true);
      toast('Creating payment order...', 'info');

      // Create Razorpay order
      const result = await apiCall('/coach/credits/purchase', {
        method: 'POST',
        data: { packageId: pkg.id }
      });

      if (result.success && result.data) {
        const { orderId, amount, currency, package: selectedPackage, razorpayKey } = result.data;

        if (!razorpayKey) {
          toast('Razorpay not configured. Please contact support.', 'error');
          return;
        }

        // Initialize Razorpay
        const options = {
          key: razorpayKey,
          amount: amount,
          currency: currency,
          name: 'FunnelsEye',
          description: `Purchase ${selectedPackage.name} - ${selectedPackage.credits} credits`,
          order_id: orderId,
          handler: async function (response) {
            try {
              // Verify payment
              const verifyResult = await apiCall('/coach/credits/verify-payment', {
                method: 'POST',
                data: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  packageId: pkg.id
                }
              });

              if (verifyResult.success) {
                toast(`Successfully purchased ${selectedPackage.credits} credits!`, 'success');
                fetchCredits(); // Refresh credits
              } else {
                toast('Payment verification failed', 'error');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              toast('Payment verification failed', 'error');
            }
          },
          prefill: {
            name: '', // Could get from user profile
            email: '', // Could get from user profile
          },
          theme: {
            color: '#10b981', // Match accent color
          },
          modal: {
            ondismiss: function() {
              toast('Payment cancelled', 'warning');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        throw new Error(result.message || 'Failed to create payment order');
      }
    } catch (error) {
      console.error('Error purchasing credits:', error);
      toast(error.message || 'Failed to initiate payment', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle key press for message input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((conv) =>
    (conv.participantName || conv.name || conv.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.participantPhone || conv.phone || '').includes(searchQuery)
  );

  // Filter contacts by search
  const filteredContacts = contacts.filter((contact) =>
    (contact.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.phone || contact.phoneNumber || '').includes(searchQuery)
  );

  // Listen to sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      if (event.detail?.width) {
        setSidebarWidth(event.detail.width);
      }
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle);
  }, []);

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return 'Unknown';
    // Format phone number for better display
    return phone.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
  };

  // Save phone number as contact
  const saveContact = async (phone, name = null) => {
    if (!phone) return;

    try {
      // Create a lead/contact
      const result = await apiCall('/contacts', {
        method: 'POST',
        data: {
          name: name || `Contact ${phone}`,
          phone: phone,
          source: 'messaging_inbox'
        }
      });

      if (result.success) {
        toast('Contact saved successfully', 'success');
        fetchContacts(); // Refresh contacts list
      } else {
        throw new Error(result.message || 'Failed to save contact');
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      toast('Failed to save contact', 'error');
    }
  };

  // Check if conversation is within 24hr window
  const isWithin24Hours = (conv) => {
    if (!conv.lastMessageAt) return false;
    const lastMessage = new Date(conv.lastMessageAt);
    const now = new Date();
    const hoursDiff = (now - lastMessage) / (1000 * 60 * 60);
    return hoursDiff < 24;
  };

  return (
    <Box 
      h="100vh" 
      w={{ base: "100vw", md: `calc(100vw - ${sidebarWidth})` }}
      left={{ base: 0, md: sidebarWidth }}
      display="flex" 
      flexDirection="column" 
      bg={sidebarBg} 
      position="fixed" 
      top={0} 
      zIndex={1000}
      overflow="hidden"
      transition="left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    >
      <Flex flex={1} overflow="hidden">
        {/* Left Sidebar - Conversations List */}
        <Box
          w="30%"
          minW="300px"
          bg={bgColor}
          borderRight="1px solid"
          borderColor={borderColor}
          display="flex"
          flexDirection="column"
        >
          <Tabs 
            index={activeTab} 
            onChange={setActiveTab}
            variant="unstyled"
            display="flex"
            flexDirection="column"
            flex={1}
            overflow="hidden"
          >
            {/* Header Section */}
            <Box
              p={6}
              pb={4}
              borderBottom="1px solid"
              borderColor={borderColor}
              bg={bgColor}
            >
              <HStack justify="space-between" mb={4}>
                <Text fontSize="2xl" fontWeight="700" color={textColor} letterSpacing="-0.02em">
                  {tabNames[activeTab]}
          </Text>
                <HStack spacing={2}>
                  {/* Refresh Button */}
                  <IconButton
                    icon={<FiRefreshCw size={16} />}
                    size="sm"
                    variant="ghost"
                    onClick={handleRefresh}
                    isLoading={refreshing}
                    aria-label="Refresh"
                  />
                  {/* Mode Selector */}
                <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<FiChevronDown size={14} />}
                      w="140px"
                    size="sm"
                    bg={bgColor}
                    border="1px solid"
                    borderColor={borderColor}
                      _hover={{ bg: hoverBg, borderColor: accentColor }}
                    fontWeight="600"
                    fontSize="sm"
                    color={textColor}
                  >
                    <HStack spacing={2} justify="center">
                      {messagingMode === 'whatsapp' ? (
                        <>
                          <FiMessageCircle size={16} color={accentColor} />
                          <Text>WhatsApp</Text>
                        </>
                      ) : (
                        <>
                          <FiMail size={16} color={accentColor} />
                          <Text>Email</Text>
                        </>
                      )}
                    </HStack>
                  </MenuButton>
                    <MenuList bg={bgColor} border="1px solid" borderColor={borderColor}>
                    <MenuItem
                        icon={<FiMessageCircle size={16} />}
            onClick={() => {
                        setMessagingMode('whatsapp');
                        setActiveTab(0);
                      }}
                      bg={messagingMode === 'whatsapp' ? activeChatBg : 'transparent'}
                      fontWeight={messagingMode === 'whatsapp' ? '600' : '500'}
                    >
                      WhatsApp
                    </MenuItem>
                    <MenuItem
                        icon={<FiMail size={16} />}
                      onClick={() => {
                        setMessagingMode('email');
                        setActiveTab(0);
                      }}
                      bg={messagingMode === 'email' ? activeChatBg : 'transparent'}
                      fontWeight={messagingMode === 'email' ? '600' : '500'}
                    >
                      Email
                    </MenuItem>
                  </MenuList>
                </Menu>
                </HStack>
      </HStack>

              {/* Credit Balance Display */}
              {credits && messagingMode === 'whatsapp' && (
                <HStack
                  bg={accentColor + '15'}
                  p={2}
                  borderRadius="md"
                  mb={3}
                  justify="space-between"
                >
                  <HStack spacing={2}>
                    <FiCreditCard color={accentColor} />
                    <Text fontSize="sm" fontWeight="600" color={textColor}>
                      Credits: {credits.balance || 0}
                    </Text>
                  </HStack>
                  <Button
                    size="xs"
                    colorScheme="green"
                    onClick={() => setActiveTab(3)}
                  >
                    Buy More
                  </Button>
                </HStack>
              )}

              {/* Tab Bar */}
              <TabList border="none" gap={2}>
                <Tab 
                  fontSize="xs" 
                  fontWeight="600" 
                  px={3} 
                  py={2}
                  _selected={{ color: accentColor, borderBottom: `2px solid ${accentColor}` }}
                  borderBottom="2px solid transparent"
                  color={mutedText}
                  _hover={{ color: textColor }}
                >
                  <HStack spacing={1.5}>
                    <FiInbox size={14} />
                    <Text>Inbox</Text>
                  </HStack>
                </Tab>
                  <Tab 
                    fontSize="xs" 
                    fontWeight="600" 
                    px={3} 
                    py={2}
                    _selected={{ color: accentColor, borderBottom: `2px solid ${accentColor}` }}
                    borderBottom="2px solid transparent"
                    color={mutedText}
                    _hover={{ color: textColor }}
                  >
                    <HStack spacing={1.5}>
                      <FiFileText size={14} />
                      <Text>Templates</Text>
                    </HStack>
                  </Tab>
                  <Tab 
                    fontSize="xs" 
                    fontWeight="600" 
                    px={3} 
                    py={2}
                    _selected={{ color: accentColor, borderBottom: `2px solid ${accentColor}` }}
                    borderBottom="2px solid transparent"
                    color={mutedText}
                    _hover={{ color: textColor }}
                >
                  <HStack spacing={1.5}>
                    <FiUsers size={14} />
                    <Text>Contacts</Text>
                  </HStack>
                </Tab>
                <Tab 
                  fontSize="xs" 
                  fontWeight="600" 
                  px={3} 
                  py={2}
                  _selected={{ color: accentColor, borderBottom: `2px solid ${accentColor}` }}
                  borderBottom="2px solid transparent"
                  color={mutedText}
                  _hover={{ color: textColor }}
                >
                  <HStack spacing={1.5}>
                    <FiCreditCard size={14} />
                    <Text>Credits</Text>
                  </HStack>
                </Tab>
        </TabList>
            </Box>

            <TabPanels flex={1} overflow="hidden" display="flex" flexDirection="column">
              {/* Inbox Tab */}
              <TabPanel p={0} flex={1} display="flex" flexDirection="column" overflow="hidden">
                {/* Search and New Message */}
                <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
                  <HStack spacing={2}>
                    <InputGroup flex={1}>
                    <InputLeftElement pointerEvents="none">
                      <FiSearch color="gray" />
                    </InputLeftElement>
                    <Input
                        placeholder={messagingMode === 'whatsapp' ? "Search conversations" : "Search emails"}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      bg={hoverBg}
                      border="none"
                      borderRadius="lg"
                      _focus={{ bg: bgColor, border: '1px solid', borderColor: accentColor }}
                      fontSize="sm"
                    />
                  </InputGroup>
                    {messagingMode === 'whatsapp' ? (
                      <IconButton
                        icon={<FiPlus />}
                        colorScheme="green"
                        onClick={onNewMessageOpen}
                        aria-label="New conversation"
                        borderRadius="lg"
                      />
                    ) : (
                      <Button
                        leftIcon={<FiMail />}
                        colorScheme="blue"
                        size="sm"
                        onClick={onEmailComposeOpen}
                      >
                        Compose
                      </Button>
                    )}
                  </HStack>
                </Box>

                {/* Conversation List */}
                <Box 
                  flex={1} 
                  overflowY="auto"
                  sx={{
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.2)', borderRadius: '10px' },
                  }}
                >
                  {loading ? (
                    <VStack spacing={4} p={4}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <HStack key={i} w="100%" spacing={3}>
                          <SkeletonCircle size="12" />
                          <VStack flex={1} align="start" spacing={2}>
                            <Skeleton height="14px" width="60%" />
                            <Skeleton height="12px" width="80%" />
                          </VStack>
                        </HStack>
                      ))}
                    </VStack>
                  ) : filteredConversations.length === 0 ? (
                    <Center py={10}>
                      <VStack spacing={3}>
                        <FiInbox size={48} color={mutedText} />
                        <Text color={mutedText}>No conversations yet</Text>
                        <Button
                          size="sm"
                          colorScheme="green"
                          leftIcon={<FiPlus />}
                          onClick={onNewMessageOpen}
                        >
                          Start New Conversation
                        </Button>
                      </VStack>
                    </Center>
                  ) : (
                    filteredConversations.map((conversation, idx) => (
                      <Box
                        key={conversation.conversationId || conversation._id || idx}
                      p={3}
                      cursor="pointer"
                        bg={selectedConversation?.conversationId === conversation.conversationId ? activeChatBg : 'transparent'}
                      _hover={{ bg: activeChatBg }}
                      borderBottom="1px solid"
                      borderColor={borderColor}
                      onClick={() => setSelectedConversation(conversation)}
                        borderLeft={selectedConversation?.conversationId === conversation.conversationId ? '3px solid' : '3px solid transparent'}
                        borderLeftColor={selectedConversation?.conversationId === conversation.conversationId ? accentColor : 'transparent'}
                    >
                      <HStack spacing={3}>
                          <Avatar
                            size="md"
                            name={conversation.participantName || conversation.name}
                            border={selectedConversation?.conversationId === conversation.conversationId ? `2px solid ${accentColor}` : 'none'}
                          >
                            {isWithin24Hours(conversation) && (
                              <AvatarBadge boxSize="1em" bg={primaryGreen} border="2px solid" borderColor={bgColor} />
                          )}
                        </Avatar>
                        <Flex flex={1} direction="column" minW={0}>
                          <HStack justify="space-between" mb={1}>
                              <HStack spacing={2} flex={1} minW={0}>
                                <Text fontSize="sm" fontWeight="600" color={textColor} noOfLines={1}>
                                  {conversation.participantName || formatPhone(conversation.participantPhone)}
                                </Text>
                                {/* Save contact button - only show if no participantName */}
                                {!conversation.participantName && conversation.participantPhone && (
                                  <IconButton
                                    icon={<FiPlus size={12} />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="blue"
                                    aria-label="Save contact"
                                    title="Save as contact"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      saveContact(conversation.participantPhone);
                                    }}
                                  />
                                )}
                              </HStack>
                            <Text fontSize="xs" color={mutedText}>
                                {conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </Text>
                    </HStack>
                          <HStack justify="space-between">
                              <Text fontSize="xs" color={mutedText} noOfLines={1} flex={1}>
                                {conversation.lastMessageContent || 'No messages yet'}
                      </Text>
                            {conversation.unreadCount > 0 && (
                              <Badge
                                bg={accentColor}
                                color="white"
                                borderRadius="full"
                                minW="20px"
                                h="20px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontSize="xs"
                              >
                                {conversation.unreadCount}
                      </Badge>
                            )}
                    </HStack>
                            {/* 24hr window indicator */}
                            {!isWithin24Hours(conversation) && (
                              <HStack mt={1}>
                                <Tag size="sm" colorScheme="orange" variant="subtle">
                                  <FiClock size={10} />
                                  <TagLabel ml={1} fontSize="10px">Template Required</TagLabel>
                                </Tag>
                      </HStack>
                            )}
                          </Flex>
                        </HStack>
                      </Box>
                    ))
                  )}
                </Box>
          </TabPanel>

              {/* Templates Tab */}
                <TabPanel 
                  p={4} 
                  flex={1} 
                  overflowY="auto"
                  sx={{
                  '&::-webkit-scrollbar': { width: '6px' },
                  '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.2)', borderRadius: '10px' },
                  }}
                >
                  <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                    <Text fontSize="md" fontWeight="600" color={textColor}>
                        WhatsApp Templates
                    </Text>
                    <Text fontSize="sm" color={mutedText}>
                        Meta-approved templates for initiating conversations
                    </Text>
                    </VStack>
                    <IconButton
                      icon={<FiRefreshCw size={14} />}
                      size="sm"
                      variant="outline"
                      onClick={fetchTemplates}
                      aria-label="Refresh templates"
                    />
                  </HStack>
                  
                  <Alert status="info" borderRadius="md" py={2}>
                    <AlertIcon />
                    <AlertDescription fontSize="xs">
                      Templates are approved by Meta and managed by your administrator. Use these to start conversations or message contacts outside the 24-hour window.
                    </AlertDescription>
                  </Alert>
                  
                    <Divider />

                  {/* Template Statistics */}
                  {templates.length > 0 && (
                    <HStack spacing={3} wrap="wrap">
                      <Tag colorScheme="green" size="sm">
                        {templates.filter(t => t.status === 'APPROVED').length} Approved
                      </Tag>
                      <Tag colorScheme="orange" size="sm">
                        {templates.filter(t => t.status === 'PENDING').length} Pending
                      </Tag>
                      <Tag colorScheme="red" size="sm">
                        {templates.filter(t => t.status === 'REJECTED').length} Rejected
                      </Tag>
                    </HStack>
                  )}

                  {templates.length === 0 ? (
                    <Center py={10}>
                      <VStack spacing={3}>
                        <FiFileText size={48} color={mutedText} />
                        <Text color={mutedText}>No templates found</Text>
                        <Text fontSize="sm" color={mutedText} textAlign="center">
                          No WhatsApp templates are available in the connected Meta Business account. 
                          Please ask your administrator to create templates in the Meta Business Manager.
                        </Text>
                        <Button
                          size="sm"
                          leftIcon={<FiRefreshCw />}
                          colorScheme="blue"
                          variant="outline"
                          onClick={fetchTemplates}
                        >
                          Refresh from Meta
                        </Button>
                      </VStack>
                    </Center>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {templates.map((template, idx) => (
                        <Box
                          key={template.templateId || template._id || idx}
                          p={4}
                          bg={hoverBg}
                          borderRadius="md"
                          border="1px solid"
                          borderColor={borderColor}
                          _hover={{ borderColor: accentColor, transform: 'translateY(-1px)' }}
                          transition="all 0.2s"
                          cursor="pointer"
                          onClick={() => {
                            setSelectedTemplate(template);
                            if (selectedConversation) {
                              onTemplateOpen();
                            } else {
                              onNewMessageOpen();
                            }
                          }}
                        >
                          <HStack justify="space-between" mb={2}>
                            <HStack spacing={2}>
                              <Box
                                w="8px"
                                h="8px"
                                borderRadius="full"
                                bg={template.status === 'APPROVED' ? 'green.400' : template.status === 'PENDING' ? 'orange.400' : 'red.400'}
                              />
                            <Text fontSize="sm" fontWeight="600" color={textColor}>
                                {template.templateName || template.name}
                            </Text>
                            </HStack>
                            <Badge
                              colorScheme={template.status === 'APPROVED' ? 'green' : template.status === 'PENDING' ? 'orange' : 'red'}
                              fontSize="xs"
                            >
                              {template.status}
                            </Badge>
                          </HStack>
                          
                          <HStack spacing={2} mb={2} flexWrap="wrap">
                            <Tag size="sm" variant="subtle" colorScheme="gray">
                              {template.category}
                            </Tag>
                            <Tag size="sm" variant="subtle" colorScheme="blue">
                              {template.language || 'en'}
                            </Tag>
                          </HStack>
                          
                          {/* Template Body Preview */}
                          {(template.bodyPreview || template.components?.find(c => c.type === 'BODY')?.text) && (
                            <Box
                              p={2}
                            bg={bgColor}
                              borderRadius="sm"
                              border="1px dashed"
                            borderColor={borderColor}
                            >
                              <Text fontSize="xs" color={mutedText} noOfLines={3} fontStyle="italic">
                                "{template.bodyPreview || template.components?.find(c => c.type === 'BODY')?.text}"
                              </Text>
                            </Box>
                          )}
                          
                          {/* Template Info Footer */}
                          <HStack mt={2} justify="space-between">
                            <HStack spacing={2}>
                              {template.parameterCount > 0 && (
                                <Tag size="sm" colorScheme="purple" variant="subtle">
                                  <FiSettings size={10} />
                                  <TagLabel ml={1}>{template.parameterCount} params</TagLabel>
                                </Tag>
                              )}
                            </HStack>
                            {template.status === 'APPROVED' && (
                              <Button size="xs" colorScheme="green" variant="ghost" rightIcon={<FiSend size={12} />}>
                                Use
                      </Button>
                            )}
                    </HStack>
                    </Box>
                      ))}
                                  </VStack>
              )}
                </VStack>
              </TabPanel>

              {/* Contacts Tab */}
              <TabPanel 
                p={4} 
                flex={1} 
                overflowY="auto"
                sx={{
                  '&::-webkit-scrollbar': { width: '6px' },
                  '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.2)', borderRadius: '10px' },
                }}
              >
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="md" fontWeight="600" color={textColor}>
                      Contacts ({filteredContacts.length})
                      </Text>
                      </HStack>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FiSearch color="gray" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search contacts"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      bg={hoverBg}
                      border="none"
                      borderRadius="lg"
                      _focus={{ bg: bgColor, border: '1px solid', borderColor: accentColor }}
                      fontSize="sm"
                    />
                  </InputGroup>
                  <Divider />
                  <VStack spacing={2} align="stretch">
                    {filteredContacts.length === 0 ? (
                      <Center py={10}>
                        <VStack spacing={3}>
                          <FiUsers size={48} color={mutedText} />
                          <Text color={mutedText}>No contacts found</Text>
                        </VStack>
                      </Center>
                    ) : (
                      filteredContacts.map((contact, idx) => (
                        <Box
                          key={contact._id || idx}
                        p={3}
                        cursor="pointer"
                        bg={hoverBg}
                        borderRadius="md"
                        _hover={{ bg: activeChatBg }}
                          onClick={() => {
                            setSelectedConversation({
                              ...contact,
                              phone: contact.phone || contact.phoneNumber,
                              participantPhone: contact.phone || contact.phoneNumber,
                              participantName: contact.name,
                            });
                            setActiveTab(0);
                          }}
                      >
                        <HStack spacing={3}>
                            <Avatar size="sm" name={contact.name}>
                              {contact.isWithin24Hours && (
                                <AvatarBadge boxSize="0.8em" bg={primaryGreen} border="2px solid" borderColor={bgColor} />
                            )}
                          </Avatar>
                          <Flex flex={1} direction="column">
                            <Text fontSize="sm" fontWeight="500" color={textColor}>
                                {contact.name || 'Unknown'}
                            </Text>
                              <HStack spacing={2}>
                                <FiPhone size={10} color={mutedText} />
                            <Text fontSize="xs" color={mutedText}>
                                  {formatPhone(contact.phone || contact.phoneNumber)}
                            </Text>
                              </HStack>
                          </Flex>
                            <IconButton
                              icon={<FiMessageCircle />}
                              size="sm"
                              variant="ghost"
                              colorScheme="green"
                              aria-label="Message"
                            />
                        </HStack>
                      </Box>
                      ))
                    )}
                  </VStack>
                </VStack>
          </TabPanel>

              {/* Credits Tab */}
              <TabPanel 
                p={4} 
                flex={1} 
                overflowY="auto"
                sx={{
                  '&::-webkit-scrollbar': { width: '6px' },
                  '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.2)', borderRadius: '10px' },
                }}
              >
                <VStack spacing={6} align="stretch">
                  <Text fontSize="md" fontWeight="600" color={textColor}>
                    Credit Balance & Usage
                    </Text>
                  <Text fontSize="sm" color={mutedText}>
                    Monitor your WhatsApp messaging credits
                    </Text>
                  <Divider />

                  {credits ? (
                    <>
                      {credits.error && (
                        <Alert status="warning" borderRadius="md" mb={4}>
                          <AlertIcon />
                          <AlertDescription fontSize="sm">
                            Could not load credit information. Showing default values.
                          </AlertDescription>
                          <Button size="xs" ml="auto" onClick={fetchCredits}>
                            Retry
                          </Button>
                        </Alert>
                      )}
                      
                  <SimpleGrid columns={2} spacing={4}>
                    <Stat bg={hoverBg} p={4} borderRadius="md">
                          <StatLabel fontSize="xs" color={mutedText}>Available Credits</StatLabel>
                          <StatNumber fontSize="2xl" color={accentColor}>{credits.balance || 0}</StatNumber>
                          <StatHelpText fontSize="xs">{credits.package?.name || 'Free Tier'}</StatHelpText>
                    </Stat>
                    <Stat bg={hoverBg} p={4} borderRadius="md">
                          <StatLabel fontSize="xs" color={mutedText}>Credits Used</StatLabel>
                          <StatNumber fontSize="2xl" color={textColor}>{credits.usage?.creditsUsed || 0}</StatNumber>
                          <StatHelpText fontSize="xs">Total messages: {credits.usage?.totalMessagesSent || 0}</StatHelpText>
                    </Stat>
                  </SimpleGrid>

                  <Box bg={hoverBg} p={4} borderRadius="md">
                    <Text fontSize="sm" fontWeight="600" color={textColor} mb={3}>
                          Usage Progress
                    </Text>
                        <Progress
                          value={credits.usagePercentage || 0}
                          colorScheme="green"
                          size="sm"
                          borderRadius="full"
                          mb={2}
                        />
                        <Text fontSize="xs" color={mutedText}>
                          {credits.usagePercentage || 0}% of total credits used
                        </Text>
                  </Box>

                      {/* Credit Packages */}
                      <Text fontSize="sm" fontWeight="600" color={textColor} mt={4}>
                        Purchase More Credits
                      </Text>
                      <SimpleGrid columns={2} spacing={3}>
                        {(credits?.creditPackages || [
                          { id: 'starter', name: 'Starter Pack', credits: 500, price: credits?.currency === 'INR' ? '₹50' : '$5.99', currency: credits?.currency || 'INR' },
                          { id: 'professional', name: 'Professional Pack', credits: 2000, price: credits?.currency === 'INR' ? '₹200' : '$23.99', currency: credits?.currency || 'INR' },
                          { id: 'business', name: 'Business Pack', credits: 5000, price: credits?.currency === 'INR' ? '₹500' : '$59.99', currency: credits?.currency || 'INR' },
                          { id: 'enterprise', name: 'Enterprise Pack', credits: 10000, price: credits?.currency === 'INR' ? '₹1000' : '$119.99', currency: credits?.currency || 'INR' },
                        ]).map((pkg) => (
                          <Box
                            key={pkg.id}
                            p={3}
                            bg={bgColor}
                            borderRadius="md"
                            border="1px solid"
                            borderColor={borderColor}
                            _hover={{ borderColor: accentColor }}
                            cursor="pointer"
                            onClick={() => handlePurchaseCredits(pkg)}
                          >
                            <Text fontSize="sm" fontWeight="600" color={textColor}>{pkg.name}</Text>
                            <Text fontSize="xs" color={mutedText}>{pkg.credits} credits</Text>
                            <Text fontSize="md" fontWeight="700" color={accentColor} mt={1}>
                              {pkg.currency === 'INR' ? '₹' : '$'}{pkg.price}
                            </Text>
                          </Box>
                        ))}
                      </SimpleGrid>
                    </>
                  ) : (
                    <Center py={10}>
                      <VStack spacing={3}>
                        <Spinner size="lg" color={accentColor} />
                        <Text fontSize="sm" color={mutedText}>Loading credits...</Text>
                    </VStack>
                    </Center>
                  )}
                </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
                    </Box>

        {/* Right Side - Chat Area */}
        <Box flex={1} display="flex" flexDirection="column" bg={chatBg}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <Box
                p={4}
                bg={useColorModeValue('#f0f2f5', '#2a2f35')}
                borderBottom="1px solid"
                borderColor={borderColor}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <HStack spacing={3}>
                  <IconButton
                    icon={<FiChevronLeft />}
                    variant="ghost"
                    display={{ base: 'flex', md: 'none' }}
                    onClick={() => setSelectedConversation(null)}
                    aria-label="Back"
                  />
                  <Avatar size="md" name={selectedConversation.participantName || selectedConversation.name}>
                    {isWithin24Hours(selectedConversation) && (
                      <AvatarBadge boxSize="1em" bg={primaryGreen} border="2px solid" borderColor={bgColor} />
                    )}
                  </Avatar>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="md" fontWeight="600" color={textColor}>
                      {selectedConversation.participantName || formatPhone(selectedConversation.participantPhone || selectedConversation.phone)}
                                  </Text>
                    <HStack spacing={1}>
                      {isWithin24Hours(selectedConversation) ? (
                        <>
                          <Box w="8px" h="8px" borderRadius="full" bg={primaryGreen} />
                          <Text fontSize="xs" color={mutedText}>Active • Can send messages</Text>
                        </>
                      ) : (
                        <>
                          <FiAlertCircle size={12} color="orange" />
                          <Text fontSize="xs" color="orange.500">Template required for new messages</Text>
                        </>
                      )}
                    </HStack>
                                  </VStack>
                </HStack>
                <HStack>
                  <Tooltip label="Send Template">
                                  <IconButton
                      icon={<FiFileText />}
                  variant="ghost"
                      onClick={onTemplateOpen}
                      aria-label="Send Template"
                />
                  </Tooltip>
                  <IconButton icon={<FiMoreVertical />} variant="ghost" aria-label="More options" />
                </HStack>
                    </Box>

              {/* Messages Area */}
              <Box
                flex={1}
                overflowY="auto"
                p={4}
                bg={chatBg}
                sx={{
                  '&::-webkit-scrollbar': { width: '6px' },
                  '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.2)', borderRadius: '10px' },
                }}
              >
                <VStack spacing={3} align="stretch">
                  {messages.length === 0 ? (
                    <Center py={10}>
                      <VStack spacing={3}>
                        <FiMessageCircle size={48} color={mutedText} />
                        <Text color={mutedText}>No messages yet</Text>
                        <Text fontSize="sm" color={mutedText}>
                          Start the conversation by sending a template message
                        </Text>
                      </VStack>
                    </Center>
                  ) : (
                    messages.map((message, idx) => {
                      const isMe = message.direction === 'outbound' || message.sender === 'me';
                    const isSystem = message.sender === 'system';

                    if (isSystem) {
                      return (
                          <Text key={idx} textAlign="center" fontSize="xs" color={mutedText} py={2}>
                            {message.text || message.content?.text}
                      </Text>
                      );
                    }

                    return (
                        <Flex key={idx} justify={isMe ? 'flex-end' : 'flex-start'}>
                        <Box
                          maxW="65%"
                          px={4}
                          py={2.5}
                          borderRadius={isMe ? "7px 7px 0 7px" : "7px 7px 7px 0"}
                          bg={isMe ? sentMessageBg : receivedMessageBg}
                          boxShadow="0 1px 2px rgba(0, 0, 0, 0.1)"
                          border={isMe ? 'none' : `1px solid ${borderColor}`}
                        >
                            {/* Media content */}
                            {message.content?.mediaUrl && (
                              <Box mb={2}>
                                {message.content.mediaType === 'image' ? (
                                  <Image
                                    src={message.content.mediaUrl}
                                    alt="Media"
                                    borderRadius="md"
                                    maxH="200px"
                                  />
                                ) : message.content.mediaType === 'video' ? (
                                  <video
                                    src={message.content.mediaUrl}
                                    controls
                                    style={{ maxHeight: '200px', borderRadius: '8px' }}
                                  />
                                ) : (
                                  <HStack p={2} bg={hoverBg} borderRadius="md">
                                    <FiFile />
                                    <Text fontSize="sm">Document</Text>
                                  </HStack>
                                )}
                              </Box>
                            )}
                          <Text fontSize="sm" color={textColor} mb={1.5} lineHeight="1.4">
                              {message.text || message.content?.text}
                    </Text>
                            <HStack spacing={1.5} justify="flex-end">
                              <Text fontSize="xs" color={mutedText}>
                                {message.time || (message.sentAt ? new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
                    </Text>
                            {isMe && (
                                <Box color={message.status === 'read' ? accentColor : mutedText}>
                                {message.status === 'read' ? (
                                  <HStack spacing={-1.5}>
                                    <FiCheck size={14} />
                                    <FiCheck size={14} />
                </HStack>
                                  ) : message.status === 'delivered' ? (
                                  <HStack spacing={-1.5}>
                                    <FiCheck size={14} />
                                    <FiCheck size={14} />
                </HStack>
                                ) : (
                                  <FiCheck size={14} />
                                )}
                  </Box>
                )}
                          </HStack>
                        </Box>
                      </Flex>
                    );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </VStack>
              </Box>

              {/* Message Input Area */}
              <Box
                p={4}
                bg={useColorModeValue('#f0f2f5', '#2a2f35')}
                borderTop="1px solid"
                borderColor={borderColor}
              >
                {/* 24hr window warning */}
                {!isWithin24Hours(selectedConversation) && (
                  <Alert status="warning" mb={3} borderRadius="md" py={2}>
                    <AlertIcon />
                    <AlertDescription fontSize="sm">
                      Outside 24-hour window. Use a template to start a new conversation.
                    </AlertDescription>
                    <Button size="sm" ml="auto" colorScheme="orange" onClick={onTemplateOpen}>
                      Use Template
                    </Button>
                  </Alert>
                )}
                <HStack spacing={2}>
                  <Tooltip label="Attach Media">
                  <IconButton
                    icon={<FiPaperclip />}
                    variant="ghost"
                      onClick={onMediaOpen}
                    aria-label="Attach file"
                  />
                  </Tooltip>
                    <Input
                    ref={messageInputRef}
                    placeholder={isWithin24Hours(selectedConversation) ? "Type a message" : "Use template to send message"}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    bg={hoverBg}
                    border="none"
                    borderRadius="full"
                    _focus={{ bg: bgColor, border: '1px solid', borderColor: accentColor }}
                    fontSize="sm"
                    isDisabled={!isWithin24Hours(selectedConversation)}
                  />
                  <IconButton
                    icon={sendingMessage ? <Spinner size="sm" /> : <FiSend />}
                    bg={accentColor}
                    color="white"
              onClick={handleSendMessage}
                    isDisabled={!messageInput.trim() || sendingMessage || !isWithin24Hours(selectedConversation)}
                    borderRadius="full"
                    _hover={{ bg: primaryGreen }}
                    aria-label="Send message"
                  />
                </HStack>
              </Box>
            </>
          ) : (
            <Center flex={1} bg={chatBg}>
              <VStack spacing={4}>
                <Box p={8} borderRadius="full" bg={bgColor}>
                  <FiMessageCircle size={64} color={mutedText} />
                </Box>
                <Text fontSize="xl" color={mutedText} fontWeight="500">
                  Select a conversation to start messaging
                </Text>
                <Text fontSize="sm" color={mutedText}>
                  Choose a contact from the list or start a new conversation
                </Text>
                <Button colorScheme="green" leftIcon={<FiPlus />} onClick={onNewMessageOpen}>
                  New Conversation
                </Button>
              </VStack>
            </Center>
          )}
        </Box>
      </Flex>

      {/* New Message Modal */}
      <Modal 
        isOpen={isNewMessageOpen} 
        onClose={() => {
          onNewMessageClose();
          setLeadSearchQuery('');
          setLeadSearchResults([]);
          setSelectedLead(null);
          setNewMessageRecipient('');
          setSelectedTemplate(null);
        }} 
        isCentered 
        size="md"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Conversation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  To start a new conversation, use a template message. Free-form messages are only allowed within 24 hours of the last customer response.
                </AlertDescription>
              </Alert>
              
              {/* Lead Search with Debounce */}
              <FormControl>
                <FormLabel>Search Lead / Enter Phone Number</FormLabel>
                <Box position="relative">
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      {isSearchingLeads ? <Spinner size="sm" /> : <FiSearch color="gray" />}
                    </InputLeftElement>
                    <Input
                      placeholder="Search by name, email, or phone..."
                      value={selectedLead ? `${selectedLead.name} (${selectedLead.phone})` : leadSearchQuery}
                      onChange={(e) => {
                        if (selectedLead) {
                          setSelectedLead(null);
                          setNewMessageRecipient('');
                        }
                        handleLeadSearchChange(e.target.value);
                      }}
                      onFocus={() => {
                        if (selectedLead) {
                          setSelectedLead(null);
                          setLeadSearchQuery('');
                        }
                      }}
                    />
                  </InputGroup>
                  
                  {/* Search Results Dropdown */}
                  {leadSearchResults.length > 0 && !selectedLead && (
                    <Box
                      position="absolute"
                      top="100%"
                      left={0}
                      right={0}
                      bg={bgColor}
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="md"
                      mt={1}
                      maxH="200px"
                      overflowY="auto"
                      zIndex={1000}
                      boxShadow="lg"
                    >
                      {leadSearchResults.map((lead, idx) => (
                        <Box
                          key={lead._id || idx}
                          p={3}
                          cursor="pointer"
                          _hover={{ bg: hoverBg }}
                          borderBottom={idx < leadSearchResults.length - 1 ? '1px solid' : 'none'}
                          borderColor={borderColor}
                          onClick={() => {
                            setSelectedLead(lead);
                            setNewMessageRecipient(lead.phone);
                            setLeadSearchQuery('');
                            setLeadSearchResults([]);
                          }}
                        >
                          <HStack spacing={3}>
                            <Avatar size="sm" name={lead.name} />
                            <VStack align="start" spacing={0} flex={1}>
                              <Text fontSize="sm" fontWeight="600">{lead.name || 'Unknown'}</Text>
                              <HStack spacing={2}>
                                <FiPhone size={10} />
                                <Text fontSize="xs" color={mutedText}>{lead.phone}</Text>
                              </HStack>
                              {lead.email && (
                                <Text fontSize="xs" color={mutedText}>{lead.email}</Text>
                              )}
                            </VStack>
                            {lead.status && (
                              <Badge colorScheme={lead.status === 'active' ? 'green' : 'gray'} fontSize="10px">
                                {lead.status}
                              </Badge>
                            )}
                          </HStack>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
                <Text fontSize="xs" color={mutedText} mt={1}>
                  Type at least 2 characters to search leads, or enter phone number directly
                </Text>
              </FormControl>

              {/* Manual phone number entry if no lead selected */}
              {!selectedLead && leadSearchQuery.length >= 2 && leadSearchResults.length === 0 && !isSearchingLeads && (
                <FormControl>
                  <FormLabel>Or enter phone number manually</FormLabel>
                  <Input
                    placeholder="+1234567890"
                    value={newMessageRecipient}
                    onChange={(e) => setNewMessageRecipient(e.target.value)}
                  />
                </FormControl>
              )}

              {/* Selected Lead Display */}
              {selectedLead && (
                <Box w="100%" p={3} bg={accentColor + '15'} borderRadius="md">
                  <HStack justify="space-between">
                    <HStack spacing={3}>
                      <Avatar size="sm" name={selectedLead.name} />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="600">{selectedLead.name}</Text>
                        <Text fontSize="xs" color={mutedText}>{selectedLead.phone}</Text>
                      </VStack>
                    </HStack>
                    <IconButton
                      icon={<FiX />}
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedLead(null);
                        setNewMessageRecipient('');
                        setLeadSearchQuery('');
                      }}
                      aria-label="Clear selection"
                    />
                  </HStack>
                </Box>
              )}

              {/* Template Selection */}
              <FormControl>
                <FormLabel>Select Template</FormLabel>
                <Select
                  placeholder="Choose a template"
                  value={selectedTemplate?.templateId || selectedTemplate?._id || ''}
                  onChange={(e) => {
                    const template = templates.find(t => (t.templateId || t._id) === e.target.value);
                    setSelectedTemplate(template);
                  }}
                >
                  {templates.filter(t => t.status === 'APPROVED').map((template) => (
                    <option key={template.templateId || template._id} value={template.templateId || template._id}>
                      {template.templateName || template.name} ({template.category})
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Template Preview */}
              {selectedTemplate && (
                <Box w="100%" p={3} bg={hoverBg} borderRadius="md" border="1px solid" borderColor={borderColor}>
                  <Text fontSize="xs" fontWeight="600" color={mutedText} mb={1}>Template Preview:</Text>
                  <Text fontSize="sm" color={textColor} whiteSpace="pre-wrap">
                    {selectedTemplate.components?.find(c => c.type === 'BODY')?.text || 'No preview available'}
                  </Text>
                  {(selectedTemplate.parameterCount > 0 || selectedTemplate.variables?.length > 0) && (
                    <Tag size="sm" mt={2} colorScheme="orange">
                      {selectedTemplate.parameterCount || selectedTemplate.variables?.length || 0} parameters required
                    </Tag>
                  )}
                </Box>
              )}

              {/* Dynamic Template Variable Inputs */}
              {selectedTemplate && (selectedTemplate.parameterCount > 0 || selectedTemplate.variables?.length > 0) && (
                <Box w="100%" p={3} bg={bgColor} borderRadius="md" border="1px solid" borderColor={accentColor}>
                  <Text fontSize="sm" fontWeight="600" color={textColor} mb={3}>
                    Fill Template Variables
                  </Text>
                  <VStack spacing={3} align="stretch">
                    {/* If we have named variables, show them */}
                    {selectedTemplate.variables?.length > 0 ? (
                      selectedTemplate.variables.map((variable, idx) => (
                        <FormControl key={variable.index || idx}>
                          <FormLabel fontSize="sm">
                            Variable {variable.index || idx + 1}: <Badge colorScheme="blue" ml={1}>{variable.placeholder || `{{${variable.index || idx + 1}}}`}</Badge>
                          </FormLabel>
                          <Input
                            placeholder={`Enter value for ${variable.placeholder || `{{${variable.index || idx + 1}}}`}`}
                            size="sm"
                            value={templateParams[variable.index || idx + 1] || ''}
                            onChange={(e) => {
                              setTemplateParams(prev => ({
                                ...prev,
                                [variable.index || idx + 1]: e.target.value
                              }));
                            }}
                          />
                          {variable.type && (
                            <Text fontSize="xs" color={mutedText} mt={1}>
                              Type: {variable.type} | Location: {variable.componentType || 'body'}
                            </Text>
                          )}
                        </FormControl>
                      ))
                    ) : (
                      /* Fallback: create inputs based on parameterCount */
                      Array.from({ length: selectedTemplate.parameterCount || 0 }, (_, idx) => (
                        <FormControl key={idx}>
                          <FormLabel fontSize="sm">
                            Variable {idx + 1}: <Badge colorScheme="blue" ml={1}>{`{{${idx + 1}}}`}</Badge>
                          </FormLabel>
                          <Input
                            placeholder={`Enter value for {{${idx + 1}}}`}
                            size="sm"
                            value={templateParams[idx + 1] || ''}
                            onChange={(e) => {
                              setTemplateParams(prev => ({
                                ...prev,
                                [idx + 1]: e.target.value
                              }));
                            }}
                          />
                        </FormControl>
                      ))
                    )}
                  </VStack>
                  <Text fontSize="xs" color={mutedText} mt={3}>
                    💡 Variables replace placeholders like {"{{1}}"}, {"{{2}}"} in the template
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => {
              onNewMessageClose();
              setLeadSearchQuery('');
              setLeadSearchResults([]);
              setSelectedLead(null);
              setNewMessageRecipient('');
              setSelectedTemplate(null);
            }}>Cancel</Button>
            <Button
              colorScheme="green"
              isLoading={sendingMessage}
              isDisabled={!newMessageRecipient || !selectedTemplate}
              onClick={() => {
                handleSendTemplate();
                setLeadSearchQuery('');
                setLeadSearchResults([]);
                setSelectedLead(null);
              }}
            >
              Send Template
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Template Selection Modal */}
      <Modal isOpen={isTemplateOpen} onClose={onTemplateClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent maxH="80vh">
          <ModalHeader>Send Template Message</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto">
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color={mutedText}>
                Select a template to send to {selectedConversation?.participantName || formatPhone(selectedConversation?.participantPhone)}
              </Text>
              
              {/* Template Selection */}
              <Box maxH="250px" overflowY="auto" pr={2}>
                {templates.filter(t => t.status === 'APPROVED').map((template) => (
                  <Box
                    key={template.templateId || template._id}
                    p={4}
                    mb={2}
                    bg={(selectedTemplate?.templateId || selectedTemplate?.name) === (template.templateId || template.name) ? accentColor + '20' : hoverBg}
                    borderRadius="md"
                    border="2px solid"
                    borderColor={(selectedTemplate?.templateId || selectedTemplate?.name) === (template.templateId || template.name) ? accentColor : 'transparent'}
                    cursor="pointer"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setTemplateParams({}); // Reset params when switching templates
                    }}
                    _hover={{ borderColor: accentColor }}
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="600">{template.templateName || template.name}</Text>
                      <HStack spacing={2}>
                        {(template.parameterCount > 0 || template.variables?.length > 0) && (
                          <Badge colorScheme="orange" fontSize="10px">
                            {template.parameterCount || template.variables?.length} vars
                          </Badge>
                        )}
                        {(selectedTemplate?.templateId || selectedTemplate?.name) === (template.templateId || template.name) && (
                          <FiCheckCircle color={accentColor} />
                        )}
                      </HStack>
                    </HStack>
                    <Text fontSize="xs" color={mutedText} noOfLines={2}>
                      {template.components?.find(c => c.type === 'BODY')?.text || 'No preview available'}
                    </Text>
                  </Box>
                ))}
              </Box>

              {/* Variable Input Fields for Selected Template */}
              {selectedTemplate && (selectedTemplate.parameterCount > 0 || selectedTemplate.variables?.length > 0) && (
                <Box p={4} bg={bgColor} borderRadius="md" border="1px solid" borderColor={accentColor}>
                  <Text fontSize="sm" fontWeight="600" color={textColor} mb={3}>
                    Fill Template Variables for "{selectedTemplate.templateName || selectedTemplate.name}"
                  </Text>
                  <VStack spacing={3} align="stretch">
                    {/* If we have named variables, show them */}
                    {selectedTemplate.variables?.length > 0 ? (
                      selectedTemplate.variables.map((variable, idx) => (
                        <FormControl key={variable.index || idx}>
                          <FormLabel fontSize="sm">
                            Variable {variable.index || idx + 1}: <Badge colorScheme="blue" ml={1}>{variable.placeholder || `{{${variable.index || idx + 1}}}`}</Badge>
                          </FormLabel>
                          <Input
                            placeholder={`Enter value for ${variable.placeholder || `{{${variable.index || idx + 1}}}`}`}
                            size="sm"
                            value={templateParams[variable.index || idx + 1] || ''}
                            onChange={(e) => {
                              setTemplateParams(prev => ({
                                ...prev,
                                [variable.index || idx + 1]: e.target.value
                              }));
                            }}
                          />
                        </FormControl>
                      ))
                    ) : (
                      /* Fallback: create inputs based on parameterCount */
                      Array.from({ length: selectedTemplate.parameterCount || 0 }, (_, idx) => (
                        <FormControl key={idx}>
                          <FormLabel fontSize="sm">
                            Variable {idx + 1}: <Badge colorScheme="blue" ml={1}>{`{{${idx + 1}}}`}</Badge>
                          </FormLabel>
                          <Input
                            placeholder={`Enter value for {{${idx + 1}}}`}
                            size="sm"
                            value={templateParams[idx + 1] || ''}
                            onChange={(e) => {
                              setTemplateParams(prev => ({
                                ...prev,
                                [idx + 1]: e.target.value
                              }));
                            }}
                          />
                        </FormControl>
                      ))
                    )}
                  </VStack>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => {
              onTemplateClose();
              setSelectedTemplate(null);
              setTemplateParams({});
            }}>Cancel</Button>
            <Button
              colorScheme="green"
              isLoading={sendingMessage}
              isDisabled={!selectedTemplate}
              onClick={handleSendTemplate}
            >
              Send Template
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Media Upload Modal */}
      <Modal isOpen={isMediaOpen} onClose={onMediaClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send Media</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Media Type</FormLabel>
                <Select value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Media URL</FormLabel>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Caption (optional)</FormLabel>
                <Textarea
                  placeholder="Add a caption..."
                  value={mediaCaption}
                  onChange={(e) => setMediaCaption(e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onMediaClose}>Cancel</Button>
            <Button
              colorScheme="green"
              isLoading={sendingMessage}
              isDisabled={!mediaUrl}
              onClick={handleSendMedia}
            >
              Send Media
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Email Compose Modal */}
      <Modal isOpen={isEmailComposeOpen} onClose={onEmailComposeClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <FiMail color={primaryBlue} />
              <Text>Compose Email</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {!emailConfig && (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    Email configuration may not be set up. Contact your administrator if you encounter issues.
                  </AlertDescription>
                </Alert>
              )}
              <FormControl isRequired>
                <FormLabel>To</FormLabel>
                <Input
                  type="email"
                  placeholder="recipient@example.com"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Subject</FormLabel>
                <Input
                  placeholder="Email subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Message</FormLabel>
                <Textarea
                  placeholder="Write your email message here..."
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  minH="200px"
                  resize="vertical"
                />
              </FormControl>
              <HStack w="100%" justify="space-between" pt={2}>
                <Text fontSize="xs" color={mutedText}>
                  1 credit per email sent
                </Text>
                {credits && (
                  <Tag colorScheme="blue" size="sm">
                    Balance: {credits.balance} credits
                  </Tag>
                )}
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEmailComposeClose}>Cancel</Button>
            <Button
              colorScheme="blue"
              leftIcon={<FiSend />}
              isLoading={sendingMessage}
              isDisabled={!emailRecipient || !emailSubject || !emailBody}
              onClick={handleSendEmail}
            >
              Send Email
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MessagingDashboard;
