import {Button} from "primereact/button";
import {InputTextarea} from "primereact/inputtextarea";
import React, {useState} from "react";
import {Dropdown} from "primereact/dropdown";

type Concept = {
    conceptOID: number,
    accepted: boolean,
    text: string,
    userOIDSupervisor_user: {
        userOID: number,
        firstName: string,
        lastName: string,
        mail: string
    },
    attachmentO: {
        attachmentOID: number,
        filename: string,
    },
}

type UserO = {
    userOID: number,
    roleOID: number,
    firstName: string,
    lastName: string,
    mail: string,
    comment: string,
    isAdmin: boolean,
    userOIDStudent_concepts: Concept[]
}

type AvailableSupervisor = {
    userOID: number,
    firstName: string,
    lastName: string,
}

interface Props {
    user0: UserO;
    availableSupervisors: AvailableSupervisor[];
    onClose?: () => void;
}

function ConceptAcceptReject({user0, availableSupervisors, onClose}: Props) {
    const [selectedSupervisor, setSelectedSupervisor] = useState<AvailableSupervisor | null>(null)
    let inputText: string = "";
    const styles = {
        inputArea: {
            maxWidth: "65vw",
            maxHeight: "20vw"
        }
    };

    //const supervisor = [
    //    {name: "Betreuer A"},
    //    {name: "Betreuer B"},
    //    {name: "Betreuer C"},
    //];

    const supervisor = availableSupervisors.map((supervisor) => {
        return {
            ...supervisor,
            name: supervisor.firstName + " " + supervisor.lastName,
        }
    });

    async function onEvaluate(accepted: boolean) {
        //print text area
        //alert(inputText + " " + accepted);
        if(accepted && !selectedSupervisor) {
            alert("Bitte wählen Sie einen Betreuer aus.");
            return;
        }

        const body = {
            conceptOID: user0.userOIDStudent_concepts[0].conceptOID,
            accepted: accepted,
            feedback: inputText,
            userOIDSupervisor: selectedSupervisor?.userOID || null,
        }

        const response = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api/seminar/evaluate-concept`, {// TODO to concept route
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if(response.ok) {
            alert("Erfolgreich");
        } else {
            alert("Fehler");
        }
        //alert(JSON.stringify(body, null, 2));

        //onClose && onClose();
    }

    return (
        <div>
            <p><pre>{JSON.stringify(user0, null, 2)}</pre></p>
            {/*<p>
                <pre>{JSON.stringify(concept, null, 2)}</pre>
                <pre>{JSON.stringify(availableSupervisors, null, 2)}</pre>
            </p><br/>*/}
            
            <p>Konzept annehmen / ablehnen</p>
            <p>TODO user einfügen</p>
            <p>Eingereicht von {user0.firstName}</p>
            <p>Text: {user0.userOIDStudent_concepts[0].text || "-"}</p>
            <p>Anhang: {user0.userOIDStudent_concepts[0].attachmentO ? <a
                href={`http://${import.meta.env.VITE_BACKEND_URL}/api/attachment/${user0.userOIDStudent_concepts[0].attachmentO.attachmentOID}`}>{user0.userOIDStudent_concepts[0].attachmentO.filename}</a> : "-"}
            </p>
            <p>Status: {user0.userOIDStudent_concepts[0].accepted === null ? "Bewertung ausstehend" : user0.userOIDStudent_concepts[0].accepted ? "Angenommen" : "Abgelehnt"}</p>

            {(!user0.userOIDStudent_concepts[0].accepted) && // if evaluation pending
                <>
                    Betreuer: <Dropdown value={selectedSupervisor} options={supervisor} optionLabel="name"
                                        placeholder="Betreuer wählen"
                                        onChange={(e) => setSelectedSupervisor(e.value)}/><br/>
                    <InputTextarea style={styles.inputArea} rows={5} cols={40} onChange={(e) => {
                        inputText = e.target.value
                    }}/><br/>
                    <Button label="Annehmen" onClick={() => onEvaluate(true)}/>
                    <Button label="Ablehnen" onClick={() => onEvaluate(false)}/>
                </>
            }
        </div>
    )
}

export default ConceptAcceptReject;
