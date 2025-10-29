'use client';

import { Box, IconButton, AppBar, Toolbar, Typography, Button, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const P5Wrapper = dynamic(() => import('../app/demo/P5Wrapper'), { ssr: false });

interface SingleSketchViewerProps {
  title: string;
  note: string;
  sketchName: string;
}

export default function SingleSketchViewer({ title, note, sketchName }: SingleSketchViewerProps) {
  const router = useRouter();
  const [sketchFunction, setSketchFunction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carica dinamicamente lo sketch solo lato client
    const loadSketch = async () => {
      try {
        const module = await import(`../app/sketches/${sketchName}`);
        setSketchFunction(() => module[sketchName]);
      } catch (error) {
        console.error('Error loading sketch:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSketch();
  }, [sketchName]);

  return (
    <>
      {/* Overlay full-screen per coprire tutto il layout dell'app */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          bgcolor: '#000',
          zIndex: 9999, // Sopra tutto
          overflow: 'hidden',
        }}
      >
        {/* Barra top dedicata */}
        <AppBar
          elevation={0}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bgcolor: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(155, 89, 182, 0.2)',
          }}
        >
        <Toolbar sx={{ gap: 3, py: 1.5 }}>
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/s')}
            sx={{
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              px: 2,
              '&:hover': {
                bgcolor: 'rgba(155, 89, 182, 0.1)',
                color: '#9B59B6',
              },
            }}
          >
            Gallery
          </Button>
          <Box
            sx={{
              width: '1px',
              height: '24px',
              bgcolor: 'rgba(155, 89, 182, 0.3)',
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color: '#fff',
              fontWeight: 600,
              fontSize: '1.1rem',
            }}
          >
            {title}
          </Typography>
        </Toolbar>
      </AppBar>

        {/* Canvas area */}
        <Box
          sx={{
            position: 'absolute',
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: 'calc(100vh - 64px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <CircularProgress sx={{ color: '#9B59B6', size: 60 }} />
          ) : sketchFunction ? (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                '& > div': {
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                '& canvas': {
                  display: 'block',
                },
              }}
            >
              <P5Wrapper sketch={sketchFunction} />
            </Box>
          ) : (
            <Typography sx={{ color: '#fff', fontSize: '1.2rem' }}>Error loading sketch</Typography>
          )}
        </Box>
      </Box>
    </>
  );
}
