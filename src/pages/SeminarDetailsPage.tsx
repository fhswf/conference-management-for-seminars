import {useContext, useEffect, useState} from "react";
import Modal from "../components/Modal.tsx";
import ConceptAcceptReject from "../components/ConceptAcceptReject.tsx";
import MainLayout from "../components/layout/MainLayout.tsx";
import Table from "../components/Table.tsx";
import {InputText} from "primereact/inputtext";
import {Dropdown} from "primereact/dropdown";
import {Button} from "primereact/button";
import HiddenLabel from "../components/ToggleLabel.tsx";
import AddUserForm from "../components/AddUserForm.tsx";
import useFetch from "../hooks/useFetch.ts";
import {useNavigate, useParams} from "react-router-dom";
import {formatUserName, mapConceptStatusToString, mapPhaseToString, mapRoleToString} from "../utils/helpers.ts";
import Concept from "../entities/database/Concept.ts";
import User from "../entities/database/User.ts";
import Attachment from "../entities/database/Attachment.ts";
import Seminar from "../entities/database/Seminar.ts";
import RoleAssignment from "../entities/database/RoleAssignment.ts";
import {AuthContext} from "../context/AuthContext.ts";

type ConceptType = Concept & {
    userOIDSupervisor_user: User,
    attachmentO: Attachment
}

type UserO = User & {
    userOIDStudent_concepts: ConceptType[]
}

type RoleAssignmentType = RoleAssignment & {
    userO: UserO
}

type StudentListResponse = Seminar & {
    roleassignments: RoleAssignmentType[]
}

function SeminarDetailsPage() {
    const {user} = useContext(AuthContext);
    const navigate = useNavigate();
    const {seminarOID} = useParams();
    const [isEditMode, setIsEditMode] = useState(0);
    const [showUserConcept, setShowUserConcept] = useState<UserO>();
    const [selectedRole, setSelectedRole] = useState<number | null>(null);
    //const [selectedSupervisor, setSelectedSupervisor] = useState<number | null>(null);
    const {
        data: participantsList,
        setData: setParticipantsList
    } = useFetch<StudentListResponse>(`${import.meta.env.VITE_BACKEND_URL}/seminar/${seminarOID}/participants`);
    const {data: availableSupervisor} = useFetch<User[]>(`${import.meta.env.VITE_BACKEND_URL}/seminar/${seminarOID}/supervisor-list`);

    const roles = [
        {name: "Kurs-Admin", value: 1},
        {name: "Betreuer", value: 2},
        {name: "Student", value: 3},
    ];

    const header = [
        {field: "lname", header: "Nachname"},
        {field: "fname", header: "Vorname"},
        {field: "mail", header: "Mail"},
        {field: "role", header: "Rolle"},
        {field: "supervisor", header: "Betreuer"},
        {field: "concept", header: "Konzept"},
        {field: "btnEdit", header: ""},
        {field: "btnGoto", header: ""},
        {field: "btnDetails", header: ""},
    ];

    const headerEdit = [
        {field: "lname", header: "Nachname"},
        {field: "fname", header: "Vorname"},
        {field: "mail", header: "Mail"},
        {field: "role", header: "Rolle"},
        {field: "supervisor", header: "Betreuer"},
        {field: "concept", header: "Konzept"},
    ];

    const tableData = participantsList?.roleassignments?.map(user => ({
        lname: user.userO.lastname || "-",
        fname: user.userO.firstname || "-",
        mail: user.userO.mail || "-",

        role: user.roleOID && mapRoleToString(user.roleOID),
        supervisor: user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user && formatUserName(user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user) || "-",
        concept: !user.userO.userOIDStudent_concepts[0] ? "-" : mapConceptStatusToString(user.userO.userOIDStudent_concepts[0]?.accepted),
        btnEdit: <Button onClick={() => {
            user.userOID && setIsEditMode(user.userOID);
            setSelectedRole(user.roleOID);
        }}>Edit</Button>,
        btnGoto: <Button data-test="evaluate-concept" onClick={() => setShowUserConcept(user.userO)}
                         disabled={!user.userO.userOIDStudent_concepts[0] || user.roleOID !== 3}>Bewerten</Button>,
        btnDetails: <Button
            onClick={() => navigate(`/seminar-details/${seminarOID}/user/${user.userOID}`)}>Details</Button>
    }));


    async function onNextPhaseClicked() {
        // TODO
        const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/seminar/${seminarOID}/go-to-next-phase`, {
            method: 'POST',
            credentials: 'include'
        });

        if (result.ok) {
            alert("Erfolgreich");
            setParticipantsList(studentList => {
                const newStudentList = {...studentList!};
                // to skip reviewer assignment phase
                if(newStudentList.phase! + 1 === 4) {
                    newStudentList.phase = newStudentList.phase! + 2;
                } else {
                    newStudentList.phase = newStudentList.phase! + 1;
                }

                return newStudentList;
            });
        } else {
            alert("Fehler");
        }
    }

    const tableDataEdit = participantsList?.roleassignments?.map(user => ({
        lname: user.userO.lastname || "-",
        fname: user.userO.firstname || "-",
        mail: user.userO.mail || "-",
        role: isEditMode === user.userOID ?
            <Dropdown data-test="role-edit" value={selectedRole} options={roles} optionLabel="name"
                      placeholder="Rolle wählen"
                      onChange={(e) => setSelectedRole(e.value)}/> : user.roleOID && mapRoleToString(user.roleOID),
        supervisor: /* isEditMode === user.userOID && user.roleOID === 3 ?
            <Dropdown showClear value={selectedSupervisor} options={availableSupervisor!} optionLabel="name"
                      placeholder="Betreuer wählen"
                      onChange={(e) => setSelectedSupervisor(e.value)}/> : user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user?.firstname + " " + user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user?.lastname, */
            user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user && formatUserName(user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user) || "-",
        concept: !user.userO.userOIDStudent_concepts[0] ? "-" : mapConceptStatusToString(user.userO.userOIDStudent_concepts[0]?.accepted),
    }));

    const p3paperCount = participantsList?.roleassignments?.filter(user => user.phase3paperOID !== null).length;
    const p7paperCount = participantsList?.roleassignments?.filter(user => user.phase7paperOID !== null).length;
    const conceptCount = participantsList?.roleassignments?.filter(user => user.userO.userOIDStudent_concepts[0]?.accepted === true).length;
    const studentCount = participantsList?.roleassignments?.filter(user => user.roleOID === 3).length;

    const currentRole = participantsList?.roleassignments?.find(userEntry => userEntry.userOID === user?.userOID);

    async function onUpdateUser() {
        setIsEditMode(0);

        const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/seminar/update-user`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userOID: isEditMode,
                roleOID: roles.find(role => role.value === selectedRole)?.value,
                //supervisorOID: selectedSupervisor || null,
                seminarOID: participantsList!.seminarOID
            })
        });

        if (result.ok) {
            setSelectedRole(null);
            setParticipantsList(studentList => {
                const newStudentList = {...studentList!};
                const user = newStudentList.roleassignments.find(user => user.userOID === isEditMode);
                if (user) {
                    user.roleOID = roles.find(role => role.value === selectedRole)?.value || null;
                }
                return newStudentList;
            })
            //setSelectedSupervisor(undefined);
            alert("Rolle erfolgreich geändert");
        } else if (result.status === 409) {
            alert("Fehler: Dieser Benutzer ist bereits Betreuer eines anderen Studenten");
        } else {
            alert("Fehler beim aktualisieren der Rollen");
        }
    }

    /**
     * Handles the evaluation of a concept and updates the participant list.
     *
     * @param {ConceptType} evaluatedConcept - The evaluated concept to be updated.
     */
    function onEvaluated(evaluatedConcept: ConceptType) {
        console.log(evaluatedConcept);
        setParticipantsList(studentList => {
            const newStudentList = {...studentList!};
            const user = newStudentList.roleassignments.find(user => user.userOID === evaluatedConcept.userOIDStudent!);
            if (user) {
                user.userO.userOIDStudent_concepts[0] = evaluatedConcept;
                const supervisor = availableSupervisor?.find(supervisor => supervisor.userOID === evaluatedConcept.userOIDSupervisor!);
                supervisor ? user.userO.userOIDStudent_concepts[0].userOIDSupervisor_user = supervisor : null;

            }
            console.log(evaluatedConcept);
            return newStudentList;
        });
        setShowUserConcept(undefined);
    }

    const role = participantsList?.roleassignments?.find(userEntry => userEntry.userOID === user?.userOID)?.roleOID;

    return (
        <div>
            <MainLayout>
                <div>
                    <p data-test="seminar-name">Seminar Details: "{participantsList?.description || "-"}"</p>
                    {/*<p>{role}</p>*/}
                    {participantsList?.phase && role === 1 &&
                        <p data-test="phase" onClick={() => {
                            if (participantsList?.phase && participantsList?.phase < 7 && confirm(`Möchten Sie von "${mapPhaseToString(participantsList?.phase)}" übergehen zu "${mapPhaseToString((participantsList?.phase + 1 === 4) ? participantsList?.phase + 2 : participantsList?.phase + 1)}"?`)) {
                                onNextPhaseClicked();
                            }
                        }}>{mapPhaseToString(participantsList?.phase)} 🖊</p>}
                    {/*<pre>{JSON.stringify(participantsList, null, 2)}</pre>*/}
                    {/*<pre>{JSON.stringify(availableSupervisor, null, 2)}</pre>*/}
                    <HiddenLabel text={participantsList?.assignmentkey || ""}/>
                    <p data-test="submitted-concepts">Eingereichte und angenommene
                        Konzepte: {conceptCount}/{studentCount}</p>
                    <p data-test="submitted-p3-paper">Eingereichte Paper Phase 3: {p3paperCount}/{studentCount}</p>
                    <p data-test="submitted-p7-paper">Eingereichte Paper Phase 7: {p7paperCount}/{studentCount}</p>
                    {!isEditMode ?
                        <Table data-test="table-participants" header={header} data={tableData}/> :
                        <Table data-test="table-participants-edit" header={headerEdit} data={tableDataEdit}/>
                    }
                    {isEditMode &&
                        <>
                            <Button data-test="save-edit" onClick={onUpdateUser}>Speichern</Button>
                            <Button data-test="abort-edit" onClick={() => {
                                setIsEditMode(0)
                            }}>Abbrechen</Button>
                        </>
                    }

                    {showUserConcept && availableSupervisor && currentRole &&
                        <Modal isOpen={!!showUserConcept} onClose={() => setShowUserConcept(undefined)}>
                            <ConceptAcceptReject onEvaluated={onEvaluated} onClose={() => setShowUserConcept(undefined)}
                                                 user0={showUserConcept} availableSupervisors={availableSupervisor}
                                                 userRole={currentRole.roleOID!}/>
                        </Modal>}
                </div>
            </MainLayout>
        </div>
    );
}

export default SeminarDetailsPage;
