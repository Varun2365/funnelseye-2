import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield, Save, AlertCircle } from 'lucide-react';

const SecurityConfig = ({ config, onSave, saving }) => {
  const [formData, setFormData] = useState({
    // Authentication Settings
    jwtExpiration: config?.authentication?.jwtExpiration || 24,
    refreshTokenExpiration: config?.authentication?.refreshTokenExpiration || 168,
    maxLoginAttempts: config?.authentication?.maxLoginAttempts || 5,
    lockoutDuration: config?.authentication?.lockoutDuration || 15,
    requireEmailVerification: config?.authentication?.requireEmailVerification || false,
    requirePhoneVerification: config?.authentication?.requirePhoneVerification || false,
    
    // Password Policy
    minPasswordLength: config?.passwordPolicy?.minPasswordLength || 8,
    requireUppercase: config?.passwordPolicy?.requireUppercase || true,
    requireLowercase: config?.passwordPolicy?.requireLowercase || true,
    requireNumbers: config?.passwordPolicy?.requireNumbers || true,
    requireSpecialChars: config?.passwordPolicy?.requireSpecialChars || true,
    passwordExpirationDays: config?.passwordPolicy?.passwordExpirationDays || 90,
    
    // Session Management
    sessionTimeout: config?.sessionManagement?.sessionTimeout || 30,
    concurrentSessions: config?.sessionManagement?.concurrentSessions || 3,
    rememberMeDuration: config?.sessionManagement?.rememberMeDuration || 30,
    
    // Rate Limiting
    apiRateLimit: config?.rateLimiting?.apiRateLimit || 100,
    apiRateWindow: config?.rateLimiting?.apiRateWindow || 15,
    loginRateLimit: config?.rateLimiting?.loginRateLimit || 5,
    loginRateWindow: config?.rateLimiting?.loginRateWindow || 15,
    
    // Security Headers
    enableCSP: config?.securityHeaders?.enableCSP || true,
    enableHSTS: config?.securityHeaders?.enableHSTS || true,
    enableXFrameOptions: config?.securityHeaders?.enableXFrameOptions || true,
    enableXSSProtection: config?.securityHeaders?.enableXSSProtection || true,
    
    // Two-Factor Authentication
    enable2FA: config?.twoFactorAuth?.enable2FA || false,
    require2FAForAdmins: config?.twoFactorAuth?.require2FAForAdmins || false,
    require2FAForCoaches: config?.twoFactorAuth?.require2FAForCoaches || false,
    
    // Data Encryption
    encryptSensitiveData: config?.dataEncryption?.encryptSensitiveData || true,
    encryptionAlgorithm: config?.dataEncryption?.encryptionAlgorithm || 'AES-256-GCM',
    
    // Audit Logging
    enableAuditLogging: config?.auditLogging?.enableAuditLogging || true,
    auditLogRetentionDays: config?.auditLogging?.auditLogRetentionDays || 365,
    logFailedAttempts: config?.auditLogging?.logFailedAttempts || true,
    logSuccessfulLogins: config?.auditLogging?.logSuccessfulLogins || true
  });

  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.minPasswordLength < 6) {
      setError('Minimum password length must be at least 6 characters');
      return;
    }
    
    if (formData.maxLoginAttempts < 1) {
      setError('Maximum login attempts must be at least 1');
      return;
    }

    setError('');
    
    // Structure the data properly
    const structuredData = {
      authentication: {
        jwtExpiration: formData.jwtExpiration,
        refreshTokenExpiration: formData.refreshTokenExpiration,
        maxLoginAttempts: formData.maxLoginAttempts,
        lockoutDuration: formData.lockoutDuration,
        requireEmailVerification: formData.requireEmailVerification,
        requirePhoneVerification: formData.requirePhoneVerification
      },
      passwordPolicy: {
        minPasswordLength: formData.minPasswordLength,
        requireUppercase: formData.requireUppercase,
        requireLowercase: formData.requireLowercase,
        requireNumbers: formData.requireNumbers,
        requireSpecialChars: formData.requireSpecialChars,
        passwordExpirationDays: formData.passwordExpirationDays
      },
      sessionManagement: {
        sessionTimeout: formData.sessionTimeout,
        concurrentSessions: formData.concurrentSessions,
        rememberMeDuration: formData.rememberMeDuration
      },
      rateLimiting: {
        apiRateLimit: formData.apiRateLimit,
        apiRateWindow: formData.apiRateWindow,
        loginRateLimit: formData.loginRateLimit,
        loginRateWindow: formData.loginRateWindow
      },
      securityHeaders: {
        enableCSP: formData.enableCSP,
        enableHSTS: formData.enableHSTS,
        enableXFrameOptions: formData.enableXFrameOptions,
        enableXSSProtection: formData.enableXSSProtection
      },
      twoFactorAuth: {
        enable2FA: formData.enable2FA,
        require2FAForAdmins: formData.require2FAForAdmins,
        require2FAForCoaches: formData.require2FAForCoaches
      },
      dataEncryption: {
        encryptSensitiveData: formData.encryptSensitiveData,
        encryptionAlgorithm: formData.encryptionAlgorithm
      },
      auditLogging: {
        enableAuditLogging: formData.enableAuditLogging,
        auditLogRetentionDays: formData.auditLogRetentionDays,
        logFailedAttempts: formData.logFailedAttempts,
        logSuccessfulLogins: formData.logSuccessfulLogins
      }
    };
    
    onSave(structuredData);
  };

  const encryptionAlgorithms = ['AES-256-GCM', 'AES-256-CBC', 'AES-128-GCM', 'AES-128-CBC'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Security Configuration</span>
        </CardTitle>
        <CardDescription>
          Configure security settings, authentication, and access controls
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

          {/* Authentication Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Authentication Settings</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="jwtExpiration">JWT Expiration (hours)</Label>
                <Input
                  id="jwtExpiration"
                  type="number"
                  min="1"
                  max="168"
                  value={formData.jwtExpiration}
                  onChange={(e) => handleInputChange('jwtExpiration', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="refreshTokenExpiration">Refresh Token Expiration (hours)</Label>
                <Input
                  id="refreshTokenExpiration"
                  type="number"
                  min="1"
                  max="720"
                  value={formData.refreshTokenExpiration}
                  onChange={(e) => handleInputChange('refreshTokenExpiration', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxLoginAttempts}
                  onChange={(e) => handleInputChange('maxLoginAttempts', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                <Input
                  id="lockoutDuration"
                  type="number"
                  min="1"
                  max="60"
                  value={formData.lockoutDuration}
                  onChange={(e) => handleInputChange('lockoutDuration', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="requireEmailVerification"
                  checked={formData.requireEmailVerification}
                  onCheckedChange={(checked) => handleInputChange('requireEmailVerification', checked)}
                />
                <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="requirePhoneVerification"
                  checked={formData.requirePhoneVerification}
                  onCheckedChange={(checked) => handleInputChange('requirePhoneVerification', checked)}
                />
                <Label htmlFor="requirePhoneVerification">Require Phone Verification</Label>
              </div>
            </div>
          </div>

          {/* Password Policy */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Password Policy</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minPasswordLength">Minimum Password Length</Label>
                <Input
                  id="minPasswordLength"
                  type="number"
                  min="6"
                  max="32"
                  value={formData.minPasswordLength}
                  onChange={(e) => handleInputChange('minPasswordLength', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="passwordExpirationDays">Password Expiration (days)</Label>
                <Input
                  id="passwordExpirationDays"
                  type="number"
                  min="0"
                  max="365"
                  value={formData.passwordExpirationDays}
                  onChange={(e) => handleInputChange('passwordExpirationDays', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="requireUppercase"
                  checked={formData.requireUppercase}
                  onCheckedChange={(checked) => handleInputChange('requireUppercase', checked)}
                />
                <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="requireLowercase"
                  checked={formData.requireLowercase}
                  onCheckedChange={(checked) => handleInputChange('requireLowercase', checked)}
                />
                <Label htmlFor="requireLowercase">Require Lowercase Letters</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="requireNumbers"
                  checked={formData.requireNumbers}
                  onCheckedChange={(checked) => handleInputChange('requireNumbers', checked)}
                />
                <Label htmlFor="requireNumbers">Require Numbers</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="requireSpecialChars"
                  checked={formData.requireSpecialChars}
                  onCheckedChange={(checked) => handleInputChange('requireSpecialChars', checked)}
                />
                <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
              </div>
            </div>
          </div>

          {/* Session Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Session Management</h3>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="5"
                  max="480"
                  value={formData.sessionTimeout}
                  onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="concurrentSessions">Max Concurrent Sessions</Label>
                <Input
                  id="concurrentSessions"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.concurrentSessions}
                  onChange={(e) => handleInputChange('concurrentSessions', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rememberMeDuration">Remember Me Duration (days)</Label>
                <Input
                  id="rememberMeDuration"
                  type="number"
                  min="1"
                  max="90"
                  value={formData.rememberMeDuration}
                  onChange={(e) => handleInputChange('rememberMeDuration', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Rate Limiting */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Rate Limiting</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="apiRateLimit">API Rate Limit (requests)</Label>
                <Input
                  id="apiRateLimit"
                  type="number"
                  min="10"
                  max="1000"
                  value={formData.apiRateLimit}
                  onChange={(e) => handleInputChange('apiRateLimit', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiRateWindow">API Rate Window (minutes)</Label>
                <Input
                  id="apiRateWindow"
                  type="number"
                  min="1"
                  max="60"
                  value={formData.apiRateWindow}
                  onChange={(e) => handleInputChange('apiRateWindow', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="loginRateLimit">Login Rate Limit (attempts)</Label>
                <Input
                  id="loginRateLimit"
                  type="number"
                  min="3"
                  max="20"
                  value={formData.loginRateLimit}
                  onChange={(e) => handleInputChange('loginRateLimit', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="loginRateWindow">Login Rate Window (minutes)</Label>
                <Input
                  id="loginRateWindow"
                  type="number"
                  min="1"
                  max="60"
                  value={formData.loginRateWindow}
                  onChange={(e) => handleInputChange('loginRateWindow', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Security Headers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Security Headers</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableCSP"
                  checked={formData.enableCSP}
                  onCheckedChange={(checked) => handleInputChange('enableCSP', checked)}
                />
                <Label htmlFor="enableCSP">Enable Content Security Policy</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableHSTS"
                  checked={formData.enableHSTS}
                  onCheckedChange={(checked) => handleInputChange('enableHSTS', checked)}
                />
                <Label htmlFor="enableHSTS">Enable HTTP Strict Transport Security</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableXFrameOptions"
                  checked={formData.enableXFrameOptions}
                  onCheckedChange={(checked) => handleInputChange('enableXFrameOptions', checked)}
                />
                <Label htmlFor="enableXFrameOptions">Enable X-Frame-Options</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableXSSProtection"
                  checked={formData.enableXSSProtection}
                  onCheckedChange={(checked) => handleInputChange('enableXSSProtection', checked)}
                />
                <Label htmlFor="enableXSSProtection">Enable XSS Protection</Label>
              </div>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable2FA"
                  checked={formData.enable2FA}
                  onCheckedChange={(checked) => handleInputChange('enable2FA', checked)}
                />
                <Label htmlFor="enable2FA">Enable Two-Factor Authentication</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="require2FAForAdmins"
                  checked={formData.require2FAForAdmins}
                  onCheckedChange={(checked) => handleInputChange('require2FAForAdmins', checked)}
                />
                <Label htmlFor="require2FAForAdmins">Require 2FA for Admins</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="require2FAForCoaches"
                  checked={formData.require2FAForCoaches}
                  onCheckedChange={(checked) => handleInputChange('require2FAForCoaches', checked)}
                />
                <Label htmlFor="require2FAForCoaches">Require 2FA for Coaches</Label>
              </div>
            </div>
          </div>

          {/* Data Encryption */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Data Encryption</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="encryptSensitiveData"
                  checked={formData.encryptSensitiveData}
                  onCheckedChange={(checked) => handleInputChange('encryptSensitiveData', checked)}
                />
                <Label htmlFor="encryptSensitiveData">Encrypt Sensitive Data</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="encryptionAlgorithm">Encryption Algorithm</Label>
                <Select value={formData.encryptionAlgorithm} onValueChange={(value) => handleInputChange('encryptionAlgorithm', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select encryption algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    {encryptionAlgorithms.map(algo => (
                      <SelectItem key={algo} value={algo}>{algo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Audit Logging */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Audit Logging</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableAuditLogging"
                  checked={formData.enableAuditLogging}
                  onCheckedChange={(checked) => handleInputChange('enableAuditLogging', checked)}
                />
                <Label htmlFor="enableAuditLogging">Enable Audit Logging</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="logFailedAttempts"
                  checked={formData.logFailedAttempts}
                  onCheckedChange={(checked) => handleInputChange('logFailedAttempts', checked)}
                />
                <Label htmlFor="logFailedAttempts">Log Failed Login Attempts</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="logSuccessfulLogins"
                  checked={formData.logSuccessfulLogins}
                  onCheckedChange={(checked) => handleInputChange('logSuccessfulLogins', checked)}
                />
                <Label htmlFor="logSuccessfulLogins">Log Successful Logins</Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="auditLogRetentionDays">Audit Log Retention (days)</Label>
              <Input
                id="auditLogRetentionDays"
                type="number"
                min="30"
                max="3650"
                value={formData.auditLogRetentionDays}
                onChange={(e) => handleInputChange('auditLogRetentionDays', parseInt(e.target.value))}
              />
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
                  Save Security Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SecurityConfig;
