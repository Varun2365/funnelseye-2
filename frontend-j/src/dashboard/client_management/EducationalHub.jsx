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
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FiBook,
  FiVideo,
  FiFileText,
  FiDownload,
  FiPlay,
  FiBookOpen,
  FiClock,
} from 'react-icons/fi';

const EducationalHub = () => {
  const courses = [
    {
      id: 1,
      title: 'Goal Setting Fundamentals',
      type: 'Course',
      duration: '2 hours',
      lessons: 8,
      enrolled: 24,
      status: 'active',
    },
    {
      id: 2,
      title: 'Time Management Mastery',
      type: 'Course',
      duration: '1.5 hours',
      lessons: 6,
      enrolled: 18,
      status: 'active',
    },
    {
      id: 3,
      title: 'Building Healthy Habits',
      type: 'Course',
      duration: '3 hours',
      lessons: 12,
      enrolled: 32,
      status: 'active',
    },
  ];

  const resources = [
    { id: 1, title: 'Progress Tracking Guide', type: 'PDF', downloads: 45 },
    { id: 2, title: 'Weekly Planning Template', type: 'Template', downloads: 38 },
    { id: 3, title: 'Motivation Techniques', type: 'Video', views: 120 },
  ];

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6} mb={8}>
        <Box>
          <Text fontSize="2xl" fontWeight="800" color="gray.900" mb={2}>
            Educational Hub
          </Text>
          <Text color="gray.600" fontSize="sm" fontWeight="500">
            Courses, resources, and learning materials for clients
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
                  <Icon as={FiBook} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">{courses.length}</Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Active Courses</Text>
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
                  <Icon as={FiVideo} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">
                {courses.reduce((acc, c) => acc + c.lessons, 0)}
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Total Lessons</Text>
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
                  <Icon as={FiFileText} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">{resources.length}</Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Resources</Text>
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
                  <Icon as={FiBookOpen} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">
                {courses.reduce((acc, c) => acc + c.enrolled, 0)}
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Total Enrollments</Text>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>

      <Tabs>
        <TabList>
          <Tab fontWeight="700">Courses</Tab>
          <Tab fontWeight="700">Resources</Tab>
          <Tab fontWeight="700">Library</Tab>
        </TabList>

        <TabPanels>
          {/* Courses */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {courses.map((course) => (
                <motion.div key={course.id} whileHover={{ scale: 1.02, y: -4 }}>
                  <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
                    <CardBody p={5}>
                      <HStack spacing={3} mb={4}>
                        <Box
                          w="48px"
                          h="48px"
                          bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
                          borderRadius="xl"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Icon as={FiBook} boxSize={6} color="white" />
                        </Box>
                        <Box flex={1}>
                          <Text fontWeight="800" color="gray.900">{course.title}</Text>
                          <Badge
                            bg="#10B981"
                            color="white"
                            borderRadius="full"
                            px={2}
                            py={0.5}
                            fontSize="xs"
                            fontWeight="700"
                            mt={1}
                          >
                            {course.status}
                          </Badge>
                        </Box>
                      </HStack>
                      <VStack align="stretch" spacing={2} mb={4}>
                        <HStack>
                          <Icon as={FiVideo} color="gray.500" boxSize={4} />
                          <Text fontSize="sm" color="gray.600">
                            {course.lessons} lessons
                          </Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiClock} color="gray.500" boxSize={4} />
                          <Text fontSize="sm" color="gray.600">{course.duration}</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          <strong>{course.enrolled}</strong> enrolled
                        </Text>
                      </VStack>
                      <Button
                        leftIcon={<FiPlay />}
                        size="sm"
                        bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
                        color="white"
                        _hover={{ bgGradient: 'linear(135deg, #764ba2 0%, #667eea 100%)' }}
                        borderRadius="lg"
                        w="full"
                      >
                        View Course
                      </Button>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </SimpleGrid>
          </TabPanel>

          {/* Resources */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {resources.map((resource) => (
                <motion.div key={resource.id} whileHover={{ scale: 1.02, y: -4 }}>
                  <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
                    <CardBody p={5}>
                      <HStack spacing={3} mb={4}>
                        <Icon
                          as={resource.type === 'Video' ? FiVideo : FiFileText}
                          boxSize={6}
                          color="#3B82F6"
                        />
                        <Box flex={1}>
                          <Text fontWeight="800" color="gray.900">{resource.title}</Text>
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
                            {resource.type}
                          </Badge>
                        </Box>
                      </HStack>
                      <VStack align="stretch" spacing={2} mb={4}>
                        {resource.downloads && (
                          <Text fontSize="sm" color="gray.600">
                            Downloads: <strong>{resource.downloads}</strong>
                          </Text>
                        )}
                        {resource.views && (
                          <Text fontSize="sm" color="gray.600">
                            Views: <strong>{resource.views}</strong>
                          </Text>
                        )}
                      </VStack>
                      <Button
                        leftIcon={<FiDownload />}
                        size="sm"
                        colorScheme="blue"
                        borderRadius="lg"
                        w="full"
                      >
                        Download
                      </Button>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </SimpleGrid>
          </TabPanel>

          {/* Library */}
          <TabPanel>
            <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
              <CardBody>
                <Text color="gray.600" fontSize="sm" fontWeight="500">
                  Library and archived materials will be displayed here...
                </Text>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default EducationalHub;

