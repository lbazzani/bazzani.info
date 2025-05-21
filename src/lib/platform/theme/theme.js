
'use client';
import { createTheme } from '@mui/material/styles';
const theme = createTheme({
    palette: {
      primary: {
        main: "#F15A24",
      },
      background: {
        default: '#F5F5F5',  // Colore di background per tutto l'app
        paper: '#FFFFFF',     // Background per elementi "paper"
      },
    },
});

export default theme;