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
    const {data: uploadedPaper} = useFetch<PaperType[]>(`https://${import.meta.env.VITE_BACKEND_URL}/paper/get-uploaded-paper/${seminarOID}`);
    const {data: seminar} = useFetch<SeminarType>(`https://${import.meta.env.VITE_BACKEND_URL}/seminar/get-seminar/${seminarOID}`);

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
                        uploadedPaper.map((paper: PaperType, index: number) => (
                            <Fragment key={index}>
                                <a href={`https://${import.meta.env.VITE_BACKEND_URL}/attachment/${paper.attachmentO.attachmentOID}`}>{paper.attachmentO.filename}</a>
                                {seminar && seminar.roleassignments.length > 0 ? (
                                    paper.paperOID === seminar.roleassignments[0].phase4paperOID ? (
                                        <>
                                            <p>Phase 4</p>
                                            <Button onClick={() => setShowChat(paper)} disabled={/*seminar.phase < 6*/ false}>Kommentare</Button>
                                        </>
                                    ) : paper.paperOID === seminar.roleassignments[0].phase7paperOID ? (
                                        <>
                                            <p>Phase 7</p>
                                            <Button onClick={() => setShowChat(paper)}>Kommentare</Button>
                                        </>
                                    ) : (
                                        <>
                                            <p>-</p>
                                            <p></p>
                                        </>
                                    )
                                ) : (
                                    <>
                                        <p>-</p>
                                        <p></p>
                                    </>
                                )}

                            </Fragment>
                        ))
                    ) : (
                        <p>Keine Paper vorhanden.</p>
                    )}
                    <p></p>
                    <Button onClick={() => setShowModal(true)}
                            disabled={seminar?.phase !== 3 && seminar?.phase !== 7}>Hochladen</Button> {/* TODO if phase = 7 or if User has not uploaded a paper yet */}
                    <p></p>
                </div>
                {seminar && <Modal isOpen={showModal} onClose={() => setShowModal(false)}><PaperUploadPage
                    seminarOID={seminarOID!} phase={seminar.phase!}/></Modal>}
                {showChat && <Modal isOpen={!!showChat} onClose={() => setShowChat(undefined)}><ChatWindowPage
                    paper={showChat}/></Modal>}
            </MainLayout>
        </div>
    );
}

export default PaperOverviewPage;
