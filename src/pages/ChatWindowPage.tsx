import styles from './ChatWindowPage.module.css';
import ChatMessage from "../components/ChatMessage.tsx";
import {useEffect, useState} from "react";
import {Button} from "primereact/button";
import {InputTextarea} from "primereact/inputtextarea";
import CustomFileUpload from "../components/CustomFileUpload.tsx";
import useFetch from "../hooks/useFetch.ts";



function ChatWindowPage(){
    const [selectedChatPartner, setSelectedChatPartner] = useState<string>("Reviewer A")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [text, setText] = useState<string>("")
    const {data: messages2} = useFetch<Message[]>("http://192.168.0.206:3000/api/chat/1") // TODO replace

    useEffect(() => {
        setMessages(messages2 || [])
    }, [messages2]);

    function onChatChanged(partner: string){
        setSelectedChatPartner(partner)
        console.log(partner)
    }

    useEffect(() => {
        onChatChanged("Reviewer A")
    },[])

    async function onSendClicked(){
        if(!text && !selectedFile){
            return
        }

        const formData = new FormData();
        formData.append('message', text);
        formData.append('file', selectedFile);
        formData.append('paperOID', 1); // TODO
        formData.append('reviewOID', 1); // TODO replace with review id

        const response = await fetch("http://192.168.0.206:3000/api/chat", {
            method: "POST",
            credentials: "include",
            body: formData
        });

        const jsondata = await response.json()
        const newMessage = jsondata as Message

        console.log(jsondata)
        console.log(newMessage)

        setMessages([...messages, newMessage])
        setText("")
        setSelectedFile(null)
    }

    return(
        <div className={styles.container}>
            {/*JSON.stringify(messages2)*/}
            <div className={styles.buttonContainer}>
                <Button onClick={()=>onChatChanged("Reviewer A")}>Reviewer A</Button>
                <Button onClick={()=>onChatChanged("Reviewer B")}>Reviewer B</Button>
                <Button onClick={()=>onChatChanged("Supervisor")}>Betreuer</Button>
            </div>
            <div className={styles.conversation}>

                {messages?.map((message, index) => {
                    if(message.sender === message.clientUserId){ // TODO replace with user id
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
