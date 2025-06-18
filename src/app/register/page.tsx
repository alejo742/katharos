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
import './page.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  /**
   * Handle email/password registration
   */
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Registration logic will go here
    console.log('Register with:', name, email, password, confirmPassword);
  };

  /**
   * Handle Google sign up
   */
  const handleGoogleRegister = () => {
    // Google auth logic will go here
    console.log('Register with Google');
  };

  /**
   * Handle other OAuth providers
   */
  const handleOAuthRegister = (provider: string) => {
    // Other OAuth logic will go here
    console.log(`Register with ${provider}`);
  };

  return (
    <div className="register-page-container">
      <Navbar />
      
      <div className="register-section">
        <div className="register-container">
          <div className="register-header">
            <h1>Crear Cuenta</h1>
            <p>Regístrate para acceder a ofertas exclusivas</p>
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
              onClick={handleGoogleRegister}
            >
              <Google className="oauth-icon" />
              <span>Google</span>
            </button>
            
            <button 
              className="oauth-button apple-button"
              onClick={() => handleOAuthRegister('Apple')}
            >
              <Apple className="oauth-icon" />
              <span>Apple</span>
            </button>
            
            <button 
              className="oauth-button facebook-button"
              onClick={() => handleOAuthRegister('Facebook')}
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