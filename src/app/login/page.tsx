/**
 * Login page component
 */
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/shared/components/Navbar/Navbar';
import { 
  EmailOutlined, 
  LockOutlined, 
  Google, 
  ArrowForwardIos 
} from '@mui/icons-material';
import './page.css';
import { useRouter } from 'next/navigation';
import signIn from '@/features/auth/services/signIn';
import ErrorTooltip from '@/shared/components/ErrorTooltip/ErrorTooltip';
import ROUTES from '@/shared/routes';
import useAuth from '@/features/auth/hooks/useAuth';
import LoadingOverlay from '@/shared/components/LoadingOverlay/LoadingOverlay';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  
  // Get URL parameters
  const urlError = searchParams.get('error');
  const urlEmail = searchParams.get('email');
  
  const [email, setEmail] = useState(urlEmail || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(urlError || null);

  // Redirect to profile if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push(ROUTES.PROFILE);
    }
  }, [loading, user, router]);

  // Check for URL parameters on component mount and when they change
  useEffect(() => {
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
    
    if (urlEmail) {
      setEmail(decodeURIComponent(urlEmail));
    }
  }, [urlError, urlEmail]);

  /**
   * Handle login for any provider
   */
  const handleLogin = async (e: React.FormEvent | React.MouseEvent, provider: string) => {
    if (e) {
      e.preventDefault(); // Prevent form submission for email login
    }
    
    setError(null);
    setIsLoading(true);

    try {
      // Prepare login data
      const loginData: any = {
        provider,
      };

      // Add email/password for email provider
      if (provider === 'email') {
        loginData.email = email;
        loginData.password = password;
      }

      const result = await signIn(loginData, setError);
      
      if (result.success) {
        // Successful login - Firebase will trigger auth state change
        // which will update context and redirect automatically
        router.push(ROUTES.PROFILE);
      } else if (result.redirectTo) {
        // Need to redirect elsewhere (like register page)
        router.push(result.redirectTo);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Error durante el inicio de sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {error && 
        <ErrorTooltip message={error} isVisible={error.length > 0} />
      }

      <Navbar />
      <LoadingOverlay isVisible={loading} />
      
      {(!loading && !user) && (
        <div className="login-section">
          <div className="login-container">
            <div className="login-header">
              <h1>Inicia Sesión</h1>
              <p>Accede a tu cuenta para obtener beneficios exclusivos</p>
            </div>

            <form className="login-form" onSubmit={(e) => handleLogin(e, 'email')}>
              <div className="form-group">
                <EmailOutlined className="input-icon" />
                <input 
                  type="email" 
                  placeholder="Correo electrónico" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <LockOutlined className="input-icon" />
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-footer">
                <Link href={ROUTES.FORGOT_PASSWORD} className="forgot-password">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              
              <button 
                type="submit" 
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? "Cargando..." : "Iniciar Sesión"}
                {!isLoading && <ArrowForwardIos className="button-icon" />}
              </button>
            </form>
            
            <div className="login-divider">
              <span>o continúa con</span>
            </div>
            
            <div className="oauth-buttons">
              <button 
                className="oauth-button google-button"
                onClick={(e) => handleLogin(e, 'google')}
                disabled={isLoading}
              >
                <Google className="oauth-icon" />
                <span>Google</span>
              </button>
            </div>
            
            <div className="signup-prompt">
              <p>¿No tienes una cuenta? <Link href={ROUTES.REGISTER}>Regístrate</Link></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}