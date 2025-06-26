"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/shared/components/Navbar/Navbar';
import LoadingOverlay from '@/shared/components/LoadingOverlay/LoadingOverlay';
import useAuth from '@/features/auth/hooks/useAuth';
import { checkAdminStatus } from '@/features/admin/services/checkAdminStatus';
import { User } from '@/features/auth/types/user';
import { getUserProfile } from '@/features/auth/services/user/getUserProfile';
import AdminDashboard from '@/features/admin/components/AdminDashboard/AdminDashboard';
import './page.css';
import { Person, Email, CalendarToday, AdminPanelSettings } from '@mui/icons-material';

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, loading } = useAuth();
  const [profileData, setProfileData] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !authUser) {
      router.push(`/login?error=${encodeURIComponent('Debes iniciar sesión para acceder a tu perfil.')}`);
    }
  }, [authUser, loading, router]);

  // Fetch user data and admin status when auth user is available
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!authUser) return;
      
      setIsLoadingProfile(true);
      try {
        // Always fetch user profile data
        const userData = await getUserProfile();
        setProfileData(userData);

        // Check admin status
        try {
          const adminStatus = await checkAdminStatus();
          setIsAdmin(adminStatus);
        } catch (adminError) {
          console.error('Error checking admin status:', adminError);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('No se pudo cargar la información del perfil. Por favor, intenta de nuevo más tarde.');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, [authUser]);

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

  // Show loading during authentication and profile loading
  const isPageLoading = loading || isLoadingProfile;

  // If still loading or user not authenticated, show loading or nothing
  if (loading) {
    return (
      <div className="profile-page-container">
        <Navbar />
        <LoadingOverlay isVisible={true} />
      </div>
    );
  }

  // If not loading and no user, don't render anything (redirection will happen)
  if (!authUser) {
    return null;
  }

  return (
    <div className="profile-page-container">
      <Navbar />
      <LoadingOverlay isVisible={isLoadingProfile} />

      <div className="profile-content">
        <div className="profile-header">
          <h1>Mi Perfil</h1>
          <p>Gestiona tu información personal</p>
        </div>

        {error ? (
          <div className="error-container">
            <p>{error}</p>
          </div>
        ) : profileData ? (
          <div className="profile-card-container">
            <div className="profile-card">
              <div className="profile-card-header">
                <div className="profile-avatar">
                  {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <h2>{profileData.name || authUser.displayName || 'Usuario'}</h2>
              </div>
              
              <div className="profile-info-section">
                <div className="profile-info-item">
                  <Person className="profile-info-icon" />
                  <div className="profile-info-content">
                    <p className="profile-info-label">Nombre completo</p>
                    <p className="profile-info-value">{profileData.name || authUser.displayName || 'No disponible'}</p>
                  </div>
                </div>
                
                <div className="profile-info-item">
                  <Email className="profile-info-icon" />
                  <div className="profile-info-content">
                    <p className="profile-info-label">Correo electrónico</p>
                    <p className="profile-info-value">{profileData.email || authUser.email}</p>
                  </div>
                </div>
                
                <div className="profile-info-item">
                  <CalendarToday className="profile-info-icon" />
                  <div className="profile-info-content">
                    <p className="profile-info-label">Fecha de registro</p>
                    <p className="profile-info-value">
                      {profileData.createdAt ? formatDate(profileData.createdAt) : 'Fecha no disponible'}
                    </p>
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
                  <AdminDashboard />
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}