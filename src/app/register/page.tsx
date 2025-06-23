/**
 * Register page component
 */
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/shared/components/Navbar/Navbar';
import { 
  PersonOutlineOutlined,
  EmailOutlined, 
  LockOutlined, 
  Google, 
  Apple, 
  Facebook,
  ArrowForwardIos
} from '@mui/icons-material';
import signIn from '@/features/auth/services/signIn';
import ErrorTooltip from '@/shared/components/ErrorTooltip/ErrorTooltip';
import { useRouter } from 'next/navigation';
import './page.css';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
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
   * Handle email/password registration
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }
    
    // Validate name is provided
    if (!name.trim()) {
      setError('Por favor, ingresa tu nombre');
      setIsLoading(false);
      return;
    }

    try {
      await signIn({
        email,
        password,
        provider: 'email',
        name // Pass the name to the sign in function
      }, setError);

      // handle redirection
      router.push('/productos');
    } catch (err: any) {
      console.error('Error registering with email:', err);
      setError(err.message || 'Error al crear la cuenta. Inténtalo de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle other OAuth providers
   */
  const handleOAuthRegister = async (provider: string) => {
    setError(null);
    setIsLoading(true);

    try {
      await signIn({
        provider,
        email,    // pass other attrs.
        password  // 
      }, setError);

      // handle redirection
      router.push('/productos');
    } catch (err: any) {
      console.error(`Error signing in with ${provider}:`, err);
      setError(err.message || `Error al iniciar sesión con ${provider}. Inténtalo de nuevo más tarde.`);
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
      
      <div className="register-section">
        <div className="register-container">
          <div className="register-header">
            <h1>Crear Cuenta</h1>
            <p>Regístrate para obtener beneficios exclusivos</p>
          </div>

          <form className="register-form" onSubmit={handleRegister}>
            <div className="form-group">
              <PersonOutlineOutlined className="input-icon" />
              <input 
                type="text" 
                placeholder="Nombre completo" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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
              />
            </div>
            
            <label className="terms-checkbox">
              <input 
                type="checkbox" 
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                required
              />
              <span>
                Acepto los <Link href="/terms">Términos y Condiciones</Link> y la <Link href="/privacy">Política de Privacidad</Link>
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
              onClick={() => handleOAuthRegister('google')}
              disabled={isLoading}
            >
              <Google className="oauth-icon" />
              <span>Google</span>
            </button>
            
            {/* <button 
              className="oauth-button apple-button"
              onClick={() => handleOAuthRegister('apple')}
              disabled={isLoading}
            >
              <Apple className="oauth-icon" />
              <span>Apple</span>
            </button>
            
            <button 
              className="oauth-button facebook-button"
              onClick={() => handleOAuthRegister('facebook')}
              disabled={isLoading}
            >
              <Facebook className="oauth-icon" />
              <span>Facebook</span>
            </button> */}
          </div>
          
          <div className="login-prompt">
            <p>¿Ya tienes una cuenta? <Link href="/login">Iniciar sesión</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}