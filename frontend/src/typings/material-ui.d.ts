import {ComponentNameToClassKey} from '@material-ui/core/styles/overrides';

declare module  '@material-ui/core/styles/overrides'{
    interface ComponentNameToClassKey {
        MUIDataTable: any;
        MUIDataTableToolbar: any;
        MUIDataTableHeadCell: any;
        MUIDataTableSortLabel: any;
        MUIDataTableSelectedCell: any;
        MUIDataTableBodyCell: any;
        MUIDataTableToolbarSelect: any;
        MUIDataTableBodyrow: any;
        MUITablePagination: any;
    }
}