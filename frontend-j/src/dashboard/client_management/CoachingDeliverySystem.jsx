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
  FiVideo,
  FiFileText,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiPlay,
} from 'react-icons/fi';

const CoachingDeliverySystem = () => {
  const sessions = [
    {
      id: 1,
      client: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      type: 'Video Session',
      title: 'Weekly Check-in',
      date: '2024-03-25',
      time: '10:00 AM',
      status: 'completed',
      duration: '45 min',
    },
    {
      id: 2,
      client: 'Sarah Williams',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      type: 'Document Review',
      title: 'Progress Report Review',
      date: '2024-03-24',
      time: '2:00 PM',
      status: 'completed',
      duration: '30 min',
    },
    {
      id: 3,
      client: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      type: 'Video Session',
      title: 'Strategy Session',
      date: '2024-03-27',
      time: '11:00 AM',
      status: 'scheduled',
      duration: '60 min',
    },
  ];

  const materials = [
    { id: 1, title: 'Goal Setting Guide', type: 'PDF', downloads: 45, status: 'active' },
    { id: 2, title: 'Weekly Assessment Form', type: 'Form', submissions: 32, status: 'active' },
    { id: 3, title: 'Progress Tracking Template', type: 'Template', uses: 28, status: 'active' },
  ];

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6} mb={8}>
        <Box>
          <Text fontSize="2xl" fontWeight="800" color="gray.900" mb={2}>
            Coaching Delivery System
          </Text>
          <Text color="gray.600" fontSize="sm" fontWeight="500">
            Manage sessions, materials, and coaching resources
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
                  <Icon as={FiVideo} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">
                {sessions.filter(s => s.type === 'Video Session').length}
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Video Sessions</Text>
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
                  <Icon as={FiFileText} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">{materials.length}</Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Materials</Text>
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
                  <Icon as={FiCheckCircle} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">
                {sessions.filter(s => s.status === 'completed').length}
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Completed</Text>
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
                  <Icon as={FiClock} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">
                {sessions.filter(s => s.status === 'scheduled').length}
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Scheduled</Text>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>

      <Tabs>
        <TabList>
          <Tab fontWeight="700">Sessions</Tab>
          <Tab fontWeight="700">Materials</Tab>
          <Tab fontWeight="700">Resources</Tab>
        </TabList>

        <TabPanels>
          {/* Sessions */}
          <TabPanel>
            <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
              <CardBody p={0}>
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th fontWeight="700" color="gray.700">Client</Th>
                      <Th fontWeight="700" color="gray.700">Type</Th>
                      <Th fontWeight="700" color="gray.700">Title</Th>
                      <Th fontWeight="700" color="gray.700">Date & Time</Th>
                      <Th fontWeight="700" color="gray.700">Status</Th>
                      <Th fontWeight="700" color="gray.700">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sessions.map((session) => (
                      <Tr key={session.id} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <HStack spacing={3}>
                            <Avatar size="sm" name={session.client} src={session.avatar} />
                            <Text fontWeight="700" color="gray.900">{session.client}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge
                            bg={session.type === 'Video Session' ? '#3B82F6' : '#10B981'}
                            color="white"
                            borderRadius="full"
                            px={2.5}
                            py={1}
                            fontSize="xs"
                            fontWeight="700"
                          >
                            {session.type}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.700" fontWeight="600">{session.title}</Text>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" color="gray.700">{session.date}</Text>
                            <Text fontSize="xs" color="gray.500">{session.time}</Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge
                            bg={session.status === 'completed' ? '#10B981' : '#F59E0B'}
                            color="white"
                            borderRadius="full"
                            px={3}
                            py={1}
                            fontSize="xs"
                            fontWeight="700"
                          >
                            {session.status}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            {session.status === 'completed' ? (
                              <Button
                                leftIcon={<FiPlay />}
                                size="sm"
                                colorScheme="blue"
                                borderRadius="lg"
                              >
                                Review
                              </Button>
                            ) : (
                              <Button
                                leftIcon={<FiVideo />}
                                size="sm"
                                colorScheme="green"
                                borderRadius="lg"
                              >
                                Start
                              </Button>
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Materials */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {materials.map((material) => (
                <motion.div key={material.id} whileHover={{ scale: 1.02, y: -4 }}>
                  <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
                    <CardBody p={5}>
                      <HStack spacing={3} mb={4}>
                        <Icon as={FiFileText} boxSize={6} color="#3B82F6" />
                        <Box flex={1}>
                          <Text fontWeight="800" color="gray.900">{material.title}</Text>
                          <Badge
                            bg="#3B82F6"
                            color="white"
                            borderRadius="full"
                            px={2}
                            py={0.5}
                            fontSize="xs"
                            fontWeight="700"
                            mt={1}
                          >
                            {material.type}
                          </Badge>
                        </Box>
                      </HStack>
                      <VStack align="stretch" spacing={2} mb={4}>
                        {material.downloads && (
                          <Text fontSize="sm" color="gray.600">
                            Downloads: <strong>{material.downloads}</strong>
                          </Text>
                        )}
                        {material.submissions && (
                          <Text fontSize="sm" color="gray.600">
                            Submissions: <strong>{material.submissions}</strong>
                          </Text>
                        )}
                        {material.uses && (
                          <Text fontSize="sm" color="gray.600">
                            Uses: <strong>{material.uses}</strong>
                          </Text>
                        )}
                      </VStack>
                      <Button size="sm" colorScheme="blue" borderRadius="lg" w="full">
                        View Details
                      </Button>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </SimpleGrid>
          </TabPanel>

          {/* Resources */}
          <TabPanel>
            <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
              <CardBody>
                <Text color="gray.600" fontSize="sm" fontWeight="500">
                  Additional coaching resources will be displayed here...
                </Text>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default CoachingDeliverySystem;

