import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, useToast } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import GraphAutomationBuilderV2 from './GraphAutomationBuilderV2';
import { getToken, getCoachId, getAuthHeaders } from '../../utils/authUtils';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// API endpoint with /api prefix
const API_ENDPOINT = `${API_BASE_URL}/api`;

const AutomationEditor = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const authState = useSelector(state => state.auth);

  const [rule, setRule] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get auth data
  const token = getToken(authState);
  const coachId = getCoachId(authState);

  // Get query parameters
  const ruleId = searchParams.get('id');
  const action = searchParams.get('action'); // 'new' or 'edit'
  const returnTo = searchParams.get('return') || '/automations-v2';

  useEffect(() => {
    const loadRule = async () => {
      try {
        if (action === 'edit' && ruleId) {
          // Load existing rule
          const response = await axios.get(`${API_ENDPOINT}/automations-v2/sequences/${ruleId}`, {
            headers: getAuthHeaders(authState)
          });
          setRule(response.data.data || response.data);
        } else if (action === 'new') {
          // Create new rule template
          setRule({
            name: '',
            workflowType: 'graph',
            nodes: [],
            edges: [],
            isActive: true
          });
        } else {
          // Default fallback
          setRule({
            name: '',
            workflowType: 'graph',
            nodes: [],
            edges: [],
            isActive: true
          });
        }
      } catch (error) {
        console.error('Error loading automation rule:', error);
        toast({
          title: 'Error',
          description: 'Failed to load automation rule',
          status: 'error',
          duration: 5000,
        });
        navigate(returnTo);
      } finally {
        setLoading(false);
      }
    };

    if (token && coachId) {
      loadRule();
    } else {
      setLoading(false);
    }
  }, [action, ruleId, token, coachId, authState, toast, navigate, returnTo]);

  const handleSave = async (automationData) => {
    try {
      if (rule && rule._id) {
        // Update existing rule
        await axios.put(`${API_ENDPOINT}/automations-v2/sequences/${rule._id}`, automationData, {
          headers: getAuthHeaders(authState)
        });
        toast({
          title: 'Success',
          description: 'Automation updated successfully',
          status: 'success',
          duration: 3000,
        });
      } else {
        // Create new rule
        await axios.post(`${API_ENDPOINT}/automations-v2/sequences`, automationData, {
          headers: getAuthHeaders(authState)
        });
        toast({
          title: 'Success',
          description: 'Automation created successfully',
          status: 'success',
          duration: 3000,
        });
      }

      // Navigate back to the return URL
      navigate(returnTo);
    } catch (error) {
      console.error('Error saving automation:', error);
      toast({
        title: 'Error',
        description: 'Failed to save automation',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleClose = () => {
    navigate(returnTo);
  };

  if (loading) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
        zIndex={0}
      >
        Loading automation editor...
      </Box>
    );
  }

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="white"
      zIndex={0}
      overflow="hidden"
    >
      <GraphAutomationBuilderV2
        rule={rule}
        onSave={handleSave}
        eventsActions={{
          triggers: [
            'lead_created',
            'appointment_booked',
            'payment_successful',
            'task_completed',
            'email_opened',
            'form_submitted'
          ],
          actions: [
            'send_whatsapp_message',
            'add_lead_tag',
            'create_calendar_event',
            'add_note_to_lead',
            'move_to_funnel_stage',
            'create_invoice',
            'send_email_message',
            'create_task',
            'update_lead_status',
            'assign_lead_to_staff'
          ]
        }}
        builderResources={{
          staff: [],
          funnels: [],
          messageTemplates: [],
          automationRules: []
        }}
        viewMode={false}
      />
    </Box>
  );
};

export default AutomationEditor;
