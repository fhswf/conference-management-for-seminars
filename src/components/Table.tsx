import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";

interface HeaderData {
    field: string;
    header: string;
}

interface RowData {

}


interface Props {
    header: HeaderData[];
    data: RowData[];
}

function Table({header, data}: Props) {
    return (
        <div className="card">
            <DataTable value={data} showGridlines tableStyle={{ minWidth: '50rem' }}>
                {header.map((h) => {
                    return <Column field={h.field} header={h.header}></Column>
                })}
            </DataTable>
        </div>
    );
}

export default Table;