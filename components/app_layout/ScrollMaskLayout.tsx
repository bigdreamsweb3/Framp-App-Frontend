"use client";

import { ReactNode } from "react";

interface ScrollMaskLayoutProps {
  children: ReactNode;
  topMaskHeight?: number; // height in px to hide at the top
}

export default function ScrollMaskLayout({
  children,
  topMaskHeight = 56,
}: ScrollMaskLayoutProps) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Scrollable area */}
      <div
        className="overflow-y-auto w-full h-full"
        style={{ paddingTop: topMaskHeight }}
      >
        {children}
      </div>

      {/* Top mask overlay */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: topMaskHeight,
          background: "inherit", // match background
          pointerEvents: "none", // allows scrolling through
        }}
      />
    </div>
  );
}
