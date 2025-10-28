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
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.grey[50]
            : theme.palette.grey[900],
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 4,
        px: 2,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
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

          <Grid item xs={12} sm={4}>
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

          <Grid item xs={12} sm={4}>
            <Typography
              variant="h6"
              color="text.primary"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Follow Me
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                component={Link}
                href="https://www.linkedin.com/in/lorenzo-bazzani"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#0077b5',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 119, 181, 0.08)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <LinkedIn />
              </IconButton>
              <IconButton
                component={Link}
                href="https://www.instagram.com/lbazzani"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#E4405F',
                  '&:hover': {
                    backgroundColor: 'rgba(228, 64, 95, 0.08)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Instagram />
              </IconButton>
              <IconButton
                component={Link}
                href="https://www.facebook.com/lorenzo.bazzani"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#1877F2',
                  '&:hover': {
                    backgroundColor: 'rgba(24, 119, 242, 0.08)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Facebook />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
          >
            © {new Date().getFullYear()} Lorenzo Bazzani. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
