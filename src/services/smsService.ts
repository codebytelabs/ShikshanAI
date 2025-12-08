/**
 * SMS Service using Twilio for OTP verification
 */

interface TwilioResponse {
  sid: string;
  status: string;
  error_code?: string;
  error_message?: string;
}

const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
// Note: You need to purchase a Twilio phone number to send SMS
// For trial accounts, you can only send to verified numbers
const TWILIO_PHONE_NUMBER = import.meta.env.VITE_TWILIO_PHONE_NUMBER || '';

// Development mode - set to true to skip actual SMS sending
const DEV_MODE = import.meta.env.DEV && !TWILIO_PHONE_NUMBER;

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send SMS OTP using Twilio
 * In development mode without a Twilio phone number, OTP is logged to console
 */
export async function sendSMSOTP(phoneNumber: string, otp: string): Promise<void> {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const message = `Your ShikshanAI verification code is: ${otp}. Valid for 5 minutes.`;

  // Development mode - just log the OTP
  if (DEV_MODE) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📱 [DEV MODE] SMS OTP for ${formattedPhone}`);
    console.log(`🔐 OTP Code: ${otp}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return;
  }

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn('Twilio not fully configured. Using dev mode.');
    console.log(`[DEV] OTP ${otp} for ${formattedPhone}`);
    return;
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: TWILIO_PHONE_NUMBER,
          To: formattedPhone,
          Body: message,
        }),
      }
    );

    const data: TwilioResponse = await response.json();
    
    if (!response.ok || data.error_code) {
      throw new Error(`SMS failed: ${data.error_message || response.statusText}`);
    }

    console.log('SMS sent successfully:', data.sid);
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
}

/**
 * Format phone number to E.164 format
 * Supports international numbers with country code
 */
function formatPhoneNumber(phoneNumber: string): string {
  // If it already has +, use as is
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }

  const digits = phoneNumber.replace(/\D/g, '');

  // If it looks like it has a country code (11+ digits), add +
  if (digits.length >= 11) {
    return `+${digits}`;
  }

  // For shorter numbers, assume they need a country code
  // Default to +1 (US) if no country code provided
  if (digits.length >= 10) {
    return `+${digits}`;
  }

  throw new Error('Invalid phone number format. Please include country code.');
}

/**
 * Validate phone number (international)
 * Accepts numbers with country code (E.164 format)
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Must start with + or be at least 10 digits
  if (cleaned.startsWith('+')) {
    // E.164 format: + followed by 7-15 digits
    const digits = cleaned.slice(1);
    return digits.length >= 7 && digits.length <= 15 && /^\d+$/.test(digits);
  }
  
  // Without +, accept 10-15 digits (will add country code later)
  const digits = cleaned.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Test Twilio connection
 */
export async function testTwilioConnection(): Promise<{ success: boolean; message: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    return { success: false, message: 'Twilio credentials not configured' };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}.json`,
      {
        headers: {
          'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: `Connected: ${data.friendly_name}` };
    } else {
      const error = await response.json();
      return { success: false, message: error.message || 'Connection failed' };
    }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Connection failed' };
  }
}
