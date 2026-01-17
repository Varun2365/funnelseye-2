import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import axios from 'axios';

const DebugFinancial = () => {
    const [debugInfo, setDebugInfo] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        runDebugChecks();
    }, []);

    const runDebugChecks = async () => {
        const info = {
            axiosBaseURL: axios.defaults.baseURL,
            authHeader: axios.defaults.headers.common['Authorization'],
            localStorageToken: localStorage.getItem('adminToken'),
            timestamp: new Date().toISOString()
        };

        // Test auth endpoint
        try {
            console.log('🔍 [DEBUG] Testing auth endpoint...');
            const authResponse = await axios.get('/admin/auth/profile');
            info.authTest = {
                success: true,
                status: authResponse.status,
                data: authResponse.data
            };
        } catch (authError) {
            info.authTest = {
                success: false,
                status: authError.response?.status,
                message: authError.response?.data?.message || authError.message,
                error: authError.response?.data
            };
        }

        // Test financial endpoint
        try {
            console.log('🔍 [DEBUG] Testing financial endpoint...');
            const financialResponse = await axios.get('/admin/financial/credit-system');
            info.financialTest = {
                success: true,
                status: financialResponse.status,
                data: financialResponse.data
            };
        } catch (financialError) {
            info.financialTest = {
                success: false,
                status: financialError.response?.status,
                message: financialError.response?.data?.message || financialError.message,
                error: financialError.response?.data
            };
        }

        setDebugInfo(info);
        setLoading(false);
    };

    const testLogin = async () => {
        try {
            const response = await axios.post('/admin/auth/login', {
                email: 'admin@funnelseye.com',
                password: 'Admin@123'
            });
            
            if (response.data.success) {
                const { token, admin } = response.data.data;
                localStorage.setItem('adminToken', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                alert('Login successful! Token saved.');
                runDebugChecks(); // Re-run checks
            }
        } catch (error) {
            alert('Login failed: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading) {
        return <div>Running debug checks...</div>;
    }

    return (
        <div className="space-y-4 p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Financial Dashboard Debug Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold">Configuration:</h3>
                        <pre className="bg-gray-100 p-2 rounded text-sm">
                            {JSON.stringify({
                                axiosBaseURL: debugInfo.axiosBaseURL,
                                hasAuthHeader: !!debugInfo.authHeader,
                                hasToken: !!debugInfo.localStorageToken,
                                timestamp: debugInfo.timestamp
                            }, null, 2)}
                        </pre>
                    </div>

                    <div>
                        <h3 className="font-semibold">Auth Test:</h3>
                        <pre className="bg-gray-100 p-2 rounded text-sm">
                            {JSON.stringify(debugInfo.authTest, null, 2)}
                        </pre>
                    </div>

                    <div>
                        <h3 className="font-semibold">Financial API Test:</h3>
                        <pre className="bg-gray-100 p-2 rounded text-sm">
                            {JSON.stringify(debugInfo.financialTest, null, 2)}
                        </pre>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={testLogin}>
                            Test Login
                        </Button>
                        <Button onClick={runDebugChecks} variant="outline">
                            Re-run Tests
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DebugFinancial;
