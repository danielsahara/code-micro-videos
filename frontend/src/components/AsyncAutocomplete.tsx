// @flow 
import * as React from 'react';
import {Autocomplete, AutocompleteProps} from "@material-ui/lab";
import {CircularProgress, InputAdornment, TextField, TextFieldProps} from "@material-ui/core";
import {useEffect, useState} from "react";
import categoryHttp from "../util/http/category-http";
import castMemberHttp from "../util/http/cast-member-http";
import videoHttp from "../util/http/video-http";
import {useSnackbar} from "notistack";

interface AsyncAutocompleteProps {
    fetchOptions: (searchText) => Promise<any>
    TextFieldProps?: TextFieldProps
}

const AsyncAutocomplete: React.FC<AsyncAutocompleteProps> = (props) => {
    const [open, setOpen] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);

    const snackbar = useSnackbar();

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

    useEffect(() => {
        let isSubscribed = true;

        (async() => {
            setLoading(true);

            try {
                const {data} = await props.fetchOptions(searchText)

                if(isSubscribed){
                    setOptions(data);
                }
            }
            catch (error) {
                console.error(error);
                snackbar.enqueueSnackbar('Não foi possivel carregar as informaçoes', {variant: 'error'})
            }
            finally {
                setLoading(false)
            }
        })();
        return () => {
            isSubscribed = false;
        }
    }, [searchText]);

    return (
        <Autocomplete {...autocompleteProps} />

    );
};

export default AsyncAutocomplete;