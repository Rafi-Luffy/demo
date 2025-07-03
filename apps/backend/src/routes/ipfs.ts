import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import { AppError } from '../types/index.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow documents, images, and text files
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/json'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file type. Only PDF, DOC, DOCX, images, and text files are allowed.', 400));
    }
  }
});

// Mock IPFS service (replace with actual Helia/IPFS implementation)
class IPFSService {
  static async uploadFile(buffer: Buffer, filename: string, mimetype: string) {
    // Simulate IPFS upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock IPFS hash
    const hash = `Qm${Math.random().toString(36).slice(2, 44)}`;
    
    return {
      hash,
      url: `https://ipfs.io/ipfs/${hash}`,
      size: buffer.length,
      filename,
      mimetype
    };
  }

  static async uploadJSON(data: any) {
    const jsonString = JSON.stringify(data, null, 2);
    const buffer = Buffer.from(jsonString, 'utf8');
    
    return this.uploadFile(buffer, 'data.json', 'application/json');
  }

  static async getFile(hash: string) {
    // In production, this would fetch from IPFS
    return {
      hash,
      url: `https://ipfs.io/ipfs/${hash}`,
      available: true
    };
  }

  static validateHash(hash: string): boolean {
    // Basic IPFS hash validation
    return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash);
  }
}

// @desc    Upload file to IPFS
// @route   POST /api/ipfs/upload
// @access  Private
router.post('/upload', protect, upload.single('file'), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file provided', 400));
    }

    const { buffer, originalname, mimetype } = req.file;
    const { description, category } = req.body;

    // Upload to IPFS
    const result = await IPFSService.uploadFile(buffer, originalname, mimetype);

    // In production, save document record to database
    const documentRecord = {
      name: originalname,
      description: description || '',
      category: category || 'other',
      ipfsHash: result.hash,
      url: result.url,
      size: result.size,
      mimetype: result.mimetype,
      uploadedBy: req.user?.id,
      uploadedAt: new Date(),
      isVerified: false
    };

    res.status(201).json({
      success: true,
      data: {
        ...documentRecord,
        hash: result.hash,
        url: result.url
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload JSON data to IPFS
// @route   POST /api/ipfs/upload-json
// @access  Private
router.post('/upload-json', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, metadata } = req.body;

    if (!data) {
      return next(new AppError('No data provided', 400));
    }

    // Prepare data with metadata
    const ipfsData = {
      data,
      metadata: {
        ...metadata,
        uploadedBy: req.user?.id,
        uploadedAt: new Date().toISOString(),
        version: '1.0'
      }
    };

    // Upload to IPFS
    const result = await IPFSService.uploadJSON(ipfsData);

    res.status(201).json({
      success: true,
      data: {
        hash: result.hash,
        url: result.url,
        size: result.size
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get file from IPFS
// @route   GET /api/ipfs/:hash
// @access  Public
router.get('/:hash', async (req, res, next) => {
  try {
    const { hash } = req.params;

    if (!IPFSService.validateHash(hash)) {
      return next(new AppError('Invalid IPFS hash format', 400));
    }

    const file = await IPFSService.getFile(hash);

    if (!file.available) {
      return next(new AppError('File not available on IPFS', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        hash,
        url: file.url,
        available: true
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Pin file to IPFS
// @route   POST /api/ipfs/:hash/pin
// @access  Private (Admin only)
router.post('/:hash/pin', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { hash } = req.params;

    if (!IPFSService.validateHash(hash)) {
      return next(new AppError('Invalid IPFS hash format', 400));
    }

    // In production, this would pin the file to ensure availability
    res.status(200).json({
      success: true,
      data: {
        hash,
        pinned: true,
        message: 'File pinned successfully'
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get file metadata
// @route   GET /api/ipfs/:hash/metadata
// @access  Public
router.get('/:hash/metadata', async (req, res, next) => {
  try {
    const { hash } = req.params;

    if (!IPFSService.validateHash(hash)) {
      return next(new AppError('Invalid IPFS hash format', 400));
    }

    // Mock metadata (in production, fetch from IPFS and/or database)
    const metadata = {
      hash,
      size: Math.floor(Math.random() * 1000000), // Mock size
      type: 'file',
      links: [],
      created: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: metadata
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload multiple files
// @route   POST /api/ipfs/upload-multiple
// @access  Private
router.post('/upload-multiple', protect, upload.array('files', 10), async (req: AuthenticatedRequest, res, next) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return next(new AppError('No files provided', 400));
    }

    const uploadPromises = files.map(async (file) => {
      const result = await IPFSService.uploadFile(file.buffer, file.originalname, file.mimetype);
      return {
        originalName: file.originalname,
        hash: result.hash,
        url: result.url,
        size: result.size,
        mimetype: file.mimetype
      };
    });

    const results = await Promise.all(uploadPromises);

    res.status(201).json({
      success: true,
      data: {
        files: results,
        totalFiles: results.length,
        totalSize: results.reduce((sum, file) => sum + file.size, 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Search pinned files
// @route   GET /api/ipfs/search
// @access  Private
router.get('/search', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { query, category, uploadedBy, limit = 20 } = req.query as any;

    // Mock search results (in production, query database of uploaded files)
    const mockResults = [
      {
        hash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        name: 'campaign-proposal.pdf',
        category: 'proposal',
        uploadedBy: req.user?.id,
        uploadedAt: new Date(),
        size: 245760
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        results: mockResults,
        total: mockResults.length,
        query: query || '',
        limit: Number(limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
