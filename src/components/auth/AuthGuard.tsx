
"use client";

import type * as React from 'react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const Spinner = () => (
  <div className="flex flex-1 flex-col items-center justify-center p-10 bg-card rounded-lg shadow-md min-h-screen">
    <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="mt-4 text-lg text-primary font-medium">Loading application...</p>
    <p className="text-sm text-muted-foreground">Please wait a moment.</p>
  </div>
);


export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Store the intended path to redirect after login
      // Ensure we don't get into a redirect loop with login/signup pages themselves
      if (pathname !== '/login' && pathname !== '/signup') {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else {
         router.replace('/login');
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    // This will briefly show before redirect, or if redirect is slow.
    // A better experience might be to show the spinner until redirect completes.
    // However, the useEffect above should handle the redirect quickly.
    return <Spinner />; 
  }

  return <>{children}</>;
};
