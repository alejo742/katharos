/**
 * Error Tooltip Component
 * Reusable component for displaying error messages across pages
 */
"use client";

import React, { useEffect, useState } from 'react';
import { ErrorOutline, Close } from '@mui/icons-material';
import './ErrorTooltip.css';

interface ErrorTooltipProps {
  message: string;
  isVisible: boolean;
  onClose?: () => void;
  duration?: number; // Duration in milliseconds before auto-dismiss
  position?: 'top' | 'bottom'; // Position on the page
}

export default function ErrorTooltip({
  message,
  isVisible,
  onClose,
  duration = 5000, // Default 5 seconds
  position = 'top',
}: ErrorTooltipProps) {
  const [visible, setVisible] = useState(false);

  // Handle visibility changes from parent
  useEffect(() => {
    setVisible(isVisible);
    
    // Set timer to auto-dismiss if visible
    let timer: NodeJS.Timeout;
    if (isVisible && duration > 0) {
      timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
    }
    
    // Clear timeout on unmount or when visibility changes
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, duration, onClose]);

  // Handle manual close
  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  return (
    <div className={`error-tooltip ${position} ${visible ? 'visible' : ''}`}>
      <div className="error-tooltip-content">
        <ErrorOutline className="error-icon" />
        <p className="error-message">{message}</p>
        <button className="close-button" onClick={handleClose}>
          <Close className="close-icon" />
        </button>
      </div>
    </div>
  );
}