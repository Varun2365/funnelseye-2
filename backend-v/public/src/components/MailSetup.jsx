import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Mail, 
  Settings, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  TestTube,
  Info,
  Shield,
  Server,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

const MailSetup = () => {
  const [emailConfig, setEmailConfig] = useState({
    email: '',
    password: '',
    fromName: 'FunnelsEye'
  });
  const [emailStatus, setEmailStatus] = useState({
    enabled: false,
    isConfigured: false,
    lastTest: null
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSubject, setTestSubject] = useState('FunnelsEye - Test Email');
  const [testMessage, setTestMessage] = useState('This is a test email from FunnelsEye platform.');

  // Load email configuration on component mount
  useEffect(() => {
    loadEmailConfig();
    loadEmailStatus();
  }, []);

  const loadEmailConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/central-messaging/v1/admin/email/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setEmailConfig(prev => ({
            ...prev,
            email: data.data.email || '',
            fromName: data.data.fromName || 'FunnelsEye'
          }));
        }
      }
    } catch (error) {
      console.error('Error loading email config:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmailStatus = async () => {
    try {
      const response = await fetch('/api/central-messaging/v1/admin/email/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setEmailStatus(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading email status:', error);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/central-messaging/v1/admin/email/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          email: emailConfig.email,
          password: emailConfig.password,
          fromName: emailConfig.fromName
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Email configuration saved successfully!');
        await loadEmailStatus();
        // Clear password field for security
        setEmailConfig(prev => ({ ...prev, password: '' }));
      } else {
        toast.error(data.message || 'Failed to save email configuration');
      }
    } catch (error) {
      console.error('Error saving email config:', error);
      toast.error('Error saving email configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConfig = async () => {
    try {
      setTesting(true);
      const response = await fetch('/api/central-messaging/v1/admin/email/test-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          testEmail: testEmail || emailConfig.email
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Email configuration test successful!');
        await loadEmailStatus();
      } else {
        toast.error(data.message || 'Email configuration test failed');
      }
    } catch (error) {
      console.error('Error testing email config:', error);
      toast.error('Error testing email configuration');
    } finally {
      setTesting(false);
    }
  };

  const handleSendTestEmail = async () => {
    try {
      setTesting(true);
      const response = await fetch('/api/central-messaging/v1/admin/email/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          to: testEmail,
          subject: testSubject,
          message: testMessage
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Test email sent successfully!');
      } else {
        toast.error(data.message || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Error sending test email');
    } finally {
      setTesting(false);
    }
  };

  const getStatusBadge = () => {
    if (emailStatus.enabled && emailStatus.isConfigured) {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Configured</Badge>;
    } else if (emailStatus.isConfigured) {
      return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Configured (Disabled)</Badge>;
    } else {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Not Configured</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mail Setup</h1>
          <p className="text-muted-foreground">
            Configure central email system for platform-wide email functionality
          </p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Email Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Configuration
          </CardTitle>
          <CardDescription>
            Set up SMTP configuration for the central email system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@funnelseye.com"
                value={emailConfig.email}
                onChange={(e) => setEmailConfig(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                placeholder="FunnelsEye"
                value={emailConfig.fromName}
                onChange={(e) => setEmailConfig(prev => ({ ...prev, fromName: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password / App Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter email password or app-specific password"
              value={emailConfig.password}
              onChange={(e) => setEmailConfig(prev => ({ ...prev, password: e.target.value }))}
            />
            <p className="text-sm text-muted-foreground">
              For Gmail, use an App Password instead of your regular password
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSaveConfig} 
              disabled={loading || !emailConfig.email || !emailConfig.password}
              className="flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Settings className="h-4 w-4" />
              Save Configuration
            </Button>
            <Button 
              variant="outline" 
              onClick={handleTestConfig}
              disabled={testing || !emailConfig.email}
              className="flex items-center gap-2"
            >
              {testing && <Loader2 className="h-4 w-4 animate-spin" />}
              <TestTube className="h-4 w-4" />
              Test Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>
            Current status of the central email system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Configuration</p>
                <p className="text-xs text-muted-foreground">
                  {emailStatus.isConfigured ? 'Configured' : 'Not Configured'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-xs text-muted-foreground">
                  {emailStatus.enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Last Test</p>
                <p className="text-xs text-muted-foreground">
                  {emailStatus.lastTest ? new Date(emailStatus.lastTest).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Email Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Test Email
          </CardTitle>
          <CardDescription>
            Send a test email to verify the configuration is working
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testEmail">Recipient Email</Label>
            <Input
              id="testEmail"
              type="email"
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="testSubject">Subject</Label>
            <Input
              id="testSubject"
              placeholder="Test Email Subject"
              value={testSubject}
              onChange={(e) => setTestSubject(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="testMessage">Message</Label>
            <Textarea
              id="testMessage"
              placeholder="Test email message content..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={4}
            />
          </div>

          <Button 
            onClick={handleSendTestEmail}
            disabled={testing || !testEmail || !emailStatus.isConfigured}
            className="flex items-center gap-2"
          >
            {testing && <Loader2 className="h-4 w-4 animate-spin" />}
            <Send className="h-4 w-4" />
            Send Test Email
          </Button>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Configuration Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">Gmail Setup</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Enable 2-factor authentication on your Gmail account</li>
                <li>• Generate an App Password from Google Account settings</li>
                <li>• Use the App Password instead of your regular password</li>
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium">Other Email Providers</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Outlook/Hotmail: Use your regular password or App Password</li>
                <li>• Yahoo: Enable "Less secure app access" or use App Password</li>
                <li>• Custom SMTP: Use your provider's SMTP settings</li>
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium">Security Notes</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Passwords are encrypted and stored securely</li>
                <li>• Test the configuration before saving</li>
                <li>• Monitor email delivery rates and bounce rates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MailSetup;
