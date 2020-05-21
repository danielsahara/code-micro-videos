import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import {httpVideo} from "../../util/http";
import {CastMember, CastMemberTypeMap, ListResponse} from "../../util/models";
import DefaultTable, {MuiDataTableRefComponent, TableColumn} from "../../components/Table";
import {useSnackbar} from "notistack";
import useFilter from "../../hooks/useFilter";
import * as yup from "../../util/vendor/yup";
import categoryHttp from "../../util/http/category-http";
import castMemberHttp from "../../util/http/cast-member-http";
import {FilterResetButton} from "../../components/Table/FilterResetButton";
import {MuiThemeProvider} from "@material-ui/core";
import {invert} from 'lodash';

const castMemberNames = Object.values(CastMemberTypeMap);

const columsDefinition : TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '30%',
        options: {
            sort:false,
            filter:false
        }
    },
    {
        name: 'name',
        label: 'Nome',
        width: '43%',
        options: {
            filter:false
        }
    },
    {
        name: 'type',
        label: 'Tipo',
        width: '4%',
        options: {
            filterOptions:{
                names: castMemberNames
            },
            customBodyRender: (value, tableMeta, updateValue) => {
                 return CastMemberTypeMap[value];
            }
        }
    },
    {
        name: 'created_at',
        label: 'Criado em',
        width: '10%',
        options: {
            filter: false,
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
    const [data, setData] = useState<CastMember[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
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
                    type: yup.string()
                        .nullable()
                        .transform(value => {
                            return !value || !castMemberNames.includes(value)? undefined: value;
                        })
                        .default(null)
                })
            },
            formatSearchParams: (debouncedState) => {
                return debouncedState.extraFilter ? {
                    ...(
                        debouncedState.extraFilter.type && {type: debouncedState.extraFilter.type}
                    )
                }: undefined
            },
            getStateFromURL: (queryParams) =>{
                return {
                    type: queryParams.get('type')
                }
            }
        }
    });

    const indexColumnType = columns.findIndex(c => c.name === 'type');
    const columnType = columns[indexColumnType];
    const typeFilterValue = filterState.extraFilter && filterState.extraFilter.type as never;
    (columnType.options as any).filterList = typeFilterValue ? [typeFilterValue] : []

    const serverSideFilterList = columns.map(columns => []);

    if(typeFilterValue){
        serverSideFilterList[indexColumnType] = [typeFilterValue];
    }

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
            const {data} = await castMemberHttp.list<ListResponse<CastMember>>({
                queryParams: {
                    search: filterManager.cleanSearchText(debounceFilterState.search),
                    page: debounceFilterState.pagination.page,
                    per_page: debounceFilterState.pagination.per_page,
                    sort: debounceFilterState.order.sort,
                    dir: debounceFilterState.order.dir,
                    ...(
                        debounceFilterState.extraFilter && debounceFilterState.extraFilter.type &&
                        {type: invert(CastMemberTypeMap)[debounceFilterState.extraFilter.type]}
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
    //    httpVideo.get('cast_members').then(
    //        response => setData(response.data.data)
    //    );
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
                            [column]: filterList[columnIndex].length ? filterList[columnIndex][0] : null
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
