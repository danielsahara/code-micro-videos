import * as React from 'react';
import {useEffect, useReducer, useRef, useState} from 'react';
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import categoryHttp from "../../util/http/category-http";
import {Category} from "@material-ui/icons";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import {ListResponse} from "../../util/models";
import DefaultTable, {TableColumn} from '../../components/Table'
import {useSnackbar} from "notistack";
import {FilterResetButton} from "../../components/Table/FilterResetButton";
import reducer, {INITIAL_STATE, Creators} from "../../store/search";

const columsDefinition: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '30%',
        options:{
            sort: false
        }
    },
    {
        name: 'name',
        label: 'Nome',
        width: '43%',
    },
    {
        name: 'is_active',
        label: 'Ativo',
        options: {
            customBodyRender(value, tableMeta, update) {
                return value ? <BadgeYes/> : <BadgeNo/>
            }
        },
        width: '4%',
    },
    {
        name: 'created_at',
        label: 'Criado em',
        width: '10%',
        options: {
            customBodyRender(value, tableMeta, update) {
                return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>;
            }
        }
    },
    {
        name: 'actions',
        label: 'Ações',
        width: '13%',
    },
];

const data = [
    {name: "teste1", is_active: true, created_at: "2019-12-12"},
    {name: "teste2", is_active: false, created_at: "2019-12-13"},
    {name: "teste3", is_active: true, created_at: "2019-12-14"},
    {name: "teste4", is_active: false, created_at: "2019-12-15"},
]

interface Category {
    id: string,
    name: string,
}
type Props = {
    
};

const Table = (props: Props) => {

    const snackbar = useSnackbar();
    const subscribed = useRef(true);//current: true
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchState, dispatch] = useReducer(reducer, INITIAL_STATE);
    // const [searchState, setSearchState] = useState<SearchState>(initialState);

    const columns = columsDefinition.map(column => {
        return column.name === searchState.order.sort ?
        {
        ...column,
            options: {
        ...column.options,
                sortDirection: searchState.order.dir as any
        }
        } : column
    });

    useEffect(() => {
        subscribed.current = true;

        getData();

        return () => {
            subscribed.current = false;
        }
    }, [
        searchState.search,
        searchState.pagination.page,
        searchState.pagination.per_page,
        searchState.order,

    ]);

    async function getData() {
        setLoading(true);
        try {
            const {data} = await categoryHttp.list<ListResponse<Category>>({
                queryParams: {
                    search: cleanSearchText(searchState.search),
                    page: searchState.pagination.page,
                    per_page: searchState.pagination.per_page,
                    sort: searchState.order.sort,
                    dir: searchState.order.dir,
                }
            });
            if(subscribed.current){
                setData(data.data);
                // setSearchState((prevState => ({
                //     ...prevState,
                //     pagination:{
                //         ...prevState.pagination,
                //         total: data.meta.total,
                //     }
                // })))
            }
        }
        catch (error) {
            console.error(error);
            if(categoryHttp.isCancelledRequest(error)){
                return;
            }
            snackbar.enqueueSnackbar('Não foi possivel carregas as informaçoes', {variant: 'error'})
        }
        finally {
            setLoading(false);
        }
    }

    function cleanSearchText(text){
        let newText = text;

        if (text && text.value !== undefined){
            newText = text.value;
        }
        return newText;
    }
    
    return (
        <DefaultTable
            title=""
            columns={columns}
            data={data}
            loading={loading}
            debouncedSearchTime={500}
            options={{
                serverSide: true,
                responsive: "scrollMaxHeight",
                searchText: searchState.search as any,
                page: searchState.pagination.page - 1,
                rowsPerPage: searchState.pagination.per_page,
                count: searchState.pagination.total,
                customToolbar: () => (
                    <FilterResetButton
                        handleClick={() => {
                            // dispatch({type: 'reset'})
                        }}
                    />
                ),
                onSearchChange: (value) => dispatch(Creators.setSearch({search: value})),
                onChangePage: (page) => dispatch(Creators.setPage({page: page + 1})),
                onChangeRowsPerPage: (perPage) => dispatch(Creators.setPerPage({per_page: perPage})),
                onColumnSortChange: (changedColumn: string, direction: string) =>
                    dispatch(Creators.setOrder(
                        {
                            sort: changedColumn,
                            dir: direction.includes('desc') ? 'desc' : 'asc',
                    })
                ),
            }}
        />
    );
};

export default Table;