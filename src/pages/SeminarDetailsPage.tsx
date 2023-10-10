import Searchbar from "../components/Searchbar.tsx";
import {FormEvent, useState} from "react";
import Modal from "../components/Modal.tsx";
import AddUserForm from "../components/AddUserForm.tsx";
import ConceptAcceptReject from "../components/ConceptAcceptReject.tsx";
import MainLayout from "../components/layout/MainLayout.tsx";
import Table from "../components/Table.tsx";
import {InputText} from "primereact/inputtext";
import {Dropdown} from "primereact/dropdown";
import {Button} from "primereact/button";

function SeminarDetailsPage() {
    const [isEditMode, setIsEditMode] = useState(false)
    const [showUserConcept, setShowUserConcept] = useState(false)
    const [showAddUserModal, setShowAddUserModal] = useState(false)
    const [selectedRole, setSelectedRole] = useState(null);
    const [selecetedSupervisor, setSelecetedSupervisor] = useState(null)

    const roles = [
        {name: "Student"},
        {name: "Betreuer"},
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

    const tableData = [
        {lname: "Mustermann", fname: "Max1", mail: "mustermann.max1@fh-swf.de", comment: "", role: "Student", supervisor: "Betreuer A", concept: "eingereicht", btnEdit: <Button onClick={()=>{setIsEditMode(true)}}>Edit</Button>, btnGoto: <Button onClick={()=>setShowUserConcept(true)}>➡</Button>},
        {lname: "Mustermann", fname: "Max2", mail: "mustermann.max2@fh-swf.de", comment: "Kommentar", role: "Betreuer", supervisor: "", concept: "Bewertung ausstehend", btnEdit: <Button onClick={()=>{setIsEditMode(true)}}>Edit</Button>, btnGoto: <Button onClick={()=>setShowUserConcept(true)}>➡</Button>},
    ];

    const tableDataEdit = [
        {lname: "Mustermann", fname: "Max1", mail: "mustermann.max1@fh-swf.de", comment: <InputText/>, role: <Dropdown value={selectedRole} onChange={(e) => setSelectedRole(e.value)} options={roles} optionLabel="name" placeholder="Rolle wählen" />, supervisor: <Dropdown value={selecetedSupervisor} onChange={(e) => setSelecetedSupervisor(e.value)} options={supervisor} optionLabel="name" placeholder="Betreuer wählen" />, concept: "eingereicht", btnDelete: <Button onClick={()=>{}}>Delete</Button>},
        {lname: "Mustermann", fname: "Max2", mail: "mustermann.max2@fh-swf.de", comment: "Kommentar", role: "Betreuer", supervisor: "", concept: "Bewertung ausstehend", btnEdit: <Button onClick={()=>{setIsEditMode(true)}}>Edit</Button>},
    ];

    return (
        <div>
            <MainLayout>
                <div>
                    <p>Seminar Details: “Bachelor WS 2023/24”</p>
                    <p onClick={() => {
                        if (confirm('Möchten Sie von "Review-Phase" übergehen zu "Reviews lesen"?')) {
                            // In nächste Phase wechseln
                        }
                    }}>Review-Phase 🖊</p>
                    <Searchbar/>
                    {!isEditMode ?
                        <Table header={header} data={tableData}/> :
                        <Table header={headerEdit} data={tableDataEdit}/>
                    }
                    {isEditMode ?
                        <Button onClick={() => {setIsEditMode(false)}}>Speichern</Button> :
                        <Button onClick={() => {setShowAddUserModal(true);}}>Add User</Button>
                    }
                    <Modal isOpen={showAddUserModal} onClose={() => {
                        setShowAddUserModal(false)
                    }}>
                        <AddUserForm onSubmit={(event: FormEvent) => {}}/>
                    </Modal>
                    <Modal isOpen={showUserConcept} onClose={() => {
                        setShowUserConcept(false)
                    }}><ConceptAcceptReject/></Modal>
                </div>
            </MainLayout>
        </div>
    );
}

export default SeminarDetailsPage;