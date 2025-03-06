const express = require("express");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const axios = require("axios");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Google Cloud Storage Setup
const storage = new Storage({ keyFilename: "gcloud-key.json" });
const bucket = storage.bucket("your-bucket-name");

// Multer for file uploads
const upload = multer({ dest: "uploads/" });

// Upload CV
app.post("/upload", upload.single("cv"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const destFilename = `cv-uploads/${req.file.originalname}`;
    await bucket.upload(filePath, { destination: destFilename });
    fs.unlinkSync(filePath); // Delete local file after upload

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destFilename}`;
    res.json({ success: true, cvUrl: publicUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
