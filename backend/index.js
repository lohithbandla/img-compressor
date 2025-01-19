const express = require('express')
const multer  = require('multer')
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const app = express();
const cors = require('cors');
app.use(cors());


require('dotenv').config()

const port = process.env.PORT || 4000;

const uploadDir = path.join(__dirname, 'uploads');

// Check if it exists, create if not
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  })
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
  };
  
const upload = multer({ 
  storage: storage,
  fileFilter : fileFilter
 })

app.use('/compressed', express.static('compressed'));
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
      const quality = parseInt(req.body.quality);
      const filePath = req.file.path;
      const compressedPath = `compressed/${req.file.filename}`;
  
      // Ensure the compressed directory exists
      if (!fs.existsSync('compressed')) {
        fs.mkdirSync('compressed');
      }
  
      // Compress the image
      await sharp(filePath)
        .resize(800) // Resize width to 800px, keeping aspect ratio
        .jpeg({ quality: quality }) // Compress to 80% quality
        .toFile(compressedPath);
  
      // Optionally delete the original uploaded file
      fs.unlinkSync(filePath);
  
      res.json({
        compressedFileUrl: compressedPath,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error processing image');
    }
  });

app.listen(port,()=>{
    console.log(`Server listening on PORT${port}`);
})