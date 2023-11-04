import {json} from "react-router-dom";

type SupervisorPerson = {
    firstname: string;
    lastname: string;
};

type Status = {
    statusOID: number;
    description: string;
};

class Concept {
    private _conceptOID: number;
    private _text: string;
    private _filename: string;
    private _personOIDSupervisorPerson: SupervisorPerson;
    private _statusO: Status;

    constructor(conceptOID: number, text: string, filename: string, personOIDSupervisorPerson: SupervisorPerson, statusO: Status) {
        this._conceptOID = conceptOID;
        this._text = text;
        this._filename = filename;
        this._personOIDSupervisorPerson = personOIDSupervisorPerson;
        this._statusO = statusO;
    }

    static fromJson(json: any): Concept {
        return new Concept(
            json.conceptOID,
            json.text,
            json.filename,
            {
                firstname: json.personOIDSupervisor_person.firstname,
                lastname: json.personOIDSupervisor_person.lastname,
            },
            {
                statusOID: json.statusO.statusOID,
                description: json.statusO.description,
            }
        );
    }

    get conceptOID(): number {
        return this._conceptOID;
    }

    get text(): string {
        return this._text;
    }

    get filename(): string {
        return this._filename;
    }

    get personOIDSupervisorPerson(): SupervisorPerson {
        return this._personOIDSupervisorPerson;
    }

    get statusO(): Status {
        return this._statusO;
    }
}

export default Concept;