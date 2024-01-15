import useFetch from "../hooks/useFetch.ts";
import Seminar from "../entities/database/Seminar.ts";
import Table from "../components/Table.tsx";
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import MainLayout from "../components/layout/MainLayout.tsx";
import {FormEvent, useRef, useState} from "react";
import Modal from "../components/Modal.tsx";
import AddUserForm from "../components/AddUserForm.tsx";
import HiddenLabel from "../components/ToggleLabel.tsx";

function AdminPage() {
    const [showAddUser, setShowAddUser] = useState<Seminar>()
    const {data: seminarData, setData: setSeminarData} = useFetch<Seminar[]>(`${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_URL}/seminar/all`);
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
        {field: 'createdAt', header: 'Erstellt am'},
        {field: 'assignmentkey', header: 'Einschreibeschlüssel'},
        {field: "btnAdd", header: ""}
    ];

    const tableData = Array.isArray(seminarData) && seminarData?.map((seminar) => {
        return {
            seminarOID: seminar.seminarOID,
            name: seminar.description,
            phase: seminar.phase,
            createdAt: seminar.createdAt ? new Date(seminar.createdAt).toLocaleString() : '-',
            assignmentkey: <HiddenLabel text={seminar.assignmentkey || ""}/>,
            btnAdd: <Button label="OIDC Nutzer hinzufügen" icon="pi pi-plus" onClick={() => {
                setShowAddUser(seminar)
            }}/>
        };
    }) || [];

    async function onCreateSeminar() {
        //send data to backend
        const seminarName = inputRef.current?.value;

        if (!seminarName) {
            return
        }

        const result = await fetch(`${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_URL}/seminar`, {
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
            alert("Seminar erstellt");
            seminarData && setSeminarData([...seminarData, data]);
            console.log(data);
        } else {
            alert("Seminar konnte nicht erstellt werden")
        }
    }

    return (
        <MainLayout>
            <div>
                <h1 data-test="heading-admin">Administration</h1>
                <div style={styles.createSeminar}>
                    <InputText data-test="textfield-admin" id="seminarName" name="seminarName" placeholder="Seminarname" ref={inputRef} maxLength={32}/>
                    <Button data-test="button-admin" label="Seminar erstellen" onClick={onCreateSeminar}/>
                </div>
                <Table header={header} data={tableData}/>
            </div>
            {showAddUser?.seminarOID && showAddUser?.description && <Modal isOpen={!!showAddUser} onClose={() => {
                setShowAddUser(undefined)
            }}> <AddUserForm seminar={showAddUser}
                             onClose={() => setShowAddUser(undefined)}/></Modal>}
        </MainLayout>
    )
}

export default AdminPage;
