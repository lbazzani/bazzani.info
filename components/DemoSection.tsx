import { Box, Typography, Paper } from '@mui/material';
import DemoCard from './DemoCard';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

interface Demo {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isNew: boolean;
  onClick: () => void;
}

interface DemoSectionProps {
  demos: Demo[];
}

export default function DemoSection({ demos }: DemoSectionProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: '12px',
        border: '1px solid #e8e8e8',
        bgcolor: '#ffffff',
        mb: 2,
      }}
    >
      {/* Section Header */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            fontSize: '0.95rem',
            color: '#2c3e50',
            mb: 0.5,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Interactive Demos
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: '#7f8c8d',
            fontSize: '0.8rem',
          }}
        >
          Explore hands-on demonstrations
        </Typography>
      </Box>

      {/* Demo Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {demos.map((demo) => (
          <DemoCard
            key={demo.id}
            title={demo.title}
            description={demo.description}
            icon={demo.icon}
            isNew={demo.isNew}
            onClick={demo.onClick}
          />
        ))}
      </Box>
    </Paper>
  );
}
