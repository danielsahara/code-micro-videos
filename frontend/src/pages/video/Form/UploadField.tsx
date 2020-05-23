// @flow 
import * as React from 'react';
import {
    Box, Button,
    FormControl,
    FormControlLabel,
    FormControlLabelProps,
    FormControlProps,
    FormHelperText,
    FormLabel,
    Radio,
    RadioGroup
} from "@material-ui/core";
import Rating from "../../../components/Ratings";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import InputFile from "../../../components/InputFile";

interface UploadFieldProps {
    accept: string,
    label: string;
    setValue: (value) => void;
    error?: any;
    disabled?: boolean;
    FormControlProps?: FormControlProps;
};


export const UploadField: React.FC<UploadFieldProps> = (props) => {
    const {accept, label, setValue,  error, disabled} = props;

    return (
        <FormControl margin={"none"}
             error={error !== undefined}
             disabled={disabled === true}
             {...props.FormControlProps}
        >
            <InputFile
                TextFieldProps={{
                    label: label,
                    InputLabelProps: {shrink: true}
                }}
                InputFileProps={{
                    accept: accept,
                    onChange(event){
                        const files = event.target.files as any;
                        files.length && setValue(files[0])
                    }
                }}
                ButtonFile={
                    <Button
                        endIcon={<CloudUploadIcon />}
                        variant={"contained"}
                        color={"primary"}
                        onClick={() => {}}
                    >
                        Adicionar
                    </Button>
                }
            />
        </FormControl>
    );
};