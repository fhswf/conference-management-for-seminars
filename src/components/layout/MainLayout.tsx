import {Menubar} from "primereact/menubar";
import {useNavigate} from "react-router-dom";
import React, {ReactNode, useContext} from "react";
import {AuthContext} from "../../context/AuthContext.ts";
import {MenuItem} from "primereact/menuitem";

interface Props {
    children: ReactNode;
}

function MainLayout({children}: Props) {
    const navigate = useNavigate();
    const {user, setUser} = useContext(AuthContext);

    console.log(user)

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
        },
        {
            label: `${user?.firstName} ${user?.lastName}`,
            icon: 'pi pi-fw pi-user',
            items: [
                {label: `${user?.mail}`},
                user?.isAdmin && {label: `System-Admin`},
                {
                    label: 'Logout',
                    icon: 'pi pi-fw pi-sign-out',
                    command: () => {
                        const leave = window.confirm("Wollen Sie sich wirklich abmelden?");
                        if (leave) {
                            fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api/logout`, {
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
                    }
                }
            ].filter(Boolean) as MenuItem[]
        },
    ].filter(Boolean) as MenuItem[]

    const start = <img alt="logo" src="https://www.fh-swf.de/media/_tech__fhswf/layout__fhswf/images__fhswf/Logo.png"
                       height="40" className="mr-2"></img>;

    return (
        <div>
            <Menubar model={items} start={start}/>
            <div>{children}</div>
        </div>
    );
}

export default MainLayout;
