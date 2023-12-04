import {FormEvent, useState} from "react";
import {useNavigate} from "react-router-dom";
import styles from './LoginPage.module.css';
import {Button} from "primereact/button";

//import 'bootstrap/dist/css/bootstrap.css'

function LoginPage() {
    const navigate = useNavigate();

    return (
        <div className={styles.loginform}>
            <h1>Login</h1>
            <Button label="Einloggen mit Keycloak" onClick={() => {
                window.location.href = `http://${import.meta.env.VITE_BACKEND_URL}/login`;
            }}/>
        </div>
    );
}

export default LoginPage;
