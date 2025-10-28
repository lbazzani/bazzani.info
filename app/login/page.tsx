'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Paper, TextField, Button, Typography } from '@mui/material';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#fafafa',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontFamily: 'monospace',
            color: '#333',
            textAlign: 'center',
          }}
        >
          admin.login()
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                borderRadius: '2px',
              },
            }}
          />

          <TextField
            fullWidth
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                borderRadius: '2px',
              },
            }}
          />

          {error && (
            <Typography
              variant="body2"
              sx={{
                color: 'error.main',
                mb: 2,
                fontFamily: 'monospace',
                fontSize: '0.8rem',
              }}
            >
              {error}
            </Typography>
          )}

          <Button
            fullWidth
            type="submit"
            disabled={loading}
            sx={{
              bgcolor: '#333',
              color: 'white',
              borderRadius: '2px',
              fontFamily: 'monospace',
              py: 1.2,
              '&:hover': {
                bgcolor: '#555',
              },
              '&:disabled': {
                bgcolor: '#ccc',
              },
            }}
          >
            {loading ? 'Authenticating...' : 'Login'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
