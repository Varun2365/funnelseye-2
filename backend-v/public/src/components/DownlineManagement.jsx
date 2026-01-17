import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Users, Settings, TrendingUp, FileText, AlertCircle } from 'lucide-react';

// Import sub-components
import AdminRequestsTab from './downline/AdminRequestsTab';
import HierarchyManagementTab from './downline/HierarchyManagementTab';
import CommissionManagementTab from './downline/CommissionManagementTab';
import PerformanceTrackingTab from './downline/PerformanceTrackingTab';

const DownlineManagement = () => {
    const [activeTab, setActiveTab] = useState('admin-requests');

    const tabs = [
        {
            id: 'admin-requests',
            label: 'Admin Requests',
            icon: AlertCircle,
            description: 'Manage pending admin requests'
        },
        {
            id: 'hierarchy',
            label: 'Hierarchy Management',
            icon: Users,
            description: 'Manage coach hierarchy and upline changes'
        },
        {
            id: 'commission',
            label: 'Commission Settings',
            icon: Settings,
            description: 'Configure commission rates and settings'
        },
        {
            id: 'performance',
            label: 'Performance Tracking',
            icon: TrendingUp,
            description: 'Monitor team performance and analytics'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Downline Management</h1>
                    <p className="text-muted-foreground">
                        Comprehensive MLM system administration and monitoring
                    </p>
                </div>
                <Badge variant="outline" className="text-sm">
                    Admin Only
                </Badge>
            </div>

            {/* Main Content */}
            <Card>
                <CardHeader>
                    <CardTitle>MLM System Administration</CardTitle>
                    <CardDescription>
                        Manage your multi-level marketing system, from hierarchy changes to commission tracking
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        {tab.label}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>

                        <TabsContent value="admin-requests" className="mt-6">
                            <AdminRequestsTab />
                        </TabsContent>

                        <TabsContent value="hierarchy" className="mt-6">
                            <HierarchyManagementTab />
                        </TabsContent>

                        <TabsContent value="commission" className="mt-6">
                            <CommissionManagementTab />
                        </TabsContent>

                        <TabsContent value="performance" className="mt-6">
                            <PerformanceTrackingTab />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default DownlineManagement;
