import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  useToast,
  useColorModeValue,
  Box,
  Text,
  Icon,
  Divider,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem
} from '@chakra-ui/react';
import { FaCalendar, FaClock, FaMapMarkerAlt, FaUsers, FaBell, FaTag } from 'react-icons/fa';
import { staffAPI } from '../../services/staffAPI';

const CalendarEventModal = ({ isOpen, onClose, onEventCreated }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    eventType: 'meeting',
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    priority: 'medium',
    location: '',
    notes: '',
    tags: [],
    color: '#3788d8',
    isPublic: false,
    reminder: {
      enabled: true,
      time: 15
    }
  });

  const [newTag, setNewTag] = useState('');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parentField, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare event data
      const eventData = {
        staffId: localStorage.getItem('staffId'),
        eventType: formData.eventType,
        title: formData.title,
        description: formData.description,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        priority: formData.priority,
        location: formData.location || '',
        notes: formData.notes || '',
        tags: formData.tags,
        color: formData.color,
        isPublic: formData.isPublic,
        reminder: formData.reminder,
        attendees: [
          {
            userId: localStorage.getItem('staffId'),
            name: localStorage.getItem('staffName') || 'Staff Member',
            email: localStorage.getItem('staffEmail') || 'staff@example.com',
            role: 'staff'
          }
        ]
      };

      const response = await staffAPI.createCalendarEvent(eventData);

      toast({
        title: 'Calendar Event Created Successfully!',
        description: `"${formData.title}" has been added to your calendar.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        eventType: 'meeting',
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        priority: 'medium',
        location: '',
        notes: '',
        tags: [],
        color: '#3788d8',
        isPublic: false,
        reminder: {
          enabled: true,
          time: 15
        }
      });
      setNewTag('');

      onClose();
      if (onEventCreated) {
        onEventCreated(response.data);
      }

    } catch (error) {
      console.error('Error creating calendar event:', error);
      toast({
        title: 'Error Creating Calendar Event',
        description: error.message || 'Failed to create calendar event. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const eventTypeOptions = [
    { value: 'meeting', label: 'Meeting', color: '#3788d8' },
    { value: 'task', label: 'Task', color: '#4CAF50' },
    { value: 'break', label: 'Break', color: '#FF9800' },
    { value: 'unavailable', label: 'Unavailable', color: '#F44336' },
    { value: 'custom', label: 'Custom', color: '#9C27B0' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ];

  const reminderOptions = [
    { value: 5, label: '5 minutes before' },
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 1440, label: '1 day before' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent bg={bgColor} borderColor={borderColor}>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FaCalendar} color="blue.500" boxSize={6} />
            <VStack align="start" spacing={0}>
              <Text fontSize="xl" fontWeight="bold">Create Calendar Event</Text>
              <Text fontSize="sm" color="gray.500">Schedule a new event in your calendar</Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Event Type and Title */}
              <HStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Icon as={FaTag} color="purple.500" boxSize={4} />
                      <Text>Event Type</Text>
                    </HStack>
                  </FormLabel>
                  <Select
                    value={formData.eventType}
                    onChange={(e) => handleInputChange('eventType', e.target.value)}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    borderColor={borderColor}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px #3182ce'
                    }}
                  >
                    {eventTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired flex={2}>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Icon as={FaCalendar} color="blue.500" boxSize={4} />
                      <Text>Event Title</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter event title..."
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    borderColor={borderColor}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px #3182ce'
                    }}
                  />
                </FormControl>
              </HStack>

              {/* Description */}
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the event details..."
                  rows={3}
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  borderColor={borderColor}
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px #3182ce'
                  }}
                />
              </FormControl>

              {/* Date and Time */}
              <HStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Icon as={FaClock} color="green.500" boxSize={4} />
                      <Text>Start Time</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    borderColor={borderColor}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px #3182ce'
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Icon as={FaClock} color="red.500" boxSize={4} />
                      <Text>End Time</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    borderColor={borderColor}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px #3182ce'
                    }}
                  />
                </FormControl>
              </HStack>

              {/* Priority and Location */}
              <HStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    borderColor={borderColor}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px #3182ce'
                    }}
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl flex={2}>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Icon as={FaMapMarkerAlt} color="orange.500" boxSize={4} />
                      <Text>Location</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter location (optional)..."
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    borderColor={borderColor}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px #3182ce'
                    }}
                  />
                </FormControl>
              </HStack>

              {/* Tags */}
              <FormControl>
                <FormLabel>
                  <HStack spacing={2}>
                    <Icon as={FaTag} color="teal.500" boxSize={4} />
                    <Text>Tags</Text>
                  </HStack>
                </FormLabel>
                <HStack spacing={2}>
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    borderColor={borderColor}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px #3182ce'
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button onClick={addTag} size="sm" colorScheme="teal" variant="outline">
                    Add
                  </Button>
                </HStack>
                {formData.tags.length > 0 && (
                  <Wrap mt={2}>
                    {formData.tags.map((tag, index) => (
                      <WrapItem key={index}>
                        <Tag colorScheme="teal" borderRadius="full">
                          <TagLabel>{tag}</TagLabel>
                          <TagCloseButton onClick={() => removeTag(tag)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </FormControl>

              {/* Reminder Settings */}
              <FormControl>
                <FormLabel>
                  <HStack spacing={2}>
                    <Icon as={FaBell} color="yellow.500" boxSize={4} />
                    <Text>Reminder</Text>
                  </HStack>
                </FormLabel>
                <HStack spacing={4}>
                  <Select
                    value={formData.reminder.time}
                    onChange={(e) => handleNestedInputChange('reminder', 'time', parseInt(e.target.value))}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    borderColor={borderColor}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px #3182ce'
                    }}
                  >
                    {reminderOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </HStack>
              </FormControl>

              {/* Notes */}
              <FormControl>
                <FormLabel>Additional Notes</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional notes or requirements..."
                  rows={2}
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  borderColor={borderColor}
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px #3182ce'
                  }}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="outline" onClick={onClose} isDisabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={loading}
                loadingText="Creating..."
                leftIcon={<Icon as={FaCalendar} />}
              >
                Create Event
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CalendarEventModal;
