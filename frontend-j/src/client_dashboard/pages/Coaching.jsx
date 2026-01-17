import React from 'react';
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
  Button,
  useColorModeValue,
  Icon,
  Image,
} from '@chakra-ui/react';
import {
  MdVideoLibrary,
  MdPlayArrow,
  MdRestaurantMenu,
  MdSchool,
  MdFitnessCenter,
  MdCheckCircle,
} from 'react-icons/md';

const Coaching = () => {
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)');

  const videoLibrary = [
    { id: 1, title: 'Fat Loss Fundamentals', category: 'Learning Path', duration: '15:30', progress: 65 },
    { id: 2, title: 'Meal Prep Basics', category: 'Food Prep', duration: '12:20', progress: 100 },
    { id: 3, title: 'Perfect Squat Form', category: 'Form Tutorial', duration: '8:45', progress: 0 },
    { id: 4, title: 'Onboarding: Getting Started', category: 'Onboarding', duration: '20:00', progress: 100 },
    { id: 5, title: 'Cardio Basics', category: 'Learning Path', duration: '10:15', progress: 0 },
    { id: 6, title: 'Nutrition 101', category: 'Learning Path', duration: '18:30', progress: 45 },
  ];

  const workoutLibrary = [
    { id: 1, name: 'Beginner Full Body', difficulty: 'Beginner', duration: '30 min', exercises: 8 },
    { id: 2, name: 'Intermediate HIIT', difficulty: 'Intermediate', duration: '45 min', exercises: 12 },
    { id: 3, name: 'Advanced Strength', difficulty: 'Advanced', duration: '60 min', exercises: 15 },
    { id: 4, name: 'Yoga Flow', difficulty: 'Beginner', duration: '40 min', exercises: 10 },
    { id: 5, name: 'Cardio Blast', difficulty: 'Intermediate', duration: '35 min', exercises: 14 },
  ];

  const learningPaths = [
    { id: 1, name: 'Fat Loss Journey', progress: 65, lessons: 12, icon: '🔥', color: 'red' },
    { id: 2, name: 'Muscle Gain Program', progress: 0, lessons: 15, icon: '💪', color: 'blue' },
    { id: 3, name: 'PCOS Health Plan', progress: 0, lessons: 10, icon: '🌸', color: 'pink' },
    { id: 4, name: "Women's Health", progress: 0, lessons: 8, icon: '✨', color: 'purple' },
  ];

  return (
    <Box>
      <Box mb={6}>
        <Text fontSize="3xl" fontWeight="black" color="gray.800" mb={1}>
          Coaching Delivery System
        </Text>
        <Text color="gray.600" fontSize="lg">
          Access video lessons, workouts, and learning paths
        </Text>
      </Box>

      {/* Learning Paths */}
      <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" mb={6}>
        <CardBody p={6}>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              Learning Paths
            </Text>
            <Badge colorScheme="blue" borderRadius="full">Choose Your Goal</Badge>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {learningPaths.map((path) => (
              <Box key={path.id} p={4} bg="gray.50" borderRadius="xl" _hover={{ bg: 'gray.100' }} cursor="pointer">
                <HStack justify="space-between" mb={2}>
                  <HStack>
                    <Text fontSize="2xl">{path.icon}</Text>
                    <Box>
                      <Text fontSize="sm" fontWeight="bold">{path.name}</Text>
                      <Text fontSize="xs" color="gray.500">{path.lessons} lessons</Text>
                    </Box>
                  </HStack>
                  {path.progress > 0 && (
                    <Badge colorScheme={path.color} borderRadius="full">{path.progress}%</Badge>
                  )}
                </HStack>
                {path.progress > 0 && (
                  <Box>
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="xs" color="gray.500">Progress</Text>
                      <Text fontSize="xs" fontWeight="bold">{path.progress}%</Text>
                    </HStack>
                    <Box h="6px" bg="gray.200" borderRadius="full" overflow="hidden">
                      <Box h="100%" bg={`${path.color}.500`} w={`${path.progress}%`} />
                    </Box>
                  </Box>
                )}
                {path.progress === 0 && (
                  <Button size="sm" colorScheme={path.color} mt={2} borderRadius="xl">Start Path</Button>
                )}
              </Box>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={6}>
        {/* Video Library */}
        <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
          <CardBody p={6}>
            <HStack justify="space-between" mb={4}>
              <Text fontSize="xl" fontWeight="bold" color="gray.800">
                Video Lesson Library
              </Text>
              <Button size="sm" variant="ghost" rightIcon={<MdPlayArrow />}>
                View All
              </Button>
            </HStack>
            <VStack spacing={3} align="stretch">
              {videoLibrary.map((video) => (
                <HStack key={video.id} p={3} bg="gray.50" borderRadius="lg" _hover={{ bg: 'gray.100' }} cursor="pointer">
                  <Box w="80px" h="50px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center" position="relative">
                    <Icon as={MdPlayArrow} boxSize={6} color="gray.600" />
                    {video.progress > 0 && (
                      <Box position="absolute" bottom={0} left={0} right={0} h="3px" bg="green.500" />
                    )}
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="bold">{video.title}</Text>
                    <HStack>
                      <Badge fontSize="xs" colorScheme="blue" variant="subtle">{video.category}</Badge>
                      <Text fontSize="xs" color="gray.500">{video.duration}</Text>
                      {video.progress > 0 && (
                        <Badge fontSize="xs" colorScheme="green" variant="subtle">{video.progress}%</Badge>
                      )}
                    </HStack>
                  </Box>
                  {video.progress === 100 && (
                    <Icon as={MdCheckCircle} color="green.500" boxSize={5} />
                  )}
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Workout Library */}
        <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
          <CardBody p={6}>
            <HStack justify="space-between" mb={4}>
              <Text fontSize="xl" fontWeight="bold" color="gray.800">
                Workout Library
              </Text>
              <Button size="sm" variant="ghost" rightIcon={<MdFitnessCenter />}>
                Browse All
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
                  <Button size="sm" colorScheme="purple" mt={2} borderRadius="xl" w="full">Start Workout</Button>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Food Preparation Videos */}
      <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" mb={6}>
        <CardBody p={6}>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              Food Preparation Videos
            </Text>
            <Icon as={MdRestaurantMenu} boxSize={6} color="orange.500" />
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {[
              { title: 'Meal Prep Sunday', duration: '25:00', views: '1.2k' },
              { title: 'Quick Healthy Breakfasts', duration: '15:30', views: '890' },
              { title: 'Protein-Rich Recipes', duration: '20:15', views: '2.1k' },
            ].map((video, idx) => (
              <Box key={idx} p={4} bg="gray.50" borderRadius="xl" _hover={{ bg: 'gray.100' }} cursor="pointer">
                <Box w="100%" h="120px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center" mb={2}>
                  <Icon as={MdPlayArrow} boxSize={8} color="gray.600" />
                </Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>{video.title}</Text>
                <HStack>
                  <Text fontSize="xs" color="gray.500">{video.duration}</Text>
                  <Text fontSize="xs" color="gray.500">•</Text>
                  <Text fontSize="xs" color="gray.500">{video.views} views</Text>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Exercise Form Tutorials */}
      <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
        <CardBody p={6}>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              Exercise Form Tutorials
            </Text>
            <Badge colorScheme="green" borderRadius="full">Perfect Your Form</Badge>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            {[
              { name: 'Squat', duration: '5:30' },
              { name: 'Deadlift', duration: '6:15' },
              { name: 'Bench Press', duration: '4:45' },
              { name: 'Pull-ups', duration: '5:00' },
            ].map((exercise, idx) => (
              <Box key={idx} p={4} bg="gray.50" borderRadius="xl" textAlign="center" _hover={{ bg: 'gray.100' }} cursor="pointer">
                <Box w="80px" h="80px" bg="gray.200" borderRadius="full" display="flex" alignItems="center" justifyContent="center" mx="auto" mb={2}>
                  <Icon as={MdFitnessCenter} boxSize={8} color="gray.600" />
                </Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>{exercise.name}</Text>
                <Text fontSize="xs" color="gray.500">{exercise.duration}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Coaching;

