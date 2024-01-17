import {Button} from "primereact/button";
import {InputTextarea} from "primereact/inputtextarea";
import React, {useEffect, useState} from "react";
import {Dropdown} from "primereact/dropdown";
import User from "../entities/database/User.ts";
import Attachment from "../entities/database/Attachment.ts";
import Concept from "../entities/database/Concept.ts";
import {formatUserName} from "../utils/helpers.ts";

type ConceptType = Concept & {
    userOIDSupervisor_user: User,
    attachmentO: Attachment
}

type UserType = User & {
    userOIDStudent_concepts: ConceptType[]
}

interface Props {
    user0: UserType;
    availableSupervisors: User[];
    onClose?: () => void;
    userRole: number;
    //onEvaluated function with concept as return value
    onEvaluated?: (concept: ConceptType) => void;
}

function ConceptAcceptReject({user0, availableSupervisors, onClose, userRole, onEvaluated}: Props) {
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
            name: formatUserName(supervisor)
        }
    });

    useEffect(() => {
        setSelectedSupervisor(supervisor.find((supervisor) => supervisor?.userOID === user0.userOIDStudent_concepts[0].userOIDSupervisor_user?.userOID) || null);
    }, [availableSupervisors]);

    async function onEvaluate(accepted: boolean) {
        //print text area
        //alert(inputText + " " + accepted);
        if (accepted && !selectedSupervisor) {
            alert("Bitte wählen Sie einen Betreuer aus.");
            return;
        }

        const body = {
            conceptOID: user0.userOIDStudent_concepts[0].conceptOID,
            accepted: accepted,
            feedback: inputText,
            userOIDSupervisor: selectedSupervisor?.userOID || null,
            seminarOID: user0.userOIDStudent_concepts[0].seminarOID,
        }

        const response = await fetch(`${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_URL}/seminar/evaluate-concept`, {// TODO change to concept route
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            alert("Erfolgreich");
            //onClose && onClose();
            const concept = await response.json();

            onEvaluated && onEvaluated(concept);
        } else {
            alert("Fehler");
        }
        //alert(JSON.stringify(body, null, 2));

        //onClose && onClose();
    }

    return (
        <div>
            {/*<pre>{JSON.stringify(user0, null, 2)}</pre>*/}
            {/*<pre>{JSON.stringify(availableSupervisors, null, 2)}</pre>*/}
            {/*<pre>{JSON.stringify(user0.userOIDStudent_concepts[0], null, 2)}</pre>*/}
            {/*
                <pre>{JSON.stringify(concept, null, 2)}</pre>
                <pre>{JSON.stringify(availableSupervisors, null, 2)}</pre>
            <br/>*/}

            <h2 data-test="header-evaluate">Konzept annehmen / ablehnen</h2>
            <h3>Autor:</h3>
            <p data-test="name-evaluate">Name: {user0.firstname} {user0.lastname}</p>
            <p data-test="mail-evaluate">Mail: {user0.mail}</p>
            <hr/>
            <h3>Konzept:</h3>
            <p data-test="text-evaluate">Text: {user0.userOIDStudent_concepts[0].text || "-"}</p>
            <p data-test="attachment-evaluate">Anhang: {user0.userOIDStudent_concepts[0].attachmentO ? <a
                href={`${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_URL}/attachment/${user0.userOIDStudent_concepts[0].attachmentO.attachmentOID}`}>{user0.userOIDStudent_concepts[0].attachmentO.filename}</a> : "-"}
            </p>
            <p data-test="status-evaluate">Status: {user0.userOIDStudent_concepts[0].accepted === null ? "Bewertung ausstehend" : user0.userOIDStudent_concepts[0].accepted ? "Angenommen" : "Abgelehnt"}</p>
            <p data-test="feedback-evaluate">Feedback: {user0.userOIDStudent_concepts[0].feedback || "-"}</p>

            {/* if evaluation pending */}
            {(!user0.userOIDStudent_concepts[0].accepted) && userRole === 1 &&
                <>
                    Betreuer: <Dropdown data-test="supervisors-evaluate" value={selectedSupervisor} options={supervisor}
                                        optionLabel="name"
                                        placeholder="Betreuer wählen"
                                        onChange={(e) => setSelectedSupervisor(e.value)}/><br/>
                    <InputTextarea data-test="textfield-evaluate" style={styles.inputArea} rows={5} cols={40}
                                   onChange={(e) => {
                                       setInputText(e.target.value)
                                   }}/><br/>
                    <Button data-test="accept-evaluate" label="Annehmen" onClick={() => onEvaluate(true)}/>
                    <Button data-test="reject-evaluate" label="Ablehnen" onClick={() => onEvaluate(false)}
                            disabled={user0.userOIDStudent_concepts[0].accepted === false}/>
                </>
            }
        </div>
    )
}

export default ConceptAcceptReject;
