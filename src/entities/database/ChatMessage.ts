type ChatMessage = {
    chatmessageOID: number | null;
    message: string | null;
    attachmentOID: number | null;
    reviewOID: number | null;
    sender: number | null;
    receiver: number | null;
    createdAt: Date | null;
};

export default ChatMessage;
