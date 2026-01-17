import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, TestTube } from 'lucide-react';

// Payment Settings Component
export const PaymentSettings = ({ config, globalPayment, onSave, saving }) => {
    const [formData, setFormData] = useState({
        platformFees: {
            defaultPercentage: config?.platformFees?.defaultPercentage || 10,
            minimumAmount: config?.platformFees?.minimumAmount || 1,
            byCategory: config?.platformFees?.byCategory || {}
        },
        mlmCommissionStructure: config?.mlmCommissionStructure || {},
        currencies: config?.currencies || { supported: ['USD'], default: 'USD' },
        taxSettings: config?.taxSettings || {}
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (path, value) => {
        setFormData(prev => {
            const newData = { ...prev };
            const keys = path.split('.');
            let current = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]] = { ...current[keys[i]] };
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    return (
        <div className="space-y-6">
            {/* Platform Fees */}
            <Card>
                <CardHeader>
                    <CardTitle>Platform Fees</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="defaultPercentage">Default Platform Fee (%)</Label>
                                <Input
                                    id="defaultPercentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.platformFees.defaultPercentage}
                                    onChange={(e) => handleChange('platformFees.defaultPercentage', parseFloat(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="minimumAmount">Minimum Amount</Label>
                                <Input
                                    id="minimumAmount"
                                    type="number"
                                    min="0"
                                    value={formData.platformFees.minimumAmount}
                                    onChange={(e) => handleChange('platformFees.minimumAmount', parseFloat(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Category-based Fees</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries({
                                    fitness_training: 'Fitness Training',
                                    nutrition_coaching: 'Nutrition Coaching',
                                    weight_loss: 'Weight Loss',
                                    muscle_gain: 'Muscle Gain',
                                    sports_performance: 'Sports Performance',
                                    wellness_coaching: 'Wellness Coaching',
                                    rehabilitation: 'Rehabilitation',
                                    online_courses: 'Online Courses',
                                    ebooks: 'E-books',
                                    consultation: 'Consultation'
                                }).map(([key, label]) => (
                                    <div key={key} className="space-y-2">
                                        <Label htmlFor={key}>{label} (%)</Label>
                                        <Input
                                            id={key}
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.platformFees.byCategory[key] || 10}
                                            onChange={(e) => handleChange(`platformFees.byCategory.${key}`, parseFloat(e.target.value))}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Payment Settings
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* MLM Commission Structure */}
            <Card>
                <CardHeader>
                    <CardTitle>MLM Commission Structure</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-5 gap-4">
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(level => (
                                <div key={level} className="space-y-2">
                                    <Label htmlFor={`level${level}`}>Level {level} (%)</Label>
                                    <Input
                                        id={`level${level}`}
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={formData.mlmCommissionStructure[`level${level}`] || 0}
                                        onChange={(e) => handleChange(`mlmCommissionStructure.level${level}`, parseFloat(e.target.value))}
                                    />
                                </div>
                            ))}
                        </div>

                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save MLM Commission
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

// Security Settings Component
export const SecuritySettings = ({ config, onSave, saving }) => {
    const [formData, setFormData] = useState({
        passwordPolicy: {
            minLength: config?.passwordPolicy?.minLength || 8,
            requireUppercase: config?.passwordPolicy?.requireUppercase || true,
            requireLowercase: config?.passwordPolicy?.requireLowercase || true,
            requireNumbers: config?.passwordPolicy?.requireNumbers || true,
            requireSpecialChars: config?.passwordPolicy?.requireSpecialChars || true,
            maxLoginAttempts: config?.passwordPolicy?.maxLoginAttempts || 5,
            lockoutDuration: config?.passwordPolicy?.lockoutDuration || 30
        },
        sessionSettings: {
            sessionTimeout: config?.sessionSettings?.sessionTimeout || 24,
            rememberMeDuration: config?.sessionSettings?.rememberMeDuration || 30,
            requireTwoFactor: config?.sessionSettings?.requireTwoFactor || false
        },
        apiSecurity: {
            rateLimitPerMinute: config?.apiSecurity?.rateLimitPerMinute || 100,
            maxRequestsPerHour: config?.apiSecurity?.maxRequestsPerHour || 1000,
            requireApiKey: config?.apiSecurity?.requireApiKey || false
        },
        jwtSettings: {
            secret: config?.jwtSettings?.secret || '',
            expiresIn: config?.jwtSettings?.expiresIn || '30d',
            cookieExpire: config?.jwtSettings?.cookieExpire || 30
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (path, value) => {
        setFormData(prev => {
            const newData = { ...prev };
            const keys = path.split('.');
            let current = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]] = { ...current[keys[i]] };
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    return (
        <div className="space-y-6">
            {/* Password Policy */}
            <Card>
                <CardHeader>
                    <CardTitle>Password Policy</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="minLength">Minimum Length</Label>
                                <Input
                                    id="minLength"
                                    type="number"
                                    min="6"
                                    value={formData.passwordPolicy.minLength}
                                    onChange={(e) => handleChange('passwordPolicy.minLength', parseInt(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                                <Input
                                    id="maxLoginAttempts"
                                    type="number"
                                    min="3"
                                    value={formData.passwordPolicy.maxLoginAttempts}
                                    onChange={(e) => handleChange('passwordPolicy.maxLoginAttempts', parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Password Requirements</Label>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="requireUppercase"
                                        checked={formData.passwordPolicy.requireUppercase}
                                        onCheckedChange={(checked) => handleChange('passwordPolicy.requireUppercase', checked)}
                                    />
                                    <Label htmlFor="requireUppercase">Require Uppercase</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="requireLowercase"
                                        checked={formData.passwordPolicy.requireLowercase}
                                        onCheckedChange={(checked) => handleChange('passwordPolicy.requireLowercase', checked)}
                                    />
                                    <Label htmlFor="requireLowercase">Require Lowercase</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="requireNumbers"
                                        checked={formData.passwordPolicy.requireNumbers}
                                        onCheckedChange={(checked) => handleChange('passwordPolicy.requireNumbers', checked)}
                                    />
                                    <Label htmlFor="requireNumbers">Require Numbers</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="requireSpecialChars"
                                        checked={formData.passwordPolicy.requireSpecialChars}
                                        onCheckedChange={(checked) => handleChange('passwordPolicy.requireSpecialChars', checked)}
                                    />
                                    <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                            <Input
                                id="lockoutDuration"
                                type="number"
                                min="5"
                                value={formData.passwordPolicy.lockoutDuration}
                                onChange={(e) => handleChange('passwordPolicy.lockoutDuration', parseInt(e.target.value))}
                            />
                        </div>

                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Password Policy
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Session Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Session Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                                <Input
                                    id="sessionTimeout"
                                    type="number"
                                    min="1"
                                    value={formData.sessionSettings.sessionTimeout}
                                    onChange={(e) => handleChange('sessionSettings.sessionTimeout', parseInt(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rememberMeDuration">Remember Me Duration (days)</Label>
                                <Input
                                    id="rememberMeDuration"
                                    type="number"
                                    min="1"
                                    value={formData.sessionSettings.rememberMeDuration}
                                    onChange={(e) => handleChange('sessionSettings.rememberMeDuration', parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="requireTwoFactor"
                                checked={formData.sessionSettings.requireTwoFactor}
                                onCheckedChange={(checked) => handleChange('sessionSettings.requireTwoFactor', checked)}
                            />
                            <Label htmlFor="requireTwoFactor">Require Two-Factor Authentication</Label>
                        </div>

                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Session Settings
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* API Security */}
            <Card>
                <CardHeader>
                    <CardTitle>API Security</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="rateLimitPerMinute">Rate Limit Per Minute</Label>
                                <Input
                                    id="rateLimitPerMinute"
                                    type="number"
                                    min="10"
                                    value={formData.apiSecurity.rateLimitPerMinute}
                                    onChange={(e) => handleChange('apiSecurity.rateLimitPerMinute', parseInt(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxRequestsPerHour">Max Requests Per Hour</Label>
                                <Input
                                    id="maxRequestsPerHour"
                                    type="number"
                                    min="100"
                                    value={formData.apiSecurity.maxRequestsPerHour}
                                    onChange={(e) => handleChange('apiSecurity.maxRequestsPerHour', parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="requireApiKey"
                                checked={formData.apiSecurity.requireApiKey}
                                onCheckedChange={(checked) => handleChange('apiSecurity.requireApiKey', checked)}
                            />
                            <Label htmlFor="requireApiKey">Require API Key</Label>
                        </div>

                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save API Security
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* JWT Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>JWT Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="jwtSecret">JWT Secret</Label>
                            <Input
                                id="jwtSecret"
                                type="password"
                                value={formData.jwtSettings.secret}
                                onChange={(e) => handleChange('jwtSettings.secret', e.target.value)}
                                placeholder="Enter JWT secret key"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="expiresIn">Token Expires In</Label>
                                <Select value={formData.jwtSettings.expiresIn} onValueChange={(value) => handleChange('jwtSettings.expiresIn', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1h">1 Hour</SelectItem>
                                        <SelectItem value="24h">24 Hours</SelectItem>
                                        <SelectItem value="7d">7 Days</SelectItem>
                                        <SelectItem value="30d">30 Days</SelectItem>
                                        <SelectItem value="90d">90 Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cookieExpire">Cookie Expire (days)</Label>
                                <Input
                                    id="cookieExpire"
                                    type="number"
                                    min="1"
                                    value={formData.jwtSettings.cookieExpire}
                                    onChange={(e) => handleChange('jwtSettings.cookieExpire', parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save JWT Settings
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

// Notification Settings Component
export const NotificationSettings = ({ config, onSave, saving }) => {
    const [formData, setFormData] = useState({
        email: {
            enabled: config?.email?.enabled || true,
            smtpConfig: {
                host: config?.email?.smtpConfig?.host || '',
                port: config?.email?.smtpConfig?.port || 587,
                secure: config?.email?.smtpConfig?.secure || false,
                username: config?.email?.smtpConfig?.username || '',
                password: config?.email?.smtpConfig?.password || ''
            },
            fromEmail: config?.email?.fromEmail || 'noreply@funnelseye.com',
            fromName: config?.email?.fromName || 'FunnelsEye'
        },
        sms: {
            enabled: config?.sms?.enabled || false,
            provider: config?.sms?.provider || 'twilio',
            config: {
                accountSid: config?.sms?.config?.accountSid || '',
                authToken: config?.sms?.config?.authToken || '',
                fromNumber: config?.sms?.config?.fromNumber || ''
            }
        },
        push: {
            enabled: config?.push?.enabled || false,
            firebaseConfig: {
                serverKey: config?.push?.firebaseConfig?.serverKey || '',
                projectId: config?.push?.firebaseConfig?.projectId || ''
            }
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (path, value) => {
        setFormData(prev => {
            const newData = { ...prev };
            const keys = path.split('.');
            let current = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]] = { ...current[keys[i]] };
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    return (
        <div className="space-y-6">
            {/* Email Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>Email Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="emailEnabled"
                                checked={formData.email.enabled}
                                onCheckedChange={(checked) => handleChange('email.enabled', checked)}
                            />
                            <Label htmlFor="emailEnabled">Enable Email Notifications</Label>
                        </div>

                        {formData.email.enabled && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpHost">SMTP Host</Label>
                                        <Input
                                            id="smtpHost"
                                            value={formData.email.smtpConfig.host}
                                            onChange={(e) => handleChange('email.smtpConfig.host', e.target.value)}
                                            placeholder="smtp.gmail.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpPort">SMTP Port</Label>
                                        <Input
                                            id="smtpPort"
                                            type="number"
                                            value={formData.email.smtpConfig.port}
                                            onChange={(e) => handleChange('email.smtpConfig.port', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpUsername">SMTP Username</Label>
                                        <Input
                                            id="smtpUsername"
                                            value={formData.email.smtpConfig.username}
                                            onChange={(e) => handleChange('email.smtpConfig.username', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpPassword">SMTP Password</Label>
                                        <Input
                                            id="smtpPassword"
                                            type="password"
                                            value={formData.email.smtpConfig.password}
                                            onChange={(e) => handleChange('email.smtpConfig.password', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="smtpSecure"
                                        checked={formData.email.smtpConfig.secure}
                                        onCheckedChange={(checked) => handleChange('email.smtpConfig.secure', checked)}
                                    />
                                    <Label htmlFor="smtpSecure">Use SSL/TLS</Label>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fromEmail">From Email</Label>
                                        <Input
                                            id="fromEmail"
                                            type="email"
                                            value={formData.email.fromEmail}
                                            onChange={(e) => handleChange('email.fromEmail', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fromName">From Name</Label>
                                        <Input
                                            id="fromName"
                                            value={formData.email.fromName}
                                            onChange={(e) => handleChange('email.fromName', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Email Settings
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* SMS Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>SMS Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="smsEnabled"
                                checked={formData.sms.enabled}
                                onCheckedChange={(checked) => handleChange('sms.enabled', checked)}
                            />
                            <Label htmlFor="smsEnabled">Enable SMS Notifications</Label>
                        </div>

                        {formData.sms.enabled && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="smsProvider">SMS Provider</Label>
                                    <Select value={formData.sms.provider} onValueChange={(value) => handleChange('sms.provider', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="twilio">Twilio</SelectItem>
                                            <SelectItem value="aws_sns">AWS SNS</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="accountSid">Account SID</Label>
                                        <Input
                                            id="accountSid"
                                            value={formData.sms.config.accountSid}
                                            onChange={(e) => handleChange('sms.config.accountSid', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="authToken">Auth Token</Label>
                                        <Input
                                            id="authToken"
                                            type="password"
                                            value={formData.sms.config.authToken}
                                            onChange={(e) => handleChange('sms.config.authToken', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fromNumber">From Number</Label>
                                    <Input
                                        id="fromNumber"
                                        value={formData.sms.config.fromNumber}
                                        onChange={(e) => handleChange('sms.config.fromNumber', e.target.value)}
                                        placeholder="+1234567890"
                                    />
                                </div>
                            </>
                        )}

                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save SMS Settings
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle>Push Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="pushEnabled"
                                checked={formData.push.enabled}
                                onCheckedChange={(checked) => handleChange('push.enabled', checked)}
                            />
                            <Label htmlFor="pushEnabled">Enable Push Notifications</Label>
                        </div>

                        {formData.push.enabled && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="firebaseServerKey">Firebase Server Key</Label>
                                    <Input
                                        id="firebaseServerKey"
                                        type="password"
                                        value={formData.push.firebaseConfig.serverKey}
                                        onChange={(e) => handleChange('push.firebaseConfig.serverKey', e.target.value)}
                                        placeholder="Enter Firebase server key"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="firebaseProjectId">Firebase Project ID</Label>
                                    <Input
                                        id="firebaseProjectId"
                                        value={formData.push.firebaseConfig.projectId}
                                        onChange={(e) => handleChange('push.firebaseConfig.projectId', e.target.value)}
                                        placeholder="your-project-id"
                                    />
                                </div>
                            </>
                        )}

                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Push Settings
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

// Integration Settings Component
export const IntegrationSettings = ({ config, onSave, saving }) => {
    const [formData, setFormData] = useState({
        whatsapp: {
            enabled: config?.whatsapp?.enabled || true,
            meta: {
                enabled: config?.whatsapp?.meta?.enabled || true,
                apiToken: config?.whatsapp?.meta?.apiToken || '',
                phoneNumberId: config?.whatsapp?.meta?.phoneNumberId || '',
                businessAccountId: config?.whatsapp?.meta?.businessAccountId || ''
            },
            baileys: {
                enabled: config?.whatsapp?.baileys?.enabled || true,
                maxSessions: config?.whatsapp?.baileys?.maxSessions || 100,
                autoReconnect: config?.whatsapp?.baileys?.autoReconnect || true
            }
        },
        zoom: {
            enabled: config?.zoom?.enabled || false,
            apiKey: config?.zoom?.apiKey || '',
            apiSecret: config?.zoom?.apiSecret || '',
            webhookSecret: config?.zoom?.webhookSecret || ''
        },
        calendar: {
            enabled: config?.calendar?.enabled || false,
            provider: config?.calendar?.provider || 'google',
            clientId: config?.calendar?.clientId || '',
            clientSecret: config?.calendar?.clientSecret || ''
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (path, value) => {
        setFormData(prev => {
            const newData = { ...prev };
            const keys = path.split('.');
            let current = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]] = { ...current[keys[i]] };
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    return (
        <div className="space-y-6">
            {/* WhatsApp Integration */}
            <Card>
                <CardHeader>
                    <CardTitle>WhatsApp Integration</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="whatsappEnabled"
                                checked={formData.whatsapp.enabled}
                                onCheckedChange={(checked) => handleChange('whatsapp.enabled', checked)}
                            />
                            <Label htmlFor="whatsappEnabled">Enable WhatsApp Integration</Label>
                        </div>

                        {formData.whatsapp.enabled && (
                            <>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="metaEnabled"
                                            checked={formData.whatsapp.meta.enabled}
                                            onCheckedChange={(checked) => handleChange('whatsapp.meta.enabled', checked)}
                                        />
                                        <Label htmlFor="metaEnabled">Meta Official API</Label>
                                    </div>

                                    {formData.whatsapp.meta.enabled && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="metaApiToken">Meta API Token</Label>
                                                <Input
                                                    id="metaApiToken"
                                                    type="password"
                                                    value={formData.whatsapp.meta.apiToken}
                                                    onChange={(e) => handleChange('whatsapp.meta.apiToken', e.target.value)}
                                                    placeholder="Enter Meta API token"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                                                    <Input
                                                        id="phoneNumberId"
                                                        value={formData.whatsapp.meta.phoneNumberId}
                                                        onChange={(e) => handleChange('whatsapp.meta.phoneNumberId', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="businessAccountId">Business Account ID</Label>
                                                    <Input
                                                        id="businessAccountId"
                                                        value={formData.whatsapp.meta.businessAccountId}
                                                        onChange={(e) => handleChange('whatsapp.meta.businessAccountId', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="baileysEnabled"
                                            checked={formData.whatsapp.baileys.enabled}
                                            onCheckedChange={(checked) => handleChange('whatsapp.baileys.enabled', checked)}
                                        />
                                        <Label htmlFor="baileysEnabled">Baileys Personal Account</Label>
                                    </div>

                                    {formData.whatsapp.baileys.enabled && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="maxSessions">Max Sessions</Label>
                                                <Input
                                                    id="maxSessions"
                                                    type="number"
                                                    value={formData.whatsapp.baileys.maxSessions}
                                                    onChange={(e) => handleChange('whatsapp.baileys.maxSessions', parseInt(e.target.value))}
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id="autoReconnect"
                                                    checked={formData.whatsapp.baileys.autoReconnect}
                                                    onCheckedChange={(checked) => handleChange('whatsapp.baileys.autoReconnect', checked)}
                                                />
                                                <Label htmlFor="autoReconnect">Auto Reconnect</Label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save WhatsApp Settings
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Zoom Integration */}
            <Card>
                <CardHeader>
                    <CardTitle>Zoom Integration</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="zoomEnabled"
                                checked={formData.zoom.enabled}
                                onCheckedChange={(checked) => handleChange('zoom.enabled', checked)}
                            />
                            <Label htmlFor="zoomEnabled">Enable Zoom Integration</Label>
                        </div>

                        {formData.zoom.enabled && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="zoomApiKey">Zoom API Key</Label>
                                    <Input
                                        id="zoomApiKey"
                                        type="password"
                                        value={formData.zoom.apiKey}
                                        onChange={(e) => handleChange('zoom.apiKey', e.target.value)}
                                        placeholder="Enter Zoom API key"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="zoomApiSecret">Zoom API Secret</Label>
                                    <Input
                                        id="zoomApiSecret"
                                        type="password"
                                        value={formData.zoom.apiSecret}
                                        onChange={(e) => handleChange('zoom.apiSecret', e.target.value)}
                                        placeholder="Enter Zoom API secret"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="zoomWebhookSecret">Webhook Secret</Label>
                                    <Input
                                        id="zoomWebhookSecret"
                                        type="password"
                                        value={formData.zoom.webhookSecret}
                                        onChange={(e) => handleChange('zoom.webhookSecret', e.target.value)}
                                        placeholder="Enter webhook secret"
                                    />
                                </div>
                            </>
                        )}

                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Zoom Settings
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Calendar Integration */}
            <Card>
                <CardHeader>
                    <CardTitle>Calendar Integration</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="calendarEnabled"
                                checked={formData.calendar.enabled}
                                onCheckedChange={(checked) => handleChange('calendar.enabled', checked)}
                            />
                            <Label htmlFor="calendarEnabled">Enable Calendar Integration</Label>
                        </div>

                        {formData.calendar.enabled && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="calendarProvider">Calendar Provider</Label>
                                    <Select value={formData.calendar.provider} onValueChange={(value) => handleChange('calendar.provider', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="google">Google Calendar</SelectItem>
                                            <SelectItem value="outlook">Outlook Calendar</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="calendarClientId">Client ID</Label>
                                        <Input
                                            id="calendarClientId"
                                            value={formData.calendar.clientId}
                                            onChange={(e) => handleChange('calendar.clientId', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="calendarClientSecret">Client Secret</Label>
                                        <Input
                                            id="calendarClientSecret"
                                            type="password"
                                            value={formData.calendar.clientSecret}
                                            onChange={(e) => handleChange('calendar.clientSecret', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Calendar Settings
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

// AI Services Settings Component
export const AiServicesSettings = ({ config, onSave, saving }) => {
    const [formData, setFormData] = useState({
        openai: {
            enabled: config?.openai?.enabled || false,
            apiKey: config?.openai?.apiKey || '',
            baseUrl: config?.openai?.baseUrl || 'https://api.openai.com/v1',
            defaultModel: config?.openai?.defaultModel || 'gpt-3.5-turbo'
        },
        openrouter: {
            enabled: config?.openrouter?.enabled || false,
            apiKey: config?.openrouter?.apiKey || '',
            baseUrl: config?.openrouter?.baseUrl || 'https://openrouter.ai/api/v1'
        },
        models: config?.models || {}
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (path, value) => {
        setFormData(prev => {
            const newData = { ...prev };
            const keys = path.split('.');
            let current = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]] = { ...current[keys[i]] };
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    return (
        <div className="space-y-6">
            {/* OpenAI Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>OpenAI Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="openaiEnabled"
                                checked={formData.openai.enabled}
                                onCheckedChange={(checked) => handleChange('openai.enabled', checked)}
                            />
                            <Label htmlFor="openaiEnabled">Enable OpenAI</Label>
                        </div>

                        {formData.openai.enabled && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                                    <Input
                                        id="openaiApiKey"
                                        type="password"
                                        value={formData.openai.apiKey}
                                        onChange={(e) => handleChange('openai.apiKey', e.target.value)}
                                        placeholder="Enter OpenAI API key"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="openaiBaseUrl">Base URL</Label>
                                    <Input
                                        id="openaiBaseUrl"
                                        value={formData.openai.baseUrl}
                                        onChange={(e) => handleChange('openai.baseUrl', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="openaiDefaultModel">Default Model</Label>
                                    <Select value={formData.openai.defaultModel} onValueChange={(value) => handleChange('openai.defaultModel', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                                            <SelectItem value="gpt-4-turbo-preview">GPT-4 Turbo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}

                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save OpenAI Settings
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* OpenRouter Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>OpenRouter Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="openrouterEnabled"
                                checked={formData.openrouter.enabled}
                                onCheckedChange={(checked) => handleChange('openrouter.enabled', checked)}
                            />
                            <Label htmlFor="openrouterEnabled">Enable OpenRouter</Label>
                        </div>

                        {formData.openrouter.enabled && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="openrouterApiKey">OpenRouter API Key</Label>
                                    <Input
                                        id="openrouterApiKey"
                                        type="password"
                                        value={formData.openrouter.apiKey}
                                        onChange={(e) => handleChange('openrouter.apiKey', e.target.value)}
                                        placeholder="Enter OpenRouter API key"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="openrouterBaseUrl">Base URL</Label>
                                    <Input
                                        id="openrouterBaseUrl"
                                        value={formData.openrouter.baseUrl}
                                        onChange={(e) => handleChange('openrouter.baseUrl', e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save OpenRouter Settings
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
