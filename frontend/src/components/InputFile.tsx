// @flow
import * as React from 'react';
import {MutableRefObject, useRef, useState} from 'react';
import {InputAdornment, TextField, TextFieldProps} from "@material-ui/core";

interface InputFileProps {
    ButtonFile: React.ReactNode;
    InputFileProps?: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    TextFieldProps?: TextFieldProps;
}

const InputFile: React.FC<InputFileProps>= (props) => {
    const fileRef = useRef() as MutableRefObject<HTMLInputElement>;
    const [fileName, setFileName] = useState("");

    const textFieldProps: TextFieldProps = {
        variant: "outlined",
        ...props.TextFieldProps,
        InputProps: {
            ...(
                props.TextFieldProps && props.TextFieldProps.InputProps &&
                {...props.TextFieldProps.InputProps}
            ),
            readOnly: true,
            endAdornment: (
                <InputAdornment position={"end"}>
                    {props.ButtonFile}
                </InputAdornment>
            )
        },
        value: fileName
    };

    const inputFileProps = {
        ...props.InputFileProps,
        hidden: true,
        ref: fileRef,
        onChange(event){
            const files = event.target.files;
            if(files.length){
                setFileName(Array.from(files).map((file: any) => file.name).join(', '));
            }
            if(props.InputFileProps && props.InputFileProps.onChange){
                props.InputFileProps.onChange(event)
            }
        }
    }

    return (
        <>
            <input type="file" {...inputFileProps} />
            <TextField {...textFieldProps} />
        </>
    );
};

export default InputFile