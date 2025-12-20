const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

/* ---------- middleware ---------- */
app.use(cors());
app.use(express.json());

/* ---------- health check ---------- */
app.get("/", (req, res) => {
  res.status(200).send("BulkMail Backend is running");
});

/* ---------- mongodb ---------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => {
    console.error("Mongo error:", err);
    process.exit(1);
  });

/* ---------- routes ---------- */
app.post("/api/sendemail", async (req, res) => {
  res.json({ ok: true });
});

/* ---------- START SERVER ---------- */
const PORT = Number(process.env.PORT); // Railway injects this

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
