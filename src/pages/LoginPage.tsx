import {FormEvent, useState} from "react";
import {useNavigate} from "react-router-dom";
import styles from './LoginPage.module.css';
import {Button} from "primereact/button";

//import 'bootstrap/dist/css/bootstrap.css'

function LoginPage() {
    const [username, setUsername] = useState<string>("max@example.com");
    const [password, setPassword] = useState<string>("password");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const response = await fetch(`https://${import.meta.env.VITE_BACKEND_URL}/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username, password}),
        });

        console.log(response);
        if (!response.ok) {
            alert("Login fehlgeschlagen");
            return;
        }

        alert("Login erfolgreich");
        navigate('/');

        return;
    }

    return (
        <div className={styles.loginform}>
            <h1>Login</h1>
            <Button label="Einloggen mit Keycloak" onClick={() => {
                window.location.href = `https://${import.meta.env.VITE_BACKEND_URL}/login`;
            }}/>
        </div>
    );
}

export default LoginPage;
