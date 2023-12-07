import Table from "../components/Table.tsx";
import useFetch from "../hooks/useFetch.ts";
import {useParams} from "react-router-dom";
import React, {Fragment} from "react";
import {mapConceptStatusToString} from "../utils/helpers.ts";
import User from "../entities/database/User.ts";
import Concept from "../entities/database/Concept.ts";
import Attachment from "../entities/database/Attachment.ts";
import Paper from "../entities/database/Paper.ts";
import MainLayout from "../components/layout/MainLayout.tsx";
import roleAssignment from "../entities/database/RoleAssignment.ts";

type UserType = User & {
    userOIDStudent_concepts: ConceptType[];
    papers: PaperType[];
    roleassignments: roleAssignment[];
}

type ConceptType = Concept & {
    userOIDSupervisor_user: User | null;
    attachmentO: Attachment | null;
}

type PaperType = Paper & {
    attachmentO: Attachment;
};


function StudentDetailPage() {
    const {seminarOID, studentOID} = useParams();
    const {data} = useFetch<UserType>(`http://${import.meta.env.VITE_BACKEND_URL}/seminar/get-student/${seminarOID}/${studentOID}`);

    const styles = {
        uploadedPaper: {
            display: "grid",
            gridTemplateColumns: "20% 20% 20%",
            alignItems: "center"
        },
    };

    const header = [
        {field: 'text', header: 'Text'},
        {field: 'pdf', header: 'PDF'},
        {field: 'supervisor', header: 'Betreuer'},
        {field: 'feedback', header: 'Feedback'},
        {field: 'status', header: 'Status'},
        {field: 'createdAt', header: 'Eingereicht am'},
    ];

    const tableData = data?.userOIDStudent_concepts.map((concept) => {
        return {
            text: concept.text,
            pdf: concept.attachmentO ?
                <a href={`http://${import.meta.env.VITE_BACKEND_URL}/attachment/${concept.attachmentO?.attachmentOID}`}>{concept.attachmentO?.filename}</a> : "-",
            supervisor: concept.userOIDSupervisor_user ? `${concept.userOIDSupervisor_user.firstName} ${concept.userOIDSupervisor_user.lastName}` : '-',
            feedback: concept.feedback || '-',
            status: mapConceptStatusToString(concept.accepted),
            createdAt: concept.createdAt ? new Date(concept.createdAt).toLocaleString() : '-',
        };
    });

    return (
        <MainLayout>
            <div>
                {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
                <h1>Student Detail Page</h1>
                <p>Seminar: ...</p>
                <p>Student: ...</p>
                <h2>Eingereichte Konzepte</h2>
                <Table header={header} data={tableData}/>
                <h2>Hochgeladene Paper</h2>
                <div style={styles.uploadedPaper}>
                    <p>Datei:</p>
                    <p>Datum:</p>
                    <p>Final Paper:</p>
                    {data?.papers && data?.papers.length > 0 && data?.papers.map((paper: PaperType, index: number) => {
                        return (
                            <Fragment key={index}>
                                <a href={`http://${import.meta.env.VITE_BACKEND_URL}/attachment/${paper.paperOID}`}>{paper.attachmentO.filename}</a>
                                <p>{paper.createdAt ? new Date(paper.createdAt).toLocaleString() : '-'}</p>
                                {data.roleassignments.length > 0 ? (
                                    paper.paperOID === data.roleassignments[0].phase4paperOID ? (
                                        <p>Phase 4</p>
                                    ) : paper.paperOID === data.roleassignments[0].phase7paperOID ? (
                                        <p>Phase 7</p>
                                    ) : (
                                        <p>-</p>
                                    )
                                ) : (
                                    <p>-</p>
                                )}
                            </Fragment>
                        )
                    })}
                </div>
            </div>
        </MainLayout>
    )
}

export default StudentDetailPage;
