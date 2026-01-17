import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Users, Save, AlertCircle } from 'lucide-react';

const MLMConfig = ({ config, onSave, saving }) => {
  const [formData, setFormData] = useState({
    // MLM System Settings
    enableMLMSystem: config?.enableMLMSystem || true,
    maxDownlineLevels: config?.maxDownlineLevels || 12,
    enableAutoPlacement: config?.enableAutoPlacement || true,
    placementStrategy: config?.placementStrategy || 'left_to_right',
    
    // Commission Settings
    enableCommissions: config?.enableCommissions || true,
    commissionCalculationMethod: config?.commissionCalculationMethod || 'percentage',
    minimumCommissionAmount: config?.minimumCommissionAmount || 1,
    maximumCommissionAmount: config?.maximumCommissionAmount || 10000,
    
    // Rank System
    enableRankSystem: config?.enableRankSystem || true,
    rankRequirements: config?.rankRequirements || {
      bronze: { minSales: 1000, minTeamSize: 5 },
      silver: { minSales: 5000, minTeamSize: 20 },
      gold: { minSales: 15000, minTeamSize: 50 },
      platinum: { minSales: 50000, minTeamSize: 100 },
      diamond: { minSales: 100000, minTeamSize: 200 }
    },
    
    // Bonus Structure
    enableBonuses: config?.enableBonuses || true,
    fastStartBonus: config?.fastStartBonus || 50,
    leadershipBonus: config?.leadershipBonus || 100,
    matchingBonus: config?.matchingBonus || 25,
    
    // Qualification Requirements
    enableQualification: config?.enableQualification || true,
    qualificationPeriod: config?.qualificationPeriod || 30,
    minimumPersonalSales: config?.minimumPersonalSales || 100,
    minimumTeamSales: config?.minimumTeamSales || 500,
    
    // Genealogy Settings
    enableGenealogy: config?.enableGenealogy || true,
    maxChildrenPerNode: config?.maxChildrenPerNode || 2,
    enableReorganization: config?.enableReorganization || false,
    
    // Payout Settings
    enablePayouts: config?.enablePayouts || true,
    payoutFrequency: config?.payoutFrequency || 'monthly',
    minimumPayoutAmount: config?.minimumPayoutAmount || 50,
    payoutMethod: config?.payoutMethod || 'bank_transfer'
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
    if (formData.maxDownlineLevels < 1 || formData.maxDownlineLevels > 20) {
      setError('Max downline levels must be between 1 and 20');
      return;
    }
    
    if (formData.minimumCommissionAmount < 0) {
      setError('Minimum commission amount must be greater than or equal to 0');
      return;
    }

    setError('');
    onSave(formData);
  };

  const placementStrategies = [
    'left_to_right',
    'right_to_left',
    'spillover',
    'balanced',
    'forced_matrix'
  ];

  const commissionMethods = ['percentage', 'fixed_amount', 'tiered'];
  const payoutFrequencies = ['weekly', 'bi_weekly', 'monthly', 'quarterly'];
  const payoutMethods = ['bank_transfer', 'paypal', 'check', 'crypto'];

  const ranks = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>MLM System Configuration</span>
        </CardTitle>
        <CardDescription>
          Configure MLM system settings, commission structure, and rank requirements
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

          {/* MLM System Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">MLM System Settings</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableMLMSystem"
                  checked={formData.enableMLMSystem}
                  onCheckedChange={(checked) => handleInputChange('enableMLMSystem', checked)}
                />
                <Label htmlFor="enableMLMSystem">Enable MLM System</Label>
              </div>
            </div>
            
            {formData.enableMLMSystem && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxDownlineLevels">Max Downline Levels</Label>
                    <Input
                      id="maxDownlineLevels"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.maxDownlineLevels}
                      onChange={(e) => handleInputChange('maxDownlineLevels', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="placementStrategy">Placement Strategy</Label>
                    <Select value={formData.placementStrategy} onValueChange={(value) => handleInputChange('placementStrategy', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select placement strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        {placementStrategies.map(strategy => (
                          <SelectItem key={strategy} value={strategy}>
                            {strategy.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableAutoPlacement"
                      checked={formData.enableAutoPlacement}
                      onCheckedChange={(checked) => handleInputChange('enableAutoPlacement', checked)}
                    />
                    <Label htmlFor="enableAutoPlacement">Enable Auto Placement</Label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Commission Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Commission Settings</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableCommissions"
                  checked={formData.enableCommissions}
                  onCheckedChange={(checked) => handleInputChange('enableCommissions', checked)}
                />
                <Label htmlFor="enableCommissions">Enable Commissions</Label>
              </div>
            </div>
            
            {formData.enableCommissions && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="commissionCalculationMethod">Calculation Method</Label>
                    <Select value={formData.commissionCalculationMethod} onValueChange={(value) => handleInputChange('commissionCalculationMethod', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select calculation method" />
                      </SelectTrigger>
                      <SelectContent>
                        {commissionMethods.map(method => (
                          <SelectItem key={method} value={method}>
                            {method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minimumCommissionAmount">Minimum Commission Amount</Label>
                    <Input
                      id="minimumCommissionAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minimumCommissionAmount}
                      onChange={(e) => handleInputChange('minimumCommissionAmount', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maximumCommissionAmount">Maximum Commission Amount</Label>
                  <Input
                    id="maximumCommissionAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maximumCommissionAmount}
                    onChange={(e) => handleInputChange('maximumCommissionAmount', parseFloat(e.target.value))}
                  />
                </div>
              </>
            )}
          </div>

          {/* Rank System */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Rank System</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableRankSystem"
                  checked={formData.enableRankSystem}
                  onCheckedChange={(checked) => handleInputChange('enableRankSystem', checked)}
                />
                <Label htmlFor="enableRankSystem">Enable Rank System</Label>
              </div>
            </div>
            
            {formData.enableRankSystem && (
              <div className="space-y-4">
                <h4 className="text-md font-medium">Rank Requirements</h4>
                {ranks.map(rank => (
                  <div key={rank} className="grid gap-4 md:grid-cols-3 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label className="font-medium capitalize">{rank} Rank</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${rank}-minSales`}>Min Sales</Label>
                      <Input
                        id={`${rank}-minSales`}
                        type="number"
                        min="0"
                        value={formData.rankRequirements[rank]?.minSales || 0}
                        onChange={(e) => handleNestedInputChange('rankRequirements', rank, 'minSales', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${rank}-minTeamSize`}>Min Team Size</Label>
                      <Input
                        id={`${rank}-minTeamSize`}
                        type="number"
                        min="0"
                        value={formData.rankRequirements[rank]?.minTeamSize || 0}
                        onChange={(e) => handleNestedInputChange('rankRequirements', rank, 'minTeamSize', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bonus Structure */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bonus Structure</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableBonuses"
                  checked={formData.enableBonuses}
                  onCheckedChange={(checked) => handleInputChange('enableBonuses', checked)}
                />
                <Label htmlFor="enableBonuses">Enable Bonuses</Label>
              </div>
            </div>
            
            {formData.enableBonuses && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="fastStartBonus">Fast Start Bonus</Label>
                  <Input
                    id="fastStartBonus"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.fastStartBonus}
                    onChange={(e) => handleInputChange('fastStartBonus', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="leadershipBonus">Leadership Bonus</Label>
                  <Input
                    id="leadershipBonus"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.leadershipBonus}
                    onChange={(e) => handleInputChange('leadershipBonus', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="matchingBonus">Matching Bonus</Label>
                  <Input
                    id="matchingBonus"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.matchingBonus}
                    onChange={(e) => handleInputChange('matchingBonus', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Qualification Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Qualification Requirements</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableQualification"
                  checked={formData.enableQualification}
                  onCheckedChange={(checked) => handleInputChange('enableQualification', checked)}
                />
                <Label htmlFor="enableQualification">Enable Qualification</Label>
              </div>
            </div>
            
            {formData.enableQualification && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="qualificationPeriod">Qualification Period (days)</Label>
                  <Input
                    id="qualificationPeriod"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.qualificationPeriod}
                    onChange={(e) => handleInputChange('qualificationPeriod', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minimumPersonalSales">Min Personal Sales</Label>
                  <Input
                    id="minimumPersonalSales"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minimumPersonalSales}
                    onChange={(e) => handleInputChange('minimumPersonalSales', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minimumTeamSales">Min Team Sales</Label>
                  <Input
                    id="minimumTeamSales"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minimumTeamSales}
                    onChange={(e) => handleInputChange('minimumTeamSales', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Genealogy Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Genealogy Settings</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableGenealogy"
                  checked={formData.enableGenealogy}
                  onCheckedChange={(checked) => handleInputChange('enableGenealogy', checked)}
                />
                <Label htmlFor="enableGenealogy">Enable Genealogy</Label>
              </div>
            </div>
            
            {formData.enableGenealogy && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxChildrenPerNode">Max Children Per Node</Label>
                    <Input
                      id="maxChildrenPerNode"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.maxChildrenPerNode}
                      onChange={(e) => handleInputChange('maxChildrenPerNode', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableReorganization"
                      checked={formData.enableReorganization}
                      onCheckedChange={(checked) => handleInputChange('enableReorganization', checked)}
                    />
                    <Label htmlFor="enableReorganization">Enable Reorganization</Label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Payout Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payout Settings</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enablePayouts"
                  checked={formData.enablePayouts}
                  onCheckedChange={(checked) => handleInputChange('enablePayouts', checked)}
                />
                <Label htmlFor="enablePayouts">Enable Payouts</Label>
              </div>
            </div>
            
            {formData.enablePayouts && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="payoutFrequency">Payout Frequency</Label>
                  <Select value={formData.payoutFrequency} onValueChange={(value) => handleInputChange('payoutFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {payoutFrequencies.map(frequency => (
                        <SelectItem key={frequency} value={frequency}>
                          {frequency.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minimumPayoutAmount">Minimum Payout Amount</Label>
                  <Input
                    id="minimumPayoutAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minimumPayoutAmount}
                    onChange={(e) => handleInputChange('minimumPayoutAmount', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="payoutMethod">Payout Method</Label>
                  <Select value={formData.payoutMethod} onValueChange={(value) => handleInputChange('payoutMethod', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {payoutMethods.map(method => (
                        <SelectItem key={method} value={method}>
                          {method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  Save MLM Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MLMConfig;
