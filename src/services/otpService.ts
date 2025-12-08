/**
 * OTP Service for managing OTP generation, storage, and verification
 */

interface OTPData {
  otp: string;
  phoneNumber: string;
  expiresAt: number;
  attempts: number;
}

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;
const otpStorage = new Map<string, OTPData>();

/**
 * Generate and store OTP for a phone number
 */
export function generateAndStoreOTP(phoneNumber: string): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000);

  otpStorage.set(phoneNumber, {
    otp,
    phoneNumber,
    expiresAt,
    attempts: 0,
  });

  return otp;
}

/**
 * Verify OTP for a phone number
 */
export function verifyOTP(phoneNumber: string, inputOTP: string): { success: boolean; message: string } {
  const otpData = otpStorage.get(phoneNumber);

  if (!otpData) {
    return { success: false, message: 'No OTP found. Please request a new one.' };
  }

  if (Date.now() > otpData.expiresAt) {
    otpStorage.delete(phoneNumber);
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (otpData.attempts >= MAX_ATTEMPTS) {
    otpStorage.delete(phoneNumber);
    return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
  }

  otpData.attempts++;

  if (otpData.otp === inputOTP) {
    otpStorage.delete(phoneNumber);
    return { success: true, message: 'OTP verified successfully' };
  }

  const remainingAttempts = MAX_ATTEMPTS - otpData.attempts;
  return { 
    success: false, 
    message: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.` 
  };
}

/**
 * Check if OTP exists for phone number
 */
export function hasActiveOTP(phoneNumber: string): boolean {
  const otpData = otpStorage.get(phoneNumber);
  return otpData !== undefined && Date.now() <= otpData.expiresAt;
}

/**
 * Get remaining time for OTP in seconds
 */
export function getOTPRemainingTime(phoneNumber: string): number {
  const otpData = otpStorage.get(phoneNumber);
  if (!otpData) return 0;
  const remaining = Math.max(0, otpData.expiresAt - Date.now());
  return Math.ceil(remaining / 1000);
}

/**
 * Clear OTP for a phone number
 */
export function clearOTP(phoneNumber: string): void {
  otpStorage.delete(phoneNumber);
}
