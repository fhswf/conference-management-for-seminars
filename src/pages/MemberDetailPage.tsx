import styles from "./MemberDetailPage.module.css"
import Table from "../components/Table.tsx";
import useFetch from "../hooks/useFetch.ts";
import {useParams} from "react-router-dom";
import React, {Fragment, useEffect, useState} from "react";
import {formatUserName, mapConceptStatusToString} from "../utils/helpers.ts";
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


function MemberDetailPage() {
    const {seminarOID, studentOID} = useParams();
    const {data} = useFetch<UserType>(`${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_URL}/seminar/${seminarOID}/get-student/${studentOID}`);
    const [reviewer, setReviewer] = useState<User[]>([]);

    useEffect(() => {
        if (data && data.userOID) {
            const fetchReviewer = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_URL}/review/get-reviewer-of-paper/${data.roleassignments[0].phase3paperOID}`,
                        {
                            credentials: "include",
                        });
                    const reviewerData = await response.json();
                    setReviewer(reviewerData);
                } catch (error) {
                    console.error('Fehler beim Abrufen des Reviewers:', error);
                }
            };

            data.roleassignments[0].phase3paperOID && fetchReviewer();
        }
    }, [data]);

    const header = [
        {field: 'text', header: 'Text'},
        {field: 'pdf', header: 'PDF'},
        {field: 'supervisor', header: 'Betreuer'},
        {field: 'feedback', header: 'Feedback'},
        {field: 'status', header: 'Status'},
        {field: 'createdAt', header: 'Eingereicht am'},
    ];

    const tableData = data?.userOIDStudent_concepts?.map((concept) => {
        return {
            text: concept.text,
            pdf: concept.attachmentO ?
                <a href={`${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_URL}/attachment/${concept.attachmentO?.attachmentOID}`}>{concept.attachmentO?.filename}</a> : "-",
            supervisor: concept.userOIDSupervisor_user ? `${concept.userOIDSupervisor_user.firstname} ${concept.userOIDSupervisor_user.lastname}` : '-',
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
                <h1 data-test="header">Teilnehmer Details</h1>
                <p data-test="seminar-id">Seminar-ID: {seminarOID}</p>
                <p data-test="student-name">Student: {data && formatUserName(data)}</p>
                <h2 data-test="header-concepts">Eingereichte Konzepte</h2>
                <Table data-test="table-concepts" header={header} data={tableData}/>
                <h2 data-test="header-papers">Hochgeladene Paper</h2>
                <div data-test="papers" className={styles.container}>
                    <div>
                    <p>Datei:</p>
                    <p>Datum:</p>
                    <p>Final Paper Phase:</p>
                    </div>
                    {data?.papers && data?.papers.length > 0 && data?.papers.map((paper: PaperType, index: number) => {
                        /* make Fragment to div for testing */
                        return (
                            <div data-test="paper-row" key={paper.paperOID}>
                                <a  data-test="attachment-href" href={`${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_URL}/attachment/${paper.attachmentO.attachmentOID}`}>{paper.attachmentO.filename}</a>
                                <p  data-test="date-paper">{paper.createdAt ? new Date(paper.createdAt).toLocaleString() : '-'}</p>
                                {data.roleassignments.length > 0 ? (
                                    paper.paperOID === data.roleassignments[0].phase3paperOID ? (
                                        <p data-test="phase-paper">Phase 3</p>
                                    ) : paper.paperOID === data.roleassignments[0].phase7paperOID ? (
                                        <p data-test="phase-paper">Phase 7</p>
                                    ) : (
                                        <p data-test="phase-paper">-</p>
                                    )
                                ) : (
                                    <p data-test="phase-paper">-</p>
                                )}
                            </div>
                        )
                    })}
                </div>
                {reviewer && reviewer.length > 0 && <div>
                    <h2 data-test="header-reviewer">Reviewer:</h2>
                    <ul data-test="reviewer-list">
                        {reviewer?.map((reviewer) => {
                            return (
                                <li key={reviewer.userOID}>{formatUserName(reviewer)}</li>
                            );
                        })}
                    </ul>
                </div>}
            </div>
        </MainLayout>
    )
}

export default MemberDetailPage;
