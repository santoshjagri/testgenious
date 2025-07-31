
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is no longer in use and will redirect to the dashboard.
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return null; // Render nothing while redirecting
}

    