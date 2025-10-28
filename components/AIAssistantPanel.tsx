'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import TerminalIcon from '@mui/icons-material/Terminal';

interface TerminalMessage {
  text: string;
  type: 'system' | 'user' | 'assistant' | 'invitation';
}

export default function AIAssistantPanel() {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamProgress, setStreamProgress] = useState(0);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [thinkingLines, setThinkingLines] = useState<string[]>([]);
  const [showCursor, setShowCursor] = useState(true);
  const [isInteractive, setIsInteractive] = useState(false);
  const [invitationMessage, setInvitationMessage] = useState(0);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Invitation messages that rotate
  const invitationMessages = [
    "💡 I'm Lorenzo's AI Avatar - Ask me about his 20+ years of tech experience!",
    "🚀 Want to know about cloud architecture, AI projects, or team leadership? Just ask!",
    "💬 Type your question and Lorenzo's AI will respond as if he's here himself!",
    "🎯 Curious about specific skills? Try: 'What's your experience with AWS?' or 'Tell me about your AI work'",
    "🔍 I have full access to Lorenzo's professional background - ask me anything!",
    "⚡ Need to know if Lorenzo is available for consulting? Just ask!",
    "🧠 I'm trained on Lorenzo's profile - chat with me to learn about his expertise!",
  ];

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinkingLines]);

  // Rotate invitation messages (both in animation and interactive mode, until user sends first message)
  useEffect(() => {
    if (hasUserSentMessage) return;

    const rotateInterval = setInterval(() => {
      setInvitationMessage(prev => (prev + 1) % invitationMessages.length);
    }, 4000);

    return () => clearInterval(rotateInterval);
  }, [hasUserSentMessage, invitationMessages.length]);

  // Terminal typing effect
  useEffect(() => {
    const commands = [
      { cmd: '$ whoami', output: 'lorenzo-bazzani' },
      { cmd: '$ pwd', output: '/home/lorenzo/ai-avatar' },
      { cmd: '$ cat experience.txt', output: '20+ years in tech leadership' },
      { cmd: '$ ls skills/', output: 'cloud-architecture  generative-ai  team-leadership' },
      { cmd: '$ cat skills/cloud-architecture', output: 'AWS, Azure, GCP - Enterprise scale' },
      { cmd: '$ cat skills/generative-ai', output: 'LLMs, RAG, Prompt Engineering' },
      { cmd: '$ status --availability', output: 'Available for consulting projects' },
      { cmd: '$ git log --oneline | head -3', output: 'a3f2c1e Led AI transformation at Xpylon\nb5d8e9a Built cloud infrastructure for Capgemini\nc7a4f2d Managed 50+ person engineering teams' },
      { cmd: '$ curl -s localhost:3000/bio', output: 'Lorenzo Bazzani - Cloud & AI Consultant' },
      { cmd: '$ echo "Ready to help!"', output: 'Ready to help! Ask me anything about my experience.' },
    ];

    let currentCommandIndex = 0;
    let allLines: string[] = [];
    let isTypingCommand = true;
    let charIndex = 0;
    let currentLine = '';

    const typeInterval = setInterval(() => {
      if (currentCommandIndex >= commands.length) {
        clearInterval(typeInterval);
        animationIntervalRef.current = null;
        // Don't set interactive mode or add invitation message automatically
        // User must click to activate interactive mode
        return;
      }

      const currentCommand = commands[currentCommandIndex];
      const targetText = isTypingCommand ? currentCommand.cmd : currentCommand.output;

      if (charIndex < targetText.length) {
        currentLine += targetText[charIndex];
        charIndex++;
        const displayLines = [...allLines, currentLine];
        setTerminalLines(displayLines);
      } else {
        if (isTypingCommand) {
          allLines.push(currentLine);
          currentLine = '';
          isTypingCommand = false;
          charIndex = 0;
        } else {
          allLines.push(currentLine);
          allLines.push('');
          currentLine = '';
          currentCommandIndex++;
          isTypingCommand = true;
          charIndex = 0;
          setTerminalLines([...allLines]);
        }
      }
    }, 40);

    // Save reference to animation interval
    animationIntervalRef.current = typeInterval;

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(typeInterval);
      clearInterval(cursorInterval);
      animationIntervalRef.current = null;
    };
  }, []);

  // Thinking animation during API call
  useEffect(() => {
    if (!isStreaming) {
      setThinkingLines([]);
      return;
    }

    const thinkingMessages = [
      '[lorenzo-brain] Analyzing query...',
      '[lorenzo-brain] Accessing memory banks...',
      '[lorenzo-brain] Processing experience database...',
      '[lorenzo-brain] Consulting skill matrix...',
      '[lorenzo-brain] Formulating response...',
      '[lorenzo-brain] Verifying accuracy...',
    ];

    let messageIndex = 0;
    const thinkingInterval = setInterval(() => {
      setThinkingLines([thinkingMessages[messageIndex % thinkingMessages.length]]);
      messageIndex++;
    }, 800);

    return () => clearInterval(thinkingInterval);
  }, [isStreaming]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    // Mark that user has sent their first message (to hide invitation)
    setHasUserSentMessage(true);

    // Stop animation if still running
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }

    // Activate interactive mode if not already active
    if (!isInteractive) {
      setIsInteractive(true);
    }

    const currentInput = input;
    setMessages(prev => [...prev, { text: `$ ${currentInput}`, type: 'user' }]);
    setInput('');
    setIsStreaming(true);
    setStreamProgress(0);

    const progressInterval = setInterval(() => {
      setStreamProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setStreamProgress(100);
      setMessages(prev => [...prev, { text: data.message, type: 'assistant' }]);

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error:', error);
        setMessages(prev => [...prev, { text: 'Error: Failed to get response', type: 'system' }]);
      }
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsStreaming(false);
        setStreamProgress(0);
      }, 500);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isStreaming) {
      handleSend();
    }
  };

  const handleClick = () => {
    if (!isInteractive) {
      setIsInteractive(true);
      // Add first invitation message immediately when clicked
      setInvitationMessage(0);
    }
    // Always focus on input when clicking anywhere in the component
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
        background: '#ffffff',
        mb: 3,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          p: 1.5,
          bgcolor: '#1a1a1a',
          cursor: !isInteractive ? 'pointer' : 'default',
          minHeight: '110px',
        }}
        onClick={handleClick}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <TerminalIcon sx={{ color: '#4caf50', fontSize: 16 }} />
          <Box component="span" sx={{ color: '#4caf50', fontSize: '0.7rem', fontFamily: 'monospace' }}>
            lorenzo@ai-avatar:~
          </Box>
        </Box>

        {!isInteractive ? (
          // Animation mode - 3 lines fixed + invitation + input
          <Box>
            <Box sx={{ height: '3.6em', overflow: 'hidden', mb: 1 }}>
              <Box
                component="pre"
                sx={{
                  color: '#e0e0e0',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  lineHeight: 1.2,
                  m: 0,
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                }}
              >
                {terminalLines.slice(-3).join('\n')}
                {showCursor && <Box component="span" sx={{ color: '#4caf50' }}>▊</Box>}
              </Box>
            </Box>

            {/* Dynamic invitation message in animation mode */}
            {!hasUserSentMessage && (
              <Box
                sx={{
                  color: '#ffeb3b',
                  fontSize: '0.7rem',
                  fontFamily: 'monospace',
                  mb: 1,
                  mt: 1,
                  fontStyle: 'italic',
                  borderTop: '1px solid #333',
                  pt: 1,
                  animation: 'fadeIn 0.5s ease-in',
                  '@keyframes fadeIn': {
                    from: { opacity: 0 },
                    to: { opacity: 1 },
                  },
                }}
              >
                {invitationMessages[invitationMessage]}
              </Box>
            )}

            {/* Input line in animation mode */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                component="span"
                sx={{
                  color: '#4caf50',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                }}
              >
                $
              </Box>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#e0e0e0',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  padding: '4px 0',
                }}
                placeholder="Type your question here..."
              />
            </Box>
          </Box>
        ) : (
          // Interactive mode - scrollable, fixed container height
          <Box>
            <Box
              ref={scrollRef}
              sx={{
                height: '350px',
                overflowY: 'auto',
                overflowX: 'hidden',
                mb: 1,
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#2a2a2a',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#4caf50',
                  borderRadius: '4px',
                },
              }}
            >
              {messages.map((msg, index) => {
                // Style configuration based on message type
                const getMessageStyle = () => {
                  switch (msg.type) {
                    case 'user':
                      return {
                        color: '#4caf50',
                        bgcolor: 'transparent',
                        borderLeft: 'none',
                        pl: 0,
                      };
                    case 'assistant':
                      return {
                        color: '#e0e0e0',
                        bgcolor: 'rgba(76, 175, 80, 0.1)',
                        borderLeft: '3px solid #4caf50',
                        pl: 1.5,
                        py: 0.5,
                        my: 0.5,
                      };
                    case 'invitation':
                      return {
                        color: '#ffeb3b',
                        bgcolor: 'transparent',
                        borderLeft: 'none',
                        pl: 0,
                      };
                    case 'system':
                      return {
                        color: '#ff5252',
                        bgcolor: 'transparent',
                        borderLeft: 'none',
                        pl: 0,
                      };
                    default:
                      return {
                        color: '#e0e0e0',
                        bgcolor: 'transparent',
                        borderLeft: 'none',
                        pl: 0,
                      };
                  }
                };

                const style = getMessageStyle();

                return (
                  <Box
                    key={index}
                    component="pre"
                    sx={{
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      lineHeight: 1.4,
                      mb: msg.type === 'assistant' ? 0.8 : 0.3,
                      m: 0,
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      ...style,
                    }}
                  >
                    {msg.text}
                  </Box>
                );
              })}

              {/* Thinking animation */}
              {isStreaming && thinkingLines.map((line, index) => (
                <Box
                  key={`thinking-${index}`}
                  component="pre"
                  sx={{
                    color: '#ffa726',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    lineHeight: 1.4,
                    mb: 0.3,
                    m: 0,
                    fontStyle: 'italic',
                  }}
                >
                  {line}
                </Box>
              ))}
            </Box>

            {/* Dynamic invitation message in interactive mode */}
            {!hasUserSentMessage && (
              <Box
                sx={{
                  color: '#ffeb3b',
                  fontSize: '0.7rem',
                  fontFamily: 'monospace',
                  mb: 1,
                  mt: 1,
                  fontStyle: 'italic',
                  borderTop: '1px solid #333',
                  pt: 1,
                  animation: 'fadeIn 0.5s ease-in',
                  '@keyframes fadeIn': {
                    from: { opacity: 0 },
                    to: { opacity: 1 },
                  },
                }}
              >
                {invitationMessages[invitationMessage]}
              </Box>
            )}

            {/* Input line */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                component="span"
                sx={{
                  color: '#4caf50',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                }}
              >
                $
              </Box>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
                autoFocus
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#e0e0e0',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  padding: 0,
                }}
                placeholder={isStreaming ? 'Processing...' : 'type your question...'}
              />
              {showCursor && !input && !isStreaming && (
                <Box component="span" sx={{ color: '#4caf50', fontSize: '0.75rem', fontFamily: 'monospace' }}>▊</Box>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Progress bar */}
      {isStreaming && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            bgcolor: '#1a1a1a',
            zIndex: 9999,
            borderTop: '1px solid #333',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${streamProgress}%`,
              bgcolor: '#4caf50',
              transition: 'width 0.2s ease',
              boxShadow: '0 0 10px rgba(76, 175, 80, 0.5)',
            }}
          />
          <Box
            component="span"
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#4caf50',
              fontSize: '0.7rem',
              fontFamily: 'monospace',
              fontWeight: 600,
            }}
          >
            {Math.round(streamProgress)}%
          </Box>
        </Box>
      )}
    </Paper>
  );
}
