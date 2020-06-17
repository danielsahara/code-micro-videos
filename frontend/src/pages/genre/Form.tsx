import * as React from 'react';
import {useEffect, useState} from 'react';
import {Box, Button, ButtonProps, MenuItem, TextField, Theme} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import genreHttp from "../../util/http/genre-http";
import categoryHttp from "../../util/http/category-http";
import useForm from "react-hook-form";
import * as yup from "../../util/vendor/yup";
import {useHistory, useParams} from "react-router";
import {useSnackbar} from 'notistack';
import {Category, Genre} from "../../util/models";

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
    categories_id: yup.array().label('Categories').required(),
});

export const Form = () => {
    const {register, handleSubmit, getValues, setValue, watch, errors, reset} = useForm({
        validationSchema,
        defaultValues: {categories_id: []}
    });


    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();
    const history = useHistory();
    const {id} = useParams();
    const [genre, setGenre] = useState<Genre | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: 'secondary',
        variant: "contained",
        disabled: loading,
    };

    // const category = getValues()['categories_id'];

    useEffect(() => {
        register({name: "categories_id"})
    }, [register]);

    useEffect(() => {
       async function loadData() {
           setLoading(true);
           const promises = [categoryHttp.list({queryParams: {all: ''}})];

           if (id) {
               promises.push(genreHttp.get(id));
           }
           try {
               const [categoriesResponse, genreResponse] = await Promise.all(promises);
               setCategories(categoriesResponse.data.data);
               if (id) {
                   setGenre(genreResponse.data.data);
                   const categories_id = genreResponse.data.data.categories.map(category => category.id)
                   reset({
                       ...genreResponse.data.data,
                       categories_id
                   });
               }
           } catch (error) {
               console.error(error);
               enqueueSnackbar('Não foi possivel carregar as informaçoes', {variant: 'error'})
           } finally {
               setLoading(false);
           }
       }
       loadData();
    }, [id, reset, enqueueSnackbar]);

    async function onSubmit(formData, event) {
        setLoading(true);
        try{
            const http = !genre ?  genreHttp.create(formData) : genreHttp.update(id, formData);
            const {data} = await http;

            enqueueSnackbar('Genero salvo com sucesso', {variant: 'success'})

            setTimeout(() => {
                event ? (
                        id ? history.replace(`/genres/${data.data.id}/edit`) : history.push(`/genres/${data.data.id}/edit`)
                    )
                    : history.push('/genres');
            })
        }
        catch(error){
            console.log(error);
            enqueueSnackbar('Nao foi possivel salvar o genero', {variant: 'error'})
        }
        finally{
            setLoading(false)
        }
    }

    return(
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                name="name"
                label="Nome"
                fullWidth
                variant={"outlined"}
                inputRef={register}
                disabled={loading}
                error={errors.name !== undefined}
                helperText={errors.name && errors.name.message}
                InputLabelProps={{shrink: true}}
            />

            <TextField
                select
                name="categories_id"
                value={watch('categories_id')}
                label="Categorias"
                margin={'normal'}
                variant={'outlined'}
                fullWidth
                onChange={(e) => {
                    setValue('categories_id', e.target.value)
                }}
                SelectProps={{
                    multiple: true
                }}
                disabled={loading}
                error={errors.categories_id !== undefined}
                helperText={errors.categories_id && errors.categories_id.message}
                InputLabelProps={{shrink: true}}
            >
                <MenuItem value="" disabled>
                    <em>Selecione categorias</em>
                </MenuItem>
                {
                    categories.map(
                        (category, key) => (
                            <MenuItem key={key} value={category.id}>{category.name}</MenuItem>
                        )
                    )
                }
            </TextField>

            <Box dir={"rtl"}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type={"submit"}>Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};