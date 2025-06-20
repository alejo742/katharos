/**
 * Admin Repository
 * This file contains the AdminRepository class which is responsible for managing admin-related data operations.
 */

import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";


export default class AdminRepository {
  /**
   * Determine if user is an admin by its isAdmin field
   * @param userId - The ID of the user to check.
   * @return {Promise<boolean>} Returns a promise that resolves to true if the user is an admin, otherwise false.
   */
  static async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData?.isAdmin || false; // Return true if isAdmin is true, otherwise false
      } else {
        console.warn('No user data found for user ID:', userId);
        return false; // Default to false if no user data exists
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      throw error; // Re-throw the error for further handling
    }
  }
}