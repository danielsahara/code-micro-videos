import * as React from 'react';
import {Box, Button, ButtonProps, Checkbox, TextField, Theme} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import useForm from "react-hook-form";
import categoryHttp from "../../util/http/category-http";

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit:{
            margin: theme.spacing(1)
        }
    }
});

export const Form = () => {

    const classes = useStyles();

    const buttonProps: ButtonProps = {
        className: classes.submit,
        variant: "contained",
        // size: "medium"
    };

    const {register, handleSubmit, getValues} = useForm({
        defaultValues:{
            is_Active: true
        }
    });

    function onSubmit(formData, event) {
        categoryHttp
            .create(formData)
            .then((response) => console.log(response));
    }

    return(
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                inputRef={register}
                name="name"
                label="Nome"
                fullWidth
                variant={"outlined"}
            />
            <TextField
                inputRef={register}
                name="description"
                label="Descrição"
                multiline
                rows="4"
                fullWidth
                variant={"outlined"}
                margin={"normal"}
            />
            <Checkbox
                name="is_active"
                color={"primary"}
                inputRef={register}
                defaultChecked
            />
            Ativo?
            <Box dir={"rtl"}>
                <Button color={"primary"} {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type={"submit"}>Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};