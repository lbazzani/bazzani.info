'use client';

import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import { useState } from 'react';
import ExperienceCard from './ExperienceCard';
import IntroSection from './IntroSection';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import AIAssistantPanel from '../../components/AIAssistantPanel';
import contentData from '../../data/content.json';

interface CardData {
  id: string;
  logo: string;
  image: string;
  title: string;
  subtitle?: string;
  sectionTitle: string;
  gradient: string;
  mdDetail?: string;
  mdAdditional?: string;
}

interface TabData {
  id: string;
  label: string;
  cards: CardData[];
}

interface SectionHeaderProps {
  children: React.ReactNode;
  gradient?: string;
}

function SectionHeader({ children, gradient = "linear-gradient(135deg, #d35400 0%, #e67e22 100%)" }: SectionHeaderProps) {
  return (
    <Box
      sx={{
        mb: 2,
        mt: 4,
        position: 'relative',
        paddingBottom: 1.5,
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '60px',
          height: '3px',
          background: gradient,
          borderRadius: '2px',
        }
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        sx={{
          fontWeight: 600,
          color: '#2c3e50',
          letterSpacing: '-0.3px',
          fontSize: { xs: '1.25rem', md: '1.5rem' }
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function Home() {
  const [tabValue, setTabValue] = useState(0);
  const tabs = contentData.tabs as TabData[];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", display: 'flex', gap: 3, maxWidth: '1400px', mx: 'auto' }}>
      {/* Sidebar - visible only on medium+ screens */}
      <Sidebar />

      {/* Main Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <MobileHeader />
        <AIAssistantPanel />
        <IntroSection />

        {/* Tabs Navigation */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '12px',
            border: '1px solid',
            borderColor: '#e8e8e8',
            mb: 3,
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'text.secondary',
                minHeight: 48,
                '&.Mui-selected': {
                  color: '#d35400',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#d35400',
                height: 3,
              },
            }}
          >
            {tabs.map((tab) => (
              <Tab key={tab.id} label={tab.label} />
            ))}
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        {tabs.map((tab, tabIndex) => {
          // Group cards by sectionTitle
          const sections = tab.cards.reduce((acc, card) => {
            if (!acc[card.sectionTitle]) {
              acc[card.sectionTitle] = [];
            }
            acc[card.sectionTitle].push(card);
            return acc;
          }, {} as Record<string, CardData[]>);

          return (
            <TabPanel key={tab.id} value={tabValue} index={tabIndex}>
              {Object.entries(sections).map(([sectionTitle, cards], sectionIndex) => (
                <Box key={`${tab.id}-section-${sectionIndex}`}>
                  <SectionHeader gradient={cards[0].gradient}>
                    {sectionTitle}
                  </SectionHeader>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {cards.map((card) => (
                      <ExperienceCard key={card.id} {...card} />
                    ))}
                  </Box>
                </Box>
              ))}
            </TabPanel>
          );
        })}

        <Box sx={{ height: 24 }} />
      </Box>
    </Box>
  );
}
