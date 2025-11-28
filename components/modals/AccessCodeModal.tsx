// components/AccessCodeModal.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAuthToken } from '@dynamic-labs/sdk-react-core';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { KeyRound, Sparkles } from 'lucide-react'; // optional icons
import Image from 'next/image';
import useAppLogo from "@/asssets/image"


export default function AccessCodeModal() {
    const { showAccessCodeModal, setShowAccessCodeModal, refetchUser, logout } = useAuth();
    const [accessCode, setAccessCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://framp-backend.vercel.app";

    const accessToken = getAuthToken();


    const app_logo = useAppLogo()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessCode.trim()) return setSubmitError('Gate Key is required');

        setSubmitting(true);
        setSubmitError(null);

        try {
            const headers: Record<string, string> = {
                "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
                "Content-Type": "application/json",
            };
            if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

            const response = await fetch(`${API_BASE}/api/profile/access-code`, {
                method: "POST",
                headers,
                credentials: "include",
                body: JSON.stringify({ access_code: accessCode }),
            });

            if (response.ok) {
                await refetchUser();
                setAccessCode('');
                setShowAccessCodeModal(false);
            } else {
                const data = await response.json();
                setSubmitError(data.error || 'Invalid Gate Key');
            }
        } catch (error) {
            setSubmitError('Network error. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!showAccessCodeModal) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            {/* Optional animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20" />

            <Card className="relative z-10 w-full max-w-md overflow-hidden border border-border/20 bg-background backdrop-blur-2xl shadow-2xl">
                {/* Subtle header glow */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />

                <CardHeader className="flex flex-col items-center pb-2 pt-5">
                    {/* Logo + BETA */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <Image
                                src={app_logo}
                                alt="FRAMP"
                                width={80}
                                height={80}
                                className="rounded-xl drop-shadow-xl"
                                priority
                            />
                            <span className="absolute -top-1 -right-1 text-[0.55rem] font-bold px-1.5 py-0.5 bg-primary text-white rounded-sm rotate-12 shadow-lg">
                                BETA
                            </span>
                        </div>
                    </div>

                    <CardTitle className="text-3xl font-black tracking-tighter bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                        Enter Gate Key
                    </CardTitle>

                    <CardDescription className="text-base mt-3 text-muted-foreground/90 md:px-6 leading-relaxed">
                        Unlock the <span className="text-primary font-semibold">Solana Gateway</span> — your key to on-ramp, pay bills, and explore the ecosystem.
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <KeyRound className="h-5 w-5 text-primary/70" />
                            </div>
                            <Input
                                type="text"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                                placeholder="XXXX-XXXX-XX"
                                className="pl-12 h-9 text-lg font-mono tracking-wider bg-muted/50 border-border focus:bg-background focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none transition-all rounded-md"
                                disabled={submitting}
                                autoFocus
                                autoComplete="off"
                            />
                            {accessCode && (
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                    {/* <Sparkles className="h-5 w-5 text-primary animate-pulse" /> */}
                                </div>
                            )}
                        </div>

                        {submitError && (
                            <p className="text-red-400 text-sm text-center font-medium">{submitError}</p>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    logout?.();
                                    setShowAccessCodeModal(false);
                                }}
                                className=""
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                type="submit"
                                disabled={submitting || !accessCode.trim()}
                                className=""
                            >
                                {submitting ? 'Saving...' : 'Continue'}
                            </Button>
                        </div>
                    </form>

                    <p className="text-center text-xs text-muted-foreground/60 mt-8">
                        Don’t have a Gate Key yet?{' '}
                        <a href="https://t.me/Framp_HQ" target="_blank" rel="noopener" className="text-primary underline hover:no-underline">
                            Get early access →
                        </a>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}