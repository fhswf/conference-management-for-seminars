export function mapPhaseToString(phase: number){
    switch (phase) {
        case 1: return 'Registrierung-Phase';
        case 2: return 'Konzept-Upload-Phase';
        case 3: return 'Paper-Upload-Phase';
        case 4: return 'Reviewer-Zuordnung-Phase';
        case 5: return 'Review-Phase';
        case 6: return 'Reviews-lesen-Phase';
        case 7: return 'Final-Paper-Upload-Phase';

        default: return 'Phase ungültig';
    }
}

export function mapRoleToString(role: number){
    switch (role) {
        case 1: return 'Kurs-Admin';
        case 2: return 'Betreuer';
        case 3: return 'Student';

        default: return 'Rolle ungültig';
    }
}

export function mapConceptStatusToString(accepted: boolean | null){
    switch (accepted) {
        case null: return 'Bewertung ausstehend';
        case true: return 'akzeptiert';
        case false: return 'abgelehnt';

        default: return 'Status ungültig';
    }
}

/*
                <RadioButton inputId="5" value="5" onChange={(e) => setRating(e.value)} checked={rating === '5'} />
                <p>Tendenziell Annehmen</p>
                <RadioButton inputId="4" value="4" onChange={(e) => setRating(e.value)} checked={rating === '4'} />
                <p>Enthaltung</p>
                <RadioButton inputId="3" value="3" onChange={(e) => setRating(e.value)} checked={rating === '3'} />
                <p>Tendenziell Ablehnen</p>
                <RadioButton inputId="2" value="2" onChange={(e) => setRating(e.value)} checked={rating === '2'} />
                <p>Ablehnen</p>
                <RadioButton inputId="1" value="1" onChange={(e) => setRating(e.value)} checked={rating === '1'} />
*/

export function mapRatingToString(rating: number | null){
    switch (rating) {
        case 5: return 'Annehmen';
        case 4: return 'Tendenziell Annehmen';
        case 3: return 'Enthaltung';
        case 2: return 'Tendenziell Ablehnen';
        case 1: return 'Ablehnen';

        default: return 'Nicht bewertet';
    }
}
