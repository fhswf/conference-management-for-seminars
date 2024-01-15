import {Navigate, useNavigate} from "react-router-dom";
import MainLayout from "../components/layout/MainLayout.tsx";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import {FormEvent, useContext, useRef} from "react";
import useFetch from "../hooks/useFetch.ts";
import Table from "../components/Table.tsx";
import {AuthContext} from "../context/AuthContext.ts";
import {mapPhaseToString, mapRoleToString} from "../utils/helpers.ts";
import RoleAssignment from "../entities/database/RoleAssignment.ts";
import Seminar from "../entities/database/Seminar.ts";

type AssignedSeminar = Seminar & {
    roleassignments: RoleAssignment[];
};


function HomePage() {
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);
    const {data: assignedSeminars} = useFetch<AssignedSeminar[]>(`${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_URL}/user/assigned-seminars`);
    const inputRef = useRef<HTMLInputElement>(null);

    const styles = {
        enterSeminar: {
            display: "flex",
            columnGap: "10px",
            margin: "10px"
        },
    };

    const header = [
        {field: "name", header: "Bezeichnung"},
        {field: "role", header: "Ihre Rolle"},
        {field: "phase", header: "Phase"},
        {field: "btnSeminar", header: ""},
        {field: "btnSeminarDetails", header: ""},
    ];

    const tableData = assignedSeminars?.map(seminar => ({
        seminarOID: seminar.seminarOID,
        name: seminar.description,
        phase: seminar.phase && mapPhaseToString(seminar.phase),
        role: seminar.roleassignments[0].roleOID && mapRoleToString(seminar.roleassignments[0].roleOID),
        btnSeminar: <Button onClick={() => {
            navigate(`/seminar/${seminar.seminarOID}`)
        }} disabled={seminar.roleassignments[0].roleOID === 1}
        >➡</Button>,
        btnSeminarDetails: //(seminar.roleassignments[0].roleOID === 1) ?
            <Button data-test="administrate-btn"
                onClick={() => {
            navigate(`/seminar-details/${seminar.seminarOID}`)
        }} disabled={seminar.roleassignments[0].roleOID === 3} tooltip="Nur für Kurs-Admins/Betreuer" tooltipOptions={{ showOnDisabled: true }}>Verwalten</Button>
            //: null
    }));
    /*const tableData = [
        {name: "Bachelor WS 2023/24", role: "Student", stage: "Konzept-Upload", btnSeminar: <Button onClick={()=>{navigate("/seminar/1"); console.log("123")}}>➡</Button>, btnSeminarDetails: <Button onClick={() => {navigate("/seminar-details/1")}}>Verwalten</Button>},
        {name: "Bachelor WS 2024/25", role: "Betreuer", stage: "Review-Phase", btnSeminar: <Button onClick={()=>{navigate("/seminar/1")}}>➡</Button>, btnSeminarDetails: <Button onClick={() => {navigate("/seminar-details/1")}}>Verwalten</Button>}
    ];*/

    async function onEnterSeminar() {
        const seminarKey = inputRef.current?.value;

        if(!seminarKey) {
            return;
        }

        const result = await fetch(`${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_URL}/seminar/enter-seminar/${seminarKey}`, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if(result.ok) {
            const data = await result.json();
            console.log(data.seminarOID);
            navigate(`/seminar/${data.seminarOID}`);
        } else if (result.status === 404){
            alert("Seminar nicht gefunden");
        } else if(result.status === 400) {
            alert("Sie sind bereits in diesem Seminar eingeschrieben");
        }
    }

    return (
        <>
            <MainLayout>
                {/*<pre>{JSON.stringify(assignedSeminars, null, 2)}</pre>*/}
                <div>
                    <h1 data-test="heading">Sie sind in folgenden Seminaren eingeschrieben:</h1>
                    <div style={styles.enterSeminar}>
                        <InputText data-test="key-input" id="seminarkey" name="seminarkey" placeholder="Einschreibeschlüssel" ref={inputRef}/>
                        <Button data-test="enter-seminar" label="Seminar beitreten" onClick={onEnterSeminar}/>
                    </div>
                    <div>
                        <Table header={header} data={tableData}/>
                    </div>
                </div>
            </MainLayout>
        </>
    );

}

export default HomePage;

/*
const {data, loading, error} = useFetch<AssignedSeminar[]>(`${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_URL}/authstatus`);

if(loading){ return <p>Is loading</p> }
if(error ){ return <p>Is error</p> }
return( <p>{data && data[0].description || "Keine Daten vorhanden"}</p> );}
*/
