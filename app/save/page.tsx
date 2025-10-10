"use client";

import { PiggyBank } from "lucide-react";
import React from "react";

export default function SavePage() {
  return (
    <div className="space-y-4 px-2">
      <div className="text-lg flex items-center gap-2">
        <PiggyBank className="w-5 h-5 text-emerald-500" />
        <h1 className="text-lg font-semibold">Save</h1>
      </div>
      <p className="text-sm text-muted-foreground">Saving features coming soon.</p>
    </div>
  );
}
