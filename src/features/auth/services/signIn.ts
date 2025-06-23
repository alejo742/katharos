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
 * @returns {Promise<void>} Returns a promise that resolves when the sign-in is successful.
 */
export default async function signIn(data: SignInData, setError: (error: string) => void): Promise<void> {
  const { email, password, provider, name } = data;
  let success = false;
    
  /**
   * Email and Password
   */
  if (provider === 'email' && email && password) {
    // Email and password auth logic
    try {
      await signInWithEmailAndPassword(data);
      success = true;
    } catch (err: Error | any) {
      console.error('Error signing in with email and password:', err);
      if (err.name === 'UserNotFoundError') {
        // Special case for user not found
        setError('500: Usuario no encontrado. Por favor, regístrate primero.');
        return;
      }
      else {
        setError('Error al iniciar sesión con correo electrónico y contraseña. Inténtalo de nuevo más tarde');
      }
    }
  }

  /**
   * Google
   */
  else if (provider === 'google') {
    // Google auth logic
    try {
      await signInWithGoogle();
      success = true;
    } catch (err) {
      console.error('Error signing in with Google:', err);
      setError('Error al iniciar sesión con Google. Inténtalo de nuevo más tarde.');
    }
  }
  /**
   * Apple
   */
  else if (provider === 'apple') {
    // Apple auth logic
    try {
      await signInWithApple();
      success = true;
    } catch (err) {
      console.error('Error signing in with Apple:', err);
      setError('Error al iniciar sesión con Apple. Inténtalo de nuevo más tarde.');
    }
  }
  /**
   * Facebook
   */
  else if (provider === 'facebook') {
    // Facebook auth logic
    try {
      await signInWithFacebook();
      success = true;
    } catch (err) {
      console.error('Error signing in with Facebook:', err);
      setError('Error al iniciar sesión con Facebook. Inténtalo de nuevo más tarde.');
    }
  }
  /**
   * Error
   */
  else {
    console.error('Unsupported provider:', provider);
  }

  // If sign-in was successful, redirect
  if (success) {
    return;
  } else {
    // Handle failure case if needed
    throw new Error('Sign-in failed');
  }
}