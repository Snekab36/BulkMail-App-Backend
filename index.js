const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("Mongo error:", err));

// ✅ Schema
const credentialSchema = new mongoose.Schema({
  user: String,
  pass: String
});

const Credential = mongoose.model("credential", credentialSchema, "bulkmails");

// ✅ API route
app.post("/sendemail", async (req, res) => {
  const { msg, emailList } = req.body;

  if (!msg || !emailList?.length) {
    return res.status(400).send(false);
  }

  try {
    const data = await Credential.find();

    if (!data.length) {
      console.error("No credentials found in DB");
      return res.status(500).send(false);
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: data[0].user,
        pass: data[0].pass,
      },
    });

    for (const email of emailList) {
      await transporter.sendMail({
        from: data[0].user,
        to: email,
        subject: "A message from Bulk Mail App",
        text: msg,
      });
    }

    return res.send(true);

  } catch (error) {
    console.error("Email error:", error);
    return res.status(500).send(false);
  }
});

// ✅ REQUIRED for Vercel
module.exports = app;

// ✅ Local development only
if (process.env.NODE_ENV !== "production") {
  app.listen(5000, () => {
    console.log("Server running on port 5000");
  });
}
