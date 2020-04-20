// @flow
import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn, MUIDataTableOptions, MUIDataTableProps} from "mui-datatables";
import {merge, omit, cloneDeep} from 'lodash';
import {MuiThemeProvider, Theme, useTheme} from "@material-ui/core";

export interface TableColumn  extends MUIDataTableColumn{
    width?: string
}
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

const Table : React.FC<TableProps> = (props) => {

    function extractMuiDataTableColumns(columns: TableColumn[]) : MUIDataTableColumn[] {
        setColumnsWidth(columns);
        return columns.map(column => omit(column, 'width'))
    }

    function setColumnsWidth(columns: TableColumn[]) {
        columns.forEach((column, key) => {
            if(column.width){
                const overrides = theme.overrides as any;
                overrides.MUIDataTableHeadCell.fixedHeaderCommon[`&:nth-child(${key + 2})`] = {
                    width: column.width
                };
            }
        })
    }

    const theme = cloneDeep<Theme>(useTheme());

    const newProps = merge(
        {options: defaultOptions},
        props,
        {columns: extractMuiDataTableColumns(props.columns)});

    return (
        <MuiThemeProvider theme={theme}>
            <MUIDataTable {...newProps} />
        </MuiThemeProvider>

    );
};

interface TableProps extends MUIDataTableProps{
    columns: TableColumn[];
}

export default Table;