import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="container.md" textAlign="center">
        <VStack spacing={8}>
          <Icon as={FaExclamationTriangle} boxSize={20} color="brand.600" />

          <VStack spacing={4}>
            <Heading size="4xl" color="gray.900">
              404
            </Heading>
            <Heading size="xl" color="gray.700">
              Page Not Found
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="md">
              The page you're looking for doesn't exist or has been moved.
            </Text>
          </VStack>

          <Button
            leftIcon={<FaHome />}
            colorScheme="brand"
            size="lg"
            onClick={() => navigate('/')}
          >
            Go Home
          </Button>
        </VStack>
      </Container>
    </Box>
  );
};

export default NotFound;
