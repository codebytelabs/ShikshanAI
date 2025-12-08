/**
 * Student Avatar Component
 * Displays fun, colorful avatars for students
 * Uses emoji-based avatars with gradient backgrounds
 */

import { cn } from '@/lib/utils';

// Avatar definitions with emoji and gradient colors
const AVATARS: Record<string, { emoji: string; gradient: string; bg: string }> = {
  'student-1': { emoji: '🦊', gradient: 'from-orange-400 to-red-500', bg: 'bg-orange-100' },
  'student-2': { emoji: '🐼', gradient: 'from-gray-400 to-gray-600', bg: 'bg-gray-100' },
  'student-3': { emoji: '🦁', gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-100' },
  'student-4': { emoji: '🐸', gradient: 'from-green-400 to-emerald-500', bg: 'bg-green-100' },
  'student-5': { emoji: '🦉', gradient: 'from-amber-600 to-yellow-700', bg: 'bg-amber-100' },
  'student-6': { emoji: '🐰', gradient: 'from-pink-400 to-rose-500', bg: 'bg-pink-100' },
  'student-7': { emoji: '🐯', gradient: 'from-orange-500 to-amber-600', bg: 'bg-orange-100' },
  'student-8': { emoji: '🦋', gradient: 'from-blue-400 to-purple-500', bg: 'bg-blue-100' },
  'student-9': { emoji: '🐨', gradient: 'from-slate-400 to-slate-600', bg: 'bg-slate-100' },
  'student-10': { emoji: '🦄', gradient: 'from-purple-400 to-pink-500', bg: 'bg-purple-100' },
  'student-11': { emoji: '🐶', gradient: 'from-amber-400 to-yellow-500', bg: 'bg-amber-100' },
  'student-12': { emoji: '🐱', gradient: 'from-orange-300 to-amber-400', bg: 'bg-orange-100' },
};

export const AVATAR_OPTIONS = Object.keys(AVATARS);

interface StudentAvatarProps {
  avatarId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBorder?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-10 w-10 text-xl',
  md: 'h-14 w-14 text-2xl',
  lg: 'h-20 w-20 text-4xl',
  xl: 'h-24 w-24 text-5xl',
};

export function StudentAvatar({ 
  avatarId = 'student-1', 
  size = 'lg',
  showBorder = true,
  className 
}: StudentAvatarProps) {
  const avatar = AVATARS[avatarId] || AVATARS['student-1'];
  
  return (
    <div 
      className={cn(
        'flex items-center justify-center rounded-2xl',
        `bg-gradient-to-br ${avatar.gradient}`,
        showBorder && 'border-2 border-white/30 shadow-lg',
        sizeClasses[size],
        className
      )}
    >
      <span className="drop-shadow-sm">{avatar.emoji}</span>
    </div>
  );
}

interface AvatarSelectorProps {
  selectedAvatar: string;
  onSelect: (avatarId: string) => void;
}

export function AvatarSelector({ selectedAvatar, onSelect }: AvatarSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {AVATAR_OPTIONS.map((avatarId) => (
        <button
          key={avatarId}
          onClick={() => onSelect(avatarId)}
          className={cn(
            'p-1 rounded-xl transition-all',
            selectedAvatar === avatarId 
              ? 'ring-2 ring-primary ring-offset-2 scale-110' 
              : 'hover:scale-105 opacity-70 hover:opacity-100'
          )}
        >
          <StudentAvatar avatarId={avatarId} size="sm" showBorder={false} />
        </button>
      ))}
    </div>
  );
}

/**
 * Generate a display name from device ID or use provided name
 * Format: Student#X25001 (X = grade, 25 = year, 001 = unique number)
 */
export function getDisplayName(name?: string | null, deviceId?: string, gradeNumber?: number): string {
  if (name && name.trim()) return name;
  
  // Generate a student ID from device ID
  if (deviceId) {
    // Create a consistent 3-digit number from device ID
    const hash = deviceId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const uniqueNum = String(hash % 1000).padStart(3, '0');
    const year = new Date().getFullYear().toString().slice(-2); // "25" for 2025
    const grade = gradeNumber || 10; // Default to 10 if not provided
    
    return `Student#${grade}${year}${uniqueNum}`;
  }
  
  return 'Student';
}

/**
 * Generate a short student ID for display
 */
export function getStudentId(deviceId?: string, gradeNumber?: number): string {
  if (!deviceId) return '#000';
  
  const hash = deviceId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const uniqueNum = String(hash % 1000).padStart(3, '0');
  const year = new Date().getFullYear().toString().slice(-2);
  const grade = gradeNumber || 10;
  
  return `#${grade}${year}${uniqueNum}`;
}

/**
 * Get a consistent avatar based on device ID
 */
export function getDefaultAvatar(deviceId?: string): string {
  if (!deviceId) return 'student-1';
  
  const hash = deviceId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = (hash % AVATAR_OPTIONS.length) + 1;
  return `student-${index}`;
}
