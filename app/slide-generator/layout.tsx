import React from 'react';
import Box from '@mui/material/Box';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Slide Generator - Lorenzo Bazzani',
  description: 'Create professional diagrams and export them as PowerPoint presentations',
};

interface SlideGeneratorLayoutProps {
  children: React.ReactNode;
}

export default function SlideGeneratorLayout({ children }: SlideGeneratorLayoutProps) {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: { xs: '56px', sm: '64px' }, // AppBar height (56px mobile, 64px desktop)
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        bgcolor: 'white',
        p: 0,
        m: 0,
      }}
    >
      {children}
    </Box>
  );
}
