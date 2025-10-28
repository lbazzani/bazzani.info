import { Box, Typography, Grid } from '@mui/material';
import ExperienceCard from './ExperienceCard';
import HeroSection from './HeroSection';

interface CardData {
  logo: string;
  image: string;
  title: string;
  mdDetail?: string;
  detail?: string;
  mdAddittional?: string;
}

const skills: CardData[] = [
  {
    logo: "foto_small",
    image: "Management.png",
    title: "Management and Leadership Skills",
    mdDetail: "Management.md",
  },
  {
    logo: "foto_small",
    image: "Technical.png",
    title: "Technical Skills",
    mdDetail: "Technical.md",
  },
];

const works: CardData[] = [
  {
    logo: "IconaBazzani",
    image: "GenerativeAI.png",
    title: "Independent Consultant – Cloud Infrastructure & Generative AI",
    mdDetail: "consultantDescription.md",
  },
  {
    logo: "XpylonIcon_Transparent",
    image: "xpylon.png",
    title: "Xyplon - Founder (Houston Texas)",
    mdDetail: "xpylonDescription.md",
  },
];

const experiences: CardData[] = [
  {
    logo: "Politecnico",
    image: "Study2.jpg",
    title: "Polytechnic University of Turin",
    mdDetail: "study.md",
  },
  {
    logo: "Trim",
    image: "Startupper2.jpg",
    title: "Entrepreneur, Startupper",
    mdDetail: "trimDescription.md",
    mdAddittional: "trimAdditional.md"
  },
  {
    logo: "Capgemini",
    image: "Management2.jpg",
    title: "Capgemini - Deliver Director",
    mdDetail: "capDescription.md",
    mdAddittional: "capAdditional.md"
  },
];

const passions: CardData[] = [
  {
    logo: "foto_small",
    image: "Running.jpg",
    title: "Running and Skiing",
    detail: "Personal marathon time: 3:35. It's been a few years, but the desire for high-intensity sports remains strong. Sports, mountains, and the great outdoors are medicine for both the body and the mind."
  },
  {
    logo: "foto_small",
    image: "SoftwareEngineering.jpg",
    title: "Software Engineer Inside",
    detail: "I love to create, invent, and experiment. In over thirty years I've worked with at least 10 different programming languages. I enjoy personally testing everything that's new and innovative."
  },
  {
    logo: "foto_small",
    image: "Leader.jpeg",
    title: "Management and Leadership",
    detail: "Over twenty years of experience as an entrepreneur, project manager and director of delivery for large programs, have taught me that, in order to achieve results, it's essential to work on the team maintaining a creative and positive environment both with the team and with stakeholders."
  },
];

interface SectionHeaderProps {
  children: React.ReactNode;
  gradient?: string;
}

function SectionHeader({ children, gradient = "linear-gradient(135deg, #d35400 0%, #e67e22 100%)" }: SectionHeaderProps) {
  return (
    <Box
      sx={{
        mb: 5,
        mt: 8,
        position: 'relative',
        paddingBottom: 2,
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '80px',
          height: '3px',
          background: gradient,
          borderRadius: '2px',
        }
      }}
    >
      <Typography
        variant="h4"
        component="h2"
        sx={{
          fontWeight: 600,
          color: '#2c3e50',
          letterSpacing: '-0.5px',
          fontSize: { xs: '1.75rem', md: '2rem' }
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}

export default function Home() {
  return (
    <Box sx={{ width: "100%", margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <HeroSection />

      <SectionHeader gradient="linear-gradient(135deg, #d35400 0%, #e67e22 100%)">
        Skills & Expertise
      </SectionHeader>

      <Grid container spacing={3}>
        {skills.map((skill, index) => (
          <Grid item key={`skill-${index}`} xs={12} md={6}>
            <ExperienceCard {...skill} />
          </Grid>
        ))}
      </Grid>

      <SectionHeader gradient="linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)">
        Current Work
      </SectionHeader>

      <Grid container spacing={3}>
        {works.map((work, index) => (
          <Grid item key={`work-${index}`} xs={12} md={6}>
            <ExperienceCard {...work} />
          </Grid>
        ))}
      </Grid>

      <SectionHeader gradient="linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)">
        Professional Journey
      </SectionHeader>

      <Grid container spacing={3}>
        {experiences.map((exp, index) => (
          <Grid item key={`exp-${index}`} xs={12} md={4}>
            <ExperienceCard {...exp} />
          </Grid>
        ))}
      </Grid>

      <SectionHeader gradient="linear-gradient(135deg, #16a085 0%, #1abc9c 100%)">
        Passions & Interests
      </SectionHeader>

      <Grid container spacing={3}>
        {passions.map((passion, index) => (
          <Grid item key={`passion-${index}`} xs={12} md={4}>
            <ExperienceCard {...passion} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ height: 40 }} />
    </Box>
  );
}
