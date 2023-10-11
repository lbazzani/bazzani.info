import React from 'react';
import { Box, Typography, Paper, Avatar, Card, Alert, CardMedia, CardContent, Grid } from '@mui/material';
import ExperienceCard from './ExperienceCard';


import axios from "axios";

const experiences = [
    {
        logo: "Politecnico",
        image: "Study.png",
        title: "Polytechnic University of Turin",
        detail: "Master's Degree in Computer Engineering with a specialization in Software Engineering. For my thesis, I developed one of the pioneering tools for the automatic generation of web-based training courses."
    },
    {
        logo: "Trim",
        image: "Startupper.png",
        title: "Entrepreneur, Startupper",
        detail: "Starting in 1999, I co-founded three companies with classmates within the business incubator at Politecnico di Torino. My passion for computer science, entrepreneurial spirit, and creativity were the driving forces behind the group, which has achieved over €3 million in annual revenue with consistent growth over its nearly twenty-year history."
    },
    {
        logo: "Capgemini",
        image: "Management.png",
        title: "Capgemini Italia",
        detail: "Following Trim's integration into Capgemini, I joined as a Principal Consultant in the banking sector. For seven years, I worked as Delivery Director on major local and international digitalization projects."
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




export default function MainPage() {
    return(

        <Box sx={{padding:2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} >  
            <Card sx={{ spacing: 2, padding: 2 } }  >    
            <Box sx={{ display: 'flex', flexDirection: 'rows' }}> 
                <CardMedia
                component="img"
                height="250"
                image={`${process.env.PUBLIC_URL}/img/foto.jpeg`} 
                alt="Lorenzo Bazzani"
                />
                <CardContent>

                <Typography variant="body1" color="text.secondary">
                Delivery Director and Senior Software Engineer with extensive experience in banking, major industries, and startup ventures. Expert in managing large IT program deliveries and passionate about coding and artificial intelligence. Solid foundation in Enterprise IT Architecture and key Digital Transformation Technologies. Outstanding public speaker and communicator with strong interpersonal skills. Proven track record in solving complex business and technical challenges.
                <p/>
                This site is hosted on my personal VPS cloud server where I publish my demos. Lately, I've been exploring the capabilities of generative AI. Try the demo of my service at bazml.com/icv, upload a CV in PDF format and receive: a cover letter, improvements, translation, and in the future, other features I'm currently working on.
                </Typography>
                </CardContent>
            
            </Box>
            </Card>

            <Box m={1} />

            <Alert severity="success" >My achievements !</Alert>

            <Box m={1} />

            <Grid container spacing={4}>
                {experiences.map((n) => (
                <Grid item key={n.id} xs={12} sm={6} md={4}>
                    <ExperienceCard key={"nk"+n.id}  {...n}></ExperienceCard>
                </Grid>
                ))}
            </Grid>

            <Box m={1} />

            <Alert severity="success" >My passions</Alert>

            <Box m={1} />
            <Grid container spacing={4}>
                {passions.map((n) => (
                <Grid item key={n.id} xs={12} sm={6} md={4}>
                    <ExperienceCard key={"nk"+n.id}  {...n}></ExperienceCard>
                </Grid>
                ))}
            </Grid>

        </Box>

    )
}