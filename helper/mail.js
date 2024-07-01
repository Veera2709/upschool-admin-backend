const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

//SendGrid Configuration
const sgoptions = {
    auth: {
        api_key: process.env.SENDGRID_API_KEY
    }
};

let transporter = nodemailer.createTransport(sgTransport(sgoptions), {
    secure: true,
    requireTLS: true,
    port: 465,
    secured: true
});

exports.sendEmail = function (mailOptions, callback) {
    transporter.sendMail(mailOptions, function (email_error, email_response) {
        if (email_error) {
            console.log("unable to send email for otp:", JSON.stringify(email_error, null, 2))
            callback(email_error, email_response);
        }
        else {
            console.log('Email sent successfully: ' + email_response.message);
            callback(email_error, email_response);
        }
    })
}