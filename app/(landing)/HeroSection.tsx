'use client';

import { useState, useEffect } from 'react';
import { Typography, Paper } from '@mui/material';
import ReactMarkdown from 'react-markdown';

export default function HeroSection() {
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
        padding: { xs: 2, sm: 3, md: 3 },
        borderRadius: '12px',
        background: '#ffffff',
        border: '1px solid',
        borderColor: '#e8e8e8',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        mb: 3,
      }}
    >
      <Typography
        variant="body2"
        component="div"
        sx={{
          lineHeight: 1.7,
          color: 'text.secondary',
          fontSize: '0.95rem',
          '& p': {
            marginBottom: 1.5,
          },
          '& strong': {
            color: 'text.primary',
            fontWeight: 600,
          }
        }}
      >
        <ReactMarkdown>{mainDescription}</ReactMarkdown>
      </Typography>
    </Paper>
  );
}
