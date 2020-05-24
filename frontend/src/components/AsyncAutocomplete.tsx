// @flow 
import * as React from 'react';
import {Autocomplete, AutocompleteProps} from "@material-ui/lab";
import {TextField, TextFieldProps} from "@material-ui/core";
import {useState} from "react";

interface AsyncAutocompleteProps {
    TextFieldProps?: TextFieldProps
}

const AsyncAutocomplete: React.FC<AsyncAutocompleteProps> = (props) => {
    const [open, setOpen] = useState(true);
    const [searchText, setSearchText] = useState("");

    const textFieldProps: TextFieldProps = {
        margin: "normal",
        variant: "outlined",
        fullWidth: true,
        InputLabelProps: {shrink: true},
            ...(props.TextFieldProps && {...props.TextFieldProps}),
    };

    const autocompleteProps: AutocompleteProps = {
        open,
        onOpen(){
            setOpen(true);
        },
        onClose(){
            setOpen(false);
        },
        onInputChange(event, value){
            setSearchText(value)
        },
        renderInput: params => (
            <TextField {...params}
                       {...textFieldProps}
            />
        )
    };

    return (
        <Autocomplete {...autocompleteProps} />

    );
};

export default AsyncAutocomplete;