import React from 'react';
import { Box, VStack, Heading, Text, Button, Container } from '@chakra-ui/react';
import { FiRefreshCw, FiHome } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console for debugging
    console.error('🚨 Error Boundary Caught Error:', error);
    console.error('🚨 Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Use static values instead of hooks in class component
      const bgGradient = 'linear(to-br, red.50, orange.50, yellow.50)';
      const cardBg = 'white';
      const textColor = 'gray.700';
      const mutedColor = 'gray.500';

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
          {/* Background Pattern */}
          <Box
            position="absolute"
            width="100%"
            height="100%"
            backgroundImage="radial-gradient(circle, rgba(255,0,0,0.1) 1px, transparent 1px)"
            backgroundSize="30px 30px"
            opacity={0.3}
            zIndex={0}
          />

          {/* Main Content */}
          <Container maxW="lg" zIndex={1}>
            <Box
              bg={cardBg}
              backdropFilter="blur(8px)"
              p={8}
              borderRadius="xl"
              boxShadow="0 10px 20px rgba(0, 0, 0, 0.2)"
              border="1px solid"
              borderColor="red.200"
            >
              <VStack spacing={6} textAlign="center">
                {/* Error Icon */}
                <Box
                  fontSize="4rem"
                  color="red.500"
                  animation="pulse 2s infinite"
                >
                  ⚠️
                </Box>

                {/* Error Message */}
                <VStack spacing={4}>
                  <Heading
                    fontSize="2rem"
                    fontWeight={700}
                    color="red.500"
                  >
                    Something went wrong!
                  </Heading>
                  
                  <Text
                    fontSize="1rem"
                    color={textColor}
                    maxW="md"
                  >
                    An unexpected error occurred. This has been logged and we'll look into it.
                  </Text>

                  {/* Error Details (in development) */}
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <Box
                      mt={4}
                      p={4}
                      bg="red.50"
                      borderRadius="md"
                      w="full"
                      textAlign="left"
                    >
                      <Text fontSize="sm" color={mutedColor} mb={2}>
                        Error Details (Development):
                      </Text>
                      <Text fontSize="xs" color="red.600" fontFamily="mono">
                        {this.state.error.toString()}
                      </Text>
                    </Box>
                  )}
                </VStack>

                {/* Action Buttons */}
                <VStack spacing={3} w="full">
                  <Button
                    leftIcon={<FiRefreshCw />}
                    colorScheme="red"
                    size="lg"
                    w="full"
                    onClick={() => window.location.reload()}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg'
                    }}
                    transition="all 0.3s ease"
                  >
                    Refresh Page
                  </Button>
                  
                  <Button
                    leftIcon={<FiHome />}
                    variant="outline"
                    size="lg"
                    w="full"
                    onClick={() => window.location.href = '/'}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'md'
                    }}
                    transition="all 0.3s ease"
                  >
                    Go to Homepage
                  </Button>
                </VStack>

                {/* Additional Help */}
                <Box
                  mt={4}
                  p={4}
                  bg="gray.50"
                  borderRadius="md"
                  w="full"
                >
                  <Text fontSize="sm" color={mutedColor}>
                    If this problem persists, please contact support with the error details above.
                  </Text>
                </Box>
              </VStack>
            </Box>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

