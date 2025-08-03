const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { PDFDocument: PDFLib } = require('pdf-lib');
const cors = require('cors');

// Import conversion routes
const conversionRoutes = require('./routes/conversion');

const app = express();

app.use(cors());
app.use(express.json());
require('dotenv').config();

const port = process.env.PORT || 4000;
const uploadDir = path.join(__dirname, 'uploads');
const compressedDir = path.join(__dirname, 'compressed');
const mergedDir = path.join(__dirname, 'merged');

// Create directories if they don't exist
[uploadDir, compressedDir, mergedDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Original file filter for images and PDFs only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Please upload an image or PDF file only.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

// Serve static files
app.use('/compressed', express.static('compressed'));
app.use('/merged', express.static('merged'));

// Use conversion routes
app.use('/api', conversionRoutes);

app.get('/', (req, res) => {
  res.send('Server is live');
});

// Original image compression endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const quality = parseInt(req.body.quality) || 80;
    const filePath = req.file.path;
    const compressedPath = `compressed/${req.file.filename}`;

    // Compress the image
    await sharp(filePath)
      .resize(800)
      .jpeg({ quality: quality })
      .toFile(compressedPath);

    // Delete the original uploaded file
    fs.unlinkSync(filePath);

    res.json({
      compressedFileUrl: compressedPath,
      message: 'Image compressed successfully'
    });
  } catch (error) {
    console.error('Image compression error:', error);
    res.status(500).send('Error processing image');
  }
});

// PDF merging endpoint
app.post('/merge-pdfs', upload.array('pdfs', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'Please upload at least 2 PDF files' });
    }

    const nonPdfFiles = req.files.filter(file => file.mimetype !== 'application/pdf');
    if (nonPdfFiles.length > 0) {
      req.files.forEach(file => fs.unlinkSync(file.path));
      return res.status(400).json({ error: 'All files must be PDF format' });
    }

    const mergedPdf = await PDFLib.create();
    
    for (const file of req.files) {
      const pdfBytes = fs.readFileSync(file.path);
      const pdf = await PDFLib.load(pdfBytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      
      pages.forEach(page => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();
    const mergedFileName = `merged-${Date.now()}.pdf`;
    const mergedPath = path.join(mergedDir, mergedFileName);
    
    fs.writeFileSync(mergedPath, pdfBytes);

    req.files.forEach(file => fs.unlinkSync(file.path));

    res.json({
      mergedFileUrl: `merged/${mergedFileName}`,
      message: 'PDFs merged successfully',
      pageCount: mergedPdf.getPageCount()
    });

  } catch (error) {
    console.error('PDF merging error:', error);
    
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({ error: 'Error merging PDFs' });
  }
});

// Endpoint to split PDF
app.post('/split-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file || req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const { startPage, endPage } = req.body;
    const start = parseInt(startPage) || 1;
    const end = parseInt(endPage);

    const pdfBytes = fs.readFileSync(req.file.path);
    const pdf = await PDFLib.load(pdfBytes);
    const totalPages = pdf.getPageCount();

    if (start < 1 || start > totalPages) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: `Start page must be between 1 and ${totalPages}` });
    }

    const actualEnd = end && end <= totalPages ? end : totalPages;
    const newPdf = await PDFLib.create();
    
    const pageIndices = Array.from(
      { length: actualEnd - start + 1 }, 
      (_, i) => start - 1 + i
    );
    
    const pages = await newPdf.copyPages(pdf, pageIndices);
    pages.forEach(page => newPdf.addPage(page));

    const splitBytes = await newPdf.save();
    const splitFileName = `split-${Date.now()}.pdf`;
    const splitPath = path.join(mergedDir, splitFileName);
    
    fs.writeFileSync(splitPath, splitBytes);

    fs.unlinkSync(req.file.path);

    res.json({
      splitFileUrl: `merged/${splitFileName}`,
      message: `PDF split successfully (pages ${start}-${actualEnd})`,
      pageCount: newPdf.getPageCount()
    });

  } catch (error) {
    console.error('PDF splitting error:', error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Error splitting PDF' });
  }
});

// Get file info endpoint
app.post('/file-info', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let info = {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    };

    if (req.file.mimetype.startsWith('image/')) {
      const metadata = await sharp(req.file.path).metadata();
      info = {
        ...info,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format
      };
    } else if (req.file.mimetype === 'application/pdf') {
      const pdfBytes = fs.readFileSync(req.file.path);
      const pdf = await PDFLib.load(pdfBytes);
      info = {
        ...info,
        pageCount: pdf.getPageCount()
      };
    }

    fs.unlinkSync(req.file.path);

    res.json(info);

  } catch (error) {
    console.error('File info error:', error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Error getting file information' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on PORT ${port}`);
  console.log('Available endpoints:');
  console.log('- POST /upload (image compression)');
  console.log('- POST /merge-pdfs (PDF merging)');
  console.log('- POST /split-pdf (PDF splitting)');
  console.log('- POST /file-info (file information)');
  console.log('- POST /api/convert-to-pdf (file to PDF conversion)');
  console.log('- GET /api/supported-types (list supported file types)');
});