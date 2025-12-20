const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Test route (IMPORTANT)
app.get("/", (req, res) => {
  res.send("BulkMail Backend is running");
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("Mongo error:", err));

// Schema
const credentialSchema = new mongoose.Schema({
  user: String,
  pass: String
});

const Credential = mongoose.model("credential", credentialSchema, "bulkmails");

// API route
app.post("/api/sendemail", async (req, res) => {
  const { msg, emailList } = req.body;

  if (!msg || !emailList?.length) {
    return res.status(400).send(false);
  }

  try {
    const data = await Credential.find();

    if (!data.length) {
      return res.status(500).send(false);
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: data[0].user,
        pass: data[0].pass
      }
    });

    for (const email of emailList) {
      await transporter.sendMail({
        from: data[0].user,
        to: email,
        subject: "A message from Bulk Mail App",
        text: msg
      });
    }

    res.send(true);
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).send(false);
  }
});

// START SERVER (REQUIRED FOR RAILWAY)
app.listen(process.env.PORT);
console.log(`Server running on port ${process.env.PORT}`);


