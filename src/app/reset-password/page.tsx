"use client";

import React, { useState, useEffect } from 'react';
import { LockOutlined, ArrowForwardIos } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/shared/components/Navbar/Navbar';
import { completePasswordReset } from '@/features/auth/services/passwordReset';
import ErrorTooltip from '@/shared/components/ErrorTooltip/ErrorTooltip';
import ROUTES from '@/shared/routes';
import './page.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check for code in multiple possible parameters
  // Firebase might use 'oobCode' or 'code' as the parameter name
  const oobCode = searchParams.get('oobCode') || 
                  searchParams.get('code') || 
                  searchParams.get('apiKey');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if oobCode is present
  useEffect(() => {
    if (!oobCode) {
      setError('Enlace de restablecimiento de contraseña inválido o expirado. Solicita un nuevo enlace.');
    }
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!oobCode) {
      setError('Enlace de restablecimiento de contraseña inválido o expirado.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const result = await completePasswordReset(oobCode, password);
      if (result.success) {
        setSuccess(result.message);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push(ROUTES.LOGIN);
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError('Error al restablecer la contraseña. Por favor, solicita un nuevo enlace.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-page-container">
      {error && <ErrorTooltip message={error} isVisible={!!error} />}

      <Navbar />
      
      <div className="reset-password-section">
        <div className="reset-password-container">
          <div className="reset-password-header">
            <h1>Establecer Nueva Contraseña</h1>
            <p>Crea una nueva contraseña segura para tu cuenta</p>
          </div>

          {success ? (
            <div className="success-message">
              <p>{success}</p>
              <p>Serás redirigido a la página de inicio de sesión en unos segundos...</p>
              <Link href={ROUTES.LOGIN} className="back-to-login">
                Ir a Iniciar Sesión
              </Link>
            </div>
          ) : (
            <form className="reset-password-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <LockOutlined className="input-icon" />
                <input 
                  type="password" 
                  placeholder="Nueva contraseña" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading || !oobCode}
                />
              </div>
              
              <div className="form-group">
                <LockOutlined className="input-icon" />
                <input 
                  type="password" 
                  placeholder="Confirmar nueva contraseña" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading || !oobCode}
                />
              </div>
              
              <button 
                type="submit" 
                className="reset-password-button"
                disabled={isLoading || !oobCode}
              >
                {isLoading ? "Procesando..." : "Guardar Nueva Contraseña"}
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