import UserRepository from "@/features/auth/repositories/user.repository";

/**
 * Check if a user has admin privileges
 * @param {string} userId - User's ID
 * @returns {Promise<{isAdmin: boolean}>} Object with admin status
 */
export async function checkAdminStatus(userId: string): Promise<boolean> {
  try { 
    // Validate userId with the repository
    const isAdmin = UserRepository.isUserAdmin(userId);
    return isAdmin
  } catch (error) {
    console.error('Error checking admin status:', error);
    // Default to non-admin if there's an error
    return false;
  }
}