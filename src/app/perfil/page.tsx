"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/shared/components/Navbar/Navbar';
import LoadingOverlay from '@/shared/components/LoadingOverlay/LoadingOverlay';
import useAuth from '@/features/auth/hooks/useAuth';
import { checkAdminStatus } from '@/features/admin/services/checkAdminStatus';
import { User } from '@/features/auth/types/user';
import { getUserProfile } from '@/features/auth/services/user/getUserProfile';
import './page.css';
import { Person, Email, CalendarToday, AdminPanelSettings } from '@mui/icons-material';

export default function ProfilePage() {
  const router = useRouter();
  const { loggedIn, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      // Wait for auth to initialize
      if (authLoading) return;

      // If not logged in, redirect to login
      if (!loggedIn) {
        router.push('/login');
        return;
      }

      setLoading(true);
      try {
        // Get user profile data
        const userData = await getUserProfile();
        setUser(userData);

        // Check if user is admin
        if (userData?.email) {
          const adminStatus = await checkAdminStatus(userData.email);
          setIsAdmin(adminStatus);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('No se pudo cargar la información del perfil. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [loggedIn, authLoading, router]);

  // Format date for display
  const formatDate = (dateValue: any) => {
    try {
      let date: Date;
      
      // Handle Firebase timestamp format (has seconds and nanoseconds)
      if (typeof dateValue === 'object' && 'seconds' in dateValue) {
        // Firebase Timestamp format
        date = new Date(dateValue.seconds * 1000);
      } 
      // Handle string timestamps
      else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      }
      // Handle Date objects
      else if (dateValue instanceof Date) {
        date = dateValue;
      }
      // Handle numeric timestamps
      else if (typeof dateValue === 'number') {
        date = new Date(dateValue);
      }
      // Default fallback
      else {
        throw new Error('Invalid date format');
      }
      
      // Format the date in Spanish
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha no disponible';
    }
  };

  return (
    <div className="profile-page-container">
      <Navbar />
      <LoadingOverlay isVisible={loading} />

      <div className="profile-content">
        <div className="profile-header">
          <h1>Mi Perfil</h1>
          <p>Gestiona tu información personal</p>
        </div>

        {error ? (
          <div className="error-container">
            <p>{error}</p>
          </div>
        ) : user ? (
          <div className="profile-card-container">
            <div className="profile-card">
              <div className="profile-card-header">
                <div className="profile-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <h2>{user.name}</h2>
              </div>
              
              <div className="profile-info-section">
                <div className="profile-info-item">
                  <Person className="profile-info-icon" />
                  <div className="profile-info-content">
                    <p className="profile-info-label">Nombre completo</p>
                    <p className="profile-info-value">{user.name}</p>
                  </div>
                </div>
                
                <div className="profile-info-item">
                  <Email className="profile-info-icon" />
                  <div className="profile-info-content">
                    <p className="profile-info-label">Correo electrónico</p>
                    <p className="profile-info-value">{user.email}</p>
                  </div>
                </div>
                
                <div className="profile-info-item">
                  <CalendarToday className="profile-info-icon" />
                  <div className="profile-info-content">
                    <p className="profile-info-label">Fecha de registro</p>
                    <p className="profile-info-value">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="admin-section">
                <div className="admin-header">
                  <AdminPanelSettings className="admin-icon" />
                  <h3>Panel de Administrador</h3>
                </div>
                <div className="admin-content">
                  <p>Tienes acceso a funciones de administrador. Las opciones de administración estarán disponibles próximamente.</p>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}