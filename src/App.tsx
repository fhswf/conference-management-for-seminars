import './index.css'

import {PrimeReactProvider} from 'primereact/api';

import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import LoginPage from "./pages/LoginPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import SeminarDetailsPage from "./pages/SeminarDetailsPage.tsx";
import SeminarPage from "./pages/SeminarPage.tsx";
import ConceptUploadPage from "./pages/ConceptUploadPage.tsx";

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import React, {useEffect, useState} from "react";
import {AuthContext} from "./context/AuthContext.ts";
import PaperOverviewPage from "./pages/PaperOverviewPage.tsx";
import StudentDetailPage from "./pages/StudentDetailPage.tsx";
import User from "./entities/database/User.ts";
import SeminarAdminPage from "./pages/SeminarAdminPage.tsx";


function App() {
    //const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState<User | null>(null);

    // TODO replace with useFetch
    useEffect(() => {
        const getUser = () => {
            console.log("fetching user");
            fetch(`https://${import.meta.env.VITE_BACKEND_URL}/authstatus`, {
                method: "GET",
                credentials: "include",
            })
                .then((response) => {
                    if (response.status === 200) return response.json();
                    throw new Error("authentication has been failed!");
                })
                .then((resObject) => {
                    console.log(resObject.user)
                    setUser(resObject.user);
                    setIsLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                    setIsLoading(false);
                });
        };
        getUser();
    }, []);

    if (isLoading) {
        return null;
    }

    return (
        <PrimeReactProvider>
            <AuthContext.Provider value={{ user, setUser }}>
                <BrowserRouter>
                    <div>
                        <Routes>
                            <Route path="/login" element={user ? <Navigate to="/"/> : <LoginPage/>}/>
                            <Route path="/" element={user ? <HomePage/> : <Navigate to="/login"/>}/>
                            <Route path="/seminar-details/:seminarOID"
                                   element={user ? <SeminarDetailsPage/> : <Navigate to="/login"/>}/>
                            <Route path="/student-details/:seminarOID/:studentOID" element={user ? <StudentDetailPage/> : <Navigate to="/login"/>}/>
                            <Route path="/seminar/:seminarOID" element={user ? <SeminarPage/> : <Navigate to="/login"/>}/>
                            <Route path="/concept-upload/:seminarOID"
                                   element={user ? <ConceptUploadPage/> : <Navigate to="/login"/>}/>
                            <Route path="/paper-overview/:seminarOID" element={user ? <PaperOverviewPage/> : <Navigate to="/login"/>}/>
                            <Route path="/seminar-administration" element={user?.isAdmin ? <SeminarAdminPage/> : <Navigate to="/"/>}/>
                        </Routes>
                    </div>
                </BrowserRouter>
            </AuthContext.Provider>
        </PrimeReactProvider>
    )
}

export default App
