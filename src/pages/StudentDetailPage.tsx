import Table from "../components/Table.tsx";
import useFetch from "../hooks/useFetch.ts";
import {useParams} from "react-router-dom";
import React, {Fragment, useEffect, useState} from "react";
import {mapConceptStatusToString} from "../utils/helpers.ts";
import User from "../entities/database/User.ts";
import Concept from "../entities/database/Concept.ts";
import Attachment from "../entities/database/Attachment.ts";
import Paper from "../entities/database/Paper.ts";
import MainLayout from "../components/layout/MainLayout.tsx";
import roleAssignment from "../entities/database/RoleAssignment.ts";
import seminar from "../entities/database/Seminar.ts";

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
    const {data} = useFetch<UserType>(`https://${import.meta.env.VITE_BACKEND_URL}/seminar/get-student/${seminarOID}/${studentOID}`);
    const [reviewer, setReviewer] = useState<User[]>([]);

    useEffect(() => {
        if (data && data.userOID) {
            const fetchReviewer = async () => {
                try {
                    const response = await fetch(`https://${import.meta.env.VITE_BACKEND_URL}/review/get-reviewer-of-paper/${data.roleassignments[0].phase4paperOID}`,
                        {
                            credentials: "include",
                        });
                    const reviewerData = await response.json();
                    setReviewer(reviewerData);
                } catch (error) {
                    console.error('Fehler beim Abrufen des Reviewers:', error);
                }
            };

            data.roleassignments[0].phase4paperOID && fetchReviewer();
        }
    }, [data]);

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
                <a href={`https://${import.meta.env.VITE_BACKEND_URL}/attachment/${concept.attachmentO?.attachmentOID}`}>{concept.attachmentO?.filename}</a> : "-",
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
                {/*<pre>{JSON.stringify(reviewer, null, 2)}</pre>*/}
                <h1>Student Detail Page</h1>
                <p>Seminar: ... {seminarOID}</p>
                <p>Student: {data?.firstName} {data?.lastName}</p>
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
                                <a href={`https://${import.meta.env.VITE_BACKEND_URL}/attachment/${paper.paperOID}`}>{paper.attachmentO.filename}</a>
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
                {reviewer && reviewer.length > 0 && <div>
                    <h2>Reviewer:</h2>
                    <ul>
                        {reviewer?.map((reviewer) => {
                            return (
                                <li key={reviewer.userOID}>{reviewer.firstName} {reviewer.lastName}</li>
                            );
                        })}
                    </ul>
                </div>}
            </div>
        </MainLayout>
    )
}

export default StudentDetailPage;
