import React from 'react';
import './App.css'
import {Navbar} from "./components/Navbar";
import {Page} from "./components/Page";
import {Box} from "@material-ui/core";

const App: React.FC = () => {
  return (
      <React.Fragment>
        <Navbar />
        <Box paddingTop={'70px'}>

        </Box>
        <Page title={'Categorias'}>
          Conteudo
        </Page>
      </React.Fragment>
  );
};

export default App;