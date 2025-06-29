
"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, User, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-4xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your application settings and preferences.
          </p>
        </header>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of the application. Change the theme to your preference.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="font-medium">Theme</span>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account
              </CardTitle>
              <CardDescription>
                This application operates without user accounts for maximum privacy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You do not need to create an account or log in to use ExamGenius AI. All of your generated papers, gradesheets, and ID cards are stored directly and securely on your own device in your browser's local storage, not on our servers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Data Privacy
              </CardTitle>
              <CardDescription>
                Your data is private and stored locally on your computer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Because this application runs entirely in your browser, your data's security is in your hands. The app itself has no server to be hacked or database to be breached. When you use AI features, only the non-personal data from the form fields (like subject and topic) is sent to Google's AI service to generate content.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
