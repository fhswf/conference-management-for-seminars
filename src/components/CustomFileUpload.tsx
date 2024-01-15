import {FileUpload} from "primereact/fileupload";
import {useRef, useState} from "react";
import {Button} from "primereact/button";

interface Props {
    onSelectionChanged: (file: File | null) => void;
    accept?: string;
}

function CustomFileUpload({onSelectionChanged, accept}: Props) {
    const fileUploadRef = useRef<FileUpload | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    function onClear() {
        fileUploadRef.current && fileUploadRef.current.clear();
        setSelectedFile(null);
        onSelectionChanged(null);
    }

    return (
        <>
            <FileUpload
                accept={accept}
                ref={fileUploadRef}
                mode="basic"
                customUpload
                uploadHandler={onClear}
                maxFileSize={16000000}
                chooseLabel="Datei auswählen"
                onSelect={(e) => {
                    setSelectedFile(e.files[0]);
                    onSelectionChanged(e.files[0]);
                }}
            />
            {/*selectedFile && (<Button label="X" onClick={onClear}/>)*/}
        </>
    );
}

export default CustomFileUpload;
