import {useNavigate} from "react-router-dom";
import styles from './LoginPage.module.css';
import {Button} from "primereact/button";

function LoginPage() {
    return (
        <div className={styles.loginform}>
            <h1>Login</h1>
            <Button label="Einloggen mit Keycloak" onClick={() => {
                window.location.href = `${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_URL}/login`;
            }}/>
        </div>
    );
}

export default LoginPage;
