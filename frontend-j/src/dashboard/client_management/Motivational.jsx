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
  FiHeart,
  FiZap,
  FiTarget,
  FiTrendingUp,
  FiSend,
  FiCalendar,
} from 'react-icons/fi';

const Motivational = () => {
  const messages = [
    {
      id: 1,
      client: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      content: 'You\'re doing great! Keep pushing forward!',
      type: 'encouragement',
      sent: '2024-03-25',
      status: 'sent',
    },
    {
      id: 2,
      client: 'Sarah Williams',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      content: 'Congratulations on reaching your milestone!',
      type: 'celebration',
      sent: '2024-03-24',
      status: 'sent',
    },
    {
      id: 3,
      client: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      content: 'Remember why you started. You\'ve got this!',
      type: 'reminder',
      sent: '2024-03-23',
      status: 'sent',
    },
  ];

  const quotes = [
    { id: 1, text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', category: 'inspiration' },
    { id: 2, text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill', category: 'perseverance' },
    { id: 3, text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt', category: 'dreams' },
  ];

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6} mb={8}>
        <Box>
          <Text fontSize="2xl" fontWeight="800" color="gray.900" mb={2}>
            Motivational Tools
          </Text>
          <Text color="gray.600" fontSize="sm" fontWeight="500">
            Inspire and motivate clients with messages, quotes, and reminders
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
                  <Icon as={FiSend} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">{messages.length}</Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Messages Sent</Text>
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
                  <Icon as={FiHeart} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">{quotes.length}</Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Inspirational Quotes</Text>
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
                  <Icon as={FiZap} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">12</Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Scheduled Reminders</Text>
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
                  <Icon as={FiTarget} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">8</Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Milestone Celebrations</Text>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>

      <Tabs>
        <TabList>
          <Tab fontWeight="700">Messages</Tab>
          <Tab fontWeight="700">Quotes</Tab>
          <Tab fontWeight="700">Reminders</Tab>
        </TabList>

        <TabPanels>
          {/* Messages */}
          <TabPanel>
            <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
              <CardBody p={0}>
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th fontWeight="700" color="gray.700">Client</Th>
                      <Th fontWeight="700" color="gray.700">Message</Th>
                      <Th fontWeight="700" color="gray.700">Type</Th>
                      <Th fontWeight="700" color="gray.700">Sent</Th>
                      <Th fontWeight="700" color="gray.700">Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {messages.map((message) => (
                      <Tr key={message.id} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <HStack spacing={3}>
                            <Avatar size="sm" name={message.client} src={message.avatar} />
                            <Text fontWeight="700" color="gray.900">{message.client}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.700" maxW="300px" isTruncated>
                            {message.content}
                          </Text>
                        </Td>
                        <Td>
                          <Badge
                            bg={
                              message.type === 'encouragement' ? '#3B82F6' :
                              message.type === 'celebration' ? '#10B981' : '#F59E0B'
                            }
                            color="white"
                            borderRadius="full"
                            px={2.5}
                            py={1}
                            fontSize="xs"
                            fontWeight="700"
                          >
                            {message.type}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.600">{message.sent}</Text>
                        </Td>
                        <Td>
                          <Badge
                            bg="#10B981"
                            color="white"
                            borderRadius="full"
                            px={3}
                            py={1}
                            fontSize="xs"
                            fontWeight="700"
                          >
                            {message.status}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Quotes */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {quotes.map((quote) => (
                <motion.div key={quote.id} whileHover={{ scale: 1.02, y: -4 }}>
                  <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
                    <CardBody p={5}>
                      <Icon as={FiHeart} boxSize={6} color="#EC4899" mb={3} />
                      <Text fontSize="lg" fontWeight="600" color="gray.900" mb={3} fontStyle="italic">
                        "{quote.text}"
                      </Text>
                      <Text fontSize="sm" color="gray.600" fontWeight="600" mb={2}>
                        — {quote.author}
                      </Text>
                      <Badge
                        bg="#667eea"
                        color="white"
                        borderRadius="full"
                        px={2.5}
                        py={1}
                        fontSize="xs"
                        fontWeight="700"
                      >
                        {quote.category}
                      </Badge>
                      <Button
                        leftIcon={<FiSend />}
                        size="sm"
                        colorScheme="blue"
                        borderRadius="lg"
                        mt={3}
                        w="full"
                      >
                        Send to Client
                      </Button>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </SimpleGrid>
          </TabPanel>

          {/* Reminders */}
          <TabPanel>
            <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
              <CardBody>
                <Text color="gray.600" fontSize="sm" fontWeight="500">
                  Scheduled reminders and notifications will be displayed here...
                </Text>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Motivational;

