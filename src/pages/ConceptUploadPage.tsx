import styles from "./ConceptUploadPage.module.css"
import MainLayout from "../components/layout/MainLayout.tsx";
import {FileUpload, FileUploadSelectEvent} from "primereact/fileupload";
import {Dropdown} from "primereact/dropdown";
import {useEffect, useState} from "react";
import {InputTextarea} from "primereact/inputtextarea";
import {Button} from "primereact/button";
import {useParams} from "react-router-dom";

type Supervisor = {
    userOID: number;
    firstName: string;
    lastName: string;
}

function ConceptUploadPage() {
    const { seminarOID } = useParams();
    const [text, setText] = useState<string>("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [availableSupervisor, setAvailableSupervisor] = useState<Supervisor[]>([])
    const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor>()

    const supervisor = [
        {name: "Betreuer A"},
        {name: "Betreuer B"},
        {name: "Betreuer C"},
    ];

    // TODO check if user is allowed to upload concept: if last one was rejected or if no concept was uploaded yet

    async function onSubmit(event: any) {
        event.preventDefault();

        if (!selectedFile && !text.trim()) {
            alert('Bitte PDF oder Text eingeben.');
            return;
        }

        const formData = new FormData();
        formData.append('text', text);
        selectedFile && formData.append('file', selectedFile);
        const oid = selectedSupervisor?.userOID;

        oid && formData.append('supervisorOID', oid.toString());
        seminarOID && formData.append('seminarOID', seminarOID.toString()); //TODO change

        console.log(text);
        console.log(selectedFile);
        console.log(selectedSupervisor);
        console.log(formData);

        try {
            const res = await fetch(`https://${import.meta.env.VITE_BACKEND_URL}/concepts`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            },);

            //TODO res not working
            console.log("=>" + res.status);

            if (res.status === 200) {
                alert('Concept uploaded successfully.');
                setText("");
                setSelectedFile(null);
                setSelectedSupervisor(undefined);
            } else {
                alert('Error uploading concept. Please try again.');
            }
        } catch (error) {
            console.error("Error uploading concept:", error);
            alert('Error uploading concept. Please check your internet connection and try again.');
        }
    }

    //TODO replace with useFetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await fetch(`https://${import.meta.env.VITE_BACKEND_URL}/user/get-supervisor-list/${seminarOID}`,{
                    method: 'GET',
                    credentials: 'include'
                });
                //console.log(result.data);
                const availableSupervisor: any = [];
                const data = await result.json();
                data.map((supervisor: any) => {
                    availableSupervisor.push({name: supervisor.lastName+", "+ supervisor.firstName, userOID: supervisor.userOID});
                } )
                setAvailableSupervisor(availableSupervisor);
                console.log(availableSupervisor);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            <MainLayout>
                <p>ConceptUploadPage</p>

                <form onSubmit={onSubmit}>
                    <div>
                        <div className={styles.container}>
                            <p>Text</p>
                            <InputTextarea value={text} onChange={(e) => setText(e.target.value)}/>
                        </div>
                        <div className={styles.container}>
                            <p>Anhang (PDF)</p>
                            <div className="card">
                                <FileUpload customUpload
                                            uploadHandler={() => {}}
                                            onSelect={(event: FileUploadSelectEvent)=>setSelectedFile(event.files[0])}
                                            onClear={()=>setSelectedFile(null)}
                                            onRemove={()=>setSelectedFile(null)}
                                            accept="application/pdf"
                                            maxFileSize={16000000}
                                            emptyTemplate={<p>Drag and drop files to here to upload.</p>} />
                            </div>
                            {/* <Button type="button" onClick={()=>console.log(selectedFile[0])} label="show" /> */}
                        </div>
                        <div className={styles.container}>
                            <p>Betreuer</p>
                            <Dropdown id="seminar" value={selectedSupervisor} onChange={(e) => setSelectedSupervisor(e.value)}
                                      showClear options={availableSupervisor} placeholder="Betreuer wählen..." optionLabel="name"/><br/>

                        </div>
                    </div>
                    <div className={styles.buttonContainer}>
                        <Button type="submit" label="Speichern" />
                    </div>
                </form>
            </MainLayout>
        </div>
    );
}

export default ConceptUploadPage;
