/**
 * Sign in with email and password service.
 * Calls the auth repository to sign in with email and password using Firebase Authentication.
 */

import ROUTES from '@/shared/routes';
import AuthRepository from '../repositories/auth.repository';
import UserRepository from '../repositories/user.repository';
import { User } from '../types/user';
import createFirebaseUser from '../utils/createFirebaseUser';
import { SignInData } from './signIn';

/**
 * Performs sign-in or registration with email and password.
 * @param data - The sign-in data containing email and password and other important data.
 * @returns {Promise<User | undefined>} Returns a promise that resolves to the user object if successful, or undefined if an error occurs.
 */
export default async function signInEmailAndPassword(data: SignInData): Promise<User | undefined> {
  try {
    // check if user exists
    const existingUser = await UserRepository.userExistsByEmail(data.email);
    if (!existingUser) {
      // check if name is provided
      if (data.name) {
        // proceed with registration
        const firebaseUser = await AuthRepository.registerWithEmailAndPassword(data.email, data.password);

        // create full user
        const mappedUser: User = {
          id: firebaseUser.uid,
          name: data.name,
          email: firebaseUser.email || '',
          provider: 'email',
          createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
          updatedAt: new Date(),
        };
        // store in firestore
        await createFirebaseUser(mappedUser);

        return mappedUser;
      }
      else { 
        // Create a custom error with redirect information
        const redirectError = new Error('User registration required');
        (redirectError as any).redirectUrl = `${ROUTES.REGISTER}?error=${encodeURIComponent('Tienes que registrarte primero')}`;
        throw redirectError;
      }
    }
    else { // login existing user
      const firebaseUser = await AuthRepository.signInWithEmailAndPassword(data.email, data.password);
      // return basic user
      const mappedUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        provider: 'email',
        createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
      };
      return mappedUser;
    }
  } 
  catch (error: any) {
    
    // If this is already our custom redirect error, rethrow it
    if (error.redirectUrl) {
      throw error;
    }
    
    // For other errors, check if we need to create a redirect error
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      const redirectError = new Error('User not found');
      (redirectError as any).redirectUrl = `${ROUTES.REGISTER}?email=${encodeURIComponent(data.email)}&error=${encodeURIComponent('No existe una cuenta con este correo. Por favor, regístrate.')}`;
      throw redirectError;
    }
    
    // Otherwise just rethrow the original error
    throw error;
  }
}