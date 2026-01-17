import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  HStack,
  VStack,
  Badge,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Avatar,
  useColorModeValue,
  Divider,
  Icon,
} from '@chakra-ui/react';
import { IoPeopleOutline, IoCalendar, IoBarChartOutline } from 'react-icons/io5';
import { FaArrowLeft, FaFire, FaClock } from 'react-icons/fa';

const sampleClients = [
  { name: 'Acme Corp', owner: 'John Doe', temperature: 'Hot', stage: 'Negotiation', lastContact: '2 days ago' },
  { name: 'Nova Labs', owner: 'Jane Smith', temperature: 'Warm', stage: 'Proposal', lastContact: '1 day ago' },
  { name: 'BrightSoft', owner: 'Mike Johnson', temperature: 'Cold', stage: 'Discovery', lastContact: '5 days ago' },
  { name: 'Skyline LLC', owner: 'Emily Davis', temperature: 'Warm', stage: 'Demo', lastContact: '3 days ago' },
];

const ClientManagementDashboard = ({ onBack }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryText = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh" p={{ base: 4, md: 6 }}>
      <Box
        bg={cardBg}
        borderRadius="xl"
        p={{ base: 4, md: 6 }}
        mb={6}
        border="1px"
        borderColor={borderColor}
        boxShadow="md"
      >
        <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <Box>
            <Heading size="lg" color={textColor}>Client Management</Heading>
            <Text color={secondaryText} mt={1}>Central view of clients, pipelines, and actions</Text>
          </Box>
          <Button leftIcon={<FaArrowLeft />} variant="outline" onClick={onBack}>
            Back to Business Dashboard
          </Button>
        </HStack>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" boxShadow="sm">
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color={secondaryText}>Active Clients</Text>
                <Heading size="md" color={textColor}>128</Heading>
                <Badge colorScheme="green" variant="subtle">+8 this week</Badge>
              </VStack>
              <Icon as={IoPeopleOutline} boxSize={8} color="blue.500" />
            </HStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" boxShadow="sm">
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color={secondaryText}>Upcoming Meetings</Text>
                <Heading size="md" color={textColor}>14</Heading>
                <Badge colorScheme="blue" variant="subtle">Next 7 days</Badge>
              </VStack>
              <Icon as={IoCalendar} boxSize={8} color="purple.500" />
            </HStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" boxShadow="sm">
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color={secondaryText}>Pipeline Value</Text>
                <Heading size="md" color={textColor}>₹ 42.5L</Heading>
                <Badge colorScheme="orange" variant="subtle">Quarter goal: ₹60L</Badge>
              </VStack>
              <Icon as={IoBarChartOutline} boxSize={8} color="orange.500" />
            </HStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" boxShadow="sm" mb={6}>
        <CardBody>
          <HStack justify="space-between" mb={4}>
            <Heading size="md" color={textColor}>Recent Clients</Heading>
            <Button size="sm" variant="outline">Add Client</Button>
          </HStack>
          <TableContainer>
            <Table variant="simple" size="md">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Owner</Th>
                  <Th>Temperature</Th>
                  <Th>Stage</Th>
                  <Th>Last Contact</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sampleClients.map((client, idx) => (
                  <Tr key={idx} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                    <Td>
                      <HStack spacing={3}>
                        <Avatar size="sm" name={client.name} />
                        <VStack spacing={0} align="start">
                          <Text fontWeight="semibold" color={textColor}>{client.name}</Text>
                          <Text fontSize="sm" color={secondaryText}>Owner: {client.owner}</Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>{client.owner}</Td>
                    <Td>
                      <Badge colorScheme={
                        client.temperature === 'Hot' ? 'red' :
                        client.temperature === 'Warm' ? 'orange' : 'blue'
                      }>
                        {client.temperature}
                      </Badge>
                    </Td>
                    <Td>{client.stage}</Td>
                    <Td>{client.lastContact}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button size="xs" variant="outline">View</Button>
                        <Button size="xs" colorScheme="blue" variant="ghost">Follow Up</Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" boxShadow="sm">
          <CardBody>
            <Heading size="md" color={textColor} mb={3}>Hot / At-risk</Heading>
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between" p={3} borderRadius="md" bg={useColorModeValue('red.50', 'red.900')}>
                <HStack>
                  <Icon as={FaFire} color="red.500" />
                  <Text color={textColor} fontWeight="semibold">5 Hot leads</Text>
                </HStack>
                <Button size="xs" variant="outline" colorScheme="red">Prioritize</Button>
              </HStack>
              <HStack justify="space-between" p={3} borderRadius="md" bg={useColorModeValue('orange.50', 'orange.900')}>
                <HStack>
                  <Icon as={FaClock} color="orange.500" />
                  <Text color={textColor} fontWeight="semibold">3 At risk (no reply)</Text>
                </HStack>
                <Button size="xs" variant="outline" colorScheme="orange">Nudge</Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" boxShadow="sm">
          <CardBody>
            <Heading size="md" color={textColor} mb={3}>Notes & Next Steps</Heading>
            <VStack align="stretch" spacing={3}>
              <Box p={3} borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')} border="1px" borderColor={borderColor}>
                <Text fontWeight="semibold" color={textColor}>Follow-ups</Text>
                <Text fontSize="sm" color={secondaryText}>Schedule QBR with top 5 clients this week.</Text>
              </Box>
              <Box p={3} borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')} border="1px" borderColor={borderColor}>
                <Text fontWeight="semibold" color={textColor}>Billing</Text>
                <Text fontSize="sm" color={secondaryText}>Pending invoices: 3 clients, due this month.</Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default ClientManagementDashboard;

