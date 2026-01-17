
// MarketingDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Text,
  Button,
  Input,
  Select,
  Textarea,
  FormControl,
  FormLabel,
  FormHelperText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  Avatar,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  HStack,
  Divider,
  Image,
  SimpleGrid,
  useToast,
  Spinner,
  Progress,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Tag,
  TagLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Stack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tooltip,
  useColorModeValue,
  Switch,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Wrap,
  WrapItem,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer
} from '@chakra-ui/react';
import {
  FiPlus,
  FiRefreshCw,
  FiPlay,
  FiPause,
  FiBarChart2,
  FiTarget,
  FiImage,
  FiShare2,
  FiSettings,
  FiTrendingUp,
  FiDollarSign,
  FiUsers,
  FiEye,
  FiMousePointer,
  FiZap,
  FiStar,
  FiEdit3,
  FiTrash2,
  FiDownload,
  FiUpload,
  FiSend,
  FiCopy,
  FiExternalLink,
  FiChevronRight,
  FiFilter,
  FiSearch,
  FiCalendar,
  FiClock,
  FiTrendingDown,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';

const MarketingDashboard = () => {
  const { token, user } = useSelector(state => state.auth);
  const toast = useToast();
  
  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // API Base URL
  const BASE_URL = 'https://api.funnelseye.com';
  
  // Modal states
  const { isOpen: isCreateCampaignOpen, onOpen: onCreateCampaignOpen, onClose: onCreateCampaignClose } = useDisclosure();
  const { isOpen: isAIContentOpen, onOpen: onAIContentOpen, onClose: onAIContentClose } = useDisclosure();
  const { isOpen: isAIOptimizationOpen, onOpen: onAIOptimizationOpen, onClose: onAIOptimizationClose } = useDisclosure();
  const { isOpen: isAITargetingOpen, onOpen: onAITargetingOpen, onClose: onAITargetingClose } = useDisclosure();
  const { isOpen: isAIPosterOpen, onOpen: onAIPosterOpen, onClose: onAIPosterClose } = useDisclosure();
  const { isOpen: isAICampaignOpen, onOpen: onAICampaignOpen, onClose: onAICampaignClose } = useDisclosure();
  const { isOpen: isSocialShareOpen, onOpen: onSocialShareOpen, onClose: onSocialShareClose } = useDisclosure();
  const { isOpen: isUploadImageOpen, onOpen: onUploadImageOpen, onClose: onUploadImageClose } = useDisclosure();
  const { isOpen: isCreateAdSetOpen, onOpen: onCreateAdSetOpen, onClose: onCreateAdSetClose } = useDisclosure();
  const { isOpen: isCreateCreativeOpen, onOpen: onCreateCreativeOpen, onClose: onCreateCreativeClose } = useDisclosure();
  const { isOpen: isCreateAdOpen, onOpen: onCreateAdOpen, onClose: onCreateAdClose } = useDisclosure();
  const { isOpen: isAnalyticsOpen, onOpen: onAnalyticsOpen, onClose: onAnalyticsClose } = useDisclosure();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [adSets, setAdSets] = useState([]);
  const [creatives, setCreatives] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Form states
  const [campaignForm, setCampaignForm] = useState({
    coachMetaAccountId: '',
    campaignData: {
      name: '',
      objective: 'LEAD_GENERATION',
      dailyBudget: 50,
      targetAudience: '',
      productInfo: ''
    },
    useAI: true
  });

  const [aiContentForm, setAiContentForm] = useState({
    targetAudience: '',
    productInfo: '',
    campaignObjective: 'CONVERSIONS',
    tone: 'professional',
    platform: 'facebook',
    customPrompt: ''
  });

  const [aiOptimizationForm, setAiOptimizationForm] = useState({
    campaignId: '',
    optimizationType: 'budget',
    targetMetrics: ['cpc', 'ctr', 'conversion_rate'],
    budgetLimit: 1000
  });

  const [aiTargetingForm, setAiTargetingForm] = useState({
    targetAudience: '',
    budget: 100
  });

  const [aiPosterForm, setAiPosterForm] = useState({
    coachName: '',
    niche: '',
    offer: '',
    targetAudience: 'weight_loss'
  });

  const [aiCampaignForm, setAiCampaignForm] = useState({
    coachName: '',
    niche: '',
    offer: '',
    targetAudience: 'weight_loss',
    campaignDuration: 7,
    dailyBudget: 50
  });

  const [socialShareForm, setSocialShareForm] = useState({
    imageUrl: '',
    caption: '',
    coachMetaAccountId: ''
  });

  const [imageUploadForm, setImageUploadForm] = useState({
    imageUrl: ''
  });

  const [adSetForm, setAdSetForm] = useState({
    name: '',
    targeting: {
      age_min: 25,
      age_max: 45,
      geo_locations: {
        countries: ['US']
      }
    },
    daily_budget: 2500
  });

  const [creativeForm, setCreativeForm] = useState({
    name: '',
    object_story_spec: {
      link_data: {
        link: '',
        message: '',
        image_hash: '',
        call_to_action: {
          type: 'LEARN_MORE'
        }
      }
    }
  });

  const [adForm, setAdForm] = useState({
    name: '',
    adset_id: '',
    creative: {
      creative_id: ''
    },
    status: 'PAUSED'
  });

  const [generatedContent, setGeneratedContent] = useState({
    headlines: [],
    descriptions: [],
    socialPosts: [],
    images: [],
    variations: [],
    posters: [],
    campaign: null
  });

  const [analytics, setAnalytics] = useState(null);
  const [aiResults, setAiResults] = useState({
    optimization: null,
    targeting: null,
    insights: null,
    anomalies: null
  });

  // API Headers
  const getHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'X-Coach-ID': user?.id || '',
    'Content-Type': 'application/json',
  });

  // Utility functions
  const showToast = (status, title, description) => {
    toast({
      title,
      description,
      status,
      duration: 5000,
      isClosable: true,
      position: 'top-right'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  // API Functions - Marketing & Advertising
  const fetchCampaigns = async () => {
    setLoading(true);
    setStatsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ads`, {
        headers: getHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setCampaigns(data.data || []);
        showToast('success', 'Success', 'Campaigns loaded successfully');
      } else {
        throw new Error(data.message || 'Failed to fetch campaigns');
      }
    } catch (error) {
      console.error('Fetch campaigns error:', error);
      showToast('error', 'Error', 'Failed to fetch campaigns');
      // Mock data for demo
      setCampaigns([
        {
          id: '1',
          name: 'Lead Generation Campaign',
          objective: 'LEAD_GENERATION',
          status: 'ACTIVE',
          budget: 5000,
          spend: 1200,
          currency: 'USD'
        },
        {
          id: '2',
          name: 'Brand Awareness Campaign',
          objective: 'REACH',
          status: 'PAUSED',
          budget: 3000,
          spend: 800,
          currency: 'USD'
        }
      ]);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  const createCampaign = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ads/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(campaignForm)
      });
      const data = await response.json();
      
      if (data.success) {
        showToast('success', 'Success', 'Campaign created successfully');
        onCreateCampaignClose();
        fetchCampaigns();
        resetCampaignForm();
      } else {
        throw new Error(data.message || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Create campaign error:', error);
      showToast('error', 'Error', 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const syncCampaigns = async () => {
    if (!campaignForm.coachMetaAccountId) {
      showToast('error', 'Error', 'Please enter Meta Account ID first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ads/sync`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ coachMetaAccountId: campaignForm.coachMetaAccountId })
      });
      const data = await response.json();
      
      if (data.success) {
        showToast('success', 'Success', 'Campaigns synced successfully');
        fetchCampaigns();
      } else {
        throw new Error(data.message || 'Failed to sync campaigns');
      }
    } catch (error) {
      console.error('Sync campaigns error:', error);
      showToast('error', 'Error', 'Failed to sync campaigns');
    } finally {
      setLoading(false);
    }
  };

  const pauseCampaign = async (campaignId) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ads/${campaignId}/pause`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        showToast('success', 'Success', 'Campaign paused successfully');
        fetchCampaigns();
      } else {
        throw new Error(data.message || 'Failed to pause campaign');
      }
    } catch (error) {
      console.error('Pause campaign error:', error);
      showToast('error', 'Error', 'Failed to pause campaign');
    } finally {
      setLoading(false);
    }
  };

  const resumeCampaign = async (campaignId) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ads/${campaignId}/resume`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        showToast('success', 'Success', 'Campaign resumed successfully');
        fetchCampaigns();
      } else {
        throw new Error(data.message || 'Failed to resume campaign');
      }
    } catch (error) {
      console.error('Resume campaign error:', error);
      showToast('error', 'Error', 'Failed to resume campaign');
    } finally {
      setLoading(false);
    }
  };

  const getCampaignAnalytics = async (campaignId) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ads/${campaignId}/analytics`, {
        headers: getHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
        onAnalyticsOpen();
        showToast('success', 'Success', 'Analytics loaded successfully');
      } else {
        throw new Error(data.message || 'Failed to get analytics');
      }
    } catch (error) {
      console.error('Get analytics error:', error);
      showToast('error', 'Error', 'Failed to get analytics');
      // Mock analytics data
      setAnalytics({
        impressions: 12500,
        clicks: 450,
        ctr: 3.6,
        cpc: 2.45,
        conversions: 23,
        cost: 1102.50
      });
      onAnalyticsOpen();
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ads/upload-image`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(imageUploadForm)
      });
      const data = await response.json();
      
      if (data.success) {
        showToast('success', 'Success', `Image uploaded! Hash: ${data.data.imageHash}`);
        setCreativeForm(prev => ({
          ...prev,
          object_story_spec: {
            ...prev.object_story_spec,
            link_data: {
              ...prev.object_story_spec.link_data,
              image_hash: data.data.imageHash
            }
          }
        }));
        onUploadImageClose();
      } else {
        throw new Error(data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload image error:', error);
      showToast('error', 'Error', 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const createAdSet = async () => {
    if (!selectedCampaign) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ads/${selectedCampaign}/ad-sets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(adSetForm)
      });
      const data = await response.json();
      
      if (data.success) {
        showToast('success', 'Success', 'Ad Set created successfully');
        onCreateAdSetClose();
        fetchCampaignDetails(selectedCampaign);
        resetAdSetForm();
      } else {
        throw new Error(data.message || 'Failed to create ad set');
      }
    } catch (error) {
      console.error('Create ad set error:', error);
      showToast('error', 'Error', 'Failed to create ad set');
    } finally {
      setLoading(false);
    }
  };

  const createCreative = async () => {
    if (!selectedCampaign) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ads/${selectedCampaign}/creatives`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(creativeForm)
      });
      const data = await response.json();
      
      if (data.success) {
        showToast('success', 'Success', 'Creative created successfully');
        onCreateCreativeClose();
        fetchCampaignDetails(selectedCampaign);
        resetCreativeForm();
      } else {
        throw new Error(data.message || 'Failed to create creative');
      }
    } catch (error) {
      console.error('Create creative error:', error);
      showToast('error', 'Error', 'Failed to create creative');
    } finally {
      setLoading(false);
    }
  };

  const createAd = async () => {
    if (!selectedCampaign) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ads/${selectedCampaign}/ads`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(adForm)
      });
      const data = await response.json();
      
      if (data.success) {
        showToast('success', 'Success', 'Ad created successfully');
        onCreateAdClose();
        fetchCampaignDetails(selectedCampaign);
        resetAdForm();
      } else {
        throw new Error(data.message || 'Failed to create ad');
      }
    } catch (error) {
      console.error('Create ad error:', error);
      showToast('error', 'Error', 'Failed to create ad');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignDetails = async (campaignId) => {
    setSelectedCampaign(campaignId);
    setLoading(true);
    
    try {
      // Fetch ad sets
      const adSetsResponse = await fetch(`${BASE_URL}/api/ads/${campaignId}/ad-sets`, {
        headers: getHeaders()
      });
      const adSetsData = await adSetsResponse.json();
      
      // Fetch creatives
      const creativesResponse = await fetch(`${BASE_URL}/api/ads/${campaignId}/creatives`, {
        headers: getHeaders()
      });
      const creativesData = await creativesResponse.json();
      
      // Fetch ads
      const adsResponse = await fetch(`${BASE_URL}/api/ads/${campaignId}/ads`, {
        headers: getHeaders()
      });
      const adsData = await adsResponse.json();
      
      if (adSetsData.success) setAdSets(adSetsData.data || []);
      if (creativesData.success) setCreatives(creativesData.data || []);
      if (adsData.success) setAds(adsData.data || []);
      
      setActiveTab(1); // Switch to ad sets tab
      
    } catch (error) {
      console.error('Fetch campaign details error:', error);
      showToast('error', 'Error', 'Failed to fetch campaign details');
      // Mock data for demo
      setAdSets([{ id: '1', name: 'Test Ad Set', status: 'ACTIVE', daily_budget: 2500 }]);
      setCreatives([{ id: '1', name: 'Test Creative', status: 'ACTIVE' }]);
      setAds([{ id: '1', name: 'Test Ad', status: 'ACTIVE' }]);
      setActiveTab(1);
    } finally {
      setLoading(false);
    }
  };

  // AI Functions
  const generateAICopy = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ai-ads/generate-copy`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(aiContentForm)
      });
      const data = await response.json();
      
      if (data.success) {
        setGeneratedContent(prev => ({
          ...prev,
          headlines: data.data.headlines || [],
          descriptions: data.data.descriptions || []
        }));
        showToast('success', 'Success', 'AI copy generated successfully');
      } else {
        throw new Error(data.message || 'Failed to generate AI copy');
      }
    } catch (error) {
      console.error('Generate AI copy error:', error);
      showToast('error', 'Error', 'Failed to generate AI copy');
      // Mock data
      setGeneratedContent(prev => ({
        ...prev,
        headlines: [
          'Transform Your Life with Our Expert Program',
          'Unlock Your Potential Today',
          'Join Thousands of Success Stories'
        ],
        descriptions: [
          'Discover proven strategies to achieve your goals',
          'Learn from industry experts',
          'Get results in just 12 weeks'
        ]
      }));
    } finally {
      setLoading(false);
    }
  };

  const optimizeCampaignBudget = async () => {
    if (!aiOptimizationForm.campaignId) {
      showToast('error', 'Error', 'Please select a campaign');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ai-ads/optimize-budget/${aiOptimizationForm.campaignId}`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setAiResults(prev => ({ ...prev, optimization: data.data }));
        showToast('success', 'Success', 'Budget optimized successfully');
      } else {
        throw new Error(data.message || 'Failed to optimize budget');
      }
    } catch (error) {
      console.error('Optimize budget error:', error);
      showToast('error', 'Error', 'Failed to optimize budget');
    } finally {
      setLoading(false);
    }
  };

  const detectAnomalies = async (campaignId) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ai-ads/detect-anomalies/${campaignId}`, {
        headers: getHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setAiResults(prev => ({ ...prev, anomalies: data.data }));
        showToast('success', 'Success', 'Anomalies detected successfully');
      } else {
        throw new Error(data.message || 'Failed to detect anomalies');
      }
    } catch (error) {
      console.error('Detect anomalies error:', error);
      showToast('error', 'Error', 'Failed to detect anomalies');
    } finally {
      setLoading(false);
    }
  };

  const getTargetingRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ai-ads/targeting-recommendations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(aiTargetingForm)
      });
      const data = await response.json();
      
      if (data.success) {
        setAiResults(prev => ({ ...prev, targeting: data.data }));
        showToast('success', 'Success', 'Targeting recommendations generated');
      } else {
        throw new Error(data.message || 'Failed to get targeting recommendations');
      }
    } catch (error) {
      console.error('Get targeting recommendations error:', error);
      showToast('error', 'Error', 'Failed to get targeting recommendations');
    } finally {
      setLoading(false);
    }
  };

  const autoOptimizeCampaign = async (campaignId) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ai-ads/auto-optimize/${campaignId}`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        showToast('success', 'Success', 'Campaign auto-optimized successfully');
        fetchCampaigns();
      } else {
        throw new Error(data.message || 'Failed to auto-optimize campaign');
      }
    } catch (error) {
      console.error('Auto-optimize campaign error:', error);
      showToast('error', 'Error', 'Failed to auto-optimize campaign');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceInsights = async (campaignId) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ai-ads/performance-insights/${campaignId}`, {
        headers: getHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setAiResults(prev => ({ ...prev, insights: data.data }));
        showToast('success', 'Success', 'Performance insights retrieved');
      } else {
        throw new Error(data.message || 'Failed to get performance insights');
      }
    } catch (error) {
      console.error('Get performance insights error:', error);
      showToast('error', 'Error', 'Failed to get performance insights');
    } finally {
      setLoading(false);
    }
  };

  const createOptimizedCampaign = async () => {
    setLoading(true);
    try {
      const requestData = {
        name: `${aiCampaignForm.coachName} - ${aiCampaignForm.niche} Campaign`,
        objective: 'CONVERSIONS',
        targetAudience: aiCampaignForm.targetAudience,
        budget: aiCampaignForm.dailyBudget,
        productInfo: aiCampaignForm.offer
      };

      const response = await fetch(`${BASE_URL}/api/ai-ads/create-optimized-campaign`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(requestData)
      });
      const data = await response.json();
      
      if (data.success) {
        showToast('success', 'Success', 'AI-optimized campaign created successfully');
        onAICampaignClose();
        fetchCampaigns();
        resetAiCampaignForm();
      } else {
        throw new Error(data.message || 'Failed to create optimized campaign');
      }
    } catch (error) {
      console.error('Create optimized campaign error:', error);
      showToast('error', 'Error', 'Failed to create optimized campaign');
    } finally {
      setLoading(false);
    }
  };

  const bulkOptimizeCampaigns = async (campaignIds) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ai-ads/bulk-optimize`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ campaignIds })
      });
      const data = await response.json();
      
      if (data.success) {
        showToast('success', 'Success', 'Bulk optimization completed');
        fetchCampaigns();
      } else {
        throw new Error(data.message || 'Failed to bulk optimize');
      }
    } catch (error) {
      console.error('Bulk optimize error:', error);
      showToast('error', 'Error', 'Failed to bulk optimize');
    } finally {
      setLoading(false);
    }
  };

  const generateVariations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ai-ads/generate-variations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          originalAdCopy: aiContentForm.productInfo,
          targetAudience: aiContentForm.targetAudience,
          variationCount: 5
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setGeneratedContent(prev => ({
          ...prev,
          variations: data.data.variations || []
        }));
        showToast('success', 'Success', 'Variations generated successfully');
      } else {
        throw new Error(data.message || 'Failed to generate variations');
      }
    } catch (error) {
      console.error('Generate variations error:', error);
      showToast('error', 'Error', 'Failed to generate variations');
    } finally {
      setLoading(false);
    }
  };

  const generatePoster = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ai-ads/generate-poster`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(aiPosterForm)
      });
      const data = await response.json();
      
      if (data.success) {
        setGeneratedContent(prev => ({
          ...prev,
          posters: [data.data.posterUrl]
        }));
        showToast('success', 'Success', 'Poster generated successfully');
      } else {
        throw new Error(data.message || 'Failed to generate poster');
      }
    } catch (error) {
      console.error('Generate poster error:', error);
      showToast('error', 'Error', 'Failed to generate poster');
    } finally {
      setLoading(false);
    }
  };

  const generatePosterVariations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ai-ads/generate-poster-variations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ...aiPosterForm, variationCount: 3 })
      });
      const data = await response.json();
      
      if (data.success) {
        setGeneratedContent(prev => ({
          ...prev,
          posters: data.data.variations.map(v => v.posterUrl)
        }));
        showToast('success', 'Success', 'Poster variations generated');
      } else {
        throw new Error(data.message || 'Failed to generate poster variations');
      }
    } catch (error) {
      console.error('Generate poster variations error:', error);
      showToast('error', 'Error', 'Failed to generate poster variations');
    } finally {
      setLoading(false);
    }
  };

  const generateHeadlines = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ai-ads/generate-headlines`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ...aiPosterForm, headlineCount: 5 })
      });
      const data = await response.json();
      
      if (data.success) {
        setGeneratedContent(prev => ({
          ...prev,
          headlines: data.data.headlines || []
        }));
        showToast('success', 'Success', 'Headlines generated successfully');
      } else {
        throw new Error(data.message || 'Failed to generate headlines');
      }
    } catch (error) {
      console.error('Generate headlines error:', error);
      showToast('error', 'Error', 'Failed to generate headlines');
    } finally {
      setLoading(false);
    }
  };

  const generateSocialPost = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ai-ads/generate-social-post`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(aiPosterForm)
      });
      const data = await response.json();
      
      if (data.success) {
        setGeneratedContent(prev => ({
          ...prev,
          socialPosts: [data.data.socialPost]
        }));
        showToast('success', 'Success', 'Social post generated successfully');
      } else {
        throw new Error(data.message || 'Failed to generate social post');
      }
    } catch (error) {
      console.error('Generate social post error:', error);
      showToast('error', 'Error', 'Failed to generate social post');
    } finally {
      setLoading(false);
    }
  };

  const uploadToInstagram = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ai-ads/upload-to-instagram`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(socialShareForm)
      });
      const data = await response.json();
      
      if (data.success) {
        showToast('success', 'Success', 'Content uploaded to Instagram successfully');
        onSocialShareClose();
        resetSocialShareForm();
      } else {
        throw new Error(data.message || 'Failed to upload to Instagram');
      }
    } catch (error) {
      console.error('Upload to Instagram error:', error);
      showToast('error', 'Error', 'Failed to upload to Instagram');
    } finally {
      setLoading(false);
    }
  };

  const generateCampaign = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ai-ads/generate-campaign`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(aiCampaignForm)
      });
      const data = await response.json();
      
      if (data.success) {
        setGeneratedContent(prev => ({
          ...prev,
          campaign: data.data
        }));
        showToast('success', 'Success', 'Campaign package generated successfully');
      } else {
        throw new Error(data.message || 'Failed to generate campaign');
      }
    } catch (error) {
      console.error('Generate campaign error:', error);
      showToast('error', 'Error', 'Failed to generate campaign');
    } finally {
      setLoading(false);
    }
  };

  const getSocialMediaHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ai-ads/social-media-history`, {
        headers: getHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        console.log('Social Media History:', data.data);
        showToast('success', 'Success', 'Social media history retrieved');
      } else {
        throw new Error(data.message || 'Failed to get social media history');
      }
    } catch (error) {
      console.error('Get social media history error:', error);
      showToast('error', 'Error', 'Failed to get social media history');
    } finally {
      setLoading(false);
    }
  };

  // Reset form functions
  const resetCampaignForm = () => {
    setCampaignForm({
      coachMetaAccountId: '',
      campaignData: {
        name: '',
        objective: 'LEAD_GENERATION',
        dailyBudget: 50,
        targetAudience: '',
        productInfo: ''
      },
      useAI: true
    });
  };

  const resetAdSetForm = () => {
    setAdSetForm({
      name: '',
      targeting: {
        age_min: 25,
        age_max: 45,
        geo_locations: {
          countries: ['US']
        }
      },
      daily_budget: 2500
    });
  };

  const resetCreativeForm = () => {
    setCreativeForm({
      name: '',
      object_story_spec: {
        link_data: {
          link: '',
          message: '',
          image_hash: '',
          call_to_action: {
            type: 'LEARN_MORE'
          }
        }
      }
    });
  };

  const resetAdForm = () => {
    setAdForm({
      name: '',
      adset_id: '',
      creative: {
        creative_id: ''
      },
      status: 'PAUSED'
    });
  };

  const resetAiCampaignForm = () => {
    setAiCampaignForm({
      coachName: '',
      niche: '',
      offer: '',
      targetAudience: 'weight_loss',
      campaignDuration: 7,
      dailyBudget: 50
    });
  };

  const resetSocialShareForm = () => {
    setSocialShareForm({
      imageUrl: '',
      caption: '',
      coachMetaAccountId: ''
    });
  };

  // Load data on component mount
  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Test Heading */}
      <Box bg="red.500" color="white" py={8} textAlign="center">
        <Text fontSize="6xl" fontWeight="bold">Varun Kumar</Text>
      </Box>
      
      {/* Header */}
      <Box bg="white" shadow="sm" borderBottom="1px" borderColor={borderColor}>
        <Container maxW="7xl" py={4}>
          <Flex justify="space-between" align="center">
            <HStack spacing={4}>
              <Box
                w={12}
                h={12}
                bg="gradient(135deg, #667eea 0%, #764ba2 100%)"
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiBarChart2 color="white" size={24} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                  Marketing & Advertising
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Create and manage your Meta advertising campaigns
                </Text>
              </VStack>
            </HStack>
            
            <HStack spacing={3}>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                variant="solid"
                onClick={onCreateCampaignOpen}
                size="md"
              >
                Create Campaign
              </Button>
              <Button
                leftIcon={<FiZap />}
                colorScheme="purple"
                variant="solid"
                onClick={onAIContentOpen}
                size="md"
              >
                AI Content
              </Button>
              <Button
                leftIcon={<FiSettings />}
                colorScheme="teal"
                variant="solid"
                onClick={onAIOptimizationOpen}
                size="md"
              >
                AI Optimize
              </Button>
              <IconButton
                icon={<FiRefreshCw />}
                onClick={fetchCampaigns}
                variant="outline"
                isLoading={loading}
                aria-label="Refresh campaigns"
              />
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxW="7xl" py={6}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card bg={cardBg} shadow="sm" borderRadius="xl">
            <CardBody>
              <Stat>
                <Flex justify="space-between" align="start">
                  <Box>
                    <StatLabel color="gray.600" fontSize="sm">Total Campaigns</StatLabel>
                    <StatNumber fontSize="2xl" fontWeight="bold">
                      {statsLoading ? <Spinner size="sm" /> : campaigns.length}
                    </StatNumber>
                  </Box>
                  <Box p={2} bg="blue.50" borderRadius="lg">
                    <FiBarChart2 color="#3182CE" size={20} />
                  </Box>
                </Flex>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="sm" borderRadius="xl">
            <CardBody>
              <Stat>
                <Flex justify="space-between" align="start">
                  <Box>
                    <StatLabel color="gray.600" fontSize="sm">Active Campaigns</StatLabel>
                    <StatNumber fontSize="2xl" fontWeight="bold" color="green.500">
                      {statsLoading ? <Spinner size="sm" /> : campaigns.filter(c => c.status === 'ACTIVE').length}
                    </StatNumber>
                  </Box>
                  <Box p={2} bg="green.50" borderRadius="lg">
                    <FiTrendingUp color="#38A169" size={20} />
                  </Box>
                </Flex>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="sm" borderRadius="xl">
            <CardBody>
              <Stat>
                <Flex justify="space-between" align="start">
                  <Box>
                    <StatLabel color="gray.600" fontSize="sm">Total Spend</StatLabel>
                    <StatNumber fontSize="2xl" fontWeight="bold">
                      {statsLoading ? <Spinner size="sm" /> : formatCurrency(campaigns.reduce((sum, c) => sum + (c.spend || 0), 0))}
                    </StatNumber>
                  </Box>
                  <Box p={2} bg="red.50" borderRadius="lg">
                    <FiDollarSign color="#E53E3E" size={20} />
                  </Box>
                </Flex>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="sm" borderRadius="xl">
            <CardBody>
              <Stat>
                <Flex justify="space-between" align="start">
                  <Box>
                    <StatLabel color="gray.600" fontSize="sm">Total Budget</StatLabel>
                    <StatNumber fontSize="2xl" fontWeight="bold">
                      {statsLoading ? <Spinner size="sm" /> : formatCurrency(campaigns.reduce((sum, c) => sum + (c.budget || 0), 0))}
                    </StatNumber>
                  </Box>
                  <Box p={2} bg="purple.50" borderRadius="lg">
                    <FiTarget color="#805AD5" size={20} />
                  </Box>
                </Flex>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Main Content */}
        <Tabs index={activeTab} onChange={setActiveTab} colorScheme="blue">
          <TabList bg={cardBg} borderRadius="xl" p={2} mb={6}>
            <Tab borderRadius="lg" fontWeight="medium">
              <HStack spacing={2}>
                <FiBarChart2 />
                <Text>Campaigns</Text>
                <Badge colorScheme="blue" borderRadius="full">{campaigns.length}</Badge>
              </HStack>
            </Tab>
            {selectedCampaign && (
              <>
                <Tab borderRadius="lg" fontWeight="medium">
                  <HStack spacing={2}>
                    <FiTarget />
                    <Text>Ad Sets</Text>
                    <Badge colorScheme="green" borderRadius="full">{adSets.length}</Badge>
                  </HStack>
                </Tab>
                <Tab borderRadius="lg" fontWeight="medium">
                  <HStack spacing={2}>
                    <FiImage />
                    <Text>Creatives</Text>
                    <Badge colorScheme="purple" borderRadius="full">{creatives.length}</Badge>
                  </HStack>
                </Tab>
                <Tab borderRadius="lg" fontWeight="medium">
                  <HStack spacing={2}>
                    <FiMousePointer />
                    <Text>Ads</Text>
                    <Badge colorScheme="orange" borderRadius="full">{ads.length}</Badge>
                  </HStack>
                </Tab>
              </>
            )}
          </TabList>

          <TabPanels>
            {/* Campaigns Tab */}
            <TabPanel p={0}>
              <Card bg={cardBg} shadow="sm" borderRadius="xl">
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="lg" fontWeight="bold">Ad Campaigns</Text>
                      <Text fontSize="sm" color="gray.600">Manage your Meta advertising campaigns</Text>
                    </VStack>
                    <HStack spacing={3}>
                      <InputGroup maxW="300px">
                        <InputLeftElement pointerEvents="none">
                          <FiSearch color="gray.400" />
                        </InputLeftElement>
                        <Input placeholder="Search campaigns..." />
                      </InputGroup>
                      <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onCreateCampaignOpen}>
                        New Campaign
                      </Button>
                    </HStack>
                  </Flex>
                </CardHeader>
                <CardBody>
                  {loading ? (
                    <VStack spacing={4} py={8}>
                      <Spinner size="lg" color="blue.500" />
                      <Text>Loading campaigns...</Text>
                    </VStack>
                  ) : campaigns.length === 0 ? (
                    <VStack spacing={6} py={12}>
                      <Box
                        w={20}
                        h={20}
                        bg="gray.100"
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FiBarChart2 size={40} color="gray.400" />
                      </Box>
                      <VStack spacing={2}>
                        <Text fontSize="xl" fontWeight="semibold" color="gray.600">
                          No campaigns found
                        </Text>
                        <Text color="gray.500" textAlign="center">
                          Create your first advertising campaign to get started
                        </Text>
                      </VStack>
                      <Button leftIcon={<FiPlus />} colorScheme="blue" size="lg" onClick={onCreateCampaignOpen}>
                        Create First Campaign
                      </Button>
                    </VStack>
                  ) : (
                    <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={6}>
                      {campaigns.map((campaign) => (
                        <Card key={campaign.id} bg="white" shadow="md" borderRadius="xl" border="1px" borderColor="gray.100">
                          <CardBody>
                            <VStack align="start" spacing={4}>
                              <Flex justify="space-between" align="start" w="full">
                                <VStack align="start" spacing={1} flex={1}>
                                  <Text fontSize="lg" fontWeight="bold" noOfLines={2}>
                                    {campaign.name}
                                  </Text>
                                  <HStack spacing={2}>
                                    <Badge colorScheme="blue" fontSize="xs">
                                      {campaign.objective}
                                    </Badge>
                                    <Badge 
                                      colorScheme={campaign.status === 'ACTIVE' ? 'green' : 'gray'} 
                                      fontSize="xs"
                                    >
                                      {campaign.status}
                                    </Badge>
                                  </HStack>
                                </VStack>
                              </Flex>

                              <SimpleGrid columns={2} spacing={4} w="full">
                                <Box>
                                  <Text fontSize="xs" color="gray.500" mb={1}>Budget</Text>
                                  <Text fontSize="md" fontWeight="semibold">
                                    {formatCurrency(campaign.budget)}
                                  </Text>
                                </Box>
                                <Box>
                                  <Text fontSize="xs" color="gray.500" mb={1}>Spend</Text>
                                  <Text fontSize="md" fontWeight="semibold" color="red.500">
                                    {formatCurrency(campaign.spend)}
                                  </Text>
                                </Box>
                              </SimpleGrid>

                              <Progress 
                                value={(campaign.spend / campaign.budget) * 100} 
                                colorScheme="blue" 
                                size="sm" 
                                w="full"
                                borderRadius="full"
                              />

                              <Wrap spacing={2} w="full">
                                <WrapItem>
                                  <Button
                                    size="sm"
                                    leftIcon={<FiEye />}
                                    onClick={() => fetchCampaignDetails(campaign.id)}
                                    variant="outline"
                                  >
                                    Details
                                  </Button>
                                </WrapItem>
                                <WrapItem>
                                  <Button
                                    size="sm"
                                    leftIcon={<FiBarChart2 />}
                                    onClick={() => getCampaignAnalytics(campaign.id)}
                                    variant="outline"
                                    colorScheme="purple"
                                  >
                                    Analytics
                                  </Button>
                                </WrapItem>
                                <WrapItem>
                                  {campaign.status === 'PAUSED' ? (
                                    <Button
                                      size="sm"
                                      leftIcon={<FiPlay />}
                                      onClick={() => resumeCampaign(campaign.id)}
                                      colorScheme="green"
                                      variant="outline"
                                    >
                                      Resume
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      leftIcon={<FiPause />}
                                      onClick={() => pauseCampaign(campaign.id)}
                                      colorScheme="orange"
                                      variant="outline"
                                    >
                                      Pause
                                    </Button>
                                  )}
                                </WrapItem>
                                <WrapItem>
                                  <Tooltip label="AI Optimize">
                                    <IconButton
                                      size="sm"
                                      icon={<FiZap />}
                                      onClick={() => {
                                        setAiOptimizationForm(prev => ({ ...prev, campaignId: campaign.id }));
                                        onAIOptimizationOpen();
                                      }}
                                      colorScheme="purple"
                                      variant="outline"
                                      aria-label="AI Optimize"
                                    />
                                  </Tooltip>
                                </WrapItem>
                              </Wrap>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Ad Sets Tab */}
            <TabPanel p={0}>
              <Card bg={cardBg} shadow="sm" borderRadius="xl">
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Breadcrumb separator={<FiChevronRight color="gray.400" />}>
                        <BreadcrumbItem>
                          <BreadcrumbLink onClick={() => setActiveTab(0)}>Campaigns</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                          <BreadcrumbLink>Ad Sets</BreadcrumbLink>
                        </BreadcrumbItem>
                      </Breadcrumb>
                      <Text fontSize="sm" color="gray.600">
                        Manage targeting and budget for campaign: {selectedCampaign}
                      </Text>
                    </VStack>
                    <Button leftIcon={<FiPlus />} colorScheme="green" onClick={onCreateAdSetOpen}>
                      New Ad Set
                    </Button>
                  </Flex>
                </CardHeader>
                <CardBody>
                  {loading ? (
                    <VStack spacing={4} py={8}>
                      <Spinner size="lg" color="green.500" />
                      <Text>Loading ad sets...</Text>
                    </VStack>
                  ) : adSets.length === 0 ? (
                    <VStack spacing={6} py={12}>
                      <Box
                        w={20}
                        h={20}
                        bg="gray.100"
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FiTarget size={40} color="gray.400" />
                      </Box>
                      <VStack spacing={2}>
                        <Text fontSize="xl" fontWeight="semibold" color="gray.600">
                          No ad sets found
                        </Text>
                        <Text color="gray.500" textAlign="center">
                          Create your first ad set to define targeting and budget
                        </Text>
                      </VStack>
                      <Button leftIcon={<FiPlus />} colorScheme="green" size="lg" onClick={onCreateAdSetOpen}>
                        Create Ad Set
                      </Button>
                    </VStack>
                  ) : (
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                      {adSets.map((adSet) => (
                        <Card key={adSet.id} bg="white" shadow="md" borderRadius="xl" border="1px" borderColor="gray.100">
                          <CardBody>
                            <VStack align="start" spacing={4}>
                              <Flex justify="space-between" align="start" w="full">
                                <Text fontSize="lg" fontWeight="bold">{adSet.name}</Text>
                                <Badge colorScheme={adSet.status === 'ACTIVE' ? 'green' : 'gray'}>
                                  {adSet.status}
                                </Badge>
                              </Flex>
                              
                              <Box w="full">
                                <Text fontSize="sm" color="gray.500" mb={2}>Daily Budget</Text>
                                <Text fontSize="xl" fontWeight="bold" color="green.500">
                                  {formatCurrency(adSet.daily_budget)}
                                </Text>
                              </Box>

                              {adSet.targeting && (
                                <Box w="full">
                                  <Text fontSize="sm" color="gray.500" mb={2}>Targeting</Text>
                                  <VStack align="start" spacing={1}>
                                    <Text fontSize="sm">
                                      Age: {adSet.targeting.age_min || 18} - {adSet.targeting.age_max || 65}
                                    </Text>
                                    {adSet.targeting.geo_locations?.countries && (
                                      <Text fontSize="sm">
                                        Countries: {adSet.targeting.geo_locations.countries.join(', ')}
                                      </Text>
                                    )}
                                  </VStack>
                                </Box>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Creatives Tab */}
            <TabPanel p={0}>
              <Card bg={cardBg} shadow="sm" borderRadius="xl">
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Breadcrumb separator={<FiChevronRight color="gray.400" />}>
                        <BreadcrumbItem>
                          <BreadcrumbLink onClick={() => setActiveTab(0)}>Campaigns</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                          <BreadcrumbLink>Creatives</BreadcrumbLink>
                        </BreadcrumbItem>
                      </Breadcrumb>
                      <Text fontSize="sm" color="gray.600">
                        Manage ad creatives for campaign: {selectedCampaign}
                      </Text>
                    </VStack>
                    <HStack spacing={3}>
                      <Button leftIcon={<FiUpload />} variant="outline" onClick={onUploadImageOpen}>
                        Upload Image
                      </Button>
                      <Button leftIcon={<FiPlus />} colorScheme="purple" onClick={onCreateCreativeOpen}>
                        New Creative
                      </Button>
                    </HStack>
                  </Flex>
                </CardHeader>
                <CardBody>
                  {loading ? (
                    <VStack spacing={4} py={8}>
                      <Spinner size="lg" color="purple.500" />
                      <Text>Loading creatives...</Text>
                    </VStack>
                  ) : creatives.length === 0 ? (
                    <VStack spacing={6} py={12}>
                      <Box
                        w={20}
                        h={20}
                        bg="gray.100"
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FiImage size={40} color="gray.400" />
                      </Box>
                      <VStack spacing={2}>
                        <Text fontSize="xl" fontWeight="semibold" color="gray.600">
                          No creatives found
                        </Text>
                        <Text color="gray.500" textAlign="center">
                          Create your first creative with images and ad copy
                        </Text>
                      </VStack>
                      <HStack spacing={3}>
                        <Button leftIcon={<FiUpload />} variant="outline" onClick={onUploadImageOpen}>
                          Upload Image First
                        </Button>
                        <Button leftIcon={<FiPlus />} colorScheme="purple" size="lg" onClick={onCreateCreativeOpen}>
                          Create Creative
                        </Button>
                      </HStack>
                    </VStack>
                  ) : (
                    <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={6}>
                      {creatives.map((creative) => (
                        <Card key={creative.id} bg="white" shadow="md" borderRadius="xl" border="1px" borderColor="gray.100">
                          <CardBody>
                            <VStack align="start" spacing={4}>
                              <Flex justify="space-between" align="start" w="full">
                                <Text fontSize="lg" fontWeight="bold" noOfLines={1}>
                                  {creative.name}
                                </Text>
                                <Badge colorScheme={creative.status === 'ACTIVE' ? 'green' : 'gray'}>
                                  {creative.status}
                                </Badge>
                              </Flex>
                              
                              {creative.image_url && (
                                <Image
                                  src={creative.image_url}
                                  alt={creative.name}
                                  w="full"
                                  h="150px"
                                  objectFit="cover"
                                  borderRadius="lg"
                                />
                              )}
                              
                              {creative.message && (
                                <Box w="full">
                                  <Text fontSize="sm" color="gray.500" mb={1}>Message</Text>
                                  <Text fontSize="sm" noOfLines={3}>{creative.message}</Text>
                                </Box>
                              )}
                              
                              {creative.link && (
                                <Box w="full">
                                  <Text fontSize="sm" color="gray.500" mb={1}>Target URL</Text>
                                  <Text fontSize="sm" color="blue.500" noOfLines={1}>
                                    {creative.link}
                                  </Text>
                                </Box>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Ads Tab */}
            <TabPanel p={0}>
              <Card bg={cardBg} shadow="sm" borderRadius="xl">
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Breadcrumb separator={<FiChevronRight color="gray.400" />}>
                        <BreadcrumbItem>
                          <BreadcrumbLink onClick={() => setActiveTab(0)}>Campaigns</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                          <BreadcrumbLink>Ads</BreadcrumbLink>
                        </BreadcrumbItem>
                      </Breadcrumb>
                      <Text fontSize="sm" color="gray.600">
                        Manage active ads for campaign: {selectedCampaign}
                      </Text>
                    </VStack>
                    <Button leftIcon={<FiPlus />} colorScheme="orange" onClick={onCreateAdOpen}>
                      Create Ad
                    </Button>
                  </Flex>
                </CardHeader>
                <CardBody>
                  {loading ? (
                    <VStack spacing={4} py={8}>
                      <Spinner size="lg" color="orange.500" />
                      <Text>Loading ads...</Text>
                    </VStack>
                  ) : ads.length === 0 ? (
                    <VStack spacing={6} py={12}>
                      <Box
                        w={20}
                        h={20}
                        bg="gray.100"
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FiMousePointer size={40} color="gray.400" />
                      </Box>
                      <VStack spacing={2}>
                        <Text fontSize="xl" fontWeight="semibold" color="gray.600">
                          No ads found
                        </Text>
                        <Text color="gray.500" textAlign="center">
                          Create your first ad by combining an ad set with a creative
                        </Text>
                      </VStack>
                      <Button leftIcon={<FiPlus />} colorScheme="orange" size="lg" onClick={onCreateAdOpen}>
                        Create Ad
                      </Button>
                    </VStack>
                  ) : (
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                      {ads.map((ad) => (
                        <Card key={ad.id} bg="white" shadow="md" borderRadius="xl" border="1px" borderColor="gray.100">
                          <CardBody>
                            <VStack align="start" spacing={4}>
                              <Flex justify="space-between" align="start" w="full">
                                <Text fontSize="lg" fontWeight="bold">{ad.name}</Text>
                                <Badge colorScheme={ad.status === 'ACTIVE' ? 'green' : 'gray'}>
                                  {ad.status}
                                </Badge>
                              </Flex>
                              
                              <VStack align="start" spacing={2} w="full">
                                <HStack justify="space-between" w="full">
                                  <Text fontSize="sm" color="gray.500">Ad ID:</Text>
                                  <Text fontSize="sm" fontFamily="mono">{ad.adId}</Text>
                                </HStack>
                                <HStack justify="space-between" w="full">
                                  <Text fontSize="sm" color="gray.500">Ad Set ID:</Text>
                                  <Text fontSize="sm" fontFamily="mono">{ad.adSetId}</Text>
                                </HStack>
                                <HStack justify="space-between" w="full">
                                  <Text fontSize="sm" color="gray.500">Creative ID:</Text>
                                  <Text fontSize="sm" fontFamily="mono">{ad.creativeId}</Text>
                                </HStack>
                              </VStack>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>

      {/* Create Campaign Modal */}
      <Modal isOpen={isCreateCampaignOpen} onClose={onCreateCampaignClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Box p={2} bg="blue.50" borderRadius="lg">
                <FiPlus color="#3182CE" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text>Create New Campaign</Text>
                <Text fontSize="sm" color="gray.600" fontWeight="normal">
                  Set up a new Meta advertising campaign with AI enhancement
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Meta Account ID</FormLabel>
                <Input
                  value={campaignForm.coachMetaAccountId}
                  onChange={(e) => setCampaignForm(prev => ({
                    ...prev,
                    coachMetaAccountId: e.target.value
                  }))}
                  placeholder="Enter your Meta Account ID"
                />
              </FormControl>

              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Campaign Name</FormLabel>
                  <Input
                    value={campaignForm.campaignData.name}
                    onChange={(e) => setCampaignForm(prev => ({
                      ...prev,
                      campaignData: {
                        ...prev.campaignData,
                        name: e.target.value
                      }
                    }))}
                    placeholder="Enter campaign name"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Objective</FormLabel>
                  <Select
                    value={campaignForm.campaignData.objective}
                    onChange={(e) => setCampaignForm(prev => ({
                      ...prev,
                      campaignData: {
                        ...prev.campaignData,
                        objective: e.target.value
                      }
                    }))}
                  >
                    <option value="LEAD_GENERATION">Lead Generation</option>
                    <option value="LINK_CLICKS">Link Clicks</option>
                    <option value="CONVERSIONS">Conversions</option>
                    <option value="REACH">Reach</option>
                    <option value="IMPRESSIONS">Impressions</option>
                  </Select>
                </FormControl>
              </Grid>

              <FormControl isRequired>
                <FormLabel>Daily Budget (USD)</FormLabel>
                <NumberInput
                  value={campaignForm.campaignData.dailyBudget}
                  onChange={(value) => setCampaignForm(prev => ({
                    ...prev,
                    campaignData: {
                      ...prev.campaignData,
                      dailyBudget: parseInt(value) || 0
                    }
                  }))}
                  min={1}
                >
                  <NumberInputField placeholder="Enter daily budget" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Target Audience (for AI)</FormLabel>
                <Input
                  value={campaignForm.campaignData.targetAudience}
                  onChange={(e) => setCampaignForm(prev => ({
                    ...prev,
                    campaignData: {
                      ...prev.campaignData,
                      targetAudience: e.target.value
                    }
                  }))}
                  placeholder="e.g., busy professionals 25-45 in US"
                />
                <FormHelperText>Used for AI-enhanced targeting recommendations</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Product/Service Info (for AI)</FormLabel>
                <Textarea
                  value={campaignForm.campaignData.productInfo}
                  onChange={(e) => setCampaignForm(prev => ({
                    ...prev,
                    campaignData: {
                      ...prev.campaignData,
                      productInfo: e.target.value
                    }
                  }))}
                  placeholder="e.g., 12-week fitness program"
                  rows={3}
                />
                <FormHelperText>Describe your product/service for AI content generation</FormHelperText>
              </FormControl>

              <FormControl>
                <Flex align="center" justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">Use AI Enhancement</Text>
                    <Text fontSize="sm" color="gray.600">
                      Enable AI-powered content and targeting recommendations
                    </Text>
                  </VStack>
                  <Switch
                    isChecked={campaignForm.useAI}
                    onChange={(e) => setCampaignForm(prev => ({
                      ...prev,
                      useAI: e.target.checked
                    }))}
                    colorScheme="blue"
                  />
                </Flex>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateCampaignClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={createCampaign}
              isLoading={loading}
              loadingText="Creating..."
              leftIcon={<FiPlus />}
            >
              Create Campaign
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* AI Content Generation Modal */}
      <Modal isOpen={isAIContentOpen} onClose={onAIContentClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="4xl">
          <ModalHeader>
            <HStack spacing={3}>
              <Box p={2} bg="purple.50" borderRadius="lg">
                <FiZap color="#805AD5" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text>AI Content Generation</Text>
                <Text fontSize="sm" color="gray.600" fontWeight="normal">
                  Generate compelling ad content using AI for your campaigns
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Target Audience</FormLabel>
                  <Input
                    value={aiContentForm.targetAudience}
                    onChange={(e) => setAiContentForm(prev => ({
                      ...prev,
                      targetAudience: e.target.value
                    }))}
                    placeholder="e.g., Fitness enthusiasts 25-40"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Product Info</FormLabel>
                  <Input
                    value={aiContentForm.productInfo}
                    onChange={(e) => setAiContentForm(prev => ({
                      ...prev,
                      productInfo: e.target.value
                    }))}
                    placeholder="e.g., Personal training program"
                  />
                </FormControl>
              </Grid>

              <Grid templateColumns="repeat(3, 1fr)" gap={4} w="full">
                <FormControl>
                  <FormLabel>Campaign Objective</FormLabel>
                  <Select
                    value={aiContentForm.campaignObjective}
                    onChange={(e) => setAiContentForm(prev => ({
                      ...prev,
                      campaignObjective: e.target.value
                    }))}
                  >
                    <option value="CONVERSIONS">Conversions</option>
                    <option value="LEAD_GENERATION">Lead Generation</option>
                    <option value="LINK_CLICKS">Link Clicks</option>
                    <option value="REACH">Reach</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Tone</FormLabel>
                  <Select
                    value={aiContentForm.tone}
                    onChange={(e) => setAiContentForm(prev => ({
                      ...prev,
                      tone: e.target.value
                    }))}
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="friendly">Friendly</option>
                    <option value="urgent">Urgent</option>
                    <option value="luxury">Luxury</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Platform</FormLabel>
                  <Select
                    value={aiContentForm.platform}
                    onChange={(e) => setAiContentForm(prev => ({
                      ...prev,
                      platform: e.target.value
                    }))}
                  >
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="google">Google Ads</option>
                  </Select>
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel>Custom Prompt (Optional)</FormLabel>
                <Textarea
                  value={aiContentForm.customPrompt}
                  onChange={(e) => setAiContentForm(prev => ({
                    ...prev,
                    customPrompt: e.target.value
                  }))}
                  placeholder="Add specific instructions for AI content generation..."
                  rows={3}
                />
              </FormControl>

              <HStack spacing={3} w="full" justify="center">
                <Button
                  leftIcon={<FiZap />}
                  colorScheme="purple"
                  onClick={generateAICopy}
                  isLoading={loading}
                  loadingText="Generating..."
                >
                  Generate Copy
                </Button>
                <Button
                  leftIcon={<FiEdit3 />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={generateVariations}
                  isLoading={loading}
                >
                  Generate Variations
                </Button>
              </HStack>

              {/* Generated Content Display */}
              {(generatedContent.headlines.length > 0 || generatedContent.descriptions.length > 0 || generatedContent.variations.length > 0) && (
                <Box w="full" mt={6}>
                  <Divider mb={4} />
                  <Text fontSize="lg" fontWeight="bold" mb={4}>Generated Content</Text>
                  
                  <Accordion allowMultiple>
                    {generatedContent.headlines.length > 0 && (
                      <AccordionItem>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <Text fontWeight="medium">Headlines ({generatedContent.headlines.length})</Text>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <VStack align="start" spacing={3}>
                            {generatedContent.headlines.map((headline, index) => (
                              <Card key={index} w="full" variant="outline">
                                <CardBody py={3}>
                                  <Flex justify="space-between" align="center">
                                    <Text fontSize="sm">{headline}</Text>
                                    <Button
                                      size="xs"
                                      leftIcon={<FiCopy />}
                                      onClick={() => navigator.clipboard.writeText(headline)}
                                    >
                                      Copy
                                    </Button>
                                  </Flex>
                                </CardBody>
                              </Card>
                            ))}
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    )}

                    {generatedContent.descriptions.length > 0 && (
                      <AccordionItem>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <Text fontWeight="medium">Descriptions ({generatedContent.descriptions.length})</Text>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <VStack align="start" spacing={3}>
                            {generatedContent.descriptions.map((description, index) => (
                              <Card key={index} w="full" variant="outline">
                                <CardBody py={3}>
                                  <Flex justify="space-between" align="start">
                                    <Text fontSize="sm">{description}</Text>
                                    <Button
                                      size="xs"
                                      leftIcon={<FiCopy />}
                                      onClick={() => navigator.clipboard.writeText(description)}
                                    >
                                      Copy
                                    </Button>
                                  </Flex>
                                </CardBody>
                              </Card>
                            ))}
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    )}

                    {generatedContent.variations.length > 0 && (
                      <AccordionItem>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <Text fontWeight="medium">Variations ({generatedContent.variations.length})</Text>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <VStack align="start" spacing={3}>
                            {generatedContent.variations.map((variation, index) => (
                              <Card key={index} w="full" variant="outline">
                                <CardBody py={3}>
                                  <Flex justify="space-between" align="start">
                                    <Text fontSize="sm">{variation}</Text>
                                    <Button
                                      size="xs"
                                      leftIcon={<FiCopy />}
                                      onClick={() => navigator.clipboard.writeText(variation)}
                                    >
                                      Copy
                                    </Button>
                                  </Flex>
                                </CardBody>
                              </Card>
                            ))}
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    )}
                  </Accordion>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAIContentClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* AI Optimization Modal */}
      <Modal isOpen={isAIOptimizationOpen} onClose={onAIOptimizationClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Box p={2} bg="teal.50" borderRadius="lg">
                <FiSettings color="#319795" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text>AI Campaign Optimization</Text>
                <Text fontSize="sm" color="gray.600" fontWeight="normal">
                  Use AI to optimize your campaign performance and budget allocation
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Select Campaign</FormLabel>
                <Select
                  value={aiOptimizationForm.campaignId}
                  onChange={(e) => setAiOptimizationForm(prev => ({
                    ...prev,
                    campaignId: e.target.value
                  }))}
                  placeholder="Select a campaign"
                >
                  {campaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <FormControl>
                  <FormLabel>Optimization Type</FormLabel>
                  <Select
                    value={aiOptimizationForm.optimizationType}
                    onChange={(e) => setAiOptimizationForm(prev => ({
                      ...prev,
                      optimizationType: e.target.value
                    }))}
                  >
                    <option value="budget">Budget Optimization</option>
                    <option value="targeting">Targeting Optimization</option>
                    <option value="creative">Creative Optimization</option>
                    <option value="full">Full Campaign Optimization</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Budget Limit (USD)</FormLabel>
                  <NumberInput
                    value={aiOptimizationForm.budgetLimit}
                    onChange={(value) => setAiOptimizationForm(prev => ({
                      ...prev,
                      budgetLimit: parseInt(value) || 1000
                    }))}
                    min={100}
                  >
                    <NumberInputField placeholder="Enter budget limit" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </Grid>

              <HStack spacing={3} w="full" justify="center">
                <Button
                  leftIcon={<FiTrendingUp />}
                  colorScheme="teal"
                  onClick={optimizeCampaignBudget}
                  isLoading={loading}
                  isDisabled={!aiOptimizationForm.campaignId}
                >
                  Optimize Budget
                </Button>
                <Button
                  leftIcon={<FiAlertTriangle />}
                  colorScheme="orange"
                  variant="outline"
                  onClick={() => detectAnomalies(aiOptimizationForm.campaignId)}
                  isLoading={loading}
                  isDisabled={!aiOptimizationForm.campaignId}
                >
                  Detect Anomalies
                </Button>
                <Button
                  leftIcon={<FiZap />}
                  colorScheme="purple"
                  variant="outline"
                  onClick={() => autoOptimizeCampaign(aiOptimizationForm.campaignId)}
                  isLoading={loading}
                  isDisabled={!aiOptimizationForm.campaignId}
                >
                  Auto Optimize
                </Button>
                <Button
                  leftIcon={<FiBarChart2 />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => getPerformanceInsights(aiOptimizationForm.campaignId)}
                  isLoading={loading}
                  isDisabled={!aiOptimizationForm.campaignId}
                >
                  Get Insights
                </Button>
              </HStack>

              {/* AI Results Display */}
              {(aiResults.optimization || aiResults.anomalies || aiResults.insights) && (
                <Box w="full" mt={6}>
                  <Divider mb={4} />
                  <Text fontSize="lg" fontWeight="bold" mb={4}>AI Results</Text>
                  
                  <Accordion allowMultiple>
                    {aiResults.optimization && (
                      <AccordionItem>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <Text fontWeight="medium">Optimization Results</Text>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <Card variant="outline">
                            <CardBody>
                              <Text fontSize="sm" fontFamily="mono" whiteSpace="pre-wrap">
                                {JSON.stringify(aiResults.optimization, null, 2)}
                              </Text>
                            </CardBody>
                          </Card>
                        </AccordionPanel>
                      </AccordionItem>
                    )}

                    {aiResults.anomalies && (
                      <AccordionItem>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <Text fontWeight="medium">Anomalies Detected</Text>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <Card variant="outline">
                            <CardBody>
                              <Text fontSize="sm" fontFamily="mono" whiteSpace="pre-wrap">
                                {JSON.stringify(aiResults.anomalies, null, 2)}
                              </Text>
                            </CardBody>
                          </Card>
                        </AccordionPanel>
                      </AccordionItem>
                    )}

                    {aiResults.insights && (
                      <AccordionItem>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <Text fontWeight="medium">Performance Insights</Text>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <Card variant="outline">
                            <CardBody>
                              <Text fontSize="sm" fontFamily="mono" whiteSpace="pre-wrap">
                                {JSON.stringify(aiResults.insights, null, 2)}
                              </Text>
                            </CardBody>
                          </Card>
                        </AccordionPanel>
                      </AccordionItem>
                    )}
                  </Accordion>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAIOptimizationClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* AI Targeting Modal */}
      <Modal isOpen={isAITargetingOpen} onClose={onAITargetingClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Box p={2} bg="green.50" borderRadius="lg">
                <FiTarget color="#38A169" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text>AI Targeting Recommendations</Text>
                <Text fontSize="sm" color="gray.600" fontWeight="normal">
                  Get AI-powered targeting recommendations for your campaigns
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Target Audience</FormLabel>
                <Input
                  value={aiTargetingForm.targetAudience}
                  onChange={(e) => setAiTargetingForm(prev => ({
                    ...prev,
                    targetAudience: e.target.value
                  }))}
                  placeholder="e.g., Weight loss seekers, Fitness enthusiasts"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Budget (USD)</FormLabel>
                <NumberInput
                  value={aiTargetingForm.budget}
                  onChange={(value) => setAiTargetingForm(prev => ({
                    ...prev,
                    budget: parseInt(value) || 100
                  }))}
                  min={10}
                >
                  <NumberInputField placeholder="Enter budget amount" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <Button
                leftIcon={<FiTarget />}
                colorScheme="green"
                onClick={getTargetingRecommendations}
                isLoading={loading}
                loadingText="Generating..."
                w="full"
                size="lg"
              >
                Get Recommendations
              </Button>

              {/* AI Results Display */}
              {aiResults.targeting && (
                <Box w="full" mt={6}>
                  <Divider mb={4} />
                  <Text fontSize="lg" fontWeight="bold" mb={4}>Targeting Recommendations</Text>
                  
                  <Card variant="outline">
                    <CardBody>
                      <Text fontSize="sm" fontFamily="mono" whiteSpace="pre-wrap">
                        {JSON.stringify(aiResults.targeting, null, 2)}
                      </Text>
                    </CardBody>
                  </Card>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAITargetingClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* AI Poster Generation Modal */}
      <Modal isOpen={isAIPosterOpen} onClose={onAIPosterClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="4xl">
          <ModalHeader>
            <HStack spacing={3}>
              <Box p={2} bg="pink.50" borderRadius="lg">
                <FiImage color="#D53F8C" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text>AI Poster Generation</Text>
                <Text fontSize="sm" color="gray.600" fontWeight="normal">
                  Generate AI-powered marketing posters and content
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Coach Name</FormLabel>
                  <Input
                    value={aiPosterForm.coachName}
                    onChange={(e) => setAiPosterForm(prev => ({
                      ...prev,
                      coachName: e.target.value
                    }))}
                    placeholder="Enter coach name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Niche</FormLabel>
                  <Input
                    value={aiPosterForm.niche}
                    onChange={(e) => setAiPosterForm(prev => ({
                      ...prev,
                      niche: e.target.value
                    }))}
                    placeholder="e.g., Weight Loss & Nutrition"
                  />
                </FormControl>
              </Grid>

              <FormControl isRequired>
                <FormLabel>Offer</FormLabel>
                <Input
                  value={aiPosterForm.offer}
                  onChange={(e) => setAiPosterForm(prev => ({
                    ...prev,
                    offer: e.target.value
                  }))}
                  placeholder="e.g., 12-Week Transformation Program"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Target Audience</FormLabel>
                <Select
                  value={aiPosterForm.targetAudience}
                  onChange={(e) => setAiPosterForm(prev => ({
                    ...prev,
                    targetAudience: e.target.value
                  }))}
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="fitness">Fitness</option>
                  <option value="nutrition">Nutrition</option>
                  <option value="mindfulness">Mindfulness</option>
                  <option value="business">Business</option>
                </Select>
              </FormControl>

              <HStack spacing={3} w="full" justify="center">
                <Button
                  leftIcon={<FiImage />}
                  colorScheme="pink"
                  onClick={generatePoster}
                  isLoading={loading}
                >
                  Generate Poster
                </Button>
                <Button
                  leftIcon={<FiStar />}
                  colorScheme="purple"
                  variant="outline"
                  onClick={generatePosterVariations}
                  isLoading={loading}
                >
                  Generate Variations
                </Button>
                <Button
                  leftIcon={<FiEdit3 />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={generateHeadlines}
                  isLoading={loading}
                >
                  Generate Headlines
                </Button>
                <Button
                  leftIcon={<FiShare2 />}
                  colorScheme="green"
                  variant="outline"
                  onClick={generateSocialPost}
                  isLoading={loading}
                >
                  Generate Social Post
                </Button>
              </HStack>

              {/* Generated Content Display */}
              {(generatedContent.posters.length > 0 || generatedContent.headlines.length > 0 || generatedContent.socialPosts.length > 0) && (
                <Box w="full" mt={6}>
                  <Divider mb={4} />
                  <Text fontSize="lg" fontWeight="bold" mb={4}>Generated Content</Text>
                  
                  <Accordion allowMultiple>
                    {generatedContent.posters.length > 0 && (
                      <AccordionItem>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <Text fontWeight="medium">Generated Posters ({generatedContent.posters.length})</Text>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                            {generatedContent.posters.map((poster, index) => (
                              <Card key={index} variant="outline">
                                <CardBody p={3}>
                                  <Image
                                    src={poster}
                                    alt={`Generated Poster ${index + 1}`}
                                    w="full"
                                    h="200px"
                                    objectFit="cover"
                                    borderRadius="md"
                                    mb={3}
                                  />
                                  <HStack spacing={2}>
                                    <Button
                                      size="sm"
                                      leftIcon={<FiDownload />}
                                      onClick={() => window.open(poster, '_blank')}
                                      flex={1}
                                    >
                                      Download
                                    </Button>
                                    <Button
                                      size="sm"
                                      leftIcon={<FiShare2 />}
                                      colorScheme="green"
                                      onClick={() => {
                                        setSocialShareForm(prev => ({ ...prev, imageUrl: poster }));
                                        onSocialShareOpen();
                                      }}
                                      flex={1}
                                    >
                                      Share
                                    </Button>
                                  </HStack>
                                </CardBody>
                              </Card>
                            ))}
                          </SimpleGrid>
                        </AccordionPanel>
                      </AccordionItem>
                    )}

                    {generatedContent.headlines.length > 0 && (
                      <AccordionItem>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <Text fontWeight="medium">AI Headlines ({generatedContent.headlines.length})</Text>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <VStack align="start" spacing={3}>
                            {generatedContent.headlines.map((headline, index) => (
                              <Card key={index} w="full" variant="outline">
                                <CardBody py={3}>
                                  <Flex justify="space-between" align="center">
                                    <Text fontSize="sm">{headline}</Text>
                                    <Button
                                      size="xs"
                                      leftIcon={<FiCopy />}
                                      onClick={() => navigator.clipboard.writeText(headline)}
                                    >
                                      Copy
                                    </Button>
                                  </Flex>
                                </CardBody>
                              </Card>
                            ))}
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    )}

                    {generatedContent.socialPosts.length > 0 && (
                      <AccordionItem>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <Text fontWeight="medium">AI Social Posts ({generatedContent.socialPosts.length})</Text>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <VStack align="start" spacing={3}>
                            {generatedContent.socialPosts.map((post, index) => (
                              <Card key={index} w="full" variant="outline">
                                <CardBody py={3}>
                                  <Flex justify="space-between" align="start">
                                    <Text fontSize="sm">{post}</Text>
                                    <VStack spacing={2}>
                                      <Button
                                        size="xs"
                                        leftIcon={<FiCopy />}
                                        onClick={() => navigator.clipboard.writeText(post)}
                                      >
                                        Copy
                                      </Button>
                                      <Button
                                        size="xs"
                                        leftIcon={<FiShare2 />}
                                        colorScheme="green"
                                        onClick={() => {
                                          setSocialShareForm(prev => ({ ...prev, caption: post }));
                                          onSocialShareOpen();
                                        }}
                                      >
                                        Share
                                      </Button>
                                    </VStack>
                                  </Flex>
                                </CardBody>
                              </Card>
                            ))}
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    )}
                  </Accordion>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAIPosterClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* AI Campaign Generation Modal */}
      <Modal isOpen={isAICampaignOpen} onClose={onAICampaignClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Box p={2} bg="cyan.50" borderRadius="lg">
                <FiBarChart2 color="#00B5D8" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text>AI Campaign Generation</Text>
                <Text fontSize="sm" color="gray.600" fontWeight="normal">
                  Generate complete AI-optimized social media campaign packages
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Coach Name</FormLabel>
                  <Input
                    value={aiCampaignForm.coachName}
                    onChange={(e) => setAiCampaignForm(prev => ({
                      ...prev,
                      coachName: e.target.value
                    }))}
                    placeholder="Enter coach name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Niche</FormLabel>
                  <Input
                    value={aiCampaignForm.niche}
                    onChange={(e) => setAiCampaignForm(prev => ({
                      ...prev,
                      niche: e.target.value
                    }))}
                    placeholder="e.g., Weight Loss & Nutrition"
                  />
                </FormControl>
              </Grid>

              <FormControl isRequired>
                <FormLabel>Offer</FormLabel>
                <Input
                  value={aiCampaignForm.offer}
                  onChange={(e) => setAiCampaignForm(prev => ({
                    ...prev,
                    offer: e.target.value
                  }))}
                  placeholder="e.g., 12-Week Transformation Program"
                />
              </FormControl>

              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <FormControl>
                  <FormLabel>Target Audience</FormLabel>
                  <Select
                    value={aiCampaignForm.targetAudience}
                    onChange={(e) => setAiCampaignForm(prev => ({
                      ...prev,
                      targetAudience: e.target.value
                    }))}
                  >
                    <option value="weight_loss">Weight Loss</option>
                    <option value="fitness">Fitness</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="mindfulness">Mindfulness</option>
                    <option value="business">Business</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Campaign Duration (Days)</FormLabel>
                  <NumberInput
                    value={aiCampaignForm.campaignDuration}
                    onChange={(value) => setAiCampaignForm(prev => ({
                      ...prev,
                      campaignDuration: parseInt(value) || 7
                    }))}
                    min={1}
                    max={30}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel>Daily Budget (USD)</FormLabel>
                <NumberInput
                  value={aiCampaignForm.dailyBudget}
                  onChange={(value) => setAiCampaignForm(prev => ({
                    ...prev,
                    dailyBudget: parseInt(value) || 50
                  }))}
                  min={10}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <HStack spacing={3} w="full" justify="center">
                <Button
                  leftIcon={<FiBarChart2 />}
                  colorScheme="cyan"
                  onClick={generateCampaign}
                  isLoading={loading}
                  loadingText="Generating..."
                >
                  Generate Campaign Package
                </Button>
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="blue"
                  onClick={createOptimizedCampaign}
                  isLoading={loading}
                  loadingText="Creating..."
                >
                  Create AI Campaign
                </Button>
              </HStack>

              {/* Generated Campaign Display */}
              {generatedContent.campaign && (
                <Box w="full" mt={6}>
                  <Divider mb={4} />
                  <Text fontSize="lg" fontWeight="bold" mb={4}>Generated Campaign Package</Text>
                  
                  <Card variant="outline">
                    <CardBody>
                      <Text fontSize="sm" fontFamily="mono" whiteSpace="pre-wrap">
                        {JSON.stringify(generatedContent.campaign, null, 2)}
                      </Text>
                    </CardBody>
                  </Card>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAICampaignClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Social Media Sharing Modal */}
      <Modal isOpen={isSocialShareOpen} onClose={onSocialShareClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Box p={2} bg="green.50" borderRadius="lg">
                <FiShare2 color="#38A169" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text>Share to Instagram</Text>
                <Text fontSize="sm" color="gray.600" fontWeight="normal">
                  Upload your generated content to Instagram via Meta
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Meta Account ID</FormLabel>
                <Input
                  value={socialShareForm.coachMetaAccountId}
                  onChange={(e) => setSocialShareForm(prev => ({
                    ...prev,
                    coachMetaAccountId: e.target.value
                  }))}
                  placeholder="Enter your Meta Account ID"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Image URL</FormLabel>
                <Input
                  value={socialShareForm.imageUrl}
                  onChange={(e) => setSocialShareForm(prev => ({
                    ...prev,
                    imageUrl: e.target.value
                  }))}
                  placeholder="https://example.com/poster.jpg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Caption</FormLabel>
                <Textarea
                  value={socialShareForm.caption}
                  onChange={(e) => setSocialShareForm(prev => ({
                    ...prev,
                    caption: e.target.value
                  }))}
                  placeholder="Transform your body with our amazing program!"
                  rows={4}
                />
              </FormControl>

              <Button
                leftIcon={<FiSend />}
                colorScheme="green"
                onClick={uploadToInstagram}
                isLoading={loading}
                loadingText="Uploading..."
                w="full"
                size="lg"
              >
                Upload to Instagram
              </Button>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onSocialShareClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Upload Image Modal */}
      <Modal isOpen={isUploadImageOpen} onClose={onUploadImageClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Box p={2} bg="blue.50" borderRadius="lg">
                <FiUpload color="#3182CE" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text>Upload Image</Text>
                <Text fontSize="sm" color="gray.600" fontWeight="normal">
                  Upload an image to Meta and get the image hash for creatives
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Image URL</FormLabel>
                <Input
                  value={imageUploadForm.imageUrl}
                  onChange={(e) => setImageUploadForm(prev => ({
                    ...prev,
                    imageUrl: e.target.value
                  }))}
                  placeholder="https://example.com/image.jpg"
                />
                <FormHelperText>Enter the URL of the image you want to upload to Meta</FormHelperText>
              </FormControl>

              <Button
                leftIcon={<FiUpload />}
                colorScheme="blue"
                onClick={uploadImage}
                isLoading={loading}
                loadingText="Uploading..."
                w="full"
                size="lg"
              >
                Upload Image
              </Button>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onUploadImageClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Ad Set Modal */}
      <Modal isOpen={isCreateAdSetOpen} onClose={onCreateAdSetClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Box p={2} bg="green.50" borderRadius="lg">
                <FiTarget color="#38A169" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text>Create Ad Set</Text>
                <Text fontSize="sm" color="gray.600" fontWeight="normal">
                  Define targeting and budget for your ad set
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Ad Set Name</FormLabel>
                <Input
                  value={adSetForm.name}
                  onChange={(e) => setAdSetForm(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  placeholder="Enter ad set name"
                />
              </FormControl>

              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <FormControl>
                  <FormLabel>Min Age</FormLabel>
                  <NumberInput
                    value={adSetForm.targeting.age_min}
                    onChange={(value) => setAdSetForm(prev => ({
                      ...prev,
                      targeting: {
                        ...prev.targeting,
                        age_min: parseInt(value) || 18
                      }
                    }))}
                    min={18}
                    max={65}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Max Age</FormLabel>
                  <NumberInput
                    value={adSetForm.targeting.age_max}
                    onChange={(value) => setAdSetForm(prev => ({
                      ...prev,
                      targeting: {
                        ...prev.targeting,
                        age_max: parseInt(value) || 65
                      }
                    }))}
                    min={18}
                    max={65}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel>Target Countries</FormLabel>
                <Input
                  value={adSetForm.targeting.geo_locations.countries.join(', ')}
                  onChange={(e) => setAdSetForm(prev => ({
                    ...prev,
                    targeting: {
                      ...prev.targeting,
                      geo_locations: {
                        countries: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                      }
                    }
                  }))}
                  placeholder="US, CA, GB"
                />
                <FormHelperText>Enter country codes separated by commas</FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Daily Budget (cents)</FormLabel>
                <NumberInput
                  value={adSetForm.daily_budget}
                  onChange={(value) => setAdSetForm(prev => ({
                    ...prev,
                    daily_budget: parseInt(value) || 2500
                  }))}
                  min={100}
                >
                  <NumberInputField placeholder="2500 (= $25.00)" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>Amount in cents (2500 = $25.00)</FormHelperText>
              </FormControl>

              <Button
                leftIcon={<FiPlus />}
                colorScheme="green"
                onClick={createAdSet}
                isLoading={loading}
                loadingText="Creating..."
                w="full"
                size="lg"
              >
                Create Ad Set
              </Button>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateAdSetClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Creative Modal */}
      <Modal isOpen={isCreateCreativeOpen} onClose={onCreateCreativeClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Box p={2} bg="purple.50" borderRadius="lg">
                <FiImage color="#805AD5" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text>Create Creative</Text>
                <Text fontSize="sm" color="gray.600" fontWeight="normal">
                  Design your ad creative with image and text
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Creative Name</FormLabel>
                <Input
                  value={creativeForm.name}
                  onChange={(e) => setCreativeForm(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  placeholder="Enter creative name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Target URL</FormLabel>
                <Input
                  value={creativeForm.object_story_spec.link_data.link}
                  onChange={(e) => setCreativeForm(prev => ({
                    ...prev,
                    object_story_spec: {
                      ...prev.object_story_spec,
                      link_data: {
                        ...prev.object_story_spec.link_data,
                        link: e.target.value
                      }
                    }
                  }))}
                  placeholder="https://yourwebsite.com"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Ad Message</FormLabel>
                <Textarea
                  value={creativeForm.object_story_spec.link_data.message}
                  onChange={(e) => setCreativeForm(prev => ({
                    ...prev,
                    object_story_spec: {
                      ...prev.object_story_spec,
                      link_data: {
                        ...prev.object_story_spec.link_data,
                        message: e.target.value
                      }
                    }
                  }))}
                  placeholder="Enter your compelling ad message..."
                  rows={3}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Image Hash</FormLabel>
                <Input
                  value={creativeForm.object_story_spec.link_data.image_hash}
                  onChange={(e) => setCreativeForm(prev => ({
                    ...prev,
                    object_story_spec: {
                      ...prev.object_story_spec,
                      link_data: {
                        ...prev.object_story_spec.link_data,
                        image_hash: e.target.value
                      }
                    }
                  }))}
                  placeholder="Upload image first to get hash"
                />
                <FormHelperText>Upload an image first to get the image hash</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Call to Action Type</FormLabel>
                <Select
                  value={creativeForm.object_story_spec.link_data.call_to_action.type}
                  onChange={(e) => setCreativeForm(prev => ({
                    ...prev,
                    object_story_spec: {
                      ...prev.object_story_spec,
                      link_data: {
                        ...prev.object_story_spec.link_data,
                        call_to_action: {
                          type: e.target.value
                        }
                      }
                    }
                  }))}
                >
                  <option value="LEARN_MORE">Learn More</option>
                  <option value="SIGN_UP">Sign Up</option>
                  <option value="DOWNLOAD">Download</option>
                  <option value="GET_QUOTE">Get Quote</option>
                  <option value="CONTACT_US">Contact Us</option>
                  <option value="SHOP_NOW">Shop Now</option>
                </Select>
              </FormControl>

              <Button
                leftIcon={<FiPlus />}
                colorScheme="purple"
                onClick={createCreative}
                isLoading={loading}
                loadingText="Creating..."
                w="full"
                size="lg"
              >
                Create Creative
              </Button>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateCreativeClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Ad Modal */}
      <Modal isOpen={isCreateAdOpen} onClose={onCreateAdClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Box p={2} bg="orange.50" borderRadius="lg">
                <FiMousePointer color="#DD6B20" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text>Create Ad</Text>
                <Text fontSize="sm" color="gray.600" fontWeight="normal">
                  Combine an ad set with a creative to create your ad
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Ad Name</FormLabel>
                <Input
                  value={adForm.name}
                  onChange={(e) => setAdForm(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  placeholder="Enter ad name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Ad Set</FormLabel>
                <Select
                  value={adForm.adset_id}
                  onChange={(e) => setAdForm(prev => ({
                    ...prev,
                    adset_id: e.target.value
                  }))}
                  placeholder="Select Ad Set"
                >
                  {adSets.map(adSet => (
                    <option key={adSet.id} value={adSet.id}>
                      {adSet.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Creative</FormLabel>
                <Select
                  value={adForm.creative.creative_id}
                  onChange={(e) => setAdForm(prev => ({
                    ...prev,
                    creative: {
                      creative_id: e.target.value
                    }
                  }))}
                  placeholder="Select Creative"
                >
                  {creatives.map(creative => (
                    <option key={creative.id} value={creative.id}>
                      {creative.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Status</FormLabel>
                <RadioGroup
                  value={adForm.status}
                  onChange={(value) => setAdForm(prev => ({
                    ...prev,
                    status: value
                  }))}
                >
                  <Stack direction="row" spacing={4}>
                    <Radio value="PAUSED">Paused</Radio>
                    <Radio value="ACTIVE">Active</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              <Button
                leftIcon={<FiPlus />}
                colorScheme="orange"
                onClick={createAd}
                isLoading={loading}
                loadingText="Creating..."
                w="full"
                size="lg"
              >
                Create Ad
              </Button>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateAdClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Analytics Modal */}
      <Modal isOpen={isAnalyticsOpen} onClose={onAnalyticsClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Box p={2} bg="blue.50" borderRadius="lg">
                <FiBarChart2 color="#3182CE" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text>Campaign Analytics</Text>
                <Text fontSize="sm" color="gray.600" fontWeight="normal">
                  Detailed performance insights for your campaign
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {analytics ? (
              <VStack spacing={6}>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
                  <Card bg="blue.50" borderColor="blue.200">
                    <CardBody textAlign="center">
                      <Stat>
                        <StatLabel color="blue.600">Impressions</StatLabel>
                        <StatNumber color="blue.800">
                          {analytics.impressions?.toLocaleString() || '0'}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>
                  
                  <Card bg="green.50" borderColor="green.200">
                    <CardBody textAlign="center">
                      <Stat>
                        <StatLabel color="green.600">Clicks</StatLabel>
                        <StatNumber color="green.800">
                          {analytics.clicks?.toLocaleString() || '0'}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>
                  
                  <Card bg="purple.50" borderColor="purple.200">
                    <CardBody textAlign="center">
                      <Stat>
                        <StatLabel color="purple.600">CTR</StatLabel>
                        <StatNumber color="purple.800">
                          {analytics.ctr ? `${analytics.ctr}%` : '0%'}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>
                  
                  <Card bg="orange.50" borderColor="orange.200">
                    <CardBody textAlign="center">
                      <Stat>
                        <StatLabel color="orange.600">CPC</StatLabel>
                        <StatNumber color="orange.800">
                          ${analytics.cpc || '0.00'}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>
                  
                  <Card bg="teal.50" borderColor="teal.200">
                    <CardBody textAlign="center">
                      <Stat>
                        <StatLabel color="teal.600">Conversions</StatLabel>
                        <StatNumber color="teal.800">
                          {analytics.conversions || '0'}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>
                  
                  <Card bg="red.50" borderColor="red.200">
                    <CardBody textAlign="center">
                      <Stat>
                        <StatLabel color="red.600">Total Cost</StatLabel>
                        <StatNumber color="red.800">
                          ${analytics.cost || '0.00'}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                <Box w="full">
                  <Text fontSize="lg" fontWeight="bold" mb={4}>Performance Overview</Text>
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Metric</Th>
                          <Th>Value</Th>
                          <Th>Performance</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td>Click-Through Rate</Td>
                          <Td>{analytics.ctr ? `${analytics.ctr}%` : '0%'}</Td>
                          <Td>
                            <Badge colorScheme={analytics.ctr > 2 ? 'green' : analytics.ctr > 1 ? 'yellow' : 'red'}>
                              {analytics.ctr > 2 ? 'Excellent' : analytics.ctr > 1 ? 'Good' : 'Needs Improvement'}
                            </Badge>
                          </Td>
                        </Tr>
                        <Tr>
                          <Td>Cost Per Click</Td>
                          <Td>${analytics.cpc || '0.00'}</Td>
                          <Td>
                            <Badge colorScheme={analytics.cpc < 2 ? 'green' : analytics.cpc < 5 ? 'yellow' : 'red'}>
                              {analytics.cpc < 2 ? 'Excellent' : analytics.cpc < 5 ? 'Good' : 'High'}
                            </Badge>
                          </Td>
                        </Tr>
                        <Tr>
                          <Td>Conversion Rate</Td>
                          <Td>{analytics.conversions && analytics.clicks ? ((analytics.conversions / analytics.clicks) * 100).toFixed(2) : '0'}%</Td>
                          <Td>
                            <Badge colorScheme="blue">Tracking</Badge>
                          </Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              </VStack>
            ) : (
              <VStack spacing={4} py={8}>
                <Spinner size="lg" color="blue.500" />
                <Text>Loading analytics...</Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAnalyticsClose}>
              Close
            </Button>
            <Button leftIcon={<FiDownload />} colorScheme="blue">
              Export Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Floating Action Buttons */}
      <Box position="fixed" bottom={6} right={6} zIndex={1000}>
        <VStack spacing={3}>
          <Tooltip label="AI Content Generator" placement="left">
            <IconButton
              icon={<FiZap />}
              colorScheme="purple"
              size="lg"
              borderRadius="full"
              shadow="lg"
              onClick={onAIContentOpen}
              aria-label="AI Content"
            />
          </Tooltip>
          
          <Tooltip label="AI Poster Generator" placement="left">
            <IconButton
              icon={<FiImage />}
              colorScheme="pink"
              size="lg"
              borderRadius="full"
              shadow="lg"
              onClick={onAIPosterOpen}
              aria-label="AI Poster"
            />
          </Tooltip>
          
          <Tooltip label="Create Campaign" placement="left">
            <IconButton
              icon={<FiPlus />}
              colorScheme="blue"
              size="lg"
              borderRadius="full"
              shadow="lg"
              onClick={onCreateCampaignOpen}
              aria-label="Create Campaign"
            />
          </Tooltip>

          <Tooltip label="Social Media History" placement="left">
            <IconButton
              icon={<FiClock />}
              colorScheme="gray"
              size="lg"
              borderRadius="full"
              shadow="lg"
              onClick={getSocialMediaHistory}
              aria-label="Social History"
            />
          </Tooltip>
        </VStack>
      </Box>

      {/* Quick Stats Bar */}
      {campaigns.length > 0 && (
        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          bg={cardBg}
          borderTop="1px"
          borderColor={borderColor}
          py={3}
          px={4}
          zIndex={999}
        >
          <Container maxW="7xl">
            <HStack justify="space-between" align="center">
              <HStack spacing={8}>
                <HStack spacing={2}>
                  <FiBarChart2 color="gray.500" />
                  <Text fontSize="sm" color="gray.600">
                    {campaigns.length} Campaigns
                  </Text>
                </HStack>
                
                <HStack spacing={2}>
                  <FiTrendingUp color="green.500" />
                  <Text fontSize="sm" color="gray.600">
                    {campaigns.filter(c => c.status === 'ACTIVE').length} Active
                  </Text>
                </HStack>
                
                <HStack spacing={2}>
                  <FiDollarSign color="red.500" />
                  <Text fontSize="sm" color="gray.600">
                    {formatCurrency(campaigns.reduce((sum, c) => sum + (c.spend || 0), 0))} Spent
                  </Text>
                </HStack>
              </HStack>

              <HStack spacing={3}>
                <Button
                  size="sm"
                  leftIcon={<FiRefreshCw />}
                  onClick={fetchCampaigns}
                  isLoading={loading}
                  variant="ghost"
                >
                  Sync
                </Button>
                
                <InputGroup size="sm" maxW="200px">
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray.400" />
                  </InputLeftElement>
                  <Input placeholder="Quick search..." bg="white" />
                </InputGroup>
              </HStack>
            </HStack>
          </Container>
        </Box>
      )}

      {/* Background Pattern */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.02}
        pointerEvents="none"
        zIndex={-1}
        bgImage="radial-gradient(circle at 1px 1px, #667eea 1px, transparent 0)"
        bgSize="40px 40px"
      />
    </Box>
  );
};

export default MarketingDashboard;
