import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// API_BASE_URL automatically switches between:
// - Development: http://localhost:8080/api
// - Production: https://api.funnelseye.com/api
const API_ENDPOINT = `${API_BASE_URL}/api`;

/**
 * Automation Rules Service
 * Handles all API calls to the automationsV2Routes endpoints
 */
class AutomationRulesService {
  constructor() {
    this.token = null;
    this.coachId = null;
  }

  /**
   * Set authentication token
   * @param {string} token - JWT token
   */
  setToken(token) {
    this.token = token;
  }

  /**
   * Set coach ID
   * @param {string} coachId - Coach ID
   */
  setCoachId(coachId) {
    this.coachId = coachId;
  }

  /**
   * Get default headers with authorization
   * @returns {object} Headers object
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  // ============================================================================
  // SEQUENCES MANAGEMENT
  // ============================================================================

  /**
   * Get all automation sequences for the coach
   * @returns {Promise} API response
   */
  async getSequences() {
    try {
      const response = await axios.get(`${API_ENDPOINT}/automation-rules`, {
        headers: this.getHeaders()
      });
      return response.data;
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
      const response = await axios.get(`${API_ENDPOINT}/automation-rules/${sequenceId}`, {
        headers: this.getHeaders()
      });
      return response.data;
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
      const response = await axios.post(`${API_ENDPOINT}/automation-rules`, sequenceData, {
        headers: this.getHeaders()
      });
      return response.data;
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
      const response = await axios.put(`${API_ENDPOINT}/automation-rules/${sequenceId}`, sequenceData, {
        headers: this.getHeaders()
      });
      return response.data;
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
      const response = await axios.delete(`${API_ENDPOINT}/automation-rules/${sequenceId}`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting sequence:', error);
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
      const response = await axios.get(`${API_ENDPOINT}/automations-v2/flows`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching flows:', error);
      throw error;
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
      const response = await axios.post(`${API_ENDPOINT}/automations-v2/run`, runData, {
        headers: this.getHeaders()
      });
      return response.data;
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
      const response = await axios.get(`${API_ENDPOINT}/automations-v2/runs`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching runs:', error);
      throw error;
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
      const response = await axios.get(`${API_ENDPOINT}/automations-v2/analytics`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  // ============================================================================
  // REPLY HANDLING
  // ============================================================================

  /**
   * Handle incoming reply
   * @param {object} replyData - Reply data
   * @returns {Promise} API response
   */
  async handleReply(replyData) {
    try {
      const response = await axios.post(`${API_ENDPOINT}/automations-v2/reply`, replyData, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error handling reply:', error);
      throw error;
    }
  }

  // ============================================================================
  // AI ANALYSIS
  // ============================================================================

  /**
   * Get AI analysis
   * @returns {Promise} API response
   */
  async getAIAnalysis() {
    try {
      const response = await axios.get(`${API_ENDPOINT}/automations-v2/ai-analysis`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
      throw error;
    }
  }

  // ============================================================================
  // MANUAL TRIGGERING
  // ============================================================================

  /**
   * Trigger automation manually
   * @param {object} triggerData - Trigger configuration
   * @returns {Promise} API response
   */
  async triggerAutomation(triggerData) {
    try {
      const response = await axios.post(`${API_ENDPOINT}/automations-v2/trigger`, triggerData, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error triggering automation:', error);
      throw error;
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
      const response = await axios.get(`${API_ENDPOINT}/automation-rules/events-actions`);
      return response.data.data; // Return the data property which contains events, actions, and categories
    } catch (error) {
      console.error('Error fetching events and actions:', error);
      throw error;
    }
  }

  /**
   * Validate a graph workflow
   * @param {object} workflowData - Workflow data to validate
   * @returns {Promise} API response
   */
  async validateWorkflow(workflowData) {
    try {
      const response = await axios.post(`${API_ENDPOINT}/automation-rules/validate-graph`, workflowData, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error validating workflow:', error);
      throw error;
    }
  }

  /**
   * Test an automation rule (if endpoint exists)
   * @param {string} ruleId - Rule ID to test
   * @param {object} testData - Test data
   * @returns {Promise} API response
   */
  async testAutomation(ruleId, testData) {
    try {
      const response = await axios.post(`${API_ENDPOINT}/automations-v2/test/${ruleId}`, testData, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error testing automation:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const automationRulesService = new AutomationRulesService();

export default automationRulesService;