'use client';

import { useState } from 'react';
import { Box, Paper, ToggleButtonGroup, ToggleButton } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TimelineIcon from '@mui/icons-material/Timeline';
import HubIcon from '@mui/icons-material/Hub';
import FlowchartBuilder from './FlowchartBuilder';

type TemplateType = 'flowchart' | 'architecture' | 'timeline';

export default function SlideGeneratorMain() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('flowchart');

  const handleTemplateChange = (
    event: React.MouseEvent<HTMLElement>,
    newTemplate: TemplateType | null
  ) => {
    if (newTemplate !== null) {
      setSelectedTemplate(newTemplate);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Compact Template Selector */}
      <Paper
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: 1,
          py: 0.5,
          bgcolor: '#fafafa'
        }}
      >
        <ToggleButtonGroup
          value={selectedTemplate}
          exclusive
          onChange={handleTemplateChange}
          aria-label="template selector"
          size="small"
          sx={{ height: '32px' }}
        >
          <ToggleButton value="flowchart" sx={{ px: 2, py: 0.5, fontSize: '12px' }}>
            <AccountTreeIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Flowchart
          </ToggleButton>
          <ToggleButton value="architecture" sx={{ px: 2, py: 0.5, fontSize: '12px' }}>
            <HubIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Architecture
          </ToggleButton>
          <ToggleButton value="timeline" sx={{ px: 2, py: 0.5, fontSize: '12px' }}>
            <TimelineIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Timeline
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {/* Editor Area - Full Height */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {selectedTemplate === 'flowchart' && <FlowchartBuilder />}
        {selectedTemplate === 'architecture' && (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            Architecture Diagram editor coming soon...
          </Box>
        )}
        {selectedTemplate === 'timeline' && (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            Timeline editor coming soon...
          </Box>
        )}
      </Box>
    </Box>
  );
}
