// Marketing & Ads Dashboard - Professional Redesign with Graphs & Meta OAuth
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  Box, Container, Flex, Grid, Text, Button, Input, Select, Textarea,
  FormControl, FormLabel, FormHelperText, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalCloseButton, ModalFooter, useDisclosure,
  Card, CardBody, CardHeader, Stat, StatLabel, StatNumber, StatHelpText, StatArrow,
  Badge, IconButton, Tabs, TabList, TabPanels, Tab, TabPanel,
  VStack, HStack, Divider, SimpleGrid, useToast, Spinner, Progress,
  Alert, AlertIcon, AlertTitle, AlertDescription, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Tooltip as ChakraTooltip, useColorModeValue, Switch, InputGroup, InputLeftElement,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  List, ListItem, ListIcon, Heading, Stack, Center, Skeleton, SkeletonText,
  Menu, MenuButton, MenuList, MenuItem
} from '@chakra-ui/react';
import {
  FiPlus, FiRefreshCw, FiPlay, FiPause, FiBarChart2, FiTarget, FiImage,
  FiSettings, FiTrendingUp, FiDollarSign, FiUsers, FiEye, FiMousePointer,
  FiZap, FiEdit3, FiTrash2, FiDownload, FiCopy, FiExternalLink, FiChevronRight,
  FiFilter, FiSearch, FiCalendar, FiCheckCircle, FiXCircle, FiAlertTriangle,
  FiKey, FiShield, FiStar, FiCpu, FiLayers, FiActivity, FiAward,
  FiArrowUp, FiArrowDown, FiMoreVertical, FiShare2, FiClock, FiLink, FiChevronDown,
  FiX, FiInfo
} from 'react-icons/fi';
import {
  CheckCircleIcon, WarningIcon, InfoIcon, CloseIcon
} from '@chakra-ui/icons';
import { getAuthHeaders, getCoachId, getToken } from '../../utils/authUtils';
import { API_BASE_URL } from '../../config/apiConfig';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Use API_BASE_URL from config (localhost:8080 in dev, api.funnelseye.com in production)
const BASE_URL = API_BASE_URL;

// Custom Toast Hook - Fixed Width (Similar to Calendar Page)
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

    const config = statusConfig[status] || statusConfig.success;
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
      render: ({ title, description, onClose }) => (
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
          w="400px"
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
              {title}
            </Text>
            <Text
              fontSize="sm"
              color={config.textColor}
              lineHeight="1.5"
            >
              {description}
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

// Stats Card Component (Similar to Calendar Page)
const StatsCard = ({ title, value, icon, color = "blue", change, changeType }) => {
  const cardBgColor = useColorModeValue(`${color}.50`, `${color}.900`);
  const cardBorderColor = useColorModeValue(`${color}.200`, `${color}.700`);
  const iconBg = useColorModeValue(`${color}.100`, `${color}.800`);
  const iconColor = useColorModeValue(`${color}.600`, `${color}.300`);
  
  return (
    <Card 
      bg={cardBgColor} 
      border="1px" 
      borderColor={cardBorderColor}
      borderRadius="7px"
      _hover={{ borderColor: `${color}.300`, boxShadow: 'sm' }}
      transition="all 0.2s"
      boxShadow="none"
      flex="1"
    >
      <CardBody p={4}>
        <HStack spacing={3} align="center">
          <Box
            p={2.5}
            bg={iconBg}
            borderRadius="7px"
            color={iconColor}
          >
            {icon}
          </Box>
          <VStack align="start" spacing={0} flex={1}>
            <Text fontSize="xs" color={`${color}.600`} fontWeight="600" textTransform="uppercase" letterSpacing="0.5px">
              {title}
            </Text>
            <HStack spacing={2} align="baseline">
              <Text fontSize="xl" fontWeight="700" color={`${color}.800`}>
                {value}
              </Text>
              {change && (
                <Stat>
                  <StatHelpText m={0}>
                    <StatArrow type={changeType === 'increase' ? 'increase' : 'decrease'} />
                    {change}
                  </StatHelpText>
                </Stat>
              )}
            </HStack>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  );
};

const MarketingAds = () => {
  const authState = useSelector(state => state.auth);
  const token = getToken(authState);
  const coachId = getCoachId(authState);
  const showToast = useCustomToast();
  
  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  
  // Main state
  const [loading, setLoading] = useState(false);
  const [credentialsStatus, setCredentialsStatus] = useState(null);
  const [detailedCredentials, setDetailedCredentials] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [funnels, setFunnels] = useState([]);
  const [aiDashboard, setAiDashboard] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [tabIndex, setTabIndex] = useState(0);
  
  // Currency options
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' }
  ];
  
  // Modals
  const { isOpen: isCredentialsOpen, onOpen: onCredentialsOpen, onClose: onCredentialsClose } = useDisclosure();
  const { isOpen: isMetaOAuthOpen, onOpen: onMetaOAuthOpen, onClose: onMetaOAuthClose } = useDisclosure();
  const { isOpen: isCreateCampaignOpen, onOpen: onCreateCampaignOpen, onClose: onCreateCampaignClose } = useDisclosure();
  const { isOpen: isAICopyOpen, onOpen: onAICopyOpen, onClose: onAICopyClose } = useDisclosure();
  const { isOpen: isCampaignDetailsOpen, onOpen: onCampaignDetailsOpen, onClose: onCampaignDetailsClose } = useDisclosure();
  const { isOpen: isOAuthErrorOpen, onOpen: onOAuthErrorOpen, onClose: onOAuthErrorClose } = useDisclosure();
  const { isOpen: isOAuthSuccessOpen, onOpen: onOAuthSuccessOpen, onClose: onOAuthSuccessClose } = useDisclosure();
  
  // OAuth status state
  const [oauthStatus, setOAuthStatus] = useState({ type: null, message: null });
  
  // Form states
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    objective: 'CONVERSIONS',
    budget: 50,
    targetAudience: '',
    productInfo: '',
    funnelId: '',
    funnelUrl: '',
    useAI: true,
    // New fields for progressive form
    adTitle: '',
    adDescription: '',
    adImageUrl: '',
    callToAction: 'LEARN_MORE',
    targeting: {
      ageMin: 18,
      ageMax: 65,
      genders: [],
      locations: [],
      interests: []
    },
    schedule: {
      startDate: null,
      endDate: null
    },
    aiSuggestions: {
      titles: [],
      descriptions: [],
      selectedTitle: '',
      selectedDescription: ''
    }
  });
  
  // Progressive form state
  const [currentStep, setCurrentStep] = useState(1);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  const [aiCopyForm, setAiCopyForm] = useState({
    targetAudience: '',
    productInfo: '',
    campaignObjective: 'CONVERSIONS'
  });
  
  const [generatedContent, setGeneratedContent] = useState(null);
  
  // API Helper
  const makeRequest = useCallback(async (endpoint, options = {}) => {
    const headers = getAuthHeaders(authState);
    if (!headers) {
      showToast('Please log in to continue', 'error');
      return null;
    }
    
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Extract detailed error message from response
        let errorMessage = data.message || data.error || `Request failed: ${response.status}`;
        
        // If there's a detailed error object, use it
        if (data.error && typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (data.details?.error?.error_user_msg) {
          errorMessage = data.details.error.error_user_msg;
        } else if (data.details?.error?.error_user_title) {
          errorMessage = data.details.error.error_user_title;
        } else if (data.details?.error?.message) {
          errorMessage = data.details.error.message;
        } else if (data.error?.error_user_msg) {
          errorMessage = data.error.error_user_msg;
        } else if (data.error?.error_user_title) {
          errorMessage = data.error.error_user_title;
        } else if (data.error?.message) {
          errorMessage = data.error.message;
        }
        
        // Create error object with full details
        const error = new Error(errorMessage);
        error.response = data;
        error.status = response.status;
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      
      // Extract the best error message to show
      let errorMessage = error.message || 'An error occurred';
      
      // If error has response data, try to extract better message
      if (error.response) {
        const responseData = error.response;
        
        // Check for Meta API error messages (user-friendly)
        if (responseData.error?.error_user_msg) {
          errorMessage = responseData.error.error_user_msg;
        } else if (responseData.error?.error_user_title) {
          errorMessage = responseData.error.error_user_title;
        } else if (responseData.error?.message) {
          errorMessage = responseData.error.message;
        } else if (responseData.error && typeof responseData.error === 'string') {
          errorMessage = responseData.error;
        } else if (responseData.details?.error?.error_user_msg) {
          errorMessage = responseData.details.error.error_user_msg;
        } else if (responseData.details?.error?.error_user_title) {
          errorMessage = responseData.details.error.error_user_title;
        } else if (responseData.details?.error?.message) {
          errorMessage = responseData.details.error.message;
        }
      }
      
      showToast(errorMessage, 'error', 10000); // Show for 10 seconds for detailed errors
      return null;
    }
  }, [authState, showToast]);
  
  // ===== CREDENTIALS MANAGEMENT =====
  
  const fetchCredentialsStatus = useCallback(async () => {
    try {
      console.log('[MetaOAuth] Fetching credentials status...');
    const data = await makeRequest('/api/marketing/v1/credentials/status');
    if (data?.success) {
        console.log('[MetaOAuth] Credentials status received:', data.data);
      setCredentialsStatus(data.data);
        return data.data;
      } else {
        console.warn('[MetaOAuth] Failed to fetch credentials status:', data);
      }
    } catch (error) {
      console.error('[MetaOAuth] Error fetching credentials status:', error);
    }
  }, [makeRequest]);

  const fetchDetailedCredentials = useCallback(async () => {
    try {
      const data = await makeRequest('/api/marketing/v1/credentials/meta/detailed');
      if (data?.success) {
        setDetailedCredentials(data.data);
        return data.data;
      }
    } catch (error) {
      console.error('Error fetching detailed credentials:', error);
    }
  }, [makeRequest]);

  const disconnectMeta = useCallback(async () => {
    if (!window.confirm('Are you sure you want to disconnect your Meta account? This will prevent you from creating campaigns until you reconnect.')) {
      return;
    }
    
    setLoading(true);
    try {
      const data = await makeRequest('/api/marketing/v1/credentials/meta', {
        method: 'DELETE'
      });
      
      if (data?.success) {
        showToast('Meta account disconnected successfully', 'success');
        setDetailedCredentials(null);
        await fetchCredentialsStatus();
        onCredentialsClose();
      } else {
        showToast(data?.message || 'Failed to disconnect Meta account', 'error');
      }
    } catch (error) {
      console.error('Error disconnecting Meta:', error);
      showToast('Failed to disconnect Meta account', 'error');
    } finally {
      setLoading(false);
    }
  }, [makeRequest, showToast, fetchCredentialsStatus, onCredentialsClose]);
  
  // Meta OAuth Flow
  const initiateMetaOAuth = useCallback(async () => {
    setLoading(true);
    try {
      // Get OAuth URL from backend
      const data = await makeRequest('/api/marketing/v1/credentials/meta/oauth/initiate', {
      method: 'POST',
        body: JSON.stringify({})
      });
      
      if (data?.success && data.data?.authUrl) {
        // Close modal before redirect
        onMetaOAuthClose();
        // Redirect to Meta OAuth
        window.location.href = data.data.authUrl;
      } else {
        showToast(data?.message || 'Failed to initiate Meta OAuth', 'error');
        setLoading(false);
      }
    } catch (error) {
      console.error('Meta OAuth initiation error:', error);
      showToast(error.message || 'Failed to initiate Meta OAuth', 'error');
    setLoading(false);
    }
  }, [makeRequest, showToast, onMetaOAuthClose]);
  
  // Handle OAuth callback (if redirected back from Meta)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for success/error from backend redirect
    const metaConnected = urlParams.get('meta_connected');
    const metaError = urlParams.get('meta_error');
    
    if (metaConnected === 'true') {
      console.log('[MetaOAuth] Connection successful');
      setOAuthStatus({ type: 'success', message: 'Meta account connected successfully!' });
      onOAuthSuccessOpen();
      
      // Clean URL first
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Wait a bit for backend to finish saving, then fetch status
      if (token && coachId) {
        setTimeout(() => {
          console.log('[MetaOAuth] Fetching credentials status after delay...');
          fetchCredentialsStatus().then(() => {
            console.log('[MetaOAuth] Credentials status fetched');
          }).catch(err => {
            console.error('[MetaOAuth] Error fetching credentials status:', err);
          });
        }, 1000);
        
        // Also fetch immediately
      fetchCredentialsStatus();
      }
    } else if (metaError) {
      const decodedError = decodeURIComponent(metaError);
      console.error('[MetaOAuth] Connection failed:', decodedError);
      
      // Parse error message for better display
      let errorTitle = 'Connection Failed';
      let errorMessage = decodedError;
      
      if (decodedError.includes('validation failed')) {
        errorTitle = 'Validation Error';
        errorMessage = 'There was an issue saving your credentials. Please try again.';
      } else if (decodedError.includes('missing_parameters')) {
        errorTitle = 'Missing Parameters';
        errorMessage = 'The OAuth callback is missing required parameters. Please try connecting again.';
      } else if (decodedError.includes('invalid_state')) {
        errorTitle = 'Invalid State';
        errorMessage = 'The OAuth state parameter is invalid. Please try connecting again.';
      } else if (decodedError.includes('state_expired')) {
        errorTitle = 'Session Expired';
        errorMessage = 'The OAuth session has expired. Please try connecting again.';
      } else if (decodedError.includes('OAUTH_NOT_CONFIGURED')) {
        errorTitle = 'OAuth Not Configured';
        errorMessage = 'Meta OAuth is not properly configured on the server. Please contact support.';
      }
      
      setOAuthStatus({ type: 'error', title: errorTitle, message: errorMessage });
      onOAuthErrorOpen();
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [token, coachId, showToast, fetchCredentialsStatus, onOAuthSuccessOpen, onOAuthErrorOpen]);
  
  // ===== DASHBOARD DATA =====
  
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    const data = await makeRequest('/api/marketing/v1/dashboard?includeAIInsights=true&includeRecommendations=true');
    if (data?.success) {
      setDashboardData(data.data);
    }
    setLoading(false);
  }, [makeRequest]);
  
  const fetchAIDashboard = useCallback(async () => {
    const data = await makeRequest('/api/ai-ads/dashboard');
    if (data?.success) {
      setAiDashboard(data.data);
    }
  }, [makeRequest]);
  
  // ===== CAMPAIGNS =====
  
  const fetchCampaigns = useCallback(async () => {
    const data = await makeRequest('/api/ads');
    if (data?.success) {
      setCampaigns(data.data || []);
      // Fetch actual performance data from API
      fetchPerformanceData(data.data || []);
    }
  }, [makeRequest]);
  
  const fetchPerformanceData = useCallback(async (campaignsData) => {
    if (!campaignsData || campaignsData.length === 0) {
      setPerformanceData(null);
      return;
    }
    
    // For now, set to null - will be populated when actual analytics API is available
    // This removes dummy data generation
    setPerformanceData(null);
    
    // TODO: When analytics API is ready, fetch actual performance data
    // const insightsPromises = campaignsData.map(campaign => 
    //   makeRequest(`/api/ads/${campaign._id || campaign.id}/analytics`)
    // );
    // const insights = await Promise.all(insightsPromises);
    // ... aggregate and set performance data
  }, [makeRequest]);
  
  // Currency management
  const fetchCurrencyPreference = useCallback(async () => {
    const data = await makeRequest('/api/marketing/v1/preferences/currency');
    if (data?.success && data.data?.currency) {
      setCurrency(data.data.currency);
    }
  }, [makeRequest]);
  
  const saveCurrencyPreference = useCallback(async (newCurrency) => {
    const data = await makeRequest('/api/marketing/v1/preferences/currency', {
      method: 'POST',
      body: JSON.stringify({ currency: newCurrency })
    });
    if (data?.success) {
      setCurrency(newCurrency);
      showToast('Currency preference saved', 'success');
    }
  }, [makeRequest, showToast]);
  
  // Generate AI suggestions for ad copy
  const generateAISuggestions = useCallback(async () => {
    if (!campaignForm.productInfo || !campaignForm.targetAudience) {
      showToast('Please fill in product info and target audience first', 'warning');
      return;
    }
    
    setIsGeneratingAI(true);
    try {
      const data = await makeRequest('/api/marketing/v1/ai/generate-copy', {
        method: 'POST',
        body: JSON.stringify({
          productInfo: campaignForm.productInfo,
          targetAudience: campaignForm.targetAudience,
          campaignObjective: campaignForm.objective,
          tone: 'professional',
          length: 'medium',
          includeCallToAction: true
        })
      });
      
      if (data?.success && data.data) {
        const suggestions = {
          titles: data.data.headlines || [data.data.headline] || [],
          descriptions: data.data.descriptions || [data.data.primaryCopy] || [],
          selectedTitle: '',
          selectedDescription: ''
        };
        
        setCampaignForm(prev => ({
          ...prev,
          aiSuggestions: suggestions,
          adTitle: suggestions.titles[0] || '',
          adDescription: suggestions.descriptions[0] || ''
        }));
        
        showToast('AI suggestions generated successfully!', 'success');
      }
    } catch (error) {
      console.error('[GenerateAISuggestions] Error:', error);
      showToast('Failed to generate AI suggestions', 'error');
    } finally {
      setIsGeneratingAI(false);
    }
  }, [campaignForm.productInfo, campaignForm.targetAudience, campaignForm.objective, makeRequest, showToast]);
  
  const createCampaign = useCallback(async () => {
    // Validate Meta account connection
    if (!credentialsStatus?.meta?.isConnected && !credentialsStatus?.meta?.isConfigured) {
      showToast('Please connect your Meta account first before creating campaigns', 'error');
      onCreateCampaignClose();
      onMetaOAuthOpen();
      return;
    }
    
    // Validate form fields
    if (!campaignForm.name || !campaignForm.objective || !campaignForm.budget) {
      showToast('Please fill in all required fields (name, objective, and budget)', 'error');
      return;
    }
    
    if (!campaignForm.adTitle || !campaignForm.adDescription) {
      showToast('Please add ad title and description', 'error');
      setCurrentStep(3); // Go to creative step
      return;
    }
    
    setLoading(true);
    let endpoint = '/api/ads/create';
    let payload = {
      coachMetaAccountId: credentialsStatus?.meta?.adAccountId || '',
      campaignData: {
        name: campaignForm.name,
        objective: campaignForm.objective,
        dailyBudget: campaignForm.budget,
        budget: campaignForm.budget,
        targetAudience: campaignForm.targetAudience,
        productInfo: campaignForm.productInfo,
        // New fields
        adTitle: campaignForm.adTitle,
        adDescription: campaignForm.adDescription,
        adImageUrl: campaignForm.adImageUrl,
        callToAction: campaignForm.callToAction,
        targeting: campaignForm.targeting,
        schedule: campaignForm.schedule,
        funnelId: campaignForm.funnelId,
        funnelUrl: campaignForm.funnelUrl
      },
      useAI: campaignForm.useAI
    };
    
    try {
    const data = await makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (data?.success) {
      showToast(
        campaignForm.useAI ? 'Your AI-optimized campaign has been created!' : 'Your campaign has been created successfully',
        'success'
      );
      
      // Show testing mode warning if present
      if (data?.warning) {
        setTimeout(() => {
          showToast(
            data.warning,
            'warning',
            10000 // Show for 10 seconds
          );
        }, 1000);
      }
      
      // Handle testing mode restriction error
      if (data?.testingModeRestriction) {
        showToast(
          data.error || 'Campaign creation is limited in testing mode. Please ensure your Meta app is in Live mode for production use.',
          'error',
          12000
        );
        if (data?.suggestion) {
          setTimeout(() => {
            showToast(
              data.suggestion,
              'info',
              10000
            );
          }, 1500);
        }
        return; // Don't close modal or reset form if there's a restriction
      }
      
      onCreateCampaignClose();
        setCurrentStep(1);
      setCampaignForm({
        name: '',
        objective: 'CONVERSIONS',
        budget: 50,
        targetAudience: '',
        productInfo: '',
        funnelId: '',
        funnelUrl: '',
          useAI: true,
          adTitle: '',
          adDescription: '',
          adImageUrl: '',
          callToAction: 'LEARN_MORE',
          targeting: {
            ageMin: 18,
            ageMax: 65,
            genders: [],
            locations: [],
            interests: []
          },
          schedule: {
            startDate: null,
            endDate: null
          },
          aiSuggestions: {
            titles: [],
            descriptions: [],
            selectedTitle: '',
            selectedDescription: ''
          }
      });
      fetchCampaigns();
      fetchDashboardData();
    }
    } catch (error) {
      console.error('[CreateCampaign] Error:', error);
      
      // Extract detailed error message if available
      let errorMessage = 'Failed to create campaign';
      
      if (error.response) {
        const responseData = error.response;
        
        // Check for Meta API error messages (user-friendly)
        if (responseData.error?.error_user_msg) {
          errorMessage = responseData.error.error_user_msg;
        } else if (responseData.error?.error_user_title) {
          errorMessage = responseData.error.error_user_title;
        } else if (responseData.error?.message) {
          errorMessage = responseData.error.message;
        } else if (responseData.error && typeof responseData.error === 'string') {
          errorMessage = responseData.error;
        } else if (responseData.details?.error?.error_user_msg) {
          errorMessage = responseData.details.error.error_user_msg;
        } else if (responseData.details?.error?.message) {
          errorMessage = responseData.details.error.message;
        }
        
        // Show the detailed error message
        showToast(errorMessage, 'error', 10000);
        
        // If it's a permissions error, show additional help
        if (errorMessage.includes("doesn't have permission") || errorMessage.includes('permission')) {
          setTimeout(() => {
            showToast(
              'Please ensure your Meta account has Ads Management permissions and access to the ad account.',
              'info',
              12000
            );
          }, 1500);
        }
      } else {
        // Fallback to generic error
        showToast(error.message || errorMessage, 'error');
      }
    } finally {
    setLoading(false);
    }
  }, [campaignForm, credentialsStatus, makeRequest, showToast, onCreateCampaignClose, onMetaOAuthOpen, fetchCampaigns, fetchDashboardData]);
  
  const pauseCampaign = useCallback(async (campaignId) => {
    const data = await makeRequest(`/api/ads/${campaignId}/pause`, {
      method: 'POST'
    });
    
    if (data?.success) {
      showToast('Campaign paused successfully', 'success');
      fetchCampaigns();
    }
  }, [makeRequest, showToast, fetchCampaigns]);
  
  const resumeCampaign = useCallback(async (campaignId) => {
    const data = await makeRequest(`/api/ads/${campaignId}/resume`, {
      method: 'POST'
    });
    
    if (data?.success) {
      showToast('Campaign resumed successfully', 'success');
      fetchCampaigns();
    }
  }, [makeRequest, showToast, fetchCampaigns]);
  
  const optimizeCampaign = useCallback(async (campaignId) => {
    setLoading(true);
    const data = await makeRequest(`/api/ai-ads/auto-optimize/${campaignId}`, {
      method: 'POST'
    });
    
    if (data?.success) {
      showToast('AI has optimized your campaign settings', 'success');
      fetchCampaigns();
      fetchDashboardData();
    }
    setLoading(false);
  }, [makeRequest, showToast, fetchCampaigns, fetchDashboardData]);
  
  // ===== AI FEATURES =====
  
  const generateAICopy = useCallback(async () => {
    setLoading(true);
    const data = await makeRequest('/api/ai-ads/generate-copy', {
      method: 'POST',
      body: JSON.stringify({
        targetAudience: aiCopyForm.targetAudience,
        productInfo: aiCopyForm.productInfo,
        campaignObjective: aiCopyForm.campaignObjective
      })
    });
    
    if (data?.success) {
      setGeneratedContent(data.data);
      showToast('Your ad copy has been generated successfully', 'success');
    }
    setLoading(false);
  }, [aiCopyForm, makeRequest, showToast]);
  
  // ===== FUNNELS =====
  
  const fetchFunnels = useCallback(async () => {
    if (!coachId) return;
    const data = await makeRequest(`/api/funnels/coach/${coachId}/funnels`);
    if (data?.success) {
      setFunnels(data.data || []);
    }
  }, [coachId, makeRequest]);
  
  // ===== INITIAL LOAD =====
  
  useEffect(() => {
    if (token && coachId) {
      fetchCredentialsStatus();
      fetchDashboardData();
      fetchCampaigns();
      fetchFunnels();
      fetchAIDashboard();
      fetchCurrencyPreference();
    }
  }, [token, coachId, fetchCredentialsStatus, fetchDashboardData, fetchCampaigns, fetchFunnels, fetchAIDashboard, fetchCurrencyPreference]);

  // Fetch detailed credentials when settings modal opens
  useEffect(() => {
    if (isCredentialsOpen && token && coachId) {
      fetchDetailedCredentials();
    }
  }, [isCredentialsOpen, token, coachId, fetchDetailedCredentials]);
  
  // Get currency symbol
  const currencySymbol = useMemo(() => {
    const curr = currencies.find(c => c.code === currency);
    return curr?.symbol || '$';
  }, [currency]);
  
  // Calculate stats
  const totalSpend = useMemo(() => campaigns.reduce((sum, c) => sum + (parseFloat(c.totalSpent) || 0), 0), [campaigns]);
  const totalImpressions = useMemo(() => campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0), [campaigns]);
  const totalClicks = useMemo(() => campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0), [campaigns]);
  const totalConversions = useMemo(() => campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0), [campaigns]);
  const activeCampaigns = useMemo(() => campaigns.filter(c => c.status === 'ACTIVE').length, [campaigns]);
  const avgCTR = useMemo(() => totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00', [totalClicks, totalImpressions]);
  const avgCPC = useMemo(() => totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : '0.00', [totalSpend, totalClicks]);
  
  // Chart data
  const performanceChartData = useMemo(() => {
    if (!performanceData) return null;
    
    return {
      labels: performanceData.labels,
      datasets: [
        {
          label: 'Impressions',
          data: performanceData.impressions,
          borderColor: 'rgb(102, 126, 234)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Clicks',
          data: performanceData.clicks,
          borderColor: 'rgb(118, 75, 162)',
          backgroundColor: 'rgba(118, 75, 162, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }, [performanceData]);
  
  const spendChartData = useMemo(() => {
    if (!performanceData) return null;
    
    return {
      labels: performanceData.labels,
      datasets: [
        {
          label: `Spend (${currencySymbol})`,
          data: performanceData.spend,
          borderColor: 'rgb(237, 137, 54)',
          backgroundColor: 'rgba(237, 137, 54, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Conversions',
          data: performanceData.conversions,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };
  }, [performanceData]);
  
  const gridColor = useColorModeValue('rgba(0, 0, 0, 0.05)', 'rgba(255, 255, 255, 0.05)');
  
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  }), [gridColor]);
  
  return (
    <Box bg={bgColor} minH="100vh" py={6} px={6} w="100%">
        {/* Header Section - Elegant & Minimal */}
        <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
          <VStack align="start" spacing={1}>
            <HStack spacing={3} align="center">
              <Heading size="lg" fontWeight="700" color="black">
              Marketing & Ads
            </Heading>
              {(credentialsStatus?.meta?.isConnected || credentialsStatus?.meta?.isConfigured) && (
                <HStack spacing={1} align="center">
                  <Box
                    as={CheckCircleIcon}
                    color="green.500"
                    boxSize={5}
                    title="Meta Account Connected"
                  />
                  <Text fontSize="sm" color="green.600" fontWeight="500">
                    Meta Account Connected
                  </Text>
                </HStack>
              )}
            </HStack>
            <Text color={mutedTextColor} fontSize="sm">
              AI-Powered Campaign Management & Analytics
                  </Text>
          </VStack>
          <HStack spacing={3}>
            {/* Currency Selector - Professional Menu Dropdown */}
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<FiChevronDown />}
              size="sm"
                w="140px"
              borderRadius="7px"
              borderColor={borderColor}
                borderWidth="1px"
                bg={cardBg}
                color={textColor}
                _hover={{
                  bg: useColorModeValue('gray.50', 'gray.700'),
                  borderColor: 'blue.500'
                }}
                _active={{
                  bg: useColorModeValue('gray.100', 'gray.600'),
                  borderColor: 'blue.500'
                }}
                _focus={{
                  borderColor: 'blue.500',
                  boxShadow: '0 0 0 1px blue.500'
                }}
                transition="all 0.2s"
              >
                {currencySymbol} {currency}
              </MenuButton>
              <MenuList
                borderRadius="7px"
                borderColor={borderColor}
                boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                bg={cardBg}
                py={1}
                minW="160px"
              >
                {currencies.map((curr) => (
                  <MenuItem
                    key={curr.code}
                    onClick={() => saveCurrencyPreference(curr.code)}
                    bg={currency === curr.code ? 'blue.50' : 'transparent'}
                    color={currency === curr.code ? 'blue.700' : textColor}
                    _hover={{
                      bg: currency === curr.code ? 'blue.100' : useColorModeValue('gray.50', 'gray.700'),
                      transform: 'translateX(2px)'
                    }}
                    transition="all 0.15s ease"
                    borderRadius="4px"
                    mx={1}
                    my={0.5}
                    fontWeight={currency === curr.code ? '600' : '400'}
                  >
                    <HStack spacing={2}>
                      <Text fontSize="sm">{curr.symbol}</Text>
                      <Text fontSize="sm">{curr.code}</Text>
                      <Text fontSize="xs" color={mutedTextColor} ml="auto">
                        {curr.name}
                      </Text>
                    </HStack>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            
            {/* Elegant Create Campaign Button */}
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="blue"
                  color="white"
              size="md"
                  onClick={onCreateCampaignOpen}
              borderRadius="7px"
              _hover={{
                transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
              }}
              _active={{
                transform: 'translateY(0)'
              }}
              transition="all 0.2s"
              fontWeight="500"
              px={6}
                >
                  Create Campaign
                </Button>
            
            {/* Elegant Connect Meta Button */}
            {!credentialsStatus?.meta?.isConnected && !credentialsStatus?.meta?.isConfigured ? (
                <Button
                leftIcon={<FiLink />}
                variant="outline"
                colorScheme="blue"
                size="md"
                onClick={onMetaOAuthOpen}
                borderRadius="7px"
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                }}
                _active={{
                  transform: 'translateY(0)'
                }}
                transition="all 0.2s"
                fontWeight="500"
                px={6}
              >
                Connect Meta
                </Button>
            ) : (
              <IconButton
                icon={<FiSettings />}
                variant="ghost"
                size="md"
                onClick={onCredentialsOpen}
                borderRadius="7px"
                aria-label="Settings"
                _hover={{ bg: 'gray.100' }}
              />
            )}
              </HStack>
          </Flex>
      
        {/* Credentials Alert */}
        {credentialsStatus && !credentialsStatus.meta?.isConnected && !credentialsStatus.meta?.isConfigured && (
          <Alert status="warning" mb={6} borderRadius="7px" border="1px" borderColor="orange.200">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Meta Account Not Connected</AlertTitle>
              <AlertDescription>
                Connect your Meta account to create and manage ad campaigns without API keys.
              </AlertDescription>
            </Box>
            <Button size="sm" colorScheme="orange" onClick={onMetaOAuthOpen} ml={4} borderRadius="7px">
              Connect Now
            </Button>
          </Alert>
        )}
        
        {/* Tabs Navigation */}
        <Tabs index={tabIndex} onChange={setTabIndex} colorScheme="blue" mb={6}>
          <TabList borderBottom="2px solid" borderColor={borderColor} pb={0}>
            <Tab
              _selected={{ color: 'blue.600', borderBottom: '2px solid', borderColor: 'blue.600' }}
              fontWeight="500"
              fontSize="sm"
              px={6}
              py={3}
            >
              Overview
            </Tab>
            <Tab
              _selected={{ color: 'blue.600', borderBottom: '2px solid', borderColor: 'blue.600' }}
              fontWeight="500"
              fontSize="sm"
              px={6}
              py={3}
            >
              Campaigns
            </Tab>
            <Tab
              _selected={{ color: 'blue.600', borderBottom: '2px solid', borderColor: 'blue.600' }}
              fontWeight="500"
              fontSize="sm"
              px={6}
              py={3}
            >
              Analytics
            </Tab>
            <Tab
              _selected={{ color: 'blue.600', borderBottom: '2px solid', borderColor: 'blue.600' }}
              fontWeight="500"
              fontSize="sm"
              px={6}
              py={3}
            >
              AI Tools
            </Tab>
            <Tab
              _selected={{ color: 'blue.600', borderBottom: '2px solid', borderColor: 'blue.600' }}
              fontWeight="500"
              fontSize="sm"
              px={6}
              py={3}
            >
              Settings
            </Tab>
          </TabList>
          
          <TabPanels>
            {/* Overview Tab */}
            <TabPanel px={0} pt={6}>
              {/* Stats Cards */}
              <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4} mb={6}>
                <StatsCard
                  title="Total Spend"
                  value={`${currencySymbol}${totalSpend.toFixed(2)}`}
                  icon={<Box as={FiDollarSign} boxSize={5} />}
                  color="blue"
                />
                <StatsCard
                  title="Impressions"
                  value={totalImpressions.toLocaleString()}
                  icon={<Box as={FiEye} boxSize={5} />}
                  color="blue"
                />
                <StatsCard
                  title="Clicks"
                  value={totalClicks.toLocaleString()}
                  icon={<Box as={FiMousePointer} boxSize={5} />}
                  color="green"
                />
                <StatsCard
                  title="Active Campaigns"
                  value={activeCampaigns}
                  icon={<Box as={FiTarget} boxSize={5} />}
                  color="orange"
                />
              </SimpleGrid>
        
              {/* Performance Charts */}
              {performanceChartData ? (
                <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={6}>
                  <Card bg={cardBg} boxShadow="sm" borderRadius="7px" border="1px" borderColor={borderColor}>
                    <CardHeader pb={2}>
                      <Text fontWeight="600" fontSize="md">Performance Overview</Text>
                      <Text fontSize="xs" color={mutedTextColor}>Impressions & Clicks (Last 7 Days)</Text>
                    </CardHeader>
                    <CardBody>
                      <Box h="300px">
                        <Line data={performanceChartData} options={chartOptions} />
                      </Box>
              </CardBody>
            </Card>
            
                  <Card bg={cardBg} boxShadow="sm" borderRadius="7px" border="1px" borderColor={borderColor}>
                    <CardHeader pb={2}>
                      <Text fontWeight="600" fontSize="md">Spend & Conversions</Text>
                      <Text fontSize="xs" color={mutedTextColor}>Revenue Metrics (Last 7 Days)</Text>
              </CardHeader>
              <CardBody>
                      <Box h="300px">
                        {spendChartData && <Line data={spendChartData} options={chartOptions} />}
                      </Box>
              </CardBody>
            </Card>
                </Grid>
              ) : (
                <Card bg={cardBg} boxShadow="sm" borderRadius="7px" border="1px" borderColor={borderColor} mb={6}>
                  <CardBody py={12}>
                    <Center>
                      <VStack spacing={3}>
                        <FiBarChart2 size={48} color={mutedTextColor} />
                        <Text color={mutedTextColor}>No performance data available yet</Text>
                        <Text fontSize="sm" color={mutedTextColor}>Start creating campaigns to see analytics</Text>
          </VStack>
                    </Center>
                  </CardBody>
                </Card>
              )}
              
              {/* Additional Metrics */}
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Card bg={cardBg} boxShadow="sm" borderRadius="7px" border="1px" borderColor={borderColor}>
                  <CardBody>
                    <Stat>
                      <StatLabel>Average CTR</StatLabel>
                      <StatNumber fontSize="2xl">{avgCTR}%</StatNumber>
                    </Stat>
                  </CardBody>
                </Card>
                
                <Card bg={cardBg} boxShadow="sm" borderRadius="7px" border="1px" borderColor={borderColor}>
                  <CardBody>
                    <Stat>
                      <StatLabel>Average CPC</StatLabel>
                      <StatNumber fontSize="2xl">{currencySymbol}{avgCPC}</StatNumber>
                    </Stat>
                  </CardBody>
                </Card>
                
                <Card bg={cardBg} boxShadow="sm" borderRadius="7px" border="1px" borderColor={borderColor}>
                  <CardBody>
                    <Stat>
                      <StatLabel>Total Conversions</StatLabel>
                      <StatNumber fontSize="2xl">{totalConversions}</StatNumber>
                    </Stat>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>
            
            {/* Campaigns Tab */}
            <TabPanel px={0} pt={6}>
              <Card bg={cardBg} boxShadow="sm" borderRadius="7px" border="1px" borderColor={borderColor}>
          <CardHeader borderBottom="1px" borderColor={borderColor}>
                <Flex justify="space-between" align="center">
                  <HStack>
                <Box as={FiBarChart2} color="blue.500" />
                <Text fontWeight="600" fontSize="lg">Your Campaigns</Text>
                  </HStack>
                  <HStack>
                    <IconButton
                      icon={<FiRefreshCw />}
                      size="sm"
                      variant="ghost"
                      onClick={fetchCampaigns}
                  aria-label="Refresh"
                    />
                    <Button
                      leftIcon={<FiPlus />}
                      colorScheme="blue"
                      size="sm"
                      onClick={onCreateCampaignOpen}
                  borderRadius="7px"
                    >
                      New Campaign
                    </Button>
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody>
            {loading && campaigns.length === 0 ? (
              <VStack spacing={4} py={8}>
                <Skeleton height="40px" width="100%" />
                <Skeleton height="40px" width="100%" />
                <Skeleton height="40px" width="100%" />
              </VStack>
            ) : campaigns.length > 0 ? (
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Campaign Name</Th>
                          <Th>Objective</Th>
                          <Th>Status</Th>
                          <Th isNumeric>Budget</Th>
                          <Th>Performance</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {campaigns.map((campaign) => (
                      <Tr key={campaign._id || campaign.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                            <Td>
                          <VStack align="start" spacing={1}>
                                <Text fontWeight="medium">{campaign.name}</Text>
                                {campaign.aiGenerated && (
                              <Badge colorScheme="blue" size="sm">
                                    <FiStar size={10} style={{ display: 'inline', marginRight: '4px' }} />
                                    AI Generated
                                  </Badge>
                                )}
                              </VStack>
                            </Td>
                            <Td>
                              <Badge>{campaign.objective}</Badge>
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  campaign.status === 'ACTIVE' ? 'green' :
                                  campaign.status === 'PAUSED' ? 'yellow' : 'gray'
                                }
                              >
                                {campaign.status}
                              </Badge>
                            </Td>
                            <Td isNumeric>{currencySymbol}{campaign.budget || campaign.dailyBudget || 0}/day</Td>
                            <Td>
                              <HStack spacing={4} fontSize="xs">
                            <ChakraTooltip label="Impressions">
                                  <HStack>
                                    <FiEye />
                                    <Text>{(campaign.impressions || 0).toLocaleString()}</Text>
                                  </HStack>
                            </ChakraTooltip>
                            <ChakraTooltip label="Clicks">
                                  <HStack>
                                    <FiMousePointer />
                                    <Text>{(campaign.clicks || 0).toLocaleString()}</Text>
                                  </HStack>
                            </ChakraTooltip>
                            <ChakraTooltip label="Conversions">
                                  <HStack>
                                    <FiCheckCircle />
                                    <Text>{campaign.conversions || 0}</Text>
                                  </HStack>
                            </ChakraTooltip>
                              </HStack>
                            </Td>
                            <Td>
                              <HStack spacing={1}>
                                {campaign.status === 'ACTIVE' ? (
                                  <IconButton
                                    icon={<FiPause />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="yellow"
                                    onClick={() => pauseCampaign(campaign._id || campaign.id)}
                                aria-label="Pause"
                                  />
                                ) : (
                                  <IconButton
                                    icon={<FiPlay />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="green"
                                    onClick={() => resumeCampaign(campaign._id || campaign.id)}
                                aria-label="Resume"
                                  />
                                )}
                                <IconButton
                                  icon={<FiZap />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => optimizeCampaign(campaign._id || campaign.id)}
                              aria-label="AI Optimize"
                                />
                                <IconButton
                                  icon={<FiBarChart2 />}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedCampaign(campaign);
                                    onCampaignDetailsOpen();
                                  }}
                              aria-label="View Details"
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Center py={12}>
                    <VStack spacing={4}>
                      <Box p={6} bg="gray.100" borderRadius="full">
                        <FiTarget size={48} color="#718096" />
                      </Box>
                      <Text color={mutedTextColor} fontSize="lg">No campaigns yet</Text>
                  <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onCreateCampaignOpen} borderRadius="7px">
                        Create Your First Campaign
                      </Button>
                    </VStack>
                  </Center>
                )}
              </CardBody>
            </Card>
            </TabPanel>
            
            {/* Analytics Tab */}
            <TabPanel px={0} pt={6}>
              <VStack spacing={6} align="stretch">
                {performanceChartData ? (
                  <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
                    <Card bg={cardBg} boxShadow="sm" borderRadius="7px" border="1px" borderColor={borderColor}>
                      <CardHeader pb={2}>
                        <Text fontWeight="600" fontSize="md">Performance Overview</Text>
                        <Text fontSize="xs" color={mutedTextColor}>Impressions & Clicks (Last 7 Days)</Text>
                      </CardHeader>
                      <CardBody>
                        <Box h="300px">
                          <Line data={performanceChartData} options={chartOptions} />
                        </Box>
                      </CardBody>
                    </Card>
                    
                    <Card bg={cardBg} boxShadow="sm" borderRadius="7px" border="1px" borderColor={borderColor}>
                      <CardHeader pb={2}>
                        <Text fontWeight="600" fontSize="md">Spend & Conversions</Text>
                        <Text fontSize="xs" color={mutedTextColor}>Revenue Metrics (Last 7 Days)</Text>
                      </CardHeader>
                      <CardBody>
                        <Box h="300px">
                          {spendChartData && <Line data={spendChartData} options={chartOptions} />}
                        </Box>
                      </CardBody>
                    </Card>
                  </Grid>
                ) : (
                  <Card bg={cardBg} boxShadow="sm" borderRadius="7px" border="1px" borderColor={borderColor}>
                    <CardBody py={12}>
                      <Center>
                        <VStack spacing={3}>
                          <FiBarChart2 size={48} color={mutedTextColor} />
                          <Text color={mutedTextColor}>No analytics data available</Text>
                        </VStack>
                      </Center>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </TabPanel>
            
            {/* AI Tools Tab */}
            <TabPanel px={0} pt={6}>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg} boxShadow="sm" borderRadius="7px" border="1px" borderColor={borderColor}>
                  <CardHeader>
                    <HStack>
                      <Box as={FiCpu} color="blue.600" />
                      <Text fontWeight="600" fontSize="lg">AI Tools</Text>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Button
                        leftIcon={<FiZap />}
                        colorScheme="blue"
                        variant="outline"
                        size="lg"
                        onClick={onAICopyOpen}
                        h="80px"
                        borderRadius="7px"
                      >
                        <VStack spacing={1}>
                          <Text fontWeight="600">Generate Ad Copy</Text>
                          <Text fontSize="xs" color={mutedTextColor}>AI-powered ad content</Text>
                        </VStack>
                      </Button>
                      <Button
                        leftIcon={<FiTarget />}
                        colorScheme="blue"
                        variant="outline"
                        size="lg"
                        h="80px"
                        borderRadius="7px"
                      >
                        <VStack spacing={1}>
                          <Text fontWeight="600">AI Targeting</Text>
                          <Text fontSize="xs" color={mutedTextColor}>Smart audience recommendations</Text>
                        </VStack>
                      </Button>
                    </SimpleGrid>
                  </CardBody>
                </Card>
                
            {aiDashboard && (
                  <Card bg="blue.50" borderWidth={2} borderColor="blue.200" boxShadow="sm" borderRadius="7px">
                <CardHeader bg="blue.100" borderBottomWidth={1} borderColor="blue.200">
                  <HStack>
                        <Box as={FiCpu} color="blue.600" />
                    <Text fontWeight="bold" color="blue.700">AI Performance Dashboard</Text>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <Box p={4} bg="white" borderRadius="7px">
                      <Text fontSize="sm" color={mutedTextColor} mb={1}>AI Optimizations</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        {aiDashboard.totalOptimizations || 0}
                      </Text>
                    </Box>
                        <Box p={4} bg="white" borderRadius="7px">
                      <Text fontSize="sm" color={mutedTextColor} mb={1}>Generated Content</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        {aiDashboard.totalGeneratedContent || 0}
                      </Text>
                    </Box>
                        <Box p={4} bg="white" borderRadius="7px">
                      <Text fontSize="sm" color={mutedTextColor} mb={1}>Performance Score</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        {aiDashboard.performanceScore || 'N/A'}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </CardBody>
              </Card>
            )}
          </VStack>
            </TabPanel>
            
            {/* Settings Tab */}
            <TabPanel px={0} pt={6}>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg} boxShadow="sm" borderRadius="7px" border="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontWeight="600" fontSize="lg">Preferences</Text>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          value={currency}
                          onChange={(e) => saveCurrencyPreference(e.target.value)}
                          borderRadius="7px"
                        >
                          {currencies.map(curr => (
                            <option key={curr.code} value={curr.code}>
                              {curr.symbol} {curr.name} ({curr.code})
                            </option>
                          ))}
                        </Select>
                        <FormHelperText>This currency will be used for all financial displays</FormHelperText>
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>
                
                <Card bg={cardBg} boxShadow="sm" borderRadius="7px" border="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontWeight="600" fontSize="lg">Meta Account</Text>
                  </CardHeader>
                  <CardBody>
                    {(credentialsStatus?.meta?.isConnected || credentialsStatus?.meta?.isConfigured) ? (
                      <VStack spacing={4} align="stretch">
                        <Alert status="success" borderRadius="7px">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Meta account connected</AlertTitle>
                            <AlertDescription>Your Meta account is active and ready to use</AlertDescription>
                          </Box>
                        </Alert>
                        <HStack spacing={3}>
                        <Button
                          leftIcon={<FiSettings />}
                          variant="outline"
                          onClick={onCredentialsOpen}
                          borderRadius="7px"
                            flex={1}
                        >
                          Manage Connection
                        </Button>
                          <Button
                            leftIcon={<FiRefreshCw />}
                            variant="outline"
                            onClick={() => fetchCredentialsStatus()}
                            borderRadius="7px"
                            isLoading={loading}
                          >
                            Refresh
                          </Button>
                        </HStack>
                      </VStack>
                    ) : (
                      <VStack spacing={4} align="stretch">
                        <Alert status="warning" borderRadius="7px">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Meta account not connected</AlertTitle>
                            <AlertDescription>Connect your Meta account to start creating campaigns</AlertDescription>
                          </Box>
                        </Alert>
                        <Button
                          leftIcon={<FiLink />}
                          colorScheme="blue"
                          onClick={onMetaOAuthOpen}
                          borderRadius="7px"
                        >
                          Connect Meta Account
                        </Button>
                      </VStack>
                    )}
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
        
        {/* Modals */}
        
        {/* Meta OAuth Modal - Professional & Centered */}
        <Modal 
          isOpen={isMetaOAuthOpen} 
          onClose={onMetaOAuthClose} 
          size="md"
          isCentered
          motionPreset="scale"
        >
          <ModalOverlay 
            bg="blackAlpha.600" 
            backdropFilter="blur(4px)"
          />
          <ModalContent 
            borderRadius="12px"
            boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            border="1px solid"
            borderColor={borderColor}
            maxW="480px"
            mx={4}
          >
            <ModalHeader 
              pb={3}
              borderBottom="1px solid"
              borderColor={borderColor}
            >
              <VStack align="start" spacing={2}>
                <HStack spacing={3}>
                  <Box
                    p={2}
                    bg="blue.50"
                    borderRadius="8px"
                    color="blue.600"
                  >
                    <FiLink size={20} />
                  </Box>
                  <Text fontSize="xl" fontWeight="700" color={textColor}>
                    Connect Meta Account
                  </Text>
                </HStack>
              </VStack>
            </ModalHeader>
            <ModalCloseButton 
              borderRadius="7px"
              _hover={{ bg: 'gray.100' }}
              top={4}
              right={4}
            />
            <ModalBody py={6}>
              <VStack align="stretch" spacing={6}>
                <Box
                  p={4}
                  bg="blue.50"
                  borderRadius="8px"
                  border="1px solid"
                  borderColor="blue.200"
                >
                  <HStack spacing={3} align="start">
                    <Box
                      as={InfoIcon}
                      color="blue.600"
                      boxSize={5}
                      mt={0.5}
                      flexShrink={0}
                    />
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontSize="sm" fontWeight="600" color="blue.900">
                        Secure OAuth Authentication
                      </Text>
                      <Text fontSize="xs" color="blue.700" lineHeight="1.5">
                      Connect your Meta account securely without entering API keys manually. We'll handle the authentication for you.
                      </Text>
                    </VStack>
                  </HStack>
                  </Box>
                
                <VStack spacing={4} align="stretch">
                  <Text fontSize="sm" color={mutedTextColor} textAlign="center" lineHeight="1.6">
                    Click the button below to connect your Meta Business account. You'll be redirected to Meta's secure login page to authorize the connection.
                  </Text>
                  
                  <Button
                    leftIcon={<FiLink />}
                    colorScheme="blue"
                    size="lg"
                    onClick={initiateMetaOAuth}
                    isLoading={loading}
                    isFullWidth
                    borderRadius="7px"
                    h="48px"
                    fontWeight="600"
                    fontSize="md"
                    _hover={{
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                    }}
                    _active={{
                      transform: 'translateY(0)'
                    }}
                    transition="all 0.2s"
                  >
                    Connect with Meta
                </Button>
                </VStack>
              </VStack>
            </ModalBody>
            <ModalFooter 
              pt={4}
              borderTop="1px solid"
              borderColor={borderColor}
            >
              <Button 
                variant="ghost" 
                onClick={onMetaOAuthClose} 
                borderRadius="7px"
                fontWeight="500"
                _hover={{ bg: 'gray.50' }}
              >
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        
        {/* OAuth Success Dialog */}
        <Modal 
          isOpen={isOAuthSuccessOpen} 
          onClose={onOAuthSuccessClose} 
          size="md"
          isCentered
          motionPreset="scale"
          closeOnOverlayClick={false}
        >
          <ModalOverlay 
            bg="blackAlpha.600" 
            backdropFilter="blur(4px)"
          />
          <ModalContent 
            borderRadius="12px"
            boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            border="1px solid"
            borderColor={borderColor}
            maxW="480px"
            mx={4}
          >
            <ModalBody py={8} px={6}>
              <VStack spacing={6} align="center">
                <Box
                  p={4}
                  bg="green.50"
                  borderRadius="full"
                  border="2px solid"
                  borderColor="green.200"
                >
                  <CheckCircleIcon 
                    boxSize={10} 
                    color="green.500"
                  />
                </Box>
                
                <VStack spacing={2} align="center">
                  <Text 
                    fontSize="xl" 
                    fontWeight="700" 
                    color={textColor}
                    textAlign="center"
                  >
                    Connection Successful!
                  </Text>
                  <Text 
                    fontSize="sm" 
                    color={mutedTextColor}
                    textAlign="center"
                    lineHeight="1.6"
                    maxW="320px"
                  >
                    {oauthStatus.message || 'Your Meta account has been connected successfully. You can now start creating campaigns.'}
                  </Text>
                </VStack>
                
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={() => {
                    onOAuthSuccessClose();
                    if (token && coachId) {
                      fetchCredentialsStatus();
                    }
                  }}
                  isFullWidth
                  borderRadius="7px"
                  h="48px"
                  fontWeight="600"
                  fontSize="md"
                  _hover={{
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                  }}
                  _active={{
                    transform: 'translateY(0)'
                  }}
                  transition="all 0.2s"
                >
                  Continue
                </Button>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
        
        {/* OAuth Error Dialog */}
        <Modal 
          isOpen={isOAuthErrorOpen} 
          onClose={onOAuthErrorClose} 
          size="md"
          isCentered
          motionPreset="scale"
          closeOnOverlayClick={true}
        >
          <ModalOverlay 
            bg="blackAlpha.600" 
            backdropFilter="blur(4px)"
          />
          <ModalContent 
            borderRadius="12px"
            boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            border="1px solid"
            borderColor={borderColor}
            maxW="480px"
            mx={4}
          >
            <ModalCloseButton 
              borderRadius="7px"
              _hover={{ bg: 'gray.100' }}
              top={4}
              right={4}
            />
            <ModalBody py={8} px={6}>
              <VStack spacing={6} align="center">
                <Box
                  p={4}
                  bg="red.50"
                  borderRadius="full"
                  border="2px solid"
                  borderColor="red.200"
                >
                  <WarningIcon 
                    boxSize={10} 
                    color="red.500"
                  />
                </Box>
                
                <VStack spacing={2} align="center">
                  <Text 
                    fontSize="xl" 
                    fontWeight="700" 
                    color={textColor}
                    textAlign="center"
                  >
                    {oauthStatus.title || 'Connection Failed'}
                  </Text>
                  <Text 
                    fontSize="sm" 
                    color={mutedTextColor}
                    textAlign="center"
                    lineHeight="1.6"
                    maxW="320px"
                  >
                    {oauthStatus.message || 'There was an error connecting your Meta account. Please try again.'}
                  </Text>
                </VStack>
                
                <VStack spacing={3} align="stretch" w="100%">
                  <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={() => {
                      onOAuthErrorClose();
                      onMetaOAuthOpen();
                    }}
                    isFullWidth
                    borderRadius="7px"
                    h="48px"
                    fontWeight="600"
                    fontSize="md"
                    _hover={{
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                    }}
                    _active={{
                      transform: 'translateY(0)'
                    }}
                    transition="all 0.2s"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={onOAuthErrorClose}
                    isFullWidth
                    borderRadius="7px"
                    fontWeight="500"
                    _hover={{ bg: 'gray.50' }}
                  >
                    Close
                  </Button>
                </VStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
        
        {/* Credentials Setup Modal - Enhanced */}
        <Modal 
          isOpen={isCredentialsOpen} 
          onClose={onCredentialsClose} 
          size="xl"
          isCentered
          motionPreset="scale"
        >
          <ModalOverlay 
            bg="blackAlpha.600" 
            backdropFilter="blur(4px)"
          />
          <ModalContent 
            borderRadius="10px"
            boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            border="1px solid"
            borderColor={borderColor}
            bg={cardBg}
          >
            <ModalHeader 
              pb={3}
              borderBottom="1px solid"
              borderColor={borderColor}
            >
              <HStack spacing={3}>
                <Box
                  p={2}
                  bg="blue.50"
                  borderRadius="8px"
                  color="blue.600"
                >
                  <FiSettings size={20} />
                </Box>
                <Text fontSize="xl" fontWeight="700" color={textColor}>
                  Meta Account Settings
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton 
              borderRadius="7px"
              _hover={{ bg: 'gray.100' }}
              top={4}
              right={4}
            />
            <ModalBody 
              py={6}
              maxH="70vh"
              overflowY="auto"
              sx={{
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: useColorModeValue('rgba(0, 0, 0, 0.15)', 'rgba(255, 255, 255, 0.15)'),
                  borderRadius: '10px',
                  transition: 'background 0.2s ease',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: useColorModeValue('rgba(0, 0, 0, 0.25)', 'rgba(255, 255, 255, 0.25)'),
                },
                scrollbarWidth: 'thin',
                scrollbarColor: `${useColorModeValue('rgba(0, 0, 0, 0.15)', 'rgba(255, 255, 255, 0.15)')} transparent`,
              }}
            >
              <VStack align="stretch" spacing={5}>
                {/* Connection Status */}
                {(credentialsStatus?.meta?.isConnected || credentialsStatus?.meta?.isConfigured) ? (
                  <>
                    <Alert 
                      status="success" 
                      borderRadius="7px"
                      border="1px solid"
                      borderColor="green.200"
                    >
                    <AlertIcon />
                    <Box>
                    <AlertTitle>Meta Account Connected</AlertTitle>
                    <AlertDescription>
                          Your Meta account is connected via OAuth and ready to use.
                    </AlertDescription>
                    </Box>
                  </Alert>
                  
                    {/* Detailed Credentials Info */}
                    {detailedCredentials ? (
                      <VStack align="stretch" spacing={4}>
                        {/* Access Token Status */}
                        <Card bg={cardBg} boxShadow="sm" borderRadius="7px" border="1px" borderColor={borderColor}>
                          <CardHeader pb={3}>
                            <HStack spacing={2}>
                              <Box
                                p={1.5}
                                bg={detailedCredentials.tokenStatus === 'valid' ? 'green.50' : 'red.50'}
                                borderRadius="6px"
                                color={detailedCredentials.tokenStatus === 'valid' ? 'green.600' : 'red.600'}
                              >
                                <FiKey size={16} />
                              </Box>
                              <Text fontWeight="600" fontSize="sm" color={textColor}>
                                Access Token Status
                              </Text>
                    </HStack>
                          </CardHeader>
                          <CardBody pt={0}>
                            <VStack align="stretch" spacing={3}>
                              <HStack justify="space-between">
                                <Text fontSize="xs" color={mutedTextColor} fontWeight="500">
                                  Status:
                                </Text>
                                <Badge 
                                  colorScheme={
                                    detailedCredentials.tokenStatus === 'valid' ? 'green' :
                                    detailedCredentials.tokenStatus === 'not_found' ? 'red' :
                                    'orange'
                                  }
                                  borderRadius="4px"
                                  fontSize="2xs"
                                  px={2}
                                  py={1}
                                >
                                  {detailedCredentials.tokenStatus === 'valid' ? 'Valid' :
                                   detailedCredentials.tokenStatus === 'not_found' ? 'Not Found' :
                                   detailedCredentials.tokenStatus === 'decryption_failed' ? 'Decryption Failed' :
                                   'Error'}
                                </Badge>
                              </HStack>
                              
                              {detailedCredentials.tokenPreview && (
                                <Box
                                  p={3}
                                  bg={useColorModeValue('gray.50', 'gray.700')}
                                  borderRadius="6px"
                                  border="1px solid"
                                  borderColor={borderColor}
                                >
                                  <Text fontSize="xs" color={mutedTextColor} mb={1} fontWeight="500">
                                    Token Preview:
                                  </Text>
                                  <Text 
                                    fontSize="xs" 
                                    fontFamily="mono" 
                                    color={textColor}
                                    wordBreak="break-all"
                                  >
                                    {detailedCredentials.tokenPreview}
                                  </Text>
                          </Box>
                              )}

                              {detailedCredentials.tokenStatus !== 'valid' && (
                                <Alert status="warning" borderRadius="6px" size="sm">
                                  <AlertIcon />
                                  <Box>
                                    <AlertTitle fontSize="xs">Token Issue Detected</AlertTitle>
                                    <AlertDescription fontSize="xs">
                                      {detailedCredentials.tokenStatus === 'not_found' 
                                        ? 'Access token is missing. Please reconnect your Meta account.'
                                        : 'There was an issue decrypting the access token. Please reconnect your Meta account.'}
                                    </AlertDescription>
                                  </Box>
                                </Alert>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>

                        {/* Account Information */}
                        <Card bg={cardBg} boxShadow="sm" borderRadius="7px" border="1px" borderColor={borderColor}>
                          <CardHeader pb={3}>
                            <HStack spacing={2}>
                              <Box
                                p={1.5}
                                bg="blue.50"
                                borderRadius="6px"
                                color="blue.600"
                              >
                                <FiInfo size={16} />
                              </Box>
                              <Text fontWeight="600" fontSize="sm" color={textColor}>
                                Account Information
                              </Text>
                            </HStack>
                          </CardHeader>
                          <CardBody pt={0}>
                            <SimpleGrid columns={2} spacing={4}>
                              <VStack align="start" spacing={1}>
                                <Text fontSize="xs" color={mutedTextColor} fontWeight="500">
                                  App ID:
                                </Text>
                                <Text fontSize="sm" color={textColor} fontFamily="mono">
                                  {detailedCredentials.appId || 'N/A'}
                                </Text>
                              </VStack>
                              
                              <VStack align="start" spacing={1}>
                                <Text fontSize="xs" color={mutedTextColor} fontWeight="500">
                                  Ad Account ID:
                                </Text>
                                <Text fontSize="sm" color={textColor} fontFamily="mono">
                                  {detailedCredentials.adAccountId ? `act_${detailedCredentials.adAccountId}` : 'N/A'}
                                </Text>
                              </VStack>
                              
                              <VStack align="start" spacing={1}>
                                <Text fontSize="xs" color={mutedTextColor} fontWeight="500">
                                  Business Account ID:
                                </Text>
                                <Text fontSize="sm" color={textColor} fontFamily="mono">
                                  {detailedCredentials.businessAccountId || 'N/A'}
                                </Text>
                              </VStack>
                              
                              <VStack align="start" spacing={1}>
                                <Text fontSize="xs" color={mutedTextColor} fontWeight="500">
                                  Last Verified:
                                </Text>
                                <Text fontSize="sm" color={textColor}>
                                  {detailedCredentials.lastVerified 
                                    ? new Date(detailedCredentials.lastVerified).toLocaleString()
                                    : 'Never'}
                                </Text>
                              </VStack>
                            </SimpleGrid>
                          </CardBody>
                        </Card>
                      </VStack>
                    ) : (
                      <Box textAlign="center" py={4}>
                        <Button
                          leftIcon={<FiRefreshCw />}
                          colorScheme="blue"
                          variant="outline"
                          onClick={fetchDetailedCredentials}
                          isLoading={loading}
                          borderRadius="7px"
                        >
                          Load Credentials Details
                        </Button>
                      </Box>
                    )}

                    {/* Action Buttons */}
                    <HStack spacing={3}>
                      <Button
                        leftIcon={<FiRefreshCw />}
                        colorScheme="blue"
                        variant="outline"
                        onClick={async () => {
                          await fetchCredentialsStatus();
                          await fetchDetailedCredentials();
                        }}
                        isLoading={loading}
                        borderRadius="7px"
                        flex={1}
                      >
                        Refresh Status
                      </Button>
                      
                      <Button
                        leftIcon={<FiLink />}
                        colorScheme="blue"
                        onClick={() => {
                          onCredentialsClose();
                          onMetaOAuthOpen();
                        }}
                        borderRadius="7px"
                        flex={1}
                      >
                        Reconnect
                      </Button>
                      
                      <Button
                        leftIcon={<FiX />}
                        colorScheme="red"
                        variant="outline"
                        onClick={disconnectMeta}
                        isLoading={loading}
                        borderRadius="7px"
                      >
                        Disconnect
                      </Button>
                    </HStack>
                  </>
                ) : (
                  <VStack align="stretch" spacing={4}>
                    <Alert status="warning" borderRadius="7px">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Meta Account Not Connected</AlertTitle>
                        <AlertDescription>
                          Connect your Meta account to start creating and managing ad campaigns.
                        </AlertDescription>
                      </Box>
                    </Alert>
                    
                    <Button
                      leftIcon={<FiLink />}
                      colorScheme="blue"
                      onClick={() => {
                        onCredentialsClose();
                        onMetaOAuthOpen();
                      }}
                      borderRadius="7px"
                      size="lg"
                      isFullWidth
                    >
                      Connect Meta Account
                    </Button>
                  </VStack>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter 
              pt={4}
              borderTop="1px solid"
              borderColor={borderColor}
            >
              <Button 
                variant="ghost" 
                onClick={onCredentialsClose} 
                borderRadius="7px"
                fontWeight="500"
                _hover={{ bg: 'gray.50' }}
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        
        {/* Create Campaign Modal - Progressive Multi-Step - Redesigned */}
        <Modal 
          isOpen={isCreateCampaignOpen} 
          onClose={() => {
            setCurrentStep(1);
            setCampaignForm({
              name: '',
              objective: 'CONVERSIONS',
              budget: 50,
              targetAudience: '',
              productInfo: '',
              funnelId: '',
              funnelUrl: '',
              useAI: true,
              adTitle: '',
              adDescription: '',
              adImageUrl: '',
              callToAction: 'LEARN_MORE',
              targeting: {
                ageMin: 18,
                ageMax: 65,
                genders: [],
                locations: [],
                interests: []
              },
              schedule: {
                startDate: null,
                endDate: null
              },
              aiSuggestions: {
                titles: [],
                descriptions: [],
                selectedTitle: '',
                selectedDescription: ''
              }
            });
            onCreateCampaignClose();
          }} 
          size="2xl"
          isCentered
          motionPreset="scale"
          closeOnOverlayClick={false}
        >
          <ModalOverlay 
            bg="blackAlpha.700" 
            backdropFilter="blur(8px)"
          />
          <ModalContent 
            borderRadius="10px"
            boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            maxW="720px"
            mx={4}
            bg={cardBg}
          >
            <ModalHeader 
              pb={5}
              pt={6}
              px={6}
              borderBottom="1px solid"
              borderColor={useColorModeValue('gray.100', 'gray.700')}
              position="sticky"
              top={0}
              zIndex={10}
              bg={cardBg}
              borderRadius="10px 10px 0 0"
            >
              <VStack align="start" spacing={3} w="100%">
                <HStack spacing={3} w="100%" justify="space-between" align="center">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="2xl" fontWeight="700" color={textColor} letterSpacing="-0.02em">
                      Create New Campaign
                    </Text>
                    <Text fontSize="sm" color={mutedTextColor} mt={1}>
                      Build your campaign step by step
                    </Text>
                  </VStack>
                  <ModalCloseButton 
                    borderRadius="8px"
                    _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                    top={6}
                    right={6}
                    size="md"
                  />
                </HStack>
                
                {/* Enhanced Progress Steps */}
                <Box w="100%" pt={2}>
                  <HStack spacing={1} w="100%">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <React.Fragment key={step}>
                        <VStack spacing={2} flex={1} align="center">
                          <Box
                            w="36px"
                            h="36px"
                            borderRadius="full"
                            bg={currentStep >= step ? 'blue.500' : useColorModeValue('gray.100', 'gray.700')}
                            color={currentStep >= step ? 'white' : useColorModeValue('gray.500', 'gray.400')}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontWeight="700"
                            fontSize="sm"
                            transition="all 0.3s ease"
                            transform={currentStep === step ? 'scale(1.1)' : 'scale(1)'}
                            boxShadow={currentStep >= step ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none'}
                            border={currentStep === step ? '2px solid' : 'none'}
                            borderColor={currentStep === step ? 'blue.300' : 'transparent'}
                          >
                            {currentStep > step ? (
                              <CheckCircleIcon boxSize={5} />
                            ) : (
                              step
                            )}
                          </Box>
                          <Text 
                            fontSize="xs" 
                            fontWeight={currentStep === step ? '600' : '400'}
                            color={currentStep >= step ? 'blue.600' : mutedTextColor}
                            textAlign="center"
                            display={{ base: 'none', md: 'block' }}
                          >
                            {step === 1 && 'Basic'}
                            {step === 2 && 'Audience'}
                            {step === 3 && 'Creative'}
                            {step === 4 && 'AI'}
                            {step === 5 && 'Review'}
                          </Text>
                        </VStack>
                        {step < 5 && (
                          <Box
                            flex={1}
                            h="3px"
                            bg={currentStep > step ? 'blue.500' : useColorModeValue('gray.200', 'gray.700')}
                            borderRadius="full"
                            mx={1}
                            transition="all 0.3s ease"
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </HStack>
                </Box>
              </VStack>
            </ModalHeader>
            
            <ModalBody 
              py={6} 
              px={6} 
              maxH="65vh" 
              overflowY="auto"
              sx={{
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: useColorModeValue('rgba(0, 0, 0, 0.15)', 'rgba(255, 255, 255, 0.15)'),
                  borderRadius: '10px',
                  transition: 'background 0.2s ease',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: useColorModeValue('rgba(0, 0, 0, 0.25)', 'rgba(255, 255, 255, 0.25)'),
                },
                // Firefox scrollbar
                scrollbarWidth: 'thin',
                scrollbarColor: `${useColorModeValue('rgba(0, 0, 0, 0.15)', 'rgba(255, 255, 255, 0.15)')} transparent`,
              }}
            >
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <VStack align="stretch" spacing={5}>
                <FormControl isRequired>
                    <FormLabel 
                      fontWeight="500" 
                      fontSize="xs" 
                      color={textColor}
                      mb={1.5}
                      textAlign="left"
                    >
                      Campaign Name
                    </FormLabel>
                  <Input
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                    placeholder="e.g., Summer Weight Loss Campaign"
                    borderRadius="7px"
                      size="md"
                      fontSize="sm"
                      borderColor={useColorModeValue('gray.200', 'gray.600')}
                      _hover={{ borderColor: 'blue.300' }}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                      transition="all 0.2s"
                      textAlign="left"
                    />
                    <FormHelperText fontSize="xs" color={mutedTextColor} mt={1} textAlign="left">
                      Choose a descriptive name for your campaign
                    </FormHelperText>
                </FormControl>
                
                <FormControl isRequired>
                    <FormLabel 
                      fontWeight="500" 
                      fontSize="xs" 
                      color={textColor}
                      mb={1.5}
                      textAlign="left"
                    >
                      Campaign Objective
                    </FormLabel>
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<FiChevronDown />}
                        w="100%"
                        size="md"
                    borderRadius="7px"
                        borderColor={useColorModeValue('gray.200', 'gray.600')}
                        borderWidth="1px"
                        bg={cardBg}
                        color={textColor}
                        fontWeight="400"
                        fontSize="sm"
                        justifyContent="space-between"
                        textAlign="left"
                        _hover={{
                          borderColor: 'blue.300',
                          bg: useColorModeValue('gray.50', 'gray.700')
                        }}
                        _active={{
                          borderColor: 'blue.500',
                          bg: useColorModeValue('gray.50', 'gray.700')
                        }}
                        _focus={{
                          borderColor: 'blue.500',
                          boxShadow: '0 0 0 1px #3182CE'
                        }}
                        transition="all 0.2s"
                      >
                        <Text as="span" textAlign="left" w="100%">
                          {campaignForm.objective === 'CONVERSIONS' && 'Conversions'}
                          {campaignForm.objective === 'LEAD_GENERATION' && 'Lead Generation'}
                          {campaignForm.objective === 'TRAFFIC' && 'Website Traffic'}
                          {campaignForm.objective === 'AWARENESS' && 'Brand Awareness'}
                          {campaignForm.objective === 'ENGAGEMENT' && 'Engagement'}
                        </Text>
                      </MenuButton>
                      <MenuList
                        borderRadius="7px"
                        borderColor={useColorModeValue('gray.200', 'gray.600')}
                        boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                        bg={cardBg}
                        py={1}
                        w="100%"
                        minW="unset"
                      >
                        {[
                          { value: 'CONVERSIONS', label: 'Conversions', desc: 'Drive valuable actions' },
                          { value: 'LEAD_GENERATION', label: 'Lead Generation', desc: 'Collect leads' },
                          { value: 'TRAFFIC', label: 'Website Traffic', desc: 'Increase visits' },
                          { value: 'AWARENESS', label: 'Brand Awareness', desc: 'Build recognition' },
                          { value: 'ENGAGEMENT', label: 'Engagement', desc: 'Boost interactions' }
                        ].map((option) => (
                          <MenuItem
                            key={option.value}
                            onClick={() => setCampaignForm({ ...campaignForm, objective: option.value })}
                            bg={campaignForm.objective === option.value ? 'blue.50' : 'transparent'}
                            color={campaignForm.objective === option.value ? 'blue.700' : textColor}
                            _hover={{
                              bg: campaignForm.objective === option.value ? 'blue.100' : useColorModeValue('gray.50', 'gray.700'),
                              transform: 'translateX(2px)'
                            }}
                            transition="all 0.15s ease"
                            borderRadius="4px"
                            mx={1}
                            my={0.5}
                            py={2}
                            w="100%"
                          >
                            <VStack align="start" spacing={0.5} w="100%">
                              <Text fontSize="sm" fontWeight={campaignForm.objective === option.value ? '600' : '400'} textAlign="left">
                                {option.label}
                              </Text>
                              <Text fontSize="xs" color={mutedTextColor} textAlign="left">
                                {option.desc}
                              </Text>
                            </VStack>
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                    <FormHelperText fontSize="xs" color={mutedTextColor} mt={1} textAlign="left">
                      What do you want to achieve with this campaign?
                    </FormHelperText>
                </FormControl>
                
                <FormControl isRequired>
                    <FormLabel 
                      fontWeight="500" 
                      fontSize="xs" 
                      color={textColor}
                      mb={1.5}
                      textAlign="left"
                    >
                      Daily Budget ({currencySymbol})
                    </FormLabel>
                    <InputGroup size="md">
                      <InputLeftElement 
                        pointerEvents="none" 
                        color={useColorModeValue('gray.500', 'gray.400')}
                        fontSize="sm"
                        fontWeight="500"
                        pl={3}
                      >
                      {currencySymbol}
                    </InputLeftElement>
                  <Input
                    type="number"
                    value={campaignForm.budget}
                        onChange={(e) => setCampaignForm({ ...campaignForm, budget: parseFloat(e.target.value) || 0 })}
                    placeholder="50"
                      borderRadius="7px"
                      pl="40px"
                        fontSize="sm"
                        borderColor={useColorModeValue('gray.200', 'gray.600')}
                        _hover={{ borderColor: 'blue.300' }}
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                        transition="all 0.2s"
                        textAlign="left"
                  />
                  </InputGroup>
                    <FormHelperText fontSize="xs" color={mutedTextColor} mt={1} textAlign="left">
                      Minimum daily budget: {currencySymbol}1.00
                    </FormHelperText>
                  </FormControl>
                  
                  <Box
                    p={3.5}
                    borderRadius="7px"
                    border="1px solid"
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    bg={useColorModeValue('blue.50', 'blue.900')}
                  >
                    <HStack spacing={3}>
                      <Switch
                        isChecked={campaignForm.useAI}
                        onChange={(e) => {
                          setCampaignForm({ ...campaignForm, useAI: e.target.checked });
                          // If AI is enabled, skip to step 2 (description), otherwise go to step 2 (targeting)
                        }}
                        colorScheme="blue"
                        size="md"
                      />
                      <VStack align="start" spacing={0.5} flex={1}>
                        <HStack spacing={2}>
                          <Text fontWeight="500" fontSize="xs" color={textColor}>
                            Enable AI Optimization
                          </Text>
                          <Badge colorScheme="blue" size="sm" borderRadius="4px" fontSize="2xs">Recommended</Badge>
                        </HStack>
                        <Text fontSize="xs" color={mutedTextColor} lineHeight="1.4">
                          AI will generate ad copy and optimize targeting automatically
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </VStack>
              )}
              
              {/* Step 2: AI Mode - Description Only OR Manual Mode - Targeting & Audience */}
              {currentStep === 2 && (
                <VStack align="stretch" spacing={5}>
                  {campaignForm.useAI ? (
                    // AI Mode: Just ask for campaign description
                    <>
                      <Box
                        p={3}
                        borderRadius="7px"
                        bg={useColorModeValue('blue.50', 'blue.900')}
                        border="1px solid"
                        borderColor={useColorModeValue('blue.200', 'blue.700')}
                        mb={2}
                      >
                        <HStack spacing={2}>
                          <Box
                            p={1.5}
                            bg="blue.500"
                            borderRadius="5px"
                            color="white"
                          >
                            <FiStar size={14} />
                          </Box>
                          <Text fontSize="xs" color={useColorModeValue('blue.900', 'blue.100')} fontWeight="500">
                            AI will automatically generate ad titles, descriptions, and targeting based on your campaign description
                          </Text>
                        </HStack>
                      </Box>
                      
                      <FormControl isRequired>
                        <FormLabel 
                          fontWeight="500" 
                          fontSize="xs" 
                          color={textColor}
                          mb={1.5}
                          textAlign="left"
                        >
                          Campaign Description
                        </FormLabel>
                        <Textarea
                          value={campaignForm.productInfo}
                          onChange={(e) => setCampaignForm({ ...campaignForm, productInfo: e.target.value })}
                          placeholder="Describe your campaign, product, service, target audience, and what you want to achieve. Be as detailed as possible..."
                          borderRadius="7px"
                          rows={6}
                          fontSize="sm"
                          borderColor={useColorModeValue('gray.200', 'gray.600')}
                          _hover={{ borderColor: 'blue.300' }}
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                          transition="all 0.2s"
                          resize="none"
                          textAlign="left"
                        />
                        <FormHelperText fontSize="xs" color={mutedTextColor} mt={1} textAlign="left">
                          Include details about your product, target audience, and campaign goals. AI will use this to generate everything else.
                        </FormHelperText>
                </FormControl>
                
                <FormControl>
                        <FormLabel 
                          fontWeight="500" 
                          fontSize="xs" 
                          color={textColor}
                          mb={1.5}
                          textAlign="left"
                        >
                          Landing Page URL <Text as="span" color={mutedTextColor} fontWeight="400">(Optional)</Text>
                        </FormLabel>
                  <Input
                          value={campaignForm.funnelUrl}
                          onChange={(e) => setCampaignForm({ ...campaignForm, funnelUrl: e.target.value })}
                          placeholder="https://yourfunnel.com/landing-page"
                          borderRadius="7px"
                          size="md"
                          fontSize="sm"
                          borderColor={useColorModeValue('gray.200', 'gray.600')}
                          _hover={{ borderColor: 'blue.300' }}
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                          transition="all 0.2s"
                          textAlign="left"
                        />
                        <FormHelperText fontSize="xs" color={mutedTextColor} mt={1} textAlign="left">
                          Where should users land after clicking your ad?
                        </FormHelperText>
                      </FormControl>
                    </>
                  ) : (
                    // Manual Mode: Full targeting form
                    <>
                      <FormControl isRequired>
                        <FormLabel 
                          fontWeight="500" 
                          fontSize="xs" 
                          color={textColor}
                          mb={1.5}
                          textAlign="left"
                        >
                          Target Audience Description
                        </FormLabel>
                        <Textarea
                    value={campaignForm.targetAudience}
                    onChange={(e) => setCampaignForm({ ...campaignForm, targetAudience: e.target.value })}
                          placeholder="e.g., Weight loss enthusiasts, 25-45 years, interested in fitness and healthy lifestyle"
                    borderRadius="7px"
                          rows={3}
                          fontSize="sm"
                          borderColor={useColorModeValue('gray.200', 'gray.600')}
                          _hover={{ borderColor: 'blue.300' }}
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                          transition="all 0.2s"
                          resize="none"
                          textAlign="left"
                        />
                        <FormHelperText fontSize="xs" color={mutedTextColor} mt={1} textAlign="left">
                          Describe your ideal customer in detail
                        </FormHelperText>
                </FormControl>
                
                      <FormControl isRequired>
                        <FormLabel 
                          fontWeight="500" 
                          fontSize="xs" 
                          color={textColor}
                          mb={1.5}
                          textAlign="left"
                        >
                          Product/Offer Description
                        </FormLabel>
                  <Textarea
                    value={campaignForm.productInfo}
                    onChange={(e) => setCampaignForm({ ...campaignForm, productInfo: e.target.value })}
                          placeholder="Describe your product, service, or offer in detail..."
                    borderRadius="7px"
                          rows={4}
                          fontSize="sm"
                          borderColor={useColorModeValue('gray.200', 'gray.600')}
                          _hover={{ borderColor: 'blue.300' }}
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                          transition="all 0.2s"
                          resize="none"
                          textAlign="left"
                        />
                        <FormHelperText fontSize="xs" color={mutedTextColor} mt={1} textAlign="left">
                          Detailed description helps generate better ad copy
                        </FormHelperText>
                </FormControl>
                
                      <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                          <FormLabel 
                            fontWeight="500" 
                            fontSize="xs" 
                            color={textColor}
                            mb={1.5}
                            textAlign="left"
                          >
                            Age Range
                          </FormLabel>
                          <HStack spacing={2}>
                            <Input
                              type="number"
                              value={campaignForm.targeting.ageMin}
                              onChange={(e) => setCampaignForm({
                                ...campaignForm,
                                targeting: { ...campaignForm.targeting, ageMin: parseInt(e.target.value) || 18 }
                              })}
                              placeholder="18"
                              borderRadius="7px"
                              size="md"
                              fontSize="sm"
                              borderColor={useColorModeValue('gray.200', 'gray.600')}
                              _hover={{ borderColor: 'blue.300' }}
                              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                              transition="all 0.2s"
                              textAlign="left"
                            />
                            <Text color={mutedTextColor} fontSize="sm" fontWeight="400">to</Text>
                            <Input
                              type="number"
                              value={campaignForm.targeting.ageMax}
                              onChange={(e) => setCampaignForm({
                                ...campaignForm,
                                targeting: { ...campaignForm.targeting, ageMax: parseInt(e.target.value) || 65 }
                              })}
                              placeholder="65"
                              borderRadius="7px"
                              size="md"
                              fontSize="sm"
                              borderColor={useColorModeValue('gray.200', 'gray.600')}
                              _hover={{ borderColor: 'blue.300' }}
                              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                              transition="all 0.2s"
                              textAlign="left"
                            />
                      </HStack>
                        </FormControl>
                      </SimpleGrid>
                      
                      <FormControl>
                        <FormLabel 
                          fontWeight="500" 
                          fontSize="xs" 
                          color={textColor}
                          mb={1.5}
                          textAlign="left"
                        >
                          Landing Page URL <Text as="span" color={mutedTextColor} fontWeight="400">(Optional)</Text>
                    </FormLabel>
                        <Input
                          value={campaignForm.funnelUrl}
                          onChange={(e) => setCampaignForm({ ...campaignForm, funnelUrl: e.target.value })}
                          placeholder="https://yourfunnel.com/landing-page"
                          borderRadius="7px"
                          size="md"
                          fontSize="sm"
                          borderColor={useColorModeValue('gray.200', 'gray.600')}
                          _hover={{ borderColor: 'blue.300' }}
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                          transition="all 0.2s"
                          textAlign="left"
                        />
                        <FormHelperText fontSize="xs" color={mutedTextColor} mt={1} textAlign="left">
                          Where should users land after clicking your ad?
                        </FormHelperText>
                      </FormControl>
                    </>
                  )}
                </VStack>
              )}
              
              {/* Step 3: Ad Creative (Only shown if AI is disabled) */}
              {currentStep === 3 && !campaignForm.useAI && (
                <VStack align="stretch" spacing={5}>
                  <FormControl isRequired>
                    <FormLabel 
                      fontWeight="500" 
                      fontSize="xs" 
                      color={textColor}
                      mb={1.5}
                      textAlign="left"
                    >
                      Ad Title
                    </FormLabel>
                    <Input
                      value={campaignForm.adTitle}
                      onChange={(e) => setCampaignForm({ ...campaignForm, adTitle: e.target.value })}
                      placeholder="Enter a compelling ad title..."
                      borderRadius="7px"
                      size="md"
                      fontSize="sm"
                      maxLength={30}
                      borderColor={useColorModeValue('gray.200', 'gray.600')}
                      _hover={{ borderColor: 'blue.300' }}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                      transition="all 0.2s"
                      textAlign="left"
                    />
                    <HStack justify="space-between" mt={1}>
                      <FormHelperText fontSize="xs" color={mutedTextColor} mb={0} textAlign="left">
                        Keep it concise and attention-grabbing
                      </FormHelperText>
                      <Text 
                        fontSize="xs" 
                        color={campaignForm.adTitle.length >= 30 ? 'red.500' : mutedTextColor}
                        fontWeight="500"
                      >
                        {campaignForm.adTitle.length}/30
                      </Text>
                  </HStack>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel 
                      fontWeight="500" 
                      fontSize="xs" 
                      color={textColor}
                      mb={1.5}
                      textAlign="left"
                    >
                      Ad Description
                    </FormLabel>
                    <Textarea
                      value={campaignForm.adDescription}
                      onChange={(e) => setCampaignForm({ ...campaignForm, adDescription: e.target.value })}
                      placeholder="Write a compelling description that encourages action..."
                      borderRadius="7px"
                      rows={4}
                      fontSize="sm"
                      maxLength={125}
                      borderColor={useColorModeValue('gray.200', 'gray.600')}
                      _hover={{ borderColor: 'blue.300' }}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                      transition="all 0.2s"
                      resize="none"
                      textAlign="left"
                    />
                    <HStack justify="space-between" mt={1}>
                      <FormHelperText fontSize="xs" color={mutedTextColor} mb={0} textAlign="left">
                        Highlight key benefits and value proposition
                  </FormHelperText>
                      <Text 
                        fontSize="xs" 
                        color={campaignForm.adDescription.length >= 125 ? 'red.500' : mutedTextColor}
                        fontWeight="500"
                      >
                        {campaignForm.adDescription.length}/125
                      </Text>
                    </HStack>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel 
                      fontWeight="500" 
                      fontSize="xs" 
                      color={textColor}
                      mb={1.5}
                      textAlign="left"
                    >
                      Ad Image URL <Text as="span" color={mutedTextColor} fontWeight="400">(Optional)</Text>
                    </FormLabel>
                    <Input
                      value={campaignForm.adImageUrl}
                      onChange={(e) => setCampaignForm({ ...campaignForm, adImageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      borderRadius="7px"
                      size="md"
                      fontSize="sm"
                      borderColor={useColorModeValue('gray.200', 'gray.600')}
                      _hover={{ borderColor: 'blue.300' }}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
                      transition="all 0.2s"
                      textAlign="left"
                    />
                    <FormHelperText fontSize="xs" color={mutedTextColor} mt={1} textAlign="left">
                      URL to an image for your ad (1200x628px recommended)
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel 
                      fontWeight="500" 
                      fontSize="xs" 
                      color={textColor}
                      mb={1.5}
                      textAlign="left"
                    >
                      Call to Action
                    </FormLabel>
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<FiChevronDown />}
                        w="100%"
                        size="md"
                        borderRadius="7px"
                        borderColor={useColorModeValue('gray.200', 'gray.600')}
                        borderWidth="1px"
                        bg={cardBg}
                        color={textColor}
                        fontWeight="400"
                        fontSize="sm"
                        justifyContent="space-between"
                        textAlign="left"
                        _hover={{
                          borderColor: 'blue.300',
                          bg: useColorModeValue('gray.50', 'gray.700')
                        }}
                        _active={{
                          borderColor: 'blue.500',
                          bg: useColorModeValue('gray.50', 'gray.700')
                        }}
                        _focus={{
                          borderColor: 'blue.500',
                          boxShadow: '0 0 0 1px #3182CE'
                        }}
                        transition="all 0.2s"
                      >
                        <Text as="span" textAlign="left" w="100%">
                          {campaignForm.callToAction === 'LEARN_MORE' && 'Learn More'}
                          {campaignForm.callToAction === 'SHOP_NOW' && 'Shop Now'}
                          {campaignForm.callToAction === 'SIGN_UP' && 'Sign Up'}
                          {campaignForm.callToAction === 'DOWNLOAD' && 'Download'}
                          {campaignForm.callToAction === 'BOOK_TRAVEL' && 'Book Travel'}
                          {campaignForm.callToAction === 'CONTACT_US' && 'Contact Us'}
                        </Text>
                      </MenuButton>
                      <MenuList
                        borderRadius="7px"
                        borderColor={useColorModeValue('gray.200', 'gray.600')}
                        boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                        bg={cardBg}
                        py={1}
                        w="100%"
                        minW="unset"
                      >
                        {[
                          { value: 'LEARN_MORE', label: 'Learn More' },
                          { value: 'SHOP_NOW', label: 'Shop Now' },
                          { value: 'SIGN_UP', label: 'Sign Up' },
                          { value: 'DOWNLOAD', label: 'Download' },
                          { value: 'BOOK_TRAVEL', label: 'Book Travel' },
                          { value: 'CONTACT_US', label: 'Contact Us' }
                        ].map((option) => (
                          <MenuItem
                            key={option.value}
                            onClick={() => setCampaignForm({ ...campaignForm, callToAction: option.value })}
                            bg={campaignForm.callToAction === option.value ? 'blue.50' : 'transparent'}
                            color={campaignForm.callToAction === option.value ? 'blue.700' : textColor}
                            _hover={{
                              bg: campaignForm.callToAction === option.value ? 'blue.100' : useColorModeValue('gray.50', 'gray.700'),
                              transform: 'translateX(2px)'
                            }}
                            transition="all 0.15s ease"
                            borderRadius="4px"
                            mx={1}
                            my={0.5}
                            py={2}
                            w="100%"
                            fontWeight={campaignForm.callToAction === option.value ? '600' : '400'}
                            fontSize="sm"
                            textAlign="left"
                          >
                            {option.label}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                </FormControl>
              </VStack>
              )}
              
              {/* Step 3: AI Suggestions (Only shown if AI is enabled) */}
              {currentStep === 3 && campaignForm.useAI && (
                <VStack align="stretch" spacing={5}>
                  <Box
                    p={3}
                    borderRadius="7px"
                    bg={useColorModeValue('blue.50', 'blue.900')}
                    border="1px solid"
                    borderColor={useColorModeValue('blue.200', 'blue.700')}
                  >
                    <HStack justify="space-between" align="center">
                      <HStack spacing={2}>
                        <Box
                          p={1.5}
                          bg="blue.500"
                          borderRadius="5px"
                          color="white"
                        >
                          <FiStar size={14} />
                        </Box>
                        <VStack align="start" spacing={0.5}>
                          <Text fontWeight="600" fontSize="sm" color={textColor}>
                            AI-Generated Content
                          </Text>
                          <Text fontSize="xs" color={mutedTextColor}>
                            Review and select from AI-generated ad copy
                          </Text>
                        </VStack>
                      </HStack>
                      <Button
                        leftIcon={<FiStar />}
                        colorScheme="blue"
                        onClick={generateAISuggestions}
                        isLoading={isGeneratingAI}
                        borderRadius="7px"
                        size="sm"
                        fontSize="xs"
                        fontWeight="600"
                        _hover={{
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                        }}
                        transition="all 0.2s"
                      >
                        Generate
                      </Button>
                    </HStack>
                  </Box>
                  
                  {campaignForm.aiSuggestions.titles.length > 0 && (
                    <FormControl>
                      <FormLabel 
                        fontWeight="500" 
                        fontSize="xs" 
                        color={textColor}
                        mb={2}
                        textAlign="left"
                      >
                        Suggested Titles
                      </FormLabel>
                      <VStack align="stretch" spacing={2}>
                        {campaignForm.aiSuggestions.titles.map((title, idx) => (
                          <Button
                            key={idx}
                            variant={campaignForm.adTitle === title ? 'solid' : 'outline'}
                            colorScheme={campaignForm.adTitle === title ? 'blue' : 'gray'}
                            onClick={() => setCampaignForm({ ...campaignForm, adTitle: title })}
                            borderRadius="7px"
                            justifyContent="flex-start"
                            textAlign="left"
                            h="auto"
                            py={2.5}
                            px={3}
                            fontSize="sm"
                            borderWidth="1px"
                            borderColor={campaignForm.adTitle === title ? 'blue.500' : useColorModeValue('gray.200', 'gray.600')}
                            bg={campaignForm.adTitle === title ? 'blue.500' : cardBg}
                            color={campaignForm.adTitle === title ? 'white' : textColor}
                            _hover={{
                              borderColor: campaignForm.adTitle === title ? 'blue.600' : 'blue.300',
                              transform: 'translateX(2px)',
                              bg: campaignForm.adTitle === title ? 'blue.600' : useColorModeValue('gray.50', 'gray.700')
                            }}
                            transition="all 0.2s ease"
                            fontWeight={campaignForm.adTitle === title ? '600' : '400'}
                          >
                            <Text fontSize="sm" lineHeight="1.4" textAlign="left" w="100%">
                              {title}
                            </Text>
                          </Button>
                        ))}
                      </VStack>
                    </FormControl>
                  )}
                  
                  {campaignForm.aiSuggestions.descriptions.length > 0 && (
                    <FormControl>
                      <FormLabel 
                        fontWeight="500" 
                        fontSize="xs" 
                        color={textColor}
                        mb={2}
                        textAlign="left"
                      >
                        Suggested Descriptions
                      </FormLabel>
                      <VStack align="stretch" spacing={2}>
                        {campaignForm.aiSuggestions.descriptions.map((desc, idx) => (
                          <Button
                            key={idx}
                            variant={campaignForm.adDescription === desc ? 'solid' : 'outline'}
                            colorScheme={campaignForm.adDescription === desc ? 'blue' : 'gray'}
                            onClick={() => setCampaignForm({ ...campaignForm, adDescription: desc })}
                            borderRadius="7px"
                            justifyContent="flex-start"
                            textAlign="left"
                            h="auto"
                            py={2.5}
                            px={3}
                            fontSize="sm"
                            borderWidth="1px"
                            borderColor={campaignForm.adDescription === desc ? 'blue.500' : useColorModeValue('gray.200', 'gray.600')}
                            bg={campaignForm.adDescription === desc ? 'blue.500' : cardBg}
                            color={campaignForm.adDescription === desc ? 'white' : textColor}
                            _hover={{
                              borderColor: campaignForm.adDescription === desc ? 'blue.600' : 'blue.300',
                              transform: 'translateX(2px)',
                              bg: campaignForm.adDescription === desc ? 'blue.600' : useColorModeValue('gray.50', 'gray.700')
                            }}
                            transition="all 0.2s ease"
                            fontWeight={campaignForm.adDescription === desc ? '600' : '400'}
                          >
                            <Text fontSize="sm" lineHeight="1.4" textAlign="left" w="100%">
                              {desc}
                            </Text>
                          </Button>
                        ))}
                      </VStack>
                    </FormControl>
                  )}
                  
                  {campaignForm.aiSuggestions.titles.length === 0 && !isGeneratingAI && (
                    <Center py={10}>
                      <VStack spacing={3}>
                        <Box
                          p={4}
                          bg={useColorModeValue('blue.50', 'blue.900')}
                          borderRadius="full"
                          border="2px solid"
                          borderColor={useColorModeValue('blue.200', 'blue.700')}
                        >
                          <FiStar size={24} color="#3182CE" />
                        </Box>
                        <VStack spacing={1}>
                          <Text color={textColor} fontWeight="600" fontSize="sm">
                            Ready to generate suggestions?
                          </Text>
                          <Text color={mutedTextColor} textAlign="center" fontSize="xs" maxW="280px">
                            Click "Generate" to get AI-powered ad copy recommendations
                          </Text>
                        </VStack>
                      </VStack>
                    </Center>
                  )}
                </VStack>
              )}
              
              {/* Step 4/5: Review & Submit */}
              {((currentStep === 4 && !campaignForm.useAI) || (currentStep === 4 && campaignForm.useAI)) && (
                <VStack align="stretch" spacing={6}>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="700" fontSize="lg" color={textColor} letterSpacing="-0.01em">
                      Campaign Summary
                    </Text>
                    <Text fontSize="sm" color={mutedTextColor}>
                      Review your campaign details before submitting
                    </Text>
                  </VStack>
                  
                  <Box 
                    p={5} 
                    bg={useColorModeValue('gray.50', 'gray.800')} 
                    borderRadius="10px" 
                    border="1px solid"
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                  >
                    <SimpleGrid columns={2} spacing={5}>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs" color={mutedTextColor} fontWeight="500" textTransform="uppercase" letterSpacing="0.05em">
                          Campaign Name
                        </Text>
                        <Text fontWeight="600" fontSize="md" color={textColor}>
                          {campaignForm.name || 'Not set'}
                        </Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs" color={mutedTextColor} fontWeight="500" textTransform="uppercase" letterSpacing="0.05em">
                          Objective
                        </Text>
                        <Text fontWeight="600" fontSize="md" color={textColor}>
                          {campaignForm.objective}
                        </Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs" color={mutedTextColor} fontWeight="500" textTransform="uppercase" letterSpacing="0.05em">
                          Daily Budget
                        </Text>
                        <Text fontWeight="600" fontSize="md" color={textColor}>
                          {currencySymbol}{campaignForm.budget}
                        </Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs" color={mutedTextColor} fontWeight="500" textTransform="uppercase" letterSpacing="0.05em">
                          AI Optimization
                        </Text>
                        <Badge 
                          colorScheme={campaignForm.useAI ? 'green' : 'gray'}
                          borderRadius="6px"
                          px={2}
                          py={1}
                          fontSize="xs"
                        >
                          {campaignForm.useAI ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </VStack>
                    </SimpleGrid>
                  </Box>
                  
                  <Box 
                    p={5} 
                    bg={useColorModeValue('blue.50', 'blue.900')} 
                    borderRadius="10px" 
                    border="1px solid"
                    borderColor={useColorModeValue('blue.200', 'blue.700')}
                  >
                    <HStack spacing={2} mb={3}>
                      <Box
                        p={1.5}
                        bg="blue.500"
                        borderRadius="6px"
                        color="white"
                      >
                        <FiImage size={16} />
                      </Box>
                      <Text fontSize="sm" fontWeight="700" color={useColorModeValue('blue.900', 'blue.100')}>
                        Ad Preview
                      </Text>
                    </HStack>
                    <VStack align="start" spacing={3}>
                      <VStack align="start" spacing={1} w="100%">
                        <Text fontWeight="700" fontSize="md" color={textColor}>
                          {campaignForm.adTitle || 'Ad Title'}
                        </Text>
                        <Text fontSize="sm" color={mutedTextColor} lineHeight="1.6">
                          {campaignForm.adDescription || 'Ad description will appear here'}
                        </Text>
                      </VStack>
                      {campaignForm.adImageUrl && (
                        <Box 
                          w="100%" 
                          h="200px" 
                          bg={useColorModeValue('gray.200', 'gray.600')} 
                          borderRadius="8px" 
                          overflow="hidden"
                          border="1px solid"
                          borderColor={useColorModeValue('gray.300', 'gray.500')}
                        >
                          <img 
                            src={campaignForm.adImageUrl} 
                            alt="Ad preview" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </Box>
                      )}
                      <Badge 
                        colorScheme="blue" 
                        borderRadius="6px"
                        px={3}
                        py={1}
                        fontSize="xs"
                        fontWeight="600"
                      >
                        {campaignForm.callToAction.replace('_', ' ')}
                      </Badge>
                    </VStack>
                  </Box>
                  
                  <Alert 
                    status="info" 
                    borderRadius="8px"
                    border="1px solid"
                    borderColor={useColorModeValue('blue.200', 'blue.700')}
                    bg={useColorModeValue('blue.50', 'blue.900')}
                  >
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize="sm" fontWeight="600">Campaign will start paused</AlertTitle>
                      <AlertDescription fontSize="xs" mt={1}>
                        Review your campaign settings and activate it when ready
                      </AlertDescription>
                    </Box>
                  </Alert>
                </VStack>
              )}
            </ModalBody>
            
            <ModalFooter 
              pt={5}
              pb={6}
              px={6}
              borderTop="1px solid"
              borderColor={useColorModeValue('gray.100', 'gray.700')}
              position="sticky"
              bottom={0}
              zIndex={10}
              bg={cardBg}
              borderRadius="0 0 10px 10px"
            >
              <HStack spacing={3} w="100%" justify="space-between">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (currentStep > 1) {
                      setCurrentStep(currentStep - 1);
                    } else {
                      setCurrentStep(1);
                      setCampaignForm({
                        name: '',
                        objective: 'CONVERSIONS',
                        budget: 50,
                        targetAudience: '',
                        productInfo: '',
                        funnelId: '',
                        funnelUrl: '',
                        useAI: true,
                        adTitle: '',
                        adDescription: '',
                        adImageUrl: '',
                        callToAction: 'LEARN_MORE',
                        targeting: {
                          ageMin: 18,
                          ageMax: 65,
                          genders: [],
                          locations: [],
                          interests: []
                        },
                        schedule: {
                          startDate: null,
                          endDate: null
                        },
                        aiSuggestions: {
                          titles: [],
                          descriptions: [],
                          selectedTitle: '',
                          selectedDescription: ''
                        }
                      });
                      onCreateCampaignClose();
                    }
                  }}
                  borderRadius="8px"
                  fontWeight="500"
                  size="md"
                  _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                  transition="all 0.2s"
                >
                  {currentStep === 1 ? 'Cancel' : 'Back'}
              </Button>
                
                <HStack spacing={3}>
                  {(() => {
                    const maxStep = campaignForm.useAI ? 4 : 5;
                    const isLastStep = currentStep === maxStep;
                    
                    if (!isLastStep) {
                      return (
                        <Button
                          colorScheme="blue"
                          onClick={() => {
                            // Validate current step
                            if (currentStep === 1 && (!campaignForm.name || !campaignForm.objective || !campaignForm.budget)) {
                              showToast('Please fill in all required fields', 'error');
                              return;
                            }
                            if (currentStep === 2) {
                              if (campaignForm.useAI) {
                                if (!campaignForm.productInfo) {
                                  showToast('Please provide a campaign description', 'error');
                                  return;
                                }
                                // Auto-generate AI suggestions when moving to step 3
                                if (campaignForm.productInfo && campaignForm.aiSuggestions.titles.length === 0) {
                                  generateAISuggestions();
                                }
                              } else {
                                if (!campaignForm.targetAudience || !campaignForm.productInfo) {
                                  showToast('Please fill in target audience and product info', 'error');
                                  return;
                                }
                              }
                            }
                            if (currentStep === 3 && !campaignForm.useAI && (!campaignForm.adTitle || !campaignForm.adDescription)) {
                              showToast('Please add ad title and description', 'error');
                              return;
                            }
                            setCurrentStep(currentStep + 1);
                          }}
                          borderRadius="7px"
                          fontWeight="600"
                          size="sm"
                          px={5}
                          fontSize="sm"
                          _hover={{
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                          }}
                          _active={{
                            transform: 'translateY(0)'
                          }}
                          transition="all 0.2s"
                        >
                          Next
                        </Button>
                      );
                    } else {
                      return (
                        <Button
                          colorScheme="blue"
                          onClick={createCampaign}
                          isLoading={loading}
                          borderRadius="7px"
                          fontWeight="600"
                          size="sm"
                          px={5}
                          fontSize="sm"
                          leftIcon={<FiCheckCircle />}
                          _hover={{
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                          }}
                          _active={{
                            transform: 'translateY(0)'
                          }}
                          transition="all 0.2s"
                        >
                Create Campaign
              </Button>
                      );
                    }
                  })()}
                </HStack>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
        
        {/* AI Copy Generation Modal */}
        <Modal isOpen={isAICopyOpen} onClose={onAICopyClose} size="xl">
          <ModalOverlay />
          <ModalContent borderRadius="7px">
            <ModalHeader>
              <HStack>
                <Box as={FiStar} color="blue.500" />
                <Text>Generate AI Ad Copy</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="stretch" spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Target Audience</FormLabel>
                  <Input
                    value={aiCopyForm.targetAudience}
                    onChange={(e) => setAiCopyForm({ ...aiCopyForm, targetAudience: e.target.value })}
                    placeholder="e.g., Weight loss enthusiasts, 25-45 years"
                    borderRadius="7px"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Product/Offer Description</FormLabel>
                  <Textarea
                    value={aiCopyForm.productInfo}
                    onChange={(e) => setAiCopyForm({ ...aiCopyForm, productInfo: e.target.value })}
                    placeholder="Describe your product or offer..."
                    rows={4}
                    borderRadius="7px"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Campaign Objective</FormLabel>
                  <Select
                    value={aiCopyForm.campaignObjective}
                    onChange={(e) => setAiCopyForm({ ...aiCopyForm, campaignObjective: e.target.value })}
                    borderRadius="7px"
                  >
                    <option value="CONVERSIONS">Conversions</option>
                    <option value="LEAD_GENERATION">Lead Generation</option>
                    <option value="TRAFFIC">Website Traffic</option>
                    <option value="AWARENESS">Brand Awareness</option>
                  </Select>
                </FormControl>
                
                {generatedContent && (
                  <Box p={4} bg="blue.50" borderRadius="7px" borderWidth={1} borderColor="blue.200">
                    <Text fontWeight="bold" mb={2}>Generated Ad Copy:</Text>
                    <Text mb={3}>{generatedContent.headline || generatedContent.primaryCopy}</Text>
                    <Button
                      size="sm"
                      leftIcon={<FiCopy />}
                      colorScheme="blue"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedContent.headline || generatedContent.primaryCopy);
                        showToast('Copied to clipboard!', 'success');
                      }}
                      borderRadius="7px"
                    >
                      Copy
                    </Button>
                  </Box>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onAICopyClose} borderRadius="7px">
                Close
              </Button>
              <Button
                leftIcon={<FiStar />}
                colorScheme="blue"
                onClick={generateAICopy}
                isLoading={loading}
                borderRadius="7px"
              >
                Generate with AI
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        
        {/* Campaign Details Modal */}
        <Modal isOpen={isCampaignDetailsOpen} onClose={onCampaignDetailsClose} size="2xl">
          <ModalOverlay />
          <ModalContent borderRadius="7px">
            <ModalHeader>Campaign Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedCampaign && (
                <VStack align="stretch" spacing={4}>
                  <SimpleGrid columns={2} spacing={4}>
                    <Box>
                      <Text fontSize="sm" color={mutedTextColor}>Campaign Name</Text>
                      <Text fontWeight="bold">{selectedCampaign.name}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color={mutedTextColor}>Status</Text>
                      <Badge colorScheme={selectedCampaign.status === 'ACTIVE' ? 'green' : 'yellow'}>
                        {selectedCampaign.status}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color={mutedTextColor}>Budget</Text>
                      <Text fontWeight="bold">{currencySymbol}{selectedCampaign.budget || selectedCampaign.dailyBudget}/day</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color={mutedTextColor}>Objective</Text>
                      <Text fontWeight="bold">{selectedCampaign.objective}</Text>
                    </Box>
                  </SimpleGrid>
                  
                  <Divider />
                  
                  <HStack spacing={2}>
                    <Button
                      leftIcon={<FiZap />}
                      colorScheme="blue"
                      size="sm"
                      onClick={() => optimizeCampaign(selectedCampaign._id || selectedCampaign.id)}
                      isLoading={loading}
                      borderRadius="7px"
                    >
                      AI Optimize
                    </Button>
                  </HStack>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={onCampaignDetailsClose} borderRadius="7px">
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
    </Box>
  );
};

export default MarketingAds;
