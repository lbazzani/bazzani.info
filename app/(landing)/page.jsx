import { Box, Typography, Paper, Avatar, Grid, Alert, CardMedia, CardContent } from '@mui/material';
import ReactMarkdown from 'react-markdown';

import ExperienceCard from './ExperienceCard';



const skills = [
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
]

const works = [
    {
        logo: "foto_small",
        image: "GenerativeAI.png",
        title: "Independent Consultant – Cloud Infrastructure & Generative AI ",
        mdDetail: "consultantDescription.md",
    },
    {
        logo: "foto_small",
        image: "xpylon.png",
        title: "Xyplon - Founder (Houston Texas)",
        mdDetail: "xpylonDescription.md",
    },
]

const experiences = [
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
]

const passions = [
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
]




export default async function Home() {

  const fs = require('fs').promises;
  const path = require('path');
  const filePath = path.join(process.cwd(), 'public', 'markdown', 'mainDescription.md');
  const mainDescription = await fs.readFile(filePath, 'utf8');

  return (
    <Box sx={{width: "100%", margin:0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} >  
        <Paper sx={{ spacing: 2, padding: 2 } }  >    
        <Grid container spacing={2} alignItems="flex-start" justifyContent="flex-start">

            <Grid item xs={12} sm={"auto"} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CardMedia
                component="img"
                image="/img/foto.jpeg"
                alt="Foto"
                sx={{ maxHeight: 250, maxWidth: 250, borderRadius: 2, objectFit: "cover" }}
              />
            </Grid>
            <Grid item xs={12} sm={9}>

                <ReactMarkdown>{mainDescription}</ReactMarkdown>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <a
                    href="https://it.linkedin.com/in/lorenzo-bazzani"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
                  >
                    <img
                      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg"
                      alt="LinkedIn"
                      style={{ width: 32, height: 32, marginRight: 8 }}
                    />
                    <Typography variant="body1">
                      Follow me on LinkedIn !
                    </Typography>
                  </a>
                </Box>

            </Grid>

        
        </Grid>
        </Paper>

        <Box m={1} />

        <Grid container spacing={4}>
            {skills.map((n,index) => (
            <Grid item key={"ex"+index} xs={12} sm={6}>
                <ExperienceCard key={"exdt"+index}  {...n}></ExperienceCard>
            </Grid>
            ))}
        </Grid>

        <Box m={1} />

        <Alert severity="success" >Work in progress</Alert>
        <Box m={1} />

        <Grid container spacing={4}>
            { works.map((n, index) => (
            <Grid item key={"d"+index} xs={12} sm={12} md={6}>
                <ExperienceCard key={"pdt"+index}  {...n}></ExperienceCard>
            </Grid>
            ))}
        </Grid>

        <Box m={1} />

        <Alert severity="success" >My achievements !</Alert>

        <Box m={1} />

        <Grid container spacing={4}>
            {experiences.map((n,index) => (
            <Grid item key={"ex"+index} xs={12} sm={12} md={4}>
                <ExperienceCard key={"exdt"+index}  {...n}></ExperienceCard>
            </Grid>
            ))}
        </Grid>
        
        <Box m={1} />
        <Alert severity="success" >My passions</Alert>
        <Box m={1} />

        <Grid container spacing={4}>
            {passions.map((n,index) => (
            <Grid item key={"ex"+index} xs={12} sm={12} md={4}>
                <ExperienceCard key={"pdt"+index}  {...n}></ExperienceCard>
            </Grid>
            ))}
        </Grid>
        
        <Box m={1} />




    </Box>
  );

}