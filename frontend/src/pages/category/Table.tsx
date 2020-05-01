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
import reducer, {INITIAL_STATE, Creators} from "../../store/filter";
import useFilter from "../../hooks/useFilter";

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
    const {
        columns,
        filterManager,
        filterState,
        dispatch,
        totalRecords,
        setTotalRecords
    } = useFilter({
        columns: columsDefinition,
        debounceTime: 500,
        rowsPerPage: 10,
        rowsPerPageOptions: [ 10, 25,50]
    });
    // const [filterState, setSearchState] = useState<SearchState>(initialState);

    useEffect(() => {
        subscribed.current = true;

        getData();

        return () => {
            subscribed.current = false;
        }
    }, [
        filterState.search,
        filterState.pagination.page,
        filterState.pagination.per_page,
        filterState.order,

    ]);

    async function getData() {
        setLoading(true);
        try {
            const {data} = await categoryHttp.list<ListResponse<Category>>({
                queryParams: {
                    search: cleanSearchText(filterState.search),
                    page: filterState.pagination.page,
                    per_page: filterState.pagination.per_page,
                    sort: filterState.order.sort,
                    dir: filterState.order.dir,
                }
            });
            if(subscribed.current){
                setData(data.data);
                setTotalRecords(data.meta.total);
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
                searchText: filterState.search as any,
                page: filterState.pagination.page - 1,
                rowsPerPage: filterState.pagination.per_page,
                count: totalRecords,
                customToolbar: () => (
                    <FilterResetButton
                        handleClick={() => dispatch(Creators.setReset())}
                    />
                ),
                onSearchChange: (value) => filterManager.changeSearch(value),
                onChangePage: (page) => filterManager.changePage(page),
                onChangeRowsPerPage: (perPage) => filterManager.changeRowsPerPage(perPage),
                onColumnSortChange: (changedColumn: string, direction: string) =>
                    filterManager.changeColumnSort(changedColumn, direction)
            }}
        />
    );
};

export default Table;