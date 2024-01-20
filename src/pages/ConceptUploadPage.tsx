import styles from "./ConceptUploadPage.module.css"
import MainLayout from "../components/layout/MainLayout.tsx";
import {FileUpload, FileUploadSelectEvent} from "primereact/fileupload";
import {Dropdown} from "primereact/dropdown";
import {useEffect, useState} from "react";
import {InputTextarea} from "primereact/inputtextarea";
import {Button} from "primereact/button";
import {useNavigate, useParams} from "react-router-dom";
import User from "../entities/database/User.ts";

interface Props {
    seminarOID: string;
    onClose?: () => void;
    onConceptUpload: (concept: any) => void;
}

function ConceptUploadPage({seminarOID, onClose, onConceptUpload}: Props) {
    const navigate = useNavigate();
    //const { seminarOID } = useParams();
    const [text, setText] = useState<string>("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [availableSupervisor, setAvailableSupervisor] = useState<User[]>([])
    const [selectedSupervisor, setSelectedSupervisor] = useState<User>()

    //const supervisor = [
    //    {name: "Betreuer A"},
    //    {name: "Betreuer B"},
    //    {name: "Betreuer C"},
    //];

    async function onSubmit(event: any) {
        event.preventDefault();

        if(!confirm("Sind Sie sicher, dass Sie das Konzept einreichen möchten?")) {
            return;
        }

        if (!selectedFile && !text.trim()) {
            alert('Bitte PDF oder Text eingeben.');
            return;
        }

        const formData = new FormData();
        formData.append('text', text);
        selectedFile && formData.append('file', selectedFile);
        const oid = selectedSupervisor?.userOID;

        oid && formData.append('supervisorOID', oid.toString());
        seminarOID && formData.append('seminarOID', seminarOID.toString());

        //console.log(text);
        //console.log(selectedFile);
        //console.log(selectedSupervisor);
        //console.log(formData);

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/concepts`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            },);

            if (res.ok) {
                alert('Concept uploaded successfully.');

                //setText("");
                //navigate(`/seminar/${seminarOID}`);
                //setSelectedFile(null);
                //setSelectedSupervisor(undefined);

                const concept = await res.json();
                onConceptUpload(concept);
                //onClose && onClose();
            } else if(res.status === 415) {
                alert("Bitte nur PDF-Dateien hochladen.")
            }else{
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
                const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/seminar/${seminarOID}/supervisor-list/`,{
                    method: 'GET',
                    credentials: 'include'
                });
                //console.log(result.data);
                const availableSupervisor: any = [];
                const data = await result.json();
                data.map((supervisor: any) => {
                    if (supervisor.lastname && supervisor.firstname){
                        availableSupervisor.push({name: supervisor.lastname+", "+ supervisor.firstname, userOID: supervisor.userOID});
                    }else{
                        availableSupervisor.push({name: supervisor.mail, userOID: supervisor.userOID});
                    }
                } )
                setAvailableSupervisor(availableSupervisor);
                //console.log(availableSupervisor);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            <h1>Konzept Upload</h1>

            <form onSubmit={onSubmit}>
                <div>
                    <div className={styles.container}>
                        <p>Text</p>
                        <InputTextarea data-test="concept-upload-text" value={text} onChange={(e) => setText(e.target.value)}/>
                    </div>
                    <div className={styles.container}>
                        <p>Anhang (PDF)</p>
                        <div className="card">
                            <FileUpload data-test="concept-upload-fileupload"
                                        customUpload
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
                        <Dropdown data-test="concept-upload-supervisor" id="seminar" value={selectedSupervisor} onChange={(e) => setSelectedSupervisor(e.value)}
                                  showClear options={availableSupervisor} placeholder="Betreuer wählen..." optionLabel="name"/><br/>

                    </div>
                </div>
                <div className={styles.buttonContainer}>
                    <Button data-test="concept-upload-submit" type="submit" label="Konzept einreichen" />
                </div>
            </form>
        </div>
    );
}

export default ConceptUploadPage;
