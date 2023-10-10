import styles from "./ConceptUploadPage.module.css"
import MainLayout from "../components/layout/MainLayout.tsx";
import {FileUpload, FileUploadHandlerEvent, FileUploadSelectEvent} from "primereact/fileupload";
import {Dropdown} from "primereact/dropdown";
import {useState} from "react";
import {InputTextarea} from "primereact/inputtextarea";
import {Button} from "primereact/button";

function ConceptUploadPage() {
    const [selectedSupervisor, setSelectedSupervisor] = useState(null)
    const [text, setText] = useState<string>("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const supervisor = [
        {name: "Betreuer A"},
        {name: "Betreuer B"},
        {name: "Betreuer C"},
    ];

    async function onSubmit(event) {
        //event.preventDefault();
        console.log("Submit");

        const formData = new FormData();

        formData.append("file", event.files[0]);

        try {
            const result = await fetch("http://localhost:3000/api/uploadPDF", {
                method: "POST",
                body: formData,
            });

            if (!result.ok) {
                console.log("Upload Fehler");
            }else {
                console.log("Upload erfolgreich");
            }
        } catch (error) {
            console.error(error);
        }
    }

    function handleUpload(event:  FileUploadHandlerEvent) {

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
                                            uploadHandler={handleUpload}
                                            onSelect={(event: FileUploadSelectEvent)=>setSelectedFile(event.files[0])}
                                            onClear={()=>setSelectedFile(null)}
                                            onRemove={()=>setSelectedFile(null)}
                                            accept="application/pdf"
                                            maxFileSize={1000000}
                                            emptyTemplate={<p>Drag and drop files to here to upload.</p>} />
                            </div>
                            {/* <Button type="button" onClick={()=>console.log(selectedFile[0])} label="show" /> */}
                        </div>
                        <div className={styles.container}>
                            <p>Betreuer</p>
                            <Dropdown id="seminar" value={selectedSupervisor} onChange={(e) => setSelectedSupervisor(e.value)}
                                      showClear options={supervisor} placeholder="Betreuer wählen..." optionLabel="name"/><br/>

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