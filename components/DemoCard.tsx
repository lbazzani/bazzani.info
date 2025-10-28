import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import NewReleasesIcon from '@mui/icons-material/NewReleases';

interface DemoCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isNew?: boolean;
  onClick: () => void;
}

export default function DemoCard({ title, description, icon, isNew, onClick }: DemoCardProps) {
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        bgcolor: 'rgba(255,255,255,0.98)',
        border: '2px solid #e0e0e0',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          borderColor: '#326CE5',
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(50, 108, 229, 0.2)',
          '& .demo-icon': {
            transform: 'scale(1.1) rotate(5deg)',
            color: '#326CE5',
          },
        },
      }}
    >
      {isNew && (
        <Chip
          icon={<NewReleasesIcon sx={{ fontSize: 16 }} />}
          label="NEW"
          size="small"
          sx={{
            position: 'absolute',
            top: -10,
            right: 12,
            bgcolor: '#FF6B6B',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.7rem',
            height: '24px',
            boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)',
            '& .MuiChip-icon': {
              color: 'white',
            },
          }}
        />
      )}

      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {/* Icon */}
          <Box
            className="demo-icon"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '12px',
              bgcolor: 'rgba(50, 108, 229, 0.1)',
              color: '#326CE5',
              flexShrink: 0,
              transition: 'all 0.3s ease',
            }}
          >
            {icon}
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1.1rem',
                color: '#2c3e50',
                mb: 0.5,
                lineHeight: 1.3,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#7f8c8d',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              {description}
            </Typography>
          </Box>
        </Box>

        {/* Action hint */}
        <Box
          sx={{
            mt: 2,
            pt: 1.5,
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#326CE5',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Click to open
          </Typography>
          <Box
            component="span"
            sx={{
              color: '#326CE5',
              fontSize: '1rem',
              animation: 'bounce 2s infinite',
              '@keyframes bounce': {
                '0%, 100%': { transform: 'translateX(0)' },
                '50%': { transform: 'translateX(4px)' },
              },
            }}
          >
            →
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
