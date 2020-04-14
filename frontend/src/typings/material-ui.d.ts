import {ComponentNameToClassKey} from '@material-ui/core/styles/overrides';
import {PaletteOptions, Pallete} from "@material-ui/core/styles/createPalette";


declare module  '@material-ui/core/styles/overrides'{
    interface ComponentNameToClassKey {
        MUIDataTable: any;
        MUIDataTableToolbar: any;
        MUIDataTableHeadCell: any;
        MUIDataTableSortLabel: any;
        MUIDataTableSelectedCell: any;
        MUIDataTableBodyCell: any;
        MUIDataTableToolbarSelect: any;
        MUIDataTableBodyRow: any;
        MUIDataTablePagination: any;
    }
}

declare module '@material-ui/core/styles/createPalette'{
    import {PaletteColorOptions} from "@material-ui/core";
    import {PaletteColor} from "@material-ui/core/styles/createPalette";

    interface Palette{
        success: PaletteColor
    }

    interface PaletteOptions {
        success?: PaletteColorOptions
    }
}