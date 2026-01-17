import React, { useState } from 'react';
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  VStack,
  HStack,
  SimpleGrid,
  Badge,
  Progress,
  Avatar,
  Button,
  useColorModeValue,
  Divider,
  Icon,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
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
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Tooltip,
  CircularProgress,
  CircularProgressLabel,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  MdTrendingUp,
  MdPeople,
  MdFavorite,
  MdLocalFireDepartment,
  MdWaterDrop,
  MdRestaurant,
  MdDirectionsRun,
  MdEmojiEvents,
  MdStar,
  MdChat,
  MdCalendarToday,
  MdPhotoCamera,
  MdVideoLibrary,
  MdBook,
  MdSettings,
  MdNotifications,
  MdAdd,
  MdCheckCircle,
  MdAccessTime,
  MdFitnessCenter,
  MdRestaurantMenu,
  MdSchool,
  MdGroups,
  MdShare,
  MdDownload,
  MdPlayArrow,
  MdClose,
} from 'react-icons/md';
import { FiArrowUpRight, FiArrowDownRight, FiTarget, FiAward, FiZap } from 'react-icons/fi';
import Topbar from './topbar';
import Sidebar from './sidebar';

const Dashboard = () => {
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)');
  const { isOpen: isMealOpen, onOpen: onMealOpen, onClose: onMealClose } = useDisclosure();
  const { isOpen: isWorkoutOpen, onOpen: onWorkoutOpen, onClose: onWorkoutClose } = useDisclosure();
  const { isOpen: isCheckInOpen, onOpen: onCheckInOpen, onClose: onCheckInClose } = useDisclosure();

  // Sample Data - Weight Tracking
  const weightData = [
    { date: 'Week 1', weight: 85, target: 80 },
    { date: 'Week 2', weight: 84, target: 80 },
    { date: 'Week 3', weight: 83, target: 80 },
    { date: 'Week 4', weight: 82.5, target: 80 },
    { date: 'Week 5', weight: 81.5, target: 80 },
    { date: 'Week 6', weight: 81, target: 80 },
  ];

  // Body Measurements
  const measurementData = [
    { name: 'Chest', current: 102, previous: 105, unit: 'cm' },
    { name: 'Waist', current: 88, previous: 92, unit: 'cm' },
    { name: 'Hips', current: 95, previous: 98, unit: 'cm' },
    { name: 'Arms', current: 35, previous: 33, unit: 'cm' },
  ];

  // Daily Activity Stats
  const dailyStats = {
    steps: 8420,
    stepsGoal: 10000,
    calories: 1850,
    caloriesGoal: 2000,
    water: 6,
    waterGoal: 8,
    workouts: 1,
    workoutsGoal: 1,
  };

  // XP & Gamification
  const xpData = {
    current: 2450,
    nextLevel: 3000,
    level: 5,
    streak: 12,
    badges: [
      { name: 'First Steps', icon: '👟', earned: true },
      { name: 'Week Warrior', icon: '💪', earned: true },
      { name: 'Meal Master', icon: '🍎', earned: true },
      { name: 'Hydration Hero', icon: '💧', earned: true },
      { name: 'Transformation', icon: '🏆', earned: false },
      { name: '100 Days', icon: '🔥', earned: false },
    ],
    achievements: [
      { title: 'Lost First 2 KGs!', date: '2 days ago', points: 200 },
      { title: '7 Day Streak', date: '1 week ago', points: 150 },
      { title: 'Logged 50 Meals', date: '2 weeks ago', points: 100 },
    ],
  };

  // Alpha Score (Adherence)
  const alphaScore = 87;

  // Recent Meals
  const recentMeals = [
    { id: 1, name: 'Grilled Chicken Salad', time: '12:30 PM', calories: 450, photo: null },
    { id: 2, name: 'Protein Smoothie', time: '8:00 AM', calories: 320, photo: null },
    { id: 3, name: 'Quinoa Bowl', time: '7:00 PM', calories: 520, photo: null },
  ];

  // Recent Workouts
  const recentWorkouts = [
    { id: 1, name: 'Upper Body Strength', duration: '45 min', calories: 380, completed: true },
    { id: 2, name: 'Cardio Blast', duration: '30 min', calories: 420, completed: true },
    { id: 3, name: 'Yoga Flow', duration: '60 min', calories: 180, completed: false },
  ];

  // Video Library
  const videoLibrary = [
    { id: 1, title: 'Fat Loss Fundamentals', category: 'Learning Path', duration: '15:30', thumbnail: null },
    { id: 2, title: 'Meal Prep Basics', category: 'Food Prep', duration: '12:20', thumbnail: null },
    { id: 3, title: 'Perfect Squat Form', category: 'Form Tutorial', duration: '8:45', thumbnail: null },
    { id: 4, title: 'Onboarding: Getting Started', category: 'Onboarding', duration: '20:00', thumbnail: null },
  ];

  // Workout Library
  const workoutLibrary = [
    { id: 1, name: 'Beginner Full Body', difficulty: 'Beginner', duration: '30 min', exercises: 8 },
    { id: 2, name: 'Intermediate HIIT', difficulty: 'Intermediate', duration: '45 min', exercises: 12 },
    { id: 3, name: 'Advanced Strength', difficulty: 'Advanced', duration: '60 min', exercises: 15 },
  ];

  // Community Programs
  const communityPrograms = [
    { id: 1, name: '21-Day Transformation', participants: 245, progress: 65, daysLeft: 8 },
    { id: 2, name: '10-Day Marathon Sprint', participants: 189, progress: 40, daysLeft: 4 },
  ];

  // Leaderboard
  const leaderboard = [
    { rank: 1, name: 'Sarah M.', xp: 5420, avatar: null },
    { rank: 2, name: 'Mike T.', xp: 4890, avatar: null },
    { rank: 3, name: 'You', xp: 2450, avatar: null, isCurrentUser: true },
    { rank: 4, name: 'Emma L.', xp: 2100, avatar: null },
    { rank: 5, name: 'John D.', xp: 1980, avatar: null },
  ];

  // BMI & Body Fat Calculator Data
  const bodyMetrics = {
    weight: 81,
    height: 175,
    bmi: 26.4,
    bodyFat: 18.5,
    metabolicRate: 1950,
  };

  // Progress Photos
  const progressPhotos = [
    { id: 1, date: '2024-01-15', type: 'before', url: null },
    { id: 2, date: '2024-02-15', type: 'progress', url: null },
    { id: 3, date: '2024-03-15', type: 'current', url: null },
  ];

  // AI Chat Messages
  const aiMessages = [
    { id: 1, sender: 'ai', message: 'Great job on your workout today! Remember to stay hydrated.', time: '2 hours ago' },
    { id: 2, sender: 'user', message: 'What should I eat for dinner?', time: '1 hour ago' },
    { id: 3, sender: 'ai', message: 'I recommend a balanced meal with lean protein, vegetables, and whole grains. Try grilled chicken with quinoa and steamed broccoli!', time: '1 hour ago' },
  ];

  return (
    <Flex h="100vh" bg="linear-gradient(135deg, #f0f9f0 0%, #e8f5e8 100%)" overflow="hidden">
      <Sidebar />
      
      <Box flex={1} overflow="hidden">
        <Topbar />
        
        <Box p={8} overflowY="auto" h="calc(100vh - 80px)">
          {/* Welcome Header with Alpha Score */}
          <Box mb={8}>
            <HStack justify="space-between" align="center" mb={4}>
              <Box>
                <Text fontSize="3xl" fontWeight="black" color="gray.800" mb={1}>
                  Welcome back, Warrior! 💪
                </Text>
                <Text color="gray.600" fontSize="lg">
                  You're doing amazing! Keep up the momentum.
                </Text>
              </Box>
              <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" p={4} border="1px solid rgba(255, 255, 255, 0.2)">
                <VStack spacing={2}>
                  <Text fontSize="xs" color="gray.500" fontWeight="bold">DAILY ALPHA SCORE</Text>
                  <CircularProgress value={alphaScore} color="green.500" size="80px" thickness="8px">
                    <CircularProgressLabel fontSize="xl" fontWeight="bold">{alphaScore}%</CircularProgressLabel>
                  </CircularProgress>
                  <Text fontSize="xs" color="gray.600">Adherence: Excellent</Text>
                </VStack>
              </Card>
            </HStack>
          </Box>

          {/* Quick Stats - Daily Activity */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)">
              <CardBody p={4}>
                <HStack justify="space-between" mb={2}>
                  <Icon as={MdDirectionsRun} boxSize={6} color="blue.500" />
                  <Badge colorScheme="blue" borderRadius="full">{Math.round((dailyStats.steps / dailyStats.stepsGoal) * 100)}%</Badge>
                </HStack>
                <Text fontSize="2xl" fontWeight="black" color="gray.800">{dailyStats.steps.toLocaleString()}</Text>
                <Text fontSize="xs" color="gray.500">Steps</Text>
                <Progress value={(dailyStats.steps / dailyStats.stepsGoal) * 100} colorScheme="blue" size="sm" mt={2} borderRadius="full" />
              </CardBody>
            </Card>

            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)">
              <CardBody p={4}>
                <HStack justify="space-between" mb={2}>
                  <Icon as={MdLocalFireDepartment} boxSize={6} color="orange.500" />
                  <Badge colorScheme="orange" borderRadius="full">{Math.round((dailyStats.calories / dailyStats.caloriesGoal) * 100)}%</Badge>
                </HStack>
                <Text fontSize="2xl" fontWeight="black" color="gray.800">{dailyStats.calories}</Text>
                <Text fontSize="xs" color="gray.500">Calories Burned</Text>
                <Progress value={(dailyStats.calories / dailyStats.caloriesGoal) * 100} colorScheme="orange" size="sm" mt={2} borderRadius="full" />
              </CardBody>
            </Card>

            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)">
              <CardBody p={4}>
                <HStack justify="space-between" mb={2}>
                  <Icon as={MdWaterDrop} boxSize={6} color="cyan.500" />
                  <Badge colorScheme="cyan" borderRadius="full">{Math.round((dailyStats.water / dailyStats.waterGoal) * 100)}%</Badge>
                </HStack>
                <Text fontSize="2xl" fontWeight="black" color="gray.800">{dailyStats.water}/{dailyStats.waterGoal}</Text>
                <Text fontSize="xs" color="gray.500">Water (glasses)</Text>
                <Progress value={(dailyStats.water / dailyStats.waterGoal) * 100} colorScheme="cyan" size="sm" mt={2} borderRadius="full" />
              </CardBody>
            </Card>

            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)">
              <CardBody p={4}>
                <HStack justify="space-between" mb={2}>
                  <Icon as={MdFitnessCenter} boxSize={6} color="purple.500" />
                  <Badge colorScheme="purple" borderRadius="full">{dailyStats.workouts}/{dailyStats.workoutsGoal}</Badge>
                </HStack>
                <Text fontSize="2xl" fontWeight="black" color="gray.800">{dailyStats.workouts}</Text>
                <Text fontSize="xs" color="gray.500">Workouts Today</Text>
                <Progress value={(dailyStats.workouts / dailyStats.workoutsGoal) * 100} colorScheme="purple" size="sm" mt={2} borderRadius="full" />
              </CardBody>
            </Card>
          </SimpleGrid>

          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6} mb={6}>
            {/* Weight Progress Chart */}
            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)">
              <CardBody p={6}>
                <HStack justify="space-between" mb={6}>
                  <Box>
                    <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={1}>
                      Weight Progress
                    </Text>
                    <Text color="gray.500" fontSize="sm">
                      Tracking your journey to {weightData[0].target}kg
                    </Text>
                  </Box>
                  <Badge colorScheme="green" borderRadius="full" px={3} py={1} fontSize="sm">
                    -4kg Lost
                  </Badge>
                </HStack>
                
                <Box h="250px">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weightData}>
                      <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#48BB78" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#48BB78" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="date" stroke="#666" />
                      <YAxis stroke="#666" />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#48BB78" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorWeight)" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#ED8936" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardBody>
            </Card>

            {/* XP & Gamification */}
            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)">
              <CardBody p={6}>
                <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
                  Your Progress
                </Text>
                
                {/* Level & XP */}
                <Box mb={6} p={4} bg="linear-gradient(135deg, #48BB78, #38B2AC)" borderRadius="xl" color="white">
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="bold">LEVEL {xpData.level}</Text>
                    <Badge bg="rgba(255,255,255,0.3)" color="white" borderRadius="full" px={2}>
                      🔥 {xpData.streak} Day Streak
                    </Badge>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="black" mb={2}>{xpData.current} / {xpData.nextLevel} XP</Text>
                  <Progress 
                    value={(xpData.current / xpData.nextLevel) * 100} 
                    colorScheme="whiteAlpha" 
                    size="lg" 
                    borderRadius="full"
                    bg="rgba(255,255,255,0.3)"
                  />
                </Box>

                {/* Recent Achievements */}
                <VStack spacing={3} align="stretch">
                  <Text fontSize="sm" fontWeight="bold" color="gray.600">Recent Achievements</Text>
                  {xpData.achievements.map((achievement, idx) => (
                    <HStack key={idx} p={3} bg="gray.50" borderRadius="lg" justify="space-between">
                      <HStack>
                        <Icon as={FiAward} color="yellow.500" boxSize={5} />
                        <Box>
                          <Text fontSize="sm" fontWeight="bold">{achievement.title}</Text>
                          <Text fontSize="xs" color="gray.500">{achievement.date}</Text>
                        </Box>
                      </HStack>
                      <Badge colorScheme="green" borderRadius="full">+{achievement.points} XP</Badge>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </Grid>

          {/* Body Measurements & BMI Calculator */}
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={6}>
            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)">
              <CardBody p={6}>
                <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
                  Body Measurements
                </Text>
                <SimpleGrid columns={2} spacing={4}>
                  {measurementData.map((measure, idx) => {
                    const change = measure.current - measure.previous;
                    const isPositive = change < 0; // Negative change is good for most measurements
                    return (
                      <Box key={idx} p={4} bg="gray.50" borderRadius="xl">
                        <Text fontSize="xs" color="gray.500" mb={1}>{measure.name}</Text>
                        <HStack justify="space-between" align="baseline">
                          <Text fontSize="xl" fontWeight="bold">{measure.current}{measure.unit}</Text>
                          <HStack>
                            <Icon as={isPositive ? FiArrowDownRight : FiArrowUpRight} color={isPositive ? 'green.500' : 'red.500'} />
                            <Text fontSize="xs" color={isPositive ? 'green.500' : 'red.500'} fontWeight="bold">
                              {Math.abs(change)}{measure.unit}
                            </Text>
                          </HStack>
                        </HStack>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </CardBody>
            </Card>

            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)">
              <CardBody p={6}>
                <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
                  Body Metrics
                </Text>
                <SimpleGrid columns={2} spacing={4}>
                  <Box p={4} bg="linear-gradient(135deg, #4299E1, #3182CE)" borderRadius="xl" color="white">
                    <Text fontSize="xs" mb={1} opacity={0.9}>BMI</Text>
                    <Text fontSize="2xl" fontWeight="black">{bodyMetrics.bmi}</Text>
                    <Badge bg="rgba(255,255,255,0.3)" color="white" mt={2} borderRadius="full" fontSize="xs">Overweight</Badge>
                  </Box>
                  <Box p={4} bg="linear-gradient(135deg, #ED8936, #DD6B20)" borderRadius="xl" color="white">
                    <Text fontSize="xs" mb={1} opacity={0.9}>Body Fat</Text>
                    <Text fontSize="2xl" fontWeight="black">{bodyMetrics.bodyFat}%</Text>
                    <Badge bg="rgba(255,255,255,0.3)" color="white" mt={2} borderRadius="full" fontSize="xs">Good</Badge>
                  </Box>
                  <Box p={4} bg="linear-gradient(135deg, #48BB78, #38A169)" borderRadius="xl" color="white" gridColumn="span 2">
                    <Text fontSize="xs" mb={1} opacity={0.9}>Metabolic Rate (BMR)</Text>
                    <Text fontSize="2xl" fontWeight="black">{bodyMetrics.metabolicRate} kcal</Text>
                    <Text fontSize="xs" mt={2} opacity={0.9}>Daily calorie needs</Text>
                  </Box>
                </SimpleGrid>
              </CardBody>
            </Card>
          </Grid>

          {/* Quick Actions & Recent Activity */}
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={6}>
            {/* Quick Actions */}
            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)">
              <CardBody p={6}>
                <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
                  Quick Actions
                </Text>
                <SimpleGrid columns={2} spacing={3}>
                  <Button
                    leftIcon={<MdRestaurant />}
                    colorScheme="green"
                    size="lg"
                    borderRadius="xl"
                    onClick={onMealOpen}
                    bgGradient="linear(135deg, green.400, green.600)"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(72, 187, 120, 0.3)' }}
                  >
                    Log Meal
                  </Button>
                  <Button
                    leftIcon={<MdFitnessCenter />}
                    colorScheme="purple"
                    size="lg"
                    borderRadius="xl"
                    onClick={onWorkoutOpen}
                    bgGradient="linear(135deg, purple.400, purple.600)"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(128, 90, 213, 0.3)' }}
                  >
                    Log Workout
                  </Button>
                  <Button
                    leftIcon={<MdChat />}
                    colorScheme="blue"
                    size="lg"
                    borderRadius="xl"
                    bgGradient="linear(135deg, blue.400, blue.600)"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(66, 153, 225, 0.3)' }}
                  >
                    Chat Coach
                  </Button>
                  <Button
                    leftIcon={<MdCalendarToday />}
                    colorScheme="orange"
                    size="lg"
                    borderRadius="xl"
                    onClick={onCheckInOpen}
                    bgGradient="linear(135deg, orange.400, orange.600)"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(237, 137, 54, 0.3)' }}
                  >
                    Check In
                  </Button>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Recent Meals & Workouts */}
            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)">
              <CardBody p={6}>
                <Tabs>
                  <TabList>
                    <Tab>Meals</Tab>
                    <Tab>Workouts</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel px={0}>
                      <VStack spacing={3} align="stretch">
                        {recentMeals.map((meal) => (
                          <HStack key={meal.id} p={3} bg="gray.50" borderRadius="lg" justify="space-between">
                            <HStack>
                              <Icon as={MdRestaurant} color="green.500" boxSize={5} />
                              <Box>
                                <Text fontSize="sm" fontWeight="bold">{meal.name}</Text>
                                <Text fontSize="xs" color="gray.500">{meal.time}</Text>
                              </Box>
                            </HStack>
                            <Badge colorScheme="green" borderRadius="full">{meal.calories} kcal</Badge>
                          </HStack>
                        ))}
                        <Button size="sm" variant="ghost" leftIcon={<MdAdd />} onClick={onMealOpen}>
                          Add Meal
                        </Button>
                      </VStack>
                    </TabPanel>
                    <TabPanel px={0}>
                      <VStack spacing={3} align="stretch">
                        {recentWorkouts.map((workout) => (
                          <HStack key={workout.id} p={3} bg="gray.50" borderRadius="lg" justify="space-between">
                            <HStack>
                              <Icon as={workout.completed ? MdCheckCircle : MdAccessTime} color={workout.completed ? 'green.500' : 'gray.400'} boxSize={5} />
                              <Box>
                                <Text fontSize="sm" fontWeight="bold">{workout.name}</Text>
                                <Text fontSize="xs" color="gray.500">{workout.duration} • {workout.calories} kcal</Text>
                              </Box>
                            </HStack>
                            {workout.completed && <Badge colorScheme="green" borderRadius="full">Done</Badge>}
                          </HStack>
                        ))}
                        <Button size="sm" variant="ghost" leftIcon={<MdAdd />} onClick={onWorkoutOpen}>
                          Add Workout
                        </Button>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </Grid>

          {/* Coaching & Learning */}
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={6}>
            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)">
              <CardBody p={6}>
                <HStack justify="space-between" mb={4}>
                  <Text fontSize="xl" fontWeight="bold" color="gray.800">
                    Video Library
                  </Text>
                  <Button size="sm" variant="ghost" rightIcon={<MdPlayArrow />}>
                    View All
                  </Button>
                </HStack>
                <VStack spacing={3} align="stretch">
                  {videoLibrary.map((video) => (
                    <HStack key={video.id} p={3} bg="gray.50" borderRadius="lg" _hover={{ bg: 'gray.100' }} cursor="pointer">
                      <Box w="80px" h="50px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                        <Icon as={MdPlayArrow} boxSize={6} color="gray.600" />
                      </Box>
                      <Box flex={1}>
                        <Text fontSize="sm" fontWeight="bold">{video.title}</Text>
                        <HStack>
                          <Badge fontSize="xs" colorScheme="blue" variant="subtle">{video.category}</Badge>
                          <Text fontSize="xs" color="gray.500">{video.duration}</Text>
                        </HStack>
                      </Box>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)">
              <CardBody p={6}>
                <HStack justify="space-between" mb={4}>
                  <Text fontSize="xl" fontWeight="bold" color="gray.800">
                    Workout Library
                  </Text>
                  <Button size="sm" variant="ghost" rightIcon={<MdFitnessCenter />}>
                    Browse
                  </Button>
                </HStack>
                <VStack spacing={3} align="stretch">
                  {workoutLibrary.map((workout) => (
                    <Box key={workout.id} p={4} bg="gray.50" borderRadius="lg" _hover={{ bg: 'gray.100' }} cursor="pointer">
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="bold">{workout.name}</Text>
                        <Badge 
                          colorScheme={workout.difficulty === 'Beginner' ? 'green' : workout.difficulty === 'Intermediate' ? 'yellow' : 'red'}
                          borderRadius="full"
                          fontSize="xs"
                        >
                          {workout.difficulty}
                        </Badge>
                      </HStack>
                      <HStack>
                        <Text fontSize="xs" color="gray.500">{workout.duration}</Text>
                        <Text fontSize="xs" color="gray.500">•</Text>
                        <Text fontSize="xs" color="gray.500">{workout.exercises} exercises</Text>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </Grid>

          {/* Community & Leaderboard */}
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={6}>
            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)">
              <CardBody p={6}>
                <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
                  Community Programs
                </Text>
                <VStack spacing={4} align="stretch">
                  {communityPrograms.map((program) => (
                    <Box key={program.id} p={4} bg="gray.50" borderRadius="xl">
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="bold">{program.name}</Text>
                        <Badge colorScheme="purple" borderRadius="full">{program.participants} participants</Badge>
                      </HStack>
                      <Progress value={program.progress} colorScheme="purple" size="sm" borderRadius="full" mb={2} />
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.500">{program.progress}% Complete</Text>
                        <Text fontSize="xs" color="gray.500">{program.daysLeft} days left</Text>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)">
              <CardBody p={6}>
                <HStack justify="space-between" mb={4}>
                  <Text fontSize="xl" fontWeight="bold" color="gray.800">
                    Leaderboard
                  </Text>
                  <Badge colorScheme="yellow" borderRadius="full" px={2}>
                    <Icon as={MdEmojiEvents} mr={1} /> Top Performers
                  </Badge>
                </HStack>
                <VStack spacing={2} align="stretch">
                  {leaderboard.map((user) => (
                    <HStack 
                      key={user.rank} 
                      p={3} 
                      bg={user.isCurrentUser ? 'brand.50' : 'gray.50'} 
                      borderRadius="lg"
                      border={user.isCurrentUser ? '2px solid' : 'none'}
                      borderColor={user.isCurrentUser ? 'brand.400' : 'transparent'}
                    >
                      <Text fontSize="lg" fontWeight="bold" color={user.rank <= 3 ? 'yellow.500' : 'gray.400'} w="30px">
                        {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                      </Text>
                      <Avatar size="sm" name={user.name} />
                      <Box flex={1}>
                        <Text fontSize="sm" fontWeight="bold">{user.name} {user.isCurrentUser && '(You)'}</Text>
                      </Box>
                      <Badge colorScheme="green" borderRadius="full">{user.xp} XP</Badge>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </Grid>

          {/* AI Assistant & Badges */}
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={6}>
            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)">
              <CardBody p={6}>
                <HStack justify="space-between" mb={4}>
                  <Text fontSize="xl" fontWeight="bold" color="gray.800">
                    AI Nutritionist Assistant
                  </Text>
                  <Badge colorScheme="purple" borderRadius="full">24/7 Available</Badge>
                </HStack>
                <Box p={4} bg="gray.50" borderRadius="xl" mb={3} maxH="200px" overflowY="auto">
                  <VStack spacing={3} align="stretch">
                    {aiMessages.map((msg) => (
                      <Box key={msg.id} alignSelf={msg.sender === 'user' ? 'flex-end' : 'flex-start'}>
                        <Box 
                          p={2} 
                          bg={msg.sender === 'user' ? 'brand.100' : 'white'} 
                          borderRadius="lg"
                          maxW="80%"
                        >
                          <Text fontSize="sm">{msg.message}</Text>
                          <Text fontSize="xs" color="gray.500" mt={1}>{msg.time}</Text>
                        </Box>
                      </Box>
                    ))}
                  </VStack>
                </Box>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={MdChat} color="gray.400" />
                  </InputLeftElement>
                  <Input placeholder="Ask your nutritionist..." borderRadius="xl" />
                </InputGroup>
              </CardBody>
            </Card>

            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)">
              <CardBody p={6}>
                <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
                  Achievement Badges
                </Text>
                <Wrap spacing={4}>
                  {xpData.badges.map((badge, idx) => (
                    <WrapItem key={idx}>
                      <Tooltip label={badge.name}>
                        <Box
                          w="60px"
                          h="60px"
                          bg={badge.earned ? 'linear-gradient(135deg, #F6E05E, #D69E2E)' : 'gray.200'}
                          borderRadius="xl"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="2xl"
                          cursor="pointer"
                          _hover={{ transform: 'scale(1.1)' }}
                          transition="all 0.2s"
                          opacity={badge.earned ? 1 : 0.5}
                        >
                          {badge.icon}
                        </Box>
                      </Tooltip>
                    </WrapItem>
                  ))}
                </Wrap>
              </CardBody>
            </Card>
          </Grid>

          {/* Sleep Tracking & Recipes */}
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={6}>
            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)">
              <CardBody p={6}>
                <HStack justify="space-between" mb={4}>
                  <Text fontSize="xl" fontWeight="bold" color="gray.800">
                    Sleep Tracking
                  </Text>
                  <Badge colorScheme="indigo" borderRadius="full">Last Night</Badge>
                </HStack>
                <VStack spacing={4} align="stretch">
                  <Box p={4} bg="linear-gradient(135deg, #667EEA, #764BA2)" borderRadius="xl" color="white">
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" opacity={0.9}>Hours Slept</Text>
                      <Text fontSize="sm" opacity={0.9}>Goal: 8h</Text>
                    </HStack>
                    <Text fontSize="3xl" fontWeight="black">7.5h</Text>
                    <Progress value={(7.5 / 8) * 100} colorScheme="whiteAlpha" size="sm" mt={2} borderRadius="full" bg="rgba(255,255,255,0.3)" />
                  </Box>
                  <SimpleGrid columns={2} spacing={3}>
                    <Box p={3} bg="gray.50" borderRadius="lg">
                      <Text fontSize="xs" color="gray.500" mb={1}>Bedtime</Text>
                      <Text fontSize="sm" fontWeight="bold">10:30 PM</Text>
                    </Box>
                    <Box p={3} bg="gray.50" borderRadius="lg">
                      <Text fontSize="xs" color="gray.500" mb={1}>Wake Time</Text>
                      <Text fontSize="sm" fontWeight="bold">6:00 AM</Text>
                    </Box>
                  </SimpleGrid>
                  <Button size="sm" variant="outline" leftIcon={<MdAdd />} borderRadius="xl">
                    Log Sleep
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)">
              <CardBody p={6}>
                <HStack justify="space-between" mb={4}>
                  <Text fontSize="xl" fontWeight="bold" color="gray.800">
                    Recipe Database
                  </Text>
                  <Button size="sm" variant="ghost" rightIcon={<MdRestaurantMenu />}>
                    Browse All
                  </Button>
                </HStack>
                <VStack spacing={3} align="stretch">
                  {[
                    { name: 'Protein Power Bowl', calories: 420, time: '20 min', category: 'Lunch' },
                    { name: 'Green Smoothie', calories: 180, time: '5 min', category: 'Breakfast' },
                    { name: 'Grilled Salmon', calories: 350, time: '25 min', category: 'Dinner' },
                  ].map((recipe, idx) => (
                    <HStack key={idx} p={3} bg="gray.50" borderRadius="lg" _hover={{ bg: 'gray.100' }} cursor="pointer">
                      <Box w="50px" h="50px" bg="gray.200" borderRadius="md" />
                      <Box flex={1}>
                        <Text fontSize="sm" fontWeight="bold">{recipe.name}</Text>
                        <HStack>
                          <Text fontSize="xs" color="gray.500">{recipe.calories} kcal</Text>
                          <Text fontSize="xs" color="gray.500">•</Text>
                          <Text fontSize="xs" color="gray.500">{recipe.time}</Text>
                          <Badge fontSize="xs" colorScheme="green" variant="subtle" ml={2}>{recipe.category}</Badge>
                        </HStack>
                      </Box>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </Grid>

          {/* Learning Paths & Success Stories */}
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={6}>
            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)">
              <CardBody p={6}>
                <HStack justify="space-between" mb={4}>
                  <Text fontSize="xl" fontWeight="bold" color="gray.800">
                    Learning Paths
                  </Text>
                  <Badge colorScheme="blue" borderRadius="full">Choose Your Goal</Badge>
                </HStack>
                <VStack spacing={3} align="stretch">
                  {[
                    { name: 'Fat Loss Journey', progress: 65, lessons: 12, icon: '🔥' },
                    { name: 'Muscle Gain Program', progress: 0, lessons: 15, icon: '💪' },
                    { name: 'PCOS Health Plan', progress: 0, lessons: 10, icon: '🌸' },
                    { name: "Women's Health", progress: 0, lessons: 8, icon: '✨' },
                  ].map((path, idx) => (
                    <Box key={idx} p={4} bg="gray.50" borderRadius="xl" _hover={{ bg: 'gray.100' }} cursor="pointer">
                      <HStack justify="space-between" mb={2}>
                        <HStack>
                          <Text fontSize="xl">{path.icon}</Text>
                          <Box>
                            <Text fontSize="sm" fontWeight="bold">{path.name}</Text>
                            <Text fontSize="xs" color="gray.500">{path.lessons} lessons</Text>
                          </Box>
                        </HStack>
                        {path.progress > 0 && (
                          <Badge colorScheme="green" borderRadius="full">{path.progress}%</Badge>
                        )}
                      </HStack>
                      {path.progress > 0 && (
                        <Progress value={path.progress} colorScheme="blue" size="sm" borderRadius="full" />
                      )}
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)">
              <CardBody p={6}>
                <HStack justify="space-between" mb={4}>
                  <Text fontSize="xl" fontWeight="bold" color="gray.800">
                    Success Stories
                  </Text>
                  <Button size="sm" variant="ghost" rightIcon={<MdShare />}>
                    Share Yours
                  </Button>
                </HStack>
                <VStack spacing={4} align="stretch">
                  {[
                    { name: 'Sarah M.', result: 'Lost 15kg in 3 months', image: null },
                    { name: 'Mike T.', result: 'Gained 8kg muscle', image: null },
                    { name: 'Emma L.', result: 'Transformed lifestyle', image: null },
                  ].map((story, idx) => (
                    <HStack key={idx} p={3} bg="gray.50" borderRadius="lg">
                      <Avatar size="md" name={story.name} />
                      <Box flex={1}>
                        <Text fontSize="sm" fontWeight="bold">{story.name}</Text>
                        <Text fontSize="xs" color="gray.600">{story.result}</Text>
                        <HStack mt={1}>
                          <Icon as={MdStar} color="yellow.400" boxSize={3} />
                          <Text fontSize="xs" color="gray.500">Verified Transformation</Text>
                        </HStack>
                      </Box>
                      <IconButton icon={<MdShare />} size="sm" variant="ghost" aria-label="Share" />
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </Grid>

          {/* Referral System */}
          <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)" mb={6}>
            <CardBody p={6}>
              <HStack justify="space-between" mb={4}>
                <Box>
                  <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={1}>
                    Referral Bonus System
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Invite friends and earn rewards!
                  </Text>
                </Box>
                <Badge colorScheme="green" borderRadius="full" px={3} py={1} fontSize="sm">
                  3 Referrals
                </Badge>
              </HStack>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Box p={4} bg="linear-gradient(135deg, #48BB78, #38A169)" borderRadius="xl" color="white">
                  <Text fontSize="xs" mb={1} opacity={0.9}>Your Referrals</Text>
                  <Text fontSize="2xl" fontWeight="black">3</Text>
                  <Text fontSize="xs" mt={2} opacity={0.9}>Active members</Text>
                </Box>
                <Box p={4} bg="linear-gradient(135deg, #ED8936, #DD6B20)" borderRadius="xl" color="white">
                  <Text fontSize="xs" mb={1} opacity={0.9}>Bonus Earned</Text>
                  <Text fontSize="2xl" fontWeight="black">1,500 XP</Text>
                  <Text fontSize="xs" mt={2} opacity={0.9}>+ 3 months free</Text>
                </Box>
                <Box p={4} bg="linear-gradient(135deg, #4299E1, #3182CE)" borderRadius="xl" color="white">
                  <Text fontSize="xs" mb={1} opacity={0.9}>Referral Code</Text>
                  <Text fontSize="lg" fontWeight="bold" fontFamily="mono">FITHUB2024</Text>
                  <Button size="xs" mt={2} bg="rgba(255,255,255,0.3)" color="white" _hover={{ bg: 'rgba(255,255,255,0.4)' }}>
                    Copy Code
                  </Button>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Progress Photos */}
          <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)" mb={6}>
            <CardBody p={6}>
              <HStack justify="space-between" mb={4}>
                <Text fontSize="xl" fontWeight="bold" color="gray.800">
                  Transformation Timeline
                </Text>
                <Button size="sm" leftIcon={<MdPhotoCamera />} colorScheme="green">
                  Add Photo
                </Button>
              </HStack>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {progressPhotos.map((photo) => (
                  <Box key={photo.id} position="relative">
                    <Box
                      w="100%"
                      h="200px"
                      bg="gray.200"
                      borderRadius="xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      border="2px solid"
                      borderColor={photo.type === 'current' ? 'brand.400' : 'transparent'}
                    >
                      <VStack>
                        <Icon as={MdPhotoCamera} boxSize={8} color="gray.400" />
                        <Text fontSize="xs" color="gray.500" textTransform="capitalize">{photo.type}</Text>
                        <Text fontSize="xs" color="gray.400">{photo.date}</Text>
                      </VStack>
                    </Box>
                    <Badge
                      position="absolute"
                      top={2}
                      right={2}
                      colorScheme={photo.type === 'before' ? 'red' : photo.type === 'progress' ? 'yellow' : 'green'}
                      borderRadius="full"
                    >
                      {photo.type === 'before' ? 'Before' : photo.type === 'progress' ? 'Progress' : 'Current'}
                    </Badge>
                  </Box>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>
        </Box>
      </Box>

      {/* Meal Logging Modal */}
      <Modal isOpen={isMealOpen} onClose={onMealClose} size="lg">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Log Your Meal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Meal Name</FormLabel>
                <Input placeholder="e.g., Grilled Chicken Salad" borderRadius="lg" />
              </FormControl>
              <FormControl>
                <FormLabel>Calories</FormLabel>
                <Input type="number" placeholder="450" borderRadius="lg" />
              </FormControl>
              <FormControl>
                <FormLabel>Add Photo (Optional)</FormLabel>
                <Button leftIcon={<MdPhotoCamera />} variant="outline" w="full" borderRadius="lg">
                  Take or Upload Photo
                </Button>
              </FormControl>
              <FormControl>
                <FormLabel>Time</FormLabel>
                <Input type="time" borderRadius="lg" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onMealClose}>Cancel</Button>
            <Button colorScheme="green" onClick={onMealClose} borderRadius="xl">Log Meal</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Workout Logging Modal */}
      <Modal isOpen={isWorkoutOpen} onClose={onWorkoutClose} size="lg">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Log Your Workout</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Workout Name</FormLabel>
                <Select placeholder="Select workout" borderRadius="lg">
                  <option>Upper Body Strength</option>
                  <option>Cardio Blast</option>
                  <option>Yoga Flow</option>
                  <option>Lower Body Power</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Duration (minutes)</FormLabel>
                <Input type="number" placeholder="45" borderRadius="lg" />
              </FormControl>
              <FormControl>
                <FormLabel>Calories Burned</FormLabel>
                <Input type="number" placeholder="380" borderRadius="lg" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onWorkoutClose}>Cancel</Button>
            <Button colorScheme="purple" onClick={onWorkoutClose} borderRadius="xl">Log Workout</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Check-in Modal */}
      <Modal isOpen={isCheckInOpen} onClose={onCheckInClose} size="lg">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Daily Check-in</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>How are you feeling today?</FormLabel>
                <Select placeholder="Select mood" borderRadius="lg">
                  <option>😊 Great</option>
                  <option>😐 Okay</option>
                  <option>😔 Not Great</option>
                  <option>🔥 Energized</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Weight (kg)</FormLabel>
                <Input type="number" placeholder="81.0" borderRadius="lg" />
              </FormControl>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea placeholder="How did your day go? Any challenges?" rows={4} borderRadius="lg" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCheckInClose}>Cancel</Button>
            <Button colorScheme="orange" onClick={onCheckInClose} borderRadius="xl">Submit Check-in</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Dashboard;
