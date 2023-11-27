import {useEffect, useState} from "react";
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

type Concept = {
    conceptOID: number,
    accepted: boolean,
    text: string,
    userOIDSupervisor_user: {
        userOID: number,
        firstName: string,
        lastName: string,
        mail: string
    },
    attachmentO: {
        attachmentOID: number,
        filename: string,
    },
}

type UserO = {
    userOID: number,
    roleOID: number,
    firstName: string,
    lastName: string,
    mail: string,
    comment: string,
    isAdmin: boolean,
    userOIDStudent_concepts: Concept[]
}

type StudentListResponse = {
    seminarOID: number,
    description: string,
    phase: number,
    assignmentkey: string,
    createdAt: string,
    updatedAt: string,
    roleassignments: {
        userOID: number,
        roleOID: number,
        userO: UserO
    }[]
}


type AvailableSupervisorResponse = {
    userOID: number,
    firstName: string,
    lastName: string,
}

function SeminarDetailsPage() {
    const [isEditMode, setIsEditMode] = useState(0);
    const [showUserConcept, setShowUserConcept] = useState<UserO | null>(null);
    const [selectedRole, setSelectedRole] = useState<number | null>(null);
    //const [selectedSupervisor, setSelectedSupervisor] = useState<number | null>(null);
    const [comment, setComment] = useState("");
    const [showAddUser, setShowAddUser] = useState(false);
    const {data: studentList} = useFetch<StudentListResponse>(`http://${import.meta.env.VITE_BACKEND_URL}/api/seminar/get-students-list`);
    const {data: availableSupervisor} = useFetch<AvailableSupervisorResponse[]>(`http://${import.meta.env.VITE_BACKEND_URL}/api/user/get-supervisor-list/2`);

    const roles = [
        {name: "Kurs-Admin", value: 1},
        {name: "Betreuer", value: 2},
        {name: "Student", value: 3},
    ];

    const header = [
        {field: "lname", header: "Nachname"},
        {field: "fname", header: "Vorname"},
        {field: "mail", header: "Mail"},
        {field: "comment", header: "Kommentar"},
        {field: "role", header: "Rolle"},
        {field: "supervisor", header: "Betreuer"},
        {field: "concept", header: "Konzept"},
        {field: "btnEdit", header: ""},
        {field: "btnGoto", header: ""},
    ];

    const headerEdit = [
        {field: "lname", header: "Nachname"},
        {field: "fname", header: "Vorname"},
        {field: "mail", header: "Mail"},
        {field: "comment", header: "Kommentar"},
        {field: "role", header: "Rolle"},
        {field: "supervisor", header: "Betreuer"},
        {field: "concept", header: "Konzept"},
        {field: "btnDelete", header: ""},
    ];

    studentList?.roleassignments.forEach(user => {
        console.log(user)
    } )

    const tableData = studentList?.roleassignments.map(user => ({
        lname: user.userO.lastName || "-",
        fname: user.userO.firstName || "-",
        mail: user.userO.mail || "-",
        comment: user.userO.comment || "-",
        role: user.roleOID,
        supervisor: user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user?.firstName + " " + user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user?.lastName || '-',
        concept: user.userO.userOIDStudent_concepts[0]?.accepted === null ? 'Bewertung ausstehend' : user.userO.userOIDStudent_concepts[0]?.accepted ? 'Angenommen' : 'Abgelehnt',
        btnEdit: <Button onClick={() => {
            setIsEditMode(user.userOID)
            //set data
            setComment(user.userO.comment)
            setSelectedRole(user.roleOID)
            //setSelectedSupervisor(user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user?.userOID)
        }}>Edit</Button>,
        btnGoto: <Button onClick={() => setShowUserConcept(user. userO)}>➡</Button>
    }));

    function onDeleteClicked(userOID: number) {
        // TODO
        console.log(userOID);
    }

    async function onNextPhaseClicked() {
        // TODO
        console.log("next phase");
        const result = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api/seminar/go-to-next-phase/2`, {
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
        comment: isEditMode === user.userOID ? <InputText defaultValue={user.userO.comment}
                                                          onChange={(e) => setComment(e.target.value)}/> : user.userO.comment,
        role: isEditMode === user.userOID ?
            <Dropdown value={selectedRole} options={roles} optionLabel="name" placeholder="Rolle wählen"
                      onChange={(e) => setSelectedRole(e.value)}/> : user.roleOID,
        supervisor: /* isEditMode === user.userOID && user.roleOID === 3 ?
            <Dropdown showClear value={selectedSupervisor} options={availableSupervisor!} optionLabel="name"
                      placeholder="Betreuer wählen"
                      onChange={(e) => setSelectedSupervisor(e.value)}/> : user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user?.firstName + " " + user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user?.lastName, */
            user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user?.firstName + " " + user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user?.lastName || '-',
        concept: user.userO.userOIDStudent_concepts[0]?.accepted === null ? 'Bewertung ausstehend' : user.userO.userOIDStudent_concepts[0]?.accepted === false ? 'Abgelehnt' : 'Angenommen',
        btnDelete: isEditMode === user.userOID ?
            <Button onClick={() => onDeleteClicked(user.userOID)}>Delete</Button> : null
    }));

    return (
        <div>
            <MainLayout>
                <div>
                    <p>Seminar Details: “{studentList?.description || "-"}”</p>
                    <p onClick={() => {
                        if (confirm('Möchten Sie von "Review-Phase" übergehen zu "Reviews lesen"?')) {
                            onNextPhaseClicked();
                        }
                    }}>Review-Phase 🖊</p>
                    <p><pre>{JSON.stringify(studentList, null, 2)}</pre></p>
                    {/* TODO Suchleiste einfügen */}
                    <HiddenLabel text={studentList?.assignmentkey || ""}/>
                    {!isEditMode ?
                        <Table header={header} data={tableData}/> :
                        <Table header={headerEdit} data={tableDataEdit}/>
                    }
                    {isEditMode ?
                        <>
                            <Button onClick={async () => {
                                setIsEditMode(0);
                                console.log("----------------------------------")
                                console.log(selectedRole);
                                //console.log(selectedSupervisor);
                                console.log(comment);
                                console.log("----------------------------------")

                                //TODO send changes
                                const result = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api/seminar/update-user`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        userOID: isEditMode,
                                        roleOID: roles.find(role => role.value === selectedRole)?.value,
                                        //supervisorOID: selectedSupervisor || null,
                                        comment: comment,
                                        seminarOID: studentList!.seminarOID
                                    })
                                });

                                if (result.ok) {
                                    setSelectedRole(null);
                                    //setSelectedSupervisor(undefined);
                                    setComment("");
                                } else {
                                    alert("Fehler beim Speichern");
                                }
                            }}>Speichern</Button>
                            <Button onClick={() => {
                                setIsEditMode(0)
                            }}>Abbrechen</Button>
                        </> :
                        <Button onClick={() => {
                            setShowAddUser(true)
                        }}>Add User</Button>
                    }
                    <Modal isOpen={showUserConcept} onClose={() => {
                        setShowUserConcept(null)
                    }}><ConceptAcceptReject user0={showUserConcept} availableSupervisors={availableSupervisor}/></Modal>
                    <Modal isOpen={showAddUser} onClose={() => {
                        setShowAddUser(false)
                    }}><AddUserForm seminarname={studentList?.description} seminarOID={studentList?.seminarOID}
                                    onClose={() => setShowAddUser(false)}/></Modal>
                </div>
            </MainLayout>
        </div>
    );
}

export default SeminarDetailsPage;
