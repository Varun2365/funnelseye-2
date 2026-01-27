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
   * @returns {Promise} API response
   */
  async getEventsAndActions() {
    try {
      const response = await adminApiService.apiCall('/admin-automation-rules/events-actions');
      return { success: true, data: response.data || { events: [], actions: [], categories: [] } };
    } catch (error) {
      console.error('Error fetching events and actions:', error);
      return { success: true, data: { events: [], actions: [], categories: [] } };
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
