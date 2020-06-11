import * as React from 'react';
import {Page} from "../../components/Page";
import {Form} from "../video/Form/index";
import {useParams} from 'react-router';

export const PageForm = () => {
    const {id} = useParams();
    return (
        <Page title={!id ? 'Criar video' : 'Editar video'}>
            <Form />
        </Page>
    );
};

export default PageForm;