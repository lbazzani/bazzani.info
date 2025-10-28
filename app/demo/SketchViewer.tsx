'use client';

import React, { useState, useEffect } from 'react';
import P5Wrapper from './P5Wrapper';
import { Box, Button, Typography, AppBar, Toolbar, Container } from '@mui/material';

interface Sketch {
  title: string;
  note: string;
  sketchFunction: any;
}

interface SketchViewerProps {
  sketches: Sketch[];
}

export default function SketchViewer({ sketches }: SketchViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [key, setKey] = useState(0);

  const currentSketch = sketches[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? sketches.length - 1 : prev - 1));
    setKey((prev) => prev + 1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === sketches.length - 1 ? 0 : prev + 1));
    setKey((prev) => prev + 1);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#000' }}>
      <AppBar position="static" sx={{ bgcolor: '#1a1a1a' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Button
            variant="text"
            onClick={handlePrev}
            sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            &lt;&lt; Prev
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#fff' }}>
              {currentSketch.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#aaa' }}>
              {currentSketch.note}
            </Typography>
          </Box>
          <Button
            variant="text"
            onClick={handleNext}
            sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            Next &gt;&gt;
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        <P5Wrapper key={key} sketch={currentSketch.sketchFunction} />
      </Box>

      <Box sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap',
        maxWidth: '400px'
      }}>
        {['#GenerativeArt', '#CreativeCoding', '#MathArt', '#P5JS'].map((tag) => (
          <Typography
            key={tag}
            variant="caption"
            sx={{
              bgcolor: 'rgba(255,255,255,0.1)',
              color: '#fff',
              px: 1,
              py: 0.5,
              borderRadius: 1
            }}
          >
            {tag}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}
