import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import {httpVideo} from "../../util/http";
import useFilter from "../../hooks/useFilter";
import * as yup from "../../util/vendor/yup";
import {MuiDataTableRefComponent} from "../../components/Table";
import {Category} from "../../util/models";

const columsDefinition : MUIDataTableColumn[] = [
    {
        name: 'name',
        label: 'Nome',
    },
    {
        name: 'categories',
        label: 'Categorias',
        options: {
            customBodyRender : (value, tableMeta, updateValue) => {
                return value.map(value => value.name).join(', ');
            }
        }
    },
    {
        name: 'created_at',
        label: 'Criado em',
        options: {
            customBodyRender(value, tableMeta, update) {
                return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>;
            }
        }
    },  
];

type Props = {
    
};

const debounceTime = 300;
// const debouncedSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [ 15, 25, 50];

export const Table = (props: Props) => {
    
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [categories, setCategories] = useState<Category[]>();
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;

    const {
        columns,
        filterManager,
        filterState,
        debounceFilterState,
        dispatch,
        totalRecords,
        setTotalRecords
    } = useFilter({
        columns: columsDefinition,
        debounceTime: debounceTime,
        rowsPerPage,
        rowsPerPageOptions,
        tableRef,
        extraFilter:{
            createValidationSchema: () => {
                return yup.object().shape({
                    categories: yup.mixed()
                        .nullable()
                        .transform(value => {
                            return !value || value === '' ? undefined : value.split(',');
                        })
                        .default(null)
                })
            },
            formatSearchParams: (debouncedState) => {
                return debouncedState.extraFilter ? {
                    ...(
                        debouncedState.extraFilter.categories &&
                        {categories: debouncedState.extraFilter.categories.join(',')}
                    )
                }: undefined
            },
            getStateFromURL: (queryParams) =>{
                return {
                    categories: queryParams.get('categories')
                }
            }
        }
    });
    
    useEffect(() => {
       httpVideo.get('genres').then(
           response => setData(response.data.data)
       );

    }, []);
    
    return (
        <MUIDataTable
            title="Listagem de gêneros"
            columns={columsDefinition}
            data={data}
        />
    );
};
        
export default Table;
