/**
 * Register page component
 */
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Handle email/password registration
   */
  const handleRegister = async (e: React.FormEvent) => {
    setError(null);
    setIsLoading(true);
    e.preventDefault();

    try {
      await signIn({
        email,
        password,
        provider: 'email'
      }, setError);

      // handle redirection
      router.push('/products');
    } catch (err) {
      console.error('Error registering with email:', err);
      setError('Error al crear la cuenta. Inténtalo de nuevo más tarde.');
    }

    setIsLoading(false);
  };

  /**
   * Handle other OAuth providers
   */
  const handleOAuthRegister = async (provider: string) => {
    setError(null);
    setIsLoading(true);

    try {
      await signIn({
        provider
      }, setError);

      // handle redirection
      router.push('/products');
    } catch (err) {
      console.error(`Error signing in with ${provider}:`, err);
      setError(`Error al iniciar sesión con ${provider}. Inténtalo de nuevo más tarde.`);
    }

    setIsLoading(false);
  };

  return (
    <div className="register-page-container">
      { error && 
        <ErrorTooltip message={error} isVisible={ error.length > 0 } />
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
              disabled={!acceptTerms}
            >
              Crear Cuenta
              <ArrowForwardIos className="button-icon" />
            </button>
          </form>
          
          <div className="register-divider">
            <span>o regístrate con</span>
          </div>
          
          <div className="oauth-buttons">
            <button 
              className="oauth-button google-button"
              onClick={() => handleOAuthRegister('google')}
            >
              <Google className="oauth-icon" />
              <span>Google</span>
            </button>
            
            <button 
              className="oauth-button apple-button"
              onClick={() => handleOAuthRegister('apple')}
            >
              <Apple className="oauth-icon" />
              <span>Apple</span>
            </button>
            
            <button 
              className="oauth-button facebook-button"
              onClick={() => handleOAuthRegister('facebook')}
            >
              <Facebook className="oauth-icon" />
              <span>Facebook</span>
            </button>
          </div>
          
          <div className="login-prompt">
            <p>¿Ya tienes una cuenta? <Link href="/login">Iniciar sesión</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}