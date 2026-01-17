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
  Input,
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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Textarea,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FiMessageCircle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiSend,
  FiVideo,
  FiPhone,
  FiMail,
  FiUser,
  FiTrendingUp,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const Communication = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedClient, setSelectedClient] = useState(null);

  const clients = [
    {
      id: 1,
      name: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      email: 'alex@example.com',
      phone: '+1 234-567-8900',
      status: 'active',
      lastMessage: '2 hours ago',
      unread: 2,
      appointments: 3,
    },
    {
      id: 2,
      name: 'Sarah Williams',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      email: 'sarah@example.com',
      phone: '+1 234-567-8901',
      status: 'active',
      lastMessage: '1 day ago',
      unread: 0,
      appointments: 2,
    },
    {
      id: 3,
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      email: 'mike@example.com',
      phone: '+1 234-567-8902',
      status: 'active',
      lastMessage: '3 hours ago',
      unread: 1,
      appointments: 1,
    },
  ];

  const appointments = [
    {
      id: 1,
      client: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      type: 'Progress Review',
      date: '2024-03-25',
      time: '10:00 AM',
      status: 'confirmed',
    },
    {
      id: 2,
      client: 'Sarah Williams',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      type: 'Consultation',
      date: '2024-03-26',
      time: '2:00 PM',
      status: 'pending',
    },
    {
      id: 3,
      client: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      type: 'Check-in',
      date: '2024-03-27',
      time: '11:00 AM',
      status: 'confirmed',
    },
  ];

  const checkIns = [
    { id: 1, client: 'Alex Johnson', date: '2024-03-20', status: 'completed', adherence: 87 },
    { id: 2, client: 'Sarah Williams', date: '2024-03-19', status: 'completed', adherence: 92 },
    { id: 3, client: 'Mike Chen', date: '2024-03-18', status: 'missed', adherence: 0 },
  ];

  const handleChat = (client) => {
    setSelectedClient(client);
    onOpen();
  };

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6} mb={8}>
        <Box>
          <Text fontSize="2xl" fontWeight="800" color="gray.900" mb={2}>
            Communication Tools
          </Text>
          <Text color="gray.600" fontSize="sm" fontWeight="500">
            Manage messages, appointments, and client check-ins
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
                  <Icon as={FiMessageCircle} boxSize={6} color="white" />
                </Box>
                <Badge bg="#EF4444" color="white" borderRadius="full" px={2.5} py={1} fontSize="xs" fontWeight="700">
                  3
                </Badge>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">12</Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Total Messages</Text>
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
                  <Icon as={FiCalendar} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">{appointments.length}</Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Upcoming Appointments</Text>
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
              <Text fontSize="2xl" fontWeight="800" color="gray.900">{checkIns.filter(c => c.status === 'completed').length}</Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Completed Check-ins</Text>
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
                  <Icon as={FaWhatsapp} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">8</Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">WhatsApp Messages</Text>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>

      <Tabs>
        <TabList>
          <Tab fontWeight="700">Messages</Tab>
          <Tab fontWeight="700">Appointments</Tab>
          <Tab fontWeight="700">Check-ins</Tab>
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
                      <Th fontWeight="700" color="gray.700">Last Message</Th>
                      <Th fontWeight="700" color="gray.700">Unread</Th>
                      <Th fontWeight="700" color="gray.700">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {clients.map((client) => (
                      <Tr key={client.id} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <HStack spacing={3}>
                            <Avatar size="sm" name={client.name} src={client.avatar} />
                            <Box>
                              <Text fontWeight="700" color="gray.900">{client.name}</Text>
                              <Text fontSize="xs" color="gray.500">{client.email}</Text>
                            </Box>
                          </HStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.600">{client.lastMessage}</Text>
                        </Td>
                        <Td>
                          {client.unread > 0 ? (
                            <Badge bg="#EF4444" color="white" borderRadius="full" px={2.5} py={1} fontSize="xs" fontWeight="700">
                              {client.unread}
                            </Badge>
                          ) : (
                            <Text fontSize="sm" color="gray.400">-</Text>
                          )}
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              leftIcon={<FiMessageCircle />}
                              size="sm"
                              colorScheme="blue"
                              onClick={() => handleChat(client)}
                              borderRadius="lg"
                            >
                              Chat
                            </Button>
                            <Button
                              leftIcon={<FaWhatsapp />}
                              size="sm"
                              variant="outline"
                              colorScheme="green"
                              borderRadius="lg"
                            >
                              WhatsApp
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Appointments */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {appointments.map((appointment) => (
                <motion.div key={appointment.id} whileHover={{ scale: 1.02, y: -4 }}>
                  <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
                    <CardBody p={5}>
                      <HStack spacing={3} mb={4}>
                        <Avatar size="md" name={appointment.client} src={appointment.avatar} />
                        <Box flex={1}>
                          <Text fontWeight="800" color="gray.900">{appointment.client}</Text>
                          <Text fontSize="sm" color="gray.600">{appointment.type}</Text>
                        </Box>
                      </HStack>
                      <VStack align="stretch" spacing={2} mb={4}>
                        <HStack>
                          <Icon as={FiCalendar} color="gray.500" boxSize={4} />
                          <Text fontSize="sm" color="gray.700">{appointment.date}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiClock} color="gray.500" boxSize={4} />
                          <Text fontSize="sm" color="gray.700">{appointment.time}</Text>
                        </HStack>
                      </VStack>
                      <Badge
                        bg={appointment.status === 'confirmed' ? '#10B981' : '#F59E0B'}
                        color="white"
                        borderRadius="full"
                        px={3}
                        py={1}
                        fontSize="xs"
                        fontWeight="700"
                        mb={3}
                      >
                        {appointment.status}
                      </Badge>
                      <HStack spacing={2}>
                        <Button size="sm" leftIcon={<FiVideo />} flex={1} borderRadius="lg">
                          Join
                        </Button>
                        <Button size="sm" variant="outline" flex={1} borderRadius="lg">
                          Reschedule
                        </Button>
                      </HStack>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </SimpleGrid>
          </TabPanel>

          {/* Check-ins */}
          <TabPanel>
            <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
              <CardBody p={0}>
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th fontWeight="700" color="gray.700">Client</Th>
                      <Th fontWeight="700" color="gray.700">Date</Th>
                      <Th fontWeight="700" color="gray.700">Status</Th>
                      <Th fontWeight="700" color="gray.700">Adherence</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {checkIns.map((checkIn) => (
                      <Tr key={checkIn.id} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <Text fontWeight="700" color="gray.900">{checkIn.client}</Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.600">{checkIn.date}</Text>
                        </Td>
                        <Td>
                          <Badge
                            bg={checkIn.status === 'completed' ? '#10B981' : '#EF4444'}
                            color="white"
                            borderRadius="full"
                            px={3}
                            py={1}
                            fontSize="xs"
                            fontWeight="700"
                          >
                            {checkIn.status}
                          </Badge>
                        </Td>
                        <Td>
                          {checkIn.status === 'completed' ? (
                            <Text fontWeight="700" color="gray.900">{checkIn.adherence}%</Text>
                          ) : (
                            <Text fontSize="sm" color="gray.400">-</Text>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Chat Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>
            <HStack spacing={3}>
              <Avatar size="sm" name={selectedClient?.name} src={selectedClient?.avatar} />
              <Text fontSize="lg" fontWeight="800">{selectedClient?.name}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={4}>
              <Box h="300px" bg="gray.50" borderRadius="xl" p={4} overflowY="auto">
                <Text color="gray.600" fontSize="sm">Message history will appear here...</Text>
              </Box>
              <HStack>
                <Textarea
                  placeholder="Type your message..."
                  borderRadius="xl"
                  border="2px solid"
                  borderColor="gray.200"
                  _focus={{ borderColor: '#667eea' }}
                />
                <Button
                  leftIcon={<FiSend />}
                  bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
                  color="white"
                  _hover={{ bgGradient: 'linear(135deg, #764ba2 0%, #667eea 100%)' }}
                  borderRadius="xl"
                  h="full"
                >
                  Send
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Communication;

