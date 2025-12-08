/**
 * AI Tutor Service - OpenRouter Integration
 * Requirements: 2.1, 2.2, 2.5, 2.6, 2.7, 2.8
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StudentContext {
  gradeName: string;
  subjectName: string;
  chapterName?: string;
  topicName?: string;
}

interface OpenRouterRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';

/**
 * Build a system prompt with student context
 * Requirements: 2.2, 2.3, 2.4, 2.5
 */
export function buildSystemPrompt(context: StudentContext): string {
  const { gradeName, subjectName, chapterName, topicName } = context;
  
  let contextInfo = `You are ShikshanAI, a friendly and knowledgeable AI tutor helping a ${gradeName} student with ${subjectName}.`;
  
  if (chapterName) {
    contextInfo += ` The student is currently studying "${chapterName}"`;
    if (topicName) {
      contextInfo += `, specifically the topic "${topicName}"`;
    }
    contextInfo += '.';
  }

  return `${contextInfo}

Your teaching approach:
1. HINT-FIRST PEDAGOGY: When a student asks for help with a problem, first provide hints and guiding questions to help them think through it. Only provide the full solution if they explicitly ask for it or are clearly stuck after hints.

2. CBSE CURRICULUM: Ground your explanations in CBSE curriculum content (using NCERT textbooks as the primary reference). Reference relevant concepts, formulas, and examples from the prescribed textbooks when applicable.

3. STAY ON TOPIC: If the student asks questions unrelated to their studies or inappropriate topics, gently redirect them back to educational content. Say something like "That's an interesting question, but let's focus on your ${subjectName} studies. Is there anything about ${chapterName || 'your current topic'} I can help you with?"

4. ENCOURAGE LEARNING: Be supportive and encouraging. Celebrate when they understand concepts and provide gentle correction when they make mistakes.

5. AGE-APPROPRIATE: Keep explanations appropriate for a ${gradeName} student. Use simple language and relatable examples.

Remember: Your goal is to help the student learn and understand, not just give them answers.`;
}

/**
 * Serialize chat messages for OpenRouter API
 * Requirements: 2.7
 */
export function serializeMessages(
  messages: ChatMessage[],
  context: StudentContext
): OpenRouterRequest {
  const systemPrompt = buildSystemPrompt(context);
  
  // Prepend system message if not already present
  const messagesWithSystem: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages.filter(m => m.role !== 'system'),
  ];

  return {
    model: DEFAULT_MODEL,
    messages: messagesWithSystem,
    temperature: 0.7,
    max_tokens: 1024,
  };
}

/**
 * Parse OpenRouter API response
 * Requirements: 2.8
 */
export function parseResponse(response: OpenRouterResponse): string {
  if (!response.choices || response.choices.length === 0) {
    throw new Error('No response from AI');
  }
  
  const message = response.choices[0].message;
  if (!message || !message.content) {
    throw new Error('Invalid response format');
  }
  
  return message.content;
}


/**
 * Send a message to the AI tutor
 * Requirements: 2.1, 2.6
 */
export async function sendMessage(
  messages: ChatMessage[],
  context: StudentContext
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('AI tutor is temporarily unavailable. Please try again later.');
  }

  const requestBody = serializeMessages(messages, context);

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'ShikshanAI',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // Log technical details for debugging but show user-friendly message
      const errorText = await response.text();
      console.error(`AI API error: ${response.status} - ${errorText}`);
      
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else if (response.status >= 500) {
        throw new Error('AI service is temporarily unavailable. Please try again later.');
      } else {
        throw new Error('Unable to get a response. Please try again.');
      }
    }

    const data: OpenRouterResponse = await response.json();
    return parseResponse(data);
  } catch (error) {
    // Re-throw user-friendly errors as-is
    if (error instanceof Error && !error.message.includes('fetch')) {
      throw error;
    }
    // Network errors
    console.error('AI tutor error:', error);
    throw new Error('Connection error. Please check your internet and try again.');
  }
}

/**
 * Check if context contains all required fields
 * Pure function for testing - Requirements: 2.2
 */
export function hasRequiredContext(context: StudentContext): boolean {
  return Boolean(context.gradeName && context.subjectName);
}

/**
 * Check if system prompt contains context fields
 * Pure function for testing - Requirements: 2.2
 */
export function promptContainsContext(prompt: string, context: StudentContext): boolean {
  const hasGrade = prompt.includes(context.gradeName);
  const hasSubject = prompt.includes(context.subjectName);
  const hasChapter = !context.chapterName || prompt.includes(context.chapterName);
  
  return hasGrade && hasSubject && hasChapter;
}
