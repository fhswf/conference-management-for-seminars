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

function ChatWindowPage({paper, reviewOID}: Props){
    const pollingInterval = 2000;
    const { user, setUser } = useContext(AuthContext);
    const [selectedFile, setSelectedFile] = useState<File>()
    const [text, setText] = useState<string>("")
    //const {data: chatmessages} = useFetch<Message[]>(`http://${import.meta.env.VITE_BACKEND_URL}/chat/879`)
    const [chatmessages, setChatmessages] = useState<Message[]>([])
    const {data: reviewOIDs} = useFetch<Review[]>(`http://${import.meta.env.VITE_BACKEND_URL}/review/get-reviewoids-from-paper/${paper.paperOID}`)
    const [selectedReview, setSelectedReview] = useState<number>()


        async function fetchMessages(){
            if(!reviewOIDs){
                return
            }

            console.log("fetch " + selectedReview)

            const response = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/chat/${selectedReview}`, {
                credentials: "include"
            });

            const jsondata = await response.json()
            const messages = jsondata as Message[]

            console.log(jsondata)
            console.log(messages)

            setChatmessages(messages)
        }


    useInterval(() => {
        fetchMessages();
    }, pollingInterval);

    useEffect(() => {
        if (selectedReview) {
            fetchMessages();
        }
    }, [selectedReview]);

    useEffect(() => {
        if(!reviewOIDs){
            return
        }

        console.log("set " + reviewOIDs[0].reviewOID);

        setSelectedReview(reviewOIDs[0].reviewOID || undefined)
    }, [reviewOIDs]);


    async function onSendClicked(){
        if(!text && !selectedFile){
            return
        }

        const formData = new FormData();
        formData.append('message', text);
        selectedFile && formData.append('file', selectedFile);
        paper.paperOID && formData.append('paperOID', paper.paperOID.toString());
        selectedReview && formData.append('reviewOID', selectedReview.toString());

        const response = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/chat`, {
            method: "POST",
            credentials: "include",
            body: formData
        });

        const jsondata: {createdMessage: Message, createdAttachment: Attachment | null} = await response.json()

        if(response.status === 415){
            alert("Nur PDF Dateien sind erlaubt!")
            return
        }

        const newMessage = jsondata.createdMessage as Message;
        newMessage.attachmentO = jsondata.createdAttachment;
        console.log(newMessage)

        setChatmessages([...chatmessages, newMessage])
        setText("")
        setSelectedFile(undefined)
    }

    return(
        <div className={styles.container}>
            {/*JSON.stringify(paper)*/}
            {/*JSON.stringify(reviewOIDs)*/}
            {/*JSON.stringify(reviewOIDs)*/}
            {reviewOIDs && (
                <div className={styles.buttonContainer}>
                    {reviewOIDs.map((review, index) => {
                        const buttonText = index === 0 ? 'Review A' : index === 1 ? 'Review B' : index === 2 ? 'Betreuer' : '';
                        return (
                            <Button key={review.reviewOID} onClick={() => setSelectedReview(review.reviewOID || undefined)}>
                                {buttonText}
                            </Button>
                        );
                    })}
                </div>
            )}
            <div className={styles.conversation}>

                {chatmessages?.map((message, index) => {
                    if(message.sender === user?.userOID){
                        return <div key={index} className={styles.messageRight}>
                            <ChatMessage message={message}/>
                        </div>
                    } else {
                        return <div key={index} className={styles.messageLeft}>
                            <ChatMessage message={message}/>
                        </div>
                    }
                })}
            </div>
            <div className={styles.textfieldAndButton}>
                <InputTextarea value={text} onChange={(e) => setText(e.target.value)}/>
                <CustomFileUpload onSelectionChanged={(file) => setSelectedFile(file || undefined)}/>
                <Button onClick={onSendClicked} label="➡" disabled={!text && !selectedFile}/>
            </div>
        </div>
    )
}

export default ChatWindowPage;
