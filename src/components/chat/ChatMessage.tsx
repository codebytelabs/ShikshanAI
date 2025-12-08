/**
 * Chat Message Component
 * Renders chat messages with proper markdown formatting
 * Supports: bold, italic, code, lists, headers, math expressions
 */

import { cn } from '@/lib/utils';

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
}

/**
 * Parse and render formatted chat content
 */
function renderFormattedContent(content: string): React.ReactNode {
  // Split into blocks (paragraphs, lists, code blocks)
  const blocks = content.split(/\n\n+/);
  
  return blocks.map((block, blockIdx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    
    // Code block (```)
    if (trimmed.startsWith('```')) {
      const lines = trimmed.split('\n');
      const code = lines.slice(1, -1).join('\n');
      return (
        <pre key={blockIdx} className="my-3 p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-xs font-mono">
          <code>{code || lines.slice(1).join('\n')}</code>
        </pre>
      );
    }
    
    // Bullet list
    const bulletLines = trimmed.split('\n').filter(line => 
      /^[\s]*[-•*]\s/.test(line)
    );
    if (bulletLines.length > 0 && bulletLines.length === trimmed.split('\n').filter(l => l.trim()).length) {
      return (
        <ul key={blockIdx} className="my-3 space-y-1.5 pl-1">
          {bulletLines.map((line, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-indigo-500 mt-1.5 text-xs flex-shrink-0">●</span>
              <span className="text-sm">{renderInlineFormatting(line.replace(/^[\s]*[-•*]\s*/, ''))}</span>
            </li>
          ))}
        </ul>
      );
    }
    
    // Numbered list
    const numberedLines = trimmed.split('\n').filter(line => 
      /^[\s]*\d+[\.\)]\s/.test(line)
    );
    if (numberedLines.length > 0 && numberedLines.length === trimmed.split('\n').filter(l => l.trim()).length) {
      return (
        <ol key={blockIdx} className="my-3 space-y-2 pl-1">
          {numberedLines.map((line, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center mt-0.5">
                {idx + 1}
              </span>
              <span className="text-sm flex-1">{renderInlineFormatting(line.replace(/^[\s]*\d+[\.\)]\s*/, ''))}</span>
            </li>
          ))}
        </ol>
      );
    }
    
    // Handle multi-line blocks with potential headers
    const lines = trimmed.split('\n');
    if (lines.length > 1) {
      return (
        <div key={blockIdx} className="my-3">
          {lines.map((line, idx) => {
            const trimmedLine = line.trim();
            
            // Header with ** at start and end
            if (/^\*\*[^*]+\*\*:?$/.test(trimmedLine)) {
              const headerText = trimmedLine.replace(/^\*\*/, '').replace(/\*\*:?$/, '');
              return (
                <h4 key={idx} className="font-semibold text-foreground mt-3 mb-2 text-sm flex items-center gap-2">
                  <span className="w-1 h-4 bg-indigo-500 rounded-full" />
                  {headerText}
                </h4>
              );
            }
            
            // Section header (ends with :)
            if (trimmedLine.endsWith(':') && trimmedLine.length < 60 && !trimmedLine.includes('=')) {
              return (
                <h4 key={idx} className="font-semibold text-foreground mt-3 mb-1.5 text-sm">
                  {renderInlineFormatting(trimmedLine)}
                </h4>
              );
            }
            
            // Empty line
            if (!trimmedLine) return <div key={idx} className="h-2" />;
            
            // Regular line
            return (
              <p key={idx} className="text-sm leading-relaxed mb-1">
                {renderInlineFormatting(trimmedLine)}
              </p>
            );
          })}
        </div>
      );
    }
    
    // Single line - check if it's a header
    if (/^\*\*[^*]+\*\*:?$/.test(trimmed)) {
      const headerText = trimmed.replace(/^\*\*/, '').replace(/\*\*:?$/, '');
      return (
        <h4 key={blockIdx} className="font-semibold text-foreground my-3 text-sm flex items-center gap-2">
          <span className="w-1 h-4 bg-indigo-500 rounded-full" />
          {headerText}
        </h4>
      );
    }
    
    // Regular paragraph
    return (
      <p key={blockIdx} className="my-2 text-sm leading-relaxed">
        {renderInlineFormatting(trimmed)}
      </p>
    );
  });
}

/**
 * Render inline formatting: **bold**, *italic*, `code`, math
 */
function renderInlineFormatting(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  
  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    // Italic: *text* (but not **)
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);
    // Code: `text`
    const codeMatch = remaining.match(/`([^`]+)`/);
    // Math expression: simple patterns like ax² + bx + c
    const mathMatch = remaining.match(/([a-z]²|[a-z]³|√\d+|[a-z]\^[0-9]+)/i);
    
    // Find earliest match
    const matches = [
      boldMatch ? { type: 'bold', match: boldMatch, index: remaining.indexOf(boldMatch[0]) } : null,
      italicMatch ? { type: 'italic', match: italicMatch, index: remaining.indexOf(italicMatch[0]) } : null,
      codeMatch ? { type: 'code', match: codeMatch, index: remaining.indexOf(codeMatch[0]) } : null,
    ].filter(Boolean).sort((a, b) => a!.index - b!.index);
    
    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }
    
    const first = matches[0]!;
    
    // Add text before match
    if (first.index > 0) {
      parts.push(remaining.substring(0, first.index));
    }
    
    // Add formatted element
    if (first.type === 'bold') {
      parts.push(
        <strong key={key++} className="font-semibold text-foreground">
          {first.match![1]}
        </strong>
      );
    } else if (first.type === 'italic') {
      parts.push(
        <em key={key++} className="italic">
          {first.match![1]}
        </em>
      );
    } else if (first.type === 'code') {
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono text-indigo-700 dark:text-indigo-300">
          {first.match![1]}
        </code>
      );
    }
    
    remaining = remaining.substring(first.index + first.match![0].length);
  }
  
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

export function ChatMessage({ content, role }: ChatMessageProps) {
  if (role === 'user') {
    // User messages - simple styling
    return (
      <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
    );
  }
  
  // Assistant messages - rich formatting
  return (
    <div className="chat-message-content">
      {renderFormattedContent(content)}
    </div>
  );
}

export default ChatMessage;
