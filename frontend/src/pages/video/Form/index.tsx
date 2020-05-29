import * as React from 'react';
import {createRef, MutableRefObject, useEffect, useRef, useState} from 'react';
import {
    Card,
    CardContent,
    Checkbox,
    FormControlLabel,
    FormHelperText,
    Grid,
    TextField,
    Theme,
    Typography,
    useMediaQuery,
    useTheme
} from "@material-ui/core";
import useForm from "react-hook-form";
import * as yup from '../../../util/vendor/yup';
import {useHistory, useParams} from 'react-router';
import {useSnackbar} from 'notistack';
import {Video, VideoFileFieldsMap} from "../../../util/models";
import SubmitActions from "../../../components/SubmitActions";
import {DefaultForm} from "../../../components/DefaultForm";
import videoHttp from "../../../util/http/video-http";
import {RatingField} from "./RatingField";
import {UploadField} from "./UploadField";
import {makeStyles} from "@material-ui/core/styles";
import GenreField, {GenreFieldComponent} from "./GenreField";
import CategoryField, {CategoryFieldComponent} from "./CategoryField";
import CastMemberField, {CastMemberFieldComponent} from "./CastMemberField";
import {omit, zipObject} from 'lodash';
import {InputFileComponent} from "../../../components/InputFile";
import useSnackbarFormError from "../../../hooks/useSnackbarFormError";


const useStyles = makeStyles((theme: Theme) => ({
    cardUpload: {
        borderRadius: "4px",
        backgroundColor: "#f5f5f5",
        margin: theme.spacing(2, 0)
    },
    cardOpened: {
        borderRadius: "4px",
        backgroundColor: "#f5f5f5",
    },
    cardContentOpened: {
        paddingBottom: theme.spacing(2) + 'px !important'
    },
}));

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
    cast_members: yup.array()
        .label('Membros de elenco')
        .required(),
    genres: yup.array()
        .label('Gêneros')
        .required()
        .test({
            message: 'Cada genero escolhido precisa ter pelo menos uma categoria selecionada',
            test(value){
                return value.every(
                    v => v.categories.filter(
                        cat => this.parent.categories.map(c => c.id).includes(cat.id)
                    ).length !== 0
                );
            }
        }),
    categories: yup.array()
        .label('Categorias')
        .required(),
    rating: yup.string()
        .label('Classificação')
        .required(),
});

const fileFields = Object.keys(VideoFileFieldsMap)

export const Index = () => {

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        errors,
        reset,
        watch,
        triggerValidation,
        formState,
    } = useForm({
        validationSchema,
        defaultValues:{
            rating: null,
            genres: [],
            categories: [],
            cast_members: [],
            opened:false
        }
    });

    useSnackbarFormError(formState.submitCount, errors);

    const snackbar = useSnackbar();
    const history = useHistory();
    const {id} = useParams();
    const[video, setVideo] = useState<Video | null>(null);
    const[loading, setLoading] = useState<boolean>(false);
    const theme = useTheme();
    const isGreaterMd = useMediaQuery(theme.breakpoints.up('md'));
    const castMemberRef = useRef() as MutableRefObject<CastMemberFieldComponent>;
    const genreRef = useRef() as MutableRefObject<GenreFieldComponent>;
    const categoryRef = useRef() as MutableRefObject<CategoryFieldComponent>;
    const uploadRef = useRef(zipObject(fileFields, fileFields.map(() => createRef()))
    ) as MutableRefObject<{ [key: string]: MutableRefObject<InputFileComponent> }>;
    const classes = useStyles();

    useEffect(() => {
        ['rating', 'opened', 'genres','categories','cast_members',  ...fileFields].forEach(name => register({name}));
    },[register]);

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

        const sendData = omit(formData, ['cast_members', 'genres', 'categories']);
        sendData['cast_members_id'] = formData['cast_members'].map(cast_member => cast_member.id);
        sendData['categories_id'] = formData['categories'].map(category => category.id);
        sendData['genres_id'] = formData['genres'].map(genre => genre.id);

        setLoading(true);
        try {
            const http = !video
                ? videoHttp.create(sendData)
                : videoHttp.update(video.id, {...sendData, _method: 'PUT'}, {http: {usePost: true}});

            const {data} = await http;
            snackbar.enqueueSnackbar('Video salvo com sucesso', {variant: 'success'});

            id && resetForm(video);
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

    function resetForm(data){
         Object.keys(uploadRef.current).forEach(
             field => uploadRef.current[field].current.clear()
         );
         castMemberRef.current.clear();
         genreRef.current.clear();
         categoryRef.current.clear();
         reset(data);
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

                    <CastMemberField
                        ref={castMemberRef}
                        castMembers={watch('cast_members')}
                        setCastMembers={(value) => setValue('cast_members', value, true)}
                        error={errors.cast_members}
                        disabled={loading}
                    />
                    <br />
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <GenreField
                                ref={genreRef}
                                genres={watch('genres')}
                                setGenres={(value) => setValue('genres', value, true)}
                                categories={watch('categories')}
                                setCategories={(value) => setValue('categories', value, true)}
                                error={errors.genres}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <CategoryField
                                ref={categoryRef}
                                categories={watch('categories')}
                                setCategories={(value) => setValue('categories', value, true)}
                                genres={watch('genres')}
                                error={errors.categories}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormHelperText>
                                Escolha os generos do video
                            </FormHelperText>
                            <FormHelperText>
                                Escolha pelo menos uma categoria de cada genero
                            </FormHelperText>
                        </Grid>
                    </Grid>

                </Grid>
                <Grid item xs={12} md={6}>
                    <RatingField
                        value={watch('rating')}
                        setValue={(value) => setValue('rating', value, true)}
                        error={errors.rating}
                        disabled={loading}
                        FormControlProps={{
                            margin: isGreaterMd? 'none' : 'normal'
                        }}
                    />
                    <br />
                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color={"primary"} variant={"h6"}>
                                Imagens
                            </Typography>
                            <UploadField
                                ref={uploadRef.current['thumb_file']}
                                accept={'image/*'}
                                label={'Thumb'}
                                setValue={(value) => setValue('thumb_file' ,value)}
                            />
                            <UploadField
                                ref={uploadRef.current['banner_file']}
                                accept={'image/*'}
                                label={'Banner'}
                                setValue={(value) => setValue('banner_file' ,value)}
                            />
                        </CardContent>
                    </Card>
                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color={"primary"} variant={"h6"}>
                                Vídeos
                            </Typography>
                            <UploadField
                                ref={uploadRef.current['trailer_file']}
                                accept={'video/mp4'}
                                label={'Trailer'}
                                setValue={(value) => setValue('trailer_file' ,value)}
                            />
                            <UploadField
                                ref={uploadRef.current['video_file']}
                                accept={'video/mp4'}
                                label={'Principal'}
                                setValue={(value) => setValue('video_file' ,value)}
                            />
                        </CardContent>
                    </Card>
                    <Card className={classes.cardOpened}>
                        <CardContent className={classes.cardContentOpened}>
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
                        </CardContent>
                    </Card>
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