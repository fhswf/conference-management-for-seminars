import styles from "./PaperOverviewPage.module.css"
import React, {Fragment, useEffect, useState} from "react";
import Modal from "../components/Modal.tsx";
import PaperUploadPage from "./PaperUploadPage.tsx";
import MainLayout from "../components/layout/MainLayout.tsx";
import {Button} from "primereact/button";
import ChatWindowPage from "./ChatWindowPage.tsx";
import useFetch from "../hooks/useFetch.ts";
import {useParams} from "react-router-dom";

type Paper = {
    paperOID: number;
    attachmentO: {
        attachmentOID: number;
        filename: string;
    };
}

type RoleAssignment = {
    userOID: number;
    seminarOID: number;
    roleOID: number;
}

type Seminar = {
    description: string;
    phase: number;
    roleassignments: RoleAssignment[];
}

function PaperOverviewPage() {
    const { seminarOID } = useParams();
    const [showModal, setShowModal] = useState(false);
    const [showChat, setShowChat] = useState(false);
    //const [uploadedPaper, setUploadedPaper] = useState<AssignedPaper[] | null>(null)
    const {data: uploadedPaper} = useFetch<Paper[]>(`https://${import.meta.env.VITE_BACKEND_URL}/paper/get-uploaded-paper/${seminarOID}`);
    const {data: seminar} = useFetch<Seminar>(`https://${import.meta.env.VITE_BACKEND_URL}/seminar/get-seminar/${seminarOID}`);

    return (
        <div>
            <MainLayout>
                <p>{JSON.stringify(uploadedPaper)}</p>
                <p>{JSON.stringify(seminar)}</p>
                <p>Ihre eingereichten Paper:</p>
                <div className={styles.container}>
                    <p>Datei:</p>
                    <p>Anonym</p>
                    <p></p>
                    {uploadedPaper && uploadedPaper.length > 0 ? (
                        uploadedPaper.map((paper: Paper, index: number) => (
                            <Fragment key={index}>
                                <a href={`https://${import.meta.env.VITE_BACKEND_URL}/attachment/${paper.attachmentO.attachmentOID}`}>{paper.attachmentO.filename}</a>
                                <p>JA</p>
                                <Button onClick={() => setShowChat(true)}>Kommentare</Button>
                            </Fragment>
                        ))
                    ) : (
                        <p>Keine Paper vorhanden.</p>
                    )}
                    <p></p>
                    <Button onClick={() => setShowModal(true)} disabled={seminar?.phase !== 3}>Hochladen</Button> {/* TODO if phase = 7 or if User has not uploaded a paper yet */}
                    <p></p>
                </div>
                <Modal isOpen={showModal} onClose={() => setShowModal(false)}><PaperUploadPage seminarOID={seminarOID!}/></Modal>
                <Modal isOpen={showChat} onClose={() => setShowChat(false)}><ChatWindowPage/></Modal>
            </MainLayout>
        </div>
    );
}

export default PaperOverviewPage;
