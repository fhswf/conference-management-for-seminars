import {Button} from "primereact/button";
import {InputTextarea} from "primereact/inputtextarea";
import React, {useEffect, useState} from "react";
import {Dropdown} from "primereact/dropdown";
import User from "../entities/database/User.ts";
import Attachment from "../entities/database/Attachment.ts";
import Concept from "../entities/database/Concept.ts";

type ConceptType = Concept & {
    userOIDSupervisor_user: User | null;
    attachmentO: Attachment | null;
}

type UserType = User & {
    userOIDStudent_concepts: ConceptType[]
}

interface Props {
    user0: UserType;
    availableSupervisors: User[];
    onClose?: () => void;
}

function ConceptAcceptReject({user0, availableSupervisors, onClose}: Props) {
    const [selectedSupervisor, setSelectedSupervisor] = useState<User | null>(null)
    const [inputText, setInputText] = useState("")
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

    useEffect(() => {
        setSelectedSupervisor(supervisor.find((supervisor) => supervisor?.userOID === user0.userOIDStudent_concepts[0].userOIDSupervisor_user?.userOID) || null);
    }, [availableSupervisors]);

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

        const response = await fetch(`https://${import.meta.env.VITE_BACKEND_URL}/seminar/evaluate-concept`, {// TODO change to concept route
            method: "POST",
            credentials: 'include',
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
            <pre>{JSON.stringify(user0, null, 2)}</pre>
            <pre>{JSON.stringify(availableSupervisors, null, 2)}</pre>
            {/*
                <pre>{JSON.stringify(concept, null, 2)}</pre>
                <pre>{JSON.stringify(availableSupervisors, null, 2)}</pre>
            <br/>*/}
            
            <h2>Konzept annehmen / ablehnen</h2>
            <h3>Autor:</h3>
            <p>Name: {user0.firstName} {user0.lastName}</p>
            <p>Kommentar: {user0.comment || "-"}</p>
            <p>Mail: {user0.mail}</p>
            <hr/>
            <h3>Konzept:</h3>
            <p>Text: {user0.userOIDStudent_concepts[0].text || "-"}</p>
            <p>Anhang: {user0.userOIDStudent_concepts[0].attachmentO ? <a
                href={`https://${import.meta.env.VITE_BACKEND_URL}/attachment/${user0.userOIDStudent_concepts[0].attachmentO.attachmentOID}`}>{user0.userOIDStudent_concepts[0].attachmentO.filename}</a> : "-"}
            </p>
            <p>Status: {user0.userOIDStudent_concepts[0].accepted === null ? "Bewertung ausstehend" : user0.userOIDStudent_concepts[0].accepted ? "Angenommen" : "Abgelehnt"}</p>
            <p>Feedback: {user0.userOIDStudent_concepts[0].feedback || "-"}</p>

            {(!user0.userOIDStudent_concepts[0].accepted) && // if evaluation pending
                <>
                    <h4>TODO Beurteilung auf Kurs-Admin beschränken</h4>
                    Betreuer: <Dropdown value={selectedSupervisor} options={supervisor} optionLabel="name"
                                        placeholder="Betreuer wählen"
                                        onChange={(e) => setSelectedSupervisor(e.value)}/><br/>
                    <InputTextarea style={styles.inputArea} rows={5} cols={40} onChange={(e) => {
                        setInputText(e.target.value)
                    }}/><br/>
                    <Button label="Annehmen" onClick={() => onEvaluate(true)}/>
                    <Button label="Ablehnen" onClick={() => onEvaluate(false)} disabled={user0.userOIDStudent_concepts[0].accepted === false}/>
                </>
            }
        </div>
    )
}

export default ConceptAcceptReject;
