type RolleAssignment = {
    personOID: number;
    seminarOID: number;
    roleOID: number;
};

class SeminarDetails {
    private _description: string;
    private _phase: number;
    private _roleAssignments: RolleAssignment;

    constructor(description: string, phase: number, roleAssignments: RolleAssignment[]) {
        this._description = description;
        this._phase = phase;
        this._roleAssignments = roleAssignments[0];
    }

    static fromJson(json: any): SeminarDetails {
        return new SeminarDetails(
            json.description,
            json.phase,
            json.rolleassignments
        );
    }

    get description(): string {
        return this._description;
    }

    get phase(): number {
        return this._phase;
    }

    get roleAssignments(): RolleAssignment {
        return this._roleAssignments;
    }
}

export default SeminarDetails;