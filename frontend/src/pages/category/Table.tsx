import * as React from 'react';
import {useContext, useEffect, useRef, useState} from 'react';
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import categoryHttp from "../../util/http/category-http";
import {Category} from "@material-ui/icons";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import {BooleanTypeMap, ListResponse} from "../../util/models";
import DefaultTable, {MuiDataTableRefComponent, TableColumn} from '../../components/Table'
import {useSnackbar} from "notistack";
import {FilterResetButton} from "../../components/Table/FilterResetButton";
import useFilter from "../../hooks/useFilter";
import LoadingContext from "../../components/loading/LoadingContext";
import useDeleteCollection from "../../hooks/useDeleteCollection";
import DeleteDialog from "../../components/DeleteDialog";
import videoHttp from "../../util/http/video-http";

// const castMemberNames = Object.values(CastMemberTypeMap)

const booleanName = Object.values(BooleanTypeMap);
const columsDefinition: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '30%',
        options:{
            sort: false,
            filter: false
        }
    },
    {
        name: 'name',
        label: 'Nome',
        width: '43%',
        options:{
            filter: false
        }
    },
    {
        name: 'is_active',
        label: 'Ativo',
        options: {
            // filterList: ['Sim'],
            filterOptions: {
                names: ['Sim', 'Nao']
            },
            customBodyRender(value, tableMeta, updateValue) {
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
            filter: false,
            customBodyRender(value, tableMeta, update) {
                return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>;
            }
        }
    },
    {
        name: 'actions',
        label: 'Ações',
        width: '13%',
        options:{
            filter: false
        }
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

const debounceTime = 300;
const debouncedSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [ 15, 25, 50];

const Table = () => {

    const snackbar = useSnackbar();
    const subscribed = useRef(true);//current: true
    const [data, setData] = useState<Category[]>([]);
    const loading = useContext(LoadingContext);
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;

    const {openDeleteDialog, setOpenDeleteDialog, rowsToDelete, setRowsToDelete} = useDeleteCollection();

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
    });

    const indexColumnType = columns.findIndex(c => c.name === 'is_active');
    const columnType = columns[indexColumnType];
    const activeFilterValue = filterState.extraFilter && filterState.extraFilter.is_active as never;
    const serverSideFilterList = columns.map(columns => []);

    if(activeFilterValue){
        serverSideFilterList[indexColumnType] = [activeFilterValue];
    }

    useEffect(() => {
        filterManager.replaceHistory();
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
        try {
            const {data} = await categoryHttp.list<ListResponse<Category>>({
                queryParams: {
                    search: filterManager.cleanSearchText(debounceFilterState.search),
                    page: debounceFilterState.pagination.page,
                    per_page: debounceFilterState.pagination.per_page,
                    sort: debounceFilterState.order.sort,
                    dir: debounceFilterState.order.dir,
                    ...(
                        debounceFilterState.extraFilter && debounceFilterState.extraFilter.is_active &&
                        {is_active: debounceFilterState.extraFilter.is_active === 'Sim' ? 1 : 0}
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
            if(categoryHttp.isCancelledRequest(error)){
                return;
            }
            snackbar.enqueueSnackbar('Não foi possivel carregas as informaçoes', {variant: 'error'})
        }
        finally {
        }
    }

    function deleteRows(confirmed: boolean) {
        if(!confirmed){
            setOpenDeleteDialog(false);
            return;
        }
        const ids = rowsToDelete
            .data
            .map((value) => data[value.index].id)
            .join(',');

        categoryHttp
            .deleteCollection({ids})
            .then(response => {
                snackbar.enqueueSnackbar('Registros exluidos com sucesso', {variant: 'success'})
                if (rowsToDelete.data.length === filterState.pagination.per_page
                    && filterState.pagination.page > 1) {
                    const page = filterState.pagination.page - 2;
                    filterManager.changePage(page);
                }
                else {
                    getData();
                }
            })
            .catch((error) => {
                console.error(error)
                snackbar.enqueueSnackbar('Não foi possivel excluir os registros', {variant: 'error'})
            })
    }

    return (
        <>
        <DeleteDialog open={openDeleteDialog} handleClose={deleteRows} />
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
                        filterManager.changeColumnSort(changedColumn, direction),
                    onRowsDelete: (rowsDeleted: any[]) => {
                        setRowsToDelete(rowsDeleted as any);
                        return false;
                    },
                }}
            />
        </>
    );
};

export default Table;