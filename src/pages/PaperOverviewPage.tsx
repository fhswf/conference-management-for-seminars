import styles from "./PaperOverviewPage.module.css"
import React, {Fragment, useEffect, useState} from "react";
import Modal from "../components/Modal.tsx";
import PaperUploadPage from "./PaperUploadPage.tsx";
import MainLayout from "../components/layout/MainLayout.tsx";
import {Button} from "primereact/button";
import ChatWindowPage from "./ChatWindowPage.tsx";
import useFetch from "../hooks/useFetch.ts";
import {useParams} from "react-router-dom";
import Paper from "../entities/database/Paper.ts";
import attachment from "../entities/database/Attachment.ts";
import RoleAssignment from "../entities/database/RoleAssignment.ts";
import Seminar from "../entities/database/Seminar.ts";

type PaperType = Paper & {
    attachmentO: attachment;
}

type SeminarType = Seminar & {
    roleassignments: RoleAssignment[];
}

function PaperOverviewPage() {
    const {seminarOID} = useParams();
    const [showModal, setShowModal] = useState(false);
    const [showChat, setShowChat] = useState<Paper>();
    //const [uploadedPaper, setUploadedPaper] = useState<PaperObj[] | null>(null)
    const {data: uploadedPaper, setData: setUploadedPaper} = useFetch<PaperType[]>(`${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_URL}/paper/get-uploaded-paper/${seminarOID}`);
    const {data: seminar, setData: setDataSeminar} = useFetch<SeminarType>(`${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_URL}/seminar/${seminarOID}`);

    async function onUpload(file: any) {
        if (!file || !seminarOID) {
            return;
        }

        const formData = new FormData();
        formData.append('seminarOID', seminarOID);
        formData.append('file', file);

        console.log(file);

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_URL}/paper`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            },);

            if (res.status === 200) {
                alert('Paper erfolgreich hochgeladen.');
                //setSelectedFile(null);
                setShowModal(false);
                const data = await res.json();
                console.log(data);
                setUploadedPaper([...uploadedPaper!, data]);
                //change phase3paperOID or phase7paperOID

                if(seminar?.phase === 7){
                    seminar.roleassignments[0].phase7paperOID = data.paperOID;
                }else if(seminar?.phase === 3){
                    seminar.roleassignments[0].phase3paperOID = data.paperOID;
                }

            } else if (res.status === 415) {
                alert("Bitte nur PDF-Dateien hochladen.")
            } if(res.status === 409){
                alert("Sie haben bereits ein Paper zur Bewertung eingereicht")
            } else if (res.status === 500) {
                alert('Fehler beim Hochladen des Papers.');
            }
        } catch (error) {
            console.error("Error uploading paper:", error);
            alert('Error uploading paper. Please check your internet connection and try again.');
        }
    }

    return (
        <div>
            <MainLayout>
                {/*<pre>{JSON.stringify(uploadedPaper, null, 2)}</pre>*/}
                {/*<pre>{JSON.stringify(seminar, null, 2)}</pre>*/}
                <h1>Eingereichte Paper:</h1>
                <div data-test="uploaded-papers-div" className={styles.container}>
                    <div data-test="header">
                        <p>Datei:</p>
                        <p>Eingereicht:</p>
                        <p></p>
                    </div>
                    {uploadedPaper && uploadedPaper.length > 0 ? (
                        uploadedPaper.map((paper: PaperType, index: number) => (
                            <div data-test="uploaded-paper-row" key={index}>
                                <a data-test="uploaded-paper-file" href={`${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_URL}/attachment/${paper.attachmentO.attachmentOID}`}>{paper.attachmentO.filename}</a>
                                {seminar && seminar.phase && seminar.roleassignments.length > 0 ? (
                                    paper.paperOID === seminar.roleassignments[0].phase3paperOID ? (
                                        <>
                                            <p data-test="uploaded-paper-phase">Phase 3</p>
                                            <Button data-test="uploaded-paper-comments" onClick={() => setShowChat(paper)} disabled={seminar.phase < 6}>Kommentare</Button>
                                        </>
                                    ) : paper.paperOID === seminar.roleassignments[0].phase7paperOID ? (
                                        <>
                                            <p data-test="uploaded-paper-phase">Phase 7</p>
                                            <p></p>
                                        </>
                                    ) : (
                                        <>
                                            <p data-test="uploaded-paper-phase">-</p>
                                            <p></p>
                                        </>
                                    )
                                ) : (
                                    <>
                                        <p>-</p>
                                        <p></p>
                                    </>
                                )}

                            </div>
                        ))
                    ) : (
                        <p>Keine Paper vorhanden.</p>
                    )}
                    <p></p>
                    <Button data-test="upload-paper-button" onClick={() => setShowModal(true)}
                            disabled={seminar?.phase !== 3 && (seminar?.phase !== 7 || !!seminar?.roleassignments[0].phase7paperOID)}>Hochladen</Button>
                    <p></p>
                </div>
                {seminar && <Modal isOpen={showModal} onClose={() => setShowModal(false)}><PaperUploadPage
                    seminarOID={seminarOID!} phase={seminar.phase!} onUpload={onUpload}/></Modal>}
                {showChat && <Modal isOpen={!!showChat} onClose={() => setShowChat(undefined)}><ChatWindowPage
                    paper={showChat}/></Modal>}
            </MainLayout>
        </div>
    );
}

export default PaperOverviewPage;
