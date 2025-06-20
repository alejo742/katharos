/**
 * Creates a Firebase user from a User object.
 */

import { User } from '../types/user';
import UserRepository from '../repositories/user.repository';

export default async function createFirebaseUser(user: User): Promise<void> {
  try {
    // Create the user in Firestore
    await UserRepository.createUser(user);
    
  } catch (error) {
    console.error('Error creating Firebase user:', error);
    throw error; // Re-throw the error for further handling
  }
}