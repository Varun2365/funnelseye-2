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
import {
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart2,
  FiActivity,
  FiTarget,
  FiUsers,
} from 'react-icons/fi';

const ProgressAnalytics = () => {
  const analytics = [
    {
      id: 1,
      client: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      progress: 75,
      trend: 'up',
      change: 12,
      goalsCompleted: 12,
      engagement: 87,
    },
    {
      id: 2,
      client: 'Sarah Williams',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      progress: 92,
      trend: 'up',
      change: 8,
      goalsCompleted: 23,
      engagement: 95,
    },
    {
      id: 3,
      client: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      progress: 58,
      trend: 'down',
      change: -5,
      goalsCompleted: 7,
      engagement: 62,
    },
  ];

  const metrics = [
    { label: 'Average Progress', value: '75%', change: '+8%', trend: 'up' },
    { label: 'Completion Rate', value: '82%', change: '+5%', trend: 'up' },
    { label: 'Engagement Score', value: '81%', change: '+3%', trend: 'up' },
    { label: 'Active Clients', value: '24', change: '+4', trend: 'up' },
  ];

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6} mb={8}>
        <Box>
          <Text fontSize="2xl" fontWeight="800" color="gray.900" mb={2}>
            Progress Analytics
          </Text>
          <Text color="gray.600" fontSize="sm" fontWeight="500">
            Comprehensive analytics and insights on client progress
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          {metrics.map((metric, index) => (
            <Card key={index} bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
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
                    <Icon
                      as={metric.label.includes('Progress') ? FiTrendingUp : metric.label.includes('Rate') ? FiTarget : metric.label.includes('Engagement') ? FiActivity : FiUsers}
                      boxSize={6}
                      color="white"
                    />
                  </Box>
                </HStack>
                <Text fontSize="2xl" fontWeight="800" color="gray.900">
                  {metric.value}
                </Text>
                <HStack spacing={2} mt={1}>
                  <Icon
                    as={metric.trend === 'up' ? FiTrendingUp : FiTrendingDown}
                    color={metric.trend === 'up' ? '#10B981' : '#EF4444'}
                    boxSize={4}
                  />
                  <Text
                    fontSize="sm"
                    color={metric.trend === 'up' ? '#10B981' : '#EF4444'}
                    fontWeight="600"
                  >
                    {metric.change}
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.600" fontWeight="600" mt={2}>
                  {metric.label}
                </Text>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </VStack>

      <Tabs>
        <TabList>
          <Tab fontWeight="700">Client Analytics</Tab>
          <Tab fontWeight="700">Trends</Tab>
          <Tab fontWeight="700">Reports</Tab>
        </TabList>

        <TabPanels>
          {/* Client Analytics */}
          <TabPanel>
            <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
              <CardBody p={0}>
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th fontWeight="700" color="gray.700">Client</Th>
                      <Th fontWeight="700" color="gray.700">Progress</Th>
                      <Th fontWeight="700" color="gray.700">Trend</Th>
                      <Th fontWeight="700" color="gray.700">Goals</Th>
                      <Th fontWeight="700" color="gray.700">Engagement</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {analytics.map((item) => (
                      <Tr key={item.id} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <HStack spacing={3}>
                            <Avatar size="sm" name={item.client} src={item.avatar} />
                            <Text fontWeight="700" color="gray.900">{item.client}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Text fontSize="lg" fontWeight="800" color="gray.900">
                            {item.progress}%
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Icon
                              as={item.trend === 'up' ? FiTrendingUp : FiTrendingDown}
                              color={item.trend === 'up' ? '#10B981' : '#EF4444'}
                              boxSize={4}
                            />
                            <Text
                              fontSize="sm"
                              color={item.trend === 'up' ? '#10B981' : '#EF4444'}
                              fontWeight="700"
                            >
                              {item.change > 0 ? '+' : ''}{item.change}%
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.700" fontWeight="600">
                            {item.goalsCompleted} completed
                          </Text>
                        </Td>
                        <Td>
                          <Badge
                            bg={item.engagement >= 80 ? '#10B981' : item.engagement >= 60 ? '#F59E0B' : '#EF4444'}
                            color="white"
                            borderRadius="full"
                            px={3}
                            py={1}
                            fontSize="xs"
                            fontWeight="700"
                          >
                            {item.engagement}%
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Trends */}
          <TabPanel>
            <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Text color="gray.600" fontSize="sm" fontWeight="500">
                    Trend charts and visualizations will be displayed here...
                  </Text>
                  <Box h="300px" bg="gray.50" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FiBarChart2} boxSize={12} color="gray.400" />
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Reports */}
          <TabPanel>
            <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
              <CardBody>
                <Text color="gray.600" fontSize="sm" fontWeight="500">
                  Detailed reports and export options will be displayed here...
                </Text>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default ProgressAnalytics;

