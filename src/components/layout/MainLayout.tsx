import {Menubar} from "primereact/menubar";
import {useNavigate} from "react-router-dom";
import React, {ReactNode, useContext} from "react";
import {AuthContext} from "../../context/AuthContext.ts";
import {MenuItem} from "primereact/menuitem";
import {SplitButton} from "primereact/splitbutton";

interface Props {
    children: ReactNode;
}

function MainLayout({children}: Props) {
    const navigate = useNavigate();
    const {user, setUser} = useContext(AuthContext);

    const items = [
        {
            label: 'Startseite', icon: 'pi pi-fw pi-home', command: () => {
                navigate("/")
            }
        },
        user?.isAdmin && {
            label: 'Administration',
            icon: 'pi pi-fw pi-cog',
            command: () => {
                navigate("/administration")
            }
        }
    ].filter(Boolean) as MenuItem[];

    const start = <img
        alt="logo"
        src="https://www.fh-swf.de/media/_tech__fhswf/layout__fhswf/images__fhswf/Logo.png"
        height="40"
        className="mr-2"
        data-test="main-layout-logo"
    ></img>;

    const itemsSplit = [
        (user?.firstname || user?.lastname) && {label: `${user?.firstname || ""} ${user?.lastname || ""}`},
        {label: `${user?.mail}`},
        user?.isAdmin && {label: `System-Admin`},
    ].filter(Boolean) as MenuItem[];

    const logout = () => {
        const leave = window.confirm("Wollen Sie sich wirklich abmelden?");
        if (leave) {
            fetch(`${import.meta.env.VITE_BACKEND_URL}/logout`, {
                method: 'GET',
                credentials: 'include',
            }).then(response => response.json())
                .then((data) => {
                    if (data.url) {
                        setUser(null);
                        window.location.replace(data.url);
                    }
                })
                .catch((err) => {
                    console.error('Error: ', err);
                });
        }
    };

    const end = <SplitButton
        text
        onClick={logout}
        label="Logout"
        icon="pi pi-fw pi-sign-out"
        model={itemsSplit}
        className="p-button-secondary"
        data-test="main-layout-logout"
    ></SplitButton>;

    return (
        <div data-test="main-layout">
            <Menubar
                model={items}
                start={start}
                end={end}
                data-test="main-layout-menubar"
            />
            <div>{children}</div>
        </div>
    );
}

export default MainLayout;
