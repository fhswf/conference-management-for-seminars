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

function SeminarDetailsPage() {
    const [isEditMode, setIsEditMode] = useState(0);
    const [showUserConcept, setShowUserConcept] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedSupervisor, setSelectedSupervisor] = useState(undefined)
    const [studentList, setStudentList] = useState<any | null>(null);
    const [availableSupervisor, setAvailableSupervisor] = useState([]);
    const [comment, setComment] = useState("");
    const [showAddUser, setShowAddUser] = useState(false);

    //TODO replace with useFetch
    useEffect(() => {
        const fetchStudentList = async () => {
            const response = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api/seminar/get-students-list`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();
            setStudentList(data);
        }
        const fetchSupervisorList = async () => {
            try {
                const result = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api/user/get-supervisor-list/1`, {
                    method: 'GET',
                    credentials: 'include'
                }); // TODO replace
                //console.log(result.data);
                const availableSupervisor: any = [];
                const data = await result.json();
                data.map((supervisor: any) => {
                    availableSupervisor.push({
                        name: supervisor.lastname + ", " + supervisor.firstname,
                        userOID: supervisor.userOID
                    });
                })
                setAvailableSupervisor(availableSupervisor);
                console.log(availableSupervisor);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchSupervisorList();
        fetchStudentList();
    }, []);

    const roles = [
        {name: "Admin", value: 1},
        {name: "Betreuer", value: 2},
        {name: "Student", value: 3},
    ];

    const supervisor = [
        {name: "Betreuer A"},
        {name: "Betreuer B"},
        {name: "Betreuer C"},
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

    //TODO edit
    const tableData = studentList?.roleassignments.map(user => ({
        lname: user.userO.lastName || "-",
        fname: user.userO.firstName || "-",
        mail: user.userO.mail || "-",
        comment: user.userO.comment || "-",
        role: user.roleOID,
        supervisor: user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user?.firstname + " " + user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user?.lastname || '-',
        concept: user.userO.userOIDStudent_concepts[0]?.accepted || '-',
        btnEdit: <Button onClick={() => {
            setIsEditMode(user.userOID)
            //set data
            setComment(user.userO.comment)
            setSelectedRole(user.roleOID)
            setSelectedSupervisor(user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user?.userOID)
        }}>Edit</Button>,
        btnGoto: <Button onClick={() => setShowUserConcept(user.userO.userOIDStudent_concepts[0])}>➡</Button>
    }));

    function onDeleteClicked(userOID: number) {
        // TODO
        console.log(userOID);
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
        supervisor: isEditMode === user.userOID && user.roleOID === 3 ?
            <Dropdown showClear value={selectedSupervisor} options={availableSupervisor} optionLabel="name"
                      placeholder="Betreuer wählen"
                      onChange={(e) => setSelectedSupervisor(e.value)}/> : user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user?.firstname + " " + user.userO.userOIDStudent_concepts[0]?.userOIDSupervisor_user?.lastname,
        concept: user.userO.userOIDStudent_concepts[0]?.accepted || "-",
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
                            // In nächste Phase wechseln
                        }
                    }}>Review-Phase 🖊</p>
                    <p>{JSON.stringify(studentList)}</p>
                    {/* TODO Suchleiste einfügen */}
                    <HiddenLabel text={studentList?.assignmentkey}/>
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
                                console.log(selectedSupervisor);
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
                                        supervisorOID: selectedSupervisor || null,
                                        comment: comment,
                                        seminarOID: studentList.seminarOID
                                    })
                                });

                                if (result.ok) {
                                    setSelectedRole(null);
                                    setSelectedSupervisor(undefined);
                                    setComment("");
                                } else {
                                    alert("Fehler beim Speichern");
                                }
                            }}>Speichern</Button>
                            <Button onClick={() => {setIsEditMode(0)}}>Abbrechen</Button>
                        </> :
                        <Button onClick={() => {setShowAddUser(true)}}>Add User</Button>
                    }
                    <Modal isOpen={showUserConcept} onClose={() => {
                        setShowUserConcept(false)
                    }}><ConceptAcceptReject concept={showUserConcept}/></Modal>
                    <Modal isOpen={showAddUser} onClose={() => {
                        setShowAddUser(false)
                    }}><AddUserForm seminarname={studentList?.description} seminarOID={studentList?.seminarOID}/></Modal>
                </div>
            </MainLayout>
        </div>
    );
}

export default SeminarDetailsPage;
