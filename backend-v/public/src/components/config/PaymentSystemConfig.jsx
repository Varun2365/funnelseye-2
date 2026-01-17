import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { CreditCard, Save, AlertCircle, Plus, Trash2 } from 'lucide-react';

const PaymentSystemConfig = ({ config, onSave, saving }) => {
  const [formData, setFormData] = useState({
    // Platform Fees
    defaultPercentage: config?.platformFees?.defaultPercentage || 10,
    minimumAmount: config?.platformFees?.minimumAmount || 1,
    byCategory: config?.platformFees?.byCategory || {
      fitness_training: 10,
      nutrition_coaching: 8,
      weight_loss: 12,
      muscle_gain: 10,
      sports_performance: 15,
      wellness_coaching: 8,
      rehabilitation: 12,
      online_courses: 5,
      ebooks: 3,
      consultation: 15,
      other: 10
    },
    byPriceRange: config?.platformFees?.byPriceRange || [
      { minAmount: 0, maxAmount: 100, percentage: 10 },
      { minAmount: 100, maxAmount: 500, percentage: 8 },
      { minAmount: 500, maxAmount: 1000, percentage: 6 },
      { minAmount: 1000, maxAmount: 10000, percentage: 5 }
    ],
    
    // MLM Commission Structure
    enableMLMCommissions: config?.mlmCommissionStructure?.enableMLMCommissions || true,
    defaultCommissionRate: config?.mlmCommissionStructure?.defaultCommissionRate || 5,
    maxCommissionLevels: config?.mlmCommissionStructure?.maxCommissionLevels || 12,
    commissionLevels: config?.mlmCommissionStructure?.commissionLevels || {
      1: 5, 2: 3, 3: 2, 4: 1, 5: 1, 6: 0.5, 7: 0.5, 8: 0.5, 9: 0.5, 10: 0.5, 11: 0.5, 12: 0.5
    },
    
    // Payment Processing
    defaultCurrency: config?.paymentProcessing?.defaultCurrency || 'USD',
    supportedCurrencies: config?.paymentProcessing?.supportedCurrencies || ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    enableMultiCurrency: config?.paymentProcessing?.enableMultiCurrency || false,
    autoCurrencyConversion: config?.paymentProcessing?.autoCurrencyConversion || false,
    
    // Payment Gateways
    primaryGateway: config?.paymentGateways?.primaryGateway || 'razorpay',
    enableRazorpay: config?.paymentGateways?.enableRazorpay || true,
    enableStripe: config?.paymentGateways?.enableStripe || false,
    enablePayPal: config?.paymentGateways?.enablePayPal || false,
    
    // Subscription Settings
    enableSubscriptions: config?.subscriptionSettings?.enableSubscriptions || true,
    defaultSubscriptionDuration: config?.subscriptionSettings?.defaultSubscriptionDuration || 30,
    enableTrialPeriods: config?.subscriptionSettings?.enableTrialPeriods || true,
    trialPeriodDays: config?.subscriptionSettings?.trialPeriodDays || 7,
    
    // Refund Policy
    enableRefunds: config?.refundPolicy?.enableRefunds || true,
    refundWindowDays: config?.refundPolicy?.refundWindowDays || 30,
    autoRefundApproval: config?.refundPolicy?.autoRefundApproval || false,
    
    // Tax Settings
    enableTaxCalculation: config?.taxSettings?.enableTaxCalculation || false,
    defaultTaxRate: config?.taxSettings?.defaultTaxRate || 0,
    taxInclusive: config?.taxSettings?.taxInclusive || false
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

  const handleArrayInputChange = (parentField, index, childField, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: prev[parentField].map((item, i) => 
        i === index ? { ...item, [childField]: value } : item
      )
    }));
  };

  const addPriceRange = () => {
    setFormData(prev => ({
      ...prev,
      byPriceRange: [...prev.byPriceRange, { minAmount: 0, maxAmount: 1000, percentage: 5 }]
    }));
  };

  const removePriceRange = (index) => {
    setFormData(prev => ({
      ...prev,
      byPriceRange: prev.byPriceRange.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.defaultPercentage < 0 || formData.defaultPercentage > 100) {
      setError('Default percentage must be between 0 and 100');
      return;
    }
    
    if (formData.minimumAmount < 0) {
      setError('Minimum amount must be greater than or equal to 0');
      return;
    }

    setError('');
    
    // Structure the data properly
    const structuredData = {
      platformFees: {
        defaultPercentage: formData.defaultPercentage,
        minimumAmount: formData.minimumAmount,
        byCategory: formData.byCategory,
        byPriceRange: formData.byPriceRange
      },
      mlmCommissionStructure: {
        enableMLMCommissions: formData.enableMLMCommissions,
        defaultCommissionRate: formData.defaultCommissionRate,
        maxCommissionLevels: formData.maxCommissionLevels,
        commissionLevels: formData.commissionLevels
      },
      paymentProcessing: {
        defaultCurrency: formData.defaultCurrency,
        supportedCurrencies: formData.supportedCurrencies,
        enableMultiCurrency: formData.enableMultiCurrency,
        autoCurrencyConversion: formData.autoCurrencyConversion
      },
      paymentGateways: {
        primaryGateway: formData.primaryGateway,
        enableRazorpay: formData.enableRazorpay,
        enableStripe: formData.enableStripe,
        enablePayPal: formData.enablePayPal
      },
      subscriptionSettings: {
        enableSubscriptions: formData.enableSubscriptions,
        defaultSubscriptionDuration: formData.defaultSubscriptionDuration,
        enableTrialPeriods: formData.enableTrialPeriods,
        trialPeriodDays: formData.trialPeriodDays
      },
      refundPolicy: {
        enableRefunds: formData.enableRefunds,
        refundWindowDays: formData.refundWindowDays,
        autoRefundApproval: formData.autoRefundApproval
      },
      taxSettings: {
        enableTaxCalculation: formData.enableTaxCalculation,
        defaultTaxRate: formData.defaultTaxRate,
        taxInclusive: formData.taxInclusive
      }
    };
    
    onSave(structuredData);
  };

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK'];
  const categories = [
    'fitness_training', 'nutrition_coaching', 'weight_loss', 'muscle_gain',
    'sports_performance', 'wellness_coaching', 'rehabilitation', 'online_courses',
    'ebooks', 'consultation', 'other'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Payment System Configuration</span>
        </CardTitle>
        <CardDescription>
          Configure payment processing, fees, commissions, and subscription settings
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

          {/* Platform Fees */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Platform Fees</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="defaultPercentage">Default Platform Fee (%)</Label>
                <Input
                  id="defaultPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.defaultPercentage}
                  onChange={(e) => handleInputChange('defaultPercentage', parseFloat(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minimumAmount">Minimum Fee Amount</Label>
                <Input
                  id="minimumAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minimumAmount}
                  onChange={(e) => handleInputChange('minimumAmount', parseFloat(e.target.value))}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-md font-medium">Category-Specific Fees</h4>
              <div className="grid gap-4 md:grid-cols-2">
                {categories.map(category => (
                  <div key={category} className="space-y-2">
                    <Label htmlFor={`category-${category}`}>
                      {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} (%)
                    </Label>
                    <Input
                      id={`category-${category}`}
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.byCategory[category]}
                      onChange={(e) => handleNestedInputChange('byCategory', category, parseFloat(e.target.value))}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium">Price Range Fees</h4>
                <Button type="button" variant="outline" size="sm" onClick={addPriceRange}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Range
                </Button>
              </div>
              
              {formData.byPriceRange.map((range, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="0"
                    placeholder="Min Amount"
                    value={range.minAmount}
                    onChange={(e) => handleArrayInputChange('byPriceRange', index, 'minAmount', parseFloat(e.target.value))}
                  />
                  <Input
                    type="number"
                    min="0"
                    placeholder="Max Amount"
                    value={range.maxAmount}
                    onChange={(e) => handleArrayInputChange('byPriceRange', index, 'maxAmount', parseFloat(e.target.value))}
                  />
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="Percentage"
                    value={range.percentage}
                    onChange={(e) => handleArrayInputChange('byPriceRange', index, 'percentage', parseFloat(e.target.value))}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removePriceRange(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* MLM Commission Structure */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">MLM Commission Structure</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableMLMCommissions"
                  checked={formData.enableMLMCommissions}
                  onCheckedChange={(checked) => handleInputChange('enableMLMCommissions', checked)}
                />
                <Label htmlFor="enableMLMCommissions">Enable MLM Commissions</Label>
              </div>
            </div>
            
            {formData.enableMLMCommissions && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="defaultCommissionRate">Default Commission Rate (%)</Label>
                    <Input
                      id="defaultCommissionRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.defaultCommissionRate}
                      onChange={(e) => handleInputChange('defaultCommissionRate', parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxCommissionLevels">Max Commission Levels</Label>
                    <Input
                      id="maxCommissionLevels"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.maxCommissionLevels}
                      onChange={(e) => handleInputChange('maxCommissionLevels', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-md font-medium">Commission Levels</h4>
                  <div className="grid gap-4 md:grid-cols-4">
                    {Array.from({ length: formData.maxCommissionLevels }, (_, i) => i + 1).map(level => (
                      <div key={level} className="space-y-2">
                        <Label htmlFor={`level-${level}`}>Level {level} (%)</Label>
                        <Input
                          id={`level-${level}`}
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.commissionLevels[level] || 0}
                          onChange={(e) => handleNestedInputChange('commissionLevels', level, parseFloat(e.target.value))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Payment Processing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Processing</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select value={formData.defaultCurrency} onValueChange={(value) => handleInputChange('defaultCurrency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supportedCurrencies">Supported Currencies</Label>
                <Select 
                  value={formData.supportedCurrencies} 
                  onValueChange={(value) => handleInputChange('supportedCurrencies', value.split(','))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currencies" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableMultiCurrency"
                  checked={formData.enableMultiCurrency}
                  onCheckedChange={(checked) => handleInputChange('enableMultiCurrency', checked)}
                />
                <Label htmlFor="enableMultiCurrency">Enable Multi-Currency Support</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoCurrencyConversion"
                  checked={formData.autoCurrencyConversion}
                  onCheckedChange={(checked) => handleInputChange('autoCurrencyConversion', checked)}
                />
                <Label htmlFor="autoCurrencyConversion">Enable Auto Currency Conversion</Label>
              </div>
            </div>
          </div>

          {/* Payment Gateways */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Gateways</h3>
            
            <div className="space-y-2">
              <Label htmlFor="primaryGateway">Primary Gateway</Label>
              <Select value={formData.primaryGateway} onValueChange={(value) => handleInputChange('primaryGateway', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select primary gateway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableRazorpay"
                  checked={formData.enableRazorpay}
                  onCheckedChange={(checked) => handleInputChange('enableRazorpay', checked)}
                />
                <Label htmlFor="enableRazorpay">Enable Razorpay</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableStripe"
                  checked={formData.enableStripe}
                  onCheckedChange={(checked) => handleInputChange('enableStripe', checked)}
                />
                <Label htmlFor="enableStripe">Enable Stripe</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enablePayPal"
                  checked={formData.enablePayPal}
                  onCheckedChange={(checked) => handleInputChange('enablePayPal', checked)}
                />
                <Label htmlFor="enablePayPal">Enable PayPal</Label>
              </div>
            </div>
          </div>

          {/* Subscription Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Subscription Settings</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableSubscriptions"
                  checked={formData.enableSubscriptions}
                  onCheckedChange={(checked) => handleInputChange('enableSubscriptions', checked)}
                />
                <Label htmlFor="enableSubscriptions">Enable Subscriptions</Label>
              </div>
            </div>
            
            {formData.enableSubscriptions && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="defaultSubscriptionDuration">Default Duration (days)</Label>
                    <Input
                      id="defaultSubscriptionDuration"
                      type="number"
                      min="1"
                      max="365"
                      value={formData.defaultSubscriptionDuration}
                      onChange={(e) => handleInputChange('defaultSubscriptionDuration', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="trialPeriodDays">Trial Period (days)</Label>
                    <Input
                      id="trialPeriodDays"
                      type="number"
                      min="0"
                      max="30"
                      value={formData.trialPeriodDays}
                      onChange={(e) => handleInputChange('trialPeriodDays', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableTrialPeriods"
                      checked={formData.enableTrialPeriods}
                      onCheckedChange={(checked) => handleInputChange('enableTrialPeriods', checked)}
                    />
                    <Label htmlFor="enableTrialPeriods">Enable Trial Periods</Label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Refund Policy */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Refund Policy</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableRefunds"
                  checked={formData.enableRefunds}
                  onCheckedChange={(checked) => handleInputChange('enableRefunds', checked)}
                />
                <Label htmlFor="enableRefunds">Enable Refunds</Label>
              </div>
            </div>
            
            {formData.enableRefunds && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="refundWindowDays">Refund Window (days)</Label>
                    <Input
                      id="refundWindowDays"
                      type="number"
                      min="1"
                      max="90"
                      value={formData.refundWindowDays}
                      onChange={(e) => handleInputChange('refundWindowDays', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoRefundApproval"
                      checked={formData.autoRefundApproval}
                      onCheckedChange={(checked) => handleInputChange('autoRefundApproval', checked)}
                    />
                    <Label htmlFor="autoRefundApproval">Auto-approve Refunds</Label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tax Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tax Settings</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableTaxCalculation"
                  checked={formData.enableTaxCalculation}
                  onCheckedChange={(checked) => handleInputChange('enableTaxCalculation', checked)}
                />
                <Label htmlFor="enableTaxCalculation">Enable Tax Calculation</Label>
              </div>
            </div>
            
            {formData.enableTaxCalculation && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
                    <Input
                      id="defaultTaxRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.defaultTaxRate}
                      onChange={(e) => handleInputChange('defaultTaxRate', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="taxInclusive"
                      checked={formData.taxInclusive}
                      onCheckedChange={(checked) => handleInputChange('taxInclusive', checked)}
                    />
                    <Label htmlFor="taxInclusive">Tax Inclusive Pricing</Label>
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
                  Save Payment Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentSystemConfig;
