import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { RefreshCw, Settings, Calculator, DollarSign, TrendingUp, Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import axios from 'axios';

const CommissionManagementTab = () => {
    const [commissionSettings, setCommissionSettings] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [commissionData, setCommissionData] = useState({
        commissionPercentage: 0,
        minimumSubscriptionAmount: 0,
        maximumCommissionAmount: 0,
        notes: ''
    });
    const [calculationResult, setCalculationResult] = useState(null);
    const [monthlyCommissionData, setMonthlyCommissionData] = useState({
        month: '',
        year: ''
    });
    const { showToast } = useToast();

    // Fetch commission settings
    const fetchCommissionSettings = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/advanced-mlm/admin/commission-settings');
            if (response.data.success) {
                const settings = response.data.data || {};
                setCommissionSettings(settings);
                setCommissionData({
                    commissionPercentage: settings.commissionPercentage || 0,
                    minimumSubscriptionAmount: settings.minimumSubscriptionAmount || 0,
                    maximumCommissionAmount: settings.maximumCommissionAmount || 0,
                    notes: settings.notes || ''
                });
            } else {
                showToast('Failed to fetch commission settings', 'error');
            }
        } catch (error) {
            console.error('Error fetching commission settings:', error);
            showToast('Error fetching commission settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Update commission settings
    const updateCommissionSettings = async () => {
        setSaving(true);
        try {
            const response = await axios.put('/advanced-mlm/admin/commission-settings', commissionData);
            if (response.data.success) {
                showToast('Commission settings updated successfully', 'success');
                setCommissionSettings(response.data.data);
            } else {
                showToast('Failed to update commission settings', 'error');
            }
        } catch (error) {
            console.error('Error updating commission settings:', error);
            showToast('Error updating commission settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Calculate commission
    const calculateCommission = async () => {
        setCalculating(true);
        try {
            const response = await axios.post('/advanced-mlm/admin/calculate-commission', {
                subscriptionAmount: 1000, // Example amount
                coachId: 'example-coach-id'
            });
            if (response.data.success) {
                setCalculationResult(response.data.data);
                showToast('Commission calculated successfully', 'success');
            } else {
                showToast('Failed to calculate commission', 'error');
            }
        } catch (error) {
            console.error('Error calculating commission:', error);
            showToast('Error calculating commission', 'error');
        } finally {
            setCalculating(false);
        }
    };

    // Process monthly commissions
    const processMonthlyCommissions = async () => {
        if (!monthlyCommissionData.month || !monthlyCommissionData.year) {
            showToast('Please select month and year', 'error');
            return;
        }

        setCalculating(true);
        try {
            const response = await axios.post('/advanced-mlm/admin/process-monthly-commissions', monthlyCommissionData);
            if (response.data.success) {
                showToast('Monthly commissions processed successfully', 'success');
            } else {
                showToast('Failed to process monthly commissions', 'error');
            }
        } catch (error) {
            console.error('Error processing monthly commissions:', error);
            showToast('Error processing monthly commissions', 'error');
        } finally {
            setCalculating(false);
        }
    };

    useEffect(() => {
        fetchCommissionSettings();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Commission Management</h2>
                    <p className="text-muted-foreground">
                        Configure commission rates and process monthly payouts
                    </p>
                </div>
                <Button onClick={fetchCommissionSettings} disabled={loading} variant="outline">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Commission Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Commission Settings</CardTitle>
                    <CardDescription>
                        Configure commission rates and limits
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="commissionPercentage">Commission Percentage (%)</Label>
                                <Input
                                    id="commissionPercentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={commissionData.commissionPercentage}
                                    onChange={(e) => 
                                        setCommissionData(prev => ({ 
                                            ...prev, 
                                            commissionPercentage: parseFloat(e.target.value) || 0 
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="minimumSubscriptionAmount">Minimum Subscription Amount</Label>
                                <Input
                                    id="minimumSubscriptionAmount"
                                    type="number"
                                    min="0"
                                    value={commissionData.minimumSubscriptionAmount}
                                    onChange={(e) => 
                                        setCommissionData(prev => ({ 
                                            ...prev, 
                                            minimumSubscriptionAmount: parseFloat(e.target.value) || 0 
                                        }))
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="maximumCommissionAmount">Maximum Commission Amount</Label>
                                <Input
                                    id="maximumCommissionAmount"
                                    type="number"
                                    min="0"
                                    value={commissionData.maximumCommissionAmount}
                                    onChange={(e) => 
                                        setCommissionData(prev => ({ 
                                            ...prev, 
                                            maximumCommissionAmount: parseFloat(e.target.value) || 0 
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Add notes about commission settings..."
                                    value={commissionData.notes}
                                    onChange={(e) => 
                                        setCommissionData(prev => ({ ...prev, notes: e.target.value }))
                                    }
                                />
                            </div>
                        </div>
                        <Button 
                            onClick={updateCommissionSettings} 
                            disabled={saving}
                            className="w-full"
                        >
                            {saving ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Settings
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Commission Calculation */}
            <Card>
                <CardHeader>
                    <CardTitle>Commission Calculation</CardTitle>
                    <CardDescription>
                        Test commission calculations with sample data
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Button 
                            onClick={calculateCommission} 
                            disabled={calculating}
                            variant="outline"
                        >
                            {calculating ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Calculating...
                                </>
                            ) : (
                                <>
                                    <Calculator className="h-4 w-4 mr-2" />
                                    Calculate Sample Commission
                                </>
                            )}
                        </Button>
                        
                        {calculationResult && (
                            <div className="p-4 bg-muted rounded-md">
                                <h4 className="font-medium mb-2">Calculation Result</h4>
                                <pre className="text-sm">
                                    {JSON.stringify(calculationResult, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Monthly Commission Processing */}
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Commission Processing</CardTitle>
                    <CardDescription>
                        Process monthly commission payouts for all coaches
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="month">Month</Label>
                                <Select
                                    value={monthlyCommissionData.month}
                                    onValueChange={(value) => 
                                        setMonthlyCommissionData(prev => ({ ...prev, month: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => {
                                            const month = i + 1;
                                            return (
                                                <SelectItem key={month} value={month.toString()}>
                                                    {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="year">Year</Label>
                                <Select
                                    value={monthlyCommissionData.year}
                                    onValueChange={(value) => 
                                        setMonthlyCommissionData(prev => ({ ...prev, year: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 5 }, (_, i) => {
                                            const year = new Date().getFullYear() - 2 + i;
                                            return (
                                                <SelectItem key={year} value={year.toString()}>
                                                    {year}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button 
                            onClick={processMonthlyCommissions} 
                            disabled={calculating || !monthlyCommissionData.month || !monthlyCommissionData.year}
                            className="w-full"
                        >
                            {calculating ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Process Monthly Commissions
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Current Settings Display */}
            {commissionSettings && (
                <Card>
                    <CardHeader>
                        <CardTitle>Current Settings</CardTitle>
                        <CardDescription>
                            Currently active commission configuration
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-muted rounded-md">
                                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                                <div className="text-2xl font-bold">
                                    {commissionSettings.commissionPercentage}%
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Commission Rate
                                </div>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-md">
                                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                <div className="text-2xl font-bold">
                                    ${commissionSettings.minimumSubscriptionAmount}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Minimum Amount
                                </div>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-md">
                                <Settings className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                                <div className="text-2xl font-bold">
                                    ${commissionSettings.maximumCommissionAmount}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Maximum Amount
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default CommissionManagementTab;
