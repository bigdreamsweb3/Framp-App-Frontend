"use client";

import RootShell from "@/components/app_layout/root-shell";

export default function NotFound() {
  return (
    <RootShell>
      <div className="flex flex-col items-center py-20">
        <h1 className="text-4xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground mt-4">Try another link friend.</p>
      </div>
    </RootShell>
  );
}
