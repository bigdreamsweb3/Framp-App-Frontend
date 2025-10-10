"use client";

import { BillsView } from "@/components/views/bills-view";
import React from "react";

export default function BillsPage() {
  return (
    <div className="space-y-4">

      <div className="px-2">
        <h1 className="text-lg font-semibold">Pay Bills</h1>
        <p className="text-sm text-muted-foreground">Bills payment features coming soon.</p>
      </div>

      <BillsView />
    </div>
  );
}
