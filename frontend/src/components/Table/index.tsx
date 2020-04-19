// @flow
import * as React from 'react';
import MUIDataTable, {MUIDataTableOptions, MUIDataTableProps} from "mui-datatables";
import {merge} from 'lodash';

const defaultOptions: MUIDataTableOptions= {
  print: false,
  download: false,
  textLabels: {
      body:{
          noMatch: "Nenhum registro encontrado",
          toolTip: "Classificar"
      },
      pagination:{
          next: "Próxima página",
          previous: "Página anterior",
          rowsPerPage: "Por página",
          displayRows: "de",
      },
      toolbar:{
          search: "Busca",
          downloadCsv: "Donwload CSV",
          print: "Imprinir",
          viewColumns: "Ver colunas",
          filterTable: "Filtrar Tabelas",
      },
      filter:{
          all: "Todos",
          title: "FILTROS",
          reset: "LIMPAR",
      },
      viewColumns:{
          title: "Ver Colunas",
          titleAria: "Ver/Esconder colunas da tabela",
      },
      selectedRows:{
          text: "registro(s) selecionados",
          delete: "Excluir",
          deleteAria: "Excluir registros seleiconados",
      }
  }

};

interface TableProps extends MUIDataTableProps{

}

const Table : React.FC<TableProps> = (props) => {

    const newProps = merge({options: defaultOptions}, props);

    return (
        <MUIDataTable {...newProps} />
    );
};

export default Table;