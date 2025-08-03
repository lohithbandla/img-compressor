const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const PDFDocument = require('pdfkit');
const mammoth = require('mammoth');
const libre = require('libreoffice-convert');
const util = require('util');

// Convert libre.convert to promise-based function
const libreConvert = util.promisify(libre.convert);

class ConversionService {
  
  /**
   * Main conversion method - routes to appropriate converter based on mimetype
   */
  async convertToPdf(inputPath, outputPath, mimetype) {
    try {
      switch (true) {
        case mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          await this.convertDocxToPdf(inputPath, outputPath);
          break;
          
        case mimetype === 'text/plain':
          await this.convertTextToPdf(inputPath, outputPath);
          break;
          
        case mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
             mimetype === 'application/vnd.ms-powerpoint' ||
             mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
             mimetype === 'application/vnd.ms-excel' ||
             mimetype === 'application/msword' ||
             mimetype === 'text/rtf' ||
             mimetype === 'application/rtf':
          await this.convertWithLibreOffice(inputPath, outputPath);
          break;
          
        case mimetype.startsWith('image/'):
          await this.convertImageToPdf(inputPath, outputPath);
          break;
          
        case mimetype === 'application/pdf':
          fs.copyFileSync(inputPath, outputPath);
          break;
          
        default:
          throw new Error(`Unsupported file type: ${mimetype}`);
      }
    } catch (error) {
      throw new Error(`Conversion failed: ${error.message}`);
    }
  }

  /**
   * Convert DOCX to PDF using mammoth
   */
  async convertDocxToPdf(inputPath, outputPath) {
    try {
      const result = await mammoth.convertToHtml({ path: inputPath });
      const html = result.value;
      
      // Create PDF from HTML using PDFKit
      const doc = new PDFDocument({
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });
      
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      
      // Simple HTML to text conversion with basic formatting
      const text = this.htmlToText(html);
      
      // Split text into paragraphs and add to PDF
      const paragraphs = text.split('\n\n');
      let y = doc.y;
      
      paragraphs.forEach((paragraph, index) => {
        if (paragraph.trim()) {
          // Check if we need a new page
          if (y > doc.page.height - 100) {
            doc.addPage();
            y = 50;
          }
          
          doc.text(paragraph.trim(), 50, y, {
            width: doc.page.width - 100,
            align: 'left'
          });
          
          y = doc.y + 10; // Add some spacing between paragraphs
        }
      });
      
      doc.end();
      
      return new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });
    } catch (error) {
      throw new Error(`DOCX conversion failed: ${error.message}`);
    }
  }

  /**
   * Convert text files to PDF
   */
  async convertTextToPdf(inputPath, outputPath) {
    try {
      const content = fs.readFileSync(inputPath, 'utf8');
      
      const doc = new PDFDocument({
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });
      
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      
      // Split content into lines and handle page breaks
      const lines = content.split('\n');
      let y = doc.y;
      
      lines.forEach((line) => {
        // Check if we need a new page
        if (y > doc.page.height - 100) {
          doc.addPage();
          y = 50;
        }
        
        doc.text(line, 50, y, {
          width: doc.page.width - 100
        });
        
        y += 15; // Line spacing
      });
      
      doc.end();
      
      return new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Text conversion failed: ${error.message}`);
    }
  }

  /**
   * Convert office documents using LibreOffice
   */
  async convertWithLibreOffice(inputPath, outputPath) {
    try {
      const inputBuffer = fs.readFileSync(inputPath);
      const pdfBuffer = await libreConvert(inputBuffer, '.pdf', undefined);
      fs.writeFileSync(outputPath, pdfBuffer);
    } catch (error) {
      throw new Error(`LibreOffice conversion failed: ${error.message}. Make sure LibreOffice is installed.`);
    }
  }

  /**
   * Convert images to PDF
   */
  async convertImageToPdf(inputPath, outputPath) {
    try {
      const doc = new PDFDocument({
        autoFirstPage: false
      });
      
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      
      // Get image dimensions
      const metadata = await sharp(inputPath).metadata();
      const imgBuffer = await sharp(inputPath).png().toBuffer();
      
      // Calculate page size based on image dimensions
      const maxWidth = 595; // A4 width in points
      const maxHeight = 842; // A4 height in points
      const margin = 50;
      
      let width = metadata.width;
      let height = metadata.height;
      
      // Scale image to fit page if necessary
      if (width > maxWidth - 2 * margin) {
        const ratio = (maxWidth - 2 * margin) / width;
        width = maxWidth - 2 * margin;
        height = height * ratio;
      }
      
      if (height > maxHeight - 2 * margin) {
        const ratio = (maxHeight - 2 * margin) / height;
        height = maxHeight - 2 * margin;
        width = width * ratio;
      }
      
      // Add page with appropriate size
      doc.addPage({
        size: [Math.max(width + 2 * margin, maxWidth), Math.max(height + 2 * margin, maxHeight)]
      });
      
      // Center the image on the page
      const x = (doc.page.width - width) / 2;
      const y = (doc.page.height - height) / 2;
      
      doc.image(imgBuffer, x, y, { 
        width: width,
        height: height
      });
      
      doc.end();
      
      return new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Image conversion failed: ${error.message}`);
    }
  }

  /**
   * Helper method to convert HTML to text with basic formatting
   */
  htmlToText(html) {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
      .trim();
  }

  /**
   * Get file information
   */
  async getFileInfo(filePath, mimetype) {
    const stats = fs.statSync(filePath);
    
    let info = {
      size: stats.size,
      mimetype: mimetype
    };

    if (mimetype.startsWith('image/')) {
      const metadata = await sharp(filePath).metadata();
      info = {
        ...info,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format
      };
    }

    return info;
  }
}

module.exports = new ConversionService();