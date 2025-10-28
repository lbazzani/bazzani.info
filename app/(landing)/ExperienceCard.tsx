'use client';

import { styled } from '@mui/material/styles';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Card, Box } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';
import ExperienceCardAdditional from "./ExperienceCardAdditional";

interface ExperienceCardProps {
  logo: string;
  image: string;
  title: string;
  mdDetail?: string;
  detail?: string;
  mdAddittional?: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '12px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid',
  borderColor: '#e8e8e8',
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(135deg, #d35400 0%, #e67e22 100%)',
    transform: 'scaleX(0)',
    transformOrigin: 'left',
    transition: 'transform 0.3s ease',
  },

  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(211, 84, 0, 0.15)',
    borderColor: '#d35400',

    '&::before': {
      transform: 'scaleX(1)',
    },

    '& .card-image': {
      transform: 'scale(1.03)',
    },
  },
}));

const ImageContainer = styled(Box)({
  position: 'relative',
  overflow: 'hidden',
  height: 200,
  backgroundColor: '#f5f5f5',
});

const StyledCardMedia = styled(CardMedia)<{ component?: React.ElementType; alt?: string }>(({}) => ({
  height: '100%',
  transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
}));

export default function ExperienceCard(props: ExperienceCardProps) {
  const [markdownDescription, setMarkdownDescription] = useState("");

  useEffect(() => {
    if (props.mdDetail) {
      fetch(`/markdown/${props.mdDetail}`)
        .then(response => response.text())
        .then(data => setMarkdownDescription(data))
        .catch(error => console.error('Error loading markdown:', error));
    }
  }, [props.mdDetail]);

  return (
    <StyledCard elevation={0}>
      {props.title && (
        <CardHeader
          sx={{
            pb: 1,
            '& .MuiCardHeader-title': {
              fontSize: '1.1rem',
              fontWeight: 600,
              lineHeight: 1.3,
            }
          }}
          avatar={
            <Avatar
              sx={{
                bgcolor: "#FFFFFF",
                border: '2px solid',
                borderColor: 'divider',
                width: 48,
                height: 48,
              }}
              src={`/img/${props.logo}.png`}
            />
          }
          title={props.title}
        />
      )}

      {props.image && (
        <ImageContainer>
          <StyledCardMedia
            className="card-image"
            component="img"
            image={`/img/${props.image}`}
            alt={props.title}
          />
        </ImageContainer>
      )}

      <CardContent
        sx={{
          flexGrow: 1,
          pt: 2,
          '&:last-child': {
            pb: 2,
          }
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
          {props.detail && props.detail}
          {props.mdDetail && <ReactMarkdown>{markdownDescription}</ReactMarkdown>}
        </Typography>
      </CardContent>

      <ExperienceCardAdditional {...props} />
    </StyledCard>
  );
}
