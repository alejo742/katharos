/**
 * User Repository
 * This repository handles user-related operations such as fetching user data, updating user profiles, and managing user preferences.
 */

import { auth, db } from '@/lib/firebase';
import { User } from '../types/user';
import { getDoc, doc, setDoc, updateDoc } from 'firebase/firestore';


export default class UserRepository {
  /****** USER OPERATIONS ******/
  
  /**
   * Creates a user in Firestore
   * @param user - The user object containing user details.
   * @returns {Promise<void>} Returns a promise that resolves when the user is created successfully.
   */
  static async createUser(user: User): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', user.id);
      await setDoc(userDocRef, {
        name: user.name,
        email: user.email,
        provider: user.provider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error; // Re-throw the error for further handling
    }
  }
  /**
   * Get current user profile
   * @returns {Promise<object>} Returns a promise that resolves to the current user profile (not parsed).
   */
  static async getCurrentUserProfile(): Promise<User | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null; // Return null if no user is logged in

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        return {
          ...userData,
          id: user.uid, // Ensure the ID is included
        };
      } else {
        console.warn('No user data found for current user');
        return null;
      }
    } catch (error) {
      console.error('Error fetching current user profile:', error);
      throw error; // Re-throw the error for further handling
    }
  }
  /**
   * Deletes a user from Firestore
   * @param userId - The ID of the user to be deleted.
   * @return {Promise<void>} Returns a promise that resolves when the user is deleted successfully.
   */
  static async deleteUser(userId: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, {}, { merge: true });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error; // Re-throw the error for further handling
    }
  }
}