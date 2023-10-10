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
        {label: 'Abmelden', icon: PrimeIcons.SIGN_OUT, command: () => {navigate("/login")}},
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