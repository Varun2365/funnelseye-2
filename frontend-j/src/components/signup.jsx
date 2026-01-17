import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Input,
  FormControl,
  FormLabel,
  SimpleGrid,
  Spinner,
  useToast,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  PinInput,
  PinInputField,
  Icon,
  Flex,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Divider,
  IconButton,
  useColorModeValue,
  Container,
  Select,
  Checkbox,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Image,
  InputLeftAddon,
} from '@chakra-ui/react';
import { EmailIcon, LockIcon, PhoneIcon, CheckCircleIcon, ArrowForwardIcon, ViewIcon, ViewOffIcon, ChevronDownIcon, WarningIcon, InfoIcon, CloseIcon, SearchIcon } from '@chakra-ui/icons';
import { FaUser, FaCheck, FaRocket, FaCrown, FaStar, FaIdBadge, FaShieldAlt, FaTimes, FaBalanceScale, FaSearch, FaUserTie } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/apiConfig';
import logoImg from '../logo.png';

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// Custom toast hook matching calendar style
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
      duration: 4000,
      isClosable: true,
      position: 'top-right',
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
            <Text fontSize="sm" fontWeight="600" color={config.titleColor}>
              {config.title}
            </Text>
            <Text fontSize="sm" color={config.textColor} lineHeight="1.5">
              {message}
            </Text>
          </VStack>
          <IconButton
            aria-label="Close"
            icon={<CloseIcon />}
            size="xs"
            variant="ghost"
            color="gray.400"
            onClick={onClose}
            _hover={{ color: 'gray.600' }}
          />
        </Box>
      ),
    });
  }, [toast]);
};

// Helper: Convert backend features object to displayable array
const parseFeatures = (features) => {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  
  const featureLabels = {
    maxFunnels: (v) => v === -1 ? 'Unlimited Funnels' : `${v} Funnels`,
    maxStaff: (v) => v === -1 ? 'Unlimited Staff' : `${v} Staff Members`,
    maxDevices: (v) => `${v} Devices`,
    aiFeatures: (v) => v ? 'AI Features' : null,
    advancedAnalytics: (v) => v ? 'Advanced Analytics' : null,
    prioritySupport: (v) => v ? 'Priority Support' : null,
    customDomain: (v) => v ? 'Custom Domain' : null,
    apiAccess: (v) => v ? 'API Access' : null,
    whiteLabel: (v) => v ? 'White Label' : null,
    automationRules: (v) => v > 0 ? `${v} Automation Rules` : null,
    emailCredits: (v) => v > 0 ? `${v.toLocaleString()} Email Credits` : null,
    smsCredits: (v) => v > 0 ? `${v.toLocaleString()} SMS Credits` : null,
    storageGB: (v) => v > 0 ? `${v}GB Storage` : null,
    customBranding: (v) => v ? 'Custom Branding' : null,
    advancedReporting: (v) => v ? 'Advanced Reporting' : null,
    teamCollaboration: (v) => v ? 'Team Collaboration' : null,
    mobileApp: (v) => v ? 'Mobile App Access' : null,
    webhooks: (v) => v ? 'Webhooks' : null,
    sso: (v) => v ? 'SSO (Single Sign-On)' : null,
    funnelsLibrary: (v) => v ? 'Funnels Library' : null,
    automationLibrary: (v) => v ? 'Automation Library' : null,
    aiCopywriter: (v) => v ? 'AI Copywriter' : null,
    aiSalesAssistant: (v) => v ? 'AI Sales Assistant' : null,
    marketingPlaybooks: (v) => v ? 'Marketing Playbooks' : null,
    communityAccess: (v) => v ? 'Community Access' : null,
    liveWorkshopsPerMonth: (v) => v > 0 ? `${v} Live Workshops/Month` : null,
    coachingCallsPerQuarter: (v) => v > 0 ? `${v} Coaching Calls/Quarter` : null,
    crmSeats: (v) => v > 0 ? `${v} CRM Seats` : null,
    courseLibraryAccess: (v) => v ? 'Course Library Access' : null,
    courseRemixTools: (v) => v ? 'Course Remix Tools' : null,
    marketplaceAccess: (v) => v ? 'Marketplace Access' : null,
    whatsappAutomation: (v) => v ? 'WhatsApp Automation' : null,
    emailAutomation: (v) => v ? 'Email Automation' : null,
    salesPipeline: (v) => v ? 'Sales Pipeline' : null,
    advancedScheduler: (v) => v ? 'Advanced Scheduler' : null,
  };

  const result = [];
  for (const [key, value] of Object.entries(features)) {
    if (featureLabels[key]) {
      const label = featureLabels[key](value);
      if (label) result.push(label);
    }
  }
  return result;
};

// Demo/fallback hierarchy ranks
const fallbackRanks = [
  { level: 1, name: 'Distributor Coach', description: 'Entry level coach' },
  { level: 2, name: 'Senior Consultant', description: 'Intermediate coach' },
  { level: 3, name: 'Success Builder', description: 'Advanced coach' },
  { level: 4, name: 'Supervisor', description: 'Expert coach' },
  { level: 5, name: 'Director', description: 'Senior expert coach' },
  { level: 6, name: 'Executive', description: 'Executive level coach' },
  { level: 7, name: 'Presidential', description: 'Top tier coach' },
  { level: 8, name: 'Ambassador', description: 'Elite coach' },
  { level: 9, name: 'Crown Ambassador', description: 'Elite coach with honors' },
  { level: 10, name: "President's Team", description: 'Esteemed coach' },
  { level: 11, name: "Chairman's Club", description: 'Legendary coach' },
  { level: 12, name: "Founder's Circle", description: 'Ultimate coach' },
];

const fallbackPlans = [
  {
    id: 'starter-plan',
    name: 'Starter',
    description: 'Perfect for individuals getting started',
    price: { amount: 499, billingCycle: 'month', currency: 'INR' },
    features: { maxFunnels: 3, maxStaff: 1, emailCredits: 1000, mobileApp: true },
    icon: FaRocket,
    popular: false,
  },
  {
    id: 'pro-plan',
    name: 'Professional',
    description: 'For growing businesses & teams',
    price: { amount: 1499, billingCycle: 'month', currency: 'INR' },
    features: { maxFunnels: 15, maxStaff: 5, aiFeatures: true, advancedAnalytics: true, prioritySupport: true, emailCredits: 10000, teamCollaboration: true },
    icon: FaStar,
    popular: true,
  },
  {
    id: 'elite-plan',
    name: 'Elite',
    description: 'Unlimited power for enterprises',
    price: { amount: 4999, billingCycle: 'month', currency: 'INR' },
    features: { maxFunnels: -1, maxStaff: -1, aiFeatures: true, advancedAnalytics: true, prioritySupport: true, customDomain: true, apiAccess: true, whiteLabel: true, emailCredits: 50000 },
    icon: FaCrown,
    popular: false,
  },
];

const SignupNew = () => {
  const toast = useCustomToast();
  const navigate = useNavigate();

  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const textPrimary = useColorModeValue('gray.800', 'white');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.700');
  const brandColor = '#0284c7';

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [detailPlan, setDetailPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Compare plans
  const [comparePlans, setComparePlans] = useState([]);

  // Ranks and selected sponsor
  const [ranks, setRanks] = useState(fallbackRanks);
  const [selectedSponsor, setSelectedSponsor] = useState(null);

  // Sponsor search
  const [sponsorSearchQuery, setSponsorSearchQuery] = useState('');
  const [sponsorSearchResults, setSponsorSearchResults] = useState([]);
  const [sponsorSearchLoading, setSponsorSearchLoading] = useState(false);

  // Modal controls
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isCompareOpen, onOpen: onCompareOpen, onClose: onCompareClose } = useDisclosure();
  const { isOpen: isSponsorSearchOpen, onOpen: onSponsorSearchOpen, onClose: onSponsorSearchClose } = useDisclosure();

  // Flow step inside modal: 'details' | 'otp'
  const [modalStep, setModalStep] = useState('details');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    selfCoachId: '',
    sponsorId: '',
    currentLevel: '1',
  });
  const [otp, setOtp] = useState('');
  const [signupToken, setSignupToken] = useState(null);

  useEffect(() => {
    fetchPlans();
    fetchRanks();
    loadRazorpay().then((ok) => setRazorpayReady(ok));
  }, []);

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/subscriptions/plans`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        const icons = [FaRocket, FaStar, FaCrown];
        const mapped = data.data.map((p, idx) => ({
          id: p._id || p.id,
          name: p.name,
          description: p.description || 'Subscription plan',
          price: {
            amount: p.price?.amount || p.price || p.amount || 0,
            billingCycle: p.price?.billingCycle || p.billingCycle || 'month',
            currency: p.price?.currency || p.currency || 'INR',
          },
          features: p.features || {},
          icon: icons[idx % icons.length],
          popular: p.isPopular || idx === 1,
          original: p,
        }));
        setPlans(mapped.length > 0 ? mapped : fallbackPlans);
      } else {
        setPlans(fallbackPlans);
      }
    } catch (e) {
      console.error('Plans fetch error', e);
      setPlans(fallbackPlans);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchRanks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/coach-ranks`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data) && data.data.length > 0) {
        setRanks(data.data);
      } else {
        setRanks(fallbackRanks);
      }
    } catch (e) {
      console.error('Error fetching ranks', e);
      setRanks(fallbackRanks);
    }
  };

  const searchSponsors = async () => {
    if (!sponsorSearchQuery || sponsorSearchQuery.trim().length < 2) {
      toast('Please enter at least 2 characters to search', 'warning');
      return;
    }
    setSponsorSearchLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/advanced-mlm/search-sponsor?query=${encodeURIComponent(sponsorSearchQuery.trim())}`);
      const data = await res.json();
      if (res.ok && data.success) {
        const results = data.data?.digitalSponsors || [];
        setSponsorSearchResults(results);
        if (results.length === 0) {
          toast('No sponsors found matching your search', 'info');
        }
      } else {
        toast(data.message || 'Failed to search sponsors', 'error');
        setSponsorSearchResults([]);
      }
    } catch (e) {
      console.error('Sponsor search error', e);
      toast('Network error while searching sponsors', 'error');
      setSponsorSearchResults([]);
    } finally {
      setSponsorSearchLoading(false);
    }
  };

  const selectSponsor = (sponsor) => {
    setSelectedSponsor(sponsor);
    setForm((prev) => ({ ...prev, sponsorId: sponsor._id }));
    onSponsorSearchClose();
    setSponsorSearchQuery('');
    setSponsorSearchResults([]);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openDetailsModal = (plan) => {
    setDetailPlan(plan);
    onDetailOpen();
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setModalStep('details');
    onFormOpen();
  };

  const toggleCompare = (plan) => {
    setComparePlans((prev) => {
      if (prev.find((p) => p.id === plan.id)) {
        return prev.filter((p) => p.id !== plan.id);
      }
      if (prev.length >= 3) {
        toast('You can compare up to 3 plans', 'warning');
        return prev;
      }
      return [...prev, plan];
    });
  };

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.phone || !form.password || !form.confirmPassword) {
      toast('Please fill all required fields', 'warning');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }
    if (!form.currentLevel) {
      toast('Please select a rank', 'warning');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: 'coach',
        selfCoachId: form.selfCoachId.trim() || undefined,
        sponsorId: form.sponsorId || undefined,
        currentLevel: parseInt(form.currentLevel, 10),
      };
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSignupToken(data.token);
        toast('OTP sent to your email', 'success');
        setModalStep('otp');
      } else {
        toast(data.message || 'Signup failed. Please try again.', 'error');
      }
    } catch (e) {
      toast('Network error. Please check your connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast('Please enter the 6-digit OTP', 'warning');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const token = data.token || signupToken;
        if (token) {
          localStorage.setItem('token', token);
        }
        await startPayment(token);
      } else {
        toast(data.message || 'Invalid OTP. Please try again.', 'error');
      }
    } catch (e) {
      toast('Network error. Please check your connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const startPayment = async (token) => {
    if (!selectedPlan) {
      toast('No plan selected', 'warning');
      return;
    }
    if (!razorpayReady) {
      const ok = await loadRazorpay();
      setRazorpayReady(ok);
      if (!ok) {
        toast('Payment gateway unavailable. Please try again later.', 'error');
        return;
      }
    }
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/subscriptions/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId: selectedPlan.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.data?.paymentOrder) {
        throw new Error(data.message || 'Order creation failed');
      }
      const order = data.data.paymentOrder;
      
      // Close the signup modal before opening Razorpay to prevent focus issues
      onFormClose();
      setIsLoading(false);
      
      // Small delay to ensure modal is fully closed before Razorpay opens
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const rzp = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency || selectedPlan.price.currency || 'INR',
        name: 'FunnelsEye',
        description: `Subscription: ${selectedPlan.name}`,
        order_id: order.orderId,
        prefill: {
          email: form.email,
          contact: form.phone,
          name: form.name,
        },
        theme: { color: brandColor },
        handler: async (response) => {
          await verifyPayment(token, response);
        },
        modal: {
          ondismiss: () => {
            // Payment was cancelled, user can try again
            toast('Payment cancelled. You can try again from the plans page.', 'info');
          },
          escape: true,
          backdropclose: false,
        },
      });
      rzp.open();
    } catch (e) {
      console.error('Payment init error', e);
      toast(e.message || 'Payment initialization failed', 'error');
      setIsLoading(false);
    }
  };

  const verifyPayment = async (token, rzpResponse) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/subscriptions/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          razorpay_order_id: rzpResponse.razorpay_order_id,
          razorpay_payment_id: rzpResponse.razorpay_payment_id,
          razorpay_signature: rzpResponse.razorpay_signature,
          planId: selectedPlan.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast('Welcome aboard! Your subscription is now active.', 'success');
        onFormClose();
        navigate('/dashboard');
      } else {
        throw new Error(data.message || 'Payment verification failed');
      }
    } catch (e) {
      toast(e.message || 'Payment verification failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get all unique features across compared plans
  const getAllCompareFeatures = () => {
    const allFeatures = new Set();
    comparePlans.forEach((plan) => {
      parseFeatures(plan.features).forEach((f) => allFeatures.add(f));
    });
    return Array.from(allFeatures);
  };

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Top Header */}
      <Box
        as="header"
        bg={cardBg}
        borderBottom="1px solid"
        borderColor={borderColor}
        py={3}
        px={6}
      >
        <Container maxW="1100px">
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              <Image 
                src={logoImg} 
                alt="FunnelsEye" 
                h="40px" 
                w="auto"
                objectFit="contain"
              />
              <Text fontSize="lg" fontWeight="700" color={textPrimary} display={{ base: 'none', md: 'block' }}>
                FunnelsEye
              </Text>
            </HStack>
            <HStack spacing={3}>
              <Text fontSize="sm" color={textSecondary} display={{ base: 'none', md: 'block' }}>
                Already have an account?
              </Text>
              <Button
                as={Link}
                to="/login"
                variant="outline"
                size="sm"
                borderColor={borderColor}
                color={textPrimary}
                fontWeight="500"
                _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
              >
                Sign In
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="1100px" py={10}>
        <VStack spacing={8} align="stretch">
          {/* Page Header */}
          <VStack spacing={2} textAlign="center">
            <Heading size="lg" color={textPrimary} fontWeight="700">
              Choose Your Plan
            </Heading>
            <Text fontSize="md" color={textSecondary}>
              Select a plan that fits your needs and get started today.
            </Text>
          </VStack>

          {/* Compare Button */}
          {comparePlans.length >= 2 && (
            <Flex justify="center">
              <Button
                leftIcon={<FaBalanceScale />}
                colorScheme="blue"
                variant="outline"
                size="sm"
                onClick={onCompareOpen}
              >
                Compare {comparePlans.length} Plans
              </Button>
            </Flex>
          )}

          {/* Plans Grid */}
          {loadingPlans ? (
            <Flex justify="center" py={16}>
              <VStack spacing={3}>
                <Spinner size="lg" color={brandColor} thickness="3px" />
                <Text color={textSecondary} fontSize="sm">Loading plans...</Text>
              </VStack>
            </Flex>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
              {plans.map((plan) => {
                const isSelected = selectedPlan?.id === plan.id;
                const isComparing = comparePlans.find((p) => p.id === plan.id);
                const PlanIcon = plan.icon || FaRocket;
                const featureList = parseFeatures(plan.features);

                return (
                  <Box
                    key={plan.id}
                    bg={cardBg}
                    borderRadius="8px"
                    border="1px solid"
                    borderColor={isSelected ? brandColor : borderColor}
                    p={5}
                    position="relative"
                    transition="all 0.2s"
                    _hover={{
                      borderColor: brandColor,
                      shadow: 'md',
                    }}
                  >
                    {plan.popular && (
                      <Badge
                        position="absolute"
                        top={-2}
                        right={4}
                        bg={brandColor}
                        color="white"
                        px={2}
                        py={0.5}
                        borderRadius="sm"
                        fontSize="xs"
                        fontWeight="600"
                      >
                        Popular
                      </Badge>
                    )}

                    <VStack spacing={4} align="stretch">
                      {/* Compare Checkbox */}
                      <Checkbox
                        size="sm"
                        isChecked={!!isComparing}
                        onChange={() => toggleCompare(plan)}
                        colorScheme="blue"
                      >
                        <Text fontSize="xs" color={textSecondary}>Compare</Text>
                      </Checkbox>

                      {/* Plan Header */}
                      <HStack spacing={3}>
                        <Flex
                          w="40px"
                          h="40px"
                          bg={useColorModeValue('gray.100', 'gray.700')}
                          borderRadius="md"
                          align="center"
                          justify="center"
                        >
                          <Icon as={PlanIcon} color={brandColor} boxSize={4} />
                        </Flex>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="600" fontSize="md" color={textPrimary}>
                            {plan.name}
                          </Text>
                          <Text fontSize="xs" color={textSecondary}>
                            {plan.description}
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Price */}
                      <HStack align="baseline" spacing={1}>
                        <Text fontSize="2xl" fontWeight="700" color={textPrimary}>
                          {formatCurrency(plan.price.amount, plan.price.currency)}
                        </Text>
                        <Text fontSize="sm" color={textSecondary}>
                          /{plan.price.billingCycle}
                        </Text>
                      </HStack>

                      <Divider />

                      {/* Features Preview */}
                      <VStack align="start" spacing={1.5}>
                        {featureList.slice(0, 5).map((feature, idx) => (
                          <HStack key={idx} spacing={2}>
                            <Icon as={FaCheck} color="green.500" boxSize={3} />
                            <Text fontSize="sm" color={textSecondary}>
                              {feature}
                            </Text>
                          </HStack>
                        ))}
                        {featureList.length > 5 && (
                          <Text fontSize="xs" color={brandColor} fontWeight="500" cursor="pointer" onClick={(e) => { e.stopPropagation(); openDetailsModal(plan); }}>
                            +{featureList.length - 5} more
                          </Text>
                        )}
                      </VStack>

                      {/* Actions */}
                      <VStack spacing={2} pt={2}>
                        <Button
                          w="full"
                          bg={brandColor}
                          color="white"
                          size="sm"
                          fontWeight="500"
                          _hover={{ bg: '#0369a1' }}
                          onClick={() => handleSelectPlan(plan)}
                        >
                          Get Started
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          color={textSecondary}
                          fontWeight="400"
                          _hover={{ color: brandColor }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetailsModal(plan);
                          }}
                        >
                          View All Features
                        </Button>
                      </VStack>
                    </VStack>
                  </Box>
                );
              })}
            </SimpleGrid>
          )}

          {/* Payments secured by Razorpay */}
          <HStack spacing={2} justify="center" pt={4}>
            <Icon as={FaShieldAlt} color="green.500" boxSize={4} />
            <Text fontSize="sm" color={textSecondary}>
              Payments secured by <Text as="span" fontWeight="600" color={textPrimary}>Razorpay</Text>
            </Text>
          </HStack>
        </VStack>
      </Container>

      {/* Plan Details Modal */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.500" />
        <ModalContent borderRadius="8px" mx={4}>
          <ModalHeader pb={3} borderBottom="1px solid" borderColor={borderColor}>
            <HStack spacing={3}>
              {detailPlan?.icon && (
                <Flex
                  w="36px"
                  h="36px"
                  bg={useColorModeValue('gray.100', 'gray.700')}
                  borderRadius="md"
                  align="center"
                  justify="center"
                >
                  <Icon as={detailPlan.icon} color={brandColor} boxSize={4} />
                </Flex>
              )}
              <VStack align="start" spacing={0}>
                <Text fontWeight="600" fontSize="md">{detailPlan?.name}</Text>
                <Text fontSize="xs" color={textSecondary}>{detailPlan?.description}</Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            <VStack align="stretch" spacing={4}>
              <HStack align="baseline" spacing={1}>
                <Text fontSize="xl" fontWeight="700" color={textPrimary}>
                  {detailPlan && formatCurrency(detailPlan.price.amount, detailPlan.price.currency)}
                </Text>
                <Text fontSize="sm" color={textSecondary}>
                  /{detailPlan?.price.billingCycle}
                </Text>
              </HStack>
              <Divider />
              <Text fontWeight="500" fontSize="sm" color={textPrimary}>All Features</Text>
              <VStack align="start" spacing={2}>
                {detailPlan && parseFeatures(detailPlan.features).map((feature, idx) => (
                  <HStack key={idx} spacing={2}>
                    <Icon as={FaCheck} color="green.500" boxSize={3} />
                    <Text fontSize="sm" color={textSecondary}>{feature}</Text>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={borderColor} pt={3}>
            <Button
              bg={brandColor}
              color="white"
              size="sm"
              fontWeight="500"
              _hover={{ bg: '#0369a1' }}
              onClick={() => {
                onDetailClose();
                handleSelectPlan(detailPlan);
              }}
            >
              Select Plan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Compare Plans Modal */}
      <Modal isOpen={isCompareOpen} onClose={onCompareClose} size="4xl" isCentered scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.500" />
        <ModalContent borderRadius="8px" mx={4} maxH="80vh">
          <ModalHeader pb={3} borderBottom="1px solid" borderColor={borderColor}>
            <HStack spacing={2}>
              <Icon as={FaBalanceScale} color={brandColor} />
              <Text fontWeight="600">Compare Plans</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Feature</Th>
                    {comparePlans.map((plan) => (
                      <Th key={plan.id} textAlign="center">
                        <VStack spacing={1}>
                          <Text fontWeight="600" fontSize="sm">{plan.name}</Text>
                          <Text fontSize="xs" color={textSecondary}>
                            {formatCurrency(plan.price.amount, plan.price.currency)}/{plan.price.billingCycle}
                          </Text>
                        </VStack>
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {getAllCompareFeatures().map((feature, idx) => (
                    <Tr key={idx}>
                      <Td fontSize="sm">{feature}</Td>
                      {comparePlans.map((plan) => {
                        const planFeatures = parseFeatures(plan.features);
                        const hasFeature = planFeatures.includes(feature);
                        return (
                          <Td key={plan.id} textAlign="center">
                            {hasFeature ? (
                              <Icon as={FaCheck} color="green.500" boxSize={4} />
                            ) : (
                              <Icon as={FaTimes} color="red.400" boxSize={4} />
                            )}
                          </Td>
                        );
                      })}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={borderColor} pt={3}>
            <HStack spacing={3}>
              <Button variant="outline" size="sm" onClick={() => setComparePlans([])}>
                Clear All
              </Button>
              <Button variant="ghost" size="sm" onClick={onCompareClose}>
                Close
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Sponsor Search Modal */}
      <Modal isOpen={isSponsorSearchOpen} onClose={onSponsorSearchClose} size="lg" isCentered>
        <ModalOverlay bg="blackAlpha.500" />
        <ModalContent borderRadius="8px" mx={4}>
          <ModalHeader pb={3} borderBottom="1px solid" borderColor={borderColor}>
            <HStack spacing={2}>
              <Icon as={FaUserTie} color={brandColor} />
              <Text fontWeight="600">Search Sponsor</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={5}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color={textSecondary}>
                Search for your sponsor by name, email, or Coach ID
              </Text>
              <HStack>
                <InputGroup size="md">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    value={sponsorSearchQuery}
                    onChange={(e) => setSponsorSearchQuery(e.target.value)}
                    placeholder="Enter name, email or coach ID..."
                    bg={inputBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="md"
                    fontSize="sm"
                    _placeholder={{ color: 'gray.400' }}
                    _focus={{ borderColor: brandColor, boxShadow: 'none' }}
                    onKeyPress={(e) => e.key === 'Enter' && searchSponsors()}
                  />
                </InputGroup>
                <Button
                  bg={brandColor}
                  color="white"
                  size="md"
                  fontWeight="500"
                  _hover={{ bg: '#0369a1' }}
                  onClick={searchSponsors}
                  isLoading={sponsorSearchLoading}
                  px={6}
                >
                  Search
                </Button>
              </HStack>

              {/* Search Results */}
              {sponsorSearchResults.length > 0 && (
                <VStack align="stretch" spacing={2} maxH="300px" overflowY="auto">
                  <Text fontSize="sm" fontWeight="500" color={textPrimary}>
                    Results ({sponsorSearchResults.length})
                  </Text>
                  {sponsorSearchResults.map((sponsor) => (
                    <Box
                      key={sponsor._id}
                      p={3}
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={borderColor}
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{
                        borderColor: brandColor,
                        bg: useColorModeValue('blue.50', 'blue.900'),
                      }}
                      onClick={() => selectSponsor(sponsor)}
                    >
                      <HStack justify="space-between">
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="600" fontSize="sm" color={textPrimary}>
                            {sponsor.name}
                          </Text>
                          <Text fontSize="xs" color={textSecondary}>
                            {sponsor.email}
                          </Text>
                        </VStack>
                        <VStack align="end" spacing={0}>
                          <Badge colorScheme="blue" fontSize="xs">
                            {sponsor.selfCoachId || 'No Coach ID'}
                          </Badge>
                          {sponsor.currentLevel && (
                            <Text fontSize="xs" color={textSecondary}>
                              Level {sponsor.currentLevel}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={borderColor} pt={3}>
            <Button variant="ghost" size="sm" onClick={onSponsorSearchClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Signup / OTP Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => {
          onFormClose();
          setModalStep('details');
          setOtp('');
        }} 
        size="4xl" 
        isCentered
        closeOnOverlayClick={!isLoading}
      >
        <ModalOverlay bg="blackAlpha.500" />
        <ModalContent borderRadius="8px" mx={4} minH="75vh" maxH="80vh" overflow="auto">
          <ModalHeader pb={4} borderBottom="1px solid" borderColor={borderColor}>
            <Flex justify="space-between" align="center" w="full" pr={8}>
              <VStack align="start" spacing={1}>
                <Heading size="lg" fontWeight="700" color={textPrimary}>
                  {modalStep === 'details' ? 'Signup As Coach' : 'Verify Your Email'}
                </Heading>
                <Text fontSize="sm" color={textSecondary}>
                  {modalStep === 'details' ? 'Fill in your details to get started' : 'Enter the verification code sent to your email'}
                </Text>
              </VStack>
              {/* Professional Plan Badge */}
              <HStack
                bg={useColorModeValue('blue.50', 'blue.900')}
                border="1px solid"
                borderColor={useColorModeValue('blue.200', 'blue.700')}
                borderRadius="md"
                px={3}
                py={1.5}
                spacing={2}
              >
                {selectedPlan?.icon && <Icon as={selectedPlan.icon} color={brandColor} boxSize={4} />}
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" fontWeight="600" color={brandColor}>
                    {selectedPlan?.name}
                  </Text>
                  <Text fontSize="xs" color={textSecondary}>
                    {selectedPlan && formatCurrency(selectedPlan.price.amount, selectedPlan.price.currency)}/{selectedPlan?.price.billingCycle}
                  </Text>
                </VStack>
              </HStack>
            </Flex>
          </ModalHeader>
          <ModalCloseButton isDisabled={isLoading} />
          <ModalBody py={8}>
            {modalStep === 'details' && (
              <VStack spacing={6} align="stretch">
                {/* Row 1: Name, Email */}
                <SimpleGrid columns={2} spacing={5}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="500" color={textSecondary} mb={1.5}>Full Name</FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FaUser} color="gray.400" boxSize={4} />
                      </InputLeftElement>
                      <Input
                        name="name"
                        value={form.name}
                        onChange={handleFormChange}
                        placeholder="Enter your full name"
                        bg={inputBg}
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                        fontSize="sm"
                        _placeholder={{ color: 'gray.400' }}
                        _focus={{ borderColor: brandColor, boxShadow: 'none' }}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="500" color={textSecondary} mb={1.5}>Email Address</FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <EmailIcon color="gray.400" boxSize={4} />
                      </InputLeftElement>
                      <Input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleFormChange}
                        placeholder="Enter your email address"
                        bg={inputBg}
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                        fontSize="sm"
                        _placeholder={{ color: 'gray.400' }}
                        _focus={{ borderColor: brandColor, boxShadow: 'none' }}
                      />
                    </InputGroup>
                  </FormControl>
                </SimpleGrid>

                {/* Row 2: Phone, Self Coach ID */}
                <SimpleGrid columns={2} spacing={5}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="500" color={textSecondary} mb={1.5}>Phone Number</FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <PhoneIcon color="gray.400" boxSize={4} />
                      </InputLeftElement>
                      <Input
                        name="phone"
                        value={form.phone}
                        onChange={handleFormChange}
                        placeholder="Enter your phone number"
                        bg={inputBg}
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                        fontSize="sm"
                        _placeholder={{ color: 'gray.400' }}
                        _focus={{ borderColor: brandColor, boxShadow: 'none' }}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="500" color={textSecondary} mb={1.5}>Self Coach ID</FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FaIdBadge} color="gray.400" boxSize={4} />
                      </InputLeftElement>
                      <Input
                        name="selfCoachId"
                        value={form.selfCoachId}
                        onChange={handleFormChange}
                        placeholder="Enter your coach ID"
                        bg={inputBg}
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                        fontSize="sm"
                        _placeholder={{ color: 'gray.400' }}
                        _focus={{ borderColor: brandColor, boxShadow: 'none' }}
                      />
                    </InputGroup>
                  </FormControl>
                </SimpleGrid>

                {/* Row 3: Sponsor ID (clickable), Rank */}
                <SimpleGrid columns={2} spacing={5}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="500" color={textSecondary} mb={1.5}>Sponsor</FormLabel>
                    <Box
                      p={3}
                      bg={inputBg}
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="md"
                      cursor="pointer"
                      onClick={onSponsorSearchOpen}
                      _hover={{ borderColor: brandColor }}
                      transition="all 0.2s"
                      minH="48px"
                      display="flex"
                      alignItems="center"
                    >
                      {selectedSponsor ? (
                        <HStack justify="space-between" w="full">
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="500" color={textPrimary}>
                              {selectedSponsor.name}
                            </Text>
                            <Text fontSize="xs" color={textSecondary}>
                              {selectedSponsor.selfCoachId || selectedSponsor.email}
                            </Text>
                          </VStack>
                          <IconButton
                            icon={<CloseIcon />}
                            size="xs"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSponsor(null);
                              setForm((prev) => ({ ...prev, sponsorId: '' }));
                            }}
                          />
                        </HStack>
                      ) : (
                        <HStack spacing={2} color="gray.400">
                          <SearchIcon boxSize={4} />
                          <Text fontSize="sm">Click to search sponsor...</Text>
                        </HStack>
                      )}
                    </Box>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="500" color={textSecondary} mb={1.5}>Rank</FormLabel>
                    <Select
                      name="currentLevel"
                      value={form.currentLevel}
                      onChange={handleFormChange}
                      placeholder="Select your rank"
                      bg={inputBg}
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="md"
                      fontSize="sm"
                      size="lg"
                      icon={<ChevronDownIcon />}
                      _focus={{ borderColor: brandColor, boxShadow: 'none' }}
                    >
                      {ranks.map((rank) => (
                        <option key={rank.level} value={rank.level}>
                          {rank.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <Divider />

                {/* Row 4: Passwords */}
                <SimpleGrid columns={2} spacing={5}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="500" color={textSecondary} mb={1.5}>Password</FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <LockIcon color="gray.400" boxSize={4} />
                      </InputLeftElement>
                      <Input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleFormChange}
                        placeholder="Enter your password"
                        bg={inputBg}
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                        fontSize="sm"
                        _placeholder={{ color: 'gray.400' }}
                        _focus={{ borderColor: brandColor, boxShadow: 'none' }}
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          size="sm"
                          icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label="Toggle password"
                          color="gray.400"
                          _hover={{ color: textPrimary }}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="500" color={textSecondary} mb={1.5}>Confirm Password</FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <LockIcon color="gray.400" boxSize={4} />
                      </InputLeftElement>
                      <Input
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={handleFormChange}
                        placeholder="Confirm your password"
                        bg={inputBg}
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                        fontSize="sm"
                        _placeholder={{ color: 'gray.400' }}
                        _focus={{ borderColor: brandColor, boxShadow: 'none' }}
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          size="sm"
                          icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label="Toggle confirm password"
                          color="gray.400"
                          _hover={{ color: textPrimary }}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                </SimpleGrid>
              </VStack>
            )}

            {modalStep === 'otp' && (
              <VStack spacing={6} align="center" py={8}>
                <VStack spacing={2}>
                  <Flex
                    w="72px"
                    h="72px"
                    bg={useColorModeValue('blue.50', 'blue.900')}
                    borderRadius="full"
                    align="center"
                    justify="center"
                  >
                    <Icon as={EmailIcon} boxSize={8} color={brandColor} />
                  </Flex>
                  <Text fontWeight="600" fontSize="xl" color={textPrimary}>Check Your Email</Text>
                  <Text fontSize="sm" color={textSecondary} textAlign="center">
                    We've sent a 6-digit verification code to<br />
                    <Text as="span" fontWeight="600" color={textPrimary}>{form.email}</Text>
                  </Text>
                </VStack>
                <HStack spacing={3}>
                  <PinInput 
                    otp 
                    value={otp} 
                    onChange={setOtp} 
                    size="lg"
                    focusBorderColor={brandColor}
                  >
                    {[...Array(6)].map((_, i) => (
                      <PinInputField
                        key={i}
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor={borderColor}
                        bg={inputBg}
                        fontSize="xl"
                        w="56px"
                        h="64px"
                        _focus={{ borderColor: brandColor, boxShadow: 'none' }}
                      />
                    ))}
                  </PinInput>
                </HStack>
                <Text fontSize="sm" color={textSecondary}>
                  Didn't receive the code?{' '}
                  <Button variant="link" color={brandColor} size="sm" fontWeight="500">
                    Resend
                  </Button>
                </Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={borderColor} pt={4}>
            <Flex w="full" justify="flex-end">
              <Button
                bg={brandColor}
                color="white"
                size="md"
                fontWeight="500"
                fontSize="sm"
                px={6}
                _hover={{ bg: '#0369a1' }}
                onClick={modalStep === 'details' ? handleSignup : handleVerifyOtp}
                isLoading={isLoading}
                loadingText={modalStep === 'details' ? 'Creating...' : 'Verifying...'}
              >
                {modalStep === 'details' ? 'Continue' : 'Verify & Pay'}
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SignupNew;
