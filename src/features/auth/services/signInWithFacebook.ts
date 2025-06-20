/**
 * Sign in with Facebook service
 * Calls the auth repository to sign in with Facebook using Firebase Authentication.
 */

import { User } from '../types/user'; 
import AuthRepository from '../repositories/auth.repository';
import createFirebaseUser from '../utils/createFirebaseUser';

/**
 * Sign in with Facebook
 * @returns {Promise<User>} Returns a promise that resolves to the user object after successful sign-in.
 */
export default async function signInWithFacebook(): Promise<User> {
  try {
    // Call the repository method to sign in with Facebook
    const user = await AuthRepository.signInWithFacebook();

    // Map the Firebase user object to local User type
    const mappedUser: User = {
      id: user.uid,
      name: user.displayName || '',
      email: user.email || '',
      provider: 'facebook',
      createdAt: new Date(user.metadata.creationTime || ''),
      updatedAt: new Date(user.metadata.lastSignInTime || ''),
    };

    // Create user in Firebase before returning
    await createFirebaseUser(mappedUser);

    return mappedUser;
  } catch (error) {
    console.error('Error signing in with Facebook:', error);
    throw error; // Re-throw the error for further handling
  }
}