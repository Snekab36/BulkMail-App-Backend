const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config();

const Email = require("../models/Email");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB (prevent multiple connections)
if (!mongoose.connections[0].readyState) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"));
}

app.post("/sendemail", async (req, res) => {
  const { subject, msg, emailList } = req.body;

  if (!subject || !msg || !emailList?.length) {
    return res.status(400).json({ success: false });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    for (let email of emailList) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        text: msg
      });
    }

    await Email.create({
      subject,
      body: msg,
      recipients: emailList,
      status: "SUCCESS"
    });

    res.json({ success: true });

  } catch (err) {
    await Email.create({
      subject,
      body: msg,
      recipients: emailList,
      status: "FAILED"
    });

    res.status(500).json({ success: false });
  }
});

module.exports = app;
