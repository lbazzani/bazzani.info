'use client';

import { Box, Paper, Chip } from '@mui/material';
import ProfileInfo from '../../components/ProfileInfo';
import sidebarConfig from '../../data/sidebarConfig.json';

export default function MobileHeader() {
  const config = sidebarConfig;

  return (
    <Paper
      elevation={0}
      sx={{
        display: { xs: 'block', md: 'none' },
        p: 1.5,
        borderRadius: '8px',
        border: '1px solid',
        borderColor: '#e8e8e8',
        backgroundColor: '#ffffff',
        mb: 1.5,
        mt: 0.5,
      }}
    >
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Left column - Profile info */}
        <Box sx={{ flex: 1 }}>
          <ProfileInfo variant="mobile" showLocation={true} />
        </Box>

        {/* Right column - Photo and chips */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Box
            component="img"
            src={config.profile.photo}
            alt={config.profile.name}
            sx={{
              width: 80,
              height: 80,
              border: '3px solid',
              borderColor: '#d35400',
              boxShadow: '0 3px 10px rgba(211, 84, 0, 0.2)',
              borderRadius: '8px',
              objectFit: 'cover',
            }}
          />
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 80 }}>
            {config.chips.map((chip, index) => (
              <Chip
                key={index}
                label={chip.label}
                size="small"
                sx={{
                  bgcolor: chip.bgcolor,
                  color: chip.color,
                  fontSize: '0.6rem',
                  height: '18px',
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
