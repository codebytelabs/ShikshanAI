import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  buildSystemPrompt,
  serializeMessages,
  parseResponse,
  promptContainsContext,
  hasRequiredContext,
  ChatMessage,
  StudentContext,
} from './aiTutorService';

// Arbitrary for generating valid student contexts
const studentContextArb = fc.record({
  gradeName: fc.stringMatching(/^Class (9|10|11|12)$/),
  subjectName: fc.constantFrom('Mathematics', 'Science', 'English', 'Social Science'),
  chapterName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  topicName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
});

// Arbitrary for generating chat messages
const chatMessageArb = fc.record({
  role: fc.constantFrom('user', 'assistant') as fc.Arbitrary<'user' | 'assistant'>,
  content: fc.string({ minLength: 1, maxLength: 500 }),
});

describe('aiTutorService', () => {
  /**
   * **Feature: beta-ready-improvements, Property 5: AI Context Inclusion**
   * *For any* student context (grade, subject, chapter), the generated system prompt
   * SHALL contain all three context fields.
   * **Validates: Requirements 2.2**
   */
  describe('Property 5: AI Context Inclusion', () => {
    it('should include grade and subject in system prompt', () => {
      fc.assert(
        fc.property(studentContextArb, (context) => {
          const prompt = buildSystemPrompt(context);
          
          // Grade and subject must always be present
          expect(prompt).toContain(context.gradeName);
          expect(prompt).toContain(context.subjectName);
        }),
        { numRuns: 100 }
      );
    });

    it('should include chapter name when provided', () => {
      fc.assert(
        fc.property(
          fc.record({
            gradeName: fc.stringMatching(/^Class (9|10|11|12)$/),
            subjectName: fc.constantFrom('Mathematics', 'Science'),
            chapterName: fc.string({ minLength: 1, maxLength: 50 }),
            topicName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
          }),
          (context) => {
            const prompt = buildSystemPrompt(context);
            expect(prompt).toContain(context.chapterName);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate context contains required fields', () => {
      fc.assert(
        fc.property(studentContextArb, (context) => {
          const hasContext = hasRequiredContext(context);
          expect(hasContext).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should return false for missing required context', () => {
      const invalidContexts: StudentContext[] = [
        { gradeName: '', subjectName: 'Math' },
        { gradeName: 'Class 10', subjectName: '' },
        { gradeName: '', subjectName: '' },
      ];

      invalidContexts.forEach((context) => {
        expect(hasRequiredContext(context)).toBe(false);
      });
    });
  });

  /**
   * **Feature: beta-ready-improvements, Property 4: Chat Message Serialization Round-Trip**
   * *For any* valid array of chat messages, serializing to OpenRouter format and parsing
   * the response SHALL preserve message structure and content.
   * **Validates: Requirements 2.7, 2.8**
   */
  describe('Property 4: Chat Message Serialization Round-Trip', () => {
    it('should serialize messages with system prompt prepended', () => {
      fc.assert(
        fc.property(
          fc.array(chatMessageArb, { minLength: 1, maxLength: 10 }),
          studentContextArb,
          (messages, context) => {
            const serialized = serializeMessages(messages, context);
            
            // Should have system message first
            expect(serialized.messages[0].role).toBe('system');
            
            // Should contain all original messages (excluding any system messages)
            const nonSystemMessages = messages.filter(m => m.role !== 'system');
            expect(serialized.messages.length).toBe(nonSystemMessages.length + 1);
            
            // Original messages should be preserved
            nonSystemMessages.forEach((msg, idx) => {
              expect(serialized.messages[idx + 1].role).toBe(msg.role);
              expect(serialized.messages[idx + 1].content).toBe(msg.content);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should parse valid OpenRouter response', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 1000 }),
          (content) => {
            const response = {
              choices: [
                {
                  message: {
                    role: 'assistant',
                    content,
                  },
                },
              ],
            };
            
            const parsed = parseResponse(response);
            expect(parsed).toBe(content);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should throw on empty choices', () => {
      expect(() => parseResponse({ choices: [] })).toThrow('No response from AI');
    });

    it('should throw on missing content', () => {
      const response = {
        choices: [{ message: { role: 'assistant', content: '' } }],
      };
      expect(() => parseResponse(response)).toThrow('Invalid response format');
    });
  });
});
