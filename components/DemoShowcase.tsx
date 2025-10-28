'use client';

import { Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PublicIcon from '@mui/icons-material/Public';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface DemoShowcaseProps {
  onDemoOpen: (demoId: string) => void;
}

const DEMOS = [
  {
    id: 'k8s-architecture',
    title: 'Kubernetes Architecture Builder',
    description: 'Interactive drag-and-drop tool for designing enterprise web application architectures. Build complex K8s infrastructures with official components.',
    icon: <AccountTreeIcon sx={{ fontSize: 48, color: '#326CE5' }} />,
    features: ['Drag & Drop', 'Official K8s Icons', 'Real-time Connections', 'Export Ready'],
    isNew: true,
    gradient: 'linear-gradient(135deg, rgba(50,108,229,0.1) 0%, rgba(50,108,229,0.05) 100%)',
    borderColor: '#326CE5',
  },
  {
    id: 'co2-data',
    title: 'Global CO₂ Emissions Explorer',
    description: 'Analyze 70+ years of global CO₂ emissions with interactive charts, animations, and multi-metric comparisons. Data from 1950 to 2023.',
    icon: <PublicIcon sx={{ fontSize: 48, color: '#4ECDC4' }} />,
    features: ['Animated Timeline', 'Multi-Metric Analysis', 'Country Drill-down', 'Normalized Scales'],
    isNew: true,
    gradient: 'linear-gradient(135deg, rgba(78,205,196,0.1) 0%, rgba(78,205,196,0.05) 100%)',
    borderColor: '#4ECDC4',
  },
  // {
  //   id: 'co2-assistant',
  //   title: 'CO₂ Data Assistant (AI)',
  //   description: 'AI-powered assistant using OpenAI Function Calling to query CO₂ data through natural language. Ask questions and get instant visualizations.',
  //   icon: <SmartToyIcon sx={{ fontSize: 48, color: '#FFD93D' }} />,
  //   features: ['Function Calling', 'Natural Language', 'Auto Visualization', 'Real-time Charts'],
  //   isNew: true,
  //   gradient: 'linear-gradient(135deg, rgba(255,217,61,0.1) 0%, rgba(255,217,61,0.05) 100%)',
  //   borderColor: '#FFD93D',
  // },
];

export default function DemoShowcase({ onDemoOpen }: DemoShowcaseProps) {
  return (
    <Box
      sx={{
        mt: 6,
        mb: 4,
      }}
    >
      {/* Section Header */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 4,
            height: 40,
            borderRadius: 1,
            background: 'linear-gradient(135deg, #326CE5 0%, #4ECDC4 100%)',
          }}
        />
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: '#2c3e50',
              letterSpacing: '-0.5px',
            }}
          >
            Interactive Demos
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Explore my latest interactive projects and technical demonstrations
          </Typography>
        </Box>
      </Box>

      {/* Demo Cards Grid */}
      <Grid container spacing={3}>
        {DEMOS.map((demo) => (
          <Grid item xs={12} md={6} key={demo.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: `2px solid ${demo.borderColor}20`,
                borderRadius: '16px',
                background: demo.gradient,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'visible',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 12px 24px ${demo.borderColor}40`,
                  border: `2px solid ${demo.borderColor}`,
                },
              }}
            >
              {/* NEW Badge */}
              {demo.isNew && (
                <Chip
                  icon={<NewReleasesIcon />}
                  label="NEW"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: '#FF6B6B',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    height: 28,
                    zIndex: 1,
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%': { boxShadow: `0 0 0 0 ${demo.borderColor}40` },
                      '50%': { boxShadow: `0 0 0 10px ${demo.borderColor}00` },
                      '100%': { boxShadow: `0 0 0 0 ${demo.borderColor}00` },
                    },
                  }}
                />
              )}

              <CardContent sx={{ flexGrow: 1, pt: 3, pb: 2 }}>
                {/* Icon */}
                <Box sx={{ mb: 2 }}>{demo.icon}</Box>

                {/* Title */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#2c3e50',
                    mb: 1.5,
                    fontSize: '1.25rem',
                  }}
                >
                  {demo.title}
                </Typography>

                {/* Description */}
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    mb: 2,
                    lineHeight: 1.6,
                  }}
                >
                  {demo.description}
                </Typography>

                {/* Features */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {demo.features.map((feature) => (
                    <Chip
                      key={feature}
                      label={feature}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.7)',
                        color: '#2c3e50',
                        fontWeight: 500,
                        fontSize: '0.7rem',
                        height: 24,
                      }}
                    />
                  ))}
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => onDemoOpen(demo.id)}
                  sx={{
                    width: '100%',
                    bgcolor: demo.borderColor,
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'none',
                    py: 1.25,
                    borderRadius: '12px',
                    fontSize: '1rem',
                    '&:hover': {
                      bgcolor: demo.borderColor,
                      filter: 'brightness(1.1)',
                      transform: 'scale(1.02)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  Launch Demo
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
