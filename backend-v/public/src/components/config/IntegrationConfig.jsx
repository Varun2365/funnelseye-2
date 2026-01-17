import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { Zap, Save, AlertCircle } from 'lucide-react';

const IntegrationConfig = ({ config, onSave, saving }) => {
  const [formData, setFormData] = useState({
    // Zoom Integration
    enableZoom: config?.zoom?.enableZoom || false,
    zoomApiKey: config?.zoom?.zoomApiKey || '',
    zoomApiSecret: config?.zoom?.zoomApiSecret || '',
    zoomWebhookSecret: config?.zoom?.zoomWebhookSecret || '',
    
    // Google Analytics
    enableGoogleAnalytics: config?.googleAnalytics?.enableGoogleAnalytics || false,
    googleAnalyticsId: config?.googleAnalytics?.googleAnalyticsId || '',
    googleTagManagerId: config?.googleAnalytics?.googleTagManagerId || '',
    
    // Facebook/Meta Integration
    enableFacebookIntegration: config?.facebook?.enableFacebookIntegration || false,
    facebookAppId: config?.facebook?.facebookAppId || '',
    facebookAppSecret: config?.facebook?.facebookAppSecret || '',
    facebookAccessToken: config?.facebook?.facebookAccessToken || '',
    
    // Instagram Integration
    enableInstagramIntegration: config?.instagram?.enableInstagramIntegration || false,
    instagramAccessToken: config?.instagram?.instagramAccessToken || '',
    instagramBusinessAccountId: config?.instagram?.instagramBusinessAccountId || '',
    
    // LinkedIn Integration
    enableLinkedInIntegration: config?.linkedin?.enableLinkedInIntegration || false,
    linkedinClientId: config?.linkedin?.linkedinClientId || '',
    linkedinClientSecret: config?.linkedin?.linkedinClientSecret || '',
    
    // Twitter Integration
    enableTwitterIntegration: config?.twitter?.enableTwitterIntegration || false,
    twitterApiKey: config?.twitter?.twitterApiKey || '',
    twitterApiSecret: config?.twitter?.twitterApiSecret || '',
    twitterAccessToken: config?.twitter?.twitterAccessToken || '',
    twitterAccessTokenSecret: config?.twitter?.twitterAccessTokenSecret || '',
    
    // YouTube Integration
    enableYouTubeIntegration: config?.youtube?.enableYouTubeIntegration || false,
    youtubeApiKey: config?.youtube?.youtubeApiKey || '',
    youtubeChannelId: config?.youtube?.youtubeChannelId || '',
    
    // TikTok Integration
    enableTikTokIntegration: config?.tiktok?.enableTikTokIntegration || false,
    tiktokAccessToken: config?.tiktok?.tiktokAccessToken || '',
    tiktokAppId: config?.tiktok?.tiktokAppId || '',
    
    // Webhook Settings
    enableWebhooks: config?.webhooks?.enableWebhooks || false,
    webhookSecret: config?.webhooks?.webhookSecret || '',
    webhookRetryAttempts: config?.webhooks?.webhookRetryAttempts || 3,
    webhookTimeoutSeconds: config?.webhooks?.webhookTimeoutSeconds || 30,
    
    // API Rate Limits
    enableApiRateLimiting: config?.apiRateLimiting?.enableApiRateLimiting || true,
    defaultRateLimit: config?.apiRateLimiting?.defaultRateLimit || 100,
    rateLimitWindowMinutes: config?.apiRateLimiting?.rateLimitWindowMinutes || 15,
    
    // Third-party Services
    enableCloudflare: config?.cloudflare?.enableCloudflare || false,
    cloudflareApiToken: config?.cloudflare?.cloudflareApiToken || '',
    cloudflareZoneId: config?.cloudflare?.cloudflareZoneId || '',
    
    enableAWS: config?.aws?.enableAWS || false,
    awsAccessKeyId: config?.aws?.awsAccessKeyId || '',
    awsSecretAccessKey: config?.aws?.awsSecretAccessKey || '',
    awsRegion: config?.aws?.awsRegion || 'us-east-1',
    
    enableGoogleCloud: config?.googleCloud?.enableGoogleCloud || false,
    googleCloudProjectId: config?.googleCloud?.googleCloudProjectId || '',
    googleCloudServiceAccountKey: config?.googleCloud?.googleCloudServiceAccountKey || ''
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
    if (formData.enableZoom && !formData.zoomApiKey) {
      setError('Zoom API Key is required when Zoom integration is enabled');
      return;
    }
    
    if (formData.enableGoogleAnalytics && !formData.googleAnalyticsId) {
      setError('Google Analytics ID is required when Google Analytics is enabled');
      return;
    }

    setError('');
    
    // Structure the data properly
    const structuredData = {
      zoom: {
        enableZoom: formData.enableZoom,
        zoomApiKey: formData.zoomApiKey,
        zoomApiSecret: formData.zoomApiSecret,
        zoomWebhookSecret: formData.zoomWebhookSecret
      },
      googleAnalytics: {
        enableGoogleAnalytics: formData.enableGoogleAnalytics,
        googleAnalyticsId: formData.googleAnalyticsId,
        googleTagManagerId: formData.googleTagManagerId
      },
      facebook: {
        enableFacebookIntegration: formData.enableFacebookIntegration,
        facebookAppId: formData.facebookAppId,
        facebookAppSecret: formData.facebookAppSecret,
        facebookAccessToken: formData.facebookAccessToken
      },
      instagram: {
        enableInstagramIntegration: formData.enableInstagramIntegration,
        instagramAccessToken: formData.instagramAccessToken,
        instagramBusinessAccountId: formData.instagramBusinessAccountId
      },
      linkedin: {
        enableLinkedInIntegration: formData.enableLinkedInIntegration,
        linkedinClientId: formData.linkedinClientId,
        linkedinClientSecret: formData.linkedinClientSecret
      },
      twitter: {
        enableTwitterIntegration: formData.enableTwitterIntegration,
        twitterApiKey: formData.twitterApiKey,
        twitterApiSecret: formData.twitterApiSecret,
        twitterAccessToken: formData.twitterAccessToken,
        twitterAccessTokenSecret: formData.twitterAccessTokenSecret
      },
      youtube: {
        enableYouTubeIntegration: formData.enableYouTubeIntegration,
        youtubeApiKey: formData.youtubeApiKey,
        youtubeChannelId: formData.youtubeChannelId
      },
      tiktok: {
        enableTikTokIntegration: formData.enableTikTokIntegration,
        tiktokAccessToken: formData.tiktokAccessToken,
        tiktokAppId: formData.tiktokAppId
      },
      webhooks: {
        enableWebhooks: formData.enableWebhooks,
        webhookSecret: formData.webhookSecret,
        webhookRetryAttempts: formData.webhookRetryAttempts,
        webhookTimeoutSeconds: formData.webhookTimeoutSeconds
      },
      apiRateLimiting: {
        enableApiRateLimiting: formData.enableApiRateLimiting,
        defaultRateLimit: formData.defaultRateLimit,
        rateLimitWindowMinutes: formData.rateLimitWindowMinutes
      },
      cloudflare: {
        enableCloudflare: formData.enableCloudflare,
        cloudflareApiToken: formData.cloudflareApiToken,
        cloudflareZoneId: formData.cloudflareZoneId
      },
      aws: {
        enableAWS: formData.enableAWS,
        awsAccessKeyId: formData.awsAccessKeyId,
        awsSecretAccessKey: formData.awsSecretAccessKey,
        awsRegion: formData.awsRegion
      },
      googleCloud: {
        enableGoogleCloud: formData.enableGoogleCloud,
        googleCloudProjectId: formData.googleCloudProjectId,
        googleCloudServiceAccountKey: formData.googleCloudServiceAccountKey
      }
    };
    
    onSave(structuredData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>Integration Configuration</span>
        </CardTitle>
        <CardDescription>
          Configure third-party integrations and API connections
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

          {/* Zoom Integration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Zoom Integration</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableZoom"
                  checked={formData.enableZoom}
                  onCheckedChange={(checked) => handleInputChange('enableZoom', checked)}
                />
                <Label htmlFor="enableZoom">Enable Zoom Integration</Label>
              </div>
            </div>
            
            {formData.enableZoom && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="zoomApiKey">Zoom API Key</Label>
                  <Input
                    id="zoomApiKey"
                    value={formData.zoomApiKey}
                    onChange={(e) => handleInputChange('zoomApiKey', e.target.value)}
                    placeholder="Zoom API Key"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zoomApiSecret">Zoom API Secret</Label>
                  <Input
                    id="zoomApiSecret"
                    type="password"
                    value={formData.zoomApiSecret}
                    onChange={(e) => handleInputChange('zoomApiSecret', e.target.value)}
                    placeholder="Zoom API Secret"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zoomWebhookSecret">Zoom Webhook Secret</Label>
                  <Input
                    id="zoomWebhookSecret"
                    type="password"
                    value={formData.zoomWebhookSecret}
                    onChange={(e) => handleInputChange('zoomWebhookSecret', e.target.value)}
                    placeholder="Zoom Webhook Secret"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Google Analytics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Google Analytics</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableGoogleAnalytics"
                  checked={formData.enableGoogleAnalytics}
                  onCheckedChange={(checked) => handleInputChange('enableGoogleAnalytics', checked)}
                />
                <Label htmlFor="enableGoogleAnalytics">Enable Google Analytics</Label>
              </div>
            </div>
            
            {formData.enableGoogleAnalytics && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    value={formData.googleAnalyticsId}
                    onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
                  <Input
                    id="googleTagManagerId"
                    value={formData.googleTagManagerId}
                    onChange={(e) => handleInputChange('googleTagManagerId', e.target.value)}
                    placeholder="GTM-XXXXXXX"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Facebook/Meta Integration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Facebook/Meta Integration</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableFacebookIntegration"
                  checked={formData.enableFacebookIntegration}
                  onCheckedChange={(checked) => handleInputChange('enableFacebookIntegration', checked)}
                />
                <Label htmlFor="enableFacebookIntegration">Enable Facebook Integration</Label>
              </div>
            </div>
            
            {formData.enableFacebookIntegration && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="facebookAppId">Facebook App ID</Label>
                  <Input
                    id="facebookAppId"
                    value={formData.facebookAppId}
                    onChange={(e) => handleInputChange('facebookAppId', e.target.value)}
                    placeholder="Facebook App ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="facebookAppSecret">Facebook App Secret</Label>
                  <Input
                    id="facebookAppSecret"
                    type="password"
                    value={formData.facebookAppSecret}
                    onChange={(e) => handleInputChange('facebookAppSecret', e.target.value)}
                    placeholder="Facebook App Secret"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="facebookAccessToken">Facebook Access Token</Label>
                  <Input
                    id="facebookAccessToken"
                    type="password"
                    value={formData.facebookAccessToken}
                    onChange={(e) => handleInputChange('facebookAccessToken', e.target.value)}
                    placeholder="Facebook Access Token"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Instagram Integration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Instagram Integration</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableInstagramIntegration"
                  checked={formData.enableInstagramIntegration}
                  onCheckedChange={(checked) => handleInputChange('enableInstagramIntegration', checked)}
                />
                <Label htmlFor="enableInstagramIntegration">Enable Instagram Integration</Label>
              </div>
            </div>
            
            {formData.enableInstagramIntegration && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="instagramAccessToken">Instagram Access Token</Label>
                  <Input
                    id="instagramAccessToken"
                    type="password"
                    value={formData.instagramAccessToken}
                    onChange={(e) => handleInputChange('instagramAccessToken', e.target.value)}
                    placeholder="Instagram Access Token"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instagramBusinessAccountId">Instagram Business Account ID</Label>
                  <Input
                    id="instagramBusinessAccountId"
                    value={formData.instagramBusinessAccountId}
                    onChange={(e) => handleInputChange('instagramBusinessAccountId', e.target.value)}
                    placeholder="Instagram Business Account ID"
                  />
                </div>
              </div>
            )}
          </div>

          {/* LinkedIn Integration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">LinkedIn Integration</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableLinkedInIntegration"
                  checked={formData.enableLinkedInIntegration}
                  onCheckedChange={(checked) => handleInputChange('enableLinkedInIntegration', checked)}
                />
                <Label htmlFor="enableLinkedInIntegration">Enable LinkedIn Integration</Label>
              </div>
            </div>
            
            {formData.enableLinkedInIntegration && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="linkedinClientId">LinkedIn Client ID</Label>
                  <Input
                    id="linkedinClientId"
                    value={formData.linkedinClientId}
                    onChange={(e) => handleInputChange('linkedinClientId', e.target.value)}
                    placeholder="LinkedIn Client ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedinClientSecret">LinkedIn Client Secret</Label>
                  <Input
                    id="linkedinClientSecret"
                    type="password"
                    value={formData.linkedinClientSecret}
                    onChange={(e) => handleInputChange('linkedinClientSecret', e.target.value)}
                    placeholder="LinkedIn Client Secret"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Twitter Integration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Twitter Integration</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableTwitterIntegration"
                  checked={formData.enableTwitterIntegration}
                  onCheckedChange={(checked) => handleInputChange('enableTwitterIntegration', checked)}
                />
                <Label htmlFor="enableTwitterIntegration">Enable Twitter Integration</Label>
              </div>
            </div>
            
            {formData.enableTwitterIntegration && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="twitterApiKey">Twitter API Key</Label>
                  <Input
                    id="twitterApiKey"
                    value={formData.twitterApiKey}
                    onChange={(e) => handleInputChange('twitterApiKey', e.target.value)}
                    placeholder="Twitter API Key"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twitterApiSecret">Twitter API Secret</Label>
                  <Input
                    id="twitterApiSecret"
                    type="password"
                    value={formData.twitterApiSecret}
                    onChange={(e) => handleInputChange('twitterApiSecret', e.target.value)}
                    placeholder="Twitter API Secret"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twitterAccessToken">Twitter Access Token</Label>
                  <Input
                    id="twitterAccessToken"
                    type="password"
                    value={formData.twitterAccessToken}
                    onChange={(e) => handleInputChange('twitterAccessToken', e.target.value)}
                    placeholder="Twitter Access Token"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twitterAccessTokenSecret">Twitter Access Token Secret</Label>
                  <Input
                    id="twitterAccessTokenSecret"
                    type="password"
                    value={formData.twitterAccessTokenSecret}
                    onChange={(e) => handleInputChange('twitterAccessTokenSecret', e.target.value)}
                    placeholder="Twitter Access Token Secret"
                  />
                </div>
              </div>
            )}
          </div>

          {/* YouTube Integration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">YouTube Integration</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableYouTubeIntegration"
                  checked={formData.enableYouTubeIntegration}
                  onCheckedChange={(checked) => handleInputChange('enableYouTubeIntegration', checked)}
                />
                <Label htmlFor="enableYouTubeIntegration">Enable YouTube Integration</Label>
              </div>
            </div>
            
            {formData.enableYouTubeIntegration && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="youtubeApiKey">YouTube API Key</Label>
                  <Input
                    id="youtubeApiKey"
                    value={formData.youtubeApiKey}
                    onChange={(e) => handleInputChange('youtubeApiKey', e.target.value)}
                    placeholder="YouTube API Key"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="youtubeChannelId">YouTube Channel ID</Label>
                  <Input
                    id="youtubeChannelId"
                    value={formData.youtubeChannelId}
                    onChange={(e) => handleInputChange('youtubeChannelId', e.target.value)}
                    placeholder="YouTube Channel ID"
                  />
                </div>
              </div>
            )}
          </div>

          {/* TikTok Integration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">TikTok Integration</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableTikTokIntegration"
                  checked={formData.enableTikTokIntegration}
                  onCheckedChange={(checked) => handleInputChange('enableTikTokIntegration', checked)}
                />
                <Label htmlFor="enableTikTokIntegration">Enable TikTok Integration</Label>
              </div>
            </div>
            
            {formData.enableTikTokIntegration && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tiktokAccessToken">TikTok Access Token</Label>
                  <Input
                    id="tiktokAccessToken"
                    type="password"
                    value={formData.tiktokAccessToken}
                    onChange={(e) => handleInputChange('tiktokAccessToken', e.target.value)}
                    placeholder="TikTok Access Token"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tiktokAppId">TikTok App ID</Label>
                  <Input
                    id="tiktokAppId"
                    value={formData.tiktokAppId}
                    onChange={(e) => handleInputChange('tiktokAppId', e.target.value)}
                    placeholder="TikTok App ID"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Webhook Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Webhook Settings</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableWebhooks"
                  checked={formData.enableWebhooks}
                  onCheckedChange={(checked) => handleInputChange('enableWebhooks', checked)}
                />
                <Label htmlFor="enableWebhooks">Enable Webhooks</Label>
              </div>
            </div>
            
            {formData.enableWebhooks && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="webhookSecret">Webhook Secret</Label>
                  <Input
                    id="webhookSecret"
                    type="password"
                    value={formData.webhookSecret}
                    onChange={(e) => handleInputChange('webhookSecret', e.target.value)}
                    placeholder="Webhook Secret"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhookRetryAttempts">Retry Attempts</Label>
                  <Input
                    id="webhookRetryAttempts"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.webhookRetryAttempts}
                    onChange={(e) => handleInputChange('webhookRetryAttempts', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhookTimeoutSeconds">Timeout (seconds)</Label>
                  <Input
                    id="webhookTimeoutSeconds"
                    type="number"
                    min="5"
                    max="300"
                    value={formData.webhookTimeoutSeconds}
                    onChange={(e) => handleInputChange('webhookTimeoutSeconds', parseInt(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* API Rate Limiting */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">API Rate Limiting</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableApiRateLimiting"
                  checked={formData.enableApiRateLimiting}
                  onCheckedChange={(checked) => handleInputChange('enableApiRateLimiting', checked)}
                />
                <Label htmlFor="enableApiRateLimiting">Enable API Rate Limiting</Label>
              </div>
            </div>
            
            {formData.enableApiRateLimiting && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultRateLimit">Default Rate Limit</Label>
                  <Input
                    id="defaultRateLimit"
                    type="number"
                    min="10"
                    max="10000"
                    value={formData.defaultRateLimit}
                    onChange={(e) => handleInputChange('defaultRateLimit', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rateLimitWindowMinutes">Rate Limit Window (minutes)</Label>
                  <Input
                    id="rateLimitWindowMinutes"
                    type="number"
                    min="1"
                    max="60"
                    value={formData.rateLimitWindowMinutes}
                    onChange={(e) => handleInputChange('rateLimitWindowMinutes', parseInt(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cloud Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cloud Services</h3>
            
            {/* Cloudflare */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableCloudflare"
                  checked={formData.enableCloudflare}
                  onCheckedChange={(checked) => handleInputChange('enableCloudflare', checked)}
                />
                <Label htmlFor="enableCloudflare">Enable Cloudflare</Label>
              </div>
            </div>
            
            {formData.enableCloudflare && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cloudflareApiToken">Cloudflare API Token</Label>
                  <Input
                    id="cloudflareApiToken"
                    type="password"
                    value={formData.cloudflareApiToken}
                    onChange={(e) => handleInputChange('cloudflareApiToken', e.target.value)}
                    placeholder="Cloudflare API Token"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cloudflareZoneId">Cloudflare Zone ID</Label>
                  <Input
                    id="cloudflareZoneId"
                    value={formData.cloudflareZoneId}
                    onChange={(e) => handleInputChange('cloudflareZoneId', e.target.value)}
                    placeholder="Cloudflare Zone ID"
                  />
                </div>
              </div>
            )}
            
            {/* AWS */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableAWS"
                  checked={formData.enableAWS}
                  onCheckedChange={(checked) => handleInputChange('enableAWS', checked)}
                />
                <Label htmlFor="enableAWS">Enable AWS</Label>
              </div>
            </div>
            
            {formData.enableAWS && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="awsAccessKeyId">AWS Access Key ID</Label>
                  <Input
                    id="awsAccessKeyId"
                    value={formData.awsAccessKeyId}
                    onChange={(e) => handleInputChange('awsAccessKeyId', e.target.value)}
                    placeholder="AWS Access Key ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="awsSecretAccessKey">AWS Secret Access Key</Label>
                  <Input
                    id="awsSecretAccessKey"
                    type="password"
                    value={formData.awsSecretAccessKey}
                    onChange={(e) => handleInputChange('awsSecretAccessKey', e.target.value)}
                    placeholder="AWS Secret Access Key"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="awsRegion">AWS Region</Label>
                  <Input
                    id="awsRegion"
                    value={formData.awsRegion}
                    onChange={(e) => handleInputChange('awsRegion', e.target.value)}
                    placeholder="us-east-1"
                  />
                </div>
              </div>
            )}
            
            {/* Google Cloud */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableGoogleCloud"
                  checked={formData.enableGoogleCloud}
                  onCheckedChange={(checked) => handleInputChange('enableGoogleCloud', checked)}
                />
                <Label htmlFor="enableGoogleCloud">Enable Google Cloud</Label>
              </div>
            </div>
            
            {formData.enableGoogleCloud && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="googleCloudProjectId">Google Cloud Project ID</Label>
                  <Input
                    id="googleCloudProjectId"
                    value={formData.googleCloudProjectId}
                    onChange={(e) => handleInputChange('googleCloudProjectId', e.target.value)}
                    placeholder="Google Cloud Project ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="googleCloudServiceAccountKey">Service Account Key</Label>
                  <Input
                    id="googleCloudServiceAccountKey"
                    type="password"
                    value={formData.googleCloudServiceAccountKey}
                    onChange={(e) => handleInputChange('googleCloudServiceAccountKey', e.target.value)}
                    placeholder="Service Account Key"
                  />
                </div>
              </div>
            )}
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
                  Save Integration Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default IntegrationConfig;
