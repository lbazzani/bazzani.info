'use client';

import * as React from 'react';
import { useState, useEffect } from "react";
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




export default function ExperienceCardAdditional({n}) {
    const [expanded, setExpanded] = React.useState(false);
    const [markdownAdditional, setMarkdownAddittional] = useState('');

    useEffect(() => {

      if(n.mdAddittional){
        axios.get('/markdown/'+n.mdAddittional)
        .then((response) => {
          setMarkdownAddittional(response.data);
        })
        .catch((error) => {
          console.error('Errore nel recupero del file Markdown', error);
        });
      }

    }, []);

    const ExpandMore = styled((props) => {
        const { expand, ...other } = props;
        return <IconButton {...other} />;
      })(({ theme, expand }) => ({
        transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
          duration: theme.transitions.duration.shortest,
        }),
    }));
    
    const handleExpandClick = () => {
      setExpanded(!expanded);
    };

  

    return (<>
        {(n.additional || n.mdAddittional)? ( <>
          <CardActions disableSpacing sx={{  marginTop: -5}} >

            <ExpandMore
              expand={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              {!expanded && (
              <Typography gutterBottom variant="body2" component="h2" sx={{  flex: "row", alignSelf: "flex-end"}}>
              More Detail
              </Typography>
              )}
              <ExpandMoreIcon />
            </ExpandMore>
           
          </CardActions>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent sx={{ flexGrow: 1 , marginTop: -6}}>
              <Typography gutterBottom variant="body2" component="h2" sx={{ textAlign: 'justify' }}>
                {n.additional && (
                  n.additional
                )}
                {n.mdAddittional && (
                  <ReactMarkdown>{markdownAdditional}</ReactMarkdown>
                )}
              </Typography>

            </CardContent>
          </Collapse>
          </>):""}
    </>
    );
}

