type Message = {
    clientUserID: number;
    message: string;
    createdAt: string;
    sender: number;
    receiver: number;
    attachmentO: {
        attachmentOID: number;
        filename: string;
    };
    clientUserId: number;
};
