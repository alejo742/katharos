/**
 * Sign in with email and password service.
 * Calls the auth repository to sign in with email and password using Firebase Authentication.
 */

import AuthRepository from '../repositories/auth.repository';
import { User } from '../types/user';
import { auth } from '@/lib/firebase';
import createFirebaseUser from '../utils/createFirebaseUser';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default async function signInEmailAndPassword(email: string, password: string): Promise<User> {
  try {
    try {
      // Try to sign in first
      const firebaseUser = await AuthRepository.signInWithEmailAndPassword(email, password);
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
      if (error.code === 'auth/user-not-found') {
        // User doesn't exist, create a new account
        const newFirebaseUser = await AuthRepository.registerWithEmailAndPassword(email, password);
        const newMappedUser: User = {
          id: newFirebaseUser.uid,
          name: newFirebaseUser.displayName || '',
          email: newFirebaseUser.email || '',
          provider: 'email',
          createdAt: new Date(newFirebaseUser.metadata.creationTime || Date.now()),
          updatedAt: new Date(),
        };
        
        // store in firestore
        await createFirebaseUser(newMappedUser);
        return newMappedUser;
      }
      throw error; // Re-throw other errors like wrong password
    }
  } catch (error) {
    console.error('Error in authentication process:', error);
    throw error; // Re-throw for UI handling
  }
}