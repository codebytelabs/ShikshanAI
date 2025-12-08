import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cloud, X } from 'lucide-react';
import { AuthModal } from './AuthModal';

interface SyncPromptProps {
  onDismiss: () => void;
}

export function SyncPrompt({ onDismiss }: SyncPromptProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <Cloud className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Sync your progress</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create an account to save your learning progress and access it from any device.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => setShowAuthModal(true)}>
                  Sign Up
                </Button>
                <Button size="sm" variant="ghost" onClick={onDismiss}>
                  Remind me later
                </Button>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={onDismiss}
      />
    </>
  );
}
