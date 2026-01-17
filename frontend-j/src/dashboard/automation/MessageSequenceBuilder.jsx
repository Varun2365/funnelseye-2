import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  IconButton,
  Button,
  Divider,
  useColorModeValue,
  Tooltip,
  Badge,
} from '@chakra-ui/react';
import { FaPlus, FaTrash, FaClock } from 'react-icons/fa';

const DEFAULT_DELAY_UNIT = 'minutes';

const createEmptyStep = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: '',
  channel: 'whatsapp',
  delayAmount: 0,
  delayUnit: DEFAULT_DELAY_UNIT,
  content: '',
});

const channelOptions = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'notification', label: 'In-app Notification' },
];

const delayUnitOptions = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
];

const MessageSequenceBuilder = ({ sequences = [], onChange, templates = [] }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleAddStep = () => {
    const newStep = createEmptyStep();
    onChange?.([...sequences, newStep]);
  };

  const handleRemoveStep = (id) => {
    onChange?.(sequences.filter((step) => step.id !== id));
  };

  const handleUpdateStep = (id, field, value) => {
    onChange?.(
      sequences.map((step) =>
        step.id === id
          ? {
              ...step,
              [field]: value,
            }
          : step
      )
    );
  };

  const handleSelectTemplate = (id, templateId) => {
    const tmpl = templates.find(t => (t._id || t.id) === templateId || t.id === templateId);
    onChange?.(
      sequences.map((step) =>
        step.id === id
          ? {
              ...step,
              templateId,
              // If template has content/subject, apply defaults
              content: tmpl?.content || step.content,
              subject: tmpl?.subject || step.subject || '',
            }
          : step
      )
    );
  };

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="sm" color="gray.500">
        Build a follow-up sequence that automatically sends timed messages after the automation trigger. Each step can have its own delay and channel.
      </Text>

      {sequences.length === 0 && (
        <Box
          border="1px dashed"
          borderColor={borderColor}
          borderRadius="lg"
          p={6}
          textAlign="center"
        >
          <Text color="gray.500" mb={3}>
            No message steps yet
          </Text>
          <Button leftIcon={<FaPlus />} onClick={handleAddStep} colorScheme="purple">
            Add First Message
          </Button>
        </Box>
      )}

      {sequences.map((step, index) => (
        <Box
          key={step.id}
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="lg"
          p={4}
          position="relative"
        >
          <HStack justify="space-between" mb={4}>
            <HStack>
              <Badge colorScheme="purple" variant="subtle">
                Step {index + 1}
              </Badge>
              <Tooltip label="Delay before this message runs">
                <HStack spacing={1} color="gray.500" fontSize="sm">
                  <FaClock />
                  <Text>
                    {step.delayAmount} {step.delayUnit}
                  </Text>
                </HStack>
              </Tooltip>
            </HStack>
            <IconButton
              icon={<FaTrash />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={() => handleRemoveStep(step.id)}
              aria-label="Remove step"
            />
          </HStack>

          <VStack align="stretch" spacing={4}>
            <FormControl>
              <FormLabel>Internal Title</FormLabel>
              <Input
                value={step.title}
                onChange={(e) => handleUpdateStep(step.id, 'title', e.target.value)}
                placeholder="e.g., Warm welcome message"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Channel</FormLabel>
              <Select
                value={step.channel}
                onChange={(e) => handleUpdateStep(step.id, 'channel', e.target.value)}
              >
                {channelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Template (optional)</FormLabel>
              <Select
                value={step.templateId || ''}
                onChange={(e) => handleSelectTemplate(step.id, e.target.value)}
                placeholder="Select a template"
              >
                {templates
                  .filter(t => !t.channel || t.channel === step.channel)
                  .map((t) => (
                    <option key={t._id || t.id} value={t._id || t.id}>{t.name || t.title || t.templateName}</option>
                  ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Delay before sending</FormLabel>
              <HStack>
                <NumberInput
                  min={0}
                  value={step.delayAmount}
                  onChange={(valueString, valueNumber) =>
                    handleUpdateStep(step.id, 'delayAmount', Number.isNaN(valueNumber) ? 0 : valueNumber)
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Select
                  value={step.delayUnit}
                  onChange={(e) => handleUpdateStep(step.id, 'delayUnit', e.target.value)}
                >
                  {delayUnitOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </HStack>
            </FormControl>

            <FormControl>
              <FormLabel>Message Content</FormLabel>
              <Textarea
                value={step.content}
                onChange={(e) => handleUpdateStep(step.id, 'content', e.target.value)}
                placeholder="Draft the message to send. You can include variables like {{lead.name}}."
                rows={4}
              />
            </FormControl>

            {step.channel === 'email' && (
              <FormControl>
                <FormLabel>Email Subject</FormLabel>
                <Input
                  value={step.subject || ''}
                  onChange={(e) => handleUpdateStep(step.id, 'subject', e.target.value)}
                  placeholder="Enter email subject or select an email template"
                />
              </FormControl>
            )}
          </VStack>
        </Box>
      ))}

      {sequences.length > 0 && (
        <>
          <Divider />
          <Button leftIcon={<FaPlus />} onClick={handleAddStep} variant="outline" colorScheme="purple">
            Add Another Step
          </Button>
        </>
      )}
    </VStack>
  );
};

export default MessageSequenceBuilder;