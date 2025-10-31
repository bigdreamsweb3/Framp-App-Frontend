"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PopupLayoutProps {
    title?: string;
    subtitle?: string;
    isOpen: boolean;
    onClose?: () => void;
    children: ReactNode;
}

export function PopupLayout({
    title = "Popup Title",
    subtitle,
    isOpen,
    onClose,
    children,
}: PopupLayoutProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 min-h-screen md:min-h-fit grid items-center justify-center z-[999] overflow-scroll">
            {/* Overlay */}
            <div
                onClick={() => onClose?.()}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-0"
            />

            {/* Popup container */}
            <div className="bg-background h-[100vh] z-10">
                {/* Header */}
                <div className="sticky top-0 bg-background z-10 lg:static lg:border-none">
                    <div className="container max-w-7xl mx-auto px-4 py-4 lg:px-8 lg:py-8">
                        <div className="flex items-center justify-between">
                            {/* Title Section */}
                            <div className="flex flex-col">
                                {subtitle && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs lg:text-sm font-medium text-primary">
                                            {subtitle}
                                        </span>
                                    </div>
                                )}
                                <h2 className="text-xl lg:text-3xl font-semibold text-foreground">
                                    {title}
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content (children area) */}
                <div className="flex-1 container max-w-7xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
                    {children}
                </div>

                {/* Close Button */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onClose?.()}
                    className="fixed top-4 right-4 rounded-lg bg-background/80 backdrop-blur-sm border border-border text-foreground transition-colors z-20 hover:bg-muted"
                    title="Close"
                >
                    <X className="w-5 h-5 text-destructive" />
                </Button>
            </div>
        </div>
    );
}
