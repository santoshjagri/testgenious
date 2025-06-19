
"use client";

import type * as React from 'react';
import { useState, useEffect, useContext, createContext } from 'react';
import { auth } from '@/lib/firebase';
import type { User, AuthError } from 'firebase/auth';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import type { AuthFormValues } from '@/components/auth/AuthFormFields'; 
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  signUp: (values: AuthFormValues) => Promise<boolean>;
  logIn: (values: AuthFormValues) => Promise<boolean>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setError(null);
    }, (authError) => {
      console.error("Auth state change error:", authError);
      setUser(null);
      setError(authError);
      setLoading(false);
      toast({
        title: "Authentication Error",
        description: authError.message || "Could not verify your session.",
        variant: "destructive",
      });
    });

    return () => unsubscribe();
  }, [toast]);

  const signUp = async (values: AuthFormValues): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: "Sign Up Successful", description: "Welcome! You are now logged in." });
      setLoading(false);
      return true;
    } catch (e) {
      const authError = e as AuthError;
      console.error("Sign up error:", authError);
      setError(authError);
      toast({ title: "Sign Up Failed", description: authError.message || "Could not create account.", variant: "destructive" });
      setLoading(false);
      return false;
    }
  };

  const logIn = async (values: AuthFormValues): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: "Login Successful", description: "Welcome back!" });
      setLoading(false);
      return true;
    } catch (e) {
      const authError = e as AuthError;
      console.error("Login error:", authError);
      setError(authError);
      toast({ title: "Login Failed", description: authError.message || "Invalid credentials.", variant: "destructive" });
      setLoading(false);
      return false;
    }
  };

  const logOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (e) {
      const authError = e as AuthError;
      console.error("Logout error:", authError);
      setError(authError);
      toast({ title: "Logout Failed", description: authError.message || "Could not log out.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  
  const value = { user, loading, error, signUp, logIn, logOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
