const MFA_CODE_REGEX = /^\d{6}$/;
const isValidPhoneNumber = (phone: string) => /^\+[1-9]\d{1,14}$/.test(phone);

// Utility functions to validate phone number and MFA code
export const validatePhoneNumber = (phoneNumber: unknown): boolean => {
  if (!phoneNumber) return false;
  if (typeof phoneNumber !== "string") return false;
  return isValidPhoneNumber(phoneNumber);
};

export const validateMFACode = (mfaCode: unknown): boolean => {
  if (!mfaCode) return false;
  if (typeof mfaCode !== "string" && typeof mfaCode !== "number") return false;
  return MFA_CODE_REGEX.test(String(mfaCode));
};
