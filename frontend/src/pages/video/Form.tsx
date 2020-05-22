import * as React from 'react';
import {useEffect, useState} from 'react';
import {Checkbox, FormControlLabel, Grid, TextField, Typography} from "@material-ui/core";
import useForm from "react-hook-form";
import * as yup from '../../util/vendor/yup';
import {useHistory, useParams} from 'react-router';
import {useSnackbar} from 'notistack';
import {Video} from "../../util/models";
import SubmitActions from "../../components/SubmitActions";
import {DefaultForm} from "../../components/DefaultForm";
import videoHttp from "../../util/http/video-http";

const validationSchema = yup.object().shape({
    title: yup.string()
        .label('Titulo')
        .required()
        .max(255),
    description: yup.string()
        .label('Sinopse')
        .required(),
    year_launched: yup.number()
        .label('Ano de lançamento')
        .required()
        .min(1),
    duration: yup.number()
        .label('Duração')
        .required()
        .min(1),
    rating: yup.string()
        .label('Classificação')
        .required(),
});

export const Form = () => {

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        errors,
        reset,
        watch,
        triggerValidation
    } = useForm({
        validationSchema,
        defaultValues:{
            is_active: true
        }
    });

    const snackbar = useSnackbar();
    const history = useHistory();
    const {id} = useParams();
    const[video, setVideo] = useState<Video | null>(null);
    const[loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!id) {
            return;
        }

        let isSubscribed = true;

        (async() => {
            setLoading(true);

            try {
                const {data} = await videoHttp.get(id);

                if(isSubscribed){
                    setVideo(data.data);
                    reset(data.data);
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
    }, []);

     async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = !video
                ? videoHttp.create(formData)
                : videoHttp.update(video.id, formData);

            const {data} = await http;
            snackbar.enqueueSnackbar('Video salvo com sucesso', {variant: 'success'});

            setTimeout(() => {
                event ? (
                        id ? history.replace(`/videos/${data.data.id}/edit`) :
                            history.push(`/videos/${data.data.id}/edit`)
                    )
                    : history.push('/videos')
            });
        }
        catch (error) {
            console.error(error);
            snackbar.enqueueSnackbar('Não foi possivel salvar o video', {variant: 'error'})
        }
        finally {
            setLoading(false);
        }
    }

    return(
        <DefaultForm GridItemProps={{xs: 12}}
                     onSubmit={handleSubmit(onSubmit)}
        >
            <Grid container spacing={5}>
                <Grid item xs={12} md={6}>
                    <TextField
                        name="title"
                        label="Titulo"
                        variant={"outlined"}
                        fullWidth
                        inputRef={register}
                        disabled={loading}
                        InputLabelProps={{shrink: true}}
                        error={errors.title !== undefined}
                        helperText={errors.title && errors.title.message}
                    />
                    <TextField
                        name="description"
                        label="Sinopse"
                        multiline
                        rows="4"
                        margin={"normal"}
                        variant={"outlined"}
                        fullWidth
                        inputRef={register}
                        disabled={loading}
                        InputLabelProps={{shrink: true}}
                        error={errors.description !== undefined}
                        helperText={errors.description && errors.description.message}
                    />
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <TextField
                                name="year_launched"
                                label="Ano de lançamento"
                                type="number"
                                margin={"normal"}
                                variant={"outlined"}
                                fullWidth
                                inputRef={register}
                                disabled={loading}
                                InputLabelProps={{shrink: true}}
                                error={errors.year_launched !== undefined}
                                helperText={errors.year_launched && errors.year_launched.message}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name="duration"
                                label="Duração"
                                type="number"
                                margin={"normal"}
                                variant={"outlined"}
                                fullWidth
                                inputRef={register}
                                disabled={loading}
                                InputLabelProps={{shrink: true}}
                                error={errors.duration !== undefined}
                                helperText={errors.duration && errors.duration.message}
                            />
                        </Grid>
                    </Grid>

                    Elenco
                    <br />
                    Generos e categorias
                </Grid>
                <Grid item xs={12} md={6}>
                    Classificação
                    <br />
                    Uploads
                    <br />
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="opened"
                                color={"primary"}
                                onChange={
                                    () => setValue('opened', !getValues()['opened'])
                                }
                                checked={watch('opened')}
                                disabled={loading}
                            />
                        }
                        label = {
                            <Typography color="primary" variant={"subtitle2"}>
                                Quero que este conteudo apareça na seçao lançamentos
                            </Typography>
                        }
                        labelPlacement="end"
                    />
                </Grid>
            </Grid>
            <SubmitActions
                disabledButtons={loading}
                handleSave={() =>
                    triggerValidation().then(isValid => {
                        isValid && onSubmit(getValues(), null)
                    })
                }
            />
        </DefaultForm>
    );
};