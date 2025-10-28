'use client';

import { styled } from '@mui/material/styles';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Card, Box } from '@mui/material';
import { useState } from 'react';
import ExperienceModal from './ExperienceModal';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface ExperienceCardProps {
  logo: string;
  image: string;
  title: string;
  subtitle?: string;
  mdDetail?: string;
  mdAdditional?: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  borderRadius: '12px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid',
  borderColor: '#e8e8e8',
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  cursor: 'pointer',
  height: '160px',
  width: '100%',

  '&:hover': {
    transform: 'translateX(4px)',
    boxShadow: '0 8px 24px rgba(211, 84, 0, 0.15)',
    borderColor: '#d35400',

    '& .card-image': {
      transform: 'scale(1.05)',
    },

    '& .read-more-badge': {
      opacity: 1,
      transform: 'translateY(0)',
    },

    '& .arrow-icon': {
      transform: 'translateX(4px)',
    },
  },

  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    height: 'auto',
  },
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  width: '200px',
  minWidth: '200px',
  backgroundColor: '#f5f5f5',

  [theme.breakpoints.down('sm')]: {
    width: '100%',
    height: '180px',
  },
}));

const StyledCardMedia = styled(CardMedia)<{ component?: React.ElementType; alt?: string }>({
  width: '100%',
  height: '100%',
  transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  objectFit: 'cover',
});

export default function ExperienceCard(props: ExperienceCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleCardClick = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <StyledCard elevation={0} onClick={handleCardClick}>
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

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minWidth: 0,
          }}
        >
          <CardHeader
            sx={{
              pb: 1,
              '& .MuiCardHeader-title': {
                fontSize: '1.1rem',
                fontWeight: 600,
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              },
              '& .MuiCardHeader-subheader': {
                fontSize: '0.85rem',
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                marginTop: '4px',
              }
            }}
            avatar={
              <Avatar
                sx={{
                  bgcolor: "#FFFFFF",
                  border: '2px solid',
                  borderColor: 'divider',
                  width: 40,
                  height: 40,
                }}
                src={`/img/${props.logo}.png`}
              />
            }
            title={props.title}
            subheader={props.subtitle}
          />

          <CardContent
            sx={{
              flexGrow: 1,
              pt: 0,
              pb: 2,
              pr: 3,
              position: 'relative',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.6,
                fontSize: '0.875rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                pr: 2,
                pb: 4,
              }}
            >
              {props.subtitle || 'Click to discover more about this experience...'}
            </Typography>
          </CardContent>
        </Box>

        {/* Read More Badge - Positioned absolutely in bottom right */}
        <Box
          className="read-more-badge"
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            padding: '6px 12px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #fff5f0 0%, #ffe8db 100%)',
            border: '1px solid',
            borderColor: '#ffcdb5',
            opacity: 0.8,
            transform: 'translateY(2px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#d35400',
              fontWeight: 600,
              fontSize: '0.7rem',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Read more
          </Typography>
          <ArrowForwardIcon
            className="arrow-icon"
            sx={{
              fontSize: 14,
              color: '#d35400',
              transition: 'transform 0.3s ease',
            }}
          />
        </Box>
      </StyledCard>

      <ExperienceModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={props.title}
        subtitle={props.subtitle}
        logo={props.logo}
        image={props.image}
        mdDetail={props.mdDetail}
        mdAdditional={props.mdAdditional}
      />
    </>
  );
}
