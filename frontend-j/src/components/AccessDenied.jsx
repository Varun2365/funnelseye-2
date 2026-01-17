import React from 'react';
import {
  Box,
  VStack,
  Text,
  Icon,
  Heading,
  Button,
  Container,
  Center
} from '@chakra-ui/react';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

/**
 * Access Denied Component
 * Displays when staff member doesn't have permission to access a section
 */
const AccessDenied = ({ 
  message = "You don't have access to view this section.",
  requiredPermission = null,
  section = null
}) => {
  const navigate = useNavigate();

  return (
    <Container maxW="container.md" py={10}>
      <Center>
        <VStack spacing={6} textAlign="center">
          <Icon as={FaLock} boxSize={16} color="red.500" />
          
          <Heading size="lg" color="gray.700">
            Access Denied
          </Heading>
          
          <Text color="gray.600" fontSize="md">
            {message}
          </Text>
          
          {requiredPermission && (
            <Box
              bg="red.50"
              border="1px solid"
              borderColor="red.200"
              borderRadius="md"
              p={4}
              w="full"
            >
              <Text fontSize="sm" color="red.700" fontWeight="semibold">
                Required Permission: {requiredPermission}
              </Text>
              <Text fontSize="xs" color="red.600" mt={1}>
                Please contact your coach to request access to this feature.
              </Text>
            </Box>
          )}
          
          {section && (
            <Text fontSize="sm" color="gray.500">
              Section: {section}
            </Text>
          )}
          
          <Button
            leftIcon={<FaArrowLeft />}
            colorScheme="blue"
            onClick={() => navigate('/dashboard')}
            mt={4}
          >
            Back to Dashboard
          </Button>
        </VStack>
      </Center>
    </Container>
  );
};

export default AccessDenied;

