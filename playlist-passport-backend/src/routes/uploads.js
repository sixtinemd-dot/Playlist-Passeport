const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/auth");

const router = express.Router();

// Define and ensure the uploads directory exists
const uploadDir = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

// Configure Multer storage for saving uploaded photos on disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique and safe filename
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${timestamp}-${safeName}`);
  },
});

// Initialize Multer with file size limits
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Upload a single photo and return its public URL
router.post("/", auth, upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No photo uploaded" });
  }

  // Build a public URL to access the uploaded image
  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(201).json({ url });
});

module.exports = router;
