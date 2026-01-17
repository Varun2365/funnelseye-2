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
  Progress,
  Button,
  useColorModeValue,
  Icon,
  Avatar,
  Tooltip,
  Wrap,
  WrapItem,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import {
  MdEmojiEvents,
  MdStar,
  MdLocalFireDepartment,
} from 'react-icons/md';
import { FiAward, FiTarget } from 'react-icons/fi';

const Gamification = () => {
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)');

  const xpData = {
    current: 2450,
    nextLevel: 3000,
    level: 5,
    streak: 12,
    alphaScore: 87,
  };

  const badges = [
    { name: 'First Steps', icon: '👟', earned: true, date: '2 weeks ago' },
    { name: 'Week Warrior', icon: '💪', earned: true, date: '1 week ago' },
    { name: 'Meal Master', icon: '🍎', earned: true, date: '5 days ago' },
    { name: 'Hydration Hero', icon: '💧', earned: true, date: '3 days ago' },
    { name: 'Transformation', icon: '🏆', earned: false, date: null },
    { name: '100 Days', icon: '🔥', earned: false, date: null },
    { name: 'Perfect Week', icon: '⭐', earned: false, date: null },
    { name: 'Early Bird', icon: '🌅', earned: false, date: null },
  ];

  const achievements = [
    { title: 'Lost First 2 KGs!', date: '2 days ago', points: 200, icon: '🎉' },
    { title: '7 Day Streak', date: '1 week ago', points: 150, icon: '🔥' },
    { title: 'Logged 50 Meals', date: '2 weeks ago', points: 100, icon: '🍎' },
    { title: 'Completed First Workout', date: '3 weeks ago', points: 50, icon: '💪' },
  ];

  const leaderboard = [
    { rank: 1, name: 'Sarah M.', xp: 5420, avatar: null, isCurrentUser: false },
    { rank: 2, name: 'Mike T.', xp: 4890, avatar: null, isCurrentUser: false },
    { rank: 3, name: 'You', xp: 2450, avatar: null, isCurrentUser: true },
    { rank: 4, name: 'Emma L.', xp: 2100, avatar: null, isCurrentUser: false },
    { rank: 5, name: 'John D.', xp: 1980, avatar: null, isCurrentUser: false },
  ];

  const streaks = {
    meals: 5,
    water: 7,
    exercise: 4,
    checkIn: 12,
  };

  return (
    <Box>
      <Box mb={6}>
        <Text fontSize="3xl" fontWeight="black" color="gray.800" mb={1}>
          Gamification & Achievements
        </Text>
        <Text color="gray.600" fontSize="lg">
          Track your progress, earn badges, and compete on leaderboards
        </Text>
      </Box>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6} mb={6}>
        {/* XP & Level Progress */}
        <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
          <CardBody p={6}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
              Your Progress
            </Text>
            
            <Box mb={6} p={6} bg="linear-gradient(135deg, #48BB78, #38B2AC)" borderRadius="xl" color="white">
              <HStack justify="space-between" mb={4}>
                <Box>
                  <Text fontSize="sm" opacity={0.9}>LEVEL</Text>
                  <Text fontSize="4xl" fontWeight="black">{xpData.level}</Text>
                </Box>
                <Box textAlign="right">
                  <Text fontSize="sm" opacity={0.9}>STREAK</Text>
                  <HStack justify="flex-end">
                    <Icon as={MdLocalFireDepartment} boxSize={6} />
                    <Text fontSize="2xl" fontWeight="black">{xpData.streak} Days</Text>
                  </HStack>
                </Box>
              </HStack>
              <Text fontSize="lg" mb={2} opacity={0.9}>XP Progress</Text>
              <Text fontSize="2xl" fontWeight="black" mb={2}>{xpData.current} / {xpData.nextLevel} XP</Text>
              <Progress 
                value={(xpData.current / xpData.nextLevel) * 100} 
                colorScheme="whiteAlpha" 
                size="lg" 
                borderRadius="full"
                bg="rgba(255,255,255,0.3)"
              />
              <Text fontSize="xs" mt={2} opacity={0.8}>{xpData.nextLevel - xpData.current} XP to next level</Text>
            </Box>

            {/* Daily Alpha Score */}
            <Box p={4} bg="gray.50" borderRadius="xl">
              <HStack justify="space-between" mb={3}>
                <Text fontSize="sm" fontWeight="bold">Daily Alpha Score</Text>
                <Badge colorScheme="green" borderRadius="full">{xpData.alphaScore}%</Badge>
              </HStack>
              <CircularProgress value={xpData.alphaScore} color="green.500" size="100px">
                <CircularProgressLabel fontSize="lg" fontWeight="bold">{xpData.alphaScore}%</CircularProgressLabel>
              </CircularProgress>
              <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">Adherence Assessment</Text>
            </Box>
          </CardBody>
        </Card>

        {/* Streaks */}
        <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
          <CardBody p={6}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
              Active Streaks
            </Text>
            <VStack spacing={4} align="stretch">
              <Box p={3} bg="gray.50" borderRadius="lg">
                <HStack justify="space-between" mb={2}>
                  <HStack>
                    <Icon as={MdStar} color="orange.500" />
                    <Text fontSize="sm" fontWeight="bold">Meals</Text>
                  </HStack>
                  <Badge colorScheme="orange" borderRadius="full">{streaks.meals} days</Badge>
                </HStack>
                <Progress value={(streaks.meals / 7) * 100} colorScheme="orange" size="sm" borderRadius="full" />
              </Box>
              <Box p={3} bg="gray.50" borderRadius="lg">
                <HStack justify="space-between" mb={2}>
                  <HStack>
                    <Icon as={MdLocalFireDepartment} color="cyan.500" />
                    <Text fontSize="sm" fontWeight="bold">Water</Text>
                  </HStack>
                  <Badge colorScheme="cyan" borderRadius="full">{streaks.water} days</Badge>
                </HStack>
                <Progress value={(streaks.water / 7) * 100} colorScheme="cyan" size="sm" borderRadius="full" />
              </Box>
              <Box p={3} bg="gray.50" borderRadius="lg">
                <HStack justify="space-between" mb={2}>
                  <HStack>
                    <Icon as={FiTarget} color="purple.500" />
                    <Text fontSize="sm" fontWeight="bold">Exercise</Text>
                  </HStack>
                  <Badge colorScheme="purple" borderRadius="full">{streaks.exercise} days</Badge>
                </HStack>
                <Progress value={(streaks.exercise / 7) * 100} colorScheme="purple" size="sm" borderRadius="full" />
              </Box>
              <Box p={3} bg="gray.50" borderRadius="lg">
                <HStack justify="space-between" mb={2}>
                  <HStack>
                    <Icon as={FiAward} color="green.500" />
                    <Text fontSize="sm" fontWeight="bold">Check-ins</Text>
                  </HStack>
                  <Badge colorScheme="green" borderRadius="full">{streaks.checkIn} days</Badge>
                </HStack>
                <Progress value={(streaks.checkIn / 14) * 100} colorScheme="green" size="sm" borderRadius="full" />
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Achievements */}
      <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" mb={6}>
        <CardBody p={6}>
          <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
            Recent Achievements
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {achievements.map((achievement, idx) => (
              <HStack key={idx} p={4} bg="gray.50" borderRadius="lg" justify="space-between">
                <HStack>
                  <Text fontSize="3xl">{achievement.icon}</Text>
                  <Box>
                    <Text fontSize="sm" fontWeight="bold">{achievement.title}</Text>
                    <Text fontSize="xs" color="gray.500">{achievement.date}</Text>
                  </Box>
                </HStack>
                <Badge colorScheme="green" borderRadius="full" fontSize="sm" px={3} py={1}>
                  +{achievement.points} XP
                </Badge>
              </HStack>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
        {/* Badges */}
        <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
          <CardBody p={6}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
              Achievement Badges
            </Text>
            <Wrap spacing={4}>
              {badges.map((badge, idx) => (
                <WrapItem key={idx}>
                  <Tooltip label={badge.earned ? `${badge.name} - Earned ${badge.date}` : `${badge.name} - Locked`}>
                    <Box
                      w="80px"
                      h="80px"
                      bg={badge.earned ? 'linear-gradient(135deg, #F6E05E, #D69E2E)' : 'gray.200'}
                      borderRadius="xl"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      cursor="pointer"
                      _hover={{ transform: 'scale(1.1)' }}
                      transition="all 0.2s"
                      opacity={badge.earned ? 1 : 0.5}
                      position="relative"
                    >
                      <Text fontSize="2xl">{badge.icon}</Text>
                      {badge.earned && (
                        <Icon as={MdStar} position="absolute" top={1} right={1} color="yellow.400" boxSize={4} />
                      )}
                    </Box>
                  </Tooltip>
                </WrapItem>
              ))}
            </Wrap>
          </CardBody>
        </Card>

        {/* Leaderboard */}
        <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
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
    </Box>
  );
};

export default Gamification;

