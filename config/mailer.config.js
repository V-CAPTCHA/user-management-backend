const nodemailer = require('nodemailer');

//Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,          //Host
  port: process.env.MAIL_PORT,          //Port
  secure: true,
  auth: {
    user: process.env.MAIL_USER,        //User
    pass: process.env.MAIL_PASSWORD,    //Password
  },
});

module.exports = transporter;