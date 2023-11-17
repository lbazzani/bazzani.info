import React from 'react';
import { Box, Typography, Paper, Avatar, Grid, Alert, CardMedia, CardContent } from '@mui/material';
import Image from 'mui-image'
import ExperienceCard from './CardComponent';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';



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

const demos = [
    {
        logo: "foto_small",
        image: "GenerativeAI.png",
        title: "Generative AI",
        mdDetail: "genAIDescription.md",
    },
    {
        logo: "foto_small",
        image: "GenerativeArt.webp",
        title: "Generative Arts",
        mdDetail: "genArt.md",
    },
    {
        logo: "foto_small",
        image: "AiProcessAutomation.jpg",
        title: "AI Powered Process Automation",
        mdDetail: "aiProcessAutomation.md",
    },
]




export default function MainPage() {
    const [test, setTest] = React.useState(false);
    const [mainDescription, setMainDescription] = React.useState("");

    React.useEffect(() => {

          axios.get('/markdown/mainDescription.md')
          .then((response) => {
            setMainDescription(response.data);
          })
          .catch((error) => {
            console.error('Errore nel recupero del file Markdown', error);
          });
    })

    return(

        <Box sx={{width: "100%", paddingTop: 2, paddingBottom:2, margin:0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} >  
            <Paper sx={{ spacing: 2, padding: 2 } }  >    
            <Grid container spacing={2}
                alignItems="center"
                justify="center"
                style={{ }}>

                <Grid item xs={12} sm={"auto"}>

                    <Image src={`${process.env.PUBLIC_URL}/img/foto.jpeg`} shift="left" style={{ maxHeight:250, maxWidth:250, borderRadius: 16 }} />   
                </Grid>
                <Grid item xs={12} sm={9}>
                    <Typography variant="body1" color="text.secondary">
                    <ReactMarkdown>{mainDescription}</ReactMarkdown>
                    </Typography>
                </Grid>

            
            </Grid>
            </Paper>

            <Box m={1} />

            <Alert severity="success" >My achievements !</Alert>

            <Box m={1} />

            <Grid container spacing={4}>
                {experiences.map((n,index) => (
                <Grid item key={"ex"+index} xs={12} sm={6} md={4}>
                    <ExperienceCard key={"exdt"+index}  {...n}></ExperienceCard>
                </Grid>
                ))}
            </Grid>
            
            <Box m={1} />
            <Alert severity="success" >My passions</Alert>
            <Box m={1} />

            <Grid container spacing={4}>
                {passions.map((n,index) => (
                <Grid item key={"p"+index} xs={12} sm={6} md={4}>
                    <ExperienceCard key={"pdt"+index}  {...n}></ExperienceCard>
                </Grid>
                ))}
            </Grid>
            
            <Box m={1} />
            <Alert severity="success" >My Coding Demos</Alert>
            <Box m={1} />

            <Grid container spacing={4}>
                {demos.map((n, index) => (
                <Grid item key={"d"+index} xs={12} sm={6} md={4}>
                    <ExperienceCard key={"pdt"+index}  {...n}></ExperienceCard>
                </Grid>
                ))}
            </Grid>

            <Box m={1} />



        </Box>

    )
}