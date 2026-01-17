import React, { useState } from 'react';
import {
  Box,
  Grid,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  SimpleGrid,
  Badge,
  Progress,
  Button,
  useColorModeValue,
  Icon,
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
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import {
  MdTrendingUp,
  MdRestaurant,
  MdDirectionsRun,
  MdWaterDrop,
  MdBedtime,
  MdPhotoCamera,
  MdAdd,
  MdLocalFireDepartment,
} from 'react-icons/md';
import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const ProgressTracking = () => {
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)');
  const { isOpen: isMealOpen, onOpen: onMealOpen, onClose: onMealClose } = useDisclosure();
  const { isOpen: isWeightOpen, onOpen: onWeightOpen, onClose: onWeightClose } = useDisclosure();
  const { isOpen: isMeasurementOpen, onOpen: onMeasurementOpen, onClose: onMeasurementClose } = useDisclosure();

  // Weight Data
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
    { name: 'Thighs', current: 58, previous: 60, unit: 'cm' },
    { name: 'Neck', current: 38, previous: 39, unit: 'cm' },
  ];

  // Daily Logs
  const dailyLogs = {
    steps: 8420,
    stepsGoal: 10000,
    calories: 1850,
    caloriesGoal: 2000,
    water: 6,
    waterGoal: 8,
    sleep: 7.5,
    sleepGoal: 8,
    mood: '😊 Great',
  };

  // Weekly Progress
  const weeklyProgress = [
    { day: 'Mon', meals: 3, water: 8, workouts: 1, steps: 8500 },
    { day: 'Tue', meals: 3, water: 7, workouts: 1, steps: 9200 },
    { day: 'Wed', meals: 2, water: 6, workouts: 0, steps: 7200 },
    { day: 'Thu', meals: 3, water: 8, workouts: 1, steps: 9800 },
    { day: 'Fri', meals: 3, water: 7, workouts: 1, steps: 8900 },
    { day: 'Sat', meals: 2, water: 6, workouts: 0, steps: 6500 },
    { day: 'Sun', meals: 3, water: 8, workouts: 1, steps: 8420 },
  ];

  // BMI & Body Metrics
  const bodyMetrics = {
    weight: 81,
    height: 175,
    bmi: 26.4,
    bodyFat: 18.5,
    metabolicRate: 1950,
  };

  // Recent Meals
  const recentMeals = [
    { id: 1, name: 'Grilled Chicken Salad', time: '12:30 PM', calories: 450 },
    { id: 2, name: 'Protein Smoothie', time: '8:00 AM', calories: 320 },
    { id: 3, name: 'Quinoa Bowl', time: '7:00 PM', calories: 520 },
  ];

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Box>
          <Text fontSize="3xl" fontWeight="black" color="gray.800" mb={1}>
            Progress Tracking
          </Text>
          <Text color="gray.600" fontSize="lg">
            Track your fitness journey in detail
          </Text>
        </Box>
        <Button leftIcon={<MdAdd />} colorScheme="green" size="lg" borderRadius="xl" onClick={onWeightOpen}>
          Log Weight
        </Button>
      </HStack>

      <Tabs>
        <TabList mb={6}>
          <Tab>Weight & Measurements</Tab>
          <Tab>Daily Logs</Tab>
          <Tab>Meal Logging</Tab>
          <Tab>BMI Calculator</Tab>
        </TabList>

        <TabPanels>
          {/* Weight & Measurements Tab */}
          <TabPanel px={0}>
            <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6} mb={6}>
              <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
                <CardBody p={6}>
                  <HStack justify="space-between" mb={6}>
                    <Box>
                      <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={1}>
                        Weight Tracker
                      </Text>
                      <Text color="gray.500" fontSize="sm">
                        Progress over 6 weeks
                      </Text>
                    </Box>
                    <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
                      -4kg Lost
                    </Badge>
                  </HStack>
                  
                  <Box h="300px">
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
                        <RechartsTooltip />
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

              <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
                <CardBody p={6}>
                  <HStack justify="space-between" mb={4}>
                    <Text fontSize="xl" fontWeight="bold" color="gray.800">
                      Current Weight
                    </Text>
                    <Button size="sm" onClick={onWeightOpen}>Update</Button>
                  </HStack>
                  <VStack spacing={4}>
                    <Box textAlign="center">
                      <Text fontSize="4xl" fontWeight="black" color="brand.600">
                        {bodyMetrics.weight} kg
                      </Text>
                      <Text fontSize="sm" color="gray.500">Target: 80 kg</Text>
                    </Box>
                    <Progress value={((85 - bodyMetrics.weight) / (85 - 80)) * 100} colorScheme="green" size="lg" w="full" borderRadius="full" />
                  </VStack>
                </CardBody>
              </Card>
            </Grid>

            {/* Body Measurements */}
            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" mb={6}>
              <CardBody p={6}>
                <HStack justify="space-between" mb={4}>
                  <Text fontSize="xl" fontWeight="bold" color="gray.800">
                    Body Measurements (Inches/cm)
                  </Text>
                  <Button size="sm" onClick={onMeasurementOpen}>Add Measurement</Button>
                </HStack>
                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                  {measurementData.map((measure, idx) => {
                    const change = measure.current - measure.previous;
                    const isPositive = change < 0;
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
          </TabPanel>

          {/* Daily Logs Tab */}
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
              <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
                <CardBody p={4}>
                  <Icon as={MdDirectionsRun} boxSize={6} color="blue.500" mb={2} />
                  <Text fontSize="2xl" fontWeight="black">{dailyLogs.steps.toLocaleString()}</Text>
                  <Text fontSize="xs" color="gray.500" mb={2}>Steps</Text>
                  <Progress value={(dailyLogs.steps / dailyLogs.stepsGoal) * 100} colorScheme="blue" size="sm" borderRadius="full" />
                </CardBody>
              </Card>

              <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
                <CardBody p={4}>
                  <Icon as={MdLocalFireDepartment} boxSize={6} color="orange.500" mb={2} />
                  <Text fontSize="2xl" fontWeight="black">{dailyLogs.calories}</Text>
                  <Text fontSize="xs" color="gray.500" mb={2}>Calories</Text>
                  <Progress value={(dailyLogs.calories / dailyLogs.caloriesGoal) * 100} colorScheme="orange" size="sm" borderRadius="full" />
                </CardBody>
              </Card>

              <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
                <CardBody p={4}>
                  <Icon as={MdWaterDrop} boxSize={6} color="cyan.500" mb={2} />
                  <Text fontSize="2xl" fontWeight="black">{dailyLogs.water}/{dailyLogs.waterGoal}</Text>
                  <Text fontSize="xs" color="gray.500" mb={2}>Water (glasses)</Text>
                  <Progress value={(dailyLogs.water / dailyLogs.waterGoal) * 100} colorScheme="cyan" size="sm" borderRadius="full" />
                </CardBody>
              </Card>

              <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
                <CardBody p={4}>
                  <Icon as={MdBedtime} boxSize={6} color="indigo.500" mb={2} />
                  <Text fontSize="2xl" fontWeight="black">{dailyLogs.sleep}h</Text>
                  <Text fontSize="xs" color="gray.500" mb={2}>Sleep</Text>
                  <Progress value={(dailyLogs.sleep / dailyLogs.sleepGoal) * 100} colorScheme="indigo" size="sm" borderRadius="full" />
                </CardBody>
              </Card>
            </SimpleGrid>

            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" mb={6}>
              <CardBody p={6}>
                <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
                  Weekly Progress Chart
                </Text>
                <Box h="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="steps" fill="#4299E1" />
                      <Bar dataKey="water" fill="#38B2AC" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardBody>
            </Card>

            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
              <CardBody p={6}>
                <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
                  Today's Mood
                </Text>
                <HStack spacing={4}>
                  <Box p={4} bg="gray.50" borderRadius="xl" textAlign="center">
                    <Text fontSize="4xl" mb={2}>{dailyLogs.mood}</Text>
                    <Text fontSize="sm" color="gray.600">Current Mood</Text>
                  </Box>
                  <VStack align="stretch" flex={1}>
                    <Text fontSize="sm" color="gray.600">Mood Tracking helps you understand patterns in your wellness journey.</Text>
                    <Button size="sm" colorScheme="blue" borderRadius="xl" w="fit-content">Update Mood</Button>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Meal Logging Tab */}
          <TabPanel px={0}>
            <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" mb={6}>
              <CardBody p={6}>
                <HStack justify="space-between" mb={4}>
                  <Text fontSize="xl" fontWeight="bold" color="gray.800">
                    Daily Meal Log
                  </Text>
                  <Button leftIcon={<MdAdd />} colorScheme="green" onClick={onMealOpen}>
                    Log Meal
                  </Button>
                </HStack>
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
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* BMI Calculator Tab */}
          <TabPanel px={0}>
            <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
              <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
                <CardBody p={6}>
                  <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
                    Body Metrics Calculator
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

              <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
                <CardBody p={6}>
                  <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
                    Calculate BMI
                  </Text>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Weight (kg)</FormLabel>
                      <Input type="number" placeholder="81" defaultValue={bodyMetrics.weight} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Height (cm)</FormLabel>
                      <Input type="number" placeholder="175" defaultValue={bodyMetrics.height} />
                    </FormControl>
                    <Button colorScheme="blue" w="full" borderRadius="xl">Calculate</Button>
                  </VStack>
                </CardBody>
              </Card>
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Weight Logging Modal */}
      <Modal isOpen={isWeightOpen} onClose={onWeightClose} size="md">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Log Weight</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Weight (kg)</FormLabel>
                <Input type="number" placeholder="81.0" />
              </FormControl>
              <FormControl>
                <FormLabel>Date</FormLabel>
                <Input type="date" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onWeightClose}>Cancel</Button>
            <Button colorScheme="green" onClick={onWeightClose}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Meal Logging Modal */}
      <Modal isOpen={isMealOpen} onClose={onMealClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Log Your Meal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Meal Name</FormLabel>
                <Input placeholder="e.g., Grilled Chicken Salad" />
              </FormControl>
              <FormControl>
                <FormLabel>Calories</FormLabel>
                <Input type="number" placeholder="450" />
              </FormControl>
              <FormControl>
                <FormLabel>Add Photo (AI Detection Available)</FormLabel>
                <Button leftIcon={<MdPhotoCamera />} variant="outline" w="full">
                  Take or Upload Photo
                </Button>
              </FormControl>
              <FormControl>
                <FormLabel>Time</FormLabel>
                <Input type="time" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onMealClose}>Cancel</Button>
            <Button colorScheme="green" onClick={onMealClose}>Log Meal</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Measurement Modal */}
      <Modal isOpen={isMeasurementOpen} onClose={onMeasurementClose} size="md">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Add Body Measurement</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Measurement Type</FormLabel>
                <Select placeholder="Select measurement">
                  <option>Chest</option>
                  <option>Waist</option>
                  <option>Hips</option>
                  <option>Arms</option>
                  <option>Thighs</option>
                  <option>Neck</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Value (cm)</FormLabel>
                <Input type="number" placeholder="102" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onMeasurementClose}>Cancel</Button>
            <Button colorScheme="green" onClick={onMeasurementClose}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProgressTracking;

