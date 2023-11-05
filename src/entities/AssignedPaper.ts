class AssignedPaper {
    private _paperOid: number;
    private _filename: string;

    constructor(paperOid: number, filename: string) {
        this._paperOid = paperOid;
        this._filename = filename;
    }

    static fromJson(json: any): AssignedPaper {
        return new AssignedPaper(json.paperOid, json.filename);
    }

    get paperOid(): number {
        return this._paperOid;
    }

    get filename(): string {
        return this._filename;
    }
}

export default AssignedPaper;