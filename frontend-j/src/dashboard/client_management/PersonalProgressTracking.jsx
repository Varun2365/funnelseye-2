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
  Progress,
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
  FiTrendingUp,
  FiTarget,
  FiCheckCircle,
  FiBarChart2,
  FiCalendar,
  FiAward,
} from 'react-icons/fi';

const PersonalProgressTracking = () => {
  const clients = [
    {
      id: 1,
      name: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      overallProgress: 75,
      goalsCompleted: 12,
      totalGoals: 16,
      streak: 8,
      lastActivity: '2 hours ago',
    },
    {
      id: 2,
      name: 'Sarah Williams',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      overallProgress: 92,
      goalsCompleted: 23,
      totalGoals: 25,
      streak: 15,
      lastActivity: '1 day ago',
    },
    {
      id: 3,
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      overallProgress: 58,
      goalsCompleted: 7,
      totalGoals: 12,
      streak: 3,
      lastActivity: '3 hours ago',
    },
  ];

  const milestones = [
    { id: 1, client: 'Alex Johnson', milestone: 'First Week Complete', date: '2024-03-20', status: 'achieved' },
    { id: 2, client: 'Sarah Williams', milestone: 'Month 1 Milestone', date: '2024-03-15', status: 'achieved' },
    { id: 3, client: 'Mike Chen', milestone: 'Initial Assessment', date: '2024-03-25', status: 'pending' },
  ];

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6} mb={8}>
        <Box>
          <Text fontSize="2xl" fontWeight="800" color="gray.900" mb={2}>
            Personal Progress Tracking
          </Text>
          <Text color="gray.600" fontSize="sm" fontWeight="500">
            Monitor client progress, goals, and achievements
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
                  <Icon as={FiTrendingUp} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">
                {clients.reduce((acc, c) => acc + c.overallProgress, 0) / clients.length}%
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Average Progress</Text>
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
                  <Icon as={FiTarget} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">
                {clients.reduce((acc, c) => acc + c.goalsCompleted, 0)}
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Goals Completed</Text>
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
              <Text fontSize="2xl" fontWeight="800" color="gray.900">
                {Math.max(...clients.map(c => c.streak))}
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Longest Streak</Text>
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
                  <Icon as={FiCheckCircle} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">{milestones.length}</Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Total Milestones</Text>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>

      <Tabs>
        <TabList>
          <Tab fontWeight="700">Client Progress</Tab>
          <Tab fontWeight="700">Milestones</Tab>
          <Tab fontWeight="700">Goals</Tab>
        </TabList>

        <TabPanels>
          {/* Client Progress */}
          <TabPanel>
            <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
              <CardBody p={0}>
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th fontWeight="700" color="gray.700">Client</Th>
                      <Th fontWeight="700" color="gray.700">Progress</Th>
                      <Th fontWeight="700" color="gray.700">Goals</Th>
                      <Th fontWeight="700" color="gray.700">Streak</Th>
                      <Th fontWeight="700" color="gray.700">Last Activity</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {clients.map((client) => (
                      <Tr key={client.id} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <HStack spacing={3}>
                            <Avatar size="sm" name={client.name} src={client.avatar} />
                            <Text fontWeight="700" color="gray.900">{client.name}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <VStack align="stretch" spacing={1}>
                            <Progress
                              value={client.overallProgress}
                              colorScheme="blue"
                              borderRadius="full"
                              size="sm"
                            />
                            <Text fontSize="xs" color="gray.600" fontWeight="600">
                              {client.overallProgress}%
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.700" fontWeight="600">
                            {client.goalsCompleted}/{client.totalGoals}
                          </Text>
                        </Td>
                        <Td>
                          <Badge
                            bg="#F59E0B"
                            color="white"
                            borderRadius="full"
                            px={2.5}
                            py={1}
                            fontSize="xs"
                            fontWeight="700"
                          >
                            {client.streak} days
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.600">{client.lastActivity}</Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Milestones */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {milestones.map((milestone) => (
                <motion.div key={milestone.id} whileHover={{ scale: 1.02, y: -4 }}>
                  <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
                    <CardBody p={5}>
                      <HStack spacing={3} mb={4}>
                        <Icon
                          as={FiAward}
                          boxSize={6}
                          color={milestone.status === 'achieved' ? '#10B981' : '#F59E0B'}
                        />
                        <Box flex={1}>
                          <Text fontWeight="800" color="gray.900" fontSize="sm">
                            {milestone.client}
                          </Text>
                          <Text fontSize="xs" color="gray.600">{milestone.milestone}</Text>
                        </Box>
                      </HStack>
                      <HStack mb={3}>
                        <Icon as={FiCalendar} color="gray.500" boxSize={4} />
                        <Text fontSize="sm" color="gray.700">{milestone.date}</Text>
                      </HStack>
                      <Badge
                        bg={milestone.status === 'achieved' ? '#10B981' : '#F59E0B'}
                        color="white"
                        borderRadius="full"
                        px={3}
                        py={1}
                        fontSize="xs"
                        fontWeight="700"
                      >
                        {milestone.status}
                      </Badge>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </SimpleGrid>
          </TabPanel>

          {/* Goals */}
          <TabPanel>
            <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
              <CardBody>
                <Text color="gray.600" fontSize="sm" fontWeight="500">
                  Goal tracking and management will be displayed here...
                </Text>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default PersonalProgressTracking;

