// Import required modules
import dotenv from "dotenv";
import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

import StoreProfile from "../Models/storeInfoModel.js";

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
const logosDir = path.join(uploadsDir, 'logos');
const signaturesDir = path.join(uploadsDir, 'signatures');

// Ensure directories exist
[uploadsDir, logosDir, signaturesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer configuration for local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine destination based on fieldname
    const dest = file.fieldname === 'logo' ? logosDir : signaturesDir;
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueName = `${uuid()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Export the upload middleware
export { upload };

// Upload Logo API
export const uploadLogo = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "File is required." });
    }

    // Generate URL for the uploaded logo
    // Use SHOPIFY_APP_URL if set, otherwise construct from HOST
    const baseURL = process.env.SHOPIFY_APP_URL || `https://${process.env.HOST}`;
    const logoURL = `${baseURL}/uploads/logos/${file.filename}`;
    
    console.log(`Logo uploaded successfully: ${file.filename}`);
    console.log(`Logo URL: ${logoURL}`);

    // Respond with the uploaded logo URL
    res.status(200).json({
      success: true,
      message: "Logo uploaded successfully.",
      logoURL: logoURL,
    });
  } catch (err) {
    console.error("Error during upload process:", err);
    res.status(500).json({ success: false, message: "Error uploading logo." });
  }
};

// Remove Logo API
export async function removeLogo(req, res) {
    try {
      const { shopId } = req.body; // Ensure shopId is sent in the request body
  
      // Validate required fields
      if (!shopId) {
        return res.status(400).json({ success: false, message: "Shop ID is required." });
      }
  
      // Fetch the store profile by shopId
      const storeProfile = await StoreProfile.findOne({ shopId });
      if (!storeProfile || !storeProfile.images?.logoURL) {
        return res
          .status(404)
          .json({ success: false, message: "Store profile or logo not found." });
      }
  
      // Extract the filename from URL
      const logoURL = storeProfile.images.logoURL;
      const filename = logoURL.split('/').pop();
      const filePath = path.join(logosDir, filename);
      
      console.log(`Deleting logo file: ${filePath}`);
  
      // Delete the logo file from local storage
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
  
      // Remove the logo URL from the database
      storeProfile.images.logoURL = ""; // Or set it to an empty string
      await storeProfile.save();
  
      // Respond with success message
      res.status(200).json({ success: true, message: "Logo removed successfully." });
    } catch (err) {
      console.error("Error during logo deletion process:", err);
      res.status(500).json({ success: false, message: "Error removing logo." });
    }
  }



// Upload Signature API
export const uploadSignature = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "File is required." });
    }

    // Generate URL for the uploaded signature
    // Use SHOPIFY_APP_URL if set, otherwise construct from HOST
    const baseURL = process.env.SHOPIFY_APP_URL || `https://${process.env.HOST}`;
    const signatureURL = `${baseURL}/uploads/signatures/${file.filename}`;
    
    console.log(`Signature uploaded successfully: ${file.filename}`);
    console.log(`Signature URL: ${signatureURL}`);

    // Respond with the uploaded signature URL
    res.status(200).json({
      success: true,
      message: "Signature uploaded successfully.",
      signatureURL: signatureURL,
    });
  } catch (err) {
    console.error("Error during signature upload process:", err);
    res.status(500).json({ success: false, message: "Error uploading signature." });
  }
};




// Remove Signature API
export const removeSignature = async (req, res) => {
  try {
    const { shopId } = req.body; // Ensure shopId is sent in the request body

    // Validate required fields
    if (!shopId) {
      return res.status(400).json({ success: false, message: "Shop ID is required." });
    }

    // Fetch the store profile by shopId
    const storeProfile = await StoreProfile.findOne({ shopId });
    if (!storeProfile || !storeProfile.images?.signatureURL) {
      return res
        .status(404)
        .json({ success: false, message: "Store profile or signature not found." });
    }

    // Extract the filename from URL
    const signatureURL = storeProfile.images.signatureURL;
    const filename = signatureURL.split('/').pop();
    const filePath = path.join(signaturesDir, filename);
    
    console.log(`Deleting signature file: ${filePath}`);

    // Delete the signature file from local storage
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove the signature URL from the database
    storeProfile.images.signatureURL = ""; // Or set it to an empty string
    await storeProfile.save();

    // Respond with success message
    res.status(200).json({ success: true, message: "Signature removed successfully." });
  } catch (err) {
    console.error("Error during signature deletion process:", err);
    res.status(500).json({ success: false, message: "Error removing signature." });
  }
};