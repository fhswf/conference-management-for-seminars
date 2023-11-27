import {Navigate, useNavigate} from "react-router-dom";
import MainLayout from "../components/layout/MainLayout.tsx";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import {FormEvent} from "react";
import useFetch from "../hooks/useFetch.ts";
import Table from "../components/Table.tsx";

type AssignedSeminar = {
    seminarOID: number,
    description: string,
    phase: number,
    roleassignments: [{
        roleOID: number,
    }]
}

function HomePage() {
    const navigate = useNavigate();
    const {data: assignedSeminars} = useFetch<AssignedSeminar[]>(`http://${import.meta.env.VITE_BACKEND_URL}/api/seminar/get-assigned-seminars`);
    const header = [
        {field: "name", header: "Bezeichnung"},
        {field: "role", header: "Ihre Rolle"},
        {field: "phase", header: "Phase"},
        {field: "btnSeminar", header: ""},
        {field: "btnSeminarDetails", header: ""},
    ];
    //let userLoggedIn = localStorage.getItem("accessToken") !== null;
    let userLoggedIn = true

    async function onCreateSeminar(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        //send data to backend
        const seminarName = e.currentTarget.seminarName.value;

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


    const tableData = assignedSeminars?.map(seminar => ({
        seminarOID: seminar.seminarOID,
        name: seminar.description,
        phase: seminar.phase,
        role: seminar.roleassignments[0].roleOID,
        btnSeminar: <Button onClick={() => {
            navigate(`/seminar/${seminar.seminarOID}`)
        }}>➡</Button>,
        btnSeminarDetails: //(seminar.roleassignments[0].roleOID === 1) ?
            <Button onClick={() => {
            navigate(`/seminar-details/${seminar.seminarOID}`)
        }}>Verwalten</Button> /* TODO check if user is Admin */
            //: null
    }));
    /*const tableData = [
        {name: "Bachelor WS 2023/24", role: "Student", stage: "Konzept-Upload", btnSeminar: <Button onClick={()=>{navigate("/seminar/1"); console.log("123")}}>➡</Button>, btnSeminarDetails: <Button onClick={() => {navigate("/seminar-details/1")}}>Verwalten</Button>},
        {name: "Bachelor WS 2024/25", role: "Betreuer", stage: "Review-Phase", btnSeminar: <Button onClick={()=>{navigate("/seminar/1")}}>➡</Button>, btnSeminarDetails: <Button onClick={() => {navigate("/seminar-details/1")}}>Verwalten</Button>}
    ];*/

    return (
        <>
            <MainLayout>
                <p>{JSON.stringify(assignedSeminars)}</p>
                <div>
                    <h1>Sie sind in folgenden Seminaren eingeschrieben:</h1>
                    <div>
                        <Table header={header} data={tableData}/>
                    </div>
                    <br/>
                    <form onSubmit={(e: FormEvent<HTMLFormElement>) => onCreateSeminar(e)}>
                        <label htmlFor="seminarName">Seminarname:</label>
                        <InputText id="seminarName" name="seminarName" placeholder="name"/>
                        <Button label="Seminar erstellen" type="submit"/> {/* TODO check if user is Admin */}
                    </form>
                </div>
                <Button onClick={async () => {
                    const result = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api/authstatus`, {
                        method: "GET",
                        credentials: 'include',
                    });
                    const data = await result.json();
                    console.log(data);
                }}>Check Auth</Button>
                {/* <ChatWindowPage/> */}
            </MainLayout>
        </>
    );

}

export default HomePage;
