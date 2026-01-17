import React, { useState } from 'react';
import {
  Box,
  Grid,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Badge,
  Button,
  useColorModeValue,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
} from '@chakra-ui/react';
import {
  MdSmartToy,
  MdSend,
  MdChat,
} from 'react-icons/md';

const AIAssistant = () => {
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', message: 'Hello! I\'m your 24/7 AI Nutritionist Assistant. How can I help you today?', time: 'Just now' },
    { id: 2, sender: 'user', message: 'What should I eat for dinner?', time: '1 min ago' },
    { id: 3, sender: 'ai', message: 'I recommend a balanced meal with lean protein, vegetables, and whole grains. Try grilled chicken with quinoa and steamed broccoli! This provides about 450 calories with 35g protein.', time: '1 min ago' },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, { id: messages.length + 1, sender: 'user', message, time: 'Just now' }]);
      setMessage('');
      // Simulate AI response
      setTimeout(() => {
        setMessages(prev => [...prev, { id: prev.length + 1, sender: 'ai', message: 'That\'s a great question! Let me help you with that.', time: 'Just now' }]);
      }, 1000);
    }
  };

  const quickQuestions = [
    'What should I eat for breakfast?',
    'How many calories should I consume?',
    'Best pre-workout meal?',
    'Post-workout nutrition tips',
  ];

  return (
    <Box>
      <Box mb={6}>
        <HStack justify="space-between">
          <Box>
            <Text fontSize="3xl" fontWeight="black" color="gray.800" mb={1}>
              AI Nutritionist Assistant
            </Text>
            <Text color="gray.600" fontSize="lg">
              24/7 AI-powered nutrition and fitness support
            </Text>
          </Box>
          <Badge colorScheme="purple" borderRadius="full" px={4} py={2} fontSize="sm">
            <Icon as={MdSmartToy} mr={2} /> 24/7 Available
          </Badge>
        </HStack>
      </Box>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6} mb={6}>
        {/* Chat Interface */}
        <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)" h="600px" display="flex" flexDirection="column">
          <CardBody p={6} flex={1} display="flex" flexDirection="column">
            <HStack mb={4}>
              <Avatar size="sm" bg="purple.500" icon={<MdSmartToy />} />
              <Box>
                <Text fontSize="sm" fontWeight="bold">AI Nutritionist</Text>
                <Text fontSize="xs" color="green.500">Online</Text>
              </Box>
            </HStack>
            
            <Box flex={1} overflowY="auto" mb={4}>
              <VStack spacing={3} align="stretch">
                {messages.map((msg) => (
                  <Box key={msg.id} alignSelf={msg.sender === 'user' ? 'flex-end' : 'flex-start'}>
                    <Box 
                      p={3} 
                      bg={msg.sender === 'user' ? 'brand.100' : 'gray.100'} 
                      borderRadius="lg"
                      maxW="80%"
                    >
                      <Text fontSize="sm">{msg.message}</Text>
                      <Text fontSize="xs" color="gray.500" mt={1}>{msg.time}</Text>
                    </Box>
                  </Box>
                ))}
              </VStack>
            </Box>

            <InputGroup>
              <Input
                placeholder="Ask your nutritionist..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                borderRadius="xl"
              />
              <InputLeftElement>
                <Button leftIcon={<MdSend />} colorScheme="purple" size="sm" borderRadius="xl" onClick={handleSend} aria-label="Send" />
              </InputLeftElement>
            </InputGroup>
          </CardBody>
        </Card>

        {/* Quick Questions & Features */}
        <VStack spacing={4} align="stretch">
          <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
            <CardBody p={4}>
              <Text fontSize="sm" fontWeight="bold" mb={3}>Quick Questions</Text>
              <VStack spacing={2} align="stretch">
                {quickQuestions.map((q, idx) => (
                  <Button key={idx} size="sm" variant="outline" textAlign="left" justifyContent="flex-start" onClick={() => setMessage(q)} borderRadius="xl">
                    {q}
                  </Button>
                ))}
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} backdropFilter="blur(20px)" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.2)">
            <CardBody p={4}>
              <Text fontSize="sm" fontWeight="bold" mb={3}>AI Features</Text>
              <VStack spacing={2} align="stretch">
                <HStack p={2} bg="gray.50" borderRadius="lg">
                  <Icon as={MdChat} color="purple.500" />
                  <Text fontSize="xs">Nutrition Advice</Text>
                </HStack>
                <HStack p={2} bg="gray.50" borderRadius="lg">
                  <Icon as={MdChat} color="purple.500" />
                  <Text fontSize="xs">Meal Planning</Text>
                </HStack>
                <HStack p={2} bg="gray.50" borderRadius="lg">
                  <Icon as={MdChat} color="purple.500" />
                  <Text fontSize="xs">Smart Follow-ups</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Grid>
    </Box>
  );
};

export default AIAssistant;

