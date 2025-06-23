/**
 * Auth Repository
 * This repository handles authentication-related operations such as login, logout, and registration.
 */

import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider,
  signInWithPopup, 
  User as FirebaseUser,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode
} from 'firebase/auth';
import { SignInData } from '../services/signIn';


export default class AuthRepository {
  /****** SIGN IN LOGIC ******/
  /**
   * Register with email and password
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @returns {Promise<FirebaseUser>} Returns a promise that resolves to the Firebase user object.
   */
  static async registerWithEmailAndPassword(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error registering with email and password:', error);
      throw error; // Re-throw the error for further handling
    }
  }
  /**
   * Sign in with email and password
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @returns {Promise<FirebaseUser>} Returns a promise that resolves to the Firebase user object.
   */
  static async signInWithEmailAndPassword(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in with email and password:', error);
      throw error; // Re-throw the error for further handling
    }
  }
  /**
   * Sign in with Google
   * @returns {Promise<object>} Returns a promise that resolves to the user object (not yet parsed) after successful sign-in.
   */
  static async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error; // Re-throw the error for further handling
    }
  }
  /**
   * Sign in with Facebook
   * @returns {Promise<object>} Returns a promise that resolves to the user object (not yet parsed) after successful sign-in.
   */
  static async signInWithFacebook() {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Facebook:', error);
      throw error; // Re-throw the error for further handling
    }
  }
  /**
   * Sign in with Apple
   * @returns {Promise<object>} Returns a promise that resolves to the user object (not yet parsed) after successful sign-in.
   */
  static async signInWithApple() {
    const provider = new OAuthProvider('apple.com');
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Apple:', error);
      throw error; // Re-throw the error for further handling
    }
  }

  /****** RESET LOGIC ******/
  /**
   * Send password reset email
   * @param {string} email - The user's email address.
   * @returns {Promise<void>} Returns a promise that resolves when the email is sent.
   */
  static async sendPasswordResetEmail(email: string): Promise<void> {
    const actionCodeSettings = {
      // Specify your app's reset password page
      url: `${window.location.origin}/reset-password`,
      // This is the key setting that was missing
      handleCodeInApp: true
    };
    
    return sendPasswordResetEmail(auth, email, actionCodeSettings);
  }
  /**
   * Confirm password reset with code
   * @param {string} code - The password reset code sent to the user's email.
   * @param {string} newPassword - The new password to set for the user.
   */
  static async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    return confirmPasswordReset(auth, code, newPassword);
  }
  /**
   * Verify password reset code
   * @param {string} code - The password reset code to verify.
   */
  static async verifyPasswordResetCode(code: string): Promise<string> {
    return verifyPasswordResetCode(auth, code);
  }
}