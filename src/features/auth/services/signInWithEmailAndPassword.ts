/**
 * Sign in with email and password service.
 * Calls the auth repository to sign in with email and password using Firebase Authentication.
 */

import AuthRepository from '../repositories/auth.repository';
import { User } from '../types/user';
import createFirebaseUser from '../utils/createFirebaseUser';
import { SignInData } from './signIn';

export default async function signInEmailAndPassword(data: SignInData): Promise<User> {
  try {
    try {
      // Try to sign in - only allow login for existing users
      const firebaseUser = await AuthRepository.signInWithEmailAndPassword(data.email, data.password);
      const mappedUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        provider: 'email',
        createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
        updatedAt: new Date(),
      };
      
      // store in firestore
      await createFirebaseUser(mappedUser);
      return mappedUser;
    } 
    catch (error: any) {
      console.log("Sign-in error code:", error.code); // Log the exact error code
      
      // Map Firebase error codes to user-friendly messages
      const errorMessages: {[key: string]: string} = {
        'auth/user-not-found': 'No existe una cuenta con este correo. Por favor, regístrate primero.',
        'auth/invalid-credential': 'Credenciales incorrectas. Verifica tu correo y contraseña.',
        'auth/wrong-password': 'Contraseña incorrecta. Por favor, inténtalo de nuevo.',
        'auth/invalid-email': 'El correo electrónico no es válido.',
        'auth/user-disabled': 'Esta cuenta ha sido desactivada.',
        'auth/too-many-requests': 'Demasiados intentos fallidos. Por favor, inténtalo más tarde.',
        'auth/network-request-failed': 'Error de conexión. Verifica tu conexión a internet.'
      };
      
      // Special case: For user-not-found, throw a specific error that the UI can use to redirect to registration
      if (error.code === 'auth/user-not-found') {
        const customError = new Error('500: Usuario no encontrado');
        customError.name = 'UserNotFoundError';
        throw customError;
      }
      
      throw new Error(errorMessages[error.code] || 'Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    }
  } catch (error) {
    console.error('Error in authentication process:', error);
    throw error; // Re-throw for UI handling
  }
}