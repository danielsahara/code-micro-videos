// @flow 
import * as React from 'react';
import {Autocomplete, AutocompleteProps} from "@material-ui/lab";
import {CircularProgress, InputAdornment, TextField, TextFieldProps} from "@material-ui/core";
import {useState} from "react";

interface AsyncAutocompleteProps {
    TextFieldProps?: TextFieldProps
}

const AsyncAutocomplete: React.FC<AsyncAutocompleteProps> = (props) => {
    const [open, setOpen] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);

    const textFieldProps: TextFieldProps = {
        margin: "normal",
        variant: "outlined",
        fullWidth: true,
        InputLabelProps: {shrink: true},
            ...(props.TextFieldProps && {...props.TextFieldProps}),
    };

    const autocompleteProps: AutocompleteProps = {
        open,
        options,
        loading: loading,
        loadingText: "Carregando...",
        noOptionsText: 'Nenhum item encontrado',
        onOpen(){
            setOpen(true);
        },
        onClose(){
            setOpen(false);
        },
        onInputChange(event, value){
            setSearchText(value)
        },
        renderInput: params => {
            return <TextField
                {...params}
                {...textFieldProps}
                InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                        <>
                            {loading && <CircularProgress color={"inherit"} size={20} />}
                            {params.InputProps.endAdornment}
                        </>
                    )
                }}
            />
        }
    };

    return (
        <Autocomplete {...autocompleteProps} />

    );
};

export default AsyncAutocomplete;