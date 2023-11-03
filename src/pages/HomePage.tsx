import {Navigate, useNavigate} from "react-router-dom";
import MainLayout from "../components/layout/MainLayout.tsx";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";

function HomePage() {
    const navigate = useNavigate();

    //let userLoggedIn = localStorage.getItem("accessToken") !== null;
    let userLoggedIn = true


    if (!userLoggedIn) {
        return <Navigate to="/login" replace={true}/>
    } else {
        const tableData = [
            {name: "Bachelor WS 2023/24", role: "Student", stage: "Konzept-Upload", btnSeminar: <Button onClick={()=>{navigate("/seminar/1"); console.log("123")}}>➡</Button>, btnSeminarDetails: <Button onClick={() => {navigate("/seminar-details/1")}}>Verwalten</Button>},
            {name: "Bachelor WS 2024/25", role: "Betreuer", stage: "Review-Phase", btnSeminar: <Button onClick={()=>{navigate("/seminar/1")}}>➡</Button>, btnSeminarDetails: <Button onClick={() => {navigate("/seminar-details/1")}}>Verwalten</Button>}
        ];

        return (
            <>
                <MainLayout>
                <div>
                    <h1>Sie sind in folgenden Seminaren eingeschrieben:</h1>
                    <div className="card">
                        <DataTable value={tableData} showGridlines tableStyle={{ minWidth: '50rem' }}>
                            <Column field="name" header="Bezeichnung"></Column>
                            <Column field="role" header="Ihre Rolle"></Column>
                            <Column field="stage" header="Phase"></Column>
                            <Column field="btnSeminar" header=""></Column>
                            <Column field="btnSeminarDetails" header=""></Column>
                        </DataTable>
                    </div>
                    <br/>
                    <form onSubmit={(event)=>{event.preventDefault()}}>
                        <label htmlFor="seminarName">Seminarname:</label>
                        <InputText id="seminarName" name="seminarName" placeholder="Search" />
                        <Button label="Seminar erstellen" type="submit"/>
                    </form>
                </div>
                    <Button onClick={async ()=>{
                        const result = await fetch("https://" + import.meta.env.VITE_BACKEND_URL + "/authstatus", {
                            method: "GET",
                            credentials: 'include',
                            headers: {
                                "Content-Type": "text/plain"
                            }
                        });
                        const data = await result.json();
                        console.log(data);
                    }}>Check Auth</Button>
                {/* <ChatWindowPage/> */}
                </MainLayout>
            </>
        );
    }
}

export default HomePage;