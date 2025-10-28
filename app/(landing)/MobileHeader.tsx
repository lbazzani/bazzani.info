'use client';

import { Box, Paper, Typography, Avatar, Chip } from '@mui/material';

export default function MobileHeader() {
  return (
    <Paper
      elevation={0}
      sx={{
        display: { xs: 'block', md: 'none' },
        p: 2.5,
        borderRadius: '12px',
        border: '1px solid',
        borderColor: '#e8e8e8',
        backgroundColor: '#ffffff',
        mb: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src="/img/foto.jpeg"
          alt="Lorenzo Bazzani"
          sx={{
            width: 80,
            height: 80,
            border: '3px solid',
            borderColor: '#d35400',
            boxShadow: '0 3px 10px rgba(211, 84, 0, 0.2)',
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#2c3e50',
              mb: 0.5,
              fontSize: '1.2rem',
            }}
          >
            Lorenzo Bazzani
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              mb: 1,
            }}
          >
            Cloud & AI Consultant
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Chip
              label="Management"
              size="small"
              sx={{
                bgcolor: '#fff5f0',
                color: '#d35400',
                fontSize: '0.65rem',
                height: '20px',
              }}
            />
            <Chip
              label="Tech"
              size="small"
              sx={{
                bgcolor: '#f0f5ff',
                color: '#2c5aa0',
                fontSize: '0.65rem',
                height: '20px',
              }}
            />
            <Chip
              label="AI"
              size="small"
              sx={{
                bgcolor: '#f0fff5',
                color: '#16a085',
                fontSize: '0.65rem',
                height: '20px',
              }}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
