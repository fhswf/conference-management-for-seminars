import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {ChangeEvent, useState} from "react";
import {InputText} from "primereact/inputtext";

interface HeaderData {
    field: string;
    header: string;
}

interface RowData {
    [key: string]: any;
}


interface Props {
    header: HeaderData[] | undefined;
    data: RowData[] | undefined;
}

function Table({header, data}: Props) {
    const [globalFilter, setGlobalFilter] = useState<string | null>(null);

    const onGlobalFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
        setGlobalFilter(event.target.value);
    };

    const filteredData = globalFilter
        ? data?.filter((rowData) =>
            header?.some((h) =>
                String(rowData[h.field])
                    .toLowerCase()
                    .includes(globalFilter.toLowerCase())
            )
        ) : data;

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilter || ""} onChange={onGlobalFilterChange} placeholder="Suche ..." />
                </span>
            </div>
        );
    };

    const headerT = renderHeader();

    return (
        <>
            <div className="table-header">
                <h5>Table</h5>
            </div>
            <div className="card">
                <DataTable data-test="table"  value={filteredData} header={headerT} showGridlines tableStyle={{minWidth: '50rem'}}>
                    {header && header.map((h, index) => {
                        const isButton = h.field.startsWith("btn")
                        return <Column data-test="column" sortable={!isButton} field={h.field} header={h.header} key={index}></Column>
                    })}
                </DataTable>
            </div>
        </>
    );
}

export default Table;
