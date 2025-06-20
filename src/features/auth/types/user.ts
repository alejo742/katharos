/**
 * User type definition.
 */

export interface User {
  id: string; // Unique identifier for the user (possibly Firebase document ID)
  name: string; // Full name of the user
  email: string; // Email address of the user
  provider: string; // Authentication provider (e.g., "email", "google", "facebook")
  password?: string; // Password for the user account (optional, may not be stored in some systems)
  createdAt: Date; // Timestamp when the user was created
  updatedAt?: Date; // Optional timestamp for when the user was last updated
}