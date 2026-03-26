'use client';

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { Facebook, Instagram, LinkedIn, Email, Phone } from "@mui/icons-material";
import { Box, IconButton, Divider } from "@mui/material";

export default function MyFooter() {
  return (
    <Box
      component="footer"
      sx={{
        background: (theme) =>
          theme.palette.mode === "light"
            ? 'linear-gradient(180deg, #f8f9fa 0%, #eef0f3 50%, #e8ebf0 100%)'
            : theme.palette.grey[900],
        position: 'relative',
        py: 6,
        px: 2,
        mt: 'auto',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #d35400, #e67e22, #f39c12, #e67e22, #d35400)',
          backgroundSize: '200% 100%',
          animation: 'gradientShift 4s ease infinite',
        },
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography
              variant="h6"
              color="text.primary"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Privacy
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.7 }}
            >
              This site does not store cookies or personal data. The application is for demonstration purposes only and is not to be used for commercial purposes.
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography
              variant="h6"
              color="text.primary"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Contact Me
            </Typography>
            <Stack spacing={1}>
              <Typography
                variant="body2"
                color="text.primary"
                sx={{ fontWeight: 500 }}
              >
                Lorenzo Bazzani
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Link
                  href="mailto:lorenzo@bazzani.info"
                  color="text.secondary"
                  underline="hover"
                  sx={{ fontSize: '0.875rem' }}
                >
                  lorenzo@bazzani.info
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Link
                  href="tel:+393483672370"
                  color="text.secondary"
                  underline="hover"
                  sx={{ fontSize: '0.875rem' }}
                >
                  +39 348 3672370
                </Link>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography
              variant="h6"
              color="text.primary"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Follow Me
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <IconButton
                component={Link}
                href="https://www.linkedin.com/in/lorenzo-bazzani"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#0077b5',
                  border: '2px solid rgba(0, 119, 181, 0.2)',
                  p: 1.2,
                  '&:hover': {
                    backgroundColor: '#0077b5',
                    color: '#fff',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 4px 12px rgba(0, 119, 181, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <LinkedIn sx={{ fontSize: 24 }} />
              </IconButton>
              <IconButton
                component={Link}
                href="https://www.instagram.com/lbazzani"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#E4405F',
                  border: '2px solid rgba(228, 64, 95, 0.2)',
                  p: 1.2,
                  '&:hover': {
                    backgroundColor: '#E4405F',
                    color: '#fff',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 4px 12px rgba(228, 64, 95, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Instagram sx={{ fontSize: 24 }} />
              </IconButton>
              <IconButton
                component={Link}
                href="https://www.facebook.com/lorenzo.bazzani"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#1877F2',
                  border: '2px solid rgba(24, 119, 242, 0.2)',
                  p: 1.2,
                  '&:hover': {
                    backgroundColor: '#1877F2',
                    color: '#fff',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 4px 12px rgba(24, 119, 242, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Facebook sx={{ fontSize: 24 }} />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(0, 0, 0, 0.06)' }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #d35400, #e67e22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.55rem',
              fontWeight: 800,
              color: '#fff',
              opacity: 0.7,
            }}
          >
            LB
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ fontSize: '0.8rem' }}
          >
            © {new Date().getFullYear()} Lorenzo Bazzani. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
