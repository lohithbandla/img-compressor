const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Import conversion services
const conversionService = require('../services/conversionService');

const uploadDir = path.join(__dirname, '../uploads');
const convertedDir = path.join(__dirname, '../converted');

// Create converted directory if it doesn't exist
if (!fs.existsSync(convertedDir)) {
  fs.mkdirSync(convertedDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter for conversion - accepts multiple file types
const conversionFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/', 
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/msword', // DOC
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
    'application/vnd.ms-powerpoint', // PPT
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
    'application/vnd.ms-excel', // XLS
    'text/plain', // TXT
    'text/rtf', // RTF
    'application/rtf' // RTF alternative mime
  ];

  const isAllowed = allowedMimes.some(mime => file.mimetype.startsWith(mime));
  
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported for conversion.'), false);
  }
};

const conversionUpload = multer({
  storage: storage,
  fileFilter: conversionFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Serve converted files
router.use('/converted', express.static(convertedDir));

// File to PDF conversion endpoint
router.post('/convert-to-pdf', conversionUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = req.file.path;
    const outputFileName = `converted-${Date.now()}.pdf`;
    const outputPath = path.join(convertedDir, outputFileName);
    const mimetype = req.file.mimetype;

    console.log(`Converting ${req.file.originalname} (${mimetype}) to PDF`);

    try {
      // Use conversion service to handle the conversion
      await conversionService.convertToPdf(inputPath, outputPath, mimetype);

      // Clean up original file
      fs.unlinkSync(inputPath);

      // Get file size of converted PDF
      const stats = fs.statSync(outputPath);

      res.json({
        convertedFileUrl: `api/converted/${outputFileName}`,
        message: 'File converted to PDF successfully',
        originalName: req.file.originalname,
        originalType: mimetype,
        convertedSize: stats.size
      });

    } catch (conversionError) {
      console.error('Conversion error:', conversionError);
      
      // Clean up files
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      
      res.status(500).json({ 
        error: 'Conversion failed', 
        details: conversionError.message 
      });
    }

  } catch (error) {
    console.error('File conversion error:', error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Error processing file conversion' });
  }
});

// Get supported file types endpoint
router.get('/supported-types', (req, res) => {
  res.json({
    supportedTypes: {
      documents: ['.docx', '.doc', '.txt', '.rtf'],
      presentations: ['.pptx', '.ppt'],
      spreadsheets: ['.xlsx', '.xls'],
      images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'],
      pdfs: ['.pdf']
    },
    maxFileSize: '50MB',
    note: 'All supported files can be converted to PDF format'
  });
});

module.exports = router;