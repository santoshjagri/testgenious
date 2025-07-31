
"use client";

import * as React from 'react';
import type {Metadata} from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { Lightbulb, PlusSquare, History as HistoryIcon, GraduationCap, ClipboardList, Settings, UserSquare2, ClipboardSignature } from 'lucide-react';
// Removed: import { AuthProvider } from '@/contexts/AuthContext';
// Removed: import { UserNav } from '@/components/auth/UserNav';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from '@/components/theme-toggle';
import { SplashScreen } from '@/components/system/SplashScreen';
import './globals.css';
import Image from 'next/image';

// export const metadata: Metadata = {
//   title: 'EduGenius AI',
//   description: 'An AI-powered suite for educators to create papers, ID cards, and gradesheets.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading time and then hide the splash screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Splash screen will be visible for 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>EduGenius AI</title>
        <meta name="description" content="An AI-powered suite for educators to create papers, ID cards, and gradesheets." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="font-body antialiased bg-background">
        {isLoading && <SplashScreen />}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider defaultOpen={true}>
            <Sidebar side="left" collapsible="icon" className="no-print">
              <SidebarHeader className="p-4 border-b border-sidebar-border">
                <Link href="/" className="flex items-center gap-3 text-lg font-semibold text-sidebar-primary hover:text-sidebar-primary/90 transition-colors">
                  <Lightbulb />
                  <span className="group-data-[collapsible=icon]:hidden">EduGenius AI</span>
                </Link>
              </SidebarHeader>
              <SidebarContent className="p-2">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Create New Paper">
                      <Link href="/create-paper">
                        <PlusSquare />
                        <span className="group-data-[collapsible=icon]:hidden">Create New Paper</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="ID Card Studio">
                      <Link href="/id-card">
                        <UserSquare2 />
                        <span className="group-data-[collapsible=icon]:hidden">ID Card Studio</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Gradesheet">
                      <Link href="/gradesheet">
                        <GraduationCap />
                        <span className="group-data-[collapsible=icon]:hidden">Gradesheet</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Settings">
                      <Link href="/settings">
                        <Settings />
                        <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>
            <SidebarInset>
              <header className="sticky top-0 z-30 flex h-[57px] items-center justify-between gap-4 border-b bg-background px-4 sm:px-6 no-print">
                <div className="flex items-center">
                  <SidebarTrigger />
                  {/* Future: Page title could go here */}
                </div>
                <ThemeToggle />
              </header>
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
              <footer className="py-4 px-4 text-center text-xs text-muted-foreground no-print">
                <div className="flex justify-center items-center gap-4 mb-2">
                    <Link href="/terms-of-service" className="hover:text-primary hover:underline">Terms of Service</Link>
                    <Separator orientation="vertical" className="h-4" />
                    <Link href="/privacy-policy" className="hover:text-primary hover:underline">Privacy Policy</Link>
                </div>
                Generated by EduGenius AI &copy; 2025
              </footer>
              <Toaster />
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
