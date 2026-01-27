// Automation Rules Service for Admin
import adminApiService from './adminApiService';

/**
 * Automation Rules Service
 * Handles all API calls to the automation-rules endpoints for admin
 */
class AutomationRulesService {
  constructor() {
    // Use adminApiService which handles adminToken automatically
  }

  /**
   * Get default headers with authorization
   * @returns {object} Headers object
   */
  getHeaders() {
    return adminApiService.getHeaders();
  }

  // ============================================================================
  // SEQUENCES MANAGEMENT
  // ============================================================================

  /**
   * Get all automation sequences
   * @returns {Promise} API response
   */
  async getSequences() {
    try {
      const response = await adminApiService.apiCall('/admin-automation-rules');
      return { success: true, data: response.data || [] };
    } catch (error) {
      console.error('Error fetching sequences:', error);
      throw error;
    }
  }

  /**
   * Get a specific automation sequence by ID
   * @param {string} sequenceId - Sequence ID
   * @returns {Promise} API response
   */
  async getSequenceById(sequenceId) {
    try {
      const response = await adminApiService.apiCall(`/admin-automation-rules/${sequenceId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching sequence:', error);
      throw error;
    }
  }

  /**
   * Create a new automation sequence
   * @param {object} sequenceData - Sequence data
   * @returns {Promise} API response
   */
  async createSequence(sequenceData) {
    try {
      const response = await adminApiService.apiCall('/admin-automation-rules', {
        method: 'POST',
        body: JSON.stringify(sequenceData)
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating sequence:', error);
      throw error;
    }
  }

  /**
   * Update an existing automation sequence
   * @param {string} sequenceId - Sequence ID
   * @param {object} sequenceData - Updated sequence data
   * @returns {Promise} API response
   */
  async updateSequence(sequenceId, sequenceData) {
    try {
      const response = await adminApiService.apiCall(`/admin-automation-rules/${sequenceId}`, {
        method: 'PUT',
        body: JSON.stringify(sequenceData)
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating sequence:', error);
      throw error;
    }
  }

  /**
   * Delete an automation sequence
   * @param {string} sequenceId - Sequence ID
   * @returns {Promise} API response
   */
  async deleteSequence(sequenceId) {
    try {
      const response = await adminApiService.apiCall(`/admin-automation-rules/${sequenceId}`, {
        method: 'DELETE'
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error deleting sequence:', error);
      throw error;
    }
  }

  /**
   * Toggle sequence active status
   * @param {string} sequenceId - Sequence ID
   * @returns {Promise} API response
   */
  async toggleSequence(sequenceId) {
    try {
      const response = await adminApiService.apiCall(`/admin-automation-rules/${sequenceId}/toggle`, {
        method: 'PUT'
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error toggling sequence:', error);
      throw error;
    }
  }

  /**
   * Duplicate an automation sequence
   * @param {string} sequenceId - Sequence ID
   * @returns {Promise} API response
   */
  async duplicateSequence(sequenceId) {
    try {
      const response = await adminApiService.apiCall(`/admin-automation-rules/${sequenceId}/duplicate`, {
        method: 'POST'
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error duplicating sequence:', error);
      throw error;
    }
  }

  /**
   * Assign funnel to automation rule
   * @param {string} ruleId - Rule ID
   * @param {string} funnelId - Funnel ID
   * @returns {Promise} API response
   */
  async assignFunnel(ruleId, funnelId) {
    try {
      const response = await adminApiService.apiCall(`/admin-automation-rules/${ruleId}/assign-funnel`, {
        method: 'PUT',
        body: JSON.stringify({ funnelId })
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error assigning funnel:', error);
      throw error;
    }
  }

  // ============================================================================
  // FLOWS MANAGEMENT
  // ============================================================================

  /**
   * Get flow controls
   * @returns {Promise} API response
   */
  async getFlows() {
    try {
      const response = await adminApiService.apiCall('/admin-automation-rules/flows');
      return { success: true, data: response.data || [] };
    } catch (error) {
      console.error('Error fetching flows:', error);
      return { success: true, data: [] }; // Return empty array on error
    }
  }

  // ============================================================================
  // EXECUTION MANAGEMENT
  // ============================================================================

  /**
   * Start automation run
   * @param {object} runData - Run configuration data
   * @returns {Promise} API response
   */
  async startAutomation(runData) {
    try {
      const response = await adminApiService.apiCall('/admin-automation-rules/run', {
        method: 'POST',
        body: JSON.stringify(runData)
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error starting automation:', error);
      throw error;
    }
  }

  /**
   * Get automation runs
   * @returns {Promise} API response
   */
  async getRuns() {
    try {
      const response = await adminApiService.apiCall('/admin-automation-rules/runs');
      return { success: true, data: response.data || [] };
    } catch (error) {
      console.error('Error fetching runs:', error);
      return { success: true, data: [] }; // Return empty array on error
    }
  }

  /**
   * Get detailed execution logs for a specific run
   * @param {string} executionId - Execution ID
   * @returns {Promise} API response
   */
  async getRunDetails(executionId) {
    try {
      const response = await adminApiService.apiCall(`/admin-automation-rules/runs/${executionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching run details:', error);
      return { success: false, data: null };
    }
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  /**
   * Get automation analytics
   * @returns {Promise} API response
   */
  async getAnalytics() {
    try {
      const response = await adminApiService.apiCall('/admin-automation-rules/analytics');
      return { success: true, data: response.data || {} };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return { success: true, data: {} }; // Return empty object on error
    }
  }

  // ============================================================================
  // BUILDER RESOURCES
  // ============================================================================

  /**
   * Get builder resources (funnels, etc.)
   * @returns {Promise} API response
   */
  async getBuilderResources() {
    try {
      const response = await adminApiService.apiCall('/admin-automation-rules/builder-resources');
      return { success: true, data: response.data || { funnels: [] } };
    } catch (error) {
      console.error('Error fetching builder resources:', error);
      return { success: true, data: { funnels: [] } }; // Return empty funnels on error
    }
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Get available events and actions for the builder
   * @returns {Promise} API response with comprehensive events and actions
   */
  async getEventsAndActions() {
    try {
      // Return comprehensive hardcoded data as provided
      const data = {
        events: {
          "Leads": [
            { label: "Lead Created", description: "Triggered when a new lead is created", value: "lead_created" },
            { label: "Lead Status Changed", description: "Triggered when a lead's status is updated", value: "lead_status_changed" },
            { label: "Lead Temperature Changed", description: "Triggered when a lead's temperature (hot/warm/cold) changes", value: "lead_temperature_changed" },
            { label: "Lead Converted to Client", description: "Triggered when a lead becomes a paying client", value: "lead_converted_to_client" },
            { label: "Lead Updated", description: "Triggered when any lead field is updated", value: "lead_updated" },
            { label: "Lead Tag Added", description: "Triggered when a tag is added to a lead", value: "lead_tag_added" },
            { label: "Lead Tag Removed", description: "Triggered when a tag is removed from a lead", value: "lead_tag_removed" }
          ],
          "Funnels": [
            { label: "Form Submitted", description: "Triggered when a form is submitted", value: "form_submitted" },
            { label: "Funnel Stage Entered", description: "Triggered when a lead enters a new funnel stage", value: "funnel_stage_entered" },
            { label: "Funnel Stage Exited", description: "Triggered when a lead exits a funnel stage", value: "funnel_stage_exited" },
            { label: "Funnel Completed", description: "Triggered when a lead completes the entire funnel", value: "funnel_completed" },
            { label: "Funnel Page Viewed", description: "Triggered when a lead views a funnel page", value: "funnel_page_viewed" }
          ],
          "Appointments": [
            { label: "Appointment Booked", description: "Triggered when an appointment is booked", value: "appointment_booked" },
            { label: "Appointment Rescheduled", description: "Triggered when an appointment is rescheduled", value: "appointment_rescheduled" },
            { label: "Appointment Cancelled", description: "Triggered when an appointment is cancelled", value: "appointment_cancelled" },
            { label: "Appointment Reminder Time", description: "Triggered at the scheduled reminder time before an appointment", value: "appointment_reminder_time" },
            { label: "Appointment Finished", description: "Triggered when an appointment is completed", value: "appointment_finished" },
            { label: "Appointment No Show", description: "Triggered when a lead doesn't show up for an appointment", value: "appointment_no_show" }
          ],
          "Communication": [
            { label: "Content Consumed", description: "Triggered when a lead consumes content (views, downloads, etc.)", value: "content_consumed" },
            { label: "Email Opened", description: "Triggered when an email is opened", value: "email_opened" },
            { label: "Email Clicked", description: "Triggered when a link in an email is clicked", value: "email_clicked" },
            { label: "Email Bounced", description: "Triggered when an email bounces", value: "email_bounced" },
            { label: "WhatsApp Message Received", description: "Triggered when a WhatsApp message is received", value: "whatsapp_message_received" },
            { label: "WhatsApp Message Sent", description: "Triggered when a WhatsApp message is sent", value: "whatsapp_message_sent" },
            { label: "SMS Received", description: "Triggered when an SMS is received", value: "sms_received" },
            { label: "SMS Sent", description: "Triggered when an SMS is sent", value: "sms_sent" }
          ],
          "Tasks": [
            { label: "Task Created", description: "Triggered when a new task is created", value: "task_created" },
            { label: "Task Completed", description: "Triggered when a task is marked as completed", value: "task_completed" },
            { label: "Task Overdue", description: "Triggered when a task becomes overdue", value: "task_overdue" },
            { label: "Task Assigned", description: "Triggered when a task is assigned to someone", value: "task_assigned" }
          ],
          "Payments": [
            { label: "Payment Successful", description: "Triggered when a payment is successfully processed", value: "payment_successful" },
            { label: "Payment Failed", description: "Triggered when a payment fails", value: "payment_failed" },
            { label: "Payment Link Clicked", description: "Triggered when a payment link is clicked", value: "payment_link_clicked" },
            { label: "Payment Abandoned", description: "Triggered when a payment process is abandoned", value: "payment_abandoned" },
            { label: "Card Expired", description: "Triggered when a payment card expires", value: "card_expired" }
          ]
        },
        actions: {
          "Lead Actions": [
            { label: "Update Lead Status", description: "Update the status of a lead", value: "update_lead_status" },
            { label: "Add Lead Tag", description: "Add a tag to a lead", value: "add_lead_tag" },
            { label: "Remove Lead Tag", description: "Remove a tag from a lead", value: "remove_lead_tag" },
            { label: "Assign Lead", description: "Assign a lead to a user", value: "assign_lead" },
            { label: "Create Task", description: "Create a new task for the lead", value: "create_task" }
          ],
          "Messages": [
            { label: "Send Email", description: "Send an email to the lead", value: "send_email" },
            { label: "Send WhatsApp Message", description: "Send a WhatsApp message to the lead", value: "send_whatsapp_message" },
            { label: "Send SMS", description: "Send an SMS to the lead", value: "send_sms" },
            { label: "Schedule Email", description: "Schedule an email to be sent later", value: "schedule_email" },
            { label: "Add to Email Sequence", description: "Add the lead to an email sequence", value: "add_to_email_sequence" }
          ],
          "Tasks": [
            { label: "Create Task", description: "Create a new task", value: "create_task" },
            { label: "Update Task", description: "Update an existing task", value: "update_task" },
            { label: "Assign Task", description: "Assign a task to someone", value: "assign_task" },
            { label: "Complete Task", description: "Mark a task as completed", value: "complete_task" },
            { label: "Delete Task", description: "Delete a task", value: "delete_task" }
          ],
          "System": [
            { label: "Wait/Delay", description: "Wait for a specified amount of time", value: "wait_delay" },
            { label: "Conditional Split", description: "Split workflow based on conditions", value: "conditional_split" },
            { label: "Webhook", description: "Send data to a webhook URL", value: "webhook" },
            { label: "API Call", description: "Make an API call", value: "api_call" },
            { label: "Update Custom Field", description: "Update a custom field value", value: "update_custom_field" }
          ],
          "Zoom": [
            { label: "Create Zoom Meeting", description: "Create a new Zoom meeting", value: "create_zoom_meeting" },
            { label: "Send Zoom Invite", description: "Send a Zoom meeting invite", value: "send_zoom_invite" },
            { label: "Cancel Zoom Meeting", description: "Cancel a Zoom meeting", value: "cancel_zoom_meeting" },
            { label: "Reschedule Zoom Meeting", description: "Reschedule a Zoom meeting", value: "reschedule_zoom_meeting" }
          ],
          "Payments": [
            { label: "Create Invoice", description: "Create an invoice for a lead", value: "create_invoice" },
            { label: "Issue Refund", description: "Issue a refund for a payment", value: "issue_refund" },
            { label: "Send Payment Link", description: "Send a payment link to the lead", value: "send_payment_link" },
            { label: "Update Payment Status", description: "Update the status of a payment", value: "update_payment_status" },
            { label: "Charge Card", description: "Charge a credit card", value: "charge_card" }
          ]
        }
      };

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching events and actions:', error);
      return { success: true, data: { events: {}, actions: {} } };
    }
  }

  /**
   * Validate a graph workflow
   * @param {object} workflowData - Workflow data to validate
   * @returns {Promise} API response
   */
  async validateWorkflow(workflowData) {
    try {
      const response = await adminApiService.apiCall('/admin-automation-rules/validate-graph', {
        method: 'POST',
        body: JSON.stringify(workflowData)
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error validating workflow:', error);
      throw error;
    }
  }

  /**
   * Test an automation rule
   * @param {string} ruleId - Rule ID to test
   * @param {object} testData - Test data
   * @returns {Promise} API response
   */
  async testAutomation(ruleId, testData) {
    try {
      const response = await adminApiService.apiCall(`/admin-automation-rules/${ruleId}/test`, {
        method: 'POST',
        body: JSON.stringify(testData)
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error testing automation:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const automationRulesService = new AutomationRulesService();

export default automationRulesService;
