import styles from './ChatMessage.module.css';
import React, {useContext} from "react";
import {AuthContext} from "../context/AuthContext.ts";

interface Props {
    message: Message;
}

function ChatMessage({message}: Props) {
    const {user, setUser} = useContext(AuthContext);
    return (
        <div className={styles.messageContainer}>
            {message.sender === user?.userOID ?
                <>
                    <div>
                        <p>{new Date(message.createdAt).toLocaleString()}</p>
                    </div>
                    <div className={styles.text}>
                        <p>{message.message}</p>
                        {message.attachmentO && <><hr/><a href={`http://${import.meta.env.VITE_BACKEND_URL}/attachment/${message.attachmentO.attachmentOID}`}>{message.attachmentO.filename}</a></>}
                    </div>
                </> :
                <>
                    <div className={styles.text}>
                        <p>{message.message}</p>
                        {message.attachmentO && <><hr/><a href={`http://${import.meta.env.VITE_BACKEND_URL}/attachment/${message.attachmentO.attachmentOID}`}>{message.attachmentO.filename}</a></>}
                    </div>
                    <div>
                        <p>{new Date(message.createdAt).toLocaleString()}</p>
                    </div>
                </>
            }
        </div>
    )
}

export default ChatMessage;
