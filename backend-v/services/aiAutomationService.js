const axios = require('axios');
const natural = require('natural');
const Sentiment = require('sentiment');

class AIAutomationService {
  constructor() {
    this.sentiment = new Sentiment();
    this.classifier = new natural.BayesClassifier();

    // Train the classifier with common reply patterns
    this.trainClassifier();
  }

  // Train the classifier with common reply patterns
  trainClassifier() {
    // Positive responses
    this.classifier.addDocument('yes i am interested', 'positive_interest');
    this.classifier.addDocument('im interested', 'positive_interest');
    this.classifier.addDocument('sounds good', 'positive_interest');
    this.classifier.addDocument('yes please', 'positive_interest');
    this.classifier.addDocument('im in', 'positive_interest');
    this.classifier.addDocument('lets do it', 'positive_interest');
    this.classifier.addDocument('count me in', 'positive_interest');
    this.classifier.addDocument('i want to proceed', 'positive_interest');

    // Negative responses
    this.classifier.addDocument('no thanks', 'negative_rejection');
    this.classifier.addDocument('not interested', 'negative_rejection');
    this.classifier.addDocument('no thank you', 'negative_rejection');
    this.classifier.addDocument('i pass', 'negative_rejection');
    this.classifier.addDocument('not for me', 'negative_rejection');

    // Questions/Clarifications
    this.classifier.addDocument('can you tell me more', 'question_clarification');
    this.classifier.addDocument('what does it include', 'question_clarification');
    this.classifier.addDocument('how much does it cost', 'question_clarification');
    this.classifier.addDocument('what is the price', 'question_clarification');
    this.classifier.addDocument('how does it work', 'question_clarification');
    this.classifier.addDocument('tell me more', 'question_clarification');
    this.classifier.addDocument('explain please', 'question_clarification');

    // Objections
    this.classifier.addDocument('i need to think about it', 'objection_hesitation');
    this.classifier.addDocument('maybe later', 'objection_hesitation');
    this.classifier.addDocument('im not sure', 'objection_hesitation');
    this.classifier.addDocument('let me check', 'objection_hesitation');
    this.classifier.addDocument('i need time', 'objection_hesitation');

    // Time-related requests
    this.classifier.addDocument('can we schedule a call', 'request_call');
    this.classifier.addDocument('lets talk', 'request_call');
    this.classifier.addDocument('i want to speak', 'request_call');
    this.classifier.addDocument('call me', 'request_call');
    this.classifier.addDocument('schedule time', 'request_call');

    this.classifier.train();
  }

  // Analyze reply content
  async analyzeReply(replyContent, context = {}) {
    try {
      const result = {
        sentiment: this.analyzeSentiment(replyContent),
        intent: this.classifyIntent(replyContent),
        confidence: 0,
        suggestedAction: '',
        extractedData: {},
        keywords: this.extractKeywords(replyContent)
      };

      // Calculate confidence based on classification
      const classifications = this.classifier.getClassifications(replyContent.toLowerCase());
      if (classifications.length > 0) {
        result.confidence = classifications[0].value;
      }

      // Determine suggested action based on intent and sentiment
      result.suggestedAction = this.determineAction(result.intent, result.sentiment, context);

      // Extract specific data from reply
      result.extractedData = this.extractData(replyContent);

      return result;
    } catch (error) {
      console.error('Error analyzing reply:', error);
      return {
        sentiment: 'neutral',
        intent: 'unknown',
        confidence: 0,
        suggestedAction: 'continue_sequence',
        extractedData: {},
        keywords: [],
        error: error.message
      };
    }
  }

  // Analyze sentiment of text
  analyzeSentiment(text) {
    const result = this.sentiment.analyze(text);

    if (result.score > 1) return 'positive';
    if (result.score < -1) return 'negative';
    return 'neutral';
  }

  // Classify intent using trained classifier
  classifyIntent(text) {
    return this.classifier.classify(text.toLowerCase());
  }

  // Extract keywords from text
  extractKeywords(text) {
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text.toLowerCase());

    // Common keywords to look for
    const keywords = [
      'yes', 'no', 'interested', 'not interested', 'question', 'price', 'cost',
      'call', 'schedule', 'meeting', 'time', 'later', 'now', 'urgent', 'help'
    ];

    return tokens.filter(token => keywords.includes(token));
  }

  // Extract structured data from reply
  extractData(text) {
    const data = {};
    const lowerText = text.toLowerCase();

    // Extract phone numbers
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/g;
    const phones = text.match(phoneRegex);
    if (phones) data.phoneNumbers = phones;

    // Extract email addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex);
    if (emails) data.emails = emails;

    // Extract dates/times
    const dateKeywords = ['tomorrow', 'today', 'next week', 'next month'];
    const foundDates = dateKeywords.filter(keyword => lowerText.includes(keyword));
    if (foundDates.length > 0) data.dates = foundDates;

    // Extract urgency indicators
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'right now', 'quickly'];
    const urgentIndicators = urgentKeywords.filter(keyword => lowerText.includes(keyword));
    if (urgentIndicators.length > 0) data.urgency = urgentIndicators;

    return data;
  }

  // Determine next action based on analysis
  determineAction(intent, sentiment, context) {
    const { currentStep, sequenceType } = context;

    // Handle different intents
    switch (intent) {
      case 'positive_interest':
        return sentiment === 'positive' ? 'book_appointment' : 'send_more_info';

      case 'negative_rejection':
        return 'stop_sequence';

      case 'question_clarification':
        return 'send_answer';

      case 'objection_hesitation':
        return 'send_follow_up';

      case 'request_call':
        return 'schedule_call';

      default:
        // Fallback based on sentiment
        if (sentiment === 'positive') return 'continue_sequence';
        if (sentiment === 'negative') return 'send_reengagement';
        return 'monitor_reply';
    }
  }

  // Make decision for next sequence step
  async makeSequenceDecision(runData, replyAnalysis) {
    try {
      const { currentStep, sequence, leadData } = runData;

      // Decision logic based on analysis
      let nextAction = 'continue_sequence';
      let confidence = replyAnalysis.confidence || 0;

      // High confidence decisions
      if (confidence > 0.8) {
        nextAction = replyAnalysis.suggestedAction;
      }

      // Context-aware decisions
      if (replyAnalysis.intent === 'request_call' && confidence > 0.7) {
        nextAction = 'schedule_call';
      }

      if (replyAnalysis.sentiment === 'negative' && confidence > 0.6) {
        nextAction = 'send_reengagement';
      }

      return {
        action: nextAction,
        confidence: confidence,
        reasoning: `AI analyzed reply with ${Math.round(confidence * 100)}% confidence: ${replyAnalysis.intent} intent with ${replyAnalysis.sentiment} sentiment`,
        nextStepId: this.calculateNextStep(sequence, currentStep, nextAction)
      };

    } catch (error) {
      console.error('Error making sequence decision:', error);
      return {
        action: 'continue_sequence',
        confidence: 0,
        reasoning: 'Error in AI decision making, continuing sequence',
        nextStepId: null
      };
    }
  }

  // Calculate next step in sequence
  calculateNextStep(sequence, currentStepId, action) {
    const currentStep = sequence.steps.find(step => step.stepId === currentStepId);
    if (!currentStep || !currentStep.nextSteps) return null;

    // Find conditional next step
    const conditionalStep = currentStep.nextSteps.find(step =>
      step.condition && step.condition.toLowerCase() === action.toLowerCase()
    );

    if (conditionalStep) return conditionalStep.stepId;

    // Default to first next step
    return currentStep.nextSteps[0]?.stepId || null;
  }

  // Generate dynamic message content based on context
  generateDynamicContent(template, variables, leadData) {
    let content = template;

    // Replace variables
    if (variables) {
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, variables[key]);
      });
    }

    // Replace lead data
    if (leadData) {
      Object.keys(leadData).forEach(key => {
        const regex = new RegExp(`{{lead.${key}}}`, 'g');
        content = content.replace(regex, leadData[key] || '');
      });
    }

    return content;
  }

  // Optimize sequence based on performance data
  optimizeSequence(sequenceData, performanceMetrics) {
    const optimizations = [];

    // Analyze reply rates and optimize timing
    if (performanceMetrics.avgReplyTime > 24 * 60) { // 24 hours
      optimizations.push({
        type: 'timing',
        suggestion: 'Increase message frequency for faster engagement',
        impact: 'high'
      });
    }

    // Analyze content performance
    const lowPerformingSteps = performanceMetrics.stepPerformance.filter(
      step => step.replyRate < 0.1
    );

    if (lowPerformingSteps.length > 0) {
      optimizations.push({
        type: 'content',
        suggestion: 'Review and optimize low-performing message content',
        steps: lowPerformingSteps.map(s => s.stepId),
        impact: 'medium'
      });
    }

    return optimizations;
  }
}

module.exports = new AIAutomationService();
