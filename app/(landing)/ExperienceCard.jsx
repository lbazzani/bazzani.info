
import { styled } from '@mui/material/styles';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import { Card } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

import ExperienceCardAdditional from "./ExperienceCardAdditional"




export default async function ExperienceCard(n) {

    var markdownDescription ="";

    if(n.mdDetail){
        const fs = require('fs').promises;
        const path = require('path');
        const filePath = path.join(process.cwd(), 'public', 'markdown', n.mdDetail);
        markdownDescription = await fs.readFile(filePath, 'utf8');
    }

    return (
        <Card>
          {n.title && ( 
            <CardHeader sx={{ display: 'flex', flexDirection: 'row', alignContent: 'space-between' }}
              avatar={
                <Avatar sx={{ bgcolor: "#FFFFFF" }} aria-label="recipe"
                  src={`/img/${n.logo}.png`}
                  >
                </Avatar>
              }
              title={n.title}

            />
          )}
          {n.image &&
          <CardMedia
            component="img"
            height="200"
            sx={{}}
            image={`/img/${n.image}`}
            alt="random"
          />
          }

          <CardContent sx={{  marginBottom: 0}}>
            <Typography gutterBottom variant="body2" component="h2" sx={{ textAlign: 'justify' }}>
              {n.detail && (
                n.detail
              )}
              {n.mdDetail && (
                <ReactMarkdown>{markdownDescription}</ReactMarkdown>
              )}
            </Typography>
          </CardContent>
          
          <ExperienceCardAdditional n={n}></ExperienceCardAdditional>
           

          

        </Card>
    );
}

