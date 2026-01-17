import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  Badge,
  Button,
  Avatar,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FiAward,
  FiStar,
  FiTrendingUp,
  FiTarget,
  FiZap,
} from 'react-icons/fi';

const Gamification = () => {
  const leaderboard = [
    {
      id: 1,
      name: 'Sarah Williams',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      points: 2450,
      level: 8,
      badges: 12,
      rank: 1,
    },
    {
      id: 2,
      name: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      points: 1890,
      level: 6,
      badges: 8,
      rank: 2,
    },
    {
      id: 3,
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      points: 1250,
      level: 4,
      badges: 5,
      rank: 3,
    },
  ];

  const achievements = [
    { id: 1, name: 'Week Warrior', description: 'Complete 7 days in a row', icon: FiZap, earned: 15 },
    { id: 2, name: 'Goal Getter', description: 'Complete 10 goals', icon: FiTarget, earned: 8 },
    { id: 3, name: 'Rising Star', description: 'Reach level 5', icon: FiStar, earned: 12 },
    { id: 4, name: 'Champion', description: 'Top 3 in leaderboard', icon: FiAward, earned: 3 },
  ];

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6} mb={8}>
        <Box>
          <Text fontSize="2xl" fontWeight="800" color="gray.900" mb={2}>
            Gamification
          </Text>
          <Text color="gray.600" fontSize="sm" fontWeight="500">
            Engage clients with points, badges, and leaderboards
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
            <CardBody p={5}>
              <HStack justify="space-between" mb={3}>
                <Box
                  w="48px"
                  h="48px"
                  bgGradient="linear(135deg, #3B82F6 0%, #2563EB 100%)"
                  borderRadius="xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiStar} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">
                {leaderboard.reduce((acc, c) => acc + c.points, 0)}
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Total Points</Text>
            </CardBody>
          </Card>

          <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
            <CardBody p={5}>
              <HStack justify="space-between" mb={3}>
                <Box
                  w="48px"
                  h="48px"
                  bgGradient="linear(135deg, #10B981 0%, #059669 100%)"
                  borderRadius="xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiAward} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">
                {achievements.reduce((acc, a) => acc + a.earned, 0)}
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Badges Earned</Text>
            </CardBody>
          </Card>

          <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
            <CardBody p={5}>
              <HStack justify="space-between" mb={3}>
                <Box
                  w="48px"
                  h="48px"
                  bgGradient="linear(135deg, #F59E0B 0%, #D97706 100%)"
                  borderRadius="xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiAward} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">{leaderboard.length}</Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Active Players</Text>
            </CardBody>
          </Card>

          <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
            <CardBody p={5}>
              <HStack justify="space-between" mb={3}>
                <Box
                  w="48px"
                  h="48px"
                  bgGradient="linear(135deg, #EC4899 0%, #DB2777 100%)"
                  borderRadius="xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiTrendingUp} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">
                {Math.max(...leaderboard.map(l => l.level))}
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Highest Level</Text>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>

      <Tabs>
        <TabList>
          <Tab fontWeight="700">Leaderboard</Tab>
          <Tab fontWeight="700">Achievements</Tab>
          <Tab fontWeight="700">Rewards</Tab>
        </TabList>

        <TabPanels>
          {/* Leaderboard */}
          <TabPanel>
            <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
              <CardBody p={0}>
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th fontWeight="700" color="gray.700">Rank</Th>
                      <Th fontWeight="700" color="gray.700">Client</Th>
                      <Th fontWeight="700" color="gray.700">Points</Th>
                      <Th fontWeight="700" color="gray.700">Level</Th>
                      <Th fontWeight="700" color="gray.700">Badges</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {leaderboard.map((player) => (
                      <Tr key={player.id} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <HStack spacing={2}>
                            {player.rank === 1 && <Icon as={FiAward} color="#F59E0B" boxSize={5} />}
                            <Text fontWeight="800" color="gray.900" fontSize="lg">
                              #{player.rank}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <HStack spacing={3}>
                            <Avatar size="sm" name={player.name} src={player.avatar} />
                            <Text fontWeight="700" color="gray.900">{player.name}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Text fontSize="lg" fontWeight="800" color="gray.900">
                            {player.points.toLocaleString()}
                          </Text>
                        </Td>
                        <Td>
                          <Badge
                            bg="#3B82F6"
                            color="white"
                            borderRadius="full"
                            px={3}
                            py={1}
                            fontSize="sm"
                            fontWeight="700"
                          >
                            Level {player.level}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <Icon as={FiAward} color="#F59E0B" boxSize={4} />
                            <Text fontSize="sm" color="gray.700" fontWeight="600">
                              {player.badges}
                            </Text>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Achievements */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              {achievements.map((achievement) => (
                <motion.div key={achievement.id} whileHover={{ scale: 1.05, y: -4 }}>
                  <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
                    <CardBody p={5} textAlign="center">
                      <Box
                        w="64px"
                        h="64px"
                        bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
                        borderRadius="xl"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        mx="auto"
                        mb={4}
                      >
                        <Icon as={achievement.icon} boxSize={8} color="white" />
                      </Box>
                      <Text fontWeight="800" color="gray.900" mb={2}>
                        {achievement.name}
                      </Text>
                      <Text fontSize="sm" color="gray.600" mb={3}>
                        {achievement.description}
                      </Text>
                      <Badge
                        bg="#10B981"
                        color="white"
                        borderRadius="full"
                        px={3}
                        py={1}
                        fontSize="xs"
                        fontWeight="700"
                      >
                        {achievement.earned} earned
                      </Badge>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </SimpleGrid>
          </TabPanel>

          {/* Rewards */}
          <TabPanel>
            <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
              <CardBody>
                <Text color="gray.600" fontSize="sm" fontWeight="500">
                  Reward system and redemption options will be displayed here...
                </Text>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Gamification;

