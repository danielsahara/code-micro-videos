// @flow
import * as React from 'react';
import AsyncAutocomplete from "../../../components/AsyncAutocomplete";
import {GridSelected} from "../../../components/GridSelected";
import {GridSelectedItem} from "../../../components/GridSelectedItem";
import {Grid, Typography} from "@material-ui/core";
import useHttpHandled from "../../../hooks/useHttpHandled";
import genreHttp from "../../../util/http/genre-http";

interface CategoryFieldProps {

};
const CategoryField: React.FC<CategoryFieldProps> = (props) => {
    const autocompleteHttp = useHttpHandled();

    const fetchOptions = (searchText) => autocompleteHttp(
        genreHttp.list({
            queryParams: {
                search: searchText,
                all: ""
            }
        })
    ).then(data => data.data).catch(error => console.log(error));
    
    return (
        <>
            <AsyncAutocomplete
                fetchOptions={fetchOptions}
                AutocompleteProps={{
                    freeSolo: true,
                    getOptionLabel: option => option.name,
                }}
                TextFieldProps={{
                    label: 'Categorias'
                }}
            />
            <GridSelected>
                <GridSelectedItem onClick={() => {}}>
                    <Typography noWrap={true}>Categoriass 1</Typography>
                </GridSelectedItem>
            </GridSelected>
        </>
    );
};

export default CategoryField;