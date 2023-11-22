import {useEffect, useState} from "react";
import Modal from "../components/Modal.tsx";
import ConceptAcceptReject from "../components/ConceptAcceptReject.tsx";
import MainLayout from "../components/layout/MainLayout.tsx";
import Table from "../components/Table.tsx";
import {InputText} from "primereact/inputtext";
import {Dropdown} from "primereact/dropdown";
import {Button} from "primereact/button";
import HiddenLabel from "../components/ToggleLabel.tsx";
import {Password} from "primereact/password";
import AddUserForm from "../components/AddUserForm.tsx";
import useFetch from "../hooks/useFetch.ts";

function SeminarDetailsPage() {
    const [isEditMode, setIsEditMode] = useState(0);
    const [showUserConcept, setShowUserConcept] = useState(false);
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
                const result = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api/person/get-supervisor-list/1`, {
                    method: 'GET',
                    credentials: 'include'
                }); // TODO replace
                //console.log(result.data);
                const availableSupervisor: any = [];
                const data = await result.json();
                data.map((supervisor: any) => {
                    availableSupervisor.push({
                        name: supervisor.lastname + ", " + supervisor.firstname,
                        personOID: supervisor.personOID
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
    const tableData = studentList?.rolleassignments.map(person => ({
        lname: person.personO.lastName || "-",
        fname: person.personO.firstName || "-",
        mail: person.personO.mail || "-",
        comment: person.personO.comment || "-",
        role: person.roleOID,
        supervisor: person.personO.personOIDStudent_concepts[0]?.personOIDSupervisor_person?.firstname + " " + person.personO.personOIDStudent_concepts[0]?.personOIDSupervisor_person?.lastname || '-',
        concept: person.personO.personOIDStudent_concepts[0]?.statusOID || '-',
        btnEdit: <Button onClick={() => {
            setIsEditMode(person.personOID)
            //set data
            setComment(person.personO.comment)
            setSelectedRole(person.roleOID)
            setSelectedSupervisor(person.personO.personOIDStudent_concepts[0]?.personOIDSupervisor_person?.personOID)
        }}>Edit</Button>,
        btnGoto: <Button onClick={() => setShowUserConcept(person.personO.personOIDStudent_concepts[0])}>➡</Button>
    }));

    function onDeleteClicked(personOID: number) {
        // TODO
        console.log(personOID);
    }

    const tableDataEdit = studentList?.rolleassignments.map(person => ({
        lname: person.personO.lastName,
        fname: person.personO.firstName,
        mail: person.personO.mail,
        comment: isEditMode === person.personOID ? <InputText defaultValue={person.personO.comment}
                                                              onChange={(e) => setComment(e.target.value)}/> : person.personO.comment,
        role: isEditMode === person.personOID ?
            <Dropdown value={selectedRole} options={roles} optionLabel="name" placeholder="Rolle wählen"
                      onChange={(e) => setSelectedRole(e.value)}/> : person.roleOID,
        supervisor: isEditMode === person.personOID && person.roleOID === 3 ?
            <Dropdown showClear value={selectedSupervisor} options={availableSupervisor} optionLabel="name"
                      placeholder="Betreuer wählen"
                      onChange={(e) => setSelectedSupervisor(e.value)}/> : person.personO.personOIDStudent_concepts[0]?.personOIDSupervisor_person?.firstname + " " + person.personO.personOIDStudent_concepts[0]?.personOIDSupervisor_person?.lastname,
        concept: person.personO.personOIDStudent_concepts[0]?.statusOID || "-",
        btnDelete: isEditMode === person.personOID ?
            <Button onClick={() => onDeleteClicked(person.personOID)}>Delete</Button> : null
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
                    {/* TODO Suchleiste einfügen */}
                    <HiddenLabel text={studentList?.key}/>
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
                                const result = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api/seminar/update-person`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        personOID: isEditMode,
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
                    }}><AddUserForm seminarname={studentList?.description} seminarOID={studentList?.seminarOID} onClose={() => {setShowAddUser(false)}}/></Modal>
                </div>
            </MainLayout>
        </div>
    );
}

export default SeminarDetailsPage;