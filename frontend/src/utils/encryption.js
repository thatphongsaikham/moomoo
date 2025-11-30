// Utility functions for encrypting/decrypting table IDs
import CryptoJS from "crypto-js";

const SECRET_KEY =
  import.meta.env.VITE_ENCRYPTION_KEY || "moomoo-secret-key-2024";

/**
 * Encrypt table number to use in URL
 * @param {string|number} tableNumber - The table number to encrypt
 * @returns {string} Encrypted string safe for URL
 */
export const encryptTableId = (tableNumber) => {
  const encrypted = CryptoJS.AES.encrypt(
    String(tableNumber),
    SECRET_KEY
  ).toString();
  // Make URL-safe by replacing special characters
  return encodeURIComponent(encrypted);
};

/**
 * Decrypt table ID from URL parameter
 * @param {string} encryptedId - The encrypted table ID from URL
 * @returns {string|null} Decrypted table number or null if invalid
 */
export const decryptTableId = (encryptedId) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(
      decodeURIComponent(encryptedId),
      SECRET_KEY
    ).toString(CryptoJS.enc.Utf8);

    if (!decrypted) return null;

    // รองรับทั้ง format เก่า (แค่ tableNumber) และ format ใหม่ (JSON)
    try {
      const parsed = JSON.parse(decrypted);
      return parsed.tableNumber ? String(parsed.tableNumber) : null;
    } catch {
      // Format เก่า - แค่ tableNumber
      return decrypted;
    }
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

/**
 * Decrypt and get full session data from URL parameter
 * @param {string} encryptedId - The encrypted table ID from URL
 * @returns {Object|null} { tableNumber, session } or null if invalid
 */
export const decryptTableSession = (encryptedId) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(
      decodeURIComponent(encryptedId),
      SECRET_KEY
    ).toString(CryptoJS.enc.Utf8);

    if (!decrypted) return null;

    try {
      const parsed = JSON.parse(decrypted);
      return {
        tableNumber: parsed.tableNumber ? String(parsed.tableNumber) : null,
        session: parsed.session || null,
      };
    } catch {
      // Format เก่า - แค่ tableNumber (ไม่มี session)
      return { tableNumber: decrypted, session: null };
    }
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

/**
 * Generate a random 4-digit PIN
 * @returns {string} 4-digit PIN
 */
export const generatePIN = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};
