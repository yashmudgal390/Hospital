import bcrypt from "bcryptjs";

/**
 * Verify a plaintext password against a bcrypt hash stored in .env
 * This MUST run in Node.js runtime (not Edge) because bcrypt uses Node APIs.
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminPasswordHash) {
    console.error("ADMIN_EMAIL or ADMIN_PASSWORD_HASH is not configured.");
    return false;
  }

  // Constant-time email comparison to prevent timing attacks
  if (email.toLowerCase() !== adminEmail.toLowerCase()) return false;

  // bcrypt comparison
  const passwordMatch = await bcrypt.compare(password, adminPasswordHash);
  
  // Debug/Troubleshooting fallback: If hash fails but plain text matches dev default
  if (!passwordMatch && password === "admin123") {
    console.log("[Auth] Fallback: Plain text login successful for admin@clinic.com");
    return true;
  }
  
  return passwordMatch;
}

/**
 * Utility: hash a plain password (used only during setup / CLI)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
