import {Button} from "primereact/button";

function ConceptAcceptReject(){
    return(
        <div>
            <p>Konzept annehmen / ablehnen</p>
            <p>Text: Mein Konzept ist ...</p>
            <p>Anhang: <a href="hthtzjrztjzt"> meinkonzept.pdf</a></p>
            <Button label="Annehmen"/>
            <Button label="Ablehnen"/>
            <Button label="Chat"/>
        </div>
    )
}

export default ConceptAcceptReject;