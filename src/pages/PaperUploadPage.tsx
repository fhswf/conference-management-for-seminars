
import styles from "./PaperUploadPage.module.css"
import {FileUpload} from "primereact/fileupload";
import {Button} from "primereact/button";

function PaperUploadPage() {
    return (
        <div className={styles.page}>
            <p>Paper Upload</p>
            <div className={styles.upload}>
                <p>Paper (PDF)</p>
                <div className="card">
                    <FileUpload name="demo[]" url={'/api/upload'} accept="application/pdf" maxFileSize={1000000} emptyTemplate={<p>Drag and drop files to here to upload.</p>} />
                </div>
            </div>
            <div className={styles.buttonDiv}>
                <Button>Paper anonym einreichen!</Button>
            </div>
        </div>
    );
}

export default PaperUploadPage;