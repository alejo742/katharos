/**
 * Loading Overlay Component
 * Displays a loading spinner with text on a light overlay
 * Includes fade-in and fade-out animations
 */
import React, { useState, useEffect } from 'react';
import './LoadingOverlay.css';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export default function LoadingOverlay({ 
  isVisible, 
  message = "Cargando..." 
}: LoadingOverlayProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsAnimatingOut(false);
    } else {
      // Start fade out animation
      setIsAnimatingOut(true);
      // Remove component after animation completes
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Same duration as our CSS animation
      
      return () => clearTimeout(timer);
    }
  }, [isVisible]);
  
  if (!shouldRender) return null;
  
  return (
    <div className={`loading-overlay ${isAnimatingOut ? 'fade-out' : ''}`}>
      <div className="loading-tooltip">
        <div className="loader"></div>
        <span className="loading-message">{message}</span>
      </div>
    </div>
  );
}