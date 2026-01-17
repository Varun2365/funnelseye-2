import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Bell, Save, AlertCircle } from 'lucide-react';

const NotificationConfig = ({ config, onSave, saving }) => {
  const [formData, setFormData] = useState({
    // Email Notifications
    enableEmailNotifications: config?.email?.enableEmailNotifications || true,
    emailProvider: config?.email?.emailProvider || 'smtp',
    smtpHost: config?.email?.smtpHost || '',
    smtpPort: config?.email?.smtpPort || 587,
    smtpSecure: config?.email?.smtpSecure || false,
    smtpUser: config?.email?.smtpUser || '',
    smtpPassword: config?.email?.smtpPassword || '',
    fromEmail: config?.email?.fromEmail || '',
    fromName: config?.email?.fromName || 'FunnelsEye',
    
    // SMS Notifications
    enableSMSNotifications: config?.sms?.enableSMSNotifications || false,
    smsProvider: config?.sms?.smsProvider || 'twilio',
    twilioAccountSid: config?.sms?.twilioAccountSid || '',
    twilioAuthToken: config?.sms?.twilioAuthToken || '',
    twilioPhoneNumber: config?.sms?.twilioPhoneNumber || '',
    
    // Push Notifications
    enablePushNotifications: config?.push?.enablePushNotifications || true,
    firebaseServerKey: config?.push?.firebaseServerKey || '',
    vapidPublicKey: config?.push?.vapidPublicKey || '',
    vapidPrivateKey: config?.push?.vapidPrivateKey || '',
    
    // WhatsApp Notifications
    enableWhatsAppNotifications: config?.whatsapp?.enableWhatsAppNotifications || false,
    whatsappApiUrl: config?.whatsapp?.whatsappApiUrl || '',
    whatsappApiKey: config?.whatsapp?.whatsappApiKey || '',
    whatsappPhoneNumber: config?.whatsapp?.whatsappPhoneNumber || '',
    
    // Notification Templates
    enableTemplates: config?.templates?.enableTemplates || true,
    defaultLanguage: config?.templates?.defaultLanguage || 'en',
    enableMultiLanguage: config?.templates?.enableMultiLanguage || false,
    
    // Notification Settings
    enableRealTimeNotifications: config?.settings?.enableRealTimeNotifications || true,
    notificationRetentionDays: config?.settings?.notificationRetentionDays || 30,
    enableNotificationHistory: config?.settings?.enableNotificationHistory || true,
    maxNotificationsPerUser: config?.settings?.maxNotificationsPerUser || 1000,
    
    // Notification Types
    enableSystemNotifications: config?.types?.enableSystemNotifications || true,
    enableMarketingNotifications: config?.types?.enableMarketingNotifications || true,
    enableTransactionNotifications: config?.types?.enableTransactionNotifications || true,
    enableSecurityNotifications: config?.types?.enableSecurityNotifications || true,
    enableMLMNotifications: config?.types?.enableMLMNotifications || true,
    
    // Delivery Settings
    enableDeliveryTracking: config?.delivery?.enableDeliveryTracking || true,
    enableReadReceipts: config?.delivery?.enableReadReceipts || true,
    enableDeliveryRetry: config?.delivery?.enableDeliveryRetry || true,
    maxRetryAttempts: config?.delivery?.maxRetryAttempts || 3,
    retryDelayMinutes: config?.delivery?.retryDelayMinutes || 5
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
    if (formData.enableEmailNotifications && !formData.fromEmail) {
      setError('From email is required when email notifications are enabled');
      return;
    }
    
    if (formData.enableSMSNotifications && !formData.twilioPhoneNumber) {
      setError('Twilio phone number is required when SMS notifications are enabled');
      return;
    }

    setError('');
    
    // Structure the data properly
    const structuredData = {
      email: {
        enableEmailNotifications: formData.enableEmailNotifications,
        emailProvider: formData.emailProvider,
        smtpHost: formData.smtpHost,
        smtpPort: formData.smtpPort,
        smtpSecure: formData.smtpSecure,
        smtpUser: formData.smtpUser,
        smtpPassword: formData.smtpPassword,
        fromEmail: formData.fromEmail,
        fromName: formData.fromName
      },
      sms: {
        enableSMSNotifications: formData.enableSMSNotifications,
        smsProvider: formData.smsProvider,
        twilioAccountSid: formData.twilioAccountSid,
        twilioAuthToken: formData.twilioAuthToken,
        twilioPhoneNumber: formData.twilioPhoneNumber
      },
      push: {
        enablePushNotifications: formData.enablePushNotifications,
        firebaseServerKey: formData.firebaseServerKey,
        vapidPublicKey: formData.vapidPublicKey,
        vapidPrivateKey: formData.vapidPrivateKey
      },
      whatsapp: {
        enableWhatsAppNotifications: formData.enableWhatsAppNotifications,
        whatsappApiUrl: formData.whatsappApiUrl,
        whatsappApiKey: formData.whatsappApiKey,
        whatsappPhoneNumber: formData.whatsappPhoneNumber
      },
      templates: {
        enableTemplates: formData.enableTemplates,
        defaultLanguage: formData.defaultLanguage,
        enableMultiLanguage: formData.enableMultiLanguage
      },
      settings: {
        enableRealTimeNotifications: formData.enableRealTimeNotifications,
        notificationRetentionDays: formData.notificationRetentionDays,
        enableNotificationHistory: formData.enableNotificationHistory,
        maxNotificationsPerUser: formData.maxNotificationsPerUser
      },
      types: {
        enableSystemNotifications: formData.enableSystemNotifications,
        enableMarketingNotifications: formData.enableMarketingNotifications,
        enableTransactionNotifications: formData.enableTransactionNotifications,
        enableSecurityNotifications: formData.enableSecurityNotifications,
        enableMLMNotifications: formData.enableMLMNotifications
      },
      delivery: {
        enableDeliveryTracking: formData.enableDeliveryTracking,
        enableReadReceipts: formData.enableReadReceipts,
        enableDeliveryRetry: formData.enableDeliveryRetry,
        maxRetryAttempts: formData.maxRetryAttempts,
        retryDelayMinutes: formData.retryDelayMinutes
      }
    };
    
    onSave(structuredData);
  };

  const emailProviders = ['smtp', 'sendgrid', 'mailgun', 'ses'];
  const smsProviders = ['twilio', 'messagebird', 'nexmo'];
  const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Notification Configuration</span>
        </CardTitle>
        <CardDescription>
          Configure notification settings, providers, and delivery options
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

          {/* Email Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Email Notifications</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableEmailNotifications"
                  checked={formData.enableEmailNotifications}
                  onCheckedChange={(checked) => handleInputChange('enableEmailNotifications', checked)}
                />
                <Label htmlFor="enableEmailNotifications">Enable Email Notifications</Label>
              </div>
            </div>
            
            {formData.enableEmailNotifications && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="emailProvider">Email Provider</Label>
                    <Select value={formData.emailProvider} onValueChange={(value) => handleInputChange('emailProvider', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select email provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {emailProviders.map(provider => (
                          <SelectItem key={provider} value={provider}>
                            {provider.charAt(0).toUpperCase() + provider.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={formData.fromEmail}
                      onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                      placeholder="noreply@funnelseye.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={formData.fromName}
                    onChange={(e) => handleInputChange('fromName', e.target.value)}
                    placeholder="FunnelsEye"
                  />
                </div>
                
                {formData.emailProvider === 'smtp' && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={formData.smtpHost}
                        onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        min="1"
                        max="65535"
                        value={formData.smtpPort}
                        onChange={(e) => handleInputChange('smtpPort', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smtpUser">SMTP Username</Label>
                      <Input
                        id="smtpUser"
                        value={formData.smtpUser}
                        onChange={(e) => handleInputChange('smtpUser', e.target.value)}
                        placeholder="your-email@gmail.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={formData.smtpPassword}
                        onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                        placeholder="App password"
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="smtpSecure"
                      checked={formData.smtpSecure}
                      onCheckedChange={(checked) => handleInputChange('smtpSecure', checked)}
                    />
                    <Label htmlFor="smtpSecure">Use Secure Connection (TLS)</Label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* SMS Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">SMS Notifications</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableSMSNotifications"
                  checked={formData.enableSMSNotifications}
                  onCheckedChange={(checked) => handleInputChange('enableSMSNotifications', checked)}
                />
                <Label htmlFor="enableSMSNotifications">Enable SMS Notifications</Label>
              </div>
            </div>
            
            {formData.enableSMSNotifications && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="smsProvider">SMS Provider</Label>
                  <Select value={formData.smsProvider} onValueChange={(value) => handleInputChange('smsProvider', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select SMS provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {smsProviders.map(provider => (
                        <SelectItem key={provider} value={provider}>
                          {provider.charAt(0).toUpperCase() + provider.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.smsProvider === 'twilio' && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="twilioAccountSid">Twilio Account SID</Label>
                      <Input
                        id="twilioAccountSid"
                        value={formData.twilioAccountSid}
                        onChange={(e) => handleInputChange('twilioAccountSid', e.target.value)}
                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="twilioAuthToken">Twilio Auth Token</Label>
                      <Input
                        id="twilioAuthToken"
                        type="password"
                        value={formData.twilioAuthToken}
                        onChange={(e) => handleInputChange('twilioAuthToken', e.target.value)}
                        placeholder="Auth token"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="twilioPhoneNumber">Twilio Phone Number</Label>
                      <Input
                        id="twilioPhoneNumber"
                        value={formData.twilioPhoneNumber}
                        onChange={(e) => handleInputChange('twilioPhoneNumber', e.target.value)}
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Push Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Push Notifications</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enablePushNotifications"
                  checked={formData.enablePushNotifications}
                  onCheckedChange={(checked) => handleInputChange('enablePushNotifications', checked)}
                />
                <Label htmlFor="enablePushNotifications">Enable Push Notifications</Label>
              </div>
            </div>
            
            {formData.enablePushNotifications && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firebaseServerKey">Firebase Server Key</Label>
                  <Input
                    id="firebaseServerKey"
                    type="password"
                    value={formData.firebaseServerKey}
                    onChange={(e) => handleInputChange('firebaseServerKey', e.target.value)}
                    placeholder="Firebase server key"
                  />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="vapidPublicKey">VAPID Public Key</Label>
                    <Input
                      id="vapidPublicKey"
                      value={formData.vapidPublicKey}
                      onChange={(e) => handleInputChange('vapidPublicKey', e.target.value)}
                      placeholder="VAPID public key"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vapidPrivateKey">VAPID Private Key</Label>
                    <Input
                      id="vapidPrivateKey"
                      type="password"
                      value={formData.vapidPrivateKey}
                      onChange={(e) => handleInputChange('vapidPrivateKey', e.target.value)}
                      placeholder="VAPID private key"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">WhatsApp Notifications</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableWhatsAppNotifications"
                  checked={formData.enableWhatsAppNotifications}
                  onCheckedChange={(checked) => handleInputChange('enableWhatsAppNotifications', checked)}
                />
                <Label htmlFor="enableWhatsAppNotifications">Enable WhatsApp Notifications</Label>
              </div>
            </div>
            
            {formData.enableWhatsAppNotifications && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="whatsappApiUrl">WhatsApp API URL</Label>
                  <Input
                    id="whatsappApiUrl"
                    value={formData.whatsappApiUrl}
                    onChange={(e) => handleInputChange('whatsappApiUrl', e.target.value)}
                    placeholder="https://api.whatsapp.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsappApiKey">WhatsApp API Key</Label>
                  <Input
                    id="whatsappApiKey"
                    type="password"
                    value={formData.whatsappApiKey}
                    onChange={(e) => handleInputChange('whatsappApiKey', e.target.value)}
                    placeholder="API key"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsappPhoneNumber">WhatsApp Phone Number</Label>
                  <Input
                    id="whatsappPhoneNumber"
                    value={formData.whatsappPhoneNumber}
                    onChange={(e) => handleInputChange('whatsappPhoneNumber', e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notification Templates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notification Templates</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableTemplates"
                  checked={formData.enableTemplates}
                  onCheckedChange={(checked) => handleInputChange('enableTemplates', checked)}
                />
                <Label htmlFor="enableTemplates">Enable Templates</Label>
              </div>
            </div>
            
            {formData.enableTemplates && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">Default Language</Label>
                  <Select value={formData.defaultLanguage} onValueChange={(value) => handleInputChange('defaultLanguage', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang} value={lang}>
                          {lang.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableMultiLanguage"
                      checked={formData.enableMultiLanguage}
                      onCheckedChange={(checked) => handleInputChange('enableMultiLanguage', checked)}
                    />
                    <Label htmlFor="enableMultiLanguage">Enable Multi-Language</Label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notification Settings</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableRealTimeNotifications"
                  checked={formData.enableRealTimeNotifications}
                  onCheckedChange={(checked) => handleInputChange('enableRealTimeNotifications', checked)}
                />
                <Label htmlFor="enableRealTimeNotifications">Enable Real-Time Notifications</Label>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="notificationRetentionDays">Retention Period (days)</Label>
                <Input
                  id="notificationRetentionDays"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.notificationRetentionDays}
                  onChange={(e) => handleInputChange('notificationRetentionDays', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxNotificationsPerUser">Max Notifications Per User</Label>
                <Input
                  id="maxNotificationsPerUser"
                  type="number"
                  min="100"
                  max="10000"
                  value={formData.maxNotificationsPerUser}
                  onChange={(e) => handleInputChange('maxNotificationsPerUser', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableNotificationHistory"
                  checked={formData.enableNotificationHistory}
                  onCheckedChange={(checked) => handleInputChange('enableNotificationHistory', checked)}
                />
                <Label htmlFor="enableNotificationHistory">Enable Notification History</Label>
              </div>
            </div>
          </div>

          {/* Notification Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notification Types</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableSystemNotifications"
                  checked={formData.enableSystemNotifications}
                  onCheckedChange={(checked) => handleInputChange('enableSystemNotifications', checked)}
                />
                <Label htmlFor="enableSystemNotifications">System Notifications</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableMarketingNotifications"
                  checked={formData.enableMarketingNotifications}
                  onCheckedChange={(checked) => handleInputChange('enableMarketingNotifications', checked)}
                />
                <Label htmlFor="enableMarketingNotifications">Marketing Notifications</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableTransactionNotifications"
                  checked={formData.enableTransactionNotifications}
                  onCheckedChange={(checked) => handleInputChange('enableTransactionNotifications', checked)}
                />
                <Label htmlFor="enableTransactionNotifications">Transaction Notifications</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableSecurityNotifications"
                  checked={formData.enableSecurityNotifications}
                  onCheckedChange={(checked) => handleInputChange('enableSecurityNotifications', checked)}
                />
                <Label htmlFor="enableSecurityNotifications">Security Notifications</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableMLMNotifications"
                  checked={formData.enableMLMNotifications}
                  onCheckedChange={(checked) => handleInputChange('enableMLMNotifications', checked)}
                />
                <Label htmlFor="enableMLMNotifications">MLM Notifications</Label>
              </div>
            </div>
          </div>

          {/* Delivery Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Delivery Settings</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableDeliveryTracking"
                  checked={formData.enableDeliveryTracking}
                  onCheckedChange={(checked) => handleInputChange('enableDeliveryTracking', checked)}
                />
                <Label htmlFor="enableDeliveryTracking">Enable Delivery Tracking</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableReadReceipts"
                  checked={formData.enableReadReceipts}
                  onCheckedChange={(checked) => handleInputChange('enableReadReceipts', checked)}
                />
                <Label htmlFor="enableReadReceipts">Enable Read Receipts</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableDeliveryRetry"
                  checked={formData.enableDeliveryRetry}
                  onCheckedChange={(checked) => handleInputChange('enableDeliveryRetry', checked)}
                />
                <Label htmlFor="enableDeliveryRetry">Enable Delivery Retry</Label>
              </div>
            </div>
            
            {formData.enableDeliveryRetry && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxRetryAttempts">Max Retry Attempts</Label>
                  <Input
                    id="maxRetryAttempts"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.maxRetryAttempts}
                    onChange={(e) => handleInputChange('maxRetryAttempts', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="retryDelayMinutes">Retry Delay (minutes)</Label>
                  <Input
                    id="retryDelayMinutes"
                    type="number"
                    min="1"
                    max="60"
                    value={formData.retryDelayMinutes}
                    onChange={(e) => handleInputChange('retryDelayMinutes', parseInt(e.target.value))}
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
                  Save Notification Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NotificationConfig;
