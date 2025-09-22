"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs1";
import { Eye, EyeOff, ArrowLeft, Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { app_logo } from "@/asssets/image";
import { App_Name } from "@/app/appConfig";

interface AuthPageProps {
  onBack: () => void;
}

export function AuthPage({ onBack }: AuthPageProps) {
  const { login, signup } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onBack();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Success Toast */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-primary/90 text-primary-foreground text-sm px-4 py-2 rounded-xl shadow-lg"
              role="alert"
              aria-live="polite"
            >
              {mode === "login" ? "Logged in successfully!" : "Account created successfully!"}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2 text-foreground bg-primary/10 hover:bg-primary/20 rounded-xl"
          aria-label="Back to app"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {App_Name}
        </Button>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-2"
        >
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-primary/30 to-primary/10 blur-md opacity-50" />
            <Image
              src={app_logo}
              alt={`${App_Name} Logo`}
              className="relative w-full h-full object-contain rounded-xl"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{App_Name}</h1>
          <p className="text-xs text-muted-foreground">Your gateway to crypto on-ramping</p>
        </motion.div>

        {/* Auth Tabs */}
        <Tabs
          defaultValue="login"
          onValueChange={(val) => setMode(val as "login" | "signup")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-muted/30 rounded-xl p-1">
            <TabsTrigger
              value="login"
              className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              aria-label="Switch to login"
            >
              Log In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              aria-label="Switch to sign up"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          {/* Login */}
          <TabsContent value="login" className="space-y-4 mt-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Log in to your account</CardTitle>
                <CardDescription>
                  Connect with your wallet or use your email to access {App_Name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full rounded-xl font-semibold flex items-center gap-2"
                  disabled
                  aria-label="Wallet connect unavailable"
                >
                  <Wallet className="h-4 w-4" />
                  Wallet connect unavailable
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card/50 px-2 text-muted-foreground">or continue with email</span>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-xl bg-muted/30 border-border/50"
                      aria-label="Email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="rounded-xl bg-muted/30 border-border/50 pr-10"
                        aria-label="Password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-xl" role="alert">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-semibold"
                    disabled={isLoading}
                    aria-label="Log in with email"
                  >
                    {isLoading ? "Logging in..." : "Log In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signup */}
          <TabsContent value="signup" className="space-y-4 mt-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Create your account</CardTitle>
                <CardDescription>
                  Join {App_Name} with your wallet or email to start your crypto journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full rounded-xl font-semibold flex items-center gap-2"
                  disabled
                  aria-label="Wallet connect unavailable"
                >
                  <Wallet className="h-4 w-4" />
                  Wallet connect unavailable
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card/50 px-2 text-muted-foreground">or continue with email</span>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="text-xs font-medium">
                      Email
                    </Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-xl bg-muted/30 border-border/50"
                      aria-label="Email address for sign up"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="text-xs font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signupPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="rounded-xl bg-muted/30 border-border/50 pr-10"
                        aria-label="Password for sign up"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-xl" role="alert">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-semibold"
                    disabled={isLoading}
                    aria-label="Create account with email"
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Terms */}
        <p className="text-xs text-muted-foreground text-center">
          By continuing, you agree to {App_Name}'s{" "}
          <a href="/terms" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </p>

        {/* Security Notice */}
        <div className="p-4 bg-muted/20 rounded-xl border border-border/30 text-center">
          <p className="text-xs text-muted-foreground">
            Your credentials and wallet connections are encrypted and secure.
          </p>
        </div>
      </div>
    </div>
  );
}