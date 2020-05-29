import {useEffect} from 'react';
import {useSnackbar} from "notistack";

const useSnackbarFormError = (submitCount, errors) => {
    const snackbar = useSnackbar();

    useEffect(() => {
        const hasError = Object.keys(errors).length !== 0;

        if(submitCount > 0 && hasError){
            snackbar.enqueueSnackbar(
                'Formulario invalido. Reveja os campos marcador de vermelho',
                {variant: 'error'}
            )
        }
    }, [submitCount])
};

export default useSnackbarFormError;