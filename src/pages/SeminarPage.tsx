import Modal from "../components/Modal.tsx";
import styles from "./SeminarPage.module.css"
import {useNavigate} from "react-router-dom";
import {Fragment, useState} from "react";
import ChatWindowPage from "./ChatWindowPage.tsx";
import MainLayout from "../components/layout/MainLayout.tsx";
import {Button} from "primereact/button";
import useFetch from "../hooks/useFetch.ts";

type RolleAssignment = {
    personOID: number;
    seminarOID: number;
    roleOID: number;
}

type Seminar = {
    description: string;
    phase: string;
    rolleassignments: RolleAssignment[];
}

type Paper = {
    paperOid: number;
    filename: string;
}

type Concept = {
    conceptOID: number;
    text: string;
    filename: string;
    personOIDSupervisor_person: {
        personOID: number;
        firstname: string;
        lastname: string;
    };
    statusO: {
        statusOID: number;
        description: string;
    };
}

function SeminarPage() {
    const isStudent = true; // TODO replace
    const navigate = useNavigate();
    const [showCommentsOwnPaper, setShowCommentsOwnPaper] = useState(false);
    //const [showCommentsStrangerPaper, setShowCommentsStrangerPaper] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const {data: concept} = useFetch<Concept>(`http://${import.meta.env.VITE_BACKEND_URL}/api/concepts/get-concept/`);
    const {data: seminar} = useFetch<Seminar>(`http://${import.meta.env.VITE_BACKEND_URL}/api/seminar/get-seminar`);
    const {data: assignedPaper} = useFetch<Paper[]>(`http://${import.meta.env.VITE_BACKEND_URL}/api/paper/get-assigned-paper`);



    return (
        <div>
            <MainLayout>
                <div>
                    <p>Übersicht</p>
                    <p>Seminarname: {seminar?.description || "-"}</p>
                    <p>Phase: {seminar?.phase}</p>
                    <p>Rolle: {seminar?.rolleassignments[0].roleOID}</p>
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
                            {(concept?.filename) ? //if filename exists pdf exists
                                <a href={`http://${import.meta.env.VITE_BACKEND_URL}/api/concepts/get-concept-pdf/${concept.conceptOID}`}>{concept.filename}</a> :
                                <p>-</p>
                            }
                        </div>
                        <div>
                            {(concept && concept.personOIDSupervisor_person) ?
                                <p>{concept.personOIDSupervisor_person.firstname} {concept.personOIDSupervisor_person.lastname}</p> :
                                <p>-</p>
                            }
                        </div>
                        <div>
                            {(concept && concept.statusO) ?
                                // TODO evtl mappen
                                <p>{concept.statusO.description}</p> :
                                <p>-</p>
                            }
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
                    {assignedPaper && assignedPaper.map((paper: Paper, index: number) => {
                        return (
                            <Fragment key={index}>
                                <a href={`http://${import.meta.env.VITE_BACKEND_URL}/api/paper/get-paper/${paper.paperOid}`}>{paper.filename}</a>
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