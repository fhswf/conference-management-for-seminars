import {FormEvent, useState} from "react";
import {Dropdown} from "primereact/dropdown";
import {InputText} from "primereact/inputtext";
import styles from "./AddUserForm.module.css";
import {Button} from "primereact/button";

interface Props {
    onSubmit: (event: FormEvent) => void;
}

function AddUserForm({onSubmit}: Props) {
    const [selectedSupervisor, setSelectedSupervisor] = useState(null);
    const [selectedMail, setSelectedMail] = useState(null);
    const [selectedSeminar, setSelectedSeminar] = useState(null);

    const [firstname, setFirstname] = useState<string>("");
    const [lastname, setLastname] = useState<string>("");
    const [comment, setComment] = useState<string>("")

    const [roleIsSupervisor, setRoleIsSupervisor] = useState(false);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        onSubmit(event);
    }

    const seminare = [
        {name: "Bachelor WS 2023/24"},
        {name: "Bachelor WS 2024/25"},
    ];
    const rollen = [
        {name: "Student"},
        {name: "Betreuer"},
    ];
    const mails = [
        {name: "1@1.de"},
        {name: "2@1.de"},
    ];


    return (
        <div className={styles.container}>
            <h1>Neuen User erstellen</h1>
            <form onSubmit={handleSubmit}>
                <Dropdown id="email" value={selectedMail} onChange={(e) => setSelectedMail(e.value)} options={mails}
                          placeholder="Mail wählen" optionLabel="name"/><br/>
                <Dropdown id="seminar" value={selectedSeminar} onChange={(e) => setSelectedSeminar(e.value)}
                          options={seminare} placeholder="Seminar wählen" optionLabel="name"/><br/>
                <Dropdown id="role" value={selectedSupervisor} onChange={(e) => {
                    setSelectedSupervisor(e.value);
                    if (e.value.name === "Betreuer") {
                        setRoleIsSupervisor(true)
                    } else {
                        setRoleIsSupervisor(false)
                    }
                }} options={rollen} placeholder="Rolle wählen" optionLabel="name"/><br/>
                <span className="p-float-label">
                    <InputText id="fname" value={firstname} onChange={(e) => setFirstname(e.target.value)}
                               disabled={!roleIsSupervisor}/>
                    <label htmlFor="fname">Vorname</label>
                </span>
                <span className="p-float-label">
                    <InputText id="lname" value={lastname} onChange={(e) => setLastname(e.target.value)}
                               disabled={!roleIsSupervisor}/>
                    <label htmlFor="username">Nachname</label>
                </span>
                <span className="p-float-label">
                    <InputText id="comment" value={comment} onChange={(e) => setComment(e.target.value)}
                               disabled={!roleIsSupervisor}/>
                    <label htmlFor="comment">Kommentar</label>
                </span>
                <Button type="submit" label="Einladung senden"/>
            </form>
        </div>
    );
}

export default AddUserForm;