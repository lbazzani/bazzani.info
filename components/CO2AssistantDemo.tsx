'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Paper,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Fade,
  Tooltip as MuiTooltip,
  Link,
  Card,
  CardContent,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import FunctionsIcon from '@mui/icons-material/Functions';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface CO2AssistantDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant' | 'function';
  content: string;
  functionCall?: {
    name: string;
    arguments: any;
  };
  chart?: {
    type: 'line' | 'bar' | 'area';
    data: any[];
    title?: string;
  };
}

const EXAMPLE_PROMPTS = [
  'Show me the top 5 CO2 emitters in 2023',
  'Compare CO2 per capita between USA, China, and India from 2000 to 2023',
  'What was the global CO2 trend from 1950 to 2023?',
  'Show me Germany\'s emission history',
];

const COLORS = ['#326CE5', '#FF6B6B', '#4ECDC4', '#FFD93D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'];

export default function CO2AssistantDemo({ isOpen, onClose }: CO2AssistantDemoProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasAutoStarted = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-start with example prompt
  useEffect(() => {
    if (isOpen && !hasAutoStarted.current && messages.length === 0) {
      hasAutoStarted.current = true;
      // Start with first example prompt after a short delay
      setTimeout(() => {
        handleSendMessage(EXAMPLE_PROMPTS[0]);
      }, 500);
    }
  }, [isOpen]);

  const parseChartFromContent = (content: string) => {
    const chartTypeMatch = content.match(/CHART:TYPE:(line|bar|area)/);
    const chartDataMatch = content.match(/CHART:DATA:(\{[\s\S]*?\}|\[[\s\S]*?\])/);
    const chartTitleMatch = content.match(/CHART:TITLE:([^\n]+)/);

    if (chartTypeMatch && chartDataMatch) {
      try {
        const chartType = chartTypeMatch[1] as 'line' | 'bar' | 'area';
        const chartData = JSON.parse(chartDataMatch[1]);
        const chartTitle = chartTitleMatch?.[1];

        // Remove chart markers from content
        const cleanContent = content
          .replace(/CHART:TYPE:(line|bar|area)\n?/, '')
          .replace(/CHART:DATA:(\{[\s\S]*?\}|\[[\s\S]*?\])\n?/, '')
          .replace(/CHART:TITLE:[^\n]+\n?/, '')
          .trim();

        return {
          chart: { type: chartType, data: chartData, title: chartTitle },
          content: cleanContent,
        };
      } catch (e) {
        console.error('Failed to parse chart data:', e);
      }
    }

    return { content, chart: undefined };
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/co2-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream');
      }

      let assistantContent = '';
      let functionCalls: any[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'function_call') {
              functionCalls.push(data);
              // Add function call message
              setMessages(prev => [
                ...prev,
                {
                  role: 'function',
                  content: `Calling function: ${data.function}`,
                  functionCall: {
                    name: data.function,
                    arguments: data.arguments,
                  },
                },
              ]);
            } else if (data.type === 'content') {
              assistantContent = data.content;
            } else if (data.type === 'done') {
              // Process final content for charts
              const { content, chart } = parseChartFromContent(assistantContent);

              setMessages(prev => [
                ...prev,
                {
                  role: 'assistant',
                  content,
                  chart,
                },
              ]);
            } else if (data.error) {
              setError(data.error);
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderChart = (chart: Message['chart']) => {
    if (!chart) return null;

    const ChartComponent =
      chart.type === 'bar' ? BarChart : chart.type === 'area' ? AreaChart : LineChart;
    const DataComponent = chart.type === 'bar' ? Bar : chart.type === 'area' ? Area : Line;

    // Determine data keys dynamically
    const dataKeys = chart.data.length > 0 ? Object.keys(chart.data[0]).filter(k => k !== 'year' && k !== 'name') : [];

    return (
      <Card sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <CardContent>
          {chart.title && (
            <Typography variant="subtitle2" sx={{ color: '#326CE5', mb: 2, fontWeight: 600 }}>
              {chart.title}
            </Typography>
          )}
          <ResponsiveContainer width="100%" height={300}>
            <ChartComponent data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="year" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  border: '1px solid #333',
                  borderRadius: '4px',
                }}
              />
              <Legend />
              {dataKeys.map((key, idx) => (
                <DataComponent
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[idx % COLORS.length]}
                  fill={COLORS[idx % COLORS.length]}
                  fillOpacity={chart.type === 'area' ? 0.6 : 1}
                  strokeWidth={2}
                />
              ))}
            </ChartComponent>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  if (!isOpen) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Top bar: Back button left, Title right */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, pb: 1 }}>
          <MuiTooltip title="Back to Home">
            <IconButton
              onClick={onClose}
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </MuiTooltip>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SmartToyIcon sx={{ color: '#326CE5', fontSize: 28 }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              CO₂ Data Assistant
            </Typography>
          </Box>
        </Box>

        {/* Disclaimer */}
        <Box sx={{ px: 2, pb: 1.5 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
            Demo published on{' '}
            <Link
              href="https://bazzani.info"
              target="_blank"
              sx={{ color: '#326CE5', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              https://bazzani.info
            </Link>
            {' '}for demonstration purposes
          </Typography>
        </Box>

        {/* Description */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', mb: 1 }}>
            AI-powered assistant that uses <strong>OpenAI Function Calling</strong> to query and visualize
            CO₂ emissions data. Ask questions in natural language, and the AI will automatically call the
            appropriate data functions and generate interactive charts.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
            {EXAMPLE_PROMPTS.map((prompt, idx) => (
              <Chip
                key={idx}
                label={prompt}
                size="small"
                onClick={() => !loading && handleSendMessage(prompt)}
                sx={{
                  bgcolor: 'rgba(50,108,229,0.1)',
                  color: '#326CE5',
                  border: '1px solid rgba(50,108,229,0.3)',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'rgba(50,108,229,0.2)',
                    borderColor: '#326CE5',
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Chat Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          {messages.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SmartToyIcon sx={{ fontSize: 64, color: 'rgba(50,108,229,0.5)', mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                Welcome to the CO₂ Data Assistant
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                Ask me anything about global CO₂ emissions from 1950 to 2023
              </Typography>
            </Box>
          )}

          {messages.map((message, idx) => (
            <Fade key={idx} in={true} timeout={300}>
              <Box
                sx={{
                  mb: 3,
                  display: 'flex',
                  flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                  gap: 2,
                }}
              >
                {/* Avatar */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: message.role === 'user' ? 'rgba(50,108,229,0.2)' : message.role === 'function' ? 'rgba(255,215,0,0.2)' : 'rgba(100,100,100,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {message.role === 'user' ? (
                    <PersonIcon sx={{ color: '#326CE5' }} />
                  ) : message.role === 'function' ? (
                    <FunctionsIcon sx={{ color: '#FFD700' }} />
                  ) : (
                    <SmartToyIcon sx={{ color: '#999' }} />
                  )}
                </Box>

                {/* Message Content */}
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: message.role === 'user' ? 'rgba(50,108,229,0.15)' : message.role === 'function' ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid',
                    borderColor: message.role === 'user' ? 'rgba(50,108,229,0.3)' : message.role === 'function' ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.1)',
                  }}
                >
                  {message.functionCall && (
                    <Box sx={{ mb: 1 }}>
                      <Chip
                        icon={<FunctionsIcon />}
                        label={message.functionCall.name}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,215,0,0.2)',
                          color: '#FFD700',
                          fontFamily: 'monospace',
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 1,
                          color: 'rgba(255,255,255,0.6)',
                          fontFamily: 'monospace',
                          fontSize: '0.7rem',
                        }}
                      >
                        {JSON.stringify(message.functionCall.arguments, null, 2)}
                      </Typography>
                    </Box>
                  )}
                  <Typography
                    sx={{
                      color: 'white',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {message.content}
                  </Typography>

                  {message.chart && renderChart(message.chart)}
                </Paper>
              </Box>
            </Fade>
          ))}

          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'rgba(100,100,100,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SmartToyIcon sx={{ color: '#999' }} />
              </Box>
              <CircularProgress size={20} sx={{ color: '#326CE5' }} />
              <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>Thinking...</Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <div ref={messagesEndRef} />
        </Box>
      </Box>

      {/* Input Box */}
      <Box
        sx={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          p: 2,
          bgcolor: 'rgba(0,0,0,0.5)',
        }}
      >
        <Box sx={{ maxWidth: 900, mx: 'auto', display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask about CO₂ emissions data..."
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.05)',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&.Mui-focused fieldset': { borderColor: '#326CE5' },
              },
            }}
          />
          <IconButton
            onClick={() => handleSendMessage()}
            disabled={loading || !input.trim()}
            sx={{
              bgcolor: '#326CE5',
              color: 'white',
              '&:hover': { bgcolor: '#2555b8' },
              '&:disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
