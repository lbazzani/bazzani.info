'use client';

import { Dialog, DialogContent, IconButton, Box, Typography, Avatar, CardMedia, Chip, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { useEffect, useState } from 'react';
import 'highlight.js/styles/github-dark.css';

interface ExperienceModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  logo: string;
  image: string;
  mdDetail?: string;
  mdAdditional?: string;
}

export default function ExperienceModal({
  open,
  onClose,
  title,
  subtitle,
  logo,
  image,
  mdDetail,
  mdAdditional
}: ExperienceModalProps) {
  const [markdownDescription, setMarkdownDescription] = useState("");
  const [markdownAdditional, setMarkdownAdditional] = useState("");

  useEffect(() => {
    if (open && mdDetail) {
      fetch(`/markdown/${mdDetail}`)
        .then(response => response.text())
        .then(data => setMarkdownDescription(data))
        .catch(error => console.error('Error loading markdown:', error));
    }
  }, [open, mdDetail]);

  useEffect(() => {
    if (open && mdAdditional) {
      fetch(`/markdown/${mdAdditional}`)
        .then(response => response.text())
        .then(data => setMarkdownAdditional(data))
        .catch(error => console.error('Error loading additional markdown:', error));
    }
  }, [open, mdAdditional]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          maxHeight: '92vh',
          overflow: 'hidden',
        }
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 20,
          top: 20,
          zIndex: 1300,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(8px)',
          '&:hover': {
            bgcolor: 'white',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.2s ease',
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 0, overflow: 'auto' }}>
        {/* Hero Image with Gradient Overlay */}
        {image && (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: { xs: '240px', md: '320px' },
              overflow: 'hidden',
              bgcolor: '#f5f5f5',
            }}
          >
            <CardMedia
              component="img"
              image={`/img/${image}`}
              alt={title}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {/* Gradient overlay for better text readability */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '60%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)',
              }}
            />
          </Box>
        )}

        <Box sx={{ p: { xs: 3, md: 5 }, maxWidth: '900px', mx: 'auto' }}>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, mb: 2 }}>
              <Avatar
                src={`/img/${logo}.png`}
                sx={{
                  width: { xs: 64, md: 80 },
                  height: { xs: 64, md: 80 },
                  border: '3px solid',
                  borderColor: '#d35400',
                  boxShadow: '0 4px 12px rgba(211, 84, 0, 0.2)',
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h3"
                  component="h2"
                  sx={{
                    fontWeight: 700,
                    color: '#2c3e50',
                    fontSize: { xs: '1.75rem', md: '2.25rem' },
                    lineHeight: 1.2,
                    mb: 1,
                  }}
                >
                  {title}
                </Typography>
                {subtitle && (
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#d35400',
                      fontWeight: 500,
                      fontSize: { xs: '1rem', md: '1.15rem' },
                      lineHeight: 1.4,
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {markdownDescription && <Divider sx={{ my: 4 }} />}

          {/* Main Content */}
          <Box
            sx={{
              '& p': {
                marginBottom: 2.5,
                lineHeight: 1.8,
                color: 'text.secondary',
                fontSize: '1rem',
              },
              '& strong': {
                color: 'text.primary',
                fontWeight: 600,
              },
              '& ul': {
                paddingLeft: 3,
                marginTop: 2,
                marginBottom: 3,
              },
              '& li': {
                marginBottom: 1.5,
                lineHeight: 1.7,
                color: 'text.secondary',
                '&::marker': {
                  color: '#d35400',
                },
              },
              '& h1, & h2': {
                color: '#2c3e50',
                marginTop: 4,
                marginBottom: 2.5,
                fontWeight: 700,
                fontSize: { xs: '1.5rem', md: '1.75rem' },
                position: 'relative',
                paddingBottom: 1.5,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  width: '60px',
                  height: '3px',
                  background: 'linear-gradient(135deg, #d35400 0%, #e67e22 100%)',
                  borderRadius: '2px',
                },
              },
              '& h3': {
                color: '#2c3e50',
                marginTop: 3,
                marginBottom: 2,
                fontWeight: 600,
                fontSize: { xs: '1.25rem', md: '1.4rem' },
              },
              '& code': {
                bgcolor: '#f5f5f5',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.9em',
                color: '#d35400',
              },
              '& pre': {
                bgcolor: '#1e1e1e',
                borderRadius: '8px',
                padding: 3,
                overflow: 'auto',
                marginY: 3,
                '& code': {
                  bgcolor: 'transparent',
                  color: 'inherit',
                  padding: 0,
                },
              },
              '& table': {
                width: '100%',
                borderCollapse: 'collapse',
                marginY: 3,
                border: '1px solid',
                borderColor: 'divider',
              },
              '& th': {
                bgcolor: '#fff5f0',
                color: '#2c3e50',
                fontWeight: 600,
                padding: 2,
                textAlign: 'left',
                borderBottom: '2px solid #d35400',
              },
              '& td': {
                padding: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
              },
              '& tr:hover': {
                bgcolor: '#fafafa',
              },
              '& blockquote': {
                borderLeft: '4px solid #d35400',
                paddingLeft: 2,
                marginLeft: 0,
                marginY: 2,
                color: 'text.secondary',
                fontStyle: 'italic',
              },
              '& del': {
                color: 'text.disabled',
                textDecoration: 'line-through',
              },
              '& input[type="checkbox"]': {
                marginRight: 1,
                accentColor: '#d35400',
              },
            }}
          >
            {mdDetail && markdownDescription && (
              <Box sx={{ mb: 4 }}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeHighlight]}
                >
                  {markdownDescription}
                </ReactMarkdown>
              </Box>
            )}

            {(mdAdditional && markdownAdditional) && (
              <>
                <Divider sx={{ my: 5 }} />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 4,
                  }}
                >
                  <Chip
                    label="Additional Information"
                    sx={{
                      bgcolor: '#d35400',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      height: '32px',
                      '& .MuiChip-label': {
                        px: 2,
                      },
                    }}
                  />
                </Box>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeHighlight]}
                >
                  {markdownAdditional}
                </ReactMarkdown>
              </>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
