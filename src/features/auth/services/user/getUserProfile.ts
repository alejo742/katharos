/**
 * Get user profile service
 * Calls the UserRepository to fetch the current user's profile information.
 */

import UserRepository from '../../repositories/user.repository';
import { User } from '../../types/user';

/**
 * Get the current user's profile information
 * @returns {Promise<User>} User profile data
 */
export async function getUserProfile(): Promise<User> {
  try {
    const userProfile = await UserRepository.getCurrentUserProfile();
    if (!userProfile) {
      throw new Error('User not found');
    }

    // parse object
    const parsedUser: User = {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      provider: userProfile.provider,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt,
    };

    return parsedUser;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error; // Re-throw the error for further handling
  }
}