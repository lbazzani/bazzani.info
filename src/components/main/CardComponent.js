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
import YouTube from 'react-youtube';



export default function ExperienceCard(n) {
    const [expanded, setExpanded] = React.useState(false);
    const [favorite, setFavorite] = React.useState(n.favorite);
    const [markdownDescription, setMarkdownDescription] = useState('');
    const [markdownAdditional, setMarkdownAddittional] = useState('');

    useEffect(() => {
      if(n.mdDetail){
        axios.get('/markdown/'+n.mdDetail)
        .then((response) => {
          setMarkdownDescription(response.data);
        })
        .catch((error) => {
          console.error('Errore nel recupero del file Markdown', error);
        });
      }

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

    function removeObjectWithId(arr, id) {
      const objWithIdIndex = arr.findIndex((obj) => obj.id === id);
    
      if (objWithIdIndex > -1) {
        arr.splice(objWithIdIndex, 1);
      }
    
      return arr;
    }

    const handlePersist = () => {
      let d=localStorage.getItem('favorites');
      var od=new Array();
      (d)&&(od=(JSON.parse(d)));
      if(favorite){
        setFavorite(false);
        removeObjectWithId(od, n.id);
      }
      else{
        setFavorite(true);
        var newFavorite={...n, favorite: true};
        od.unshift(newFavorite);
      }
      localStorage.setItem('favorites', JSON.stringify(od));
      
    };


    const handleShare = async () => {
      try {
        await navigator
          .share(n.site_link)
          .then(() =>
            console.log("Hooray! Your content was shared to tha world")
          );
      } catch (error) {
        console.log(`Oops! I couldn't share to the world because: ${error}`);
      }
    };



    return (
        <Card>
          <CardHeader sx={{ display: 'flex', flexDirection: 'row', alignContent: 'space-between' }}
            avatar={
              <Avatar sx={{ bgcolor: "#FFFFFF" }} aria-label="recipe"
                src={`${process.env.PUBLIC_URL}/img/${n.logo}.png`}
                >
              </Avatar>
            }
            title={n.title}

          />
          {n.image &&
          <CardMedia
            component="img"
            height="200"
            sx={{}}
            image={`${process.env.PUBLIC_URL}/img/${n.image}`}
            alt="random"
          />
          }
          {n.youtube && 
            <YouTube videoId={n.youtube} opts={{ width: "100%", playerVars: {autoplay: 1,} }} />
          }
          <CardContent sx={{  marginBottom: 0}}>
            <Typography gutterBottom variant="body2" component="h2">
              {n.detail && (
                n.detail
              )}
              {n.mdDetail && (
                <ReactMarkdown>{markdownDescription}</ReactMarkdown>
              )}
            </Typography>
          </CardContent>
          
          {(n.additional|| n.mdAddittional)? ( <>
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
              <Typography gutterBottom variant="body2">
              {n.additional && (
                n.additional
              )}
              {n.mdAddittional && (
                < ReactMarkdown>{markdownAdditional}</ReactMarkdown>
              )}
              </Typography>
            </CardContent>
          </Collapse>
          </>):""}
        </Card>
    );
}

