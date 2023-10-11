import AppBar from '@mui/material/AppBar';
import CameraIcon from '@mui/icons-material/PhotoCamera';
import Toolbar from '@mui/material/Toolbar';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import PropTypes from 'prop-types';


  
function HideOnScroll(props) {
  const { children, window } = props;
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}


HideOnScroll.propTypes = {
  children: PropTypes.element.isRequired,
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

//sticky ?

export default function MyAppBar(props) {
    return (
      <>
      <HideOnScroll {...props}>
        <AppBar color ="inherit" position="fixed">
          <Toolbar>
            <Typography variant="h6" component="div">
              {props.title}
            </Typography>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Toolbar />
      </>
    );
  }

