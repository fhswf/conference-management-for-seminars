import User from "../entities/database/User.ts";

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
        case true: return 'Angenommen';
        case false: return 'Abgelehnt';

        default: return 'Status ungültig';
    }
}


export function formatUserName(user: User){
    if (user.firstname && user.lastname) {
        return `${user.firstname} ${user.lastname}`;
    } else if (user.firstname || user.lastname) {
        return `${user.firstname || user.lastname}`;
    } else {
        return user.mail;
    }
}

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
