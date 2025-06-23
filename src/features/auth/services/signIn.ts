/**
 * General sign-in flow
 */

export interface SignInData {
  email: string;
  password: string;
  name?: string;
  provider: string;
}
import signInWithApple from "./signInWithApple";
import signInWithFacebook from "./signInWithFacebook";
import signInWithGoogle from "./signInWithGoogle";
import signInWithEmailAndPassword from "./signInWithEmailAndPassword";

/**
 * Sign in with email and password or OAuth provider
 * @param {SignInData} data - The sign-in data containing email, password, and provider.
 * @param {Function} setError - Function to set an error message if sign-in fails.
 * @returns {Promise<{ success: boolean, redirectTo?: string }>} Returns a promise with success status and optional redirect URL
 */
export default async function signIn(
  data: SignInData, 
  setError: (error: string) => void
): Promise<{ success: boolean, redirectTo?: string }> {
  const { email, password, provider, name } = data;
    
  /**
   * Email and Password
   */
  if (provider === 'email' && email && password) {
    // Email and password auth logic
    try {
      const result = await signInWithEmailAndPassword(data);
      if (result) {
        return { success: true };
      }
      return { success: false };
    } catch (err: any) {
      if (err.redirectUrl) {
        return { success: false, redirectTo: err.redirectUrl };
      }
      throw err;
    }
  }

  /**
   * Google
   */
  else if (provider === 'google') {
    // Google auth logic
    try {
      await signInWithGoogle();
      return { success: true };
    } catch (err) {
      console.error('Error signing in with Google:', err);
      setError('Error al iniciar sesión con Google. Inténtalo de nuevo más tarde.');
      return { success: false };
    }
  }
  /**
   * Apple
   */
  else if (provider === 'apple') {
    // Apple auth logic
    try {
      await signInWithApple();
      return { success: true };
    } catch (err) {
      console.error('Error signing in with Apple:', err);
      setError('Error al iniciar sesión con Apple. Inténtalo de nuevo más tarde.');
      return { success: false };
    }
  }
  /**
   * Facebook
   */
  else if (provider === 'facebook') {
    // Facebook auth logic
    try {
      await signInWithFacebook();
      return { success: true };
    } catch (err) {
      console.error('Error signing in with Facebook:', err);
      setError('Error al iniciar sesión con Facebook. Inténtalo de nuevo más tarde.');
      return { success: false };
    }
  }
  /**
   * Error, but shouldn't happen
   */
  else {
    console.error('Unsupported provider:', provider);
    return { success: false };
  }
}