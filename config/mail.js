/* -----------------------------------------------------------------------
   * @ description : Here initialising nodemailer transport for sending mails.
----------------------------------------------------------------------- */

const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const fs = require('fs');
const path = require('path');
const util = require('util');
const {smtp} = require('./index');

const {USER, PASS, PORT, SECURE, SERVER, MAIL_FROM} = smtp;

const transporter = nodemailer.createTransport(
    smtpTransport({
        host: SERVER, // hostname
        port: PORT, // port for secure SMTP
        secure: SECURE, // true for 465, false for other ports
        auth: {
            user: USER,
            pass: PASS
        }
    })
);

exports.subjects = {
    userVerification: 'Verify Email',
    forgetPassword: 'Forget Password'
};

exports.formatHTML = function (request) {
    const templatePath = path.join(__dirname, '../emailTemplates/'),
        emailTemplate = fs.readFileSync(path.resolve(`${templatePath}${request.fileName}`), 'UTF-8');

    /******* Replace dynamic values in email template. *******/
    return util.format(emailTemplate, request.username, request.link);
};

exports.sendMail = function (request, cb) {

    let options = {
        from: MAIL_FROM, to: request.to, subject: request.subject, html: request.html
    };

    if (request.cc) {
        options.cc = request.cc;
    }
    if (request.replyTo) {
        options.replyTo = request.replyTo;
    }

    transporter.sendMail(options, function (error, info) {
        // send mail with defined transport object
        console.log(error, info);
        cb(error, info);
    });
};
