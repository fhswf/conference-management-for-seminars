const nodemailer = require("nodemailer");

const mailUsername = process.env.MAIL_USERNAME;
const mailPassword = process.env.MAIL_PASSWORD;
const smtpHost = process.env.SMTP_HOST;

const transporter = nodemailer.createTransport({
    host: smtpHost,
    //port: 587,
    port: 465,
    secure: true,
    auth: {
        user: mailUsername,
        pass: mailPassword,
    },
});

/**
 * Sends an email using the configured transporter.
 *
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The email subject.
 * @param {string} text - The email body text.
 */
const sendMail = async (to, subject, text) => {
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
 * Sends an email notification to users about a phase change in the seminar.
 *
 * @param {Array} userArray - An array of user objects.
 * @param {Object} seminar - The seminar object containing phase information.
 * @returns {Promise<void>}
 */
const sendMailPhaseChanged = async (userArray, seminar) => {
    for(const user of userArray) {
        //await new Promise(resolve => setTimeout(resolve, 3000));
        const subject = 'Phase geändert';
        const emailText = `Hallo ${getUserDisplayName(user)},
                    \ndas Seminar ${seminar.description} ist in die ${mapPhaseToString(seminar.phase)} übergegangen.
                    \nSeminar: ${seminar.description}
                    \n\nMit freundlichen Grüßen`;

        await sendMail(user.mail, subject, emailText);
    }
}

/**
 * Sends an email to the student that his concept was evaluated.
 * @param {Object} concept - The concept object with evaluation details.
 * @returns {Promise<void>}
 */
const sendMailConceptEvaluated = async (concept) => {
    const student = concept.userOIDStudent_user;
    const supervisor = concept.userOIDSupervisor_user;
    const seminar = concept.seminarO;

    const subject = 'Konzept bewertet';
    const emailText = `Hallo ${getUserDisplayName(student)} ,
                \n\nIhr Konzept wurde ${concept.accepted ? "angenommen" : "abgelehnt"}.
                \n\nSeminar: ${seminar.description}
            ${concept.feedback ? "\n\nFeedback: " + concept.feedback : ""}
            ${supervisor && concept.accepted? `Sie wurden dem Betreuer ${getUserDisplayName(supervisor)} zugewiesen.` : ""}
            \n\nMit freundlichen Grüßen`;

    await sendMail(student.mail, subject, emailText);
}

/**
 * Sends an email to all users in the given user array.
 *
 * @param {Array} users - An array of users to send notifications to.
 * @param {Object} seminar - The seminar for which the concept was uploaded.
 * @param {Object} student - The student who uploaded the concept.
 * @returns {Promise<void>}
 */
const sendMailConceptUploaded = async (users, seminar, student) => {
    const subject = 'Neues Konzept hochgeladen';

    for(const user of users) {
        //await new Promise(resolve => setTimeout(resolve, 3000));
        const emailText = `Hallo ${getUserDisplayName(user)},
                    \nSeminar: ${seminar.description}
                    \nder Student ${getUserDisplayName(student)} hat ein Konzept eingereicht.
                    \n\nMit freundlichen Grüßen`;

        await sendMail(user.mail, subject, emailText);
    }
}

/**
 * Sends an email to all users in the given user array.
 * @param {Array} users - An array of users to send notifications to.
 * @param {Object} seminar - The seminar for which the paper was uploaded.
 * @param {Object} student - The student who uploaded the paper.
 * @returns {Promise<void>}
 */
const sendMailPaperUploaded = async (users, seminar, student) => {
    const subject = 'Paper hochgeladen';

    for(const user of users) {
        //await new Promise(resolve => setTimeout(resolve, 3000));
        const emailText = `Hallo ${getUserDisplayName(user)},
                    \nder Student ${getUserDisplayName(student)} hat ein Paper hochgeladen.
                    \nSeminar: ${seminar.description}
                    \n\nMit freundlichen Grüßen`;

        await sendMail(user.mail, subject, emailText);
    }
}

/**
 * Maps a numeric phase to its corresponding string representation.
 *
 * @param {number} phase - The numeric phase.
 * @returns {string} - The string representation of the phase.
 */
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

/**
 * Generates a user display name based on the firstname and lastname properties.
 * If both properties are available, it concatenates them. Otherwise, it uses the mail property.
 *
 * @param {Object} student - The student object.
 * @returns {string} - The user display name.
 */
function getUserDisplayName(student) {
    try {
        if (student.firstname && student.lastname) {
            return `${student.firstname} ${student.lastname}`;
        } else {
            return student.mail;
        }
    } catch (e) {
        console.error(e);
        return student.mail;
    }
}

module.exports = {
    init: () => {
        return true;
    },
    //sendMail,
    sendMailPhaseChanged,
    sendMailConceptEvaluated,
    sendMailConceptUploaded,
    sendMailPaperUploaded
}
