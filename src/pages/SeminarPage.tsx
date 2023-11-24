import Modal from "../components/Modal.tsx";
import styles from "./SeminarPage.module.css"
import {useNavigate} from "react-router-dom";
import {Fragment, useState} from "react";
import ChatWindowPage from "./ChatWindowPage.tsx";
import MainLayout from "../components/layout/MainLayout.tsx";
import {Button} from "primereact/button";
import useFetch from "../hooks/useFetch.ts";

type RoleAssignment = {
    userOID: number;
    seminarOID: number;
    roleOID: number;
}

type Seminar = {
    description: string;
    phase: string;
    roleassignments: RoleAssignment[];
}

type Paper = {
    paperOID: number;
    attachmentO: {
        filename: string;
    }
}

type Concept = {
    conceptOID: number;
    text: string;
    filename: string;
    attachmentOID: number;
    userOIDSupervisor_user: {
        userOID: number;
        firstname: string;
        lastname: string;
    };
    attachmentO: {
        filename: string;
    };
    accepted: boolean | null;
}

function SeminarPage() {
    const isStudent = true; // TODO replace
    const navigate = useNavigate();
    const [showCommentsOwnPaper, setShowCommentsOwnPaper] = useState(false);
    //const [showCommentsStrangerPaper, setShowCommentsStrangerPaper] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const {data: concept} = useFetch<Concept>(`http://${import.meta.env.VITE_BACKEND_URL}/api/concepts`);
    const {data: seminar} = useFetch<Seminar>(`http://${import.meta.env.VITE_BACKEND_URL}/api/seminar/get-seminar/2`, );
    const {data: assignedPaper} = useFetch<Paper[]>(`http://${import.meta.env.VITE_BACKEND_URL}/api/paper/get-assigned-paper/2`);



    return (
        <div>
            <MainLayout>
                <div>
                    <p>{JSON.stringify(concept)}</p>
                    <p>{JSON.stringify(seminar)}</p>
                    <p>{JSON.stringify(assignedPaper)}</p>
                </div>
                <div>
                    <p>Übersicht</p>
                    <p>Seminarname: {seminar?.description || "-"}</p>
                    <p>Phase: {seminar?.phase}</p>
                    <p>Rolle:  {seminar?.roleassignments[0]?.roleOID}</p>
                </div>
                <br/>
                {isStudent && <> <p>Konzept:</p>
                    <div className={styles.conceptContainter}>
                        <div><p>Text</p></div>
                        <div><p>PDF</p></div>
                        <div><p>Betreuer</p></div>
                        <div><p>Status</p></div>
                        <div></div>
                        <div><p>{(concept) ? concept.text : "-"}</p></div>
                        {/**/}
                        <div>
                            {(concept?.attachmentO?.filename) ? //if filename exists pdf exists
                                <a href={`http://${import.meta.env.VITE_BACKEND_URL}/api/attachment/${concept.attachmentOID}`}>{concept.attachmentO.filename}</a> :
                                <p>-</p>
                            }
                        </div>
                        <div>
                            {(concept && concept.userOIDSupervisor_user) ?
                                <p>{concept.userOIDSupervisor_user.firstname} {concept.userOIDSupervisor_user.lastname}</p> :
                                <p>-</p>
                            }
                        </div>
                        <div>
                                <p>{concept?.accepted || "Bewertung ausstehend"}</p>
                        </div>
                        <div>
                            <Button onClick={() => {
                                navigate("/concept-upload")
                            }}>➡
                            </Button>
                        </div>
                    </div>
                    <hr/>
                    <div className={styles.paperContainer}>
                        <p>Paper</p>
                        <Button onClick={() => {
                            navigate("/paper-upload")
                        }}>➡
                        </Button>
                    </div>
                    <hr/>
                </>
                }
                <p>Sie sind dem folgenden {assignedPaper?.length} Paper als Reviewer zugeordnet:</p>
                <div className={styles.assignedPaperContainer}>
                    {assignedPaper && assignedPaper.length > 0 && assignedPaper.map((paper: Paper, index: number) => {
                        return (
                            <Fragment key={index}>
                                <a href={`http://${import.meta.env.VITE_BACKEND_URL}/api/attachment/${paper.paperOID}`}>{paper.attachmentO.filename}</a>
                                <Button onClick={() => setShowChat(true)}>Kommentieren</Button>
                            </Fragment>
                        )
                    })}
                </div>
                <Modal isOpen={showCommentsOwnPaper}
                       onClose={() => setShowCommentsOwnPaper(false)}><ChatWindowPage/></Modal>
                <Modal isOpen={showChat} onClose={() => setShowChat(false)}><ChatWindowPage/></Modal>
            </MainLayout>
        </div>
    )
}

export default SeminarPage;
