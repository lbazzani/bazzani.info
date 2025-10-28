import { useState } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, IconButton, Tooltip, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface ComponentItem {
  id: string;
  label: string;
  icon: string;
  type: string;
  category: string;
}

const componentLibrary: ComponentItem[] = [
  // Ingress & Networking
  { id: 'ing', label: 'Ingress', icon: 'ing', type: 'Ingress', category: 'Networking' },
  { id: 'svc', label: 'Service', icon: 'svc', type: 'Service', category: 'Networking' },

  // Workloads
  { id: 'deploy', label: 'Deployment', icon: 'deploy', type: 'Deployment', category: 'Workloads' },
  { id: 'pod', label: 'Pod', icon: 'pod', type: 'Pod', category: 'Workloads' },
  { id: 'sts', label: 'StatefulSet', icon: 'sts', type: 'StatefulSet', category: 'Workloads' },

  // Jobs
  { id: 'cronjob', label: 'CronJob', icon: 'cronjob', type: 'CronJob', category: 'Jobs' },
  { id: 'job', label: 'Job', icon: 'job', type: 'Job', category: 'Jobs' },

  // Storage
  { id: 'pv', label: 'Persistent Volume', icon: 'pv', type: 'PV', category: 'Storage' },

  // Config
  { id: 'cm', label: 'ConfigMap', icon: 'cm', type: 'ConfigMap', category: 'Config' },

  // Other
  { id: 'ns', label: 'Namespace', icon: 'ns', type: 'Namespace', category: 'Other' },
];

const categories = ['Networking', 'Workloads', 'Jobs', 'Storage', 'Config', 'Other'];

export default function ComponentPalette() {
  const [isOpen, setIsOpen] = useState(true);

  const onDragStart = (event: React.DragEvent, componentItem: ComponentItem) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: 'k8sNode',
      data: {
        label: componentItem.label,
        icon: componentItem.icon,
        type: componentItem.type,
      }
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <>
      {/* Toggle Button - Show when closed */}
      {!isOpen && (
        <Tooltip title="Show Component Library" placement="left">
          <IconButton
            onClick={() => setIsOpen(true)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(50, 108, 229, 0.9)',
              color: 'white',
              zIndex: 10,
              '&:hover': { bgcolor: 'rgba(50, 108, 229, 1)' },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* Palette Panel */}
      <Collapse in={isOpen} orientation="horizontal" sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <Box
          sx={{
            width: '300px',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            borderRadius: 2,
            border: '1px solid #333',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#1a1a1a',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#326CE5',
              borderRadius: '4px',
            },
          }}
        >
          {/* Header with Hide Button */}
          <Box sx={{ p: 2, borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#326CE5', fontWeight: 'bold', mb: 0.5 }}>
                Component Library
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>
                Drag components to the canvas
              </Typography>
            </Box>
            <Tooltip title="Hide" placement="left">
              <IconButton
                size="small"
                onClick={() => setIsOpen(false)}
                sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>
          </Box>

      {categories.map((category) => {
        const items = componentLibrary.filter(c => c.category === category);
        if (items.length === 0) return null;

        return (
          <Accordion
            key={category}
            defaultExpanded={category === 'Networking' || category === 'Workloads'}
            sx={{
              bgcolor: 'transparent',
              color: 'white',
              boxShadow: 'none',
              '&:before': { display: 'none' },
              borderBottom: '1px solid #333',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#999' }} />}
              sx={{
                minHeight: '48px',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#e0e0e0' }}>
                {category}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {items.map((item) => (
                  <Box
                    key={item.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, item)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1,
                      borderRadius: 1,
                      border: '1px solid #333',
                      bgcolor: 'rgba(255,255,255,0.05)',
                      cursor: 'grab',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(50, 108, 229, 0.2)',
                        borderColor: '#326CE5',
                        transform: 'translateX(4px)',
                      },
                      '&:active': {
                        cursor: 'grabbing',
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={`/icons/k8s/${item.icon}.svg`}
                      alt={item.label}
                      sx={{
                        width: 32,
                        height: 32,
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#e0e0e0',
                          fontWeight: 500,
                          fontSize: '0.85rem',
                        }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#999',
                          fontSize: '0.7rem',
                        }}
                      >
                        {item.type}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
        </Box>
      </Collapse>
    </>
  );
}
