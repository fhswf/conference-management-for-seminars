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
import {mapPhaseToString, mapRoleToString} from "../utils/helpers.ts";
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
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const {seminarOID} = useParams();
    const [isEditMode, setIsEditMode] = useState(0);
    const [showUserConcept, setShowUserConcept] = useState<UserO>();
    const [selectedRole, setSelectedRole] = useState<number | null>(null);
    //const [selectedSupervisor, setSelectedSupervisor] = useState<number | null>(null);
    const {data: studentList} = useFetch<StudentListResponse>(`http://${import.meta.env.VITE_BACKEND_URL}/seminar/get-students-list/${seminarOID}`);
    const {data: availableSupervisor} = useFetch<User[]>(`http://${import.meta.env.VITE_BACKEND_URL}/user/get-supervisor-list/${seminarOID}`);

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

    const tableData = studentList?.roleassignments.map(user => ({
        lname: user.userO.lastName || "-",
        fname: user.userO.firstName || "-",
        mail: user.userO.mail || "-",

        role: user.roleOID && mapRoleToString(user.roleOID),
        supervisor: !user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user ? "-" : user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user?.firstName + " " + user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user?.lastName || '-',
        concept: !user.userO.userOIDStudent_concepts[0] ? "-" : user.userO.userOIDStudent_concepts[0]?.accepted === null ? 'Bewertung ausstehend' : user.userO.userOIDStudent_concepts[0]?.accepted ? 'Angenommen' : 'Abgelehnt',
        btnEdit: <Button onClick={() => {
            //navigate(`/student-details/${seminarOID}/${user.userOID}`);
            //return;
            user.userOID && setIsEditMode(user.userOID)
            //set data
            setSelectedRole(user.roleOID)
            //setSelectedSupervisor(user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user?.userOID)
        }}>Edit</Button>,
        btnGoto: <Button onClick={() => setShowUserConcept(user.userO)}
                         disabled={!user.userO.userOIDStudent_concepts[0]}>Bewerten</Button>,
        btnDetails: <Button onClick={() => navigate(`/student-details/${seminarOID}/${user.userOID}`)}>Details</Button>
    }));

    function onDeleteClicked(userOID: number) {
        // TODO
        console.log(userOID);
    }

    async function onNextPhaseClicked() {
        // TODO
        console.log("next phase");
        const result = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/seminar/go-to-next-phase/${seminarOID}`, {
            method: 'POST',
            credentials: 'include'
        });

        if (result.ok) {
            alert("Erfolgreich");
        } else {
            alert("Fehler");
        }
    }

    const tableDataEdit = studentList?.roleassignments.map(user => ({
        lname: user.userO.lastName,
        fname: user.userO.firstName,
        mail: user.userO.mail,
        role: isEditMode === user.userOID ?
            <Dropdown value={selectedRole} options={roles} optionLabel="name" placeholder="Rolle wählen"
                      onChange={(e) => setSelectedRole(e.value)}/> : user.roleOID,
        supervisor: /* isEditMode === user.userOID && user.roleOID === 3 ?
            <Dropdown showClear value={selectedSupervisor} options={availableSupervisor!} optionLabel="name"
                      placeholder="Betreuer wählen"
                      onChange={(e) => setSelectedSupervisor(e.value)}/> : user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user?.firstName + " " + user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user?.lastName, */
            user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user?.firstName + " " + user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user?.lastName || '-',
        concept: user.userO.userOIDStudent_concepts[0]?.accepted === null ? 'Bewertung ausstehend' : user.userO.userOIDStudent_concepts[0]?.accepted === false ? 'Abgelehnt' : 'Angenommen',

    }));

    const conceptCount = studentList?.roleassignments.filter(user => user.userO.userOIDStudent_concepts[0]?.accepted === true).length;
    const studentCount = studentList?.roleassignments.filter(user => user.roleOID === 3).length;

    const currentRole = studentList?.roleassignments.find(userEntry => userEntry.userOID === user?.userOID);

    return (
        <div>
            <MainLayout>
                <div>
                    <p>Seminar Details: “{studentList?.description || "-"}”</p>
                    {studentList?.phase && <p onClick={() => {
                        if (studentList?.phase && studentList?.phase < 7 && confirm(`Möchten Sie von "${mapPhaseToString(studentList?.phase)}" übergehen zu "${mapPhaseToString(studentList?.phase + 1)}"?`)) {
                            onNextPhaseClicked();
                        }
                    }}>{mapPhaseToString(studentList?.phase)} 🖊</p>}
                    <pre>{JSON.stringify(currentRole, null, 2)}</pre>
                    <HiddenLabel text={studentList?.assignmentkey || ""}/>
                    <p>Eingereichte und angenommene Konzepte: {conceptCount}/{studentCount}</p>
                    <p>Eingereichte Paper Phase 4: TODO</p>
                    <p>Eingereichte Paper Phase 7: TODO</p>
                    {!isEditMode ?
                        <Table header={header} data={tableData}/> :
                        <Table header={headerEdit} data={tableDataEdit}/>
                    }
                    {isEditMode &&
                        <>
                            <Button onClick={async () => {
                                setIsEditMode(0);
                                console.log("----------------------------------")
                                console.log(selectedRole);
                                //console.log(selectedSupervisor);
                                console.log("----------------------------------")

                                //TODO send changes
                                const result = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/seminar/update-user`, {
                                    method: 'POST',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        userOID: isEditMode,
                                        roleOID: roles.find(role => role.value === selectedRole)?.value,
                                        //supervisorOID: selectedSupervisor || null,
                                        seminarOID: studentList!.seminarOID
                                    })
                                });

                                if (result.ok) {
                                    setSelectedRole(null);
                                    //setSelectedSupervisor(undefined);
                                    alert("Rolle erfolgreich geändert");
                                } else {
                                    alert("Fehler beim Speichern");
                                }
                            }}>Speichern</Button>
                            <Button onClick={() => {
                                setIsEditMode(0)
                            }}>Abbrechen</Button>
                        </>
                    }

                    {showUserConcept && availableSupervisor  && currentRole &&
                        <Modal isOpen={!!showUserConcept} onClose={() => setShowUserConcept(undefined)}>
                            <ConceptAcceptReject user0={showUserConcept} availableSupervisors={availableSupervisor} userRole={currentRole.roleOID!}/>
                        </Modal>}
                </div>
            </MainLayout>
        </div>
    );
}

export default SeminarDetailsPage;
