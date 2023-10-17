class Concept {
    conceptOID: number;
    text: string;
    filename: string;
    personOIDSupervisor: number;
    personOIDStudent: number;
    seminarOID: number;
    statusOID: number;
    submitted: string;
    file: File;

    constructor(conceptOID: number, text: string, filename: string, personOIDSupervisor: number, personOIDStudent: number, seminarOID: number, statusOID: number, submitted: string, file: File) {
        this.conceptOID = conceptOID;
        this.text = text;
        this.filename = filename;
        this.personOIDSupervisor = personOIDSupervisor;
        this.personOIDStudent = personOIDStudent;
        this.seminarOID = seminarOID;
        this.statusOID = statusOID;
        this.submitted = submitted;
        this.file = file;
    }

    static fromJSON(json: any): Concept {
        return new Concept(json.conceptOID, json.text, json.filename, json.personOIDSupervisor, json.personOIDStudent, json.seminarOID, json.statusOID, json.submitted, json.file);
    }

    toJSON() {
        return {
            conceptOID: this.conceptOID,
            text: this.text,
            filename: this.filename,
            personOIDSupervisor: this.personOIDSupervisor,
            personOIDStudent: this.personOIDStudent,
            seminarOID: this.seminarOID,
            statusOID: this.statusOID,
            submitted: this.submitted,
            file: this.file
        }
    }
}

export default Concept;