type Message = {
    message: string;
    createdAt: string;
    sender: number;
    receiver: number;
    attachmentO: {
        attachmentOID: number | null;
        filename: string | null;
    } | null;
};
