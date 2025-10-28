'use client';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { ReactNode } from 'react';

interface HideOnScrollProps {
  children: ReactNode;
  window?: () => Window;
}

function HideOnScroll({ children, window }: HideOnScrollProps) {
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children as React.ReactElement}
    </Slide>
  );
}

interface MyAppBarProps {
  window?: () => Window;
}

export default function MyAppBar(props: MyAppBarProps) {
  return (
    <>
      <HideOnScroll {...props}>
        <AppBar
          color="inherit"
          position="fixed"
          elevation={0}
          sx={{
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar sx={{ py: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #d35400 0%, #e67e22 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: 'white',
                  fontSize: '1.1rem',
                  boxShadow: '0 2px 8px rgba(211, 84, 0, 0.2)',
                }}
              >
                LB
              </Box>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  color: '#2c3e50',
                  display: { xs: 'none', sm: 'block' },
                  ml: 1,
                }}
              >
                Lorenzo Bazzani
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Button
              href="https://it.linkedin.com/in/lorenzo-bazzani"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<LinkedInIcon />}
              variant="outlined"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': {
                  borderColor: '#0077b5',
                  backgroundColor: 'rgba(0, 119, 181, 0.04)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 119, 181, 0.15)',
                },
                transition: 'all 0.2s ease',
                display: { xs: 'none', sm: 'flex' },
              }}
            >
              LinkedIn
            </Button>

            <Button
              href="https://it.linkedin.com/in/lorenzo-bazzani"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                minWidth: 'auto',
                p: 1,
                display: { xs: 'flex', sm: 'none' },
                borderRadius: 2,
                color: '#0077b5',
              }}
            >
              <LinkedInIcon />
            </Button>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Toolbar />
    </>
  );
}
