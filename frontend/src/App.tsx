import React from 'react';
import './App.css'
import {Navbar} from "./components/Navbar";
import {Page} from "./components/Page";
import {Box, CssBaseline, MuiThemeProvider} from "@material-ui/core";
import {BrowserRouter} from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import Breadcrumbs from "./components/Breadcrumbs";
import theme from "./theme";
import {SnackbarProvider} from "./components/SnackbarProvider";
import Spinner from "./components/Spinner";
import LoadingContext from "./components/loading/LoadingContext";

const App: React.FC = () => {
  return (
      <React.Fragment>
          <LoadingContext.Provider value={false}>
              <MuiThemeProvider theme={theme}>
                  <CssBaseline />
                  <SnackbarProvider>
                      <BrowserRouter>
                          <Spinner/>
                          <Navbar />
                          <Box paddingTop={'70px'}>
                              <Breadcrumbs />
                              <AppRouter />
                          </Box>
                      </BrowserRouter>
                  </SnackbarProvider>
              </MuiThemeProvider>
          </LoadingContext.Provider>
      </React.Fragment>
  );
};

export default App;