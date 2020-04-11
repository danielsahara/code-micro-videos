import {createMuiTheme} from "@material-ui/core";

const theme = createMuiTheme({
    palette:{
        primary: {
            main: '#79aec8',
            contrastText: '#fff'
        },
        secondary:{
            main: '#4db5ab',
            contrastText: '#fff'
        },
        background:{
            default: '#fafafa'
        }
    },
    overrides:{
        // MuiFormLabel: {
        //     root:{
        //         fontSize: '1.2rem',
        //         fontWeight: 500
        //     }
        // }
        MuiInputBase:{
            input:{

            }
        }
    }
});

export default theme;