import * as React from 'react';
import {Page} from "../../components/Page";
import {Form} from "./Form";
import {useParams} from 'react-router';

export const PageForm = () => {
    const {id} = useParams();
    return (
        <Page title={!id ? 'Criar categoria' : 'Editar Categoria'}>
            <Form />
        </Page>
    );
};

export default PageForm;