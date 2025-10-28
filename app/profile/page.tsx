'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Box, Paper, Typography, Button, Avatar } from '@mui/material';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#666' }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#fafafa',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 500,
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mb: 2,
              bgcolor: '#333',
              fontFamily: 'monospace',
              fontSize: '2rem',
            }}
          >
            {session.user?.name?.charAt(0) || 'L'}
          </Avatar>

          <Typography
            variant="h5"
            sx={{
              fontFamily: 'monospace',
              color: '#333',
              mb: 0.5,
            }}
          >
            {session.user?.name}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              color: '#666',
              fontSize: '0.85rem',
            }}
          >
            {session.user?.email}
          </Typography>
        </Box>

        <Box sx={{ borderTop: '1px solid #e0e0e0', pt: 3 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 2,
              fontFamily: 'monospace',
              color: '#666',
              fontSize: '0.75rem',
            }}
          >
            SESSION INFO
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: '#333',
                mb: 0.5,
              }}
            >
              user.id: <Box component="span" sx={{ color: '#666' }}>{session.user?.id}</Box>
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: '#333',
              }}
            >
              auth.status: <Box component="span" sx={{ color: '#4caf50' }}>authenticated</Box>
            </Typography>
          </Box>

          <Button
            fullWidth
            onClick={handleLogout}
            sx={{
              bgcolor: '#333',
              color: 'white',
              borderRadius: '2px',
              fontFamily: 'monospace',
              py: 1.2,
              '&:hover': {
                bgcolor: '#d32f2f',
              },
            }}
          >
            Logout
          </Button>

          <Button
            fullWidth
            onClick={() => router.push('/')}
            sx={{
              mt: 1,
              color: '#666',
              borderRadius: '2px',
              fontFamily: 'monospace',
              border: '1px solid #e0e0e0',
              py: 1,
              '&:hover': {
                bgcolor: '#f5f5f5',
              },
            }}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
