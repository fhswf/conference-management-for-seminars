import Modal from "../components/Modal.tsx";
import styles from "./SeminarPage.module.css"
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import ChatWindowPage from "./ChatWindowPage.tsx";
import MainLayout from "../components/layout/MainLayout.tsx";
import {Button} from "primereact/button";
import Concept from "../entities/Concept.ts";
import Seminar from "../entities/Seminar.ts";

function SeminarPage() {
    const isStudent = true;
    const navigate = useNavigate();
    const [showCommentsOwnPaper, setShowCommentsOwnPaper] = useState(false);
    //const [showCommentsStrangerPaper, setShowCommentsStrangerPaper] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [concept, setConcept] = useState<Concept | null>(null);
    const [seminar, setSeminar] = useState<Seminar | null>(null)

    useEffect(() => {
        const fetchConcept = async () => {
            const response = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api/concepts/get-concept/`,{
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

        fetchConcept();
        fetchSeminar();
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
                        <div><p>{(concept) ? concept.text : "-"}</p></div>{/**/}
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