"use client";

import React, { useState } from 'react';
import { EmailOutlined, ArrowForwardIos } from '@mui/icons-material';
import Link from 'next/link';
import Navbar from '@/shared/components/Navbar/Navbar';
import { requestPasswordReset } from '@/features/auth/services/passwordReset';
import ErrorTooltip from '@/shared/components/ErrorTooltip/ErrorTooltip';
import ROUTES from '@/shared/routes';
import './page.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const result = await requestPasswordReset(email);
      if (result.success) {
        setSuccess(result.message);
        setEmail(''); // Clear the form
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError('Error al enviar el correo. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page-container">
      {error && <ErrorTooltip message={error} isVisible={!!error} />}

      <Navbar />
      
      <div className="forgot-password-section">
        <div className="forgot-password-container">
          <div className="forgot-password-header">
            <h1>Recuperar Contraseña</h1>
            <p>Ingresa tu correo electrónico para recibir instrucciones</p>
          </div>

          {success ? (
            <div className="success-message">
              <p>{success}</p>
              <p>Revisa tu bandeja de entrada <strong>(y spam)</strong> y sigue las instrucciones en el correo.</p>
              <Link href={ROUTES.LOGIN} className="back-to-login">
                Volver a Iniciar Sesión
              </Link>
            </div>
          ) : (
            <form className="forgot-password-form" onSubmit={handleSubmit}>
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
              
              <button 
                type="submit" 
                className="forgot-password-button"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar Instrucciones"}
                {!isLoading && <ArrowForwardIos className="button-icon" />}
              </button>
            </form>
          )}
          
          <div className="login-prompt">
            <p>¿Recordaste tu contraseña? <Link href={ROUTES.LOGIN}>Iniciar sesión</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}