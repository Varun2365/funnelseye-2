import React from 'react';
import { Box, VStack, Heading, Text, Button, Container, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

const NotFound = () => {
  const navigate = useNavigate();
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, blue.900, purple.900)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box
      minH="100vh"
      bgGradient={bgGradient}
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
    >
      {/* Background Grid Pattern */}
      <Box
        position="absolute"
        width="100%"
        height="100%"
        backgroundImage="radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)"
        backgroundSize="40px 40px"
        opacity={0.5}
        animation="pan-background 30s linear infinite"
        zIndex={0}
        sx={{
          '@keyframes pan-background': {
            '0%': { backgroundPosition: '0 0' },
            '100%': { backgroundPosition: '400px 400px' }
          }
        }}
      />

      {/* Main Content */}
      <Container maxW="md" zIndex={1}>
        <Box
          bg={cardBg}
          backdropFilter="blur(8px)"
          p={8}
          borderRadius="xl"
          boxShadow="0 10px 20px rgba(0, 0, 0, 0.2)"
          border="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.600')}
          animation="fadeIn 0.8s ease-out"
          sx={{
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'scale(0.9)' },
              to: { opacity: 1, transform: 'scale(1)' }
            }
          }}
        >
          <VStack spacing={6} textAlign="center">
            {/* 404 Number */}
            <Heading
              fontSize="6rem"
              fontWeight={700}
              color="blue.500"
              margin={0}
              letterSpacing="-0.1em"
              animation="pulsate 2s infinite ease-in-out alternate"
              sx={{
                '@keyframes pulsate': {
                  '0%': { transform: 'scale(1)' },
                  '100%': { transform: 'scale(1.05)' }
                }
              }}
            >
              404
            </Heading>

            {/* Error Message */}
            <VStack spacing={4}>
              <Heading
                fontSize="1.5rem"
                fontWeight={600}
                color={textColor}
              >
                Page Not Found
              </Heading>
              
              <Text
                fontSize="1rem"
                color={mutedColor}
                maxW="sm"
              >
                The URL you requested could not be found on this server. 
                Please check the address or return to the homepage.
              </Text>
            </VStack>

            {/* Action Buttons */}
            <VStack spacing={3} w="full">
              <Button
                leftIcon={<FiHome />}
                colorScheme="blue"
                size="lg"
                w="full"
                onClick={() => navigate('/')}
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg'
                }}
                transition="all 0.3s ease"
              >
                Go to Homepage
              </Button>
              
              <Button
                leftIcon={<FiArrowLeft />}
                variant="outline"
                size="lg"
                w="full"
                onClick={() => navigate(-1)}
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'md'
                }}
                transition="all 0.3s ease"
              >
                Go Back
              </Button>
            </VStack>

            {/* Additional Help */}
            <Box
              mt={4}
              p={4}
              bg={useColorModeValue('gray.50', 'gray.700')}
              borderRadius="md"
              w="full"
            >
              <Text fontSize="sm" color={mutedColor}>
                If you believe this is an error, please contact support or try refreshing the page.
              </Text>
            </Box>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFound;

