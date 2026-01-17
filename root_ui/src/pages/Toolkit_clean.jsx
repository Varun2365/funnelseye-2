import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Button,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Spinner,
  Progress,
  Flex,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Grid,
  GridItem,
  Select,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FaRocket,
  FaChartBar,
  FaUsers,
  FaCheckCircle,
  FaEnvelope,
  FaUser,
  FaAppleAlt,
  FaHeartbeat,
  FaDumbbell,
  FaArrowLeft,
  FaEye,
} from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/apiConfig';

// Toolkit Listing Component
const ToolkitListing = () => {
  const navigate = useNavigate();

  const tools = [
    {
      id: 'ai-diet-planner',
      title: 'AI Diet Planner',
      description: 'Get a personalized diet plan powered by artificial intelligence for optimal health',
      icon: FaAppleAlt,
      color: '#10b981',
      category: 'Health Tools'
    },
    {
      id: 'bmi-calculator',
      title: 'BMI Calculator',
      description: 'Calculate your Body Mass Index and get personalized health recommendations',
      icon: FaChartBar,
      color: '#3b82f6',
      category: 'Health Tools'
    },
    {
      id: 'fitness-ebook',
      title: 'Ultimate Fitness Guide',
      description: 'Comprehensive ebook with workout plans and nutrition tips for all fitness levels',
      icon: FaDumbbell,
      color: '#f59e0b',
      category: 'Resources'
    },
    {
      id: 'meal-planner',
      title: 'Weekly Meal Planner',
      description: 'Plan your meals for the entire week with our interactive nutrition tool',
      icon: FaUsers,
      color: '#8b5cf6',
      category: 'Health Tools'
    },
    {
      id: 'stress-assessment',
      title: 'Stress Assessment Quiz',
      description: 'Take our quiz to understand your stress levels and get coping strategies',
      icon: FaHeartbeat,
      color: '#ef4444',
      category: 'Wellness Tools'
    },
    {
      id: 'workout-calculator',
      title: 'Workout Calculator',
      description: 'Calculate your ideal workout intensity and duration based on your goals',
      icon: FaRocket,
      color: '#06b6d4',
      category: 'Health Tools'
    }
  ];

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box as="header" bg="white" shadow="sm">
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" py={4}>
            <HStack spacing={4}>
              <Button
                variant="ghost"
                leftIcon={<FaArrowLeft />}
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
              <Heading size="lg" color="#4f46e5">
                FunnelsEye
              </Heading>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" py={12}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading size="2xl" color="gray.900" mb={4}>
              Business Toolkit
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
              Discover powerful tools and resources designed to help entrepreneurs and business owners succeed.
              Access our collection of practical tools for health, productivity, and business growth.
            </Text>
          </Box>

          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr 1fr' }} gap={6}>
            {tools.map((tool) => (
              <GridItem key={tool.id}>
                <Card
                  _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
                  cursor="pointer"
                  onClick={() => navigate(`/toolkit/${tool.id}/demo`)}
                  bg="white"
                >
                  <CardBody>
                    <VStack align="start" spacing={4}>
                      <HStack spacing={3}>
                        <Flex
                          w="12"
                          h="12"
                          borderRadius="xl"
                          bg="#4f46e5"
                          align="center"
                          justify="center"
                          color="white"
                        >
                          <Icon as={tool.icon} boxSize={6} />
                        </Flex>
                        <Badge
                          bg="#06b6d4"
                          color="white"
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="semibold"
                        >
                          {tool.category}
                        </Badge>
                      </HStack>

                      <Heading size="md" color="gray.900">
                        {tool.title}
                      </Heading>

                      <Text color="gray.600" flex="1" lineHeight="1.6">
                        {tool.description}
                      </Text>

                      <HStack spacing={3} w="full">
                        <Button
                          leftIcon={<FaEye />}
                          variant="outline"
                          size="sm"
                          flex="1"
                          borderColor="#4f46e5"
                          color="#4f46e5"
                          _hover={{ bg: "#4f46e5", color: "white" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/toolkit/${tool.id}/demo`);
                          }}
                        >
                          Try Now
                        </Button>
                        <Button
                          leftIcon={<FaRocket />}
                          bg="#4f46e5"
                          color="white"
                          size="sm"
                          flex="1"
                          _hover={{ bg: "#4338ca" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/toolkit/${tool.id}/demo`);
                          }}
                        >
                          Access
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>

          <Box textAlign="center" pt={8}>
            <Text color="gray.600" mb={4}>
              Ready to build your own toolkit? Start creating powerful tools with FunnelsEye!
            </Text>
            <HStack spacing={4} justify="center">
              <Button
                bg="#4f46e5"
                color="white"
                size="lg"
                _hover={{ bg: "#4338ca" }}
                onClick={() => navigate('/signup')}
              >
                Get Started Free
              </Button>
              <Button
                variant="outline"
                borderColor="#4f46e5"
                color="#4f46e5"
                size="lg"
                _hover={{ bg: "#4f46e5", color: "white" }}
                onClick={() => navigate('/login')}
              >
                Login to Dashboard
              </Button>
            </HStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

// Individual Tool Component
const IndividualTool = () => {
  const { slug, coachId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [leadMagnet, setLeadMagnet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Additional state for AI diet planner
  const [showContactForm, setShowContactForm] = useState(false);
  const [dietData, setDietData] = useState({
    age: '',
    weight: '',
    height: '',
    gender: '',
    activityLevel: '',
    goal: '',
    dietaryRestrictions: '',
    preferredMeals: ''
  });
  const [dietFormTouched, setDietFormTouched] = useState(false);

  // Lead magnet data based on slug
  const leadMagnets = {
    'ai-diet-planner': {
      title: 'AI Diet Planner',
      subtitle: 'Get Your Personalized Nutrition Plan',
      description: 'Our AI-powered diet planner analyzes your lifestyle, preferences, and goals to create a customized nutrition plan that actually works for you.',
      icon: FaAppleAlt,
      color: '#10b981',
      features: [
        'Personalized meal recommendations',
        'Calorie tracking integration',
        'Macro nutrient balancing',
        'Weekly progress reports'
      ],
      content: {
        heroTitle: 'Transform Your Health with AI-Powered Nutrition',
        heroSubtitle: 'Get a scientifically-backed diet plan tailored to your unique needs and goals.',
        benefits: [
          'Lose weight sustainably',
          'Improve energy levels',
          'Better digestion and gut health',
          'Long-term healthy habits'
        ]
      }
    },
    'bmi-calculator': {
      title: 'BMI Calculator',
      subtitle: 'Know Your Health Status',
      description: 'Calculate your Body Mass Index and get personalized health insights to understand where you stand on your wellness journey.',
      icon: FaChartBar,
      color: '#3b82f6',
      features: [
        'Accurate BMI calculation',
        'Health risk assessment',
        'Personalized recommendations',
        'Progress tracking tools'
      ],
      content: {
        heroTitle: 'Understand Your Body Better',
        heroSubtitle: 'Get precise BMI calculations and actionable health insights.',
        benefits: [
          'Know your current health status',
          'Understand health risks',
          'Get personalized advice',
          'Track progress over time'
        ]
      }
    },
    'fitness-ebook': {
      title: 'Ultimate Fitness Guide',
      subtitle: 'Your Complete Workout Blueprint',
      description: 'Download our comprehensive fitness ebook with proven workout plans, nutrition guides, and expert tips to achieve your fitness goals.',
      icon: FaDumbbell,
      color: '#f59e0b',
      features: [
        'Beginner to advanced workouts',
        'Nutrition and diet guides',
        'Progress tracking sheets',
        'Motivation and mindset tips'
      ],
      content: {
        heroTitle: 'Your Complete Fitness Journey Starts Here',
        heroSubtitle: 'Master the fundamentals of fitness with our comprehensive guide.',
        benefits: [
          'Build strength and muscle',
          'Improve cardiovascular health',
          'Learn proper form and technique',
          'Stay motivated and consistent'
        ]
      }
    },
    'meal-planner': {
      title: 'Weekly Meal Planner',
      subtitle: 'Organize Your Nutrition',
      description: 'Plan your meals for the entire week with our interactive meal planner. Save time, eat healthier, and reach your nutrition goals.',
      icon: FaUsers,
      color: '#8b5cf6',
      features: [
        'Weekly meal planning',
        'Grocery list generation',
        'Recipe suggestions',
        'Nutritional analysis'
      ],
      content: {
        heroTitle: 'Never Worry About What to Eat Again',
        heroSubtitle: 'Plan, prepare, and enjoy healthy meals every day of the week.',
        benefits: [
          'Save time on meal prep',
          'Eat healthier consistently',
          'Reduce food waste',
          'Control your nutrition intake'
        ]
      }
    },
    'stress-assessment': {
      title: 'Stress Assessment Quiz',
      subtitle: 'Understand Your Stress Levels',
      description: 'Take our comprehensive stress assessment to understand your current stress levels and receive personalized coping strategies.',
      icon: FaHeartbeat,
      color: '#ef4444',
      features: [
        'Comprehensive stress evaluation',
        'Personalized coping strategies',
        'Stress management techniques',
        'Progress tracking tools'
      ],
      content: {
        heroTitle: 'Take Control of Your Stress',
        heroSubtitle: 'Identify your stress triggers and learn effective management techniques.',
        benefits: [
          'Reduce anxiety and stress',
          'Improve mental clarity',
          'Better sleep quality',
          'Enhanced overall well-being'
        ]
      }
    },
    'workout-calculator': {
      title: 'Workout Calculator',
      subtitle: 'Optimize Your Training',
      description: 'Calculate your ideal workout intensity, duration, and recovery periods based on your fitness level and goals.',
      icon: FaRocket,
      color: '#06b6d4',
      features: [
        'Workout intensity calculation',
        'Rest period optimization',
        'Progress tracking',
        'Goal-based recommendations'
      ],
      content: {
        heroTitle: 'Maximize Your Workout Results',
        heroSubtitle: 'Get precise calculations for optimal training intensity and recovery.',
        benefits: [
          'Avoid overtraining injuries',
          'Optimize workout efficiency',
          'Track progress accurately',
          'Achieve goals faster'
        ]
      }
    }
  };

  useEffect(() => {
    const magnet = leadMagnets[slug];
    if (magnet) {
      setLeadMagnet(magnet);
    } else {
      // Redirect to home if invalid slug
      navigate('/');
    }
  }, [slug, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDietInputChange = (e) => {
    if (!dietFormTouched) {
      setDietFormTouched(true);
      setShowContactForm(true);
    }
    setDietData({
      ...dietData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit lead data to backend with coach ID
      const submitData = {
        ...formData,
        leadMagnetSlug: slug,
        coachId: coachId,
        source: 'toolkit_page'
      };

      // Include diet data for AI diet planner
      if (slug === 'ai-diet-planner' && dietFormTouched) {
        submitData.dietData = dietData;
      }

      const response = await fetch(`${API_BASE_URL}/api/leads/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: 'Success!',
          description: 'Your information has been submitted successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Special rendering for AI Diet Planner
  if (slug === 'ai-diet-planner') {
    return (
      <>
        <Box minH="100vh" position="relative" overflow="hidden">
          {/* Background Gradient */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bgGradient="linear(135deg, #10b98110 0%, #10b98105 100%)"
            opacity="0.05"
          />

          {/* Floating Elements */}
          <Box position="absolute" top="10%" left="5%" opacity="0.1">
            <Icon as={FaAppleAlt} boxSize="12" color="#10b981" />
          </Box>
          <Box position="absolute" top="60%" right="8%" opacity="0.1">
            <Icon as={FaRocket} boxSize="16" color="#10b981" />
          </Box>
          <Box position="absolute" bottom="20%" left="10%" opacity="0.1">
            <Icon as={FaHeartbeat} boxSize="10" color="#10b981" />
          </Box>

          <Container maxW="container.xl" py={{ base: 8, md: 16 }} position="relative" zIndex="1">
            <VStack spacing={{ base: 8, md: 12 }} align="center">

              {/* Hero Section */}
              <VStack spacing={{ base: 6, md: 8 }} textAlign="center" maxW="4xl">
                <Flex
                  w={{ base: "20", md: "24" }}
                  h={{ base: "20", md: "24" }}
                  borderRadius="full"
                  bg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  align="center"
                  justify="center"
                  shadow="2xl"
                  position="relative"
                >
                  <Icon as={FaAppleAlt} boxSize={{ base: 10, md: 12 }} color="white" />
                  <Box
                    position="absolute"
                    top="-2"
                    right="-2"
                    w="8"
                    h="8"
                    borderRadius="full"
                    bg="yellow.400"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    shadow="lg"
                  >
                    <Icon as={FaRocket} boxSize="4" color="white" />
                  </Box>
                </Flex>

                <VStack spacing={4}>
                  <Badge
                    bg="green.100"
                    color="green.800"
                    px={4}
                    py={2}
                    borderRadius="full"
                    fontSize="sm"
                    fontWeight="600"
                  >
                    ⚡ AI-Powered Nutrition
                  </Badge>
                  <Heading
                    size={{ base: "3xl", md: "4xl" }}
                    color="gray.900"
                    fontWeight="900"
                    lineHeight="1.1"
                    letterSpacing="-0.02em"
                  >
                    Get Your Perfect
                    <Text color="#10b981" display="block">AI Diet Plan</Text>
                  </Heading>
                  <Text
                    fontSize={{ base: "xl", md: "2xl" }}
                    color="gray.600"
                    maxW="3xl"
                    lineHeight="1.6"
                    fontWeight="500"
                  >
                    Answer a few questions and receive a scientifically-backed nutrition plan tailored to your unique body and goals.
                  </Text>
                </VStack>

                {/* Stats */}
                <HStack spacing={{ base: 8, md: 12 }} pt={4}>
                  <VStack spacing={1}>
                    <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="#10b981">10K+</Text>
                    <Text fontSize="sm" color="gray.600" fontWeight="600">Plans Created</Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="#10b981">95%</Text>
                    <Text fontSize="sm" color="gray.600" fontWeight="600">Success Rate</Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="#10b981">60s</Text>
                    <Text fontSize="sm" color="gray.600" fontWeight="600">To Results</Text>
                  </VStack>
                </HStack>
              </VStack>

              {/* Main Card */}
              <Card
                bg="white"
                shadow="2xl"
                borderRadius="3xl"
                p={{ base: 6, md: 10 }}
                w="full"
                maxW="5xl"
                border="1px solid"
                borderColor="gray.100"
              >
                <VStack spacing={8}>
                  {/* Progress Indicator */}
                  <HStack spacing={4} w="full" justify="center">
                    <Flex
                      w="12"
                      h="12"
                      borderRadius="full"
                      bg={dietFormTouched ? "#10b981" : "gray.200"}
                      color={dietFormTouched ? "white" : "gray.500"}
                      align="center"
                      justify="center"
                      fontWeight="bold"
                      fontSize="sm"
                      transition="all 0.3s"
                    >
                      1
                    </Flex>
                    <Box w="16" h="1" bg={dietFormTouched ? "#10b981" : "gray.200"} borderRadius="full" />
                    <Flex
                      w="12"
                      h="12"
                      borderRadius="full"
                      bg={dietFormTouched ? "#10b981" : "gray.200"}
                      color={dietFormTouched ? "white" : "gray.500"}
                      align="center"
                      justify="center"
                      fontWeight="bold"
                      fontSize="sm"
                      transition="all 0.3s"
                    >
                      2
                    </Flex>
                  </HStack>

                  <VStack spacing={2} textAlign="center">
                    <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="700" color="gray.900">
                      {!dietFormTouched ? "Tell Us About Your Goals" : "Almost There! Enter Your Details"}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {!dietFormTouched ? "Fill in your information to generate your personalized plan" : "Complete your information to receive your AI diet plan"}
                    </Text>
                  </VStack>

                  {/* Diet Planning Form */}
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} w="full">
                    <GridItem>
                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm" fontWeight="600" display="flex" alignItems="center">
                          <Icon as={FaUser} mr={2} color="#10b981" />
                          Age
                        </FormLabel>
                        <Input
                          name="age"
                          type="number"
                          value={dietData.age}
                          onChange={handleDietInputChange}
                          placeholder="25"
                          bg="gray.50"
                          border="2px solid"
                          borderColor="gray.200"
                          _hover={{ borderColor: "#10b981", bg: "white" }}
                          _focus={{
                            borderColor: "#10b981",
                            boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
                            bg: "white"
                          }}
                          size="lg"
                          fontSize="md"
                          borderRadius="xl"
                        />
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm" fontWeight="600" display="flex" alignItems="center">
                          <Icon as={FaUser} mr={2} color="#10b981" />
                          Gender
                        </FormLabel>
                        <Select
                          name="gender"
                          value={dietData.gender}
                          onChange={handleDietInputChange}
                          placeholder="Select gender"
                          bg="gray.50"
                          border="2px solid"
                          borderColor="gray.200"
                          _hover={{ borderColor: "#10b981", bg: "white" }}
                          _focus={{
                            borderColor: "#10b981",
                            boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
                            bg: "white"
                          }}
                          size="lg"
                          borderRadius="xl"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </Select>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm" fontWeight="600" display="flex" alignItems="center">
                          <Icon as={FaHeartbeat} mr={2} color="#10b981" />
                          Weight (kg)
                        </FormLabel>
                        <Input
                          name="weight"
                          type="number"
                          value={dietData.weight}
                          onChange={handleDietInputChange}
                          placeholder="70"
                          bg="gray.50"
                          border="2px solid"
                          borderColor="gray.200"
                          _hover={{ borderColor: "#10b981", bg: "white" }}
                          _focus={{
                            borderColor: "#10b981",
                            boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
                            bg: "white"
                          }}
                          size="lg"
                          borderRadius="xl"
                        />
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm" fontWeight="600" display="flex" alignItems="center">
                          <Icon as={FaRocket} mr={2} color="#10b981" />
                          Height (cm)
                        </FormLabel>
                        <Input
                          name="height"
                          type="number"
                          value={dietData.height}
                          onChange={handleDietInputChange}
                          placeholder="170"
                          bg="gray.50"
                          border="2px solid"
                          borderColor="gray.200"
                          _hover={{ borderColor: "#10b981", bg: "white" }}
                          _focus={{
                            borderColor: "#10b981",
                            boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
                            bg: "white"
                          }}
                          size="lg"
                          borderRadius="xl"
                        />
                      </FormControl>
                    </GridItem>

                    <GridItem colSpan={{ base: 1, md: 2 }}>
                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm" fontWeight="600" display="flex" alignItems="center">
                          <Icon as={FaAppleAlt} mr={2} color="#10b981" />
                          Your Goal
                        </FormLabel>
                        <Select
                          name="goal"
                          value={dietData.goal}
                          onChange={handleDietInputChange}
                          placeholder="What is your main goal?"
                          bg="gray.50"
                          border="2px solid"
                          borderColor="gray.200"
                          _hover={{ borderColor: "#10b981", bg: "white" }}
                          _focus={{
                            borderColor: "#10b981",
                            boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
                            bg: "white"
                          }}
                          size="lg"
                          borderRadius="xl"
                        >
                          <option value="weight-loss">Lose Weight</option>
                          <option value="muscle-gain">Build Muscle</option>
                          <option value="maintenance">Maintain Weight</option>
                          <option value="energy-boost">Boost Energy</option>
                          <option value="health-improvement">Improve Health</option>
                        </Select>
                      </FormControl>
                    </GridItem>

                    <GridItem colSpan={{ base: 1, md: 2 }}>
                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm" fontWeight="600" display="flex" alignItems="center">
                          <Icon as={FaRocket} mr={2} color="#10b981" />
                          Activity Level
                        </FormLabel>
                        <Select
                          name="activityLevel"
                          value={dietData.activityLevel}
                          onChange={handleDietInputChange}
                          placeholder="How active are you?"
                          bg="gray.50"
                          border="2px solid"
                          borderColor="gray.200"
                          _hover={{ borderColor: "#10b981", bg: "white" }}
                          _focus={{
                            borderColor: "#10b981",
                            boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
                            bg: "white"
                          }}
                          size="lg"
                          borderRadius="xl"
                        >
                          <option value="sedentary">Sedentary (desk job, little exercise)</option>
                          <option value="light">Lightly active (1-3 days/week)</option>
                          <option value="moderate">Moderately active (3-5 days/week)</option>
                          <option value="active">Very active (6-7 days/week)</option>
                          <option value="extra">Extremely active (physical job + exercise)</option>
                        </Select>
                      </FormControl>
                    </GridItem>

                    <GridItem colSpan={{ base: 1, md: 2 }}>
                      <FormControl>
                        <FormLabel color="gray.700" fontSize="sm" fontWeight="600" display="flex" alignItems="center">
                          <Icon as={FaAppleAlt} mr={2} color="#10b981" />
                          Dietary Preferences (Optional)
                        </FormLabel>
                        <Textarea
                          name="dietaryRestrictions"
                          value={dietData.dietaryRestrictions}
                          onChange={handleDietInputChange}
                          placeholder="Any allergies, preferences, or restrictions (e.g., vegetarian, gluten-free, nut allergy)"
                          bg="gray.50"
                          border="2px solid"
                          borderColor="gray.200"
                          _hover={{ borderColor: "#10b981", bg: "white" }}
                          _focus={{
                            borderColor: "#10b981",
                            boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
                            bg: "white"
                          }}
                          size="lg"
                          borderRadius="xl"
                          rows={3}
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>

                  {/* Contact Form - Shows when diet form is touched */}
                  {dietFormTouched && (
                    <Box
                      w="full"
                      p={8}
                      bg="linear-gradient(135deg, #10b98108 0%, #05966908 100%)"
                      borderRadius="2xl"
                      border="2px solid"
                      borderColor="#10b981"
                      position="relative"
                      _before={{
                        content: '""',
                        position: 'absolute',
                        top: '-2px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '60px',
                        height: '4px',
                        bg: '#10b981',
                        borderRadius: '2px'
                      }}
                    >
                      <VStack spacing={6}>
                        <VStack spacing={2}>
                          <Icon as={FaRocket} boxSize={8} color="#10b981" />
                          <Heading size="lg" color="gray.900" textAlign="center">
                            Ready for Your AI Diet Plan?
                          </Heading>
                          <Text color="gray.600" textAlign="center" fontSize="sm">
                            Enter your contact details to receive your personalized nutrition plan instantly
                          </Text>
                        </VStack>

                        <Box as="form" onSubmit={handleSubmit} w="full">
                          <VStack spacing={4}>
                            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} w="full">
                              <GridItem>
                                <FormControl isRequired>
                                  <FormLabel color="gray.700" fontSize="sm" fontWeight="600">Full Name</FormLabel>
                                  <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="John Doe"
                                    bg="white"
                                    border="2px solid"
                                    borderColor="gray.200"
                                    _hover={{ borderColor: "#10b981" }}
                                    _focus={{
                                      borderColor: "#10b981",
                                      boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)"
                                    }}
                                    size="lg"
                                    borderRadius="xl"
                                  />
                                </FormControl>
                              </GridItem>

                              <GridItem>
                                <FormControl isRequired>
                                  <FormLabel color="gray.700" fontSize="sm" fontWeight="600">Email Address</FormLabel>
                                  <Input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="john@example.com"
                                    bg="white"
                                    border="2px solid"
                                    borderColor="gray.200"
                                    _hover={{ borderColor: "#10b981" }}
                                    _focus={{
                                      borderColor: "#10b981",
                                      boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)"
                                    }}
                                    size="lg"
                                    borderRadius="xl"
                                  />
                                </FormControl>
                              </GridItem>
                            </Grid>

                            <FormControl>
                              <FormLabel color="gray.700" fontSize="sm" fontWeight="600">Phone Number (Optional)</FormLabel>
                              <Input
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="+1 (555) 123-4567"
                                bg="white"
                                border="2px solid"
                                borderColor="gray.200"
                                _hover={{ borderColor: "#10b981" }}
                                _focus={{
                                  borderColor: "#10b981",
                                  boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)"
                                }}
                                size="lg"
                                borderRadius="xl"
                              />
                            </FormControl>

                            <Button
                              type="submit"
                              bg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                              color="white"
                              size="lg"
                              w="full"
                              _hover={{ bg: "linear-gradient(135deg, #059669 0%, #047857 100%)", transform: "translateY(-2px)" }}
                              _active={{ transform: "translateY(0)" }}
                              isLoading={isSubmitting}
                              loadingText="Creating your personalized diet plan..."
                              fontSize="lg"
                              fontWeight="700"
                              py={6}
                              borderRadius="xl"
                              shadow="lg"
                              transition="all 0.3s"
                            >
                              Get My AI Diet Plan Now
                              <Icon as={FaRocket} ml={2} />
                            </Button>
                          </VStack>
                        </Box>
                      </VStack>
                    </Box>
                  )}

                  {!dietFormTouched && (
                    <VStack spacing={4} pt={4}>
                      <Icon as={FaRocket} color="gray.300" boxSize={12} />
                      <Text color="gray.500" fontSize="sm" textAlign="center" fontStyle="italic">
                        Start filling in your details above to unlock your personalized AI diet plan
                      </Text>
                    </VStack>
                  )}

                  <Text fontSize="xs" color="gray.500" textAlign="center" pt={4}>
                    🔒 Your information is secure. We respect your privacy and will never share your data.
                  </Text>
                </VStack>
              </Card>
            </VStack>
          </Container>
        </Box>
      </>
    );
  }

  // Default rendering for other tools
  return (
    <>
      <Box minH="100vh" bg="gray.50">
        {/* Header */}
        <Box as="header" bg="white" shadow="sm">
          <Container maxW="container.xl">
            <Flex justify="center" align="center" py={4}>
              <Heading size="lg" color="#4f46e5">
                FunnelsEye
              </Heading>
            </Flex>
          </Container>
        </Box>

        {/* Hero Section - Professional Dual Column */}
        <Box py={16}>
          <Container maxW="container.xl">
            <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={12} alignItems="center">
              {/* Left Column - Content */}
              <GridItem>
                <VStack spacing={6} align="start">
                  <Circle size="20" bg={`${leadMagnet.color}15`} border={`2px solid ${leadMagnet.color}30`}>
                    <Icon as={leadMagnet.icon} boxSize={10} color={leadMagnet.color} />
                  </Circle>

                  <VStack spacing={4} align="start">
                    <Heading size="3xl" color="gray.900" fontWeight="800" lineHeight="1.1">
                      {leadMagnet.content.heroTitle}
                    </Heading>
                    <Text fontSize="lg" color="gray.600" lineHeight="1.6">
                      {leadMagnet.content.heroSubtitle}
                    </Text>
                  </VStack>

                  <Card bg="white" shadow="lg" borderRadius="2xl" border="1px solid" borderColor="gray.100" w="full">
                    <CardBody p={6}>
                      <VStack spacing={4} align="start">
                        <Heading size="lg" color="gray.900">{leadMagnet.title}</Heading>
                        <Text color="gray.600" lineHeight="1.6">{leadMagnet.description}</Text>

                        <VStack spacing={3} align="start" w="full">
                          {leadMagnet.content.benefits.map((benefit, index) => (
                            <HStack key={index} spacing={3}>
                              <Icon as={FaCheckCircle} color={leadMagnet.color} boxSize={5} />
                              <Text color="gray.700" fontSize="sm">{benefit}</Text>
                            </HStack>
                          ))}
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </GridItem>

              {/* Right Column - Lead Capture Form */}
              <GridItem>
                <Card
                  bg="white"
                  shadow="2xl"
                  borderRadius="3xl"
                  border="1px solid"
                  borderColor="gray.100"
                  position="relative"
                  overflow="hidden"
                >
                  <CardBody p={8}>
                    <VStack spacing={6}>
                      {/* Header */}
                      <VStack spacing={3} textAlign="center">
                        <Circle size="16" bg={leadMagnet.color} color="white">
                          <Icon as={leadMagnet.icon} boxSize={8} />
                        </Circle>
                        <Heading size="xl" color="gray.900" fontWeight="700">
                          Get Your Free {leadMagnet.title}
                        </Heading>
                        <Text color="gray.600" fontSize="sm" textAlign="center">
                          Join thousands of users who have already transformed their health and wellness journey.
                        </Text>
                      </VStack>

                      {/* Lead Capture Form */}
                      <Box as="form" onSubmit={handleSubmit} w="full">
                        <VStack spacing={5}>
                          <FormControl isRequired>
                            <FormLabel color="gray.700" fontSize="sm" fontWeight="600">Full Name</FormLabel>
                            <Input
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Enter your full name"
                              bg="gray.50"
                              border="2px solid"
                              borderColor="gray.200"
                              _hover={{ borderColor: leadMagnet.color, bg: "white" }}
                              _focus={{
                                borderColor: leadMagnet.color,
                                boxShadow: `0 0 0 3px ${leadMagnet.color}20`,
                                bg: "white"
                              }}
                              size="lg"
                              borderRadius="xl"
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel color="gray.700" fontSize="sm" fontWeight="600">Email Address</FormLabel>
                            <Input
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Enter your email address"
                              bg="gray.50"
                              border="2px solid"
                              borderColor="gray.200"
                              _hover={{ borderColor: leadMagnet.color, bg: "white" }}
                              _focus={{
                                borderColor: leadMagnet.color,
                                boxShadow: `0 0 0 3px ${leadMagnet.color}20`,
                                bg: "white"
                              }}
                              size="lg"
                              borderRadius="xl"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel color="gray.700" fontSize="sm" fontWeight="600">Phone Number (Optional)</FormLabel>
                            <Input
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="Enter your phone number"
                              bg="gray.50"
                              border="2px solid"
                              borderColor="gray.200"
                              _hover={{ borderColor: leadMagnet.color, bg: "white" }}
                              _focus={{
                                borderColor: leadMagnet.color,
                                boxShadow: `0 0 0 3px ${leadMagnet.color}20`,
                                bg: "white"
                              }}
                              size="lg"
                              borderRadius="xl"
                            />
                          </FormControl>

                          <Button
                            type="submit"
                            bg={`linear-gradient(135deg, ${leadMagnet.color} 0%, ${leadMagnet.color}dd 100%)`}
                            color="white"
                            size="lg"
                            w="full"
                            _hover={{
                              bg: `linear-gradient(135deg, ${leadMagnet.color}dd 0%, ${leadMagnet.color} 100%)`,
                              transform: "translateY(-2px)"
                            }}
                            _active={{ transform: "translateY(0)" }}
                            isLoading={isSubmitting}
                            loadingText="Submitting..."
                            fontSize="lg"
                            fontWeight="700"
                            py={6}
                            borderRadius="xl"
                            shadow="lg"
                            transition="all 0.3s"
                          >
                            Get My Free {leadMagnet.title}
                            <Icon as={FaRocket} ml={2} />
                          </Button>
                        </VStack>
                      </Box>

                      <VStack spacing={3} textAlign="center">
                        <Text fontSize="sm" color="gray.500" fontWeight="500">
                          🔒 Your information is secure and will never be shared
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          We respect your privacy. Unsubscribe at any time.
                        </Text>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </Container>
        </Box>
      </Box>
    </>
  );
};

const Toolkit = () => {
  const { slug, coachId } = useParams();

  // If no slug/coachId, show listing page
  if (!slug || !coachId) {
    return <ToolkitListing />;
  }

  // Otherwise, show individual tool page
  return <IndividualTool />;
};

export default Toolkit;
