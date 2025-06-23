"use client";

import React, { useEffect } from 'react';
import './page.css';
import Navbar from '@/shared/components/Navbar/Navbar';
import LoadingOverlay from '@/shared/components/LoadingOverlay/LoadingOverlay';
import Link from 'next/link';
import ROUTES from '@/shared/routes';

export default function Home() {
  /**
   * Redirect to products page
   */
  const redirectToProducts = () => {
    window.location.href = ROUTES.PRODUCTS;
  }
  useEffect(() => {
    // Redirect to products page
    redirectToProducts();
  }, []);

  return (
    <div className="page-container">
      <LoadingOverlay isVisible={true} message="Cargando..." />
    </div>
  );
}