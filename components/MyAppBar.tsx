'use client';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import { ReactNode } from 'react';
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

            {/* Avatar Button */}
            <IconButton
              onClick={() => router.push(session ? '/profile' : '/login')}
              sx={{
                p: 0,
                border: '2px solid',
                borderColor: session ? '#4caf50' : '#e0e0e0',
                '&:hover': {
                  borderColor: session ? '#45a049' : '#999',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: session ? '#333' : '#999',
                  fontSize: '0.9rem',
                }}
              >
                {session?.user?.name?.charAt(0) || <PersonIcon fontSize="small" />}
              </Avatar>
            </IconButton>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Toolbar />
    </>
  );
}
