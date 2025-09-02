"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Activity } from "lucide-react"

export function ActivityView() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Activity</h3>
        </div>
        <div className="text-sm text-muted-foreground text-center py-8">No recent transactions</div>
      </CardContent>
    </Card>
  )
}
