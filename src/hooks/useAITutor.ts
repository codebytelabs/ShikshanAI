import { useState, useCallback } from 'react';
import { sendMessage, ChatMessage, StudentContext } from '@/services/aiTutorService';

interface UseAITutorOptions {
  context: StudentContext;
}

interface UseAITutorReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendUserMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  retry: () => Promise<void>;
}

export function useAITutor({ context }: UseAITutorOptions): UseAITutorReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);

  const sendUserMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    setError(null);
    setLastUserMessage(content);
    
    const userMessage: ChatMessage = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await sendMessage(updatedMessages, context);
      const assistantMessage: ChatMessage = { role: 'assistant', content: response };
      setMessages([...updatedMessages, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [messages, context]);

  const retry = useCallback(async () => {
    if (!lastUserMessage) return;
    
    // Remove the last user message and try again
    const messagesWithoutLast = messages.slice(0, -1);
    setMessages(messagesWithoutLast);
    setError(null);
    
    const userMessage: ChatMessage = { role: 'user', content: lastUserMessage };
    const updatedMessages = [...messagesWithoutLast, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await sendMessage(updatedMessages, context);
      const assistantMessage: ChatMessage = { role: 'assistant', content: response };
      setMessages([...updatedMessages, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [lastUserMessage, messages, context]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setLastUserMessage(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendUserMessage,
    clearMessages,
    retry,
  };
}
