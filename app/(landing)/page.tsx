'use client';

import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import { useState } from 'react';
import ExperienceCard from './ExperienceCard';
import IntroSection from './IntroSection';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import AIAssistantPanel from '../../components/AIAssistantPanel';
import ArchitectureDemo from '../../components/ArchitectureDemo';
import CO2DataDemo from '../../components/CO2DataDemo';
import CO2AssistantDemo from '../../components/CO2AssistantDemo';
import GenerativeArtDemo from '../../components/GenerativeArtDemo';
import DemoShowcase from '../../components/DemoShowcase';
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
        mb: 2.5,
        mt: 5,
        position: 'relative',
        paddingBottom: 1.5,
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '80px',
          height: '4px',
          background: gradient,
          borderRadius: '4px',
          transition: 'width 0.3s ease',
        },
        '&:hover::before': {
          width: '120px',
        }
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        sx={{
          fontWeight: 700,
          color: '#2c3e50',
          letterSpacing: '-0.3px',
          fontSize: { xs: '1.3rem', md: '1.55rem' }
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
  const [isArchitectureDemoOpen, setIsArchitectureDemoOpen] = useState(false);
  const [isCO2DemoOpen, setIsCO2DemoOpen] = useState(false);
  const [isCO2AssistantOpen, setIsCO2AssistantOpen] = useState(false);
  const [isGenerativeArtOpen, setIsGenerativeArtOpen] = useState(false);
  const tabs = contentData.tabs as TabData[];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDemoOpen = (demoId: string) => {
    if (demoId === 'slide-generator') {
      window.open('/slide-generator', '_blank');
    } else if (demoId === 'k8s-architecture') {
      setIsArchitectureDemoOpen(true);
    } else if (demoId === 'co2-data') {
      setIsCO2DemoOpen(true);
    } else if (demoId === 'co2-assistant') {
      setIsCO2AssistantOpen(true);
    } else if (demoId === 'generative-art') {
      setIsGenerativeArtOpen(true);
    }
  };

  return (
    <Box sx={{ width: "100%", display: 'flex', gap: 3, maxWidth: '1400px', mx: 'auto' }}>
      {/* Sidebar - visible only on medium+ screens */}
      <Sidebar onDemoOpen={handleDemoOpen} />

      {/* Main Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <MobileHeader />
        <AIAssistantPanel />
        <IntroSection />

        {/* Tabs Navigation */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '16px',
            border: '1px solid',
            borderColor: '#e0e0e0',
            mb: 3,
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              minHeight: 52,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                color: 'text.secondary',
                minHeight: 52,
                letterSpacing: '0.3px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#e67e22',
                  backgroundColor: 'rgba(211, 84, 0, 0.04)',
                },
                '&.Mui-selected': {
                  color: '#d35400',
                },
              },
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(90deg, #d35400, #e67e22)',
                height: 4,
                borderRadius: '4px 4px 0 0',
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
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {cards.map((card) => (
                      <ExperienceCard key={card.id} {...card} />
                    ))}
                  </Box>
                </Box>
              ))}
            </TabPanel>
          );
        })}

        {/* Demo Showcase */}
        <DemoShowcase onDemoOpen={handleDemoOpen} />

        <Box sx={{ height: 24 }} />
      </Box>

      {/* Architecture Demo */}
      <ArchitectureDemo
        isOpen={isArchitectureDemoOpen}
        onClose={() => setIsArchitectureDemoOpen(false)}
      />

      {/* CO2 Data Demo */}
      <CO2DataDemo
        isOpen={isCO2DemoOpen}
        onClose={() => setIsCO2DemoOpen(false)}
      />

      {/* CO2 Assistant Demo */}
      <CO2AssistantDemo
        isOpen={isCO2AssistantOpen}
        onClose={() => setIsCO2AssistantOpen(false)}
      />

      {/* Generative Art Demo */}
      <GenerativeArtDemo
        isOpen={isGenerativeArtOpen}
        onClose={() => setIsGenerativeArtOpen(false)}
      />
    </Box>
  );
}
