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

    //console.log(user)

    const items = [
        {
            label: 'Startseite', icon: 'pi pi-fw pi-home', command: () => {
                navigate("/")
            }
        },
        user?.isAdmin && {
            label: 'Seminarverwaltung',
            icon: 'pi pi-fw pi-cog',
            command: () => {
                navigate("/seminar-administration")
            }
        }
    ].filter(Boolean) as MenuItem[]

    const start = <img alt="logo" src="https://www.fh-swf.de/media/_tech__fhswf/layout__fhswf/images__fhswf/Logo.png"
                       height="40" className="mr-2"></img>;

    const itemsSplit = [
        {label: `${user?.firstName} ${user?.lastName}`},
        {label: `${user?.mail}`},
        user?.isAdmin && {label: `System-Admin`},
    ].filter(Boolean) as MenuItem[];

    // TODO move to service class
    const logout = () => {
        const leave = window.confirm("Wollen Sie sich wirklich abmelden?");
        if (leave) {
            fetch(`https://${import.meta.env.VITE_BACKEND_URL}/logout`, {
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

    const end = <SplitButton text onClick={logout} label="Logout" icon="pi pi-fw pi-sign-out" model={itemsSplit}
                             className="p-button-secondary"></SplitButton>;

    return (
        <div>
            <Menubar model={items} start={start} end={end}/>
            <div>{children}</div>
        </div>
    );
}

export default MainLayout;
