import styles from './ChatMessage.module.css';
import Message from "../entities/Message.ts";

interface Props {
    message: Message;
}

function ChatMessage({message}: Props) {
    return (
        <div className={styles.messageContainer}>
            {message.sender === 'User' ?
                <>
                    <div>
                        <p>{message.time}</p>
                    </div>
                    <div className={styles.text}>
                        <p>{message.text}</p>
                    </div>
                </> :
                <>
                    <div className={styles.text}>
                        <p>{message.text}</p>
                    </div>
                    <div>
                        <p>{message.time}</p>
                    </div>
                </>
            }
        </div>
    )
}

export default ChatMessage;