'use client';

import { Box, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import sidebarConfig from '../data/sidebarConfig.json';

interface ProfileInfoProps {
  variant?: 'sidebar' | 'mobile';
  showLocation?: boolean;
}

export default function ProfileInfo({ variant = 'sidebar', showLocation = false }: ProfileInfoProps) {
  const config = sidebarConfig;
  const isMobile = variant === 'mobile';

  return (
    <Box>
      <Typography
        variant={isMobile ? 'h6' : 'subtitle1'}
        sx={{
          fontWeight: 600,
          color: '#2c3e50',
          textAlign: isMobile ? 'left' : 'center',
          mb: 0.5,
          fontSize: isMobile ? '1.2rem' : '1.1rem',
        }}
      >
        {config.profile.name}
      </Typography>

      {/* First role - Managing Director @ Xpylon */}
      <Typography
        variant="caption"
        sx={{
          color: '#2c3e50',
          textAlign: isMobile ? 'left' : 'center',
          display: 'block',
          fontWeight: 600,
          fontSize: isMobile ? '0.85rem' : '0.8rem',
          mt: 0.5,
        }}
      >
        {config.profile.title}
      </Typography>

      {showLocation && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          justifyContent: isMobile ? 'flex-start' : 'center',
          mt: 0.2,
          mb: 0.8,
        }}>
          <LocationOnIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.7rem',
              fontStyle: 'italic',
            }}
          >
            Houston, TX
          </Typography>
        </Box>
      )}

      {/* Second role - Independent Consultant */}
      <Typography
        variant="caption"
        sx={{
          color: '#2c3e50',
          textAlign: isMobile ? 'left' : 'center',
          display: 'block',
          fontWeight: 600,
          fontSize: isMobile ? '0.85rem' : '0.8rem',
          mt: showLocation ? 0 : 0.5,
        }}
      >
        {config.profile.subtitle}
      </Typography>

      {showLocation && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          justifyContent: isMobile ? 'flex-start' : 'center',
          mt: 0.2,
          mb: isMobile ? 1 : 1.5,
        }}>
          <LocationOnIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.7rem',
              fontStyle: 'italic',
            }}
          >
            Italy
          </Typography>
        </Box>
      )}
    </Box>
  );
}
