/**
 * Sign out the user by using Firebase Auth
 */

import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error; // Re-throw the error for further handling
  }
}