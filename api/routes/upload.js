import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure Cloudinary from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dt172nx3g',
  api_key: process.env.CLOUDINARY_API_KEY || '449885275677713',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'lbmlel900z1gSA6D0USQs6BdGL8',
});

// Use memory storage so we can stream buffer to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});

const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max for video
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// POST /api/upload — upload a single image to Cloudinary
// Returns { url, public_id, width, height }
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    // Stream the buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'swastika_sarees',
          // Preserve original quality — no lossy compression, no resize
          quality: 'auto:best',
          fetch_format: 'auto',
          // No transformation — keep original dimensions
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// POST /api/upload/multiple — upload multiple images at once
router.post('/multiple', requireAuth, upload.array('images', 20), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No image files provided' });
  }

  try {
    const uploads = await Promise.all(
      req.files.map(file =>
        new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'swastika_sarees',
              quality: 'auto:best',
              fetch_format: 'auto',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve({
                url: result.secure_url,
                public_id: result.public_id,
                width: result.width,
                height: result.height,
              });
            }
          );
          uploadStream.end(file.buffer);
        })
      )
    );

    res.json({ images: uploads });
  } catch (error) {
    console.error('Cloudinary multi-upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// POST /api/upload/video — upload a single video to Cloudinary
router.post('/video', requireAuth, videoUpload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided' });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'swastika_sarees/videos',
          resource_type: 'video',
          chunk_size: 6000000,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
      duration: result.duration,
      format: result.format,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('Cloudinary video upload error:', error);
    res.status(500).json({ error: error.message || 'Video upload failed' });
  }
});

export default router;
