
"use client";

import type * as React from 'react';
import { createContext, useContext }
from 'react';
// Removed Firebase imports: import { auth } from '@/lib/firebase';
// Removed Firebase imports: import type { User, AuthError } from 'firebase/auth';
// Removed Firebase imports: import { onAuthStateChanged, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import type { AuthFormValues } from '@/components/auth/AuthFormFields'; 
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: null; // Changed from User | null
  loading: boolean;
  error: null; // Changed from AuthError | null
  signUp: (values: AuthFormValues) => Promise<boolean>;
  logIn: (values: AuthFormValues) => Promise<boolean>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast(); // Keep toast for potential non-auth notifications if needed

  // Mocked auth state and functions since Firebase is removed
  const user = null;
  const loading = false;
  const error = null;

  const signUp = async (values: AuthFormValues): Promise<boolean> => {
    console.warn("Sign up functionality has been removed.");
    toast({ title: "Feature Removed", description: "Sign up is currently unavailable.", variant: "destructive" });
    return false;
  };

  const logIn = async (values: AuthFormValues): Promise<boolean> => {
    console.warn("Login functionality has been removed.");
    toast({ title: "Feature Removed", description: "Login is currently unavailable.", variant: "destructive" });
    return false;
  };

  const logOut = async () => {
    console.warn("Logout functionality has been removed.");
    toast({ title: "Feature Removed", description: "Logout is currently unavailable." });
  };
  
  const value = { user, loading, error, signUp, logIn, logOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This context provider is no longer fully functional as auth was removed.
    // Returning a default state or throwing a more specific error if useAuth is still called.
    // For now, to satisfy type-checking if something still calls useAuth:
    return {
        user: null,
        loading: false,
        error: null,
        signUp: async () => { console.warn("Sign up removed."); return false; },
        logIn: async () => { console.warn("Log in removed."); return false; },
        logOut: async () => { console.warn("Log out removed."); }
    };
  }
  return context;
};
