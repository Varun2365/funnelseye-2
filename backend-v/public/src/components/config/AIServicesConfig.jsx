import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Zap, Save, AlertCircle } from 'lucide-react';

const AIServicesConfig = ({ config, onSave, saving }) => {
  const [formData, setFormData] = useState({
    // OpenAI Configuration
    enableOpenAI: config?.openai?.enableOpenAI || false,
    openaiApiKey: config?.openai?.openaiApiKey || '',
    openaiModel: config?.openai?.openaiModel || 'gpt-3.5-turbo',
    openaiMaxTokens: config?.openai?.openaiMaxTokens || 1000,
    openaiTemperature: config?.openai?.openaiTemperature || 0.7,
    
    // Google AI Configuration
    enableGoogleAI: config?.googleAI?.enableGoogleAI || false,
    googleAIApiKey: config?.googleAI?.googleAIApiKey || '',
    googleAIModel: config?.googleAI?.googleAIModel || 'gemini-pro',
    
    // Anthropic Configuration
    enableAnthropic: config?.anthropic?.enableAnthropic || false,
    anthropicApiKey: config?.anthropic?.anthropicApiKey || '',
    anthropicModel: config?.anthropic?.anthropicModel || 'claude-3-sonnet-20240229',
    
    // AI Content Generation
    enableContentGeneration: config?.contentGeneration?.enableContentGeneration || true,
    enableEmailGeneration: config?.contentGeneration?.enableEmailGeneration || true,
    enableSocialMediaGeneration: config?.contentGeneration?.enableSocialMediaGeneration || true,
    enableBlogGeneration: config?.contentGeneration?.enableBlogGeneration || true,
    enableAdCopyGeneration: config?.contentGeneration?.enableAdCopyGeneration || true,
    
    // AI Analytics
    enableAIAnalytics: config?.analytics?.enableAIAnalytics || true,
    enableSentimentAnalysis: config?.analytics?.enableSentimentAnalysis || true,
    enableTrendAnalysis: config?.analytics?.enableTrendAnalysis || true,
    enablePerformancePrediction: config?.analytics?.enablePerformancePrediction || true,
    
    // AI Automation
    enableAIAutomation: config?.automation?.enableAIAutomation || true,
    enableAutoResponses: config?.automation?.enableAutoResponses || true,
    enableSmartScheduling: config?.automation?.enableSmartScheduling || true,
    enableLeadScoring: config?.automation?.enableLeadScoring || true,
    enablePersonalization: config?.automation?.enablePersonalization || true,
    
    // AI Chatbot
    enableAIChatbot: config?.chatbot?.enableAIChatbot || false,
    chatbotModel: config?.chatbot?.chatbotModel || 'gpt-3.5-turbo',
    chatbotPersonality: config?.chatbot?.chatbotPersonality || 'professional',
    chatbotResponseTime: config?.chatbot?.chatbotResponseTime || 2,
    
    // AI Image Generation
    enableImageGeneration: config?.imageGeneration?.enableImageGeneration || false,
    imageGenerationProvider: config?.imageGeneration?.imageGenerationProvider || 'openai',
    imageGenerationModel: config?.imageGeneration?.imageGenerationModel || 'dall-e-3',
    imageGenerationSize: config?.imageGeneration?.imageGenerationSize || '1024x1024',
    
    // AI Voice Services
    enableVoiceServices: config?.voice?.enableVoiceServices || false,
    voiceProvider: config?.voice?.voiceProvider || 'elevenlabs',
    voiceModel: config?.voice?.voiceModel || 'eleven_multilingual_v2',
    voiceSpeed: config?.voice?.voiceSpeed || 1.0,
    
    // AI Translation
    enableTranslation: config?.translation?.enableTranslation || false,
    translationProvider: config?.translation?.translationProvider || 'google',
    supportedLanguages: config?.translation?.supportedLanguages || ['en', 'es', 'fr', 'de'],
    autoTranslation: config?.translation?.autoTranslation || false,
    
    // AI Settings
    enableAICaching: config?.settings?.enableAICaching || true,
    aiCacheExpirationHours: config?.settings?.aiCacheExpirationHours || 24,
    enableAILogging: config?.settings?.enableAILogging || true,
    aiLogRetentionDays: config?.settings?.aiLogRetentionDays || 30,
    enableAIMonitoring: config?.settings?.enableAIMonitoring || true,
    aiUsageLimit: config?.settings?.aiUsageLimit || 1000,
    aiUsageWindowHours: config?.settings?.aiUsageWindowHours || 24
  });

  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parentField, childField, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.enableOpenAI && !formData.openaiApiKey) {
      setError('OpenAI API Key is required when OpenAI is enabled');
      return;
    }
    
    if (formData.enableGoogleAI && !formData.googleAIApiKey) {
      setError('Google AI API Key is required when Google AI is enabled');
      return;
    }

    setError('');
    
    // Structure the data properly
    const structuredData = {
      openai: {
        enableOpenAI: formData.enableOpenAI,
        openaiApiKey: formData.openaiApiKey,
        openaiModel: formData.openaiModel,
        openaiMaxTokens: formData.openaiMaxTokens,
        openaiTemperature: formData.openaiTemperature
      },
      googleAI: {
        enableGoogleAI: formData.enableGoogleAI,
        googleAIApiKey: formData.googleAIApiKey,
        googleAIModel: formData.googleAIModel
      },
      anthropic: {
        enableAnthropic: formData.enableAnthropic,
        anthropicApiKey: formData.anthropicApiKey,
        anthropicModel: formData.anthropicModel
      },
      contentGeneration: {
        enableContentGeneration: formData.enableContentGeneration,
        enableEmailGeneration: formData.enableEmailGeneration,
        enableSocialMediaGeneration: formData.enableSocialMediaGeneration,
        enableBlogGeneration: formData.enableBlogGeneration,
        enableAdCopyGeneration: formData.enableAdCopyGeneration
      },
      analytics: {
        enableAIAnalytics: formData.enableAIAnalytics,
        enableSentimentAnalysis: formData.enableSentimentAnalysis,
        enableTrendAnalysis: formData.enableTrendAnalysis,
        enablePerformancePrediction: formData.enablePerformancePrediction
      },
      automation: {
        enableAIAutomation: formData.enableAIAutomation,
        enableAutoResponses: formData.enableAutoResponses,
        enableSmartScheduling: formData.enableSmartScheduling,
        enableLeadScoring: formData.enableLeadScoring,
        enablePersonalization: formData.enablePersonalization
      },
      chatbot: {
        enableAIChatbot: formData.enableAIChatbot,
        chatbotModel: formData.chatbotModel,
        chatbotPersonality: formData.chatbotPersonality,
        chatbotResponseTime: formData.chatbotResponseTime
      },
      imageGeneration: {
        enableImageGeneration: formData.enableImageGeneration,
        imageGenerationProvider: formData.imageGenerationProvider,
        imageGenerationModel: formData.imageGenerationModel,
        imageGenerationSize: formData.imageGenerationSize
      },
      voice: {
        enableVoiceServices: formData.enableVoiceServices,
        voiceProvider: formData.voiceProvider,
        voiceModel: formData.voiceModel,
        voiceSpeed: formData.voiceSpeed
      },
      translation: {
        enableTranslation: formData.enableTranslation,
        translationProvider: formData.translationProvider,
        supportedLanguages: formData.supportedLanguages,
        autoTranslation: formData.autoTranslation
      },
      settings: {
        enableAICaching: formData.enableAICaching,
        aiCacheExpirationHours: formData.aiCacheExpirationHours,
        enableAILogging: formData.enableAILogging,
        aiLogRetentionDays: formData.aiLogRetentionDays,
        enableAIMonitoring: formData.enableAIMonitoring,
        aiUsageLimit: formData.aiUsageLimit,
        aiUsageWindowHours: formData.aiUsageWindowHours
      }
    };
    
    onSave(structuredData);
  };

  const openaiModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'];
  const googleAIModels = ['gemini-pro', 'gemini-pro-vision'];
  const anthropicModels = ['claude-3-sonnet-20240229', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'];
  const chatbotPersonalities = ['professional', 'friendly', 'casual', 'formal', 'creative'];
  const imageProviders = ['openai', 'midjourney', 'stable-diffusion'];
  const imageSizes = ['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792'];
  const voiceProviders = ['elevenlabs', 'azure', 'google', 'amazon'];
  const translationProviders = ['google', 'azure', 'aws', 'deepl'];
  const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>AI Services Configuration</span>
        </CardTitle>
        <CardDescription>
          Configure AI services, models, and automation features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* OpenAI Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">OpenAI Configuration</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableOpenAI"
                  checked={formData.enableOpenAI}
                  onCheckedChange={(checked) => handleInputChange('enableOpenAI', checked)}
                />
                <Label htmlFor="enableOpenAI">Enable OpenAI</Label>
              </div>
            </div>
            
            {formData.enableOpenAI && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                  <Input
                    id="openaiApiKey"
                    type="password"
                    value={formData.openaiApiKey}
                    onChange={(e) => handleInputChange('openaiApiKey', e.target.value)}
                    placeholder="sk-..."
                  />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="openaiModel">OpenAI Model</Label>
                    <Select value={formData.openaiModel} onValueChange={(value) => handleInputChange('openaiModel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {openaiModels.map(model => (
                          <SelectItem key={model} value={model}>{model}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="openaiMaxTokens">Max Tokens</Label>
                    <Input
                      id="openaiMaxTokens"
                      type="number"
                      min="1"
                      max="4000"
                      value={formData.openaiMaxTokens}
                      onChange={(e) => handleInputChange('openaiMaxTokens', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="openaiTemperature">Temperature (0-2)</Label>
                  <Input
                    id="openaiTemperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={formData.openaiTemperature}
                    onChange={(e) => handleInputChange('openaiTemperature', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Google AI Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Google AI Configuration</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableGoogleAI"
                  checked={formData.enableGoogleAI}
                  onCheckedChange={(checked) => handleInputChange('enableGoogleAI', checked)}
                />
                <Label htmlFor="enableGoogleAI">Enable Google AI</Label>
              </div>
            </div>
            
            {formData.enableGoogleAI && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="googleAIApiKey">Google AI API Key</Label>
                  <Input
                    id="googleAIApiKey"
                    type="password"
                    value={formData.googleAIApiKey}
                    onChange={(e) => handleInputChange('googleAIApiKey', e.target.value)}
                    placeholder="Google AI API Key"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="googleAIModel">Google AI Model</Label>
                  <Select value={formData.googleAIModel} onValueChange={(value) => handleInputChange('googleAIModel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {googleAIModels.map(model => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Anthropic Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Anthropic Configuration</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableAnthropic"
                  checked={formData.enableAnthropic}
                  onCheckedChange={(checked) => handleInputChange('enableAnthropic', checked)}
                />
                <Label htmlFor="enableAnthropic">Enable Anthropic</Label>
              </div>
            </div>
            
            {formData.enableAnthropic && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="anthropicApiKey">Anthropic API Key</Label>
                  <Input
                    id="anthropicApiKey"
                    type="password"
                    value={formData.anthropicApiKey}
                    onChange={(e) => handleInputChange('anthropicApiKey', e.target.value)}
                    placeholder="Anthropic API Key"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="anthropicModel">Anthropic Model</Label>
                  <Select value={formData.anthropicModel} onValueChange={(value) => handleInputChange('anthropicModel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {anthropicModels.map(model => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Content Generation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Content Generation</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableContentGeneration"
                  checked={formData.enableContentGeneration}
                  onCheckedChange={(checked) => handleInputChange('enableContentGeneration', checked)}
                />
                <Label htmlFor="enableContentGeneration">Enable Content Generation</Label>
              </div>
            </div>
            
            {formData.enableContentGeneration && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableEmailGeneration"
                    checked={formData.enableEmailGeneration}
                    onCheckedChange={(checked) => handleInputChange('enableEmailGeneration', checked)}
                  />
                  <Label htmlFor="enableEmailGeneration">Email Generation</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableSocialMediaGeneration"
                    checked={formData.enableSocialMediaGeneration}
                    onCheckedChange={(checked) => handleInputChange('enableSocialMediaGeneration', checked)}
                  />
                  <Label htmlFor="enableSocialMediaGeneration">Social Media Generation</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableBlogGeneration"
                    checked={formData.enableBlogGeneration}
                    onCheckedChange={(checked) => handleInputChange('enableBlogGeneration', checked)}
                  />
                  <Label htmlFor="enableBlogGeneration">Blog Generation</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableAdCopyGeneration"
                    checked={formData.enableAdCopyGeneration}
                    onCheckedChange={(checked) => handleInputChange('enableAdCopyGeneration', checked)}
                  />
                  <Label htmlFor="enableAdCopyGeneration">Ad Copy Generation</Label>
                </div>
              </div>
            )}
          </div>

          {/* AI Analytics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI Analytics</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableAIAnalytics"
                  checked={formData.enableAIAnalytics}
                  onCheckedChange={(checked) => handleInputChange('enableAIAnalytics', checked)}
                />
                <Label htmlFor="enableAIAnalytics">Enable AI Analytics</Label>
              </div>
            </div>
            
            {formData.enableAIAnalytics && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableSentimentAnalysis"
                    checked={formData.enableSentimentAnalysis}
                    onCheckedChange={(checked) => handleInputChange('enableSentimentAnalysis', checked)}
                  />
                  <Label htmlFor="enableSentimentAnalysis">Sentiment Analysis</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableTrendAnalysis"
                    checked={formData.enableTrendAnalysis}
                    onCheckedChange={(checked) => handleInputChange('enableTrendAnalysis', checked)}
                  />
                  <Label htmlFor="enableTrendAnalysis">Trend Analysis</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enablePerformancePrediction"
                    checked={formData.enablePerformancePrediction}
                    onCheckedChange={(checked) => handleInputChange('enablePerformancePrediction', checked)}
                  />
                  <Label htmlFor="enablePerformancePrediction">Performance Prediction</Label>
                </div>
              </div>
            )}
          </div>

          {/* AI Automation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI Automation</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableAIAutomation"
                  checked={formData.enableAIAutomation}
                  onCheckedChange={(checked) => handleInputChange('enableAIAutomation', checked)}
                />
                <Label htmlFor="enableAIAutomation">Enable AI Automation</Label>
              </div>
            </div>
            
            {formData.enableAIAutomation && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableAutoResponses"
                    checked={formData.enableAutoResponses}
                    onCheckedChange={(checked) => handleInputChange('enableAutoResponses', checked)}
                  />
                  <Label htmlFor="enableAutoResponses">Auto Responses</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableSmartScheduling"
                    checked={formData.enableSmartScheduling}
                    onCheckedChange={(checked) => handleInputChange('enableSmartScheduling', checked)}
                  />
                  <Label htmlFor="enableSmartScheduling">Smart Scheduling</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableLeadScoring"
                    checked={formData.enableLeadScoring}
                    onCheckedChange={(checked) => handleInputChange('enableLeadScoring', checked)}
                  />
                  <Label htmlFor="enableLeadScoring">Lead Scoring</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enablePersonalization"
                    checked={formData.enablePersonalization}
                    onCheckedChange={(checked) => handleInputChange('enablePersonalization', checked)}
                  />
                  <Label htmlFor="enablePersonalization">Personalization</Label>
                </div>
              </div>
            )}
          </div>

          {/* AI Chatbot */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI Chatbot</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableAIChatbot"
                  checked={formData.enableAIChatbot}
                  onCheckedChange={(checked) => handleInputChange('enableAIChatbot', checked)}
                />
                <Label htmlFor="enableAIChatbot">Enable AI Chatbot</Label>
              </div>
            </div>
            
            {formData.enableAIChatbot && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="chatbotModel">Chatbot Model</Label>
                  <Select value={formData.chatbotModel} onValueChange={(value) => handleInputChange('chatbotModel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {openaiModels.map(model => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="chatbotPersonality">Personality</Label>
                  <Select value={formData.chatbotPersonality} onValueChange={(value) => handleInputChange('chatbotPersonality', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select personality" />
                    </SelectTrigger>
                    <SelectContent>
                      {chatbotPersonalities.map(personality => (
                        <SelectItem key={personality} value={personality}>
                          {personality.charAt(0).toUpperCase() + personality.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="chatbotResponseTime">Response Time (seconds)</Label>
                  <Input
                    id="chatbotResponseTime"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.chatbotResponseTime}
                    onChange={(e) => handleInputChange('chatbotResponseTime', parseInt(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* AI Image Generation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI Image Generation</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableImageGeneration"
                  checked={formData.enableImageGeneration}
                  onCheckedChange={(checked) => handleInputChange('enableImageGeneration', checked)}
                />
                <Label htmlFor="enableImageGeneration">Enable Image Generation</Label>
              </div>
            </div>
            
            {formData.enableImageGeneration && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="imageGenerationProvider">Provider</Label>
                  <Select value={formData.imageGenerationProvider} onValueChange={(value) => handleInputChange('imageGenerationProvider', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {imageProviders.map(provider => (
                        <SelectItem key={provider} value={provider}>
                          {provider.charAt(0).toUpperCase() + provider.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imageGenerationModel">Model</Label>
                  <Input
                    id="imageGenerationModel"
                    value={formData.imageGenerationModel}
                    onChange={(e) => handleInputChange('imageGenerationModel', e.target.value)}
                    placeholder="Model name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imageGenerationSize">Image Size</Label>
                  <Select value={formData.imageGenerationSize} onValueChange={(value) => handleInputChange('imageGenerationSize', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {imageSizes.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* AI Voice Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI Voice Services</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableVoiceServices"
                  checked={formData.enableVoiceServices}
                  onCheckedChange={(checked) => handleInputChange('enableVoiceServices', checked)}
                />
                <Label htmlFor="enableVoiceServices">Enable Voice Services</Label>
              </div>
            </div>
            
            {formData.enableVoiceServices && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="voiceProvider">Voice Provider</Label>
                  <Select value={formData.voiceProvider} onValueChange={(value) => handleInputChange('voiceProvider', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceProviders.map(provider => (
                        <SelectItem key={provider} value={provider}>
                          {provider.charAt(0).toUpperCase() + provider.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="voiceModel">Voice Model</Label>
                  <Input
                    id="voiceModel"
                    value={formData.voiceModel}
                    onChange={(e) => handleInputChange('voiceModel', e.target.value)}
                    placeholder="Voice model"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="voiceSpeed">Voice Speed</Label>
                  <Input
                    id="voiceSpeed"
                    type="number"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={formData.voiceSpeed}
                    onChange={(e) => handleInputChange('voiceSpeed', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* AI Translation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI Translation</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableTranslation"
                  checked={formData.enableTranslation}
                  onCheckedChange={(checked) => handleInputChange('enableTranslation', checked)}
                />
                <Label htmlFor="enableTranslation">Enable Translation</Label>
              </div>
            </div>
            
            {formData.enableTranslation && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="translationProvider">Translation Provider</Label>
                  <Select value={formData.translationProvider} onValueChange={(value) => handleInputChange('translationProvider', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {translationProviders.map(provider => (
                        <SelectItem key={provider} value={provider}>
                          {provider.charAt(0).toUpperCase() + provider.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoTranslation"
                      checked={formData.autoTranslation}
                      onCheckedChange={(checked) => handleInputChange('autoTranslation', checked)}
                    />
                    <Label htmlFor="autoTranslation">Auto Translation</Label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI Settings</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableAICaching"
                  checked={formData.enableAICaching}
                  onCheckedChange={(checked) => handleInputChange('enableAICaching', checked)}
                />
                <Label htmlFor="enableAICaching">Enable AI Caching</Label>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="aiCacheExpirationHours">Cache Expiration (hours)</Label>
                <Input
                  id="aiCacheExpirationHours"
                  type="number"
                  min="1"
                  max="168"
                  value={formData.aiCacheExpirationHours}
                  onChange={(e) => handleInputChange('aiCacheExpirationHours', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="aiUsageLimit">Usage Limit</Label>
                <Input
                  id="aiUsageLimit"
                  type="number"
                  min="100"
                  max="10000"
                  value={formData.aiUsageLimit}
                  onChange={(e) => handleInputChange('aiUsageLimit', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="aiUsageWindowHours">Usage Window (hours)</Label>
                <Input
                  id="aiUsageWindowHours"
                  type="number"
                  min="1"
                  max="168"
                  value={formData.aiUsageWindowHours}
                  onChange={(e) => handleInputChange('aiUsageWindowHours', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="aiLogRetentionDays">Log Retention (days)</Label>
                <Input
                  id="aiLogRetentionDays"
                  type="number"
                  min="7"
                  max="365"
                  value={formData.aiLogRetentionDays}
                  onChange={(e) => handleInputChange('aiLogRetentionDays', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableAILogging"
                  checked={formData.enableAILogging}
                  onCheckedChange={(checked) => handleInputChange('enableAILogging', checked)}
                />
                <Label htmlFor="enableAILogging">Enable AI Logging</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableAIMonitoring"
                  checked={formData.enableAIMonitoring}
                  onCheckedChange={(checked) => handleInputChange('enableAIMonitoring', checked)}
                />
                <Label htmlFor="enableAIMonitoring">Enable AI Monitoring</Label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save AI Services Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AIServicesConfig;
