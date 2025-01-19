import React, { useState } from 'react';
import { Loader2, Upload, Download } from 'lucide-react';
import axios from 'axios';
// import 'dotenv/config'



function ImageCompressor() {
  const URLBackend = import.meta.env.VITE_BACKEND || "https://img-compressor.onrender.com"
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(80);
  const [preview, setPreview] = useState(null);
  const [compressedUrl, setCompressedUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError(null);

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setCompressedUrl(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', quality);

    try {
      const response = await axios.post(`${URLBackend}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setCompressedUrl(`${URLBackend}/${response.data.compressedFileUrl}`);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data || 'Error uploading file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!compressedUrl) return;

    try {
      const response = await axios.get(compressedUrl, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `compressed-${file.name}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download the image');
    }
  };

  return (
    <div className="image-compressor">
      <h1 className="title">Image Compressor</h1>
      
      {error && <div className="error">{error}</div>}

      <div className="file-input-container">
        <input 
          type="file" 
          id="file-input"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />
        <label htmlFor="file-input" className="file-input-label">
          <Upload />
          <span>Choose an image</span>
        </label>
      </div>

      {preview && (
        <div className="preview-container">
          <img src={preview || "/placeholder.svg"} alt="Preview" className="preview-image" />
          
          <div className="quality-control">
            <label htmlFor="quality-slider">Quality: {quality}%</label>
            <input 
              id="quality-slider"
              type="range" 
              min="1" 
              max="100" 
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="quality-slider"
            />
          </div>

          <button 
            onClick={handleUpload}
            disabled={isLoading}
            className="compress-button"
          >
            {isLoading ? (
              <>
                <Loader2 className="spinner" />
                Compressing...
              </>
            ) : (
              <>
                
                Compress Image
              </>
            )}
          </button>
        </div>
      )}

      {compressedUrl && (
        <div className="result-container">
          <img src={compressedUrl || "/placeholder.svg"} alt="Compressed" className="compressed-image" />
          <button onClick={handleDownload} className="download-button">
            <Download />
            Download Compressed Image
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageCompressor;

