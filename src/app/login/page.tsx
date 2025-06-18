/**
 * Login page component
 */
"use client";

import React, { useState } from 'react';
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /**
   * Handle email/password login
   */
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Login logic will go here
    console.log('Login with:', email, password);
  };

  /**
   * Handle Google sign in
   */
  const handleGoogleLogin = () => {
    // Google auth logic will go here
    console.log('Login with Google');
  };

  /**
   * Handle other OAuth providers
   */
  const handleOAuthLogin = (provider: string) => {
    // Other OAuth logic will go here
    console.log(`Login with ${provider}`);
  };

  return (
    <div className="login-page-container">
      <Navbar />
      
      <div className="login-section">
        <div className="login-container">
          <div className="login-header">
            <h1>Inicia Sesión</h1>
            <p>Accede a tu cuenta para ver tus pedidos y favoritos</p>
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
              <label className="remember-me">
                <input type="checkbox" />
                <span>Recordarme</span>
              </label>
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
              onClick={handleGoogleLogin}
            >
              <Google className="oauth-icon" />
              <span>Google</span>
            </button>
            
            <button 
              className="oauth-button apple-button"
              onClick={() => handleOAuthLogin('Apple')}
            >
              <Apple className="oauth-icon" />
              <span>Apple</span>
            </button>
            
            <button 
              className="oauth-button facebook-button"
              onClick={() => handleOAuthLogin('Facebook')}
            >
              <Facebook className="oauth-icon" />
              <span>Facebook</span>
            </button>
          </div>
          
          <div className="signup-prompt">
            <p>¿No tienes una cuenta? <Link href="/register">Regístrate</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}