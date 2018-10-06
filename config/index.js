/*
 * @file: config.js
 * @description: It Contain app port and db configration.
 * @date: 12.07.2018
 * @author: Jasdeep Singh
 */

exports.ENV = {
    PORT: `4190`,
    DB_HOST: `52.34.207.5:27017`,
    DB_USER: `audiosynthesizer`,
    DB_PASS: `audiosynthesizer2780`,
    DB_NAME: `audiosynthesizer`
};

exports.PATH = {
    LOCAL: `https://localhost:4189/`,
    STAGING: `https://stagingsdei.com:4189/`
};

exports.smtp = {
    USER: "rddeveloper0@gmail.com",
    PASS: "ajji@123",
    PORT: 465, //587,
    SECURE: true, // true for 465, false for other ports
    SERVER: "smtp.gmail.com",
    MAIL_FROM: "Beacon <notifications@beacon.com>"
};