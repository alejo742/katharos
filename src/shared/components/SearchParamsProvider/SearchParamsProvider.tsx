"use client";

import React, { Suspense } from 'react';

// Loading fallback component
const SearchParamsLoading = () => {
  // Return an empty fragment
  // No need for a full screen loading as this should be very quick
  return <></>;
};

// Props type for our provider
interface SearchParamsProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A Suspense boundary wrapper for components that use useSearchParams()
 * Prevents the "missing-suspense-with-csr-bailout" error
 */
export function SearchParamsProvider({ 
  children, 
  fallback = <SearchParamsLoading /> 
}: SearchParamsProviderProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}