type Concept = {
    conceptOID: number | null;
    text: string | null;
    userOIDSupervisor: number | null;
    userOIDStudent: number | null;
    feedback: string | null;
    seminarOID: number | null;
    accepted: boolean | null;
    attachmentOID: number | null;
    createdAt: Date | null;
};

export default Concept;
