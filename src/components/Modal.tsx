import React from "react";
import styles from "./Modal.module.css";
import { Button } from "primereact/button";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

function Modal({ isOpen, onClose, children }: Props) {
    return (
        <>
            {isOpen && (
                <div data-test="modal" className={styles.modal}>
                    <div onClick={onClose} className={styles.overlay}></div>
                    <div className={styles.modalContent}>
                        {children}
                        <Button data-test="close-modal" className={styles.closeModal} onClick={onClose}>
                            X
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Modal;
