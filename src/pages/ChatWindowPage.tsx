import styles from './ChatWindowPage.module.css';
import ChatMessage from "../components/ChatMessage.tsx";
import {useContext, useEffect, useState} from "react";
import {Button} from "primereact/button";
import {InputTextarea} from "primereact/inputtextarea";
import CustomFileUpload from "../components/CustomFileUpload.tsx";
import useFetch from "../hooks/useFetch.ts";
import Paper from "../entities/database/Paper.ts";
import Review from "../entities/database/Review.ts";
import {AuthContext} from "../context/AuthContext.ts";
import useInterval from "../hooks/useInterval.ts";
import Attachment from "../entities/database/Attachment.ts";

interface Props {
    paper: Paper;
    reviewOID?: number;
}

function ChatWindowPage({paper, reviewOID}: Props) {
    const pollingInterval = 2000;
    const {user, setUser} = useContext(AuthContext);
    const [selectedFile, setSelectedFile] = useState<File>()
    const [text, setText] = useState<string>("")
    //const {data: chatmessages} = useFetch<Message[]>(`${import.meta.env.VITE_BACKEND_URL}/chat/879`)
    const [chatmessages, setChatmessages] = useState<Message[]>([])
    const {data: reviewOIDs} = useFetch<Review[]>(`${import.meta.env.VITE_BACKEND_URL}/review/get-reviewoids-from-paper/${paper.paperOID}`)
    const [selectedReview, setSelectedReview] = useState<number>()


    async function fetchMessages() {
        if (!reviewOIDs) {
            return
        }

        //console.log("fetch " + selectedReview)

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chat/${selectedReview}`, {
            credentials: "include"
        });

        const jsondata = await response.json()
        const messages = jsondata as Message[]

        setChatmessages(messages)
    }

    // fetch messages in intervall
    useInterval(() => {
        fetchMessages();
    }, pollingInterval);

    //reload messages if user
    useEffect(() => {
        if (selectedReview) {
            fetchMessages();
        }
    }, [selectedReview]);

    // set selected review to first review after reviewOIDs are loaded
    useEffect(() => {
        if (!reviewOIDs) {
            return
        }

        setSelectedReview(reviewOIDs[0].reviewOID || undefined)
    }, [reviewOIDs]);


    async function onSendClicked() {
        if (!text && !selectedFile) {
            return
        }

        const formData = new FormData();
        formData.append('message', text);
        selectedFile && formData.append('file', selectedFile);
        paper.paperOID && formData.append('paperOID', paper.paperOID.toString());
        selectedReview && formData.append('reviewOID', selectedReview.toString());

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chat`, {
            method: "POST",
            credentials: "include",
            body: formData
        });

        const jsondata: { createdMessage: Message, createdAttachment: Attachment | null } = await response.json()

        if (response.status === 415) {
            alert("Bitte nur PDF-Dateien hochladen.")
            return
        }

        const newMessage = jsondata.createdMessage as Message;
        newMessage.attachmentO = jsondata.createdAttachment;

        setChatmessages([...chatmessages, newMessage])
        setText("")
        setSelectedFile(undefined)
    }

    return (
        <div className={styles.container}>
            {/*JSON.stringify(paper)*/}
            {/*<pre>{JSON.stringify(reviewOIDs, null, 2)}</pre>*/}
            {/*<pre>{JSON.stringify(chatmessages, null, 2)}</pre>*/}
            {reviewOIDs && (
                <div data-test="reviewer-selection" className={styles.buttonContainer}>
                    {Array.isArray(reviewOIDs) && reviewOIDs.map((review, index) => {
                        {/* Aktuell erfolgt die Zuordnung anhand der Sortierung der Review-IDs eines Papers. Hierbei wird ausgegangend, dass die Betreuer die dritte ID ist,
                        was durch die Reihengolge der Review-Zuordnung der Fall wäre*/}
                        const buttonText = index === 0 ? 'Reviewer A' : index === 1 ? 'Reviewer B' : index === 2 ? 'Betreuer' : '';
                        return (
                            <Button data-test="reviewer-button" key={review.reviewOID}
                                    onClick={() => setSelectedReview(review.reviewOID || undefined)}>
                                {buttonText}
                            </Button>
                        );
                    })}
                </div>
            )}
            <div data-test="messages-div" className={styles.conversation}>
                {chatmessages?.map((message, index) => {
                    if (message.sender === user?.userOID) {
                        return <div data-test="ChatMessage-div" key={index} className={styles.messageRight}>
                            <ChatMessage data-test="chat-message-item" message={message}/>
                        </div>
                    } else {
                        return <div data-test="ChatMessage-div" key={index} className={styles.messageLeft}>
                            <ChatMessage data-test="chat-message-item" message={message}/>
                        </div>
                    }
                })}
            </div>
            <div className={styles.textfieldAndButton}>
                <InputTextarea data-test="review-textfield" value={text} onChange={(e) => setText(e.target.value)}/>
                <CustomFileUpload accept="application/pdf" onSelectionChanged={(file) => setSelectedFile(file || undefined)}/>
                <Button data-test="review-send" onClick={onSendClicked} label="➡" disabled={!text && !selectedFile}/>
            </div>
        </div>
    )
}

export default ChatWindowPage;
