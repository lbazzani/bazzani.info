import * as React from 'react';
import { useState, useEffect } from "react";
import { styled } from '@mui/material/styles';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardHeader from '@mui/material/CardHeader';
import CardActionArea from '@mui/material/CardActionArea';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import { red } from '@mui/material/colors';
import moment from "moment";

import { Card } from '@mui/material';



export default function ExperienceCard(n) {
    const [expanded, setExpanded] = React.useState(false);
    const [favorite, setFavorite] = React.useState(n.favorite);


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
        <Card >
          <CardHeader sx={{ display: 'flex', flexDirection: 'row', alignContent: 'space-between' }}
            avatar={
              <Avatar sx={{ bgcolor: "#FFFFFF" }} aria-label="recipe"
                src={`${process.env.PUBLIC_URL}/img/${n.logo}.png`}
                >
              </Avatar>
            }
            title={n.title}

          />
          <CardMedia
            component="img"
            height="200"
            sx={{}}
            image={`${process.env.PUBLIC_URL}/img/${n.image}`}
            alt="random"
          />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography gutterBottom variant="body2" component="h2">
              {n.detail}
            </Typography>
          </CardContent>
 
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent>
              <Typography paragraph>{n.article_body}</Typography>
            </CardContent>
          </Collapse>
        </Card>
    );
}

