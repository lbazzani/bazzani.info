'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, Paper, IconButton, TextField, Typography, CircularProgress, Collapse } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m Lorenzo\'s AI assistant. Ask me anything about his experience, skills, or projects.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.message };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 80,
          right: 20,
          zIndex: 1200,
        }}
      >
        <IconButton
          onClick={() => setIsOpen(true)}
          sx={{
            width: 56,
            height: 56,
            background: 'linear-gradient(135deg, #d35400 0%, #e67e22 100%)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(211, 84, 0, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #e67e22 0%, #f39c12 100%)',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <SmartToyIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </Box>
    );
  }

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        top: 80,
        right: 20,
        width: isExpanded ? 450 : 380,
        maxHeight: isExpanded ? 600 : 400,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1200,
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: '2px solid',
        borderColor: '#ffe8db',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #d35400 0%, #e67e22 100%)',
          color: 'white',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SmartToyIcon sx={{ fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.2 }}>
              AI Assistant
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
              Ask me about Lorenzo
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{ color: 'white' }}
          >
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setIsOpen(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          bgcolor: '#fafafa',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                bgcolor: msg.role === 'user' ? '#d35400' : 'white',
                color: msg.role === 'user' ? 'white' : 'text.primary',
                borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                border: msg.role === 'assistant' ? '1px solid #e0e0e0' : 'none',
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                {msg.content}
              </Typography>
            </Paper>
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ alignSelf: 'flex-start', display: 'flex', gap: 1, alignItems: 'center' }}>
            <CircularProgress size={16} sx={{ color: '#d35400' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Thinking...
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'white',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ask about experience, skills, projects..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                fontSize: '0.875rem',
              }
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            sx={{
              bgcolor: '#d35400',
              color: 'white',
              '&:hover': {
                bgcolor: '#e67e22',
              },
              '&:disabled': {
                bgcolor: '#e0e0e0',
              },
            }}
          >
            <SendIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}
