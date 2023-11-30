import Modal from "../components/Modal.tsx";
import styles from "./SeminarPage.module.css"
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {Fragment, useEffect, useState} from "react";
import ChatWindowPage from "./ChatWindowPage.tsx";
import MainLayout from "../components/layout/MainLayout.tsx";
import {Button} from "primereact/button";
import useFetch from "../hooks/useFetch.ts";
import {mapPhaseToString, mapRoleToString} from "../utils/helpers.ts";

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
    const { seminarOID } = useParams();
    let isStudent = null; // TODO replace
    const navigate = useNavigate();
    const [showCommentsOwnPaper, setShowCommentsOwnPaper] = useState(false);
    //const [showCommentsStrangerPaper, setShowCommentsStrangerPaper] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const {data: seminar} = useFetch<Seminar>(`https://${import.meta.env.VITE_BACKEND_URL}/seminar/get-seminar/${seminarOID}`, );
    // TODO only fetch if phase >= 2 and phase >= 5
    const {data: concept, loading: loadingConcept, error: errorConcept} = useFetch<Concept>(`https://${import.meta.env.VITE_BACKEND_URL}/concepts/newest/${seminarOID}`);
    const {data: assignedPaper,loading: loadingPaper, error: errorPaper} = useFetch<Paper[]>(`https://${import.meta.env.VITE_BACKEND_URL}/paper/get-assigned-paper/${seminarOID}`);

    //const [concept, setConcept] = useState<Concept | null>(null)
    //const [assignedPaper, setAssignedPaper] = useState<Paper[] | null>(null)

    isStudent = seminar?.roleassignments && seminar?.roleassignments[0]?.roleOID === 3;

    return (
        <div>
            <MainLayout>
                <div>
                    <p>{seminarOID}</p>
                    <p>{JSON.stringify(concept)}</p>
                    <p>{JSON.stringify(seminar)}</p>
                    <p>{JSON.stringify(assignedPaper)}</p>
                </div>
                <div>
                    <p>Übersicht</p>
                    <p>Seminarname: {seminar?.description || "-"}</p>
                    <p>Phase: {seminar && mapPhaseToString(seminar.phase) || "-"}</p>
                    <p>Rolle:  {seminar?.roleassignments[0]?.roleOID && mapRoleToString(seminar?.roleassignments[0]?.roleOID)}</p>
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
                                <a href={`https://${import.meta.env.VITE_BACKEND_URL}/attachment/${concept.attachmentOID}`}>{concept.attachmentO.filename}</a> :
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
                                <p>{concept?.accepted === null ? "Bewertung ausstehend" : concept?.accepted ? "Angenommen" : "Abgelehnt"}</p>
                        </div>
                        <div>
                            <Button onClick={() => {navigate(`/concept-upload/${seminarOID}`)}}
                                    disabled={concept?.accepted === null || concept?.accepted || seminar?.phase !== 2 }
                            >➡</Button>
                        </div>
                    </div>
                    <hr/>
                    <div className={styles.paperContainer}>
                        <p>Paper</p>
                        <Button onClick={() => {
                            navigate(`/paper-overview/${seminarOID}`)
                        }} disabled={seminar ? seminar.phase < 3 : true}>➡
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
                                <a href={`https://${import.meta.env.VITE_BACKEND_URL}/attachment/${paper.paperOID}`}>{paper.attachmentO.filename}</a>
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
