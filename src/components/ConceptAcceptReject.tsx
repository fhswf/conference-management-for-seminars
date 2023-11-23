import {Button} from "primereact/button";
import {InputTextarea} from "primereact/inputtextarea";
import React from "react";


type Concept = {
    conceptOID: number,
    statusOID: number,
    userOIDSupervisor: number,
    text: string,
    filename: string,
    //userOIDSupervisor_user
}

interface Props {
    concept: any;
}

function ConceptAcceptReject({concept}: Props) {
    let inputText: string = "";
    const styles = {
        inputArea: {
            maxWidth: "65vw",
            maxHeight: "20vw"
        }
    };

    function onEvaluate(accepted: boolean) {
        //print text area
        alert(inputText + " " + accepted);
    }

    return (
        <div>
            <p>Konzept annehmen / ablehnen</p>
            <p>TODO user einfügen</p>
            <p>Text: {concept.text || "-"}</p>
            <p>Anhang: {concept.filename ? <a
                href={`http://${import.meta.env.VITE_BACKEND_URL}/api/concepts/get-concept-pdf/${concept.conceptOID}`}>{concept.filename}</a> : "-"}
            </p>
            <p>Status: {concept.statusOID}</p>
            {(concept.statusOID === 1) && // if evaluation pending
                <>
                    <InputTextarea style={styles.inputArea} rows={5} cols={40} onChange={(e) => {inputText = e.target.value}}/><br/>
                    <Button label="Annehmen" onClick={()=>onEvaluate(true)}/>
                    <Button label="Ablehnen" onClick={()=>onEvaluate(false)}/>
                </>
            }
            <p>{JSON.stringify(concept, null, 2)}</p>
        </div>
    )
}

export default ConceptAcceptReject;
