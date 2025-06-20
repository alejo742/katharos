"use client";

import { useState, useEffect, useCallback } from 'react';
import isUserLoggedIn from '@/features/auth/utils/isUserLoggedIn';
import signOut from '@/features/auth/services/signOut';
import { useRouter } from 'next/navigation';

/**
 * Hook for managing authentication state across the application
 * Provides login status and authentication methods
 */
export default function useAuth() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null); // Initialize as null to indicate "unknown"
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check login status with minimum loading time
  const checkLoginStatus = useCallback(async () => {
    setLoading(true);
    
    try {
      // Start timing the operation
      const startTime = Date.now();
      
      // Get auth status
      const result = await isUserLoggedIn();
      
      // Calculate how long the operation took
      const elapsedTime = Date.now() - startTime;
      
      // Ensure loading state is shown for at least 500ms for better UX
      if (elapsedTime < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - elapsedTime));
      }
      
      setLoggedIn(result);
    } catch (error) {
      console.error('Error checking login status:', error);
      setLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial check on mount - only run once
  useEffect(() => {
    checkLoginStatus();
    
    // Set up an interval to periodically check auth status
    const intervalId = setInterval(() => {
      // Don't set loading to true for periodic checks to avoid UI flicker
      const silentCheck = async () => {
        try {
          const result = await isUserLoggedIn();
          // Only update if changed to prevent unnecessary re-renders
          if (result !== loggedIn) {
            setLoggedIn(result);
          }
        } catch (error) {
          console.error('Error in silent auth check:', error);
        }
      };
      
      silentCheck();
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(intervalId);
  }, [checkLoginStatus, loggedIn]);

  // Handle logout
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await signOut();
      setLoggedIn(false);
      router.push('/login');
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Force refresh the auth state
  const refreshAuthState = useCallback(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  return { 
    // If loggedIn is null (initial state), treat as not logged in but still loading
    loggedIn: loggedIn === null ? false : loggedIn, 
    loading: loading || loggedIn === null, 
    logout,
    refreshAuthState
  };
}