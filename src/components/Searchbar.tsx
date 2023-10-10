import {InputText} from "primereact/inputtext";
import {ChangeEvent} from "react";

interface Props {
    onValueChanged?: (event: ChangeEvent<HTMLInputElement>) => void;
}

function Searchbar({onValueChanged}: Props) {
    return (
        <>
            <InputText onChange={onValueChanged} placeholder="Search" type="text" className="w-full"/>
        </>
    );
}

export default Searchbar;