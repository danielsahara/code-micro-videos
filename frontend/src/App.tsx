import React from 'react';
import './App.css'
import {Navbar} from "./components/Navbar";
import {Page} from "./components/Page";
import {Box, MuiThemeProvider} from "@material-ui/core";
import {BrowserRouter} from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import Breadcrumbs from "./components/Breadcrumbs";
import theme from "./theme";

const App: React.FC = () => {
  return (
      <React.Fragment>
          <MuiThemeProvider theme={theme}>
              <BrowserRouter>
                  <Navbar />
                  <Box paddingTop={'70px'}>
                      <Breadcrumbs />
                      <AppRouter />
                  </Box>
              </BrowserRouter>
          </MuiThemeProvider>
      </React.Fragment>
  );
};

export default App;