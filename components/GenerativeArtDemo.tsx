'use client';

import { Dialog, Box, IconButton, AppBar, Toolbar, Typography, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Import dinamico per evitare problemi SSR con p5.js
const P5Wrapper = dynamic(() => import('../app/demo/P5Wrapper'), { ssr: false });

// Import degli sketch
import { powerGame } from '../app/sketches/powerGame';
import { simpleClock } from '../app/sketches/simpleClock';
import { topNews } from '../app/sketches/topNews';
import { tecnocity } from '../app/sketches/tecnocity';
import { circleart } from '../app/sketches/circleart';
import { rectart } from '../app/sketches/rectart';

interface GenerativeArtDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

const sketches = [
  {
    title: 'Power Game',
    note: '@bazzani - gen 2022',
    sketchFunction: powerGame,
  },
  {
    title: 'Simple Clock',
    note: '@bazzani - gen 2022',
    sketchFunction: simpleClock,
  },
  {
    title: 'Top News',
    note: '@bazzani',
    sketchFunction: topNews,
  },
  {
    title: 'TecnoCity',
    note: '@bazzani',
    sketchFunction: tecnocity,
  },
  {
    title: 'CircleArt',
    note: '@bazzani',
    sketchFunction: circleart,
  },
  {
    title: 'RectangleArt',
    note: '@bazzani',
    sketchFunction: rectart,
  },
];

export default function GenerativeArtDemo({ isOpen, onClose }: GenerativeArtDemoProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [key, setKey] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentSketch = sketches[currentIndex];

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? sketches.length - 1 : prev - 1));
    setKey((prev) => prev + 1);
    // Debounce per evitare click multipli rapidi
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === sketches.length - 1 ? 0 : prev + 1));
    setKey((prev) => prev + 1);
    // Debounce per evitare click multipli rapidi
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Reset quando si apre/chiude
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setKey((prev) => prev + 1);
      setIsTransitioning(false);
    }
  }, [isOpen]);

  return (
    <Dialog
      fullScreen
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: '#0a0a0a',
        },
      }}
      TransitionProps={{
        onExited: () => {
          // Cleanup extra quando il dialog si chiude completamente
          setCurrentIndex(0);
          setKey(0);
        }
      }}
    >
      <AppBar
        elevation={0}
        sx={{
          position: 'relative',
          bgcolor: 'transparent',
          backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Button
            variant="outlined"
            onClick={handlePrev}
            disabled={isTransitioning}
            sx={{
              color: '#9B59B6',
              borderColor: 'rgba(155, 89, 182, 0.3)',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                bgcolor: 'rgba(155, 89, 182, 0.1)',
                borderColor: '#9B59B6',
              },
              '&:disabled': {
                color: 'rgba(155, 89, 182, 0.3)',
                borderColor: 'rgba(155, 89, 182, 0.1)',
              }
            }}
          >
            ← Previous
          </Button>
          <Box sx={{ textAlign: 'center', flex: 1, mx: 3 }}>
            <Typography
              variant="h5"
              sx={{
                color: '#fff',
                fontWeight: 600,
                letterSpacing: '0.5px',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}
            >
              {currentSketch.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#9B59B6',
                mt: 0.5,
                fontWeight: 500,
              }}
            >
              {currentSketch.note} • {currentIndex + 1} / {sketches.length}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={handleNext}
            disabled={isTransitioning}
            sx={{
              color: '#9B59B6',
              borderColor: 'rgba(155, 89, 182, 0.3)',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              mr: 2,
              '&:hover': {
                bgcolor: 'rgba(155, 89, 182, 0.1)',
                borderColor: '#9B59B6',
              },
              '&:disabled': {
                color: 'rgba(155, 89, 182, 0.3)',
                borderColor: 'rgba(155, 89, 182, 0.1)',
              }
            }}
          >
            Next →
          </Button>
          <IconButton
            edge="end"
            onClick={onClose}
            aria-label="close"
            sx={{
              color: '#fff',
              bgcolor: 'rgba(255,255,255,0.05)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          bgcolor: '#0a0a0a',
          position: 'relative',
          p: { xs: 2, md: 4 },
        }}
      >
        {/* Decorative corner elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            width: 40,
            height: 40,
            borderTop: '2px solid rgba(155, 89, 182, 0.3)',
            borderLeft: '2px solid rgba(155, 89, 182, 0.3)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 40,
            height: 40,
            borderTop: '2px solid rgba(155, 89, 182, 0.3)',
            borderRight: '2px solid rgba(155, 89, 182, 0.3)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 80,
            left: 20,
            width: 40,
            height: 40,
            borderBottom: '2px solid rgba(155, 89, 182, 0.3)',
            borderLeft: '2px solid rgba(155, 89, 182, 0.3)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 80,
            right: 20,
            width: 40,
            height: 40,
            borderBottom: '2px solid rgba(155, 89, 182, 0.3)',
            borderRight: '2px solid rgba(155, 89, 182, 0.3)',
            pointerEvents: 'none',
          }}
        />

        {/* Sketch container with shadow */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 0 60px rgba(155, 89, 182, 0.2)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {isOpen && <P5Wrapper key={key} sketch={currentSketch.sketchFunction} />}
        </Box>
      </Box>

      {/* Tags - Bottom bar */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1.5,
          py: 2,
          px: 3,
          bgcolor: 'rgba(0,0,0,0.9)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(155, 89, 182, 0.2)',
        }}
      >
        {['#GenerativeArt', '#CreativeCoding', '#MathArt', '#P5JS'].map((tag) => (
          <Box
            key={tag}
            sx={{
              px: 2,
              py: 0.75,
              borderRadius: '20px',
              bgcolor: 'rgba(155, 89, 182, 0.1)',
              border: '1px solid rgba(155, 89, 182, 0.3)',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'rgba(155, 89, 182, 0.2)',
                borderColor: '#9B59B6',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#9B59B6',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.5px',
              }}
            >
              {tag}
            </Typography>
          </Box>
        ))}
      </Box>
    </Dialog>
  );
}
