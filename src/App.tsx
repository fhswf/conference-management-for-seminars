import './index.css'

import {PrimeReactProvider} from 'primereact/api';

import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import SeminarDetailsPage from "./pages/SeminarDetailsPage.tsx";
import SeminarPage from "./pages/SeminarPage.tsx";
import ConceptUploadPage from "./pages/ConceptUploadPage.tsx";
import PaperOverviewPage from "./pages/PaperOverviewPage.tsx";

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage/>,
    },
    {
        path: "/login",
        element: <LoginPage/>,
    },
    {
        path: "/seminar-details/:id",
        element: <SeminarDetailsPage/>,
    },
    {
        path: "/seminar/:id",
        element: <SeminarPage/>,
    },
    {
        path: "/concept-upload",
        element: <ConceptUploadPage/>,
    },
    {
        path: "/paper-upload",
        element: <PaperOverviewPage/>,
    },
], {basename: "/conference"}
    );

function App() {
    return (
        <>
            <PrimeReactProvider>
                <RouterProvider router={router}/>
            </PrimeReactProvider>
        </>
    )
}

export default App
