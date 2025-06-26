/**
 * Register page component
 */
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/shared/components/Navbar/Navbar';
import { 
  PersonOutlineOutlined,
  EmailOutlined, 
  LockOutlined, 
  Google,
  ArrowForwardIos
} from '@mui/icons-material';
import signIn from '@/features/auth/services/signIn';
import ErrorTooltip from '@/shared/components/ErrorTooltip/ErrorTooltip';
import { useRouter } from 'next/navigation';
import './page.css';
import ROUTES from '@/shared/routes';
import useAuth from '@/features/auth/hooks/useAuth';
import LoadingOverlay from '@/shared/components/LoadingOverlay/LoadingOverlay';

// Content component that uses searchParams
function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  
  // Get URL parameters
  const urlError = searchParams.get('error');
  const urlEmail = searchParams.get('email');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState(urlEmail || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
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
   * Validate the form data
   * @returns {boolean} True if valid, false otherwise
   */
  const validateForm = () => {
    // Only validate password fields for email registration
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    
    if (!name.trim()) {
      setError('Por favor, ingresa tu nombre');
      return false;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    return true;
  };

  /**
   * Handle registration for any provider
   */
  const handleRegister = async (e: React.FormEvent | React.MouseEvent, provider: string) => {
    if (e) {
      e.preventDefault(); // Prevent form submission for email registration
    }
    
    setError(null);
    setIsLoading(true);
    
    // For email provider, validate form first
    if (provider === 'email' && !validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      // Prepare registration data
      const registrationData: any = {
        provider,
      };
      
      // Add additional fields for email provider
      if (provider === 'email') {
        registrationData.name = name;
        registrationData.email = email;
        registrationData.password = password;
      }
      
      const result = await signIn(registrationData, setError);
      
      if (result.success) {
        // Successful registration
        router.push(ROUTES.PRODUCTS);
      } else if (result.redirectTo) {
        // Need to redirect elsewhere (like login page for existing users)
        router.push(result.redirectTo);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Error durante el registro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      {error && 
        <ErrorTooltip message={error} isVisible={error.length > 0} />
      }
      
      <Navbar />
      <LoadingOverlay isVisible={loading} />
      
      {(!loading && !user) && (
        <div className="register-section">
          <div className="register-container">
            <div className="register-header">
              <h1>Crear Cuenta</h1>
              <p>Regístrate para obtener beneficios exclusivos</p>
            </div>

            <form className="register-form" onSubmit={(e) => handleRegister(e, 'email')}>
              <div className="form-group">
                <PersonOutlineOutlined className="input-icon" />
                <input 
                  type="text" 
                  placeholder="Nombre" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
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
                  minLength={6}
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <LockOutlined className="input-icon" />
                <input 
                  type="password" 
                  placeholder="Confirmar contraseña" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>
              
              <label className="terms-checkbox">
                <input 
                  type="checkbox" 
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  required
                  disabled={isLoading}
                />
                <span>
                  Acepto los <Link href={ROUTES.TERMS}>Términos y Condiciones</Link> y la <Link href={ROUTES.PRIVACY_POLICY}>Política de Privacidad</Link>
                </span>
              </label>
              
              <button 
                type="submit" 
                className="register-button"
                disabled={!acceptTerms || isLoading}
              >
                {isLoading ? "Procesando..." : "Crear Cuenta"}
                {!isLoading && <ArrowForwardIos className="button-icon" />}
              </button>
            </form>
            
            <div className="register-divider">
              <span>o regístrate con</span>
            </div>
            
            <div className="oauth-buttons">
              <button 
                className="oauth-button google-button"
                onClick={(e) => handleRegister(e, 'google')}
                disabled={isLoading}
              >
                <Google className="oauth-icon" />
                <span>Google</span>
              </button>
            </div>
            
            <div className="login-prompt">
              <p>¿Ya tienes una cuenta? <Link href={ROUTES.LOGIN}>Iniciar sesión</Link></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple loading fallback
function RegisterPageLoading() {
  return (
    <div className="register-page-loading">
      <Navbar />
    </div>
  );
}

// Main component with Suspense boundary
export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterPageLoading />}>
      <RegisterContent />
    </Suspense>
  );
}