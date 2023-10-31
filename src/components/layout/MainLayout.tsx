import {Menubar} from "primereact/menubar";
import {useNavigate} from "react-router-dom";
import {PrimeIcons} from "primereact/api";

interface Props {
    children: React.ReactNode;
}

function MainLayout({children}: Props) {
    const navigate = useNavigate();

    const items = [
        {label: 'Startseite', icon: PrimeIcons.HOME, command: () => {navigate("/")}},
        {label: 'Abmelden', icon: PrimeIcons.SIGN_OUT, command: () => {
                const leave = window.confirm("Wollen Sie sich wirklich abmelden?");
                if (leave) {
                    fetch('http://192.168.0.206:3000/api/logout', {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).then(response => response.json())
                        .then((data) => {
                            if (data.url) {
                                window.location.replace(data.url);
                            }
                        })
                        .catch((err) => {
                            console.error('Error: ', err);
                        });
                }
            }},
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