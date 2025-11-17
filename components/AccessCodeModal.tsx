// components/AccessCodeModal.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAuthToken, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

export default function AccessCodeModal() {
    const {
        showAccessCodeModal,
        setShowAccessCodeModal,
        accessCodeError,
        refetchUser
    } = useAuth();

    const [accessCode, setAccessCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const { user, logout } = useAuth()
    const router = useRouter()

    const accessToken = getAuthToken();

    const API_BASE =
        process.env.NEXT_PUBLIC_API_URL || "https://framp-backend.vercel.app";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!accessCode.trim()) {
            setSubmitError('Please enter an access code');
            return;
        }

        setSubmitting(true);
        setSubmitError(null);

        try {
            const headers: Record<string, string> = {
                "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
                "Content-Type": "application/json", // Added Content-Type for POST
            };
            if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

            // Fixed: Using POST method and consistent variable name
            const response = await fetch(`${API_BASE}/api/profile/access-code`, {
                method: "POST", // Changed from GET to POST
                headers,
                credentials: "include",
                body: JSON.stringify({ accessCode }),
            });

            // Fixed: Using 'response' variable (was 'res' in declaration but 'response' in usage)
            if (response.ok) {
                // Refresh user data - this should now work since access code is set
                await refetchUser();
                setAccessCode('');
                setShowAccessCodeModal(false);
            } else {
                const data = await response.json();
                setSubmitError(data.error || 'Failed to save access code');
            }
        } catch (error) {
            console.error('Error submitting access code:', error);
            setSubmitError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        setShowAccessCodeModal(false);
        setAccessCode('');
        setSubmitError(null);
    }



    if (!showAccessCodeModal) return null;

    return (
        <div className="fixed inset-0 bg-background bg-opacity-50 flex items-center justify-center p-4 z-999">
            <Card className="max-w-md w-full">
                <CardHeader className="">
                    <CardTitle className="text-base flex items-center gap-2 px-0">
                        {/* <Wallet className="w-3 h-3" /> */}
                        Access Code Required
                    </CardTitle>
                    <CardDescription className="relative">
                        You need to add an access code to continue using the application.
                    </CardDescription>
                </CardHeader>

              
                <CardContent>
                    {accessCodeError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
                            {accessCodeError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Access Code
                            </label>
                            <Input
                                type="text"
                                id="accessCode"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Enter your access code"
                                disabled={submitting}
                                autoFocus
                            />
                        </div>

                        {submitError && (
                            <div className="text-red-600 dark:text-red-400 text-sm mb-4">{submitError}</div>
                        )}

                        <div className="flex items-center justify-end space-x-3">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    logout?.()
                                    handleBack()
                                }}
                                className="rounded-xl"
                            >
                                Log Out
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                type="submit"
                                disabled={submitting || !accessCode.trim()}
                                className=""
                            >
                                {submitting ? 'Saving...' : 'Save Access Code'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}