import {Menubar} from "primereact/menubar";
import {useNavigate} from "react-router-dom";
import React, {ReactNode, useContext} from "react";
import {AuthContext} from "../../context/AuthContext.ts";

interface Props {
    children: ReactNode;
}

function MainLayout({children}: Props) {
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);

    const items = [
        {label: 'Startseite',command: () => {navigate("/")}},
        {label: 'Abmelden', command: () => {
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
            }},
        {label: `${user?.firstName} ${user?.lastName}` },
        {label: `isAdmin: ${user?.isAdmin}` },
        {label: `delete`, command: () => {setUser(null)}},
    ];

    const start = <img alt="logo" src="https://www.fh-swf.de/media/_tech__fhswf/layout__fhswf/images__fhswf/Logo.png" height="40" className="mr-2"></img>;

    return (
        <div>
            <Menubar model={items} start={start}/>
            <div>{children}</div>
        </div>
    );
}

export default MainLayout;
