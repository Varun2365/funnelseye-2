// routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto'); // Node.js built-in crypto module
const sharp = require('sharp'); // Image compression library
const File = require('../schema/File'); // Your File model
const { protect } = require('../middleware/auth'); // Your authentication middleware

const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '../public/uploads'); // Path to store files

// Ensure the upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${UPLOADS_DIR}`); // Files will be stored in public/uploads/
  },
  filename: function (req, file, cb) {
    // Create a unique filename to prevent conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  }
});

// Configure Multer instance for general files
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 100 }, // Max 100MB file size (adjust as needed)
  fileFilter: (req, file, cb) => {
    // Basic file type validation
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'video/mp4', 'video/webm', 'video/ogg', // common video formats
      'audio/mpeg', 'audio/wav', 'audio/ogg' // common audio formats
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type.'), false);
    }
  }
});

// Configure Multer instance for images (profile pictures)
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${UPLOADS_DIR}/images`); // Files will be stored in public/uploads/images/
  },
  filename: function (req, file, cb) {
    // Create a unique filename to prevent conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + '.webp');
  }
});

// Ensure the images directory exists
const IMAGES_DIR = path.join(__dirname, '../public/uploads/images');
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Max 5MB for images
  fileFilter: (req, file, cb) => {
    // Image file type validation
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
    }
  }
});

// Express Route for File Upload
// Apply the 'protect' middleware to secure this endpoint
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    console.log(req.coachId)
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { originalname, mimetype, size, filename, path: filePath } = req.file;

    // --- Generate file hash ---
    // Read the temporarily saved file to generate its hash
    const fileBuffer = fs.readFileSync(filePath);
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // --- Check if file already exists in DB ---
    const existingFile = await File.findOne({ fileHash: fileHash });

    if (existingFile) {
      // File with this content already exists
      // Delete the newly uploaded duplicate file from disk
      fs.unlinkSync(filePath);
      return res.status(200).json({
        message: 'File already uploaded.',
        file: {
          id: existingFile._id,
          originalName: existingFile.originalName,
          fileUrl: existingFile.fileUrl,
          mimeType: existingFile.mimeType,
          size: existingFile.size
        }
      });
    }

    // --- If not existing, proceed to save new file metadata ---
    // Construct the public URL for the file
    // Assumes your server is accessible at `http://yourdomain.com` and serves static files from `public/uploads`
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

    // Save file metadata to MongoDB
    const newFile = new File({
      originalName: originalname,
      storedFileName: filename,
      fileUrl: fileUrl,
      mimeType: mimetype,
      size: size,
      fileHash: fileHash, // Save the hash
      uploadedBy: req.user.id // User ID from your protect middleware
    });

    await newFile.save();

    res.status(200).json({
      message: 'File uploaded successfully!',
      file: {
        id: newFile._id,
        originalName: newFile.originalName,
        fileUrl: newFile.fileUrl,
        mimeType: newFile.mimeType,
        size: newFile.size
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    // If an error occurred after the file was saved to disk but before DB, clean up
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    // Handle Multer errors specifically (e.g., file size limits)
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ message: error.message });
    }
    // Handle other errors
    res.status(500).json({ message: 'Server error during file upload.', error: error.message });
  }
});

// Express Route for Profile Picture Upload with Compression
router.post('/profile-picture', protect, uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded.' });
    }

    const { path: filePath } = req.file;
    const IMAGES_DIR = path.join(__dirname, '../public/uploads/images');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'profile-' + uniqueSuffix + '.webp';
    const compressedFilePath = path.join(IMAGES_DIR, filename);

    // Compress and optimize the image using sharp
    try {
      await sharp(filePath)
        .resize(400, 400, {
          fit: 'cover',
          withoutEnlargement: true
        })
        .webp({ quality: 85, effort: 6 })
        .toFile(compressedFilePath);

      // Delete the original file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (compressError) {
      console.error('Image compression error:', compressError);
      // If compression fails, use the original file
      if (fs.existsSync(filePath) && !fs.existsSync(compressedFilePath)) {
        fs.renameSync(filePath, compressedFilePath);
      }
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/images/${filename}`;

    // Update user's profile picture
    const User = require('../schema/User');
    const userId = req.userId || req.user?.id;
    
    if (!userId) {
      // Clean up uploaded file if user not authenticated
      if (fs.existsSync(compressedFilePath)) {
        fs.unlinkSync(compressedFilePath);
      }
      return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    // Check if user exists first
    const user = await User.findById(userId);
    if (!user) {
      // Clean up uploaded file if user not found
      if (fs.existsSync(compressedFilePath)) {
        fs.unlinkSync(compressedFilePath);
      }
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Delete old profile picture if exists
    if (user.profilePicture) {
      try {
        const oldFileUrl = user.profilePicture;
        const oldFileName = oldFileUrl.split('/').pop();
        const oldFilePath = path.join(IMAGES_DIR, oldFileName);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } catch (deleteError) {
        console.error('Error deleting old profile picture:', deleteError);
      }
    }

    // Use findOneAndUpdate to only update profilePicture field
    // This ensures we only update the profilePicture without affecting other fields
    // and avoids validation issues with required fields like selfCoachId
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { profilePicture: fileUrl } },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      // Clean up uploaded file if update failed
      if (fs.existsSync(compressedFilePath)) {
        fs.unlinkSync(compressedFilePath);
      }
      return res.status(404).json({ success: false, message: 'User not found or update failed.' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded and compressed successfully!',
      fileUrl: fileUrl
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    // If an error occurred after the file was saved to disk, clean up
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    // Handle Multer errors specifically
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    // Handle other errors
    res.status(500).json({ success: false, message: 'Server error during profile picture upload.', error: error.message });
  }
});

// Express Route for Banner Image Upload with Compression
router.post('/banner-image', protect, uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded.' });
    }

    const { path: filePath } = req.file;
    const IMAGES_DIR = path.join(__dirname, '../public/uploads/images');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'banner-' + uniqueSuffix + '.webp';
    const compressedFilePath = path.join(IMAGES_DIR, filename);

    // Compress and optimize the image using sharp
    try {
      await sharp(filePath)
        .resize(1920, 600, {
          fit: 'cover',
          withoutEnlargement: true
        })
        .webp({ quality: 80, effort: 6 })
        .toFile(compressedFilePath);

      // Delete the original file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (compressError) {
      console.error('Image compression error:', compressError);
      // If compression fails, use the original file
      if (fs.existsSync(filePath) && !fs.existsSync(compressedFilePath)) {
        fs.renameSync(filePath, compressedFilePath);
      }
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/images/${filename}`;

    // Update user's banner image
    const User = require('../schema/User');
    const userId = req.userId || req.user?.id;
    
    if (!userId) {
      // Clean up uploaded file if user not authenticated
      if (fs.existsSync(compressedFilePath)) {
        fs.unlinkSync(compressedFilePath);
      }
      return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      // Clean up uploaded file if user not found
      if (fs.existsSync(compressedFilePath)) {
        fs.unlinkSync(compressedFilePath);
      }
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Delete old banner image if exists
    if (user.bannerImage) {
      try {
        const oldFileUrl = user.bannerImage;
        const oldFileName = oldFileUrl.split('/').pop();
        const oldFilePath = path.join(IMAGES_DIR, oldFileName);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } catch (deleteError) {
        console.error('Error deleting old banner image:', deleteError);
      }
    }

    // Use findOneAndUpdate to only update bannerImage field
    // This avoids validation issues with required fields like selfCoachId
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { bannerImage: fileUrl } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      // Clean up uploaded file if update failed
      if (fs.existsSync(compressedFilePath)) {
        fs.unlinkSync(compressedFilePath);
      }
      return res.status(404).json({ success: false, message: 'User not found or update failed.' });
    }

    res.status(200).json({
      success: true,
      message: 'Banner image uploaded and compressed successfully!',
      fileUrl: fileUrl
    });

  } catch (error) {
    console.error('Banner image upload error:', error);
    // If an error occurred after the file was saved to disk, clean up
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    // Handle Multer errors specifically
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    // Handle other errors
    res.status(500).json({ success: false, message: 'Server error during banner image upload.', error: error.message });
  }
});

// Configure Multer instance for achievement images
const achievementImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const ACHIEVEMENTS_DIR = path.join(__dirname, '../public/uploads/achievements');
    if (!fs.existsSync(ACHIEVEMENTS_DIR)) {
      fs.mkdirSync(ACHIEVEMENTS_DIR, { recursive: true });
    }
    cb(null, ACHIEVEMENTS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'achievement-' + uniqueSuffix + '.webp');
  }
});

const uploadAchievementImage = multer({
  storage: achievementImageStorage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Max 5MB for images
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
    }
  }
});

// Express Route for Achievement Image Upload with Compression
router.post('/achievement-image', protect, uploadAchievementImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded.' });
    }

    const { path: filePath, filename } = req.file;
    const ACHIEVEMENTS_DIR = path.join(__dirname, '../public/uploads/achievements');
    const compressedFilePath = path.join(ACHIEVEMENTS_DIR, filename);

    // Compress and optimize the image using sharp
    try {
      await sharp(filePath)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 80, effort: 6 })
        .toFile(compressedFilePath);

      // Delete the original file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (compressError) {
      console.error('Image compression error:', compressError);
      // If compression fails, use the original file
      if (fs.existsSync(filePath) && !fs.existsSync(compressedFilePath)) {
        fs.renameSync(filePath, compressedFilePath);
      }
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/achievements/${filename}`;

    res.status(200).json({
      success: true,
      message: 'Achievement image uploaded and compressed successfully!',
      fileUrl: fileUrl
    });

  } catch (error) {
    console.error('Achievement image upload error:', error);
    // Clean up uploaded file if error occurred
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error during achievement image upload.', error: error.message });
  }
});

module.exports = router;