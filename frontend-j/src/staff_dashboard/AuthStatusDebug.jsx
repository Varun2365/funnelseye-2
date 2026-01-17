import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  useColorModeValue,
  Badge,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex,
  Icon,
} from '@chakra-ui/react';
import {
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiShield,
  FiUser,
  FiKey,
  FiDatabase,
} from 'react-icons/fi';

const AuthStatusDebug = () => {
  const toast = useToast();
  
  const { 
    staffData, 
    staffId,
    coachId,
    token,
    isAuthenticated
  } = useSelector(state => state.staff || {});
  
  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');
  const successColor = useColorModeValue('green.500', 'green.300');
  const errorColor = useColorModeValue('red.500', 'red.300');
  const warningColor = useColorModeValue('yellow.500', 'yellow.300');
  
  // State management
  const [authData, setAuthData] = useState({});
  const [localStorageData, setLocalStorageData] = useState({});

  // Get authentication data from localStorage
  const getLocalStorageData = () => {
    const data = {
      staffToken: localStorage.getItem('staffToken'),
      staffId: localStorage.getItem('staffId'),
      coachId: localStorage.getItem('coachId'),
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user'),
      persistRoot: localStorage.getItem('persist:root'),
    };
    
    // Parse JSON data
    try {
      if (data.user) {
        data.userParsed = JSON.parse(data.user);
      }
      if (data.persistRoot) {
        data.persistRootParsed = JSON.parse(data.persistRoot);
      }
    } catch (error) {
      console.error('Error parsing localStorage data:', error);
    }
    
    return data;
  };

  // Refresh authentication data
  const refreshAuthData = () => {
    const localData = getLocalStorageData();
    setLocalStorageData(localData);
    
    // Check authentication status
    const hasToken = !!(localData.staffToken || localData.token);
    const hasStaffId = !!localData.staffId;
    const hasCoachId = !!localData.coachId;
    
    setAuthData({
      hasToken,
      hasStaffId,
      hasCoachId,
      isComplete: hasToken && hasStaffId,
      tokenLength: (localData.staffToken || localData.token || '').length,
      staffIdLength: (localData.staffId || '').length,
      coachIdLength: (localData.coachId || '').length,
    });
    
    toast({
      title: 'Authentication Data Refreshed',
      description: `Token: ${hasToken ? 'Present' : 'Missing'} | Staff ID: ${hasStaffId ? 'Present' : 'Missing'}`,
      status: hasToken && hasStaffId ? 'success' : 'warning',
      duration: 3000,
      isClosable: true,
    });
  };

  // Initial load
  useEffect(() => {
    refreshAuthData();
  }, []);

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case true:
        return <Icon as={FiCheckCircle} color={successColor} boxSize={5} />;
      case false:
        return <Icon as={FiXCircle} color={errorColor} boxSize={5} />;
      default:
        return <Icon as={FiAlertCircle} color={warningColor} boxSize={5} />;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case true:
        return <Badge colorScheme="green" variant="subtle">Present</Badge>;
      case false:
        return <Badge colorScheme="red" variant="subtle">Missing</Badge>;
      default:
        return <Badge colorScheme="yellow" variant="subtle">Unknown</Badge>;
    }
  };

  return (
    <Box bg={bgColor} minH="100vh" p={6}>
      {/* Header */}
      <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor} mb={6}>
        <CardHeader>
          <Flex justifyContent="space-between" alignItems="center">
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                Authentication Status Debug
              </Text>
              <Text color={secondaryTextColor}>
                Detailed authentication data analysis
              </Text>
            </Box>
            <Button
              leftIcon={<FiRefreshCw />}
              colorScheme="blue"
              onClick={refreshAuthData}
            >
              Refresh Data
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          {/* Overall Status */}
          <Alert status={authData.isComplete ? 'success' : 'error'} mb={4}>
            <AlertIcon />
            <Box>
              <AlertTitle>
                Authentication Status: {authData.isComplete ? 'Complete' : 'Incomplete'}
              </AlertTitle>
              <AlertDescription>
                Token: {authData.hasToken ? 'Present' : 'Missing'} | 
                Staff ID: {authData.hasStaffId ? 'Present' : 'Missing'} | 
                Coach ID: {authData.hasCoachId ? 'Present' : 'Missing'}
              </AlertDescription>
            </Box>
          </Alert>

          {/* Quick Stats */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Stat textAlign="center" p={4} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="lg">
              <StatLabel fontSize="sm" color={useColorModeValue('blue.700', 'blue.300')}>Token Status</StatLabel>
              <StatNumber fontSize="2xl" color={useColorModeValue('blue.800', 'blue.200')}>
                {authData.hasToken ? '✅' : '❌'}
              </StatNumber>
              <StatHelpText>
                Length: {authData.tokenLength} chars
              </StatHelpText>
            </Stat>
            
            <Stat textAlign="center" p={4} bg={useColorModeValue('green.50', 'green.900')} borderRadius="lg">
              <StatLabel fontSize="sm" color={useColorModeValue('green.700', 'green.300')}>Staff ID</StatLabel>
              <StatNumber fontSize="2xl" color={useColorModeValue('green.800', 'green.200')}>
                {authData.hasStaffId ? '✅' : '❌'}
              </StatNumber>
              <StatHelpText>
                Length: {authData.staffIdLength} chars
              </StatHelpText>
            </Stat>
            
            <Stat textAlign="center" p={4} bg={useColorModeValue('purple.50', 'purple.900')} borderRadius="lg">
              <StatLabel fontSize="sm" color={useColorModeValue('purple.700', 'purple.300')}>Coach ID</StatLabel>
              <StatNumber fontSize="2xl" color={useColorModeValue('purple.800', 'purple.200')}>
                {authData.hasCoachId ? '✅' : '❌'}
              </StatNumber>
              <StatHelpText>
                Length: {authData.coachIdLength} chars
              </StatHelpText>
            </Stat>
            
            <Stat textAlign="center" p={4} bg={useColorModeValue('orange.50', 'orange.900')} borderRadius="lg">
              <StatLabel fontSize="sm" color={useColorModeValue('orange.700', 'orange.300')}>Redux Status</StatLabel>
              <StatNumber fontSize="2xl" color={useColorModeValue('orange.800', 'orange.200')}>
                {isAuthenticated ? '✅' : '❌'}
              </StatNumber>
              <StatHelpText>
                Authenticated: {isAuthenticated ? 'Yes' : 'No'}
              </StatHelpText>
            </Stat>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Detailed Data */}
      <Accordion allowMultiple>
        <AccordionItem border="1px" borderColor={borderColor} borderRadius="md" mb={4}>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack spacing={3}>
                <Icon as={FiDatabase} boxSize={5} />
                <Text fontWeight="600" fontSize="lg">
                  LocalStorage Data
                </Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={4} align="stretch">
              {Object.entries(localStorageData).map(([key, value]) => {
                if (key.includes('Parsed')) return null; // Skip parsed versions
                
                const hasValue = !!(value && value !== 'null' && value !== 'undefined');
                return (
                  <Card key={key} bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
                    <CardBody>
                      <Flex justifyContent="space-between" alignItems="center">
                        <HStack spacing={3}>
                          {getStatusIcon(hasValue)}
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="500" color={textColor}>
                              {key}
                            </Text>
                            <Text fontSize="sm" color={secondaryTextColor}>
                              {hasValue ? `${value.length} characters` : 'No data'}
                            </Text>
                          </VStack>
                        </HStack>
                        {getStatusBadge(hasValue)}
                      </Flex>
                      
                      {hasValue && (
                        <Box mt={3}>
                          <Text fontSize="sm" color={secondaryTextColor} mb={2}>
                            Value Preview:
                          </Text>
                          <Code fontSize="xs" p={2} bg={useColorModeValue('gray.100', 'gray.700')} borderRadius="md">
                            {value.length > 100 ? `${value.substring(0, 100)}...` : value}
                          </Code>
                        </Box>
                      )}
                    </CardBody>
                  </Card>
                );
              })}
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem border="1px" borderColor={borderColor} borderRadius="md" mb={4}>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack spacing={3}>
                <Icon as={FiShield} boxSize={5} />
                <Text fontWeight="600" fontSize="lg">
                  Redux State Data
                </Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={4} align="stretch">
              <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
                <CardBody>
                  <Flex justifyContent="space-between" alignItems="center">
                    <HStack spacing={3}>
                      {getStatusIcon(!!staffId)}
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="500" color={textColor}>
                          Staff ID (Redux)
                        </Text>
                        <Text fontSize="sm" color={secondaryTextColor}>
                          {staffId || 'No data'}
                        </Text>
                      </VStack>
                    </HStack>
                    {getStatusBadge(!!staffId)}
                  </Flex>
                </CardBody>
              </Card>

              <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
                <CardBody>
                  <Flex justifyContent="space-between" alignItems="center">
                    <HStack spacing={3}>
                      {getStatusIcon(!!coachId)}
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="500" color={textColor}>
                          Coach ID (Redux)
                        </Text>
                        <Text fontSize="sm" color={secondaryTextColor}>
                          {coachId || 'No data'}
                        </Text>
                      </VStack>
                    </HStack>
                    {getStatusBadge(!!coachId)}
                  </Flex>
                </CardBody>
              </Card>

              <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
                <CardBody>
                  <Flex justifyContent="space-between" alignItems="center">
                    <HStack spacing={3}>
                      {getStatusIcon(!!token)}
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="500" color={textColor}>
                          Token (Redux)
                        </Text>
                        <Text fontSize="sm" color={secondaryTextColor}>
                          {token ? `${token.length} characters` : 'No data'}
                        </Text>
                      </VStack>
                    </HStack>
                    {getStatusBadge(!!token)}
                  </Flex>
                </CardBody>
              </Card>

              <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
                <CardBody>
                  <Flex justifyContent="space-between" alignItems="center">
                    <HStack spacing={3}>
                      {getStatusIcon(isAuthenticated)}
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="500" color={textColor}>
                          Is Authenticated
                        </Text>
                        <Text fontSize="sm" color={secondaryTextColor}>
                          {isAuthenticated ? 'Yes' : 'No'}
                        </Text>
                      </VStack>
                    </HStack>
                    {getStatusBadge(isAuthenticated)}
                  </Flex>
                </CardBody>
              </Card>
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default AuthStatusDebug;
