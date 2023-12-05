type Attachment = {
    attachmentOID: number | null;
    file: Buffer | null;
    mimetype: string | null;
    filename: string | null;
};

export default Attachment;
