/**
 * Checks if the user is logged in by verifying Firebase Auth
 */

import { auth } from '@/lib/firebase';

export default function isUserLoggedIn(): boolean {
  // Check if the current user is authenticated
  const user = auth.currentUser;
  
  // If user exists, they are logged in
  return !!user;
}