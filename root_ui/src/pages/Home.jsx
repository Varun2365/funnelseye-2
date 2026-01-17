import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Flex,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Badge,
  useColorModeValue,
  SimpleGrid,
  Divider,
  Avatar,
  Circle,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaRocket,
  FaChartLine,
  FaUsers,
  FaMagic,
  FaCheck,
  FaStar,
  FaQuoteLeft,
  FaPlay,
  FaShieldAlt,
  FaHeadset,
  FaGlobe,
  FaAward,
  FaArrowRight,
  FaCheckCircle,
  FaBolt,
  FaCog,
  FaHeart,
  FaCrown,
} from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box as="header" bg="white" shadow="sm" position="sticky" top="0" zIndex="10">
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" py={4}>
            <Heading size="lg" color="#4f46e5">
              FunnelsEye
            </Heading>
            <HStack spacing={4}>
              <Button variant="ghost" onClick={handleLogin}>
                Login
              </Button>
              <Button
                bg="#4f46e5"
                color="white"
                _hover={{ bg: "#4338ca" }}
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section - Professional Dual Column */}
      <Box bg="white" py={16}>
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={12} alignItems="center">
            {/* Left Column - Content */}
            <GridItem>
              <VStack align="start" spacing={6}>
                <Badge
                  bg="#4f46e5"
                  color="white"
                  px={4}
                  py={2}
                  borderRadius="full"
                  fontSize="sm"
                  fontWeight="600"
                >
                  🚀 Trusted by 10,000+ Businesses
                </Badge>

                <Heading
                  size="3xl"
                  color="gray.900"
                  lineHeight="1.1"
                  fontWeight="800"
                >
                  Transform Your Business with
                  <Text color="#4f46e5" display="inline"> Smart Funnels</Text>
                </Heading>

                <Text fontSize="lg" color="gray.600" lineHeight="1.6">
                  Create high-converting sales funnels, automate your marketing, and grow your business with our all-in-one platform designed for modern entrepreneurs.
                </Text>

                <HStack spacing={4} w="full">
                  <Button
                    size="lg"
                    bg="#4f46e5"
                    color="white"
                    _hover={{ bg: "#4338ca" }}
                    onClick={handleGetStarted}
                    rightIcon={<FaRocket />}
                    px={8}
                    fontWeight="600"
                    flex="1"
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    borderColor="gray.300"
                    color="gray.700"
                    _hover={{ bg: "gray.50" }}
                    onClick={() => navigate('/toolkit')}
                    leftIcon={<FaPlay />}
                    flex="1"
                  >
                    Explore Toolkit
                  </Button>
                </HStack>

                {/* Stats Row */}
                <SimpleGrid columns={3} spacing={6} w="full">
                  <VStack spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.900">99.9%</Text>
                    <Text fontSize="sm" color="gray.600">Uptime</Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.900">24/7</Text>
                    <Text fontSize="sm" color="gray.600">Support</Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.900">500+</Text>
                    <Text fontSize="sm" color="gray.600">Templates</Text>
                  </VStack>
                </SimpleGrid>
              </VStack>
            </GridItem>

            {/* Right Column - Visual Element */}
            <GridItem>
              <Card
                bg="linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
                borderRadius="2xl"
                p={8}
                color="white"
                shadow="2xl"
                position="relative"
                overflow="hidden"
              >
                <Box
                  position="absolute"
                  top="-50%"
                  right="-50%"
                  w="200%"
                  h="200%"
                  bg="rgba(255,255,255,0.1)"
                  borderRadius="full"
                  transform="rotate(45deg)"
                />
                <VStack spacing={6} position="relative" zIndex="1">
                  <Circle size="20" bg="white" color="#4f46e5">
                    <Icon as={FaChartLine} boxSize={10} />
                  </Circle>

                  <VStack spacing={3} textAlign="center">
                    <Heading size="xl" fontWeight="700">
                      Powerful Analytics
                    </Heading>
                    <Text opacity="0.9" lineHeight="1.6">
                      Track your funnel performance in real-time with advanced insights and automated optimization.
                    </Text>
                  </VStack>

                  {/* Mini Stats */}
                  <SimpleGrid columns={2} spacing={6} w="full">
                    <VStack spacing={1}>
                      <Text fontSize="2xl" fontWeight="bold">10K+</Text>
                      <Text fontSize="sm" opacity="0.8">Active Users</Text>
                    </VStack>
                    <VStack spacing={1}>
                      <Text fontSize="2xl" fontWeight="bold">4.9/5</Text>
                      <Text fontSize="sm" opacity="0.8">Rating</Text>
                    </VStack>
                  </SimpleGrid>
                </VStack>
              </Card>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box py={16} bg="white">
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
            <VStack spacing={2}>
              <Icon as={FaGlobe} boxSize={10} color="#4f46e5" />
              <Text fontSize="3xl" fontWeight="bold" color="gray.900">50+</Text>
              <Text color="gray.600" fontSize="sm">Countries</Text>
            </VStack>
            <VStack spacing={2}>
              <Icon as={FaBolt} boxSize={10} color="#f59e0b" />
              <Text fontSize="3xl" fontWeight="bold" color="gray.900">2M+</Text>
              <Text color="gray.600" fontSize="sm">Emails Sent</Text>
            </VStack>
            <VStack spacing={2}>
              <Icon as={FaCog} boxSize={10} color="#06b6d4" />
              <Text fontSize="3xl" fontWeight="bold" color="gray.900">99.9%</Text>
              <Text color="gray.600" fontSize="sm">Uptime SLA</Text>
            </VStack>
            <VStack spacing={2}>
              <Icon as={FaHeart} boxSize={10} color="#10b981" />
              <Text fontSize="3xl" fontWeight="bold" color="gray.900">24/7</Text>
              <Text color="gray.600" fontSize="sm">Expert Support</Text>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section - Professional Dual Column */}
      <Box py={20} bg="gray.50">
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Badge bg="#8b5cf6" color="white" px={4} py={2} borderRadius="full" fontWeight="600">
                ✨ Powerful Features
              </Badge>
              <Heading size="2xl" color="gray.900" fontWeight="700">
                Everything You Need to Succeed
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl" textAlign="center">
                Our comprehensive platform provides all the tools you need to create, manage, and optimize your sales funnels with enterprise-grade features.
              </Text>
            </VStack>

            {/* Main Features Grid */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
              <Card
                bg="white"
                shadow="lg"
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.100"
                _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
                transition="all 0.3s"
              >
                <CardBody p={8}>
                  <VStack spacing={6} align="start">
                    <Circle size="16" bg="#4f46e5" color="white">
                      <Icon as={FaRocket} boxSize={7} />
                    </Circle>

                    <VStack spacing={3} align="start">
                      <Heading size="lg" color="gray.900">Quick Setup</Heading>
                      <Text color="gray.600" lineHeight="1.6">
                        Get started in minutes with our intuitive dashboard and pre-built templates. No coding required.
                      </Text>
                    </VStack>

                    <HStack spacing={2}>
                      <Icon as={FaCheckCircle} color="#10b981" boxSize={4} />
                      <Text fontSize="sm" color="gray.600" fontWeight="500">5-minute setup</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              <Card
                bg="white"
                shadow="lg"
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.100"
                _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
                transition="all 0.3s"
              >
                <CardBody p={8}>
                  <VStack spacing={6} align="start">
                    <Circle size="16" bg="#06b6d4" color="white">
                      <Icon as={FaUsers} boxSize={7} />
                    </Circle>

                    <VStack spacing={3} align="start">
                      <Heading size="lg" color="gray.900">Team Collaboration</Heading>
                      <Text color="gray.600" lineHeight="1.6">
                        Work together seamlessly with your team members and staff with real-time collaboration tools.
                      </Text>
                    </VStack>

                    <HStack spacing={2}>
                      <Icon as={FaCheckCircle} color="#10b981" boxSize={4} />
                      <Text fontSize="sm" color="gray.600" fontWeight="500">Unlimited team members</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              <Card
                bg="white"
                shadow="lg"
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.100"
                _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
                transition="all 0.3s"
              >
                <CardBody p={8}>
                  <VStack spacing={6} align="start">
                    <Circle size="16" bg="#8b5cf6" color="white">
                      <Icon as={FaMagic} boxSize={7} />
                    </Circle>

                    <VStack spacing={3} align="start">
                      <Heading size="lg" color="gray.900">AI-Powered</Heading>
                      <Text color="gray.600" lineHeight="1.6">
                        Leverage artificial intelligence to optimize your funnels and marketing campaigns automatically.
                      </Text>
                    </VStack>

                    <HStack spacing={2}>
                      <Icon as={FaCheckCircle} color="#10b981" boxSize={4} />
                      <Text fontSize="sm" color="gray.600" fontWeight="500">Smart optimization</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Additional Features */}
            <Card bg="white" shadow="lg" borderRadius="2xl" p={8} w="full">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
                <VStack spacing={4} align="start">
                  <HStack spacing={3}>
                    <Circle size="10" bg="#4f46e5" color="white">
                      <Icon as={FaShieldAlt} boxSize={5} />
                    </Circle>
                    <VStack spacing={0} align="start">
                      <Text fontWeight="600" color="gray.900">Enterprise Security</Text>
                      <Text fontSize="sm" color="gray.600">Bank-level security with end-to-end encryption</Text>
                    </VStack>
                  </HStack>
                </VStack>

                <VStack spacing={4} align="start">
                  <HStack spacing={3}>
                    <Circle size="10" bg="#06b6d4" color="white">
                      <Icon as={FaHeadset} boxSize={5} />
                    </Circle>
                    <VStack spacing={0} align="start">
                      <Text fontWeight="600" color="gray.900">24/7 Support</Text>
                      <Text fontSize="sm" color="gray.600">Round-the-clock expert support via chat and phone</Text>
                    </VStack>
                  </HStack>
                </VStack>

                <VStack spacing={4} align="start">
                  <HStack spacing={3}>
                    <Circle size="10" bg="#f59e0b" color="white">
                      <Icon as={FaBolt} boxSize={5} />
                    </Circle>
                    <VStack spacing={0} align="start">
                      <Text fontWeight="600" color="gray.900">Lightning Fast</Text>
                      <Text fontSize="sm" color="gray.600">Optimized performance with 99.9% uptime guarantee</Text>
                    </VStack>
                  </HStack>
                </VStack>

                <VStack spacing={4} align="start">
                  <HStack spacing={3}>
                    <Circle size="10" bg="#10b981" color="white">
                      <Icon as={FaAward} boxSize={5} />
                    </Circle>
                    <VStack spacing={0} align="start">
                      <Text fontWeight="600" color="gray.900">Award Winning</Text>
                      <Text fontSize="sm" color="gray.600">Recognized by industry leaders for innovation</Text>
                    </VStack>
                  </HStack>
                </VStack>
              </SimpleGrid>
            </Card>
          </VStack>
        </Container>
      </Box>

      {/* How It Works - Professional Dual Column */}
      <Box py={20} bg="white">
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={16} alignItems="center">
            {/* Left Column - Process Steps */}
            <GridItem>
              <VStack spacing={8} align="start">
                <VStack spacing={4} align="start">
                  <Badge bg="#06b6d4" color="white" px={4} py={2} borderRadius="full" fontWeight="600">
                    📋 Simple Process
                  </Badge>
                  <Heading size="2xl" color="gray.900" fontWeight="700">
                    How It Works
                  </Heading>
                  <Text fontSize="lg" color="gray.600">
                    Get started with FunnelsEye in just three simple steps
                  </Text>
                </VStack>

                <VStack spacing={8} align="stretch" w="full">
                  <HStack spacing={6}>
                    <Circle size="16" bg="#4f46e5" color="white" fontWeight="bold" fontSize="xl">
                      1
                    </Circle>
                    <VStack spacing={2} align="start">
                      <Heading size="md" color="gray.900">Sign Up</Heading>
                      <Text color="gray.600" fontSize="sm">
                        Create your account and choose a plan that fits your needs. No credit card required for free trial.
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={6}>
                    <Circle size="16" bg="#06b6d4" color="white" fontWeight="bold" fontSize="xl">
                      2
                    </Circle>
                    <VStack spacing={2} align="start">
                      <Heading size="md" color="gray.900">Setup Your Funnel</Heading>
                      <Text color="gray.600" fontSize="sm">
                        Choose from 500+ templates or create your own custom funnel with our drag-and-drop builder.
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={6}>
                    <Circle size="16" bg="#10b981" color="white" fontWeight="bold" fontSize="xl">
                      3
                    </Circle>
                    <VStack spacing={2} align="start">
                      <Heading size="md" color="gray.900">Start Converting</Heading>
                      <Text color="gray.600" fontSize="sm">
                        Launch your funnel and watch as visitors turn into customers with real-time analytics.
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </VStack>
            </GridItem>

            {/* Right Column - Visual Element */}
            <GridItem>
              <Card
                bg="linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)"
                borderRadius="2xl"
                p={8}
                shadow="2xl"
                border="1px solid"
                borderColor="gray.200"
              >
                <VStack spacing={6}>
                  <Circle size="20" bg="white" color="#4f46e5" shadow="lg">
                    <Icon as={FaRocket} boxSize={10} />
                  </Circle>

                  <VStack spacing={3} textAlign="center">
                    <Heading size="lg" color="gray.900" fontWeight="700">
                      Ready to Get Started?
                    </Heading>
                    <Text color="gray.600" lineHeight="1.6">
                      Join thousands of businesses already using FunnelsEye to grow their revenue and scale their operations.
                    </Text>
                  </VStack>

                  <VStack spacing={4} w="full">
                    <Button
                      size="lg"
                      bg="#4f46e5"
                      color="white"
                      _hover={{ bg: "#4338ca" }}
                      onClick={handleGetStarted}
                      rightIcon={<FaArrowRight />}
                      w="full"
                      fontWeight="600"
                    >
                      Start Your Free Trial
                    </Button>
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      No credit card required • 14-day free trial
                    </Text>
                  </VStack>
                </VStack>
              </Card>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials - Professional Layout */}
      <Box py={20} bg="gray.50">
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Badge bg="#10b981" color="white" px={4} py={2} borderRadius="full" fontWeight="600">
                💬 Customer Stories
              </Badge>
              <Heading size="2xl" color="gray.900" fontWeight="700">
                Trusted by Industry Leaders
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl" textAlign="center">
                See what our customers say about transforming their businesses
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
              <Card bg="white" shadow="lg" borderRadius="2xl" border="1px solid" borderColor="gray.100">
                <CardBody p={8}>
                  <VStack spacing={6} align="start" h="full">
                    <HStack spacing={1}>
                      {[...Array(5)].map((_, i) => (
                        <Icon key={i} as={FaStar} color="#f59e0b" boxSize={4} />
                      ))}
                    </HStack>

                    <Text color="gray.600" fontStyle="italic" lineHeight="1.6" flex="1">
                      "FunnelsEye transformed our lead generation process. We've seen a 300% increase in qualified leads within the first month."
                    </Text>

                    <HStack spacing={3}>
                      <Avatar name="Sarah Johnson" size="sm" bg="#4f46e5" />
                      <VStack spacing={0} align="start">
                        <Text fontWeight="600" color="gray.900" fontSize="sm">Sarah Johnson</Text>
                        <Text fontSize="xs" color="gray.600">Marketing Director, TechCorp</Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg="white" shadow="lg" borderRadius="2xl" border="1px solid" borderColor="gray.100">
                <CardBody p={8}>
                  <VStack spacing={6} align="start" h="full">
                    <HStack spacing={1}>
                      {[...Array(5)].map((_, i) => (
                        <Icon key={i} as={FaStar} color="#f59e0b" boxSize={4} />
                      ))}
                    </HStack>

                    <Text color="gray.600" fontStyle="italic" lineHeight="1.6" flex="1">
                      "The AI-powered optimization saved us countless hours. Our conversion rates improved by 150% automatically."
                    </Text>

                    <HStack spacing={3}>
                      <Avatar name="Michael Chen" size="sm" bg="#06b6d4" />
                      <VStack spacing={0} align="start">
                        <Text fontWeight="600" color="gray.900" fontSize="sm">Michael Chen</Text>
                        <Text fontSize="xs" color="gray.600">CEO, GrowthLabs</Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg="white" shadow="lg" borderRadius="2xl" border="1px solid" borderColor="gray.100">
                <CardBody p={8}>
                  <VStack spacing={6} align="start" h="full">
                    <HStack spacing={1}>
                      {[...Array(5)].map((_, i) => (
                        <Icon key={i} as={FaStar} color="#f59e0b" boxSize={4} />
                      ))}
                    </HStack>

                    <Text color="gray.600" fontStyle="italic" lineHeight="1.6" flex="1">
                      "Outstanding support team and feature-rich platform. FunnelsEye is a game-changer for our agency."
                    </Text>

                    <HStack spacing={3}>
                      <Avatar name="Emily Rodriguez" size="sm" bg="#8b5cf6" />
                      <VStack spacing={0} align="start">
                        <Text fontWeight="600" color="gray.900" fontSize="sm">Emily Rodriguez</Text>
                        <Text fontSize="xs" color="gray.600">Founder, DigitalFirst Agency</Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Pricing Preview - Professional Layout */}
      <Box py={20} bg="white">
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Badge bg="#8b5cf6" color="white" px={4} py={2} borderRadius="full" fontWeight="600">
                💰 Flexible Pricing
              </Badge>
              <Heading size="2xl" color="gray.900" fontWeight="700">
                Choose the Perfect Plan
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl" textAlign="center">
                Start free and scale as you grow. All plans include our core features.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
              <Card
                bg="white"
                shadow="lg"
                borderRadius="2xl"
                border="2px solid"
                borderColor="gray.100"
                position="relative"
                overflow="hidden"
                _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
                transition="all 0.3s"
              >
                <CardBody p={8}>
                  <VStack spacing={6} align="stretch">
                    <VStack spacing={2} align="start">
                      <HStack spacing={3}>
                        <Circle size="12" bg="#4f46e5" color="white">
                          <Icon as={FaRocket} boxSize={6} />
                        </Circle>
                        <VStack spacing={0} align="start">
                          <Heading size="lg" color="gray.900">Starter</Heading>
                          <Text color="gray.600" fontSize="sm">Perfect for getting started</Text>
                        </VStack>
                      </HStack>
                    </VStack>

                    <Box textAlign="center">
                      <Text fontSize="4xl" fontWeight="bold" color="gray.900">₹499</Text>
                      <Text color="gray.600" fontSize="sm">per month</Text>
                    </Box>

                    <VStack spacing={3} align="start">
                      <HStack spacing={3}>
                        <Icon as={FaCheck} color="#10b981" boxSize={4} />
                        <Text fontSize="sm" color="gray.700">3 Funnels</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={FaCheck} color="#10b981" boxSize={4} />
                        <Text fontSize="sm" color="gray.700">1,000 Email Credits</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={FaCheck} color="#10b981" boxSize={4} />
                        <Text fontSize="sm" color="gray.700">Basic Analytics</Text>
                      </HStack>
                    </VStack>

                    <Button
                      w="full"
                      variant="outline"
                      borderColor="#4f46e5"
                      color="#4f46e5"
                      _hover={{ bg: "#4f46e5", color: "white" }}
                      onClick={handleGetStarted}
                      fontWeight="600"
                    >
                      Start Free Trial
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              <Card
                bg="linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
                shadow="2xl"
                borderRadius="2xl"
                color="white"
                position="relative"
                overflow="hidden"
                _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
                transition="all 0.3s"
              >
                <CardBody p={8} position="relative">
                  <Badge
                    position="absolute"
                    top={4}
                    right={4}
                    bg="#f59e0b"
                    color="white"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    MOST POPULAR
                  </Badge>

                  <VStack spacing={6} align="stretch">
                    <VStack spacing={2} align="start">
                      <HStack spacing={3}>
                        <Circle size="12" bg="white" color="#4f46e5">
                          <Icon as={FaStar} boxSize={6} />
                        </Circle>
                        <VStack spacing={0} align="start">
                          <Heading size="lg" color="white">Professional</Heading>
                          <Text color="white" opacity="0.9" fontSize="sm">For growing businesses</Text>
                        </VStack>
                      </HStack>
                    </VStack>

                    <Box textAlign="center">
                      <Text fontSize="4xl" fontWeight="bold" color="white">₹1,499</Text>
                      <Text color="white" opacity="0.9" fontSize="sm">per month</Text>
                    </Box>

                    <VStack spacing={3} align="start">
                      <HStack spacing={3}>
                        <Icon as={FaCheck} color="white" boxSize={4} />
                        <Text fontSize="sm" color="white">15 Funnels</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={FaCheck} color="white" boxSize={4} />
                        <Text fontSize="sm" color="white">10,000 Email Credits</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={FaCheck} color="white" boxSize={4} />
                        <Text fontSize="sm" color="white">AI Optimization</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={FaCheck} color="white" boxSize={4} />
                        <Text fontSize="sm" color="white">Priority Support</Text>
                      </HStack>
                    </VStack>

                    <Button
                      w="full"
                      bg="white"
                      color="#4f46e5"
                      _hover={{ bg: "gray.50" }}
                      onClick={handleGetStarted}
                      fontWeight="600"
                    >
                      Start Free Trial
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              <Card
                bg="white"
                shadow="lg"
                borderRadius="2xl"
                border="2px solid"
                borderColor="gray.100"
                position="relative"
                overflow="hidden"
                _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
                transition="all 0.3s"
              >
                <CardBody p={8}>
                  <VStack spacing={6} align="stretch">
                    <VStack spacing={2} align="start">
                      <HStack spacing={3}>
                        <Circle size="12" bg="#f59e0b" color="white">
                          <Icon as={FaCrown} boxSize={6} />
                        </Circle>
                        <VStack spacing={0} align="start">
                          <Heading size="lg" color="gray.900">Elite</Heading>
                          <Text color="gray.600" fontSize="sm">For enterprise teams</Text>
                        </VStack>
                      </HStack>
                    </VStack>

                    <Box textAlign="center">
                      <Text fontSize="4xl" fontWeight="bold" color="gray.900">₹4,999</Text>
                      <Text color="gray.600" fontSize="sm">per month</Text>
                    </Box>

                    <VStack spacing={3} align="start">
                      <HStack spacing={3}>
                        <Icon as={FaCheck} color="#10b981" boxSize={4} />
                        <Text fontSize="sm" color="gray.700">Unlimited Funnels</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={FaCheck} color="#10b981" boxSize={4} />
                        <Text fontSize="sm" color="gray.700">50,000 Email Credits</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={FaCheck} color="#10b981" boxSize={4} />
                        <Text fontSize="sm" color="gray.700">White Label</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={FaCheck} color="#10b981" boxSize={4} />
                        <Text fontSize="sm" color="gray.700">API Access</Text>
                      </HStack>
                    </VStack>

                    <Button
                      w="full"
                      variant="outline"
                      borderColor="#f59e0b"
                      color="#f59e0b"
                      _hover={{ bg: "#f59e0b", color: "white" }}
                      onClick={handleGetStarted}
                      fontWeight="600"
                    >
                      Start Free Trial
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>

            <Text textAlign="center" color="gray.600" fontSize="sm" fontWeight="500">
              All plans include 14-day free trial. No credit card required. Cancel anytime.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Final CTA - Professional Dual Column */}
      <Box py={20} bg="#4f46e5" color="white">
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={12} alignItems="center">
            {/* Left Column - Content */}
            <GridItem>
              <VStack spacing={6} align="start">
                <Heading size="3xl" fontWeight="800" lineHeight="1.1">
                  Ready to Transform Your Business?
                </Heading>
                <Text fontSize="lg" opacity="0.9" lineHeight="1.6">
                  Join thousands of successful businesses using FunnelsEye to grow their revenue and scale their operations.
                </Text>

                <VStack spacing={4} w="full" align="start">
                  <HStack spacing={4}>
                    <Button
                      size="lg"
                      bg="white"
                      color="#4f46e5"
                      _hover={{ bg: "gray.50" }}
                      onClick={handleGetStarted}
                      rightIcon={<FaArrowRight />}
                      px={8}
                      fontWeight="600"
                    >
                      Get Started Free
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      borderColor="white"
                      color="white"
                      _hover={{ bg: "white", color: "#4f46e5" }}
                      onClick={() => navigate('/toolkit')}
                      fontWeight="600"
                    >
                      Explore Toolkit
                    </Button>
                  </HStack>

                  <Text fontSize="sm" opacity="0.8">
                    No credit card required • 14-day free trial • Cancel anytime
                  </Text>
                </VStack>
              </VStack>
            </GridItem>

            {/* Right Column - Trust Indicators */}
            <GridItem>
              <SimpleGrid columns={3} spacing={6}>
                <VStack spacing={3} textAlign="center">
                  <Circle size="16" bg="white" color="#4f46e5">
                    <Icon as={FaShieldAlt} boxSize={7} />
                  </Circle>
                  <VStack spacing={0}>
                    <Text fontSize="sm" fontWeight="600">Enterprise Security</Text>
                    <Text fontSize="xs" opacity="0.8">Bank-level protection</Text>
                  </VStack>
                </VStack>

                <VStack spacing={3} textAlign="center">
                  <Circle size="16" bg="white" color="#4f46e5">
                    <Icon as={FaBolt} boxSize={7} />
                  </Circle>
                  <VStack spacing={0}>
                    <Text fontSize="sm" fontWeight="600">Lightning Fast</Text>
                    <Text fontSize="xs" opacity="0.8">99.9% uptime SLA</Text>
                  </VStack>
                </VStack>

                <VStack spacing={3} textAlign="center">
                  <Circle size="16" bg="white" color="#4f46e5">
                    <Icon as={FaHeart} boxSize={7} />
                  </Circle>
                  <VStack spacing={0}>
                    <Text fontSize="sm" fontWeight="600">24/7 Support</Text>
                    <Text fontSize="xs" opacity="0.8">Expert assistance</Text>
                  </VStack>
                </VStack>
              </SimpleGrid>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Footer - Professional Layout */}
      <Box bg="gray.900" color="white" py={16}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr 1fr 1fr' }} gap={8} w="full">
              <GridItem>
                <VStack spacing={6} align="start">
                  <Heading size="lg" color="#4f46e5" fontWeight="700">
                    FunnelsEye
                  </Heading>
                  <Text color="gray.400" fontSize="sm" lineHeight="1.6">
                    Transform your business with intelligent funnel automation. Join 10,000+ successful entrepreneurs.
                  </Text>
                  <HStack spacing={4}>
                    <Circle size="10" bg="#4f46e5" color="white" cursor="pointer" _hover={{ bg: "#4338ca" }}>
                      <Icon as={FaGlobe} boxSize={5} />
                    </Circle>
                    <Circle size="10" bg="#06b6d4" color="white" cursor="pointer" _hover={{ bg: "#0891b2" }}>
                      <Icon as={FaUsers} boxSize={5} />
                    </Circle>
                    <Circle size="10" bg="#10b981" color="white" cursor="pointer" _hover={{ bg: "#059669" }}>
                      <Icon as={FaAward} boxSize={5} />
                    </Circle>
                  </HStack>
                </VStack>
              </GridItem>

              <GridItem>
                <Heading size="sm" mb={6} color="white" fontWeight="600">
                  Product
                </Heading>
                <VStack align="start" spacing={3}>
                  <Text cursor="pointer" _hover={{ color: "#4f46e5" }} fontSize="sm" fontWeight="500">Features</Text>
                  <Text cursor="pointer" _hover={{ color: "#4f46e5" }} fontSize="sm" fontWeight="500">Templates</Text>
                  <Text cursor="pointer" _hover={{ color: "#4f46e5" }} fontSize="sm" fontWeight="500">Integrations</Text>
                  <Text cursor="pointer" _hover={{ color: "#4f46e5" }} fontSize="sm" fontWeight="500" onClick={() => navigate('/toolkit')}>Toolkit</Text>
                </VStack>
              </GridItem>

              <GridItem>
                <Heading size="sm" mb={6} color="white" fontWeight="600">
                  Support
                </Heading>
                <VStack align="start" spacing={3}>
                  <Text cursor="pointer" _hover={{ color: "#06b6d4" }} fontSize="sm" fontWeight="500">Help Center</Text>
                  <Text cursor="pointer" _hover={{ color: "#06b6d4" }} fontSize="sm" fontWeight="500">Contact Us</Text>
                  <Text cursor="pointer" _hover={{ color: "#06b6d4" }} fontSize="sm" fontWeight="500">Status</Text>
                  <Text cursor="pointer" _hover={{ color: "#06b6d4" }} fontSize="sm" fontWeight="500">Community</Text>
                </VStack>
              </GridItem>

              <GridItem>
                <Heading size="sm" mb={6} color="white" fontWeight="600">
                  Company
                </Heading>
                <VStack align="start" spacing={3}>
                  <Text cursor="pointer" _hover={{ color: "#10b981" }} fontSize="sm" fontWeight="500">About</Text>
                  <Text cursor="pointer" _hover={{ color: "#10b981" }} fontSize="sm" fontWeight="500">Blog</Text>
                  <Text cursor="pointer" _hover={{ color: "#10b981" }} fontSize="sm" fontWeight="500">Careers</Text>
                  <Text cursor="pointer" _hover={{ color: "#10b981" }} fontSize="sm" fontWeight="500">Press</Text>
                </VStack>
              </GridItem>
            </Grid>

            <Divider borderColor="gray.700" />

            <Flex justify="space-between" align="center" w="full" flexWrap="wrap" gap={4}>
              <Text color="gray.400" fontSize="sm" fontWeight="500">
                © 2024 FunnelsEye. All rights reserved.
              </Text>
              <HStack spacing={6}>
                <Text cursor="pointer" _hover={{ color: "#4f46e5" }} fontSize="sm" fontWeight="500">Privacy</Text>
                <Text cursor="pointer" _hover={{ color: "#4f46e5" }} fontSize="sm" fontWeight="500">Terms</Text>
                <Text cursor="pointer" _hover={{ color: "#4f46e5" }} fontSize="sm" fontWeight="500">Security</Text>
              </HStack>
            </Flex>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
