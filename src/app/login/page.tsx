/**
 * Login page component
 */
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/shared/components/Navbar/Navbar';
import { 
  EmailOutlined, 
  LockOutlined, 
  Google, 
  Apple, 
  Facebook, 
  ArrowForwardIos 
} from '@mui/icons-material';
import './page.css';
import { useRouter } from 'next/navigation';
import signIn from '@/features/auth/services/signIn';
import ErrorTooltip from '@/shared/components/ErrorTooltip/ErrorTooltip';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Handle email/password login
   */
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    signIn({
      email,
      password,
      provider: 'email'
    }, setError)
      .then(() => {
        // handle redirection
        router.push('/productos');
      })
      .catch(err => {
        console.error('Error signing in with email:', err);
        setError('Error al iniciar sesión. Inténtalo de nuevo más tarde.');
      });

    setIsLoading(false);
  };

  /**
   * Handle other OAuth providers
   */
  const handleOAuthLogin = async (provider: string) => {
    setError(null);
    setIsLoading(true);

    await signIn({
      provider,
      email,
      password
    }, setError);
    // handle redirection
    router.push('/productos');

    setIsLoading(false);
  };

  useEffect(() => {
    if (error?.includes('500')) { // meaning that someone unregistered tries to login, redirect to register
      router.push('/register?error=Necesitas%20registrarte%20primero');
    }
  }, [error]);

  return (
    <div className="login-page-container">
      { error && 
        <ErrorTooltip message={error} isVisible={ error.length > 0 } />
      }

      <Navbar />
      
      <div className="login-section">
        <div className="login-container">
          <div className="login-header">
            <h1>Inicia Sesión</h1>
            <p>Accede a tu cuenta para obtener beneficios exclusivos</p>
          </div>

          <form className="login-form" onSubmit={handleEmailLogin}>
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
              />
            </div>
            
            <div className="form-footer">
              {/* not needed yet */}
              {/* <label className="remember-me">
                <input type="checkbox" />
                <span>Recordarme</span>
              </label> */}
              <Link href="/forgot-password" className="forgot-password">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            
            <button type="submit" className="login-button">
              Iniciar Sesión
              <ArrowForwardIos className="button-icon" />
            </button>
          </form>
          
          <div className="login-divider">
            <span>o continúa con</span>
          </div>
          
          <div className="oauth-buttons">
            <button 
              className="oauth-button google-button"
              onClick={() => handleOAuthLogin('google')}
            >
              <Google className="oauth-icon" />
              <span>Google</span>
            </button>
            
            {/* <button 
              className="oauth-button apple-button"
              onClick={() => handleOAuthLogin('apple')}
            >
              <Apple className="oauth-icon" />
              <span>Apple</span>
            </button>
            
            <button 
              className="oauth-button facebook-button"
              onClick={() => handleOAuthLogin('facebook')}
            >
              <Facebook className="oauth-icon" />
              <span>Facebook</span>
            </button> */}
          </div>
          
          <div className="signup-prompt">
            <p>¿No tienes una cuenta? <Link href="/register">Regístrate</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}