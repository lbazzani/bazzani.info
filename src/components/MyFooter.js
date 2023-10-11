import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { Facebook, Instagram, LinkedIn } from "@mui/icons-material";
import { Box } from "@mui/material";

export default function MyFooter() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
        p:0.5,
        width: "100%",
        position: "relative", 
        bottom: 0
        
      }}
      
    >
      <Container maxWidth="lg"  >
        <Grid container spacing={0.5}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" >
              Privacy
            </Typography>
            <Typography variant="caption" color="text.secondary">
            This site does not store cookies or personal data. The application is for demonstration purposes only and is not to be used for commercial purposes.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4} >
            <Stack direction={"column"}>
              <Typography variant="h6" color="text.primary" >
                Contact Me
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Lorenzo Bazzani
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Email: lorenzo@bazzani.info
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Phone: +39 348 3672370
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" >
              Follow Me
            </Typography>
            <Link href="https://www.linkedin.com/in/lorenzo-bazzani" color="inherit">
              <LinkedIn />
            </Link>
            <Link
              href="https://www.instagram.com/lbazzani"
              color="inherit"
              sx={{ pl: 1, pr: 1 }}
            >
              <Instagram />
            </Link>
            <Link href="https://www.facebook.com/lorenzo.bazzani" color="inherit">
              <Facebook />
            </Link>
          </Grid>
        </Grid>
        {/*
        <Box mt={2}>
          <Typography variant="caption" color="text.secondary" align="center">
            {"Copyright © "}
            <Link color="inherit" href="https://bazml.com/">
              bazml.com
            </Link>{" "}
            {new Date().getFullYear()}
            {"."}
          </Typography>
        </Box>
        */}
      </Container>
    </Box>
  );
}
