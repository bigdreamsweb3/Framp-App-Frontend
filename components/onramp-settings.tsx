"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { X, Zap, Shield, Percent } from "lucide-react"

interface OnrampSettingsProps {
  onClose: () => void
}

export function OnrampSettings({ onClose }: OnrampSettingsProps) {
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [autoSavePercentage, setAutoSavePercentage] = useState([2])
  const [fastMode, setFastMode] = useState(true)
  const [preferredBank, setPreferredBank] = useState("gtbank")

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">On-Ramp Settings</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto-Save Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                <Label htmlFor="auto-save" className="font-medium">
                  Auto-Save
                </Label>
              </div>
              <Switch id="auto-save" checked={autoSaveEnabled} onCheckedChange={setAutoSaveEnabled} />
            </div>
            {autoSaveEnabled && (
              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Percentage</span>
                  <span className="text-sm font-medium">{autoSavePercentage[0]}%</span>
                </div>
                <Slider
                  value={autoSavePercentage}
                  onValueChange={setAutoSavePercentage}
                  max={10}
                  min={1}
                  step={0.5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  {autoSavePercentage[0]}% of each purchase will be automatically saved
                </p>
              </div>
            )}
          </div>

          {/* Fast Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <div>
                <Label htmlFor="fast-mode" className="font-medium">
                  Fast Mode
                </Label>
                <p className="text-xs text-muted-foreground">Skip confirmations for faster transactions</p>
              </div>
            </div>
            <Switch id="fast-mode" checked={fastMode} onCheckedChange={setFastMode} />
          </div>

          {/* Preferred Bank */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <Label className="font-medium">Preferred Bank</Label>
            </div>
            <Select value={preferredBank} onValueChange={setPreferredBank}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select your preferred bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gtbank">GTBank</SelectItem>
                <SelectItem value="access">Access Bank</SelectItem>
                <SelectItem value="zenith">Zenith Bank</SelectItem>
                <SelectItem value="uba">UBA</SelectItem>
                <SelectItem value="firstbank">First Bank</SelectItem>
                <SelectItem value="fidelity">Fidelity Bank</SelectItem>
                <SelectItem value="sterling">Sterling Bank</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transaction Limits */}
          <div className="space-y-2">
            <Label className="font-medium">Daily Limit</Label>
            <div className="bg-muted/30 rounded-xl p-3 border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current limit</span>
                <span className="font-medium">₦500,000</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-muted-foreground">Used today</span>
                <span className="text-sm">₦0</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button className="w-full rounded-xl font-semibold" onClick={onClose}>
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
