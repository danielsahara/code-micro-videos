import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import {httpVideo} from "../../util/http";
import useFilter from "../../hooks/useFilter";
import * as yup from "../../util/vendor/yup";
import DefaultTable, {MuiDataTableRefComponent, TableColumn} from "../../components/Table";
import {CastMember, CastMemberTypeMap, Category, Genre, ListResponse} from "../../util/models";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import {useSnackbar} from "notistack";
import categoryHttp from "../../util/http/category-http";
import {MuiThemeProvider} from "@material-ui/core";
import {FilterResetButton} from "../../components/Table/FilterResetButton";
import castMemberHttp from "../../util/http/cast-member-http";
import {invert} from "lodash";
import genreHttp from "../../util/http/genre-http";

const columsDefinition : TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '30%',
        options:{
            sort: false,
        }
    },
    {
        name: 'name',
        label: 'Nome',
        width: '23%',
        options:{
            filter: false
        }
    },
    {
        name: 'is_active',
        label: 'Ativo',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes/> : <BadgeNo/>
            }
        },
        width: '4%',
    },
    {
        name: 'categories',
        label: 'Categorias',
        width: "20%",
        options: {
            filterType: 'multiselect',
            filterOptions:{
                names: []
            },
            customBodyRender: (value, tableMeta, updateValue) => {
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

const debounceTime = 300;
const debouncedSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [ 15, 25, 50];

const Table = () => {

    const snackbar = useSnackbar();
    const subscribed = useRef(true);//current: true
    const [data, setData] = useState<Genre[]>([]);
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

    const indexColumnCategories = columns.findIndex(c => c.name === 'categories');
    const columnCategories = columns[indexColumnCategories];
    const categoriesFilterValue = filterState.extraFilter && filterState.extraFilter.categories;
    (columnCategories.options as any).filterList = categoriesFilterValue ? [...categoriesFilterValue] : [];
    const serverSideFilterList = columns.map(column => []);

    if(categoriesFilterValue){
        serverSideFilterList[indexColumnCategories] = categoriesFilterValue;
    }

    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            try {
                const {data} = await categoryHttp.list({queryParams: {all: ''}});

                if(isSubscribed){
                    setCategories(data.data);
                    (columnCategories.options as any).filterOptions.names = data.data.map(category => category.name)
                }
            }
            catch (error) {
                console.error(error);
                snackbar.enqueueSnackbar('Nao foi possivel carregar as informacoes', {variant: 'error'})
            }
        })();

        return () => {
            isSubscribed = false;
        }
    },[]);

    useEffect(() => {
        subscribed.current = true;
        filterManager.pushHistory();

        getData();

        return () => {
            subscribed.current = false;
        }
    }, [
        filterManager.cleanSearchText(debounceFilterState.search),
        debounceFilterState.pagination.page,
        debounceFilterState.pagination.per_page,
        debounceFilterState.order,
        JSON.stringify(debounceFilterState.extraFilter)
    ]);


    async function getData() {
        setLoading(true);
        try {
            const {data} = await genreHttp.list<ListResponse<Genre>>({
                queryParams: {
                    search: filterManager.cleanSearchText(debounceFilterState.search),
                    page: debounceFilterState.pagination.page,
                    per_page: debounceFilterState.pagination.per_page,
                    sort: debounceFilterState.order.sort,
                    dir: debounceFilterState.order.dir,
                    ...(
                        debounceFilterState.extraFilter && debounceFilterState.extraFilter.categories &&
                        {categories: debounceFilterState.extraFilter.categories.join(',')}
                    )
                }
            });
            if(subscribed.current){
                setData(data.data);
                setTotalRecords(data.meta.total);
            }
        }
        catch (error) {
            console.error(error);
            if(castMemberHttp.isCancelledRequest(error)){
                return;
            }
            snackbar.enqueueSnackbar('Não foi possivel carregas as informaçoes', {variant: 'error'})
        }
        finally {
            setLoading(false);
        }
    }
    
    // useEffect(() => {
    //    httpVideo.get('genres').then(
    //        response => setData(response.data.data)
    //    );
    //
    // }, []);
    
    return (
        // <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DefaultTable
                title=""
                columns={columns}
                data={data}
                loading={loading}
                debouncedSearchTime={debouncedSearchTime}
                ref={tableRef}
                options={{
                    serverSideFilterList,
                    serverSide: true,
                    responsive: "scrollMaxHeight",
                    searchText: filterState.search as any,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions,
                    count: totalRecords,
                    onFilterChange: (column, filterList, type) =>{
                        const columnIndex = columns.findIndex(c => c.name === column);
                        filterManager.changeExtraFilter({
                            [column]: filterList[columnIndex].length ? filterList[columnIndex] : null
                        })
                    },
                    customToolbar: () => (
                        <FilterResetButton
                            handleClick={() => filterManager.resetFilter()}
                        />
                    ),
                    onSearchChange: (value) => filterManager.changeSearch(value),
                    onChangePage: (page) => filterManager.changePage(page),
                    onChangeRowsPerPage: (perPage) => filterManager.changeRowsPerPage(perPage),
                    onColumnSortChange: (changedColumn: string, direction: string) =>
                        filterManager.changeColumnSort(changedColumn, direction)
                }}
            />
        // </MuiThemeProvider>
    );
};
        
export default Table;
