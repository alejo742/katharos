import AuthRepository from '../repositories/auth.repository';

/**
 * Request password reset email
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean, message: string }> {
  try {
    await AuthRepository.sendPasswordResetEmail(email);
    return {
      success: true,
      message: 'Se ha enviado un correo con instrucciones para restablecer tu contraseña'
    };
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    
    // Handle specific Firebase error codes
    if (error.code === 'auth/user-not-found') {
      // Don't reveal if email exists for security reasons
      return {
        success: true,
        message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña'
      };
    }
    
    return {
      success: false,
      message: 'Error al enviar el correo. Por favor, inténtalo de nuevo más tarde.'
    };
  }
}

/**
 * Complete password reset with code and new password
 */
export async function completePasswordReset(code: string, newPassword: string): Promise<{ success: boolean, message: string }> {
  try {
    // Verify the code first
    await AuthRepository.verifyPasswordResetCode(code);
    
    // If valid, complete the reset
    await AuthRepository.confirmPasswordReset(code, newPassword);
    
    return {
      success: true,
      message: 'Tu contraseña ha sido restablecida correctamente'
    };
  } catch (error: any) {
    console.error('Error resetting password:', error);
    
    // Handle specific error codes
    if (error.code === 'auth/expired-action-code') {
      return {
        success: false,
        message: 'El enlace ha expirado. Por favor, solicita un nuevo enlace de restablecimiento.'
      };
    } else if (error.code === 'auth/invalid-action-code') {
      return {
        success: false,
        message: 'El enlace es inválido. Por favor, solicita un nuevo enlace de restablecimiento.'
      };
    } else if (error.code === 'auth/weak-password') {
      return {
        success: false,
        message: 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.'
      };
    }
    
    return {
      success: false,
      message: 'Error al restablecer la contraseña. El enlace puede haber expirado.'
    };
  }
}