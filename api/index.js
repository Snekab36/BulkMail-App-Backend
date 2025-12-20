const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config();

const Email = require("../models/Email");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

app.use(express.json());

// ✅ MongoDB connection (safe for Vercel)
if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("Mongo error:", err));
}

app.post("/sendemail", async (req, res) => {
  const { msg, emailList } = req.body;

  // ✅ Subject auto-generated
  const subject = "Bulk Mail Notification";

  if (!msg || !Array.isArray(emailList) || emailList.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid request data"
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // ✅ Send emails
    for (const email of emailList) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        text: msg
      });
    }

    // ✅ Save success log
    await Email.create({
      subject,
      body: msg,
      recipients: emailList,
      status: "SUCCESS"
    });

    return res.json({ success: true });

  } catch (err) {
    console.error("Email error:", err);

    // ✅ Save failure log
    await Email.create({
      subject,
      body: msg,
      recipients: emailList,
      status: "FAILED"
    });

    return res.status(500).json({
      success: false,
      message: "Email sending failed"
    });
  }
});

module.exports = app;
