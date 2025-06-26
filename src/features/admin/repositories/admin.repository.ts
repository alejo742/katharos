/**
 * Admin Repository
 * This file contains the AdminRepository class which is responsible for managing admin-related data operations.
 */

import { getDoc, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";


export default class AdminRepository {
  /**
   * Checks if a user has admin privileges
   * @returns Promise<boolean> - True if the user is an admin
   */
  static async checkAdminStatus(): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;
      
      // If there's no authenticated user, they're not an admin
      if (!currentUser) {
        return false;
      }
      
      // Get the user document
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      // Check if the user exists and has the isAdmin flag set to true
      if (userSnap.exists()) {
        return userSnap.data().isAdmin === true;
      }
      
      return false;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }
}