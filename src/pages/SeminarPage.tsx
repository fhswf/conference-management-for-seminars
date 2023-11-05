import Modal from "../components/Modal.tsx";
import styles from "./SeminarPage.module.css"
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import ChatWindowPage from "./ChatWindowPage.tsx";
import MainLayout from "../components/layout/MainLayout.tsx";
import {Button} from "primereact/button";
import Concept from "../entities/Concept.ts";
import Seminar from "../entities/Seminar.ts";
import AssignedPaper from "../entities/AssignedPaper.ts";

function SeminarPage() {
    const isStudent = true;
    const navigate = useNavigate();
    const [showCommentsOwnPaper, setShowCommentsOwnPaper] = useState(false);
    //const [showCommentsStrangerPaper, setShowCommentsStrangerPaper] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [concept, setConcept] = useState<Concept | null>(null);
    const [seminar, setSeminar] = useState<Seminar | null>(null)
    const [assignedPaper, setAssignedPaper] = useState<AssignedPaper[] | null>(null)

    useEffect(() => {
        const fetchConcept = async () => {
            const response = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api/concepts/get-concept/`, {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) {
                return;
            }
            setConcept(Concept.fromJson(await response.json()));
        }
        const fetchSeminar = async () => {
            const response = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api/seminar/get-seminar`, {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) {
                return;
            }
            const seminar = Seminar.fromJson(await response.json());
            console.log(seminar);
            setSeminar(seminar);
        }
        const fetchAssignedPaper = async () => {
            const response = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api/paper/get-assigned-paper`, {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) {
                return;
            }
            const assignedPaperData = await response.json()
            const assignedPapers = assignedPaperData.map(data => new AssignedPaper(data.paperOID, data.filename));
            console.log(assignedPaper);
            setAssignedPaper(assignedPapers);
        }

        fetchConcept();
        fetchSeminar();
        fetchAssignedPaper();
    }, [])

    return (
        <div>
            <MainLayout>
                <div>
                    <p>Übersicht</p>
                    {(seminar) ? <p>Seminarname: {seminar.description}</p> : <p>Seminarname: -</p>}
                    {(seminar) ? <p>Phase: {seminar.phase}</p> : <p>Phase: -</p>}
                    {(seminar) ? <p>Rolle: {seminar.roleAssignments.roleOID}</p> : <p>Rolle: -</p>}
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
                            {(concept && concept.filename) ? //if filename exists pdf exists
                                <a href={`http://${import.meta.env.VITE_BACKEND_URL}/api/concepts/get-concept-pdf/${concept.conceptOID}`}>{concept.filename}</a> :
                                <p>-</p>
                            }
                        </div>
                        <div>
                            {(concept && concept.personOIDSupervisorPerson) ?
                                <p>{concept.personOIDSupervisorPerson.firstname} {concept.personOIDSupervisorPerson.lastname}</p> :
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
                    <div>
                        Paper
                        <Button onClick={() => {
                            navigate("/paper-upload")
                        }}>➡
                        </Button>
                    </div>
                    <hr/>
                </>
                }
                <p>Sie sind dem folgenden {assignedPaper?.length} Paper als Reviewer zugeordnet:</p>
                <div>
                    {assignedPaper && assignedPaper.map((paper: AssignedPaper, index: number) => {
                        return (
                            <div key={index}>
                                <a href={`http://${import.meta.env.VITE_BACKEND_URL}/api/paper/get-assigned-paper-pdf/${paper.paperOid}`}>{paper.filename}</a>
                                <Button onClick={() => setShowChat(true)}>Kommentieren</Button>
                                <br/>
                            </div>
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