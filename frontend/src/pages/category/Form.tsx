import * as React from 'react';
import {Box, Button, ButtonProps, Checkbox, TextField, Theme} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import useForm from "react-hook-form";
import categoryHttp from "../../util/http/category-http";
import * as yup from '../../util/vendor/yup';

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit:{
            margin: theme.spacing(1)
        }
    }
});

const validationSchema = yup.object().shape({
    name: yup.string()
        .label('Nome')
        .required()
        .max(255),
});

export const Form = () => {

    const classes = useStyles();

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: 'secondary',
        variant: "contained",
    };

    const {register, handleSubmit, getValues, errors} = useForm({
        validationSchema,
        // nativeValidation: true,
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
                name="name"
                label="Nome"
                fullWidth
                variant={"outlined"}
                inputRef={register}
                error={errors.name !== undefined}
                helperText={errors.name && errors.name.message}
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