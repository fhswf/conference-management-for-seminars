import useFetch from "../hooks/useFetch.ts";
import Seminar from "../entities/database/Seminar.ts";
import Table from "../components/Table.tsx";
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import MainLayout from "../components/layout/MainLayout.tsx";
import {FormEvent, useRef, useState} from "react";
import Modal from "../components/Modal.tsx";
import AddUserForm from "../components/AddUserForm.tsx";

function SeminarAdminPage() {
    const [showAddUser, setShowAddUser] = useState<Seminar>()
    const {data} = useFetch<Seminar[]>(`http://${import.meta.env.VITE_BACKEND_URL}/api/seminar/get-seminars`);
    const inputRef = useRef<HTMLInputElement>(null);

    const styles = {
        createSeminar: {
            display: "flex",
            columnGap: "10px",
            margin: "10px"
        },
    };

    const header = [
        {field: 'seminarOID', header: 'ID'},
        {field: 'name', header: 'Bezeichnung'},
        {field: 'phase', header: 'Phase'},
        {field: 'createdAt', header: 'Erstellt am:'},
        {field: 'createdAt', header: 'Erstellt am:'},
        {field: "btnAdd", header: ""}
    ];

    const tableData = data?.map((seminar) => {
        return {
            seminarOID: seminar.seminarOID,
            name: seminar.description,
            phase: seminar.phase,
            createdAt: seminar.createdAt ? new Date(seminar.createdAt).toLocaleString() : '-',
            btnAdd: <Button label="OIDC Nutzer hinzufügen" icon="pi pi-plus" onClick={() => {
                setShowAddUser(seminar)
            }}/>
        };
    });

    async function onCreateSeminar() {
        //send data to backend
        const seminarName = inputRef.current?.value;

        if(!seminarName) {
            return
        }

        const result = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api/seminar/seminar`, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: seminarName})
        });
        const data = await result.json();
        console.log(data);

        if (result.ok) {
            //navigate to seminar page
            //navigate("/seminar/1");
            alert("Seminar erstellt")
        } else {
            alert("Seminar konnte nicht erstellt werden")
        }
    }

    return (
        <MainLayout>
            <div>
                <h1>SeminarAdminPage</h1>
                <div style={styles.createSeminar}>
                    <InputText id="seminarName" name="seminarName" placeholder="Seminarname" ref={inputRef}/>
                    <Button label="Seminar erstellen" onClick={onCreateSeminar}/>
                </div>
                <Table header={header} data={tableData}/>
            </div>
            <Modal isOpen={showAddUser} onClose={() => {
                setShowAddUser(undefined)
            }}>
                <AddUserForm seminarname={showAddUser?.description} seminarOID={showAddUser?.seminarOID}
                             onClose={() => setShowAddUser(undefined)}/></Modal>
        </MainLayout>
    )
}

export default SeminarAdminPage;
