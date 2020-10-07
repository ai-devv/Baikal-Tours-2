"use strict";

import nodemailer from "nodemailer";

const mail = nodemailer.createTransport( {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE,
  auth: {
    user: process.env.EMAIL_AUTH_USER,
    pass: process.env.EMAIL_AUTH_PASS
  }
} );
mail.send = ( to, subject, text, html ) => mail.sendMail( {
  from: process.env.EMAIL_FROM,
  to,
  subject,
  text,
  html
} );

export default mail;
