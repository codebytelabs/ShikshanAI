import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot' | 'phone' | 'verify-otp';

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null); // For dev testing
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const { signIn, signUp, resetPassword, sendPhoneOTP, verifyPhoneOTP, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    // Phone OTP flow
    if (mode === 'phone') {
      if (!phoneNumber) {
        setLocalError('Please enter your phone number');
        return;
      }
      // Validate phone number (international)
      const cleaned = phoneNumber.replace(/[^\d+]/g, '');
      if (cleaned.length < 10) {
        setLocalError('Please enter a valid phone number with country code (e.g., +1234567890)');
        return;
      }
      try {
        const otpCode = await sendPhoneOTP(phoneNumber);
        setGeneratedOtp(otpCode); // Store for dev display
        setMode('verify-otp');
      } catch {
        // Error handled by hook
      }
      return;
    }

    // OTP verification flow
    if (mode === 'verify-otp') {
      if (!otp || otp.length !== 6) {
        setLocalError('Please enter the 6-digit OTP');
        return;
      }
      try {
        await verifyPhoneOTP(phoneNumber, otp);
        onOpenChange(false);
        onSuccess?.();
      } catch {
        // Error handled by hook
      }
      return;
    }

    if (!email) {
      setLocalError('Please enter your email');
      return;
    }

    if (mode === 'forgot') {
      try {
        await resetPassword(email);
        setResetSent(true);
      } catch {
        // Error handled by hook
      }
      return;
    }

    if (!password) {
      setLocalError('Please enter your password');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Error is handled by useAuth hook
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setLocalError(null);
    setResetSent(false);
    setGeneratedOtp(null);
    clearError();
    setPassword('');
    setConfirmPassword('');
    setOtp('');
  };

  const displayError = localError || error;

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Sign In';
      case 'signup': return 'Create Account';
      case 'forgot': return 'Reset Password';
      case 'phone': return 'Sign In with Phone';
      case 'verify-otp': return 'Verify OTP';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signin': return 'Sign in to sync your progress across devices';
      case 'signup': return 'Create an account to save your progress';
      case 'forgot': return 'Enter your email to receive a password reset link';
      case 'phone': return 'Enter your mobile number to receive an OTP';
      case 'verify-otp': return `Enter the 6-digit code sent to ${phoneNumber}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {displayError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          {resetSent && mode === 'forgot' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary text-sm">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>Password reset email sent! Check your inbox.</span>
            </div>
          )}

          {mode === 'phone' && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for US, +91 for India)</p>
            </div>
          )}

          {mode === 'verify-otp' && (
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={isLoading}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
              {generatedOtp && import.meta.env.DEV && (
                <p className="text-xs text-green-600 bg-green-50 p-2 rounded">
                  🧪 Dev Mode - OTP: <strong>{generatedOtp}</strong>
                </p>
              )}
            </div>
          )}

          {mode !== 'phone' && mode !== 'verify-otp' && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}

          {mode !== 'forgot' && mode !== 'phone' && mode !== 'verify-otp' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || (mode === 'forgot' && resetSent)}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'signin' ? 'Signing in...' : 
                 mode === 'signup' ? 'Creating account...' : 
                 mode === 'phone' ? 'Sending OTP...' :
                 mode === 'verify-otp' ? 'Verifying...' : 'Sending...'}
              </>
            ) : mode === 'signin' ? (
              'Sign In'
            ) : mode === 'signup' ? (
              'Create Account'
            ) : mode === 'phone' ? (
              'Send OTP'
            ) : mode === 'verify-otp' ? (
              'Verify & Sign In'
            ) : (
              'Send Reset Link'
            )}
          </Button>

          {mode !== 'forgot' && mode !== 'verify-otp' && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => switchMode(mode === 'phone' ? 'signin' : 'phone')}
                disabled={isLoading}
              >
                {mode === 'phone' ? '✉️ Sign in with Email' : '📱 Sign in with Phone'}
              </Button>
            </>
          )}

          <div className="text-center text-sm text-muted-foreground">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-primary hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : mode === 'phone' ? (
              <>
                Prefer email?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-primary hover:underline"
                >
                  Sign in with email
                </button>
              </>
            ) : mode === 'verify-otp' ? (
              <>
                Didn't receive code?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('phone')}
                  className="text-primary hover:underline"
                >
                  Resend OTP
                </button>
              </>
            ) : (
              <>
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
