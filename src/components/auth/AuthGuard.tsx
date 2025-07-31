
"use client";

import type * as React from 'react';

// This component is no longer used now that authentication features have been removed.
// It is kept in the project to avoid breaking potential import paths, but its functionality is disabled.
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

    