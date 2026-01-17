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
  Divider
} from '@chakra-ui/react';
import { FaTasks, FaCalendar, FaClock, FaUser, FaFlag } from 'react-icons/fa';
import { staffTaskAPI } from '../../services/staffAPI';

const TaskCreationModal = ({ isOpen, onClose, onTaskCreated }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'MEDIUM',
    stage: 'LEAD_GENERATION',
    dueDate: '',
    estimatedHours: '',
    relatedLead: '',
    notes: ''
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare task data
      const taskData = {
        name: formData.name,
        description: formData.description,
        priority: formData.priority,
        stage: formData.stage,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
        relatedLead: formData.relatedLead || null,
        notes: formData.notes || '',
        assignedTo: localStorage.getItem('staffId') // Self-assign
      };

      const response = await staffTaskAPI.createTask(taskData);

      toast({
        title: 'Task Created Successfully!',
        description: `"${formData.name}" has been created and assigned to you.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        priority: 'MEDIUM',
        stage: 'LEAD_GENERATION',
        dueDate: '',
        estimatedHours: '',
        relatedLead: '',
        notes: ''
      });

      onClose();
      if (onTaskCreated) {
        onTaskCreated(response.data);
      }

    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error Creating Task',
        description: error.message || 'Failed to create task. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    { value: 'LOW', label: 'Low Priority', color: 'green' },
    { value: 'MEDIUM', label: 'Medium Priority', color: 'yellow' },
    { value: 'HIGH', label: 'High Priority', color: 'orange' },
    { value: 'URGENT', label: 'Urgent', color: 'red' }
  ];

  const stageOptions = [
    { value: 'LEAD_GENERATION', label: 'Lead Generation' },
    { value: 'LEAD_QUALIFICATION', label: 'Lead Qualification' },
    { value: 'PROPOSAL', label: 'Proposal' },
    { value: 'CLOSING', label: 'Closing' },
    { value: 'ONBOARDING', label: 'Onboarding' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent bg={bgColor} borderColor={borderColor}>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FaTasks} color="blue.500" boxSize={6} />
            <VStack align="start" spacing={0}>
              <Text fontSize="xl" fontWeight="bold">Create New Task</Text>
              <Text fontSize="sm" color="gray.500">Create and assign a new task to yourself</Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Task Name */}
              <FormControl isRequired>
                <FormLabel>
                  <HStack spacing={2}>
                    <Icon as={FaTasks} color="blue.500" boxSize={4} />
                    <Text>Task Name</Text>
                  </HStack>
                </FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter task name..."
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  borderColor={borderColor}
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px #3182ce'
                  }}
                />
              </FormControl>

              {/* Description */}
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the task details..."
                  rows={3}
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  borderColor={borderColor}
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px #3182ce'
                  }}
                />
              </FormControl>

              <HStack spacing={4} align="stretch">
                {/* Priority */}
                <FormControl isRequired>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Icon as={FaFlag} color="orange.500" boxSize={4} />
                      <Text>Priority</Text>
                    </HStack>
                  </FormLabel>
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

                {/* Stage */}
                <FormControl isRequired>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Icon as={FaUser} color="purple.500" boxSize={4} />
                      <Text>Stage</Text>
                    </HStack>
                  </FormLabel>
                  <Select
                    value={formData.stage}
                    onChange={(e) => handleInputChange('stage', e.target.value)}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    borderColor={borderColor}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px #3182ce'
                    }}
                  >
                    {stageOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>

              <HStack spacing={4} align="stretch">
                {/* Due Date */}
                <FormControl>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Icon as={FaCalendar} color="green.500" boxSize={4} />
                      <Text>Due Date</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    borderColor={borderColor}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px #3182ce'
                    }}
                  />
                </FormControl>

                {/* Estimated Hours */}
                <FormControl>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Icon as={FaClock} color="teal.500" boxSize={4} />
                      <Text>Estimated Hours</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={formData.estimatedHours}
                    onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                    placeholder="e.g., 2.5"
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    borderColor={borderColor}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px #3182ce'
                    }}
                  />
                </FormControl>
              </HStack>

              {/* Related Lead */}
              <FormControl>
                <FormLabel>Related Lead ID (Optional)</FormLabel>
                <Input
                  value={formData.relatedLead}
                  onChange={(e) => handleInputChange('relatedLead', e.target.value)}
                  placeholder="Enter lead ID if applicable..."
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  borderColor={borderColor}
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px #3182ce'
                  }}
                />
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
                leftIcon={<Icon as={FaTasks} />}
              >
                Create Task
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default TaskCreationModal;
