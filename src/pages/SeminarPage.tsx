import Modal from "../components/Modal.tsx";
import styles from "./SeminarPage.module.css"
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import ChatWindowPage from "./ChatWindowPage.tsx";
import MainLayout from "../components/layout/MainLayout.tsx";
import {Button} from "primereact/button";

function SeminarPage() {
    const isStudent = true;
    const navigate = useNavigate();
    const [showCommentsOwnPaper, setShowCommentsOwnPaper] = useState(false);
    const [showCommentsStrangerPaper, setShowCommentsStrangerPaper] = useState(false);
    const [showChat, setShowChat] = useState(false);

    return (
        <div>
            <MainLayout>
                <div>
                    <p>Übersicht</p>
                    <p>Seminarname: Bachelor WS 2023/24</p>
                    <p>Phase: Konzept-Upload</p>
                    <p>Rolle: Student</p>
                </div>
                <br/>
                {isStudent && <> <p>Konzept:</p>
                    <div className={styles.conceptContainter}>
                        <div><p>Text</p></div>
                        <div><p>PDF</p></div>
                        <div><p>Betreuer</p></div>
                        <div><p>Status</p></div>
                        <div></div>
                        <div><p>mein text</p></div>
                        <div><a href="gfgegerg">konzept.pdf</a></div>
                        <div><p>Prof. Dr. Mustermann</p></div>
                        <div><p>angenommen</p></div>
                        <div>
                            <Button onClick={() => {
                                navigate("/concept-upload")
                            }}>➡
                            </Button>
                        </div>
                    </div>
                    <hr/>
                    <div>
                        Paper
                        <Button onClick={() => setShowCommentsOwnPaper(true)}>Kommentare</Button>
                        <Button onClick={() => {
                            navigate("/paper-upload")
                        }}>➡
                        </Button>
                    </div>
                    <hr/>
                </>
                }
                <p>Sie sind dem folgenden n Paper als Reviewer zugeordnet:</p>
                <div>
                    <a href="hthtzjrztjzt">fremdes_paper1.pdf</a>
                    <Button onClick={() => setShowChat(true)}>Kommentieren</Button>
                    <br/>
                    <a href="hthtzjrztjzt">fremdes_paper2.pdf</a>
                    <Button onClick={() => setShowChat(true)}>Kommentieren</Button>
                    <br/>
                    <a href="hthtzjrztjzt">fremdes_paper3.pdf</a>
                    <Button onClick={() => setShowChat(true)}>Kommentieren</Button>
                </div>
                <Modal isOpen={showCommentsOwnPaper}
                       onClose={() => setShowCommentsOwnPaper(false)}><ChatWindowPage/></Modal>
                <Modal isOpen={showChat} onClose={() => setShowChat(false)}><ChatWindowPage/></Modal>
            </MainLayout>
        </div>
    )
}

export default SeminarPage;