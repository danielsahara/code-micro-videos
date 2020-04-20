import * as React from 'react';
import {useEffect, useState} from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import {Chip} from "@material-ui/core";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import categoryHttp from "../../util/http/category-http";
import {Category} from "@material-ui/icons";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import {ListResponse} from "../../util/models";
import DefaultTable, {TableColumn} from '../../components/Table'

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

    const [data, setData] = useState<Category[]>([]);

    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            const {data} = await categoryHttp.list<ListResponse<Category>>();
            if(isSubscribed){
                setData(data.data);
            }
        })();
        return () => {
            isSubscribed = false;
        }
    }, []);
    return (
        <DefaultTable
            title=""
            columns={columsDefinition}
            data={data}
        />
    );
};

export default Table;