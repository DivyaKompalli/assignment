// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const XLSX = require("xlsx");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define a schema for the imported data
const dataSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  verified: { type: String, required: true },
});

const Data = mongoose.model("Data", dataSchema);

// Import endpoint
app.post("/api/import", async (req, res) => {
  const rows = req.body;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const { Name, Amount, Date, Verified } = row;

    // Validation
    if (!Name || !Amount || !Date) {
      errors.push({
        sheet: "Sheet1",
        row: i + 1,
        message: "Name, Amount, and Date are required.",
      });
      continue;
    }

    if (isNaN(Amount) || Amount <= 0) {
      errors.push({
        sheet: "Sheet1",
        row: i + 1,
        message: "Amount must be a positive number.",
      });
      continue;
    }

    const date = new Date(Date);
    if (isNaN(date.getTime()) || date.getMonth() !== new Date().getMonth()) {
      errors.push({
        sheet: "Sheet1",
        row: i + 1,
        message: "Date must be valid and within the current month.",
      });
      continue;
    }

    // Save valid row to the database
    const newData = new Data({
      name: Name,
      amount: Amount,
      date,
      verified: Verified,
    });
    await newData.save();
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  res.status(200).json({ message: "Data imported successfully!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
