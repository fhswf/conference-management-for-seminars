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

interface Props {
    paper: Paper;
}

function ChatWindowPage({paper}: Props){
    const { user, setUser } = useContext(AuthContext);
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [text, setText] = useState<string>("")
    //const {data: messages2} = useFetch<Message[]>(`http://${import.meta.env.VITE_BACKEND_URL}/api/chat/879`)
    const [messages2, setMessages2] = useState<Message[]>()
    const {data: reviewOIDs} = useFetch<Review>(`http://${import.meta.env.VITE_BACKEND_URL}/api/review/get-from-paper/${paper.paperOID}`)
    const [selectedReview, setSelectedReview] = useState<number>()

    useEffect(() => {
        async function fetchMessages(){
            if(!reviewOIDs){
                return
            }

            console.log("fetch " + selectedReview)

            const response = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api/chat/${selectedReview}`, {
                credentials: "include"
            });

            const jsondata = await response.json()
            const messages = jsondata as Message[]

            console.log(jsondata)
            console.log(messages)

            setMessages2(messages)
        }

        fetchMessages()
    }, [selectedReview]);

    useEffect(() => {
        if(!reviewOIDs){
            return
        }

        console.log("set " + reviewOIDs[0].reviewOID);

        setSelectedReview(reviewOIDs[0].reviewOID)
    }, [reviewOIDs]);

    useEffect(() => {
        setMessages(messages2 || [])
    }, [messages2]);

    function onChatChanged(partner: string, reviewOID: number){
        console.log(partner + " " + reviewOID)
        setSelectedReview(reviewOID)
    }

    async function onSendClicked(){
        if(!text && !selectedFile){
            return
        }

        const formData = new FormData();
        formData.append('message', text);
        selectedFile && formData.append('file', selectedFile);
        paper.paperOID && formData.append('paperOID', paper.paperOID.toString());
        selectedReview && formData.append('reviewOID', selectedReview.toString());

        const response = await fetch("http://192.168.0.206:3000/api/chat", {
            method: "POST",
            credentials: "include",
            body: formData
        });

        const jsondata = await response.json()

        if(!response.ok){
            alert("Nachricht konnte nicht gesendet werden")
            return
        }

        const newMessage = jsondata as Message

        console.log(jsondata)
        console.log(newMessage)

        setMessages([...messages, newMessage])
        setText("")
        setSelectedFile(null)
    }

    return(
        <div className={styles.container}>
            {JSON.stringify(paper)}
            {JSON.stringify(reviewOIDs)}
            {reviewOIDs && <div className={styles.buttonContainer}>
                <Button key={reviewOIDs[0].reviewOID} onClick={()=>setSelectedReview(reviewOIDs[0].reviewOID)}>Reviewer A</Button>
                <Button key={reviewOIDs[1].reviewOID} onClick={()=>setSelectedReview(reviewOIDs[1].reviewOID)}>Reviewer B</Button>
                <Button key={reviewOIDs[2].reviewOID} onClick={()=>setSelectedReview(reviewOIDs[2].reviewOID)}>Betreuer</Button>
            </div>}
            <div className={styles.conversation}>

                {messages?.map((message, index) => {
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
                <CustomFileUpload onSelectionChanged={(file) => setSelectedFile(file || null)}/>
                <Button onClick={onSendClicked} label="➡" disabled={!text && !selectedFile}/>
            </div>
        </div>
    )
}

export default ChatWindowPage;
