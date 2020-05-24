import {useSnackbar} from "notistack";
import axios from 'axios';

const useHttpHandled = () => {
    const snackbar = useSnackbar();

    return async (request: Promise<any>) => {
        try {
            const {data} = await request;
            return data;
        }
        catch (e) {
            console.log(e);
            if(!axios.isCancel(e)){
                snackbar.enqueueSnackbar('Não foi possivel carregar as informaçoes', {variant: 'error'})
            }
            throw e;
        }
    }
};

export default useHttpHandled;