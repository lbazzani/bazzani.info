'use client';

import { useState, useEffect } from "react";
import { styled } from '@mui/material/styles';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

interface ExperienceCardAdditionalProps {
  mdAddittional?: string;
  additional?: string;
}

interface ExpandMoreProps {
  expand: boolean;
  onClick: () => void;
  'aria-expanded': boolean;
  'aria-label': string;
  children: React.ReactNode;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

export default function ExperienceCardAdditional({ mdAddittional, additional }: ExperienceCardAdditionalProps) {
  const [expanded, setExpanded] = useState(false);
  const [markdownAdditional, setMarkdownAdditional] = useState('');

  useEffect(() => {
    if (mdAddittional) {
      axios.get(`/markdown/${mdAddittional}`)
        .then((response) => {
          setMarkdownAdditional(response.data);
        })
        .catch((error) => {
          console.error('Error fetching markdown file:', error);
        });
    }
  }, [mdAddittional]);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  if (!additional && !mdAddittional) {
    return null;
  }

  return (
    <>
      <CardActions
        disableSpacing
        sx={{
          pt: 0,
          pb: 1,
          px: 2,
        }}
      >
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          {!expanded && (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#d35400',
              }}
            >
              Read more
            </Typography>
          )}
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent
          sx={{
            pt: 0,
            px: 2,
            pb: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="body2"
            component="div"
            sx={{
              textAlign: 'justify',
              lineHeight: 1.7,
              color: 'text.secondary',
              '& p': {
                marginBottom: 1.5,
              },
              '& strong': {
                color: 'text.primary',
                fontWeight: 600,
              },
              '& ul': {
                paddingLeft: 2,
                marginTop: 1,
              },
              '& li': {
                marginBottom: 0.5,
              },
            }}
          >
            {additional && additional}
            {mdAddittional && <ReactMarkdown>{markdownAdditional}</ReactMarkdown>}
          </Typography>
        </CardContent>
      </Collapse>
    </>
  );
}
