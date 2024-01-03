const nodemailer = require("nodemailer");

const mailUsername = process.env.MAIL_USERNAME;
const mailPassword = process.env.MAIL_PASSWORD;
const smtpHost = process.env.SMTP_HOST;

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: 587,
    //port: 465,
    //secure: true,
    auth: {
        user: mailUsername,
        pass: mailPassword,
    },
});

const sendMail = async (to, subject, text) => {
    
        //TODO evtl Intervall einfügen

        console.log(to);
        console.log(subject);
        console.log(text);

        if (!to || !subject || !text) {
            throw new Error('Es wurden nicht alle benötigten Parameter übergeben.');
        }

        const mailOptions = {
            from: process.env.SENDER_MAIL,

            to: to,
            subject: subject,
            text: text,
        };

        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
            } else {
                console.log('E-Mail wurde erfolgreich gesendet: ' + info.response);
            }
        });
}

/**
 * Sends an email to all users in the given userArray.
 * @param userArray - An array of user Models.
 * @param seminar - The seminar Model the phase was changed for.
 * @returns {Promise<void>}
 */
const sendMailPhaseChanged = async (userArray, seminar) => {
    for(const user of userArray) {
        //await new Promise(resolve => setTimeout(resolve, 3000));
        const subject = 'Phase geändert';
        const emailText = `Hallo ${user.firstName} ${user.lastName},
                    \ndas Seminar ${seminar.description} ist in die ${mapPhaseToString(seminar.phase)} übergegangen.
                    \nSeminar: ${seminar.description}
                    \n\nMit freundlichen Grüßen`;

        await sendMail(user.mail, subject, emailText);
    }
}

/**
 * Sends an email to the student that his concept was evaluated.
 * @param concept - The concept Model that was evaluated.
 * @returns {Promise<void>}
 */
const sendMailConceptEvaluated = async (concept) => {
    const student = concept.userOIDStudent_user;
    const supervisor = concept.userOIDSupervisor_user;
    const seminar = concept.seminarO;

    const subject = 'Konzept bewertet';
    const emailText = `Hallo ${student.firstName} ${student.lastName} ,
                \n\nIhr Konzept wurde ${concept.accepted ? "angenommen" : "abgelehnt"}.
                \n\nSeminar: ${seminar.description}
            ${concept.feedback ? "\n\nFeedback: " + concept.feedback : ""}
            Sie wurden dem Betreuer ${getUserDisplayName(supervisor)} zugewiesen.
            \n\nMit freundlichen Grüßen`;

    await sendMail(student.mail, subject, emailText);
}

/**
 * Sends an email to all users in the given user array.
 * @param users - An array of user Models to send the email to.
 * @param seminar - The seminar Model the concept was uploaded for.
 * @param student - The student Model that uploaded the concept.
 * @returns {Promise<void>}
 */
const sendMailConceptUploaded = async (users, seminar, student) => {
    const subject = 'Neues Konzept hochgeladen';

    for(const user of users) {
        //await new Promise(resolve => setTimeout(resolve, 3000));
        const emailText = `Hallo ${user.firstName} ${user.lastName},
                    \nSeminar: ${seminar.description}
                    \nder Student ${getUserDisplayName(student)} hat ein Konzept eingereicht.
                    \n\nMit freundlichen Grüßen`;

        await sendMail(user.mail, subject, emailText);
    }
}

/**
 * Sends an email to all users in the given user array.
 * @param users - An array of user Models to send the email to.
 * @param seminar - The seminar Model the paper was uploaded for.
 * @param student - The student Model that uploaded the paper.
 * @returns {Promise<void>}
 */
const sendMailPaperUploaded = async (users, seminar, student) => {
    const subject = 'Paper hochgeladen';

    for(const user of users) {
        //await new Promise(resolve => setTimeout(resolve, 3000));
        const emailText = `Hallo ${user.firstName} ${user.lastName},
                    \nder Student ${getUserDisplayName(student)} hat ein Paper hochgeladen.
                    \nSeminar: ${seminar.description}
                    \n\nMit freundlichen Grüßen`;

        await sendMail(user.mail, subject, emailText);
    }
}

function mapPhaseToString(phase){
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

function getUserDisplayName(student) {
    if (student.firstName && student.lastName) {
        return `${student.firstName} ${student.lastName}`;
    } else {
        return student.mail;
    }
}

module.exports = {
    init: () => {
        return true;
    },
    sendMail,
    sendMailPhaseChanged,
    sendMailConceptEvaluated,
    sendMailConceptUploaded,
    sendMailPaperUploaded
}
