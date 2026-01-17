import React, { useState } from 'react';
import environmentConfig from '../../config/environment.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { Globe, Save, AlertCircle, Plus, Trash2 } from 'lucide-react';

const CORSConfig = ({ config, onSave, saving }) => {
  // Get current environment and base URL
  const currentEnv = environmentConfig.ENVIRONMENT;
  const apiBaseUrl = environmentConfig.API_BASE_URL;
  
  // Generate development origins dynamically
  const getDevelopmentOrigins = () => {
    const baseUrl = apiBaseUrl.replace(/^https?:\/\//, '');
    const [host, port] = baseUrl.split(':');
    const protocol = apiBaseUrl.startsWith('https') ? 'https' : 'http';
    
    return [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:5173',
      `${protocol}://${host}${port ? `:${port}` : ''}`,
      `${protocol}://127.0.0.1${port ? `:${port}` : ''}`
    ];
  };

  const [formData, setFormData] = useState({
    // CORS Origins
    allowedOrigins: config?.allowedOrigins || [
      ...getDevelopmentOrigins(),
      'https://funnelseye.com',
      'https://www.funnelseye.com',
      'https://app.funnelseye.com',
      'https://admin.funnelseye.com',
      'https://api.funnelseye.com'
    ],
    
    // CORS Methods
    allowedMethods: config?.allowedMethods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    
    // CORS Headers
    allowedHeaders: config?.allowedHeaders || [
      'Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin',
      'X-API-Key', 'X-Client-Version', 'Cache-Control', 'Pragma', 'Expires',
      'x-coach-id', 'X-Coach-ID', 'x-user-id', 'X-User-ID', 'x-session-id',
      'X-Session-ID', 'x-request-id', 'X-Request-ID', 'x-forwarded-for',
      'X-Forwarded-For', 'x-real-ip', 'X-Real-IP', 'x-custom-domain',
      'X-Custom-Domain', 'x-auth-token', 'X-Auth-Token', 'x-refresh-token',
      'X-Refresh-Token', 'x-tenant-id', 'X-Tenant-ID', 'x-version', 'X-Version'
    ],
    
    // CORS Settings
    credentials: config?.credentials || true,
    maxAge: config?.maxAge || 86400,
    
    // Security Settings
    enableCORS: config?.enableCORS || true,
    enablePreflight: config?.enablePreflight || true,
    enableCredentials: config?.enableCredentials || true,
    
    // Environment-specific Origins
    developmentOrigins: config?.developmentOrigins || getDevelopmentOrigins(),
    
    stagingOrigins: config?.stagingOrigins || [
      'https://staging.funnelseye.com',
      'https://staging-app.funnelseye.com',
      'https://staging-admin.funnelseye.com'
    ],
    
    productionOrigins: config?.productionOrigins || [
      'https://funnelseye.com',
      'https://www.funnelseye.com',
      'https://app.funnelseye.com',
      'https://admin.funnelseye.com',
      'https://api.funnelseye.com'
    ]
  });

  const [error, setError] = useState('');
  const [newOrigin, setNewOrigin] = useState('');
  const [newMethod, setNewMethod] = useState('');
  const [newHeader, setNewHeader] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field, value) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.allowedOrigins.length) {
      setError('At least one allowed origin is required');
      return;
    }
    
    if (!formData.allowedMethods.length) {
      setError('At least one allowed method is required');
      return;
    }

    setError('');
    onSave(formData);
  };

  const commonMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'];
  const commonHeaders = [
    'Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin',
    'X-API-Key', 'X-Client-Version', 'Cache-Control', 'Pragma', 'Expires'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="h-5 w-5" />
          <span>CORS Configuration</span>
        </CardTitle>
        <CardDescription>
          Configure Cross-Origin Resource Sharing (CORS) settings for API access
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

          {/* CORS Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">CORS Settings</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableCORS"
                  checked={formData.enableCORS}
                  onCheckedChange={(checked) => handleInputChange('enableCORS', checked)}
                />
                <Label htmlFor="enableCORS">Enable CORS</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enablePreflight"
                  checked={formData.enablePreflight}
                  onCheckedChange={(checked) => handleInputChange('enablePreflight', checked)}
                />
                <Label htmlFor="enablePreflight">Enable Preflight Requests</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableCredentials"
                  checked={formData.enableCredentials}
                  onCheckedChange={(checked) => handleInputChange('enableCredentials', checked)}
                />
                <Label htmlFor="enableCredentials">Enable Credentials</Label>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxAge">Max Age (seconds)</Label>
                <Input
                  id="maxAge"
                  type="number"
                  min="0"
                  max="86400"
                  value={formData.maxAge}
                  onChange={(e) => handleInputChange('maxAge', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Allowed Origins */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Allowed Origins</h3>
            
            <div className="space-y-4">
              {formData.allowedOrigins.map((origin, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={origin}
                    onChange={(e) => handleArrayInputChange('allowedOrigins', index, e.target.value)}
                    placeholder="https://example.com"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('allowedOrigins', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="flex items-center space-x-2">
                <Input
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  placeholder="Add new origin (e.g., https://example.com)"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addArrayItem('allowedOrigins', newOrigin);
                    setNewOrigin('');
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Allowed Methods */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Allowed Methods</h3>
            
            <div className="space-y-4">
              {formData.allowedMethods.map((method, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={method}
                    onChange={(e) => handleArrayInputChange('allowedMethods', index, e.target.value)}
                    placeholder="GET, POST, PUT, etc."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('allowedMethods', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="flex items-center space-x-2">
                <Input
                  value={newMethod}
                  onChange={(e) => setNewMethod(e.target.value)}
                  placeholder="Add new method (e.g., HEAD)"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addArrayItem('allowedMethods', newMethod);
                    setNewMethod('');
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Quick Add Common Methods */}
            <div className="space-y-2">
              <Label>Quick Add Common Methods:</Label>
              <div className="flex flex-wrap gap-2">
                {commonMethods.map(method => (
                  <Button
                    key={method}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!formData.allowedMethods.includes(method)) {
                        addArrayItem('allowedMethods', method);
                      }
                    }}
                    disabled={formData.allowedMethods.includes(method)}
                  >
                    {method}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Allowed Headers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Allowed Headers</h3>
            
            <div className="space-y-4">
              {formData.allowedHeaders.map((header, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={header}
                    onChange={(e) => handleArrayInputChange('allowedHeaders', index, e.target.value)}
                    placeholder="Content-Type, Authorization, etc."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('allowedHeaders', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="flex items-center space-x-2">
                <Input
                  value={newHeader}
                  onChange={(e) => setNewHeader(e.target.value)}
                  placeholder="Add new header (e.g., X-Custom-Header)"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addArrayItem('allowedHeaders', newHeader);
                    setNewHeader('');
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Quick Add Common Headers */}
            <div className="space-y-2">
              <Label>Quick Add Common Headers:</Label>
              <div className="flex flex-wrap gap-2">
                {commonHeaders.map(header => (
                  <Button
                    key={header}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!formData.allowedHeaders.includes(header)) {
                        addArrayItem('allowedHeaders', header);
                      }
                    }}
                    disabled={formData.allowedHeaders.includes(header)}
                  >
                    {header}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Environment-specific Origins */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Environment-specific Origins</h3>
            
            {/* Development Origins */}
            <div className="space-y-2">
              <Label>Development Origins</Label>
              <div className="space-y-2">
                {formData.developmentOrigins.map((origin, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={origin}
                      onChange={(e) => handleArrayInputChange('developmentOrigins', index, e.target.value)}
                      placeholder="http://localhost:3000"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('developmentOrigins', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Staging Origins */}
            <div className="space-y-2">
              <Label>Staging Origins</Label>
              <div className="space-y-2">
                {formData.stagingOrigins.map((origin, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={origin}
                      onChange={(e) => handleArrayInputChange('stagingOrigins', index, e.target.value)}
                      placeholder="https://staging.example.com"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('stagingOrigins', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Production Origins */}
            <div className="space-y-2">
              <Label>Production Origins</Label>
              <div className="space-y-2">
                {formData.productionOrigins.map((origin, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={origin}
                      onChange={(e) => handleArrayInputChange('productionOrigins', index, e.target.value)}
                      placeholder="https://example.com"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('productionOrigins', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
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
                  Save CORS Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CORSConfig;
