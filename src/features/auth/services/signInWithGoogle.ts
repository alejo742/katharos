/**
 * Sign in with Google service
 * Calls the auth repository to sign in with Google using Firebase Authentication.
 */

import AuthRepository from '../repositories/auth.repository';
import { User } from '../types/user'; 
import createFirebaseUser from '../utils/createFirebaseUser';

/**
 * Sign in with Google
 * @returns {Promise<User>} Returns a promise that resolves to the user object after successful sign-in.
 */
export default async function signInWithGoogle(): Promise<User> {
  try {
    // Call the repository method to sign in with Google
    const user = await AuthRepository.signInWithGoogle();

    // Map the Firebase user object to local User type
    const mappedUser: User = {
      id: user.uid,
      name: user.displayName || '',
      email: user.email || '',
      provider: 'google',
      createdAt: new Date(user.metadata.creationTime || ''),
      updatedAt: new Date(user.metadata.lastSignInTime || ''),
    };

    // Create user in Firebase before returning
    await createFirebaseUser(mappedUser);

    return mappedUser;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error; // Re-throw the error for further handling
  }
};