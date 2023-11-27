import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";

interface HeaderData {
    field: string;
    header: string;
}

interface RowData {

}


interface Props {
    header: HeaderData[] | undefined;
    data: RowData[] | undefined;
}

function Table({header, data}: Props) {
    return (
        <div className="card">
            <DataTable value={data} showGridlines tableStyle={{ minWidth: '50rem' }}>
                {header && header.map((h, index) => {
                    return <Column field={h.field} header={h.header} key={index}></Column>
                })}
            </DataTable>
        </div>
    );
}

export default Table;
