import {useState} from "react";
import {Password} from "primereact/password";

interface Props {
    text: string;
}

function ToggleLabel({text}: Props) {

    return (
        <Password value={text} toggleMask readOnly feedback={false}/>
    );
}

export default ToggleLabel;