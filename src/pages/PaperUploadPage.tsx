import styles from "./PaperUploadPage.module.css"
import {FileUpload, FileUploadSelectEvent} from "primereact/fileupload";
import {Button} from "primereact/button";
import {useState} from "react";

interface Props {
    seminarOID: string;
    phase: number;
}

function PaperUploadPage({seminarOID, phase}: Props) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    async function onClick(event: any) {
        if (!selectedFile) {
            alert('Bitte PDF auswählen.');
            return;
        }

        const formData = new FormData();
        formData.append('seminarOID', seminarOID);
        formData.append('file', selectedFile);

        console.log(selectedFile);

        try {
            const res = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/paper`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            },);

            if (res.status === 200) {
                alert('Paper uploaded successfully.');
                setSelectedFile(null);
            } else {
                alert('Error uploading paper. Please try again.');
            }
        } catch (error) {
            console.error("Error uploading paper:", error);
            alert('Error uploading paper. Please check your internet connection and try again.');
        }
    }

    return (
        <div className={styles.page}>
            <p>Paper Upload</p>
            <div className={styles.upload}>
                <p>Paper (PDF)</p>
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
            </div>
            <div className={styles.buttonDiv}>
                {phase === 3 && <Button onClick={onClick}>Paper anonym einreichen!</Button>}
                {phase === 7 && <Button onClick={onClick}>Paper einreichen!</Button>}
            </div>
        </div>
    );
}

export default PaperUploadPage;
