import { Box, Container, Typography, Card, CardContent, CardActionArea, Grid } from '@mui/material';
import Link from 'next/link';
import BrushIcon from '@mui/icons-material/Brush';

const sketches = [
  {
    id: 'powergame',
    title: 'Power Game',
    description: 'Interactive physics simulation with colliding balls. Click to add new balls and watch the power dynamics.',
    note: '@bazzani - gen 2022',
    color: '#FF6B6B',
  },
  {
    id: 'simpleclock',
    title: 'Simple Clock',
    description: 'A creative interpretation of time with animated shapes and inspirational quotes.',
    note: '@bazzani - gen 2022',
    color: '#4ECDC4',
  },
  {
    id: 'liketheworld',
    title: 'Like The World',
    description: 'A rotating 3D Earth visualization with coastlines and a pulsing heart at the center.',
    note: '@bazzani - gen 2022',
    color: '#45B7D1',
  },
  {
    id: 'tecnocity',
    title: 'TecnoCity',
    description: 'Generative cityscape with algorithmic line patterns and architectural forms.',
    note: '@bazzani',
    color: '#96CEB4',
  },
  {
    id: 'circleart',
    title: 'Circle Art',
    description: 'Organic circular patterns that evolve and grow across the canvas.',
    note: '@bazzani',
    color: '#FFEAA7',
  },
  {
    id: 'rectart',
    title: 'Rectangle Art',
    description: 'Geometric compositions using rectangular shapes and mathematical patterns.',
    note: '@bazzani',
    color: '#DFE6E9',
  },
];

export default function SketchListPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0a0a0a',
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          sx={{
            textAlign: 'center',
            mb: 6,
            pt: 4,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              mb: 2,
            }}
          >
            <BrushIcon sx={{ fontSize: 48, color: '#9B59B6' }} />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.5px',
              }}
            >
              Generative Art Gallery
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              color: '#aaa',
              fontWeight: 400,
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            A collection of creative coding experiments using p5.js
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mt: 3 }}>
            {['#GenerativeArt', '#CreativeCoding', '#MathArt', '#P5JS'].map((tag) => (
              <Box
                key={tag}
                sx={{
                  px: 2,
                  py: 0.75,
                  borderRadius: '20px',
                  bgcolor: 'rgba(155, 89, 182, 0.1)',
                  border: '1px solid rgba(155, 89, 182, 0.3)',
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
        </Box>

        {/* Sketch Grid */}
        <Grid container spacing={3}>
          {sketches.map((sketch) => (
            <Grid item xs={12} sm={6} md={4} key={sketch.id}>
              <Link href={`/s/${sketch.id}`} style={{ textDecoration: 'none' }}>
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(155, 89, 182, 0.2)',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 24px ${sketch.color}40`,
                      borderColor: sketch.color,
                      bgcolor: 'rgba(255,255,255,0.05)',
                    },
                  }}
                >
                  <CardActionArea sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      {/* Color indicator */}
                      <Box
                        sx={{
                          width: 60,
                          height: 4,
                          bgcolor: sketch.color,
                          borderRadius: 1,
                          mb: 2,
                        }}
                      />

                      {/* Title */}
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 600,
                          color: '#fff',
                          mb: 1,
                        }}
                      >
                        {sketch.title}
                      </Typography>

                      {/* Note */}
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#9B59B6',
                          fontWeight: 500,
                          display: 'block',
                          mb: 2,
                        }}
                      >
                        {sketch.note}
                      </Typography>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#aaa',
                          lineHeight: 1.6,
                        }}
                      >
                        {sketch.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>

        {/* Footer */}
        <Box
          sx={{
            textAlign: 'center',
            mt: 8,
            pb: 4,
          }}
        >
          <Typography variant="body2" sx={{ color: '#666' }}>
            Click on any sketch to explore it in full screen
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
