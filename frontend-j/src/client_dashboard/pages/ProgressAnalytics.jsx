import React, { useState } from 'react';
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import {
  MdPhotoCamera,
  MdShare,
  MdDownload,
  MdTrendingUp,
} from 'react-icons/md';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

const ProgressAnalytics = () => {
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)');
  const { isOpen: isPhotoOpen, onOpen: onPhotoOpen, onClose: onPhotoClose } = useDisclosure();

  const progressPhotos = [
    { id: 1, date: '2024-01-15', type: 'before', label: 'Before', url: null },
    { id: 2, date: '2024-02-15', type: 'progress', label: 'Progress', url: null },
    { id: 3, date: '2024-03-15', type: 'current', label: 'Current', url: null },
  ];

  const timelineData = [
    { month: 'Jan', weight: 85, measurements: 105 },
    { month: 'Feb', weight: 83, measurements: 102 },
    { month: 'Mar', weight: 81, measurements: 98 },
  ];

  const progressReport = {
    totalWeightLost: 4,
    totalInchesLost: 7,
    workoutsCompleted: 45,
    mealsLogged: 120,
    consistency: 87,
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Box>
          <Text fontSize="3xl" fontWeight="black" color="gray.800" mb={1}>
            Progress Analytics
          </Text>
          <Text color="gray.600" fontSize="lg">
            Track your transformation journey
          </Text>
        </Box>
        <Button leftIcon={<MdPhotoCamera />} colorScheme="green" size="lg" borderRadius="xl" onClick={onPhotoOpen}>
          Add Photo
        </Button>
      </HStack>

      {/* Before/After Photo Gallery */}
      <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" mb={6}>
        <CardBody p={6}>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              Before/After Photo Gallery
            </Text>
            <HStack>
              <Button size="sm" variant="ghost" leftIcon={<MdShare />}>Share</Button>
              <Button size="sm" variant="ghost" leftIcon={<MdDownload />}>Download</Button>
            </HStack>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {progressPhotos.map((photo) => (
              <Box key={photo.id} position="relative">
                <Box
                  w="100%"
                  h="250px"
                  bg="gray.200"
                  borderRadius="xl"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  border="2px solid"
                  borderColor={photo.type === 'current' ? 'brand.400' : 'transparent'}
                  _hover={{ borderColor: 'brand.300', cursor: 'pointer' }}
                  transition="all 0.3s"
                >
                  <Icon as={MdPhotoCamera} boxSize={12} color="gray.400" mb={2} />
                  <Text fontSize="sm" color="gray.500" textTransform="capitalize" fontWeight="bold">{photo.label}</Text>
                  <Text fontSize="xs" color="gray.400" mt={1}>{photo.date}</Text>
                </Box>
                <Badge
                  position="absolute"
                  top={2}
                  right={2}
                  colorScheme={photo.type === 'before' ? 'red' : photo.type === 'progress' ? 'yellow' : 'green'}
                  borderRadius="full"
                  px={2}
                >
                  {photo.label}
                </Badge>
              </Box>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6} mb={6}>
        {/* Transformation Timeline */}
        <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
          <CardBody p={6}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
              Transformation Timeline
            </Text>
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#48BB78" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#48BB78" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="weight" stroke="#48BB78" fillOpacity={1} fill="url(#colorWeight)" name="Weight (kg)" />
                  <Line type="monotone" dataKey="measurements" stroke="#ED8936" strokeWidth={2} name="Measurements (cm)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        {/* Progress Summary */}
        <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
          <CardBody p={6}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
              Progress Summary
            </Text>
            <VStack spacing={4} align="stretch">
              <Box p={4} bg="linear-gradient(135deg, #48BB78, #38A169)" borderRadius="xl" color="white">
                <Text fontSize="xs" opacity={0.9}>Total Weight Lost</Text>
                <Text fontSize="3xl" fontWeight="black">{progressReport.totalWeightLost} kg</Text>
              </Box>
              <Box p={4} bg="linear-gradient(135deg, #ED8936, #DD6B20)" borderRadius="xl" color="white">
                <Text fontSize="xs" opacity={0.9}>Total Inches Lost</Text>
                <Text fontSize="3xl" fontWeight="black">{progressReport.totalInchesLost}"</Text>
              </Box>
              <Box p={4} bg="gray.50" borderRadius="xl">
                <Text fontSize="xs" color="gray.500">Workouts Completed</Text>
                <Text fontSize="2xl" fontWeight="bold">{progressReport.workoutsCompleted}</Text>
              </Box>
              <Box p={4} bg="gray.50" borderRadius="xl">
                <Text fontSize="xs" color="gray.500">Meals Logged</Text>
                <Text fontSize="2xl" fontWeight="bold">{progressReport.mealsLogged}</Text>
              </Box>
              <Box p={4} bg="gray.50" borderRadius="xl">
                <Text fontSize="xs" color="gray.500">Consistency Score</Text>
                <Text fontSize="2xl" fontWeight="bold">{progressReport.consistency}%</Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Progress Reports */}
      <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
        <CardBody p={6}>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              Progress Reports
            </Text>
            <Button size="sm" leftIcon={<MdDownload />} colorScheme="blue" borderRadius="xl">Generate Report</Button>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {[
              { name: 'Weekly Report', date: '2024-03-18', type: 'Weekly' },
              { name: 'Monthly Report', date: '2024-03-01', type: 'Monthly' },
              { name: 'Custom Report', date: '2024-02-15', type: 'Custom' },
            ].map((report, idx) => (
              <Box key={idx} p={4} bg="gray.50" borderRadius="xl">
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="bold">{report.name}</Text>
                  <Badge colorScheme="blue" borderRadius="full" fontSize="xs">{report.type}</Badge>
                </HStack>
                <Text fontSize="xs" color="gray.500" mb={3}>{report.date}</Text>
                <Button size="sm" colorScheme="blue" w="full" borderRadius="xl" leftIcon={<MdDownload />}>Download</Button>
              </Box>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Photo Upload Modal */}
      <Modal isOpen={isPhotoOpen} onClose={onPhotoClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Add Progress Photo</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box w="100%" h="200px" bg="gray.100" borderRadius="xl" display="flex" alignItems="center" justifyContent="center" border="2px dashed" borderColor="gray.300">
                <VStack>
                  <Icon as={MdPhotoCamera} boxSize={10} color="gray.400" />
                  <Text fontSize="sm" color="gray.500">Click to upload or drag and drop</Text>
                </VStack>
              </Box>
              <Button colorScheme="green" w="full" borderRadius="xl">Upload Photo</Button>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPhotoClose}>Cancel</Button>
            <Button colorScheme="green" onClick={onPhotoClose} borderRadius="xl">Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProgressAnalytics;

