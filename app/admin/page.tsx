// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Shield, Users, Key, Check } from "lucide-react";
import { getAuthToken } from "@dynamic-labs/sdk-react-core";

export default function AdminPage() {
  const { user, authToken } = useAuth();
  const [count, setCount] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Safely extract user role from the user object
  useEffect(() => {
    if (user) {
      console.log("User object in admin page:", user);

      // Try different possible locations for the role
      const role =
        user.role ||
        user.profile?.role ||
        (user as any).user?.role;

      setUserRole(role || null);
    }
  }, [user]);

  // Check if user has admin or team-access role
  const isAuthorized = userRole === "admin" || userRole === "team-access";

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "https://framp-backend.vercel.app";

  const accessToken = getAuthToken();

  const generateAccessCodes = async () => {
    if (count < 1 || count > 100) {
      setError("Count must be between 1 and 100");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      // Use authToken from context or getAuthToken()
      const token = authToken || accessToken;
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      console.log("Sending request to generate codes...", { count, headers });

      const response = await fetch(`${API_BASE}/api/admin/generate-access-code`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ count }),
      });

      console.log("Response status:", response.status);

      // Check if response has content before trying to parse JSON
      const responseText = await response.text();
      console.log("Response text:", responseText);

      if (!response.ok) {
        // Try to parse error message, but handle empty responses
        let errorMessage = "Failed to generate access codes";
        if (responseText) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = responseText || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }

      // Parse response only if there's content
      if (!responseText) {
        throw new Error("Empty response from server");
      }

      const data = JSON.parse(responseText);
      console.log("Generated codes:", data);
      
      if (data.codes && Array.isArray(data.codes)) {
        setGeneratedCodes(data.codes);
      } else {
        throw new Error("Invalid response format: codes array not found");
      }
    } catch (err: any) {
      console.error("Error generating codes:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000); // Reset after 2 seconds
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const downloadCodes = () => {
    const content = generatedCodes.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `access-codes-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // If not authorized, show access denied
  if (!isAuthorized) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription className="text-red-600 dark:text-red-400">
              You do not have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 dark:text-red-400">
              This page is only accessible to users with admin or team-access roles.
            </p>
            {userRole && (
              <p className="text-red-600 dark:text-red-400 mt-2">
                Your current role: {userRole}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Key className="h-8 w-8" />
          Access Code Management
        </h1>
        <p className="text-muted-foreground">
          Generate and manage access codes for user registration
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={userRole === "admin" ? "default" : "secondary"}>
            {userRole}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Logged in as: {user?.email}
          </span>
        </div>
      </div>

      {/* Generate Codes Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Generate Access Codes
          </CardTitle>
          <CardDescription>
            Create new access codes that users can use to register on the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="count">Number of codes to generate</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              placeholder="Enter number of codes"
            />
            <p className="text-sm text-muted-foreground">
              You can generate between 1 and 100 codes at a time
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}

          <Button
            onClick={generateAccessCodes}
            disabled={generating}
            className="w-full sm:w-auto"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Key className="h-4 w-4 mr-2" />
                Generate Access Codes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Codes Section */}
      {generatedCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Generated Access Codes ({generatedCodes.length})
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadCodes}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download All
              </Button>
            </CardTitle>
            <CardDescription>
              These codes can be shared with users for platform access. Click the copy button to copy individual codes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {generatedCodes.map((code, index) => (
                <div
                  key={code}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Badge variant="outline" className="font-mono shrink-0">
                      {index + 1}
                    </Badge>
                    <code className="font-mono text-sm bg-background px-3 py-2 rounded border flex-1 text-center">
                      {code}
                    </code>
                  </div>
                  <Button
                    variant={copiedCode === code ? "default" : "outline"}
                    size="sm"
                    onClick={() => copyToClipboard(code)}
                    className="flex items-center gap-1 shrink-0 ml-2"
                  >
                    {copiedCode === code ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-950/20 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                <Key className="h-4 w-4" />
                Usage Instructions
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>• <strong>Share codes securely</strong> with users who need platform access</li>
                <li>• <strong>Each code is single-use</strong> - can only be used by one user during registration</li>
                <li>• <strong>Automatic validation</strong> - codes are validated when users sign up</li>
                <li>• <strong>Keep codes secure</strong> - distribute them carefully to authorized users only</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Your Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{userRole}</div>
            <p className="text-xs text-muted-foreground">Current access level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Generated Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generatedCodes.length}</div>
            <p className="text-xs text-muted-foreground">Codes in this session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Key className="h-4 w-4" />
              Max Batch Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100</div>
            <p className="text-xs text-muted-foreground">Codes per generation</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}