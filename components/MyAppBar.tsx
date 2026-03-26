'use client';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import { ReactNode, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
  const { data: session } = useSession();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <HideOnScroll {...props}>
        <AppBar
          color="inherit"
          position="fixed"
          elevation={0}
          sx={{
            display: { xs: 'none', md: 'flex' },
            backdropFilter: 'blur(20px) saturate(180%)',
            backgroundColor: scrolled
              ? 'rgba(255, 255, 255, 0.85)'
              : 'rgba(255, 255, 255, 0.95)',
            borderBottom: '1px solid',
            borderColor: scrolled
              ? 'rgba(211, 84, 0, 0.12)'
              : 'rgba(0, 0, 0, 0.06)',
            boxShadow: scrolled
              ? '0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(211, 84, 0, 0.04)'
              : 'none',
            transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #d35400, #e67e22, transparent)',
              opacity: scrolled ? 0.6 : 0,
              transition: 'opacity 0.4s ease',
            },
          }}
        >
          <Toolbar
            sx={{
              py: scrolled ? 0.5 : 1,
              transition: 'padding 0.3s ease',
              maxWidth: '1400px',
              mx: 'auto',
              width: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                '&:hover .logo-box': {
                  transform: 'rotate(-3deg) scale(1.05)',
                  boxShadow: '0 4px 16px rgba(211, 84, 0, 0.35)',
                },
                '&:hover .logo-text': {
                  backgroundSize: '100% 2px',
                },
              }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <Box
                className="logo-box"
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #d35400 0%, #e67e22 50%, #f39c12 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  color: 'white',
                  fontSize: '1rem',
                  fontFamily: '"Inter", sans-serif',
                  letterSpacing: '-0.5px',
                  boxShadow: '0 2px 12px rgba(211, 84, 0, 0.25)',
                  transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    animation: 'shimmer 3s ease-in-out infinite',
                  },
                  '@keyframes shimmer': {
                    '0%': { left: '-100%' },
                    '100%': { left: '200%' },
                  },
                }}
              >
                LB
              </Box>

              <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column' }}>
                <Typography
                  className="logo-text"
                  variant="h6"
                  component="div"
                  sx={{
                    fontWeight: 700,
                    color: '#2c3e50',
                    fontSize: '1.05rem',
                    letterSpacing: '-0.3px',
                    lineHeight: 1.2,
                    backgroundImage: 'linear-gradient(#d35400, #d35400)',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'bottom left',
                    backgroundSize: '0% 2px',
                    transition: 'background-size 0.3s ease',
                    pb: 0.2,
                  }}
                >
                  Lorenzo Bazzani
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#7f8c8d',
                    fontSize: '0.68rem',
                    letterSpacing: '0.5px',
                    fontWeight: 500,
                    opacity: scrolled ? 0 : 1,
                    maxHeight: scrolled ? 0 : '20px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                  }}
                >
                  Cloud & AI Consultant
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Avatar Button */}
            <IconButton
              onClick={() => router.push(session ? '/profile' : '/login')}
              sx={{
                p: 0,
                border: '2px solid',
                borderColor: session ? '#4caf50' : 'rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  borderColor: session ? '#45a049' : '#d35400',
                  transform: 'scale(1.08)',
                  boxShadow: session
                    ? '0 0 0 3px rgba(76, 175, 80, 0.15)'
                    : '0 0 0 3px rgba(211, 84, 0, 0.1)',
                },
                transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: session ? '#2c3e50' : '#bdc3c7',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                {session?.user?.name?.charAt(0) || <PersonIcon fontSize="small" />}
              </Avatar>
            </IconButton>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Toolbar sx={{ display: { xs: 'none', md: 'block' } }} />
    </>
  );
}
