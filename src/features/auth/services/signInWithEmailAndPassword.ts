/**
 * Sign in with email and password service.
 * Calls the auth repository to sign in with email and password using Firebase Authentication.
 */

import ROUTES from '@/shared/routes';
import AuthRepository from '../repositories/auth.repository';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { User } from '../types/user';
import { auth } from '@/lib/firebase';
import createFirebaseUser from '../utils/createFirebaseUser';
import { SignInData } from './signIn';

/**
 * Performs sign-in or registration with email and password.
 * @param data - The sign-in data containing email and password.
 * @returns {Promise<User | undefined>} Returns a promise that resolves to the user object.
 */
export default async function signInEmailAndPassword(data: SignInData): Promise<User | undefined> {
  try {
    // Clean the email to avoid issues with spaces or formatting
    const cleanEmail = data.email.trim().toLowerCase();
    
    // STEP 1: Check if we're trying to register (data.name is provided)
    if (data.name) {
      // This is a registration attempt since name is provided
      
      // Check if user already exists
      try {
        const methods = await fetchSignInMethodsForEmail(auth, cleanEmail);
        if (methods.length > 0) {
          // User already exists, can't register again
          throw new Error('Ya existe una cuenta con este correo. Por favor, inicia sesión.');
        }
        
        // Register new user with Firebase Auth
        const firebaseUser = await AuthRepository.registerWithEmailAndPassword(cleanEmail, data.password);
        
        // Create full user with all required fields
        const mappedUser: User = {
          id: firebaseUser.uid,
          name: data.name,
          email: firebaseUser.email || '',
          provider: 'email',
          createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
          updatedAt: new Date(),
        };
        
        // Store in Firestore
        await createFirebaseUser(mappedUser);
        
        // Log successful registration
        console.log(`User registered successfully: ${cleanEmail}`);
        
        return mappedUser;
      } catch (registerError: any) {
        console.error("Registration error:", registerError);
        
        if (registerError.code === 'auth/email-already-in-use') {
          throw new Error('Ya existe una cuenta con este correo. Por favor, inicia sesión.');
        }
        
        throw registerError;
      }
    } 
    // STEP 2: This is a sign-in attempt (no name provided)
    else {
      try {
        // Attempt sign in
        const firebaseUser = await AuthRepository.signInWithEmailAndPassword(cleanEmail, data.password);
        
        // Successfully signed in, return user
        const mappedUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          provider: 'email',
          createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
        };
        
        // Log successful sign-in
        console.log(`User signed in successfully: ${cleanEmail}`);
        
        return mappedUser;
      } catch (signInError: any) {
        console.error("Sign in error:", signInError);
        
        // If error is invalid credentials, it means user exists but password is wrong
        if (signInError.code === 'auth/invalid-credential' || 
            signInError.code === 'auth/wrong-password') {
          throw new Error('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
        }
        
        // If error is user-not-found, redirect to registration
        if (signInError.code === 'auth/user-not-found') {
          const redirectError = new Error('User registration required');
          (redirectError as any).redirectUrl = `${ROUTES.REGISTER}?email=${encodeURIComponent(cleanEmail)}&error=${encodeURIComponent('No existe una cuenta con este correo. Por favor, regístrate.')}`;
          throw redirectError;
        }
        
        // For other errors, rethrow
        throw signInError;
      }
    }
  } catch (error: any) {
    // If this is already our custom redirect error, rethrow it
    if (error.redirectUrl) {
      throw error;
    }
    
    // Otherwise rethrow the original error
    throw error;
  }
}