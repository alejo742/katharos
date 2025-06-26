import AdminRepository from "../repositories/admin.repository";

/**
 * Check if a user has admin privileges
 * @returns {Promise<{isAdmin: boolean}>} Object with admin status
 */
export async function checkAdminStatus(): Promise<boolean> {
  try { 
    // Validate userId with the repository
    const isAdmin = AdminRepository.checkAdminStatus();
    return isAdmin
  } catch (error) {
    console.error('Error checking admin status:', error);
    // Default to non-admin if there's an error
    return false;
  }
}