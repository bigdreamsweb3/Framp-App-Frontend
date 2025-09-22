"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BillsView() {
  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Bills</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <div className="text-center py-8">
            <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Bills Payment Coming Soon!</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              We're working hard to bring you a seamless bills payment feature. Soon, you'll be able to pay utilities, subscriptions, and more directly from your wallet.
            </p>
            <Button
              variant="outline"
              className="rounded-xl bg-transparent"
              aria-label="Learn more about upcoming bills payment feature"
            >
              Stay Tuned
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-muted/20 rounded-xl border border-border/30">
        <h5 className="font-medium text-sm mb-2">What's Next?</h5>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Our upcoming bills payment feature will support secure, fast transactions for everyday expenses, integrated with your fiat and crypto wallets.
        </p>
      </div>
    </div>
  );
}