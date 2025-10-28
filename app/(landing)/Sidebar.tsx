'use client';

import { Box, Paper, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, Chip, CardMedia, LinearProgress } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PublicIcon from '@mui/icons-material/Public';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import LaunchIcon from '@mui/icons-material/Launch';
import sidebarConfig from '../../data/sidebarConfig.json';

const iconMap: any = {
  work: WorkIcon,
  school: SchoolIcon,
};

interface SidebarProps {
  onDemoOpen?: (demoId: string) => void;
}

export default function Sidebar({ onDemoOpen }: SidebarProps = {}) {
  const config = sidebarConfig;

  const latestReleases = [
    {
      id: 'k8s-architecture',
      title: 'K8s Architecture',
      icon: <AccountTreeIcon sx={{ fontSize: 16 }} />,
    },
    {
      id: 'co2-data',
      title: 'CO₂ Explorer',
      icon: <PublicIcon sx={{ fontSize: 16 }} />,
    },
    // {
    //   id: 'co2-assistant',
    //   title: 'CO₂ AI Assistant',
    //   icon: <SmartToyIcon sx={{ fontSize: 16 }} />,
    // },
  ];

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 100,
        display: { xs: 'none', md: 'block' },
        width: '280px',
      }}
    >
      {/* Profile Card */}
      <Paper
        elevation={0}
        sx={{
          p: 0,
          borderRadius: '12px',
          border: '1px solid',
          borderColor: '#e8e8e8',
          backgroundColor: '#ffffff',
          mb: 2,
          overflow: 'hidden',
        }}
      >
        {/* Large square photo */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            paddingTop: '100%',
            overflow: 'hidden',
          }}
        >
          <CardMedia
            component="img"
            image={config.profile.photo}
            alt={config.profile.name}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {/* Gradient overlay at bottom */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
            }}
          />
        </Box>

        <Box sx={{ p: 2.5 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: '#2c3e50',
              textAlign: 'center',
              mb: 0.5,
              fontSize: '1.1rem',
            }}
          >
            {config.profile.name}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              textAlign: 'center',
              mb: 1.5,
              display: 'block',
            }}
          >
            {config.profile.title}
          </Typography>

          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center', mb: 1.5 }}>
            {config.chips.map((chip, index) => (
              <Chip
                key={index}
                label={chip.label}
                size="small"
                sx={{
                  bgcolor: chip.bgcolor,
                  color: chip.color,
                  fontSize: '0.65rem',
                  height: '20px',
                }}
              />
            ))}
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <List dense disablePadding>
            <ListItem sx={{ px: 0, py: 0.3 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText
                primary={config.contact.location}
                primaryTypographyProps={{
                  variant: 'caption',
                  color: 'text.secondary',
                }}
              />
            </ListItem>

            <ListItem sx={{ px: 0, py: 0.3 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText
                primary={config.contact.email}
                primaryTypographyProps={{
                  variant: 'caption',
                  color: 'text.secondary',
                }}
              />
            </ListItem>

            <ListItem sx={{ px: 0, py: 0.3 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText
                primary={config.contact.phone}
                primaryTypographyProps={{
                  variant: 'caption',
                  color: 'text.secondary',
                }}
              />
            </ListItem>
          </List>

          <Box
            component="a"
            href={config.social.linkedin.url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.8,
              mt: 1.5,
              p: 1,
              borderRadius: '8px',
              bgcolor: '#0077b5',
              color: 'white',
              textDecoration: 'none',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: '#006399',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 119, 181, 0.3)',
              },
            }}
          >
            <LinkedInIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {config.social.linkedin.label}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Skills Card */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '12px',
          border: '1px solid',
          borderColor: '#e8e8e8',
          backgroundColor: '#ffffff',
          mb: 2,
        }}
      >
        {/* Managerial Skills */}
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: '#2c3e50',
            mb: 1.5,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Box
            sx={{
              width: 4,
              height: 16,
              borderRadius: 1,
              background: 'linear-gradient(135deg, #c0392b 0%, #e67e22 100%)',
            }}
          />
          Managerial
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 2.5 }}>
          {config.managerialSkills.map((skill, index) => (
            <Box key={index}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.75rem' }}>
                  {skill.name}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={skill.level === 'expert' ? 95 : skill.level === 'advanced' ? 80 : 65}
                sx={{
                  height: 7,
                  borderRadius: 3,
                  bgcolor: '#f5f5f5',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: skill.color,
                    borderRadius: 3,
                    boxShadow: `0 0 8px ${skill.color}40`,
                  }
                }}
              />
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Technical Skills */}
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: '#2c3e50',
            mb: 1.5,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Box
            sx={{
              width: 4,
              height: 16,
              borderRadius: 1,
              background: 'linear-gradient(135deg, #2980b9 0%, #16a085 100%)',
            }}
          />
          Technical
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
          {config.technicalSkills.map((skill, index) => (
            <Box key={index}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.75rem' }}>
                  {skill.name}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={skill.level === 'expert' ? 95 : skill.level === 'advanced' ? 80 : 65}
                sx={{
                  height: 7,
                  borderRadius: 3,
                  bgcolor: '#f5f5f5',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: skill.color,
                    borderRadius: 3,
                    boxShadow: `0 0 8px ${skill.color}40`,
                  }
                }}
              />
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Quick Info Card */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '12px',
          border: '1px solid',
          borderColor: '#e8e8e8',
          backgroundColor: '#ffffff',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: '#2c3e50',
            mb: 1.5,
            fontSize: '0.9rem',
          }}
        >
          Quick Info
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {config.quickInfo.map((info, index) => {
            const IconComponent = iconMap[info.icon];
            return (
              <Box key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                  <IconComponent sx={{ fontSize: 14, color: info.color }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.7rem' }}>
                    {info.label}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', pl: 2.8, display: 'block' }}>
                  {info.value}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Latest Releases */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '12px',
          border: '1px solid',
          borderColor: '#e8e8e8',
          backgroundColor: '#ffffff',
          mt: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <NewReleasesIcon sx={{ fontSize: 18, color: '#FF6B6B' }} />
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: '#2c3e50',
              fontSize: '0.85rem',
            }}
          >
            Latest Releases
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {latestReleases.map((release) => (
            <Box
              key={release.id}
              onClick={() => onDemoOpen?.(release.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1,
                borderRadius: '8px',
                bgcolor: 'rgba(50,108,229,0.05)',
                border: '1px solid rgba(50,108,229,0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(50,108,229,0.1)',
                  borderColor: 'rgba(50,108,229,0.3)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ color: '#326CE5' }}>{release.icon}</Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.75rem' }}>
                  {release.title}
                </Typography>
              </Box>
              <LaunchIcon sx={{ fontSize: 14, color: '#326CE5' }} />
            </Box>
          ))}
        </Box>

        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1.5, textAlign: 'center', fontSize: '0.65rem' }}>
          Click to explore interactive demos
        </Typography>
      </Paper>
    </Box>
  );
}
