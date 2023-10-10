import {ChangeEvent, useState} from "react";
import styles from "./UploadComponent.module.css";

interface Props {
    onFileSelected?: (selectedFile: File | null) => void;
}

function UploadComponent({onFileSelected}: Props) {
    const [file, setFile] = useState<File | null>(null);


    return (
        <div className={styles.container}>
            <input id="file" type="file" onChange={
                (event: ChangeEvent<HTMLInputElement>) => {
                    setFile(event.target.files?.item(0) || null)
                    if (onFileSelected) {
                        onFileSelected(file);
                    }
                }
            }/>
            {file && (
                <div>
                    Details:
                    <ul>
                        <li>Name: <a href={URL.createObjectURL(file)} download={file.name}> {file.name}</a></li>
                        <li>Größe: {(file.size / (1024 * 1024)).toFixed(1)} MB</li>
                        <li>Bearbeitet: {new Date(file.lastModified).toLocaleString()}</li>
                    </ul>
                </div>
            )}
        </div>
    );
}

export default UploadComponent;