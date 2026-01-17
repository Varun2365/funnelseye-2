import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { Database, Save, AlertCircle } from 'lucide-react';

const DatabaseConfig = ({ config, onSave, saving }) => {
  const [formData, setFormData] = useState({
    // Connection Pool Settings
    maxPoolSize: config?.connectionPool?.maxPoolSize || 10,
    socketTimeoutMS: config?.connectionPool?.socketTimeoutMS || 0,
    connectTimeoutMS: config?.connectionPool?.connectTimeoutMS || 30000,
    serverSelectionTimeoutMS: config?.connectionPool?.serverSelectionTimeoutMS || 30000,
    heartbeatFrequencyMS: config?.connectionPool?.heartbeatFrequencyMS || 10000,
    
    // Retry Settings
    retryAttempts: config?.retryAttempts || 3,
    retryDelay: config?.retryDelay || 1000,
    
    // Index Settings
    enableAutoIndexing: config?.indexing?.enableAutoIndexing || true,
    indexBackgroundBuild: config?.indexing?.indexBackgroundBuild || true,
    indexBuildTimeoutMS: config?.indexing?.indexBuildTimeoutMS || 300000,
    
    // Query Settings
    enableQueryOptimization: config?.query?.enableQueryOptimization || true,
    queryTimeoutMS: config?.query?.queryTimeoutMS || 30000,
    enableSlowQueryLogging: config?.query?.enableSlowQueryLogging || true,
    slowQueryThresholdMS: config?.query?.slowQueryThresholdMS || 1000,
    
    // Backup Settings
    enableBackups: config?.backup?.enableBackups || true,
    backupFrequency: config?.backup?.backupFrequency || 'daily',
    backupRetentionDays: config?.backup?.backupRetentionDays || 30,
    enableIncrementalBackups: config?.backup?.enableIncrementalBackups || true,
    
    // Monitoring Settings
    enableMonitoring: config?.monitoring?.enableMonitoring || true,
    enablePerformanceMetrics: config?.monitoring?.enablePerformanceMetrics || true,
    enableConnectionMetrics: config?.monitoring?.enableConnectionMetrics || true,
    metricsRetentionDays: config?.monitoring?.metricsRetentionDays || 90,
    
    // Security Settings
    enableSSL: config?.security?.enableSSL || true,
    enableAuthentication: config?.security?.enableAuthentication || true,
    enableAuthorization: config?.security?.enableAuthorization || true,
    enableAuditLogging: config?.security?.enableAuditLogging || true,
    
    // Maintenance Settings
    enableAutoMaintenance: config?.maintenance?.enableAutoMaintenance || true,
    maintenanceWindow: config?.maintenance?.maintenanceWindow || '02:00-04:00',
    enableCompaction: config?.maintenance?.enableCompaction || true,
    compactionIntervalDays: config?.maintenance?.compactionIntervalDays || 7
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
    if (formData.maxPoolSize < 1 || formData.maxPoolSize > 100) {
      setError('Max pool size must be between 1 and 100');
      return;
    }
    
    if (formData.retryAttempts < 0 || formData.retryAttempts > 10) {
      setError('Retry attempts must be between 0 and 10');
      return;
    }

    setError('');
    
    // Structure the data properly
    const structuredData = {
      connectionPool: {
        maxPoolSize: formData.maxPoolSize,
        socketTimeoutMS: formData.socketTimeoutMS,
        connectTimeoutMS: formData.connectTimeoutMS,
        serverSelectionTimeoutMS: formData.serverSelectionTimeoutMS,
        heartbeatFrequencyMS: formData.heartbeatFrequencyMS
      },
      retryAttempts: formData.retryAttempts,
      retryDelay: formData.retryDelay,
      indexing: {
        enableAutoIndexing: formData.enableAutoIndexing,
        indexBackgroundBuild: formData.indexBackgroundBuild,
        indexBuildTimeoutMS: formData.indexBuildTimeoutMS
      },
      query: {
        enableQueryOptimization: formData.enableQueryOptimization,
        queryTimeoutMS: formData.queryTimeoutMS,
        enableSlowQueryLogging: formData.enableSlowQueryLogging,
        slowQueryThresholdMS: formData.slowQueryThresholdMS
      },
      backup: {
        enableBackups: formData.enableBackups,
        backupFrequency: formData.backupFrequency,
        backupRetentionDays: formData.backupRetentionDays,
        enableIncrementalBackups: formData.enableIncrementalBackups
      },
      monitoring: {
        enableMonitoring: formData.enableMonitoring,
        enablePerformanceMetrics: formData.enablePerformanceMetrics,
        enableConnectionMetrics: formData.enableConnectionMetrics,
        metricsRetentionDays: formData.metricsRetentionDays
      },
      security: {
        enableSSL: formData.enableSSL,
        enableAuthentication: formData.enableAuthentication,
        enableAuthorization: formData.enableAuthorization,
        enableAuditLogging: formData.enableAuditLogging
      },
      maintenance: {
        enableAutoMaintenance: formData.enableAutoMaintenance,
        maintenanceWindow: formData.maintenanceWindow,
        enableCompaction: formData.enableCompaction,
        compactionIntervalDays: formData.compactionIntervalDays
      }
    };
    
    onSave(structuredData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Database Configuration</span>
        </CardTitle>
        <CardDescription>
          Configure database connection, performance, and maintenance settings
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

          {/* Connection Pool Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Connection Pool Settings</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxPoolSize">Max Pool Size</Label>
                <Input
                  id="maxPoolSize"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxPoolSize}
                  onChange={(e) => handleInputChange('maxPoolSize', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="socketTimeoutMS">Socket Timeout (ms)</Label>
                <Input
                  id="socketTimeoutMS"
                  type="number"
                  min="0"
                  max="300000"
                  value={formData.socketTimeoutMS}
                  onChange={(e) => handleInputChange('socketTimeoutMS', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="connectTimeoutMS">Connect Timeout (ms)</Label>
                <Input
                  id="connectTimeoutMS"
                  type="number"
                  min="1000"
                  max="300000"
                  value={formData.connectTimeoutMS}
                  onChange={(e) => handleInputChange('connectTimeoutMS', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serverSelectionTimeoutMS">Server Selection Timeout (ms)</Label>
                <Input
                  id="serverSelectionTimeoutMS"
                  type="number"
                  min="1000"
                  max="300000"
                  value={formData.serverSelectionTimeoutMS}
                  onChange={(e) => handleInputChange('serverSelectionTimeoutMS', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="heartbeatFrequencyMS">Heartbeat Frequency (ms)</Label>
              <Input
                id="heartbeatFrequencyMS"
                type="number"
                min="1000"
                max="60000"
                value={formData.heartbeatFrequencyMS}
                onChange={(e) => handleInputChange('heartbeatFrequencyMS', parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* Retry Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Retry Settings</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="retryAttempts">Retry Attempts</Label>
                <Input
                  id="retryAttempts"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.retryAttempts}
                  onChange={(e) => handleInputChange('retryAttempts', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="retryDelay">Retry Delay (ms)</Label>
                <Input
                  id="retryDelay"
                  type="number"
                  min="100"
                  max="10000"
                  value={formData.retryDelay}
                  onChange={(e) => handleInputChange('retryDelay', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Index Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Index Settings</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableAutoIndexing"
                  checked={formData.enableAutoIndexing}
                  onCheckedChange={(checked) => handleInputChange('enableAutoIndexing', checked)}
                />
                <Label htmlFor="enableAutoIndexing">Enable Auto Indexing</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="indexBackgroundBuild"
                  checked={formData.indexBackgroundBuild}
                  onCheckedChange={(checked) => handleInputChange('indexBackgroundBuild', checked)}
                />
                <Label htmlFor="indexBackgroundBuild">Background Index Build</Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="indexBuildTimeoutMS">Index Build Timeout (ms)</Label>
              <Input
                id="indexBuildTimeoutMS"
                type="number"
                min="10000"
                max="1800000"
                value={formData.indexBuildTimeoutMS}
                onChange={(e) => handleInputChange('indexBuildTimeoutMS', parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* Query Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Query Settings</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableQueryOptimization"
                  checked={formData.enableQueryOptimization}
                  onCheckedChange={(checked) => handleInputChange('enableQueryOptimization', checked)}
                />
                <Label htmlFor="enableQueryOptimization">Enable Query Optimization</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableSlowQueryLogging"
                  checked={formData.enableSlowQueryLogging}
                  onCheckedChange={(checked) => handleInputChange('enableSlowQueryLogging', checked)}
                />
                <Label htmlFor="enableSlowQueryLogging">Enable Slow Query Logging</Label>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="queryTimeoutMS">Query Timeout (ms)</Label>
                <Input
                  id="queryTimeoutMS"
                  type="number"
                  min="1000"
                  max="300000"
                  value={formData.queryTimeoutMS}
                  onChange={(e) => handleInputChange('queryTimeoutMS', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slowQueryThresholdMS">Slow Query Threshold (ms)</Label>
                <Input
                  id="slowQueryThresholdMS"
                  type="number"
                  min="100"
                  max="10000"
                  value={formData.slowQueryThresholdMS}
                  onChange={(e) => handleInputChange('slowQueryThresholdMS', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Backup Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Backup Settings</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableBackups"
                  checked={formData.enableBackups}
                  onCheckedChange={(checked) => handleInputChange('enableBackups', checked)}
                />
                <Label htmlFor="enableBackups">Enable Backups</Label>
              </div>
            </div>
            
            {formData.enableBackups && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Input
                      id="backupFrequency"
                      value={formData.backupFrequency}
                      onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                      placeholder="daily, weekly, monthly"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="backupRetentionDays">Backup Retention (days)</Label>
                    <Input
                      id="backupRetentionDays"
                      type="number"
                      min="1"
                      max="365"
                      value={formData.backupRetentionDays}
                      onChange={(e) => handleInputChange('backupRetentionDays', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableIncrementalBackups"
                      checked={formData.enableIncrementalBackups}
                      onCheckedChange={(checked) => handleInputChange('enableIncrementalBackups', checked)}
                    />
                    <Label htmlFor="enableIncrementalBackups">Enable Incremental Backups</Label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Monitoring Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Monitoring Settings</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableMonitoring"
                  checked={formData.enableMonitoring}
                  onCheckedChange={(checked) => handleInputChange('enableMonitoring', checked)}
                />
                <Label htmlFor="enableMonitoring">Enable Monitoring</Label>
              </div>
            </div>
            
            {formData.enableMonitoring && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enablePerformanceMetrics"
                      checked={formData.enablePerformanceMetrics}
                      onCheckedChange={(checked) => handleInputChange('enablePerformanceMetrics', checked)}
                    />
                    <Label htmlFor="enablePerformanceMetrics">Enable Performance Metrics</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableConnectionMetrics"
                      checked={formData.enableConnectionMetrics}
                      onCheckedChange={(checked) => handleInputChange('enableConnectionMetrics', checked)}
                    />
                    <Label htmlFor="enableConnectionMetrics">Enable Connection Metrics</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="metricsRetentionDays">Metrics Retention (days)</Label>
                  <Input
                    id="metricsRetentionDays"
                    type="number"
                    min="7"
                    max="365"
                    value={formData.metricsRetentionDays}
                    onChange={(e) => handleInputChange('metricsRetentionDays', parseInt(e.target.value))}
                  />
                </div>
              </>
            )}
          </div>

          {/* Security Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Security Settings</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableSSL"
                  checked={formData.enableSSL}
                  onCheckedChange={(checked) => handleInputChange('enableSSL', checked)}
                />
                <Label htmlFor="enableSSL">Enable SSL</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableAuthentication"
                  checked={formData.enableAuthentication}
                  onCheckedChange={(checked) => handleInputChange('enableAuthentication', checked)}
                />
                <Label htmlFor="enableAuthentication">Enable Authentication</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableAuthorization"
                  checked={formData.enableAuthorization}
                  onCheckedChange={(checked) => handleInputChange('enableAuthorization', checked)}
                />
                <Label htmlFor="enableAuthorization">Enable Authorization</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableAuditLogging"
                  checked={formData.enableAuditLogging}
                  onCheckedChange={(checked) => handleInputChange('enableAuditLogging', checked)}
                />
                <Label htmlFor="enableAuditLogging">Enable Audit Logging</Label>
              </div>
            </div>
          </div>

          {/* Maintenance Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Maintenance Settings</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableAutoMaintenance"
                  checked={formData.enableAutoMaintenance}
                  onCheckedChange={(checked) => handleInputChange('enableAutoMaintenance', checked)}
                />
                <Label htmlFor="enableAutoMaintenance">Enable Auto Maintenance</Label>
              </div>
            </div>
            
            {formData.enableAutoMaintenance && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maintenanceWindow">Maintenance Window</Label>
                    <Input
                      id="maintenanceWindow"
                      value={formData.maintenanceWindow}
                      onChange={(e) => handleInputChange('maintenanceWindow', e.target.value)}
                      placeholder="02:00-04:00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="compactionIntervalDays">Compaction Interval (days)</Label>
                    <Input
                      id="compactionIntervalDays"
                      type="number"
                      min="1"
                      max="30"
                      value={formData.compactionIntervalDays}
                      onChange={(e) => handleInputChange('compactionIntervalDays', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableCompaction"
                      checked={formData.enableCompaction}
                      onCheckedChange={(checked) => handleInputChange('enableCompaction', checked)}
                    />
                    <Label htmlFor="enableCompaction">Enable Compaction</Label>
                  </div>
                </div>
              </>
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
                  Save Database Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DatabaseConfig;
