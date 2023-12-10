import {useState} from "react";
import {RadioButton, RadioButtonChangeEvent} from "primereact/radiobutton";
import {Button} from "primereact/button";
import {mapRatingToString} from "../utils/helpers.ts";
interface Props{
    onSaveClicked: (rating: string) => void;
    onClose?: () => void;
}

function PaperRating({onSaveClicked, onClose}: Props) {
    const [rating, setRating] = useState("")

    const styles = {
        container: {
            display: "grid",
            gridTemplateColumns: "4fr 1fr",
            alignItems: "center",
        },
        button: {
            marginTop: "20px",
        }
    }

    const onSave = () => {
        onClose && onClose();
        onSaveClicked(rating);
    };

    return (
        <div>
            <p>Paper ...</p>
            <div style={styles.container}>
                <p>{mapRatingToString(5)}</p>
                {/*  */}
                <RadioButton inputId="5" value="5" onChange={(e: RadioButtonChangeEvent) => setRating(e.value)} checked={rating === '5'}/>
                <p>{mapRatingToString(4)}</p>
                <RadioButton inputId="4" value="4" onChange={(e: RadioButtonChangeEvent) => setRating(e.value)} checked={rating === '4'}/>
                <p>{mapRatingToString(3)}</p>
                <RadioButton inputId="3" value="3" onChange={(e: RadioButtonChangeEvent) => setRating(e.value)} checked={rating === '3'}/>
                <p>{mapRatingToString(2)}</p>
                <RadioButton inputId="2" value="2" onChange={(e: RadioButtonChangeEvent) => setRating(e.value)} checked={rating === '2'}/>
                <p>{mapRatingToString(1)}</p>
                <RadioButton inputId="1" value="1" onChange={(e: RadioButtonChangeEvent) => setRating(e.value)} checked={rating === '1'}/>
            </div>
            <Button label="Speichern" onClick={onSave} style={styles.button}/>
        </div>
    );
}

export default PaperRating;
