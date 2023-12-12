const nodemailer = require("nodemailer");

const mailUsername = process.env.MAIL_USERNAME;
const mailPassword = process.env.MAIL_PASSWORD;
const smtpHost = process.env.SMTP_HOST;

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: 465,
    secure: true,
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

module.exports = {
    init: () => {
        return true;
    },
    sendMail
}
