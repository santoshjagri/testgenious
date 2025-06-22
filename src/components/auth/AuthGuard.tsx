"use client";

import type * as React from 'react';

// Authentication has been removed. This guard now acts as a pass-through component.
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
