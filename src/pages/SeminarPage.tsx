import Modal from "../components/Modal.tsx";
import styles from "./SeminarPage.module.css"
import {useNavigate, useParams} from "react-router-dom";
import {Fragment, useState} from "react";
import ChatWindowPage from "./ChatWindowPage.tsx";
import MainLayout from "../components/layout/MainLayout.tsx";
import {Button} from "primereact/button";
import useFetch from "../hooks/useFetch.ts";
import {mapPhaseToString, mapRoleToString} from "../utils/helpers.ts";
import RoleAssignment from "../entities/database/RoleAssignment.ts";
import Seminar from "../entities/database/Seminar.ts";
import Paper from "../entities/database/Paper.ts";
import Attachment from "../entities/database/Attachment.ts";
import Concept from "../entities/database/Concept.ts";
import User from "../entities/database/User.ts";
import Review from "../entities/database/Review.ts";

type SeminarType = Seminar & {
    roleassignments: RoleAssignment[];
}

type PaperType = Paper & {
    attachmentO: Attachment
    reviews: Review[]
}

type ConceptType = Concept & {
    userOIDSupervisor_user: User;
    attachmentO: Attachment;
}

function SeminarPage() {
    const {seminarOID} = useParams();
    let isStudent = null; // TODO replace
    const navigate = useNavigate();
    //const [showCommentsOwnPaper, setShowCommentsOwnPaper] = useState(false);
    //const [showCommentsStrangerPaper, setShowCommentsStrangerPaper] = useState(false);
    const [showChat, setShowChat] = useState<Paper>();
    const {data: seminar} = useFetch<SeminarType>(`http://${import.meta.env.VITE_BACKEND_URL}/seminar/get-seminar/${seminarOID}`,);
    // TODO only fetch if phase >= 2 and phase >= 5
    const {
        data: concept,
        loading: loadingConcept,
        error: errorConcept
    } = useFetch<ConceptType>(`http://${import.meta.env.VITE_BACKEND_URL}/concepts/newest/${seminarOID}`);
    const {
        data: assignedPaper,
        loading: loadingPaper,
        error: errorPaper
    } = useFetch<PaperType[]>(`http://${import.meta.env.VITE_BACKEND_URL}/paper/get-assigned-paper/${seminarOID}`);

    //const [concept, setConcept] = useState<Concept | null>(null)
    //const [assignedPaper, setAssignedPaper] = useState<Paper[] | null>(null)

    isStudent = seminar?.roleassignments && seminar?.roleassignments[0]?.roleOID === 3;

    function isJsonEmpty(json: any) {
        for (var key in json) {
            if (json.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

    return (
        <div>
            <MainLayout>
                <div>
                    <p>{seminarOID}</p>
                    {/*<p>{JSON.stringify(concept)}</p>*/}
                    {/*<p>{JSON.stringify(seminar)}</p>*/}
                    <pre>{JSON.stringify(assignedPaper, null, 2)}</pre>
                </div>
                <div>
                    <p>Übersicht</p>
                    <p>Seminarname: {seminar?.description || "-"}</p>
                    <p>Phase: {seminar && mapPhaseToString(seminar.phase!) || "-"}</p>
                    <p>Rolle: {seminar?.roleassignments[0]?.roleOID && mapRoleToString(seminar?.roleassignments[0]?.roleOID)}</p>
                </div>
                <br/>
                {isStudent && <> <p>Konzept:</p>
                    <div className={styles.conceptContainter}>
                        <div><p>Text</p></div>
                        <div><p>PDF</p></div>
                        <div><p>Betreuer</p></div>
                        <div><p>Feedback</p></div>
                        <div><p>Status</p></div>
                        <div></div>
                        <div><p>{(concept) ? concept.text : "-"}</p></div>
                        {/**/}
                        <div>
                            {(concept?.attachmentO?.filename) ? //if filename exists pdf exists
                                <a href={`http://${import.meta.env.VITE_BACKEND_URL}/attachment/${concept.attachmentOID}`}>{concept.attachmentO.filename}</a> :
                                <p>-</p>
                            }
                        </div>
                        <div>
                            {(concept?.userOIDSupervisor_user) ?
                                <p>{concept.userOIDSupervisor_user.firstName} {concept.userOIDSupervisor_user.lastName}</p> :
                                <p>-</p>
                            }
                        </div>
                        <div>
                            {(concept?.feedback) ?
                                <p>{concept.feedback}</p> :
                                <p>-</p>
                            }
                        </div>
                        <div>
                            <p>{concept?.accepted === null ? "Bewertung ausstehend" : concept?.accepted ? "Angenommen" : "Abgelehnt"}</p>
                        </div>
                        <div>  {/* TODO edit disabled rule */}
                            <Button onClick={() => {
                                navigate(`/concept-upload/${seminarOID}`)
                            }}
                                    /*disabled = {(concept && (concept?.accepted === null || concept?.accepted)) || (!concept && (seminar && seminar.phase! <= 3))}*/
                                    disabled = {!isJsonEmpty(concept) && (concept?.accepted === null || concept?.accepted || seminar?.phase !== 2) && concept?.accepted !== false}
                            >➡</Button>
                        </div>
                    </div>
                    <hr/>
                    <div className={styles.paperContainer}>
                        <p>Paper</p>
                        <Button onClick={() => {
                            navigate(`/paper-overview/${seminarOID}`)
                        }} disabled={seminar ? seminar.phase! < 3 : true}>➡
                        </Button>
                    </div>
                    <hr/>
                </>
                }
                <p>Sie sind den folgenden {assignedPaper?.length} Paper als Reviewer zugeordnet:</p>
                <div className={styles.assignedPaperContainer}>
                    {assignedPaper && assignedPaper.length > 0 && assignedPaper.map((paper: PaperType, index: number) => {
                        // müsste eigentlich immer vorhanden sein
                            if (paper.attachmentO) {
                                return (
                                    <Fragment key={index}>
                                        <a href={`http://${import.meta.env.VITE_BACKEND_URL}/attachment/${paper.attachmentO.attachmentOID}`}>{paper.attachmentO.filename}</a>
                                        <Button onClick={() => setShowChat(paper)}>Kommentieren</Button>
                                    </Fragment>
                                )
                            }
                    })}
                </div>
                {/*<Modal isOpen={showCommentsOwnPaper} onClose={() => setShowCommentsOwnPaper(false)}><ChatWindowPage paper={s}/></Modal>*/}
                {showChat && <Modal isOpen={!!showChat} onClose={() => setShowChat(undefined)}><ChatWindowPage
                    paper={showChat} /*reviewOID={showChat}*//></Modal>}
            </MainLayout>
        </div>
    )
}

export default SeminarPage;
