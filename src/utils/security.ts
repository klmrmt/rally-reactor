import crypto from "crypto";
import { config } from "../config/config";

// Function to hash phone numbers using SHA-256
export const hashPhoneNumber = (phone: string): string => {
  return crypto.createHash("sha256").update(phone).digest("hex");
};

// Function to encrypt and decrypt phone numbers using AES-256-CBC
// The phoneEncryptionKey must be a 32-byte hex string
export const encryptPhoneNumber = (phone: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    config.phoneEncryptionKey,
    iv
  );
  let encrypted = cipher.update(phone, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
};

// Function to decrypt an encrypted phone number
// The input should be in the format "iv:encryptedData"
export const decryptPhoneNumber = (encryptedData: string): string => {
  const [ivHex, encryptedHex] = encryptedData.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(config.phoneEncryptionKey),
    iv
  );
  let decrypted = decipher.update(encryptedText, undefined, "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
