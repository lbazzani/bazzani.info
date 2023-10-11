import * as React from 'react';
import { PwaUpdater } from 'pwa-updater';
import { useState, useEffect, useRef } from "react";
import CssBaseline from '@mui/material/CssBaseline';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import MyAppBar from './components/MyAppBar';

import IntelligentCV from './components/icv/IntelligentCV';
import MainPage from './components/main/MainPage';

import MyFooter from './components/MyFooter';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {Switch, Case} from "./lib/Switch";


const theme = createTheme();



var route=window.location.pathname.replace("/","");
console.log("Route: " + route);

function App() {
  const [value, setValue] = useState("main");
  const ref = useRef(null);

  return (
    <ThemeProvider theme={theme}>
      <PwaUpdater notify={true} />
      <Container style={{ height: '100vh', width: '100%'}}>

        <CssBaseline />
        
        <Switch test={route}>
          <Case value="icv">
            <MyAppBar title="Intelligent CV"/>
            <IntelligentCV />
          </Case>
          <Case default>
            <MyAppBar title="Lorenzo Bazzani"/>
            <MainPage />
          </Case>
        </Switch>
        

        <MyFooter />
      </Container>
      
    </ThemeProvider>

  );
}


export default App;
