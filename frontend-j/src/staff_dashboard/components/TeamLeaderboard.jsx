import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Text,
  Button,
  Icon,
  HStack,
  VStack,
  Badge,
  Progress,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Tooltip,
  Wrap,
  WrapItem,
  Divider,
  Heading,
  Flex,
  Spacer,
  Avatar,
  AvatarGroup,
  AvatarBadge,
  useBreakpointValue,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
  Checkbox,
  CheckboxGroup,
  Stack,
  Tag,
  TagLabel,
  TagCloseButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useToast,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import {
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiTrendingUp,
  FiTarget,
  FiCalendar,
  FiBell,
  FiBarChart,
  FiActivity,
  FiAward,
  FiStar,
  FiRefreshCw,
  FiDownload,
  FiSettings,
  FiEye,
  FiPlus,
  FiFilter,
  FiSearch,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiAlertCircle,
  FiInfo,
  FiThumbsUp,
  FiThumbsDown,
  FiMessageCircle,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiZap,
  FiShield,
  FiLock,
  FiUnlock,
  FiHeart,
  FiBookmark,
  FiShare,
  FiCopy,
  FiExternalLink,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiChevronLeft,
  FiHome,
  FiMenu,
  FiX,
  FiMinus,
  FiPlusCircle,
  FiMinusCircle,
  FiCheck,
  FiX as FiXIcon,
  FiLoader,
  FiAlertTriangle,
  FiCheckSquare,
  FiSquare,
  FiCircle,
  FiRadio,
  FiToggleLeft,
  FiToggleRight,
  FiSun,
  FiMoon,
  FiMaximize,
  FiMinimize,
  FiWifi,
  FiPlay,
  FiPause,
  FiEdit3,
  FiSave,
  FiXCircle,
  FiUsers as FiUsersIcon,
  FiTrendingUp as FiTrendingUpIcon,
  FiTarget as FiTargetIcon,
  FiAward as FiAwardIcon,
  FiBarChart as FiBarChartIcon,
} from 'react-icons/fi';
import { performanceAPI } from '../../services/staffDashboardAPI';

const TeamLeaderboard = ({ data }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  
  const { isOpen: isMemberModalOpen, onOpen: onMemberModalOpen, onClose: onMemberModalClose } = useDisclosure();
  const toast = useToast();

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  // Mock data fallback
  const mockData = useMemo(() => ({
    leaderboard: [
      {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://bit.ly/dan-abramov',
        score: 95,
        rank: 1,
        metrics: {
          tasksCompleted: 45,
          leadsConverted: 12,
          performanceScore: 95,
          responseTime: '2.3s',
          customerRating: 4.8
        },
        achievements: ['Top Performer', 'Customer Champion'],
        department: 'Sales',
        joinDate: '2023-01-15'
      },
      {
        _id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatar: 'https://bit.ly/kent-c-dodds',
        score: 88,
        rank: 2,
        metrics: {
          tasksCompleted: 42,
          leadsConverted: 10,
          performanceScore: 88,
          responseTime: '2.8s',
          customerRating: 4.6
        },
        achievements: ['Rising Star', 'Team Player'],
        department: 'Sales',
        joinDate: '2023-02-20'
      },
      {
        _id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        avatar: 'https://bit.ly/ryan-florence',
        score: 82,
        rank: 3,
        metrics: {
          tasksCompleted: 38,
          leadsConverted: 8,
          performanceScore: 82,
          responseTime: '3.1s',
          customerRating: 4.4
        },
        achievements: ['Consistent Performer'],
        department: 'Support',
        joinDate: '2023-03-10'
      }
    ],
    stats: {
      totalMembers: 25,
      averageScore: 78,
      topPerformer: 'John Doe',
      improvementRate: 12
    }
  }), []);

  const currentData = data || mockData;

  useEffect(() => {
    if (currentData?.leaderboard) {
      setLeaderboardData(currentData.leaderboard);
    }
  }, [currentData]);

  // Get rank icon
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return FiStar;
      case 2: return FiAward;
      case 3: return FiTarget;
      default: return FiAward;
    }
  };

  // Get rank color
  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'yellow';
      case 2: return 'gray';
      case 3: return 'orange';
      default: return 'blue';
    }
  };

  // Get performance color
  const getPerformanceColor = (score) => {
    if (score >= 90) return 'green';
    if (score >= 80) return 'blue';
    if (score >= 70) return 'yellow';
    return 'red';
  };

  const filteredMembers = useMemo(() => {
    let filtered = leaderboardData;
    
    if (filter !== 'all') {
      filtered = filtered.filter(member => member.department === filter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [leaderboardData, filter, searchTerm]);

  const handleViewMember = (member) => {
    setSelectedMember(member);
    onMemberModalOpen();
  };

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="7xl" py={6}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading size="xl" fontWeight="600" color={textColor} mb={2} lineHeight="1.2">
              Team Leaderboard
            </Heading>
            <Text fontSize="md" color={secondaryTextColor} lineHeight="1.5">
              Track team performance and achievements
            </Text>
          </Box>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
              <CardBody p={6}>
                <Stat>
                  <StatLabel color={mutedTextColor}>Total Members</StatLabel>
                  <StatNumber color={textColor}>{currentData.stats?.totalMembers || 0}</StatNumber>
                  <StatHelpText>
                    Active team
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
              <CardBody p={6}>
                <Stat>
                  <StatLabel color={mutedTextColor}>Average Score</StatLabel>
                  <StatNumber color={textColor}>{currentData.stats?.averageScore || 0}</StatNumber>
                  <StatHelpText>
                    Team average
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
              <CardBody p={6}>
                <Stat>
                  <StatLabel color={mutedTextColor}>Top Performer</StatLabel>
                  <StatNumber color={textColor} fontSize="lg">{currentData.stats?.topPerformer || 'N/A'}</StatNumber>
                  <StatHelpText>
                    This month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
              <CardBody p={6}>
                <Stat>
                  <StatLabel color={mutedTextColor}>Improvement Rate</StatLabel>
                  <StatNumber color={textColor}>{currentData.stats?.improvementRate || 0}%</StatNumber>
                  <StatHelpText>
                    This quarter
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Top Performers */}
          <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Heading size="md" color={textColor}>Top Performers</Heading>
                <HStack spacing={2}>
                  <Button size="sm" leftIcon={<FiRefreshCw />} variant="outline">
                    Refresh
                  </Button>
                  <Button size="sm" leftIcon={<FiDownload />} variant="outline">
                    Export
                  </Button>
                </HStack>
              </Flex>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {leaderboardData.slice(0, 3).map((member, index) => (
                  <Card key={member._id} variant="outline" p={4} _hover={{ bg: hoverBg }}>
                    <HStack justify="space-between" align="center">
                      <HStack spacing={4}>
                        <VStack spacing={1}>
                          <Badge
                            colorScheme={getRankColor(member.rank)}
                            size="lg"
                            borderRadius="full"
                            px={3}
                            py={1}
                          >
                            #{member.rank}
                          </Badge>
                          <Icon as={getRankIcon(member.rank)} boxSize={4} color={`${getRankColor(member.rank)}.500`} />
                        </VStack>
                        
                        <Avatar size="md" src={member.avatar} name={member.name} />
                        
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="500" color={textColor}>{member.name}</Text>
                          <Text fontSize="sm" color={secondaryTextColor}>{member.department}</Text>
                        </VStack>
                      </HStack>
                      
                      <VStack spacing={2} align="end">
                        <CircularProgress value={member.score} color="blue.500" size="60px" thickness="6px">
                          <CircularProgressLabel fontSize="lg" fontWeight="bold">
                            {member.score}
                          </CircularProgressLabel>
                        </CircularProgress>
                        
                        <VStack spacing={0} align="end">
                          <Text fontSize="xs" color={mutedTextColor}>
                            {member.metrics.tasksCompleted} tasks
                          </Text>
                          <Text fontSize="xs" color={mutedTextColor}>
                            {member.metrics.leadsConverted} leads
                          </Text>
                        </VStack>
                      </VStack>
                    </HStack>
                  </Card>
                ))}
              </VStack>
            </CardBody>
          </Card>

          {/* Full Leaderboard */}
          <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Heading size="md" color={textColor}>Full Leaderboard</Heading>
                <HStack spacing={2}>
                  <Button size="sm" leftIcon={<FiPlus />} colorScheme="blue">
                    Add Member
                  </Button>
                  <Button size="sm" leftIcon={<FiRefreshCw />} variant="outline">
                    Refresh
                  </Button>
                </HStack>
              </Flex>
            </CardHeader>
            <CardBody>
              {/* Filters */}
              <HStack spacing={4} mb={4}>
                <InputGroup maxW="300px">
                  <InputLeftElement>
                    <Icon as={FiSearch} color={mutedTextColor} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
                <Select maxW="150px" value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="all">All Departments</option>
                  <option value="Sales">Sales</option>
                  <option value="Support">Support</option>
                  <option value="Marketing">Marketing</option>
                </Select>
              </HStack>

              {/* Leaderboard Table */}
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th color={mutedTextColor}>Rank</Th>
                      <Th color={mutedTextColor}>Member</Th>
                      <Th color={mutedTextColor}>Score</Th>
                      <Th color={mutedTextColor}>Tasks</Th>
                      <Th color={mutedTextColor}>Leads</Th>
                      <Th color={mutedTextColor}>Rating</Th>
                      <Th color={mutedTextColor}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredMembers.map((member) => (
                      <Tr key={member._id}>
                        <Td>
                          <HStack spacing={2}>
                            <Badge colorScheme={getRankColor(member.rank)}>
                              #{member.rank}
                            </Badge>
                            <Icon as={getRankIcon(member.rank)} boxSize={4} color={`${getRankColor(member.rank)}.500`} />
                          </HStack>
                        </Td>
                        <Td>
                          <HStack spacing={3}>
                            <Avatar size="sm" src={member.avatar} name={member.name} />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="500" color={textColor}>{member.name}</Text>
                              <Text fontSize="sm" color={secondaryTextColor}>{member.department}</Text>
                            </VStack>
                          </HStack>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <CircularProgress value={member.score} color="blue.500" size="40px" thickness="4px">
                              <CircularProgressLabel fontSize="sm" fontWeight="bold">
                                {member.score}
                              </CircularProgressLabel>
                            </CircularProgress>
                          </HStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color={textColor}>{member.metrics.tasksCompleted}</Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color={textColor}>{member.metrics.leadsConverted}</Text>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <Icon as={FiStar} color="yellow.400" />
                            <Text fontSize="sm" color={textColor}>{member.metrics.customerRating}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <Tooltip label="View Details">
                              <IconButton
                                size="sm"
                                icon={<FiEye />}
                                variant="ghost"
                                onClick={() => handleViewMember(member)}
                              />
                            </Tooltip>
                            <Tooltip label="Send Message">
                              <IconButton
                                size="sm"
                                icon={<FiMessageCircle />}
                                variant="ghost"
                                colorScheme="blue"
                              />
                            </Tooltip>
                            <Menu>
                              <MenuButton as={IconButton} size="sm" icon={<FiMoreVertical />} variant="ghost" />
                              <MenuList>
                                <MenuItem icon={<FiUser />}>View Profile</MenuItem>
                                <MenuItem icon={<FiMessageCircle />}>Send Message</MenuItem>
                                <MenuItem icon={<FiBarChart />}>View Performance</MenuItem>
                                <MenuDivider />
                                <MenuItem icon={<FiShare />}>Share Achievement</MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              {filteredMembers.length === 0 && (
                <Center py={8}>
                  <VStack spacing={2}>
                    <Icon as={FiUsers} boxSize={8} color={mutedTextColor} />
                    <Text color={mutedTextColor}>No members found</Text>
                  </VStack>
                </Center>
              )}
            </CardBody>
          </Card>

          {/* Performance Charts */}
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
            <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
              <CardHeader>
                <Heading size="sm" color={textColor}>Score Distribution</Heading>
              </CardHeader>
              <CardBody>
                <Center py={8}>
                  <VStack spacing={2}>
                    <Icon as={FiBarChartIcon} boxSize={8} color={mutedTextColor} />
                    <Text fontSize="sm" color={mutedTextColor}>
                      Chart visualization would go here
                    </Text>
                  </VStack>
                </Center>
              </CardBody>
            </Card>

            <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
              <CardHeader>
                <Heading size="sm" color={textColor}>Department Performance</Heading>
              </CardHeader>
              <CardBody>
                <Center py={8}>
                  <VStack spacing={2}>
                    <Icon as={FiBarChartIcon} boxSize={8} color={mutedTextColor} />
                    <Text fontSize="sm" color={mutedTextColor}>
                      Chart visualization would go here
                    </Text>
                  </VStack>
                </Center>
              </CardBody>
            </Card>

            <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
              <CardHeader>
                <Heading size="sm" color={textColor}>Trend Analysis</Heading>
              </CardHeader>
              <CardBody>
                <Center py={8}>
                  <VStack spacing={2}>
                    <Icon as={FiBarChartIcon} boxSize={8} color={mutedTextColor} />
                    <Text fontSize="sm" color={mutedTextColor}>
                      Chart visualization would go here
                    </Text>
                  </VStack>
                </Center>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Member Details Modal */}
      <Modal isOpen={isMemberModalOpen} onClose={onMemberModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedMember?.name} - Performance Details
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedMember && (
              <VStack spacing={4} align="stretch">
                <HStack spacing={4}>
                  <Avatar size="lg" src={selectedMember.avatar} name={selectedMember.name} />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="500" color={textColor} fontSize="lg">{selectedMember.name}</Text>
                    <Text fontSize="sm" color={secondaryTextColor}>{selectedMember.department}</Text>
                    <Text fontSize="sm" color={mutedTextColor}>Joined: {selectedMember.joinDate}</Text>
                  </VStack>
                </HStack>

                <Divider />

                <SimpleGrid columns={2} spacing={4}>
                  <Stat>
                    <StatLabel color={mutedTextColor}>Performance Score</StatLabel>
                    <StatNumber color={textColor}>{selectedMember.score}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel color={mutedTextColor}>Tasks Completed</StatLabel>
                    <StatNumber color={textColor}>{selectedMember.metrics.tasksCompleted}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel color={mutedTextColor}>Leads Converted</StatLabel>
                    <StatNumber color={textColor}>{selectedMember.metrics.leadsConverted}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel color={mutedTextColor}>Customer Rating</StatLabel>
                    <StatNumber color={textColor}>{selectedMember.metrics.customerRating}</StatNumber>
                  </Stat>
                </SimpleGrid>

                <Box>
                  <Text fontWeight="500" color={textColor} mb={2}>Achievements</Text>
                  <Wrap>
                    {selectedMember.achievements.map((achievement, index) => (
                      <WrapItem key={index}>
                        <Tag colorScheme="blue">
                          <TagLabel>{achievement}</TagLabel>
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onMemberModalClose}>
              Close
            </Button>
            <Button colorScheme="blue">
              Send Message
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TeamLeaderboard;