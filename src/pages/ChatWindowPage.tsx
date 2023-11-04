import styles from './ChatWindowPage.module.css';
import ChatMessage from "../components/ChatMessage.tsx";
import Message from "../entities/Message.ts";
import {useEffect, useState} from "react";
import {Button} from "primereact/button";
import {InputTextarea} from "primereact/inputtextarea";

function ChatWindowPage(){
    const [selectedChatPartner, setSelectedChatPartner] = useState<string>("Reviewer A")
    const [messages, setMessages] = useState<Message[]>([])

    function onChatChanged(partner: string){
        setSelectedChatPartner(partner)

        if(partner === "Reviewer A"){
            setMessages( [
                new Message("A Hallo ich würde ... verbessern", new Date("2023-09-29"), "21:45", "Reviewer A"),
                new Message("A Danke, für den Tipp!", new Date("2023-09-29"), "21:45", "User"),
                new Message("A Gerne!", new Date("2023-09-29"), "21:45", "Reviewer A"),
            ]);
        }else if(partner === "Reviewer B"){
            setMessages ([
                new Message("B Hallo ich würde ... verbessern", new Date("2023-09-29"), "21:45", "Reviewer B"),
                new Message("B Danke, für den Tipp!", new Date("2023-09-29"), "21:45", "User"),
                new Message("B Gerne!", new Date("2023-09-29"), "21:45", "Reviewer B"),
            ]);
        }else{
            setMessages ( [
                new Message("C Hallo ich würde ... verbessern", new Date("2023-09-29"), "21:45", "Reviewer C"),
                new Message("C Danke, für den Tipp!", new Date("2023-09-29"), "21:45", "User"),
                new Message("C Gerne!", new Date("2023-09-29"), "21:45", "Reviewer C"),
            ]);
        }
    }

    useEffect(() => {
        onChatChanged("Reviewer A")
    },[])

    return(
        <div className={styles.container}>
            <div className={styles.buttonContainer}>
                <Button onClick={()=>onChatChanged("Reviewer A")}>Reviewer A</Button>
                <Button onClick={()=>onChatChanged("Reviewer B")}>Reviewer B</Button>
                <Button onClick={()=>onChatChanged("Supervisor")}>Betreuer</Button>
            </div>
            <div className={styles.conversation}>

                {messages.map((message, index) => {
                    if(message.sender === "User"){
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
                <InputTextarea/>
                <Button label="➡"/>
            </div>
        </div>
    )
}

export default ChatWindowPage;