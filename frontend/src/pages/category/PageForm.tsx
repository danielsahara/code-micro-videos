import * as React from 'react';
import {Page} from "../../components/Page";
import {Form} from "./Form";

export const PageForm = () => {
    return (
        <Page title={'Criar categoria'}>
            <Form />
        </Page>
    );
};

export default PageForm;