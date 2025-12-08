import { useState, useRef, useEffect } from 'react';
import { Send, WifiOff, RefreshCw, AlertCircle, Sparkles, MessageCircle, Lightbulb } from 'lucide-react';
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

// Suggested questions based on common CBSE topics
const suggestedQuestions = [
  "Explain Euclid's division lemma with an example",
  "How do I solve quadratic equations?",
  "What is the difference between speed and velocity?",
  "Explain photosynthesis step by step",
];

export default function Tutor() {
  const [input, setInput] = useState('');
  const [gradeName, setGradeName] = useState('Class 10');
  const [subjectName, setSubjectName] = useState('Mathematics');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isOnline } = useNetworkStatus();
  const { profile, subjects: studentSubjects } = useStudentContext();

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
    context: { gradeName, subjectName },
  });

  const displayMessages: DisplayMessage[] = messages
    .filter((m) => m.role !== 'system')
    .map((m, idx) => ({
      id: `msg-${idx}`,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      timestamp: new Date(),
    }));

  const hasMessages = displayMessages.length > 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages]);

  const handleSend = async (message?: string) => {
    const textToSend = message || input.trim();
    if (!textToSend || isLoading) return;
    setInput('');
    await sendUserMessage(textToSend);
  };

  return (
    <main className="flex flex-col h-[calc(100vh-5rem)] bg-background">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
              <span className="text-2xl">🦉</span>
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div>
            <h1 className="font-bold text-foreground font-display text-lg">Gyan - AI Tutor</h1>
            <p className="text-xs text-muted-foreground">
              {gradeName} • {subjectName} • Online
            </p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Welcome State */}
        {!hasMessages && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse" />
              <div className="relative bg-gradient-to-br from-indigo-100 to-purple-100 p-6 rounded-3xl">
                <span className="text-6xl">🦉</span>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-foreground font-display">Hi! I'm Gyan</h2>
            <p className="mt-2 text-muted-foreground max-w-xs">
              Your personal CBSE tutor. Ask me any doubt from your {gradeName} studies!
            </p>
            
            {/* Suggested Questions */}
            <div className="mt-6 w-full max-w-sm">
              <p className="text-xs text-muted-foreground mb-3 flex items-center justify-center gap-1">
                <Lightbulb className="h-3 w-3" /> Try asking
              </p>
              <div className="space-y-2">
                {suggestedQuestions.slice(0, 3).map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(question)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-border bg-card hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-sm text-foreground"
                  >
                    "{question}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {hasMessages && (
          <div className="space-y-4">
            {displayMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex animate-slide-up',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 mr-2">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm">
                      🦉
                    </div>
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-md'
                      : 'bg-card border border-border text-card-foreground rounded-bl-md shadow-sm'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-start animate-slide-up">
                <div className="flex-shrink-0 mr-2">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm animate-pulse">
                    🦉
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-muted-foreground">Gyan is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex justify-start animate-slide-up">
                <div className="bg-red-50 border border-red-200 rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-red-700">{error}</p>
                      <Button variant="outline" size="sm" onClick={retry} className="mt-2 rounded-lg">
                        <RefreshCw className="mr-2 h-3 w-3" /> Retry
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card px-4 py-3 safe-area-bottom">
        {!isOnline ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <WifiOff className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">You're offline</p>
            <p className="text-xs text-muted-foreground">
              Connect to the internet to chat with Gyan
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your doubt..."
                  className="min-h-[48px] max-h-[120px] resize-none rounded-xl border-2 border-border focus:border-indigo-500 pr-4"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
              </div>
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-12 w-12 flex-shrink-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" /> Powered by AI • Aligned with CBSE curriculum
            </p>
          </>
        )}
      </div>
    </main>
  );
}
