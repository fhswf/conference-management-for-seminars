import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { FileUpload } from 'primereact/fileupload';

interface CustomFileUploadRef {
    onClear: () => void;
}

interface Props {
    onSelectionChanged: (file: File | null) => void;
    accept?: string;
}

const CustomFileUpload = forwardRef<CustomFileUploadRef, Props>((props, ref) => {
    const fileUploadRef = useRef<FileUpload | null>(null);

    function onClear() {
        fileUploadRef.current && fileUploadRef.current.clear();
        //setSelectedFile(null);
        props.onSelectionChanged(null);
    }

    useImperativeHandle(ref, () => ({
        onClear
    }));

    return (
        <>
            <FileUpload
                data-test="fileupload-component"
                accept={props.accept}
                ref={fileUploadRef}
                mode="basic"
                customUpload
                uploadHandler={onClear}
                maxFileSize={16000000}
                chooseLabel="Datei auswählen"
                onSelect={(e) => {
                    //setSelectedFile(e.files[0]);
                    props.onSelectionChanged(e.files[0]);
                }}
            />
        </>
    );
});

export default CustomFileUpload;
