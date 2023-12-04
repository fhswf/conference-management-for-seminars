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
    const { seminarOID } = useParams();
    const [showModal, setShowModal] = useState(false);
    const [showChat, setShowChat] = useState(false);
    //const [uploadedPaper, setUploadedPaper] = useState<PaperObj[] | null>(null)
    const {data: uploadedPaper} = useFetch<PaperType[]>(`http://${import.meta.env.VITE_BACKEND_URL}/api/paper/get-uploaded-paper/${seminarOID}`);
    const {data: seminar} = useFetch<SeminarType>(`http://${import.meta.env.VITE_BACKEND_URL}/api/seminar/get-seminar/${seminarOID}`);

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
                                <a href={`http://${import.meta.env.VITE_BACKEND_URL}/api/attachment/${paper.attachmentO.attachmentOID}`}>{paper.attachmentO.filename}</a>
                                <p>JA</p>
                                <Button onClick={() => setShowChat(true)}>Kommentare</Button>
                            </Fragment>
                        ))
                    ) : (
                        <p>Keine Paper vorhanden.</p>
                    )}
                    <p></p>
                    <Button onClick={() => setShowModal(true)} disabled={seminar?.phase !== 3 && seminar?.phase !== 7}>Hochladen</Button> {/* TODO if phase = 7 or if User has not uploaded a paper yet */}
                    <p></p>
                </div>
                <Modal isOpen={showModal} onClose={() => setShowModal(false)}><PaperUploadPage seminarOID={seminarOID!}/></Modal>
                <Modal isOpen={showChat} onClose={() => setShowChat(false)}><ChatWindowPage/></Modal>
            </MainLayout>
        </div>
    );
}

export default PaperOverviewPage;
