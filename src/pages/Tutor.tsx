import { useState, useRef, useEffect } from 'react';
import { Send, BookOpen, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useStudentContext } from '@/contexts/StudentContext';
import { useAITutor } from '@/hooks/useAITutor';
import { supabase } from '@/integrations/supabase/client';

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Tutor() {
  const [input, setInput] = useState('');
  const [gradeName, setGradeName] = useState('Class 10');
  const [subjectName, setSubjectName] = useState('Mathematics');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isOnline } = useNetworkStatus();
  const { profile, subjects: studentSubjects } = useStudentContext();

  // Fetch grade and subject names for context
  useEffect(() => {
    async function fetchContext() {
      if (!profile?.grade_id) return;

      const { data: gradeData } = await supabase
        .from('grades')
        .select('name')
        .eq('id', profile.grade_id)
        .single();

      if (gradeData) {
        setGradeName(gradeData.name);
      }

      if (studentSubjects.length > 0) {
        const { data: subjectData } = await supabase
          .from('subjects')
          .select('name')
          .eq('id', studentSubjects[0].subject_id)
          .single();

        if (subjectData) {
          setSubjectName(subjectData.name);
        }
      }
    }

    fetchContext();
  }, [profile, studentSubjects]);

  const { messages, isLoading, error, sendUserMessage, retry } = useAITutor({
    context: {
      gradeName,
      subjectName,
    },
  });

  // Convert ChatMessage to DisplayMessage format
  const displayMessages: DisplayMessage[] = [
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm your CBSE tutor. Ask me any doubt from your ${gradeName} ${subjectName} studies. I'll first give you hints to help you think, then show the full solution if you need it.`,
      timestamp: new Date(),
    },
    ...messages
      .filter((m) => m.role !== 'system')
      .map((m, idx) => ({
        id: `msg-${idx}`,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(),
      })),
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput('');
    await sendUserMessage(message);
  };

  return (
    <main className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">Ask a Doubt</h1>
            <p className="text-xs text-muted-foreground">
              {gradeName} • {subjectName}
            </p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {displayMessages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-3',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-card border border-border text-card-foreground rounded-bl-md'
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span
                  className="h-2 w-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-destructive">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retry}
                    className="mt-2"
                  >
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-4 py-3 safe-area-bottom">
        {!isOnline ? (
          <div className="flex flex-col items-center gap-2 py-2 text-center">
            <WifiOff className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              Tutor requires internet connection
            </p>
            <p className="text-xs text-muted-foreground">
              Please connect to the internet to ask questions
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your doubt here..."
                className="min-h-[44px] max-h-[120px] resize-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-11 w-11 flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-center text-muted-foreground">
              Requires internet • Aligned with CBSE curriculum
            </p>
          </>
        )}
      </div>
    </main>
  );
}
