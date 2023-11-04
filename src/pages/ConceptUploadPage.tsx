import styles from "./ConceptUploadPage.module.css"
import MainLayout from "../components/layout/MainLayout.tsx";
import {FileUpload, FileUploadHandlerEvent, FileUploadSelectEvent} from "primereact/fileupload";
import {Dropdown} from "primereact/dropdown";
import {useEffect, useState} from "react";
import {InputTextarea} from "primereact/inputtextarea";
import {Button} from "primereact/button";
import axios from "axios";

function ConceptUploadPage() {
    const [text, setText] = useState<string>("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [availableSupervisor, setAvailableSupervisor] = useState([])
    const [selectedSupervisor, setSelectedSupervisor] = useState(undefined)

    const supervisor = [
        {name: "Betreuer A"},
        {name: "Betreuer B"},
        {name: "Betreuer C"},
    ];

    async function onSubmit(event: any) {
        event.preventDefault();

        if (!selectedFile && !text.trim()) {
            alert('Bitte PDF oder Text eingeben.');
            return;
        }

        const formData = new FormData();
        formData.append('text', text);
        formData.append('file', selectedFile);
        const oid = (selectedSupervisor === undefined) ? null : selectedSupervisor.personOID;
        formData.append('supervisorOID', oid);

        console.log(text);
        console.log(selectedFile);
        console.log(selectedSupervisor);
        console.log(formData);

        try {
            const res = await fetch('http://192.168.0.206:3000/api/concepts/upload-concept', {
                method: 'POST',
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                // TODO replace with LTI data
                const result = await axios.get("http://192.168.0.206:3000/api/person/get-supervisor-list/1");
                //console.log(result.data);
                const availableSupervisor:any = [];
                result.data.map((supervisor: any) => {
                    availableSupervisor.push({name: supervisor.lastname+", "+ supervisor.firstname, personOID: supervisor.personOID});
                } )
                setAvailableSupervisor(availableSupervisor);
                console.log(availableSupervisor);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    function handleUpload(event:  FileUploadHandlerEvent) {
        const formData = new FormData();
        formData.append('file', event.files[0]);
        console.log(formData);

        const res = fetch('http://192.168.0.206:3000/api/concepts/upload-concept', {
            method: 'POST',
            body: formData,
        },);
    }

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