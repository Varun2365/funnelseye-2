import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerSuccess } from '../redux/authSlice';
import swal from 'sweetalert';
import {
    Box,
    Button,
    Container,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputLeftElement,
    VStack,
    HStack,
    Text,
    Heading,
    Divider,
    useColorModeValue,
    Icon,
    Flex,
    Badge,
    Card,
    CardBody,
    SimpleGrid,
    PinInput,
    PinInputField,
    Center,
    Spinner,
    useToast,
    ScaleFade,
    Fade,
    Alert,
    AlertIcon,
    AlertDescription,
    Avatar,
    AvatarBadge,
    CardHeader,
    List,
    ListItem,
    ListIcon,
    Stack,
    useBreakpointValue,
    Select
} from '@chakra-ui/react';
import { 
    EmailIcon, 
    LockIcon, 
    ViewIcon, 
    ViewOffIcon,
    CheckCircleIcon,
    StarIcon,
    CheckIcon
} from '@chakra-ui/icons';
import { 
    FaUser, 
    FaUserTie, 
    FaGoogle, 
    FaFacebook, 
    FaArrowLeft, 
    FaShieldAlt,
    FaCrown,
    FaRocket,
    FaFire,
    FaGem,
    FaArrowRight,
    FaIdCard
} from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';

import { API_BASE_URL as BASE_API_URL } from '../config/apiConfig';
// Razorpay script loader helper
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
import { useToast as useChakraToast } from '@chakra-ui/react';

// Function to get subscription portal URL dynamically based on environment
const getSubscriptionPortalURL = () => `${BASE_API_URL}/subscription-plans`;

const CustomOtpInput = ({ length = 6, onOtpSubmit }) => {
    const [otp, setOtp] = useState('');
    
    const handleOtpChange = (value) => {
        setOtp(value);
        if (value.length === length) {
            onOtpSubmit(value);
        }
    };

    return (
        <Center>
            <PinInput 
                otp 
                size="lg" 
                value={otp} 
                onChange={handleOtpChange}
                focusBorderColor="gray.800"
                errorBorderColor="red.500"
            >
                {Array.from({ length }).map((_, index) => (
                    <PinInputField 
                        key={index}
                        mx={1}
                        borderRadius="lg"
                        borderWidth="2px"
                        fontSize="xl"
                        fontWeight="bold"
                        h="60px"
                        w="50px"
                        bg="white"
                        borderColor="gray.300"
                        _focus={{
                            borderColor: "gray.800",
                            boxShadow: "0 0 0 3px rgba(0, 0, 0, 0.1)",
                            transform: "scale(1.05)"
                        }}
                        _hover={{
                            borderColor: "gray.600"
                        }}
                        transition="all 0.2s"
                    />
                ))}
            </PinInput>
        </Center>
    );
};

const PlanCard = ({ plan, isSelected, onSelect, ...props }) => {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = isSelected ? 'gray.800' : 'gray.200';
    
    // Add safety checks for plan data
    const planName = plan?.name || 'Unknown Plan';
    const planPrice = plan?.price || {};
    const planAmount = planPrice?.amount || planPrice?.monthly || planPrice?.price || 0;
    const planBillingCycle = planPrice?.billingCycle || planPrice?.interval || 'month';
    const planIcon = plan?.icon || FaGem;
    const planFeatures = plan?.features || [];
    
    return (
        <Card
            bg={cardBg}
            border="3px solid"
            borderColor={borderColor}
            borderRadius="xl"
            position="relative"
            cursor="pointer"
            onClick={() => onSelect(plan)}
            transition="all 0.3s"
            transform={isSelected ? 'scale(1.02)' : 'scale(1)'}
            _hover={{
                transform: 'scale(1.02)',
                shadow: '2xl',
                borderColor: 'gray.800'
            }}
            shadow={isSelected ? '2xl' : 'lg'}
            {...props}
        >
            {plan?.isPopular && (
                <Box
                    position="absolute"
                    top="-12px"
                    left="50%"
                    transform="translateX(-50%)"
                    bg="gray.800"
                    color="white"
                    px={4}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                    fontWeight="bold"
                    zIndex={1}
                >
                    ⭐ Most Popular
                </Box>
            )}
            
            <CardHeader textAlign="center" pb={2}>
                <VStack spacing={3}>
                    <Box
                        p={3}
                        borderRadius="full"
                        bg="gray.800"
                        color="white"
                    >
                        <Icon as={planIcon} boxSize={8} />
                    </Box>
                    
                    <VStack spacing={1}>
                        <Heading size="lg" color="gray.800">
                            {planName}
                        </Heading>
                        <HStack>
                            <Text
                                fontSize="3xl"
                                fontWeight="bold"
                                color="gray.800"
                            >
                                ${planAmount}
                            </Text>
                            <Text fontSize="md" color="gray.500">
                                /{planBillingCycle}
                            </Text>
                        </HStack>
                    </VStack>
                </VStack>
            </CardHeader>
            
            <CardBody pt={0}>
                <List spacing={3}>
                    {planFeatures.map((feature, index) => (
                        <ListItem key={index} display="flex" alignItems="center">
                            <ListIcon 
                                as={CheckIcon} 
                                color="gray.800"
                                fontSize="sm"
                            />
                            <Text fontSize="sm" color="gray.600">
                                {feature}
                            </Text>
                        </ListItem>
                    ))}
                </List>
                
                {isSelected && (
                    <Fade in={true}>
                        <Alert 
                            status="success" 
                            mt={4} 
                            borderRadius="lg"
                            bg="gray.50"
                            border="1px solid"
                            borderColor="gray.200"
                        >
                            <AlertIcon color="gray.800" />
                            <AlertDescription color="gray.800" fontWeight="semibold">
                                Plan Selected!
                            </AlertDescription>
                        </Alert>
                    </Fade>
                )}
            </CardBody>
        </Card>
    );
};

const Signup = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const toast = useToast();

    const [step, setStep] = useState('plan_selection');
    const [input, setInput] = useState({
        name: '',
        email: '',
        password: '',
        role: 'coach',
        selfCoachId: '',
        currentLevel: '',
        sponsorId: '',
        teamRankName: '',
        presidentTeamRankName: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [sponsorOptions, setSponsorOptions] = useState([]);
    const [coachLevels, setCoachLevels] = useState([]);
    const [isHierarchyMetaLoading, setIsHierarchyMetaLoading] = useState(false);
    const [allowInternalSignup, setAllowInternalSignup] = useState(false);
    // const [razorpayReady, setRazorpayReady] = useState(false);
    // const [razorpayReady, setRazorpayReady] = useState(false);

    // Responsive values
    const cardColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 });

    // Color mode values (Black and White theme)
    const bgGradient = useColorModeValue(
        'linear(to-br, gray.50, white)',
        'linear(to-br, gray.900, gray.800)'
    );
    const cardBg = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.700', 'gray.200');
    const headingColor = useColorModeValue('gray.800', 'white');

    const defaultHierarchyLevels = Array.from({ length: 12 }).map((_, index) => ({
        level: index + 1,
        name: `Level ${index + 1}`,
        description: `Hierarchy level ${index + 1}`
    }));

    const fetchHierarchyMetadata = async () => {
        setIsHierarchyMetaLoading(true);
        try {
            const [sponsorRes, rankRes] = await Promise.allSettled([
                fetch(`${BASE_API_URL}/api/auth/available-sponsors`),
                fetch(`${BASE_API_URL}/api/auth/coach-ranks`)
            ]);

            if (sponsorRes.status === 'fulfilled' && sponsorRes.value.ok) {
                const sponsorJson = await sponsorRes.value.json();
                const sponsors = sponsorJson?.data?.digitalSponsors || [];
                setSponsorOptions(sponsors);
            } else {
                setSponsorOptions([]);
            }

            if (rankRes.status === 'fulfilled' && rankRes.value.ok) {
                const ranksJson = await rankRes.value.json();
                const levels = Array.isArray(ranksJson?.data) && ranksJson.data.length > 0
                    ? ranksJson.data
                    : defaultHierarchyLevels;
                setCoachLevels(levels);
            } else {
                setCoachLevels(defaultHierarchyLevels);
            }
        } catch (error) {
            console.error('Error fetching hierarchy metadata:', error);
            setCoachLevels(defaultHierarchyLevels);
            setSponsorOptions([]);
            toast({
                title: "Hierarchy data unavailable",
                description: "Unable to load sponsor or level metadata. You can still proceed manually.",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsHierarchyMetaLoading(false);
        }
    };

    const fetchSubscriptionPlans = async () => {
        try {
            setLoadingPlans(true);
            
            // Use working dashboard API instead of non-existent subscription API
            const response = await fetch(`${BASE_API_URL}/api/coach-dashboard/overview`);
            const data = await response.json();

            if (response.ok) {
                // Provide fallback subscription plans since dashboard API doesn't have subscription data
                const fallbackPlans = [
                    {
                        id: 'basic-plan',
                        name: 'Basic Plan',
                        description: 'Perfect for getting started',
                        price: { amount: 29, billingCycle: 'month' },
                        features: [
                            'Up to 3 Funnels',
                            '1,000 Leads per month',
                            '2 Staff members',
                            'Basic Analytics',
                            'Email Support'
                        ],
                        isPopular: false
                    },
                    {
                        id: 'pro-plan',
                        name: 'Pro Plan',
                        description: 'Most popular choice for growing businesses',
                        price: { amount: 79, billingCycle: 'month' },
                        features: [
                            'Up to 10 Funnels',
                            '10,000 Leads per month',
                            '5 Staff members',
                            'AI Features',
                            'Advanced Analytics',
                            'Priority Support',
                            'Custom Integrations'
                        ],
                        isPopular: true
                    },
                    {
                        id: 'enterprise-plan',
                        name: 'Enterprise Plan',
                        description: 'For large teams and advanced needs',
                        price: { amount: 199, billingCycle: 'month' },
                        features: [
                            'Unlimited Funnels',
                            'Unlimited Leads',
                            'Unlimited Staff',
                            'All AI Features',
                            'Advanced Analytics',
                            'Priority Support',
                            'Custom Domain',
                            'White-label Options',
                            'Dedicated Account Manager'
                        ],
                        isPopular: false
                    }
                ];
                
                const transformedPlans = fallbackPlans.map(plan => ({
                    id: plan.id,
                    name: plan.name,
                    description: plan.description,
                    price: plan.price,
                    features: plan.features,
                    isPopular: plan.isPopular || false,
                    icon: getIconForPlan(plan.name),
                    originalData: plan // Keep original data for API calls
                }));
                
                setSubscriptionPlans(transformedPlans);
            } else {
                // Use fallback plans when API fails
                const fallbackPlans = [
                    {
                        id: 'basic-plan',
                        name: 'Basic Plan',
                        description: 'Perfect for getting started',
                        price: { amount: 29, billingCycle: 'month' },
                        features: [
                            'Up to 3 Funnels',
                            '1,000 Leads per month',
                            '2 Staff members',
                            'Basic Analytics',
                            'Email Support'
                        ],
                        isPopular: false
                    },
                    {
                        id: 'pro-plan',
                        name: 'Pro Plan',
                        description: 'Most popular choice for growing businesses',
                        price: { amount: 79, billingCycle: 'month' },
                        features: [
                            'Up to 10 Funnels',
                            '10,000 Leads per month',
                            '5 Staff members',
                            'AI Features',
                            'Advanced Analytics',
                            'Priority Support',
                            'Custom Integrations'
                        ],
                        isPopular: true
                    },
                    {
                        id: 'enterprise-plan',
                        name: 'Enterprise Plan',
                        description: 'For large teams and advanced needs',
                        price: { amount: 199, billingCycle: 'month' },
                        features: [
                            'Unlimited Funnels',
                            'Unlimited Leads',
                            'Unlimited Staff',
                            'All AI Features',
                            'Advanced Analytics',
                            'Priority Support',
                            'Custom Domain',
                            'White-label Options',
                            'Dedicated Account Manager'
                        ],
                        isPopular: false
                    }
                ];
                
                const transformedPlans = fallbackPlans.map(plan => ({
                    id: plan.id,
                    name: plan.name,
                    description: plan.description,
                    price: plan.price,
                    features: plan.features,
                    isPopular: plan.isPopular || false,
                    icon: getIconForPlan(plan.name),
                    originalData: plan
                }));
                
                setSubscriptionPlans(transformedPlans);
                
                toast({
                    title: "⚠️ Using Demo Plans",
                    description: "API connection failed. Showing demo subscription plans.",
                    status: "warning",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
            
            // Use fallback plans when API fails
            const fallbackPlans = [
                {
                    id: 'basic-plan',
                    name: 'Basic Plan',
                    description: 'Perfect for getting started',
                    price: { amount: 29, billingCycle: 'month' },
                    features: [
                        'Up to 3 Funnels',
                        '1,000 Leads per month',
                        '2 Staff members',
                        'Basic Analytics',
                        'Email Support'
                    ],
                    isPopular: false
                },
                {
                    id: 'pro-plan',
                    name: 'Pro Plan',
                    description: 'Most popular choice for growing businesses',
                    price: { amount: 79, billingCycle: 'month' },
                    features: [
                        'Up to 10 Funnels',
                        '10,000 Leads per month',
                        '5 Staff members',
                        'AI Features',
                        'Advanced Analytics',
                        'Priority Support',
                        'Custom Integrations'
                    ],
                    isPopular: true
                },
                {
                    id: 'enterprise-plan',
                    name: 'Enterprise Plan',
                    description: 'For large teams and advanced needs',
                    price: { amount: 199, billingCycle: 'month' },
                    features: [
                        'Unlimited Funnels',
                        'Unlimited Leads',
                        'Unlimited Staff',
                        'All AI Features',
                        'Advanced Analytics',
                        'Priority Support',
                        'Custom Domain',
                        'White-label Options',
                        'Dedicated Account Manager'
                    ],
                    isPopular: false
                }
            ];
            
            const transformedPlans = fallbackPlans.map(plan => ({
                id: plan.id,
                name: plan.name,
                description: plan.description,
                price: plan.price,
                features: plan.features,
                isPopular: plan.isPopular || false,
                icon: getIconForPlan(plan.name),
                originalData: plan
            }));
            
            setSubscriptionPlans(transformedPlans);
            
            toast({
                title: "⚠️ Using Demo Plans",
                description: "API connection failed. Showing demo subscription plans.",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoadingPlans(false);
        }
    };

    // Fetch subscription plans on component mount
    useEffect(() => {
        fetchSubscriptionPlans();
    }, []);

    useEffect(() => {
        fetchHierarchyMetadata();
        loadRazorpay().then((ok) => setRazorpayReady(ok));
    }, []);

    useEffect(() => {
        if (location.state && location.state.plan) {
            setSelectedPlan(location.state.plan);
            setStep('details_input');
        }
    }, [location.state]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const fromSubscriptionPortal = params.get('fromSubscription') === 'true' || params.get('subscriptionComplete') === 'true';
        if (location.state?.skipSubscriptionRedirect || fromSubscriptionPortal) {
            setAllowInternalSignup(true);
            return;
        }
        const redirectTimer = setTimeout(() => {
            window.location.href = getSubscriptionPortalURL();
        }, 1000);
        return () => clearTimeout(redirectTimer);
    }, [location.search, location.state]);

    if (!allowInternalSignup) {
        return (
            <Box minH="100vh" bgGradient={bgGradient} py={16} px={4}>
                <Container maxW="3xl">
                    <Card bg={cardBg} shadow="2xl" borderRadius="2xl" border="1px solid" borderColor="gray.200">
                        <CardBody p={{ base: 8, md: 10 }}>
                            <VStack spacing={6} textAlign="center">
                                <Flex
                                    w="70px"
                                    h="70px"
                                    borderRadius="full"
                                    bg="gray.900"
                                    color="white"
                                    align="center"
                                    justify="center"
                                >
                                    <Icon as={FaRocket} boxSize={8} />
                                </Flex>
                                <Heading size="lg" color={headingColor}>
                                    Redirecting to Subscription Plans
                                </Heading>
                                <Text color={textColor} fontSize="md">
                                    All plan selection, payments, and new coach signups are handled on our hosted portal.
                                    You’ll be redirected to <strong>funnelseye.com/subscription-plans</strong> to complete the process.
                                </Text>
                                <HStack spacing={3} color={textColor}>
                                    <Spinner size="sm" />
                                    <Text fontWeight="600">Preparing secure portal...</Text>
                                </HStack>
                                <Button
                                    size="lg"
                                    w="full"
                                    bg="gray.900"
                                    color="white"
                                    rightIcon={<Icon as={FaArrowRight} />}
                                    _hover={{ bg: "gray.800" }}
                                    onClick={() => (window.location.href = getSubscriptionPortalURL())}
                                >
                                    Go to Subscription Plans
                                </Button>
                            </VStack>
                        </CardBody>
                    </Card>
                </Container>
            </Box>
        );
    }

    const formatFeatureName = (key) => {
        const featureNames = {
            maxFunnels: 'Max Funnels',
            maxLeads: 'Max Leads',
            maxStaff: 'Max Staff',
            maxAutomationRules: 'Automation Rules',
            aiFeatures: 'AI Features',
            advancedAnalytics: 'Advanced Analytics',
            prioritySupport: 'Priority Support',
            customDomain: 'Custom Domain'
        };
        return featureNames[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    };

    const getIconForPlan = (planName) => {
        const name = planName.toLowerCase();
        if (name.includes('starter') || name.includes('basic')) return FaRocket;
        if (name.includes('premium') || name.includes('pro')) return FaFire;
        if (name.includes('enterprise') || name.includes('ultimate')) return FaCrown;
        return FaGem;
    };

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        toast({
            title: "Plan Selected!",
            description: `You have selected the ${plan.name} plan.`,
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    };

    const handleContinueWithPlan = () => {
        if (!selectedPlan) {
            toast({
                title: "Please Select a Plan",
                description: "Choose a subscription plan to continue.",
                status: "warning",
                duration: 4000,
                isClosable: true,
            });
            return;
        }
        setStep('details_input');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`Input change - Field: ${name}, Value: "${value}"`);
        setInput((prev) => ({ ...prev, [name]: value }));
        
        // Special logging for coach ID
        if (name === 'selfCoachId') {
            console.log(`Coach ID updated to: "${value}"`);
            console.log(`Current input state:`, { ...input, [name]: value });
        }
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();

        // Check for empty or whitespace-only values
        if (!input.name || !input.email || !input.password || !input.selfCoachId || !input.currentLevel) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields including Coach ID and hierarchy level.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            return;
        }
        
        const parsedLevel = Number(input.currentLevel);
        if (Number.isNaN(parsedLevel) || parsedLevel < 1) {
            toast({
                title: "Invalid Hierarchy Level",
                description: "Please select a valid hierarchy level.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            return;
        }
        
        // Check for whitespace-only coach ID
        if (!input.selfCoachId.trim()) {
            toast({
                title: "Invalid Coach ID",
                description: "Coach ID cannot be empty or contain only spaces.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            return;
        }
        
        console.log('=== VALIDATION CHECKS ===');
        console.log('Name length:', input.name.length, 'Value:', `"${input.name}"`);
        console.log('Email length:', input.email.length, 'Value:', `"${input.email}"`);
        console.log('Password length:', input.password.length, 'Value:', `"${input.password}"`);
        console.log('Coach ID length:', input.selfCoachId.length, 'Value:', `"${input.selfCoachId}"`);
        console.log('Coach ID trimmed length:', input.selfCoachId.trim().length);
        console.log('Hierarchy level:', input.currentLevel);
        console.log('========================');

        // Debug: Log what we're sending
        const payload = {
            name: input.name.trim(),
            email: input.email.trim(),
            password: input.password,
            role: 'coach',
            selfCoachId: input.selfCoachId.trim(),
            currentLevel: parsedLevel,
            ...(input.sponsorId ? { sponsorId: input.sponsorId } : {}),
            ...(input.teamRankName ? { teamRankName: input.teamRankName.trim() } : {}),
            ...(input.presidentTeamRankName ? { presidentTeamRankName: input.presidentTeamRankName.trim() } : {})
        };
        console.log('Exact payload being sent:', payload);
        console.log('Payload JSON string:', JSON.stringify(payload));

        setIsLoading(true);
        try {
            console.log('=== API REQUEST DETAILS ===');
            console.log('URL:', `${BASE_API_URL}/api/auth/signup`);
            console.log('Method: POST');
            console.log('Headers:', { 'Content-Type': 'application/json' });
            console.log('Request Body:', payload);
            console.log('Request Body JSON:', JSON.stringify(payload));
            console.log('==========================');
            
            const response = await fetch(`${BASE_API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            
            // Debug: Log API response
            console.log('API Response:', data);
            console.log('Response status:', response.status);

            if (response.ok && data.success) {
                toast({
                    title: "Success!",
                    description: data.message || 'An OTP has been sent to your email.',
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                setStep('otp_input');
            } else {
                toast({
                    title: "Registration Error",
                    description: data.message || 'Could not process registration.',
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast({
                title: "Connection Error",
                description: 'Could not connect to the server.',
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (otpValue) => {
        if (!otpValue || otpValue.length < 6) {
            toast({
                title: "Invalid OTP",
                description: 'Please enter a valid 6-digit OTP.',
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_API_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: input.email, otp: otpValue }),
            });
            const data = await response.json();

            if (response.ok && data.success) {
                const verifiedUserId = data.user?._id || data.user?.id;
                
                // After successful registration, subscribe to the selected plan
                await subscribeToSelectedPlan(data.token, verifiedUserId);
                
                dispatch(registerSuccess({ user: data.user, token: data.token }));
                toast({
                    title: "Account Created!",
                    description: 'Your account and subscription have been set up successfully!',
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                navigate('/dashboard');
            } else {
                toast({
                    title: "OTP Verification Failed",
                    description: data.message || 'Invalid OTP. Please try again.',
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            toast({
                title: "Connection Error",
                description: 'Could not connect to the server.',
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const subscribeToSelectedPlan = async (token, verifiedUserId) => {
        if (!selectedPlan) {
            return;
        }
        try {
            const requestBody = {
                planId: selectedPlan.id,
                userId: verifiedUserId,
                coachId: verifiedUserId,
                token: token,
                userEmail: input.email,
                userName: input.name,
                paymentData: {
                    status: 'paid', // This would come from actual payment gateway
                    gateway: 'stripe',
                    transactionId: `txn_${Date.now()}`
                }
            };
            
            console.log('📤 Signup Subscription API Request Body:', requestBody);
            
            const response = await fetch(`${BASE_API_URL}/api/subscriptions/subscribe`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody),
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                console.error('Subscription error:', data.message);
                toast({
                    title: "Subscription Warning",
                    description: 'Account created but subscription setup failed. Please contact support.',
                    status: "warning",
                    duration: 7000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Subscription error:', error);
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 'plan_selection': return '💼 Choose Your Plan';
            case 'details_input': return '🚀 Create Your Account';
            case 'otp_input': return '✉️ Verify Your Email';
            default: return '';
        }
    };

    const getStepDescription = () => {
        switch (step) {
            case 'plan_selection': return 'Select the perfect plan for your coaching business';
            case 'details_input': return 'Fill in your details to get started';
            case 'otp_input': return 'Check your inbox for the verification code';
            default: return '';
        }
    };

    return (
        <Box minH="100vh" bgGradient={bgGradient} py={8}>
            <Container maxW={step === 'plan_selection' ? '6xl' : 'lg'} centerContent>
                <ScaleFade initialScale={0.9} in={true}>
                    <VStack spacing={8} w="full">
                        {/* Header Section */}
                        <VStack spacing={4} textAlign="center">
                            <Avatar size="xl" bg="gray.800" color="white">
                                <AvatarBadge boxSize="1.25em" bg="green.500">
                                    <Icon as={CheckCircleIcon} />
                                </AvatarBadge>
                            </Avatar>
                            
                            <VStack spacing={2}>
                                <Heading 
                                    as="h1" 
                                    size="xl" 
                                    color={headingColor}
                                    fontWeight="bold"
                                >
                                    {getStepTitle()}
                                </Heading>
                                <Text color={textColor} fontSize="lg">
                                    {getStepDescription()}
                                </Text>
                                
                                {/* Step Progress Indicator */}
                                <HStack spacing={2} mt={4}>
                                    {['plan_selection', 'details_input', 'otp_input'].map((stepName, index) => (
                                        <Box key={stepName} display="flex" alignItems="center">
                                            <Box
                                                w={8}
                                                h={8}
                                                borderRadius="full"
                                                bg={
                                                    step === stepName 
                                                        ? 'gray.800' 
                                                        : index < ['plan_selection', 'details_input', 'otp_input'].indexOf(step)
                                                            ? 'green.500'
                                                            : 'gray.300'
                                                }
                                                color="white"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                fontSize="sm"
                                                fontWeight="bold"
                                            >
                                                {index < ['plan_selection', 'details_input', 'otp_input'].indexOf(step) ? (
                                                    <Icon as={CheckIcon} />
                                                ) : (
                                                    index + 1
                                                )}
                                            </Box>
                                            {index < 2 && (
                                                <Box
                                                    w={12}
                                                    h={1}
                                                    bg={
                                                        index < ['plan_selection', 'details_input', 'otp_input'].indexOf(step)
                                                            ? 'green.500'
                                                            : 'gray.300'
                                                    }
                                                    mx={2}
                                                />
                                            )}
                                        </Box>
                                    ))}
                                </HStack>
                            </VStack>
                        </VStack>

                        {/* Main Content */}
                        {step === 'plan_selection' ? (
                            <Fade in={true}>
                                <VStack spacing={8} w="full">
                                    {loadingPlans ? (
                                        <VStack spacing={4}>
                                            <Spinner size="xl" color="gray.800" />
                                            <Text color={textColor}>Loading subscription plans...</Text>
                                        </VStack>
                                    ) : (
                                        <>
                                            {/* Plans Grid */}
                                            <SimpleGrid 
                                                columns={cardColumns} 
                                                spacing={6} 
                                                w="full"
                                                maxW="6xl"
                                            >
                                                {subscriptionPlans.map((plan) => (
                                                    <PlanCard
                                                        key={plan.id}
                                                        plan={plan}
                                                        isSelected={selectedPlan?.id === plan.id}
                                                        onSelect={handlePlanSelect}
                                                    />
                                                ))}
                                            </SimpleGrid>

                                            {/* Continue Button */}
                                            <VStack spacing={4} w="full" maxW="md">
                                                <Button
                                                    size="lg"
                                                    w="full"
                                                    bg="gray.800"
                                                    color="white"
                                                    _hover={{
                                                        bg: "gray.700",
                                                        transform: "translateY(-1px)",
                                                        shadow: "xl"
                                                    }}
                                                    _active={{
                                                        transform: "translateY(0px)"
                                                    }}
                                                    borderRadius="lg"
                                                    fontWeight="bold"
                                                    fontSize="lg"
                                                    rightIcon={<Icon as={FaArrowRight} />}
                                                    onClick={handleContinueWithPlan}
                                                    isDisabled={!selectedPlan}
                                                    transition="all 0.2s"
                                                >
                                                    Continue with {selectedPlan?.name || 'Selected'} Plan
                                                </Button>

                                                <Text color={textColor} fontSize="sm" textAlign="center">
                                                    Already have an account?{' '}
                                                    <Link to="/login">
                                                        <Text 
                                                            as="span" 
                                                            color="gray.800" 
                                                            fontWeight="semibold"
                                                            _hover={{ color: "gray.600" }}
                                                        >
                                                            Sign In →
                                                        </Text>
                                                    </Link>
                                                </Text>
                                            </VStack>
                                        </>
                                    )}
                                </VStack>
                            </Fade>
                        ) : (
                            <Card 
                                w="full" 
                                maxW="md" 
                                bg={cardBg} 
                                shadow="2xl" 
                                borderRadius="xl"
                                border="1px solid"
                                borderColor="gray.200"
                                overflow="hidden"
                            >
                                <CardBody p={8}>
                                    {/* Selected Plan Display */}
                                    {selectedPlan && (
                                        <Alert 
                                            status="info" 
                                            borderRadius="lg" 
                                            bg="gray.50" 
                                            border="2px solid" 
                                            borderColor="gray.200"
                                            mb={6}
                                        >
                                            <AlertIcon color="gray.800" />
                                            <VStack spacing={1} align="start">
                                                <Text color="gray.800" fontWeight="semibold">
                                                    Selected Plan: {selectedPlan.name}
                                                </Text>
                                                <Text color="gray.600" fontSize="sm">
                                                    ${selectedPlan.price?.amount || selectedPlan.price?.monthly || selectedPlan.price?.price || 0}/{selectedPlan.price?.billingCycle || selectedPlan.price?.interval || 'month'}
                                                </Text>
                                            </VStack>
                                            <Button
                                                size="xs"
                                                variant="ghost"
                                                colorScheme="gray"
                                                ml="auto"
                                                onClick={() => setStep('plan_selection')}
                                            >
                                                Change
                                            </Button>
                                        </Alert>
                                    )}

                                    {step === 'details_input' ? (
                                        <Fade in={true}>
                                            <VStack spacing={6} as="form" onSubmit={handleRequestOtp}>
                                                {/* Form Fields */}
                                                <VStack spacing={5} w="full">
                                                    <FormControl isRequired>
                                                        <FormLabel color={textColor} fontWeight="semibold">
                                                            👤 Full Name
                                                        </FormLabel>
                                                        <InputGroup>
                                                            <InputLeftElement>
                                                                <Icon as={FaUser} color="gray.400" />
                                                            </InputLeftElement>
                                                            <Input
                                                                name="name"
                                                                value={input.name}
                                                                onChange={handleInputChange}
                                                                placeholder="Enter your full name"
                                                                size="lg"
                                                                borderRadius="lg"
                                                                focusBorderColor="gray.800"
                                                                _hover={{ borderColor: "gray.600" }}
                                                                bg="gray.50"
                                                                _focus={{ bg: "white" }}
                                                            />
                                                        </InputGroup>
                                                    </FormControl>

                                                    <FormControl isRequired>
                                                        <FormLabel color={textColor} fontWeight="semibold">
                                                            📧 Email Address
                                                        </FormLabel>
                                                        <InputGroup>
                                                            <InputLeftElement>
                                                                <EmailIcon color="gray.400" />
                                                            </InputLeftElement>
                                                            <Input
                                                                name="email"
                                                                type="email"
                                                                value={input.email}
                                                                onChange={handleInputChange}
                                                                placeholder="your@email.com"
                                                                size="lg"
                                                                borderRadius="lg"
                                                                focusBorderColor="gray.800"
                                                                _hover={{ borderColor: "gray.600" }}
                                                                bg="gray.50"
                                                                _focus={{ bg: "white" }}
                                                            />
                                                        </InputGroup>
                                                    </FormControl>

                                                    <FormControl isRequired>
                                                        <FormLabel color={textColor} fontWeight="semibold">
                                                            🆔 Coach ID
                                                        </FormLabel>
                                                        <InputGroup>
                                                            <InputLeftElement>
                                                                <Icon as={FaIdCard} color="gray.400" />
                                                            </InputLeftElement>
                                                            <Input
                                                                name="selfCoachId"
                                                                value={input.selfCoachId}
                                                                onChange={handleInputChange}
                                                                placeholder="Enter your unique coach ID"
                                                                size="lg"
                                                                borderRadius="lg"
                                                                focusBorderColor="gray.800"
                                                                _hover={{ borderColor: "gray.600" }}
                                                                bg="gray.50"
                                                                _focus={{ bg: "white" }}
                                                            />
                                                        </InputGroup>
                                                        <Text fontSize="xs" color="gray.500" mt={1}>
                                                            This will be your unique identifier in the system
                                                        </Text>
                                                    </FormControl>

                                                    <FormControl isRequired>
                                                        <FormLabel color={textColor} fontWeight="semibold">
                                                            🏆 Hierarchy Level
                                                        </FormLabel>
                                                        <Select
                                                            name="currentLevel"
                                                            value={input.currentLevel}
                                                            onChange={handleInputChange}
                                                            placeholder={isHierarchyMetaLoading ? 'Loading levels...' : 'Select your level (1-12)'}
                                                            size="lg"
                                                            borderRadius="lg"
                                                            focusBorderColor="gray.800"
                                                            _hover={{ borderColor: "gray.600" }}
                                                            bg="gray.50"
                                                            _focus={{ bg: "white" }}
                                                            isDisabled={isHierarchyMetaLoading}
                                                        >
                                                            {coachLevels.map((level) => (
                                                                <option key={level.level} value={level.level}>
                                                                    Level {level.level} - {level.name || `Tier ${level.level}`}
                                                                </option>
                                                            ))}
                                                        </Select>
                                                        <Text fontSize="xs" color="gray.500" mt={1}>
                                                            Select the level assigned to you within the FunnelsEye hierarchy
                                                        </Text>
                                                    </FormControl>

                                                    <FormControl>
                                                        <FormLabel color={textColor} fontWeight="semibold">
                                                            🤝 Sponsor (Digital Coach)
                                                        </FormLabel>
                                                        <Select
                                                            name="sponsorId"
                                                            value={input.sponsorId}
                                                            onChange={handleInputChange}
                                                            placeholder={sponsorOptions.length ? 'Select your sponsor' : 'No sponsors available'}
                                                            size="lg"
                                                            borderRadius="lg"
                                                            focusBorderColor="gray.800"
                                                            _hover={{ borderColor: "gray.600" }}
                                                            bg="gray.50"
                                                            _focus={{ bg: "white" }}
                                                            isDisabled={sponsorOptions.length === 0}
                                                        >
                                                            {sponsorOptions.map((sponsor) => (
                                                                <option key={sponsor._id} value={sponsor._id}>
                                                                    {sponsor.name} ({sponsor.selfCoachId}) • Level {sponsor.currentLevel}
                                                                </option>
                                                            ))}
                                                        </Select>
                                                        <Text fontSize="xs" color="gray.500" mt={1}>
                                                            Optional but recommended for MLM tracking
                                                        </Text>
                                                    </FormControl>

                                                    <FormControl>
                                                        <FormLabel color={textColor} fontWeight="semibold">
                                                            🏅 Team Rank Name
                                                        </FormLabel>
                                                        <Input
                                                            name="teamRankName"
                                                            value={input.teamRankName}
                                                            onChange={handleInputChange}
                                                            placeholder="e.g., Elite Performer"
                                                            size="lg"
                                                            borderRadius="lg"
                                                            focusBorderColor="gray.800"
                                                            _hover={{ borderColor: "gray.600" }}
                                                            bg="gray.50"
                                                            _focus={{ bg: "white" }}
                                                        />
                                                    </FormControl>

                                                    <FormControl>
                                                        <FormLabel color={textColor} fontWeight="semibold">
                                                            👑 President Team Rank
                                                        </FormLabel>
                                                        <Input
                                                            name="presidentTeamRankName"
                                                            value={input.presidentTeamRankName}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter president team rank (if any)"
                                                            size="lg"
                                                            borderRadius="lg"
                                                            focusBorderColor="gray.800"
                                                            _hover={{ borderColor: "gray.600" }}
                                                            bg="gray.50"
                                                            _focus={{ bg: "white" }}
                                                        />
                                                    </FormControl>

                                                    <FormControl isRequired>
                                                        <FormLabel color={textColor} fontWeight="semibold">
                                                            🔒 Password
                                                        </FormLabel>
                                                        <InputGroup>
                                                            <InputLeftElement>
                                                                <LockIcon color="gray.400" />
                                                            </InputLeftElement>
                                                            <Input
                                                                name="password"
                                                                type={showPassword ? 'text' : 'password'}
                                                                value={input.password}
                                                                onChange={handleInputChange}
                                                                placeholder="Create a strong password"
                                                                size="lg"
                                                                borderRadius="lg"
                                                                focusBorderColor="gray.800"
                                                                _hover={{ borderColor: "gray.600" }}
                                                                bg="gray.50"
                                                                _focus={{ bg: "white" }}
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                position="absolute"
                                                                right={0}
                                                                zIndex={2}
                                                            >
                                                                <Icon as={showPassword ? ViewOffIcon : ViewIcon} />
                                                            </Button>
                                                        </InputGroup>
                                                    </FormControl>

                                                    {/* Role Display (Fixed as Coach) */}
                                                    <FormControl>
                                                        <FormLabel color={textColor} fontWeight="semibold">
                                                            🎭 Account Type
                                                        </FormLabel>
                                                        <HStack spacing={2}>
                                                            <Badge 
                                                                colorScheme="gray" 
                                                                variant="solid" 
                                                                borderRadius="full"
                                                                px={4}
                                                                py={2}
                                                                fontSize="sm"
                                                                bg="gray.800"
                                                                color="white"
                                                            >
                                                                <Icon as={FaUserTie} mr={2} />
                                                                Coach Account
                                                            </Badge>
                                                        </HStack>
                                                        <Text fontSize="xs" color="gray.500" mt={1}>
                                                            Your account is set up as a professional coach
                                                        </Text>
                                                    </FormControl>
                                                </VStack>

                                                {/* Action Buttons */}
                                                <VStack spacing={4} w="full">
                                                    <Button
                                                        type="submit"
                                                        size="lg"
                                                        w="full"
                                                        bg="gray.800"
                                                        color="white"
                                                        _hover={{
                                                            bg: "gray.700",
                                                            transform: "translateY(-1px)",
                                                            shadow: "xl"
                                                        }}
                                                        _active={{
                                                            transform: "translateY(0px)"
                                                        }}
                                                        borderRadius="lg"
                                                        fontWeight="bold"
                                                        fontSize="lg"
                                                        isLoading={isLoading}
                                                        loadingText="Creating Account..."
                                                        spinnerPlacement="start"
                                                        transition="all 0.2s"
                                                    >
                                                        {!isLoading && '🚀'} Create Coach Account
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        colorScheme="gray"
                                                        leftIcon={<Icon as={FaArrowLeft} />}
                                                        onClick={() => setStep('plan_selection')}
                                                        size="lg"
                                                        borderRadius="lg"
                                                        _hover={{
                                                            bg: "gray.100",
                                                            transform: "translateY(-1px)"
                                                        }}
                                                    >
                                                        Back to Plans
                                                    </Button>
                                                </VStack>

                                                {/* Social Login */}
                                                <VStack spacing={4} w="full">
                                                    <HStack w="full">
                                                        <Divider />
                                                        <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                                                            Or continue with
                                                        </Text>
                                                        <Divider />
                                                    </HStack>

                                                    <SimpleGrid columns={2} spacing={3} w="full">
                                                        <Button
                                                            variant="outline"
                                                            size="lg"
                                                            borderRadius="lg"
                                                            leftIcon={<Icon as={FaGoogle} color="red.500" />}
                                                            _hover={{
                                                                bg: "red.50",
                                                                borderColor: "red.200",
                                                                transform: "translateY(-1px)"
                                                            }}
                                                            transition="all 0.2s"
                                                        >
                                                            Google
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="lg"
                                                            borderRadius="lg"
                                                            leftIcon={<Icon as={FaFacebook} color="blue.500" />}
                                                            _hover={{
                                                                bg: "blue.50",
                                                                borderColor: "blue.200",
                                                                transform: "translateY(-1px)"
                                                            }}
                                                            transition="all 0.2s"
                                                        >
                                                            Facebook
                                                        </Button>
                                                    </SimpleGrid>
                                                </VStack>
                                            </VStack>
                                        </Fade>
                                    ) : (
                                        <Fade in={true}>
                                            <VStack spacing={8}>
                                                {/* OTP Info */}
                                                <VStack spacing={4} textAlign="center">
                                                    <Text color={textColor} fontSize="lg">
                                                        We've sent a 6-digit code to
                                                    </Text>
                                                    <Badge 
                                                        colorScheme="gray" 
                                                        variant="solid" 
                                                        fontSize="md" 
                                                        p={2} 
                                                        borderRadius="lg"
                                                        bg="gray.800"
                                                        color="white"
                                                    >
                                                        {input.email}
                                                    </Badge>
                                                </VStack>

                                                {/* OTP Input */}
                                                <VStack spacing={4}>
                                                    <CustomOtpInput length={6} onOtpSubmit={handleVerifyOtp} />
                                                    
                                                    {isLoading && (
                                                        <HStack spacing={2} color="gray.800">
                                                            <Spinner size="sm" />
                                                            <Text fontWeight="semibold">Verifying OTP...</Text>
                                                        </HStack>
                                                    )}
                                                </VStack>

                                                {/* Back Button */}
                                                <Button
                                                    variant="ghost"
                                                    colorScheme="gray"
                                                    leftIcon={<Icon as={FaArrowLeft} />}
                                                    onClick={() => setStep('details_input')}
                                                    isDisabled={isLoading}
                                                    borderRadius="lg"
                                                    size="lg"
                                                    _hover={{
                                                        bg: "gray.100",
                                                        transform: "translateY(-1px)"
                                                    }}
                                                >
                                                    Change Email Address
                                                </Button>
                                            </VStack>
                                        </Fade>
                                    )}

                                    {/* Footer Links */}
                                    {step === 'details_input' && (
                                        <VStack spacing={3} mt={6} pt={4} borderTop="1px solid" borderColor="gray.100">
                                            <Text color={textColor} fontSize="sm" textAlign="center">
                                                Already have an account?{' '}
                                                <Link to="/login">
                                                    <Text 
                                                        as="span" 
                                                        color="gray.800" 
                                                        fontWeight="semibold"
                                                        _hover={{ color: "gray.600" }}
                                                    >
                                                        Sign In →
                                                    </Text>
                                                </Link>
                                            </Text>
                                            
                                            <HStack spacing={1} color="gray.500" fontSize="xs">
                                                <Icon as={FaShieldAlt} />
                                                <Text>Protected by enterprise-grade security</Text>
                                            </HStack>
                                        </VStack>
                                    )}
                                </CardBody>
                            </Card>
                        )}
                    </VStack>
                </ScaleFade>
            </Container>
        </Box>
    );
};

export default Signup;
