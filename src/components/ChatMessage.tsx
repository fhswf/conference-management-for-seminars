import styles from './ChatMessage.module.css';
import React, {useContext} from "react";
import {AuthContext} from "../context/AuthContext.ts";

interface Props {
    message: Message;
    'data-test'?: string;
}

function ChatMessage({message, ['data-test']: dataTest}: Props) {
    const {user, setUser} = useContext(AuthContext);
    return (
        <div data-test={dataTest} className={styles.messageContainer}>
            {/* date alignment left or right */}
            {message.sender === user?.userOID ?
                <>
                    <div data-test="message-date">
                        <p>{new Date(message.createdAt).toLocaleString()}</p>
                    </div>
                    <div data-test="message-bubble" className={styles.text}>
                        <p data-test="message-text">{message.message || ""}</p>
                        {message.attachmentO && <><hr/><a data-test="message-attachment" href={`${import.meta.env.VITE_BACKEND_URL}/attachment/${message.attachmentO.attachmentOID}`}>{message.attachmentO.filename}</a></>}
                    </div>
                </> :
                <>
                    <div data-test="message-bubble" className={styles.text}>
                        <p data-test="message-text">{message.message}</p>
                        {message.attachmentO && <><hr/><a data-test="message-attachment" href={`${import.meta.env.VITE_BACKEND_URL}/attachment/${message.attachmentO.attachmentOID}`}>{message.attachmentO.filename}</a></>}
                    </div>
                    <div data-test="message-date">
                        <p>{new Date(message.createdAt).toLocaleString()}</p>
                    </div>
                </>
            }
        </div>
    )
}

export default ChatMessage;
