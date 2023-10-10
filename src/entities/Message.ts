class Message{
    private _text: string;
    private _date: Date;
    private _time: string;
    private _sender: string;

    constructor(text: string, date: Date, time: string, sender: string){
        this._text = text;
        this._date = date;
        this._time = time;
        this._sender = sender;
    }


    get text(): string {
        return this._text;
    }

    get date(): Date {
        return this._date;
    }

    get time(): string {
        return this._time;
    }

    get sender(): string {
        return this._sender;
    }
}

export default Message;