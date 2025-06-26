"use client";

import { useAuth as useAuthFromContext } from '../context/AuthContext';

/**
 * Hook for accessing authentication state and methods
 */
export default function useAuth() {
  return useAuthFromContext();
}