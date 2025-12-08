/**
 * Edit Profile Modal
 * Allows students to edit their name and select an avatar
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StudentAvatar, AvatarSelector, getStudentId } from './StudentAvatar';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Pencil } from 'lucide-react';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName?: string | null;
  currentAvatar?: string;
  deviceId?: string;
  gradeNumber?: number;
  profileId?: string;
  onSave?: (name: string, avatar: string) => void;
}

export function EditProfileModal({
  open,
  onOpenChange,
  currentName,
  currentAvatar = 'student-1',
  deviceId,
  gradeNumber,
  profileId,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState(currentName || '');
  const [avatar, setAvatar] = useState(currentAvatar);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const studentId = getStudentId(deviceId, gradeNumber);
  const placeholder = `Student${studentId}`;

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setName(currentName || '');
      setAvatar(currentAvatar || 'student-1');
      setError('');
    }
  }, [open, currentName, currentAvatar]);

  const handleSave = async () => {
    if (!profileId) {
      setError('No profile ID found');
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      console.log('Saving profile:', { profileId, name: name.trim() || null, avatar });
      
      // Try to update both name and avatar
      const { data, error: updateError } = await supabase
        .from('student_profiles')
        .update({ 
          name: name.trim() || null,
          avatar: avatar 
        })
        .eq('id', profileId)
        .select();
      
      console.log('Update result:', { data, error: updateError });
      
      // If avatar column doesn't exist, try updating just the name
      if (updateError && updateError.message?.includes('avatar')) {
        console.warn('Avatar column not found, updating name only. Run the migration: supabase/migrations/20251209400000_student_avatar_field.sql');
        const { error: nameError } = await supabase
          .from('student_profiles')
          .update({ name: name.trim() || null })
          .eq('id', profileId);
        
        if (nameError) throw nameError;
        setError('Avatar not saved - database migration needed');
      } else if (updateError) {
        throw updateError;
      }
      
      onSave?.(name.trim(), avatar);
      onOpenChange(false);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Avatar Preview & Selection */}
          <div className="flex flex-col items-center gap-4">
            <StudentAvatar avatarId={avatar} size="xl" />
            <p className="text-sm text-muted-foreground">Choose your avatar</p>
            <AvatarSelector selectedAvatar={avatar} onSelect={setAvatar} />
          </div>
          
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={placeholder}
              maxLength={30}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use default: {placeholder}
            </p>
          </div>
          
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
