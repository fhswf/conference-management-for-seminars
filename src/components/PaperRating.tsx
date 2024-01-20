import {useEffect, useState} from "react";
import {RadioButton, RadioButtonChangeEvent} from "primereact/radiobutton";
import {Button} from "primereact/button";
import {mapRatingToString} from "../utils/helpers.ts";

interface Props {
    onSaveClicked: (rating: string) => void;
    onClose?: () => void;
    value: number | null;
    'data-test'?: string;
}

function PaperRating({onSaveClicked, onClose, value, ['data-test']: dataTest}: Props) {
    const [rating, setRating] = useState("")

    useEffect(() => {
        if (value) {
            setRating(value.toString());
        }
    }, []);

    const styles = {
        button: {
            marginTop: "20px",
        }
    }

    const onSave = () => {
        onClose && onClose();
        onSaveClicked(rating);
    };

    return (
        <div data-test={dataTest} className="card flex justify-content-center">
            <div className="flex flex-column gap-3">
                <div className="flex align-items-center">
                    <RadioButton data-test="rate-5" key="5" inputId="5" value="5"
                                 onChange={(e: RadioButtonChangeEvent) => setRating(e.value)}
                                 checked={rating === '5'}/>
                    <label htmlFor="5" className="ml-2">{mapRatingToString(5)}</label>
                </div>
                <div className="flex align-items-center">
                    <RadioButton data-test="rate-4" key="4" inputId="4" value="4"
                                 onChange={(e: RadioButtonChangeEvent) => setRating(e.value)}
                                 checked={rating === '4'}/>
                    <label htmlFor="4" className="ml-2">{mapRatingToString(4)}</label>
                </div>
                <div className="flex align-items-center">
                    <RadioButton data-test="rate-3" key="3" inputId="3" value="3"
                                 onChange={(e: RadioButtonChangeEvent) => setRating(e.value)}
                                 checked={rating === '3'}/>
                    <label htmlFor="3" className="ml-2">{mapRatingToString(3)}</label>
                </div>
                <div className="flex align-items-center">
                    <RadioButton data-test="rate-2" key="2" inputId="2" value="2"
                                 onChange={(e: RadioButtonChangeEvent) => setRating(e.value)}
                                 checked={rating === '2'}/>
                    <label htmlFor="2" className="ml-2">{mapRatingToString(2)}</label>
                </div>
                <div className="flex align-items-center">
                    <RadioButton data-test="rate-1" key="1" inputId="1" value="1"
                                 onChange={(e: RadioButtonChangeEvent) => setRating(e.value)}
                                 checked={rating === '1'}/>
                    <label htmlFor="1" className="ml-2">{mapRatingToString(1)}</label>
                </div>
                <Button data-test="rate-submit" label="Speichern" onClick={onSave} style={styles.button}/>
            </div>
        </div>
    );
}

export default PaperRating;
