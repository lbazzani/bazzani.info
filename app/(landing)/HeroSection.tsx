'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CardMedia } from '@mui/material';
import ReactMarkdown from 'react-markdown';

export default function HeroSection() {
  const [mainDescription, setMainDescription] = useState("");

  useEffect(() => {
    fetch('/markdown/mainDescription.md')
      .then(response => response.text())
      .then(data => setMainDescription(data))
      .catch(error => console.error('Error loading description:', error));
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        padding: { xs: 3, sm: 4, md: 5 },
        borderRadius: '16px',
        background: '#ffffff',
        border: '1px solid',
        borderColor: '#e8e8e8',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
      }}
    >
      <Grid container spacing={4} alignItems="center" justifyContent="center">
        <Grid
          item
          xs={12}
          sm={5}
          md={3}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Box
            sx={{
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -10,
                left: -10,
                right: 10,
                bottom: 10,
                background: 'linear-gradient(135deg, #d35400 0%, #e67e22 100%)',
                borderRadius: '16px',
                zIndex: 0,
              },
            }}
          >
            <CardMedia
              component="img"
              image="/img/foto.jpeg"
              alt="Lorenzo Bazzani"
              sx={{
                maxHeight: 260,
                maxWidth: 260,
                borderRadius: '16px',
                objectFit: "cover",
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                border: '4px solid white',
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={7} md={9}>
          <Typography
            variant="body1"
            component="div"
            sx={{
              textAlign: 'justify',
              lineHeight: 1.8,
              color: 'text.secondary',
              '& p': {
                marginBottom: 2,
              },
              '& strong': {
                color: 'text.primary',
                fontWeight: 600,
              }
            }}
          >
            <ReactMarkdown>{mainDescription}</ReactMarkdown>
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
