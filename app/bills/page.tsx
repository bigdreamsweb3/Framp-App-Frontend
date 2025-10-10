"use client";

import { BillsView } from "@/components/views/bills-view";
import { QrCode } from "lucide-react";
import React from "react";

export default function BillsPage() {
  return (
    <div className="space-y-4">
      <div className="px-2">
        <div className="text-lg flex items-center gap-2">
          <QrCode className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold">Pay Bills</h1>
        </div>
        <p className="text-sm text-muted-foreground">Bills payment features coming soon.</p>
      </div>

      <BillsView />
    </div>
  );
}
