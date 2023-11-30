import {FormEvent, useEffect, useState} from "react";
import {Dropdown} from "primereact/dropdown";
import {InputText} from "primereact/inputtext";
import styles from "./AddUserForm.module.css";
import {Button} from "primereact/button";
import useFetch from "../hooks/useFetch.ts";

interface Props {
    seminarOID: number;
    seminarname: string;
    onClose?: () => void;
}

type User = {
    userOID: number;
    lastname: string;
    firstname: string;
    mail: string;
    comment: string;
}

function AssignUserPage({seminarOID, seminarname, onClose}: Props) {
    const [selectedRole, setSelectedRole] = useState<number>();
    const [selectedUser, setSelectedUser] = useState<any>();

    const userList = useFetch<User[]>(`http://${import.meta.env.VITE_BACKEND_URL}/api/user/get-addable-users/${seminarOID}`);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        if (selectedUser === null) {
            return;
        }

        const res = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api/user/assign-to-seminar`, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                seminarOID: seminarOID,
                userOID: selectedUser.userOID,
                //index
                roleOID: selectedRole,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (res.ok) {
            alert("User wurde eingetragen");
            onClose && onClose();
        } else {
            alert("User konnte nicht eingetragen werden");
        }
    }

    const rollen = [
        {name: "Kurs-Admin", value: 1},
        {name: "Betreuer", value: 2},
        {name: "Student", value: 3},
    ];

    useEffect(() => {
        setSelectedRole(rollen[2].value);
    }, [])

    let usersJson: { name: string, comment: string, userOID: string }[] = [];

    userList?.data?.map((user: any) => {
        usersJson.push({name: `${user.lastname}, ${user.firstname}`, comment: user.comment, userOID: user.userOID})
    });


    return (
        <div className={styles.container}>
            <h1>OIDC User Seminar zuordnen</h1>
            <form onSubmit={handleSubmit}>
                <Dropdown id="users" value={selectedUser} onChange={(e) => setSelectedUser(e.value)} options={usersJson}
                          optionLabel="name" placeholder="User wählen" filter/><br/>
                <Dropdown id="role" value={selectedRole} onChange={(e) => setSelectedRole(e.value)} options={rollen}
                          placeholder="Rolle wählen" optionLabel="name"/><br/>
                <p>Seminar: {seminarname}</p>
                <p>Kommentar: {selectedUser?.comment || "-"}</p>

                <Button type="submit" label="Nutzer eintragen"/>
                <p>{JSON.stringify(userList?.data)}</p>
            </form>
        </div>
    );
}

export default AssignUserPage;
