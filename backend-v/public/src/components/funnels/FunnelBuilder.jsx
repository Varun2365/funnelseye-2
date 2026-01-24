import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';

const FunnelBuilder = () => {
  const { funnelId, category, templateKey } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    initializeEditor();
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, []);

  const initializeEditor = async () => {
    try {
      setLoading(true);

      const editorInstance = grapesjs.init({
        container: editorRef.current,
        height: 'calc(100vh - 200px)',
        width: 'auto',
        fromElement: false,
        storageManager: {
          type: 'local',
          autosave: true,
          autoload: true,
          stepsBeforeSave: 1,
        },
        assetManager: {
          assets: [],
          upload: false,
        },
        plugins: [gjsPresetWebpage],
        pluginsOpts: {
          gjsPresetWebpage: {}
        }
      });

      // Load template if specified
      if (templateKey) {
        // TODO: Load template based on templateKey
        editorInstance.setComponents('<div class="container"><h1>Welcome to your funnel!</h1><p>Start building your content here.</p></div>');
      }

      setEditor(editorInstance);
    } catch (error) {
      console.error('Error initializing editor:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize the editor',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editor) return;

    try {
      setSaving(true);
      const html = editor.getHtml();
      const css = editor.getCss();

      // TODO: Save to backend
      console.log('Saving funnel:', { html, css });

      toast({
        title: 'Success',
        description: 'Funnel saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving funnel:', error);
      toast({
        title: 'Error',
        description: 'Failed to save funnel',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading Funnel Builder...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Funnel Builder</Heading>
            <Text color="gray.600">
              {category && `Category: ${category}`} {templateKey && `| Template: ${templateKey}`}
            </Text>
          </VStack>

          <HStack spacing={3}>
            <Button variant="outline" onClick={() => navigate('/funnels')}>
              Back to Funnels
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSave}
              isLoading={saving}
              loadingText="Saving..."
            >
              Save Funnel
            </Button>
          </HStack>
        </HStack>

        {/* Editor Container */}
        <Card>
          <CardBody p={0}>
            <Box
              ref={editorRef}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              minH="600px"
            />
          </CardBody>
        </Card>

        {/* Instructions */}
        <Alert status="info">
          <AlertIcon />
          Use the GrapesJS editor above to build your funnel. Drag and drop elements, customize styles, and create compelling content for your audience.
        </Alert>
      </VStack>
    </Box>
  );
};

export default FunnelBuilder;