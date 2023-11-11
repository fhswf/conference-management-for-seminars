import {FormEvent, useState} from "react";
import {useNavigate} from "react-router-dom";
import styles from './LoginPage.module.css';

//import 'bootstrap/dist/css/bootstrap.css'

function LoginPage() {
    const [username, setUsername] = useState<string>("max@example.com");
    const [password, setPassword] = useState<string>("password");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const response = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/login`, {
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
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Benutzername:</label>
                    <input disabled={isSubmitting} type="text" value={username}
                           onChange={(event) => setUsername(event.target.value)}/>
                </div>
                <div>
                    <label>Passwort:</label>
                    <input disabled={isSubmitting} type="password" value={password}
                           onChange={(event) => setPassword(event.target.value)}/>
                </div>
                <button type="submit">Einloggen</button>
            </form>
            {isSubmitting &&
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            }
        </div>
    );
}

export default LoginPage;