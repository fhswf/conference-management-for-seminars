import styles from "./PaperOverviewPage.module.css"
import React, {Fragment, useEffect, useState} from "react";
import Modal from "../components/Modal.tsx";
import PaperUploadPage from "./PaperUploadPage.tsx";
import MainLayout from "../components/layout/MainLayout.tsx";
import {Button} from "primereact/button";
import ChatWindowPage from "./ChatWindowPage.tsx";
import useFetch from "../hooks/useFetch.ts";

type Paper = {
    paperOID: number;
    attachmentO: {
        attachmentOID: number;
        filename: string;
    };
}

function PaperOverviewPage() {
    const [showModal, setShowModal] = useState(false);
    const [showChat, setShowChat] = useState(false);
    //const [uploadedPaper, setUploadedPaper] = useState<AssignedPaper[] | null>(null)
    const {data: uploadedPaper} = useFetch<Paper[]>(`http://${import.meta.env.VITE_BACKEND_URL}/api/paper/get-uploaded-paper/2`);

    return (
        <div>
            <MainLayout>
                <p>{JSON.stringify(uploadedPaper)}</p>
                <p>Ihre eingereichten Paper:</p>
                <div className={styles.container}>
                    <p>Datei:</p>
                    <p>Anonym</p>
                    <p></p>
                    {uploadedPaper && uploadedPaper.length > 0 ? (
                        uploadedPaper.map((paper: Paper, index: number) => (
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
                    <Button onClick={() => setShowModal(true)}>Hochladen</Button> {/* TODO if phase = 7 or if User has not uploaded a paper yet */}
                    <p></p>
                </div>
                <Modal isOpen={showModal} onClose={() => setShowModal(false)}><PaperUploadPage/></Modal>
                <Modal isOpen={showChat} onClose={() => setShowChat(false)}><ChatWindowPage/></Modal>
            </MainLayout>
        </div>
    );
}

export default PaperOverviewPage;
