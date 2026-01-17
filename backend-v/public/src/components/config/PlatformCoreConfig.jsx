import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Settings, Save, AlertCircle } from 'lucide-react';

const PlatformCoreConfig = ({ config, onSave, saving }) => {
  const [formData, setFormData] = useState({
    platformName: config?.platformName || 'FunnelsEye',
    platformVersion: config?.platformVersion || '1.0.0',
    maintenanceMode: config?.maintenanceMode || false,
    maintenanceMessage: config?.maintenanceMessage || 'System is under maintenance. Please try again later.',
    maxUsers: config?.maxUsers || 10000,
    maxCoaches: config?.maxCoaches || 1000,
    maxLeads: config?.maxLeads || 100000,
    systemTimezone: config?.systemTimezone || 'UTC',
    dateFormat: config?.dateFormat || 'MM/DD/YYYY',
    timeFormat: config?.timeFormat || '12h',
    environment: config?.environment || 'development',
    debugMode: config?.debugMode || true,
    logLevel: config?.logLevel || 'info'
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
    if (!formData.platformName.trim()) {
      setError('Platform name is required');
      return;
    }
    
    if (formData.maxUsers < 1 || formData.maxCoaches < 1 || formData.maxLeads < 1) {
      setError('Limits must be greater than 0');
      return;
    }

    setError('');
    onSave(formData);
  };

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
    'Asia/Kolkata', 'Australia/Sydney', 'Pacific/Auckland'
  ];

  const dateFormats = [
    'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY'
  ];

  const timeFormats = ['12h', '24h'];

  const environments = ['development', 'staging', 'production'];

  const logLevels = ['error', 'warn', 'info', 'debug'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Platform Core Settings</span>
        </CardTitle>
        <CardDescription>
          Configure basic platform settings, limits, and system behavior
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

          {/* Basic Platform Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="platformName">Platform Name</Label>
                <Input
                  id="platformName"
                  value={formData.platformName}
                  onChange={(e) => handleInputChange('platformName', e.target.value)}
                  placeholder="Enter platform name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="platformVersion">Platform Version</Label>
                <Input
                  id="platformVersion"
                  value={formData.platformVersion}
                  onChange={(e) => handleInputChange('platformVersion', e.target.value)}
                  placeholder="e.g., 1.0.0"
                />
              </div>
            </div>
          </div>

          {/* System Limits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">System Limits</h3>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="maxUsers">Max Users</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  min="1"
                  value={formData.maxUsers}
                  onChange={(e) => handleInputChange('maxUsers', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxCoaches">Max Coaches</Label>
                <Input
                  id="maxCoaches"
                  type="number"
                  min="1"
                  value={formData.maxCoaches}
                  onChange={(e) => handleInputChange('maxCoaches', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxLeads">Max Leads</Label>
                <Input
                  id="maxLeads"
                  type="number"
                  min="1"
                  value={formData.maxLeads}
                  onChange={(e) => handleInputChange('maxLeads', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Maintenance Mode</h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="maintenanceMode"
                checked={formData.maintenanceMode}
                onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
              />
              <Label htmlFor="maintenanceMode">Enable Maintenance Mode</Label>
            </div>
            
            {formData.maintenanceMode && (
              <div className="space-y-2">
                <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                <Textarea
                  id="maintenanceMessage"
                  value={formData.maintenanceMessage}
                  onChange={(e) => handleInputChange('maintenanceMessage', e.target.value)}
                  placeholder="Enter maintenance message"
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* System Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">System Configuration</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="systemTimezone">System Timezone</Label>
                <Select value={formData.systemTimezone} onValueChange={(value) => handleInputChange('systemTimezone', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map(tz => (
                      <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <Select value={formData.environment} onValueChange={(value) => handleInputChange('environment', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    {environments.map(env => (
                      <SelectItem key={env} value={env}>{env}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select value={formData.dateFormat} onValueChange={(value) => handleInputChange('dateFormat', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateFormats.map(format => (
                      <SelectItem key={format} value={format}>{format}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeFormat">Time Format</Label>
                <Select value={formData.timeFormat} onValueChange={(value) => handleInputChange('timeFormat', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time format" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeFormats.map(format => (
                      <SelectItem key={format} value={format}>{format}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Debug Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Debug Settings</h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="debugMode"
                checked={formData.debugMode}
                onCheckedChange={(checked) => handleInputChange('debugMode', checked)}
              />
              <Label htmlFor="debugMode">Enable Debug Mode</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logLevel">Log Level</Label>
              <Select value={formData.logLevel} onValueChange={(value) => handleInputChange('logLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select log level" />
                </SelectTrigger>
                <SelectContent>
                  {logLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PlatformCoreConfig;
