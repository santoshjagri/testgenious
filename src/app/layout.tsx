
import type {Metadata} from 'next';
import Link from 'next/link';
import { LayoutDashboard, PlusSquare, History as HistoryIcon, GraduationCap, ClipboardList } from 'lucide-react';
// Removed: import { AuthProvider } from '@/contexts/AuthContext';
// Removed: import { UserNav } from '@/components/auth/UserNav';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import './globals.css';

export const metadata: Metadata = {
  title: 'ExamGenius AI',
  description: 'Generate question papers effortlessly with ExamGenius AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        {/* Removed AuthProvider wrapper */}
        <SidebarProvider defaultOpen={true}>
          <Sidebar side="left" collapsible="icon" className="no-print">
            <SidebarHeader className="p-4 border-b border-sidebar-border">
              <Link href="/" className="flex items-center gap-3 text-lg font-semibold text-sidebar-primary hover:text-sidebar-primary/90 transition-colors">
                <LayoutDashboard className="h-7 w-7" />
                <span className="group-data-[collapsible=icon]:hidden">ExamGenius AI</span>
              </Link>
            </SidebarHeader>
            <SidebarContent className="p-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Create New Paper">
                    <Link href="/">
                      <PlusSquare />
                      <span className="group-data-[collapsible=icon]:hidden">Create New Paper</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Paper History">
                    <Link href="/history">
                      <HistoryIcon />
                      <span className="group-data-[collapsible=icon]:hidden">Paper History</span>
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
                  <SidebarMenuButton asChild tooltip="GS History">
                    <Link href="/gs-history">
                      <ClipboardList />
                      <span className="group-data-[collapsible=icon]:hidden">GS History</span>
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
              {/* Removed UserNav component */}
            </header>
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
            <Toaster />
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
