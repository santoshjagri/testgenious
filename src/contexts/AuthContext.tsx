
"use client";

import React, { type ReactNode } from 'react';

// Authentication has been removed. This provider now simply renders its children
// without performing any authentication checks. This file is kept to avoid
// breaking the application structure but has no active functionality.

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export const useAuth = () => {
  // Return a mock auth state since authentication is disabled.
  return { user: null, loading: false };
};

    