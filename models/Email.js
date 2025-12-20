const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
  subject: String,
  body: String,
  recipients: [String],
  status: {
    type: String,
    enum: ["SUCCESS", "FAILED"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Email", emailSchema);
