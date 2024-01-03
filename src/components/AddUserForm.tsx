import {FormEvent, useEffect, useState} from "react";
import {Dropdown} from "primereact/dropdown";
import {InputText} from "primereact/inputtext";
import styles from "./AddUserForm.module.css";
import {Button} from "primereact/button";
import useFetch from "../hooks/useFetch.ts";
import User from "../entities/database/User.ts";
import Seminar from "../entities/database/Seminar.ts";

interface Props {
    seminar: Seminar;
    onClose?: () => void;
}

function AssignUserPage({seminar, onClose}: Props) {
    const [selectedRole, setSelectedRole] = useState<number>();
    const [selectedUser, setSelectedUser] = useState<any>();

    const userList = useFetch<User[]>(`${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_URL}/seminar/${seminar.seminarOID}/addable-users/`);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        if (selectedUser === null) {
            return;
        }

        const res = await fetch(`${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_URL}/user/assign-to-seminar`, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                seminarOID: seminar.seminarOID,
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

    // TODO anpassen
    let usersJson: { name: string, userOID: number }[] = [];

    userList?.data?.map((user: User) => {
        usersJson.push({name: `${user.lastName}, ${user.firstName}`, userOID: user.userOID!})
    });


    return (
        <div className={styles.container}>
            <h1>OIDC User Seminar zuordnen</h1>
            <form onSubmit={handleSubmit}>
                <Dropdown id="users" value={selectedUser} onChange={(e) => setSelectedUser(e.value)} options={usersJson}
                          optionLabel="name" placeholder="User wählen" filter/><br/>
                <Dropdown id="role" value={selectedRole} onChange={(e) => setSelectedRole(e.value)} options={rollen}
                          placeholder="Rolle wählen" optionLabel="name"/><br/>
                <p>Seminar: {seminar.description}</p>

                <Button type="submit" label="Nutzer eintragen"/>
                {/*<p>{JSON.stringify(userList?.data)}</p>*/}
            </form>
        </div>
    );
}

export default AssignUserPage;
