'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function IntroSection() {
  const [mainDescription, setMainDescription] = useState("");

  useEffect(() => {
    fetch('/markdown/mainDescription.md')
      .then(response => response.text())
      .then(data => setMainDescription(data))
      .catch(error => console.error('Error loading description:', error));
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        padding: { xs: 2.5, sm: 3, md: 3.5 },
        borderRadius: '16px',
        background: 'linear-gradient(145deg, #ffffff 0%, #fef9f5 40%, #fef0e6 100%)',
        border: '2px solid',
        borderColor: '#ffe0cc',
        boxShadow: '0 8px 32px rgba(211, 84, 0, 0.10)',
        mb: 3,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #d35400 0%, #e67e22 40%, #f39c12 70%, #f1c40f 100%)',
        }
      }}
    >
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 15,
          right: 15,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(211, 84, 0, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -15,
          left: -15,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(230, 126, 34, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Typography
        variant="body1"
        component="div"
        sx={{
          position: 'relative',
          zIndex: 1,
          lineHeight: 1.6,
          color: 'text.primary',
          fontSize: { xs: '0.9rem', sm: '0.95rem' },
          '& p': {
            marginBottom: 1.2,
          },
          '& strong': {
            color: '#d35400',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #d35400 0%, #e67e22 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          },
          '& p:first-of-type': {
            fontSize: { xs: '1rem', sm: '1.05rem' },
            fontWeight: 500,
            color: '#2c3e50',
          }
        }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{mainDescription}</ReactMarkdown>
      </Typography>
    </Paper>
  );
}
