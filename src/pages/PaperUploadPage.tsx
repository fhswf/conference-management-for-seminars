import styles from "./PaperUploadPage.module.css"
import {FileUpload, FileUploadSelectEvent} from "primereact/fileupload";
import {Button} from "primereact/button";
import {useState} from "react";

interface Props {
    seminarOID: string;
    phase: number;
    onUpload: (selectedFile: File) => void;
}

function PaperUploadPage({seminarOID, phase, onUpload}: Props) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    async function onClick(event: any) {
        if(confirm("Sind Sie sicher, dass Sie das Paper hochladen möchten?")) {
            selectedFile && onUpload(selectedFile);
        }
    }

    return (
        <div className={styles.page}>
            <p>Paper Upload</p>
            <div className={styles.upload}>
                <p>Paper (PDF)</p>
                <div className="card">
                    <FileUpload data-test="fileupload-component"
                                customUpload
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
                {phase === 3 && <Button data-test="upload-paper-submit" onClick={onClick}>Paper anonym einreichen</Button>}
                {phase === 7 && <Button data-test="upload-paper-submit" onClick={onClick}>Finales Paper zur Bewertung einreichen</Button>}
            </div>
        </div>
    );
}

export default PaperUploadPage;
