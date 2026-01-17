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
  Input,
  Textarea,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiMessageSquare,
  FiHeart,
  FiShare2,
  FiSend,
  FiTrendingUp,
} from 'react-icons/fi';

const Community = () => {
  const posts = [
    {
      id: 1,
      author: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      content: 'Just completed my first week! Feeling amazing and motivated to keep going!',
      likes: 24,
      comments: 8,
      time: '2 hours ago',
    },
    {
      id: 2,
      author: 'Sarah Williams',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      content: 'Reached my monthly goal today! Thanks to everyone for the support!',
      likes: 42,
      comments: 15,
      time: '5 hours ago',
    },
    {
      id: 3,
      author: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      content: 'Struggling a bit this week but staying committed. Any tips?',
      likes: 18,
      comments: 12,
      time: '1 day ago',
    },
  ];

  const members = [
    { id: 1, name: 'Alex Johnson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', role: 'Member', joined: '2024-01-15' },
    { id: 2, name: 'Sarah Williams', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', role: 'Moderator', joined: '2023-12-10' },
    { id: 3, name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', role: 'Member', joined: '2024-02-20' },
  ];

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6} mb={8}>
        <Box>
          <Text fontSize="2xl" fontWeight="800" color="gray.900" mb={2}>
            Community
          </Text>
          <Text color="gray.600" fontSize="sm" fontWeight="500">
            Connect, share, and support each other on the journey
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
                  <Icon as={FiUsers} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">{members.length}</Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Active Members</Text>
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
                  <Icon as={FiMessageSquare} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">{posts.length}</Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Recent Posts</Text>
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
                  <Icon as={FiHeart} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">
                {posts.reduce((acc, p) => acc + p.likes, 0)}
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Total Likes</Text>
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
                  <Icon as={FiTrendingUp} boxSize={6} color="white" />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">
                {posts.reduce((acc, p) => acc + p.comments, 0)}
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="600">Total Comments</Text>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>

      <Tabs>
        <TabList>
          <Tab fontWeight="700">Feed</Tab>
          <Tab fontWeight="700">Members</Tab>
          <Tab fontWeight="700">Discussions</Tab>
        </TabList>

        <TabPanels>
          {/* Feed */}
          <TabPanel>
            <VStack align="stretch" spacing={4}>
              {/* Create Post */}
              <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
                <CardBody p={5}>
                  <HStack spacing={3} mb={4}>
                    <Avatar size="sm" name="You" />
                    <Text fontWeight="700" color="gray.900">Share something...</Text>
                  </HStack>
                  <Textarea
                    placeholder="What's on your mind?"
                    borderRadius="xl"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{ borderColor: '#667eea' }}
                    mb={3}
                  />
                  <Button
                    leftIcon={<FiSend />}
                    bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
                    color="white"
                    _hover={{ bgGradient: 'linear(135deg, #764ba2 0%, #667eea 100%)' }}
                    borderRadius="xl"
                  >
                    Post
                  </Button>
                </CardBody>
              </Card>

              {/* Posts */}
              {posts.map((post) => (
                <motion.div key={post.id} whileHover={{ y: -2 }}>
                  <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
                    <CardBody p={5}>
                      <HStack spacing={3} mb={4}>
                        <Avatar size="md" name={post.author} src={post.avatar} />
                        <Box flex={1}>
                          <Text fontWeight="800" color="gray.900">{post.author}</Text>
                          <Text fontSize="xs" color="gray.500">{post.time}</Text>
                        </Box>
                      </HStack>
                      <Text color="gray.700" mb={4} fontSize="sm">
                        {post.content}
                      </Text>
                      <HStack spacing={4}>
                        <Button
                          leftIcon={<FiHeart />}
                          variant="ghost"
                          size="sm"
                          colorScheme="red"
                          borderRadius="lg"
                        >
                          {post.likes}
                        </Button>
                        <Button
                          leftIcon={<FiMessageSquare />}
                          variant="ghost"
                          size="sm"
                          colorScheme="blue"
                          borderRadius="lg"
                        >
                          {post.comments}
                        </Button>
                        <Button
                          leftIcon={<FiShare2 />}
                          variant="ghost"
                          size="sm"
                          colorScheme="gray"
                          borderRadius="lg"
                        >
                          Share
                        </Button>
                      </HStack>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </VStack>
          </TabPanel>

          {/* Members */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {members.map((member) => (
                <motion.div key={member.id} whileHover={{ scale: 1.02, y: -4 }}>
                  <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
                    <CardBody p={5} textAlign="center">
                      <Avatar size="xl" name={member.name} src={member.avatar} mb={3} />
                      <Text fontWeight="800" color="gray.900" mb={1}>
                        {member.name}
                      </Text>
                      <Badge
                        bg={member.role === 'Moderator' ? '#F59E0B' : '#3B82F6'}
                        color="white"
                        borderRadius="full"
                        px={3}
                        py={1}
                        fontSize="xs"
                        fontWeight="700"
                        mb={2}
                      >
                        {member.role}
                      </Badge>
                      <Text fontSize="xs" color="gray.500">
                        Joined {member.joined}
                      </Text>
                      <Button size="sm" colorScheme="blue" borderRadius="lg" mt={3} w="full">
                        View Profile
                      </Button>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </SimpleGrid>
          </TabPanel>

          {/* Discussions */}
          <TabPanel>
            <Card bg="white" borderRadius="xl" boxShadow="0 4px 16px rgba(0, 0, 0, 0.06)">
              <CardBody>
                <Text color="gray.600" fontSize="sm" fontWeight="500">
                  Discussion topics and threads will be displayed here...
                </Text>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Community;

