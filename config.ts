/**
 * Application Configuration
 *
 * Environment variables are loaded from .env files (Vite requires VITE_ prefix)
 * For local development, create a .env.local file with your values
 */

export const config = {
  /**
   * Contact email address
   * Set via VITE_CONTACT_EMAIL in .env file
   */
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'aaron.jsfund@gmail.com',
} as const;
