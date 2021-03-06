import * as React from 'react';
import {useContext, useEffect, useRef, useState} from 'react';
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import categoryHttp from "../../util/http/category-http";
import {BooleanTypeMap, ListResponse, Video} from "../../util/models";
import DefaultTable, {MuiDataTableRefComponent, TableColumn} from '../../components/Table'
import {useSnackbar} from "notistack";
import {FilterResetButton} from "../../components/Table/FilterResetButton";
import useFilter from "../../hooks/useFilter";
import videoHttp from "../../util/http/video-http";
import {IconButton, MuiThemeProvider} from "@material-ui/core";
import {Link} from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';
import DeleteDialog from "../../components/DeleteDialog";
import useDeleteCollection from "../../hooks/useDeleteCollection";
import LoadingContext from "../../components/loading/LoadingContext";

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
        name: 'title',
        label: 'Título',
        width: '20%',
        options:{
            filter: false
        }
    },
    {
        name: 'genres',
        label: 'Gêneros',
        width: '13%',
        options:{
            sort: false,
            filter: false,
            customBodyRender: (value, tableMeta, update) => {
                return value.map(value => value.name).join(', ');
            }
        }
    },
    {
        name: 'categories',
        label: 'Categorias',
        width: '12%',
        options:{
            sort: false,
            filter: false,
            customBodyRender: (value, tableMeta, update) => {
                return value.map(value => value.name).join(', ');
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
    {
        name: 'actions',
        label: 'Ações',
        width: '13%',
        options:{
            sort: false,
            filter: false,
            customBodyRender: (value, tableMeta, update) => {
                return (
                    <IconButton color={"secondary"} component={Link} to={`/videos/${tableMeta.rowData[0]}/edit`}>
                        <EditIcon />
                    </IconButton>
                )
            }
        }
    },
];

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
    const [data, setData] = useState<Video[]>([]);
    const loading = useContext(LoadingContext);

    const {openDeleteDialog, setOpenDeleteDialog, rowsToDelete, setRowsToDelete} = useDeleteCollection();

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
            const {data} = await videoHttp.list<ListResponse<Video>>({
                queryParams: {
                    search: filterManager.cleanSearchText(debounceFilterState.search),
                    page: debounceFilterState.pagination.page,
                    per_page: debounceFilterState.pagination.per_page,
                    sort: debounceFilterState.order.sort,
                    dir: debounceFilterState.order.dir,
                }
            });
            if(subscribed.current){
                setData(data.data);
                setTotalRecords(data.meta.total);
                if(openDeleteDialog){
                    setOpenDeleteDialog(false)
                }
            }
        }
        catch (error) {
            console.error(error);
            if(videoHttp.isCancelledRequest(error)){
                return;
            }
            snackbar.enqueueSnackbar('Não foi possivel carregas as informaçoes', {variant: 'error'})
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

        videoHttp
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
        {/*<MuiThemeProvider theme={makeActionStyles(columsDefinition.length - 1)}>*/}
        <DeleteDialog open={openDeleteDialog} handleClose={deleteRows} />
        <DefaultTable
            title=""
            columns={columns}
            data={data}
            loading={loading}
            debouncedSearchTime={debouncedSearchTime}
            ref={tableRef}
            options={{
                serverSide: true,
                responsive: "scrollMaxHeight",
                searchText: filterState.search as any,
                page: filterState.pagination.page - 1,
                rowsPerPage: filterState.pagination.per_page,
                rowsPerPageOptions,
                count: totalRecords,
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
        // </MuiThemeProvider>
    );
};

export default Table;