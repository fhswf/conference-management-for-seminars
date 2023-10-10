import styles from "./PaperOverviewPage.module.css"
import {useState} from "react";
import Modal from "../components/Modal.tsx";
import PaperUploadPage from "./PaperUploadPage.tsx";
import MainLayout from "../components/layout/MainLayout.tsx";
import {Button} from "primereact/button";
import ChatWindowPage from "./ChatWindowPage.tsx";

function PaperOverviewPage() {
    const [showModal, setShowModal] = useState(false);
    const [showChat, setShowChat] = useState(false);

    return (
        <div>
            <MainLayout>
                <p>Ihre eingereichten Paper:</p>
                <div className={styles.container}>
                    <p>Datei:</p>
                    <p>Anonym</p>
                    <p></p>
                    <p>mein_paper1.pdf</p>
                    <p>JA</p>
                    <Button onClick={() => setShowChat(true)}>Kommentare</Button>
                    <p>mein_paper2.pdf</p>
                    <p>JA</p>
                    <Button onClick={() => setShowChat(true)}>Kommentare</Button>
                    <p>mein_paper3.pdf</p>
                    <p>JA</p>
                    <Button onClick={() => setShowChat(true)}>Kommentare</Button>
                    <p></p>
                    <Button onClick={() => setShowModal(true)}>Hochladen</Button>
                    <p></p>
                </div>
                <Modal isOpen={showModal} onClose={() => setShowModal(false)}><PaperUploadPage/></Modal>
                <Modal isOpen={showChat} onClose={() => setShowChat(false)}><ChatWindowPage/></Modal>
            </MainLayout>
        </div>
    );
}

export default PaperOverviewPage;